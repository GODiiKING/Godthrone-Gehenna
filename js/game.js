let GameManager = {
    isGameOver: false,
    currentStreak: 0,
    selectedClass: "",
    currentRealm: null, 

    setGameStart: function(classType) {
        this.isGameOver = false;
        this.selectedClass = classType;
        this.currentStreak = parseInt(localStorage.getItem("godthrone_streak")) || 0;
        
        if (!localStorage.getItem("gt_inv_potion")) localStorage.setItem("gt_inv_potion", "0");
        if (!localStorage.getItem("gt_inv_ward")) localStorage.setItem("gt_inv_ward", "0");

        const consoleEl = document.getElementById("combatConsole");
        if (consoleEl) {
            consoleEl.style.display = "block";
            consoleEl.innerHTML = ""; 
        }

        this.rollRealmShift();
        this.resetPlayer(classType);
        this.setPreFight();
        
        let startupMsg = "⚔️ Enter the arena. The trial begins...";
        if (this.currentStreak > 0) {
            startupMsg += ` (Current Win Streak: ${this.currentStreak} 🔥)`;
        }
        
        // Clean global helper calls!
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
        document.getElementById("p-health-bar").style.width = `${playerHealthPct}%`;
        document.getElementById("p-mana-bar").style.width = `${playerMagicPct}%`;

        if (typeof enemy !== "undefined" && enemy !== null) {
            let enemyHealthPct = Math.max(0, (enemy.health / enemy.maxHealth) * 100);
            document.querySelector(".healthenemy").innerHTML = `Health: ${enemy.health} / ${enemy.maxHealth}`;
            document.getElementById("e-health-bar").style.width = `${enemyHealthPct}%`;
        }
    },

    resetPlayer: function(classType) {
        let key = classType.toLowerCase();
        let template = CharacterDatabase[key] || { name: classType, health: 150, magic: 50, strength: 100, stamina: 100, speed: 100 };
        
        let relicHP = parseInt(localStorage.getItem("gt_relic_hp")) || 0;
        let relicMagic = parseInt(localStorage.getItem("gt_relic_magic")) || 0;
        let relicSTR = parseInt(localStorage.getItem("gt_relic_str")) || 0;
        let relicStamina = parseInt(localStorage.getItem("gt_relic_stamina")) || 0;
        let relicSPD = parseInt(localStorage.getItem("gt_relic_spd")) || 0;

        let mundusBonusHP = (this.currentRealm && this.currentRealm.type === "mundus") ? 50 : 0;

        player = new Player(
            template.name, 
            template.health + relicHP + mundusBonusHP, 
            template.magic + relicMagic, 
            template.strength + relicSTR, 
            template.stamina + relicStamina, 
            template.speed + relicSPD
        );
        
        player.maxHealth = template.health + relicHP + mundusBonusHP;
        player.maxMagic = template.magic + relicMagic;
        player.isDefending = false; 
        player.hasAegisWard = false; 
        
        let container = document.getElementById("character-grid");
        container.style.display = "block"; 
        
        let imgName = key.replace(" ", "_");
        
        container.innerHTML = `
            <div class="card" style="display: flex !important; opacity: 1; transform: none; width: 100% !important; max-width: 100% !important; min-height: 140px !important; box-sizing: border-box !important; margin: 0 auto; flex-direction: row; align-items: center; gap: 40px; text-align: left; padding: 20px 40px;">
                <img src="./images/exiliumarch/${imgName}.png" class="img-avatar" style="width: 70px; height: 70px; margin-bottom: 0; flex-shrink: 0;">
                <div style="flex-grow: 1;">
                    <h3>${player.classType} ${relicHP + relicMagic + relicSTR > 0 ? "✨" : ""}</h3>
                    <p class="line-1 healthplayer" style="margin-bottom:2px;">Health: ${player.health} / ${player.maxHealth}</p>
                    <div class="stat-bar-container"><div id="p-health-bar" class="stat-bar-fill bg-player-health"></div></div>
                    <p class="line-3" style="margin-bottom:2px;">Magic: ${player.magic} / ${player.maxMagic}</p>
                    <div class="stat-bar-container" style="margin-bottom: 8px;"><div id="p-mana-bar" class="stat-bar-fill bg-mana"></div></div>
                    <p class="line-3">Strength: ${player.strength} | Stamina: ${player.stamina} | Speed: ${player.speed}</p>
                </div>
            </div>`;
    },

    setPreFight: function() {
        document.querySelector(".actions").innerHTML = `
            <button class="menu-toggle" onclick="GameManager.setFight()">Search for enemy!</button>
        `;
    },

    setFight: function() {
        let playerKey = player.classType ? player.classType.toLowerCase() : "";
        let keys = Object.keys(CharacterDatabase).filter(key => key.toLowerCase() !== playerKey);

        if (keys.length === 0) keys = Object.keys(CharacterDatabase);

        let randomKey = keys[Math.floor(Math.random() * keys.length)];
        let template = CharacterDatabase[randomKey];

        let currentStreak = this.currentStreak;
        let isBossRound = (currentStreak > 0 && currentStreak % 3 === 0);
        let scaleMultiplier = isBossRound ? currentStreak * 2.5 : currentStreak * 1.2;

        let scaledHP = Math.floor(template.health + (scaleMultiplier * 20));
        let scaledMagic = Math.floor(template.magic + (scaleMultiplier * 5));
        let scaledSTR = Math.floor(template.strength + (scaleMultiplier * 4));
        let scaledStamina = Math.floor(template.stamina + (scaleMultiplier * 3));
        let scaledSPD = Math.floor(template.speed + (scaleMultiplier * 3));

        let adjustedName = isBossRound ? `👑 OVERLORD ${template.name.toUpperCase()}` : template.name;

        enemy = new Enemy(adjustedName, scaledHP, scaledMagic, scaledSTR, scaledStamina, scaledSPD);
        enemy.maxHealth = scaledHP;

        if (this.currentRealm.type === "umbra") {
            player.speed = Math.floor(player.speed * 0.5);
            enemy.speed = Math.floor(enemy.speed * 0.5);
        }

        let potions = parseInt(localStorage.getItem("gt_inv_potion")) || 0;
        let wards = parseInt(localStorage.getItem("gt_inv_ward")) || 0;
        let burstCost = (this.currentRealm.type === "umbra") ? 10 : 20;

        document.querySelector(".actions").innerHTML = `
            <div class="actions-row" style="width: 100%; display: flex; gap: 10px; justify-content: center; margin-bottom: 10px;">
                <button class="menu-toggle border-pink" onclick="PlayerMoves.calcAttack()">Attack!</button>
                <button class="menu-toggle border-gold" onclick="PlayerMoves.calcSpell()">Soul Burst (${burstCost} MP)</button>
                <button class="menu-toggle border-green" onclick="PlayerMoves.calcDefend()">Defend</button>
            </div>
            <div class="actions-row" style="width: 100%; display: flex; gap: 10px; justify-content: center;">
                <button class="menu-toggle border-red" onclick="PlayerMoves.usePotion()">Use Essence Vial (${potions} left)</button>
                <button class="menu-toggle border-teal" onclick="PlayerMoves.useWard()">Activate Aegis Ward (${wards} left)</button>
            </div>
        `;
        
        let cardStyle = isBossRound 
            ? "border: 2px solid #ffc048; box-shadow: 0 0 15px rgba(255, 192, 72, 0.5);" 
            : "border-color: #da4a6c;";

        document.querySelector(".enemy").innerHTML = `
            <div class="card" style="display: flex !important; opacity: 1; transform: none; width: 100% !important; max-width: 100% !important; min-height: 140px !important; box-sizing: border-box !important; margin: 0 auto; flex-direction: row; align-items: center; gap: 40px; text-align: left; padding: 20px 40px; ${cardStyle}">
                <img src="./images/exiliumarch/${randomKey}.png" class="img-avatar" style="width: 70px; height: 70px; margin-bottom: 0; flex-shrink: 0;">
                <div style="flex-grow: 1;">
                    <h3 style="color: ${isBossRound ? '#ffc048' : '#ff4757'};">${enemy.enemyType}</h3>
                    <p class="line-1 healthenemy" style="margin-bottom:2px;">Health: ${enemy.health} / ${enemy.maxHealth}</p>
                    <div class="stat-bar-container"><div id="e-health-bar" class="stat-bar-fill bg-enemy-health"></div></div>
                    <p class="line-3">Magic: ${enemy.magic} | Strength: ${enemy.strength} | Stamina: ${enemy.stamina} | Speed: ${enemy.speed}</p>
                </div>
            </div>`;

        if (isBossRound) {
            printLog(`🚨 CRITICAL WARNING: ${enemy.enemyType} has reality-warped into the arena!`, "#ff4757");
        } else {
            printLog(`⚠️ ${enemy.enemyType} approaches from the shadow realms. (Scaling Level: +${currentStreak})`, "#ff6b9d");
        }
    },

    advanceNextRound: function() {
        this.isGameOver = false;
        
        player.health = player.maxHealth;
        player.magic = player.maxMagic;
        
        this.rollRealmShift();
        this.resetPlayer(this.selectedClass);
        this.setPreFight();
        
        document.querySelector(".enemy").innerHTML = "";
        
        printLog(`🔥 Reality matrix mutated. Entered new Trial Arena layout.`, "#ffc048");
        printRealmLog(this.currentRealm);
    }
};