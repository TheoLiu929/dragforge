import { Sensor, SensorEvent, SensorEventHandler, SensorManagerOptions } from './types';

export class SensorManager {
  private sensors = new Map<string, Sensor>();
  private activeSensors = new Set<Sensor>();
  private element: HTMLElement | null = null;
  private eventHandler: SensorEventHandler | null = null;
  private options: SensorManagerOptions;

  constructor(options: SensorManagerOptions = {}) {
    this.options = {
      autoActivate: true,
      exclusiveMode: true,
      ...options
    };
  }

  // 注册传感器
  register(sensor: Sensor): () => void {
    if (this.sensors.has(sensor.name)) {
      console.warn(`Sensor ${sensor.name} is already registered`);
      return () => {}; // 返回空的清理函数
    }

    this.sensors.set(sensor.name, sensor);

    // 如果已经有元素和处理器，立即附加
    if (this.element && this.eventHandler) {
      this.attachSensor(sensor);
    }

    // 返回注销函数
    return () => this.unregister(sensor.name);
  }

  // 注销传感器
  unregister(sensorName: string): boolean {
    const sensor = this.sensors.get(sensorName);
    if (!sensor) return false;

    // 如果传感器正在活跃，先停用
    if (this.activeSensors.has(sensor)) {
      this.deactivateSensor(sensor);
    }

    // 分离传感器
    sensor.detach();
    sensor.destroy();

    // 从注册表中移除
    this.sensors.delete(sensorName);

    return true;
  }

  // 设置目标元素和事件处理器
  attach(element: HTMLElement, handler: SensorEventHandler): void {
    // 如果已经附加到其他元素，先分离
    if (this.element) {
      this.detach();
    }

    this.element = element;
    this.eventHandler = handler;

    // 附加所有已注册的传感器
    this.sensors.forEach(sensor => {
      this.attachSensor(sensor);
    });

    // 如果启用自动激活，激活最高优先级的传感器
    if (this.options.autoActivate) {
      this.activateHighestPrioritySensor();
    }
  }

  // 分离所有传感器
  detach(): void {
    // 停用所有活跃的传感器
    this.activeSensors.forEach(sensor => {
      this.deactivateSensor(sensor);
    });

    // 分离所有传感器
    this.sensors.forEach(sensor => {
      sensor.detach();
    });

    this.element = null;
    this.eventHandler = null;
  }

  // 激活指定传感器
  activate(sensorName: string): boolean {
    const sensor = this.sensors.get(sensorName);
    if (!sensor) return false;

    // 如果是独占模式，先停用其他传感器
    if (this.options.exclusiveMode) {
      this.deactivateAll();
    }

    return this.activateSensor(sensor);
  }

  // 停用指定传感器
  deactivate(sensorName: string): boolean {
    const sensor = this.sensors.get(sensorName);
    if (!sensor) return false;

    return this.deactivateSensor(sensor);
  }

  // 停用所有传感器
  deactivateAll(): void {
    Array.from(this.activeSensors).forEach(sensor => {
      this.deactivateSensor(sensor);
    });
  }

  // 获取激活的传感器列表
  getActiveSensors(): Sensor[] {
    return Array.from(this.activeSensors);
  }

  // 获取所有注册的传感器
  getAllSensors(): Sensor[] {
    return Array.from(this.sensors.values());
  }

  // 获取指定传感器
  getSensor(name: string): Sensor | undefined {
    return this.sensors.get(name);
  }

  // 检查传感器是否能处理事件
  canHandleEvent(event: Event): Sensor[] {
    return Array.from(this.sensors.values())
      .filter(sensor => sensor.isEnabled() && sensor.canHandle(event))
      .sort((a, b) => b.priority - a.priority); // 按优先级排序
  }

  // 清理所有资源
  destroy(): void {
    this.detach();
    
    // 销毁所有传感器
    this.sensors.forEach(sensor => {
      sensor.destroy();
    });
    
    this.sensors.clear();
    this.activeSensors.clear();
  }

  // 私有方法：附加单个传感器
  private attachSensor(sensor: Sensor): void {
    if (!this.element || !this.eventHandler) return;

    // 创建包装的事件处理器
    const wrappedHandler = this.createWrappedHandler(sensor);
    sensor.attach(this.element, wrappedHandler);
  }

  // 私有方法：激活传感器
  private activateSensor(sensor: Sensor): boolean {
    if (this.activeSensors.has(sensor)) return true;

    sensor.enable();
    this.activeSensors.add(sensor);
    
    console.log(`Sensor ${sensor.name} activated`);
    return true;
  }

  // 私有方法：停用传感器
  private deactivateSensor(sensor: Sensor): boolean {
    if (!this.activeSensors.has(sensor)) return false;

    sensor.disable();
    this.activeSensors.delete(sensor);
    
    console.log(`Sensor ${sensor.name} deactivated`);
    return true;
  }

  // 私有方法：激活最高优先级的传感器
  private activateHighestPrioritySensor(): void {
    const sortedSensors = Array.from(this.sensors.values())
      .filter(sensor => sensor.isEnabled())
      .sort((a, b) => b.priority - a.priority);

    if (sortedSensors.length > 0) {
      this.activateSensor(sortedSensors[0]);
    }
  }

  // 私有方法：创建包装的事件处理器
  private createWrappedHandler(sensor: Sensor): SensorEventHandler {
    return (event: SensorEvent) => {
      // 在独占模式下，如果有其他传感器活跃，可能需要处理冲突
      if (this.options.exclusiveMode && this.activeSensors.size > 1) {
        this.handleSensorConflict(sensor, event);
        return;
      }

      // 转发事件给主处理器
      if (this.eventHandler) {
        // 添加传感器信息到事件中
        const enhancedEvent = {
          ...event,
          sensor: sensor.name,
          sensorPriority: sensor.priority
        };
        
        this.eventHandler(enhancedEvent);
      }
    };
  }

  // 私有方法：处理传感器冲突
  private handleSensorConflict(currentSensor: Sensor, event: SensorEvent): void {
    // 获取所有活跃传感器，按优先级排序
    const activeSensors = Array.from(this.activeSensors)
      .sort((a, b) => b.priority - a.priority);

    // 如果当前传感器不是最高优先级，停用它
    if (activeSensors[0] !== currentSensor) {
      console.warn(`Sensor conflict: ${currentSensor.name} deactivated due to higher priority sensor`);
      this.deactivateSensor(currentSensor);
      return;
    }

    // 停用所有低优先级的传感器
    activeSensors.slice(1).forEach(sensor => {
      console.warn(`Sensor conflict: ${sensor.name} deactivated due to lower priority`);
      this.deactivateSensor(sensor);
    });

    // 转发事件
    if (this.eventHandler) {
      const enhancedEvent = {
        ...event,
        sensor: currentSensor.name,
        sensorPriority: currentSensor.priority
      };
      
      this.eventHandler(enhancedEvent);
    }
  }
}