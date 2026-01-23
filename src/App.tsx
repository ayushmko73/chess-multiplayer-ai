import React, { useState, useEffect, useCallback } from 'react';
import { Chess, Square } from 'chess.js';
import { Trophy, RotateCcw, User, Cpu, Users, Settings2, ChevronRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getBestMove } from './lib/engine.ts';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Mode = 'AI' | 'Local' | 'Multiplayer';
type Difficulty = 'Beginner' | 'Easy' | 'Hard' | 'Master';

const App = () => {
  const [game, setGame] = useState(new Chess());
  const [mode, setMode] = useState<Mode>('AI');
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('White to move');

  const PIECE_IMAGES: Record<string, string> = {
    wP: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
    wR: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
    wN: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
    wB: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
    wQ: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
    wK: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
    bP: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
    bR: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
    bN: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
    bB: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
    bQ: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
    bK: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
  };

  const updateGameStatus = (g: Chess) => {
    if (g.in_checkmate()) setStatus('Checkmate! ' + (g.turn() === 'w' ? 'Black' : 'White') + ' wins');
    else if (g.in_draw()) setStatus('Draw!');
    else if (g.in_check()) setStatus('Check! ' + (g.turn() === 'w' ? 'White' : 'Black') + "'s turn");
    else setStatus((g.turn() === 'w' ? 'White' : 'Black') + "'s turn");
  };

  const makeMove = useCallback((move: any) => {
    const gameCopy = new Chess(game.fen());
    const result = gameCopy.move(move);
    if (result) {
      setGame(gameCopy);
      setMoveHistory(h => [...h, result.san]);
      updateGameStatus(gameCopy);
      setSelectedSquare(null);
      return true;
    }
    return false;
  }, [game]);

  useEffect(() => {
    if (mode === 'AI' && game.turn() === 'b' && !game.game_over()) {
      const timeout = setTimeout(() => {
        const bestMove = getBestMove(game, difficulty);
        makeMove(bestMove);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [game, mode, difficulty, makeMove]);

  const onSquareClick = (square: Square) => {
    if (game.game_over()) return;
    if (mode === 'AI' && game.turn() === 'b') return;

    if (selectedSquare) {
      const move = makeMove({ from: selectedSquare, to: square, promotion: 'q' });
      if (!move) setSelectedSquare(square);
    } else {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
      }
    }
  };

  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setMoveHistory([]);
    setStatus('White to move');
    setSelectedSquare(null);
  };

  const renderBoard = () => {
    const board = [];
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    for (let i = 7; i >= 0; i--) {
      for (let j = 0; j < 8; j++) {
        const square = (files[j] + (i + 1)) as Square;
        const piece = game.get(square);
        const isDark = (i + j) % 2 === 0;
        const isSelected = selectedSquare === square;

        board.push(
          <div
            key={square}
            onClick={() => onSquareClick(square)}
            className={cn(
              'relative flex items-center justify-center cursor-pointer transition-colors',
              isDark ? 'bg-[#b58863]' : 'bg-[#f0d9b5]',
              isSelected && 'ring-4 ring-inset ring-yellow-400 ring-opacity-60'
            )}
          >
            {piece && (
              <img
                src={PIECE_IMAGES[`${piece.color}${piece.type.toUpperCase()}`]}
                className="w-[85%] h-[85%] select-none active:scale-95 transition-transform"
                alt={piece.type}
              />
            )}
            {j === 0 && <span className={cn("absolute left-0.5 top-0.5 text-[10px] font-bold", isDark ? "text-[#f0d9b5]" : "text-[#b58863]")}>{i + 1}</span>}
            {i === 0 && <span className={cn("absolute right-0.5 bottom-0.5 text-[10px] font-bold", isDark ? "text-[#f0d9b5]" : "text-[#b58863]")}>{files[j]}</span>}
          </div>
        );
      }
    }
    return board;
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col lg:flex-row">
      {/* Sidebar Controls */}
      <div className="w-full lg:w-80 bg-zinc-900 p-6 border-b lg:border-b-0 lg:border-r border-zinc-800 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Trophy className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Grandmaster</h1>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-semibold uppercase text-zinc-500 flex items-center gap-2">
            <Settings2 size={14} /> Game Mode
          </label>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => { setMode('AI'); resetGame(); }}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all border",
                mode === 'AI' ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-zinc-800/50 border-transparent text-zinc-400 hover:bg-zinc-800"
              )}
            >
              <Cpu size={18} /> VS Computer
            </button>
            <button
              onClick={() => { setMode('Local'); resetGame(); }}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all border",
                mode === 'Local' ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" : "bg-zinc-800/50 border-transparent text-zinc-400 hover:bg-zinc-800"
              )}
            >
              <User size={18} /> Pass & Play
            </button>
            <button
              onClick={() => alert('Multiplayer Coming Soon!')}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-800/50 border-transparent text-zinc-500 cursor-not-allowed"
            >
              <Users size={18} /> Multiplayer
            </button>
          </div>
        </div>

        {mode === 'AI' && (
          <div className="space-y-4">
            <label className="text-xs font-semibold uppercase text-zinc-500">AI Difficulty</label>
            <div className="grid grid-cols-2 gap-2">
              {(['Beginner', 'Easy', 'Hard', 'Master'] as Difficulty[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm transition-all border",
                    difficulty === level ? "bg-zinc-100 text-zinc-950 border-zinc-100" : "bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={resetGame}
          className="mt-auto flex items-center justify-center gap-2 bg-zinc-100 text-zinc-900 font-bold py-4 rounded-xl hover:bg-white transition-colors"
        >
          <RotateCcw size={18} /> Reset Board
        </button>
      </div>

      {/* Main Game Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-[600px] flex flex-col gap-4">
          <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <div className="flex items-center gap-4">
               <div className="w-3 h-3 rounded-full animate-pulse bg-emerald-500" />
               <span className="font-medium">{status}</span>
            </div>
            <div className="text-sm text-zinc-500">
              {mode === 'AI' ? `Playing AI (${difficulty})` : 'Two Player Mode'}
            </div>
          </div>

          <div className="chess-grid shadow-2xl shadow-black">
            {renderBoard()}
          </div>

          <div className="h-12 flex gap-2 overflow-x-auto no-scrollbar py-1">
            {moveHistory.length === 0 && <span className="text-zinc-600 italic text-sm py-2">No moves yet...</span>}
            {moveHistory.map((move, i) => (
              <div key={i} className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 shrink-0">
                <span className="text-zinc-500 text-xs">{Math.floor(i/2) + 1}{i%2===0?'.':'...'}</span>
                <span className="font-mono font-bold text-zinc-200">{move}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;