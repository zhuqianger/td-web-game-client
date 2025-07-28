import ConfigManager from '../common/ConfigManager.js'

export default class ChessPiece {
  constructor(scene, x, y, type, playerId, offsetX, offsetY) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.type = type;
    this.playerId = playerId;
    this.sprite = null;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    
    // 棋子属性
    this.stats = this.getStatsByType(type);
    this.currentHp = this.stats.hp;
    this.maxHp = this.stats.hp;
    this.hasMoved = false;
    this.hasAttacked = false;
    
    this.createSprite();
  }
  
  getStatsByType(type) {
    // 尝试从配置管理器获取棋子类型配置
    const configManager = ConfigManager.getInstance();
    
    // 如果配置已加载，直接使用
    if (configManager.isLoaded('pieceTypes')) {
      const pieceTypesConfig = configManager.configs.get('pieceTypes');
      
      // 处理数字类型ID
      if (typeof type === 'number' || !isNaN(parseInt(type))) {
        const typeId = type.toString();
        const pieceTypeConfig = pieceTypesConfig?.[typeId];
        if (pieceTypeConfig) {
          return {
            hp: pieceTypeConfig.hp,
            attack: pieceTypeConfig.attack,
            defense: pieceTypeConfig.defense,
            range: pieceTypeConfig.range,
            moveRange: pieceTypeConfig.moveRange,
            name: pieceTypeConfig.name,
            color: parseInt(pieceTypeConfig.color, 16)
          };
        }
      }
      
      // 处理字符串类型名称（向后兼容）
      const pieceTypeConfig = pieceTypesConfig?.[type];
      if (pieceTypeConfig) {
        return {
          hp: pieceTypeConfig.hp,
          attack: pieceTypeConfig.attack,
          defense: pieceTypeConfig.defense,
          range: pieceTypeConfig.range,
          moveRange: pieceTypeConfig.moveRange,
          name: pieceTypeConfig.name,
          color: parseInt(pieceTypeConfig.color, 16)
        };
      }
    }
    
    // 如果配置不存在或未加载，使用默认配置
    const defaultStats = {
      'warrior': { hp: 120, attack: 30, defense: 20, range: 1, moveRange: 3, name: '战士', color: 0x4169E1 },
      'archer': { hp: 90, attack: 35, defense: 10, range: 4, moveRange: 2, name: '弓箭手', color: 0x32CD32 },
      'mage': { hp: 80, attack: 40, defense: 8, range: 3, moveRange: 2, name: '法师', color: 0x9932CC },
      'tank': { hp: 180, attack: 25, defense: 30, range: 1, moveRange: 2, name: '坦克', color: 0x8B4513 },
      'knight': { hp: 100, attack: 35, defense: 15, range: 1, moveRange: 4, name: '骑士', color: 0xFFD700 }
    };
    return defaultStats[type] || defaultStats['warrior'];
  }
  
  createSprite() {
    const tileSize = this.scene.tileSize || 80;
    const color = this.playerId === 1 ? this.stats.color : 0xff4444;
    const borderColor = this.playerId === 1 ? 0x0000ff : 0xff0000;
    
    // 创建棋子主体
    this.sprite = this.scene.add.circle(
      this.x * tileSize + this.offsetX + tileSize/2, 
      this.y * tileSize + this.offsetY + tileSize/2, 
      tileSize/3, 
      color
    );
    
    // 添加边框
    this.sprite.setStrokeStyle(3, borderColor);
    
    // 添加血量条
    this.createHealthBar();
    
    // 添加类型标识
    this.createTypeLabel();
    
    // 添加攻击力标识
    this.createAttackLabel();
  }
  
  createHealthBar() {
    const tileSize = this.scene.tileSize || 80;
    const barWidth = tileSize * 0.625;
    const barHeight = tileSize * 0.075;
    const barX = this.x * tileSize + this.offsetX + tileSize * 0.1875;
    const barY = this.y * tileSize + this.offsetY + tileSize * 0.125;
    
    // 背景条
    this.healthBarBg = this.scene.add.rectangle(
      barX + barWidth/2, 
      barY + barHeight/2, 
      barWidth, 
      barHeight, 
      0x000000, 
      0.8
    );
    
    // 血量条
    this.healthBar = this.scene.add.rectangle(
      barX + barWidth/2, 
      barY + barHeight/2, 
      barWidth, 
      barHeight, 
      0x00ff00
    );
    
    this.updateHealthBar();
  }
  
  createTypeLabel() {
    const tileSize = this.scene.tileSize || 80;
    this.typeLabel = this.scene.add.text(
      this.x * tileSize + this.offsetX + tileSize/2, 
      this.y * tileSize + this.offsetY + tileSize * 0.8125, 
      this.stats.name, 
      {
        fontSize: `${Math.max(10, tileSize * 0.15)}px`,
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2
      }
    );
    this.typeLabel.setOrigin(0.5);
  }
  
  createAttackLabel() {
    const tileSize = this.scene.tileSize || 80;
    this.attackLabel = this.scene.add.text(
      this.x * tileSize + this.offsetX + tileSize/2, 
      this.y * tileSize + this.offsetY + tileSize * 0.25, 
      `${this.stats.attack}`, 
      {
        fontSize: `${Math.max(12, tileSize * 0.175)}px`,
        color: '#ffff00',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 2
      }
    );
    this.attackLabel.setOrigin(0.5);
  }
  
  updateHealthBar() {
    const tileSize = this.scene.tileSize || 80;
    const healthPercent = this.currentHp / this.maxHp;
    const barWidth = tileSize * 0.625;
    this.healthBar.width = barWidth * healthPercent;
    
    // 根据血量改变颜色
    if (healthPercent > 0.6) {
      this.healthBar.setFillStyle(0x00ff00);
    } else if (healthPercent > 0.3) {
      this.healthBar.setFillStyle(0xffff00);
    } else {
      this.healthBar.setFillStyle(0xff0000);
    }
  }
  
  takeDamage(damage) {
    const actualDamage = Math.max(1, damage - this.stats.defense);
    this.currentHp = Math.max(0, this.currentHp - actualDamage);
    this.updateHealthBar();
    
    // 显示伤害数字
    this.showDamageText(actualDamage);
    
    // 受伤闪烁效果
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 2
    });
    
    return this.currentHp <= 0;
  }
  
  showDamageText(damage) {
    const tileSize = this.scene.tileSize || 80;
    const damageText = this.scene.add.text(
      this.x * tileSize + this.offsetX + tileSize/2, 
      this.y * tileSize + this.offsetY + tileSize * 0.1875, 
      `-${damage}`, 
      {
        fontSize: `${Math.max(14, tileSize * 0.225)}px`,
        color: '#ff0000',
        fontStyle: 'bold',
        stroke: '#ffffff',
        strokeThickness: 2
      }
    );
    damageText.setOrigin(0.5);
    
    // 伤害数字动画
    this.scene.tweens.add({
      targets: damageText,
      y: damageText.y - tileSize * 0.5,
      alpha: 0,
      duration: 1200,
      ease: 'Power2',
      onComplete: () => {
        damageText.destroy();
      }
    });
  }
  
  canMove() {
    return !this.hasMoved;
  }
  
  canAttack() {
    return !this.hasAttacked;
  }
  
  resetTurn() {
    this.hasMoved = false;
    this.hasAttacked = false;
  }
  
  // 更新棋子位置（移动时调用）
  updatePosition(x, y) {
    const tileSize = this.scene.tileSize || 80;
    this.x = x;
    this.y = y;
    
    // 更新精灵位置
    this.sprite.x = x * tileSize + this.offsetX + tileSize/2;
    this.sprite.y = y * tileSize + this.offsetY + tileSize/2;
    
    // 更新UI元素位置
    this.healthBar.x = x * tileSize + this.offsetX + tileSize * 0.1875 + tileSize * 0.3125;
    this.healthBar.y = y * tileSize + this.offsetY + tileSize * 0.125 + tileSize * 0.0375;
    this.healthBarBg.x = x * tileSize + this.offsetX + tileSize * 0.1875 + tileSize * 0.3125;
    this.healthBarBg.y = y * tileSize + this.offsetY + tileSize * 0.125 + tileSize * 0.0375;
    this.typeLabel.x = x * tileSize + this.offsetX + tileSize/2;
    this.typeLabel.y = y * tileSize + this.offsetY + tileSize * 0.8125;
    this.attackLabel.x = x * tileSize + this.offsetX + tileSize/2;
    this.attackLabel.y = y * tileSize + this.offsetY + tileSize * 0.25;
  }
  
  // 高亮选中效果
  highlight() {
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 200,
      ease: 'Power2'
    });
  }
  
  // 取消高亮
  unhighlight() {
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Power2'
    });
  }
  
  destroy() {
    if (this.sprite) this.sprite.destroy();
    if (this.healthBar) this.healthBar.destroy();
    if (this.healthBarBg) this.healthBarBg.destroy();
    if (this.typeLabel) this.typeLabel.destroy();
    if (this.attackLabel) this.attackLabel.destroy();
  }

  /**
   * 异步获取棋子类型配置（用于动态更新）
   */
  async updateStatsFromConfig() {
    try {
      const configManager = ConfigManager.getInstance();
      const pieceTypesConfig = await configManager.getConfig('pieceTypes');
      
      // 处理数字类型ID
      if (typeof this.type === 'number' || !isNaN(parseInt(this.type))) {
        const typeId = this.type.toString();
        const pieceTypeConfig = pieceTypesConfig[typeId];
        if (pieceTypeConfig) {
          this.stats = {
            hp: pieceTypeConfig.hp,
            attack: pieceTypeConfig.attack,
            defense: pieceTypeConfig.defense,
            range: pieceTypeConfig.range,
            moveRange: pieceTypeConfig.moveRange,
            name: pieceTypeConfig.name,
            color: parseInt(pieceTypeConfig.color, 16)
          };
          
          // 更新显示
          this.updateDisplay();
          return true;
        }
      }
      
      // 处理字符串类型名称（向后兼容）
      const pieceTypeConfig = pieceTypesConfig[this.type];
      if (pieceTypeConfig) {
        this.stats = {
          hp: pieceTypeConfig.hp,
          attack: pieceTypeConfig.attack,
          defense: pieceTypeConfig.defense,
          range: pieceTypeConfig.range,
          moveRange: pieceTypeConfig.moveRange,
          name: pieceTypeConfig.name,
          color: parseInt(pieceTypeConfig.color, 16)
        };
        
        // 更新显示
        this.updateDisplay();
        return true;
      }
    } catch (error) {
      console.error('更新棋子配置失败:', error);
    }
    return false;
  }

  /**
   * 更新棋子显示
   */
  updateDisplay() {
    if (this.typeLabel) {
      this.typeLabel.setText(this.stats.name);
    }
    if (this.attackLabel) {
      this.attackLabel.setText(`${this.stats.attack}`);
    }
    if (this.sprite) {
      const color = this.playerId === 1 ? this.stats.color : 0xff4444;
      this.sprite.setFillStyle(color);
    }
  }
} 