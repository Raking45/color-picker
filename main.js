// Helper functions
const hslToHex = (h, s, l) => {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n =>
    Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
  return `#${[f(0), f(8), f(4)].map(x => x.toString(16).padStart(2, '0')).join('')}`;
};

const hexToRgb = hex => {
  const bigint = parseInt(hex.slice(1), 16);
  return [bigint >> 16, (bigint >> 8) & 255, bigint & 255];
};

const rgbToHsl = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) h = s = 0;
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = ((b - r) / d + 2); break;
      case b: h = ((r - g) / d + 4); break;
    }
    h *= 60;
  }
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
};

// DOM elements
const baseColorInput = document.getElementById("basecolor");
const hueRange = document.getElementById("hueRange");
const saturationRange = document.getElementById("saturationRange");
const lightnessRange = document.getElementById("lightnessRange");

const hueValue = document.getElementById("hueValue");
const saturationValue = document.getElementById("saturationValue");
const lightnessValue = document.getElementById("lightnessValue");

const currentColor = document.getElementById("currentColor");
const hexValue = document.getElementById("hexValue");
const rgbValue = document.getElementById("rgbValue");
const rgbaValue = document.getElementById("rgbaValue");
const hslValue = document.getElementById("hslValue");
const hslaValue = document.getElementById("hslaValue");

const generateScheme = document.getElementById("generateScheme");
const schemeType = document.getElementById("schemeType");
const colorScheme = document.getElementById("colorScheme");

const saveColor = document.getElementById("saveColor");
const clearSaved = document.getElementById("clearSaved");
const savedColors = document.getElementById("savedColors");

function updateDisplay(h, s, l) {
  hueValue.innerHTML = `${h}&deg;`;
  saturationValue.innerHTML = `${s}%`;
  lightnessValue.innerHTML = `${l}%`;

  const hex = hslToHex(h, s, l);
  const [r, g, b] = hexToRgb(hex);
  const rgb = `rgb(${r},${g},${b})`;
  const rgba = `rgba(${r},${g},${b},1)`;
  const hslStr = `hsl(${h},${s}%,${l}%)`;
  const hsla = `hsla(${h},${s}%,${l}%,1)`;

  currentColor.style.background = hex;
  currentColor.textContent = "Current Color";

  hexValue.innerHTML = `&#9839;${hex.slice(1)}`;
  rgbValue.textContent = rgb;
  rgbaValue.textContent = rgba;
  hslValue.innerHTML = hslStr.replace('%', '&#37;').replace('%', '&#37;');
  hslaValue.innerHTML = hsla.replace('%', '&#37;').replace('%', '&#37;');
  baseColorInput.value = hex;
}

function generateColorScheme(h, s, l) {
  const colors = [];
  switch (schemeType.value) {
    case "monochromatic":
      for (let i = -2; i <= 2; i++) colors.push(hslToHex(h, s, Math.min(100, Math.max(0, l + i * 10))));
      break;
    case "analogous":
      for (let i = -2; i <= 2; i++) colors.push(hslToHex((h + i * 30 + 360) % 360, s, l));
      break;
    case "complementary":
      colors.push(hslToHex(h, s, l));
      colors.push(hslToHex((h + 180) % 360, s, l));
      colors.push(hslToHex((h + 170) % 360, s, l));
      colors.push(hslToHex((h + 190) % 360, s, l));
      colors.push(hslToHex(h, s, l));
      break;
    case "triadic":
      for (let i = 0; i < 3; i++) colors.push(hslToHex((h + i * 120) % 360, s, l));
      while (colors.length < 5) colors.push(hslToHex((h + Math.random() * 360) % 360, s, l));
      break;
    case "tetradic":
      for (let i = 0; i < 4; i++) colors.push(hslToHex((h + i * 90) % 360, s, l));
      colors.push(hslToHex(h, s, l));
      break;
  }

  colorScheme.innerHTML = colors
    .map(c => `<div class="swatch" style="background:${c}">&#9839;${c.slice(1)}</div>`)
    .join("");
}

function saveCurrentColor() {
  const hex = baseColorInput.value;
  const div = document.createElement("div");
  div.className = "saved-item";
  div.style.background = hex;
  div.innerHTML = `&#9839;${hex.slice(1)}`;
  savedColors.appendChild(div);
}

function clearSavedColors() {
  savedColors.innerHTML = "";
}

// Event Listeners
[hueRange, saturationRange, lightnessRange].forEach(input =>
  input.addEventListener("input", () => {
    const h = +hueRange.value;
    const s = +saturationRange.value;
    const l = +lightnessRange.value;
    updateDisplay(h, s, l);
  })
);

baseColorInput.addEventListener("input", () => {
  const [r, g, b] = hexToRgb(baseColorInput.value);
  const [h, s, l] = rgbToHsl(r, g, b);
  hueRange.value = h;
  saturationRange.value = s;
  lightnessRange.value = l;
  updateDisplay(h, s, l);
});

generateScheme.addEventListener("click", () => {
  const h = +hueRange.value;
  const s = +saturationRange.value;
  const l = +lightnessRange.value;
  generateColorScheme(h, s, l);
});

document.querySelectorAll(".copy-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const value = btn.previousElementSibling.textContent;
    navigator.clipboard.writeText(value);
    btn.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => (btn.innerHTML = '<i class="far fa-copy"></i>'), 1000);
  });
});

saveColor.addEventListener("click", saveCurrentColor);
clearSaved.addEventListener("click", clearSavedColors);

// Initialize
updateDisplay(+hueRange.value, +saturationRange.value, +lightnessRange.value);
generateColorScheme(+hueRange.value, +saturationRange.value, +lightnessRange.value);
