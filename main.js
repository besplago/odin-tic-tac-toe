const States = Object.freeze({
  X: Symbol("x"),
  Y: Symbol("o"),
  EMPTY: Symbol(" "),
});

const gameboard = (() => {
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

  function getBoardTable() {
    return console.table(board);
  }

  return { move, getMoveCount, getBoardTable };
})();

console.log(gameboard.getBoardTable());
gameboard.move(0, 0, States.X);
gameboard.move(0, 1, States.Y);
console.log(gameboard.getBoardTable());
