import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, RotateCcw, Cpu, CircleHelp, Award, Swords, Play,
  Clock, Volume2, VolumeX, ShieldAlert, Award as MedalIcon, Flag, Crown, ChevronRight, Zap
} from 'lucide-react';

// Piece types and interface
type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
type PieceColor = 'white' | 'black';

interface Piece {
  id: string; // unique ID to track animation keys
  type: PieceType;
  color: PieceColor;
}

type BoardState = (Piece | null)[][]; // 8x8 grid

// Sound Synthesizer via Web Audio API 
const playChessSound = (type: 'move' | 'capture' | 'check' | 'win' | 'lose' | 'tick', isMuted: boolean) => {
  if (isMuted) return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (type === 'move') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'capture') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'check') {
      // Alarm sound
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.frequency.setValueAtTime(520, ctx.currentTime);
      osc2.frequency.setValueAtTime(525, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.3);
      osc2.stop(ctx.currentTime + 0.3);
    } else if (type === 'tick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } else if (type === 'win') {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.2);
      });
    } else if (type === 'lose') {
      [392, 349.23, 311.13, 220].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.3);
      });
    }
  } catch (err) {
    console.warn("AudioContext failed to trigger", err);
  }
};

// Piece Arabic labels and icons
export const PIECE_INFO: Record<PieceType, { title: string; symbolWhite: string; symbolBlack: string; points: number; desc: string }> = {
  pawn: { title: 'البيدق / العسكري', symbolWhite: '♙', symbolBlack: '♟', points: 10, desc: 'يتحرك خطوة للأمام (أو خطوتين في النقلة الأولى) ويأكل قطرياً. يمثل الانضباط الكشفي.' },
  rook: { title: 'الرخ / القلعة', symbolWhite: '♖', symbolBlack: '♜', points: 50, desc: 'تتحرك بخطوط مستقيمة أفقياً أو عمودياً لأي مسافة. تمثل حصون الكشافة المتينة.' },
  knight: { title: 'الحصان', symbolWhite: '♘', symbolBlack: '♞', points: 30, desc: 'يتحرك على شكل حرف L ومستقل بالقفز فوق القطع. يمثل مهارة الميدان والسرعة.' },
  bishop: { title: 'الفيل', symbolWhite: '♗', symbolBlack: '♝', points: 30, desc: 'يتحرك قطرياً لأي مسافة على مربعات لونه فقط. يمثل مسالك الجبال والحكمة.' },
  queen: { title: 'الوزير / الملكة', symbolWhite: '♕', symbolBlack: '♛', points: 90, desc: 'تتحرك في جميع الاتجاهات لأي مسافة. القطعة الأكثر مرونة كالقائد المناوب للفرقة.' },
  king: { title: 'الملك / الشاه', symbolWhite: '♔', symbolBlack: '♚', points: 900, desc: 'يتحرك خطوة واحدة فقط في أي اتجاه. حمايته واجب الكشاف وشرفه الكشفي.' },
};

// Initial Chess Board Setup helper
const createInitialBoard = (): BoardState => {
  const board: BoardState = Array(8).fill(null).map(() => Array(8).fill(null));
  const backRow: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];

  // Black pieces (Top)
  for (let c = 0; c < 8; c++) {
    board[0][c] = { id: `b-${backRow[c]}-${c}`, type: backRow[c], color: 'black' };
    board[1][c] = { id: `b-pawn-${c}`, type: 'pawn', color: 'black' };
  }

  // White pieces (Bottom)
  for (let c = 0; c < 8; c++) {
    board[6][c] = { id: `w-pawn-${c}`, type: 'pawn', color: 'white' };
    board[7][c] = { id: `w-${backRow[c]}-${c}`, type: backRow[c], color: 'white' };
  }

  return board;
};

// Formats seconds into MM:SS
const formatTime = (secs: number): string => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

interface MoveRecord {
  num: number;
  whiteStr: string;
  blackStr?: string;
  whitePieceSymbol?: string;
  blackPieceSymbol?: string;
}

interface ChessGameProps {
  onAwardPoints: (points: number) => void;
  role: string;
}

export default function ChessGame({ onAwardPoints, role }: ChessGameProps) {
  // Game fundamental state
  const [board, setBoard] = useState<BoardState>(createInitialBoard);
  const [turn, setTurn] = useState<PieceColor>('white');
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [validMoves, setValidMoves] = useState<[number, number][]>([]);
  const [capturedWhite, setCapturedWhite] = useState<Piece[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<Piece[]>([]);
  const [gameResult, setGameResult] = useState<'win' | 'lost' | 'draw' | 'time_out_white' | 'time_out_black' | null>(null);
  
  // Game setup
  const [gameMode, setGameMode] = useState<'local' | 'ai'>('ai');
  const [aiDifficulty, setAiDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [selectedPieceHelp, setSelectedPieceHelp] = useState<PieceType | null>('king');
  const [pointsClaimed, setPointsClaimed] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Advanced Visuals - Track the last move coordinates to paint gold rings
  const [lastMoveSrc, setLastMoveSrc] = useState<[number, number] | null>(null);
  const [lastMoveDst, setLastMoveDst] = useState<[number, number] | null>(null);

  // New features requested: Chess Timer limits (Seconds)
  const [timerPreset, setTimerPreset] = useState<300 | 600 | 1200>(600); // 5, 10 or 20 mins
  const [whiteSeconds, setWhiteSeconds] = useState<number>(600);
  const [blackSeconds, setBlackSeconds] = useState<number>(600);

  // Move history structured pairs
  const [structuredMoves, setStructuredMoves] = useState<MoveRecord[]>([]);

  // Find the location of any King
  const findKing = (color: PieceColor, currentBoard: BoardState): [number, number] | null => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = currentBoard[r][c];
        if (p && p.type === 'king' && p.color === color) {
          return [r, c];
        }
      }
    }
    return null;
  };

  // Check if a square is attacked by 'color'
  const isSquareAttackedBy = (targetR: number, targetC: number, attackerColor: PieceColor, currentBoard: BoardState): boolean => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = currentBoard[r][c];
        if (piece && piece.color === attackerColor) {
          // Pawn attack check is specific (always diagonal forwards)
          if (piece.type === 'pawn') {
            const dir = attackerColor === 'white' ? -1 : 1;
            if (r + dir === targetR && (c - 1 === targetC || c + 1 === targetC)) {
              return true;
            }
          } else {
            const moves = calculateRawMoves(r, c, currentBoard);
            if (moves.some(([mr, mc]) => mr === targetR && mc === targetC)) {
              return true;
            }
          }
        }
      }
    }
    return false;
  };

  // Convert row, col to algebraic coordinates
  const getCoordinatesName = (r: number, c: number): string => {
    const cols = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح'];
    const rows = ['٨', '٧', '٦', '٥', '٤', '٣', '٢', '١'];
    return `${cols[c]}${rows[r]}`;
  };

  // Timers Effect Clock
  useEffect(() => {
    if (gameResult) return;
    
    const interval = setInterval(() => {
      if (turn === 'white') {
        setWhiteSeconds(prev => {
          if (prev <= 1) {
            setGameResult('time_out_white');
            playChessSound('lose', isMuted);
            clearInterval(interval);
            return 0;
          }
          if (prev < 30 && prev % 2 === 0) {
            playChessSound('tick', isMuted);
          }
          return prev - 1;
        });
      } else {
        setBlackSeconds(prev => {
          if (prev <= 1) {
            setGameResult('time_out_black');
            playChessSound('win', isMuted);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [turn, gameResult, isMuted]);

  // Sync timers when preset changes
  useEffect(() => {
    setWhiteSeconds(timerPreset);
    setBlackSeconds(timerPreset);
  }, [timerPreset]);

  // Reset function with presets
  const handleResetGame = () => {
    setBoard(createInitialBoard());
    setTurn('white');
    setSelectedSquare(null);
    setValidMoves([]);
    setCapturedWhite([]);
    setCapturedBlack([]);
    setGameResult(null);
    setPointsClaimed(false);
    setIsAiThinking(false);
    setLastMoveSrc(null);
    setLastMoveDst(null);
    setWhiteSeconds(timerPreset);
    setBlackSeconds(timerPreset);
    setStructuredMoves([]);
  };

  // Simple raw moves calculation (without infinite recursive check checking)
  const calculateRawMoves = (r: number, c: number, currentBoard: BoardState): [number, number][] => {
    const piece = currentBoard[r][c];
    if (!piece) return [];

    const color = piece.color;
    const opponentColor = color === 'white' ? 'black' : 'white';
    const moves: [number, number][] = [];
    const isInside = (nr: number, nc: number) => nr >= 0 && nr < 8 && nc >= 0 && nc < 8;

    if (piece.type === 'pawn') {
      const dir = color === 'white' ? -1 : 1;
      const startRow = color === 'white' ? 6 : 1;

      // 1 step forward
      if (isInside(r + dir, c) && !currentBoard[r + dir][c]) {
        moves.push([r + dir, c]);
        // 2 steps forward
        if (r === startRow && !currentBoard[r + 2 * dir][c]) {
          moves.push([r + 2 * dir, c]);
        }
      }

      // Diagonal captures
      const diagCols = [c - 1, c + 1];
      for (const dc of diagCols) {
        if (isInside(r + dir, dc)) {
          const target = currentBoard[r + dir][dc];
          if (target && target.color === opponentColor) {
            moves.push([r + dir, dc]);
          }
        }
      }
    }

    if (piece.type === 'knight') {
      const knightOffsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      for (const [dr, dc] of knightOffsets) {
        const nr = r + dr;
        const nc = c + dc;
        if (isInside(nr, nc)) {
          const target = currentBoard[nr][nc];
          if (!target || target.color === opponentColor) {
            moves.push([nr, nc]);
          }
        }
      }
    }

    if (piece.type === 'rook' || piece.type === 'queen') {
      const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of dirs) {
        let nr = r + dr;
        let nc = c + dc;
        while (isInside(nr, nc)) {
          const target = currentBoard[nr][nc];
          if (!target) {
            moves.push([nr, nc]);
          } else {
            if (target.color === opponentColor) {
              moves.push([nr, nc]);
            }
            break; // blocked
          }
          nr += dr;
          nc += dc;
        }
      }
    }

    if (piece.type === 'bishop' || piece.type === 'queen') {
      const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (const [dr, dc] of dirs) {
        let nr = r + dr;
        let nc = c + dc;
        while (isInside(nr, nc)) {
          const target = currentBoard[nr][nc];
          if (!target) {
            moves.push([nr, nc]);
          } else {
            if (target.color === opponentColor) {
              moves.push([nr, nc]);
            }
            break; // blocked
          }
          nr += dr;
          nc += dc;
        }
      }
    }

    if (piece.type === 'king') {
      const dirs = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
      ];
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (isInside(nr, nc)) {
          const target = currentBoard[nr][nc];
          if (!target || target.color === opponentColor) {
            moves.push([nr, nc]);
          }
        }
      }
    }

    return moves;
  };

  // Computes legal moves ensuring moving doesn't expose own king to check
  const calculateValidMoves = (r: number, c: number, currentBoard: BoardState): [number, number][] => {
    const piece = currentBoard[r][c];
    if (!piece) return [];
    
    const raw = calculateRawMoves(r, c, currentBoard);
    
    // Filter moves to prevent exposing king
    return raw.filter(([tr, tc]) => {
      // simulate move
      const tempBoard = currentBoard.map(row => [...row]);
      tempBoard[tr][tc] = piece;
      tempBoard[r][c] = null;
      
      const kingPos = findKing(piece.color, tempBoard);
      if (!kingPos) return true; // fallback
      
      // Is king under attack after this imaginary move?
      const enemyColor = piece.color === 'white' ? 'black' : 'white';
      return !isSquareAttackedBy(kingPos[0], kingPos[1], enemyColor, tempBoard);
    });
  };

  // Check if player has any legal moves remaining
  const hasAnyLegalMoves = (color: PieceColor, currentBoard: BoardState): boolean => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = currentBoard[r][c];
        if (p && p.color === color) {
          const valid = calculateValidMoves(r, c, currentBoard);
          if (valid.length > 0) return true;
        }
      }
    }
    return false;
  };

  const handleSquareClick = (r: number, c: number) => {
    if (gameResult || isAiThinking || (gameMode === 'ai' && turn === 'black')) return;

    const clickedPiece = board[r][c];

    if (selectedSquare) {
      const [sr, sc] = selectedSquare;
      const isLegal = validMoves.some(([vr, vc]) => vr === r && vc === c);

      if (isLegal) {
        executeMove(sr, sc, r, c);
        return;
      }
    }

    if (clickedPiece && clickedPiece.color === turn) {
      setSelectedSquare([r, c]);
      setValidMoves(calculateValidMoves(r, c, board));
      setSelectedPieceHelp(clickedPiece.type);
    } else {
      setSelectedSquare(null);
      setValidMoves([]);
    }
  };

  const executeMove = (fromR: number, fromC: number, toR: number, toC: number) => {
    const movingPiece = board[fromR][fromC];
    if (!movingPiece) return;

    const targetPiece = board[toR][toC];
    const newBoard = board.map(row => [...row]);
    
    // Move piece action
    newBoard[toR][toC] = movingPiece;
    newBoard[fromR][fromC] = null;

    // Pawn promotion
    let isPromoted = false;
    if (movingPiece.type === 'pawn' && (toR === 0 || toR === 7)) {
      newBoard[toR][toC] = {
        ...movingPiece,
        type: 'queen',
        id: `${movingPiece.color}-promoted-queen-${Date.now()}`
      };
      isPromoted = true;
    }

    // Capture accounting
    if (targetPiece) {
      if (targetPiece.color === 'white') {
        setCapturedWhite(prev => [...prev, targetPiece]);
      } else {
        setCapturedBlack(prev => [...prev, targetPiece]);
      }
      playChessSound('capture', isMuted);
    } else {
      playChessSound('move', isMuted);
    }

    // Keep track of the last move to highlight golden ring on UI
    setLastMoveSrc([fromR, fromC]);
    setLastMoveDst([toR, toC]);

    // Create string notations
    const pieceSym = movingPiece.color === 'white'
      ? PIECE_INFO[movingPiece.type].symbolWhite
      : PIECE_INFO[movingPiece.type].symbolBlack;
    const moveStr = `${isPromoted ? '👑' : ''}${getCoordinatesName(fromR, fromC)}➔${getCoordinatesName(toR, toC)}${targetPiece ? '✕' : ''}`;

    // Insert into tournament structured moves tracker
    setStructuredMoves(prev => {
      const updated = [...prev];
      if (movingPiece.color === 'white') {
        updated.unshift({
          num: (prev[0]?.blackStr ? prev[0].num + 1 : prev[0]?.num || 1),
          whiteStr: moveStr,
          whitePieceSymbol: pieceSym
        });
      } else {
        if (updated.length > 0 && !updated[0].blackStr) {
          updated[0].blackStr = moveStr;
          updated[0].blackPieceSymbol = pieceSym;
        } else {
          updated.unshift({
            num: (prev[0]?.num || 1) + 1,
            whiteStr: '...',
            blackStr: moveStr,
            blackPieceSymbol: pieceSym
          });
        }
      }
      return updated;
    });

    // Check game over or checks
    const opponentColor: PieceColor = movingPiece.color === 'white' ? 'black' : 'white';
    const opponentKingPos = findKing(opponentColor, newBoard);
    
    let isOpponentInCheck = false;
    if (opponentKingPos) {
      isOpponentInCheck = isSquareAttackedBy(opponentKingPos[0], opponentKingPos[1], movingPiece.color, newBoard);
      if (isOpponentInCheck) {
        playChessSound('check', isMuted);
      }
    }

    // Apply board
    setBoard(newBoard);
    setSelectedSquare(null);
    setValidMoves([]);

    const hasMovesLeft = hasAnyLegalMoves(opponentColor, newBoard);

    if (!hasMovesLeft) {
      if (isOpponentInCheck) {
        // Checkmate! Current mover wins!
        if (movingPiece.color === 'white') {
          setGameResult('win');
          playChessSound('win', isMuted);
        } else {
          setGameResult('lost');
          playChessSound('lose', isMuted);
        }
      } else {
        // Stalemate
        setGameResult('draw');
      }
      return;
    }

    // Normal play continue, switch turn
    setTurn(opponentColor);
  };

  // AI Think effect
  useEffect(() => {
    if (gameMode === 'ai' && turn === 'black' && !gameResult) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        makeStrategicAiMove();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [turn, gameMode]);

  // Strategic AI decision engine embodying:
  // - Material valuation
  // - Keeping king safe
  // - Targeting checkmate directly
  // - Center control & avoiding stalemate
  const makeStrategicAiMove = () => {
    const aiColor = 'black';
    const playerColor = 'white';

    interface ScoredMove {
      from: [number, number];
      to: [number, number];
      piece: Piece;
      score: number;
    }

    const collection: ScoredMove[] = [];

    // Analyze all black pieces
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.color === aiColor) {
          const legal = calculateValidMoves(r, c, board);
          for (const [tr, tc] of legal) {
            let score = 0;

            const target = board[tr][tc];

            // 1. Capture priority based on material values 
            if (target) {
              score += PIECE_INFO[target.type].points * 12; // massive priority
            }

            // 2. Central squares control (d4, e4, d5, e5)
            if (tr >= 3 && tr <= 4 && tc >= 3 && tc <= 4) {
              score += 6;
            }

            // 3. Prevent placing piece in danger (Look-Ahead Check)
            // If the square we are moving to is attacked by White, mock material loss
            const tempBoard = board.map(row => [...row]);
            tempBoard[tr][tc] = p;
            tempBoard[r][c] = null;

            const isAttacked = isSquareAttackedBy(tr, tc, playerColor, tempBoard);
            if (isAttacked) {
              score -= PIECE_INFO[p.type].points * 10; // subtract weight of piece
            }

            // 4. Proactive Check promotion 
            const opponentKing = findKing(playerColor, tempBoard);
            if (opponentKing) {
              const givesCheck = isSquareAttackedBy(opponentKing[0], opponentKing[1], aiColor, tempBoard);
              if (givesCheck) {
                // If the check puts King in severe distress, prioritize
                score += 25;

                // Also double check if it's checkmate (Opponent has no legal moves under check)
                const oppMoves = hasAnyLegalMoves(playerColor, tempBoard);
                if (!oppMoves) {
                  score += 10000; // instant checkmate win absolute priority
                }
              }
            }

            // 5. If my piece was under attack at (r, c), run away!
            const wasPieceAttacked = isSquareAttackedBy(r, c, playerColor, board);
            if (wasPieceAttacked) {
              score += PIECE_INFO[p.type].points * 8; // high priority to escape
            }

            // 6. Avoid actions resulting in STALEMATE if Black is winning overall
            // If opponent has no moves left on tempBoard but isn't checked:
            if (opponentKing) {
              const opponentInCheck = isSquareAttackedBy(opponentKing[0], opponentKing[1], aiColor, tempBoard);
              const opponentHasMoves = hasAnyLegalMoves(playerColor, tempBoard);
              if (!opponentHasMoves && !opponentInCheck) {
                // Stalemate risk! Heavily penalize this move unless AI is desperate
                score -= 800;
              }
            }

            // Add simple difficulty coefficient variance
            if (aiDifficulty === 'easy') {
              // add heavy random noise to lower optimal decisions
              score += (Math.random() * 40 - 20);
            } else if (aiDifficulty === 'medium') {
              score += (Math.random() * 8 - 4);
            }

            collection.push({
              from: [r, c],
              to: [tr, tc],
              piece: p,
              score
            });
          }
        }
      }
    }

    if (collection.length === 0) {
      // No legal moves left (Draw or checkmate on AI)
      const blackKing = findKing(aiColor, board);
      if (blackKing && isSquareAttackedBy(blackKing[0], blackKing[1], playerColor, board)) {
        setGameResult('win'); // White wins
        playChessSound('win', isMuted);
      } else {
        setGameResult('draw');
      }
      setIsAiThinking(false);
      return;
    }

    // Sort descending by highest survival/attack strategy scores
    collection.sort((a, b) => b.score - a.score);

    // AI selects the top scorer
    const bestMove = collection[0];
    executeMove(bestMove.from[0], bestMove.from[1], bestMove.to[0], bestMove.to[1]);
    setIsAiThinking(false);
  };

  const claimPointsOfChess = () => {
    if (pointsClaimed) return;
    setPointsClaimed(true);
    onAwardPoints(30);
  };

  // Check if current turn is checked (for glowing Red border animation on the board/King)
  const isWhiteKingChecked = (() => {
    const pos = findKing('white', board);
    if (!pos) return false;
    return isSquareAttackedBy(pos[0], pos[1], 'black', board);
  })();

  const isBlackKingChecked = (() => {
    const pos = findKing('black', board);
    if (!pos) return false;
    return isSquareAttackedBy(pos[0], pos[1], 'white', board);
  })();

  return (
    <div className="bg-[#FAF9F6] p-4 md:p-8 rounded-[40px] border border-slate-200/80 shadow-2xl font-sans space-y-6 text-right" dir="rtl">
      
      {/* Sound and Preset Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-2.5 bg-emerald-600 rounded-2xl text-white shadow-lg animate-pulse">
              <Swords size={20} />
            </span>
            <h3 className="font-black text-xl text-slate-900 tracking-tight flex items-center gap-2">
              شطرنج المعسكرات الذكية ⛺⚜️
            </h3>
          </div>
          <p className="text-xs font-bold text-slate-500 leading-relaxed">
            محسّن تكتيكياً ومدرج بمؤقت دورة البطولة الكشفية الاحترافية. تحدّ المعالج!
          </p>
        </div>

        {/* Global actions and controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sound Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-xl border transition-all ${
              isMuted ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
            title={isMuted ? "تفعيل الصوت" : "كتم الصوت"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Time Preset Picker */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border">
            <Clock size={14} className="text-slate-500 mr-1" />
            <select
              value={timerPreset}
              onChange={(e) => {
                const val = Number(e.target.value) as any;
                setTimerPreset(val);
                setWhiteSeconds(val);
                setBlackSeconds(val);
                handleResetGame();
              }}
              className="bg-transparent border-0 text-[11px] font-black text-slate-700 focus:ring-0 cursor-pointer"
            >
              <option value={300}>⏱️ ٥ دقائق (خاطف)</option>
              <option value={600}>⏱️ ١٠ دقائق (سريع)</option>
              <option value={1200}>⏱️ ٢٠ دقيقة (كلاسيكي)</option>
            </select>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl border text-[11px] font-black">
            <button
              onClick={() => { setGameMode('ai'); handleResetGame(); }}
              className={`px-3 py-1.5 rounded-lg transition-all ${gameMode === 'ai' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-500 hover:text-slate-800'}`}
            >
              🤖 مباراة الذكاء الكشفي
            </button>
            <button
              onClick={() => { setGameMode('local'); handleResetGame(); }}
              className={`px-3 py-1.5 rounded-lg transition-all ${gameMode === 'local' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-500 hover:text-slate-800'}`}
            >
              👥 مباراة محلية (شبل ضد شبل)
            </button>
          </div>

          <button
            onClick={handleResetGame}
            className="p-2.5 bg-amber-500 hover:bg-amber-600 text-white transition-all rounded-xl shadow-md flex items-center gap-1"
            title="إعادة تشغيل اللعبة"
          >
            <RotateCcw size={15} />
            <span className="text-[10px] font-black">إعادة</span>
          </button>
        </div>
      </div>

      {/* Dynamic Progress indicator representation */}
      {gameMode === 'ai' && !gameResult && (
        <div className="bg-slate-50 hover:bg-slate-100/70 p-4 rounded-3xl border border-slate-200/70 flex flex-col md:flex-row items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-emerald-600 rounded-xl text-white">
              <Cpu size={15} />
            </div>
            <div className="text-right">
              <span className="text-[11px] font-black text-slate-700 block">مرشد الذكاء الاصطناعي الاستراتيجي ♟️</span>
              <span className="text-[10px] text-slate-500 font-bold block">
                يقوم بتحليل سلامة الملك، والسيطرة على خطوط الوسط، ويتفادى التعادل الإجباري (Stalemate)
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {(['easy', 'medium', 'hard'] as const).map((diff) => {
              const labels = { easy: '🐣 مبتدئ', medium: '🦊 ذكي', hard: '🦁 محترف' };
              const colors = {
                easy: 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100',
                medium: 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100',
                hard: 'border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100'
              };
              const isActive = aiDifficulty === diff;
              return (
                <button
                  key={diff}
                  onClick={() => setAiDifficulty(diff)}
                  className={`px-3 py-2 rounded-xl text-xs font-black border transition-all ${
                    isActive 
                      ? diff === 'easy' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : diff === 'medium' ? 'bg-amber-600 text-white border-amber-600 shadow-md' : 'bg-rose-600 text-white border-rose-600 shadow-md'
                      : colors[diff]
                  }`}
                >
                  {labels[diff]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid Wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* RIGHT SIDEBAR: Timers & Captured lists */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* TOURNAMENT CHESS TIMERS */}
          <div className="bg-slate-900 rounded-[30px] p-5 text-white border-2 border-slate-950 shadow-lg space-y-4">
            <span className="text-[10px] font-black tracking-wider uppercase text-slate-400 block border-b border-white/10 pb-2">ساعة شطرنج البطولة ⏱️</span>
            
            {/* BLACK (AI) Timer Block */}
            <div className={`p-3 rounded-2xl flex flex-col gap-1 transition-all ${
              turn === 'black' ? 'bg-rose-950/40 border border-rose-500/40' : 'bg-white/5 opacity-70'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-rose-300 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                  ● {gameMode === 'ai' ? 'الذكاء الكشفي الأسود' : 'شبل الأسود'}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">باقي للخصم</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xl sm:text-2xl font-black text-white tracking-widest leading-none">
                  {formatTime(blackSeconds)}
                </span>
                <span className="text-[9px] text-slate-400">ثانية</span>
              </div>
              {/* Mini visual bar */}
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mt-1">
                <div 
                  className="bg-rose-500 h-full transition-all duration-1000" 
                  style={{ width: `${(blackSeconds / timerPreset) * 100}%` }}
                />
              </div>
            </div>

            {/* WHITE (USER) Timer Block */}
            <div className={`p-3 rounded-2xl flex flex-col gap-1 transition-all ${
              turn === 'white' ? 'bg-emerald-950/40 border border-emerald-500/40' : 'bg-white/5 opacity-70'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-emerald-300 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  ● شبل الأبيض (كتيبتك)
                </span>
                <span className="text-[10px] text-slate-400 font-bold">باقي لك</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xl sm:text-2xl font-black text-white tracking-widest leading-none">
                  {formatTime(whiteSeconds)}
                </span>
                <span className="text-[9px] text-slate-400">ثانية</span>
              </div>
              {/* Mini visual bar */}
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mt-1">
                <div 
                  className="bg-emerald-400 h-full transition-all duration-1000" 
                  style={{ width: `${(whiteSeconds / timerPreset) * 100}%` }}
                />
              </div>
            </div>

            {/* Active Turn Header banner */}
            <div className="pt-2 text-center">
              <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black shadow-inner ${
                turn === 'white' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-rose-600 text-white'
              }`}>
                {turn === 'white' ? 'حركتك الآن يا شبل الأبيض!' : 'الذكاء الكشفي يفكر خطوتك التالية...'}
              </span>
            </div>
          </div>

          {/* Captured White and Black Panels in clean containers */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow space-y-3.5">
            <span className="text-[11px] font-black text-slate-700 block border-b pb-2">القطع والضحايا المفقودة 🛡️</span>
            
            {/* captured white */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] text-slate-500 font-bold">
                <span>القطع المفقودة من الأبيض:</span>
                <span className="text-rose-600">-{capturedWhite.reduce((sum, p) => sum + (PIECE_INFO[p.type]?.points || 0), 0)} نقطة</span>
              </div>
              <div className="flex flex-wrap gap-1 min-h-[34px] p-2 bg-slate-50 rounded-xl border border-dashed border-slate-200/50">
                {capturedWhite.length === 0 && <span className="text-[9px] text-slate-400 font-bold block my-auto">لم يقع أي من رجالك بالأسر! 🛡️</span>}
                {capturedWhite.map((p) => (
                  <span 
                    key={p.id} 
                    className="w-7 h-7 flex items-center justify-center bg-white rounded-lg text-lg select-none border shadow-sm"
                    title={PIECE_INFO[p.type].title}
                  >
                    {PIECE_INFO[p.type].symbolWhite}
                  </span>
                ))}
              </div>
            </div>

            {/* captured black */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] text-slate-500 font-bold">
                <span>الغنيمة المسلوبة من الأسود:</span>
                <span className="text-emerald-600">+{capturedBlack.reduce((sum, p) => sum + (PIECE_INFO[p.type]?.points || 0), 0)} نقطة</span>
              </div>
              <div className="flex flex-wrap gap-1 min-h-[34px] p-2 bg-slate-50 rounded-xl border border-dashed border-slate-200/50">
                {capturedBlack.length === 0 && <span className="text-[9px] text-slate-400 font-bold block my-auto">لم تأسر أي قطعة للخصم بعد!</span>}
                {capturedBlack.map((p) => (
                  <span 
                    key={p.id} 
                    className="w-7 h-7 flex items-center justify-center bg-slate-900 text-white rounded-lg text-lg select-none shadow-sm"
                    title={PIECE_INFO[p.type].title}
                  >
                    {PIECE_INFO[p.type].symbolBlack}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: The 8x8 Chessboard */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className={`p-4 rounded-[48px] bg-[#1d2b1f] shadow-2xl relative border-8 transition-all duration-300 ${
            isWhiteKingChecked 
              ? 'border-rose-600 ring-8 ring-rose-500/20' 
              : isBlackKingChecked
              ? 'border-amber-500/80 ring-8 ring-amber-400/20'
              : 'border-emerald-950'
          }`}>
            
            {/* Top letters coordinate row (A to H) */}
            <div className="flex justify-between px-6 pb-2 text-[10px] font-black text-emerald-300/80 font-mono tracking-widest" style={{ direction: 'ltr' }}>
              {['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح'].map((letter, i) => (
                <div key={i} className="w-10 sm:w-14 text-center select-none">{letter}</div>
              ))}
            </div>

            <div className="flex">
              {/* Left numbers column (8 to 1) */}
              <div className="flex flex-col justify-between py-2 pl-2 text-[10px] font-black text-emerald-300/80 select-none">
                {['٨', '٧', '٦', '٥', '٤', '٣', '٢', '١'].map((n) => (
                  <div key={n} className="h-10 sm:h-14 flex items-center justify-center">{n}</div>
                ))}
              </div>

              {/* CHESSBOARD GRID */}
              <div className="grid grid-cols-8 border-4 border-slate-950 overflow-hidden bg-slate-900 rounded-2xl shadow-inner">
                {board.map((row, rIdx) => 
                  row.map((piece, cIdx) => {
                    const isDarkSquare = (rIdx + cIdx) % 2 === 1;
                    const isSelected = selectedSquare && selectedSquare[0] === rIdx && selectedSquare[1] === cIdx;
                    const isValidDestination = validMoves.some(([vr, vc]) => vr === rIdx && vc === cIdx);
                    
                    // Highlights for previous moves
                    const isLastSrc = lastMoveSrc && lastMoveSrc[0] === rIdx && lastMoveSrc[1] === cIdx;
                    const isLastDst = lastMoveDst && lastMoveDst[0] === rIdx && lastMoveDst[1] === cIdx;

                    // Forest & wood-like high fidelity colors
                    let squareBg = isDarkSquare 
                      ? 'bg-[#3b533d] border border-[#2d402e]/30' // deep army forest green
                      : 'bg-[#d6cbba] border border-[#c4b9a8]/30'; // warm clay yellow/cream

                    // States styling
                    if (isSelected) {
                      squareBg = 'bg-amber-400 ring-4 ring-amber-300 ring-inset shadow-lg scale-95 z-10';
                    } else if (isValidDestination) {
                      squareBg = isDarkSquare 
                        ? 'bg-[#5e7d60]/90 hover:bg-[#6f9071]' 
                        : 'bg-[#ebe3d5]/90 hover:bg-[#f6ebd8]';
                    } else if (isLastDst) {
                      // Last move destination: beautiful gold highlight
                      squareBg = 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md border-2 border-amber-300';
                    } else if (isLastSrc) {
                      // Last move origin: washed light green/yellow
                      squareBg = isDarkSquare ? 'bg-[#517053]/60' : 'bg-[#e7decb]/60';
                    }

                    // King under attack pulsing check warning
                    const isKingInDangerHere = piece && piece.type === 'king' && (
                      (piece.color === 'white' && isWhiteKingChecked) ||
                      (piece.color === 'black' && isBlackKingChecked)
                    );

                    return (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        onClick={() => handleSquareClick(rIdx, cIdx)}
                        className={`w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center relative cursor-pointer font-bold select-none transition-all duration-200 ${squareBg}`}
                      >
                        {/* King danger pulsing glow overlay */}
                        {isKingInDangerHere && (
                          <div className="absolute inset-0 bg-rose-600/30 ring-4 ring-rose-500 animate-pulse rounded-lg z-[2]" />
                        )}

                        {/* Valid empty square dot indicator */}
                        {isValidDestination && !piece && (
                          <div className="w-3.5 h-3.5 bg-amber-500 rounded-full border border-white z-[3]" />
                        )}

                        {/* Capture threat ring indicator for pieces */}
                        {isValidDestination && piece && (
                          <div className="absolute inset-0 border-[3px] border-rose-500 rounded-lg bg-rose-500/20 animate-pulse z-[2]" />
                        )}

                        {/* Last move indicator sub-ring */}
                        {isLastDst && !isSelected && (
                          <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-white z-[2] shadow-sm animate-bounce" />
                        )}

                        {/* Render actual chess piece */}
                        {piece && (
                          <span 
                            className={`text-2xl sm:text-3xl font-black transition-transform duration-200 hover:scale-110 active:scale-95 z-10 select-none ${
                              piece.color === 'white' 
                                ? 'text-[#FAF9F6] drop-shadow-[0_0_2px_rgba(0,0,0,0.95)] drop-shadow-[0_2px_3px_rgba(0,0,0,0.45)]' 
                                : 'text-[#1e293b] drop-shadow-[0_0_2px_rgba(255,255,255,0.98)] drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)]'
                            }`}
                          >
                            {piece.color === 'white' ? PIECE_INFO[piece.type].symbolWhite : PIECE_INFO[piece.type].symbolBlack}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Right numbers column (8 to 1) */}
              <div className="flex flex-col justify-between py-2 pr-2 text-[10px] font-black text-emerald-300/80 select-none">
                {['٨', '٧', '٦', '٥', '٤', '٣', '٢', '١'].map((n) => (
                  <div key={n} className="h-10 sm:h-14 flex items-center justify-center">{n}</div>
                ))}
              </div>
            </div>

            {/* Bottom letters coordinate row */}
            <div className="flex justify-between px-6 pt-2 text-[10px] font-black text-emerald-300/80 font-mono tracking-widest" style={{ direction: 'ltr' }}>
              {['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح'].map((letter, i) => (
                <div key={i} className="w-10 sm:w-14 text-center select-none">{letter}</div>
              ))}
            </div>

          </div>

          {/* User state warning */}
          <div className="mt-4">
            {isWhiteKingChecked && (
              <div className="bg-rose-100 text-rose-800 border-2 border-rose-200 px-5 py-2.5 rounded-2xl flex items-center gap-2 animate-bounce shadow">
                <ShieldAlert size={16} className="text-rose-600 shrink-0" />
                <span className="text-xs font-black">تحذير! ملك كتيبتك البيضاء تحت التهديد المباشر! دافع عنه فوراً! 🛡️⚓</span>
              </div>
            )}
            {!isWhiteKingChecked && turn === 'white' && (
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-5 py-2.5 rounded-2xl text-xs font-bold shadow-sm">
                💡 فكّر جيداً يا شبل قبل الحركة! السيطرة على مربعات المركز تؤمّن فوزك.
              </div>
            )}
            {turn === 'black' && (
              <div className="bg-slate-100 text-slate-700 border px-5 py-2.5 rounded-2xl text-xs font-bold leading-none animate-pulse">
                ⏳ يقوم المعالِج الكشفي بتحليل الوضعيات واختيار أقوى خطوة هجومية...
              </div>
            )}
          </div>
        </div>

        {/* LEFT SIDEBAR: Professional Side-by-Side Moves List */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* TOURNAMENT SCORE SHEET */}
          <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm p-5 h-full flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-black text-slate-800 block border-b pb-2 flex items-center gap-1">
                🏆 سجل النقلات كشفيّاً (Score-Sheet)
              </span>

              {/* Scoreboard table headers */}
              <div className="grid grid-cols-12 text-[10px] text-slate-500 font-black tracking-wider border-b pb-1.5 px-1 bg-slate-50 py-1.5 rounded-lg text-center font-mono">
                <div className="col-span-3">نقلة #</div>
                <div className="col-span-4 text-emerald-700">الأبيض ⚪</div>
                <div className="col-span-5 text-slate-755">الأسود ⚫</div>
              </div>

              {/* Scores container */}
              <div className="max-h-[240px] overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px] font-extrabold text-slate-700">
                {structuredMoves.length === 0 && (
                  <div className="text-center text-slate-400 py-12 space-y-2">
                    <Zap className="mx-auto text-slate-300" size={24} />
                    <span className="text-[10px] font-bold block">قم بأول حركة للبدء بتسجيل النقلة!</span>
                  </div>
                )}
                {structuredMoves.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 py-2 px-1 hover:bg-slate-50 rounded-lg text-center border-b border-dashed border-slate-100 items-center">
                    <div className="col-span-3 text-[10px] text-slate-400 font-bold">
                      {item.num}
                    </div>
                    <div className="col-span-4 text-emerald-700 flex items-center justify-center gap-1 bg-emerald-50/50 py-1 rounded">
                      <span className="text-[12px] opacity-70 scale-90">{item.whitePieceSymbol}</span>
                      <span>{item.whiteStr}</span>
                    </div>
                    <div className="col-span-5 text-slate-900 flex items-center justify-center gap-1 bg-slate-50 py-1 rounded">
                      {item.blackStr ? (
                        <>
                          <span className="text-[12px] opacity-70 scale-90">{item.blackPieceSymbol}</span>
                          <span>{item.blackStr}</span>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium italic">يفكر..</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Educational chess advice details */}
            <div className="bg-gradient-to-br from-[#1b2b1e] to-[#0d160f] text-emerald-100 rounded-2xl p-4 space-y-2 mt-4">
              <h5 className="font-extrabold text-[11px] text-amber-300 flex items-center gap-1">
                <MedalIcon size={12} />
                <span>شرف المعركة الكشفية</span>
              </h5>
              <p className="text-[10.5px] text-slate-200 font-medium leading-relaxed">
                الشطرنج لا يقبل العشوائية. إنقاذ ملكك عبر حركات تكتيكية دقيقة هو مهارة أساسية للأشبال تتوافق مع التخطيط الرياضي للمخيمات!
              </p>
            </div>
          </div>

          {/* Details on Hovered/Selected Pieces */}
          <div className="bg-[#FAF9F6] p-4 rounded-3xl border space-y-3">
            <span className="text-[11px] font-black text-slate-700 block select-none">
              📘 الكتالوج الكشفي للقطع:
            </span>
            <AnimatePresence mode="wait">
              {selectedPieceHelp ? (
                <motion.div
                  key={selectedPieceHelp}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-white p-3.5 rounded-2xl border border-slate-250/50 shadow-sm space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-slate-800">
                      {PIECE_INFO[selectedPieceHelp].title}
                    </span>
                    <span className="text-[9px] font-black tracking-wide text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                      القيمة: {PIECE_INFO[selectedPieceHelp].points}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold leading-normal">
                    {PIECE_INFO[selectedPieceHelp].desc}
                  </p>
                </motion.div>
              ) : (
                <div className="text-[10px] text-slate-500 font-bold text-center py-2">
                  انقر على إحدى القطع لقراءة خصائصها بالتفصيل.
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

      {/* OVERLAY GAME OVER MODALS */}
      <AnimatePresence>
        {gameResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[999]"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-white border-4 border-double border-amber-500 p-8 rounded-[40px] max-w-sm w-full text-center shadow-2xl relative"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-amber-50 border-2 border-amber-300 flex items-center justify-center text-4xl shadow-md mb-4 animate-bounce">
                {gameResult === 'win' ? '🏆' : gameResult === 'lost' ? '⛺️' : '⏱️'}
              </div>

              <h4 className="font-black text-lg text-slate-900 border-b pb-2 mb-2">
                {gameResult === 'win' && 'نصر كشفي مستحق! 👑'}
                {gameResult === 'lost' && 'كش ملك (انتصر الخصم!)'}
                {gameResult === 'draw' && 'مباراة ودية متعادلة!'}
                {gameResult === 'time_out_white' && 'انتهى الوقت المتاح للملك الأبيض!'}
                {gameResult === 'time_out_black' && 'نفاد وقت الخصم (فوز بالأناقة!) 🏆'}
              </h4>

              <p className="text-xs text-slate-500 font-bold leading-relaxed">
                {gameResult === 'win' && 'تهانينا يا بطل الفرقة العظيم! قمت بإحكام الهجوم والمحاصرة وتدمير عرش الخصم بالكامل بنباهة وعبقرية.'}
                {gameResult === 'lost' && 'سقط عرش الشبل الأبيض تحت حصار الملك الأسود والمحرك التكتيكي. تمرّن وركّز على حماية الملك بالتبييت!'}
                {gameResult === 'draw' && 'انتهت اللعبة بحالة التعادل (Stalemate أو نفاد كامل الحركات القانونية). لا مهزوم في معاهدة الكشافة!'}
                {gameResult === 'time_out_white' && 'تأخرت في التفكير والمناورة وسقطت ساعتك للتوقيت الكشفي. تدرّب على اللعب الخاطف ذكياً وبسرعة!'}
                {gameResult === 'time_out_black' && 'أجبرت المعالج الكشفي على استهلاك طاقة تفكيره بالكامل حتى سقطت ساعته. انتصار رائع بالسرعة والضغط!'}
              </p>

              {(gameResult === 'win' || gameResult === 'time_out_black') && (
                <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-200">
                  <span className="text-[11px] font-black text-amber-800 block">شعلات الفرصة والذكاء المكتسبة:</span>
                  <span className="text-2xl font-black text-amber-600 block my-1">٣٠ نقطة كاملة ⚜️</span>
                  
                  <button
                    onClick={claimPointsOfChess}
                    disabled={pointsClaimed}
                    className={`w-full py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1 shadow-sm ${
                      pointsClaimed
                        ? 'bg-slate-100 text-slate-400 border cursor-not-allowed'
                        : 'bg-gradient-to-l from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white active:scale-95'
                    }`}
                  >
                    <Award size={15} />
                    <span>{pointsClaimed ? 'تم إرسال النقاط وتفعيلها ✓' : 'تفعيل وشحن النقاط بحسابي ⚡️'}</span>
                  </button>
                </div>
              )}

              <div className="flex gap-2 mt-5">
                <button
                  onClick={handleResetGame}
                  className="flex-1 py-3 bg-slate-900 hover:bg-black text-white rounded-xl font-black text-xs transition-all shadow-md"
                >
                  تحدي جديد 🔁
                </button>
                <button
                  onClick={() => setGameResult(null)}
                  className="px-4 py-3 border rounded-xl hover:bg-slate-50 font-black text-xs text-slate-600 transition-all"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
