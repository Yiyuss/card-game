/**
 * UI管理器
 * 負責處理所有與用戶界面相關的操作
 */
export class UIManager {
  constructor(gameController) {
    this.gameController = gameController;
    this.screens = {};
    this.toastTimeout = null;
  }
  
  /**
   * 初始化UI
   */
  init() {
    console.log('初始化UI...');
    
    // 獲取所有屏幕元素
    this.screens = {
      mainMenu: document.getElementById('main-menu'),
      levelSelect: document.getElementById('level-select'),
      battle: document.getElementById('battle'),
      gameOver: document.getElementById('game-over')
    };
    
    // 確保所有屏幕都存在
    if (!this.screens.mainMenu || !this.screens.levelSelect || !this.screens.battle || !this.screens.gameOver) {
      console.error('無法找到所有必要的屏幕元素');
      return;
    }
    
    // 初始化主菜單
    this._initMainMenu();
    
    // 初始化關卡選擇
    this._initLevelSelect();
    
    // 初始化戰鬥屏幕
    this._initBattleScreen();
    
    // 初始化遊戲結束屏幕
    this._initGameOverScreen();
    
    // 隱藏所有屏幕
    this._hideAllScreens();
    
    console.log('UI初始化完成');
  }
  
  /**
   * 顯示指定屏幕
   */
  showScreen(screenName) {
    // 隱藏所有屏幕
    this._hideAllScreens();
    
    // 顯示指定屏幕
    if (this.screens[screenName]) {
      this.screens[screenName].classList.remove('hidden');
      
      // 根據屏幕類型執行特定初始化
      switch (screenName) {
        case 'mainMenu':
          // 主菜單不需要特殊初始化
          break;
        case 'levelSelect':
          this._initLevelSelect();
          break;
        case 'battle':
          this.updateBattleUI();
          break;
        case 'gameOver':
          this._updateGameOverScreen();
          break;
      }
    } else {
      console.error(`屏幕 ${screenName} 不存在`);
    }
  }
  
  /**
   * 隱藏所有屏幕
   */
  _hideAllScreens() {
    Object.values(this.screens).forEach(screen => {
      if (screen) {
        screen.classList.add('hidden');
      }
    });
  }
  
  /**
   * 初始化主菜單
   */
  _initMainMenu() {
    const mainMenu = this.screens.mainMenu;
    if (!mainMenu) return;
    
    // 清空現有內容
    mainMenu.innerHTML = `
      <h1>卡牌冒險</h1>
      <div class="menu-buttons">
        <button id="new-game-btn">新遊戲</button>
        <button id="load-game-btn">載入遊戲</button>
        <button id="settings-btn">設置</button>
      </div>
    `;
    
    // 添加事件監聽器
    const newGameBtn = mainMenu.querySelector('#new-game-btn');
    const loadGameBtn = mainMenu.querySelector('#load-game-btn');
    const settingsBtn = mainMenu.querySelector('#settings-btn');
    
    if (newGameBtn) {
      newGameBtn.onclick = () => {
        this.gameController.triggerEvent('newGameClicked');
      };
    }
    
    if (loadGameBtn) {
      loadGameBtn.onclick = () => {
        this.gameController.triggerEvent('loadGameClicked');
      };
    }
    
    if (settingsBtn) {
      settingsBtn.onclick = () => {
        this._showSettingsModal();
      };
    }
  }
  
  /**
   * 初始化關卡選擇屏幕
   */
  _initLevelSelect() {
    const levelSelect = this.screens.levelSelect;
    if (!levelSelect) return;
    
    // 清空現有內容
    levelSelect.innerHTML = `
      <h2>選擇關卡</h2>
      <div class="levels-grid" id="levels-container"></div>
      <button class="back-btn" id="back-to-menu-btn">返回主菜單</button>
    `;
    
    const levelsContainer = levelSelect.querySelector('#levels-container');
    const backToMenuBtn = levelSelect.querySelector('#back-to-menu-btn');
    
    // 獲取所有關卡
    const levels = this.gameController.resourceManager.getLevels();
    const unlockedLevels = this.gameController.state.progress.unlockedLevels;
    
    // 創建關卡卡片
    if (levelsContainer && levels) {
      levels.forEach(level => {
        const isUnlocked = unlockedLevels.includes(level.id);
        
        const levelCard = document.createElement('div');
        levelCard.className = `level-card ${isUnlocked ? '' : 'locked'}`;
        
        levelCard.innerHTML = `
          <h3>${level.name}</h3>
          <p>${level.description}</p>
          <p>${isUnlocked ? '點擊開始' : '未解鎖'}</p>
        `;
        
        if (isUnlocked) {
          levelCard.onclick = () => {
            this.gameController.triggerEvent('levelSelected', level.id);
          };
        }
        
        levelsContainer.appendChild(levelCard);
      });
    }
    
    // 添加返回按鈕事件
    if (backToMenuBtn) {
      backToMenuBtn.onclick = () => {
        this.gameController.triggerEvent('backToMenuClicked');
      };
    }
  }
  
  /**
   * 初始化戰鬥屏幕
   */
  _initBattleScreen() {
    const battle = this.screens.battle;
    if (!battle) return;
    
    // 清空現有內容
    battle.innerHTML = `
      <div id="enemy-area">
        <div class="enemy-info">
          <div class="enemy-name"></div>
          <div class="health-bar">
            <div class="health-fill"></div>
            <span class="health-text"></span>
          </div>
          <div class="effects-container enemy-effects"></div>
        </div>
        <div class="enemy-image-container">
          <img class="enemy-image" src="" alt="敵人">
        </div>
      </div>
      
      <div id="battle-area">
        <div class="battle-message"></div>
        <div class="cards-container"></div>
        <button id="end-turn-btn">結束回合</button>
      </div>
      
      <div id="player-area">
        <div class="player-info">
          <div class="player-name">冒險者</div>
          <div class="health-bar">
            <div class="health-fill"></div>
            <span class="health-text"></span>
          </div>
          <div class="mana-bar">
            <div class="mana-fill"></div>
            <span class="mana-text"></span>
          </div>
          <div class="effects-container player-effects"></div>
        </div>
        <div class="deck-info">
          <div class="deck-count">牌庫: <span class="deck-count-value">0</span></div>
          <div class="discard-count">棄牌堆: <span class="discard-count-value">0</span></div>
        </div>
      </div>
    `;
    
    // 添加結束回合按鈕事件
    const endTurnBtn = battle.querySelector('#end-turn-btn');
    if (endTurnBtn) {
      endTurnBtn.onclick = () => {
        this.gameController.triggerEvent('endTurnClicked');
      };
    }
  }
  
  /**
   * 初始化遊戲結束屏幕
   */
  _initGameOverScreen() {
    const gameOver = this.screens.gameOver;
    if (!gameOver) return;
    
    // 清空現有內容
    gameOver.innerHTML = `
      <h2 class="result-title"></h2>
      <div class="result-message"></div>
      <div class="rewards-container"></div>
      <div class="menu-buttons">
        <button id="continue-btn">繼續</button>
        <button id="back-to-menu-btn-game-over">返回主菜單</button>
      </div>
    `;
    
    // 添加按鈕事件
    const continueBtn = gameOver.querySelector('#continue-btn');
    const backToMenuBtn = gameOver.querySelector('#back-to-menu-btn-game-over');
    
    if (continueBtn) {
      continueBtn.onclick = () => {
        this.gameController.triggerEvent('continueClicked');
      };
    }
    
    if (backToMenuBtn) {
      backToMenuBtn.onclick = () => {
        this.gameController.triggerEvent('backToMenuClicked');
      };
    }
  }
  
  /**
   * 更新遊戲結束屏幕
   */
  _updateGameOverScreen() {
    const gameOver = this.screens.gameOver;
    if (!gameOver) return;
    
    const isVictory = this.gameController.state.battle.isVictory;
    const resultTitle = gameOver.querySelector('.result-title');
    const resultMessage = gameOver.querySelector('.result-message');
    const rewardsContainer = gameOver.querySelector('.rewards-container');
    
    if (resultTitle) {
      resultTitle.textContent = isVictory ? '勝利！' : '失敗';
      resultTitle.style.color = isVictory ? '#4ae94a' : '#e94a4a';
    }
    
    if (resultMessage) {
      if (isVictory) {
        resultMessage.textContent = '恭喜你戰勝了敵人！';
      } else {
        resultMessage.textContent = '你被敵人擊敗了，再接再厲！';
      }
    }
    
    // 顯示獎勵（僅在勝利時）
    if (rewardsContainer) {
      rewardsContainer.innerHTML = '';
      
      if (isVictory) {
        const level = this.gameController.resourceManager.getLevelByEnemyId(this.gameController.state.enemy.id);
        if (level) {
          rewardsContainer.innerHTML = `
            <h3>獲得獎勵</h3>
            <div class="reward-item">金幣: ${level.rewards.gold}</div>
            <div class="reward-item">經驗: ${level.rewards.experience}</div>
          `;
          
          // 如果有卡牌獎勵
          if (level.rewards.cards && level.rewards.cards.length > 0) {
            const cardId = level.rewards.cards[0];
            const card = this.gameController.resourceManager.getCardById(cardId);
            if (card) {
              const cardElement = document.createElement('div');
              cardElement.className = 'card reward-card';
              cardElement.innerHTML = `
                <div class="card-name">${card.name}</div>
                <div class="card-cost">${card.manaCost}</div>
                <div class="card-description">${card.description}</div>
                <div class="card-type">${this._getCardTypeText(card.type)}</div>
              `;
              rewardsContainer.appendChild(cardElement);
            }
          }
        }
      }
    }
  }
  
  /**
   * 更新戰鬥UI
   */
  updateBattleUI() {
    const battle = this.screens.battle;
    if (!battle) return;
    
    // 更新敵人信息
    const enemyName = battle.querySelector('.enemy-name');
    const enemyHealthFill = battle.querySelector('.enemy-info .health-fill');
    const enemyHealthText = battle.querySelector('.enemy-info .health-text');
    const enemyImage = battle.querySelector('.enemy-image');
    const enemyEffects = battle.querySelector('.enemy-effects');
    
    if (enemyName) {
      enemyName.textContent = this.gameController.state.enemy.name;
    }
    
    if (enemyHealthFill && enemyHealthText) {
      const healthPercent = (this.gameController.state.enemy.health / this.gameController.state.enemy.maxHealth) * 100;
      enemyHealthFill.style.width = `${healthPercent}%`;
      enemyHealthText.textContent = `${this.gameController.state.enemy.health}/${this.gameController.state.enemy.maxHealth}`;
    }
    
    if (enemyImage) {
      enemyImage.src = this.gameController.state.enemy.image;
    }
    
    // 更新玩家信息
    const playerHealthFill = battle.querySelector('.player-info .health-fill');
    const playerHealthText = battle.querySelector('.player-info .health-text');
    const playerManaFill = battle.querySelector('.player-info .mana-fill');
    const playerManaText = battle.querySelector('.player-info .mana-text');
    const playerEffects = battle.querySelector('.player-effects');
    
    if (playerHealthFill && playerHealthText) {
      const healthPercent = (this.gameController.state.player.health / this.gameController.state.player.maxHealth) * 100;
      playerHealthFill.style.width = `${healthPercent}%`;
      playerHealthText.textContent = `${this.gameController.state.player.health}/${this.gameController.state.player.maxHealth}`;
    }
    
    if (playerManaFill && playerManaText) {
      const manaPercent = (this.gameController.state.player.mana / this.gameController.state.player.maxMana) * 100;
      playerManaFill.style.width = `${manaPercent}%`;
      playerManaText.textContent = `${this.gameController.state.player.mana}/${this.gameController.state.player.maxMana}`;
    }
    
    // 更新牌庫信息
    const deckCountValue = battle.querySelector('.deck-count-value');
    const discardCountValue = battle.querySelector('.discard-count-value');
    
    if (deckCountValue) {
      deckCountValue.textContent = this.gameController.state.cards.deck.length;
    }
    
    if (discardCountValue) {
      discardCountValue.textContent = this.gameController.state.cards.discardPile.length;
    }
    
    // 更新手牌
    this._updateHandCards();
    
    // 更新效果
    this._updateEffects(enemyEffects, 'enemy');
    this._updateEffects(playerEffects, 'player');
    
    // 更新回合按鈕
    const endTurnBtn = battle.querySelector('#end-turn-btn');
    if (endTurnBtn) {
      endTurnBtn.disabled = !this.gameController.state.battle.isPlayerTurn || this.gameController.state.battle.isGameOver;
    }
    
    // 如果遊戲結束，顯示結果消息
    if (this.gameController.state.battle.isGameOver) {
      const battleMessage = battle.querySelector('.battle-message');
      if (battleMessage) {
        battleMessage.textContent = this.gameController.state.battle.isVictory ? '勝利！' : '失敗';
        battleMessage.style.color = this.gameController.state.battle.isVictory ? '#4ae94a' : '#e94a4a';
      }
    }
  }
  
  /**
   * 更新手牌
   */
  _updateHandCards() {
    const cardsContainer = document.querySelector('.cards-container');
    if (!cardsContainer) return;
    
    // 清空現有卡牌
    cardsContainer.innerHTML = '';
    
    // 添加手牌
    this.gameController.state.cards.hand.forEach((card, index) => {
      const cardElement = document.createElement('div');
      cardElement.className = 'card';
      
      // 如果魔力不足，禁用卡牌
      if (card.manaCost > this.gameController.state.player.mana) {
        cardElement.classList.add('disabled');
      }
      
      cardElement.innerHTML = `
        <div class="card-name">${card.name}</div>
        <div class="card-cost">${card.manaCost}</div>
        <div class="card-description">${card.description}</div>
        <div class="card-type">${this._getCardTypeText(card.type)}</div>
      `;
      
      // 添加點擊事件
      cardElement.onclick = () => {
        if (!cardElement.classList.contains('disabled') && this.gameController.state.battle.isPlayerTurn) {
          this.gameController.triggerEvent('cardClicked', index);
        }
      };
      
      cardsContainer.appendChild(cardElement);
    });
  }
  
  /**
   * 更新效果
   */
  _updateEffects(container, source) {
    if (!container) return;
    
    // 清空現有效果
    container.innerHTML = '';
    
    // 篩選出對應來源的效果
    const effects = this.gameController.state.battle.activeEffects.filter(effect => effect.source === source);
    
    // 添加效果圖標
    effects.forEach(effect => {
      const effectElement = document.createElement('div');
      effectElement.className = `effect-icon ${effect.type}`;
      
      // 添加效果值
      effectElement.textContent = effect.value;
      
      // 添加持續時間
      if (effect.duration > 0) {
        const durationElement = document.createElement('div');
        durationElement.className = 'effect-duration';
        durationElement.textContent = effect.duration;
        effectElement.appendChild(durationElement);
      }
      
      container.appendChild(effectElement);
    });
  }
  
  /**
   * 獲取卡牌類型文本
   */
  _getCardTypeText(type) {
    switch (type) {
      case 'attack':
        return '攻擊';
      case 'defense':
        return '防禦';
      case 'skill':
        return '技能';
      case 'item':
        return '物品';
      default:
        return type;
    }
  }
  
  /**
   * 顯示設置模態框
   */
  _showSettingsModal() {
    // 創建模態框
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    modal.innerHTML = `
      <div class="modal-content">
        <h3>設置</h3>
        <div class="settings-container">
          <div class="setting-item">
            <label for="music-volume">音樂音量</label>
            <input type="range" id="music-volume" min="0" max="1" step="0.1" value="${this.gameController.state.settings.musicVolume}">
          </div>
          <div class="setting-item">
            <label for="sound-volume">音效音量</label>
            <input type="range" id="sound-volume" min="0" max="1" step="0.1" value="${this.gameController.state.settings.soundVolume}">
          </div>
          <div class="setting-item">
            <label for="difficulty">難度</label>
            <select id="difficulty">
              <option value="easy" ${this.gameController.state.settings.difficulty === 'easy' ? 'selected' : ''}>簡單</option>
              <option value="normal" ${this.gameController.state.settings.difficulty === 'normal' ? 'selected' : ''}>普通</option>
              <option value="hard" ${this.gameController.state.settings.difficulty === 'hard' ? 'selected' : ''}>困難</option>
            </select>
          </div>
        </div>
        <div class="modal-buttons">
          <button id="save-settings-btn">保存</button>
          <button id="close-modal-btn">取消</button>
        </div>
      </div>
    `;
    
    // 添加到頁面
    document.body.appendChild(modal);
    
    // 添加事件監聽器
    const saveSettingsBtn = modal.querySelector('#save-settings-btn');
    const closeModalBtn = modal.querySelector('#close-modal-btn');
    
    if (saveSettingsBtn) {
      saveSettingsBtn.onclick = () => {
        // 獲取設置值
        const musicVolume = parseFloat(modal.querySelector('#music-volume').value);
        const soundVolume = parseFloat(modal.querySelector('#sound-volume').value);
        const difficulty = modal.querySelector('#difficulty').value;
        
        // 更新設置
        this.gameController.state.settings.musicVolume = musicVolume;
        this.gameController.state.settings.soundVolume = soundVolume;
        this.gameController.state.settings.difficulty = difficulty;
        
        // 應用設置
        this.gameController.soundManager.setMusicVolume(musicVolume);
        this.gameController.soundManager.setSoundVolume(soundVolume);
        
        // 關閉模態框
        document.body.removeChild(modal);
      };
    }
    
    if (closeModalBtn) {
      closeModalBtn.onclick = () => {
        // 關閉模態框
        document.body.removeChild(modal);
      };
    }
  }
  
  /**
   * 顯示提示消息
   */
  showToast(message, duration = 3000) {
    // 清除現有提示
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
      const existingToast = document.querySelector('.toast');
      if (existingToast) {
        document.body.removeChild(existingToast);
      }
    }
    
    // 創建提示元素
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    // 添加到頁面
    document.body.appendChild(toast);
    
    // 設置自動消失
    this.toastTimeout = setTimeout(() => {
      document.body.removeChild(toast);
      this.toastTimeout = null;
    }, duration);
  }
}
