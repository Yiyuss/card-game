/**
 * 資源管理器
 * 負責加載和管理遊戲資源
 */
export class ResourceManager {
  constructor(gameController) {
    this.gameController = gameController;
    
    // 資源存儲
    this.cards = [];
    this.enemies = [];
    this.levels = [];
    this.achievements = [];
    this.images = {};
    this.sounds = {};
    
    // 資源加載狀態
    this.loadingStatus = {
      cards: false,
      enemies: false,
      levels: false,
      achievements: false,
      images: false,
      sounds: false
    };
  }
  
  /**
   * 加載所有資源
   */
  loadResources(callback) {
    console.log('開始加載資源...');
    
    // 並行加載所有資源
    this._loadCards();
    this._loadEnemies();
    this._loadLevels();
    this._loadAchievements();
    this._loadImages();
    this._loadSounds();
    
    // 檢查加載狀態
    const checkLoading = setInterval(() => {
      if (this._isAllResourcesLoaded()) {
        clearInterval(checkLoading);
        console.log('所有資源加載完成');
        if (callback) callback();
      }
    }, 100);
  }
  
  /**
   * 檢查所有資源是否加載完成
   */
  _isAllResourcesLoaded() {
    return Object.values(this.loadingStatus).every(status => status);
  }
  
  /**
   * 加載卡牌數據
   */
  _loadCards() {
    console.log('加載卡牌數據...');
    
    // 模擬從服務器加載數據
    setTimeout(() => {
      fetch('./data/cards.js')
        .then(response => response.json())
        .then(data => {
          this.cards = data;
          this.loadingStatus.cards = true;
          console.log(`加載了 ${this.cards.length} 張卡牌`);
        })
        .catch(error => {
          console.error('加載卡牌數據失敗:', error);
          // 使用默認卡牌數據
          this.cards = this._getDefaultCards();
          this.loadingStatus.cards = true;
        });
    }, 300);
  }
  
  /**
   * 加載敵人數據
   */
  _loadEnemies() {
    console.log('加載敵人數據...');
    
    // 模擬從服務器加載數據
    setTimeout(() => {
      fetch('./data/enemies.js')
        .then(response => response.json())
        .then(data => {
          this.enemies = data;
          this.loadingStatus.enemies = true;
          console.log(`加載了 ${this.enemies.length} 個敵人`);
        })
        .catch(error => {
          console.error('加載敵人數據失敗:', error);
          // 使用默認敵人數據
          this.enemies = this._getDefaultEnemies();
          this.loadingStatus.enemies = true;
        });
    }, 300);
  }
  
  /**
   * 加載關卡數據
   */
  _loadLevels() {
    console.log('加載關卡數據...');
    
    // 模擬從服務器加載數據
    setTimeout(() => {
      fetch('./data/levels.js')
        .then(response => response.json())
        .then(data => {
          this.levels = data;
          this.loadingStatus.levels = true;
          console.log(`加載了 ${this.levels.length} 個關卡`);
        })
        .catch(error => {
          console.error('加載關卡數據失敗:', error);
          // 使用默認關卡數據
          this.levels = this._getDefaultLevels();
          this.loadingStatus.levels = true;
        });
    }, 300);
  }
  
  /**
   * 加載成就數據
   */
  _loadAchievements() {
    console.log('加載成就數據...');
    
    // 模擬從服務器加載數據
    setTimeout(() => {
      fetch('./data/achievements.js')
        .then(response => response.json())
        .then(data => {
          this.achievements = data;
          this.loadingStatus.achievements = true;
          console.log(`加載了 ${this.achievements.length} 個成就`);
        })
        .catch(error => {
          console.error('加載成就數據失敗:', error);
          // 使用默認成就數據
          this.achievements = this._getDefaultAchievements();
          this.loadingStatus.achievements = true;
        });
    }, 300);
  }
  
  /**
   * 加載圖片資源
   */
  _loadImages() {
    console.log('加載圖片資源...');
    
    const imagesToLoad = [
      { name: 'main_bg', path: 'src/assets/images/main_bg.jpg' },
      { name: 'battle_bg', path: 'src/assets/images/battle_bg.jpg' },
      { name: 'card_back', path: 'src/assets/images/card_back.png' },
      { name: 'player_avatar', path: 'src/assets/images/player_avatar.png' }
    ];
    
    let loadedCount = 0;
    
    imagesToLoad.forEach(imageInfo => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === imagesToLoad.length) {
          this.loadingStatus.images = true;
          console.log(`加載了 ${loadedCount} 張圖片`);
        }
      };
      img.onerror = () => {
        console.error(`加載圖片失敗: ${imageInfo.path}`);
        loadedCount++;
        if (loadedCount === imagesToLoad.length) {
          this.loadingStatus.images = true;
        }
      };
      img.src = imageInfo.path;
      this.images[imageInfo.name] = img;
    });
    
    // 如果沒有圖片需要加載，直接標記為完成
    if (imagesToLoad.length === 0) {
      this.loadingStatus.images = true;
    }
  }
  
  /**
   * 加載音效資源
   */
  _loadSounds() {
    console.log('加載音效資源...');
    
    const soundsToLoad = [
      { name: 'menu', path: './assets/sounds/menu_bgm.mp3', type: 'bgm' },
      { name: 'battle', path: './assets/sounds/battle_bgm.mp3', type: 'bgm' },
      { name: 'victory', path: './assets/sounds/victory_bgm.mp3', type: 'bgm' },
      { name: 'defeat', path: './assets/sounds/defeat_bgm.mp3', type: 'bgm' },
      { name: 'card-draw', path: './assets/sounds/card_draw.mp3', type: 'sfx' },
      { name: 'card-play', path: './assets/sounds/card_play.mp3', type: 'sfx' },
      { name: 'battle-start', path: './assets/sounds/battle_start.mp3', type: 'sfx' },
      { name: 'player-hit', path: './assets/sounds/player_hit.mp3', type: 'sfx' },
      { name: 'enemy-hit', path: './assets/sounds/enemy_hit.mp3', type: 'sfx' },
      { name: 'turn-start', path: './assets/sounds/turn_start.mp3', type: 'sfx' },
      { name: 'turn-end', path: './assets/sounds/turn_end.mp3', type: 'sfx' },
      { name: 'level-up', path: './assets/sounds/level_up.mp3', type: 'sfx' }
    ];
    
    let loadedCount = 0;
    
    soundsToLoad.forEach(soundInfo => {
      const audio = new Audio();
      audio.oncanplaythrough = () => {
        loadedCount++;
        if (loadedCount === soundsToLoad.length) {
          this.loadingStatus.sounds = true;
          console.log(`加載了 ${loadedCount} 個音效`);
        }
      };
      audio.onerror = () => {
        console.error(`加載音效失敗: ${soundInfo.path}`);
        loadedCount++;
        if (loadedCount === soundsToLoad.length) {
          this.loadingStatus.sounds = true;
        }
      };
      audio.src = soundInfo.path;
      audio.preload = 'auto';
      
      if (!this.sounds[soundInfo.type]) {
        this.sounds[soundInfo.type] = {};
      }
      this.sounds[soundInfo.type][soundInfo.name] = audio;
    });
    
    // 如果沒有音效需要加載，直接標記為完成
    if (soundsToLoad.length === 0) {
      this.loadingStatus.sounds = true;
    }
  }
  
  /**
   * 獲取默認卡牌數據
   */
  _getDefaultCards() {
    return [
      {
        id: 'card1',
        name: '打擊',
        type: 'attack',
        manaCost: 1,
        value: 6,
        description: '造成6點傷害',
        image: './assets/images/cards/strike.png'
      },
      {
        id: 'card2',
        name: '防禦',
        type: 'defense',
        manaCost: 1,
        value: 5,
        description: '獲得5點護盾',
        image: './assets/images/cards/defend.png'
      },
      {
        id: 'card3',
        name: '火球',
        type: 'attack',
        manaCost: 2,
        value: 10,
        description: '造成10點傷害',
        image: './assets/images/cards/fireball.png'
      },
      {
        id: 'card4',
        name: '治療',
        type: 'skill',
        manaCost: 2,
        value: 8,
        description: '恢復8點生命',
        image: './assets/images/cards/heal.png'
      },
      {
        id: 'card5',
        name: '毒刃',
        type: 'attack',
        manaCost: 1,
        value: 4,
        description: '造成4點傷害並施加2層中毒',
        image: './assets/images/cards/poison_blade.png',
        effects: [
          {
            type: 'poison',
            value: 2,
            duration: 2
          }
        ]
      }
    ];
  }
  
  /**
   * 獲取默認敵人數據
   */
  _getDefaultEnemies() {
    return [
      {
        id: 'enemy1',
        name: '小嘍囉',
        health: 20,
        attack: 5,
        image: './assets/images/enemies/minion.png',
        description: '一個普通的敵人，沒有特殊能力'
      },
      {
        id: 'enemy2',
        name: '哥布林',
        health: 30,
        attack: 8,
        image: './assets/images/enemies/goblin.png',
        description: '攻擊力較高的敵人'
      },
      {
        id: 'enemy3',
        name: '巨魔',
        health: 50,
        attack: 12,
        image: './assets/images/enemies/troll.png',
        description: '生命值較高的敵人'
      },
      {
        id: 'enemy4',
        name: '巫師',
        health: 25,
        attack: 10,
        image: './assets/images/enemies/wizard.png',
        description: '每回合可以施放魔法',
        abilities: [
          {
            name: '火球術',
            damage: 8,
            cooldown: 3
          }
        ]
      },
      {
        id: 'enemy5',
        name: '龍',
        health: 100,
        attack: 15,
        image: './assets/images/enemies/dragon.png',
        description: 'BOSS敵人，擁有強大的能力',
        abilities: [
          {
            name: '龍息',
            damage: 20,
            cooldown: 4
          },
          {
            name: '龍爪',
            damage: 12,
            cooldown: 2
          }
        ]
      }
    ];
  }
  
  /**
   * 獲取默認關卡數據
   */
  _getDefaultLevels() {
    return [
      {
        id: 1,
        name: '森林小徑',
        description: '一個簡單的開始關卡',
        enemies: ['enemy1'],
        background: './assets/images/levels/forest.jpg',
        rewards: {
          gold: 50,
          experience: 20,
          cards: ['card1']
        }
      },
      {
        id: 2,
        name: '哥布林營地',
        description: '哥布林的聚集地',
        enemies: ['enemy2'],
        background: './assets/images/levels/goblin_camp.jpg',
        rewards: {
          gold: 80,
          experience: 30,
          cards: ['card2']
        }
      },
      {
        id: 3,
        name: '巨魔洞穴',
        description: '黑暗的洞穴，巨魔的家',
        enemies: ['enemy3'],
        background: './assets/images/levels/cave.jpg',
        rewards: {
          gold: 120,
          experience: 50,
          cards: ['card3']
        }
      },
      {
        id: 4,
        name: '巫師塔',
        description: '充滿魔法能量的高塔',
        enemies: ['enemy4'],
        background: './assets/images/levels/wizard_tower.jpg',
        rewards: {
          gold: 150,
          experience: 70,
          cards: ['card4']
        }
      },
      {
        id: 5,
        name: '龍巢',
        description: 'BOSS關卡，挑戰強大的龍',
        enemies: ['enemy5'],
        background: './assets/images/levels/dragon_lair.jpg',
        rewards: {
          gold: 300,
          experience: 100,
          cards: ['card5']
        }
      }
    ];
  }
  
  /**
   * 獲取默認成就數據
   */
  _getDefaultAchievements() {
    return [
      {
        id: 'achievement1',
        name: '初次戰鬥',
        description: '完成你的第一場戰鬥',
        icon: './assets/images/achievements/first_battle.png',
        condition: {
          type: 'battles',
          value: 1
        },
        reward: {
          gold: 50
        }
      },
      {
        id: 'achievement2',
        name: '卡牌收藏家',
        description: '收集10張不同的卡牌',
        icon: './assets/images/achievements/card_collector.png',
        condition: {
          type: 'cards',
          value: 10
        },
        reward: {
          gold: 100
        }
      },
      {
        id: 'achievement3',
        name: '傷害專家',
        description: '累計造成1000點傷害',
        icon: './assets/images/achievements/damage_expert.png',
        condition: {
          type: 'damage',
          value: 1000
        },
        reward: {
          gold: 200
        }
      },
      {
        id: 'achievement4',
        name: '屠龍勇士',
        description: '擊敗龍',
        icon: './assets/images/achievements/dragon_slayer.png',
        condition: {
          type: 'defeat_enemy',
          enemyId: 'enemy5'
        },
        reward: {
          gold: 500
        }
      }
    ];
  }
  
  /**
   * 根據ID獲取卡牌
   */
  getCardById(cardId) {
    return this.cards.find(card => card.id === cardId);
  }
  
  /**
   * 根據ID獲取敵人
   */
  getEnemyById(enemyId) {
    return this.enemies.find(enemy => enemy.id === enemyId);
  }
  
  /**
   * 根據ID獲取關卡
   */
  getLevelById(levelId) {
    return this.levels.find(level => level.id === levelId);
  }
  
  /**
   * 根據敵人ID獲取關卡
   */
  getLevelByEnemyId(enemyId) {
    return this.levels.find(level => level.enemies.includes(enemyId));
  }
  
  /**
   * 獲取關卡數量
   */
  getLevelsCount() {
    return this.levels.length;
  }
  
  /**
   * 獲取所有關卡
   */
  getLevels() {
    return this.levels;
  }
  
  /**
   * 根據ID獲取成就
   */
  getAchievementById(achievementId) {
    return this.achievements.find(achievement => achievement.id === achievementId);
  }
  
  /**
   * 獲取圖片
   */
  getImage(imageName) {
    return this.images[imageName];
  }
  
  /**
   * 獲取音效
   */
  getSound(soundName, type = 'sfx') {
    if (this.sounds[type] && this.sounds[type][soundName]) {
      return this.sounds[type][soundName];
    }
    return null;
  }
}
