
// Grid Formatting START

let numberOfMines = 10;
let numberOfRows = 10;
let numberOfColumns = 10;

// Game State START

let openedTileCount = 0;
let flagTileCount = 0;

const gridWindow = document.querySelector("#minesweeper");

// Randomize Mine Locations START

const shuffleArray = (array) => {
  return array.sort((a, b) => {
    return Math.random() - 0.5;
  });
};

const randomizeMine = () => {
  const gridArray = Array.from(Array(numberOfRows * numberOfColumns).keys());
  return shuffleArray(gridArray).slice(0, numberOfMines);
};

let minePositions = randomizeMine();

// Randomize Mine Locations END

// Click to Open START

const getGridIdFromCoordinate = (row, column) => {
  return (row * numberOfColumns) + column;
};

const getGridIdFromElement = (td) => {
  const row = td.parentElement.rowIndex;
  const column = td.cellIndex;
  return getGridIdFromCoordinate(row, column);
};

const isOutOfBounds = (rowIndex, columnIndex) => {
  return rowIndex < 0 || rowIndex === numberOfRows
  || columnIndex < 0 || columnIndex === numberOfColumns;
};

const isMine = (gridId) => {
  return minePositions.includes(gridId);
};

const restartGame = () => {
  if (window.prompt('Restart game? (y/n)', 'y') === 'y') window.location.reload();
};

const gameOverMessage = () => {
  setTimeout(() => {
    window.alert('Game Over!');
    restartGame();
  }, 400);
};

const winMessage = () => {
  setTimeout(() => {
    window.alert('You won!');
    restartGame();
  }, 300);
};

const checkIfWin = () => {
  if (openedTileCount === ((numberOfRows * numberOfColumns) - numberOfMines)) {
    winMessage();
  }
};

const getElementFromCoordinate = (row, column) => {
  const rowElement = gridWindow.querySelector(`tr:nth-of-type(${row + 1})`);
  return rowElement.querySelector(`td:nth-of-type(${column + 1})`);
};

const getElementFromGridId = (gridId) => {
  const rowIndex = Math.floor(gridId / numberOfRows);
  const columnIndex = gridId % numberOfRows;
  return getElementFromCoordinate(rowIndex, columnIndex);
};

const clickTile = (event) => {
  const td = event.currentTarget;
  if (td.classList.contains('unopened')) {
    openTile(td);
  }
};

const flagTile = (event) => {
  event.preventDefault();
  const td = event.currentTarget;
  if (td.classList.contains('unopened')) {
    td.classList.remove('unopened');
    td.classList.add('flagged');
    flagTileCount += 1;
  } else if (td.classList.contains('flagged')) {
    td.classList.remove('flagged');
    td.classList.add('unopened');
    flagTileCount -= 1;
  }
  document.querySelector('#mine-counter').innerText = `Mine: ${numberOfMines - flagTileCount}`;
};

const removeListenersFromGrid = () => {
  gridWindow.childNodes.forEach((tr) => {
    tr.childNodes.forEach((td) => {
      td.removeEventListener('click', clickTile);
      td.removeEventListener('contextmenu', flagTile);
    });
  });
};

const openAllMines = () => {
  gridWindow.childNodes.forEach((tr) => {
    tr.childNodes.forEach((td) => {
      const mine = isMine(getGridIdFromElement(td));
      if (!mine && td.classList.contains('flagged')) {
        td.classList.remove('flagged');
        td.classList.add('wrong-flagged');
      } else if (mine && td.classList.contains('unopened')) {
        td.classList.remove('unopened');
        td.classList.add('mine');
      }
    });
  });
  removeListenersFromGrid();
  gameOverMessage();
};

const neighbourPositions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const mineNeighbourCount = (td) => {
  const row = td.parentElement.rowIndex;
  const column = td.cellIndex;
  let mineCount = 0;
  neighbourPositions.forEach((position) => {
    const x = row + position[0];
    const y = column + position[1];
    if (isOutOfBounds(x, y)) return;
    if (isMine(getGridIdFromCoordinate(x, y))) mineCount += 1;
  });
  return mineCount;
};

const queueNeighbours = (td, queue) => {
  const row = td.parentElement.rowIndex;
  const column = td.cellIndex;
  neighbourPositions.forEach((position) => {
    const x = row + position[0];
    const y = column + position[1];
    if (isOutOfBounds(x, y)) return;
    queue.push(getElementFromCoordinate(x, y));
  });
};

// When clicked on a tile without any nearby mine,
// spread open until all connected tiles has neighbour.
const bfsTiles = (td) => {
  const queue = [];
  queue.push(td);
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current.classList.contains('unopened')) continue;

    current.classList.remove('unopened');
    openedTileCount += 1;
    const mineCount = mineNeighbourCount(current);
    if (mineCount > 0) current.classList.add(`mine-neighbour-${mineCount}`);
    else {
      current.classList.add('opened');
      queueNeighbours(current, queue);
    }
  }
  checkIfWin();
};

const openTile = (td) => {
  const gridId = getGridIdFromElement(td);
  if (isMine(gridId)) {
    openAllMines();
  } else {
    bfsTiles(td);
  }
};

const addListenersToTiles = () => {
  gridWindow.childNodes.forEach((tr) => {
    tr.childNodes.forEach((td) => {
      td.addEventListener('click', clickTile);
      td.addEventListener('contextmenu', flagTile);
    });
  });
};

// Click to Open END

// Game State END

const buildGrid = () => {
  gridWindow.innerHTML = '';
  for (let i = 0; i < numberOfRows; i += 1) {
    const row = document.createElement('tr');
    for (let j = 0; j < numberOfColumns; j += 1) {
      row.insertAdjacentHTML('beforeend', "<td class='unopened'></td>");
    }
    gridWindow.insertAdjacentElement("beforeend", row);
  }
};

// Select Difficulties
// let difficulty = window.prompt("Pick a difficulty level: [ Easy, Medium, Hard ]", 'Easy');
const difficultyButtons = document.querySelector('#difficulty-buttons');
difficultyButtons.querySelectorAll('label').forEach((label) => {
  label.addEventListener('click', (event) => {
    const difficulty = label.dataset.difficulty;
    if (difficulty === 'hard') {
      numberOfMines = 99;
      numberOfRows = 16;
      numberOfColumns = 30;
    } else if (difficulty === 'medium') {
      numberOfMines = 40;
      numberOfRows = 13;
      numberOfColumns = 15;
    } else if (difficulty === 'easy') {
      numberOfMines = 10;
      numberOfRows = 10;
      numberOfColumns = 10;
    }
    buildGrid();
    document.querySelector('#mine-counter').innerText = `Mine: ${numberOfMines}`;
    minePositions = randomizeMine();
    addListenersToTiles();
  });
});

// Grid Formatting END
