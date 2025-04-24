/**
 * 戰鬥管理器
 * 負責處理所有與戰鬥相關的邏輯
 */
export class BattleManager {
    constructor(gameController) {
      this.gameController = gameController;
      this.currentBattle = null;
      this.turnCount = 0;
    }
  
    /**
     * 初始化戰鬥管理器
     */
    init() {
      console.log('初始化戰鬥管理器...');
      console.log('戰鬥管理器初始化完成');
    }
  
    /**
     * 開始戰鬥
     * @param {Object} level - 關卡信息
     * @param {Object} enemy - 敵人信息
     */
    startBattle(level, enemy) {
      console.log(`開始戰鬥，關卡: ${level.name}，敵人: ${enemy.name}`);
      
      this.currentBattle = {
        levelId: level.id,
        enemyId: enemy.id,
        turnCount: 0,
        isPlayerTurn: true,
        isGameOver: false,
        isVictory: false
      };
      
      // 重置回合計數
      this.turnCount = 0;
      
      // 設置戰鬥狀態
      this.gameController.state.battle.isPlayerTurn = true;
      this.gameController.state.battle.isGameOver = false;
      this.gameController.state.battle.isVictory = false;
      this.gameController.state.battle.activeEffects = [];
      
      // 播放戰鬥開始音效
      this.gameController.soundManager.play('battle-start');
      
      // 開始第一回合
      this.startPlayerTurn();
    }
  
    /**
     * 開始玩家回合
     */
    startPlayerTurn() {
      console.log('開始玩家回合');
      
      // 增加回合計數
      this.turnCount++;
      
      // 設置為玩家回合
      this.gameController.state.battle.isPlayerTurn = true;
      
      // 恢復玩家魔力
      this.gameController.state.player.mana = this.gameController.state.player.maxMana;
      
      // 應用回合開始效果
      this._applyTurnStartEffects('player');
      
      // 抽牌
      this._drawCardsToHand();
      
      // 播放回合開始音效
      this.gameController.soundManager.play('turn-start');
      
      // 更新UI
      this.gameController.uiManager.updateBattleUI();
    }
  
    /**
     * 結束玩家回合
     */
    endPlayerTurn() {
      console.log('結束玩家回合');
      
      // 設置為敵人回合
      this.gameController.state.battle.isPlayerTurn = false;
      
      // 應用回合結束效果
      this._applyTurnEndEffects('player');
      
      // 播放回合結束音效
      this.gameController.soundManager.play('turn-end');
      
      // 播放回合結束動畫
      this.gameController.animationManager.playTurnEndAnimation();
      
      // 更新UI
      this.gameController.uiManager.updateBattleUI();
      
      // 延遲執行敵人回合
      setTimeout(() => {
        this.startEnemyTurn();
      }, 1000);
    }
  
    /**
     * 開始敵人回合
     */
    startEnemyTurn() {
      console.log('開始敵人回合');
      
      // 應用回合開始效果
      this._applyTurnStartEffects('enemy');
      
      // 檢查是否有眩暈效果
      const stunEffect = this.gameController.state.battle.activeEffects.find(
        e => e.type === 'stun' && e.source === 'player'
      );
      
      if (stunEffect) {
        console.log('敵人被眩暈，跳過回合');
        
        // 移除眩暈效果
        this.gameController.state.battle.activeEffects = this.gameController.state.battle.activeEffects.filter(
          e => e.id !== stunEffect.id
        );
        
        // 播放眩暈動畫
        this.gameController.animationManager.playStunAnimation();
        
        // 直接結束敵人回合
        setTimeout(() => {
          this.endEnemyTurn();
        }, 1000);
        
        return;
      }
      
      // 執行敵人行動
      this._executeEnemyAction();
    }
  
    /**
     * 結束敵人回合
     */
    endEnemyTurn() {
      console.log('結束敵人回合');
      
      // 應用回合結束效果
      this._applyTurnEndEffects('enemy');
      
      // 檢查遊戲是否結束
      if (this.gameController.state.player.health <= 0) {
        this.endBattle(false);
        return;
      }
      
      // 開始新的玩家回合
      this.startPlayerTurn();
    }
  
    /**
     * 結束戰鬥
     * @param {boolean} isVictory - 是否勝利
     */
    endBattle(isVictory) {
      console.log(`戰鬥結束，勝利: ${isVictory}`);
      
      this.currentBattle.isGameOver = true;
      this.currentBattle.isVictory = isVictory;
      
      this.gameController.state.battle.isGameOver = true;
      this.gameController.state.battle.isVictory = isVictory;
      
      if (isVictory) {
        // 獲取關卡信息
        const level = this.gameController.resourceManager.getLevelById(this.currentBattle.levelId);
        if (level) {
          // 給予獎勵
          this._giveRewards(level);
        }
        
        // 播放勝利音效
        this.gameController.soundManager.play('victory');
        
        // 播放勝利動畫
        this.gameController.animationManager.playVictoryAnimation();
        
        // 保存遊戲
        this.gameController.saveManager.saveGame(this.gameController.state.progress);
        
        // 檢查成就
        this.gameController.achievementManager.checkAchievements();
      } else {
        // 播放失敗音效
        this.gameController.soundManager.play('defeat');
        
        // 播放失敗動畫
        this.gameController.animationManager.playDefeatAnimation();
      }
      
      // 延遲顯示結果屏幕
      setTimeout(() => {
        this.gameController.showScreen('gameOver');
      }, 1500);
    }
  
    /**
     * 執行敵人行動
     */
    _executeEnemyAction() {
      const { enemy, player } = this.gameController.state;
      
      // 獲取敵人AI
      const enemyData = this.gameController.resourceManager.getEnemyById(enemy.id);
      if (!enemyData || !enemyData.actions) {
        // 如果沒有特定行動，則執行默認攻擊
        this._executeEnemyAttack();
        return;
      }
      
      // 根據敵人AI選擇行動
      const possibleActions = enemyData.actions.filter(action => {
        // 檢查行動條件
        if (action.condition) {
          switch (action.condition.type) {
            case 'health_below':
              return enemy.health < enemy.maxHealth * (action.condition.value / 100);
            case 'health_above':
              return enemy.health > enemy.maxHealth * (action.condition.value / 100);
            case 'player_health_below':
              return player.health < player.maxHealth * (action.condition.value / 100);
            case 'turn_count':
              return this.turnCount >= action.condition.value;
            case 'random':
              return Math.random() < action.condition.value;
            default:
              return true;
          }
        }
        return true;
      });
      
      // 如果沒有符合條件的行動，則執行默認攻擊
      if (possibleActions.length === 0) {
        this._executeEnemyAttack();
        return;
      }
      
      // 隨機選擇一個行動
      const selectedAction = possibleActions[Math.floor(Math.random() * possibleActions.length)];
      
      // 執行選擇的行動
      switch (selectedAction.type) {
        case 'attack':
          this._executeEnemyAttack(selectedAction.value);
          break;
        case 'heal':
          this._executeEnemyHeal(selectedAction.value);
          break;
        case 'buff':
          this._executeEnemyBuff(selectedAction.buff, selectedAction.value, selectedAction.duration);
          break;
        case 'debuff':
          this._executeEnemyDebuff(selectedAction.debuff, selectedAction.value, selectedAction.duration);
          break;
        case 'special':
          this._executeEnemySpecial(selectedAction.name, selectedAction.effect);
          break;
        default:
          this._executeEnemyAttack();
      }
    }
  
    /**
     * 執行敵人攻擊
     * @param {number} damageMultiplier - 傷害倍數
     */
    _executeEnemyAttack(damageMultiplier = 1) {
      console.log(`敵人攻擊，傷害倍數: ${damageMultiplier}`);
      
      const { enemy, battle } = this.gameController.state;
      
      // 計算攻擊傷害
      let damage = enemy.attack * damageMultiplier;
      
      // 檢查虛弱效果
      const weaknessEffect = battle.activeEffects.find(e => e.type === 'weakness' && e.source === 'player');
      if (weaknessEffect) {
        damage = Math.max(0, damage - weaknessEffect.value);
      }
      
      // 檢查護盾效果
      let remainingDamage = damage;
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
        this.gameController.state.player.health = Math.max(0, this.gameController.state.player.health - remainingDamage);
        
        // 播放受傷音效
        this.gameController.soundManager.play('player-hit');
        
        // 播放受傷動畫
        this.gameController.animationManager.playPlayerHitAnimation();
        
        console.log(`敵人對玩家造成 ${remainingDamage} 點傷害`);
      } else {
        console.log('玩家的護盾抵擋了所有傷害');
        
        // 播放護盾音效
        this.gameController.soundManager.play('shield-block');
      }
      
      // 檢查反傷效果
      const thornsEffect = battle.activeEffects.find(e => e.type === 'thorns' && e.source === 'player');
      if (thornsEffect && damage > 0) {
        enemy.health = Math.max(0, enemy.health - thornsEffect.value);
        
        console.log(`反傷效果對敵人造成 ${thornsEffect.value} 點傷害`);
        
        // 播放反傷音效
        this.gameController.soundManager.play('thorns');
        
        // 檢查敵人是否死亡
        if (enemy.health <= 0) {
          this.endBattle(true);
          return;
        }
      }
      
      // 檢查反射效果
      const reflectEffect = battle.activeEffects.find(e => e.type === 'reflect' && e.source === 'player');
      if (reflectEffect && damage > 0) {
        const reflectDamage = Math.floor(damage * (reflectEffect.value / 100));
        enemy.health = Math.max(0, enemy.health - reflectDamage);
        
        console.log(`反射效果對敵人造成 ${reflectDamage} 點傷害`);
        
        // 播放反射音效
        this.gameController.soundManager.play('reflect');
        
        // 檢查敵人是否死亡
        if (enemy.health <= 0) {
          this.endBattle(true);
          return;
        }
      }
      
      // 更新UI
      this.gameController.uiManager.updateBattleUI();
      
      // 延遲結束敵人回合
      setTimeout(() => {
        this.endEnemyTurn();
      }, 1000);
    }
  
    /**
     * 執行敵人治療
     * @param {number} healAmount - 治療量
     */
    _executeEnemyHeal(healAmount) {
      console.log(`敵人治療，治療量: ${healAmount}`);
      
      const { enemy } = this.gameController.state;
      
      // 計算治療量
      const healValue = typeof healAmount === 'number' ? healAmount : Math.floor(enemy.maxHealth * 0.2);
      
      // 應用治療
      enemy.health = Math.min(enemy.maxHealth, enemy.health + healValue);
      
      // 播放治療音效
      this.gameController.soundManager.play('enemy-heal');
      
      // 播放治療動畫
      this.gameController.animationManager.playEnemyHealAnimation();
      
      console.log(`敵人恢復了 ${healValue} 點生命值`);
      
      // 更新UI
      this.gameController.uiManager.updateBattleUI();
      
      // 延遲結束敵人回合
      setTimeout(() => {
        this.endEnemyTurn();
      }, 1000);
    }
  
    /**
     * 執行敵人增益
     * @param {string} buffType - 增益類型
     * @param {number} value - 增益值
     * @param {number} duration - 持續回合
     */
    _executeEnemyBuff(buffType, value, duration = 2) {
      console.log(`敵人增益，類型: ${buffType}，值: ${value}，持續: ${duration} 回合`);
      
      const { battle } = this.gameController.state;
      
      // 添加增益效果
      battle.activeEffects.push({
        id: `${buffType}_${Date.now()}`,
        type: buffType,
        value: value,
        duration: duration,
        source: 'enemy'
      });
      
      // 播放增益音效
      this.gameController.soundManager.play('enemy-buff');
      
      // 播放增益動畫
      this.gameController.animationManager.playEnemyBuffAnimation();
      
      console.log(`敵人獲得 ${buffType} 增益，值: ${value}，持續 ${duration} 回合`);
      
      // 更新UI
      this.gameController.uiManager.updateBattleUI();
      
      // 延遲結束敵人回合
      setTimeout(() => {
        this.endEnemyTurn();
      }, 1000);
    }
  
    /**
     * 執行敵人減益
     * @param {string} debuffType - 減益類型
     * @param {number} value - 減益值
     * @param {number} duration - 持續回合
     */
    _executeEnemyDebuff(debuffType, value, duration = 2) {
      console.log(`敵人施加減益，類型: ${debuffType}，值: ${value}，持續: ${duration} 回合`);
      
      const { battle } = this.gameController.state;
      
      // 添加減益效果
      battle.activeEffects.push({
        id: `${debuffType}_${Date.now()}`,
        type: debuffType,
        value: value,
        duration: duration,
        source: 'enemy'
      });
      
      // 播放減益音效
      this.gameController.soundManager.play('enemy-debuff');
      
      // 播放減益動畫
      this.gameController.animationManager.playEnemyDebuffAnimation();
      
      console.log(`敵人對玩家施加 ${debuffType} 減益，值: ${value}，持續 ${duration} 回合`);
      
      // 更新UI
      this.gameController.uiManager.updateBattleUI();
      
      // 延遲結束敵人回合
      setTimeout(() => {
        this.endEnemyTurn();
      }, 1000);
    }
  
    /**
     * 執行敵人特殊行動
     * @param {string} name - 特殊行動名稱
     * @param {Object} effect - 特殊行動效果
     */
    _executeEnemySpecial(name, effect) {
      console.log(`敵人特殊行動: ${name}`);
      
      // 播放特殊行動音效
      this.gameController.soundManager.play('enemy-special');
      
      // 播放特殊行動動畫
      this.gameController.animationManager.playEnemySpecialAnimation();
      
      // 根據特殊行動類型執行不同效果
      if (effect) {
        if (effect.damage) {
          // 造成傷害
          const damage = effect.damage;
          this.gameController.state.player.health = Math.max(0, this.gameController.state.player.health - damage);
          
          console.log(`特殊行動對玩家造成 ${damage} 點傷害`);
          
          // 檢查玩家是否死亡
          if (this.gameController.state.player.health <= 0) {
            this.endBattle(false);
            return;
          }
        }
        
        if (effect.heal) {
          // 治療
          const healAmount = effect.heal;
          this.gameController.state.enemy.health = Math.min(
            this.gameController.state.enemy.maxHealth,
            this.gameController.state.enemy.health + healAmount
          );
          
          console.log(`特殊行動使敵人恢復 ${healAmount} 點生命值`);
        }
        
        if (effect.buff) {
          // 增益
          this._executeEnemyBuff(effect.buff.type, effect.buff.value, effect.buff.duration);
        }
        
        if (effect.debuff) {
          // 減益
          this._executeEnemyDebuff(effect.debuff.type, effect.debuff.value, effect.debuff.duration);
        }
        
        if (effect.discard) {
          // 棄牌
          const discardCount = effect.discard;
          for (let i = 0; i < discardCount && this.gameController.state.cards.hand.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * this.gameController.state.cards.hand.length);
            this.gameController.cardManager.discardCard(randomIndex);
          }
          
          console.log(`特殊行動使玩家棄置 ${discardCount} 張手牌`);
        }
      }
      
      // 更新UI
      this.gameController.uiManager.updateBattleUI();
      
      // 延遲結束敵人回合
      setTimeout(() => {
        this.endEnemyTurn();
      }, 1000);
    }
  
    /**
     * 應用回合開始效果
     * @param {string} source - 效果來源 ('player' 或 'enemy')
     */
    _applyTurnStartEffects(source) {
      console.log(`應用${source === 'player' ? '玩家' : '敵人'}回合開始效果`);
      
      // 應用持續效果
      this.gameController.effectManager.applyActiveEffects(source);
      
      // 減少效果持續時間
      this._decreaseEffectsDuration(source);
    }
  
    /**
     * 應用回合結束效果
     * @param {string} source - 效果來源 ('player' 或 'enemy')
     */
    _applyTurnEndEffects(source) {
      console.log(`應用${source === 'player' ? '玩家' : '敵人'}回合結束效果`);
      
      // 特定回合結束效果可以在這裡添加
    }
  
    /**
     * 減少效果持續時間
     * @param {string} source - 效果來源 ('player' 或 'enemy')
     */
    _decreaseEffectsDuration(source) {
      const { battle } = this.gameController.state;
      
      // 減少持續時間並移除過期效果
      battle.activeEffects = battle.activeEffects.map(effect => {
        // 只處理指定來源的效果
        if (effect.source === source) {
          return { ...effect, duration: effect.duration - 1 };
        }
        return effect;
      }).filter(effect => effect.duration > 0);
    }
  
    /**
     * 抽牌到手牌
     */
    _drawCardsToHand() {
      const { cards } = this.gameController.state;
      
      // 抽牌直到手牌達到5張
      while (cards.hand.length < 5) {
        if (cards.deck.length === 0 && cards.discardPile.length === 0) {
          break;
        }
        
        if (cards.deck.length === 0) {
          // 洗牌
          cards.deck = [...cards.discardPile];
          cards.discardPile = [];
          this.gameController.cardManager.shuffleDeck();
          
          this.gameController.uiManager.showToast('棄牌堆已洗入牌庫');
        }
        
        const card = cards.deck.pop();
        if (card) {
          cards.hand.push(card);
          
          // 播放抽牌音效
          this.gameController.soundManager.play('card-draw');
          
          // 播放抽牌動畫
          this.gameController.animationManager.playDrawAnimation();
        }
      }
    }
  
    /**
     * 給予獎勵
     * @param {Object} level - 關卡信息
     */
    _giveRewards(level) {
      const { player, progress } = this.gameController.state;
      
      // 獲得金幣
      const goldReward = level.rewards.gold;
      player.gold += goldReward;
      progress.stats.totalGoldEarned += goldReward;
      
      console.log(`獲得 ${goldReward} 金幣`);
      
      // 獲得經驗值
      const expReward = level.rewards.experience;
      player.experience += expReward;
      
      console.log(`獲得 ${expReward} 經驗值`);
      
      // 檢查是否升級
      this._checkLevelUp();
      
      // 解鎖下一關
      this._unlockNextLevel(level);
      
      // 獲得卡牌獎勵
      this._giveCardRewards(level);
      
      // 更新統計數據
      progress.stats.totalBattlesWon += 1;
    }
  
    /**
     * 檢查是否升級
     */
    _checkLevelUp() {
      const { player } = this.gameController.state;
      
      const expNeeded = player.level * 100;
      if (player.experience >= expNeeded) {
        player.level += 1;
        player.experience -= expNeeded;
        player.maxHealth += 10;
        player.maxMana += 1;
        
        // 播放升級音效
        this.gameController.soundManager.play('level-up');
        
        this.gameController.uiManager.showToast('升級！生命值和魔力上限提升');
        
        console.log(`玩家升級到 ${player.level} 級`);
        
        // 如果還有多餘的經驗值，繼續檢查升級
        if (player.experience >= player.level * 100) {
          this._checkLevelUp();
        }
      }
    }
  
    /**
     * 解鎖下一關
     * @param {Object} level - 當前關卡信息
     */
    _unlockNextLevel(level) {
      const { progress } = this.gameController.state;
      
      if (level.id < this.gameController.resourceManager.getLevelsCount() && 
          !progress.unlockedLevels.includes(level.id + 1)) {
        progress.unlockedLevels.push(level.id + 1);
        
        const nextLevel = this.gameController.resourceManager.getLevelById(level.id + 1);
        if (nextLevel) {
          this.gameController.uiManager.showToast(`解鎖新關卡：${nextLevel.name}`);
          console.log(`解鎖新關卡：${nextLevel.name}`);
        }
      }
    }
  
    /**
     * 給予卡牌獎勵
     * @param {Object} level - 關卡信息
     */
    _giveCardRewards(level) {
      const { progress } = this.gameController.state;
      
      if (level.rewards.cards && level.rewards.cards.length > 0) {
        level.rewards.cards.forEach(cardId => {
          const rewardCard = this.gameController.resourceManager.getCardById(cardId);
          if (rewardCard) {
            progress.ownedCards.push({ ...rewardCard });
            this.gameController.uiManager.showToast(`獲得新卡牌：${rewardCard.name}`);
            console.log(`獲得新卡牌：${rewardCard.name}`);
          }
        });
      }
    }
  }