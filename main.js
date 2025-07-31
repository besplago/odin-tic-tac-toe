// =============================================
// DOMAIN MODELS (Business Logic Layer)
// =============================================

const CELL_STATE = Object.freeze({
  X: "X",
  O: "O",
  EMPTY: "",
});

const GAME_STATE = Object.freeze({
  PLAYING: "playing",
  PLAYER_WON: "player_won",
  TIE: "tie",
});

class Gameboard {
  constructor() {
    this.reset();
  }

  reset() {
    this.board = Array(3)
      .fill()
      .map(() => Array(3).fill(CELL_STATE.EMPTY));
    this.moveCount = 0;
  }

  makeMove(row, col, symbol) {
    if (this.board[row][col] !== CELL_STATE.EMPTY) {
      return false;
    }
    this.board[row][col] = symbol;
    this.moveCount++;
    return true;
  }

  checkWin(row, col, symbol) {
    // Check row
    if (this.board[row].every((cell) => cell === symbol)) {
      return true;
    }

    // Check column
    if (this.board.every((boardRow) => boardRow[col] === symbol)) {
      return true;
    }

    // Check main diagonal
    if (
      row === col &&
      this.board.every((boardRow, i) => boardRow[i] === symbol)
    ) {
      return true;
    }

    // Check anti-diagonal
    if (
      row + col === 2 &&
      this.board.every((boardRow, i) => boardRow[2 - i] === symbol)
    ) {
      return true;
    }

    return false;
  }

  isFull() {
    return this.moveCount === 9;
  }

  getBoard() {
    return this.board.map((row) => [...row]);
  }
}

// Player data model
class Player {
  constructor(name, symbol) {
    this.name = name;
    this.symbol = symbol;
    this.wins = 0;
  }

  incrementWins() {
    this.wins++;
  }

  getName() {
    return this.name;
  }

  setName(name) {
    this.name = name;
  }

  getSymbol() {
    return this.symbol;
  }

  getWins() {
    return this.wins;
  }
}

// =============================================
// GAME ENGINE (Business Logic Orchestration)
// =============================================

class GameEngine {
  constructor() {
    this.gameboard = new Gameboard();
    this.player1 = new Player("Naruto", CELL_STATE.O);
    this.player2 = new Player("Sasuke", CELL_STATE.X);
    this.currentPlayer = this.player1;
    this.gameState = GAME_STATE.PLAYING;
    this.listeners = {
      gameStateChanged: [],
      boardChanged: [],
      playerChanged: [],
      scoreChanged: [],
    };
  }

  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(data));
    }
  }

  makeMove(row, col) {
    if (this.gameState !== GAME_STATE.PLAYING) {
      return false;
    }

    if (!this.gameboard.makeMove(row, col, this.currentPlayer.getSymbol())) {
      return false;
    }

    this.emit("boardChanged", {
      board: this.gameboard.getBoard(),
      lastMove: { row, col, symbol: this.currentPlayer.getSymbol() },
    });

    if (this.gameboard.checkWin(row, col, this.currentPlayer.getSymbol())) {
      this.currentPlayer.incrementWins();
      this.gameState = GAME_STATE.PLAYER_WON;
      this.emit("gameStateChanged", {
        state: this.gameState,
        winner: this.currentPlayer,
        player1: this.player1,
        player2: this.player2,
      });
      this.emit("scoreChanged", {
        player1: this.player1,
        player2: this.player2,
      });
      return true;
    }

    if (this.gameboard.isFull()) {
      this.gameState = GAME_STATE.TIE;
      this.emit("gameStateChanged", {
        state: this.gameState,
        winner: null,
        player1: this.player1,
        player2: this.player2,
      });
      return true;
    }

    this.currentPlayer =
      this.currentPlayer === this.player1 ? this.player2 : this.player1;
    this.emit("playerChanged", {
      currentPlayer: this.currentPlayer,
      player1: this.player1,
      player2: this.player2,
    });

    return true;
  }

  startNewRound() {
    this.gameboard.reset();
    this.currentPlayer = this.player1;
    this.gameState = GAME_STATE.PLAYING;

    this.emit("boardChanged", {
      board: this.gameboard.getBoard(),
      lastMove: null,
    });
    this.emit("gameStateChanged", {
      state: this.gameState,
      winner: null,
      player1: this.player1,
      player2: this.player2,
    });
    this.emit("playerChanged", {
      currentPlayer: this.currentPlayer,
      player1: this.player1,
      player2: this.player2,
    });
  }

  updatePlayerName(playerNumber, name) {
    const player = playerNumber === 1 ? this.player1 : this.player2;
    player.setName(name);
  }

  getCurrentGameState() {
    return {
      gameState: this.gameState,
      currentPlayer: this.currentPlayer,
      player1: this.player1,
      player2: this.player2,
      board: this.gameboard.getBoard(),
    };
  }
}

// =============================================
// UI RENDERER (Presentation Layer)
// =============================================

class UIRenderer {
  constructor() {
    this.elements = {
      cells: document.querySelectorAll(".cell"),
      player1Symbol: document.getElementById("player1-symbol"),
      player2Symbol: document.getElementById("player2-symbol"),
      player1Score: document.getElementById("player1-score"),
      player2Score: document.getElementById("player2-score"),
      player1Name: document.getElementById("player1-name"),
      player2Name: document.getElementById("player2-name"),
      actionButton: document.getElementById("action-button"),
    };
  }

  renderBoard(boardData) {
    const { board } = boardData;
    const flatBoard = board.flat();

    this.elements.cells.forEach((cell, index) => {
      cell.textContent = flatBoard[index];
    });
  }

  renderPlayerTurn(playerData) {
    const { currentPlayer, player1, player2 } = playerData;

    this.elements.player1Symbol.classList.remove("players-turn");
    this.elements.player2Symbol.classList.remove("players-turn");

    if (currentPlayer === player1) {
      this.elements.player1Symbol.classList.add("players-turn");
    } else {
      this.elements.player2Symbol.classList.add("players-turn");
    }
  }

  renderGameState(gameData) {
    const { state, winner } = gameData;

    [
      this.elements.player1Symbol,
      this.elements.player1Score,
      this.elements.player1Name,
      this.elements.player2Symbol,
      this.elements.player2Score,
      this.elements.player2Name,
    ].forEach((el) => {
      el.classList.remove("player-won-round", "players-turn");
    });

    if (state === GAME_STATE.PLAYER_WON && winner) {
      const isPlayer1Winner = winner.getSymbol() === CELL_STATE.O;
      const winnerElements = isPlayer1Winner
        ? [
            this.elements.player1Symbol,
            this.elements.player1Score,
            this.elements.player1Name,
          ]
        : [
            this.elements.player2Symbol,
            this.elements.player2Score,
            this.elements.player2Name,
          ];

      winnerElements.forEach((el) => el.classList.add("player-won-round"));
      this.elements.actionButton.textContent = "New Round";
    } else if (state === GAME_STATE.TIE) {
      this.elements.actionButton.textContent = "New Round";
    } else if (state === GAME_STATE.PLAYING) {
      this.elements.actionButton.textContent = "Restart Round";
    }
  }

  renderScores(scoreData) {
    const { player1, player2 } = scoreData;
    this.elements.player1Score.querySelector("p").textContent =
      player1.getWins();
    this.elements.player2Score.querySelector("p").textContent =
      player2.getWins();
  }
}

// =============================================
// INPUT HANDLER (User Interface Layer)
// =============================================

class InputHandler {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.querySelectorAll(".cell").forEach((cell, index) => {
      cell.addEventListener("click", () => {
        const row = Math.floor(index / 3);
        const col = index % 3;
        this.gameEngine.makeMove(row, col);
      });
    });

    document.getElementById("action-button").addEventListener("click", () => {
      this.gameEngine.startNewRound();
    });

    document.getElementById("player1-name").addEventListener("change", (e) => {
      this.gameEngine.updatePlayerName(1, e.target.value);
    });

    document.getElementById("player2-name").addEventListener("change", (e) => {
      this.gameEngine.updatePlayerName(2, e.target.value);
    });
  }
}

// =============================================
// APPLICATION BOOTSTRAP
// =============================================

class TicTacToeApp {
  constructor() {
    this.gameEngine = new GameEngine();
    this.renderer = new UIRenderer();
    this.inputHandler = new InputHandler(this.gameEngine);

    this.setupGameEngineListeners();
    this.initializeDisplay();
  }

  setupGameEngineListeners() {
    this.gameEngine.on("boardChanged", (data) => {
      this.renderer.renderBoard(data);
    });

    this.gameEngine.on("playerChanged", (data) => {
      this.renderer.renderPlayerTurn(data);
    });

    this.gameEngine.on("gameStateChanged", (data) => {
      this.renderer.renderGameState(data);
    });

    this.gameEngine.on("scoreChanged", (data) => {
      this.renderer.renderScores(data);
    });
  }

  initializeDisplay() {
    const gameState = this.gameEngine.getCurrentGameState();
    this.renderer.renderBoard({ board: gameState.board });
    this.renderer.renderPlayerTurn({
      currentPlayer: gameState.currentPlayer,
      player1: gameState.player1,
      player2: gameState.player2,
    });
    this.renderer.renderScores({
      player1: gameState.player1,
      player2: gameState.player2,
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new TicTacToeApp();
});
