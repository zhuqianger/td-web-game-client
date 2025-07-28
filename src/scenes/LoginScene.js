import Phaser from 'phaser'

export default class LoginScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoginScene' });
    this.username = '';
    this.password = '';
  }

  preload() {
    // 不加载任何资源
  }

  create() {
    // 创建静态背景
    this.createStaticBackground();
    
    // 创建标题
    this.createTitle();
    
    // 创建输入框
    this.createInputFields();
    
    // 创建登录按钮
    this.createLoginButton();
    
    // 创建注册链接
    this.createRegisterLink();
    
    // 设置键盘事件
    this.setupKeyboardEvents();
  }

  createStaticBackground() {
    const { width, height } = this.scale;
    
    // 使用纯色背景，不使用渐变
    const graphics = this.add.graphics();
    graphics.fillStyle(0x1a1a2e);
    graphics.fillRect(0, 0, width, height);
    
    // 添加一些静态装饰点，不使用动画
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(1, 2);
      const alpha = Phaser.Math.FloatBetween(0.1, 0.3);
      
      this.add.circle(x, y, size, 0xffffff, alpha);
    }
  }

  createTitle() {
    const { width, height } = this.scale;
    
    // 主标题 - 移除动画
    const title = this.add.text(width / 2, height * 0.2, '', {
      fontSize: '48px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    });
    title.setOrigin(0.5);
    
    // 副标题
    const subtitle = this.add.text(width / 2, height * 0.28, 'Web Strategy Game', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#cccccc',
      fontStyle: 'italic'
    });
    subtitle.setOrigin(0.5);
  }

  createInputFields() {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const startY = height * 0.45;
    const spacing = 80;
    
    // 用户名标签
    const usernameLabel = this.add.text(centerX - 140, startY - 35, '用户名:', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff'
    });
    
    // 用户名输入框背景
    const usernameBg = this.add.rectangle(centerX, startY, 300, 50, 0xffffff, 0.1);
    usernameBg.setStrokeStyle(2, 0xffffff, 0.3);

    // 用户名输入文本
    this.usernameText = this.add.text(centerX - 130, startY - 10, '请输入用户名', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#cccccc'
    });
    
    // 密码标签
    const passwordLabel = this.add.text(centerX - 140, startY + spacing - 35, '密码:', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff'
    });

    usernameLabel.text = "用户名"
    passwordLabel.text = "密码"

    // 密码输入框背景
    const passwordBg = this.add.rectangle(centerX, startY + spacing, 300, 50, 0xffffff, 0.1);
    passwordBg.setStrokeStyle(2, 0xffffff, 0.3);

    // 密码输入文本
    this.passwordText = this.add.text(centerX - 130, startY + spacing - 10, '请输入密码', {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#cccccc'
    });
    
    // 设置输入框为可交互
    usernameBg.setInteractive();
    passwordBg.setInteractive();
    
    // 添加点击事件
    usernameBg.on('pointerdown', () => {
      this.activeInput = 'username';
      this.usernameText.setText(this.username || '');
      this.usernameText.setColor('#ffffff');
    });
    
    passwordBg.on('pointerdown', () => {
      this.activeInput = 'password';
      this.passwordText.setText('*'.repeat(this.password.length) || '');
      this.passwordText.setColor('#ffffff');
    });
  }

  createLoginButton() {
    const { width, height } = this.scale;
    
    // 登录按钮背景
    this.loginButton = this.add.rectangle(width / 2, height * 0.7, 200, 50, 0x4CAF50);
    this.loginButton.setStrokeStyle(2, 0x45a049);
    
    // 登录按钮文本
    this.loginButtonText = this.add.text(width / 2, height * 0.7, '登录', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.loginButtonText.setOrigin(0.5);
    
    // 设置按钮为可交互
    this.loginButton.setInteractive();
    
    // 简化悬停效果
    this.loginButton.on('pointerover', () => {
      this.loginButton.setFillStyle(0x45a049);
    });
    
    this.loginButton.on('pointerout', () => {
      this.loginButton.setFillStyle(0x4CAF50);
    });
    
    // 添加点击事件
    this.loginButton.on('pointerdown', () => {
      this.handleLogin();
    });
  }

  createRegisterLink() {
    const { width, height } = this.scale;
    
    // 注册链接文本
    const registerText = this.add.text(width / 2, height * 0.8, '还没有账号？点击注册', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#87CEEB',
      fontStyle: 'underline'
    });
    registerText.setOrigin(0.5);
    
    // 设置文本为可交互
    registerText.setInteractive();
    
    // 简化悬停效果
    registerText.on('pointerover', () => {
      registerText.setColor('#ffffff');
    });
    
    registerText.on('pointerout', () => {
      registerText.setColor('#87CEEB');
    });
    
    // 添加点击事件
    registerText.on('pointerdown', () => {
      this.handleRegister();
    });
  }

  setupKeyboardEvents() {
    // 监听键盘输入
    this.input.keyboard.on('keydown', (event) => {
      if (this.activeInput === 'username') {
        if (event.key === 'Backspace') {
          this.username = this.username.slice(0, -1);
        } else if (event.key === 'Enter') {
          this.activeInput = 'password';
          this.passwordText.setText('*'.repeat(this.password.length) || '');
          this.passwordText.setColor('#ffffff');
        } else if (event.key.length === 1) {
          this.username += event.key;
        }
        this.usernameText.setText(this.username || '请输入用户名');
      } else if (this.activeInput === 'password') {
        if (event.key === 'Backspace') {
          this.password = this.password.slice(0, -1);
        } else if (event.key === 'Enter') {
          this.handleLogin();
        } else if (event.key.length === 1) {
          this.password += event.key;
        }
        this.passwordText.setText('*'.repeat(this.password.length) || '请输入密码');
      }
    });
  }

  handleLogin() {
    if (!this.username || !this.password) {
      this.showMessage('请输入用户名和密码', 'error');
      return;
    }
    
    // 模拟登录验证
    if (this.username === 'admin' && this.password === '123456') {
      this.showMessage('登录成功！', 'success');
      // 跳转到主界面
      setTimeout(() => {
        this.scene.start('MainMenuScene');
      }, 1000);
    } else {
      this.showMessage('用户名或密码错误', 'error');
    }
  }

  handleRegister() {
    this.showMessage('注册功能开发中...', 'info');
  }

  showMessage(text, type = 'info') {
    const { width, height } = this.scale;
    
    // 移除之前的消息
    if (this.messageText) {
      this.messageText.destroy();
    }
    
    // 设置消息颜色
    let color = '#ffffff';
    if (type === 'error') color = '#ff6b6b';
    if (type === 'success') color = '#51cf66';
    if (type === 'info') color = '#74c0fc';
    
    // 创建消息文本
    this.messageText = this.add.text(width / 2, height * 0.75, text, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: color,
      fontStyle: 'bold'
    });
    this.messageText.setOrigin(0.5);
    
    // 简化动画
    this.messageText.setAlpha(0);
    this.tweens.add({
      targets: this.messageText,
      alpha: 1,
      duration: 200,
      ease: 'Linear'
    });
    
    // 3秒后自动消失
    setTimeout(() => {
      if (this.messageText) {
        this.tweens.add({
          targets: this.messageText,
          alpha: 0,
          duration: 200,
          ease: 'Linear',
          onComplete: () => {
            this.messageText.destroy();
            this.messageText = null;
          }
        });
      }
    }, 3000);
  }
} 