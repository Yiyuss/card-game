/**
 * 成就管理器
 * 負責處理遊戲成就系統
 */
export class AchievementManager {
  constructor(gameController) {
    this.gameController = gameController;
    
    // 成就列表
    this.achievements = [
      {
        id: 'first_victory',
        name: '初次勝利',
        description: '贏得第一場戰鬥',
        icon: 'trophy.png',
        condition: (stats) => stats.totalBattlesWon >= 1
      },
      {
        id: 'card_collector',
        name: '卡牌收藏家',
        description: '收集10張不同的卡牌',
        icon: 'cards.png',
        condition: (stats, progress) => progress.ownedCards.length >= 10
      },
      {
        id: 'damage_dealer',
        name: '傷害製造者',
        description: '累計造成100點傷害',
        icon: 'sword.png',
        condition: (stats) => stats.totalDamageDealt >= 100
      },
      {
        id: 'healer',
        name: '治療師',
        description: '累計治療50點生命值',
        icon: 'heal.png',
        condition: (stats) => stats.totalHealing >= 50
      },
      {
        id: 'rich',
        name: '富翁',
        description: '累計獲得100金幣',
        icon: 'gold.png',
        condition: (stats) => stats.totalGoldEarned >= 100
      },
      {
        id: 'card_master',
        name: '卡牌大師',
        description: '使用50張卡牌',
        icon: 'master.png',
        condition: (stats) => stats.totalCardsPlayed >= 50
      },
      {
        id: 'level_5',
        name: '冒險家',
        description: '達到5級',
        icon: 'level.png',
        condition: (stats, progress, player) => player.level >= 5
      },
      {
        id: 'all_levels',
        name: '征服者',
        description: '解鎖所有關卡',
        icon: 'map.png',
        condition: (stats, progress, player, resourceManager) => {
          const totalLevels = resourceManager.getLevelsCount();
          return progress.unlockedLevels.length >= totalLevels;
        }
      }
    ];
  }
  
  /**
   * 檢查成就
   * @returns {Array} 新解鎖的成就列表
   */
  checkAchievements() {
    console.log('檢查成就...');
    
    const newAchievements = [];
    const { stats } = this.gameController.state.progress;
    const progress = this.gameController.state.progress;
    const player = this.gameController.state.player;
    
    // 檢查每個成就
    for (const achievement of this.achievements) {
      // 如果成就已經解鎖，跳過
      if (progress.achievements.includes(achievement.id)) {
        continue;
      }
      
      // 檢查成就條件
      if (achievement.condition(stats, progress, player, this.gameController.resourceManager)) {
        // 解鎖成就
        progress.achievements.push(achievement.id);
        newAchievements.push(achievement);
        
        console.log(`解鎖成就: ${achievement.name}`);
        
        // 顯示成就解鎖通知
        this.gameController.uiManager.showAchievementUnlocked(achievement);
      }
    }
    
    // 如果有新解鎖的成就，保存遊戲
    if (newAchievements.length > 0) {
      this.gameController.saveManager.saveGame(progress);
    }
    
    return newAchievements;
  }
  
  /**
   * 獲取所有成就
   * @returns {Array} 所有成就列表
   */
  getAllAchievements() {
    return [...this.achievements];
  }
  
  /**
   * 獲取已解鎖的成就
   * @returns {Array} 已解鎖的成就列表
   */
  getUnlockedAchievements() {
    const unlockedIds = this.gameController.state.progress.achievements;
    return this.achievements.filter(achievement => unlockedIds.includes(achievement.id));
  }
  
  /**
   * 獲取未解鎖的成就
   * @returns {Array} 未解鎖的成就列表
   */
  getLockedAchievements() {
    const unlockedIds = this.gameController.state.progress.achievements;
    return this.achievements.filter(achievement => !unlockedIds.includes(achievement.id));
  }
  
  /**
   * 獲取成就進度
   * @returns {Object} 成就進度信息
   */
  getAchievementProgress() {
    const total = this.achievements.length;
    const unlocked = this.gameController.state.progress.achievements.length;
    const percentage = Math.floor((unlocked / total) * 100);
    
    return {
      total,
      unlocked,
      percentage
    };
  }
  
  /**
   * 根據ID獲取成就
   * @param {string} id - 成就ID
   * @returns {Object|null} 成就對象或null
   */
  getAchievementById(id) {
    return this.achievements.find(achievement => achievement.id === id) || null;
  }
  
  /**
   * 檢查成就是否已解鎖
   * @param {string} id - 成就ID
   * @returns {boolean} 是否已解鎖
   */
  isAchievementUnlocked(id) {
    return this.gameController.state.progress.achievements.includes(id);
  }
  
  /**
   * 重置成就
   * 僅用於測試目的
   */
  resetAchievements() {
    this.gameController.state.progress.achievements = [];
    this.gameController.saveManager.saveGame(this.gameController.state.progress);
    console.log('成就已重置');
  }
}