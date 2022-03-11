/**
 * 2D matrix
 */
class Matrix {
  matrix = [];

  /**
   * Create Matrix by pattern or sizes
   */
  constructor() {
    // create matrix by pattern
    if(Array.isArray(arguments[0])) {
      let pattern = arguments[0];
      let marker = arguments[1] || 1; 
      let xSize = pattern[0].length;
      let ySize = pattern.length; 
    
      this.init(xSize, ySize);  
      this.set(pattern, marker);
    }
    // ..or(default empty) by sizes
    else {
      let xSize = arguments[0];
      let ySize = arguments[1];
      let marker = arguments[2] || 0;

      this.init(xSize, ySize, marker);
    }
  }

  /**
   * Initialize filled matrix
   * @param {number} xSize 'x' size of matrix
   * @param {number} ySize 'y' size of matrix
   * @param {any} marker default marker 
   * @returns {Matrix} current Matrix object
   */
  init(xSize, ySize, marker = 0) {
    this.matrix = new Array(ySize);
    for(let y = 0; y < this.matrix.length; y++) {
      this.matrix[y] = new Array(xSize);
      for(let x = 0; x < this.matrix[y].length; x++) {
        this.matrix[y][x] = marker;
      }
    }

    return this;
  }

  /**
   * Set pattern with/without marker
   * @param {number} pattern pattern
   * @param {any} marker marker of cell
   * @returns {Matrix} current Matrix object
   */
  set(pattern, marker) {    
    for(let y = 0; y < this.matrix.length; y++) {
      for(let x = 0; x < this.matrix[y].length; x++) {
        if(pattern[y][x] != 0) {
          this.matrix[y][x] = marker || pattern[y][x];
        }
      }
    }

    return this;
  }

  /**
   * Mixing current matrix with second matrix with/without offsets
   * @param {Array} pattern matrix pattern
   * @param {number} offsetX 'x' offset
   * @param {number} offsetY 'y' offset
   * @returns {Matrix} current Matrix object
   */
  mix(pattern, offsetX = 0, offsetY = 0) {
    // [WARNING] I don't know, but if modify the original 'this.matrix' immediately 
    // then sometimes the mixed matrix is incorrect.
    // So first create copy of original matrix
    let mixedMatrix = new Array(this.matrix.length);
    for(let y = 0; y < this.matrix.length; y++) {
      mixedMatrix[y] = new Array(this.matrix[y].length);
      for(let x = 0; x < this.matrix[y].length; x++) {
        mixedMatrix[y][x] = this.matrix[y][x];
      }
    }
  
    // mix copy with pattern
    for(let y = 0; y < pattern.length; y++) {
      for(let x = 0; x < pattern[y].length; x++) {
        let xPosition = x + offsetX;
        let yPosition = y + offsetY;
  
        if(pattern[y][x] > 0) {
          mixedMatrix[yPosition][xPosition] = pattern[y][x];
        }
      }
    }

    // ...and replace origin to copy
    this.matrix = mixedMatrix;
    return this;
  }

  /**
   * Rotate matrix clockwise
   * @returns {Matrix} current Matrix object
   */
  rotate() {
    let matrixVertical = this.matrix.length;
    let matrixHorizontal = this.matrix[0].length;
  
    // create a new array - H->V and V->H
    let rotatedMatrix = new Array(matrixHorizontal);
    for(let y = 0; y < rotatedMatrix.length; y++) {
      rotatedMatrix[y] = new Array(matrixVertical);
    }
  
    // rotate matrix
    for(let y = 0; y < matrixVertical; y++) {
      for(let x = 0; x < matrixHorizontal; x++) {
        // reflect matrix
        rotatedMatrix[x][matrixVertical-1-y] = this.matrix[y][x];
      }
    }
  
    this.matrix = rotatedMatrix;
    return this;
  }

  /**
   * Check collision between matrix and second matrix
   * @param {number} pattern matrix pattern
   * @param {number} offsetX 'x' offset
   * @param {number} offsetY 'y' offset
   * @returns {Boolean} predicate
   */
  collision(pattern, offsetX = 0, offsetY = 0) {
    for(let y = 0; y < pattern.length; y++) {
      for(let x = 0; x < pattern[y].length; x++) {
        let xPosition = x + offsetX;
        let yPosition = y + offsetY;
  
        if(pattern[y][x] > 0) {
          if(this.matrix[yPosition] == null 
          || this.matrix[yPosition][xPosition] == null 
          || this.matrix[yPosition][xPosition] != 0) {
              return true;
          }
        }
      }
    }
  
    return false;
  }

  /**
   * Get copy of current Matrix object
   * @returns {Matrix} Matrix copy
   */
  clone() {
    // create copy
    let matrixCopy = new Matrix(this.matrix);

    // and filling from original
    for(let y = 0; y < matrixCopy.matrix.length; y++) {
      for(let x = 0; x < matrixCopy.matrix[y].length; x++) {
        matrixCopy.matrix[y][x] = this.matrix[y][x];
      }
    }

    return matrixCopy;
  }
}

export { Matrix }