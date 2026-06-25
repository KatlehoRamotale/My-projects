const songCards = document.querySelectorAll(".song-card");
const songDetails = document.getElementById("songDetails");
songCards.forEach(card => {
card.addEventListener("click", () => {
const title = card.dataset.title;
const role = card.dataset.role;
const energy = card.dataset.energy;
songDetails.innerHTML = `
<h3>${title}</h3>
<p><strong>Strategic Role:</strong> ${role}</p>
<p><strong>Energy:</strong> ${energy}</p>
<p>This is where you can later add cover art, streaming links, lyrics, 
visuals, and campaign notes.</p>
`;
});
});