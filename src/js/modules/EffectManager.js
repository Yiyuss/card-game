/**
 * 效果管理器
 * 負責處理所有與效果相關的操作
 */
export class EffectManager {
    constructor(gameController) {
      this.gameController = gameController;
    }
  
    /**
     * 初始化效果管理器
     */
    init() {
      console.log('初始化效果管理器...');
      console.log('效果管理器初始化完成');
    }
  
    /**
     * 應用效果
     * @param {Object} effect - 效果對象
     */
    applyEffect(effect) {
      if (!effect || !effect.type) return;
      
      // 生成唯一ID
      effect.id = effect.id || `${effect.type}_${Date.now()}`;
      
      // 添加到活動效果列表
      this.gameController.state.battle.activeEffects.push(effect);
      
      console.log(`應用效果: ${effect.type}, 值: ${effect.value}, 持續: ${effect.duration} 回合`);
      
      // 播放效果音效
      this._playEffectSound(effect);
      
      // 播放效果動畫
      this._playEffectAnimation(effect);
      
      // 立即應用某些效果
      this._applyImmediateEffect(effect);
    }
  
    /**
     * 播放效果音效
     * @param {Object} effect - 效果對象
     */
    _playEffectSound(effect) {
      switch (effect.type) {
        case 'poison':
          this.gameController.soundManager.play('poison');
          break;
        case 'burn':
          this.gameController.soundManager.play('burn');
          break;
        case 'shield':
          this.gameController.soundManager.play('shield');
          break;
        case 'strength':
          this.gameController.soundManager.play('buff');
          break;
        case 'weakness':
          this.gameController.soundManager.play('debuff');
          break;
        case 'regeneration':
          this.gameController.soundManager.play('heal');
          break;
        case 'stun':
          this.gameController.soundManager.play('stun');
          break;
        default:
          this.gameController.soundManager.play('effect');
      }
    }
  
    /**
     * 播放效果動畫
     * @param {Object} effect - 效果對象
     */
    _playEffectAnimation(effect) {
      const target = effect.source === 'player' ? 'enemy' : 'player';
      
      switch (effect.type) {
        case 'poison':
          this.gameController.animationManager.playPoisonAnimation(target);
          break;
        case 'burn':
          this.gameController.animationManager.playBurnAnimation(target);
          break;
        case 'shield':
          this.gameController.animationManager.playShieldAnimation(effect.source);
          break;
        case 'strength':
          this.gameController.animationManager.playBuffAnimation(effect.source);
          break;
        case 'weakness':
          this.gameController.animationManager.playDebuffAnimation(target);
          break;
        case 'regeneration':
          this.gameController.animationManager.playRegenerationAnimation(effect.source);
          break;
        case 'stun':
          this.gameController.animationManager.playStunAnimation(target);
          break;
        default:
          this.gameController.animationManager.playEffectAnimation(target);
      }
    }
  
    /**
     * 立即應用某些效果
     * @param {Object} effect - 效果對象
     */
    _applyImmediateEffect(effect) {
      // 某些效果需要立即應用
      switch (effect.type) {
        case 'strength':
          if (effect.source === 'player') {
            // 增加玩家攻擊力（在卡牌效果中體現）
          } else {
            // 增加敵人攻擊力
            this.gameController.state.enemy.attack += effect.value;
          }
          break;
      }
    }
  
    /**
     * 應用所有活動效果
     */
    applyActiveEffects() {
      const { battle } = this.gameController.state;
      
      // 複製效果列表，避免在迭代過程中修改原列表
      const effects = [...battle.activeEffects];
      
      for (const effect of effects) {
        // 應用效果
        this._applyEffectByType(effect);
        
        // 減少持續時間
        effect.duration -= 1;
        
        // 移除已過期的效果
        if (effect.duration <= 0) {
          battle.activeEffects = battle.activeEffects.filter(e => e.id !== effect.id);
          console.log(`效果 ${effect.type} 已過期`);
          
          // 處理效果過期後的特殊邏輯
          this._handleExpiredEffect(effect);
        }
      }
    }
  
    /**
     * 根據類型應用效果
     * @param {Object} effect - 效果對象
     */
    _applyEffectByType(effect) {
      switch (effect.type) {
        case 'poison':
          this._applyPoisonEffect(effect);
          break;
        case 'burn':
          this._applyBurnEffect(effect);
          break;
        case 'bleed':
          this._applyBleedEffect(effect);
          break;
        case 'regeneration':
          this._applyRegenerationEffect(effect);
          break;
        case 'thorns':
          // 荊棘效果在受到攻擊時處理，這裡不需要額外處理
          break;
        case 'shield':
          // 護盾效果在受到攻擊時處理，這裡不需要額外處理
          break;
        case 'weakness':
          // 虛弱效果在計算攻擊力時處理，這裡不需要額外處理
          break;
        case 'strength':
          // 力量效果已在應用時處理，這裡不需要額外處理
          break;
        case 'stun':
          // 擊暈效果在行動時處理，這裡不需要額外處理
          break;
        case 'disarm':
          // 繳械效果在使用卡牌時處理，這裡不需要額外處理
          break;
      }
    }
  
    /**
     * 應用中毒效果
     * @param {Object} effect - 效果對象
     */
    _applyPoisonEffect(effect) {
      const damage = effect.value;
      
      if (effect.source === 'player') {
        // 敵人中毒
        const enemyDied = this.gameController.enemyManager.takeDamage(damage);
        console.log(`敵人受到 ${damage} 點中毒傷害`);
        
        // 播放中毒傷害動畫
        this.gameController.animationManager.playPoisonDamageAnimation('enemy');
        
        // 檢查敵人是否死亡
        if (enemyDied) {
          this.gameController.endBattle(true);
        }
      } else {
        // 玩家中毒
        const playerDied = this.gameController.playerManager.takeDamage(damage);
        console.log(`玩家受到 ${damage} 點中毒傷害`);
        
        // 播放中毒傷害動畫
        this.gameController.animationManager.playPoisonDamageAnimation('player');
        
        // 檢查玩家是否死亡
        if (playerDied) {
          this.gameController.endBattle(false);
        }
      }
    }
  
    /**
     * 應用燃燒效果
     * @param {Object} effect - 效果對象
     */
    _applyBurnEffect(effect) {
      const damage = effect.value;
      
      if (effect.source === 'player') {
        // 敵人燃燒
        const enemyDied = this.gameController.enemyManager.takeDamage(damage);
        console.log(`敵人受到 ${damage} 點燃燒傷害`);
        
        // 播放燃燒傷害動畫
        this.gameController.animationManager.playBurnDamageAnimation('enemy');
        
        // 檢查敵人是否死亡
        if (enemyDied) {
          this.gameController.endBattle(true);
        }
      } else {
        // 玩家燃燒
        const playerDied = this.gameController.playerManager.takeDamage(damage);
        console.log(`玩家受到 ${damage} 點燃燒傷害`);
        
        // 播放燃燒傷害動畫
        this.gameController.animationManager.playBurnDamageAnimation('player');
        
        // 檢查玩家是否死亡
        if (playerDied) {
          this.gameController.endBattle(false);
        }
      }
    }
  
    /**
     * 應用流血效果
     * @param {Object} effect - 效果對象
     */
    _applyBleedEffect(effect) {
      const damage = effect.value;
      
      if (effect.source === 'player') {
        // 敵人流血
        const enemyDied = this.gameController.enemyManager.takeDamage(damage);
        console.log(`敵人受到 ${damage} 點流血傷害`);
        
        // 播放流血傷害動畫
        this.gameController.animationManager.playBleedDamageAnimation('enemy');
        
        // 檢查敵人是否死亡
        if (enemyDied) {
          this.gameController.endBattle(true);
        }
      } else {
        // 玩家流血
        const playerDied = this.gameController.playerManager.takeDamage(damage);
        console.log(`玩家受到 ${damage} 點流血傷害`);
        
        // 播放流血傷害動畫
        this.gameController.animationManager.playBleedDamageAnimation('player');
        
        // 檢查玩家是否死亡
        if (playerDied) {
          this.gameController.endBattle(false);
        }
      }
    }
  
    /**
     * 應用再生效果
     * @param {Object} effect - 效果對象
     */
    _applyRegenerationEffect(effect) {
      const healAmount = effect.value;
      
      if (effect.source === 'player') {
        // 玩家再生
        this.gameController.playerManager.heal(healAmount);
        console.log(`玩家恢復 ${healAmount} 點生命值`);
        
        // 播放再生治療動畫
        this.gameController.animationManager.playRegenerationHealAnimation('player');
      } else {
        // 敵人再生
        const { enemy } = this.gameController.state;
        const oldHealth = enemy.health;
        enemy.health = Math.min(enemy.maxHealth, enemy.health + healAmount);
        const actualHeal = enemy.health - oldHealth;
        
        console.log(`敵人恢復 ${actualHeal} 點生命值`);
        
        // 播放再生治療動畫
        this.gameController.animationManager.playRegenerationHealAnimation('enemy');
      }
    }
  
    /**
     * 處理效果過期後的特殊邏輯
     * @param {Object} effect - 效果對象
     */
    _handleExpiredEffect(effect) {
      switch (effect.type) {
        case 'strength':
          if (effect.source === 'enemy') {
            // 敵人力量效果過期，恢復原始攻擊力
            this.gameController.state.enemy.attack = Math.max(1, this.gameController.state.enemy.attack - effect.value);
          }
          break;
      }
    }
  
    /**
     * 移除指定效果
     * @param {string} effectId - 效果ID
     * @returns {boolean} - 是否成功移除
     */
    removeEffect(effectId) {
      const { battle } = this.gameController.state;
      
      const effectIndex = battle.activeEffects.findIndex(e => e.id === effectId);
      if (effectIndex === -1) return false;
      
      const effect = battle.activeEffects[effectIndex];
      
      // 處理效果移除後的特殊邏輯
      this._handleExpiredEffect(effect);
      
      // 從活動效果列表中移除
      battle.activeEffects.splice(effectIndex, 1);
      
      console.log(`移除效果: ${effect.type}`);
      return true;
    }
  
    /**
     * 移除指定類型的所有效果
     * @param {string} type - 效果類型
     * @param {string} source - 效果來源 ('player' 或 'enemy')
     * @returns {number} - 移除的效果數量
     */
    removeEffectsByType(type, source) {
      const { battle } = this.gameController.state;
      
      const effectsToRemove = battle.activeEffects.filter(e => e.type === type && e.source === source);
      
      // 處理每個效果移除後的特殊邏輯
      effectsToRemove.forEach(effect => {
        this._handleExpiredEffect(effect);
      });
      
      // 從活動效果列表中移除
      battle.activeEffects = battle.activeEffects.filter(e => !(e.type === type && e.source === source));
      
      console.log(`移除 ${effectsToRemove.length} 個 ${type} 效果`);
      return effectsToRemove.length;
    }
  
    /**
     * 清除所有效果
     */
    clearAllEffects() {
      this.gameController.state.battle.activeEffects = [];
      console.log('清除所有效果');
    }
  
    /**
     * 獲取指定類型的效果
     * @param {string} type - 效果類型
     * @param {string} source - 效果來源 ('player' 或 'enemy')
     * @returns {Array} - 效果列表
     */
    getEffectsByType(type, source) {
      return this.gameController.state.battle.activeEffects.filter(e => e.type === type && e.source === source);
    }
  
    /**
     * 獲取指定來源的所有效果
     * @param {string} source - 效果來源 ('player' 或 'enemy')
     * @returns {Array} - 效果列表
     */
    getEffectsBySource(source) {
      return this.gameController.state.battle.activeEffects.filter(e => e.source === source);
    }
  
    /**
     * 獲取所有活動效果
     * @returns {Array} - 效果列表
     */
    getAllActiveEffects() {
      return [...this.gameController.state.battle.activeEffects];
    }
  
    /**
     * 創建效果對象
     * @param {string} type - 效果類型
     * @param {number} value - 效果值
     * @param {number} duration - 持續回合數
     * @param {string} source - 效果來源 ('player' 或 'enemy')
     * @returns {Object} - 效果對象
     */
    createEffect(type, value, duration, source) {
      return {
        id: `${type}_${Date.now()}`,
        type,
        value,
        duration,
        source
      };
    }
  
    /**
     * 應用荊棘效果
     * @param {Object} effect - 荊棘效果
     * @param {number} damage - 攻擊傷害
     * @returns {number} - 反傷值
     */
    applyThornsEffect(effect, damage) {
      if (!effect || effect.type !== 'thorns') return 0;
      
      const thornsDamage = Math.min(damage, effect.value);
      
      console.log(`荊棘效果反彈 ${thornsDamage} 點傷害`);
      
      // 播放荊棘效果音效
      this.gameController.soundManager.play('thorns');
      
      // 播放荊棘效果動畫
      this.gameController.animationManager.playThornsAnimation(effect.source);
      
      return thornsDamage;
    }
  
    /**
     * 檢查是否有特定效果
     * @param {string} type - 效果類型
     * @param {string} source - 效果來源 ('player' 或 'enemy')
     * @returns {boolean} - 是否有該效果
     */
    hasEffect(type, source) {
      return this.gameController.state.battle.activeEffects.some(e => e.type === type && e.source === source);
    }
  
    /**
     * 獲取效果總值
     * @param {string} type - 效果類型
     * @param {string} source - 效果來源 ('player' 或 'enemy')
     * @returns {number} - 效果總值
     */
    getEffectTotalValue(type, source) {
      const effects = this.getEffectsByType(type, source);
      return effects.reduce((total, effect) => total + effect.value, 0);
    }
  
    /**
     * 更新效果值
     * @param {string} effectId - 效果ID
     * @param {number} newValue - 新的效果值
     * @returns {boolean} - 是否成功更新
     */
    updateEffectValue(effectId, newValue) {
      const { battle } = this.gameController.state;
      
      const effect = battle.activeEffects.find(e => e.id === effectId);
      if (!effect) return false;
      
      effect.value = newValue;
      console.log(`更新效果 ${effect.type} 的值為 ${newValue}`);
      
      return true;
    }
  
    /**
     * 延長效果持續時間
     * @param {string} effectId - 效果ID
     * @param {number} additionalTurns - 額外回合數
     * @returns {boolean} - 是否成功延長
     */
    extendEffectDuration(effectId, additionalTurns) {
      const { battle } = this.gameController.state;
      
      const effect = battle.activeEffects.find(e => e.id === effectId);
      if (!effect) return false;
      
      effect.duration += additionalTurns;
      console.log(`延長效果 ${effect.type} 的持續時間 ${additionalTurns} 回合`);
      
      return true;
    }
  
    /**
     * 獲取效果描述
     * @param {Object} effect - 效果對象
     * @returns {string} - 效果描述
     */
    getEffectDescription(effect) {
      if (!effect) return '';
      
      switch (effect.type) {
        case 'poison':
          return `中毒：每回合受到 ${effect.value} 點傷害，剩餘 ${effect.duration} 回合`;
        case 'burn':
          return `燃燒：每回合受到 ${effect.value} 點傷害，剩餘 ${effect.duration} 回合`;
        case 'bleed':
          return `流血：每回合受到 ${effect.value} 點傷害，剩餘 ${effect.duration} 回合`;
        case 'shield':
          return `護盾：抵擋 ${effect.value} 點傷害，剩餘 ${effect.duration} 回合`;
        case 'strength':
          return `力量：攻擊力增加 ${effect.value} 點，剩餘 ${effect.duration} 回合`;
        case 'weakness':
          return `虛弱：攻擊力降低 ${effect.value} 點，剩餘 ${effect.duration} 回合`;
        case 'regeneration':
          return `再生：每回合恢復 ${effect.value} 點生命值，剩餘 ${effect.duration} 回合`;
        case 'thorns':
          return `荊棘：受到攻擊時反彈 ${effect.value} 點傷害，剩餘 ${effect.duration} 回合`;
        case 'stun':
          return `擊暈：無法行動，剩餘 ${effect.duration} 回合`;
        case 'disarm':
          return `繳械：無法使用攻擊卡牌，剩餘 ${effect.duration} 回合`;
        default:
          return `${effect.type}：值為 ${effect.value}，剩餘 ${effect.duration} 回合`;
      }
    }
  }