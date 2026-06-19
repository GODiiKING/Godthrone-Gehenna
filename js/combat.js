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
                printLog(`🔥 CRITICAL STRIKE! You break their guard for ${playerAttackValues.totalDamage} damage!`, "#ffc048");
            } else {
                printLog(`💥 You hit ${playerAttackValues.damage} damage ${playerAttackValues.hits} times! (Total: ${playerAttackValues.totalDamage})`, "#ffc048");
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
                    printLog(`⚡ COUNTER CRITICAL! You smash them back for ${playerAttackValues.totalDamage} damage!`, "#ffc048");
                } else {
                    printLog(`⚡ You counter-attacked and hit ${playerAttackValues.damage} damage ${playerAttackValues.hits} times! (Total: ${playerAttackValues.totalDamage})`, "#ffc048");
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
            printLog("❌ Your essence is drained! Not enough Magic to channel cosmic energy.", "#ff4757");
            return;
        }

        player.magic -= cost;
        let spellDamage = Math.floor((player.strength * 1.5) + (player.maxMagic * 0.8));
        enemy.health = Math.max(0, enemy.health - spellDamage);

        spawnDamageText("-" + spellDamage, document.querySelector(".enemy .card"));

        printLog(`✨ You channel your ancestral lineage! Soul Burst detonates for ${spellDamage} magic damage!`, "#ffc048");

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
            printLog("🛡️ You enter a defensive stance, funneling ambient layout pressure into Magic! (+15 MP)", "#4cd137");
        } else {
            printLog("🛡️ You brace for impact! (Magic generation disabled by Elementa Flare!)", "#ff6b9d");
        }
        
        GameManager.updateVisualBars();
        this.enemyAttack();
    },

    usePotion: function() {
        if (GameManager.isGameOver) return;
        let p = parseInt(localStorage.getItem("gt_inv_potion")) || 0;
        if (p <= 0) { printLog("❌ Your utility slots contain no Essence Vials!", "#ff4757"); return; }
        
        localStorage.setItem("gt_inv_potion", p - 1);
        let heal = Math.floor(player.maxHealth * 0.4); // Restores 40% of max health matrix
        player.health = Math.min(player.maxHealth, player.health + heal);
        
        printLog(`🧪 You crush an Essence Vial mid-fight! Recovered ${heal} Vitality points.`, "#4cd137");
        GameManager.updateVisualBars();
        GameManager.setFight(); // Instantly update item quantities rendered on buttons
    },

    useWard: function() {
        if (GameManager.isGameOver) return;
        let w = parseInt(localStorage.getItem("gt_inv_ward")) || 0;
        if (w <= 0) { printLog("❌ Your utility slots contain no Aegis Shields!", "#ff4757"); return; }
        
        localStorage.setItem("gt_inv_ward", w - 1);
        player.hasAegisWard = true;
        
        printLog("🛡️ Reality warps! An emergency barrier wraps around your card array.", "#00d2d3");
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
            printLog("✨ ABSORB! Your emergency Aegis Barrier shattered but completely blocked the impact matrix!", "#00d2d3");
            player.hasAegisWard = false; // Destroy barrier shield reference
            return;
        }

        let enemyAttackValues = this.attack(enemy);
        let incomingDamage = enemyAttackValues.totalDamage;
        
        // Mundus environment disables standard character model dodge checks
        if (!player.isDefending && GameManager.currentRealm.type !== "mundus") {
            let dodgeChance = Math.min(35, (player.speed / (player.speed + enemy.speed)) * 100);
            if ((Math.random() * 100) < dodgeChance) {
                printLog(`💨 Whiff! You swiftly dodged ${enemy.enemyType}'s oncoming swipe!`, "#ffc048");
                return;
            }
        }

        if (player.isDefending) {
            incomingDamage = Math.floor(incomingDamage * 0.3);
            printLog("🛡️ Hardened Defenses! You absorbed the bulk of the attack matrix.", "#4cd137");
            player.isDefending = false; 
        }

        player.health = Math.max(0, player.health - incomingDamage);
        printLog(`🩸 Enemy hit ${incomingDamage} damage ${enemyAttackValues.hits} times! (Total: ${incomingDamage})`, "#ff6b9d");
        
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
                printLog("🛒 A Shadow Merchant materializes from the spatial folds! Buy an asset:", "#00d2d3");
                document.querySelector(".actions").innerHTML = `
                    <button class="menu-toggle border-red" onclick="PlayerMoves.buyItem('potion')">Buy Essence Vial (+1 Item)</button>
                    <button class="menu-toggle border-teal" onclick="PlayerMoves.buyItem('ward')">Buy Aegis Shield Shard (+1 Item)</button>
                `;
            } else {
                printLog(`🏆 VICTORY! Shards collapse. Choose a Cosmic Relic drop:`, "#4cd137");
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
            
            printLog("💀 DEFEATED! Your cosmic run ended and items disintegrated.", "#ff4757");
            document.querySelector(".actions").innerHTML = `
                <button class="menu-toggle border-pink" onclick="window.location.reload()">Return to Character Select</button>
            `;
        }
    },

    buyItem: function(type) {
        let storageKey = `gt_inv_${type}`;
        let currentCount = parseInt(localStorage.getItem(storageKey)) || 0;
        localStorage.setItem(storageKey, currentCount + 1);
        
        printLog(`📦 Transaction sealed! Asset packed into temporary item inventory bags.`, "#4cd137");
        document.querySelector(".actions").innerHTML = `
            <button class="menu-toggle" style="animation: RadialGlow 2s infinite;" onclick="GameManager.advanceNextRound()">Advance to Next Trial ⚔️</button>
        `;
    },

    selectRelic: function(stat, value) {
        let storageKey = `gt_relic_${stat}`;
        let currentBonus = parseInt(localStorage.getItem(storageKey)) || 0;
        localStorage.setItem(storageKey, currentBonus + value);
        
        printLog(`✨ Relic integrated successfully! Your ${stat} has been augmented.`, "#4cd137");
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