export enum Peca {
    Xis = 'X',    
    Circulo = 'O' 
  }
  
  export enum SituacaoPartida {
    VitoriaJogador1 = 'VitoriaJogador1', 
    VitoriaJogador2 = 'VitoriaJogador2', 
    Empate = 'Empate',                   
    EmAndamento = 'EmAndamento'          
  }
  
  export class Jogador {
    private nome: string;       
    private vitorias: number;   
  
    constructor(nome: string) { 
      this.nome = nome;
      this.vitorias = 0;
    }
  
    getNome(): string { return this.nome; }       
    getVitorias(): number { return this.vitorias; } 
    
    adicionaVitoria(): void { 
      this.vitorias++; 
    }
    
    reinicia(): void { 
      this.vitorias = 0; 
    }
  }
  
  export class JogadorAutomatizado extends Jogador { 
    constructor(nome: string = "Computador") {
      super(nome);
    }
  
    realizaJogada(tabuleiro: (Peca | null)[][]): [number, number] { 
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (tabuleiro[i][j] === null) {
            return [i, j];
          }
        }
      }
      return [0, 0]; 
    }
  }
  
  export class Partida {
    private jogador1: Jogador;               
    private jogador2: Jogador;               
    private tabuleiro: (Peca | null)[][];    
    private vezJogador1: boolean;            
  
    constructor(jogador1: Jogador, jogador2: Jogador) { 
      this.jogador1 = jogador1;
      this.jogador2 = jogador2;
      this.tabuleiro = [
        [null, null, null],
        [null, null, null],
        [null, null, null]
      ];
      this.vezJogador1 = true;
    }
  
    getJogador1(): Jogador { return this.jogador1; }             
    getJogador2(): Jogador { return this.jogador2; }             
    getTabuleiro(): (Peca | null)[][] { return this.tabuleiro; }
    getVezJogador1(): boolean { return this.vezJogador1; }       
  
    joga(linha: number, coluna: number): boolean { 
      if (this.verificaFim() !== SituacaoPartida.EmAndamento) return false;
      if (this.tabuleiro[linha][coluna] !== null) return false;
  
      this.tabuleiro[linha][coluna] = this.vezJogador1 ? Peca.Xis : Peca.Circulo;
      this.vezJogador1 = !this.vezJogador1; 
      return true;
    }
  
    verificaFim(): SituacaoPartida { 
      const t = this.tabuleiro;
      
      for (let i = 0; i < 3; i++) {
        if (t[i][0] && t[i][0] === t[i][1] && t[i][0] === t[i][2]) 
          return t[i][0] === Peca.Xis ? SituacaoPartida.VitoriaJogador1 : SituacaoPartida.VitoriaJogador2;
        
        if (t[0][i] && t[0][i] === t[1][i] && t[0][i] === t[2][i]) 
          return t[0][i] === Peca.Xis ? SituacaoPartida.VitoriaJogador1 : SituacaoPartida.VitoriaJogador2;
      }
  
      if (t[0][0] && t[0][0] === t[1][1] && t[0][0] === t[2][2])
        return t[0][0] === Peca.Xis ? SituacaoPartida.VitoriaJogador1 : SituacaoPartida.VitoriaJogador2;
      if (t[0][2] && t[0][2] === t[1][1] && t[0][2] === t[2][0])
        return t[0][2] === Peca.Xis ? SituacaoPartida.VitoriaJogador1 : SituacaoPartida.VitoriaJogador2;
  
      let isCheio = true;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (t[i][j] === null) isCheio = false;
        }
      }
      if (isCheio) return SituacaoPartida.Empate;
  
      return SituacaoPartida.EmAndamento;
    }
  }
  
  export class Jogo {
    private numeroPartidas: number; 
    private jogador1: Jogador;
    private jogador2: Jogador;
  
    constructor(jogador1: Jogador, jogador2: Jogador) { 
      this.jogador1 = jogador1;
      this.jogador2 = jogador2;
      this.numeroPartidas = 0;
    }
  
    getJogador1(): Jogador { return this.jogador1; }           
    getJogador2(): Jogador { return this.jogador2; }           
    getNumeroPartidas(): number { return this.numeroPartidas; } 
  
    incrementaPartidas(): void { this.numeroPartidas++; }      
  
    iniciaPartida(): Partida { 
      this.incrementaPartidas();
      return new Partida(this.jogador1, this.jogador2);
    }
  
    reiniciaJogo(): void { 
      this.jogador1.reinicia();
      this.jogador2.reinicia();
      this.numeroPartidas = 0;
    }
  }
