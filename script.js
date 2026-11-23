"use strict";

function get(id) {
  return document.getElementById(id);
}

function show(id, message) {
  get(id).textContent = message;
}

function setDownloadLink(id, blob, filename) {
  const link = get(id);
  if (link.dataset.url) URL.revokeObjectURL(link.dataset.url);
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  link.dataset.url = url;
  link.hidden = false;
}

// 1. WORD COUNTER
function countWords() {
  const text = get("words").value;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  show("wordResult", "Words: " + words);
  show("charResult", "Characters: " + text.length);
  show("charNoSpace", "Without spaces: " + text.replace(/\s/g, "").length);
}
get("words").addEventListener("input", countWords);
get("clearWords").addEventListener("click", function () {
  get("words").value = "";
  countWords();
});

// 2. AGE CALCULATOR
function calculateAge() {
  const value = get("dob").value;
  if (!value) {
    show("ageResult", "Please select your date of birth.");
    return;
  }

  const [year, month, day] = value.split("-").map(Number);
  const today = new Date();
  const birth = new Date(year, month - 1, day);

  if (
    birth.getFullYear() !== year ||
    birth.getMonth() !== month - 1 ||
    birth.getDate() !== day ||
    birth > today
  ) {
    show("ageResult", "Please enter a valid date.");
    return;
  }

  let years = today.getFullYear() - year;
  let months = today.getMonth() - (month - 1);
  let days = today.getDate() - day;

  if (days < 0) {
    months--;
    days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  show("ageResult", "Your Age: " + years + " Years, " + months + " Months, " + days + " Days");
}
get("ageBtn").addEventListener("click", calculateAge);

const todayDate = new Date();
get("dob").max = [
  todayDate.getFullYear(),
  String(todayDate.getMonth() + 1).padStart(2, "0"),
  String(todayDate.getDate()).padStart(2, "0")
].join("-");

// 3. CALCULATOR
function calculate() {
  const x = get("num1").value;
  const y = get("num2").value;

  if (x === "" || y === "") {
    show("calcResult", "Please enter both numbers.");
    return;
  }

  const a = Number(x);
  const b = Number(y);
  const op = get("operation").value;

  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    show("calcResult", "Please enter valid numbers.");
    return;
  }
  if (op === "/" && b === 0) {
    show("calcResult", "Cannot divide by zero.");
    return;
  }

  let result;
  switch (op) {
    case "+": result = a + b; break;
    case "-": result = a - b; break;
    case "*": result = a * b; break;
    case "/": result = a / b; break;
    default:
      show("calcResult", "Unknown operation.");
      return;
  }
  show("calcResult", "Result: " + result);
}
get("calcBtn").addEventListener("click", calculate);

// 4. PERCENTAGE
function percentage() {
  const p = get("part").value;
  const t = get("total").value;

  if (p === "" || t === "") {
    show("percentResult", "Please enter both numbers.");
    return;
  }

  const part = Number(p);
  const total = Number(t);
  if (!Number.isFinite(part) || !Number.isFinite(total) || total === 0) {
    show("percentResult", "Enter valid numbers. Total cannot be zero.");
    return;
  }

  show("percentResult", "Percentage: " + (part / total * 100).toFixed(2) + "%");
}
get("percentBtn").addEventListener("click", percentage);

// 5. PASSWORD GENERATOR
function randomIndex(max) {
  const limit = Math.floor(4294967296 / max) * max;
  const random = new Uint32Array(1);
  do {
    crypto.getRandomValues(random);
  } while (random[0] >= limit);
  return random[0] % max;
}

function generatePassword() {
  const length = Number(get("passLength").value);
  if (!Number.isInteger(length) || length < 4 || length > 64) {
    show("passwordMessage", "Choose length between 4 and 64.");
    return;
  }

  const groups = [];
  if (get("uppercase").checked) groups.push("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
  if (get("lowercase").checked) groups.push("abcdefghijklmnopqrstuvwxyz");
  if (get("numbers").checked) groups.push("0123456789");
  if (get("symbols").checked) groups.push("!@#$%^&*()-_=+");

  if (groups.length === 0) {
    show("passwordMessage", "Select at least one character type.");
    return;
  }
  if (length < groups.length) {
    show("passwordMessage", "Length must be at least the number of selected types.");
    return;
  }

  const chars = groups.map(group => group[randomIndex(group.length)]);
  const all = groups.join("");

  while (chars.length < length) {
    chars.push(all[randomIndex(all.length)]);
  }

  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  get("passwordResult").value = chars.join("");
  show("passwordMessage", "Password generated successfully.");
}
get("passwordBtn").addEventListener("click", generatePassword);

async function copyPassword() {
  const field = get("passwordResult");
  if (!field.value) {
    show("passwordMessage", "Generate a password first.");
    return;
  }

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(field.value);
    } else {
      field.focus();
      field.select();
      if (!document.execCommand("copy")) throw new Error("Copy failed");
    }
    show("passwordMessage", "Password copied successfully.");
  } catch (error) {
    show("passwordMessage", "Copy failed. Select and copy manually.");
  }
}
get("copyBtn").addEventListener("click", copyPassword);

// 6. UNIT CONVERTER
function convertUnit() {
  const input = get("unitValue").value;
  const type = get("unitType").value;

  if (input === "") {
    show("unitResult", "Please enter a value.");
    return;
  }
  const v = Number(input);
  if (!Number.isFinite(v)) {
    show("unitResult", "Enter a valid number.");
    return;
  }

  let result;
  let unit;
  switch (type) {
    case "km": result = v * 0.621371; unit = "Miles"; break;
    case "mile": result = v * 1.609344; unit = "Kilometers"; break;
    case "kg": result = v * 2.2046226218; unit = "Pounds"; break;
    case "lb": result = v * 0.45359237; unit = "Kilograms"; break;
    case "cm": result = v / 2.54; unit = "Inches"; break;
    case "inch": result = v * 2.54; unit = "Centimeters"; break;
    case "c": result = v * 9 / 5 + 32; unit = "Fahrenheit"; break;
    case "f": result = (v - 32) * 5 / 9; unit = "Celsius"; break;
    default:
      show("unitResult", "Unknown conversion.");
      return;
  }
  show("unitResult", "Result: " + Number(result.toFixed(4)) + " " + unit);
}
get("convertBtn").addEventListener("click", convertUnit);

// 7. QR CODE GENERATOR
get("qrBtn").addEventListener("click", function () {
  const text = get("qrText").value.trim();
  const output = get("qrOutput");
  const download = get("qrDownload");
  output.innerHTML = "";
  download.hidden = true;

  if (!text) {
    show("qrMessage", "Enter text or a website address first.");
    return;
  }
  if (typeof QRCode === "undefined") {
    show("qrMessage", "QR library did not load. Check your internet connection and refresh.");
    return;
  }

  new QRCode(output, {
    text: text,
    width: 220,
    height: 220,
    colorDark: "#172554",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });

  show("qrMessage", "QR code created. Scan it to test.");
  download.hidden = false;
});

get("qrDownload").addEventListener("click", function () {
  const output = get("qrOutput");
  const canvas = output.querySelector("canvas");
  const img = output.querySelector("img");
  let dataUrl = "";

  if (canvas) dataUrl = canvas.toDataURL("image/png");
  else if (img) dataUrl = img.src;

  if (!dataUrl) {
    show("qrMessage", "Generate a QR code first.");
    return;
  }

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = "bk-tools-qr-code.png";
  link.click();
});

// Helpers for browser image tools
function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Please choose a valid image file."));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This image could not be opened."));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error("Could not create image. Try another format."));
    }, type, quality);
  });
}

// 8. IMAGE COMPRESSOR
get("compressQuality").addEventListener("input", function () {
  show("qualityValue", get("compressQuality").value + "%");
});

get("compressBtn").addEventListener("click", async function () {
  const file = get("compressFile").files[0];
  const button = get("compressBtn");
  get("compressDownload").hidden = true;

  if (!file) {
    show("compressInfo", "Choose an image first.");
    return;
  }

  button.disabled = true;
  show("compressInfo", "Compressing image...");

  try {
    const img = await loadImageFromFile(file);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const quality = Number(get("compressQuality").value) / 100;
    const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await canvasToBlob(canvas, outputType, quality);
    const extension = outputType === "image/png" ? "png" : "jpg";
    const originalKB = (file.size / 1024).toFixed(1);
    const newKB = (blob.size / 1024).toFixed(1);
    const saved = file.size > 0 ? ((1 - blob.size / file.size) * 100).toFixed(1) : "0";

    setDownloadLink("compressDownload", blob, "bk-compressed-image." + extension);
    show("compressInfo", "Original: " + originalKB + " KB | New: " + newKB + " KB | Size change: " + saved + "%");
  } catch (error) {
    show("compressInfo", error.message || "Compression failed.");
  } finally {
    button.disabled = false;
  }
});

// 9. PDF MERGE AND SPLIT
function checkPdfLibrary() {
  return window.PDFLib && window.PDFLib.PDFDocument;
}

get("mergeBtn").addEventListener("click", async function () {
  const files = Array.from(get("mergeFiles").files);
  const button = get("mergeBtn");
  get("mergeDownload").hidden = true;

  if (files.length < 2) {
    show("mergeMessage", "Choose at least two PDF files.");
    return;
  }
  if (!checkPdfLibrary()) {
    show("mergeMessage", "PDF library did not load. Check internet and refresh.");
    return;
  }

  button.disabled = true;
  show("mergeMessage", "Merging PDFs...");

  try {
    const merged = await PDFLib.PDFDocument.create();

    for (const file of files) {
      if (file.type && file.type !== "application/pdf") {
        throw new Error(file.name + " is not a PDF file.");
      }
      const bytes = await file.arrayBuffer();
      const source = await PDFLib.PDFDocument.load(bytes);
      const pages = await merged.copyPages(source, source.getPageIndices());
      pages.forEach(page => merged.addPage(page));
    }

    const bytes = await merged.save();
    const blob = new Blob([bytes], { type: "application/pdf" });
    setDownloadLink("mergeDownload", blob, "bk-tools-merged.pdf");
    show("mergeMessage", "PDF files merged successfully.");
  } catch (error) {
    show("mergeMessage", "Could not merge PDFs: " + (error.message || "Unknown error"));
  } finally {
    button.disabled = false;
  }
});

get("splitBtn").addEventListener("click", async function () {
  const file = get("splitFile").files[0];
  const button = get("splitBtn");
  const downloads = get("splitDownloads");
  downloads.innerHTML = "";

  if (!file) {
    show("splitMessage", "Choose a PDF file first.");
    return;
  }
  if (!checkPdfLibrary()) {
    show("splitMessage", "PDF library did not load. Check internet and refresh.");
    return;
  }

  button.disabled = true;
  show("splitMessage", "Splitting PDF...");

  try {
    const sourceBytes = await file.arrayBuffer();
    const sourcePdf = await PDFLib.PDFDocument.load(sourceBytes);
    const pageCount = sourcePdf.getPageCount();

    if (pageCount === 0) throw new Error("This PDF has no pages.");

    for (let i = 0; i < pageCount; i++) {
      const single = await PDFLib.PDFDocument.create();
      const [page] = await single.copyPages(sourcePdf, [i]);
      single.addPage(page);
      const bytes = await single.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "bk-tools-page-" + (i + 1) + ".pdf";
      link.textContent = "Download Page " + (i + 1);
      link.addEventListener("click", function () {
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      });
      downloads.appendChild(link);
    }

    show("splitMessage", "Done! Created " + pageCount + " separate PDF page(s). Click each download link.");
  } catch (error) {
    show("splitMessage", "Could not split PDF: " + (error.message || "Unknown error"));
  } finally {
    button.disabled = false;
  }
});

// 10. TYPING SPEED TEST
const typingText = get("typingSample").textContent.trim();
let typingActive = false;
let typingRemaining = 60;
let typingTimer = null;
let typingStartedAt = 0;

function updateTypingStats() {
  const entered = get("typingInput").value;
  let correct = 0;

  for (let i = 0; i < entered.length; i++) {
    if (entered[i] === typingText[i]) correct++;
  }

  const elapsedMinutes = Math.max((60 - typingRemaining) / 60, 1 / 60);
  const wordsTyped = entered.trim() ? entered.trim().split(/\s+/).length : 0;
  const wpm = Math.round(wordsTyped / elapsedMinutes);
  const accuracy = entered.length ? Math.round(correct / entered.length * 100) : 100;

  show("typingWpm", "WPM: " + (typingActive || typingRemaining < 60 ? wpm : 0));
  show("typingAccuracy", "Accuracy: " + accuracy + "%");
}

function stopTypingTest() {
  typingActive = false;
  clearInterval(typingTimer);
  get("typingInput").disabled = true;
  get("typingStart").disabled = false;
  updateTypingStats();
  show("typingMessage", "Test finished! Your final speed and accuracy are shown above.");
}

function startTypingTest() {
  clearInterval(typingTimer);
  typingRemaining = 60;
  typingActive = true;
  typingStartedAt = Date.now();

  get("typingInput").value = "";
  get("typingInput").disabled = false;
  get("typingInput").focus();
  get("typingStart").disabled = true;

  show("typingTime", "Time: 60s");
  show("typingWpm", "WPM: 0");
  show("typingAccuracy", "Accuracy: 100%");
  show("typingMessage", "Start typing the sample above!");

  typingTimer = setInterval(function () {
    typingRemaining = Math.max(0, 60 - Math.floor((Date.now() - typingStartedAt) / 1000));
    show("typingTime", "Time: " + typingRemaining + "s");
    updateTypingStats();

    if (typingRemaining <= 0) stopTypingTest();
  }, 250);
}

get("typingStart").addEventListener("click", startTypingTest);

get("typingReset").addEventListener("click", function () {
  clearInterval(typingTimer);
  typingActive = false;
  typingRemaining = 60;
  get("typingInput").value = "";
  get("typingInput").disabled = true;
  get("typingStart").disabled = false;
  show("typingTime", "Time: 60s");
  show("typingWpm", "WPM: 0");
  show("typingAccuracy", "Accuracy: 100%");
  show("typingMessage", "Press Start Test when ready.");
});

get("typingInput").addEventListener("input", function () {
  if (!typingActive) return;
  updateTypingStats();
  if (get("typingInput").value.length >= typingText.length) {
    stopTypingTest();
  }
});

// 11. IMAGE RESIZER
let resizeOriginalImage = null;

get("resizeFile").addEventListener("change", async function () {
  const file = this.files[0];
  get("resizeDownload").hidden = true;

  if (!file) {
    resizeOriginalImage = null;
    return;
  }

  try {
    resizeOriginalImage = await loadImageFromFile(file);
    get("resizeWidth").value = resizeOriginalImage.naturalWidth;
    get("resizeHeight").value = resizeOriginalImage.naturalHeight;
    show("resizeInfo", "Original size: " + resizeOriginalImage.naturalWidth + " Ã— " + resizeOriginalImage.naturalHeight + " px");
  } catch (error) {
    resizeOriginalImage = null;
    show("resizeInfo", error.message);
  }
});

get("resizeWidth").addEventListener("input", function () {
  if (!resizeOriginalImage || !get("keepRatio").checked) return;
  const width = Number(this.value);
  if (width > 0) {
    get("resizeHeight").value = Math.round(width * resizeOriginalImage.naturalHeight / resizeOriginalImage.naturalWidth);
  }
});

get("resizeHeight").addEventListener("input", function () {
  if (!resizeOriginalImage || !get("keepRatio").checked) return;
  const height = Number(this.value);
  if (height > 0) {
    get("resizeWidth").value = Math.round(height * resizeOriginalImage.naturalWidth / resizeOriginalImage.naturalHeight);
  }
});

get("resizeBtn").addEventListener("click", async function () {
  get("resizeDownload").hidden = true;

  if (!resizeOriginalImage) {
    show("resizeInfo", "Choose an image first.");
    return;
  }

  const width = Number(get("resizeWidth").value);
  const height = Number(get("resizeHeight").value);

  if (!Number.isInteger(width) || !Number.isInteger(height) ||
      width < 1 || height < 1 || width > 10000 || height > 10000) {
    show("resizeInfo", "Enter width and height between 1 and 10000 pixels.");
    return;
  }

  const button = get("resizeBtn");
  button.disabled = true;

  try {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(resizeOriginalImage, 0, 0, width, height);

    const blob = await canvasToBlob(canvas, "image/png");
    setDownloadLink("resizeDownload", blob, "bk-resized-image.png");
    show("resizeInfo", "Image resized successfully: " + width + " Ã— " + height + " px.");
  } catch (error) {
    show("resizeInfo", error.message || "Could not resize image.");
  } finally {
    button.disabled = false;
  }
});

// WHATSAPP CONTACT FORM
get("contactForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const name = get("contactName").value.trim();
  const message = get("contactMessage").value.trim();

  if (!name || !message) return;

  const text = "Hello BK TOOLS!\nName: " + name + "\nMessage: " + message;
  const url = "https://wa.me/923177459765?text=" + encodeURIComponent(text);
  window.open(url, "_blank", "noopener,noreferrer");
});

/* =========================================================
   BK TOOLS - ADDITIONAL TOOLS
   Existing 11 tools above are preserved.
   This section adds functionality for the new tool sections.
========================================================= */
(function () {
  "use strict";

  const byId = id => document.getElementById(id);
  const section = id => byId(id);
  const text = (el, value) => { if (el) el.textContent = value; };
  const first = (root, selectors) => {
    for (const selector of selectors) {
      const found = root.querySelector(selector);
      if (found) return found;
    }
    return null;
  };
  const controls = root => Array.from(root.querySelectorAll("input, textarea, select"));
  const outputFor = root => first(root, [
    "[id$='Result']", "[id$='Info']", "[id$='Message']",
    ".result", ".tool-result", "[aria-live='polite']"
  ]);
  const buttonFor = root => first(root, ["button", "input[type='button']", "input[type='submit']"]);
  const downloadBlob = (blob, filename, label) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.textContent = label || ("Download " + filename);
    a.className = "download-link";
    a.style.display = "inline-block";
    a.style.marginTop = "10px";
    return a;
  };
  const attach = (id, handler) => {
    const root = section(id);
    if (!root) return;
    const button = buttonFor(root);
    const out = outputFor(root);
    if (!button || !out) return;
    button.addEventListener("click", async () => {
      try {
        out.replaceChildren();
        const result = await handler(root, controls(root), out);
        if (result instanceof Node) out.appendChild(result);
        else if (result !== undefined && result !== null) text(out, String(result));
      } catch (err) {
        text(out, err && err.message ? err.message : "Something went wrong. Please try again.");
      }
    });
  };
  const fileInput = root => root.querySelector("input[type='file']");
  const textInput = root => first(root, ["textarea", "input[type='text']", "input:not([type])"]);
  const selectValue = (root, fallback) => {
    const s = root.querySelector("select");
    return s ? s.value : fallback;
  };
  const loadImage = file => new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) return reject(new Error("Please choose a valid image."));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not open this image.")); };
    img.src = url;
  });
  const canvasBlob = (canvas, type, quality) => new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Could not create the output file.")), type, quality);
  });

  // Case Converter - the HTML uses four separate buttons, not a select.
  const caseRoot = section("case-converter");
  if (caseRoot) {
    const caseInput = byId("caseText");
    const caseOutput = byId("caseResult");

    const convertCase = mode => {
      if (!caseInput || !caseOutput) return;
      const value = caseInput.value;
      let result = value;

      if (mode === "upper") {
        result = value.toUpperCase();
      } else if (mode === "lower") {
        result = value.toLowerCase();
      } else if (mode === "title") {
        result = value.toLowerCase().replace(/\b([a-z])/g, letter => letter.toUpperCase());
      } else if (mode === "sentence") {
        result = value.toLowerCase().replace(/(^\s*[a-z]|[.!?]\s+[a-z])/g,
          match => match.toUpperCase());
      }

      caseOutput.value = result;
      caseOutput.textContent = result;
    };

    const upperBtn = byId("uppercaseBtn");
    const lowerBtn = byId("lowercaseBtn");
    const titleBtn = byId("titlecaseBtn");
    const sentenceBtn = byId("sentencecaseBtn");
    const copyBtn = byId("copyCaseBtn");

    if (upperBtn) upperBtn.addEventListener("click", () => convertCase("upper"));
    if (lowerBtn) lowerBtn.addEventListener("click", () => convertCase("lower"));
    if (titleBtn) titleBtn.addEventListener("click", () => convertCase("title"));
    if (sentenceBtn) sentenceBtn.addEventListener("click", () => convertCase("sentence"));

    if (copyBtn) {
      copyBtn.addEventListener("click", async () => {
        const value = caseOutput ? caseOutput.value : "";
        if (!value) return;
        try {
          await navigator.clipboard.writeText(value);
          copyBtn.textContent = "Copied!";
          window.setTimeout(() => { copyBtn.textContent = "Copy Text"; }, 1500);
        } catch (_) {
          if (caseOutput) {
            caseOutput.focus();
            caseOutput.select();
            document.execCommand("copy");
          }
        }
      });
    }
  }

  // Text Reverser
  attach("text-reverser", root => {
    const input = textInput(root);
    if (!input) throw new Error("Text input is missing.");
    return Array.from(input.value).reverse().join("");
  });

  // Duplicate Line Remover
  attach("duplicate-remover", root => {
    const input = textInput(root);
    if (!input) throw new Error("Text input is missing.");
    const lines = input.value.split(/\r?\n/);
    const seen = new Set();
    return lines.filter(line => {
      const key = line.trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).join("\n");
  });

  // Lorem Ipsum Generator
  attach("lorem-generator", root => {
    const input = root.querySelector("input[type='number']") || textInput(root);
    const count = Math.max(1, Math.min(50, Number(input && input.value) || 1));
    const paragraph = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere, erat at interdum consequat, neque lorem tincidunt ipsum, vitae facilisis justo erat sed nibh.";
    return Array.from({ length: count }, () => paragraph).join("\n\n");
  });


// Base64 encoder / decoder
attach("base64-tool", root => {
  const input = textInput(root);

  if (!input) {
    throw new Error("Text input is missing.");
  }

  const mode = selectValue(root, "encode").toLowerCase();
  const text = input.value.trim();

  // DECODE
  if (mode.includes("decode")) {
    try {
      let encoded = text
        .replace(/\s+/g, "")
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      if (!encoded || encoded.length % 4 === 1) {
        throw new Error("Invalid Base64");
      }

      encoded = encoded.replace(/=+$/, "");
      encoded += "=".repeat((4 - encoded.length % 4) % 4);

      const binary = atob(encoded);

      const bytes = Uint8Array.from(
        binary,
        character => character.charCodeAt(0)
      );

      return new TextDecoder("utf-8", {
        fatal: true
      }).decode(bytes);

    } catch (error) {
      throw new Error("Invalid Base64 text. Please check your input.");
    }
  }

  // ENCODE
  try {
    const bytes = new TextEncoder().encode(input.value);

    let binary = "";

    bytes.forEach(byte => {
      binary += String.fromCharCode(byte);
    });

    return btoa(binary);

  } catch (error) {
    throw new Error("Unable to encode text.");
  }
});


  // JSON Formatter
  attach("json-formatter", root => {
    const input = textInput(root);
    if (!input) throw new Error("JSON input is missing.");
    return JSON.stringify(JSON.parse(input.value), null, 2);
  });

  // HTML Formatter (basic indentation)
  attach("html-formatter", root => {
    const input = textInput(root);
    if (!input) throw new Error("HTML input is missing.");
    const tokens = input.value.replace(/>\s*</g, ">\n<").split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    let depth = 0;
    const voidTags = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)\b/i;
    return tokens.map(token => {
      if (/^<\//.test(token)) depth = Math.max(0, depth - 1);
      const line = "  ".repeat(depth) + token;
      const match = token.match(/^<([a-z0-9-]+)/i);
      if (match && !/^<\//.test(token) && !/^<!/.test(token) &&
          !/\/>$/.test(token) && !voidTags.test(match[1]) && !new RegExp("</" + match[1] + "\\s*>", "i").test(token)) depth++;
      return line;
    }).join("\n");
  });

  // CSS Minifier
  attach("css-minifier", root => {
    const input = textInput(root);
    if (!input) throw new Error("CSS input is missing.");
    return input.value.replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\s+/g, " ").replace(/\s*([{}:;,])\s*/g, "$1")
      .replace(/;}/g, "}").trim();
  });

  // Time Zone Converter
  attach("timezone-tool", root => {
    const inputs = controls(root);
    const dateInput = inputs.find(el => el.type === "datetime-local" || el.type === "date");
    const zoneSelect = root.querySelector("select");
    const date = dateInput && dateInput.value ? new Date(dateInput.value) : new Date();
    const zone = zoneSelect ? zoneSelect.value : "Asia/Karachi";
    if (isNaN(date.getTime())) throw new Error("Enter a valid date and time.");
    try {
      return new Intl.DateTimeFormat("en-US", {
        dateStyle: "full", timeStyle: "long", timeZone: zone
      }).format(date);
    } catch (_) {
      throw new Error("Please choose a valid time zone.");
    }
  });

  // Image to Base64
  attach("image-base64", async root => {
    const file = fileInput(root)?.files[0];
    if (!file) throw new Error("Choose an image first.");
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Could not read the image."));
      reader.readAsDataURL(file);
    });
  });

  // Image format conversion
  function imageConverter(id, mime, filename) {
    attach(id, async root => {
      const file = fileInput(root)?.files[0];
      if (!file) throw new Error("Choose an image first.");
      const img = await loadImage(file);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (mime === "image/jpeg") {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      const blob = await canvasBlob(canvas, mime, 0.92);
      return downloadBlob(blob, filename, "Download converted image");
    });
  }
  imageConverter("png-jpg", "image/jpeg", "bk-image.jpg");
  imageConverter("jpg-png", "image/png", "bk-image.png");

  // Image Cropper: uses optional x/y/width/height fields if supplied;
  // otherwise crops the centered square.
  attach("image-cropper", async root => {
    const file = fileInput(root)?.files[0];
    if (!file) throw new Error("Choose an image first.");
    const img = await loadImage(file);
    const nums = Array.from(root.querySelectorAll('input[type="number"]')).map(el => Number(el.value));
    let sx, sy, sw, sh;
    if (nums.length >= 4 && nums.every(Number.isFinite) && nums[2] > 0 && nums[3] > 0) {
      [sx, sy, sw, sh] = nums;
    } else {
      sw = sh = Math.min(img.naturalWidth, img.naturalHeight);
      sx = (img.naturalWidth - sw) / 2;
      sy = (img.naturalHeight - sh) / 2;
    }
    sx = Math.max(0, Math.min(img.naturalWidth - 1, sx));
    sy = Math.max(0, Math.min(img.naturalHeight - 1, sy));
    sw = Math.max(1, Math.min(img.naturalWidth - sx, sw));
    sh = Math.max(1, Math.min(img.naturalHeight - sy, sh));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(sw); canvas.height = Math.round(sh);
    canvas.getContext("2d").drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    return downloadBlob(await canvasBlob(canvas, "image/png"), "bk-cropped-image.png", "Download cropped image");
  });

  // PDF page counter
  attach("pdf-page-counter", async root => {
    const file = fileInput(root)?.files[0];
    if (!file) throw new Error("Choose a PDF file first.");
    if (!window.PDFLib) throw new Error("PDF library is not loaded. Refresh the page.");
    const pdf = await PDFLib.PDFDocument.load(await file.arrayBuffer());
    return "Total pages: " + pdf.getPageCount();
  });

  // Images to PDF
  attach("images-pdf", async root => {
    const files = Array.from(fileInput(root)?.files || []);
    if (!files.length) throw new Error("Choose one or more images.");
    if (!window.PDFLib) throw new Error("PDF library is not loaded. Refresh the page.");
    const pdf = await PDFLib.PDFDocument.create();
    for (const file of files) {
      const bytes = await file.arrayBuffer();
      let image;
      if (file.type === "image/png") image = await pdf.embedPng(bytes);
      else if (file.type === "image/jpeg") image = await pdf.embedJpg(bytes);
      else {
        const img = await loadImage(file);
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
        canvas.getContext("2d").drawImage(img, 0, 0);
        const jpg = await canvasBlob(canvas, "image/jpeg", 0.92);
        image = await pdf.embedJpg(await jpg.arrayBuffer());
      }
      const page = pdf.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    }
    const bytes = await pdf.save();
    return downloadBlob(new Blob([bytes], { type: "application/pdf" }), "bk-images.pdf", "Download PDF");
  });

  // PDF compressor: browser re-save / object-stream optimization only;
  // it cannot guarantee a smaller file for every PDF.
  attach("pdf-compressor", async root => {
    const file = fileInput(root)?.files[0];
    if (!file) throw new Error("Choose a PDF file first.");
    if (!window.PDFLib) throw new Error("PDF library is not loaded. Refresh the page.");
    const pdf = await PDFLib.PDFDocument.load(await file.arrayBuffer());
    const bytes = await pdf.save({ useObjectStreams: true });
    const blob = new Blob([bytes], { type: "application/pdf" });
    const before = (file.size / 1024).toFixed(1);
    const after = (blob.size / 1024).toFixed(1);
    const wrap = document.createElement("div");
    wrap.append("Original: " + before + " KB | Processed: " + after + " KB. ");
    wrap.appendChild(downloadBlob(blob, "bk-processed.pdf", "Download processed PDF"));
    return wrap;
  });

  // PDF to images requires PDF.js, which must be loaded in index.html.
  attach("pdf-images", async () => {
    if (!window.pdfjsLib) throw new Error("PDF-to-image needs PDF.js. Add the PDF.js library to index.html first.");
    throw new Error("PDF.js is detected, but the page-rendering controls need to be configured in this tool section.");
  });

  // QR Scanner requires jsQR and camera/file scan controls.
  attach("qr-scanner", async () => {
    if (!window.jsQR) throw new Error("QR Scanner needs the jsQR library added to index.html.");
    throw new Error("Add a camera or image input to the QR Scanner section to scan codes.");
  });

  // Stopwatch - use the exact IDs from index.html.
  // Do not use outputFor(): stopwatchDisplay is a <p> without aria-live.
  const swDisplay = byId("stopwatchDisplay");
  const swStart = byId("stopwatchStart");
  const swStop = byId("stopwatchStop");
  const swReset = byId("stopwatchReset");

  if (swDisplay && swStart && swStop && swReset) {
    let swStartedAt = 0;
    let swElapsed = 0;
    let swInterval = null;

    const renderStopwatch = () => {
      const elapsed = swElapsed + (swInterval ? Date.now() - swStartedAt : 0);
      const totalCentiseconds = Math.floor(elapsed / 10);
      const centiseconds = totalCentiseconds % 100;
      const totalSeconds = Math.floor(totalCentiseconds / 100);
      const seconds = totalSeconds % 60;
      const minutes = Math.floor(totalSeconds / 60) % 60;
      const hours = Math.floor(totalSeconds / 3600);
      swDisplay.textContent =
        [hours, minutes, seconds].map(n => String(n).padStart(2, "0")).join(":") +
        "." + String(centiseconds).padStart(2, "0");
    };

    swStart.addEventListener("click", () => {
      if (swInterval !== null) return;
      swStartedAt = Date.now();
      swInterval = window.setInterval(renderStopwatch, 30);
      renderStopwatch();
    });

    swStop.addEventListener("click", () => {
      if (swInterval === null) return;
      swElapsed += Date.now() - swStartedAt;
      window.clearInterval(swInterval);
      swInterval = null;
      renderStopwatch();
    });

    swReset.addEventListener("click", () => {
      if (swInterval !== null) window.clearInterval(swInterval);
      swInterval = null;
      swStartedAt = 0;
      swElapsed = 0;
      renderStopwatch();
    });

    renderStopwatch();
  }

  // Countdown Timer - Start, pause with Stop, and reset to 00:00.
  const cdMinutes = byId("countdownMinutes");
  const cdSeconds = byId("countdownSeconds");
  const cdDisplay = byId("countdownDisplay");
  const cdStart = byId("countdownStart");
  const cdStop = byId("countdownStop");
  const cdReset = byId("countdownReset");

  if (cdMinutes && cdSeconds && cdDisplay && cdStart && cdStop && cdReset) {
    let cdRemaining = 0;
    let cdEndsAt = 0;
    let cdInterval = null;

    const renderCountdown = () => {
      const minutes = Math.floor(cdRemaining / 60);
      const seconds = cdRemaining % 60;
      cdDisplay.textContent =
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");
    };

    const pauseCountdown = () => {
      if (cdInterval !== null) {
        cdRemaining = Math.max(0, Math.ceil((cdEndsAt - Date.now()) / 1000));
        window.clearInterval(cdInterval);
        cdInterval = null;
      }
      renderCountdown();
    };

    cdStart.addEventListener("click", () => {
      // If already running, don't start a second interval.
      if (cdInterval !== null) return;

      // If paused with time remaining, resume. Otherwise read the inputs.
      if (cdRemaining <= 0) {
        const mins = Number(cdMinutes.value);
        const secs = Number(cdSeconds.value);

        if (
          cdMinutes.value.trim() === "" && cdSeconds.value.trim() === ""
        ) {
          cdDisplay.textContent = "Enter minutes or seconds.";
          return;
        }
        if (
          !Number.isFinite(mins) || !Number.isFinite(secs) ||
          mins < 0 || secs < 0 || !Number.isInteger(mins) ||
          !Number.isInteger(secs) || secs > 59
        ) {
          cdDisplay.textContent = "Enter valid minutes and seconds (0â€“59 seconds).";
          return;
        }

        cdRemaining = mins * 60 + secs;
      }

      if (cdRemaining <= 0) {
        cdDisplay.textContent = "Enter a time greater than zero.";
        return;
      }

      cdEndsAt = Date.now() + cdRemaining * 1000;
      renderCountdown();

      cdInterval = window.setInterval(() => {
        cdRemaining = Math.max(0, Math.ceil((cdEndsAt - Date.now()) / 1000));
        renderCountdown();

        if (cdRemaining <= 0) {
          window.clearInterval(cdInterval);
          cdInterval = null;
          cdDisplay.textContent = "Time is up!";
          try {
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("BK TOOLS", { body: "Your countdown is complete!" });
            }
          } catch (_) {}
        }
      }, 200);
    });

    cdStop.addEventListener("click", pauseCountdown);

    cdReset.addEventListener("click", () => {
      if (cdInterval !== null) window.clearInterval(cdInterval);
      cdInterval = null;
      cdRemaining = 0;
      cdEndsAt = 0;
      cdDisplay.textContent = "00:00";
    });

    renderCountdown();
  }

  console.log("BK TOOLS: additional tool handlers initialized.");
})();

