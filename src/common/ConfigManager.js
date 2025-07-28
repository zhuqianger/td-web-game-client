/**
 * 通用配置管理器
 * 负责按需加载和管理游戏配置文件
 */
export default class ConfigManager {
  static instance = null;
  
  constructor() {
    this.configs = new Map(); // 存储已加载的配置
    this.loadingPromises = new Map(); // 防止重复加载
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new ConfigManager();
    }
    return this.instance;
  }

  /**
   * 加载单个配置文件
   */
  async loadConfig(filename) {
    try {
      console.log(`正在加载配置文件: ${filename}`);
      // 从public/config目录加载配置文件
      const response = await fetch(`/config/${filename}`);
      console.log(`响应状态: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: 无法加载配置文件 ${filename}`);
      }
      
      const text = await response.text();
      console.log(`配置文件 ${filename} 原始内容长度: ${text.length} 字符`);
      
      const data = JSON.parse(text);
      console.log(`配置文件 ${filename} 解析成功，包含 ${Object.keys(data).length} 个键`);
      return data;
    } catch (error) {
      console.error(`加载配置文件 ${filename} 失败:`, error);
      throw new Error(`配置文件 ${filename} 加载失败: ${error.message}`);
    }
  }

  /**
   * 按需加载配置
   */
  async loadConfigByName(configName) {
    // 如果已经加载过，直接返回
    if (this.configs.has(configName)) {
      return this.configs.get(configName);
    }

    // 如果正在加载中，返回现有的Promise
    if (this.loadingPromises.has(configName)) {
      return this.loadingPromises.get(configName);
    }

    // 开始加载配置
    const promise = this.loadConfig(`${configName}.json`);
    this.loadingPromises.set(configName, promise);
    
    try {
      const config = await promise;
      this.configs.set(configName, config);
      this.loadingPromises.delete(configName);
      return config;
    } catch (error) {
      this.loadingPromises.delete(configName);
      throw error;
    }
  }

  /**
   * 获取配置（如果未加载则自动加载）
   */
  async getConfig(configName) {
    if (!this.configs.has(configName)) {
      await this.loadConfigByName(configName);
    }
    return this.configs.get(configName);
  }

  /**
   * 通过ID获取特定配置项
   */
  async getConfigById(configName, id) {
    const config = await this.getConfig(configName);
    return config[id.toString()];
  }

  /**
   * 获取配置的所有ID列表
   */
  async getConfigIds(configName) {
    const config = await this.getConfig(configName);
    return Object.keys(config).map(key => parseInt(key)).sort((a, b) => a - b);
  }

  /**
   * 获取配置的所有值列表
   */
  async getConfigValues(configName) {
    const config = await this.getConfig(configName);
    return Object.values(config);
  }

  /**
   * 检查指定配置是否已加载
   */
  isLoaded(configName) {
    return this.configs.has(configName);
  }

  /**
   * 清除指定配置缓存
   */
  clearCache(configName) {
    if (configName === 'all') {
      this.configs.clear();
      this.loadingPromises.clear();
    } else {
      this.configs.delete(configName);
      this.loadingPromises.delete(configName);
    }
  }

  /**
   * 预加载多个配置（可选，用于性能优化）
   */
  async preloadConfigs(configNames) {
    try {
      await Promise.all(
        configNames.map(name => this.loadConfigByName(name))
      );
      console.log('配置文件预加载完成:', configNames);
    } catch (error) {
      console.error('预加载配置文件失败:', error);
      throw error;
    }
  }

  /**
   * 获取所有已加载的配置名称
   */
  getLoadedConfigNames() {
    return Array.from(this.configs.keys());
  }
} 