<template>
  <div id="app">
    <div id="phaser-container" style="width: 100vw; height: 100vh;"></div>
  </div>
</template>

<script>
import { onMounted, onUnmounted } from 'vue'
import Phaser from 'phaser'
import LoginScene from './scenes/LoginScene.js'
import MainMenuScene from './scenes/MainMenuScene.js'
import GameScene from './scenes/GameScene.js'

export default {
  name: 'App',
  setup() {
    let game = null

    onMounted(() => {
      // 直接初始化 Phaser 游戏
      game = new Phaser.Game({
        type: Phaser.CANVAS, // 强制使用 Canvas 而不是 WebGL
        width: window.innerWidth,
        height: window.innerHeight,
        parent: 'phaser-container',
        scene: [LoginScene, MainMenuScene, GameScene],
        backgroundColor: '#1a1a2e',
        scale: {
          mode: Phaser.Scale.FIT, // 改为 FIT 模式
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: window.innerWidth,
          height: window.innerHeight
        },
        // 性能优化设置
        render: {
          pixelArt: false,
          antialias: false, // 关闭抗锯齿
          roundPixels: true,
          powerPreference: 'default'
        },
        physics: {
          default: false
        },
        fps: {
          target: 60, // 降低帧率到30fps
          forceSetTimeOut: true
        }
      })

      // 改进的窗口大小改变处理函数
      const handleResize = () => {
        if (game) {
          // 使用 setTimeout 确保在下一个事件循环中执行，给浏览器时间更新窗口尺寸
          setTimeout(() => {
            const newWidth = window.innerWidth
            const newHeight = window.innerHeight
            game.scale.resize(newWidth, newHeight)
          }, 0)
        }
      }

      // 监听多种窗口状态变化事件
      window.addEventListener('resize', handleResize)
      window.addEventListener('orientationchange', handleResize)
      
      // 监听窗口最大化/最小化状态变化
      if (window.screen && window.screen.orientation) {
        window.screen.orientation.addEventListener('change', handleResize)
      }
      
      // 清理事件监听器
      onUnmounted(() => {
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('orientationchange', handleResize)
        if (window.screen && window.screen.orientation) {
          window.screen.orientation.removeEventListener('change', handleResize)
        }
        if (game) {
          game.destroy(true)
          game = null
        }
      })
    })

    return {}
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  padding: 0;
  overflow: hidden;
  width: 100vw;
  height: 100vh;
}

#phaser-container {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
}

/* 移除默认的margin */
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
