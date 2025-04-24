/**
 * 動畫管理器
 * 負責處理遊戲中的各種動畫效果
 */
export class AnimationManager {
  constructor(gameController) {
    this.gameController = gameController;
    this.animationQueue = [];
    this.isAnimating = false;
  }

  /**
   * 初始化動畫管理器
   */
  init() {
    console.log('初始化動畫管理器');
    // 可以在這裡預加載動畫資源或設置動畫環境
  }

  /**
   * 播放屏幕切換動畫
   */
  playScreenTransition() {
    const screens = document.querySelectorAll('.screen');
    const currentScreen = document.getElementById(this.gameController.state.currentScreen);
    
    if (!currentScreen) return;
    
    // 隱藏所有屏幕
    screens.forEach(screen => {
      screen.classList.add('hidden');
      screen.style.opacity = '0';
    });
    
    // 顯示當前屏幕並添加淡入效果
    currentScreen.classList.remove('hidden');
    setTimeout(() => {
      currentScreen.style.opacity = '1';
    }, 50);
  }

  /**
   * 播放回合結束動畫
   */
  playTurnEndAnimation() {
    const turnEndElement = document.createElement('div');
    turnEndElement.className = 'turn-end-animation';
    turnEndElement.textContent = '回合結束';
    
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.appendChild(turnEndElement);
      
      // 添加動畫效果
      setTimeout(() => {
        turnEndElement.classList.add('active');
      }, 50);
      
      // 動畫結束後移除元素
      setTimeout(() => {
        turnEndElement.classList.remove('active');
        setTimeout(() => {
          gameContainer.removeChild(turnEndElement);
        }, 500);
      }, 1500);
    }
  }

  /**
   * 播放玩家受傷動畫
   */
  playPlayerHitAnimation() {
    const playerElement = document.querySelector('#player-area .player-character');
    if (!playerElement) return;
    
    // 添加閃爍效果
    playerElement.classList.add('hit');
    
    // 創建傷害數字
    const damageElement = document.createElement('div');
    damageElement.className = 'damage-number';
    damageElement.textContent = `-${this.gameController.state.enemy.attack}`;
    playerElement.appendChild(damageElement);
    
    // 移除閃爍效果和傷害數字
    setTimeout(() => {
      playerElement.classList.remove('hit');
      setTimeout(() => {
        if (playerElement.contains(damageElement)) {
          playerElement.removeChild(damageElement);
        }
      }, 500);
    }, 500);
  }

  /**
   * 播放抽牌動畫
   */
  playDrawAnimation() {
    const deckElement = document.querySelector('.deck');
    const handElement = document.querySelector('.hand');
    
    if (!deckElement || !handElement) return;
    
    // 創建一個臨時卡牌元素
    const tempCard = document.createElement('div');
    tempCard.className = 'card temp-card';
    
    // 獲取牌庫和手牌的位置
    const deckRect = deckElement.getBoundingClientRect();
    const handRect = handElement.getBoundingClientRect();
    
    // 設置初始位置
    tempCard.style.position = 'absolute';
    tempCard.style.left = `${deckRect.left}px`;
    tempCard.style.top = `${deckRect.top}px`;
    tempCard.style.width = `${deckRect.width}px`;
    tempCard.style.height = `${deckRect.height}px`;
    tempCard.style.zIndex = '1000';
    
    document.body.appendChild(tempCard);
    
    // 添加動畫效果
    setTimeout(() => {
      tempCard.style.transition = 'all 0.5s ease';
      tempCard.style.left = `${handRect.left + handRect.width / 2}px`;
      tempCard.style.top = `${handRect.top}px`;
      tempCard.style.transform = 'scale(1.2)';
      tempCard.style.opacity = '0';
      
      // 動畫結束後移除元素
      setTimeout(() => {
        document.body.removeChild(tempCard);
      }, 500);
    }, 50);
  }

  /**
   * 播放勝利動畫
   */
  playVictoryAnimation() {
    const battleScreen = document.getElementById('battle');
    if (!battleScreen) return;
    
    // 創建勝利元素
    const victoryElement = document.createElement('div');
    victoryElement.className = 'victory-animation';
    victoryElement.innerHTML = '<span>勝利！</span>';
    
    battleScreen.appendChild(victoryElement);
    
    // 添加動畫效果
    setTimeout(() => {
      victoryElement.classList.add('active');
      
      // 添加粒子效果
      for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'victory-particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 2}s`;
        victoryElement.appendChild(particle);
      }
    }, 50);
  }

  /**
   * 播放失敗動畫
   */
  playDefeatAnimation() {
    const battleScreen = document.getElementById('battle');
    if (!battleScreen) return;
    
    // 創建失敗元素
    const defeatElement = document.createElement('div');
    defeatElement.className = 'defeat-animation';
    defeatElement.innerHTML = '<span>失敗...</span>';
    
    battleScreen.appendChild(defeatElement);
    
    // 添加動畫效果
    setTimeout(() => {
      defeatElement.classList.add('active');
      
      // 添加暗色遮罩
      const overlay = document.createElement('div');
      overlay.className = 'defeat-overlay';
      defeatElement.appendChild(overlay);
    }, 50);
  }

  /**
   * 播放敵人受傷動畫
   * @param {number} damage - 傷害值
   */
  playEnemyHitAnimation(damage) {
    const enemyElement = document.querySelector('#enemy-area .enemy-character');
    if (!enemyElement) return;
    
    // 添加閃爍效果
    enemyElement.classList.add('hit');
    
    // 創建傷害數字
    const damageElement = document.createElement('div');
    damageElement.className = 'damage-number';
    damageElement.textContent = `-${damage}`;
    enemyElement.appendChild(damageElement);
    
    // 移除閃爍效果和傷害數字
    setTimeout(() => {
      enemyElement.classList.remove('hit');
      setTimeout(() => {
        if (enemyElement.contains(damageElement)) {
          enemyElement.removeChild(damageElement);
        }
      }, 500);
    }, 500);
  }

  /**
   * 播放治療動畫
   * @param {number} amount - 治療量
   */
  playHealAnimation(amount) {
    const playerElement = document.querySelector('#player-area .player-character');
    if (!playerElement) return;
    
    // 添加治療效果
    playerElement.classList.add('heal');
    
    // 創建治療數字
    const healElement = document.createElement('div');
    healElement.className = 'heal-number';
    healElement.textContent = `+${amount}`;
    playerElement.appendChild(healElement);
    
    // 移除治療效果和治療數字
    setTimeout(() => {
      playerElement.classList.remove('heal');
      setTimeout(() => {
        if (playerElement.contains(healElement)) {
          playerElement.removeChild(healElement);
        }
      }, 500);
    }, 500);
  }

  /**
   * 播放卡牌效果動畫
   * @param {Object} card - 卡牌對象
   */
  playCardEffectAnimation(card) {
    const battleArea = document.getElementById('battle-area');
    if (!battleArea) return;
    
    // 根據卡牌類型創建不同的效果
    const effectElement = document.createElement('div');
    effectElement.className = `card-effect ${card.type}`;
    
    battleArea.appendChild(effectElement);
    
    // 添加動畫效果
    setTimeout(() => {
      effectElement.classList.add('active');
      
      // 動畫結束後移除元素
      setTimeout(() => {
        battleArea.removeChild(effectElement);
      }, 1000);
    }, 50);
  }

  /**
   * 播放戰鬥開始動畫
   */
  playBattleStartAnimation() {
    const battleScreen = document.getElementById('battle');
    if (!battleScreen) return;
    
    // 創建戰鬥開始元素
    const startElement = document.createElement('div');
    startElement.className = 'battle-start-animation';
    startElement.innerHTML = '<span>戰鬥開始！</span>';
    
    battleScreen.appendChild(startElement);
    
    // 添加動畫效果
    setTimeout(() => {
      startElement.classList.add('active');
      
      // 動畫結束後移除元素
      setTimeout(() => {
        startElement.classList.remove('active');
        setTimeout(() => {
          battleScreen.removeChild(startElement);
        }, 500);
      }, 1500);
    }, 50);
  }

  /**
   * 播放升級動畫
   */
  playLevelUpAnimation() {
    const playerElement = document.querySelector('#player-area .player-character');
    if (!playerElement) return;
    
    // 創建升級元素
    const levelUpElement = document.createElement('div');
    levelUpElement.className = 'level-up-animation';
    levelUpElement.innerHTML = '<span>升級！</span>';
    
    playerElement.appendChild(levelUpElement);
    
    // 添加動畫效果
    setTimeout(() => {
      levelUpElement.classList.add('active');
      
      // 添加光芒效果
      for (let i = 0; i < 8; i++) {
        const ray = document.createElement('div');
        ray.className = 'level-up-ray';
        ray.style.transform = `rotate(${i * 45}deg)`;
        levelUpElement.appendChild(ray);
      }
      
      // 動畫結束後移除元素
      setTimeout(() => {
        levelUpElement.classList.remove('active');
        setTimeout(() => {
          playerElement.removeChild(levelUpElement);
        }, 500);
      }, 2000);
    }, 50);
  }

  /**
   * 播放獲得獎勵動畫
   * @param {string} type - 獎勵類型
   * @param {number} amount - 獎勵數量
   */
  playRewardAnimation(type, amount) {
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) return;
    
    // 創建獎勵元素
    const rewardElement = document.createElement('div');
    rewardElement.className = 'reward-animation';
    
    let icon = '';
    switch (type) {
      case 'gold':
        icon = '💰';
        break;
      case 'card':
        icon = '🃏';
        break;
      case 'experience':
        icon = '✨';
        break;
      default:
        icon = '🎁';
    }
    
    rewardElement.innerHTML = `<span>${icon} +${amount}</span>`;
    
    gameContainer.appendChild(rewardElement);
    
    // 添加動畫效果
    setTimeout(() => {
      rewardElement.classList.add('active');
      
      // 動畫結束後移除元素
      setTimeout(() => {
        rewardElement.classList.remove('active');
        setTimeout(() => {
          gameContainer.removeChild(rewardElement);
        }, 500);
      }, 2000);
    }, 50);
  }

  /**
   * 播放成就解鎖動畫
   * @param {Object} achievement - 成就對象
   */
  playAchievementAnimation(achievement) {
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) return;
    
    // 創建成就元素
    const achievementElement = document.createElement('div');
    achievementElement.className = 'achievement-animation';
    achievementElement.innerHTML = `
      <div class="achievement-icon">🏆</div>
      <div class="achievement-info">
        <div class="achievement-title">成就解鎖！</div>
        <div class="achievement-name">${achievement.name}</div>
      </div>
    `;
    
    gameContainer.appendChild(achievementElement);
    
    // 添加動畫效果
    setTimeout(() => {
      achievementElement.classList.add('active');
      
      // 動畫結束後移除元素
      setTimeout(() => {
        achievementElement.classList.remove('active');
        setTimeout(() => {
          gameContainer.removeChild(achievementElement);
        }, 500);
      }, 3000);
    }, 50);
  }
}
