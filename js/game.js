let GameManager = {
    isGameOver: false,
    currentStreak: 0,
    selectedClass: "",
    currentRealm: null,

    // LINEAR STORY ORDER
    linearOrder: [
        "joker",
        "sangunuus",
        "kosmos",
        "dominor",
        "deus",
        "deus",
    ],

    currentLinearIndex: 0,

    getNextCharacter: function() {
        let next = this.linearOrder[this.currentLinearIndex];
        this.currentLinearIndex++;
        return next;
    },

    // START LINEAR COMBAT (called from VN)
    startLinearCombat: function(enemyKey) {
        const enemyContainer = document.querySelector(".enemy");
        enemyContainer.innerHTML = "";
        enemy = null;

        let template = CharacterDatabase[enemyKey];
        if (!template) {
            console.error("Enemy not found:", enemyKey);
            return;
        }

        updateEnemyShowcase(enemyKey);

        enemy = new Enemy(
            template.name,
            template.health,
            template.magic,
            template.strength,
            template.stamina,
            template.speed
        );

        enemy.maxHealth = template.health;
        enemy.maxMagic = template.magic;

        enemyContainer.innerHTML = `
            <div class="card" style="display:flex;opacity:1;transform:none;width:100%;max-width:100%;min-height:140px;box-sizing:border-box;margin:0 auto;flex-direction:row;align-items:center;gap:40px;text-align:left;padding:20px 40px;">
                <img src="./images/exiliumarch/${enemyKey}.png" class="img-avatar" style="width:70px;height:70px;margin-bottom:0;flex-shrink:0;">
                <div style="flex-grow:1;">
                    <h3 style="color:#ff4757;">${enemy.enemyType}</h3>
                    <p class="line-1 healthenemy">Health: ${enemy.health} / ${enemy.maxHealth}</p>
                    <div class="stat-bar-container"><div id="e-health-bar" class="stat-bar-fill bg-enemy-health"></div></div>
                    <p class="line-3 magicenemy">Magic: ${enemy.magic} / ${enemy.maxMagic}</p>
                    <div class="stat-bar-container"><div id="e-mana-bar" class="stat-bar-fill bg-mana"></div></div>
                    <p class="line-3">Strength: ${enemy.strength} | Stamina: ${enemy.stamina} | Speed: ${enemy.speed}</p>
                </div>
            </div>
        `;

        this.setFightButtons(GameManager.selectedClass.toLowerCase());

        printLog(`⚠️ ${enemy.enemyType} approaches...`, "#ff6b9d");
    },

    // COMBAT BUTTONS
    setFightButtons: function(playerKey) {
        let weaponName = CharacterDatabase[playerKey].weapon;
        let specialCosts = {
            "joker": "15 MP", "sangunuus": "15 MP", "voracium": "ALL MP",
            "khaos": "20 MP", "kosmos": "15 MP", "malignis": "10 MP",
            "excidi": "20 MP", "dominor": "ALL MP", "arma": "15 MP",
            "illusor": "10 MP", "amanuen": "15 MP", "deus": "15 MP"
        };
        let displayCost = specialCosts[playerKey] || "20 MP";

        let skills = SkillData[playerKey] || SkillData["default"];

        document.querySelector(".actions").innerHTML = `
            <div class="actions-row" style="width:100%;display:flex;gap:10px;justify-content:center;">
                <button class="menu-toggle border-pink" data-tooltip="${skills.attackTip}" onclick="PlayerMoves.calcAttack()">ATTACK!</button>
                <button class="menu-toggle border-gold" data-tooltip="${skills.specialTip}" onclick="PlayerMoves.calcSpell()">${weaponName.toUpperCase()} (${displayCost})</button>
                <button class="menu-toggle border-green" data-tooltip="${skills.defendTip}" onclick="PlayerMoves.calcDefend()">${skills.defendBtn}</button>
            </div>
        `;
    },

    // GAME START (called when VN hands control back)
    setGameStart: function(classType) {
        this.isGameOver = false;
        this.selectedClass = classType;
        this.currentStreak = GameStorage.getStreak();

        const enemyContainer = document.querySelector(".enemy");
        if (enemyContainer) enemyContainer.innerHTML = "";
        enemy = null;

        const consoleEl = document.getElementById("combatConsole");
        if (consoleEl) {
            consoleEl.style.display = "block";
            consoleEl.innerHTML = "";
        }

        const realmConsoleEl = document.getElementById("realmConsole");
        if (realmConsoleEl) {
            realmConsoleEl.style.display = "flex";
            realmConsoleEl.innerHTML = "";
        }

        this.rollRealmShift();
        this.resetPlayer(classType);

        let startupMsg = "⚔️ Enter the arena. The trial begins...";
        if (this.currentStreak > 0) {
            startupMsg += ` (Current Win Streak: ${this.currentStreak} 🔥)`;
        }

        printLog(startupMsg, "#ffc048");
        printRealmLog(this.currentRealm);
    },

    rollRealmShift: function() {
        this.currentRealm = getRandomRealm();
    },

    triggerDamageEffects: function(attackerType) {
        const container = document.querySelector(".container");
        if (container) {
            container.classList.add("shake-active");
            setTimeout(() => container.classList.remove("shake-active"), 400);
        }

        const flashClass = (attackerType === "player") ? "flash-player" : "flash-enemy";
        document.body.classList.add(flashClass);
        setTimeout(() => document.body.classList.remove(flashClass), 400);
    },

    updateVisualBars: function() {
        let playerHealthPct = Math.max(0, (player.health / player.maxHealth) * 100);
        let playerMagicPct = Math.max(0, (player.magic / player.maxMagic) * 100);

        document.querySelector(".healthplayer").innerHTML = `Health: ${player.health} / ${player.maxHealth}`;
        if (document.querySelector(".magicplayer")) {
            document.querySelector(".magicplayer").innerHTML = `Magic: ${player.magic} / ${player.maxMagic}`;
        }

        document.getElementById("p-health-bar").style.width = `${playerHealthPct}%`;
        document.getElementById("p-mana-bar").style.width = `${playerMagicPct}%`;

        if (enemy) {
            let enemyHealthPct = Math.max(0, (enemy.health / enemy.maxHealth) * 100);
            let enemyMagicPct = Math.max(0, (enemy.magic / enemy.maxMagic) * 100);

            document.querySelector(".healthenemy").innerHTML = `Health: ${enemy.health} / ${enemy.maxHealth}`;
            document.querySelector(".magicenemy").innerHTML = `Magic: ${enemy.magic} / ${enemy.maxMagic}`;
            document.getElementById("e-health-bar").style.width = `${enemyHealthPct}%`;
            document.getElementById("e-mana-bar").style.width = `${enemyMagicPct}%`;
        }
    },

    resetPlayer: function(classType) {
        let key = classType.toLowerCase();
        let template = CharacterDatabase[key] || { 
            name: classType, health: 150, magic: 50, strength: 100, stamina: 100, speed: 100 
        };

        let mundusBonusHP = (this.currentRealm && this.currentRealm.type === "mundus") ? 50 : 0;

        player = new Player(
            template.name,
            template.health + mundusBonusHP,
            template.magic,
            template.strength,
            template.stamina,
            template.speed
        );

        player.maxHealth = template.health + mundusBonusHP;
        player.maxMagic = template.magic;
        player.isDefending = false;

        let container = document.getElementById("character-grid");
        container.style.display = "block";

        let imgName = key.replace(" ", "_");

        // IMPORTANT: overwrite the grid with a single player card
        container.innerHTML = `
            <div class="card" style="display:flex !important;opacity:1;transform:none;width:100% !important;max-width:100% !important;min-height:140px !important;box-sizing:border-box !important;margin:0 auto;flex-direction:row;align-items:center;gap:40px;text-align:left;padding:20px 40px;">
                <img src="./images/exiliumarch/${imgName}.png" class="img-avatar" style="width:70px;height:70px;margin-bottom:0;flex-shrink:0;">
                <div style="flex-grow:1;">
                    <h3>${player.classType}</h3>
                    <p class="line-1 healthplayer">Health: ${player.health} / ${player.maxHealth}</p>
                    <div class="stat-bar-container"><div id="p-health-bar" class="stat-bar-fill bg-player-health"></div></div>

                    <p class="line-3 magicplayer" style="color:#ffffff;">Magic: ${player.magic} / ${player.maxMagic}</p>
                    <div class="stat-bar-container"><div id="p-mana-bar" class="stat-bar-fill bg-mana"></div></div>

                    <p class="line-3">Strength: ${player.strength} | Stamina: ${player.stamina} | Speed: ${player.speed}</p>
                </div>
            </div>
        `;
    }
};

// SHOWCASE IMAGE
function updateEnemyShowcase(randomKey) {
    const showcase = document.getElementById("enemyShowcase");
    if (!showcase) return;

    showcase.innerHTML = `
        <img src="./images/exiliumarch/${randomKey}.png"
             style="max-width:100%;max-height:100%;object-fit:contain;">
    `;
}

function advanceTrial() {
    // If we finished all 6 scenes → end the game
    if (GameManager.currentLinearIndex >= 6) {
        endGameSequence();
        return;
    }

    // Hide combat UI
    document.querySelector(".container").style.display = "none";

    // Show VN fullscreen
    document.querySelector(".vnViewport").style.display = "flex";

    // Determine next scene number
    let nextSceneIndex = GameManager.currentLinearIndex; // 0-based
    let sceneName = `scene${nextSceneIndex + 1}`;

    // Start the next VN scene
    NovelEngine.startScene(sceneName);

    // After VN ends → start next combat
    NovelEngine.onSceneComplete = function() {
        let nextEnemy = GameManager.getNextCharacter();
        GameManager.startLinearCombat(nextEnemy);

        // Restore combat UI
        document.querySelector(".vnViewport").style.display = "none";
        document.querySelector(".container").style.display = "block";
    };
}

function endGameSequence() {
    // Hide combat UI
    document.querySelector(".container").style.display = "none";

    // Show VN viewport
    const viewport = document.querySelector(".vnViewport");
    viewport.style.display = "flex";

    // Replace VN content with ending message
    document.getElementById("speakerName").innerText = "Congratulations!";
    document.getElementById("sceneText").innerText =
        "You have conquered all six trials and defeated the cosmic pantheon. Your legend echoes across creation.";

    // Remove click-to-advance prompt
    document.querySelector(".actionPrompt").style.display = "none";

    // Add a return button
    const box = document.getElementById("interactiveBox");
    box.innerHTML += `
        <div style="margin-top:20px; text-align:center;">
            <button class="menu-toggle border-gold" onclick="window.location.href='browsergame.html'">
                Return to Main Menu
            </button>
        </div>
    `;
}

// ===============================
// GLOBAL INPUT LOCKDOWN FOR GAME
// ===============================

// Disable text selection everywhere
document.addEventListener("selectstart", function(e) {
    e.preventDefault();
});

// Disable dragging to highlight
document.addEventListener("mousedown", function(e) {
    e.preventDefault();
});

// Disable right-click context menu
document.addEventListener("contextmenu", function(e) {
    e.preventDefault();
});
