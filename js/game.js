let GameManager = {
    isGameOver: false,
    currentStreak: 0,
    selectedClass: "",
    currentRealm: null, // Tracks active environmental conditions

    setGameStart: function(classType) {
        this.isGameOver = false;
        this.selectedClass = classType;
        this.currentStreak = parseInt(localStorage.getItem("godthrone_streak")) || 0;
        
        // Initialize inventory space if empty
        if (!localStorage.getItem("gt_inv_potion")) localStorage.setItem("gt_inv_potion", "0");
        if (!localStorage.getItem("gt_inv_ward")) localStorage.setItem("gt_inv_ward", "0");

        const consoleEl = document.getElementById("combatConsole");
        if (consoleEl) {
            consoleEl.style.display = "block";
            consoleEl.innerHTML = ""; 
        }

        // Generate the first realm shift condition right at startup
        this.rollRealmShift();
        this.resetPlayer(classType);
        this.setPreFight();
        
        let startupMsg = "⚔️ Enter the arena. The trial begins...";
        if (this.currentStreak > 0) {
            startupMsg += ` (Current Win Streak: ${this.currentStreak} 🔥)`;
        }
        this.printLog(startupMsg, "#ffc048");
        this.printRealmLog();
    },

    // Realm Modifier Database Engine Matrix
    realms: [
        { name: "Umbra Alignment", desc: "🌌 Shadow forces condense. Speed metrics are halved, but Soul Bursts cost 10 less Magic!", type: "umbra" },
        { name: "Elementa Flare", desc: "🔥 Primal energies erupt. Physical attacks deal 35% more damage, but active Defense yields 0 Magic.", type: "elementa" },
        { name: "Mundus Gravity", desc: "🌍 Structural density peaks. Maximum HP is boosted by 50 points, but evasion calculations are disabled.", type: "mundus" }
    ],

    rollRealmShift: function() {
        this.currentRealm = this.realms[Math.floor(Math.random() * this.realms.length)];
    },

    printRealmLog: function() {
        this.printLog(`🌌 CURRENT REALM: ${this.currentRealm.name} - ${this.currentRealm.desc}`, "#ffc048");
    },

    printLog: function(message, color = "#ffffff") {
        const consoleEl = document.getElementById("combatConsole");
        if (!consoleEl) return;

        const line = document.createElement("div");
        line.style.color = color;
        line.style.marginTop = "5px";
        line.style.lineHeight = "1.6";
        
        if (color === "#ffc048" || color === "#4cd137" || color === "#ff4757" || color === "#ff6b9d") {
            line.style.textShadow = "0 0 8px rgba(255, 255, 255, 0.2)";
            line.style.fontWeight = "700";
        }

        consoleEl.appendChild(line);

        const chars = Array.from(message);
        let i = 0;
        
        function type() {
            if (i < chars.length) {
                line.innerHTML += chars[i];
                i++;
                consoleEl.scrollTop = consoleEl.scrollHeight;
                setTimeout(type, 12);
            }
        }
        type();
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

        // Apply Mundus temporary realm health modifications if active
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
        player.hasAegisWard = false; // Fresh defensive barrier flag
        
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
            GameManager.printLog(`🚨 CRITICAL WARNING: ${enemy.enemyType} has reality-warped into the arena!`, "#ff4757");
        } else {
            GameManager.printLog(`⚠️ ${enemy.enemyType} approaches from the shadow realms. (Scaling Level: +${currentStreak})`, "#ff6b9d");
        }
    },

    advanceNextRound: function() {
        this.isGameOver = false;
        
        // Dynamic Recovery process configuration loop
        player.health = player.maxHealth;
        player.magic = player.maxMagic;
        
        // Roll a completely new randomized environmental factor block
        this.rollRealmShift();
        this.resetPlayer(this.selectedClass);
        this.setPreFight();
        
        document.querySelector(".enemy").innerHTML = "";
        
        GameManager.printLog(`🔥 Reality matrix mutated. Entered new Trial Arena layout.`, "#ffc048");
        this.printRealmLog();
    }
};

let PlayerMoves = {
    relicPool: [
        { name: "Umbra Loop", stat: "speed", value: 15, msg: "+15 Speed Matrix" },
        { name: "Elementa Core", stat: "strength", value: 12, msg: "+12 Physical Might" },
        { name: "Mundus Crest", stat: "health", value: 45, msg: "+45 Vitality Capacitor" },
        { name: "Aether Lens", stat: "magic", value: 30, msg: "+30 Ancestral Magic" },
        { name: "Anarch Coil", stat: "stamina", value: 15, msg: "+15 Evasive Stamina" }
    ],

    calcAttack: function() {
        if (GameManager.isGameOver) return;

        if (player.speed >= enemy.speed) {
            let playerAttackValues = this.attack(player);
            enemy.health = Math.max(0, enemy.health - playerAttackValues.totalDamage);

            spawnDamageText("-" + playerAttackValues.totalDamage, document.querySelector(".enemy .card"));
            
            if (playerAttackValues.isCrit) {
                GameManager.printLog(`🔥 CRITICAL STRIKE! You break their guard for ${playerAttackValues.totalDamage} damage!`, "#ffc048");
            } else {
                GameManager.printLog(`💥 You hit ${playerAttackValues.damage} damage ${playerAttackValues.hits} times! (Total: ${playerAttackValues.totalDamage})`, "#ffc048");
            }
            
            GameManager.triggerDamageEffects("player");
            GameManager.updateVisualBars();
            
            if (enemy.health <= 0) { this.endMatch("win"); return; }
            this.enemyAttack();
        } else {
            this.enemyAttack();
            if (player.health > 0) {
                let playerAttackValues = this.attack(player);
                enemy.health = Math.max(0, enemy.health - playerAttackValues.totalDamage);
                
                if (playerAttackValues.isCrit) {
                    GameManager.printLog(`⚡ COUNTER CRITICAL! You smash them back for ${playerAttackValues.totalDamage} damage!`, "#ffc048");
                } else {
                    GameManager.printLog(`⚡ You counter-attacked and hit ${playerAttackValues.damage} damage ${playerAttackValues.hits} times! (Total: ${playerAttackValues.totalDamage})`, "#ffc048");
                }
                
                GameManager.triggerDamageEffects("player");
                GameManager.updateVisualBars();
                
                if (enemy.health <= 0) this.endMatch("win");
            }
        }
    },

    calcSpell: function() {
        if (GameManager.isGameOver) return;

        let cost = (GameManager.currentRealm.type === "umbra") ? 10 : 20;

        if (player.magic < cost) {
            GameManager.printLog("❌ Your essence is drained! Not enough Magic to channel cosmic energy.", "#ff4757");
            return;
        }

        player.magic -= cost;
        let spellDamage = Math.floor((player.strength * 1.5) + (player.maxMagic * 0.8));
        enemy.health = Math.max(0, enemy.health - spellDamage);

        spawnDamageText("-" + spellDamage, document.querySelector(".enemy .card"));

        GameManager.printLog(`✨ You channel your ancestral lineage! Soul Burst detonates for ${spellDamage} magic damage!`, "#ffc048");

        GameManager.triggerDamageEffects("player");
        GameManager.updateVisualBars();

        if (enemy.health <= 0) { this.endMatch("win"); return; }
        this.enemyAttack();
    },

    calcDefend: function() {
        if (GameManager.isGameOver) return;

        player.isDefending = true;
        
        // Elementa Flare environment cancels out all natural resource recovery
        let magicGain = (GameManager.currentRealm.type === "elementa") ? 0 : 15;
        player.magic = Math.min(player.maxMagic, player.magic + magicGain);
        
        if (magicGain > 0) {
            GameManager.printLog("🛡️ You enter a defensive stance, funneling ambient layout pressure into Magic! (+15 MP)", "#4cd137");
        } else {
            GameManager.printLog("🛡️ You brace for impact! (Magic generation disabled by Elementa Flare!)", "#ff6b9d");
        }
        
        GameManager.updateVisualBars();
        this.enemyAttack();
    },

    // Core Consumable Potion Usage Logic
    usePotion: function() {
        if (GameManager.isGameOver) return;
        let p = parseInt(localStorage.getItem("gt_inv_potion")) || 0;
        if (p <= 0) { GameManager.printLog("❌ Your utility slots contain no Essence Vials!", "#ff4757"); return; }
        
        localStorage.setItem("gt_inv_potion", p - 1);
        let heal = Math.floor(player.maxHealth * 0.4); // Restores 40% of max health matrix
        player.health = Math.min(player.maxHealth, player.health + heal);
        
        GameManager.printLog(`🧪 You crush an Essence Vial mid-fight! Recovered ${heal} Vitality points.`, "#4cd137");
        GameManager.updateVisualBars();
        GameManager.setFight(); // Instantly update item quantities rendered on buttons
    },

    // Core Consumable Barrier Shield Usage Logic
    useWard: function() {
        if (GameManager.isGameOver) return;
        let w = parseInt(localStorage.getItem("gt_inv_ward")) || 0;
        if (w <= 0) { GameManager.printLog("❌ Your utility slots contain no Aegis Shields!", "#ff4757"); return; }
        
        localStorage.setItem("gt_inv_ward", w - 1);
        player.hasAegisWard = true;
        
        GameManager.printLog("🛡️ Reality warps! An emergency barrier wraps around your card array.", "#00d2d3");
        GameManager.setFight();
    },

    attack: function(attacker) {
        let modifier = (attacker.magic > 0) ? attacker.magic : attacker.stamina;
        let baseDamage = (attacker.strength * modifier) / 750;
        
        // Apply Elementa physical scaling properties if environment allows it
        if (GameManager.currentRealm && GameManager.currentRealm.type === "elementa" && attacker === player) {
            baseDamage = baseDamage * 1.35;
        }

        let offset = Math.floor(Math.random() * 6) + 3; 
        let totalDamage = Math.floor(baseDamage + offset);
        
        let maxHits = Math.floor(attacker.stamina / 65) + 1;
        let hits = Math.floor(Math.random() * maxHits) + 1;
        
        let finalDamage = totalDamage * hits;
        let critChance = Math.min(40, attacker.stamina / 6); 
        let isCrit = (Math.random() * 100) < critChance;
        
        if (isCrit) finalDamage = Math.floor(finalDamage * 1.75);
        
        return { totalDamage: finalDamage, damage: totalDamage, hits: hits, isCrit: isCrit };
    },

    enemyAttack: function() {
        if (GameManager.isGameOver) return;

        // Verify if active emergency shielding is running
        if (player.hasAegisWard) {
            GameManager.printLog("✨ ABSORB! Your emergency Aegis Barrier shattered but completely blocked the impact matrix!", "#00d2d3");
            player.hasAegisWard = false; // Destroy barrier shield reference
            return;
        }

        let enemyAttackValues = this.attack(enemy);
        let incomingDamage = enemyAttackValues.totalDamage;
        
        // Mundus environment disables standard character model dodge checks
        if (!player.isDefending && GameManager.currentRealm.type !== "mundus") {
            let dodgeChance = Math.min(35, (player.speed / (player.speed + enemy.speed)) * 100);
            if ((Math.random() * 100) < dodgeChance) {
                GameManager.printLog(`💨 Whiff! You swiftly dodged ${enemy.enemyType}'s oncoming swipe!`, "#ffc048");
                return;
            }
        }

        if (player.isDefending) {
            incomingDamage = Math.floor(incomingDamage * 0.3);
            GameManager.printLog("🛡️ Hardened Defenses! You absorbed the bulk of the attack matrix.", "#4cd137");
            player.isDefending = false; 
        }

        player.health = Math.max(0, player.health - incomingDamage);
        GameManager.printLog(`🩸 Enemy hit ${incomingDamage} damage ${enemyAttackValues.hits} times! (Total: ${incomingDamage})`, "#ff6b9d");
        
        GameManager.triggerDamageEffects("enemy");
        GameManager.updateVisualBars();
        
        if (player.health <= 0) this.endMatch("lose");
    },

    endMatch: function(outcome) {
        GameManager.isGameOver = true;
        
        if (outcome === "win") {
            GameManager.currentStreak += 1;
            localStorage.setItem("godthrone_streak", GameManager.currentStreak);
            
            if (GameManager.currentStreak % 2 === 0) {
                GameManager.printLog("🛒 A Shadow Merchant materializes from the spatial folds! Buy an asset:", "#00d2d3");
                document.querySelector(".actions").innerHTML = `
                    <button class="menu-toggle border-red" onclick="PlayerMoves.buyItem('potion')">Buy Essence Vial (+1 Item)</button>
                    <button class="menu-toggle border-teal" onclick="PlayerMoves.buyItem('ward')">Buy Aegis Shield Shard (+1 Item)</button>
                `;
            } else {
                GameManager.printLog(`🏆 VICTORY! Shards collapse. Choose a Cosmic Relic drop:`, "#4cd137");
                let rand1 = Math.floor(Math.random() * this.relicPool.length);
                let rand2 = Math.floor(Math.random() * this.relicPool.length);
                while (rand1 === rand2) { rand2 = Math.floor(Math.random() * this.relicPool.length); }
                let r1 = this.relicPool[rand1]; let r2 = this.relicPool[rand2];

                document.querySelector(".actions").innerHTML = `
                    <button class="menu-toggle border-gold" onclick="PlayerMoves.selectRelic('${r1.stat}', ${r1.value})">Claim ${r1.name} (${r1.msg})</button>
                    <button class="menu-toggle border-gold" onclick="PlayerMoves.selectRelic('${r2.stat}', ${r2.value})">Claim ${r2.name} (${r2.msg})</button>
                `;
            }
        } else {
            GameManager.currentStreak = 0;
            localStorage.setItem("godthrone_streak", 0);
            localStorage.setItem("gt_relic_hp", 0); localStorage.setItem("gt_relic_magic", 0);
            localStorage.setItem("gt_relic_str", 0); localStorage.setItem("gt_relic_stamina", 0); localStorage.setItem("gt_relic_spd", 0);
            localStorage.setItem("gt_inv_potion", "0"); localStorage.setItem("gt_inv_ward", "0");
            
            GameManager.printLog("💀 DEFEATED! Your cosmic run ended and items disintegrated.", "#ff4757");
            document.querySelector(".actions").innerHTML = `
                <button class="menu-toggle border-pink" onclick="window.location.reload()">Return to Character Select</button>
            `;
        }
    },

    // Logic script module handling active market inventory purchases
    buyItem: function(type) {
        let storageKey = `gt_inv_${type}`;
        let currentCount = parseInt(localStorage.getItem(storageKey)) || 0;
        localStorage.setItem(storageKey, currentCount + 1);
        
        GameManager.printLog(`📦 Transaction sealed! Asset packed into temporary item inventory bags.`, "#4cd137");
        document.querySelector(".actions").innerHTML = `
            <button class="menu-toggle" style="animation: RadialGlow 2s infinite;" onclick="GameManager.advanceNextRound()">Advance to Next Trial ⚔️</button>
        `;
    },

    selectRelic: function(stat, value) {
        let storageKey = `gt_relic_${stat}`;
        let currentBonus = parseInt(localStorage.getItem(storageKey)) || 0;
        localStorage.setItem(storageKey, currentBonus + value);
        
        GameManager.printLog(`✨ Relic integrated successfully! Your ${stat} has been augmented.`, "#4cd137");
        document.querySelector(".actions").innerHTML = `
            <button class="menu-toggle" style="animation: RadialGlow 2s infinite;" onclick="GameManager.advanceNextRound()">Advance to Next Trial ⚔️</button>
        `;
    }
};

// Floating damage indicators
function spawnDamageText(text, targetElement) {
    const popup = document.createElement("div");
    popup.classList.add("damage-popup");
    popup.innerText = text;
    
    const rect = targetElement.getBoundingClientRect();
    popup.style.left = (rect.left + rect.width / 2) + "px";
    popup.style.top = (rect.top - 20) + "px";
    
    document.body.appendChild(popup);
    
    setTimeout(() => {
        popup.remove();
    }, 800);
}