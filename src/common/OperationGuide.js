import ConfigManager from './ConfigManager.js';
import UIUtil from './UIUtil.js';

export default class OperationGuide {
  // 静态属性用于全局唯一引导状态
  static guideContainer = null;
  static messageBox = null;
  static messageText = null;
  static highlightMask = null;
  static arrow = null;
  static nextButton = null;
  static skipButton = null;
  static clickListener = null;
  static currentGuide = null;
  static currentStep = 0;
  static isActive = false;
  static scene = null;
  
  // 新增：高亮元素管理
  static highlightedElements = [];
  static pulseTween = null;

  /**
   * 直接播放引导
   */
  static async playGuide(scene, guideId) {
    if (OperationGuide.isActive) {
      // 已有引导在进行
      return false;
    }
    OperationGuide.scene = scene;
    try {
      const configManager = ConfigManager.getInstance();
      const guidesConfig = await configManager.getConfig('guides');
      OperationGuide.currentGuide = guidesConfig[guideId.toString()];
      if (!OperationGuide.currentGuide) {
        console.error(`找不到引导配置: ${guideId}`);
        return false;
      }
      OperationGuide.currentStep = 0;
      OperationGuide.isActive = true;
      OperationGuide.createGuideUI();
      OperationGuide.showStep(0);
      return true;
    } catch (error) {
      console.error('启动引导失败:', error);
      return false;
    }
  }

  static createGuideUI() {
    const scene = OperationGuide.scene;
    const { width, height } = scene.scale;
    OperationGuide.guideContainer = scene.add.container(0, 0);
    OperationGuide.guideContainer.setDepth(1000);
    OperationGuide.highlightMask = scene.add.graphics();
    OperationGuide.highlightMask.fillStyle(0x000000, 0.7);
    OperationGuide.highlightMask.fillRect(0, 0, width, height);
    OperationGuide.guideContainer.add(OperationGuide.highlightMask);
    OperationGuide.messageBox = scene.add.rectangle(
      width / 2,
      height - 150,
      600,
      100,
      0x333333,
      0.9
    );
    OperationGuide.messageBox.setStrokeStyle(3, 0xffffff);
    OperationGuide.guideContainer.add(OperationGuide.messageBox);
    OperationGuide.messageText = scene.add.text(
      width / 2,
      height - 150,
      '',
      {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold',
        wordWrap: { width: 580 }
      }
    );
    OperationGuide.messageText.setOrigin(0.5);
    OperationGuide.guideContainer.add(OperationGuide.messageText);
    OperationGuide.arrow = scene.add.graphics();
    OperationGuide.guideContainer.add(OperationGuide.arrow);
    OperationGuide.nextButton = scene.add.rectangle(
      width / 2 + 200,
      height - 100,
      120,
      40,
      0x4CAF50
    );
    OperationGuide.nextButton.setStrokeStyle(2, 0x45a049);
    OperationGuide.nextButton.setInteractive();
    OperationGuide.nextButton.on('pointerdown', () => OperationGuide.nextStep());
    OperationGuide.guideContainer.add(OperationGuide.nextButton);
    const nextText = scene.add.text(
      width / 2 + 200,
      height - 100,
      '下一步',
      {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    );
    nextText.setOrigin(0.5);
    OperationGuide.guideContainer.add(nextText);
    OperationGuide.skipButton = scene.add.rectangle(
      width / 2 - 200,
      height - 100,
      120,
      40,
      0xf44336
    );
    OperationGuide.skipButton.setStrokeStyle(2, 0xd32f2f);
    OperationGuide.skipButton.setInteractive();
    OperationGuide.skipButton.on('pointerdown', () => OperationGuide.endGuide());
    OperationGuide.guideContainer.add(OperationGuide.skipButton);
    const skipText = scene.add.text(
      width / 2 - 200,
      height - 100,
      '跳过引导',
      {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    );
    skipText.setOrigin(0.5);
    OperationGuide.guideContainer.add(skipText);
  }

  static showStep(stepIndex) {
    if (!OperationGuide.currentGuide || stepIndex >= OperationGuide.currentGuide.steps.length) {
      OperationGuide.endGuide();
      return;
    }
    
    // 清理之前的高亮效果
    OperationGuide.clearHighlightedElements();
    
    const step = OperationGuide.currentGuide.steps[stepIndex];
    OperationGuide.currentStep = stepIndex;
    OperationGuide.messageText.setText(step.message);
    OperationGuide.highlightTarget(step);
    OperationGuide.setArrow(step);
    OperationGuide.setupClickListener(step);
  }

  /**
   * 清理高亮元素
   */
  static clearHighlightedElements() {
    // 停止脉冲动画
    if (OperationGuide.pulseTween) {
      OperationGuide.pulseTween.stop();
      OperationGuide.pulseTween = null;
    }
    
    // 销毁所有高亮元素
    OperationGuide.highlightedElements.forEach(element => {
      if (element && element.destroy) {
        element.destroy();
      }
    });
    OperationGuide.highlightedElements = [];
  }

  static highlightTarget(step) {
    const scene = OperationGuide.scene;
    const { width, height } = scene.scale;
    
    // 清除之前的遮罩
    OperationGuide.highlightMask.clear();
    OperationGuide.highlightMask.fillStyle(0x000000, 0.7);
    OperationGuide.highlightMask.fillRect(0, 0, width, height);
    
    const targetPos = OperationGuide.getTargetPosition(step);
    if (targetPos) {
      // 在目标位置挖一个洞
      OperationGuide.highlightMask.fillStyle(0x000000, 0);
      OperationGuide.highlightMask.fillRect(
        targetPos.x - 60,
        targetPos.y - 30,
        120,
        60
      );
      
      // 创建高亮元素
      OperationGuide.createHighlightedElement(step, targetPos);
    }
  }

  /**
   * 创建高亮元素
   */
  static createHighlightedElement(step, targetPos) {
    const scene = OperationGuide.scene;
    
    switch (step.target) {
      case 'button':
        OperationGuide.createHighlightedButton(step.targetId, targetPos);
        break;
      case 'text':
        OperationGuide.createHighlightedText(step.targetId, targetPos);
        break;
    }
  }

  /**
   * 创建高亮按钮
   */
  static createHighlightedButton(buttonId, targetPos) {
    const scene = OperationGuide.scene;
    
    // 创建高亮背景
    const highlightBg = scene.add.rectangle(
      targetPos.x,
      targetPos.y,
      120,
      60,
      0xffff00,
      0.3
    );
    highlightBg.setStrokeStyle(4, 0xffff00, 1);
    highlightBg.setDepth(1001);
    OperationGuide.highlightedElements.push(highlightBg);
    
    // 创建脉冲动画
    OperationGuide.pulseTween = scene.tweens.add({
      targets: highlightBg,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // 动态获取按钮文本
    const buttonText = OperationGuide.getButtonText(buttonId);
    
    if (buttonText) {
      const textCopy = scene.add.text(
        targetPos.x,
        targetPos.y,
        buttonText,
        {
          fontSize: '14px',
          color: '#ffffff',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 2
        }
      );
      textCopy.setOrigin(0.5);
      textCopy.setDepth(1002);
      OperationGuide.highlightedElements.push(textCopy);
    }
  }

  /**
   * 创建高亮文本
   */
  static createHighlightedText(textId, targetPos) {
    const scene = OperationGuide.scene;
    
    // 创建高亮背景
    const highlightBg = scene.add.rectangle(
      targetPos.x,
      targetPos.y,
      200,
      40,
      0xffff00,
      0.3
    );
    highlightBg.setStrokeStyle(4, 0xffff00, 1);
    highlightBg.setDepth(1001);
    OperationGuide.highlightedElements.push(highlightBg);
    
    // 创建脉冲动画
    OperationGuide.pulseTween = scene.tweens.add({
      targets: highlightBg,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // 动态获取文本内容
    const textContent = OperationGuide.getTextContent(textId);
    
    if (textContent) {
      const textCopy = scene.add.text(
        targetPos.x,
        targetPos.y,
        textContent,
        {
          fontSize: '16px',
          color: '#ffffff',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 2
        }
      );
      textCopy.setOrigin(0.5);
      textCopy.setDepth(1002);
      OperationGuide.highlightedElements.push(textCopy);
    }
  }

  /**
   * 获取按钮文本内容
   */
  static getButtonText(buttonId) {
    const scene = OperationGuide.scene;
    
    // 尝试获取对应的文本元素
    let textElement = null;
    
    // 通过路径查找对应的文本元素
    if (buttonId.includes('chapterButton_')) {
      const chapterId = buttonId.split('_')[1];
      textElement = OperationGuide.findElement(`chapterText_${chapterId}`);
    } else if (buttonId.includes('levelButton_')) {
      const levelId = buttonId.split('_')[1];
      textElement = OperationGuide.findElement(`levelText_${levelId}`);
    } else {
      // 尝试查找对应的文本元素
      const textId = buttonId.replace('Button', 'Text');
      textElement = OperationGuide.findElement(textId);
    }
    
    if (textElement && textElement.text) {
      return textElement.text;
    }
    
    // 如果找不到文本元素，使用默认映射
    const defaultTexts = {
      'startButton': '开始游戏',
      'backButton': '返回登录',
      'guideButton1': '测试引导1',
      'guideButton2': '测试引导2'
    };
    
    return defaultTexts[buttonId] || buttonId;
  }

  /**
   * 获取文本内容
   */
  static getTextContent(textId) {
    const scene = OperationGuide.scene;
    
    // 尝试获取对应的文本元素
    const textElement = OperationGuide.findElement(textId);
    
    if (textElement && textElement.text) {
      return textElement.text;
    }
    
    // 如果找不到文本元素，使用默认映射
    const defaultTexts = {
      'title': '主菜单',
      'userInfo': '玩家: 游客'
    };
    
    return defaultTexts[textId] || textId;
  }

  static getTargetPosition(step) {
    switch (step.target) {
      case 'button':
        return UIUtil.getButtonPosition(OperationGuide.scene, step.targetId);
      case 'text':
        return UIUtil.getTextPosition(OperationGuide.scene, step.targetId);
      default:
        return null;
    }
  }

  static setArrow(step) {
    OperationGuide.arrow.clear();
    const targetPos = OperationGuide.getTargetPosition(step);
    if (!targetPos) return;
    const arrowLength = 30;
    const arrowWidth = 15;
    OperationGuide.arrow.lineStyle(4, 0xffff00, 1);
    switch (step.arrow) {
      case 'up':
        OperationGuide.drawArrow(
          targetPos.x,
          targetPos.y + 60,
          targetPos.x,
          targetPos.y + 10,
          arrowLength,
          arrowWidth
        );
        break;
      case 'down':
        OperationGuide.drawArrow(
          targetPos.x,
          targetPos.y - 60,
          targetPos.x,
          targetPos.y - 10,
          arrowLength,
          arrowWidth
        );
        break;
      case 'left':
        OperationGuide.drawArrow(
          targetPos.x + 60,
          targetPos.y,
          targetPos.x + 10,
          targetPos.y,
          arrowLength,
          arrowWidth
        );
        break;
      case 'right':
        OperationGuide.drawArrow(
          targetPos.x - 60,
          targetPos.y,
          targetPos.x - 10,
          targetPos.y,
          arrowLength,
          arrowWidth
        );
        break;
    }
  }

  static drawArrow(startX, startY, endX, endY, length, width) {
    const arrow = OperationGuide.arrow;
    arrow.beginPath();
    arrow.moveTo(startX, startY);
    arrow.lineTo(endX, endY);
    arrow.strokePath();
    const angle = Math.atan2(endY - startY, endX - startX);
    const headAngle = Math.PI / 6;
    const head1X = endX - length * Math.cos(angle - headAngle);
    const head1Y = endY - length * Math.sin(angle - headAngle);
    const head2X = endX - length * Math.cos(angle + headAngle);
    const head2Y = endY - length * Math.sin(angle + headAngle);
    arrow.beginPath();
    arrow.moveTo(endX, endY);
    arrow.lineTo(head1X, head1Y);
    arrow.lineTo(head2X, head2Y);
    arrow.closePath();
    arrow.fillPath();
  }

  static setupClickListener(step) {
    const scene = OperationGuide.scene;
    if (OperationGuide.clickListener) {
      scene.input.off('pointerdown', OperationGuide.clickListener);
    }
    OperationGuide.clickListener = (pointer) => {
      const targetPos = OperationGuide.getTargetPosition(step);
      if (!targetPos) return;
      const distance = Phaser.Math.Distance.Between(
        pointer.x,
        pointer.y,
        targetPos.x,
        targetPos.y
      );
      if (distance < 60) {
        OperationGuide.nextStep();
      }
    };
    scene.input.on('pointerdown', OperationGuide.clickListener);
  }

  static nextStep() {
    OperationGuide.showStep(OperationGuide.currentStep + 1);
  }

  static endGuide() {
    OperationGuide.isActive = false;
    const scene = OperationGuide.scene;
    
    // 清理高亮元素
    OperationGuide.clearHighlightedElements();
    
    if (OperationGuide.clickListener) {
      scene.input.off('pointerdown', OperationGuide.clickListener);
      OperationGuide.clickListener = null;
    }
    if (OperationGuide.guideContainer) {
      OperationGuide.guideContainer.destroy();
      OperationGuide.guideContainer = null;
    }
    OperationGuide.currentGuide = null;
    OperationGuide.currentStep = 0;
    OperationGuide.scene = null;
  }

  static isGuideActive() {
    return OperationGuide.isActive;
  }

  static pause() {
    if (OperationGuide.isActive && OperationGuide.guideContainer) {
      OperationGuide.guideContainer.setVisible(false);
    }
  }

  static resume() {
    if (OperationGuide.isActive && OperationGuide.guideContainer) {
      OperationGuide.guideContainer.setVisible(true);
    }
  }
}
