export type Stage = 'EASY' | 'HARD' | 'EXPERT';

export interface Position {
  row: number;
  col: number;
}

export type CellType = 'EMPTY' | 'PLAYER' | 'AI' | 'GOAL' | 'COIN' | 'WALL';

export type GameStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'PLAYER_WINS' | 'AI_WINS';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface BoardDefinition {
  id: string;
  name: string;
  stage: Stage;
  size: number;
  layout: string[];
}

export interface GameState {
  id?: string | number;
  stage: Stage;
  size: number;
  boardId: string;
  playerPos: Position;
  aiPos: Position;
  goalPos: Position;
  coins: Position[];
  walls: Position[];
  score: number;
  moves: number;
  status: GameStatus;
  aiPath: Position[];
  errorMessage?: string | null;
  backendConnected: boolean;
}

export interface BackendGameResponse {
  id?: string | number;
  gameId?: string | number;
  stage?: string;
  size?: number;
  boardSize?: number;
  grid?: string[][];
  player?: { x?: number; y?: number; row?: number; col?: number };
  playerPos?: { x?: number; y?: number; row?: number; col?: number };
  ai?: { x?: number; y?: number; row?: number; col?: number };
  aiPos?: { x?: number; y?: number; row?: number; col?: number };
  goal?: { x?: number; y?: number; row?: number; col?: number };
  goalPos?: { x?: number; y?: number; row?: number; col?: number };
  coins?: Array<{ x?: number; y?: number; row?: number; col?: number }>;
  walls?: Array<{ x?: number; y?: number; row?: number; col?: number }>;
  score?: number;
  moves?: number;
  status?: string;
  gameState?: string;
  gameStatus?: string;
  aiPath?: Array<{ x?: number; y?: number; row?: number; col?: number }>;
  path?: Array<{ x?: number; y?: number; row?: number; col?: number }>;
  message?: string;
}
