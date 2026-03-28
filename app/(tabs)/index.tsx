import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  SafeAreaView, 
  useWindowDimensions 
} from 'react-native';

import { Jogo, Jogador, JogadorAutomatizado, Partida, SituacaoPartida, Peca } from './ModelagemJogo';

interface SquareProps {
  value: string | null;
  onSquareClick: () => void;
  size: number;
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
  const boardSize = width * 0.9;
  const squareSize = boardSize / 3;

  const jogoRef = useRef<Jogo | null>(null);
  const partidaRef = useRef<Partida | null>(null);

  if (!jogoRef.current) {
    const humano = new Jogador("Você");
    const computador = new JogadorAutomatizado("CPU");
    jogoRef.current = new Jogo(humano, computador);
  }
  if (!partidaRef.current) {
    partidaRef.current = jogoRef.current.iniciaPartida();
  }

  const [renderTick, setRenderTick] = useState(0);
  const updateUI = () => setRenderTick(tick => tick + 1);

  useEffect(() => {
    const partida = partidaRef.current;
    if (!partida) return;

    if (!partida.getVezJogador1() && partida.verificaFim() === SituacaoPartida.EmAndamento) {
      const timeout = setTimeout(() => {
        const cpu = jogoRef.current!.getJogador2() as JogadorAutomatizado;
        const [linha, coluna] = cpu.realizaJogada(partida.getTabuleiro());
        
        partida.joga(linha, coluna);
        processaFimDeTurno(partida);
        updateUI();
      }, 600);
      return () => clearTimeout(timeout);
    }
  }, [renderTick]);

  const processaFimDeTurno = (partida: Partida) => {
    const situacao = partida.verificaFim();
    if (situacao === SituacaoPartida.VitoriaJogador1) {
      jogoRef.current!.getJogador1().adicionaVitoria();
    } else if (situacao === SituacaoPartida.VitoriaJogador2) {
      jogoRef.current!.getJogador2().adicionaVitoria();
    }
  };

  const handleClick = (linha: number, coluna: number): void => {
    const partida = partidaRef.current;
    if (!partida || !partida.getVezJogador1()) return;

    const sucesso = partida.joga(linha, coluna);
    if (sucesso) {
      processaFimDeTurno(partida);
      updateUI();
    }
  };

  const resetGame = (): void => {
    if (jogoRef.current) {
      partidaRef.current = jogoRef.current.iniciaPartida();
      updateUI();
    }
  };

  const getStatus = (): string => {
    const partida = partidaRef.current;
    if (!partida) return "";

    const situacao = partida.verificaFim();
    if (situacao === SituacaoPartida.VitoriaJogador1) return "Você Venceu! 🎉";
    if (situacao === SituacaoPartida.VitoriaJogador2) return "O Computador Venceu! 🤖";
    if (situacao === SituacaoPartida.Empate) return "Empate! 🤝";
    
    return partida.getVezJogador1() ? "Sua vez (X)" : "Computador pensando...";
  };

  const tabuleiro = partidaRef.current!.getTabuleiro();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scoreBoard}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>VOCÊ (X)</Text>
          <Text style={styles.scoreValue}>{jogoRef.current!.getJogador1().getVitorias()}</Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>CPU (O)</Text>
          <Text style={styles.scoreValue}>{jogoRef.current!.getJogador2().getVitorias()}</Text>
        </View>
      </View>

      <Text style={styles.status}>{getStatus()}</Text>

      <View style={[styles.board, { width: boardSize, height: boardSize }]}>
        {tabuleiro.map((row: (Peca | null)[], rowIndex: number) => (
          <View key={rowIndex} style={styles.boardRow}>
            {row.map((peca: string | null, colIndex: number) => (
              <Square 
                key={`${rowIndex}-${colIndex}`}
                size={squareSize} 
                value={peca} 
                onSquareClick={() => handleClick(rowIndex, colIndex)} 
              />
            ))}
          </View>
        ))}
      </View>

      {partidaRef.current!.verificaFim() !== SituacaoPartida.EmAndamento && (
        <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
          <Text style={styles.resetButtonText}>Jogar Novamente</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
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
