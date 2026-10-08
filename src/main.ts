import './style.css';
import { API_BASE_URL } from './api';
import { GameManager } from './game';
import type { Direction, GameState, Stage } from './types';

type ViewMode = 'STAGE_SELECT' | 'GAME';

class App {
  private container: HTMLDivElement;
  private viewMode: ViewMode = 'STAGE_SELECT';
  private gameManager: GameManager | null = null;
  private keyListenerAttached: boolean = false;

  constructor() {
    const el = document.querySelector<HTMLDivElement>('#app');
    if (!el) {
      throw new Error('Could not find #app element in DOM');
    }
    this.container = el;
    this.init();
  }

  private init(): void {
    this.setupGlobalEvents();
    this.render();
  }

  private setupGlobalEvents(): void {
    if (this.keyListenerAttached) return;

    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (this.viewMode !== 'GAME' || !this.gameManager) return;

      const key = e.key.toLowerCase();
      let direction: Direction | null = null;

      if (key === 'arrowup' || key === 'w') {
        direction = 'UP';
      } else if (key === 'arrowdown' || key === 's') {
        direction = 'DOWN';
      } else if (key === 'arrowleft' || key === 'a') {
        direction = 'LEFT';
      } else if (key === 'arrowright' || key === 'd') {
        direction = 'RIGHT';
      }

      if (direction) {
        e.preventDefault();
        this.gameManager.makeMove(direction);
      }
    });

    this.keyListenerAttached = true;
  }

  public setView(view: ViewMode, stage?: Stage): void {
    this.viewMode = view;
    if (stage) {
      this.gameManager = new GameManager(stage, (_state) => {
        this.render();
      });
      this.gameManager.initGame();
    }
    this.render();
  }

  private render(): void {
    if (this.viewMode === 'STAGE_SELECT') {
      this.renderStageSelect();
    } else {
      this.renderGame();
    }
  }

  // ================= 1. HOME / STAGE SELECTION VIEW =================
  private renderStageSelect(): void {
    this.container.innerHTML = `
      <header class="app-header">
        <h1 class="app-title">AI Grid Adventure</h1>
        <p class="app-subtitle">Escape the AI opponent using smart moves while it tracks you with A* pathfinding.</p>
      </header>

      <main class="stage-select-container">
        <div class="stage-cards">
          <!-- Easy Stage -->
          <div class="stage-card easy" id="btn-stage-easy" role="button" tabindex="0">
            <div class="stage-card-header">
              <span class="stage-name">Easy Stage</span>
              <span class="stage-badge">4 × 4 Grid</span>
            </div>
            <p class="stage-desc">A compact arena. Fast-paced escape with minimal obstacles and quick routes.</p>
            <button class="stage-card-btn" type="button">Select 4×4 Stage</button>
          </div>

          <!-- Hard Stage -->
          <div class="stage-card hard" id="btn-stage-hard" role="button" tabindex="0">
            <div class="stage-card-header">
              <span class="stage-name">Hard Stage</span>
              <span class="stage-badge">8 × 8 Grid</span>
            </div>
            <p class="stage-desc">Standard labyrinth. Multiple wall corridors, coins to collect, and tactical chokepoints.</p>
            <button class="stage-card-btn" type="button">Select 8×8 Stage</button>
          </div>

          <!-- Expert Stage -->
          <div class="stage-card expert" id="btn-stage-expert" role="button" tabindex="0">
            <div class="stage-card-header">
              <span class="stage-name">Expert Stage</span>
              <span class="stage-badge">12 × 12 Grid</span>
            </div>
            <p class="stage-desc">Expansive complex maze. Deep A* calculations, multi-corridor traps, and highest reward.</p>
            <button class="stage-card-btn" type="button">Select 12×12 Stage</button>
          </div>
        </div>

        <div class="backend-indicator">
          <span>Backend API Target:</span>
          <code>${API_BASE_URL}</code>
        </div>
      </main>

      <footer class="app-footer">
        <p>AI Grid Adventure • Powered by Spring Boot A* Search Backend</p>
      </footer>
    `;

    document.getElementById('btn-stage-easy')?.addEventListener('click', () => this.setView('GAME', 'EASY'));
    document.getElementById('btn-stage-hard')?.addEventListener('click', () => this.setView('GAME', 'HARD'));
    document.getElementById('btn-stage-expert')?.addEventListener('click', () => this.setView('GAME', 'EXPERT'));
  }

  // ================= 2. GAME VIEW =================
  private renderGame(): void {
    if (!this.gameManager) return;
    const state = this.gameManager.getState();
    const boardDef = this.gameManager.getBoardDefinition();

    let bannerHtml = '';
    if (state.status === 'PLAYER_WINS') {
      bannerHtml = `
        <div class="status-banner win">
          <span>🎉 <strong>Victory!</strong> You reached the goal and escaped the AI! Final Score: ${state.score} in ${state.moves} moves.</span>
          <button class="btn btn-primary" id="btn-banner-new">Play Next Board</button>
        </div>
      `;
    } else if (state.status === 'AI_WINS') {
      bannerHtml = `
        <div class="status-banner loss">
          <span>💀 <strong>Game Over!</strong> The AI caught you using A* pathfinding.</span>
          <button class="btn btn-primary" id="btn-banner-restart">Try Again</button>
        </div>
      `;
    } else if (state.errorMessage) {
      bannerHtml = `
        <div class="status-banner error">
          <span>⚠️ ${this.escapeHtml(state.errorMessage)}</span>
        </div>
      `;
    }

    this.container.innerHTML = `
      <header class="app-header">
        <h1 class="app-title">AI Grid Adventure</h1>
        <p class="app-subtitle">${boardDef.name} — ${state.size}×${state.size} Grid</p>
      </header>

      <div class="game-layout">
        <!-- Top Toolbar -->
        <div class="top-bar">
          <div class="top-bar-left">
            <span class="top-bar-title">${state.stage} Stage</span>
            <div class="backend-indicator">
              <span class="indicator-dot ${state.backendConnected ? 'online' : 'offline'}"></span>
              <span>${state.backendConnected ? 'Backend Connected' : 'Offline'}</span>
            </div>
          </div>

          <div class="top-bar-actions">
            <button class="btn btn-secondary" id="btn-back">← Back to Stages</button>
            <button class="btn btn-secondary" id="btn-restart">↺ Restart</button>
            <button class="btn btn-primary" id="btn-new-game">✦ New Game</button>
          </div>
        </div>

        ${bannerHtml}

        <!-- Main Game Area: Board + Sidebar Controls -->
        <div class="game-main-area">
          <!-- Left: Game Board -->
          <div class="board-container">
            ${this.renderBoardGrid(state)}
          </div>

          <!-- Right: Side Panel (Stats, Controls, Legend) -->
          <aside class="side-panel">
            <!-- Game Information Card -->
            <div class="panel-card">
              <h2 class="panel-card-title">Game Information</h2>
              <div class="stats-grid">
                <div class="stat-item">
                  <span class="stat-label">Stage</span>
                  <span class="stat-value">${state.stage} (${state.size}×${state.size})</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Score</span>
                  <span class="stat-value">${state.score}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Moves</span>
                  <span class="stat-value">${state.moves}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Status</span>
                  <span class="stat-value" style="font-size: 0.95rem;">${this.formatStatus(state.status)}</span>
                </div>
              </div>

              <div style="margin-top: 14px;">
                <div class="pos-list">
                  <div class="pos-row">
                    <span class="pos-tag">🏃 Player (P):</span>
                    <span>Row ${state.playerPos.row}, Col ${state.playerPos.col}</span>
                  </div>
                  <div class="pos-row">
                    <span class="pos-tag">🤖 AI Enemy (A):</span>
                    <span>Row ${state.aiPos.row}, Col ${state.aiPos.col}</span>
                  </div>
                  <div class="pos-row">
                    <span class="pos-tag">🚩 Goal (G):</span>
                    <span>Row ${state.goalPos.row}, Col ${state.goalPos.col}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Controls Card -->
            <div class="panel-card">
              <h2 class="panel-card-title">Player Controls</h2>
              <div class="controls-box">
                <div class="dpad">
                  <button class="btn-ctrl dpad-up" id="ctrl-up" title="Move Up (W / ↑)" ${state.status !== 'IN_PROGRESS' ? 'disabled' : ''}>▲</button>
                  <button class="btn-ctrl dpad-left" id="ctrl-left" title="Move Left (A / ←)" ${state.status !== 'IN_PROGRESS' ? 'disabled' : ''}>◀</button>
                  <div class="dpad-center"></div>
                  <button class="btn-ctrl dpad-right" id="ctrl-right" title="Move Right (D / →)" ${state.status !== 'IN_PROGRESS' ? 'disabled' : ''}>▶</button>
                  <button class="btn-ctrl dpad-down" id="ctrl-down" title="Move Down (S / ↓)" ${state.status !== 'IN_PROGRESS' ? 'disabled' : ''}>▼</button>
                </div>

                <p class="keyboard-hint">
                  Use on-screen buttons or keyboard keys <span class="kbd-badge">W</span> <span class="kbd-badge">A</span> <span class="kbd-badge">S</span> <span class="kbd-badge">D</span> / <span class="kbd-badge">Arrow Keys</span>.
                </p>
              </div>
            </div>

            <!-- Legend Card -->
            <div class="panel-card">
              <h2 class="panel-card-title">Map Legend</h2>
              <div class="legend-grid">
                <div class="legend-item"><span class="legend-icon" style="background:#3b82f6;"></span> Player (P)</div>
                <div class="legend-item"><span class="legend-icon" style="background:#ef4444;"></span> AI (A)</div>
                <div class="legend-item"><span class="legend-icon" style="background:#10b981;"></span> Goal (G)</div>
                <div class="legend-item"><span class="legend-icon" style="background:#f59e0b;"></span> Coin (+10)</div>
                <div class="legend-item"><span class="legend-icon" style="background:#334155;"></span> Wall</div>
                <div class="legend-item"><span class="legend-icon" style="background:#cbd5e1; border: 1px dashed #ef4444;"></span> AI Path</div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <footer class="app-footer">
        <p>AI Grid Adventure • Backend: <code>${API_BASE_URL}</code></p>
      </footer>
    `;

    this.attachGameEvents();
  }

  private renderBoardGrid(state: GameState): string {
    const size = state.size;
    let cellsHtml = '';

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const isPlayer = state.playerPos.row === r && state.playerPos.col === c;
        const isAi = state.aiPos.row === r && state.aiPos.col === c;
        const isGoal = state.goalPos.row === r && state.goalPos.col === c;
        const isCoin = state.coins.some((coin) => coin.row === r && coin.col === c);
        const isWall = state.walls.some((wall) => wall.row === r && wall.col === c);
        const isAiPath = !isPlayer && !isAi && state.aiPath.some((p) => p.row === r && p.col === c);

        let cellClass = 'grid-cell';
        let content = '';

        if (isPlayer) {
          cellClass += ' cell-player';
          content = '<span class="cell-label" title="Player">🏃</span>';
        } else if (isAi) {
          cellClass += ' cell-ai';
          content = '<span class="cell-label" title="AI Enemy">🤖</span>';
        } else if (isGoal) {
          cellClass += ' cell-goal';
          content = '<span class="cell-label" title="Goal">🚩</span>';
        } else if (isCoin) {
          cellClass += ' cell-coin';
          content = '<span class="cell-label" title="Coin">🪙</span>';
        } else if (isWall) {
          cellClass += ' cell-wall';
          content = '';
        } else {
          content = '';
        }

        if (isAiPath) {
          cellClass += ' cell-ai-path';
        }

        cellsHtml += `<div class="${cellClass}" data-row="${r}" data-col="${c}">${content}</div>`;
      }
    }

    return `<div class="grid-board grid-size-${size}">${cellsHtml}</div>`;
  }

  private attachGameEvents(): void {
    document.getElementById('btn-back')?.addEventListener('click', () => {
      this.setView('STAGE_SELECT');
    });

    document.getElementById('btn-restart')?.addEventListener('click', () => {
      this.gameManager?.restartGame();
    });

    document.getElementById('btn-new-game')?.addEventListener('click', () => {
      this.gameManager?.newGame();
    });

    document.getElementById('btn-banner-restart')?.addEventListener('click', () => {
      this.gameManager?.restartGame();
    });

    document.getElementById('btn-banner-new')?.addEventListener('click', () => {
      this.gameManager?.newGame();
    });

    // D-Pad
    document.getElementById('ctrl-up')?.addEventListener('click', () => {
      this.gameManager?.makeMove('UP');
    });
    document.getElementById('ctrl-down')?.addEventListener('click', () => {
      this.gameManager?.makeMove('DOWN');
    });
    document.getElementById('ctrl-left')?.addEventListener('click', () => {
      this.gameManager?.makeMove('LEFT');
    });
    document.getElementById('ctrl-right')?.addEventListener('click', () => {
      this.gameManager?.makeMove('RIGHT');
    });
  }

  private formatStatus(status: string): string {
    switch (status) {
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'PLAYER_WINS':
        return 'Player Wins! 🏆';
      case 'AI_WINS':
        return 'AI Wins 💀';
      default:
        return status;
    }
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Initialize application on DOM ready
new App();
