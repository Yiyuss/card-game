/**
 * 卡牌遊戲控制中心
 * 負責協調所有模組的運作和通信
 */

// 導入模組
import { UIManager } from './js/modules/UIManager.js';
import { CardManager } from './js/modules/CardManager.js';
import { BattleManager } from './js/modules/BattleManager.js';
import { PlayerManager } from './js/modules/PlayerManager.js';
import { EnemyManager } from './js/modules/EnemyManager.js';
import { EffectManager } from './js/modules/EffectManager.js';
import { SoundManager } from './js/modules/SoundManager.js';
import { AnimationManager } from './js/modules/AnimationManager.js';
import { SaveManager } from './js/modules/SaveManager.js';
import { AchievementManager } from './js/modules/AchievementManager.js';
import { ResourceManager } from './js/modules/ResourceManager.js';

// 遊戲狀態
const GameState = {
  // 當前屏幕
  currentScreen: 'mainMenu', // 'mainMenu', 'battle', 'gameOver'
  
  // 玩家狀態
  player: {
    health: 100,
    maxHealth: 100,
    mana: 3,
    maxMana: 3,
    gold: 0,
    level: 1,
    experience: 0
  },
  
  // 敵人狀態
  enemy: {
    id: '',
    name: '',
    health: 0,
    maxHealth: 0,
    attack: 0,
    image: ''
  },
  
  // 卡牌狀態
  cards: {
    deck: [],
    hand: [],
    discardPile: []
  },
  
  // 戰鬥狀態
  battle: {
    isPlayerTurn: true,
    activeEffects: [],
    isGameOver: false,
    isVictory: false
  },
  
  // 遊戲進度
  progress: {
    unlockedLevels: [1],
    ownedCards: [],
    equippedCards: [],
    achievements: [],
    stats: {
      totalDamageDealt: 0,
      totalHealing: 0,
      totalGoldEarned: 0,
      totalBattlesWon: 0,
      totalCardsPlayed: 0
    }
  },
  
  // 設置
  settings: {
    musicVolume: 0.5,
    soundVolume: 0.5,
    difficulty: 'normal'
  }
};

/**
 * 遊戲控制器
 */
class GameController {
  constructor() {
    // 初始化所有管理器
    this.uiManager = new UIManager(this);
    this.cardManager = new CardManager(this);
    this.battleManager = new BattleManager(this);
    this.playerManager = new PlayerManager(this);
    this.enemyManager = new EnemyManager(this);
    this.effectManager = new EffectManager(this);
    this.soundManager = new SoundManager(this);
    this.animationManager = new AnimationManager(this);
    this.saveManager = new SaveManager(this);
    this.achievementManager = new AchievementManager(this);
    this.resourceManager = new ResourceManager(this);
    
    // 遊戲狀態
    this.state = { ...GameState };
    
    // 事件監聽器
    this.eventListeners = {};
  }
  
  /**
   * 初始化遊戲
   */
  init() {
    console.log('初始化遊戲...');
    
    // 加載資源
    this.resourceManager.loadResources(() => {
      // 初始化UI
      this.uiManager.init();
      
      // 初始化音效
      this.soundManager.init();
      
      // 加載存檔
      const savedGame = this.saveManager.loadGame();
      if (savedGame) {
        this.state.progress = savedGame;
      }
      
      // 顯示主菜單
      this.showScreen('mainMenu');
      
      // 播放背景音樂
      this.soundManager.playBGM('menu');
      
      console.log('遊戲初始化完成');
    });
    
    // 設置全局事件監聽
    this._setupEventListeners();
  }
  
  /**
   * 設置事件監聽器
   */
  _setupEventListeners() {
    // 卡牌點擊事件
    this.addEventListener('cardClicked', (cardIndex) => {
      this.playCard(cardIndex);
    });
    
    // 結束回合按鈕事件
    this.addEventListener('endTurnClicked', () => {
      this.endTurn();
    });
    
    // 開始新遊戲事件
    this.addEventListener('newGameClicked', () => {
      this.startNewGame();
    });
    
    // 載入遊戲事件
    this.addEventListener('loadGameClicked', () => {
      this.loadGame();
    });
    
    // 選擇關卡事件
    this.addEventListener('levelSelected', (levelId) => {
      this.startBattle(levelId);
    });
    
    // 返回主菜單事件
    this.addEventListener('backToMenuClicked', () => {
      this.showScreen('mainMenu');
    });
    
    // 繼續遊戲事件
    this.addEventListener('continueClicked', () => {
      this.showScreen('levelSelect');
    });
  }
  
  /**
   * 添加事件監聽器
   */
  addEventListener(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }
  
  /**
   * 觸發事件
   */
  triggerEvent(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }
  
  /**
   * 顯示指定屏幕
   */
  showScreen(screenName) {
    this.state.currentScreen = screenName;
    this.uiManager.showScreen(screenName);
    
    // 根據屏幕播放不同的背景音樂
    switch (screenName) {
      case 'mainMenu':
        this.soundManager.playBGM('menu');
        break;
      case 'battle':
        this.soundManager.playBGM('battle');
        break;
      case 'gameOver':
        if (this.state.battle.isVictory) {
          this.soundManager.playBGM('victory');
        } else {
          this.soundManager.playBGM('defeat');
        }
        break;
    }
    
    // 播放屏幕切換動畫
    this.animationManager.playScreenTransition();
  }
  
  /**
   * 開始新遊戲
   */
  startNewGame() {
    console.log('開始新遊戲');
    
    // 重置玩家狀態
    this.state.player = {
      health: 100,
      maxHealth: 100,
      mana: 3,
      maxMana: 3,
      gold: 0,
      level: 1,
      experience: 0
    };
    
    // 重置卡牌狀態
    this.state.cards = {
      deck: [],
      hand: [],
      discardPile: []
    };
    
    // 重置戰鬥狀態
    this.state.battle = {
      isPlayerTurn: true,
      activeEffects: [],
      isGameOver: false,
      isVictory: false
    };
    
    // 保留遊戲進度和設置
    this.saveManager.saveGame(this.state.progress);
    
    // 顯示關卡選擇屏幕
    this.showScreen('levelSelect');
  }
  
  /**
   * 載入遊戲
   */
  loadGame() {
    console.log('載入遊戲');
    
    const savedGame = this.saveManager.loadGame();
    if (savedGame) {
      this.state.progress = savedGame;
      
      // 重置戰鬥狀態
      this.state.player = {
        health: 100,
        maxHealth: 100,
        mana: 3,
        maxMana: 3,
        gold: savedGame.stats.totalGoldEarned || 0,
        level: savedGame.stats.level || 1,
        experience: savedGame.stats.experience || 0
      };
      
      // 顯示關卡選擇屏幕
      this.showScreen('levelSelect');
    } else {
      this.uiManager.showToast('沒有找到存檔');
    }
  }
  
  /**
   * 開始戰鬥
   */
  startBattle(levelId) {
    console.log(`開始戰鬥，關卡ID: ${levelId}`);
    
    // 獲取關卡信息
    const level = this.resourceManager.getLevelById(levelId);
    if (!level) return;
    
    // 獲取敵人信息
    const enemyId = level.enemies[0];
    const enemy = this.resourceManager.getEnemyById(enemyId);
    if (!enemy) return;
    
    // 設置敵人
    this.state.enemy = {
      id: enemy.id,
      name: enemy.name,
      health: enemy.health,
      maxHealth: enemy.health,
      attack: enemy.attack,
      image: enemy.image
    };
    
    // 準備牌組
    this.state.cards.deck = [...this.state.progress.equippedCards];
    
    // 洗牌
    this.cardManager.shuffleDeck();
    
    // 抽初始手牌
    this.state.cards.hand = [];
    for (let i = 0; i < 5; i++) {
      if (this.state.cards.deck.length > 0) {
        const card = this.state.cards.deck.pop();
        if (card) {
          this.state.cards.hand.push(card);
        }
      }
    }
    
    // 設置戰鬥狀態
    this.state.battle.isPlayerTurn = true;
    this.state.battle.isGameOver = false;
    this.state.battle.isVictory = false;
    this.state.battle.activeEffects = [];
    
    // 重置玩家狀態
    this.state.player.health = this.state.player.maxHealth;
    this.state.player.mana = this.state.player.maxMana;
    
    // 顯示戰鬥屏幕
    this.showScreen('battle');
    
    // 播放戰鬥開始音效
    this.soundManager.play('battle-start');
    
    // 更新UI
    this.uiManager.updateBattleUI();
  }
  
  /**
   * 打出卡牌
   */
  playCard(cardIndex) {
    if (!this.state.battle.isPlayerTurn || this.state.battle.isGameOver) return;
    
    if (cardIndex < 0 || cardIndex >= this.state.cards.hand.length) return;
    
    const card = this.state.cards.hand[cardIndex];
    
    // 檢查魔力是否足夠
    if (this.state.player.mana < card.manaCost) {
      this.uiManager.showToast('魔力不足');
      return;
    }
    
    console.log(`打出卡牌: ${card.name}`);
    
    // 消耗魔力
    this.state.player.mana -= card.manaCost;
    
    // 從手牌中移除
    this.state.cards.hand.splice(cardIndex, 1);
    
    // 添加到棄牌堆
    this.state.cards.discardPile.push(card);
    
    // 應用卡牌效果
    this.cardManager.applyCardEffect(card);
    
    // 更新統計數據
    this.state.progress.stats.totalCardsPlayed += 1;
    
    // 檢查遊戲是否結束
    if (this.state.enemy.health <= 0) {
      this.endBattle(true);
      return;
    }
    
    // 如果手牌為空或魔力為0，自動結束回合
    if (this.state.cards.hand.length === 0 || this.state.player.mana === 0) {
      this.endTurn();
    }
    
    // 更新UI
    this.uiManager.updateBattleUI();
  }
  
  /**
   * 結束回合
   */
  endTurn() {
    if (!this.state.battle.isPlayerTurn || this.state.battle.isGameOver) return;
    
    console.log('結束回合');
    
    this.state.battle.isPlayerTurn = false;
    
    // 播放回合結束音效
    this.soundManager.play('turn-end');
    
    // 播放回合結束動畫
    this.animationManager.playTurnEndAnimation();
    
    // 更新UI
    this.uiManager.updateBattleUI();
    
    // 延遲執行敵人回合
    setTimeout(() => {
      this.enemyTurn();
    }, 1000);
  }
  
  /**
   * 敵人回合
   */
  enemyTurn() {
    console.log('敵人回合');
    
    // 敵人攻擊
    let enemyDamage = this.state.enemy.attack;
    
    // 檢查虛弱效果
    const weaknessEffect = this.state.battle.activeEffects.find(e => e.type === 'weakness' && e.source === 'player');
    if (weaknessEffect) {
      enemyDamage = Math.max(0, enemyDamage - weaknessEffect.value);
    }
    
    // 檢查護盾效果
    let remainingDamage = enemyDamage;
    const shieldEffects = this.state.battle.activeEffects.filter(e => e.type === 'shield' && e.source === 'player');
    
    for (const shield of shieldEffects) {
      if (remainingDamage <= 0) break;
      
      if (remainingDamage <= shield.value) {
        shield.value -= remainingDamage;
        remainingDamage = 0;
        
        if (shield.value <= 0) {
          this.state.battle.activeEffects = this.state.battle.activeEffects.filter(e => e.id !== shield.id);
        }
      } else {
        remainingDamage -= shield.value;
        this.state.battle.activeEffects = this.state.battle.activeEffects.filter(e => e.id !== shield.id);
      }
    }
    
    // 應用傷害
    if (remainingDamage > 0) {
      this.state.player.health = Math.max(0, this.state.player.health - remainingDamage);
      
      // 播放受傷音效
      this.soundManager.play('player-hit');
      
      // 播放受傷動畫
      this.animationManager.playPlayerHitAnimation();
    }
    
    // 應用持續效果
    this.effectManager.applyActiveEffects();
    
    // 檢查玩家是否失敗
    if (this.state.player.health <= 0) {
      this.endBattle(false);
      return;
    }
    
    // 開始新回合
    this.startNewTurn();
  }
  
  /**
   * 開始新回合
   */
  startNewTurn() {
    console.log('開始新回合');
    
    this.state.battle.isPlayerTurn = true;
    this.state.player.mana = this.state.player.maxMana;
    
    // 抽牌
    while (this.state.cards.hand.length < 5) {
      if (this.state.cards.deck.length === 0 && this.state.cards.discardPile.length === 0) break;
      
      if (this.state.cards.deck.length === 0) {
        // 洗牌
        this.state.cards.deck = [...this.state.cards.discardPile];
        this.state.cards.discardPile = [];
        this.cardManager.shuffleDeck();
        
        this.uiManager.showToast('棄牌堆已洗入牌庫');
      }
      
      const card = this.state.cards.deck.pop();
      if (card) {
        this.state.cards.hand.push(card);
        
        // 播放抽牌音效
        this.soundManager.play('card-draw');
        
        // 播放抽牌動畫
        this.animationManager.playDrawAnimation();
      }
    }
    
    // 播放回合開始音效
    this.soundManager.play('turn-start');
    
    // 更新UI
    this.uiManager.updateBattleUI();
  }
  
  /**
   * 結束戰鬥
   */
  endBattle(isVictory) {
    console.log(`戰鬥結束，勝利: ${isVictory}`);
    
    this.state.battle.isGameOver = true;
    this.state.battle.isVictory = isVictory;
    
    if (isVictory) {
      // 獲得獎勵
      const level = this.resourceManager.getLevelByEnemyId(this.state.enemy.id);
      if (level) {
        this.giveRewards(level);
      }
      
      // 播放勝利音效
      this.soundManager.play('victory');
      
      // 播放勝利動畫
      this.animationManager.playVictoryAnimation();
      
      // 保存遊戲
      this.saveManager.saveGame(this.state.progress);
      
      // 檢查成就
      this.achievementManager.checkAchievements();
    } else {
      // 播放失敗音效
      this.soundManager.play('defeat');
      
      // 播放失敗動畫
      this.animationManager.playDefeatAnimation();
    }
    
    // 延遲顯示結果屏幕
    setTimeout(() => {
      this.showScreen('gameOver');
    }, 1500);
  }
  
  /**
   * 給予獎勵
   */
  giveRewards(level) {
    const goldReward = level.rewards.gold;
    const expReward = level.rewards.experience;
    
    // 獲得金幣
    this.state.player.gold += goldReward;
    this.state.progress.stats.totalGoldEarned += goldReward;
    
    // 獲得經驗值
    this.state.player.experience += expReward;
    
    // 檢查是否升級
    const expNeeded = this.state.player.level * 100;
    if (this.state.player.experience >= expNeeded) {
      this.state.player.level += 1;
      this.state.player.experience -= expNeeded;
      this.state.player.maxHealth += 10;
      this.state.player.maxMana += 1;
      
      // 播放升級音效
      this.soundManager.play('level-up');
      
      this.uiManager.showToast('升級！生命值和魔力上限提升');
    }
    
    // 解鎖下一關
    if (level.id < this.resourceManager.getLevelsCount() && !this.state.progress.unlockedLevels.includes(level.id + 1)) {
      this.state.progress.unlockedLevels.push(level.id + 1);
      
      const nextLevel = this.resourceManager.getLevelById(level.id + 1);
      if (nextLevel) {
        this.uiManager.showToast(`解鎖新關卡：${nextLevel.name}`);
      }
    }
    
    // 更新統計數據
    this.state.progress.stats.totalBattlesWon += 1;
    
    // 如果有卡牌獎勵
    if (level.rewards.cards && level.rewards.cards.length > 0) {
      const cardId = level.rewards.cards[0];
      const rewardCard = this.resourceManager.getCardById(cardId);
      if (rewardCard) {
        this.state.progress.ownedCards.push({ ...rewardCard });
        this.uiManager.showToast(`獲得新卡牌：${rewardCard.name}`);
      }
    }
  }
}

// 創建遊戲控制器實例
const gameController = new GameController();

// 當頁面加載完成後初始化遊戲
window.addEventListener('DOMContentLoaded', () => {
  gameController.init();
});

export default gameController;
