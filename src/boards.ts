import type { BoardDefinition, Position, Stage } from './types';

export const BOARDS: BoardDefinition[] = [
  // ================= EASY BOARDS (4x4) =================
  {
    id: 'easy-1',
    name: 'Easy Map 1: The Gateway',
    stage: 'EASY',
    size: 4,
    layout: [
      'P . C .',
      '. W . .',
      '. C W .',
      '. . A G',
    ],
  },
  {
    id: 'easy-2',
    name: 'Easy Map 2: Corner Dash',
    stage: 'EASY',
    size: 4,
    layout: [
      'P C . .',
      '. W W .',
      '. . C .',
      'A . . G',
    ],
  },
  {
    id: 'easy-3',
    name: 'Easy Map 3: Split Path',
    stage: 'EASY',
    size: 4,
    layout: [
      'P . . C',
      'W . W .',
      '. C . .',
      '. A . G',
    ],
  },
  {
    id: 'easy-4',
    name: 'Easy Map 4: Central Bypass',
    stage: 'EASY',
    size: 4,
    layout: [
      'P C W .',
      '. . . C',
      '. W . .',
      '. A . G',
    ],
  },
  {
    id: 'easy-5',
    name: 'Easy Map 5: Diamond Run',
    stage: 'EASY',
    size: 4,
    layout: [
      'P . C .',
      '. W . C',
      'C . W .',
      '. . A G',
    ],
  },

  // ================= HARD BOARDS (8x8) =================
  {
    id: 'hard-1',
    name: 'Hard Map 1: Twin Corridors',
    stage: 'HARD',
    size: 8,
    layout: [
      'P . C . . . C .',
      '. W W . W W . .',
      '. . C . . C . .',
      '. W . W W . W .',
      '. W . C . . W .',
      '. . . W W . . .',
      '. C . . C . W .',
      '. . A . . . . G',
    ],
  },
  {
    id: 'hard-2',
    name: 'Hard Map 2: The S-Curve',
    stage: 'HARD',
    size: 8,
    layout: [
      'P . . C . . . .',
      '. W W W . W W .',
      '. . C . . . C .',
      'W . W . W . W .',
      '. . . C W . . .',
      '. W W . . W . C',
      '. C . . W . . .',
      'A . . . . . . G',
    ],
  },
  {
    id: 'hard-3',
    name: 'Hard Map 3: Quadrant Grid',
    stage: 'HARD',
    size: 8,
    layout: [
      'P C . . . C . .',
      '. . W W . . W .',
      '. C . W . C . .',
      'W . . . . W W .',
      '. . W W . . . .',
      '. W C . . W C .',
      '. . . W . . . .',
      '. . . . A . . G',
    ],
  },
  {
    id: 'hard-4',
    name: 'Hard Map 4: Pillar Hall',
    stage: 'HARD',
    size: 8,
    layout: [
      'P . C . . W . .',
      '. W . W . . C .',
      '. C . . . W . .',
      '. W W . W W . .',
      '. . C . . . C .',
      '. W . W W . W .',
      '. . . . C . . .',
      '. A . . . . . G',
    ],
  },
  {
    id: 'hard-5',
    name: 'Hard Map 5: Zigzag Traverse',
    stage: 'HARD',
    size: 8,
    layout: [
      'P . . . C . . .',
      '. W W . . W W .',
      '. C . . W . C .',
      '. . W . . . . .',
      '. . C . W W . .',
      '. W . C . . W .',
      '. C . W . . C .',
      'A . . . . . . G',
    ],
  },

  // ================= EXPERT BOARDS (12x12) =================
  {
    id: 'expert-1',
    name: 'Expert Map 1: The Grand Labyrinth',
    stage: 'EXPERT',
    size: 12,
    layout: [
      'P . . C . . . . C . . .',
      '. W W . W W W W . W W .',
      '. . C . . . C . . . C .',
      'W . W W . W . W W . W .',
      '. . . C . W . C . . . .',
      '. W W . . W . . W W . C',
      '. C . . W W W . . C . .',
      'W . W . . C . . W . W .',
      '. . . . W . W . . . . .',
      '. W W . W . W . W W . C',
      '. . C . . . . . C . . .',
      '. . . A . . . . . . . G',
    ],
  },
  {
    id: 'expert-2',
    name: 'Expert Map 2: Iron Citadel',
    stage: 'EXPERT',
    size: 12,
    layout: [
      'P C . . . . . . . C . .',
      '. W W W . W W . W W W .',
      '. . C . . . C . . C . .',
      '. W . W W . . W . W . .',
      '. W . C . . C W . . . C',
      '. . . W W W W . . W . .',
      '. W . . . C . . W W . .',
      '. W W . W . W . . C . .',
      'C . . . W . W . W . W .',
      '. W W . . . . . W . . .',
      '. C . . W W W . . C . .',
      'A . . . . . . . . . . G',
    ],
  },
  {
    id: 'expert-3',
    name: 'Expert Map 3: Four Chambers',
    stage: 'EXPERT',
    size: 12,
    layout: [
      'P . C . . . . . . C . .',
      '. W W . W W W W . W W .',
      '. . . . . C . . . . C .',
      '. W W . W . . W . W W .',
      '. C . . W C . W . . . .',
      '. . W . . . . . . W . C',
      'C . W . . . . . . W . .',
      '. . . . W . C W . . C .',
      '. W W . W . . W . W W .',
      '. . C . . . . . . . . .',
      '. W W . W W W W . W W .',
      '. . . A . . . . . . . G',
    ],
  },
  {
    id: 'expert-4',
    name: 'Expert Map 4: The Great Divide',
    stage: 'EXPERT',
    size: 12,
    layout: [
      'P . . C . . C . . . C .',
      '. W W . W W . W W . W .',
      '. . C . . . . . C . . .',
      'W . W W . W W . W W . W',
      '. . . C . . . . C . . .',
      '. W W W . W W . W W W .',
      '. . . . . C . . . . . .',
      'W . W W . W W . W W . W',
      '. . C . . . . . C . . .',
      '. W . W W . W W . W W .',
      '. . . C . . . C . . . .',
      '. A . . . . . . . . . G',
    ],
  },
  {
    id: 'expert-5',
    name: 'Expert Map 5: Sanctuary Run',
    stage: 'EXPERT',
    size: 12,
    layout: [
      'P C . . . . . . . . C .',
      '. . W W . W W . W W . .',
      '. W . C . . . . C . W .',
      '. W . W W . . W W . W .',
      '. . . . C . C . . . . .',
      'C W W . W W W W . W W .',
      '. . . . . C . . . . . C',
      '. W . W W . . W W . W .',
      '. W . C . . . . C . W .',
      '. . W W . W W . W W . .',
      '. C . . . . . . . . C .',
      'A . . . . . . . . . . G',
    ],
  },
];

export interface ParsedBoard {
  size: number;
  playerPos: Position;
  aiPos: Position;
  goalPos: Position;
  coins: Position[];
  walls: Position[];
  grid: string[][];
}

export function parseBoard(board: BoardDefinition): ParsedBoard {
  const size = board.size;
  let playerPos: Position = { row: 0, col: 0 };
  let aiPos: Position = { row: size - 1, col: Math.floor(size / 2) };
  let goalPos: Position = { row: size - 1, col: size - 1 };
  const coins: Position[] = [];
  const walls: Position[] = [];
  const grid: string[][] = [];

  for (let r = 0; r < size; r++) {
    const rowStr = board.layout[r] || '';
    const tokens = rowStr.trim().split(/\s+/);
    const rowTokens: string[] = [];

    for (let c = 0; c < size; c++) {
      const token = tokens[c] || '.';
      rowTokens.push(token);

      if (token === 'P') {
        playerPos = { row: r, col: c };
      } else if (token === 'A') {
        aiPos = { row: r, col: c };
      } else if (token === 'G') {
        goalPos = { row: r, col: c };
      } else if (token === 'C') {
        coins.push({ row: r, col: c });
      } else if (token === 'W' || token === '#') {
        walls.push({ row: r, col: c });
      }
    }
    grid.push(rowTokens);
  }

  return {
    size,
    playerPos,
    aiPos,
    goalPos,
    coins,
    walls,
    grid,
  };
}

export function getBoardsForStage(stage: Stage): BoardDefinition[] {
  return BOARDS.filter((b) => b.stage === stage);
}

export function getRandomBoardForStage(stage: Stage, excludeId?: string): BoardDefinition {
  const stageBoards = getBoardsForStage(stage);
  const eligible = stageBoards.filter((b) => b.id !== excludeId);
  const pool = eligible.length > 0 ? eligible : stageBoards;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}
