const nftCards = document.querySelectorAll(".nft-card");
const nftDetails = document.getElementById("nftDetails");
const connectWalletBtn = document.getElementById("connectWalletBtn");
const disconnectWalletBtn = document.getElementById("disconnectWalletBtn");
const walletStatus = document.getElementById("walletStatus");
let fakeWalletConnected = false;
function updateWalletUI() {
walletStatus.textContent = fakeWalletConnected
? "Wallet connected: 0xRAPC...7CAT"
: "No wallet connected";
}
connectWalletBtn.addEventListener("click", () => {
fakeWalletConnected = true;
updateWalletUI();
});
disconnectWalletBtn.addEventListener("click", () => {
fakeWalletConnected = false;
updateWalletUI();
});
nftCards.forEach(card => {
const button = card.querySelector(".buy-btn");
button.addEventListener("click", () => {
nftDetails.innerHTML = `
<h3>${card.dataset.name}</h3>
<p><strong>Price:</strong> ${card.dataset.price}</p>
<p><strong>Rarity:</strong> ${card.dataset.rarity}</p>
<p><strong>Utility:</strong> ${card.dataset.utility}</p>
<p><strong>Wallet Status:</strong> ${fakeWalletConnected ? "Connected and 
ready" : "Connect wallet first"}</p>
`;
});
});
updateWalletUI();