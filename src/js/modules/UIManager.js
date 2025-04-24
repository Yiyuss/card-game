/**
 * UI管理器
 * 負責處理所有與用戶界面相關的操作
 */
export class UIManager {
    constructor(gameController) {
      this.gameController = gameController;
      this.screens = {};
      this.activeScreen = null;
      this.toastTimeout = null;
      this.modalTimeout = null;
    }
  
    /**
     * 初始化UI管理器
     */
    init() {
      console.log('初始化UI管理器...');
      
      // 創建主要屏幕
      this._createMainMenu();
      this._createLevelSelect();
      this._createBattleScreen();
      this._createGameOverScreen();
      
      // 創建通用UI元素
      this._createToast();
      this._createModal();
      
      console.log('UI管理器初始化完成');
    }
    
    /**
     * 顯示指定屏幕
     */
    showScreen(screenName) {
      if (!this.screens[screenName]) {
        console.error(`屏幕 ${screenName} 不存在`);
        return;
      }
      
      // 隱藏當前屏幕
      if (this.activeScreen) {
        this.activeScreen.style.display = 'none';
      }
      
      // 顯示新屏幕
      this.screens[screenName].style.display = 'block';
      this.activeScreen = this.screens[screenName];
      
      // 根據屏幕類型執行特定初始化
      switch (screenName) {
        case 'mainMenu':
          this._initMainMenu();
          break;
        case 'levelSelect':
          this._initLevelSelect();
          break;
        case 'battle':
          this._initBattleScreen();
          break;
        case 'gameOver':
          this._initGameOverScreen();
          break;
      }
      
      console.log(`顯示屏幕: ${screenName}`);
    }
    
    /**
     * 更新戰鬥UI
     */
    updateBattleUI() {
      if (!this.screens.battle) return;
      
      const { player, enemy, cards, battle } = this.gameController.state;
      
      // 更新玩家信息
      const playerHealthEl = document.getElementById('player-health');
      const playerManaEl = document.getElementById('player-mana');
      if (playerHealthEl) playerHealthEl.textContent = `生命: ${player.health}/${player.maxHealth}`;
      if (playerManaEl) playerManaEl.textContent = `魔力: ${player.mana}/${player.maxMana}`;
      
      // 更新敵人信息
      const enemyHealthEl = document.getElementById('enemy-health');
      const enemyNameEl = document.getElementById('enemy-name');
      if (enemyHealthEl) enemyHealthEl.textContent = `生命: ${enemy.health}/${enemy.maxHealth}`;
      if (enemyNameEl) enemyNameEl.textContent = enemy.name;
      
      // 更新手牌
      this._updateHandCards();
      
      // 更新回合信息
      const turnInfoEl = document.getElementById('turn-info');
      if (turnInfoEl) {
        turnInfoEl.textContent = battle.isPlayerTurn ? '你的回合' : '敵人回合';
        turnInfoEl.className = battle.isPlayerTurn ? 'player-turn' : 'enemy-turn';
      }
      
      // 更新效果區域
      this._updateEffectsArea();
      
      // 更新牌庫和棄牌堆信息
      const deckCountEl = document.getElementById('deck-count');
      const discardCountEl = document.getElementById('discard-count');
      if (deckCountEl) deckCountEl.textContent = `牌庫: ${cards.deck.length}`;
      if (discardCountEl) discardCountEl.textContent = `棄牌堆: ${cards.discardPile.length}`;
    }
    
    /**
     * 顯示提示信息
     */
    showToast(message, duration = 3000) {
      const toastEl = document.getElementById('toast');
      if (!toastEl) return;
      
      // 清除之前的計時器
      if (this.toastTimeout) {
        clearTimeout(this.toastTimeout);
      }
      
      // 設置消息並顯示
      const toastMessageEl = document.getElementById('toast-message');
      if (toastMessageEl) toastMessageEl.textContent = message;
      
      toastEl.classList.add('show');
      
      // 設置自動隱藏
      this.toastTimeout = setTimeout(() => {
        toastEl.classList.remove('show');
      }, duration);
    }
    
    /**
     * 顯示模態框
     */
    showModal(title, content, buttons) {
      const modalEl = document.getElementById('modal');
      if (!modalEl) return;
      
      // 設置標題和內容
      const modalTitleEl = document.getElementById('modal-title');
      const modalContentEl = document.getElementById('modal-content');
      const modalButtonsEl = document.getElementById('modal-buttons');
      
      if (modalTitleEl) modalTitleEl.textContent = title;
      if (modalContentEl) modalContentEl.textContent = content;
      
      // 清空並添加按鈕
      if (modalButtonsEl) {
        modalButtonsEl.innerHTML = '';
        
        buttons.forEach(button => {
          const buttonEl = document.createElement('button');
          buttonEl.textContent = button.text;
          buttonEl.onclick = () => {
            this.hideModal();
            if (button.callback) button.callback();
          };
          modalButtonsEl.appendChild(buttonEl);
        });
      }
      
      // 顯示模態框
      modalEl.style.display = 'flex';
    }
    
    /**
     * 隱藏模態框
     */
    hideModal() {
      const modalEl = document.getElementById('modal');
      if (modalEl) modalEl.style.display = 'none';
    }
    
    /**
     * 創建主菜單屏幕
     */
    _createMainMenu() {
      const mainMenu = document.createElement('div');
      mainMenu.id = 'main-menu';
      mainMenu.className = 'screen';
      mainMenu.style.display = 'none';
      
      // 標題
      const title = document.createElement('h1');
      title.textContent = '卡牌遊戲';
      mainMenu.appendChild(title);
      
      // 按鈕容器
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'button-container';
      
      // 新遊戲按鈕
      const newGameBtn = document.createElement('button');
      newGameBtn.textContent = '新遊戲';
      newGameBtn.onclick = () => this.gameController.triggerEvent('newGameClicked');
      buttonContainer.appendChild(newGameBtn);
      
      // 載入遊戲按鈕
      const loadGameBtn = document.createElement('button');
      loadGameBtn.textContent = '載入遊戲';
      loadGameBtn.onclick = () => this.gameController.triggerEvent('loadGameClicked');
      buttonContainer.appendChild(loadGameBtn);
      
      // 繼續遊戲按鈕
      const continueBtn = document.createElement('button');
      continueBtn.textContent = '繼續遊戲';
      continueBtn.onclick = () => this.gameController.triggerEvent('continueClicked');
      buttonContainer.appendChild(continueBtn);
      
      // 設置按鈕
      const settingsBtn = document.createElement('button');
      settingsBtn.textContent = '設置';
      settingsBtn.onclick = () => this.gameController.triggerEvent('settingsClicked');
      buttonContainer.appendChild(settingsBtn);
      
      mainMenu.appendChild(buttonContainer);
      
      // 添加到文檔
      document.body.appendChild(mainMenu);
      this.screens.mainMenu = mainMenu;
    }
    
    /**
     * 創建關卡選擇屏幕
     */
    _createLevelSelect() {
      const levelSelect = document.createElement('div');
      levelSelect.id = 'level-select';
      levelSelect.className = 'screen';
      levelSelect.style.display = 'none';
      
      // 標題
      const title = document.createElement('h1');
      title.textContent = '選擇關卡';
      levelSelect.appendChild(title);
      
      // 關卡容器
      const levelContainer = document.createElement('div');
      levelContainer.className = 'level-container';
      levelSelect.appendChild(levelContainer);
      
      // 返回按鈕
      const backBtn = document.createElement('button');
      backBtn.textContent = '返回';
      backBtn.className = 'back-button';
      backBtn.onclick = () => this.gameController.triggerEvent('backToMenuClicked');
      levelSelect.appendChild(backBtn);
      
      // 添加到文檔
      document.body.appendChild(levelSelect);
      this.screens.levelSelect = levelSelect;
    }
    
    /**
     * 創建戰鬥屏幕
     */
    _createBattleScreen() {
      const battle = document.createElement('div');
      battle.id = 'battle';
      battle.className = 'screen';
      battle.style.display = 'none';
      
      // 敵人區域
      const enemyArea = document.createElement('div');
      enemyArea.className = 'enemy-area';
      
      const enemyInfo = document.createElement('div');
      enemyInfo.className = 'enemy-info';
      
      const enemyName = document.createElement('div');
      enemyName.id = 'enemy-name';
      enemyInfo.appendChild(enemyName);
      
      const enemyHealth = document.createElement('div');
      enemyHealth.id = 'enemy-health';
      enemyInfo.appendChild(enemyHealth);
      
      enemyArea.appendChild(enemyInfo);
      
      const enemyImage = document.createElement('div');
      enemyImage.id = 'enemy-image';
      enemyArea.appendChild(enemyImage);
      
      battle.appendChild(enemyArea);
      
      // 戰鬥區域
      const battleArea = document.createElement('div');
      battleArea.className = 'battle-area';
      
      // 回合信息
      const turnInfo = document.createElement('div');
      turnInfo.id = 'turn-info';
      battleArea.appendChild(turnInfo);
      
      // 效果區域
      const effectsArea = document.createElement('div');
      effectsArea.id = 'effects-area';
      battleArea.appendChild(effectsArea);
      
      // 牌庫和棄牌堆信息
      const deckInfo = document.createElement('div');
      deckInfo.className = 'deck-info';
      
      const deckCount = document.createElement('div');
      deckCount.id = 'deck-count';
      deckInfo.appendChild(deckCount);
      
      const discardCount = document.createElement('div');
      discardCount.id = 'discard-count';
      deckInfo.appendChild(discardCount);
      
      battleArea.appendChild(deckInfo);
      
      // 結束回合按鈕
      const endTurnBtn = document.createElement('button');
      endTurnBtn.id = 'end-turn-btn';
      endTurnBtn.textContent = '結束回合';
      endTurnBtn.onclick = () => this.gameController.triggerEvent('endTurnClicked');
      battleArea.appendChild(endTurnBtn);
      
      battle.appendChild(battleArea);
      
      // 玩家區域
      const playerArea = document.createElement('div');
      playerArea.className = 'player-area';
      
      // 玩家信息
      const playerInfo = document.createElement('div');
      playerInfo.className = 'player-info';
      
      const playerHealth = document.createElement('div');
      playerHealth.id = 'player-health';
      playerInfo.appendChild(playerHealth);
      
      const playerMana = document.createElement('div');
      playerMana.id = 'player-mana';
      playerInfo.appendChild(playerMana);
      
      playerArea.appendChild(playerInfo);
      
      // 手牌區域
      const handArea = document.createElement('div');
      handArea.id = 'hand-area';
      playerArea.appendChild(handArea);
      
      battle.appendChild(playerArea);
      
      // 添加到文檔
      document.body.appendChild(battle);
      this.screens.battle = battle;
    }
    
    /**
     * 創建遊戲結束屏幕
     */
    _createGameOverScreen() {
      const gameOver = document.createElement('div');
      gameOver.id = 'game-over';
      gameOver.className = 'screen';
      gameOver.style.display = 'none';
      
      // 結果標題
      const resultTitle = document.createElement('h1');
      resultTitle.id = 'result-title';
      gameOver.appendChild(resultTitle);
      
      // 結果信息
      const resultInfo = document.createElement('div');
      resultInfo.id = 'result-info';
      gameOver.appendChild(resultInfo);
      
      // 獎勵區域
      const rewardsArea = document.createElement('div');
      rewardsArea.id = 'rewards-area';
      rewardsArea.style.display = 'none';
      gameOver.appendChild(rewardsArea);
      
      // 按鈕容器
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'button-container';
      
      // 重新開始按鈕
      const restartBtn = document.createElement('button');
      restartBtn.textContent = '重新開始';
      restartBtn.onclick = () => this.gameController.triggerEvent('restartClicked');
      buttonContainer.appendChild(restartBtn);
      
      // 返回主菜單按鈕
      const mainMenuBtn = document.createElement('button');
      mainMenuBtn.textContent = '返回主菜單';
      mainMenuBtn.onclick = () => this.gameController.triggerEvent('backToMenuClicked');
      buttonContainer.appendChild(mainMenuBtn);
      
      gameOver.appendChild(buttonContainer);
      
      // 添加到文檔
      document.body.appendChild(gameOver);
      this.screens.gameOver = gameOver;
    }
    
    /**
     * 創建提示框
     */
    _createToast() {
      const toast = document.createElement('div');
      toast.id = 'toast';
      
      const toastMessage = document.createElement('div');
      toastMessage.id = 'toast-message';
      toast.appendChild(toastMessage);
      
      document.body.appendChild(toast);
    }
    
    /**
     * 創建模態框
     */
    _createModal() {
      const modal = document.createElement('div');
      modal.id = 'modal';
      modal.style.display = 'none';
      
      const modalContent = document.createElement('div');
      modalContent.className = 'modal-content';
      
      const modalTitle = document.createElement('h2');
      modalTitle.id = 'modal-title';
      modalContent.appendChild(modalTitle);
      
      const modalBody = document.createElement('div');
      modalBody.id = 'modal-content';
      modalContent.appendChild(modalBody);
      
      const modalButtons = document.createElement('div');
      modalButtons.id = 'modal-buttons';
      modalContent.appendChild(modalButtons);
      
      modal.appendChild(modalContent);
      document.body.appendChild(modal);
    }
    
    /**
     * 初始化主菜單
     */
    _initMainMenu() {
      // 檢查是否有存檔
      const hasSave = this.gameController.saveManager.loadGame() !== null;
      
      // 獲取繼續遊戲按鈕
      const continueBtn = document.querySelector('#main-menu button:nth-child(3)');
      if (continueBtn) {
        continueBtn.disabled = !hasSave;
        continueBtn.style.opacity = hasSave ? '1' : '0.5';
      }
      
      // 獲取載入遊戲按鈕
      const loadGameBtn = document.querySelector('#main-menu button:nth-child(2)');
      if (loadGameBtn) {
        loadGameBtn.disabled = !hasSave;
        loadGameBtn.style.opacity = hasSave ? '1' : '0.5';
      }
    }
    
    /**
     * 初始化關卡選擇
     */
    _initLevelSelect() {
      const levelContainer = document.querySelector('#level-select .level-container');
      if (!levelContainer) return;
      
      // 清空關卡容器
      levelContainer.innerHTML = '';
      
      // 獲取已解鎖關卡
      const unlockedLevels = this.gameController.state.progress.unlockedLevels;
      
      // 獲取所有關卡
      const levels = this.gameController.resourceManager.getLevels();
      
      // 創建關卡按鈕
      levels.forEach(level => {
        const isUnlocked = unlockedLevels.includes(level.id);
        
        const levelBtn = document.createElement('div');
        levelBtn.className = `level-btn ${isUnlocked ? 'unlocked' : 'locked'}`;
        
        const levelName = document.createElement('div');
        levelName.className = 'level-name';
        levelName.textContent = level.name;
        levelBtn.appendChild(levelName);
        
        const levelDifficulty = document.createElement('div');
        levelDifficulty.className = 'level-difficulty';
        levelDifficulty.textContent = `難度: ${level.difficulty}`;
        levelBtn.appendChild(levelDifficulty);
        
        if (isUnlocked) {
          levelBtn.onclick = () => this.gameController.triggerEvent('levelSelected', level.id);
        } else {
          const lockIcon = document.createElement('div');
          lockIcon.className = 'lock-icon';
          levelBtn.appendChild(lockIcon);
        }
        
        levelContainer.appendChild(levelBtn);
      });
    }
    
    /**
     * 初始化戰鬥屏幕
     */
    _initBattleScreen() {
      // 更新敵人圖像
      const enemyImage = document.getElementById('enemy-image');
      if (enemyImage) {
        enemyImage.style.backgroundImage = `url(${this.gameController.state.enemy.image})`;
      }
      
      // 清空手牌區域
      const handArea = document.getElementById('hand-area');
      if (handArea) {
        handArea.innerHTML = '';
      }
      
      // 清空效果區域
      const effectsArea = document.getElementById('effects-area');
      if (effectsArea) {
        effectsArea.innerHTML = '';
      }
      
      // 更新UI
      this.updateBattleUI();
    }
    
    /**
     * 初始化遊戲結束屏幕
     */
    _initGameOverScreen() {
      const { battle } = this.gameController.state;
      
      // 設置結果標題
      const resultTitle = document.getElementById('result-title');
      if (resultTitle) {
        resultTitle.textContent = battle.isVictory ? '勝利！' : '失敗';
        resultTitle.className = battle.isVictory ? 'victory' : 'defeat';
      }
      
      // 設置結果信息
      const resultInfo = document.getElementById('result-info');
      if (resultInfo) {
        if (battle.isVictory) {
          // 獲取關卡信息
          const level = this.gameController.resourceManager.getLevelByEnemyId(this.gameController.state.enemy.id);
          if (level) {
            resultInfo.innerHTML = `
              <p>你擊敗了 ${this.gameController.state.enemy.name}！</p>
              <p>獲得 ${level.rewards.gold} 金幣</p>
              <p>獲得 ${level.rewards.experience} 經驗值</p>
            `;
            
            // 顯示獎勵區域
            const rewardsArea = document.getElementById('rewards-area');
            if (rewardsArea && level.rewards.cards && level.rewards.cards.length > 0) {
              rewardsArea.style.display = 'block';
              rewardsArea.innerHTML = '<h2>獲得卡牌</h2>';
              
              const cardContainer = document.createElement('div');
              cardContainer.className = 'card-container';
              
              level.rewards.cards.forEach(cardId => {
                const card = this.gameController.resourceManager.getCardById(cardId);
                if (card) {
                  const cardEl = this._createCardElement(card);
                  cardContainer.appendChild(cardEl);
                }
              });
              
              rewardsArea.appendChild(cardContainer);
            }
          } else {
            resultInfo.textContent = '你獲得了勝利！';
          }
        } else {
          resultInfo.textContent = '你被擊敗了，再接再厲！';
        }
      }
    }
    
    /**
     * 更新手牌
     */
    _updateHandCards() {
      const handArea = document.getElementById('hand-area');
      if (!handArea) return;
      
      // 清空手牌區域
      handArea.innerHTML = '';
      
      // 添加卡牌
      this.gameController.state.cards.hand.forEach((card, index) => {
        const cardEl = this._createCardElement(card);
        
        // 添加點擊事件
        cardEl.onclick = () => {
          if (this.gameController.state.battle.isPlayerTurn && !this.gameController.state.battle.isGameOver) {
            this.gameController.triggerEvent('cardClicked', index);
          }
        };
        
        // 如果魔力不足，禁用卡牌
        if (card.manaCost > this.gameController.state.player.mana) {
          cardEl.classList.add('disabled');
        }
        
        handArea.appendChild(cardEl);
      });
    }
    
    /**
     * 更新效果區域
     */
    _updateEffectsArea() {
      const effectsArea = document.getElementById('effects-area');
      if (!effectsArea) return;
      
      // 清空效果區域
      effectsArea.innerHTML = '';
      
      // 添加效果
      this.gameController.state.battle.activeEffects.forEach(effect => {
        const effectEl = document.createElement('div');
        effectEl.className = `effect ${effect.type}`;
        
        const effectIcon = document.createElement('div');
        effectIcon.className = 'effect-icon';
        effectEl.appendChild(effectIcon);
        
        const effectInfo = document.createElement('div');
        effectInfo.className = 'effect-info';
        effectInfo.textContent = `${effect.value} (${effect.duration}回合)`;
        effectEl.appendChild(effectInfo);
        
        // 添加提示信息
        effectEl.title = this._getEffectDescription(effect);
        
        effectsArea.appendChild(effectEl);
      });
    }
    
    /**
     * 創建卡牌元素
     */
    _createCardElement(card) {
      const cardEl = document.createElement('div');
      cardEl.className = `card ${card.type}`;
      
      const cardName = document.createElement('div');
      cardName.className = 'card-name';
      cardName.textContent = card.name;
      cardEl.appendChild(cardName);
      
      const cardCost = document.createElement('div');
      cardCost.className = 'card-cost';
      cardCost.textContent = card.manaCost;
      cardEl.appendChild(cardCost);
      
      const cardImage = document.createElement('div');
      cardImage.className = 'card-image';
      cardEl.appendChild(cardImage);
      
      const cardDescription = document.createElement('div');
      cardDescription.className = 'card-description';
      cardDescription.textContent = card.description || '';
      cardEl.appendChild(cardDescription);
      
      const cardValue = document.createElement('div');
      cardValue.className = 'card-value';
      
      if (card.type === 'attack') {
        cardValue.textContent = `攻擊: ${card.value}`;
      } else if (card.type === 'defense') {
        cardValue.textContent = `防禦: ${card.value}`;
      }
      
      cardEl.appendChild(cardValue);
      
      return cardEl;
    }
    
    /**
     * 獲取效果描述
     */
    _getEffectDescription(effect) {
      switch (effect.type) {
        case 'shield':
          return `護盾: 抵擋 ${effect.value} 點傷害`;
        case 'poison':
          return `中毒: 每回合受到 ${effect.value} 點傷害`;
        case 'weakness':
          return `虛弱: 攻擊力降低 ${effect.value} 點`;
        case 'strength':
          return `力量: 攻擊力提高 ${effect.value} 點`;
        default:
          return `${effect.type}: ${effect.value}`;
      }
    }
  }