console.log("Bingo game script loaded");
const GRID_SIZE = 5;
const TOTAL_NUMBERS = 90;
const CENTER_INDEX = Math.floor(GRID_SIZE * GRID_SIZE / 2);

const bingoGrid = document.getElementById('bingo-grid');
const newCardBtn = document.getElementById('new-card-btn');
const confettiCanvas = document.getElementById('confetti-canvas');
const soundEffect = document.getElementById('bingo-sound');
const jsConfetti = new JSConfetti({ canvas: confettiCanvas });

let cardCells = [];
let bingoShown = false;

// Utility: Generate array 1 to 90
function range(start, end) {
  return Array.from({length: end - start + 1}, (_, i) => start + i);
}

// Shuffle array in place (Fisher-Yates)
function shuffle(array) {
  for (let i = array.length -1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Pick 24 random unique numbers from 1-90
function generateNumbers() {
  const numbers = shuffle(range(1, TOTAL_NUMBERS));
  return numbers.slice(0, GRID_SIZE * GRID_SIZE - 1);
}

// Generate and render a new random card
function generateCard() {
  bingoGrid.innerHTML = '';
  cardCells = [];
  bingoShown = false;

  let numbers = generateNumbers();

  for(let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.setAttribute('tabindex', '0');
    cell.setAttribute('role', 'gridcell');
    cell.dataset.index = i;

    if(i === CENTER_INDEX) {
      cell.textContent = "Free";
      cell.classList.add('free', 'marked');
    } else {
      // Adjust i to skip 'Free'
      const idx = i > CENTER_INDEX ? i - 1 : i;
      cell.textContent = numbers[idx];
    }

    cell.addEventListener('click', () => toggleCell(i));
    cell.addEventListener('keydown', (e) => {
      if(e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggleCell(i);
      }
    });

    bingoGrid.appendChild(cell);
    cardCells.push({el: cell, marked: cell.classList.contains('marked')});
  }
  clearBingoHighlights();
}

// Toggle mark on a cell
function toggleCell(index) {
  if(index === CENTER_INDEX) return; // Don't toggle 'Free'

  const cell = cardCells[index];
  cell.marked = !cell.marked;
  cell.el.classList.toggle('marked', cell.marked);

  checkForBingo();
}

// Remove all bingo highlighters
function clearBingoHighlights() {
  cardCells.forEach(c => {
    c.el.classList.remove('bingo-row', 'bingo-col', 'bingo-diag');
  });
}

// Bingo detection for row/col/diagonal
function checkForBingo() {
  clearBingoHighlights();

  const marks = cardCells.map(c => (c.marked ? 1 : 0));
  marks[CENTER_INDEX] = 1; // Center is always marked

  let bingoDetected = false;

  // Check Rows
  for(let r=0; r<GRID_SIZE; r++) {
    let indices = [];
    let complete = true;
    for(let c=0; c<GRID_SIZE; c++) {
      let idx = r*GRID_SIZE + c;
      indices.push(idx);
      if(!marks[idx]) complete = false;
    }
    if(complete) {
      indices.forEach(i => cardCells[i].el.classList.add('bingo-row'));
      bingoDetected = true;
    }
  }

  // Check Columns
  for(let c=0; c<GRID_SIZE; c++) {
    let indices = [];
    let complete = true;
    for(let r=0; r<GRID_SIZE; r++) {
      let idx = r*GRID_SIZE + c;
      indices.push(idx);
      if(!marks[idx]) complete = false;
    }
    if(complete) {
      indices.forEach(i => cardCells[i].el.classList.add('bingo-col'));
      bingoDetected = true;
    }
  }

  // Diagonal TL-BR
  let diag1 = [];
  let diag1Complete = true;
  for(let i=0; i<GRID_SIZE; i++) {
    let idx = i*GRID_SIZE + i;
    diag1.push(idx);
    if(!marks[idx]) diag1Complete = false;
  }
  if(diag1Complete) {
    diag1.forEach(i => cardCells[i].el.classList.add('bingo-diag'));
    bingoDetected = true;
  }

  // Diagonal TR-BL
  let diag2 = [];
  let diag2Complete = true;
  for(let i=0; i<GRID_SIZE; i++) {
    let idx = i*GRID_SIZE + (GRID_SIZE - 1 - i);
    diag2.push(idx);
    if(!marks[idx]) diag2Complete = false;
  }
  if(diag2Complete) {
    diag2.forEach(i => cardCells[i].el.classList.add('bingo-diag'));
    bingoDetected = true;
  }

  // Only celebrate on newly detected bingo
  if (bingoDetected && !bingoShown) {
    showCelebration();
    bingoShown = true;
  }
  if (!bingoDetected) {
    bingoShown = false;
  }
}

// Bingo celebration: sound and confetti
function showCelebration() {
  soundEffect.currentTime = 0;
  soundEffect.play();
  jsConfetti.addConfetti({
    emojis: ["🎉", "✨", "🥳", "🍀", "🌟", "🍻", "🎈", "💰"],
    emojiSize: 36,
    confettiNumber: 100
  });
  // Optional: you can display a popup or visual "BINGO!" here as well
}

newCardBtn.addEventListener('click', generateCard);
generateCard();
