const scanBtn = document.getElementById("scanBtn");
const scanResult = document.getElementById("scanResult");
scanBtn.addEventListener("click", () => {
const messages = [
"Scan result: RapCat shows strong world-building potential and high 
narrative depth.",
"Scan result: The brand has rare myth-building energy and strong visual 
campaign value.",
"Scan result: This artist profile performs strongly in identity, 
storytelling, and expansion."
];
const randomIndex = Math.floor(Math.random() * messages.length);
scanResult.textContent = messages[randomIndex];
});