/**
 * 卡牌數據
 */
export const cards = [
    {
      id: 'card1',
      name: '斬擊',
      type: 'attack',
      manaCost: 1,
      value: 6,
      description: '造成6點傷害',
      image: 'slash.png'
    },
    {
      id: 'card2',
      name: '防禦',
      type: 'defense',
      manaCost: 1,
      value: 5,
      description: '獲得5點護盾',
      image: 'shield.png'
    },
    {
      id: 'card3',
      name: '治療',
      type: 'skill',
      manaCost: 2,
      value: 8,
      description: '恢復8點生命值',
      image: 'heal.png'
    },
    {
      id: 'card4',
      name: '毒刃',
      type: 'attack',
      manaCost: 2,
      value: 4,
      description: '造成4點傷害並施加2層中毒',
      image: 'poison_blade.png',
      effects: [
        {
          type: 'poison',
          value: 2,
          duration: 3
        }
      ]
    },
    {
      id: 'card5',
      name: '火球術',
      type: 'attack',
      manaCost: 3,
      value: 10,
      description: '造成10點傷害',
      image: 'fireball.png'
    }
  ];