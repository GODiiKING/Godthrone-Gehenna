const BaseCombat = {
    // Universal "Bank" for all resource changes
    modifyResource: function(entity, stat, amount, isCost = false) {
        if (isCost && amount === "ALL") {
            amount = entity[stat];
            if (amount <= 0) {
                printLog(`❌ Not enough ${stat} to perform this action!`, "#ff4757");
                return false;
            }
        }

        if (isCost) {
            if (entity[stat] < amount) {
                printLog(`❌ Not enough ${stat} to perform this action!`, "#ff4757");
                return false;
            }
            entity[stat] -= amount;
        } else {
            // For raw damage, we allow it to reach 0 (or stay at 0)
            entity[stat] = Math.max(0, entity[stat] - amount);
        }
        
        GameManager.updateVisualBars();
        return true;
    },

    calculateDamage: function(attacker, forcedHits = null) {
        let modifier = (attacker.magic > 0) ? attacker.magic : attacker.stamina;
        let baseDamage = (attacker.strength * modifier) / 750;
        
        if (GameManager.currentRealm && GameManager.currentRealm.type === "elementa" && attacker === player) {
            baseDamage = baseDamage * 1.35;
        }

        let offset = Math.floor(Math.random() * 6) + 3; 
        let totalDamage = Math.floor(baseDamage + offset);
        
        let maxHits = Math.floor(attacker.stamina / 65) + 1;
        let hits = forcedHits !== null ? forcedHits : Math.floor(Math.random() * maxHits) + 1;
        
        let finalDamage = totalDamage * hits;
        
        if (attacker.state && attacker.state.tempBuff > 0) {
            finalDamage += attacker.state.tempBuff;
            if (attacker === player) attacker.state.tempBuff = 0;
        }

        let critChance = Math.min(40, attacker.stamina / 6); 
        let isCrit = (Math.random() * 100) < critChance;
        if (isCrit) finalDamage = Math.floor(finalDamage * 1.75);
        
        return { totalDamage: finalDamage, damage: totalDamage, hits: hits, isCrit: isCrit };
    },

    applyDamageToEnemy: function(dmgObj) {
        this.modifyResource(enemy, "health", dmgObj.totalDamage, false);
        spawnDamageText("-" + dmgObj.totalDamage, document.querySelector(".enemy .card"));
        
        if (dmgObj.isCrit) {
            printLog(`🔥 CRITICAL! You shatter their guard for ${dmgObj.totalDamage} damage!`, "#ffc048");
        } else {
            printLog(`💥 You deal ${dmgObj.totalDamage} damage (${dmgObj.hits} hits)!`, "#ffc048");
        }
        GameManager.triggerDamageEffects("player");
    }
};

const CharacterMechanics = {
    "joker": {
        attack: function() { 
            BaseCombat.applyDamageToEnemy(BaseCombat.calculateDamage(player, 3)); 
            return true; 
        },
        special: function() {
            if (!BaseCombat.modifyResource(player, "magic", 15, true)) return false;
            let spellDamage = Math.floor(player.strength * 1.8);
            BaseCombat.modifyResource(enemy, "health", spellDamage, false);
            spawnDamageText("-" + spellDamage, document.querySelector(".enemy .card"));
            printLog(`✨ MATERIAL WORLD AND LIGHT! Joker bursts for ${spellDamage} damage!`, "#ff6b9d");
            GameManager.triggerDamageEffects("player");
            return true;
        },
        defend: function() {
            player.state.isDefending = true;
            let gain = Math.floor((player.maxHealth - player.health) * 0.25);
            player.magic = Math.min(player.maxMagic, player.magic + gain);
            printLog(`🛡️ Joker grins through the pain! Converted lost HP to +${gain} Magic.`, "#4cd137");
            return true;
        }
    },
    "sangunuus": {
        attack: function() { return PlayerMoves.standardAttackHook(); },
        special: function() {
            if (!BaseCombat.modifyResource(player, "magic", 15, true)) return false;
            enemy.state.bleed += 1;
            BaseCombat.applyDamageToEnemy(BaseCombat.calculateDamage(player, 1));
            printLog(`🩸 SHINIGAMI BLESSING! Enemy is bleeding (Stacks: ${enemy.state.bleed})`, "#ff4757");
            return true;
        },
        defend: function() {
            player.state.isDefending = true;
            if (!BaseCombat.modifyResource(player, "health", 15, true)) return false; 
            player.state.tempBuff = 40;
            printLog(`🛡️ Sangunuus sacrifices 15 HP to gorge on blood! Next strike +40 Damage.`, "#ff4757");
            return true;
        }
    },
    "voracium": {
        attack: function() { return PlayerMoves.standardAttackHook(); },
        special: function() {
            let cost = player.magic;
            if (!BaseCombat.modifyResource(player, "magic", "ALL", true)) return false;
            
            let spellDamage = Math.floor(cost * 3.5 + player.strength);
            BaseCombat.modifyResource(enemy, "health", spellDamage, false);
            spawnDamageText("-" + spellDamage, document.querySelector(".enemy .card"));
            printLog(`👹 FALSE SOVEREIGN! Voracium dumps ALL magic for a catastrophic ${spellDamage} damage!`, "#ffc048");
            GameManager.triggerDamageEffects("player");
            return true;
        },
        defend: function() {
            player.state.isDefending = true;
            player.state.mpGainFromDmg = true;
            printLog(`🛡️ Voracium embraces the slaughter! Incoming damage will convert to Magic.`, "#4cd137");
            return true;
        }
    },
    "dominor": {
        attack: function() { return PlayerMoves.standardAttackHook(); },
        special: function() {
            let cost = player.magic;
            if (!BaseCombat.modifyResource(player, "magic", "ALL", true)) return false;
            
            let inverseScale = player.maxMagic - cost; 
            let dmg = Math.floor(player.strength * 1.5 + inverseScale * 2);
            BaseCombat.modifyResource(enemy, "health", dmg, false);
            spawnDamageText("-" + dmg, document.querySelector(".enemy .card"));
            printLog(`⚖️ MEMENTO MORI! Dominor drains the rest of their magic for ${dmg} damage!`, "#ffc048");
            GameManager.triggerDamageEffects("player");
            return true;
        },
        defend: function() {
            player.state.isDefending = true;
            let missingMP = player.maxMagic - player.magic;
            player.state.tempBuff = Math.floor(missingMP * 0.8);
            printLog(`🛡️ Dominor balances the scales. Next attack gains +${player.state.tempBuff} Damage!`, "#4cd137");
            return true;
        }
    }
    // ... Repeat this pattern for all other classes!
};

let PlayerMoves = {
    // Helper for classes that just use the normal attack button
    standardAttackHook: function() {
        let dmgObj = BaseCombat.calculateDamage(player);
        BaseCombat.applyDamageToEnemy(dmgObj);
        return true;
    },

    // --- MAIN ROUTERS ---
    calcAttack: function() {
        if (GameManager.isGameOver) return;
        let pClass = player.classType.toLowerCase();
        let mechanic = CharacterMechanics[pClass];

        let turnValid = mechanic ? mechanic.attack() : this.standardAttackHook();
        if (turnValid) this.postPlayerAction();
    },

    calcSpell: function() {
        if (GameManager.isGameOver) return;
        let pClass = player.classType.toLowerCase();
        let mechanic = CharacterMechanics[pClass];

        let turnValid = mechanic ? mechanic.special() : false;
        if (turnValid) this.postPlayerAction();
    },

    calcDefend: function() {
        if (GameManager.isGameOver) return;
        let pClass = player.classType.toLowerCase();
        let mechanic = CharacterMechanics[pClass];

        if (mechanic && mechanic.defend) {
            mechanic.defend();
        } else {
            player.state.isDefending = true;
            player.magic = Math.min(player.maxMagic, player.magic + 15);
            printLog("🛡️ You enter a defensive stance. (+15 MP)", "#4cd137");
        }
        this.postPlayerAction();
    },

    postPlayerAction: function() {
        GameManager.updateVisualBars();
        if (enemy.health <= 0) { this.endMatch("win"); return; }
        
        // Timeout to let the player read their action before enemy hits back
        setTimeout(() => { this.enemyAttack(); }, 600);
    },

    enemyAttack: function() {
        if (GameManager.isGameOver) return;
        
        // Hand the turn over to our new smart AI!
        EnemyAI.executeTurn();
    },

    processTurnEnd: function() {
        // Handle Sangunuus Bleed Tick
        if (enemy.state.bleed > 0) {
            let bleedDmg = enemy.state.bleed * 12;
            enemy.health = Math.max(0, enemy.health - bleedDmg);
            spawnDamageText("-" + bleedDmg, document.querySelector(".enemy .card"));
            printLog(`🩸 Bleed toxicity damages enemy for ${bleedDmg}!`, "#ff4757");
            GameManager.updateVisualBars();
            
            if (enemy.health <= 0) this.endMatch("win");
        }
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