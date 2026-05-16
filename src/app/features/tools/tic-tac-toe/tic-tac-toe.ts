import { ChangeDetectorRef, Component } from '@angular/core';
import { SeoService } from '../../../core/services/seo';

type Cell = 'X' | 'O' | null;
type GameMode = 'pvp' | 'cpu';

@Component({
  selector: 'app-tic-tac-toe',
  standalone: false,
  templateUrl: './tic-tac-toe.html',
})
export class TicTacToe {
  board: Cell[] = Array(9).fill(null);
  currentPlayer: 'X' | 'O' = 'X';
  winner: Cell = null;
  isDraw = false;
  mode: GameMode = 'pvp';
  scores = { X: 0, O: 0, draw: 0 };
  winLine: number[] = [];
  cpuThinking = false;

  private readonly LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  constructor(private readonly cdr: ChangeDetectorRef, seo: SeoService) {
    seo.set('Tris (Tic Tac Toe)', 'Gioca a Tris nel browser. Modalità giocatore vs giocatore o contro il computer.');
  }

  setMode(m: GameMode): void {
    this.mode = m;
    this.newGame();
  }

  move(index: number): void {
    if (this.board[index] || this.winner || this.isDraw || this.cpuThinking) return;
    this.board[index] = this.currentPlayer;
    if (this.checkEnd()) return;
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    if (this.mode === 'cpu' && this.currentPlayer === 'O') {
      this.cpuThinking = true;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.cpuMove();
        this.cpuThinking = false;
        this.cdr.detectChanges();
      }, 350);
    } else {
      this.cdr.detectChanges();
    }
  }

  private cpuMove(): void {
    const best = this.minimax(this.board, 'O');
    if (best.index !== undefined) {
      this.board[best.index] = 'O';
      this.checkEnd();
      if (!this.winner && !this.isDraw) this.currentPlayer = 'X';
    }
  }

  private minimax(board: Cell[], player: 'X' | 'O'): { score: number; index?: number } {
    const win = this.findWinner(board);
    if (win === 'O') return { score: 10 };
    if (win === 'X') return { score: -10 };
    const empty = board.map((c, i) => c === null ? i : -1).filter(i => i >= 0);
    if (empty.length === 0) return { score: 0 };

    const moves = empty.map(i => {
      const b = [...board];
      b[i] = player;
      const s = this.minimax(b, player === 'O' ? 'X' : 'O').score;
      return { index: i, score: s };
    });

    return player === 'O'
      ? moves.reduce((a, b) => b.score > a.score ? b : a)
      : moves.reduce((a, b) => b.score < a.score ? b : a);
  }

  private findWinner(board: Cell[]): Cell {
    for (const [a, b, c] of this.LINES) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    }
    return null;
  }

  private checkEnd(): boolean {
    for (const line of this.LINES) {
      const [a, b, c] = line;
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        this.winner = this.board[a];
        this.winLine = line;
        this.scores[this.winner]++;
        this.cdr.detectChanges();
        return true;
      }
    }
    if (this.board.every(c => c !== null)) {
      this.isDraw = true;
      this.scores.draw++;
      this.cdr.detectChanges();
      return true;
    }
    return false;
  }

  newGame(): void {
    this.board = Array(9).fill(null);
    this.currentPlayer = 'X';
    this.winner = null;
    this.isDraw = false;
    this.winLine = [];
    this.cpuThinking = false;
    this.cdr.detectChanges();
  }

  resetScores(): void {
    this.scores = { X: 0, O: 0, draw: 0 };
    this.newGame();
  }

  isWinCell(i: number): boolean {
    return this.winLine.includes(i);
  }
}
