import type { BackendGameResponse, Direction, Position, Stage } from './types';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082').replace(/\/+$/, '');

export interface CreateGamePayload {
  stage: Stage;
  size: number;
  boardId: string;
  grid?: string[][];
  playerPos?: Position;
  aiPos?: Position;
  goalPos?: Position;
  walls?: Position[];
  coins?: Position[];
}

export interface MovePayload {
  direction: Direction;
  playerPos?: Position;
  currentScore?: number;
  moves?: number;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {}),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMsg = `Server returned ${response.status}: ${response.statusText}`;
        try {
          const errData = await response.json();
          if (errData.message || errData.error) {
            errorMsg = errData.message || errData.error;
          }
        } catch {
          // Non JSON
        }
        throw new Error(errorMsg);
      }

      return (await response.json()) as T;
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new Error(`Request to backend timed out (${url}).`);
      }
      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw new Error(`Unable to reach Spring Boot backend at ${this.baseUrl}. Please check that the server is running on port 8082.`);
      }
      throw err;
    }
  }

  /**
   * POST /api/games
   * Start a new game session on the backend
   */
  public async createGame(payload: CreateGamePayload): Promise<BackendGameResponse> {
    return this.request<BackendGameResponse>('/api/games', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * GET /api/games/{id}
   * Fetch game state by id
   */
  public async getGame(id: string | number): Promise<BackendGameResponse> {
    return this.request<BackendGameResponse>(`/api/games/${encodeURIComponent(id)}`, {
      method: 'GET',
    });
  }

  /**
   * POST /api/games/{id}/move
   * Submit player move, backend runs A* for AI and returns updated positions
   */
  public async sendMove(id: string | number, payload: MovePayload): Promise<BackendGameResponse> {
    return this.request<BackendGameResponse>(`/api/games/${encodeURIComponent(id)}/move`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * GET /api/games/{id}/ai-path
   * Retrieve calculated A* path from AI to player
   */
  public async getAiPath(id: string | number): Promise<Position[] | BackendGameResponse> {
    return this.request<Position[] | BackendGameResponse>(`/api/games/${encodeURIComponent(id)}/ai-path`, {
      method: 'GET',
    });
  }

  /**
   * POST /api/games/{id}/restart
   * Restart game with same board
   */
  public async restartGame(id: string | number, payload?: Partial<CreateGamePayload>): Promise<BackendGameResponse> {
    return this.request<BackendGameResponse>(`/api/games/${encodeURIComponent(id)}/restart`, {
      method: 'POST',
      body: JSON.stringify(payload || {}),
    });
  }

  /**
   * POST /api/games/{id}/new-game
   * Start fresh game on backend
   */
  public async newGame(id: string | number, payload: CreateGamePayload): Promise<BackendGameResponse> {
    return this.request<BackendGameResponse>(`/api/games/${encodeURIComponent(id)}/new-game`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const api = new ApiService();
