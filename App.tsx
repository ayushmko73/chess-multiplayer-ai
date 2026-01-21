import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Dimensions, SafeAreaView, ScrollView, StatusBar, Platform } from 'react-native';
import { Chess, Square } from 'chess.js';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { getBestMove, Difficulty } from './src/lib/chess-ai';

type GameMode = 'AI' | 'Local' | 'Multiplayer';

const { width } = Dimensions.get('window');
const BOARD_SIZE = Math.min(width - 32, 500);
const SQUARE_SIZE = BOARD_SIZE / 8;

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

  const onSquarePress = (square: Square) => {
    if (isAiThinking) return;
    
    if (selectedSquare) {
      const moveSuccessful = makeMove({ from: selectedSquare, to: square, promotion: 'q' });
      setSelectedSquare(null);
      if (moveSuccessful) return;
    }

    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      setSelectedSquare(square);
    } else {
      setSelectedSquare(null);
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Grandmaster Chess</Text>
          <Text style={styles.subtitle}>Master the board, dominate the game.</Text>
        </View>

        <View style={styles.boardContainer}>
          <View style={styles.board}>
            {board.map((row, rowIndex) => (
              row.map((piece, colIndex) => {
                const squareName = String.fromCharCode(97 + colIndex) + (8 - rowIndex) as Square;
                const isDark = (rowIndex + colIndex) % 2 === 1;
                const isSelected = selectedSquare === squareName;
                const isLastMove = false; // Simplified for RN demo

                return (
                  <TouchableOpacity
                    key={squareName}
                    onPress={() => onSquarePress(squareName)}
                    activeOpacity={0.9}
                    style={[
                      styles.square,
                      isDark ? styles.squareDark : styles.squareLight,
                      isSelected && styles.squareSelected,
                      isLastMove && styles.squareLastMove,
                    ]}
                  >
                    {piece && (
                      <Image
                        source={{ uri: PIECE_IMAGES[`${piece.color}${piece.type}`] }}
                        style={styles.piece}
                        resizeMode="contain"
                      />
                    )}
                    {colIndex === 0 && <Text style={[styles.coord, styles.coordNum, isDark ? styles.coordLight : styles.coordDark]}>{8 - rowIndex}</Text>}
                    {rowIndex === 7 && <Text style={[styles.coord, styles.coordAlpha, isDark ? styles.coordLight : styles.coordDark]}>{String.fromCharCode(97 + colIndex)}</Text>}
                  </TouchableOpacity>
                );
              })
            ))}
          </View>
        </View>

        <View style={styles.controls}>
          <View style={styles.panel}>
            <Text style={styles.panelLabel}>
              <Ionicons name="settings-outline" size={14} color="#71717a" /> GAME MODE
            </Text>
            <View style={styles.modeButtons}>
              {(['AI', 'Local', 'Multiplayer'] as GameMode[]).map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setMode(m)}
                  style={[styles.modeButton, mode === m && styles.modeButtonActive]}
                >
                  <Text style={[styles.modeButtonText, mode === m && styles.modeButtonTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {mode === 'AI' && (
            <View style={styles.panel}>
              <Text style={styles.panelLabel}>DIFFICULTY</Text>
              <View style={styles.diffButtons}>
                {(['Beginner', 'Easy', 'Hard', 'Master'] as Difficulty[]).map((d) => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => setDifficulty(d)}
                    style={[styles.diffButton, difficulty === d && styles.diffButtonActive]}
                  >
                    <Text style={[styles.diffButtonText, difficulty === d && styles.diffButtonTextActive]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <TouchableOpacity onPress={resetGame} style={styles.resetButton}>
            <MaterialCommunityIcons name="restart" size={18} color="#ef4444" />
            <Text style={styles.resetButtonText}>New Game</Text>
          </TouchableOpacity>

          <View style={styles.statusPanel}>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, game.turn() === 'w' ? styles.statusDotWhite : styles.statusDotGreen]} />
              <Text style={styles.statusText}>{status}</Text>
            </View>
            {isAiThinking && <Text style={styles.thinkingText}>Engine thinking...</Text>}
          </View>

          <View style={styles.historyPanel}>
             <Text style={styles.historyTitle}><Ionicons name="trophy-outline" size={16} color="#10b981" /> Match Logs</Text>
             <ScrollView style={styles.historyScroll} nestedScrollEnabled>
                <View style={styles.historyGrid}>
                  {moveHistory.reduce((acc: string[][], move, i) => {
                    if (i % 2 === 0) acc.push([move]);
                    else acc[acc.length - 1].push(move);
                    return acc;
                  }, []).map((pair, i) => (
                    <View key={i} style={styles.historyRow}>
                       <Text style={styles.historyIndex}>{i + 1}.</Text>
                       <Text style={styles.historyMove}>{pair[0]}</Text>
                       <Text style={styles.historyMove}>{pair[1] || ''}</Text>
                    </View>
                  ))}
                  {moveHistory.length === 0 && <Text style={styles.emptyHistory}>Waiting for moves...</Text>}
                </View>
             </ScrollView>
          </View>
        </View>

        <Text style={styles.footer}>Engine: Stockfish-Lite Algorithm (v1.0) • Pro Play</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#10b981',
    textTransform: 'uppercase',
    fontStyle: 'italic',
    letterSpacing: -1,
  },
  subtitle: {
    color: '#a1a1aa',
    fontWeight: '500',
    marginTop: 4,
  },
  boardContainer: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    backgroundColor: '#18181b',
    padding: 0,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#18181b',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    marginBottom: 24,
  },
  board: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  square: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  squareLight: {
    backgroundColor: '#ebecd0',
  },
  squareDark: {
    backgroundColor: '#779556',
  },
  squareSelected: {
    backgroundColor: 'rgba(96, 165, 250, 0.7)',
  },
  squareLastMove: {
    backgroundColor: 'rgba(250, 204, 21, 0.5)',
  },
  piece: {
    width: '85%',
    height: '85%',
  },
  coord: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: 'bold',
  },
  coordNum: {
    top: 2,
    left: 2,
  },
  coordAlpha: {
    bottom: 2,
    right: 2,
  },
  coordLight: {
    color: '#ebecd0',
  },
  coordDark: {
    color: '#779556',
  },
  controls: {
    width: '100%',
    maxWidth: 500,
    gap: 16,
  },
  panel: {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
    borderWidth: 1,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  panelLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#71717a',
  },
  modeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: '#27272a',
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  modeButtonText: {
    color: '#a1a1aa',
    fontWeight: 'bold',
  },
  modeButtonTextActive: {
    color: '#34d399',
  },
  diffButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  diffButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#27272a',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  diffButtonActive: {
    backgroundColor: '#f4f4f5',
  },
  diffButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#71717a',
  },
  diffButtonTextActive: {
    color: '#09090b',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
  },
  resetButtonText: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  statusPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#18181b',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusDotWhite: {
    backgroundColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  statusDotGreen: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  thinkingText: {
    color: '#71717a',
    fontSize: 12,
    fontStyle: 'italic',
  },
  historyPanel: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272a',
    height: 200,
    overflow: 'hidden',
  },
  historyTitle: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: 'rgba(39, 39, 42, 0.5)',
  },
  historyScroll: {
    flex: 1,
    padding: 12,
  },
  historyGrid: {
    gap: 4,
  },
  historyRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 4,
  },
  historyIndex: {
    color: '#52525b',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    width: 24,
  },
  historyMove: {
    color: '#f4f4f5',
    fontWeight: '500',
    flex: 1,
  },
  emptyHistory: {
    color: '#52525b',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 12,
  },
  footer: {
    color: '#52525b',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 24,
    marginBottom: 40,
  },
});
