/**
 * 資源管理器
 * 負責加載和管理遊戲資源
 */
export class ResourceManager {
    constructor(gameController) {
      this.gameController = gameController;
      
      // 資源緩存
      this.resources = {
        cards: [],
        enemies: [],
        levels: [],
        sounds: {},
        images: {}
      };
      
      // 資源加載狀態
      this.loadingStatus = {
        isLoading: false,
        progress: 0,
        total: 0,
        loaded: 0,
        errors: []
      };
    }
    
    /**
     * 加載所有資源
     * @param {Function} callback - 加載完成後的回調函數
     */
    loadResources(callback) {
      console.log('開始加載資源...');
      
      this.loadingStatus.isLoading = true;
      this.loadingStatus.progress = 0;
      this.loadingStatus.total = 3; // 卡牌、敵人、關卡
      this.loadingStatus.loaded = 0;
      this.loadingStatus.errors = [];
      
      // 模擬資源加載
      this._loadCards(() => {
        this._updateLoadingProgress();
        
        this._loadEnemies(() => {
          this._updateLoadingProgress();
          
          this._loadLevels(() => {
            this._updateLoadingProgress();
            
            console.log('資源加載完成');
            this.loadingStatus.isLoading = false;
            
            if (callback) callback();
          });
        });
      });
    }
    
    /**
     * 更新加載進度
     */
    _updateLoadingProgress() {
      this.loadingStatus.loaded += 1;
      this.loadingStatus.progress = Math.floor((this.loadingStatus.loaded / this.loadingStatus.total) * 100);
      
      // 觸發進度更新事件
      this.gameController.triggerEvent('loadingProgressUpdated', this.loadingStatus);
    }
    
    /**
     * 加載卡牌資源
     * @param {Function} callback - 加載完成後的回調函數
     */
    _loadCards(callback) {
      console.log('加載卡牌資源...');
      
      // 在實際應用中，這裡應該從服務器或本地文件加載卡牌數據
      // 這裡使用模擬數據
      setTimeout(() => {
        this.resources.cards = [
          {
            id: 'card1',
            name: '打擊',
            description: '造成 6 點傷害',
            manaCost: 1,
            type: 'attack',
            rarity: 'common',
            effects: [
              { type: 'damage', value: 6, target: 'enemy' }
            ],
            image: 'strike.png'
          },
          {
            id: 'card2',
            name: '防禦',
            description: '獲得 5 點護盾',
            manaCost: 1,
            type: 'skill',
            rarity: 'common',
            effects: [
              { type: 'shield', value: 5, target: 'player' }
            ],
            image: 'defend.png'
          },
          {
            id: 'card3',
            name: '火球術',
            description: '造成 8 點傷害並施加 2 層燃燒',
            manaCost: 2,
            type: 'attack',
            rarity: 'uncommon',
            effects: [
              { type: 'damage', value: 8, target: 'enemy' },
              { type: 'burn', value: 2, duration: 2, target: 'enemy' }
            ],
            image: 'fireball.png'
          },
          {
            id: 'card4',
            name: '治療術',
            description: '恢復 8 點生命值',
            manaCost: 2,
            type: 'skill',
            rarity: 'uncommon',
            effects: [
              { type: 'heal', value: 8, target: 'player' }
            ],
            image: 'heal.png'
          },
          {
            id: 'card5',
            name: '毒刃',
            description: '造成 4 點傷害並施加 3 層中毒',
            manaCost: 1,
            type: 'attack',
            rarity: 'uncommon',
            effects: [
              { type: 'damage', value: 4, target: 'enemy' },
              { type: 'poison', value: 3, duration: 3, target: 'enemy' }
            ],
            image: 'poison-dagger.png'
          },
          {
            id: 'card6',
            name: '能量飲料',
            description: '獲得 1 點魔力',
            manaCost: 0,
            type: 'skill',
            rarity: 'uncommon',
            effects: [
              { type: 'mana', value: 1, target: 'player' }
            ],
            image: 'energy-potion.png'
          },
          {
            id: 'card7',
            name: '連擊',
            description: '造成 3 點傷害兩次',
            manaCost: 1,
            type: 'attack',
            rarity: 'common',
            effects: [
              { type: 'damage', value: 3, target: 'enemy', times: 2 }
            ],
            image: 'double-strike.png'
          },
          {
            id: 'card8',
            name: '虛弱詛咒',
            description: '敵人攻擊力降低 2 點，持續 2 回合',
            manaCost: 1,
            type: 'skill',
            rarity: 'uncommon',
            effects: [
              { type: 'weakness', value: 2, duration: 2, target: 'enemy' }
            ],
            image: 'weakness.png'
          },
          {
            id: 'card9',
            name: '狂暴',
            description: '獲得 2 點力量',
            manaCost: 1,
            type: 'power',
            rarity: 'uncommon',
            effects: [
              { type: 'strength', value: 2, target: 'player' }
            ],
            image: 'rage.png'
          },
          {
            id: 'card10',
            name: '終極打擊',
            description: '造成 20 點傷害',
            manaCost: 3,
            type: 'attack',
            rarity: 'rare',
            effects: [
              { type: 'damage', value: 20, target: 'enemy' }
            ],
            image: 'ultimate-strike.png'
          }
        ];
        
        // 為初始玩家添加基礎卡牌
        this.gameController.state.progress.ownedCards = [
          { ...this.resources.cards[0] }, // 打擊
          { ...this.resources.cards[0] }, // 打擊
          { ...this.resources.cards[0] }, // 打擊
          { ...this.resources.cards[1] }, // 防禦
          { ...this.resources.cards[1] }, // 防禦
          { ...this.resources.cards[1] }, // 防禦
          { ...this.resources.cards[6] }, // 連擊
          { ...this.resources.cards[3] }  // 治療術
        ];
        
        // 設置初始牌組
        this.gameController.state.progress.equippedCards = [...this.gameController.state.progress.ownedCards];
        
        if (callback) callback();
      }, 300);
    }
    
    /**
     * 加載敵人資源
     * @param {Function} callback - 加載完成後的回調函數
     */
    _loadEnemies(callback) {
      console.log('加載敵人資源...');
      
      // 在實際應用中，這裡應該從服務器或本地文件加載敵人數據
      // 這裡使用模擬數據
      setTimeout(() => {
        this.resources.enemies = [
          {
            id: 'enemy1',
            name: '史萊姆',
            health: 20,
            attack: 5,
            image: 'slime.png',
            actions: [
              { type: 'attack', value: 5, probability: 0.7 },
              { type: 'defend', value: 3, probability: 0.3 }
            ]
          },
          {
            id: 'enemy2',
            name: '哥布林',
            health: 30,
            attack: 8,
            image: 'goblin.png',
            actions: [
              { type: 'attack', value: 8, probability: 0.6 },
              { type: 'defend', value: 5, probability: 0.3 },
              { type: 'buff', value: 2, probability: 0.1 }
            ]
          },
          {
            id: 'enemy3',
            name: '骷髏戰士',
            health: 40,
            attack: 10,
            image: 'skeleton.png',
            actions: [
              { type: 'attack', value: 10, probability: 0.5 },
              { type: 'defend', value: 8, probability: 0.3 },
              { type: 'debuff', value: 2, probability: 0.2 }
            ]
          },
          {
            id: 'enemy4',
            name: '巨魔',
            health: 60,
            attack: 12,
            image: 'troll.png',
            actions: [
              { type: 'attack', value: 12, probability: 0.4 },
              { type: 'heavy_attack', value: 18, probability: 0.2 },
              { type: 'defend', value: 10, probability: 0.3 },
              { type: 'heal', value: 5, probability: 0.1 }
            ]
          },
          {
            id: 'enemy5',
            name: '惡魔',
            health: 80,
            attack: 15,
            image: 'demon.png',
            actions: [
              { type: 'attack', value: 15, probability: 0.4 },
              { type: 'heavy_attack', value: 25, probability: 0.2 },
              { type: 'defend', value: 12, probability: 0.2 },
              { type: 'debuff', value: 3, probability: 0.1 },
              { type: 'buff', value: 3, probability: 0.1 }
            ]
          }
        ];
        
        if (callback) callback();
      }, 300);
    }
    
    /**
     * 加載關卡資源
     * @param {Function} callback - 加載完成後的回調函數
     */
    _loadLevels(callback) {
      console.log('加載關卡資源...');
      
      // 在實際應用中，這裡應該從服務器或本地文件加載關卡數據
      // 這裡使用模擬數據
      setTimeout(() => {
        this.resources.levels = [
          {
            id: 1,
            name: '森林入口',
            description: '一個看似平靜的森林入口，但隱藏著危險。',
            enemies: ['enemy1'],
            background: 'forest_entrance.jpg',
            rewards: {
              gold: 10,
              experience: 20,
              cards: ['card3']
            }
          },
          {
            id: 2,
            name: '哥布林營地',
            description: '哥布林在此建立了一個小型營地，時刻準備著襲擊路過的旅行者。',
            enemies: ['enemy2'],
            background: 'goblin_camp.jpg',
            rewards: {
              gold: 20,
              experience: 30,
              cards: ['card5']
            }
          },
          {
            id: 3,
            name: '古老墓地',
            description: '這個被遺忘的墓地充滿了不安的亡靈。',
            enemies: ['enemy3'],
            background: 'graveyard.jpg',
            rewards: {
              gold: 30,
              experience: 40,
              cards: ['card8']
            }
          },
          {
            id: 4,
            name: '巨魔洞穴',
            description: '一個陰暗潮濕的洞穴，是巨魔的家園。',
            enemies: ['enemy4'],
            background: 'troll_cave.jpg',
            rewards: {
              gold: 40,
              experience: 50,
              cards: ['card9']
            }
          },
          {
            id: 5,
            name: '惡魔祭壇',
            description: '一個古老的祭壇，被用來召喚惡魔。',
            enemies: ['enemy5'],
            background: 'demon_altar.jpg',
            rewards: {
              gold: 50,
              experience: 60,
              cards: ['card10']
            }
          }
        ];
        
        if (callback) callback();
      }, 300);
    }
    
    /**
     * 根據ID獲取卡牌
     * @param {string} cardId - 卡牌ID
     * @returns {Object|null} 卡牌對象或null
     */
    getCardById(cardId) {
      return this.resources.cards.find(card => card.id === cardId) || null;
    }
    
    /**
     * 根據ID獲取敵人
     * @param {string} enemyId - 敵人ID
     * @returns {Object|null} 敵人對象或null
     */
    getEnemyById(enemyId) {
      return this.resources.enemies.find(enemy => enemy.id === enemyId) || null;
    }
    
    /**
     * 根據ID獲取關卡
     * @param {number} levelId - 關卡ID
     * @returns {Object|null} 關卡對象或null
     */
    getLevelById(levelId) {
      return this.resources.levels.find(level => level.id === levelId) || null;
    }
    
    /**
     * 根據敵人ID獲取關卡
     * @param {string} enemyId - 敵人ID
     * @returns {Object|null} 關卡對象或null
     */
    getLevelByEnemyId(enemyId) {
      return this.resources.levels.find(level => level.enemies.includes(enemyId)) || null;
    }
    
    /**
     * 獲取關卡總數
     * @returns {number} 關卡總數
     */
    getLevelsCount() {
      return this.resources.levels.length;
    }
    
    /**
     * 獲取所有卡牌
     * @returns {Array} 所有卡牌
     */
    getAllCards() {
      return [...this.resources.cards];
    }
    
    /**
     * 獲取所有敵人
     * @returns {Array} 所有敵人
     */
    getAllEnemies() {
      return [...this.resources.enemies];
    }
    
    /**
     * 獲取所有關卡
     * @returns {Array} 所有關卡
     */
    getAllLevels() {
      return [...this.resources.levels];
    }
    
    /**
     * 獲取卡牌類型描述
     * @param {string} type - 卡牌類型
     * @returns {string} 卡牌類型描述
     */
    getCardTypeDescription(type) {
      const typeMap = {
        'attack': '攻擊',
        'skill': '技能',
        'power': '能力',
        'status': '狀態',
        'curse': '詛咒'
      };
      
      return typeMap[type] || '未知';
    }
    
    /**
     * 獲取卡牌稀有度描述
     * @param {string} rarity - 卡牌稀有度
     * @returns {string} 卡牌稀有度描述
     */
    getCardRarityDescription(rarity) {
      const rarityMap = {
        'common': '普通',
        'uncommon': '罕見',
        'rare': '稀有',
        'legendary': '傳說'
      };
      
      return rarityMap[rarity] || '未知';
    }
    
    /**
     * 獲取效果描述
     * @param {Object} effect - 效果對象
     * @returns {string} 效果描述
     */
    getEffectDescription(effect) {
      const effectMap = {
        'damage': `造成 ${effect.value} 點傷害`,
        'shield': `獲得 ${effect.value} 點護盾`,
        'heal': `恢復 ${effect.value} 點生命值`,
        'mana': `獲得 ${effect.value} 點魔力`,
        'strength': `獲得 ${effect.value} 點力量`,
        'poison': `施加 ${effect.value} 層中毒，持續 ${effect.duration} 回合`,
        'burn': `施加 ${effect.value} 層燃燒，持續 ${effect.duration} 回合`,
        'weakness': `降低攻擊力 ${effect.value} 點，持續 ${effect.duration} 回合`,
        'draw': `抽 ${effect.value} 張牌`,
        'discard': `棄 ${effect.value} 張牌`
      };
      
      return effectMap[effect.type] || '未知效果';
    }
  }