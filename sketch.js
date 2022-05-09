const doors = [];
let state = "PICK";
let pickedDoor;
let revealedDoor;
let switchButton, stayButton, playAgain;
let outcomeP;
let timeoutid;

let resultsP;

let totalSwitchPlays = 0;
let totalStayPlays = 0;

let totalSwitchWins = 0;
let totalStayWins = 0;

let autoMode = false;
let autoButton;

let delay = 5;

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

  if (autoMode) timeoutid = setTimeout(pickDoor, delay);
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
  startOver();

  resultsP = createElement("pre", "");

  createElement("br");
  autoButton = createButton("auto run");
  autoButton.mousePressed(handleAuto);
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
      timeoutid = setTimeout(playerSwitch, delay);
    } else {
      timeoutid = setTimeout(playerStay, delay);
    }
  }
}

function playerSwitch() {
  totalSwitchPlays++;

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
    timeoutid = setTimeout(() => checkWin(true), delay);
  } else {
    checkWin(true);
  }
}

function playerStay() {
  totalStayPlays++;
  if (autoMode) {
    outcomeP.html("Stay!");
    timeoutid = setTimeout(() => checkWin(false), delay);
  } else {
    checkWin(false);
  }
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
      totalSwitchWins++;
    } else {
      totalStayWins++;
    }
  } else {
    outcomeP.html("You lose!");
    pickedDoor.style("background-color", "#FAA");
  }

  let switchRate = nf((100 * totalSwitchWins) / totalSwitchPlays, 2, 2) + "%";
  let stayRate = nf((100 * totalStayWins) / totalStayPlays, 1, 2) + "%";
  if (totalSwitchPlays === 0) switchRate = "n/a";
  if (totalStayPlays === 0) stayRate = "n/a";

  resultsP.html(
    `Total Switches:   ${totalSwitchPlays}
Switch Win Rate:  ${switchRate}

Total Stays:      ${totalStayPlays}
Stay Win Rate:    ${stayRate}`
  );

  if (!autoMode) {
    playAgain.style("display", "inline");
    autoButton.html("auto run");
  } else {
    timeoutid = setTimeout(startOver, delay);
  }
}