export default class GameMap {
  constructor(scene, width, height, tileSize, offsetX, offsetY) {
    this.scene = scene;
    this.width = width;
    this.height = height;
    this.tileSize = tileSize;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.tiles = [];

    this.border = null;
  }
  
  create() {
    this.createBorder();
    this.createTiles();
  }
  
  createBorder() {
    // 创建地图边框
    const borderGraphics = this.scene.add.graphics();
    borderGraphics.lineStyle(4, 0xffffff, 0.8);
    borderGraphics.strokeRect(
      this.offsetX - 2, 
      this.offsetY - 2, 
      this.width * this.tileSize + 4, 
      this.height * this.tileSize + 4
    );
    this.border = borderGraphics;
  }
  
  createTiles() {
    // 创建地图格子
    for (let x = 0; x < this.width; x++) {
      this.tiles[x] = [];
      for (let y = 0; y < this.height; y++) {
        const color = (x + y) % 2 === 0 ? 0x8B4513 : 0xA0522D;
        const tile = this.scene.add.rectangle(
          x * this.tileSize + this.tileSize/2 + this.offsetX,
          y * this.tileSize + this.tileSize/2 + this.offsetY,
          this.tileSize,
          this.tileSize,
          color
        );
        tile.setStrokeStyle(1, 0x000000);
        
        // 存储格子引用
        this.tiles[x][y] = tile;
      }
    }
  }
  
  // 高亮指定格子
  highlightTile(x, y, color, alpha) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      const highlight = this.scene.add.rectangle(
        x * this.tileSize + this.tileSize/2 + this.offsetX,
        y * this.tileSize + this.tileSize/2 + this.offsetY,
        this.tileSize,
        this.tileSize,
        color,
        alpha
      );
      highlight.setStrokeStyle(2, color, 0.8);
      return highlight;
    }
    return null;
  }
  
  // 获取格子世界坐标
  getTileWorldPosition(x, y) {
    return {
      x: x * this.tileSize + this.tileSize/2 + this.offsetX,
      y: y * this.tileSize + this.tileSize/2 + this.offsetY
    };
  }
  
  // 将世界坐标转换为格子坐标
  worldToTilePosition(worldX, worldY) {
    const adjustedX = worldX - this.offsetX;
    const adjustedY = worldY - this.offsetY;
    const x = Math.floor(adjustedX / this.tileSize);
    const y = Math.floor(adjustedY / this.tileSize);
    
    return { x, y };
  }
  
  // 检查坐标是否在地图范围内
  isValidPosition(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }
  
  // 获取指定位置的格子
  getTile(x, y) {
    if (this.isValidPosition(x, y)) {
      return this.tiles[x][y];
    }
    return null;
  }
  
  // 设置格子颜色
  setTileColor(x, y, color) {
    const tile = this.getTile(x, y);
    if (tile) {
      tile.setFillStyle(color);
    }
  }
  
  // 重置所有格子颜色
  resetTileColors() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const color = (x + y) % 2 === 0 ? 0x8B4513 : 0xA0522D;
        this.setTileColor(x, y, color);
      }
    }
  }
  
  // 销毁地图
  destroy() {
    if (this.border) {
      this.border.destroy();
    }
    
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.tiles[x][y]) {
          this.tiles[x][y].destroy();
        }
      }
    }
    
    this.tiles = [];
  }
} 