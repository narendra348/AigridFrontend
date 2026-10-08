import { api } from './api';
import type { BoardDefinition, Direction, GameState, Position, Stage } from './types';
import { getRandomBoardForStage, parseBoard, type ParsedBoard } from './boards';

export class GameManager {
  private state: GameState;
  private currentBoardDef: BoardDefinition;
  private parsedBoard: ParsedBoard;
  private onStateChange: (state: GameState) => void;
  private isProcessingMove: boolean = false;

  constructor(stage: Stage, onStateChange: (state: GameState) => void) {
    this.onStateChange = onStateChange;
    this.currentBoardDef = getRandomBoardForStage(stage);
    this.parsedBoard = parseBoard(this.currentBoardDef);

    this.state = {
      id: undefined,
      stage,
      size: this.currentBoardDef.size,
      boardId: this.currentBoardDef.id,
      playerPos: { ...this.parsedBoard.playerPos },
      aiPos: { ...this.parsedBoard.aiPos },
      goalPos: { ...this.parsedBoard.goalPos },
      coins: [...this.parsedBoard.coins],
      walls: [...this.parsedBoard.walls],
      score: 0,
      moves: 0,
      status: 'IN_PROGRESS',
      aiPath: [],
      errorMessage: null,
      backendConnected: true,
    };
  }

  public getState(): GameState {
    return this.state;
  }

  public getBoardDefinition(): BoardDefinition {
    return this.currentBoardDef;
  }

  public async initGame(): Promise<void> {
    this.state.status = 'IN_PROGRESS';
    this.state.errorMessage = null;

    try {
      const response = await api.createGame({
        stage: this.state.stage,
        size: this.state.size,
        boardId: this.state.boardId,
        grid: this.parsedBoard.grid,
        playerPos: this.state.playerPos,
        aiPos: this.state.aiPos,
        goalPos: this.state.goalPos,
        walls: this.state.walls,
        coins: this.state.coins,
      });

      if (response.id !== undefined || response.gameId !== undefined) {
        this.state.id = response.id ?? response.gameId;
      }

      this.state.backendConnected = true;
      this.syncFromBackend(response);

      // Fetch initial AI path if available
      if (this.state.id !== undefined) {
        try {
          const pathRes = await api.getAiPath(this.state.id);
          this.syncPath(pathRes);
        } catch {
          // Non-critical if path endpoint is optional
        }
      }
    } catch (err: any) {
      this.state.backendConnected = false;
      this.state.errorMessage = err.message || 'Could not connect to Spring Boot backend.';
    }

    this.notify();
  }

  public async restartGame(): Promise<void> {
    if (this.isProcessingMove) return;
    this.parsedBoard = parseBoard(this.currentBoardDef);

    this.state.playerPos = { ...this.parsedBoard.playerPos };
    this.state.aiPos = { ...this.parsedBoard.aiPos };
    this.state.goalPos = { ...this.parsedBoard.goalPos };
    this.state.coins = [...this.parsedBoard.coins];
    this.state.walls = [...this.parsedBoard.walls];
    this.state.score = 0;
    this.state.moves = 0;
    this.state.status = 'IN_PROGRESS';
    this.state.aiPath = [];
    this.state.errorMessage = null;

    if (this.state.id !== undefined) {
      try {
        const response = await api.restartGame(this.state.id, {
          stage: this.state.stage,
          size: this.state.size,
          boardId: this.state.boardId,
          playerPos: this.state.playerPos,
          aiPos: this.state.aiPos,
          goalPos: this.state.goalPos,
        });
        this.state.backendConnected = true;
        this.syncFromBackend(response);
      } catch (err: any) {
        this.state.backendConnected = false;
        this.state.errorMessage = `Restart backend notice: ${err.message}`;
      }
    } else {
      await this.initGame();
    }

    this.notify();
  }

  public async newGame(): Promise<void> {
    if (this.isProcessingMove) return;
    // Pick a DIFFERENT board from current
    const nextBoard = getRandomBoardForStage(this.state.stage, this.currentBoardDef.id);
    this.currentBoardDef = nextBoard;
    this.parsedBoard = parseBoard(nextBoard);

    this.state.boardId = nextBoard.id;
    this.state.size = nextBoard.size;
    this.state.playerPos = { ...this.parsedBoard.playerPos };
    this.state.aiPos = { ...this.parsedBoard.aiPos };
    this.state.goalPos = { ...this.parsedBoard.goalPos };
    this.state.coins = [...this.parsedBoard.coins];
    this.state.walls = [...this.parsedBoard.walls];
    this.state.score = 0;
    this.state.moves = 0;
    this.state.status = 'IN_PROGRESS';
    this.state.aiPath = [];
    this.state.errorMessage = null;

    await this.initGame();
  }

  public async makeMove(direction: Direction): Promise<void> {
    if (this.state.status !== 'IN_PROGRESS' || this.isProcessingMove) {
      return;
    }

    this.state.errorMessage = null;
    const nextPos = this.calculateNextPosition(this.state.playerPos, direction);

    // Validate boundaries
    if (nextPos.row < 0 || nextPos.row >= this.state.size || nextPos.col < 0 || nextPos.col >= this.state.size) {
      this.state.errorMessage = 'Invalid move: Out of board bounds.';
      this.notify();
      return;
    }

    // Validate wall collisions
    const hitWall = this.state.walls.some((w) => w.row === nextPos.row && w.col === nextPos.col);
    if (hitWall) {
      this.state.errorMessage = 'Invalid move: Blocked by wall.';
      this.notify();
      return;
    }

    this.isProcessingMove = true;

    // Apply player move
    this.state.playerPos = nextPos;
    this.state.moves += 1;

    // Check coin collection
    const coinIdx = this.state.coins.findIndex((c) => c.row === nextPos.row && c.col === nextPos.col);
    if (coinIdx !== -1) {
      this.state.coins.splice(coinIdx, 1);
      this.state.score += 10;
    }

    // Check if player reached goal
    if (nextPos.row === this.state.goalPos.row && nextPos.col === this.state.goalPos.col) {
      this.state.status = 'PLAYER_WINS';
      this.state.score += 50;
      this.isProcessingMove = false;
      this.notify();

      // Inform backend if connected
      if (this.state.id !== undefined) {
        try {
          await api.sendMove(this.state.id, {
            direction,
            playerPos: this.state.playerPos,
            currentScore: this.state.score,
            moves: this.state.moves,
          });
        } catch {
          // Game already ended locally
        }
      }
      return;
    }

    // Check if player stepped directly onto AI
    if (nextPos.row === this.state.aiPos.row && nextPos.col === this.state.aiPos.col) {
      this.state.status = 'AI_WINS';
      this.isProcessingMove = false;
      this.notify();
      return;
    }

    // Send move to backend to calculate A* and move AI
    try {
      const gameId = this.state.id ?? 'session';
      const response = await api.sendMove(gameId, {
        direction,
        playerPos: this.state.playerPos,
        currentScore: this.state.score,
        moves: this.state.moves,
      });

      this.state.backendConnected = true;
      this.syncFromBackend(response);
    } catch (err: any) {
      this.state.backendConnected = false;
      this.state.errorMessage = `Backend error: ${err.message}`;
    } finally {
      this.isProcessingMove = false;
      this.notify();
    }
  }

  private calculateNextPosition(curr: Position, dir: Direction): Position {
    switch (dir) {
      case 'UP':
        return { row: curr.row - 1, col: curr.col };
      case 'DOWN':
        return { row: curr.row + 1, col: curr.col };
      case 'LEFT':
        return { row: curr.row, col: curr.col - 1 };
      case 'RIGHT':
        return { row: curr.row, col: curr.col + 1 };
    }
  }

  private normalizePosition(raw: any): Position | null {
    if (!raw) return null;
    if (typeof raw.row === 'number' && typeof raw.col === 'number') {
      return { row: raw.row, col: raw.col };
    }
    if (typeof raw.y === 'number' && typeof raw.x === 'number') {
      return { row: raw.y, col: raw.x };
    }
    return null;
  }

  private syncFromBackend(res: any): void {
    if (!res) return;

    if (res.id !== undefined || res.gameId !== undefined) {
      this.state.id = res.id ?? res.gameId;
    }

    const aiPos = this.normalizePosition(res.ai || res.aiPos);
    if (aiPos) {
      this.state.aiPos = aiPos;
    }

    const playerPos = this.normalizePosition(res.player || res.playerPos);
    if (playerPos) {
      this.state.playerPos = playerPos;
    }

    if (typeof res.score === 'number') {
      this.state.score = res.score;
    }

    if (typeof res.moves === 'number') {
      this.state.moves = res.moves;
    }

    // Path sync
    const rawPath = res.aiPath || res.path;
    if (Array.isArray(rawPath)) {
      this.state.aiPath = rawPath
        .map((p: any) => this.normalizePosition(p))
        .filter((p: Position | null): p is Position => p !== null);
    }

    // Status sync
    const rawStatus = res.status || res.gameState || res.gameStatus;
    if (typeof rawStatus === 'string') {
      const upper = rawStatus.toUpperCase();
      if (upper.includes('PLAYER_WIN') || upper === 'WON' || upper === 'VICTORY') {
        this.state.status = 'PLAYER_WINS';
      } else if (upper.includes('AI_WIN') || upper === 'LOST' || upper === 'DEFEAT' || upper === 'CAUGHT') {
        this.state.status = 'AI_WINS';
      } else if (upper.includes('PROGRESS') || upper === 'PLAYING' || upper === 'ACTIVE') {
        if (this.state.status !== 'PLAYER_WINS' && this.state.status !== 'AI_WINS') {
          this.state.status = 'IN_PROGRESS';
        }
      }
    }

    // Double check catch condition
    if (this.state.playerPos.row === this.state.aiPos.row && this.state.playerPos.col === this.state.aiPos.col) {
      this.state.status = 'AI_WINS';
    } else if (this.state.playerPos.row === this.state.goalPos.row && this.state.playerPos.col === this.state.goalPos.col) {
      this.state.status = 'PLAYER_WINS';
    }
  }

  private syncPath(raw: any): void {
    if (!raw) return;
    if (Array.isArray(raw)) {
      this.state.aiPath = raw
        .map((p: any) => this.normalizePosition(p))
        .filter((p: Position | null): p is Position => p !== null);
    } else if (raw.path || raw.aiPath) {
      const arr = raw.path || raw.aiPath;
      if (Array.isArray(arr)) {
        this.state.aiPath = arr
          .map((p: any) => this.normalizePosition(p))
          .filter((p: Position | null): p is Position => p !== null);
      }
    }
    this.notify();
  }

  private notify(): void {
    this.onStateChange({ ...this.state });
  }
}
