const CellStates = Object.freeze({
  X: Symbol("x"),
  O: Symbol("o"),
  EMPTY: Symbol(" "),
});

const GameStates = Object.freeze({
  PLAYING: Symbol("playing"),
  GAME_OVER: Symbol("game over"),
});

function createGameboard() {
  let board = [
    [CellStates.EMPTY, CellStates.EMPTY, CellStates.EMPTY],
    [CellStates.EMPTY, CellStates.EMPTY, CellStates.EMPTY],
    [CellStates.EMPTY, CellStates.EMPTY, CellStates.EMPTY],
  ];
  let moveCount = 0;

  function move(x, y, state) {
    if (board[x][y] !== CellStates.EMPTY) {
      return false;
    }
    board[x][y] = state;
    moveCount++;
    return true;
  }

  function getMoveCount() {
    return moveCount;
  }

  function getBoard() {
    return board;
  }

  function getBoardSize() {
    return 9;
  }

  function resetGameboard() {
    board = [
      [CellStates.EMPTY, CellStates.EMPTY, CellStates.EMPTY],
      [CellStates.EMPTY, CellStates.EMPTY, CellStates.EMPTY],
      [CellStates.EMPTY, CellStates.EMPTY, CellStates.EMPTY],
    ];

    moveCount = 0;
  }

  function checkWin(rowMove, colMove, state) {
    // Check row
    for (let col = 0; col < board.length; col++) {
      if (board[rowMove][col] != state) {
        break;
      }
      if (col == board.length - 1) {
        return true;
      }
    }

    // Check col
    for (let row = 0; row < board.length; row++) {
      if (board[row][colMove] != state) {
        break;
      }
      if (row == board.length - 1) {
        return true;
      }
    }

    // Check diagonal
    if (rowMove === colMove) {
      for (let i = 0; i < board.length; i++) {
        if (board[i][i] != state) {
          break;
        }
        if (i == board.length - 1) {
          return true;
        }
      }
    }

    // Check anti-diagonal
    if (rowMove + colMove == board.length - 1) {
      for (let i = 0; i < board.length; i++) {
        if (board[i][board.length - 1 - i] != state) {
          break;
        }
        if (i == board.length - 1) {
          return true;
        }
      }
    }

    return false;
  }

  return {
    move,
    getMoveCount,
    getBoard,
    getBoardSize,
    checkWin,
    resetGameboard,
  };
}

function createPlayer(name, cellState) {
  let wins = 0;

  function getName() {
    return name;
  }

  function getCellState() {
    return cellState;
  }

  function getWins() {
    return wins;
  }

  function increaseWin() {
    wins++;
  }

  return { getName, getCellState, getWins, increaseWin };
}

const displayer = (() => {
  let cells = null;

  function displayBoard(board) {
    console.table(board);
  }

  function drawBoard(board) {
    if (!cells) {
      cells = document.querySelectorAll(".cell");
    }

    const flatBoard = board.flat();

    flatBoard.forEach((cellState, index) => {
      const cellElement = cells[index];

      if (cellState.description === "x") {
        cellElement.textContent = "X";
      } else if (cellState.description === "o") {
        cellElement.textContent = "O";
      } else {
        cellElement.textContent = "";
      }
    });
  }

  function drawPlayingState(playerToMove) {
    const player1SymbolElement = document.getElementById("player1-symbol");
    const player2SymbolElement = document.getElementById("player2-symbol");

    player1SymbolElement.classList.remove("players-turn");
    player2SymbolElement.classList.remove("players-turn");

    if (playerToMove.getCellState() === CellStates.O) {
      player1SymbolElement.classList.add("players-turn");
    } else {
      player2SymbolElement.classList.add("players-turn");
    }
  }

  function drawGameOverState(playerWhoWon) {
    const player1SymbolElement = document.getElementById("player1-symbol");
    const player1ScoreElement = document.getElementById("player1-score");
    const player1NameElement = document.getElementById("player1-name");
    const player2SymbolElement = document.getElementById("player2-symbol");
    const player2ScoreElement = document.getElementById("player2-score");
    const player2NameElement = document.getElementById("player2-name");

    if (playerWhoWon.getCellState() === CellStates.O) {
      player1SymbolElement.classList.add("player-won-round");
      player1ScoreElement.classList.add("player-won-round");
      player1NameElement.classList.add("player-won-round");
    } else {
      player2SymbolElement.classList.add("player-won-round");
      player2ScoreElement.classList.add("player-won-round");
      player2NameElement.classList.add("player-won-round");
    }
  }

  function drawNewRound() {}

  return {
    displayBoard,
    drawBoard,
    drawPlayingState,
    drawGameOverState,
    drawNewRound,
  };
})();

const game = (() => {
  let gameState = GameStates.PLAYING;

  const gameboard = createGameboard();
  const player1 = createPlayer("Naruto", CellStates.O);
  const player2 = createPlayer("Sasuke", CellStates.X);

  let playerToMove = player1;
  displayer.drawPlayingState(playerToMove);

  function playMove(playedRow, playedCol) {
    let moveValidity = gameboard.move(
      playedRow,
      playedCol,
      playerToMove.getCellState()
    );
    if (moveValidity === false) {
      console.log("invalid move");
      return;
    }

    displayer.drawBoard(gameboard.getBoard());
    displayer.displayBoard(gameboard.getBoard());

    if (gameboard.checkWin(playedRow, playedCol, playerToMove.getCellState())) {
      console.log("Winner winner chicken dinner");
      playerToMove.increaseWin();
      gameState = GameStates.GAME_OVER;
      return;
    }

    if (playerToMove === player1) {
      playerToMove = player2;
    } else {
      playerToMove = player1;
    }

    displayer.drawPlayingState(playerToMove);
    return;
  }

  function restartGame() {}

  document.addEventListener("playerMove", (e) => {
    if (gameState === GameStates.PLAYING) {
      playMove(e.detail.row, e.detail.col);
      if (gameState === GameStates.GAME_OVER) {
        displayer.drawGameOverState(playerToMove);
      }
    }
  });

  document.addEventListener("actionButtonClicked", () => {
    switch (gameState) {
      case GameStates.PLAYING:
        gameboard.resetGameboard();
        break;

      default:
        break;
    }
    displayer.drawBoard(gameboard.getBoard());
    displayer.drawPlayingState(playerToMove);
  });

  return { playMove };
})();

function setupEventListeners() {
  const cells = document.querySelectorAll(".cell");

  cells.forEach((cell, index) => {
    cell.addEventListener("click", () => {
      const row = Math.floor(index / 3);
      const col = index % 3;

      const moveEvent = new CustomEvent("playerMove", {
        detail: {
          row: row,
          col: col,
        },
        bubbles: true,
      });

      cell.dispatchEvent(moveEvent);
    });
  });

  const player1NameInput = document.getElementById("player1-name");
  player1NameInput.addEventListener("change", () => {
    console.log("name changes");
  });

  const actionButton = document.getElementById("action-button");
  actionButton.addEventListener("click", () => {
    const actionEvent = new CustomEvent("actionButtonClicked", {
      bubbles: true,
    });
    actionButton.dispatchEvent(actionEvent);
  });
}

setupEventListeners();
