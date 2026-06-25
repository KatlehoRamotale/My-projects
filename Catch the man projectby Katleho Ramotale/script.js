const man = document.getElementById("man");
const gameArea = document.getElementById("gameArea");

const currentProfileNameDisplay = document.getElementById("currentProfileName");
const currentAvatarDisplay = document.getElementById("currentAvatar");
const currentSkinNameDisplay = document.getElementById("currentSkinName");

const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const livesDisplay = document.getElementById("lives");
const levelDisplay = document.getElementById("level");
const comboDisplay = document.getElementById("combo");
const coinsDisplay = document.getElementById("coins");
const highScoreDisplay = document.getElementById("highScore");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const saveProgressBtn = document.getElementById("saveProgressBtn");
const resetBtn = document.getElementById("resetBtn");
const switchProfileBtn = document.getElementById("switchProfileBtn");
const soundBtn = document.getElementById("soundBtn");

const playBtn = document.getElementById("playBtn");
const continueBtn = document.getElementById("continueBtn");
const claimDailyRewardBtn = document.getElementById("claimDailyRewardBtn");
const resumeBtn = document.getElementById("resumeBtn");
const restartBtn = document.getElementById("restartBtn");
const startBossBtn = document.getElementById("startBossBtn");
const playAgainFromWinBtn = document.getElementById("playAgainFromWinBtn");

const saveScoreBtn = document.getElementById("saveScoreBtn");
const gameOverSaveScoreBtn = document.getElementById("gameOverSaveScoreBtn");
const playerNameInput = document.getElementById("playerName");
const gameOverPlayerNameInput = document.getElementById("gameOverPlayerName");

const profileScreen = document.getElementById("profileScreen");
const startScreen = document.getElementById("startScreen");
const pauseScreen = document.getElementById("pauseScreen");
const bossScreen = document.getElementById("bossScreen");
const winScreen = document.getElementById("winScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const profileList = document.getElementById("profileList");
const newProfileNameInput = document.getElementById("newProfileName");
const avatarSelect = document.getElementById("avatarSelect");
const adminPasswordInput = document.getElementById("adminPasswordInput");
const unlockAdminBtn = document.getElementById("unlockAdminBtn");

const winScoreText = document.getElementById("winScoreText");
const winCoinsText = document.getElementById("winCoinsText");
const finalScoreText = document.getElementById("finalScoreText");
const gameOverCoinsText = document.getElementById("gameOverCoinsText");
const leaderboardList = document.getElementById("leaderboardList");
const achievementList = document.getElementById("achievementList");
const skinsList = document.getElementById("skinsList");
const message = document.getElementById("message");

const buyLifeBtn = document.getElementById("buyLifeBtn");
const buyTimeBtn = document.getElementById("buyTimeBtn");
const buyScoreBtn = document.getElementById("buyScoreBtn");
const createProfileBtn = document.getElementById("createProfileBtn");

let score = 0;
let timeLeft = 30;
let lives = 3;
let level = 1;
let combo = 0;
let coins = 0;
let moveSpeed = 1000;
let missesThisLife = 0;

let moveInterval = null;
let timerInterval = null;
let moveTimeout = null;

let gameRunning = false;
let gamePaused = false;
let soundOn = true;
let bossRound = false;
let bossRoundStarted = false;
let currentProfileId = null;
let currentSkin = "default";
let hitLocked = false;

const TEST_PROFILE_ID = "testmaster_profile";
const ADMIN_PROFILE_ID = "admin_profile";
const ADMIN_PASSWORD = "wildhouseadmin";

const bossCharacter = "👹";

const SKINS = [
    { id: "default", name: "Default", emoji: "🕴️", cost: 0 },
    { id: "ninja", name: "Ninja", emoji: "🥷", cost: 60 },
    { id: "robot", name: "Robot", emoji: "🤖", cost: 90 },
    { id: "alien", name: "Alien", emoji: "👽", cost: 120 },
    { id: "wizard", name: "Wizard", emoji: "🧙", cost: 150 }
];

const ACHIEVEMENTS = [
    { id: "first_catch", name: "First Catch", desc: "Catch the target once." },
    { id: "coin_collector", name: "Coin Collector", desc: "Reach 100 coins." },
    { id: "combo_master", name: "Combo Master", desc: "Reach combo 6." },
    { id: "boss_unlock", name: "Boss Hunter", desc: "Unlock boss round." },
    { id: "winner", name: "Champion", desc: "Win the game." }
];

const clickSound = new Audio("sounds/click.mp3");
const missSound = new Audio("sounds/miss.mp3");
const gameOverSound = new Audio("sounds/gameover.mp3");
const bgMusic = new Audio("sounds/bgmusic.mp3");

bgMusic.loop = true;
bgMusic.volume = 0.3;

let highScore = Number(localStorage.getItem("catchManHighScore") || 0);
highScoreDisplay.textContent = highScore;

// Make target easier to tap
man.style.display = "flex";
man.style.alignItems = "center";
man.style.justifyContent = "center";
man.style.width = "90px";
man.style.height = "90px";
man.style.lineHeight = "1";
man.style.touchAction = "manipulation";

function updateSoundIcon() {
    soundBtn.textContent = soundOn ? "🔊" : "🔇";
}

updateSoundIcon();

function getProfiles() {
    const profiles = JSON.parse(localStorage.getItem("catchManProfiles")) || [];

    if (!profiles.some(profile => profile.id === TEST_PROFILE_ID)) {
        profiles.push({
            id: TEST_PROFILE_ID,
            name: "TestMaster",
            avatar: "🧪",
            coins: "infinite",
            hasSave: false,
            progress: null,
            ownedSkins: SKINS.map(skin => skin.id),
            equippedSkin: "default",
            achievements: [],
            lastDailyReward: null
        });
    }

    localStorage.setItem("catchManProfiles", JSON.stringify(profiles));
    return JSON.parse(localStorage.getItem("catchManProfiles")) || [];
}

function saveProfiles(profiles) {
    localStorage.setItem("catchManProfiles", JSON.stringify(profiles));
}

function getCurrentProfile() {
    const profiles = getProfiles();
    return profiles.find(profile => profile.id === currentProfileId) || null;
}

function isUnlimitedCoinsProfile() {
    return currentProfileId === TEST_PROFILE_ID || currentProfileId === ADMIN_PROFILE_ID;
}

function displayCoins() {
    coinsDisplay.textContent = isUnlimitedCoinsProfile() ? "∞" : coins;
}

function playSound(sound) {
    if (!soundOn) return;
    sound.currentTime = 0;
    sound.play().catch(() => {});
}

function startBackgroundMusic() {
    if (!soundOn) return;
    bgMusic.play().catch(() => {});
}

function stopBackgroundMusic() {
    bgMusic.pause();
    bgMusic.currentTime = 0;
}

function showOverlay(overlay) {
    overlay.classList.add("show");
}

function hideOverlay(overlay) {
    overlay.classList.remove("show");
}

function hideAllOverlays() {
    hideOverlay(profileScreen);
    hideOverlay(startScreen);
    hideOverlay(pauseScreen);
    hideOverlay(bossScreen);
    hideOverlay(winScreen);
    hideOverlay(gameOverScreen);
}

function updateScore() {
    scoreDisplay.textContent = score;
}

function updateTime() {
    timeDisplay.textContent = timeLeft;
}

function updateLives() {
    livesDisplay.textContent = lives;
}

function updateLevel() {
    levelDisplay.textContent = level;
}

function updateCombo() {
    comboDisplay.textContent = combo;
}

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("catchManHighScore", String(highScore));
        highScoreDisplay.textContent = highScore;
    }
}

function updateProfileHeader() {
    const profile = getCurrentProfile();
    currentProfileNameDisplay.textContent = profile ? profile.name : "None";
    currentAvatarDisplay.textContent = profile ? (profile.avatar || "🙂") : "🙂";

    const activeSkin = SKINS.find(skin => skin.id === currentSkin);
    currentSkinNameDisplay.textContent = activeSkin ? activeSkin.name : "Default";
}

function setBackgroundByLevel() {
    gameArea.className = "";

    if (bossRound) {
        gameArea.classList.add("boss-bg");
        return;
    }

    if (level === 1) gameArea.classList.add("level-1-bg");
    else if (level === 2) gameArea.classList.add("level-2-bg");
    else if (level === 3) gameArea.classList.add("level-3-bg");
    else if (level === 4) gameArea.classList.add("level-4-bg");
    else gameArea.classList.add("level-5-bg");
}

function getSkinEmoji() {
    const skin = SKINS.find(item => item.id === currentSkin);
    return skin ? skin.emoji : "🕴️";
}

function getCurrentCharacter() {
    return bossRound ? bossCharacter : getSkinEmoji();
}

function getTargetSize() {
    return bossRound ? 120 : 90;
}

function moveMan() {
    const areaWidth = gameArea.clientWidth;
    const areaHeight = gameArea.clientHeight;
    const targetSize = getTargetSize();

    man.style.width = `${targetSize}px`;
    man.style.height = `${targetSize}px`;

    const maxX = Math.max(0, areaWidth - targetSize);
    const maxY = Math.max(0, areaHeight - targetSize);

    const randomX = Math.floor(Math.random() * (maxX + 1));
    const randomY = Math.floor(Math.random() * (maxY + 1));

    man.style.left = `${randomX}px`;
    man.style.top = `${randomY}px`;
    man.textContent = getCurrentCharacter();
}

function clearGameTimers() {
    clearInterval(moveInterval);
    clearInterval(timerInterval);
    clearTimeout(moveTimeout);
}

function startMovement() {
    clearInterval(moveInterval);
    moveInterval = setInterval(() => {
        if (!gameRunning || gamePaused) return;
        moveMan();
    }, moveSpeed);
}

function calculateLevel() {
    if (bossRound) return;

    level = Math.floor(score / 5) + 1;
    if (level > 5) level = 5;

    updateLevel();
    setBackgroundByLevel();

    if (level === 5 && score >= 25 && !bossRoundStarted) {
        triggerBossRound();
    }
}

function adjustSpeedForLevel() {
    moveSpeed = bossRound ? 260 : Math.max(380, 1100 - (level - 1) * 120);
    startMovement();
}

function resetValues() {
    score = 0;
    timeLeft = 30;
    lives = 3;
    level = 1;
    combo = 0;
    moveSpeed = 1100;
    missesThisLife = 0;
    bossRound = false;
    bossRoundStarted = false;
    hitLocked = false;

    const profile = getCurrentProfile();
    if (profile) {
        coins = isUnlimitedCoinsProfile() ? 999999999 : Number(profile.coins || 0);
        currentSkin = profile.equippedSkin || "default";
    } else {
        coins = 0;
        currentSkin = "default";
    }

    updateScore();
    updateTime();
    updateLives();
    updateLevel();
    updateCombo();
    displayCoins();
    updateProfileHeader();

    man.classList.remove("boss");
    man.style.left = "20px";
    man.style.top = "20px";
    man.textContent = getCurrentCharacter();

    setBackgroundByLevel();
    moveMan();
}

function renderLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem("catchManLeaderboard")) || [];
    leaderboardList.innerHTML = "";

    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = "<li>No scores yet.</li>";
        return;
    }

    leaderboard.forEach((entry) => {
        const li = document.createElement("li");
        li.textContent = `${entry.name} - ${entry.score}`;
        leaderboardList.appendChild(li);
    });
}

function saveScore(name, finalScore) {
    if (!name.trim()) {
        alert("Please enter your name.");
        return;
    }

    const leaderboard = JSON.parse(localStorage.getItem("catchManLeaderboard")) || [];
    leaderboard.push({ name: name.trim(), score: finalScore });
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem("catchManLeaderboard", JSON.stringify(leaderboard.slice(0, 5)));
    renderLeaderboard();
}

function renderProfiles() {
    const profiles = getProfiles();
    profileList.innerHTML = "";

    profiles.forEach(profile => {
        const card = document.createElement("div");
        card.className = "profile-card";

        const coinsText =
            profile.id === TEST_PROFILE_ID || profile.id === ADMIN_PROFILE_ID
                ? "∞"
                : (profile.coins || 0);

        const saveText = profile.hasSave ? "Saved game available" : "No saved game";

        card.innerHTML = `
            <div>
                <h3>${profile.avatar || "🙂"} ${profile.name}</h3>
                <p>Coins: ${coinsText}</p>
                <p>${saveText}</p>
            </div>
            <button data-profile-id="${profile.id}">Select</button>
        `;

        card.querySelector("button").addEventListener("click", function () {
            selectProfile(profile.id);
        });

        profileList.appendChild(card);
    });
}

function renderAchievements() {
    const profile = getCurrentProfile();
    const unlocked = profile?.achievements || [];
    achievementList.innerHTML = "";

    ACHIEVEMENTS.forEach(item => {
        const li = document.createElement("li");
        const isUnlocked = unlocked.includes(item.id);
        li.className = "achievement-item " + (isUnlocked ? "unlocked" : "locked");
        li.innerHTML = `<strong>${isUnlocked ? "🏆" : "🔒"} ${item.name}</strong><br>${item.desc}`;
        achievementList.appendChild(li);
    });
}

function unlockAchievement(id) {
    const profiles = getProfiles();
    const index = profiles.findIndex(item => item.id === currentProfileId);
    if (index === -1) return;

    if (!profiles[index].achievements) {
        profiles[index].achievements = [];
    }

    if (!profiles[index].achievements.includes(id)) {
        profiles[index].achievements.push(id);
        saveProfiles(profiles);
        renderAchievements();
    }
}

function renderSkins() {
    const profile = getCurrentProfile();
    const ownedSkins = profile?.ownedSkins || ["default"];
    skinsList.innerHTML = "";

    SKINS.forEach(skin => {
        const card = document.createElement("div");
        card.className = "shop-item";

        const owned = ownedSkins.includes(skin.id);
        const equipped = currentSkin === skin.id;

        card.innerHTML = `
            <h3>${skin.emoji} ${skin.name}</h3>
            <p>Cost: ${skin.cost === 0 ? "Free" : skin.cost + " coins"}</p>
            <button>${equipped ? "Equipped" : owned ? "Equip" : "Buy"}</button>
        `;

        const btn = card.querySelector("button");

        if (equipped) {
            btn.disabled = true;
        } else if (owned) {
            btn.addEventListener("click", () => equipSkin(skin.id));
        } else {
            btn.addEventListener("click", () => buySkin(skin.id));
        }

        skinsList.appendChild(card);
    });
}

function createProfile() {
    const name = newProfileNameInput.value.trim();
    const avatar = avatarSelect.value;

    if (!name) {
        alert("Enter a profile name.");
        return;
    }

    const profiles = getProfiles();
    const exists = profiles.some(profile => profile.name.toLowerCase() === name.toLowerCase());

    if (exists) {
        alert("That profile name already exists.");
        return;
    }

    profiles.push({
        id: "profile_" + Date.now(),
        name,
        avatar,
        coins: 0,
        hasSave: false,
        progress: null,
        ownedSkins: ["default"],
        equippedSkin: "default",
        achievements: [],
        lastDailyReward: null
    });

    saveProfiles(profiles);
    newProfileNameInput.value = "";
    renderProfiles();
}

function unlockAdminProfile() {
    const password = adminPasswordInput.value.trim();

    if (password !== ADMIN_PASSWORD) {
        alert("Wrong admin password.");
        return;
    }

    const profiles = getProfiles();
    const exists = profiles.some(profile => profile.id === ADMIN_PROFILE_ID);

    if (!exists) {
        profiles.push({
            id: ADMIN_PROFILE_ID,
            name: "Admin",
            avatar: "🛠️",
            coins: "infinite",
            hasSave: false,
            progress: null,
            ownedSkins: SKINS.map(skin => skin.id),
            equippedSkin: "alien",
            achievements: ACHIEVEMENTS.map(item => item.id),
            lastDailyReward: null
        });
        saveProfiles(profiles);
    }

    adminPasswordInput.value = "";
    renderProfiles();
    alert("Admin profile unlocked.");
}

function selectProfile(profileId) {
    currentProfileId = profileId;
    updateProfileHeader();
    resetValues();
    renderProfiles();
    renderSkins();
    renderAchievements();

    hideOverlay(profileScreen);
    showOverlay(startScreen);

    const profile = getCurrentProfile();
    continueBtn.disabled = !(profile && profile.hasSave);

    message.textContent = profile && profile.hasSave
        ? "Profile selected. You can continue your saved game."
        : "Profile selected. Start a new game.";
}

function saveProfileProgress() {
    const profile = getCurrentProfile();
    if (!profile) return;

    const profiles = getProfiles();
    const index = profiles.findIndex(item => item.id === profile.id);
    if (index === -1) return;

    profiles[index].hasSave = true;
    profiles[index].progress = {
        score,
        timeLeft,
        lives,
        level,
        combo,
        coins: isUnlimitedCoinsProfile() ? "infinite" : coins,
        moveSpeed,
        missesThisLife,
        bossRound,
        bossRoundStarted,
        currentSkin,
        manLeft: man.style.left,
        manTop: man.style.top
    };

    if (!isUnlimitedCoinsProfile()) {
        profiles[index].coins = coins;
    }

    profiles[index].equippedSkin = currentSkin;
    saveProfiles(profiles);
    renderProfiles();
}

function loadProfileProgress() {
    const profile = getCurrentProfile();

    if (!profile || !profile.hasSave || !profile.progress) {
        alert("No saved game found for this profile.");
        return;
    }

    clearGameTimers();
    hideAllOverlays();

    const progress = profile.progress;
    score = Number(progress.score || 0);
    timeLeft = Number(progress.timeLeft || 30);
    lives = Number(progress.lives || 3);
    level = Number(progress.level || 1);
    combo = Number(progress.combo || 0);
    coins = isUnlimitedCoinsProfile() ? 999999999 : Number(progress.coins || 0);
    moveSpeed = Number(progress.moveSpeed || 1100);
    missesThisLife = Number(progress.missesThisLife || 0);
    bossRound = Boolean(progress.bossRound);
    bossRoundStarted = Boolean(progress.bossRoundStarted);
    currentSkin = progress.currentSkin || "default";
    hitLocked = false;

    updateScore();
    updateTime();
    updateLives();
    updateLevel();
    updateCombo();
    displayCoins();
    updateProfileHeader();

    if (bossRound) man.classList.add("boss");
    else man.classList.remove("boss");

    man.style.left = progress.manLeft || "20px";
    man.style.top = progress.manTop || "20px";
    man.textContent = getCurrentCharacter();

    setBackgroundByLevel();

    gameRunning = true;
    gamePaused = false;

    pauseBtn.disabled = false;
    pauseBtn.textContent = "Pause";

    startMovement();
    startBackgroundMusic();
    startTimerLoop();

    renderSkins();
    renderAchievements();
    message.textContent = "Saved game loaded.";
}

function clearSavedProgressAfterRun() {
    const profiles = getProfiles();
    const index = profiles.findIndex(item => item.id === currentProfileId);
    if (index === -1) return;

    profiles[index].hasSave = false;
    profiles[index].progress = null;

    if (!isUnlimitedCoinsProfile()) {
        profiles[index].coins = coins;
    }

    saveProfiles(profiles);
    renderProfiles();
}

function awardCoins(amount) {
    if (isUnlimitedCoinsProfile()) {
        displayCoins();
        return;
    }

    coins += amount;
    displayCoins();

    const profiles = getProfiles();
    const index = profiles.findIndex(item => item.id === currentProfileId);

    if (index !== -1) {
        profiles[index].coins = coins;
        saveProfiles(profiles);
    }

    if (coins >= 100) unlockAchievement("coin_collector");
}

function spendCoins(amount) {
    if (isUnlimitedCoinsProfile()) {
        displayCoins();
        return true;
    }

    if (coins < amount) {
        alert("Not enough coins.");
        return false;
    }

    coins -= amount;
    displayCoins();

    const profiles = getProfiles();
    const index = profiles.findIndex(item => item.id === currentProfileId);

    if (index !== -1) {
        profiles[index].coins = coins;
        saveProfiles(profiles);
    }

    return true;
}

function buySkin(skinId) {
    const skin = SKINS.find(item => item.id === skinId);
    if (!skin) return;

    if (skin.cost > 0 && !spendCoins(skin.cost)) {
        return;
    }

    const profiles = getProfiles();
    const index = profiles.findIndex(item => item.id === currentProfileId);
    if (index === -1) return;

    if (!profiles[index].ownedSkins) {
        profiles[index].ownedSkins = ["default"];
    }

    if (!profiles[index].ownedSkins.includes(skinId)) {
        profiles[index].ownedSkins.push(skinId);
    }

    saveProfiles(profiles);
    renderSkins();
    message.textContent = `${skin.name} skin unlocked.`;
}

function equipSkin(skinId) {
    const profiles = getProfiles();
    const index = profiles.findIndex(item => item.id === currentProfileId);
    if (index === -1) return;

    const ownedSkins = profiles[index].ownedSkins || ["default"];
    if (!ownedSkins.includes(skinId)) return;

    profiles[index].equippedSkin = skinId;
    saveProfiles(profiles);

    currentSkin = skinId;
    updateProfileHeader();
    man.textContent = getCurrentCharacter();
    renderSkins();
    saveProfileProgress();
    message.textContent = "Skin equipped.";
}

function claimDailyReward() {
    const profile = getCurrentProfile();
    if (!profile) {
        alert("Select a profile first.");
        return;
    }

    if (isUnlimitedCoinsProfile()) {
        message.textContent = "Unlimited coin profile does not need daily reward.";
        return;
    }

    const today = new Date().toDateString();
    if (profile.lastDailyReward === today) {
        message.textContent = "Daily reward already claimed today.";
        return;
    }

    const reward = 25;
    coins += reward;
    displayCoins();

    const profiles = getProfiles();
    const index = profiles.findIndex(item => item.id === currentProfileId);
    if (index !== -1) {
        profiles[index].coins = coins;
        profiles[index].lastDailyReward = today;
        saveProfiles(profiles);
    }

    if (coins >= 100) unlockAchievement("coin_collector");

    renderProfiles();
    message.textContent = `Daily reward claimed. +${reward} coins.`;
}

function startTimerLoop() {
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        if (!gameRunning || gamePaused) return;

        timeLeft--;
        updateTime();

        if (timeLeft <= 0) {
            if (bossRound) winGame();
            else endGame();
            return;
        }

        saveProfileProgress();
    }, 1000);
}

function startGame() {
    if (!currentProfileId) {
        alert("Please select a profile first.");
        return;
    }

    clearGameTimers();
    hideAllOverlays();

    gameRunning = true;
    gamePaused = false;
    hitLocked = false;

    resetValues();
    startMovement();
    startBackgroundMusic();
    startTimerLoop();

    pauseBtn.textContent = "Pause";
    pauseBtn.disabled = false;

    renderSkins();
    renderAchievements();

    message.textContent = "Game started. Catch him fast!";
    saveProfileProgress();
}

function pauseGame() {
    if (!gameRunning || gamePaused) return;

    gamePaused = true;
    clearInterval(moveInterval);
    clearTimeout(moveTimeout);
    showOverlay(pauseScreen);
    bgMusic.pause();
    pauseBtn.textContent = "Pause";
    message.textContent = "Game paused.";
    saveProfileProgress();
}

function resumeGame() {
    if (!gameRunning || !gamePaused) return;

    gamePaused = false;
    hideOverlay(pauseScreen);
    startMovement();

    if (soundOn) bgMusic.play().catch(() => {});

    pauseBtn.textContent = "Pause";
    message.textContent = "Game resumed. Keep going!";
}

function togglePause() {
    if (!gameRunning) return;
    if (gamePaused) resumeGame();
    else pauseGame();
}

function loseLife() {
    lives--;
    updateLives();
    missesThisLife = 0;
    combo = 0;
    updateCombo();

    if (lives <= 0) {
        endGame();
    } else {
        message.textContent = `You lost a life. Lives left: ${lives}`;
    }

    saveProfileProgress();
}

function addComboPoints() {
    combo++;

    let pointsEarned = 1;
    if (combo >= 3 && combo < 6) pointsEarned = 2;
    else if (combo >= 6) {
        pointsEarned = 3;
        unlockAchievement("combo_master");
    }

    if (bossRound) pointsEarned += 2;

    score += pointsEarned;
    awardCoins(bossRound ? 3 : 1);

    updateScore();
    updateCombo();
    displayCoins();

    if (score >= 1) unlockAchievement("first_catch");

    if (combo >= 6) {
        message.textContent = `Mega combo! +${pointsEarned} points`;
    } else if (combo >= 3) {
        message.textContent = `Combo streak! +${pointsEarned} points`;
    } else {
        message.textContent = `Nice catch! +${pointsEarned} point`;
    }
}

function resetComboOnMiss() {
    combo = 0;
    updateCombo();
}

function triggerBossRound() {
    clearInterval(moveInterval);
    clearTimeout(moveTimeout);
    bossRoundStarted = true;
    gamePaused = true;
    showOverlay(bossScreen);
    unlockAchievement("boss_unlock");
    message.textContent = "Boss round unlocked.";
    saveProfileProgress();
}

function startBossRound() {
    hideOverlay(bossScreen);
    bossRound = true;
    gamePaused = false;
    hitLocked = false;

    man.classList.add("boss");
    setBackgroundByLevel();
    adjustSpeedForLevel();
    moveMan();

    message.textContent = "Boss round started. Catch the boss!";
    saveProfileProgress();
}

function winGame() {
    clearGameTimers();

    gameRunning = false;
    gamePaused = false;
    hitLocked = false;

    const coinsWon = 50;
    awardCoins(coinsWon);
    updateHighScore();
    stopBackgroundMusic();
    unlockAchievement("winner");

    winScoreText.textContent = `Your final score is ${score}`;
    winCoinsText.textContent = `You earned ${coinsWon} bonus coins`;
    showOverlay(winScreen);

    pauseBtn.textContent = "Pause";
    pauseBtn.disabled = true;
    message.textContent = "You won the game!";

    clearSavedProgressAfterRun();
    renderAchievements();
}

function endGame() {
    clearGameTimers();

    gameRunning = false;
    gamePaused = false;
    hitLocked = false;

    const coinsWon = Math.max(5, Math.floor(score / 2));
    awardCoins(coinsWon);

    updateHighScore();
    stopBackgroundMusic();
    playSound(gameOverSound);

    finalScoreText.textContent = `Your final score is ${score}`;
    gameOverCoinsText.textContent = `You earned ${coinsWon} coins`;
    showOverlay(gameOverScreen);

    pauseBtn.textContent = "Pause";
    pauseBtn.disabled = true;
    message.textContent = `Game over. Final score: ${score}`;

    clearSavedProgressAfterRun();
}

function resetGame() {
    clearGameTimers();

    gameRunning = false;
    gamePaused = false;
    hitLocked = false;

    stopBackgroundMusic();
    resetValues();

    hideOverlay(pauseScreen);
    hideOverlay(bossScreen);
    hideOverlay(winScreen);
    hideOverlay(gameOverScreen);

    if (currentProfileId) showOverlay(startScreen);
    else showOverlay(profileScreen);

    pauseBtn.textContent = "Pause";
    pauseBtn.disabled = true;
    message.textContent = currentProfileId
        ? "Press Start Game or Continue Saved Game."
        : "Choose a profile to begin.";

    playerNameInput.value = "";
    gameOverPlayerNameInput.value = "";

    saveProfileProgress();
    renderProfiles();
    renderSkins();
    renderAchievements();
}

function switchProfile() {
    clearGameTimers();

    gameRunning = false;
    gamePaused = false;
    hitLocked = false;

    stopBackgroundMusic();
    hideAllOverlays();
    showOverlay(profileScreen);

    pauseBtn.disabled = true;
    pauseBtn.textContent = "Pause";
    message.textContent = "Choose another profile.";
}

function buyExtraLife() {
    if (!spendCoins(30)) return;
    lives++;
    updateLives();
    message.textContent = "Extra life purchased.";
    saveProfileProgress();
}

function buyExtraTime() {
    if (!spendCoins(20)) return;
    timeLeft += 10;
    updateTime();
    message.textContent = "+10 seconds purchased.";
    saveProfileProgress();
}

function buyScoreBoost() {
    if (!spendCoins(40)) return;
    score += 10;
    updateScore();
    calculateLevel();
    adjustSpeedForLevel();
    message.textContent = "Score boost purchased.";
    saveProfileProgress();
}

// Fast hit handling
function handleSuccessfulHit() {
    if (!gameRunning || gamePaused || hitLocked) return;

    hitLocked = true;

    playSound(clickSound);

    man.classList.add("pop");
    setTimeout(() => {
        man.classList.remove("pop");
    }, 180);

    addComboPoints();
    calculateLevel();
    adjustSpeedForLevel();

    clearInterval(moveInterval);
    clearTimeout(moveTimeout);

    moveTimeout = setTimeout(() => {
        if (!gameRunning || gamePaused) {
            hitLocked = false;
            return;
        }

        moveMan();
        startMovement();
        hitLocked = false;
    }, 90);
}

man.addEventListener("click", function (event) {
    event.stopPropagation();
    handleSuccessfulHit();
});

man.addEventListener("pointerdown", function (event) {
    event.stopPropagation();
    handleSuccessfulHit();
});

gameArea.addEventListener("click", function (event) {
    if (!gameRunning || gamePaused) return;
    if (event.target === man) return;

    if (score > 0) {
        score--;
        updateScore();
    }

    missesThisLife++;
    resetComboOnMiss();
    playSound(missSound);

    if (missesThisLife >= 3) {
        loseLife();
    } else {
        message.textContent = `Missed. ${3 - missesThisLife} more miss(es) before losing a life.`;
    }

    calculateLevel();
    adjustSpeedForLevel();
});

soundBtn.addEventListener("click", function () {
    soundOn = !soundOn;
    updateSoundIcon();

    if (!soundOn) {
        bgMusic.pause();
    } else if (gameRunning && !gamePaused) {
        bgMusic.play().catch(() => {});
    }
});

startBtn.addEventListener("click", startGame);
playBtn.addEventListener("click", startGame);
continueBtn.addEventListener("click", loadProfileProgress);
claimDailyRewardBtn.addEventListener("click", claimDailyReward);
resetBtn.addEventListener("click", resetGame);
pauseBtn.addEventListener("click", togglePause);
resumeBtn.addEventListener("click", resumeGame);
restartBtn.addEventListener("click", startGame);
startBossBtn.addEventListener("click", startBossRound);
playAgainFromWinBtn.addEventListener("click", startGame);

saveProgressBtn.addEventListener("click", function () {
    saveProfileProgress();
    message.textContent = "Progress saved.";
});

switchProfileBtn.addEventListener("click", switchProfile);

saveScoreBtn.addEventListener("click", function () {
    saveScore(playerNameInput.value, score);
    playerNameInput.value = "";
});

gameOverSaveScoreBtn.addEventListener("click", function () {
    saveScore(gameOverPlayerNameInput.value, score);
    gameOverPlayerNameInput.value = "";
});

buyLifeBtn.addEventListener("click", buyExtraLife);
buyTimeBtn.addEventListener("click", buyExtraTime);
buyScoreBtn.addEventListener("click", buyScoreBoost);
createProfileBtn.addEventListener("click", createProfile);
unlockAdminBtn.addEventListener("click", unlockAdminProfile);

pauseBtn.disabled = true;
continueBtn.disabled = true;

getProfiles();
renderProfiles();
renderLeaderboard();
updateProfileHeader();
displayCoins();
renderAchievements();
renderSkins();
updateSoundIcon();