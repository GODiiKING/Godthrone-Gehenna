const BaseCombat = {
    // Shared generic attack math so we don't repeat it 12 times
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
        
        // Add buff state if character has primed a hook
        if (attacker.state && attacker.state.tempBuff > 0) {
            finalDamage += attacker.state.tempBuff;
            if (attacker === player) attacker.state.tempBuff = 0; // Consume buff
        }

        let critChance = Math.min(40, attacker.stamina / 6); 
        let isCrit = (Math.random() * 100) < critChance;
        if (isCrit) finalDamage = Math.floor(finalDamage * 1.75);
        
        return { totalDamage: finalDamage, damage: totalDamage, hits: hits, isCrit: isCrit };
    },

    applyDamageToEnemy: function(dmgObj) {
        enemy.health = Math.max(0, enemy.health - dmgObj.totalDamage);
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
    "joker": { // 3-hit combo, HP-to-MP defend
        attack: function() {
            let dmgObj = BaseCombat.calculateDamage(player, 3); // Forces 3 hits
            BaseCombat.applyDamageToEnemy(dmgObj);
            return true;
        },
        special: function() {
            if (player.magic < 15) { printLog("❌ Not enough Magic for Material World and Light!", "#ff4757"); return false; }
            player.magic -= 15;
            let spellDamage = Math.floor(player.strength * 1.8);
            enemy.health -= spellDamage;
            spawnDamageText("-" + spellDamage, document.querySelector(".enemy .card"));
            printLog(`✨ MATERIAL WORLD AND LIGHT! Joker bursts for ${spellDamage} damage!`, "#ff6b9d");
            GameManager.triggerDamageEffects("player");
            return true;
        },
        defend: function() {
            player.state.isDefending = true;
            let lostHP = player.maxHealth - player.health;
            let gain = Math.floor(lostHP * 0.25);
            player.magic = Math.min(player.maxMagic, player.magic + gain);
            printLog(`🛡️ Joker grins through the pain! Converted lost HP to +${gain} Magic.`, "#4cd137");
            return true;
        }
    },
    
    "sangunuus": { // Bleed stacks, HP sacrifice
        attack: function() { return PlayerMoves.standardAttackHook(); },
        special: function() {
            if (player.magic < 15) return false;
            player.magic -= 15;
            enemy.state.bleed += 1;
            let dmgObj = BaseCombat.calculateDamage(player, 1);
            BaseCombat.applyDamageToEnemy(dmgObj);
            printLog(`🩸 SHINIGAMI BLESSING! Enemy is bleeding (Stacks: ${enemy.state.bleed})`, "#ff4757");
            return true;
        },
        defend: function() {
            player.state.isDefending = true;
            player.health -= 15; // Sacrifice
            player.state.tempBuff = 40; // Prime next hit
            printLog(`🛡️ Sangunuus sacrifices 15 HP to gorge on blood! Next strike +40 Damage.`, "#ff4757");
            return true;
        }
    },

    "voracium": { // All-in Nuke, MP from Dmg
        attack: function() { return PlayerMoves.standardAttackHook(); },
        special: function() {
            let cost = player.magic;
            if (cost === 0) { printLog("❌ Your essence is empty!", "#ff4757"); return false; }
            player.magic = 0;
            let spellDamage = Math.floor(cost * 3.5 + player.strength);
            enemy.health -= spellDamage;
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

    "khaos": { // Stat theft (Cap 5)
        attack: function() { return PlayerMoves.standardAttackHook(); },
        special: function() {
            if (player.magic < 20) return false;
            player.magic -= 20;
            
            if (player.state.stacks > 0 && player.state.theftCap < 5) {
                player.state.theftCap++;
                player.strength += 10; enemy.strength -= 10;
                player.speed += 10; enemy.speed -= 10;
                player.state.stacks--;
                printLog(`🥷 TWIN OBSCENITIES! Khaos permanently steals stats! (Theft Cap: ${player.state.theftCap}/5)`, "#ff6b9d");
            } else {
                let spellDamage = Math.floor(player.strength * 1.5);
                enemy.health -= spellDamage;
                spawnDamageText("-" + spellDamage, document.querySelector(".enemy .card"));
                printLog(`🥷 Khaos strikes from the shadows for ${spellDamage} damage!`, "#ffc048");
            }
            GameManager.triggerDamageEffects("player");
            return true;
        },
        defend: function() {
            player.state.isDefending = true;
            if (player.state.stacks < 3) player.state.stacks++;
            printLog(`🛡️ Khaos vanishes into the shadow. Next Twin Obscenities will siphon stats! (Primes: ${player.state.stacks}/3)`, "#4cd137");
            return true;
        }
    },

    "kosmos": { // Deflection/Omnicide
        attack: function() { return PlayerMoves.standardAttackHook(); },
        special: function() {
            if (player.magic < 15) return false;
            player.magic -= 15;
            let mult = 1 + (player.state.stacks * 0.5);
            let spellDamage = Math.floor((player.strength * 1.2) * mult);
            player.state.stacks = 0; // Consume
            enemy.health -= spellDamage;
            spawnDamageText("-" + spellDamage, document.querySelector(".enemy .card"));
            printLog(`🌌 DIMENSIONAL OMNICIDE! Space shatters for ${spellDamage} damage!`, "#ffc048");
            GameManager.triggerDamageEffects("player");
            return true;
        },
        defend: function() {
            player.state.isDefending = true;
            player.state.stacks++;
            printLog(`🛡️ Kosmos shifts reality. Omnicide Stack gained! (Stacks: ${player.state.stacks})`, "#4cd137");
            return true;
        }
    },

    "malignis": { // Loop brawler
        attack: function() { return PlayerMoves.standardAttackHook(); },
        special: function() {
            if (player.magic < 10) return false;
            player.magic -= 10;
            let dmg = Math.floor(player.strength + (player.state.stacks * 35));
            enemy.health -= dmg;
            player.state.stacks = 0;
            spawnDamageText("-" + dmg, document.querySelector(".enemy .card"));
            printLog(`🛡️ SOULREND DECIMATOR! Malignis executes for ${dmg} damage!`, "#ffc048");
            GameManager.triggerDamageEffects("player");
            return true;
        },
        defend: function() {
            player.state.isDefending = true;
            player.state.stacks++; // 0 MP cost
            printLog(`🛡️ Malignis readies the arena! Gladiator Stack +1 (Free Action).`, "#4cd137");
            return true;
        }
    },

    "excidi": { // Permanent HP stacking
        attack: function() { return PlayerMoves.standardAttackHook(); },
        special: function() {
            if (player.magic < 20) return false;
            player.magic -= 20;
            if (player.state.stacks > 0 && player.state.theftCap < 3) {
                player.state.theftCap++;
                player.maxHealth += 30; player.health += 30;
                player.state.stacks--;
                printLog(`☠️ NECROPULSE REAPER! Excidi permanently expands Max HP! (Cap: ${player.state.theftCap}/3)`, "#ff6b9d");
            } else {
                let dmg = Math.floor(player.strength * 1.5 + (player.maxHealth * 0.2));
                enemy.health -= dmg;
                spawnDamageText("-" + dmg, document.querySelector(".enemy .card"));
                printLog(`☠️ Excidi slams the Reaper for ${dmg} damage!`, "#ffc048");
            }
            GameManager.triggerDamageEffects("player");
            return true;
        },
        defend: function() {
            player.state.isDefending = true;
            player.state.stacks++;
            printLog(`🛡️ Excidi hardens their frame. Special primed for Max HP harvest!`, "#4cd137");
            return true;
        }
    },

    "dominor": { // Inverse scaling
        attack: function() { return PlayerMoves.standardAttackHook(); },
        special: function() {
            let cost = player.magic;
            player.magic = 0; // Drains all
            let inverseScale = player.maxMagic - cost; // More damage if lower magic
            let dmg = Math.floor(player.strength * 1.5 + inverseScale * 2);
            enemy.health -= dmg;
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
    },

    "arma": { // Spellblade Health Stacker
        attack: function() { return PlayerMoves.standardAttackHook(); },
        special: function() {
            if (player.magic < 15) return false;
            player.magic -= 15;
            let dmg = Math.floor(player.strength * 1.8 + (player.state.theftCap * 25));
            enemy.health -= dmg;
            spawnDamageText("-" + dmg, document.querySelector(".enemy .card"));
            printLog(`🔮 INFINITE INFINITUS! Arma strikes with augmented vitality for ${dmg} damage!`, "#ffc048");
            GameManager.triggerDamageEffects("player");
            return true;
        },
        defend: function() {
            player.state.isDefending = true;
            if (player.state.theftCap < 3) player.state.theftCap++;
            printLog(`🛡️ Arma reinforces their armor. Health Stack +1! (Cap: ${player.state.theftCap}/3)`, "#4cd137");
            return true;
        }
    },

    "illusor": { // Illusion Mind-Games
        attack: function() { return PlayerMoves.standardAttackHook(); },
        special: function() {
            if (player.magic < 10) return false;
            player.magic -= 10;
            player.state.stacks += 2;
            printLog(`🌌 STALKER AMONG STAR! Illusor builds 2 tracking stacks. (Total: ${player.state.stacks})`, "#ff6b9d");
            return true;
        },
        defend: function() {
            player.state.isDefending = true;
            if (player.state.stacks > 0) {
                player.state.tempBuff = player.state.stacks * 30;
                player.state.stacks = 0;
                printLog(`🛡️ Illusor shatters the illusion! Next attack gains massive +${player.state.tempBuff} Damage!`, "#4cd137");
            } else {
                printLog(`🛡️ Illusor defends. (No illusions to shatter)`, "#4cd137");
            }
            return true;
        }
    },

    "amanuen": { // Counter-Mage
        attack: function() { 
            if (player.state.stacks > 0) { player.state.tempBuff = 20; player.state.stacks--; }
            return PlayerMoves.standardAttackHook(); 
        },
        special: function() {
            if (player.magic < 15) return false;
            player.magic -= 15;
            let buff = (player.state.stacks > 0) ? 1.5 : 1;
            if (player.state.stacks > 0) player.state.stacks--;
            let dmg = Math.floor(player.strength * 1.4 * buff);
            enemy.health -= dmg;
            spawnDamageText("-" + dmg, document.querySelector(".enemy .card"));
            printLog(`🪄 SCOURGE OF CREATION! Amanuen conjures ${dmg} damage!`, "#ffc048");
            GameManager.triggerDamageEffects("player");
            return true;
        },
        defend: function() {
            player.state.isDefending = true;
            player.state.stacks += 2;
            printLog(`🛡️ Amanuen prepares a counter. Shared Empowerment Stacks +2!`, "#4cd137");
            return true;
        }
    },

    "deus": { // Kinetic Siphon Warlock
        attack: function() { return PlayerMoves.standardAttackHook(); },
        special: function() {
            if (player.magic < 15) return false;
            player.magic -= 15;
            let dmg = Math.floor(player.strength * 1.6 + player.state.tempBuff);
            player.state.tempBuff = 0;
            enemy.health -= dmg;
            spawnDamageText("-" + dmg, document.querySelector(".enemy .card"));
            printLog(`👁️ AUTHORITY OVER ENDING! Deus warps reality for ${dmg} damage!`, "#ffc048");
            GameManager.triggerDamageEffects("player");
            return true;
        },
        defend: function() {
            player.state.isDefending = true;
            player.state.mpGainFromDmg = true; // Reusing this boolean to trigger Deus' siphon
            printLog(`🛡️ Deus activates Kinetic Siphon. Ready to absorb impact!`, "#4cd137");
            return true;
        }
    }
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
        // --- FIXED: Immediate innerHTML wipe and enemy = null lines removed here ---
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