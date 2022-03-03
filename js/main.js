import { figures } from './data/figures.js';
import { colors } from './data/colors.js';

// elements
const overlapLayout = document.getElementById('overlapLayout');
const overlapInfo = document.getElementById('overlapInfo');
const newGameButton = document.getElementById('newGameButton');
const gameLayout = document.getElementById('game');
const gameContext = gameLayout.getContext('2d');
const previewLayout = document.getElementById('preview');
const previewContext = previewLayout.getContext('2d');
const score = document.getElementById('score');
const cellSize = (gameLayout.width / 10);

// game properties
let gameMap = [];
let nextFigure = [];
let currentFigure = [];
let offsetX = 0;
let offsetY = 0;
let gameId = null;

// inputs
newGameButton.addEventListener('mouseup', startGame);

function drawMap() {
  let tempMap = mixMatrix(gameMap, currentFigure, offsetX, offsetY);

  // draw map
  drawMatrix(gameContext, tempMap, cellSize, colors);
}

function drawPreview() {
  previewLayout.width = cellSize * nextFigure[0].length;
  previewLayout.height = cellSize * nextFigure.length;

  drawMatrix(previewContext, nextFigure, cellSize, colors);
}

function drawMatrix(context, matrix, cellSize, colors) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);

  for(let y = 0; y < matrix.length; y++) {
    for(let x = 0; x < matrix[y].length; x++) {
      if(matrix[y][x] > 0) {
        let color = colors.filter(c => c.marker == matrix[y][x])[0].color;

        // draw cells
        context.fillStyle = color;
        context.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

        // draw cell borders
        context.strokeStyle = 'rgb(0, 0, 0, 0.2)';
        context.lineWidth = 5;
        context.strokeRect(x * cellSize + 2, y * cellSize + 2, cellSize - 4, cellSize - 4);  
      }
    }
  }

  // shadows
  context.shadowColor = "rgb(0, 0, 0, 0.3)";
  context.shadowBlur = 5;
  context.shadowOffsetY = 5;
  context.fill();
}

function rotateFigure(figure, quantity = 0) {
  let figureVertical = figure.length;
  let figureHorizontal = figure[0].length;

  // create a new array - H->V and V->H
  let rotatedFigure = new Array(figureHorizontal);
  for(let y = 0; y < rotatedFigure.length; y++) {
    rotatedFigure[y] = new Array(figureVertical);
  }

  // rotate figure
  for(let y = 0; y < figureVertical; y++) {
    for(let x = 0; x < figureHorizontal; x++) {
      // reflect figure
      rotatedFigure[x][figureVertical-1-y] = figure[y][x];
    }
  }

  if(quantity > 0) {
    rotatedFigure = rotateFigure(rotatedFigure, --quantity);
  }

  return rotatedFigure;
}

function moveFigure(x = 0, y = 0) {
  if(!checkCollision(gameMap, currentFigure, offsetX + x, offsetY + y)) {
    offsetX += x;
    offsetY += y;
    drawMap();
    return true;
  }
  else {
    return false;
  }        
}

function checkLines() {
  let lines = [];
  for(let y = 0; y < gameMap.length; y++) {
    if(gameMap[y].filter(i => i != 0).length === gameMap[0].length) {
      lines.push(y);
    }
  }
  return lines;
}

function removeLines(lines) {
  for(let i = 0; i < lines.length; i++) {
    gameMap.splice(lines[i], 1);
    gameMap.unshift(gameMap[0]);
  }
}

function getFigure(figures, colors) {
  let figureindex = Math.floor(Math.random() * figures.length);
  let colorIndex = Math.floor(Math.random() * colors.length);
  let figure = figures[figureindex];

  // colorize figure
  for(let y = 0; y < figure.length; y++) {
    for(let x = 0; x < figure[y].length; x++) {
      if(figure[y][x] != 0) {
        figure[y][x] = colors[colorIndex].marker;
      }
    }
  }

  return figure;
}

function getMatrix(xSize, ySize, symbol = 0) {
  let map = new Array(ySize);
  for(let y = 0; y < map.length; y++) {
    map[y] = new Array(xSize);
    for(let x = 0; x < map[y].length; x++) {
      map[y][x] = symbol;
    }
  }
  return map;
}

function mixMatrix(matrixA, matrixB, offsetX, offsetY) {
  let mixedMatrix = new Array(matrixA.length);
  for(let y = 0; y < matrixA.length; y++) {
    mixedMatrix[y] = new Array(matrixA[y].length);
    for(let x = 0; x < matrixA[y].length; x++) {
      mixedMatrix[y][x] = matrixA[y][x];
    }
  }

  for(let y = 0; y < matrixB.length; y++) {
    for(let x = 0; x < matrixB[y].length; x++) {
      let xPosition = x + offsetX;
      let yPosition = y + offsetY;

      if(matrixB[y][x] > 0) {
        mixedMatrix[yPosition][xPosition] = matrixB[y][x];
      }
    }
  }

  return mixedMatrix;
}

function checkCollision(matrixA, matrixB, offsetX, offsetY) {
  for(let y = 0; y < matrixB.length; y++) {
    for(let x = 0; x < matrixB[y].length; x++) {
      let xPosition = x + offsetX;
      let yPosition = y + offsetY;

      if(matrixB[y][x] > 0) {
        if(matrixA[yPosition] == null 
        || matrixA[yPosition][xPosition] == null 
        || matrixA[yPosition][xPosition] != 0) {
            return true;
        }
      }
    }
  }

  return false;
}

function gameLoop() {
  let isGameOver = false;
  // current figure move to down
  let isUpdated = moveFigure(0, 1);

  if(!isUpdated) {
    // fix current map
    gameMap = mixMatrix(gameMap, currentFigure, offsetX, offsetY);

    // update figure
    currentFigure = nextFigure;
    nextFigure = rotateFigure(getFigure(figures, colors), Math.floor(Math.random() * 3));

    // reset offsets
    offsetX = Math.floor((gameMap[0].length / 2) - (currentFigure[0].length / 2));
    offsetY = 0;

    // if a new figure collides, then "game over"
    if(checkCollision(gameMap, currentFigure, offsetX, offsetY)) {
      isGameOver = true;
    }
  }

  // if "game over" then...
  if(isGameOver) {  
    // stop game
    clearInterval(gameId);
    gameId = null;

    // remove listener to escape move figures
    window.removeEventListener('keydown', controlListener);

    // ...and show overlap
    overlapLayout.classList.remove('hidden');
    overlapInfo.innerText = "GAME OVER";
  }
  // or continue game
  else {
    let lines = checkLines();
    removeLines(lines);
    score.innerText = +score.innerText + (lines.length * 5);
    drawMap();
    drawPreview();
  }
}

// event listeners
function startGame(event) {
  if(gameId === null) {
    // reset game properties
    gameMap = getMatrix(10, 20);
    nextFigure = getFigure(figures, colors);
    currentFigure = getFigure(figures, colors);
    offsetX = Math.floor((gameMap[0].length / 2) - (currentFigure[0].length / 2));
    offsetY = 0;
    score.innerText = 0;

    // hide overlap
    overlapLayout.classList.add('hidden');

    // add listener to move figures
    window.addEventListener('keydown', controlListener);

    // draw main matrix
    drawMap();
    drawPreview();

    // ...and start game
    gameId = setInterval(gameLoop, 500);
  }
}

function controlListener(event) {
  switch(event.key) {
    case 'ArrowLeft':
      moveFigure(-1);
      break;

    case 'ArrowRight':
      moveFigure(1);
      break;

    case 'ArrowDown':  
      moveFigure(0, 1);
      break;

    case ' ':
      let rotatedFigure = rotateFigure(currentFigure);
      let fixedX = 0;
      if(offsetX >= Math.floor(gameMap[0].length / 2)) {
        fixedX = rotatedFigure[0].length - currentFigure[0].length;
      }

      if(!checkCollision(gameMap, rotatedFigure, offsetX - fixedX, offsetY)) {
        offsetX -= fixedX;
        currentFigure = rotatedFigure;
        drawMap();
        break;
      }
      break;   
  }
}