/**
 * 關卡數據
 */
export const levels = [
    {
      id: 1,
      name: '森林入口',
      description: '一個充滿生機的森林，但也隱藏著危險',
      enemies: ['enemy1'],
      background: 'forest.jpg',
      rewards: {
        gold: 50,
        experience: 20,
        cards: ['card1']
      }
    },
    {
      id: 2,
      name: '山洞探險',
      description: '黑暗的山洞中棲息著石頭怪',
      enemies: ['enemy2'],
      background: 'cave.jpg',
      rewards: {
        gold: 80,
        experience: 30,
        cards: ['card2']
      }
    },
    {
      id: 3,
      name: '火山口',
      description: '炙熱的火山口，火焰精靈的家園',
      enemies: ['enemy3'],
      background: 'volcano.jpg',
      rewards: {
        gold: 120,
        experience: 50,
        cards: ['card4']
      }
    },
    {
      id: 4,
      name: '龍之巢穴',
      description: '巨龍的領地，充滿寶藏但極度危險',
      enemies: ['enemy4'],
      background: 'dragon_lair.jpg',
      rewards: {
        gold: 200,
        experience: 100,
        cards: ['card5']
      }
    }
  ];