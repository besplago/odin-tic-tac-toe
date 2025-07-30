const States = Object.freeze({
  X: Symbol("x"),
  Y: Symbol("o"),
  EMPTY: Symbol(" "),
});

function createGameboard() {
  let board = [
    [States.EMPTY, States.EMPTY, States.EMPTY],
    [States.EMPTY, States.EMPTY, States.EMPTY],
    [States.EMPTY, States.EMPTY, States.EMPTY],
  ];
  let moveCount = 0;

  function move(x, y, state) {
    if (board[x][y] !== States.EMPTY) {
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
      console.log(`[${rowMove}][${col}] == ${board[rowMove][col].toString()}`);

      if (board[rowMove][col] != state) {
        break;
      }
      if (col == board.length - 1) {
        return true;
      }
    }

    // Check col
    for (let row = 0; row < board.length; row++) {
      console.log(`[${row}][${colMove}] == ${board[row][colMove].toString()}`);
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

  return { displayBoard };
})();

const game = (() => {
  const gameboard = createGameboard();
  const player1 = createPlayer("Naruto", States.X);
  const player2 = createPlayer("Sasuke", States.Y);
  let playerToMove = player1;

  while (gameboard.getMoveCount() < gameboard.getBoardSize()) {
    console.log(`${playerToMove.getName()}'s turn`);
    let row = prompt("row");
    let col = prompt("col");

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
})();

game;
