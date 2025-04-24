/**
 * 成就數據
 */
export const achievements = [
    {
      id: 'achievement1',
      name: '初次戰鬥',
      description: '完成你的第一場戰鬥',
      condition: {
        type: 'battles_won',
        value: 1
      },
      icon: 'first_battle.png'
    },
    {
      id: 'achievement2',
      name: '卡牌收藏家',
      description: '收集10張不同的卡牌',
      condition: {
        type: 'cards_collected',
        value: 10
      },
      icon: 'collector.png'
    },
    {
      id: 'achievement3',
      name: '傷害專家',
      description: '累計造成1000點傷害',
      condition: {
        type: 'total_damage',
        value: 1000
      },
      icon: 'damage.png'
    },
    {
      id: 'achievement4',
      name: '治療大師',
      description: '累計恢復500點生命值',
      condition: {
        type: 'total_healing',
        value: 500
      },
      icon: 'healing.png'
    },
    {
      id: 'achievement5',
      name: '屠龍勇士',
      description: '擊敗巨龍',
      condition: {
        type: 'defeat_enemy',
        value: 'enemy4'
      },
      icon: 'dragon_slayer.png'
    }
  ];