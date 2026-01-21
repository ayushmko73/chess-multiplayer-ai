import React, { useState, useEffect, useCallback } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { Settings, Users, Cpu, Globe, RotateCcw, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getBestMove, Difficulty } from './lib/chess-ai';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type GameMode = 'AI' | 'Local' | 'Multiplayer';

const PIECE_IMAGES: Record<string, string> = {
  wp: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg',
  wr: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg',
  wn: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg',
  wb: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg',
  wq: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg',
  wk: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg',
  bp: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg',
  br: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg',
  bn: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg',
  bb: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg',
  bq: 'https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg',
  bk: 'https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg',
};

export default function App() {
  const [game, setGame] = useState(new Chess());
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [mode, setMode] = useState<GameMode>('AI');
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('Your Turn');
  const [isAiThinking, setIsAiThinking] = useState(false);

  const makeMove = useCallback((move: string | { from: string; to: string; promotion?: string }) => {
    try {
      const result = game.move(move);
      if (result) {
        setGame(new Chess(game.fen()));
        setMoveHistory(prev => [...prev, result.san]);
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }, [game]);

  useEffect(() => {
    if (mode === 'AI' && game.turn() === 'b' && !game.isGameOver()) {
      setIsAiThinking(true);
      setTimeout(() => {
        const aiMove = getBestMove(game, difficulty);
        if (aiMove) makeMove(aiMove);
        setIsAiThinking(false);
      }, 600);
    }

    if (game.isCheckmate()) setStatus(`Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins.`);
    else if (game.isDraw()) setStatus('Draw!');
    else if (game.inCheck()) setStatus('Check!');
    else setStatus(game.turn() === 'w' ? "White's Turn" : "Black's Turn");
  }, [game, mode, difficulty, makeMove]);

  const onSquareClick = (square: Square) => {
    if (isAiThinking) return;
    
    if (selectedSquare) {
      const moveSuccessful = makeMove({ from: selectedSquare, to: square, promotion: 'q' });
      setSelectedSquare(null);
      if (moveSuccessful) return;
    }

    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
    }
  };

  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setMoveHistory([]);
    setSelectedSquare(null);
  };

  const board = game.board();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 lg:p-8 space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-4xl font-black tracking-tighter text-emerald-500 uppercase italic">Grandmaster Chess</h1>
        <p className="text-zinc-400 font-medium">Master the board, dominate the game.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-6xl">
        {/* Sidebar Left: Config */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl space-y-6">
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <Settings size={14} /> Game Mode
              </label>
              <div className="grid grid-cols-1 gap-2">
                {(['AI', 'Local', 'Multiplayer'] as GameMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all",
                      mode === m ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" : "bg-zinc-800/50 border-transparent text-zinc-400 hover:bg-zinc-800"
                    )}
                  >
                    {m === 'AI' && <Cpu size={18} />}
                    {m === 'Local' && <Users size={18} />}
                    {m === 'Multiplayer' && <Globe size={18} />}
                    <span className="font-bold">{m}</span>
                  </button>
                ))}
              </div>
            </div>

            {mode === 'AI' && (
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Difficulty</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Beginner', 'Easy', 'Hard', 'Master'] as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={cn(
                        "p-2 text-xs font-bold rounded-lg border transition-all",
                        difficulty === d ? "bg-zinc-100 text-zinc-950 border-white" : "bg-zinc-800 border-transparent text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={resetGame}
              className="w-full flex items-center justify-center gap-2 p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl font-bold transition-colors"
            >
              <RotateCcw size={18} /> New Game
            </button>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-3 h-3 rounded-full animate-pulse", game.turn() === 'w' ? "bg-white shadow-[0_0_8px_white]" : "bg-emerald-500 shadow-[0_0_8px_emerald]")} />
              <span className="font-bold text-sm tracking-tight">{status}</span>
            </div>
            {isAiThinking && <span className="text-xs text-zinc-500 italic">Engine thinking...</span>}
          </div>
        </div>

        {/* Chess Board Main */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative aspect-square w-full max-w-[500px] bg-zinc-800 rounded-lg overflow-hidden shadow-2xl border-8 border-zinc-900">
            <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
              {board.flat().map((piece, i) => {
                const row = Math.floor(i / 8);
                const col = i % 8;
                const squareName = String.fromCharCode(97 + col) + (8 - row) as Square;
                const isDark = (row + col) % 2 === 1;
                const isSelected = selectedSquare === squareName;
                
                return (
                  <div
                    key={i}
                    onClick={() => onSquareClick(squareName)}
                    className={cn(
                      "relative flex items-center justify-center cursor-pointer transition-colors",
                      isDark ? "chess-square-dark" : "chess-square-light",
                      isSelected && "chess-square-selected"
                    )}
                  >
                    {piece && (
                      <img 
                        src={PIECE_IMAGES[`${piece.color}${piece.type}`]} 
                        alt=""
                        className="w-[85%] h-[85%] select-none pointer-events-none drop-shadow-md transform active:scale-90 transition-transform"
                      />
                    )}
                    {col === 0 && <span className={cn("absolute top-0.5 left-0.5 text-[10px] font-bold", isDark ? "text-[#ebecd0]" : "text-[#779556]")}>{8 - row}</span>}
                    {row === 7 && <span className={cn("absolute bottom-0.5 right-0.5 text-[10px] font-bold", isDark ? "text-[#ebecd0]" : "text-[#779556]")}>{String.fromCharCode(97 + col)}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Right: Move History */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col h-[500px]">
            <div className="p-4 border-b border-zinc-800 bg-zinc-800/50 flex items-center justify-between">
              <h3 className="font-bold flex items-center gap-2"><Trophy size={16} className="text-emerald-500" /> Match Logs</h3>
              <span className="text-[10px] font-black px-2 py-0.5 bg-zinc-700 rounded-full">{Math.ceil(moveHistory.length / 2)} ROUNDS</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {moveHistory.reduce((acc: string[][], move, i) => {
                  if (i % 2 === 0) acc.push([move]);
                  else acc[acc.length - 1].push(move);
                  return acc;
                }, []).map((pair, i) => (
                  <React.Fragment key={i}>
                    <div className="flex items-center gap-3 text-sm py-1">
                      <span className="text-zinc-600 font-mono w-4">{i + 1}.</span>
                      <span className="text-zinc-100 font-medium">{pair[0]}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm py-1">
                      <span className="text-zinc-100 font-medium">{pair[1] || ''}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
              {moveHistory.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-2 opacity-50">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-zinc-700" />
                  <p className="text-xs font-medium">Waiting for move...</p>
                </div>
              )}
            </div>
            <div className="p-4 bg-zinc-800/30 flex gap-2">
              <button className="flex-1 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex justify-center"><ChevronLeft size={20}/></button>
              <button className="flex-1 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg flex justify-center"><ChevronRight size={20}/></button>
            </div>
          </div>
        </div>
      </div>

      <footer className="text-zinc-500 text-xs font-medium pt-8">
        Engine: Stockfish-Lite Algorithm (v1.0) • Developed for Pro Play
      </footer>
    </div>
  );
}
