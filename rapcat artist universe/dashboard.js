const radarCanvas = document.getElementById("artistRadar");
const radarCtx = radarCanvas.getContext("2d");
const dealCanvas = document.getElementById("dealChart");
const dealCtx = dealCanvas.getContext("2d");
const brandCanvas = document.getElementById("brandBars");
const brandCtx = brandCanvas.getContext("2d");
const dealButtons = document.querySelectorAll(".deal-btn");
const dealSummary = document.getElementById("dealSummary");
const gigFeed = document.getElementById("gigFeed");
const gigPopup = document.getElementById("gigPopup");
const globePoints = document.querySelectorAll(".point");
const gigLocations = [
"Johannesburg, South Africa — core hometown signal active",
"Cape Town, South Africa — coastal performance node",
"Durban, South Africa — eastern route event marker",
"Lagos, Nigeria — African expansion point",
"London, United Kingdom — diaspora/global bridge",
"Dubai, UAE — luxury and international market point",
"New York, USA — culture and media impact zone"
];
function drawRadar(values, labels) {
radarCtx.clearRect(0, 0, radarCanvas.width, radarCanvas.height);
const cx = 210, cy = 160, radius = 110, steps = 5;
radarCtx.strokeStyle = "rgba(255,255,255,0.18)";
radarCtx.fillStyle = "rgba(255,255,255,0.03)";
radarCtx.lineWidth = 1;
for (let level = 1; level <= steps; level++) {
radarCtx.beginPath();
for (let i = 0; i < labels.length; i++) {
const angle = (Math.PI * 2 / labels.length) * i- Math.PI / 2;
const r = (radius / steps) * level;
const x = cx + Math.cos(angle) * r;
const y = cy + Math.sin(angle) * r;
i === 0 ? radarCtx.moveTo(x, y) : radarCtx.lineTo(x, y);
}
radarCtx.closePath();
radarCtx.stroke();
}
labels.forEach((label, i) => {
const angle = (Math.PI * 2 / labels.length) * i-Math.PI / 2;
const x = cx + Math.cos(angle) * radius;
const y = cy + Math.sin(angle) * radius;
radarCtx.beginPath();
radarCtx.moveTo(cx, cy);
radarCtx.lineTo(x, y);
radarCtx.stroke();
radarCtx.fillStyle = "#dfe7ff";
radarCtx.font = "14px Arial";
radarCtx.fillText(label, x-24, y-8);
});
radarCtx.beginPath();
values.forEach((value, i) => {
const angle = (Math.PI * 2 / labels.length) * i-Math.PI / 2;
const r = radius * (value / 100);
const x = cx + Math.cos(angle) * r;
const y = cy + Math.sin(angle) * r;
i === 0 ? radarCtx.moveTo(x, y) : radarCtx.lineTo(x, y);
});
radarCtx.closePath();
radarCtx.fillStyle = "rgba(139, 166, 255, 0.35)";
radarCtx.strokeStyle = "rgba(191, 115, 255, 0.9)";
radarCtx.lineWidth = 2;
radarCtx.fill();
radarCtx.stroke();
}
const dealData = {
independent: { values: [92, 78, 88, 96], text: "Independent gives RapCat the 
strongest identity control and collector freedom." },
distribution: { values: [84, 86, 83, 88], text: "Distribution offers strong 
reach while still protecting ownership." },
licensing: { values: [80, 90, 78, 82], text: "Licensing works well for 
selective campaigns without full surrender." },
label: { values: [68, 94, 70, 72], text:
"Full label can bring scale fast, but identity dilution risk is higher." }
};
function drawDealChart(type) {
dealCtx.clearRect(0, 0, dealCanvas.width, dealCanvas.height);
const labels = ["Control", "Reach", "Revenue", "Brand Safety"];
const values = dealData[type].values;
const baseX = 60, barWidth = 55, gap = 35, baseY = 220;
dealCtx.font = "14px Arial";
dealCtx.fillStyle = "#dfe7ff";
values.forEach((value, index) => {
const x = baseX + index * (barWidth + gap);
const height = value * 1.4;
dealCtx.fillStyle = "rgba(255,255,255,0.08)";
dealCtx.fillRect(x, 40, barWidth, 180);
dealCtx.fillStyle = "rgba(135, 163, 255, 0.85)";
dealCtx.fillRect(x, baseY-height, barWidth, height);
dealCtx.fillStyle = "#ffffff";
dealCtx.fillText(String(value), x + 12, baseY-height-10);
dealCtx.fillText(labels[index], x-8, 245);
});
dealSummary.textContent = dealData[type].text;
}
function drawBrandBars() {
const data = [
{ label: "Mystique", value: 98 },
{ label: "Lyrics", value: 95 },
{ label: "Vision", value: 92 },
{ label: "Visuals", value: 89 },
{ label: "Business", value: 83 }
];
brandCtx.clearRect(0, 0, brandCanvas.width, brandCanvas.height);
brandCtx.font = "14px Arial";
data.forEach((item, index) => {
const y = 40 + index * 48;
brandCtx.fillStyle = "#dfe7ff";
brandCtx.fillText(item.label, 20, y + 14);
brandCtx.fillStyle = "rgba(255,255,255,0.08)";
brandCtx.fillRect(120, y, 240, 22);
brandCtx.fillStyle = "rgba(191, 115, 255, 0.85)";
brandCtx.fillRect(120, y, item.value * 2.1, 22);
brandCtx.fillStyle = "#ffffff";
brandCtx.fillText(`${item.value}`, 370, y + 16);
});
}
function loadGigFeed() {
gigFeed.innerHTML = "";
gigLocations.forEach(location => {
const item = document.createElement("div");
item.className = "gig-item";
item.textContent = location;
gigFeed.appendChild(item);
});
}
function showGigPopup(point) {
gigPopup.innerHTML = `
    <h3>${point.dataset.city}, ${point.dataset.country}</h3>
    <p><strong>Venue:</strong> ${point.dataset.venue}</p>
    <p><strong>Date:</strong> ${point.dataset.date}</p>
    <p><strong>Status:</strong> ${point.dataset.status}</p>
    <p><strong>Signal:</strong> This location is active in RapCat’s global 
expansion network.</p>
  `;
}
globePoints.forEach(point => {
point.addEventListener("click", () => showGigPopup(point));
point.addEventListener("keydown", event => {
if (event.key === "Enter" || event.key === " ") {
event.preventDefault();
showGigPopup(point);
}
});
});
let activeIndex = 0;
function autoHighlight() {
globePoints.forEach(point => {
point.style.transform = "";
point.style.zIndex = "3";
});
const current = globePoints[activeIndex];
current.style.transform = "scale(1.8)";
current.style.zIndex = "5";
showGigPopup(current);
activeIndex = (activeIndex + 1) % globePoints.length;
}
dealButtons.forEach(button => {
button.addEventListener("click", () => {
dealButtons.forEach(btn => btn.classList.remove("active"));
button.classList.add("active");
drawDealChart(button.dataset.type);
});
});
drawRadar([95, 92, 83, 98, 89, 86], ["Lyrics", "Vision", "Business",
"Mystique", "Visuals", "Stage"]);
drawDealChart("independent");
drawBrandBars();
loadGigFeed();
autoHighlight();
setInterval(autoHighlight, 4000);