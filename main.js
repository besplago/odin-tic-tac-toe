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
    board[x][y] = state;
    moveCount++;
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

  return { move, getMoveCount, getBoard, getBoardSize };
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

  function won() {
    wins++;
  }

  return { getName, getState, getWins, won };
}

const game = (() => {
  const gameboard = createGameboard();
  const player1 = createPlayer("Naruto", States.X);
  const player2 = createPlayer("Sasuke", States.Y);
  let playerToMove = player1;

  while (gameboard.getMoveCount() < gameboard.getBoardSize()) {
    console.log(`${playerToMove.getName()}'s turn`);
    let row = prompt("row");
    let col = prompt("col");
    gameboard.move(row, col, playerToMove.getState());
    console.table(gameboard.getBoard());
    if (playerToMove === player1) {
      playerToMove = player2;
    } else {
      playerToMove = player1;
    }
  }
})();

game;
