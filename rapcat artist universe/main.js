const counters = [
{ id: "songsCount", target: 4 },
{ id: "signalCount", target: 108 },
{ id: "vaultCount", target: 6 }
];
function animateCounter(elementId, target) {
const element = document.getElementById(elementId);
let current = 0;
const step = Math.max(1, Math.ceil(target / 50));
const interval = setInterval(() => {
current += step;
if (current >= target) {
current = target;
clearInterval(interval);
}
element.textContent = current;
}, 30);
}
window.addEventListener("DOMContentLoaded", () => {
counters.forEach(counter => animateCounter(counter.id, counter.target));
});