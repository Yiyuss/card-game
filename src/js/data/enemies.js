/**
 * 敵人數據
 */
export const enemies = [
    {
      id: 'enemy1',
      name: '小妖精',
      health: 30,
      attack: 5,
      image: 'goblin.png',
      actions: ['attack', 'defend'],
      description: '一個弱小但狡猾的妖精'
    },
    {
      id: 'enemy2',
      name: '石頭怪',
      health: 50,
      attack: 8,
      image: 'rock_monster.png',
      actions: ['attack', 'defend', 'special'],
      description: '堅硬的石頭怪，物理防禦很高'
    },
    {
      id: 'enemy3',
      name: '火焰精靈',
      health: 40,
      attack: 12,
      image: 'fire_spirit.png',
      actions: ['attack', 'burn', 'special'],
      description: '充滿火焰能量的精靈，可以施加燃燒效果'
    },
    {
      id: 'enemy4',
      name: '巨龍',
      health: 100,
      attack: 15,
      image: 'dragon.png',
      actions: ['attack', 'defend', 'special', 'ultimate'],
      description: '強大的巨龍，擁有毀滅性的力量'
    }
  ];