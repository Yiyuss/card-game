/**
 * 動畫管理器
 * 負責處理所有與動畫相關的操作
 */
export class AnimationManager {
  constructor(gameController) {
    this.gameController = gameController;
    
    // 動畫元素緩存
    this.animationElements = {};
    
    // 當前正在播放的動畫
    this.currentAnimations = [];
    
    // 動畫設置
    this.animationSpeed = 1.0; // 動畫速度倍率
    this.animationsEnabled = true; // 動畫是否啟用
  }

  /**
   * 初始化動畫管理器
   */
  init() {
    console.log('初始化動畫管理器...');
    
    // 從設置中獲取動畫設置
    this.animationsEnabled = this.gameController.state.settings.animationsEnabled !== false;
    this.animationSpeed = this.gameController.state.settings.animationSpeed || 1.0;
    
    // 創建動畫容器
    this._createAnimationContainer();
    
    console.log('動畫管理器初始化完成');
  }

  /**
   * 創建動畫容器
   */
  _createAnimationContainer() {
    // 檢查是否已存在動畫容器
    let container = document.getElementById('animation-container');
    
    if (!container) {
      // 創建動畫容器
      container = document.createElement('div');
      container.id = 'animation-container';
      container.style.position = 'absolute';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '1000';
      container.style.overflow = 'hidden';
      
      // 添加到文檔
      document.body.appendChild(container);
    }
    
    // 保存容器引用
    this.container = container;
  }

  /**
   * 播放屏幕轉場動畫
   */
  playScreenTransition() {
    if (!this.animationsEnabled) return Promise.resolve();
    
    console.log('播放屏幕轉場動畫');
    
    // 創建轉場元素
    const transition = document.createElement('div');
    transition.className = 'screen-transition';
    transition.style.position = 'absolute';
    transition.style.top = '0';
    transition.style.left = '0';
    transition.style.width = '100%';
    transition.style.height = '100%';
    transition.style.backgroundColor = 'black';
    transition.style.opacity = '0';
    transition.style.zIndex = '2000';
    transition.style.transition = `opacity ${0.5 / this.animationSpeed}s ease-in-out`;
    
    // 添加到容器
    this.container.appendChild(transition);
    
    // 播放淡入動畫
    return new Promise(resolve => {
      // 強制重繪
      transition.offsetHeight;
      
      // 淡入
      transition.style.opacity = '1';
      
      setTimeout(() => {
        // 淡出
        transition.style.opacity = '0';
        
        setTimeout(() => {
          // 移除元素
          this.container.removeChild(transition);
          resolve();
        }, 500 / this.animationSpeed);
      }, 300 / this.animationSpeed);
    });
  }

  /**
   * 播放卡牌抽取動畫
   */
  playDrawAnimation() {
    if (!this.animationsEnabled) return Promise.resolve();
    
    console.log('播放卡牌抽取動畫');
    
    // 獲取手牌容器
    const handContainer = document.querySelector('.hand-container');
    if (!handContainer) return Promise.resolve();
    
    // 獲取最後一張卡牌
    const cards = handContainer.querySelectorAll('.card');
    const lastCard = cards[cards.length - 1];
    
    if (!lastCard) return Promise.resolve();
    
    // 設置初始狀態
    lastCard.style.transform = 'scale(0.1) translateY(-300px)';
    lastCard.style.opacity = '0';
    lastCard.style.transition = `all ${0.3 / this.animationSpeed}s ease-out`;
    
    // 播放動畫
    return new Promise(resolve => {
      // 強制重繪
      lastCard.offsetHeight;
      
      // 恢復正常狀態
      lastCard.style.transform = '';
      lastCard.style.opacity = '1';
      
      setTimeout(() => {
        resolve();
      }, 300 / this.animationSpeed);
    });
  }

  /**
   * 播放卡牌使用動畫
   * @param {HTMLElement} cardElement - 卡牌元素
   */
  playCardUseAnimation(cardElement) {
    if (!this.animationsEnabled || !cardElement) return Promise.resolve();
    
    console.log('播放卡牌使用動畫');
    
    // 獲取卡牌位置
    const cardRect = cardElement.getBoundingClientRect();
    
    // 創建卡牌克隆
    const cardClone = cardElement.cloneNode(true);
    cardClone.style.position = 'absolute';
    cardClone.style.top = `${cardRect.top}px`;
    cardClone.style.left = `${cardRect.left}px`;
    cardClone.style.width = `${cardRect.width}px`;
    cardClone.style.height = `${cardRect.height}px`;
    cardClone.style.zIndex = '1500';
    cardClone.style.transition = `all ${0.5 / this.animationSpeed}s ease-in-out`;
    
    // 添加到容器
    this.container.appendChild(cardClone);
    
    // 獲取目標位置（敵人位置）
    const enemyElement = document.querySelector('.enemy-container');
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 3;
    
    if (enemyElement) {
      const enemyRect = enemyElement.getBoundingClientRect();
      targetX = enemyRect.left + enemyRect.width / 2;
      targetY = enemyRect.top + enemyRect.height / 2;
    }
    
    // 播放動畫
    return new Promise(resolve => {
      // 強制重繪
      cardClone.offsetHeight;
      
      // 移動到目標位置
      cardClone.style.transform = `translate(${targetX - cardRect.left - cardRect.width / 2}px, ${targetY - cardRect.top - cardRect.height / 2}px) scale(0.1)`;
      cardClone.style.opacity = '0';
      
      setTimeout(() => {
        // 移除元素
        this.container.removeChild(cardClone);
        resolve();
      }, 500 / this.animationSpeed);
    });
  }
  
  /**
   * 播放回合結束動畫
   */
  playTurnEndAnimation() {
    if (!this.animationsEnabled) return Promise.resolve();
    
    console.log('播放回合結束動畫');
    
    // 創建回合結束提示元素
    const turnEndEl = document.createElement('div');
    turnEndEl.textContent = '回合結束';
    turnEndEl.style.position = 'absolute';
    turnEndEl.style.top = '50%';
    turnEndEl.style.left = '50%';
    turnEndEl.style.transform = 'translate(-50%, -50%)';
    turnEndEl.style.color = 'white';
    turnEndEl.style.fontSize = '36px';
    turnEndEl.style.fontWeight = 'bold';
    turnEndEl.style.textShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    turnEndEl.style.opacity = '0';
    turnEndEl.style.transition = `opacity ${0.3 / this.animationSpeed}s ease-in-out`;
    
    // 添加到容器
    this.container.appendChild(turnEndEl);
    
    // 播放動畫
    return new Promise(resolve => {
      // 強制重繪
      turnEndEl.offsetHeight;
      
      // 淡入
      turnEndEl.style.opacity = '1';
      
      setTimeout(() => {
        // 淡出
        turnEndEl.style.opacity = '0';
        
        setTimeout(() => {
          // 移除元素
          this.container.removeChild(turnEndEl);
          resolve();
        }, 300 / this.animationSpeed);
      }, 700 / this.animationSpeed);
    });
  }
  
  /**
   * 播放玩家受傷動畫
   */
  playPlayerHitAnimation() {
    if (!this.animationsEnabled) return Promise.resolve();
    
    console.log('播放玩家受傷動畫');
    
    // 獲取玩家元素
    const playerElement = document.querySelector('.player-container');
    if (!playerElement) return Promise.resolve();
    
    // 保存原始樣式
    const originalTransform = playerElement.style.transform;
    const originalTransition = playerElement.style.transition;
    
    // 設置新樣式
    playerElement.style.transition = `transform ${0.1 / this.animationSpeed}s ease-in-out`;
    
    // 播放動畫
    return new Promise(resolve => {
      // 震動效果
      const shakeAmount = 5;
      const shakeTimes = 5;
      let count = 0;
      
      const shake = () => {
        if (count >= shakeTimes) {
          // 恢復原始樣式
          playerElement.style.transform = originalTransform;
          playerElement.style.transition = originalTransition;
          resolve();
          return;
        }
        
        const direction = count % 2 === 0 ? 1 : -1;
        playerElement.style.transform = `translateX(${direction * shakeAmount}px)`;
        
        count++;
        setTimeout(shake, 100 / this.animationSpeed);
      };
      
      // 添加紅色閃爍效果
      playerElement.style.boxShadow = '0 0 20px rgba(255, 0, 0, 0.8)';
      
      // 開始震動
      shake();
      
      // 移除紅色閃爍效果
      setTimeout(() => {
        playerElement.style.boxShadow = '';
      }, 500 / this.animationSpeed);
    });
  }
  
  /**
   * 播放勝利動畫
   */
  playVictoryAnimation() {
    if (!this.animationsEnabled) return Promise.resolve();
    
    console.log('播放勝利動畫');
    
    // 創建勝利提示元素
    const victoryEl = document.createElement('div');
    victoryEl.textContent = '勝利！';
    victoryEl.style.position = 'absolute';
    victoryEl.style.top = '50%';
    victoryEl.style.left = '50%';
    victoryEl.style.transform = 'translate(-50%, -50%) scale(0.1)';
    victoryEl.style.color = 'gold';
    victoryEl.style.fontSize = '72px';
    victoryEl.style.fontWeight = 'bold';
    victoryEl.style.textShadow = '0 0 20px rgba(255, 215, 0, 0.8)';
    victoryEl.style.opacity = '0';
    victoryEl.style.transition = `all ${0.5 / this.animationSpeed}s ease-out`;
    victoryEl.style.zIndex = '2000';
    
    // 添加到容器
    this.container.appendChild(victoryEl);
    
    // 播放動畫
    return new Promise(resolve => {
      // 強制重繪
      victoryEl.offsetHeight;
      
      // 放大並淡入
      victoryEl.style.transform = 'translate(-50%, -50%) scale(1)';
      victoryEl.style.opacity = '1';
      
      // 創建粒子效果
      this._createParticles('gold', 100);
      
      setTimeout(() => {
        // 淡出
        victoryEl.style.opacity = '0';
        
        setTimeout(() => {
          // 移除元素
          this.container.removeChild(victoryEl);
          resolve();
        }, 500 / this.animationSpeed);
      }, 2000 / this.animationSpeed);
    });
  }
  
  /**
   * 播放失敗動畫
   */
  playDefeatAnimation() {
    if (!this.animationsEnabled) return Promise.resolve();
    
    console.log('播放失敗動畫');
    
    // 創建失敗提示元素
    const defeatEl = document.createElement('div');
    defeatEl.textContent = '失敗...';
    defeatEl.style.position = 'absolute';
    defeatEl.style.top = '50%';
    defeatEl.style.left = '50%';
    defeatEl.style.transform = 'translate(-50%, -50%)';
    defeatEl.style.color = 'darkred';
    defeatEl.style.fontSize = '64px';
    defeatEl.style.fontWeight = 'bold';
    defeatEl.style.textShadow = '0 0 15px rgba(139, 0, 0, 0.7)';
    defeatEl.style.opacity = '0';
    defeatEl.style.transition = `opacity ${0.8 / this.animationSpeed}s ease-in`;
    defeatEl.style.zIndex = '2000';
    
    // 添加到容器
    this.container.appendChild(defeatEl);
    
    // 創建暗色遮罩
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';
    overlay.style.transition = `background-color ${1.0 / this.animationSpeed}s ease-in`;
    overlay.style.zIndex = '1900';
    
    // 添加到容器
    this.container.appendChild(overlay);
    
    // 播放動畫
    return new Promise(resolve => {
      // 強制重繪
      defeatEl.offsetHeight;
      overlay.offsetHeight;
      
      // 淡入遮罩和文字
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      defeatEl.style.opacity = '1';
      
      setTimeout(() => {
        // 淡出
        defeatEl.style.opacity = '0';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';
        
        setTimeout(() => {
          // 移除元素
          this.container.removeChild(defeatEl);
          this.container.removeChild(overlay);
          resolve();
        }, 800 / this.animationSpeed);
      }, 2000 / this.animationSpeed);
    });
  }
  
  /**
   * 創建粒子效果
   * @param {string} color - 粒子顏色
   * @param {number} count - 粒子數量
   */
  _createParticles(color, count) {
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.style.position = 'absolute';
      particle.style.width = '10px';
      particle.style.height = '10px';
      particle.style.borderRadius = '50%';
      particle.style.backgroundColor = color === 'gold' ? 'gold' : color;
      particle.style.top = '50%';
      particle.style.left = '50%';
      particle.style.opacity = '1';
      particle.style.zIndex = '1800';
      
      // 隨機位置和速度
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      const distance = 100 + Math.random() * 200;
      const duration = 1 + Math.random() * 2;
      
      // 設置動畫
      particle.style.transition = `all ${duration / this.animationSpeed}s ease-out`;
      
      // 添加到容器
      this.container.appendChild(particle);
      
      // 強制重繪
      particle.offsetHeight;
      
      // 設置終點位置
      const targetX = Math.cos(angle) * distance;
      const targetY = Math.sin(angle) * distance;
      
      particle.style.transform = `translate(${targetX}px, ${targetY}px)`;
      particle.style.opacity = '0';
      
      // 移除粒子
      setTimeout(() => {
        this.container.removeChild(particle);
      }, duration * 1000 / this.animationSpeed);
    }
  }
}