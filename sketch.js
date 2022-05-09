const doors = [];
let state = "PICK";
let pickedDoor;
let revealedDoor;

let switchButton, stayButton, playAgain;
let outcomeP;
let timeoutid;

let resultsP;
let speedSlider;

let stats = {
  totalSwitchPlays: 0,
  totalStayPlays: 0,
  totalSwitchWins: 0,
  totalStayWins: 0
}

let autoMode = false;
let autoButton;

function startOver() {
  clearTimeout(timeoutid);
  for (let door of doors) {
    door.prize = "🐐";
    door.html(door.index + 1);
    door.style("background-color", "#AAA");
  }
  const winner = random(doors);
  winner.prize = "🚂";
  playAgain.hide();

  state = "PICK";
  outcomeP.html("Pick a Door!");

  if (autoMode) {
    timeoutid = setTimeout(pickDoor, getDelayValue());
    speedSlider.show();
  } else {
    speedSlider.hide();
  }
}

function setup() {
  noCanvas();

  for (let i = 0; i < 3; i++) {
    doors[i] = createDiv();
    doors[i].parent("#doors");
    doors[i].class("door");
    doors[i].index = i;
    doors[i].mousePressed(pickDoor);
  }

  switchButton = createButton("switch");
  switchButton.mousePressed(playerSwitch);
  switchButton.hide();

  stayButton = createButton("stay");
  stayButton.mousePressed(playerStay);
  stayButton.hide();

  outcomeP = createDiv("");
  outcomeP.class("outcome");

  playAgain = createButton("play again");
  playAgain.mousePressed(startOver);
  playAgain.hide();

  resultsP = createElement("pre", "");

  createElement("br");
  autoButton = createButton("auto run");
  autoButton.mousePressed(handleAuto);

  storedstats = getItem("Montey-Hall-stats");
  if (storedstats) {
    stats = storedstats;
    displayStats()
  }

  speedSlider = createSlider(20, 1000, 500, 1);
  speedSlider.hide();
  startOver();
}

function handleAuto() {
  autoMode = !autoMode;
  if (autoMode) {
    pickDoor();
  } else {
    autoButton.html("auto run");
  }
  startOver();
}

function pickDoor() {
  if (state === "PICK") {
    state = "REVEAL";
    if (autoMode) {
      pickedDoor = random(doors);
      autoButton.html("stop autorun");
    } else {
      pickedDoor = this;
    }
    pickedDoor.style("background-color", "#AAF");
    reveal();
  }
}

function reveal() {
  const options = [];
  for (let i = 0; i < doors.length; i++) {
    const door = doors[i];
    if (i !== pickedDoor.index && door.prize !== "🚂") {
      options.push(door);
    }
  }

  revealedDoor = random(options);
  revealedDoor.html(revealedDoor.prize);

  if (!autoMode) {
    switchButton.style("display", "inline");
    stayButton.style("display", "inline");
    outcomeP.html("");
  } else {
    if (random(1) < 0.5) {
      timeoutid = setTimeout(playerSwitch, getDelayValue());
    } else {
      timeoutid = setTimeout(playerStay, getDelayValue());
    }
  }

  if (!autoMode) outcomeP.html("");
}

function getDelayValue() {
  return speedSlider.elt.max - speedSlider.value();
}

function playerSwitch() {
  stats.totalSwitchPlays++;

  let newPick;
  for (let i = 0; i < doors.length; i++) {
    let door = doors[i];
    if (door !== pickedDoor && door !== revealedDoor) {
      newPick = door;
      break;
    }
  }
  pickedDoor = newPick;
  if (autoMode) {
    outcomeP.html("Switch!");
    timeoutid = setTimeout(() => checkWin(true), getDelayValue());
  } else {
    checkWin(true);
  }
}

function playerStay() {
  stats.totalStayPlays++;
  if (autoMode) {
    outcomeP.html("Stay!");
    timeoutid = setTimeout(() => checkWin(false), getDelayValue());
  } else {
    checkWin(false);
  }
}

function displayStats() {
  let switchRate = nf((100 * stats.totalSwitchWins) / stats.totalSwitchPlays, 2, 2) + "%";
  let stayRate = nf((100 * stats.totalStayWins) / stats.totalStayPlays, 1, 2) + "%";
  if (stats.totalSwitchPlays === 0) switchRate = "n/a";
  if (stats.totalStayPlays === 0) stayRate = "n/a";

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
    door.style("background-color", "#AAA");
  }

  if (pickedDoor.prize === "🚂") {
    outcomeP.html("You win!");
    pickedDoor.style("background-color", "#AFA");

    if (playerSwitch) {
      stats.totalSwitchWins++;
    } else {
      stats.totalStayWins++;
    }
  } else {
    outcomeP.html("You lose!");
    pickedDoor.style("background-color", "#FAA");
  }
  displayStats();

  if (!autoMode) {
    playAgain.style("display", "inline");
    autoButton.html("auto run");
  } else {
    timeoutid = setTimeout(startOver, getDelayValue());
  }

  storeItem("Montey-Hall-stats", stats);
}