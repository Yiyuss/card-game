/**
 * 敵人管理器
 * 負責處理所有與敵人相關的操作
 */
export class EnemyManager {
    constructor(gameController) {
      this.gameController = gameController;
    }
  
    /**
     * 初始化敵人管理器
     */
    init() {
      console.log('初始化敵人管理器...');
      console.log('敵人管理器初始化完成');
    }
  
    /**
     * 創建敵人
     * @param {string} enemyId - 敵人ID
     * @returns {Object} - 敵人對象
     */
    createEnemy(enemyId) {
      const enemyData = this.gameController.resourceManager.getEnemyById(enemyId);
      if (!enemyData) {
        console.error(`找不到敵人數據: ${enemyId}`);
        return null;
      }
      
      return {
        id: enemyData.id,
        name: enemyData.name,
        health: enemyData.health,
        maxHealth: enemyData.health,
        attack: enemyData.attack,
        image: enemyData.image,
        abilities: enemyData.abilities || [],
        patterns: enemyData.patterns || []
      };
    }
  
    /**
     * 設置當前敵人
     * @param {string} enemyId - 敵人ID
     */
    setCurrentEnemy(enemyId) {
      const enemy = this.createEnemy(enemyId);
      if (enemy) {
        this.gameController.state.enemy = enemy;
        console.log(`設置當前敵人: ${enemy.name}`);
      }
    }
  
    /**
     * 對敵人造成傷害
     * @param {number} amount - 傷害量
     * @returns {boolean} - 敵人是否死亡
     */
    takeDamage(amount) {
      if (amount <= 0) return false;
      
      const { enemy } = this.gameController.state;
      
      // 應用傷害
      enemy.health = Math.max(0, enemy.health - amount);
      
      // 播放敵人受傷音效
      this.gameController.soundManager.play('enemy-hit');
      
      // 播放敵人受傷動畫
      this.gameController.animationManager.playEnemyHitAnimation();
      
      console.log(`敵人 ${enemy.name} 受到 ${amount} 點傷害`);
      
      // 檢查敵人是否死亡
      return enemy.health <= 0;
    }
  
    /**
     * 敵人回合行動
     */
    performTurn() {
      const { enemy, battle } = this.gameController.state;
      
      // 檢查是否被擊暈
      const stunEffect = battle.activeEffects.find(e => e.type === 'stun' && e.source === 'player');
      if (stunEffect) {
        console.log(`敵人 ${enemy.name} 被擊暈，無法行動`);
        
        // 移除擊暈效果
        battle.activeEffects = battle.activeEffects.filter(e => e.id !== stunEffect.id);
        
        return;
      }
      
      // 如果敵人有行動模式，則按照模式行動
      if (enemy.patterns && enemy.patterns.length > 0) {
        this._performPatternAction();
      } else {
        // 否則執行基本攻擊
        this._performBasicAttack();
      }
    }
  
    /**
     * 執行基本攻擊
     */
    _performBasicAttack() {
      const { enemy } = this.gameController.state;
      let damage = enemy.attack;
      
      // 檢查虛弱效果
      const weaknessEffect = this.gameController.state.battle.activeEffects.find(
        e => e.type === 'weakness' && e.source === 'player'
      );
      
      if (weaknessEffect) {
        damage = Math.max(0, damage - weaknessEffect.value);
      }
      
      console.log(`敵人 ${enemy.name} 進行基本攻擊，造成 ${damage} 點傷害`);
      
      // 播放敵人攻擊音效
      this.gameController.soundManager.play('enemy-attack');
      
      // 播放敵人攻擊動畫
      this.gameController.animationManager.playEnemyAttackAnimation();
      
      // 對玩家造成傷害
      const playerDied = this.gameController.playerManager.takeDamage(damage);
      
      // 檢查玩家是否死亡
      if (playerDied) {
        this.gameController.endBattle(false);
      }
    }
  
    /**
     * 按照模式行動
     */
    _performPatternAction() {
      const { enemy, battle } = this.gameController.state;
      
      // 獲取當前回合數
      const turnCount = battle.turnCount || 0;
      
      // 根據回合數選擇行動模式
      const patternIndex = turnCount % enemy.patterns.length;
      const action = enemy.patterns[patternIndex];
      
      console.log(`敵人 ${enemy.name} 執行行動: ${action.name}`);
      
      switch (action.type) {
        case 'attack':
          this._performAttack(action);
          break;
        case 'buff':
          this._performBuff(action);
          break;
        case 'debuff':
          this._performDebuff(action);
          break;
        case 'heal':
          this._performHeal(action);
          break;
        case 'special':
          this._performSpecialAction(action);
          break;
        default:
          console.error(`未知的行動類型: ${action.type}`);
          this._performBasicAttack();
      }
    }
  
    /**
     * 執行攻擊行動
     * @param {Object} action - 行動對象
     */
    _performAttack(action) {
      const { enemy } = this.gameController.state;
      let damage = action.value || enemy.attack;
      
      // 檢查虛弱效果
      const weaknessEffect = this.gameController.state.battle.activeEffects.find(
        e => e.type === 'weakness' && e.source === 'player'
      );
      
      if (weaknessEffect) {
        damage = Math.max(0, damage - weaknessEffect.value);
      }
      
      console.log(`敵人 ${enemy.name} 使用 ${action.name}，造成 ${damage} 點傷害`);
      
      // 播放敵人攻擊音效
      this.gameController.soundManager.play('enemy-attack');
      
      // 播放敵人攻擊動畫
      this.gameController.animationManager.playEnemyAttackAnimation();
      
      // 對玩家造成傷害
      const playerDied = this.gameController.playerManager.takeDamage(damage);
      
      // 如果有附加效果
      if (action.effect) {
        this._applyAttackEffect(action);
      }
      
      // 檢查玩家是否死亡
      if (playerDied) {
        this.gameController.endBattle(false);
      }
    }
  
    /**
     * 應用攻擊附加效果
     * @param {Object} action - 行動對象
     */
    _applyAttackEffect(action) {
      if (!action.effect) return;
      
      const { battle } = this.gameController.state;
      
      switch (action.effect) {
        case 'poison':
          battle.activeEffects.push({
            id: `poison_${Date.now()}`,
            type: 'poison',
            value: action.effectValue || 2,
            duration: action.effectDuration || 3,
            source: 'enemy'
          });
          console.log(`玩家中毒，每回合受到 ${action.effectValue || 2} 點傷害，持續 ${action.effectDuration || 3} 回合`);
          break;
          
        case 'weakness':
          battle.activeEffects.push({
            id: `weakness_${Date.now()}`,
            type: 'weakness',
            value: action.effectValue || 1,
            duration: action.effectDuration || 2,
            source: 'enemy'
          });
          console.log(`玩家虛弱，攻擊力降低 ${action.effectValue || 1} 點，持續 ${action.effectDuration || 2} 回合`);
          break;
          
        case 'burn':
          battle.activeEffects.push({
            id: `burn_${Date.now()}`,
            type: 'burn',
            value: action.effectValue || 2,
            duration: action.effectDuration || 3,
            source: 'enemy'
          });
          console.log(`玩家燃燒，每回合受到 ${action.effectValue || 2} 點傷害，持續 ${action.effectDuration || 3} 回合`);
          break;
          
        case 'bleed':
          battle.activeEffects.push({
            id: `bleed_${Date.now()}`,
            type: 'bleed',
            value: action.effectValue || 1,
            duration: action.effectDuration || 3,
            source: 'enemy'
          });
          console.log(`玩家流血，每回合受到 ${action.effectValue || 1} 點傷害，持續 ${action.effectDuration || 3} 回合`);
          break;
          
        case 'stun':
          battle.activeEffects.push({
            id: `stun_${Date.now()}`,
            type: 'stun',
            value: 0,
            duration: 1,
            source: 'enemy'
          });
          console.log('玩家被擊暈，下回合無法行動');
          break;
      }
    }
  
    /**
     * 執行增益行動
     * @param {Object} action - 行動對象
     */
    _performBuff(action) {
      const { enemy, battle } = this.gameController.state;
      
      switch (action.buffType) {
        case 'strength':
          enemy.attack += action.value || 2;
          console.log(`敵人 ${enemy.name} 使用 ${action.name}，攻擊力增加 ${action.value || 2} 點`);
          break;
          
        case 'shield':
          battle.activeEffects.push({
            id: `shield_${Date.now()}`,
            type: 'shield',
            value: action.value || 5,
            duration: action.duration || 1,
            source: 'enemy'
          });
          console.log(`敵人 ${enemy.name} 使用 ${action.name}，獲得 ${action.value || 5} 點護盾，持續 ${action.duration || 1} 回合`);
          break;
          
        case 'regen':
          battle.activeEffects.push({
            id: `regen_${Date.now()}`,
            type: 'regeneration',
            value: action.value || 3,
            duration: action.duration || 3,
            source: 'enemy'
          });
          console.log(`敵人 ${enemy.name} 使用 ${action.name}，獲得再生效果，每回合恢復 ${action.value || 3} 點生命值，持續 ${action.duration || 3} 回合`);
          break;
          
        case 'thorns':
          battle.activeEffects.push({
            id: `thorns_${Date.now()}`,
            type: 'thorns',
            value: action.value || 2,
            duration: action.duration || 2,
            source: 'enemy'
          });
          console.log(`敵人 ${enemy.name} 使用 ${action.name}，獲得荊棘效果，玩家攻擊時受到 ${action.value || 2} 點反傷，持續 ${action.duration || 2} 回合`);
          break;
      }
      
      // 播放增益音效
      this.gameController.soundManager.play('buff');
      
      // 播放增益動畫
      this.gameController.animationManager.playBuffAnimation('enemy');
    }
  
    /**
     * 執行減益行動
     * @param {Object} action - 行動對象
     */
    _performDebuff(action) {
      const { battle } = this.gameController.state;
      
      switch (action.debuffType) {
        case 'weakness':
          battle.activeEffects.push({
            id: `weakness_${Date.now()}`,
            type: 'weakness',
            value: action.value || 2,
            duration: action.duration || 2,
            source: 'enemy'
          });
          console.log(`玩家虛弱，攻擊力降低 ${action.value || 2} 點，持續 ${action.duration || 2} 回合`);
          break;
          
        case 'poison':
          battle.activeEffects.push({
            id: `poison_${Date.now()}`,
            type: 'poison',
            value: action.value || 2,
            duration: action.duration || 3,
            source: 'enemy'
          });
          console.log(`玩家中毒，每回合受到 ${action.value || 2} 點傷害，持續 ${action.duration || 3} 回合`);
          break;
          
        case 'burn':
          battle.activeEffects.push({
            id: `burn_${Date.now()}`,
            type: 'burn',
            value: action.value || 3,
            duration: action.duration || 2,
            source: 'enemy'
          });
          console.log(`玩家燃燒，每回合受到 ${action.value || 3} 點傷害，持續 ${action.duration || 2} 回合`);
          break;
          
        case 'disarm':
          battle.activeEffects.push({
            id: `disarm_${Date.now()}`,
            type: 'disarm',
            value: 0,
            duration: action.duration || 1,
            source: 'enemy'
          });
          console.log(`玩家被繳械，下回合無法使用攻擊卡牌，持續 ${action.duration || 1} 回合`);
          break;
      }
      
      // 播放減益音效
      this.gameController.soundManager.play('debuff');
      
      // 播放減益動畫
      this.gameController.animationManager.playDebuffAnimation('player');
    }
  
    /**
     * 執行治療行動
     * @param {Object} action - 行動對象
     */
    _performHeal(action) {
      const { enemy } = this.gameController.state;
      const healAmount = action.value || 10;
      
      // 應用治療
      const oldHealth = enemy.health;
      enemy.health = Math.min(enemy.maxHealth, enemy.health + healAmount);
      const actualHeal = enemy.health - oldHealth;
      
      console.log(`敵人 ${enemy.name} 使用 ${action.name}，恢復 ${actualHeal} 點生命值`);
      
      // 播放治療音效
      this.gameController.soundManager.play('heal');
      
      // 播放治療動畫
      this.gameController.animationManager.playHealAnimation('enemy');
    }
  
    /**
     * 執行特殊行動
     * @param {Object} action - 行動對象
     */
    _performSpecialAction(action) {
      const { enemy, battle } = this.gameController.state;
      
      switch (action.specialType) {
        case 'multiAttack':
          // 多重攻擊
          const attackCount = action.count || 3;
          const damagePerHit = action.value || Math.floor(enemy.attack / attackCount);
          
          console.log(`敵人 ${enemy.name} 使用 ${action.name}，進行 ${attackCount} 次攻擊，每次造成 ${damagePerHit} 點傷害`);
          
          // 播放多重攻擊音效
          this.gameController.soundManager.play('multi-attack');
          
          // 播放多重攻擊動畫
          this.gameController.animationManager.playMultiAttackAnimation();
          
          // 執行多次攻擊
          let playerDied = false;
          for (let i = 0; i < attackCount; i++) {
            if (!playerDied) {
              playerDied = this.gameController.playerManager.takeDamage(damagePerHit);
              
              // 如果玩家死亡，結束戰鬥
              if (playerDied) {
                this.gameController.endBattle(false);
                break;
              }
            }
          }
          break;
          
        case 'summon':
          // 召喚小怪（在這個簡單的遊戲中，我們只是增加敵人的攻擊力來模擬）
          enemy.attack += action.value || 3;
          
          console.log(`敵人 ${enemy.name} 使用 ${action.name}，召喚了援軍，攻擊力增加 ${action.value || 3} 點`);
          
          // 播放召喚音效
          this.gameController.soundManager.play('summon');
          
          // 播放召喚動畫
          this.gameController.animationManager.playSummonAnimation();
          break;
          
        case 'lifeSteal':
          // 生命偷取
          const damage = action.value || enemy.attack;
          const stealPercent = action.stealPercent || 50;
          
          console.log(`敵人 ${enemy.name} 使用 ${action.name}，造成 ${damage} 點傷害，並恢復 ${stealPercent}% 的生命值`);
          
          // 播放生命偷取音效
          this.gameController.soundManager.play('life-steal');
          
          // 播放生命偷取動畫
          this.gameController.animationManager.playLifeStealAnimation();
          
          // 對玩家造成傷害
          const playerDied2 = this.gameController.playerManager.takeDamage(damage);
          
          // 恢復生命值
          const healAmount = Math.floor(damage * (stealPercent / 100));
          enemy.health = Math.min(enemy.maxHealth, enemy.health + healAmount);
          
          // 如果玩家死亡，結束戰鬥
          if (playerDied2) {
            this.gameController.endBattle(false);
          }
          break;
          
        case 'executeBelow':
          // 處決（如果玩家生命值低於某個百分比，則直接殺死）
          const executeThreshold = action.threshold || 30;
          const playerHealthPercent = (this.gameController.state.player.health / this.gameController.state.player.maxHealth) * 100;
          
          console.log(`敵人 ${enemy.name} 使用 ${action.name}，嘗試處決生命值低於 ${executeThreshold}% 的玩家`);
          
          if (playerHealthPercent <= executeThreshold) {
            console.log('處決成功！玩家被擊殺');
            
            // 播放處決音效
            this.gameController.soundManager.play('execute');
            
            // 播放處決動畫
            this.gameController.animationManager.playExecuteAnimation();
            
            // 直接殺死玩家
            this.gameController.state.player.health = 0;
            this.gameController.endBattle(false);
          } else {
            console.log('處決失敗！改為進行普通攻擊');
            
            // 改為普通攻擊
            this._performBasicAttack();
          }
          break;
      }
    }
  
    /**
     * 獲取敵人生命值百分比
     * @returns {number} - 生命值百分比
     */
    getHealthPercentage() {
      const { enemy } = this.gameController.state;
      return (enemy.health / enemy.maxHealth) * 100;
    }
  
    /**
     * 獲取敵人下一步行動的描述
     * @returns {string} - 行動描述
     */
    getNextActionDescription() {
      const { enemy, battle } = this.gameController.state;
      
      // 如果敵人沒有行動模式，則返回基本攻擊描述
      if (!enemy.patterns || enemy.patterns.length === 0) {
        return `將進行攻擊，造成 ${enemy.attack} 點傷害`;
      }
      
      // 獲取當前回合數
      const turnCount = battle.turnCount || 0;
      
      // 根據回合數選擇行動模式
      const patternIndex = turnCount % enemy.patterns.length;
      const action = enemy.patterns[patternIndex];
      
      // 根據行動類型返回描述
      switch (action.type) {
        case 'attack':
          let desc = `將使用 ${action.name}，造成 ${action.value || enemy.attack} 點傷害`;
          if (action.effect) {
            switch (action.effect) {
              case 'poison':
                desc += `，並使玩家中毒，每回合受到 ${action.effectValue || 2} 點傷害，持續 ${action.effectDuration || 3} 回合`;
                break;
              case 'weakness':
                desc += `，並使玩家虛弱，攻擊力降低 ${action.effectValue || 1} 點，持續 ${action.effectDuration || 2} 回合`;
                break;
              case 'burn':
                desc += `，並使玩家燃燒，每回合受到 ${action.effectValue || 2} 點傷害，持續 ${action.effectDuration || 3} 回合`;
                break;
              case 'bleed':
                desc += `，並使玩家流血，每回合受到 ${action.effectValue || 1} 點傷害，持續 ${action.effectDuration || 3} 回合`;
                break;
              case 'stun':
                desc += '，並使玩家被擊暈，下回合無法行動';
                break;
            }
          }
          return desc;
          
        case 'buff':
          switch (action.buffType) {
            case 'strength':
              return `將使用 ${action.name}，攻擊力增加 ${action.value || 2} 點`;
            case 'shield':
              return `將使用 ${action.name}，獲得 ${action.value || 5} 點護盾，持續 ${action.duration || 1} 回合`;
            case 'regen':
              return `將使用 ${action.name}，獲得再生效果，每回合恢復 ${action.value || 3} 點生命值，持續 ${action.duration || 3} 回合`;
            case 'thorns':
              return `將使用 ${action.name}，獲得荊棘效果，玩家攻擊時受到 ${action.value || 2} 點反傷，持續 ${action.duration || 2} 回合`;
            default:
              return `將使用 ${action.name}，獲得增益效果`;
          }
          
        case 'debuff':
          switch (action.debuffType) {
            case 'weakness':
              return `將使用 ${action.name}，使玩家虛弱，攻擊力降低 ${action.value || 2} 點，持續 ${action.duration || 2} 回合`;
            case 'poison':
              return `將使用 ${action.name}，使玩家中毒，每回合受到 ${action.value || 2} 點傷害，持續 ${action.duration || 3} 回合`;
            case 'burn':
              return `將使用 ${action.name}，使玩家燃燒，每回合受到 ${action.value || 3} 點傷害，持續 ${action.duration || 2} 回合`;
            case 'disarm':
              return `將使用 ${action.name}，使玩家被繳械，下回合無法使用攻擊卡牌，持續 ${action.duration || 1} 回合`;
            default:
              return `將使用 ${action.name}，給予玩家減益效果`;
          }
          
        case 'heal':
          return `將使用 ${action.name}，恢復 ${action.value || 10} 點生命值`;
          
        case 'special':
          switch (action.specialType) {
            case 'multiAttack':
              return `將使用 ${action.name}，進行 ${action.count || 3} 次攻擊，每次造成 ${action.value || Math.floor(enemy.attack / (action.count || 3))} 點傷害`;
            case 'summon':
              return `將使用 ${action.name}，召喚援軍，攻擊力增加 ${action.value || 3} 點`;
            case 'lifeSteal':
              return `將使用 ${action.name}，造成 ${action.value || enemy.attack} 點傷害，並恢復 ${action.stealPercent || 50}% 的生命值`;
            case 'executeBelow':
              return `將使用 ${action.name}，嘗試處決生命值低於 ${action.threshold || 30}% 的玩家`;
            default:
              return `將使用 ${action.name}，發動特殊能力`;
          }
          
        default:
          return `將進行未知行動`;
      }
    }
  }