/**
 * 卡牌管理器
 * 負責處理所有與卡牌相關的操作
 */
export class CardManager {
    constructor(gameController) {
      this.gameController = gameController;
    }
  
    /**
     * 初始化卡牌管理器
     */
    init() {
      console.log('初始化卡牌管理器...');
      console.log('卡牌管理器初始化完成');
    }
  
    /**
     * 洗牌
     */
    shuffleDeck() {
      const { deck } = this.gameController.state.cards;
      
      // Fisher-Yates 洗牌算法
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
      }
      
      console.log('牌庫已洗牌');
    }
  
    /**
     * 抽牌
     * @param {number} count - 抽牌數量
     * @returns {Array} - 抽到的卡牌
     */
    drawCards(count = 1) {
      const { deck, discardPile } = this.gameController.state.cards;
      const drawnCards = [];
      
      for (let i = 0; i < count; i++) {
        // 如果牌庫為空，且棄牌堆也為空，則無法抽牌
        if (deck.length === 0 && discardPile.length === 0) {
          break;
        }
        
        // 如果牌庫為空，則將棄牌堆洗入牌庫
        if (deck.length === 0) {
          this.gameController.state.cards.deck = [...discardPile];
          this.gameController.state.cards.discardPile = [];
          this.shuffleDeck();
          
          this.gameController.uiManager.showToast('棄牌堆已洗入牌庫');
        }
        
        // 從牌庫頂部抽一張牌
        const card = deck.pop();
        if (card) {
          drawnCards.push(card);
          
          // 播放抽牌音效
          this.gameController.soundManager.play('card-draw');
          
          // 播放抽牌動畫
          this.gameController.animationManager.playDrawAnimation();
        }
      }
      
      return drawnCards;
    }
  
    /**
     * 棄牌
     * @param {number} cardIndex - 手牌索引
     */
    discardCard(cardIndex) {
      const { hand, discardPile } = this.gameController.state.cards;
      
      if (cardIndex < 0 || cardIndex >= hand.length) {
        console.error(`無效的卡牌索引: ${cardIndex}`);
        return;
      }
      
      const card = hand.splice(cardIndex, 1)[0];
      discardPile.push(card);
      
      console.log(`棄牌: ${card.name}`);
    }
  
    /**
     * 應用卡牌效果
     * @param {Object} card - 卡牌對象
     */
    applyCardEffect(card) {
      if (!card) return;
      
      console.log(`應用卡牌效果: ${card.name}`);
      
      // 根據卡牌類型應用效果
      switch (card.type) {
        case 'attack':
          this._applyAttackCard(card);
          break;
        case 'defense':
          this._applyDefenseCard(card);
          break;
        case 'skill':
          this._applySkillCard(card);
          break;
        case 'item':
          this._applyItemCard(card);
          break;
        default:
          console.error(`未知的卡牌類型: ${card.type}`);
      }
      
      // 應用卡牌的特殊效果
      if (card.effects) {
        this._applyCardEffects(card.effects);
      }
      
      // 更新統計數據
      this.gameController.state.progress.stats.totalCardsPlayed += 1;
    }
  
    /**
     * 應用攻擊卡牌效果
     * @param {Object} card - 卡牌對象
     */
    _applyAttackCard(card) {
      const { enemy } = this.gameController.state;
      let damage = card.value || 0;
      
      // 檢查力量效果
      const strengthEffect = this.gameController.state.battle.activeEffects.find(
        e => e.type === 'strength' && e.source === 'player'
      );
      
      if (strengthEffect) {
        damage += strengthEffect.value;
      }
      
      // 應用傷害
      enemy.health = Math.max(0, enemy.health - damage);
      
      // 更新統計數據
      this.gameController.state.progress.stats.totalDamageDealt += damage;
      
      // 播放攻擊音效
      this.gameController.soundManager.play('attack');
      
      // 播放攻擊動畫
      this.gameController.animationManager.playAttackAnimation();
      
      console.log(`對敵人造成 ${damage} 點傷害`);
      
      // 應用卡牌的附加效果
      if (card.effect) {
        this._applyAttackEffect(card);
      }
    }
  
    /**
     * 應用攻擊卡牌的附加效果
     * @param {Object} card - 卡牌對象
     */
    _applyAttackEffect(card) {
      if (!card.effect) return;
      
      const { battle } = this.gameController.state;
      
      switch (card.effect) {
        case 'poison':
          battle.activeEffects.push({
            id: `poison_${Date.now()}`,
            type: 'poison',
            value: card.poisonAmount || 2,
            duration: 3,
            source: 'player'
          });
          console.log(`敵人中毒，每回合受到 ${card.poisonAmount || 2} 點傷害，持續 3 回合`);
          break;
          
        case 'weakness':
          battle.activeEffects.push({
            id: `weakness_${Date.now()}`,
            type: 'weakness',
            value: card.weakenAmount || 1,
            duration: 2,
            source: 'player'
          });
          console.log(`敵人虛弱，攻擊力降低 ${card.weakenAmount || 1} 點，持續 2 回合`);
          break;
          
        case 'burn':
          battle.activeEffects.push({
            id: `burn_${Date.now()}`,
            type: 'burn',
            value: card.burnDamage || 2,
            duration: 3,
            source: 'player'
          });
          console.log(`敵人燃燒，每回合受到 ${card.burnDamage || 2} 點傷害，持續 3 回合`);
          break;
          
        case 'bleed':
          battle.activeEffects.push({
            id: `bleed_${Date.now()}`,
            type: 'bleed',
            value: card.bleedAmount || 1,
            duration: 3,
            source: 'player'
          });
          console.log(`敵人流血，每回合受到 ${card.bleedAmount || 1} 點傷害，持續 3 回合`);
          break;
          
        case 'stun':
          battle.activeEffects.push({
            id: `stun_${Date.now()}`,
            type: 'stun',
            value: 0,
            duration: 1,
            source: 'player'
          });
          console.log('敵人被擊暈，下回合無法行動');
          break;
      }
    }
  
    /**
     * 應用防禦卡牌效果
     * @param {Object} card - 卡牌對象
     */
    _applyDefenseCard(card) {
      const { battle } = this.gameController.state;
      const shieldValue = card.value || 0;
      
      battle.activeEffects.push({
        id: `shield_${Date.now()}`,
        type: 'shield',
        value: shieldValue,
        duration: 1,
        source: 'player'
      });
      
      // 播放防禦音效
      this.gameController.soundManager.play('defend');
      
      // 播放防禦動畫
      this.gameController.animationManager.playDefendAnimation();
      
      console.log(`獲得 ${shieldValue} 點護盾`);
      
      // 應用卡牌的附加效果
      if (card.effect) {
        this._applyDefenseEffect(card);
      }
    }
  
    /**
     * 應用防禦卡牌的附加效果
     * @param {Object} card - 卡牌對象
     */
    _applyDefenseEffect(card) {
      if (!card.effect) return;
      
      const { battle, player } = this.gameController.state;
      
      switch (card.effect) {
        case 'thorns':
          battle.activeEffects.push({
            id: `thorns_${Date.now()}`,
            type: 'thorns',
            value: card.thornsAmount || 1,
            duration: 2,
            source: 'player'
          });
          console.log(`獲得荊棘效果，敵人攻擊時受到 ${card.thornsAmount || 1} 點反傷，持續 2 回合`);
          break;
          
        case 'regen':
          battle.activeEffects.push({
            id: `regen_${Date.now()}`,
            type: 'regeneration',
            value: card.regenAmount || 2,
            duration: 3,
            source: 'player'
          });
          console.log(`獲得再生效果，每回合恢復 ${card.regenAmount || 2} 點生命值，持續 3 回合`);
          break;
          
        case 'reflect':
          battle.activeEffects.push({
            id: `reflect_${Date.now()}`,
            type: 'reflect',
            value: card.reflectPercent || 50,
            duration: 1,
            source: 'player'
          });
          console.log(`獲得反射效果，反彈 ${card.reflectPercent || 50}% 的傷害，持續 1 回合`);
          break;
          
        case 'fortify':
          player.maxHealth += card.fortifyAmount || 5;
          player.health += card.fortifyAmount || 5;
          console.log(`強化體質，最大生命值增加 ${card.fortifyAmount || 5} 點`);
          break;
      }
    }
  
    /**
     * 應用技能卡牌效果
     * @param {Object} card - 卡牌對象
     */
    _applySkillCard(card) {
      if (!card.effect) return;
      
      const { player, enemy, battle, cards } = this.gameController.state;
      
      switch (card.effect) {
        case 'heal':
          const healAmount = card.value || 0;
          player.health = Math.min(player.maxHealth, player.health + healAmount);
          
          // 更新統計數據
          this.gameController.state.progress.stats.totalHealing += healAmount;
          
          // 播放治療音效
          this.gameController.soundManager.play('heal');
          
          console.log(`恢復 ${healAmount} 點生命值`);
          break;
          
        case 'draw':
          const drawCount = card.value || 1;
          const drawnCards = this.drawCards(drawCount);
          
          cards.hand.push(...drawnCards);
          
          console.log(`抽取 ${drawnCards.length} 張卡牌`);
          break;
          
        case 'strength':
          battle.activeEffects.push({
            id: `strength_${Date.now()}`,
            type: 'strength',
            value: card.value || 2,
            duration: 3,
            source: 'player'
          });
          
          console.log(`獲得力量效果，攻擊力增加 ${card.value || 2} 點，持續 3 回合`);
          break;
          
        case 'mana':
          const manaAmount = card.value || 1;
          player.mana = Math.min(player.maxMana, player.mana + manaAmount);
          
          console.log(`恢復 ${manaAmount} 點魔力`);
          break;
          
        case 'weaken':
          enemy.attack = Math.max(0, enemy.attack - (card.value || 1));
          
          console.log(`削弱敵人攻擊力 ${card.value || 1} 點`);
          break;
          
        case 'double_next':
          battle.activeEffects.push({
            id: `double_next_${Date.now()}`,
            type: 'double_next',
            value: 0,
            duration: 1,
            source: 'player'
          });
          
          console.log('下一張攻擊卡牌的傷害翻倍');
          break;
      }
    }
  
    /**
     * 應用物品卡牌效果
     * @param {Object} card - 卡牌對象
     */
    _applyItemCard(card) {
      if (!card.effect) return;
      
      const { player, progress } = this.gameController.state;
      
      switch (card.effect) {
        case 'gold':
          const goldAmount = card.value || 10;
          player.gold += goldAmount;
          progress.stats.totalGoldEarned += goldAmount;
          
          console.log(`獲得 ${goldAmount} 金幣`);
          break;
          
        case 'max_health':
          const healthIncrease = card.value || 5;
          player.maxHealth += healthIncrease;
          player.health += healthIncrease;
          
          console.log(`最大生命值增加 ${healthIncrease} 點`);
          break;
          
        case 'max_mana':
          const manaIncrease = card.value || 1;
          player.maxMana += manaIncrease;
          player.mana += manaIncrease;
          
          console.log(`最大魔力增加 ${manaIncrease} 點`);
          break;
          
        case 'transform':
          // 將手牌中的所有卡牌轉換為隨機卡牌
          const { hand } = this.gameController.state.cards;
          const allCards = this.gameController.resourceManager.getAllCards();
          
          for (let i = 0; i < hand.length; i++) {
            const randomIndex = Math.floor(Math.random() * allCards.length);
            hand[i] = { ...allCards[randomIndex] };
          }
          
          console.log('手牌已轉換為隨機卡牌');
          break;
      }
    }
  
    /**
     * 應用卡牌的多個效果
     * @param {Array} effects - 效果數組
     */
    _applyCardEffects(effects) {
      if (!Array.isArray(effects) || effects.length === 0) return;
      
      effects.forEach(effect => {
        switch (effect.type) {
          case 'damage':
            this.gameController.state.enemy.health = Math.max(0, this.gameController.state.enemy.health - effect.value);
            this.gameController.state.progress.stats.totalDamageDealt += effect.value;
            console.log(`對敵人造成 ${effect.value} 點額外傷害`);
            break;
            
          case 'heal':
            const healAmount = effect.value || 0;
            this.gameController.state.player.health = Math.min(
              this.gameController.state.player.maxHealth,
              this.gameController.state.player.health + healAmount
            );
            this.gameController.state.progress.stats.totalHealing += healAmount;
            console.log(`恢復 ${healAmount} 點生命值`);
            break;
            
          case 'shield':
            this.gameController.state.battle.activeEffects.push({
              id: `shield_${Date.now()}`,
              type: 'shield',
              value: effect.value || 0,
              duration: effect.duration || 1,
              source: 'player'
            });
            console.log(`獲得 ${effect.value} 點護盾，持續 ${effect.duration || 1} 回合`);
            break;
            
          case 'draw':
            const drawnCards = this.drawCards(effect.value || 1);
            this.gameController.state.cards.hand.push(...drawnCards);
            console.log(`抽取 ${drawnCards.length} 張卡牌`);
            break;
            
          case 'mana':
            const manaAmount = effect.value || 0;
            this.gameController.state.player.mana = Math.min(
              this.gameController.state.player.maxMana,
              this.gameController.state.player.mana + manaAmount
            );
            console.log(`恢復 ${manaAmount} 點魔力`);
            break;
            
          case 'status':
            this.gameController.state.battle.activeEffects.push({
              id: `${effect.status}_${Date.now()}`,
              type: effect.status,
              value: effect.value || 0,
              duration: effect.duration || 1,
              source: 'player'
            });
            console.log(`獲得 ${effect.status} 效果，持續 ${effect.duration || 1} 回合`);
            break;
        }
      });
    }
  
    /**
     * 創建初始牌組
     * @returns {Array} - 初始牌組
     */
    createStarterDeck() {
      const starterCards = this.gameController.resourceManager.getStarterCards();
      return [...starterCards];
    }
  
    /**
     * 獲取卡牌描述
     * @param {Object} card - 卡牌對象
     * @returns {string} - 卡牌描述
     */
    getCardDescription(card) {
      if (!card) return '';
      
      let description = card.description || '';
      
      // 如果沒有描述，則根據卡牌類型和效果生成描述
      if (!description) {
        switch (card.type) {
          case 'attack':
            description = `造成 ${card.value} 點傷害`;
            if (card.effect) {
              switch (card.effect) {
                case 'poison':
                  description += `，並使敵人中毒，每回合受到 ${card.poisonAmount || 2} 點傷害，持續 3 回合`;
                  break;
                case 'weakness':
                  description += `，並使敵人虛弱，攻擊力降低 ${card.weakenAmount || 1} 點，持續 2 回合`;
                  break;
                case 'burn':
                  description += `，並使敵人燃燒，每回合受到 ${card.burnDamage || 2} 點傷害，持續 3 回合`;
                  break;
                case 'bleed':
                  description += `，並使敵人流血，每回合受到 ${card.bleedAmount || 1} 點傷害，持續 3 回合`;
                  break;
                case 'stun':
                  description += '，並使敵人被擊暈，下回合無法行動';
                  break;
              }
            }
            break;
            
          case 'defense':
            description = `獲得 ${card.value} 點護盾`;
            if (card.effect) {
              switch (card.effect) {
                case 'thorns':
                  description += `，並獲得荊棘效果，敵人攻擊時受到 ${card.thornsAmount || 1} 點反傷，持續 2 回合`;
                  break;
                case 'regen':
                  description += `，並獲得再生效果，每回合恢復 ${card.regenAmount || 2} 點生命值，持續 3 回合`;
                  break;
                case 'reflect':
                  description += `，並獲得反射效果，反彈 ${card.reflectPercent || 50}% 的傷害，持續 1 回合`;
                  break;
                case 'fortify':
                  description += `，並強化體質，最大生命值增加 ${card.fortifyAmount || 5} 點`;
                  break;
              }
            }
            break;
            
          case 'skill':
            if (card.effect) {
              switch (card.effect) {
                case 'heal':
                  description = `恢復 ${card.value} 點生命值`;
                  break;
                case 'draw':
                  description = `抽取 ${card.value} 張卡牌`;
                  break;
                case 'strength':
                  description = `獲得力量效果，攻擊力增加 ${card.value} 點，持續 3 回合`;
                  break;
                case 'mana':
                  description = `恢復 ${card.value} 點魔力`;
                  break;
                case 'weaken':
                  description = `削弱敵人攻擊力 ${card.value} 點`;
                  break;
                case 'double_next':
                  description = '下一張攻擊卡牌的傷害翻倍';
                  break;
              }
            }
            break;
            
          case 'item':
            if (card.effect) {
              switch (card.effect) {
                case 'gold':
                  description = `獲得 ${card.value} 金幣`;
                  break;
                case 'max_health':
                  description = `最大生命值增加 ${card.value} 點`;
                  break;
                case 'max_mana':
                  description = `最大魔力增加 ${card.value} 點`;
                  break;
                case 'transform':
                  description = '將手牌中的所有卡牌轉換為隨機卡牌';
                  break;
              }
            }
            break;
        }
      }
      
      return description;
    }
  }