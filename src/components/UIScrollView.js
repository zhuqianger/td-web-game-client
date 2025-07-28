/**
 * UIScrollView - Phaser 游戏中的可滚动 UI 组件
 * 用于创建可滚动的容器，支持垂直和水平滚动
 */
export class UIScrollView {
    constructor(scene, x, y, width, height, options = {}) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        
        // 默认配置
        this.options = {
            backgroundColor: 0x000000,
            backgroundAlpha: 0.5,
            scrollBarColor: 0x666666,
            scrollBarAlpha: 0.8,
            scrollBarWidth: 8,
            scrollBarHeight: 8,
            enableVerticalScroll: true,
            enableHorizontalScroll: false,
            ...options
        };
        
        this.container = null;
        this.contentContainer = null;
        this.scrollBarV = null;
        this.scrollBarH = null;
        this.isDragging = false;
        this.isScrolling = false;
        this.scrollOffset = { x: 0, y: 0 };
        this.contentBounds = { width: 0, height: 0 };
        
        this.create();
    }
    
    create() {
        // 创建主容器
        this.container = this.scene.add.container(this.x, this.y);
        
        // 创建背景
        const background = this.scene.add.rectangle(
            0, 0, 
            this.width, this.height, 
            this.options.backgroundColor, 
            this.options.backgroundAlpha
        );
        this.container.add(background);
        
        // 创建内容容器
        this.contentContainer = this.scene.add.container(0, 0);
        this.container.add(this.contentContainer);
        
        // 创建遮罩
        const mask = this.scene.add.graphics();
        mask.fillStyle(0xffffff);
        mask.fillRect(0, 0, this.width, this.height);
        this.contentContainer.setMask(mask.createGeometryMask());
        
        // 创建滚动条
        if (this.options.enableVerticalScroll) {
            this.createVerticalScrollBar();
        }
        
        if (this.options.enableHorizontalScroll) {
            this.createHorizontalScrollBar();
        }
        
        // 添加交互事件
        this.setupInteractions();
    }
    
    createVerticalScrollBar() {
        const scrollBarWidth = this.options.scrollBarWidth;
        const scrollBarHeight = Math.min(this.height * 0.3, this.height);
        
        this.scrollBarV = this.scene.add.rectangle(
            this.width - scrollBarWidth / 2,
            scrollBarHeight / 2,
            scrollBarWidth,
            scrollBarHeight,
            this.options.scrollBarColor,
            this.options.scrollBarAlpha
        );
        
        this.container.add(this.scrollBarV);
        
        // 添加滚动条交互
        this.scrollBarV.setInteractive();
        this.scene.input.setDraggable(this.scrollBarV);
    }
    
    createHorizontalScrollBar() {
        const scrollBarWidth = Math.min(this.width * 0.3, this.width);
        const scrollBarHeight = this.options.scrollBarHeight;
        
        this.scrollBarH = this.scene.add.rectangle(
            scrollBarWidth / 2,
            this.height - scrollBarHeight / 2,
            scrollBarWidth,
            scrollBarHeight,
            this.options.scrollBarColor,
            this.options.scrollBarAlpha
        );
        
        this.container.add(this.scrollBarH);
        
        // 添加滚动条交互
        this.scrollBarH.setInteractive();
        this.scene.input.setDraggable(this.scrollBarH);
    }
    
    setupInteractions() {
        // 鼠标滚轮事件
        this.scene.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            if (this.isPointInBounds(pointer.x, pointer.y)) {
                this.scrollBy(0, -deltaY * 2);
            }
        });
        
        // 拖拽事件
        this.scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (gameObject === this.scrollBarV && this.options.enableVerticalScroll) {
                this.handleVerticalScrollDrag(dragY);
            } else if (gameObject === this.scrollBarH && this.options.enableHorizontalScroll) {
                this.handleHorizontalScrollDrag(dragX);
            }
        });
        
        // 容器拖拽事件
        this.container.setInteractive();
        this.scene.input.setDraggable(this.container);
        
        this.scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (gameObject === this.container && !this.isDragging) {
                this.scrollBy(-dragX, -dragY);
            }
        });
    }
    
    handleVerticalScrollDrag(dragY) {
        const maxScrollY = this.height - this.scrollBarV.height;
        const scrollRatio = Math.max(0, Math.min(1, dragY / maxScrollY));
        const maxContentScroll = this.contentBounds.height - this.height;
        
        this.scrollOffset.y = scrollRatio * maxContentScroll;
        this.updateContentPosition();
        this.updateScrollBarPosition();
    }
    
    handleHorizontalScrollDrag(dragX) {
        const maxScrollX = this.width - this.scrollBarH.width;
        const scrollRatio = Math.max(0, Math.min(1, dragX / maxScrollX));
        const maxContentScroll = this.contentBounds.width - this.width;
        
        this.scrollOffset.x = scrollRatio * maxContentScroll;
        this.updateContentPosition();
        this.updateScrollBarPosition();
    }
    
    scrollBy(deltaX, deltaY) {
        if (this.options.enableHorizontalScroll) {
            this.scrollOffset.x += deltaX;
        }
        
        if (this.options.enableVerticalScroll) {
            this.scrollOffset.y += deltaY;
        }
        
        this.clampScrollOffset();
        this.updateContentPosition();
        this.updateScrollBarPosition();
    }
    
    scrollTo(x, y) {
        if (this.options.enableHorizontalScroll) {
            this.scrollOffset.x = x;
        }
        
        if (this.options.enableVerticalScroll) {
            this.scrollOffset.y = y;
        }
        
        this.clampScrollOffset();
        this.updateContentPosition();
        this.updateScrollBarPosition();
    }
    
    clampScrollOffset() {
        const maxScrollX = Math.max(0, this.contentBounds.width - this.width);
        const maxScrollY = Math.max(0, this.contentBounds.height - this.height);
        
        this.scrollOffset.x = Math.max(0, Math.min(maxScrollX, this.scrollOffset.x));
        this.scrollOffset.y = Math.max(0, Math.min(maxScrollY, this.scrollOffset.y));
    }
    
    updateContentPosition() {
        this.contentContainer.setPosition(-this.scrollOffset.x, -this.scrollOffset.y);
    }
    
    updateScrollBarPosition() {
        if (this.scrollBarV && this.options.enableVerticalScroll) {
            const maxScrollY = this.height - this.scrollBarV.height;
            const scrollRatio = this.contentBounds.height > this.height ? 
                this.scrollOffset.y / (this.contentBounds.height - this.height) : 0;
            this.scrollBarV.setPosition(
                this.width - this.options.scrollBarWidth / 2,
                scrollRatio * maxScrollY + this.scrollBarV.height / 2
            );
        }
        
        if (this.scrollBarH && this.options.enableHorizontalScroll) {
            const maxScrollX = this.width - this.scrollBarH.width;
            const scrollRatio = this.contentBounds.width > this.width ? 
                this.scrollOffset.x / (this.contentBounds.width - this.width) : 0;
            this.scrollBarH.setPosition(
                scrollRatio * maxScrollX + this.scrollBarH.width / 2,
                this.height - this.options.scrollBarHeight / 2
            );
        }
    }
    
    addContent(gameObject) {
        this.contentContainer.add(gameObject);
        this.updateContentBounds();
    }
    
    removeContent(gameObject) {
        this.contentContainer.remove(gameObject);
        this.updateContentBounds();
    }
    
    updateContentBounds() {
        let minX = 0, minY = 0, maxX = 0, maxY = 0;
        let hasContent = false;
        
        this.contentContainer.each((child) => {
            if (child.getBounds) {
                const bounds = child.getBounds();
                if (!hasContent) {
                    minX = bounds.x;
                    minY = bounds.y;
                    maxX = bounds.x + bounds.width;
                    maxY = bounds.y + bounds.height;
                    hasContent = true;
                } else {
                    minX = Math.min(minX, bounds.x);
                    minY = Math.min(minY, bounds.y);
                    maxX = Math.max(maxX, bounds.x + bounds.width);
                    maxY = Math.max(maxY, bounds.y + bounds.height);
                }
            }
        });
        
        this.contentBounds.width = hasContent ? maxX - minX : 0;
        this.contentBounds.height = hasContent ? maxY - minY : 0;
        
        this.clampScrollOffset();
        this.updateScrollBarPosition();
    }
    
    isPointInBounds(x, y) {
        const worldX = this.container.x;
        const worldY = this.container.y;
        return x >= worldX && x <= worldX + this.width &&
               y >= worldY && y <= worldY + this.height;
    }
    
    setVisible(visible) {
        this.container.setVisible(visible);
    }
    
    destroy() {
        if (this.container) {
            this.container.destroy();
        }
    }
    
    // 获取容器引用
    getContainer() {
        return this.container;
    }
    
    // 获取内容容器引用
    getContentContainer() {
        return this.contentContainer;
    }
}
