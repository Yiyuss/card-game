/**
 * 音效管理器
 * 負責處理所有與音效和音樂相關的操作
 */
export class SoundManager {
    constructor(gameController) {
      this.gameController = gameController;
      
      // 音效緩存
      this.sounds = {};
      
      // 背景音樂
      this.bgm = null;
      this.currentBgm = '';
      
      // 音量設置
      this.musicVolume = 0.5;
      this.soundVolume = 0.5;
      
      // 音效是否啟用
      this.soundEnabled = true;
      this.musicEnabled = true;
    }
  
    /**
     * 初始化音效管理器
     */
    init() {
      console.log('初始化音效管理器...');
      
      // 從設置中獲取音量
      this.musicVolume = this.gameController.state.settings.musicVolume;
      this.soundVolume = this.gameController.state.settings.soundVolume;
      
      // 預加載音效
      this._preloadSounds();
      
      console.log('音效管理器初始化完成');
    }
  
    /**
     * 預加載音效
     */
    _preloadSounds() {
      // 預加載常用音效
      this._loadSound('card-draw', 'assets/sounds/card-draw.mp3');
      this._loadSound('card-play', 'assets/sounds/card-play.mp3');
      this._loadSound('player-hit', 'assets/sounds/player-hit.mp3');
      this._loadSound('enemy-hit', 'assets/sounds/enemy-hit.mp3');
      this._loadSound('battle-start', 'assets/sounds/battle-start.mp3');
      this._loadSound('turn-start', 'assets/sounds/turn-start.mp3');
      this._loadSound('turn-end', 'assets/sounds/turn-end.mp3');
      this._loadSound('victory', 'assets/sounds/victory.mp3');
      this._loadSound('defeat', 'assets/sounds/defeat.mp3');
      this._loadSound('level-up', 'assets/sounds/level-up.mp3');
      this._loadSound('button-click', 'assets/sounds/button-click.mp3');
      this._loadSound('achievement-unlocked', 'assets/sounds/achievement-unlocked.mp3');
      
      // 預加載效果音效
      this._loadSound('poison', 'assets/sounds/poison.mp3');
      this._loadSound('burn', 'assets/sounds/burn.mp3');
      this._loadSound('shield', 'assets/sounds/shield.mp3');
      this._loadSound('buff', 'assets/sounds/buff.mp3');
      this._loadSound('debuff', 'assets/sounds/debuff.mp3');
      this._loadSound('heal', 'assets/sounds/heal.mp3');
      this._loadSound('stun', 'assets/sounds/stun.mp3');
      this._loadSound('effect', 'assets/sounds/effect.mp3');
      
      // 預加載背景音樂
      this._loadSound('menu', 'assets/music/menu.mp3');
      this._loadSound('battle', 'assets/music/battle.mp3');
      this._loadSound('victory', 'assets/music/victory.mp3');
      this._loadSound('defeat', 'assets/music/defeat.mp3');
    }
  
    /**
     * 加載音效
     * @param {string} id - 音效ID
     * @param {string} url - 音效URL
     */
    _loadSound(id, url) {
      try {
        const audio = new Audio(url);
        audio.preload = 'auto';
        this.sounds[id] = audio;
        
        // 設置音量
        if (id.startsWith('bgm-')) {
          audio.volume = this.musicVolume;
          audio.loop = true;
        } else {
          audio.volume = this.soundVolume;
        }
        
        console.log(`加載音效: ${id}`);
      } catch (error) {
        console.error(`加載音效失敗: ${id}`, error);
      }
    }
  
    /**
     * 播放音效
     * @param {string} id - 音效ID
     */
    play(id) {
      if (!this.soundEnabled) return;
      
      const sound = this.sounds[id];
      if (!sound) {
        console.warn(`找不到音效: ${id}`);
        return;
      }
      
      try {
        // 重置音效
        sound.currentTime = 0;
        
        // 播放音效
        sound.play().catch(error => {
          console.warn(`播放音效失敗: ${id}`, error);
        });
      } catch (error) {
        console.warn(`播放音效失敗: ${id}`, error);
      }
    }
  
    /**
     * 播放背景音樂
     * @param {string} id - 背景音樂ID
     */
    playBGM(id) {
      if (!this.musicEnabled) return;
      
      // 如果當前已經在播放相同的背景音樂，則不做任何操作
      if (this.currentBgm === id) return;
      
      // 停止當前背景音樂
      this.stopBGM();
      
      const bgmId = `bgm-${id}`;
      const bgm = this.sounds[bgmId];
      
      if (!bgm) {
        console.warn(`找不到背景音樂: ${bgmId}`);
        return;
      }
      
      try {
        // 重置背景音樂
        bgm.currentTime = 0;
        
        // 播放背景音樂
        bgm.play().catch(error => {
          console.warn(`播放背景音樂失敗: ${bgmId}`, error);
        });
        
        // 設置當前背景音樂
        this.bgm = bgm;
        this.currentBgm = id;
      } catch (error) {
        console.warn(`播放背景音樂失敗: ${bgmId}`, error);
      }
    }
  
    /**
     * 停止背景音樂
     */
    stopBGM() {
      if (this.bgm) {
        try {
          this.bgm.pause();
          this.bgm.currentTime = 0;
        } catch (error) {
          console.warn('停止背景音樂失敗', error);
        }
        
        this.bgm = null;
        this.currentBgm = '';
      }
    }
  
    /**
     * 暫停背景音樂
     */
    pauseBGM() {
      if (this.bgm) {
        try {
          this.bgm.pause();
        } catch (error) {
          console.warn('暫停背景音樂失敗', error);
        }
      }
    }
  
    /**
     * 恢復背景音樂
     */
    resumeBGM() {
      if (this.bgm && this.musicEnabled) {
        try {
          this.bgm.play().catch(error => {
            console.warn('恢復背景音樂失敗', error);
          });
        } catch (error) {
          console.warn('恢復背景音樂失敗', error);
        }
      }
    }
  
    /**
     * 設置音樂音量
     * @param {number} volume - 音量 (0-1)
     */
    setMusicVolume(volume) {
      this.musicVolume = Math.max(0, Math.min(1, volume));
      
      // 更新設置
      this.gameController.state.settings.musicVolume = this.musicVolume;
      
      // 更新所有背景音樂的音量
      for (const id in this.sounds) {
        if (id.startsWith('bgm-')) {
          this.sounds[id].volume = this.musicVolume;
        }
      }
      
      console.log(`設置音樂音量: ${this.musicVolume}`);
    }
  
    /**
     * 設置音效音量
     * @param {number} volume - 音量 (0-1)
     */
    setSoundVolume(volume) {
      this.soundVolume = Math.max(0, Math.min(1, volume));
      
      // 更新設置
      this.gameController.state.settings.soundVolume = this.soundVolume;
      
      // 更新所有音效的音量
      for (const id in this.sounds) {
        if (!id.startsWith('bgm-')) {
          this.sounds[id].volume = this.soundVolume;
        }
      }
      
      console.log(`設置音效音量: ${this.soundVolume}`);
    }
  
    /**
     * 啟用/禁用音效
     * @param {boolean} enabled - 是否啟用
     */
    enableSound(enabled) {
      this.soundEnabled = enabled;
      console.log(`${enabled ? '啟用' : '禁用'}音效`);
    }
  
    /**
     * 啟用/禁用音樂
     * @param {boolean} enabled - 是否啟用
     */
    enableMusic(enabled) {
      this.musicEnabled = enabled;
      console.log(`${enabled ? '啟用' : '禁用'}音樂`);
      
      if (enabled) {
        this.resumeBGM();
      } else {
        this.pauseBGM();
      }
    }
  
    /**
     * 加載自定義音效
     * @param {string} id - 音效ID
     * @param {string} url - 音效URL
     */
    loadCustomSound(id, url) {
      this._loadSound(id, url);
    }
  
    /**
     * 釋放音效資源
     * @param {string} id - 音效ID
     */
    releaseSound(id) {
      if (this.sounds[id]) {
        this.sounds[id].pause();
        this.sounds[id].src = '';
        delete this.sounds[id];
        console.log(`釋放音效: ${id}`);
      }
    }
  
    /**
     * 釋放所有音效資源
     */
    releaseAllSounds() {
      // 停止背景音樂
      this.stopBGM();
      
      // 釋放所有音效
      for (const id in this.sounds) {
        this.releaseSound(id);
      }
      
      console.log('釋放所有音效資源');
    }
  
    /**
     * 獲取當前音樂音量
     * @returns {number} - 音量 (0-1)
     */
    getMusicVolume() {
      return this.musicVolume;
    }
  
    /**
     * 獲取當前音效音量
     * @returns {number} - 音量 (0-1)
     */
    getSoundVolume() {
      return this.soundVolume;
    }
  
    /**
     * 檢查音效是否啟用
     * @returns {boolean} - 是否啟用
     */
    isSoundEnabled() {
      return this.soundEnabled;
    }
  
    /**
     * 檢查音樂是否啟用
     * @returns {boolean} - 是否啟用
     */
    isMusicEnabled() {
      return this.musicEnabled;
    }
  
    /**
     * 淡入背景音樂
     * @param {string} id - 背景音樂ID
     * @param {number} duration - 淡入時間 (毫秒)
     */
    fadeInBGM(id, duration = 1000) {
      if (!this.musicEnabled) return;
      
      const bgmId = `bgm-${id}`;
      const bgm = this.sounds[bgmId];
      
      if (!bgm) {
        console.warn(`找不到背景音樂: ${bgmId}`);
        return;
      }
      
      // 停止當前背景音樂
      this.stopBGM();
      
      try {
        // 設置初始音量為0
        bgm.volume = 0;
        
        // 播放背景音樂
        bgm.play().catch(error => {
          console.warn(`播放背景音樂失敗: ${bgmId}`, error);
        });
        
        // 設置當前背景音樂
        this.bgm = bgm;
        this.currentBgm = id;
        
        // 淡入
        let startTime = null;
        const animate = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const elapsed = timestamp - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          bgm.volume = progress * this.musicVolume;
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        
        requestAnimationFrame(animate);
      } catch (error) {
        console.warn(`淡入背景音樂失敗: ${bgmId}`, error);
      }
    }
  
    /**
     * 淡出背景音樂
     * @param {number} duration - 淡出時間 (毫秒)
     */
    fadeOutBGM(duration = 1000) {
      if (!this.bgm) return;
      
      try {
        const bgm = this.bgm;
        const startVolume = bgm.volume;
        
        // 淡出
        let startTime = null;
        const animate = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const elapsed = timestamp - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          bgm.volume = startVolume * (1 - progress);
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            // 淡出完成後停止背景音樂
            bgm.pause();
            bgm.currentTime = 0;
            this.bgm = null;
            this.currentBgm = '';
          }
        };
        
        requestAnimationFrame(animate);
      } catch (error) {
        console.warn('淡出背景音樂失敗', error);
      }
    }
  
    /**
     * 切換背景音樂
     * @param {string} id - 背景音樂ID
     * @param {number} fadeDuration - 淡入淡出時間 (毫秒)
     */
    crossFadeBGM(id, fadeDuration = 1000) {
      if (!this.musicEnabled) return;
      
      // 如果當前已經在播放相同的背景音樂，則不做任何操作
      if (this.currentBgm === id) return;
      
      const bgmId = `bgm-${id}`;
      const newBgm = this.sounds[bgmId];
      
      if (!newBgm) {
        console.warn(`找不到背景音樂: ${bgmId}`);
        return;
      }
      
      try {
        // 設置新背景音樂的初始音量為0
        newBgm.volume = 0;
        
        // 播放新背景音樂
        newBgm.play().catch(error => {
          console.warn(`播放背景音樂失敗: ${bgmId}`, error);
        });
        
        const oldBgm = this.bgm;
        const oldVolume = oldBgm ? oldBgm.volume : 0;
        
        // 設置新背景音樂
        this.bgm = newBgm;
        this.currentBgm = id;
        
        // 淡入淡出
        let startTime = null;
        const animate = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const elapsed = timestamp - startTime;
          const progress = Math.min(elapsed / fadeDuration, 1);
          
          // 淡入新背景音樂
          newBgm.volume = progress * this.musicVolume;
          
          // 淡出舊背景音樂
          if (oldBgm) {
            oldBgm.volume = oldVolume * (1 - progress);
            
            if (progress === 1) {
              // 淡出完成後停止舊背景音樂
              oldBgm.pause();
              oldBgm.currentTime = 0;
            }
          }
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };
        
        requestAnimationFrame(animate);
      } catch (error) {
        console.warn(`切換背景音樂失敗: ${bgmId}`, error);
      }
    }
  }
