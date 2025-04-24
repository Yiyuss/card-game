/**
 * 玩家管理器
 * 負責處理所有與玩家相關的操作
 */
export class PlayerManager {
    constructor(gameController) {
      this.gameController = gameController;
    }
  
    /**
     * 初始化玩家管理器
     */
    init() {
      console.log('初始化玩家管理器...');
      console.log('玩家管理器初始化完成');
    }
  
    /**
     * 創建新玩家
     * @returns {Object} - 玩家對象
     */
    createNewPlayer() {
      return {
        health: 100,
        maxHealth: 100,
        mana: 3,
        maxMana: 3,
        gold: 0,
        level: 1,
        experience: 0
      };
    }
  
    /**
     * 重置玩家狀態
     */
    resetPlayerState() {
      this.gameController.state.player = this.createNewPlayer();
      console.log('玩家狀態已重置');
    }
  
    /**
     * 恢復玩家生命值
     * @param {number} amount - 恢復量
     */
    heal(amount) {
      if (amount <= 0) return;
      
      const { player } = this.gameController.state;
      const oldHealth = player.health;
      
      player.health = Math.min(player.maxHealth, player.health + amount);
      const actualHeal = player.health - oldHealth;
      
      if (actualHeal > 0) {
        // 更新統計數據
        this.gameController.state.progress.stats.totalHealing += actualHeal;
        
        // 播放治療音效
        this.gameController.soundManager.play('heal');
        
        console.log(`玩家恢復了 ${actualHeal} 點生命值`);
      }
    }
  
    /**
     * 對玩家造成傷害
     * @param {number} amount - 傷害量
     * @returns {boolean} - 玩家是否死亡
     */
    takeDamage(amount) {
      if (amount <= 0) return false;
      
      const { player, battle } = this.gameController.state;
      
      // 檢查護盾效果
      let remainingDamage = amount;
      const shieldEffects = battle.activeEffects.filter(e => e.type === 'shield' && e.source === 'player');
      
      for (const shield of shieldEffects) {
        if (remainingDamage <= 0) break;
        
        if (remainingDamage <= shield.value) {
          shield.value -= remainingDamage;
          remainingDamage = 0;
          
          if (shield.value <= 0) {
            battle.activeEffects = battle.activeEffects.filter(e => e.id !== shield.id);
          }
        } else {
          remainingDamage -= shield.value;
          battle.activeEffects = battle.activeEffects.filter(e => e.id !== shield.id);
        }
      }
      
      // 應用傷害
      if (remainingDamage > 0) {
        player.health = Math.max(0, player.health - remainingDamage);
        
        // 播放受傷音效
        this.gameController.soundManager.play('player-hit');
        
        // 播放受傷動畫
        this.gameController.animationManager.playPlayerHitAnimation();
        
        console.log(`玩家受到 ${remainingDamage} 點傷害`);
      } else {
        console.log(`護盾吸收了所有傷害`);
      }
      
      // 檢查玩家是否死亡
      return player.health <= 0;
    }
  
    /**
     * 增加玩家魔力
     * @param {number} amount - 增加量
     */
    addMana(amount) {
      if (amount <= 0) return;
      
      const { player } = this.gameController.state;
      player.mana = Math.min(player.maxMana, player.mana + amount);
      
      console.log(`玩家獲得 ${amount} 點魔力`);
    }
  
    /**
     * 消耗玩家魔力
     * @param {number} amount - 消耗量
     * @returns {boolean} - 是否成功消耗
     */
    useMana(amount) {
      if (amount <= 0) return true;
      
      const { player } = this.gameController.state;
      
      if (player.mana < amount) {
        console.log('魔力不足');
        return false;
      }
      
      player.mana -= amount;
      console.log(`消耗 ${amount} 點魔力`);
      return true;
    }
  
    /**
     * 增加玩家金幣
     * @param {number} amount - 增加量
     */
    addGold(amount) {
      if (amount <= 0) return;
      
      const { player, progress } = this.gameController.state;
      player.gold += amount;
      progress.stats.totalGoldEarned += amount;
      
      // 播放獲得金幣音效
      this.gameController.soundManager.play('coin');
      
      console.log(`玩家獲得 ${amount} 金幣`);
    }
  
    /**
     * 消耗玩家金幣
     * @param {number} amount - 消耗量
     * @returns {boolean} - 是否成功消耗
     */
    useGold(amount) {
      if (amount <= 0) return true;
      
      const { player } = this.gameController.state;
      
      if (player.gold < amount) {
        console.log('金幣不足');
        return false;
      }
      
      player.gold -= amount;
      console.log(`消耗 ${amount} 金幣`);
      return true;
    }
  
    /**
     * 增加玩家經驗值
     * @param {number} amount - 增加量
     * @returns {boolean} - 是否升級
     */
    addExperience(amount) {
      if (amount <= 0) return false;
      
      const { player } = this.gameController.state;
      player.experience += amount;
      
      console.log(`玩家獲得 ${amount} 經驗值`);
      
      // 檢查是否升級
      const expNeeded = player.level * 100;
      if (player.experience >= expNeeded) {
        return this.levelUp();
      }
      
      return false;
    }
  
    /**
     * 玩家升級
     * @returns {boolean} - 是否成功升級
     */
    levelUp() {
      const { player } = this.gameController.state;
      const expNeeded = player.level * 100;
      
      if (player.experience < expNeeded) {
        console.log('經驗值不足，無法升級');
        return false;
      }
      
      player.level += 1;
      player.experience -= expNeeded;
      player.maxHealth += 10;
      player.health += 10;
      player.maxMana += 1;
      player.mana += 1;
      
      // 播放升級音效
      this.gameController.soundManager.play('level-up');
      
      // 播放升級動畫
      this.gameController.animationManager.playLevelUpAnimation();
      
      console.log(`玩家升級到 ${player.level} 級！`);
      console.log(`最大生命值增加 10 點，最大魔力增加 1 點`);
      
      // 顯示升級提示
      this.gameController.uiManager.showToast('升級！生命值和魔力上限提升');
      
      return true;
    }
  
    /**
     * 裝備卡牌
     * @param {string} cardId - 卡牌ID
     * @returns {boolean} - 是否成功裝備
     */
    equipCard(cardId) {
      const { progress } = this.gameController.state;
      
      // 檢查是否擁有該卡牌
      const ownedCard = progress.ownedCards.find(card => card.id === cardId);
      if (!ownedCard) {
        console.log(`未擁有卡牌 ${cardId}`);
        return false;
      }
      
      // 檢查是否已裝備該卡牌
      const isEquipped = progress.equippedCards.some(card => card.id === cardId);
      if (isEquipped) {
        console.log(`卡牌 ${cardId} 已裝備`);
        return false;
      }
      
      // 裝備卡牌
      progress.equippedCards.push({ ...ownedCard });
      
      console.log(`裝備卡牌: ${ownedCard.name}`);
      return true;
    }
  
    /**
     * 卸下卡牌
     * @param {string} cardId - 卡牌ID
     * @returns {boolean} - 是否成功卸下
     */
    unequipCard(cardId) {
      const { progress } = this.gameController.state;
      
      // 檢查是否已裝備該卡牌
      const equippedIndex = progress.equippedCards.findIndex(card => card.id === cardId);
      if (equippedIndex === -1) {
        console.log(`卡牌 ${cardId} 未裝備`);
        return false;
      }
      
      // 卸下卡牌
      progress.equippedCards.splice(equippedIndex, 1);
      
      console.log(`卸下卡牌: ${cardId}`);
      return true;
    }
  
    /**
     * 獲取玩家當前牌組
     * @returns {Array} - 玩家牌組
     */
    getPlayerDeck() {
      return [...this.gameController.state.progress.equippedCards];
    }
  
    /**
     * 獲取玩家擁有的所有卡牌
     * @returns {Array} - 玩家擁有的所有卡牌
     */
    getOwnedCards() {
      return [...this.gameController.state.progress.ownedCards];
    }
  
    /**
     * 獲取玩家未裝備的卡牌
     * @returns {Array} - 玩家未裝備的卡牌
     */
    getUnequippedCards() {
      const { ownedCards, equippedCards } = this.gameController.state.progress;
      
      return ownedCards.filter(ownedCard => 
        !equippedCards.some(equippedCard => equippedCard.id === ownedCard.id)
      );
    }
  
    /**
     * 增加最大生命值
     * @param {number} amount - 增加量
     */
    increaseMaxHealth(amount) {
      if (amount <= 0) return;
      
      const { player } = this.gameController.state;
      player.maxHealth += amount;
      player.health += amount;
      
      console.log(`最大生命值增加 ${amount} 點`);
    }
  
    /**
     * 增加最大魔力值
     * @param {number} amount - 增加量
     */
    increaseMaxMana(amount) {
      if (amount <= 0) return;
      
      const { player } = this.gameController.state;
      player.maxMana += amount;
      player.mana += amount;
      
      console.log(`最大魔力值增加 ${amount} 點`);
    }
  
    /**
     * 獲取升級所需經驗值
     * @returns {number} - 升級所需經驗值
     */
    getExpNeededForNextLevel() {
      const { player } = this.gameController.state;
      return player.level * 100;
    }
  
    /**
     * 獲取經驗值進度百分比
     * @returns {number} - 經驗值進度百分比
     */
    getExpProgressPercentage() {
      const { player } = this.gameController.state;
      const expNeeded = this.getExpNeededForNextLevel();
      return (player.experience / expNeeded) * 100;
    }
  
    /**
     * 獲取生命值百分比
     * @returns {number} - 生命值百分比
     */
    getHealthPercentage() {
      const { player } = this.gameController.state;
      return (player.health / player.maxHealth) * 100;
    }
  
    /**
     * 獲取魔力值百分比
     * @returns {number} - 魔力值百分比
     */
    getManaPercentage() {
      const { player } = this.gameController.state;
      return (player.mana / player.maxMana) * 100;
    }
  
    /**
     * 添加新卡牌到收藏
     * @param {Object} card - 卡牌對象
     * @returns {boolean} - 是否成功添加
     */
    addCardToCollection(card) {
      if (!card || !card.id) return false;
      
      const { progress } = this.gameController.state;
      
      // 檢查是否已擁有該卡牌
      const hasCard = progress.ownedCards.some(ownedCard => ownedCard.id === card.id);
      if (hasCard) {
        console.log(`已擁有卡牌 ${card.name}`);
        return false;
      }
      
      // 添加卡牌到收藏
      progress.ownedCards.push({ ...card });
      
      // 播放獲得卡牌音效
      this.gameController.soundManager.play('card-obtain');
      
      console.log(`獲得新卡牌: ${card.name}`);
      
      // 顯示獲得卡牌提示
      this.gameController.uiManager.showToast(`獲得新卡牌：${card.name}`);
      
      return true;
    }
  
    /**
     * 重置玩家回合狀態
     */
    resetTurnState() {
      const { player } = this.gameController.state;
      player.mana = player.maxMana;
      
      console.log('玩家回合狀態已重置');
    }
  }