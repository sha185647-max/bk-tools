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
    show("resizeInfo", "Original size: " + resizeOriginalImage.naturalWidth + " × " + resizeOriginalImage.naturalHeight + " px");
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
    show("resizeInfo", "Image resized successfully: " + width + " × " + height + " px.");
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
