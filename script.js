"use strict";

let board = Array(16).fill(0);
let score = 0;
let winAcknowledged = false;
let noticeOpen = false;

const boardElement = document.getElementById("board");
const scoreElement = document.getElementById("score");
const notice = document.getElementById("notice");
const noticeTitle = document.getElementById("notice-title");
const continueButton = document.getElementById("continue");
const directionButtons = document.querySelectorAll("[data-direction]");

function mergeLine(line) {
  const values = line.filter(value => value !== 0);
  const result = [];
  let gainedScore = 0;
  for (let i = 0; i < values.length; i++) {
    if (values[i] === values[i + 1]) {
      const merged = values[i] * 2;
      result.push(merged);
      gainedScore += merged;
      i++;
    } else {
      result.push(values[i]);
    }
  }
  while (result.length < line.length) result.push(0);
  return { line: result, score: gainedScore };
}

function addTile() {
  const empty = [];
  board.forEach((value, index) => { if (value === 0) empty.push(index); });
  if (empty.length === 0) return;
  const index = empty[Math.floor(Math.random() * empty.length)];
  board[index] = Math.random() < 0.9 ? 2 : 4;
}

function render() {
  boardElement.replaceChildren();
  board.forEach(value => {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.dataset.value = String(value);
    if (value >= 1024) tile.classList.add("large");
    if (value > 2048) tile.classList.add("higher");
    tile.textContent = value === 0 ? "" : String(value);
    tile.setAttribute("aria-label", value === 0 ? "빈 칸" : String(value));
    boardElement.appendChild(tile);
  });
  scoreElement.textContent = String(score);
}

function isGameOver() {
  if (board.includes(0)) return false;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const index = row * 4 + col;
      if (col < 3 && board[index] === board[index + 1]) return false;
      if (row < 3 && board[index] === board[index + 4]) return false;
    }
  }
  return true;
}

function showNotice(won) {
  noticeOpen = true;
  noticeTitle.textContent = won ? "2048 달성! 축하합니다!" : "게임 오버";
  continueButton.hidden = !won;
  notice.hidden = false;
  directionButtons.forEach(button => { button.disabled = true; });
  (won ? continueButton : document.getElementById("restart")).focus();
}

function closeNotice() {
  noticeOpen = false;
  notice.hidden = true;
  directionButtons.forEach(button => { button.disabled = false; });
}

function move(direction) {
  if (noticeOpen) return;
  const next = board.slice();
  let gainedScore = 0;
  const vertical = direction === "up" || direction === "down";
  const reverse = direction === "right" || direction === "down";
  for (let outer = 0; outer < 4; outer++) {
    const indices = Array.from({ length: 4 }, (_, inner) =>
      vertical ? inner * 4 + outer : outer * 4 + inner);
    let line = indices.map(index => board[index]);
    if (reverse) line.reverse();
    const merged = mergeLine(line);
    const result = reverse ? merged.line.slice().reverse() : merged.line;
    indices.forEach((index, offset) => { next[index] = result[offset]; });
    gainedScore += merged.score;
  }
  if (next.some((value, index) => value !== board[index])) {
    board = next;
    score += gainedScore;
    addTile();
    render();
  }
  if (!winAcknowledged && board.some(value => value >= 2048)) {
    showNotice(true);
  } else if (isGameOver()) {
    showNotice(false);
  }
}

function newGame() {
  board = Array(16).fill(0);
  score = 0;
  winAcknowledged = false;
  closeNotice();
  addTile();
  addTile();
  render();
}

const keyDirections = { ArrowUp: "up", ArrowLeft: "left", ArrowDown: "down", ArrowRight: "right" };
document.addEventListener("keydown", event => {
  if (Object.prototype.hasOwnProperty.call(keyDirections, event.key)) {
    event.preventDefault();
    move(keyDirections[event.key]);
  }
});
directionButtons.forEach(button => {
  button.addEventListener("click", () => move(button.dataset.direction));
});
document.getElementById("new-game").addEventListener("click", newGame);
document.getElementById("restart").addEventListener("click", newGame);
continueButton.addEventListener("click", () => {
  winAcknowledged = true;
  closeNotice();
  if (isGameOver()) showNotice(false);
  else document.getElementById("new-game").focus();
});

newGame();
