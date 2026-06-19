// js/combat.js
let PlayerMoves = {
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
                spawnDamageText("-" + playerAttackValues.totalDamage, document.querySelector(".enemy .card"));
                
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

    attack: function(attacker) {
        let modifier = (attacker.magic > 0) ? attacker.magic : attacker.stamina;
        let baseDamage = (attacker.strength * modifier) / 750;
        
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

        let enemyAttackValues = this.attack(enemy);
        let incomingDamage = enemyAttackValues.totalDamage;
        
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
            
            printLog(`🏆 VICTORY! You have conquered this trial round.`, "#4cd137");
            document.querySelector(".actions").innerHTML = `
                <button class="menu-toggle" style="animation: RadialGlow 2s infinite;" onclick="GameManager.setGameStart(GameManager.selectedClass)">Advance to Next Trial ⚔️</button>
            `;
        } else {
            GameManager.currentStreak = 0;
            localStorage.setItem("godthrone_streak", 0);
            
            printLog("💀 DEFEATED! Your cosmic run has collapsed.", "#ff4757");
            document.querySelector(".actions").innerHTML = `
                <button class="menu-toggle border-pink" onclick="window.location.reload()">Return to Character Select</button>
            `;
        }
    }
};

function spawnDamageText(text, targetElement) {
    const popup = document.createElement("div");
    popup.classList.add("damage-popup");
    popup.innerText = text;
    
    const rect = targetElement.getBoundingClientRect();
    popup.style.left = (rect.left + rect.width / 2) + "px";
    popup.style.top = (rect.top - 20) + "px";
    
    document.body.appendChild(popup);
    setTimeout(() => { popup.remove(); }, 800);
}