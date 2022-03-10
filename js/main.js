import { figures } from './data/figures.js';
import { colors } from './data/colors.js';
import { Matrix } from './modules/Matrix.js';

// elements
const overlapLayout = document.getElementById('overlapLayout');
const overlapInfo = document.getElementById('overlapInfo');
const newGameButton = document.getElementById('newGameButton');
const gameCanvas = document.getElementById('gameCanvas');
const gameContext = gameCanvas.getContext('2d');
const figureCanvas = document.getElementById('figureCanvas');
const figureContext = figureCanvas.getContext('2d');
const previewLayout = document.getElementById('preview');
const previewContext = previewLayout.getContext('2d');
const score = document.getElementById('score');
const cellSize = (gameCanvas.width / 10);

// game properties
let gameMap = [];
let figureMap = [];
let nextFigure = [];
let currentFigure = [];
let figureOffsetX = 0;
let figureOffsetY = 0;
let gameId = null;

// inputs
newGameButton.addEventListener('mouseup', startGame);

function drawMap() {
  // draw map
  drawMatrix(gameContext, gameMap.matrix, cellSize, colors);
}

function drawFigure() {
  figureMap.init(10, 20).mix(currentFigure.matrix, figureOffsetX, figureOffsetY);
  drawMatrix(figureContext, figureMap.matrix, cellSize, colors);
}

function drawPreview() {
  previewLayout.width = cellSize * nextFigure.matrix[0].length;
  previewLayout.height = cellSize * nextFigure.matrix.length;
  
  drawMatrix(previewContext, nextFigure.matrix, cellSize, colors);
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
}

function moveFigure(x = 0, y = 0) {
  if(!gameMap.collision(currentFigure.matrix, figureOffsetX + x, figureOffsetY + y)) {
    figureOffsetX += x;
    figureOffsetY += y;
    drawFigure();
    return true;
  }
  else {
    return false;
  }        
}

function checkLines() {
  let lines = [];
  for(let y = 0; y < gameMap.matrix.length; y++) {
    if(gameMap.matrix[y].filter(i => i != 0).length === gameMap.matrix[0].length) {
      lines.push(y);
    }
  }
  return lines;
}

function removeLines(lines) {
  for(let i = 0; i < lines.length; i++) {
    gameMap.matrix.splice(lines[i], 1);
    gameMap.matrix.unshift(gameMap.matrix[0]);
  }
}

function getFigure(figures, colors) {
  let randomFigure = figures[Math.floor(Math.random() * figures.length)];
  let randomColor = colors[Math.floor(Math.random() * colors.length)].marker;
  let figureMatrix = new Matrix(randomFigure, randomColor);
  return figureMatrix;
}

function gameLoop() {
  let isGameOver = false;
  // current figure move to down
  let isUpdated = moveFigure(0, 1);

  if(!isUpdated) {
    // fix current map
    gameMap.mix(figureMap.matrix);

    // update figure
    currentFigure = nextFigure.clone();
    nextFigure = getFigure(figures, colors);

    // rotate random
    while(!!Math.floor(Math.random() * 2)) {
      nextFigure.rotate();
    }

    // reset offsets
    figureOffsetX = Math.floor((gameMap.matrix[0].length / 2) - (currentFigure.matrix[0].length / 2));
    figureOffsetY = 0;

    // if a new figure collides, then "game over"
    if(gameMap.collision(currentFigure.matrix, figureOffsetX, figureOffsetY)) {
      isGameOver = true;
    }

    drawMap();
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
    if(lines.length > 0) {
      removeLines(lines);
      score.innerText = +score.innerText + (lines.length * 5);
      drawMap();
    }
    drawFigure();
    drawPreview();
  }
}

// event listeners
function startGame(event) {
  if(gameId === null) {
    // reset game properties
    gameMap = new Matrix(10, 20);
    figureMap = new Matrix(10, 20);
    nextFigure = getFigure(figures, colors);
    currentFigure = getFigure(figures, colors);

    figureOffsetX = Math.floor((gameMap.matrix[0].length / 2) - (currentFigure.matrix[0].length / 2));
    figureOffsetY = 0;
    score.innerText = 0;

    // hide overlap
    overlapLayout.classList.add('hidden');

    // add listener to move figures
    window.addEventListener('keydown', controlListener);

    // draw main matrix
    drawMap();
    drawFigure();
    drawPreview();

    // ...and start game
    gameId = setInterval(gameLoop, 300);
  }
}

function controlListener(event) {
  switch(event.keyCode) {
    // left
    case 37:
      moveFigure(-1);
      break;
    // right
    case 39:
      moveFigure(1);
      break;
    // down
    case 40:  
      moveFigure(0, 1);
      break;
    // space
    case 32:
      let rotatedFigure = currentFigure.clone().rotate();
      let fixedX = 0;

      if(figureOffsetX >= Math.floor(gameMap.matrix[0].length / 2)) {
        fixedX = rotatedFigure.matrix[0].length - currentFigure.matrix[0].length;
      }

      if(!gameMap.collision(rotatedFigure.matrix, figureOffsetX - fixedX, figureOffsetY)) {
        figureOffsetX -= fixedX;
        currentFigure = rotatedFigure;
        drawFigure();
        break;
      }
      break;   
  }
}