const root = document.documentElement;
const colorA = document.querySelector("#colorA");
const colorB = document.querySelector("#colorB");
const swatchA = document.querySelector("#swatchA");
const swatchB = document.querySelector("#swatchB");
const refreshButton = document.querySelector("#refreshButton");

function randomHexColor() {
  return `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0")
    .toUpperCase()}`;
}

function applyGradient() {
  const first = randomHexColor();
  const second = randomHexColor();

  root.style.setProperty("--color-a", first);
  root.style.setProperty("--color-b", second);
  colorA.textContent = first;
  colorB.textContent = second;
  swatchA.style.background = first;
  swatchB.style.background = second;
}

refreshButton.addEventListener("click", applyGradient);
applyGradient();
