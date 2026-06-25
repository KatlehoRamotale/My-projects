const oracleBtn = document.getElementById("oracleBtn");
const oracleMessage = document.getElementById("oracleMessage");
const starForm = document.getElementById("starForm");
const visitorName = document.getElementById("visitorName");
const visitorMessage = document.getElementById("visitorMessage");
const memoryWall = document.getElementById("memoryWall");
const oracleMessages = [
"The universe says: build the world before the crowd arrives.",
"The signal says: your mystique is part of your power.",
"The ancestors whisper: move with patience, but never with doubt.",
"The stars reply: let every release deepen the myth."
];
function loadMessages() {
const notes = JSON.parse(localStorage.getItem("rapcatStarMessages")) || [];
memoryWall.innerHTML = "";
notes.forEach(note => {
const card = document.createElement("div");
card.className = "star-note";
card.innerHTML = `<strong>${note.name}</strong><p>${note.message}</p>`;
memoryWall.appendChild(card);
});
}
oracleBtn.addEventListener("click", () => {
const randomIndex = Math.floor(Math.random() * oracleMessages.length);
oracleMessage.textContent = oracleMessages[randomIndex];
});
starForm.addEventListener("submit", (event) => {
event.preventDefault();
const newNote = {
name: visitorName.value.trim(),
message: visitorMessage.value.trim()
};
if (!newNote.name || !newNote.message) return;
const notes = JSON.parse(localStorage.getItem("rapcatStarMessages")) || [];
notes.unshift(newNote);
localStorage.setItem("rapcatStarMessages", JSON.stringify(notes));
starForm.reset();
loadMessages();
});
window.addEventListener("DOMContentLoaded", loadMessages);