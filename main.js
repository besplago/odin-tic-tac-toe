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
      if (row == board.length) {
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
  function displayBoard(board) {
    console.table(board);
  }

  function drawBoard(board) {}

  return { displayBoard };
})();

const game = (() => {
  let gameState = GameStates.PLAYING;

  const gameboard = createGameboard();
  const player1 = createPlayer("Naruto", CellStates.O);
  const player2 = createPlayer("Sasuke", CellStates.X);

  let playerToMove = player1;

  document.addEventListener("playerMove", () => {
    console.log(`${playerToMove.getName()} moved`);
  });

  function play() {
    while (gameboard.getMoveCount() < gameboard.getBoardSize()) {
      console.log(`${playerToMove.getName()}'s turn`);
      let row = parseInt(prompt("row"));
      let col = parseInt(prompt("col"));

      let moveValidity = gameboard.move(row, col, playerToMove.getState());
      if (moveValidity === false) {
        console.log("invalid move");
        continue;
      }

      displayer.displayBoard(gameboard.getBoard());

      if (gameboard.checkWin(row, col, playerToMove.getState())) {
        console.log("Winner winner chicken dinner");
        playerToMove.increaseWin();
        return;
      }

      if (playerToMove === player1) {
        playerToMove = player2;
      } else {
        playerToMove = player1;
      }
    }
    console.log("Draw");
  }

  return { play };
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
      console.log(`Clicked cell at: Row ${row}, Col ${col} (Index: ${index})`);
    });
  });

  const player1NameInput = document.getElementById("player1-name");
  player1NameInput.addEventListener("change", () => {
    console.log("name changes");
  });
}

setupEventListeners();
