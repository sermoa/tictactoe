/*----- constants -----*/
const winningCombos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6], 
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];
const turns = ['X', 'O'];
const pollSpeed = 30;
const resetSpeed = 150;


/*----- app's state (variables) -----*/
let params = new URLSearchParams(window.location.search);
let mode = params.get("mode");

let alex, oak;
let activePlayers = [];

let board;
let turn;
let winner;
let state;
let winningCombo = null;

/*----- cached element references -----*/
const squares = Array.from(document.querySelectorAll('#board div'));
const messages = document.querySelector('h2');

/*----- event listeners -----*/
document.getElementById('board').addEventListener('click', handleTurn);
document.getElementById('reset-button').addEventListener('click', reset);

document.getElementById('play-alex').addEventListener('click', function(e) {
  e.preventDefault();
  playAlex();
});

document.getElementById('play-oak').addEventListener('click', function(e) {
  e.preventDefault();
  playOak();
});

document.getElementById('training-mode').addEventListener('click', function(e) {
  e.preventDefault();
  trainingMode();
});

/*----- Player functions -----*/

class Player {
  constructor(turn) {
    this.turn = turn;
  };

  reset() {
    this.stopPolling();
  }

  startPolling() {
    var self = this;
    self.poll = setInterval(function() {
      if (state === 'win') {
        self.stopPolling();
        if (winner === self.turn) {
          self.handleWinning();
        } else {
          self.handleLosing();
        }
      } else if (state === 'tie') {
        self.stopPolling();
        self.handleTie();
      } else if (state === 'playing' && turn === self.turn) {
        self.takeTurn();
      };
    }, pollSpeed);
  };

  stopPolling() {
    clearInterval(this.poll);
  }

  takeTurn() {
    takeTurn(this.calculateBestMove());
  };

  calculateBestMove() {
    var possibleMoves = [];
    board.forEach(function(value, idx) {
      if (value == '') possibleMoves.push(idx);
    });
    return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];;
  }

  handleWinning() {
    console.log("I won! I am " + this.turn);
  }

  handleLosing() {
    console.log("I Lost :( I am " + this.turn);
  }

  handleTie() {
    console.log("It was a tie.");
  }
};

/*----- Page functions -----*/

function init() {
  alex = new Player('X');
  oak = new Player('O');

  if(mode == "alex") {
    playAlex();
  } else if(mode == "oak") {
    playOak();
  } else if(mode == "training") {
    trainingMode();
  } else {
    reset();
  }
}

function playAlex() {
  resetPlayers();
  activePlayers = [alex];
  reset();
}

function playOak() {
  resetPlayers();
  activePlayers = [oak];
  reset();
}

function trainingMode() {
  resetPlayers();
  activePlayers = [alex, oak];
  reset();
}

function resetPlayers() {
  activePlayers.forEach(function(player) { player.reset(); });
}

function reset() {
  resetPlayers();
  board = [
    '', '', '',
    '', '', '',
    '', '', ''
  ];
  turn = turns[Math.floor(Math.random() * turns.length)];

  winner = null;
  state = 'playing';
  activePlayers.forEach(function(player) { player.startPolling(); });

  hideWin();
  render();
};

function render() {
  board.forEach(function(mark, index){
    squares[index].textContent = mark;
  });
  if (state === 'tie') {
    messages.textContent = `That's a tie!`
  } else if (state === 'win') { 
    messages.textContent = `${winner} wins the game!`
    displayWin();
  } else {
    messages.textContent = `It's ${turn}'s turn!`
  }
};

function handleTurn(event) {
  let idx = squares.findIndex(function(square) {
    return square === event.target;
  });
  takeTurn(idx);
};

function takeTurn(idx) {
  if (winner === null && board[idx] === '') {
    board[idx] = turn;
    winner = getWinner();
    if (winner === 'T') {
      state = 'tie';
    } else if (winner === 'X' || winner === 'O') {
      state = 'win';
    } else {
      turn = turn === 'X' ? 'O' : 'X';
    }
    render();

    if(activePlayers.length === 2 && state !== 'playing') {
      setTimeout(reset, resetSpeed);
    }
  }
};

function getWinner() {
  let tempWinner = null;
  winningCombos.forEach(function(combo, index) {
    if (board[combo[0]] && board[combo[0]] === board[combo[1]] &&
      board[combo[0]] === board[combo[2]]) {
        tempWinner = board[combo[0]];
        winningCombo = combo;
      }
  });
  return tempWinner ? tempWinner : board.includes('') ? null : 'T';
};

function hideWin() {
  var winningSquares = document.getElementsByClassName('win');
  while (winningSquares.length > 0) {
    winningSquares[0].classList.remove('win');
  }
}

function displayWin() {
  winningCombo.forEach(function(number, index) {
    document.getElementsByClassName('square')[number].classList.add('win');
  });
}

init();
