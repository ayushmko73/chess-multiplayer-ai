import { Chess, Move } from 'chess.js';

const pieceValues: Record<string, number> = {
  p: 10, r: 50, n: 30, b: 30, q: 90, k: 900
};

export type Difficulty = 'Beginner' | 'Easy' | 'Hard' | 'Master';

export const getBestMove = (game: Chess, difficulty: Difficulty): Move | null => {
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return null;

  if (difficulty === 'Beginner') {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  let bestMove = null;
  let bestValue = -Infinity;
  
  const depth = difficulty === 'Easy' ? 1 : difficulty === 'Hard' ? 2 : 3;

  for (const move of moves) {
    game.move(move);
    const boardValue = -evaluateBoard(game, depth - 1, -Infinity, Infinity, false);
    game.undo();
    if (boardValue > bestValue) {
      bestValue = boardValue;
      bestMove = move;
    }
  }

  return bestMove || moves[0];
};

const evaluateBoard = (game: Chess, depth: number, alpha: number, beta: number, isMaximizing: boolean): number => {
  if (depth === 0) return calculatePosition(game);

  const moves = game.moves();
  if (isMaximizing) {
    let bestValue = -Infinity;
    for (const move of moves) {
      game.move(move);
      bestValue = Math.max(bestValue, evaluateBoard(game, depth - 1, alpha, beta, !isMaximizing));
      game.undo();
      alpha = Math.max(alpha, bestValue);
      if (beta <= alpha) break;
    }
    return bestValue;
  } else {
    let bestValue = Infinity;
    for (const move of moves) {
      game.move(move);
      bestValue = Math.min(bestValue, evaluateBoard(game, depth - 1, alpha, beta, !isMaximizing));
      game.undo();
      beta = Math.min(beta, bestValue);
      if (beta <= alpha) break;
    }
    return bestValue;
  }
};

const calculatePosition = (game: Chess): number => {
  let totalValue = 0;
  const board = game.board();
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece) {
        const val = pieceValues[piece.type];
        totalValue += piece.color === 'w' ? val : -val;
      }
    }
  }
  return game.turn() === 'w' ? totalValue : -totalValue;
};