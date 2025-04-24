/**
 * 動畫管理器
 * 負責遊戲中各種視覺效果的播放
 */
class AnimationManager {
  constructor(gameController) {
    this.gameController = gameController;
  }
  
  /**
   * 播放屏幕轉換動畫
   */
  playScreenTransition() {
    console.log('播放屏幕轉換動畫');
    // 實現屏幕轉換動畫
  }
  
  /**
   * 播放抽牌動畫
   */
  playDrawAnimation() {
    console.log('播放抽牌動畫');
    // 實現抽牌動畫
  }
  
  /**
   * 播放回合結束動畫
   */
  playTurnEndAnimation() {
    console.log('播放回合結束動畫');
    // 實現回合結束動畫
  }
  
  /**
   * 播放玩家受傷動畫
   */
  playPlayerHitAnimation() {
    console.log('播放玩家受傷動畫');
    // 實現玩家受傷動畫
  }
  
  /**
   * 播放勝利動畫
   */
  playVictoryAnimation() {
    console.log('播放勝利動畫');
    // 實現勝利動畫
  }
  
  /**
   * 播放失敗動畫
   */
  playDefeatAnimation() {
    console.log('播放失敗動畫');
    // 實現失敗動畫
  }
  
  /**
   * 播放攻擊動畫
   * @param {number} damage - 造成的傷害
   */
  playAttackAnimation(damage) {
    console.log(`播放攻擊動畫，傷害: ${damage}`);
    
    // 獲取敵人元素
    const enemyElement = document.querySelector('#enemy-image');
    if (!enemyElement) return;
    
    // 創建傷害數字元素
    const damageElement = document.createElement('div');
    damageElement.className = 'damage-number';
    damageElement.textContent = `-${damage}`;
    damageElement.style.position = 'absolute';
    damageElement.style.color = '#ff4444';
    damageElement.style.fontSize = '2rem';
    damageElement.style.fontWeight = 'bold';
    damageElement.style.textShadow = '0 0 5px #000';
    damageElement.style.zIndex = '100';
    
    // 計算位置（敵人中心位置）
    const rect = enemyElement.getBoundingClientRect();
    damageElement.style.left = `${rect.left + rect.width / 2}px`;
    damageElement.style.top = `${rect.top + rect.height / 2}px`;
    
    // 添加到文檔
    document.body.appendChild(damageElement);
    
    // 添加震動效果
    enemyElement.classList.add('shake');
    
    // 播放攻擊音效
    this.gameController.soundManager.play('attack');
    
    // 移除動畫和元素
    setTimeout(() => {
      enemyElement.classList.remove('shake');
      damageElement.remove();
    }, 1000);
  }
}

export { AnimationManager };
