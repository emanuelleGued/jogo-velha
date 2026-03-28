import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  useWindowDimensions,
  ViewStyle
} from 'react-native';

type Player = 'X' | 'O' | null;

interface SquareProps {
  value: Player;
  onSquareClick: () => void;
  size: number;
}

interface ScoreState {
  user: number;
  computer: number;
}

const Square: React.FC<SquareProps> = ({ value, onSquareClick, size }) => {
  return (
    <TouchableOpacity 
      style={[styles.square, { width: size, height: size }]} 
      onPress={onSquareClick}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.squareText, 
        { color: value === 'X' ? '#2196F3' : '#F44336' }
      ]}>
        {value}
      </Text>
    </TouchableOpacity>
  );
};

export default function Game() {
  const { width } = useWindowDimensions();
  
  const [squares, setSquares] = useState<Player[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState<boolean>(true); // Usuário é sempre X
  const [scores, setScores] = useState<ScoreState>({ user: 0, computer: 0 });

  const boardSize = width * 0.9;
  const squareSize = boardSize / 3;

  const winner = calculateWinner(squares);
  const isDraw = !winner && squares.every(s => s !== null);

  useEffect(() => {
    if (!xIsNext && !winner && !isDraw) {
      const timeout = setTimeout(() => {
        makeComputerMove();
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [xIsNext, winner, isDraw]);

  useEffect(() => {
    if (winner === 'X') {
      setScores(prev => ({ ...prev, user: prev.user + 1 }));
    } else if (winner === 'O') {
      setScores(prev => ({ ...prev, computer: prev.computer + 1 }));
    }
  }, [winner]);

  function handleClick(i: number): void {
    if (squares[i] || winner || !xIsNext) return;

    const nextSquares = squares.slice();
    nextSquares[i] = 'X';
    setSquares(nextSquares);
    setXIsNext(false);
  }

  function makeComputerMove(): void {
    const nextSquares = squares.slice();
    const emptyIndices = squares
      .map((val, idx) => (val === null ? idx : null))
      .filter((val): val is number => val !== null);
    
    if (emptyIndices.length > 0) {
      const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      nextSquares[randomIndex] = 'O';
      setSquares(nextSquares);
      setXIsNext(true);
    }
  }

  function resetGame(): void {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  }

  const getStatus = (): string => {
    if (winner) return winner === 'X' ? "Você Venceu! 🎉" : "O Computador Venceu! 🤖";
    if (isDraw) return "Empate! 🤝";
    return xIsNext ? "Sua vez (X)" : "Computador pensando...";
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scoreBoard}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>VOCÊ (X)</Text>
          <Text style={styles.scoreValue}>{scores.user}</Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>CPU (O)</Text>
          <Text style={styles.scoreValue}>{scores.computer}</Text>
        </View>
      </View>

      <Text style={styles.status}>{getStatus()}</Text>

      <View style={[styles.board, { width: boardSize, height: boardSize }]}>
        {[0, 1, 2].map((row) => (
          <View key={row} style={styles.boardRow}>
            {[0, 1, 2].map((col) => {
              const index = row * 3 + col;
              return (
                <Square 
                  key={index}
                  size={squareSize} 
                  value={squares[index]} 
                  onSquareClick={() => handleClick(index)} 
                />
              );
            })}
          </View>
        ))}
      </View>

      {(winner || isDraw) && (
        <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
          <Text style={styles.resetButtonText}>Jogar Novamente</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

function calculateWinner(squares: Player[]): Player {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBoard: {
    flexDirection: 'row',
    marginBottom: 40,
    width: '80%',
    justifyContent: 'space-around',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 15,
    elevation: 4, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scoreBox: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#888',
    letterSpacing: 1,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#333',
  },
  status: {
    fontSize: 22,
    marginBottom: 25,
    fontWeight: 'bold',
    color: '#444',
  },
  board: {
    backgroundColor: '#333',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#333',
  },
  boardRow: {
    flexDirection: 'row',
  },
  square: {
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  squareText: {
    fontSize: 45,
    fontWeight: 'bold',
  },
  resetButton: {
    marginTop: 50,
    backgroundColor: '#2196F3',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
