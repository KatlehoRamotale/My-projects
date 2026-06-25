const scene = document.getElementById("scene");
const planets = document.querySelectorAll(".planet");
const planetInfo = document.getElementById("planetInfo");
const audioPlayer = document.getElementById("audioPlayer");
window.addEventListener("mousemove", (event) => {
const x = (event.clientX / window.innerWidth- 0.5) * 18;
const y = (event.clientY / window.innerHeight- 0.5) *-18;
scene.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
});
planets.forEach(planet => {
planet.addEventListener("click", () => {
const track = planet.dataset.track;
const audio = planet.dataset.audio;
planetInfo.innerHTML = `
<h3>${track}</h3>
<p>This world carries a unique RapCat frequency. Click play to activate 
the signal.</p>
<button id="playBtn" ${audio ? "" : "disabled"}>${audio ? "Play Track" :
"No Audio Yet"}</button>
`;
currentAudio = audio;
const newPlayBtn = document.getElementById("playBtn");
newPlayBtn.addEventListener("click", () => {
if (currentAudio) {
audioPlayer.src = currentAudio;
audioPlayer.play();
}
});
});
});