import { Chess, Move } from 'chess.js';

type Difficulty = 'Beginner' | 'Easy' | 'Hard' | 'Master';

const PIECE_VALUES: Record<string, number> = {
  p: 10,
  n: 30,
  b: 30,
  r: 50,
  q: 90,
  k: 900,
};

const evaluateBoard = (game: Chess): number => {
  let totalEvaluation = 0;
  const board = game.board();
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      totalEvaluation = totalEvaluation + getPieceValue(board[i][j]);
    }
  }
  return totalEvaluation;
};

const getPieceValue = (piece: any): number => {
  if (piece === null) return 0;
  const val = PIECE_VALUES[piece.type] || 0;
  return piece.color === 'w' ? val : -val;
};

const minimax = (game: Chess, depth: number, alpha: number, beta: number, isMaximizingPlayer: boolean): number => {
  if (depth === 0) return -evaluateBoard(game);

  const moves = game.moves();

  if (isMaximizingPlayer) {
    let bestEval = -9999;
    for (const move of moves) {
      game.move(move);
      bestEval = Math.max(bestEval, minimax(game, depth - 1, alpha, beta, !isMaximizingPlayer));
      game.undo();
      alpha = Math.max(alpha, bestEval);
      if (beta <= alpha) break;
    }
    return bestEval;
  } else {
    let bestEval = 9999;
    for (const move of moves) {
      game.move(move);
      bestEval = Math.min(bestEval, minimax(game, depth - 1, alpha, beta, !isMaximizingPlayer));
      game.undo();
      beta = Math.min(beta, bestEval);
      if (beta <= alpha) break;
    }
    return bestEval;
  }
};

export const getBestMove = (game: Chess, difficulty: Difficulty): string => {
  const moves = game.moves();
  if (moves.length === 0) return '';

  if (difficulty === 'Beginner') {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const depth = difficulty === 'Easy' ? 1 : difficulty === 'Hard' ? 2 : 3;
  
  let bestMove = '';
  let bestValue = -9999;

  for (const move of moves) {
    game.move(move);
    const boardValue = minimax(game, depth - 1, -10000, 10000, false);
    game.undo();
    if (boardValue > bestValue) {
      bestValue = boardValue;
      bestMove = move;
    }
  }

  return bestMove || moves[0];
};