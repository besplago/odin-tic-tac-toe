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

  return { move, getMoveCount, getBoard, getBoardSize, checkWin };
}

function createPlayer(name, state) {
  let wins = 0;

  function getName() {
    return name;
  }

  function getState() {
    return state;
  }

  function getWins() {
    return wins;
  }

  function increaseWin() {
    wins++;
  }

  return { getName, getState, getWins, increaseWin };
}

const displayer = (() => {
  let cells = null; // Cache for gameboard cells

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

      // Clear existing classes
      cellElement.classList.remove("x", "o");

      // Update content based on cell state
      if (cellState.description === "x") {
        cellElement.textContent = "X";
        cellElement.classList.add("x");
      } else if (cellState.description === "o") {
        cellElement.textContent = "O";
        cellElement.classList.add("o");
      } else {
        cellElement.textContent = "";
      }
    });
  }

  function drawPlayingState() {}

  function drawGameOverState() {}

  return { displayBoard, drawBoard, drawPlayingState, drawGameOverState };
})();

const game = (() => {
  let gameState = GameStates.PLAYING;

  const gameboard = createGameboard();
  const player1 = createPlayer("Naruto", CellStates.O);
  const player2 = createPlayer("Sasuke", CellStates.X);

  let playerToMove = player1;

  function playMove(playedRow, playedCol) {
    let moveValidity = gameboard.move(
      playedRow,
      playedCol,
      playerToMove.getState()
    );
    if (moveValidity === false) {
      console.log("invalid move");
      return;
    }

    displayer.drawBoard(gameboard.getBoard());
    displayer.displayBoard(gameboard.getBoard());

    if (gameboard.checkWin(playedRow, playedCol, playerToMove.getState())) {
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
    return;
  }

  document.addEventListener("playerMove", (e) => {
    if (gameState === GameStates.PLAYING) {
      playMove(e.detail.row, e.detail.col);
      displayer.drawPlayingState();
      if (gameState === GameStates.GAME_OVER) {
        console.log("handle game over");
        displayer.drawGameOverState();
      }
    }
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
}

setupEventListeners();
