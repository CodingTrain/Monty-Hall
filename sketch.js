const doors = [];
let state = 'PICK';
let pickedDoor;

let switchButton, stayButton, playAgain;
let outcomeP;
let timeoutid;

let resultsP;
let speedSlider;

let totalDoors = 3;

let stats;

let autoMode = false;
let autoButton;

function clearStats() {
  stats = {
    totalSwitchPlays: 0,
    totalStayPlays: 0,
    totalSwitchWins: 0,
    totalStayWins: 0,
  };
}

function startOver() {
  clearTimeout(timeoutid);
  for (let door of doors) {
    door.prize = '🐐';
    door.revealed = false;
    door.html(door.index + 1);
    door.style('background-color', '#AAA');
  }
  const winner = random(doors);
  winner.prize = '🚂';
  playAgain.hide();

  state = 'PICK';
  outcomeP.html('Pick a Door!');

  if (autoMode) {
    timeoutid = setTimeout(pickDoor, getDelayValue());
    speedSlider.show();
  } else {
    speedSlider.hide();
  }
}

function makeDoors() {
  // clear array
  for (let door of doors) {
    door.remove();
  }
  doors.splice(0, doors.length);
  console.log(doors);

  for (let i = 0; i < totalDoors; i++) {
    doors[i] = createDiv();
    doors[i].parent('#doors');
    doors[i].class('door');
    doors[i].index = i;
    doors[i].mousePressed(pickDoor);
  }
}

function setup() {
  noCanvas();
  makeDoors();
  clearStats();

  switchButton = createButton('switch');
  switchButton.mousePressed(playerSwitch);
  switchButton.hide();

  stayButton = createButton('stay');
  stayButton.mousePressed(playerStay);
  stayButton.hide();

  outcomeP = createDiv('');
  outcomeP.class('outcome');

  playAgain = createButton('play again');
  playAgain.mousePressed(startOver);
  playAgain.hide();

  resultsP = createElement('pre', '');

  createElement('br');
  autoButton = createButton('auto run');
  autoButton.mousePressed(handleAuto);

  storedstats = getItem('Montey-Hall-stats');
  if (storedstats) {
    stats = storedstats;
  }
  // I think good to always display the stats
  displayStats();

  speedSlider = createSlider(20, 1000, 500, 1);
  speedSlider.hide();
  startOver();

  const totalDoorSelect = createSelect();
  // Arbitrary set of choices
  totalDoorSelect.option(3);
  totalDoorSelect.option(4);
  totalDoorSelect.option(5);
  totalDoorSelect.option(10);
  totalDoorSelect.option(25);
  totalDoorSelect.option(50);
  totalDoorSelect.changed(function () {
    totalDoors = Number(totalDoorSelect.value());
    makeDoors();
    clearStorage();
    clearStats();
    displayStats();
    startOver();
  });
}

function handleAuto() {
  autoMode = !autoMode;
  if (autoMode) {
    pickDoor();
  } else {
    autoButton.html('auto run');
  }
  startOver();
}

function pickDoor() {
  if (state === 'PICK') {
    state = 'REVEAL';
    if (autoMode) {
      pickedDoor = random(doors);
      autoButton.html('stop autorun');
    } else {
      pickedDoor = this;
    }
    pickedDoor.style('background-color', '#AAF');
    if (autoMode) {
      setTimeout(reveal, getDelayValue());
    } else {
      reveal();
    }
  }
}

function reveal() {
  const options = [];
  for (let i = 0; i < doors.length; i++) {
    const door = doors[i];
    if (i !== pickedDoor.index && door.prize !== '🚂') {
      options.push(door);
    }
  }

  // The player got the right door!
  if (options.length == doors.length - 1) {
    // Randomly remove 1
    options.splice(floor(random(options.length)), 1);
  }

  for (let revealedDoor of options) {
    revealedDoor.revealed = true;
    revealedDoor.html(revealedDoor.prize);
  }

  if (!autoMode) {
    switchButton.style('display', 'inline');
    stayButton.style('display', 'inline');
    outcomeP.html('');
  } else {
    if (random(1) < 0.5) {
      timeoutid = setTimeout(playerSwitch, getDelayValue());
    } else {
      timeoutid = setTimeout(playerStay, getDelayValue());
    }
  }

  if (!autoMode) outcomeP.html('');
}

function getDelayValue() {
  return speedSlider.elt.max - speedSlider.value();
}

function playerSwitch() {
  stats.totalSwitchPlays++;

  let newPick;
  for (let i = 0; i < doors.length; i++) {
    let door = doors[i];
    if (door !== pickedDoor && !door.revealed) {
      newPick = door;
      break;
    }
  }
  pickedDoor = newPick;
  if (autoMode) {
    outcomeP.html('Switch!');
    timeoutid = setTimeout(() => checkWin(true), getDelayValue());
  } else {
    checkWin(true);
  }
}

function playerStay() {
  stats.totalStayPlays++;
  if (autoMode) {
    outcomeP.html('Stay!');
    timeoutid = setTimeout(() => checkWin(false), getDelayValue());
  } else {
    checkWin(false);
  }
}

function displayStats() {
  let switchRate =
    nf((100 * stats.totalSwitchWins) / stats.totalSwitchPlays, 2, 2) + '%';
  let stayRate =
    nf((100 * stats.totalStayWins) / stats.totalStayPlays, 1, 2) + '%';
  if (stats.totalSwitchPlays === 0) switchRate = 'n/a';
  if (stats.totalStayPlays === 0) stayRate = 'n/a';

  resultsP.html(
    `Total Switches:   ${stats.totalSwitchPlays}
Switch Win Rate:  ${switchRate}

Total Stays:      ${stats.totalStayPlays}
Stay Win Rate:    ${stayRate}`
  );
}

function checkWin(playerSwitch) {
  switchButton.hide();
  stayButton.hide();

  for (let door of doors) {
    door.html(door.prize);
    door.style('background-color', '#AAA');
  }

  if (pickedDoor.prize === '🚂') {
    outcomeP.html('You win!');
    pickedDoor.style('background-color', '#AFA');

    if (playerSwitch) {
      stats.totalSwitchWins++;
    } else {
      stats.totalStayWins++;
    }
  } else {
    outcomeP.html('You lose!');
    pickedDoor.style('background-color', '#FAA');
  }
  displayStats();

  if (!autoMode) {
    playAgain.style('display', 'inline');
    autoButton.html('auto run');
  } else {
    timeoutid = setTimeout(startOver, getDelayValue());
  }

  storeItem('Montey-Hall-stats', stats);
}
