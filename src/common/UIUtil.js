/**
 * UI工具类
 * 提供UI元素查找、定位等实用功能
 */
export default class UIUtil {
  
  /**
   * 查找元素
   * @param {Phaser.Scene} scene - 场景对象
   * @param {string} targetId - 目标元素ID或名称
   * @returns {*} 找到的元素对象，未找到返回null
   */
  static findElement(scene, targetId) {
    console.log(`查找元素: ${targetId}`);
    
    // 1. 直接ID查找
    if (scene[targetId]) {
      console.log(`通过直接ID找到元素: ${targetId}`);
      return scene[targetId];
    }
    
    // 2. 通过name属性查找
    const element = UIUtil.findElementByName(scene, targetId);
    if (element) {
      console.log(`通过name属性找到元素: ${targetId}`);
      return element;
    }
    
    console.log(`未找到元素: ${targetId}`);
    return null;
  }

  /**
   * 通过name属性查找元素
   * @param {Phaser.Scene} scene - 场景对象
   * @param {string} name - 元素名称
   * @returns {*} 找到的元素对象，未找到返回null
   */
  static findElementByName(scene, name) {
    // 在场景属性中查找
    if (scene[name]) {
      return scene[name];
    }
    
    // 递归查找所有子元素
    return UIUtil.findElementRecursive(scene, name);
  }

  /**
   * 递归查找元素
   * 遍历list，如果元素下有list继续遍历，直到查找到name = 传入的要查找的元素的名字时返回
   * @param {*} parent - 父元素
   * @param {string} name - 目标元素名称
   * @returns {*} 找到的元素对象，未找到返回null
   */
  static findElementRecursive(parent, name) {
    // 检查当前元素是否有name属性且匹配
    if (parent.name === name) {
      console.log(`找到目标元素: ${name}`);
      return parent;
    }
    
    // 对于scene对象，需要特殊处理
    if (parent.scene) {
      // 如果parent是scene对象，直接使用scene的children
      const sceneChildren = parent.children;
      if (sceneChildren && sceneChildren.list && sceneChildren.list.length > 0) {
        console.log(`检查scene的children，长度: ${sceneChildren.list.length}`);
        for (let i = 0; i < sceneChildren.list.length; i++) {
          const child = sceneChildren.list[i]
          const result = UIUtil.findElementRecursive(child, name);
          if (result) {
            return result;
          }
        }
      }
    }
    
    // 检查当前元素是否有list属性（Phaser的DisplayList）
    if (parent.list && parent.list.length > 0) {
      console.log(`检查list，长度: ${parent.list.length}`);
      for (let i = 0; i < parent.list.length; i++) {
        const child = parent.list[i]
        const result = UIUtil.findElementRecursive(child, name);
        if (result) {
          return result;
        }
      }
    }
    
    // 检查children属性（容器的子元素）
    if (parent.children && parent.children.length > 0) {
      console.log(`检查children，长度: ${parent.children.length}`);
      for (let i = 0; i < parent.children.length; i++) {
        const child = parent.children[i]
        const result = UIUtil.findElementRecursive(child, name);
        if (result) {
          return result;
        }
      }
    }
    
    return null;
  }

  /**
   * 获取元素的世界坐标
   * @param {*} element - 元素对象
   * @returns {Object} 包含x, y坐标的对象
   */
  static getWorldPosition(element) {
    let x = element.x || 0;
    let y = element.y || 0;
    
    // 如果元素在容器内，需要累加容器的位置
    let parent = element.parentContainer;
    while (parent) {
      x += parent.x || 0;
      y += parent.y || 0;
      parent = parent.parentContainer;
    }
    
    return { x, y };
  }

  /**
   * 获取按钮位置
   * @param {Phaser.Scene} scene - 场景对象
   * @param {string} buttonId - 按钮ID
   * @returns {Object|null} 按钮的世界坐标，未找到返回null
   */
  static getButtonPosition(scene, buttonId) {
    const element = UIUtil.findElement(scene, buttonId);
    if (element) {
      return UIUtil.getWorldPosition(element);
    }
    return null;
  }

  /**
   * 获取文本位置
   * @param {Phaser.Scene} scene - 场景对象
   * @param {string} textId - 文本ID
   * @returns {Object|null} 文本的世界坐标，未找到返回null
   */
  static getTextPosition(scene, textId) {
    const element = UIUtil.findElement(scene, textId);
    if (element) {
      return UIUtil.getWorldPosition(element);
    }
    return null;
  }

  /**
   * 获取按钮文本内容
   * @param {Phaser.Scene} scene - 场景对象
   * @param {string} buttonId - 按钮ID
   * @returns {string|null} 按钮的文本内容，未找到返回null
   */
  static getButtonText(scene, buttonId) {
    const button = UIUtil.findElement(scene, buttonId);
    if (!button) {
      return null;
    }
    
    // 查找对应的文本元素
    const textId = buttonId + 'Text';
    const text = UIUtil.findElement(scene, textId);
    if (text && text.text) {
      return text.text;
    }
    
    return null;
  }

  /**
   * 获取文本内容
   * @param {Phaser.Scene} scene - 场景对象
   * @param {string} textId - 文本ID
   * @returns {string|null} 文本内容，未找到返回null
   */
  static getTextContent(scene, textId) {
    const text = UIUtil.findElement(scene, textId);
    if (text && text.text) {
      return text.text;
    }
    return null;
  }

  /**
   * 查找所有具有指定name前缀的元素
   * @param {Phaser.Scene} scene - 场景对象
   * @param {string} prefix - 名称前缀
   * @returns {Array} 匹配的元素数组
   */
  static findElementsByPrefix(scene, prefix) {
    const results = [];
    UIUtil.findElementsByPrefixRecursive(scene, prefix, results);
    return results;
  }

  /**
   * 递归查找具有指定前缀的元素
   * @param {*} parent - 父元素
   * @param {string} prefix - 名称前缀
   * @param {Array} results - 结果数组
   */
  static findElementsByPrefixRecursive(parent, prefix, results) {
    // 检查当前元素是否有name属性且匹配前缀
    if (parent.name && parent.name.startsWith(prefix)) {
      results.push(parent);
    }
    
    // 对于scene对象，需要特殊处理
    if (parent.scene) {
      const sceneChildren = parent.children;
      if (sceneChildren && sceneChildren.list && sceneChildren.list.length > 0) {
        for (let i = 0; i < sceneChildren.list.length; i++) {
          const child = sceneChildren.list.getAt(i);
          UIUtil.findElementsByPrefixRecursive(child, prefix, results);
        }
      }
    }
    
    // 检查当前元素是否有list属性
    if (parent.list && parent.list.length > 0) {
      for (let i = 0; i < parent.list.length; i++) {
        const child = parent.list.getAt(i);
        UIUtil.findElementsByPrefixRecursive(child, prefix, results);
      }
    }
    
    // 检查children属性（容器的子元素）
    if (parent.children && parent.children.length > 0) {
      for (let i = 0; i < parent.children.length; i++) {
        const child = parent.children.getAt(i);
        UIUtil.findElementsByPrefixRecursive(child, prefix, results);
      }
    }
  }

  /**
   * 检查元素是否可见
   * @param {*} element - 元素对象
   * @returns {boolean} 元素是否可见
   */
  static isElementVisible(element) {
    if (!element) return false;
    
    // 检查visible属性
    if (element.visible === false) return false;
    
    // 检查alpha属性
    if (element.alpha !== undefined && element.alpha <= 0) return false;
    
    // 检查父容器的可见性
    let parent = element.parentContainer;
    while (parent) {
      if (parent.visible === false) return false;
      if (parent.alpha !== undefined && parent.alpha <= 0) return false;
      parent = parent.parentContainer;
    }
    
    return true;
  }

  /**
   * 获取元素的边界框
   * @param {*} element - 元素对象
   * @returns {Object|null} 包含x, y, width, height的边界框对象
   */
  static getElementBounds(element) {
    if (!element) return null;
    
    const worldPos = UIUtil.getWorldPosition(element);
    const width = element.width || 0;
    const height = element.height || 0;
    
    return {
      x: worldPos.x - width / 2,
      y: worldPos.y - height / 2,
      width: width,
      height: height
    };
  }
} 