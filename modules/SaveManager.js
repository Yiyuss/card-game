/**
 * 存檔管理器
 * 負責處理遊戲存檔和讀檔
 */
export class SaveManager {
    constructor(gameController) {
      this.gameController = gameController;
      
      // 存檔鍵名
      this.saveKey = 'card_game_save';
      
      // 存檔版本
      this.saveVersion = '1.0.0';
    }
    
    /**
     * 保存遊戲
     * @param {Object} progress - 遊戲進度
     * @returns {boolean} 是否保存成功
     */
    saveGame(progress) {
      try {
        console.log('保存遊戲...');
        
        if (!progress) {
          console.error('保存失敗：進度對象為空');
          return false;
        }
        
        // 添加存檔版本和時間戳
        const saveData = {
          version: this.saveVersion,
          timestamp: Date.now(),
          progress: { ...progress }
        };
        
        // 轉換為JSON字符串
        const saveString = JSON.stringify(saveData);
        
        // 保存到localStorage
        localStorage.setItem(this.saveKey, saveString);
        
        console.log('遊戲保存成功');
        return true;
      } catch (error) {
        console.error('保存遊戲時發生錯誤:', error);
        return false;
      }
    }
    
    /**
     * 加載遊戲
     * @returns {Object|null} 遊戲進度或null
     */
    loadGame() {
      try {
        console.log('加載遊戲...');
        
        // 從localStorage獲取存檔
        const saveString = localStorage.getItem(this.saveKey);
        
        if (!saveString) {
          console.log('沒有找到存檔');
          return null;
        }
        
        // 解析JSON
        const saveData = JSON.parse(saveString);
        
        // 檢查版本兼容性
        if (saveData.version !== this.saveVersion) {
          console.warn(`存檔版本不匹配：期望 ${this.saveVersion}，實際 ${saveData.version}`);
          // 這裡可以添加版本兼容性處理邏輯
        }
        
        console.log('遊戲加載成功');
        return saveData.progress;
      } catch (error) {
        console.error('加載遊戲時發生錯誤:', error);
        return null;
      }
    }
    
    /**
     * 刪除存檔
     * @returns {boolean} 是否刪除成功
     */
    deleteSave() {
      try {
        console.log('刪除存檔...');
        
        // 從localStorage刪除存檔
        localStorage.removeItem(this.saveKey);
        
        console.log('存檔刪除成功');
        return true;
      } catch (error) {
        console.error('刪除存檔時發生錯誤:', error);
        return false;
      }
    }
    
    /**
     * 檢查是否有存檔
     * @returns {boolean} 是否有存檔
     */
    hasSave() {
      return localStorage.getItem(this.saveKey) !== null;
    }
    
    /**
     * 獲取存檔信息
     * @returns {Object|null} 存檔信息或null
     */
    getSaveInfo() {
      try {
        const saveString = localStorage.getItem(this.saveKey);
        
        if (!saveString) {
          return null;
        }
        
        const saveData = JSON.parse(saveString);
        
        return {
          version: saveData.version,
          timestamp: saveData.timestamp,
          playerLevel: saveData.progress.stats.level || 1,
          gold: saveData.progress.stats.totalGoldEarned || 0,
          battlesWon: saveData.progress.stats.totalBattlesWon || 0
        };
      } catch (error) {
        console.error('獲取存檔信息時發生錯誤:', error);
        return null;
      }
    }
    
    /**
     * 創建存檔備份
     * @returns {string|null} 備份數據或null
     */
    createBackup() {
      try {
        const saveString = localStorage.getItem(this.saveKey);
        
        if (!saveString) {
          return null;
        }
        
        // 在實際應用中，這裡可以添加加密或壓縮邏輯
        return saveString;
      } catch (error) {
        console.error('創建備份時發生錯誤:', error);
        return null;
      }
    }
    
    /**
     * 恢復存檔備份
     * @param {string} backupData - 備份數據
     * @returns {boolean} 是否恢復成功
     */
    restoreBackup(backupData) {
      try {
        if (!backupData) {
          return false;
        }
        
        // 驗證備份數據是否有效
        const saveData = JSON.parse(backupData);
        
        if (!saveData.version || !saveData.timestamp || !saveData.progress) {
          console.error('無效的備份數據');
          return false;
        }
        
        // 保存到localStorage
        localStorage.setItem(this.saveKey, backupData);
        
        return true;
      } catch (error) {
        console.error('恢復備份時發生錯誤:', error);
        return false;
      }
    }
    
    /**
     * 自動保存
     */
    autoSave() {
      // 獲取當前遊戲進度
      const progress = this.gameController.state.progress;
      
      // 保存遊戲
      this.saveGame(progress);
    }
    
    /**
     * 設置自動保存間隔
     * @param {number} interval - 間隔時間（毫秒）
     */
    setAutoSaveInterval(interval) {
      // 清除現有的自動保存計時器
      if (this.autoSaveTimer) {
        clearInterval(this.autoSaveTimer);
      }
      
      // 設置新的自動保存計時器
      if (interval > 0) {
        this.autoSaveTimer = setInterval(() => {
          this.autoSave();
        }, interval);
      }
    }
  }