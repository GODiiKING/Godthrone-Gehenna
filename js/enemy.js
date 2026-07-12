// js/enemy.js

const EnemyMechanics = {
    "joker": {
        attack: () => EnemyAI.standardAttackHook(3), // Forces 3 hits
        special: () => {
            if (enemy.magic < 15) return false;
            enemy.magic -= 15;
            let dmg = Math.floor(enemy.strength * 1.8);
            EnemyAI.applyDamageToPlayer(dmg, 1, true, `✨ MATERIAL WORLD! ${enemy.enemyType} bursts for ${dmg} damage!`);
            return true;
        },
        defend: () => {
            enemy.state.isDefending = true;
            let lostHP = enemy.maxHealth - enemy.health;
            let gain = Math.floor(lostHP * 0.25);
            enemy.magic = Math.min(enemy.maxMagic, enemy.magic + gain);
            printLog(`🛡️ ${enemy.enemyType} grins! Converted lost HP to +${gain} Magic.`, "#ff6b9d");
            EnemyAI.endTurnSafely();
            return true;
        }
    },
    
    "sangunuus": {
        attack: () => EnemyAI.standardAttackHook(),
        special: () => {
            if (enemy.magic < 15) return false;
            enemy.magic -= 15;
            // Initialize player bleed state if it doesn't exist
            if (typeof player.state.bleed === "undefined") player.state.bleed = 0;
            player.state.bleed += 1;
            
            let dmgObj = BaseCombat.calculateDamage(enemy, 1);
            EnemyAI.applyDamageToPlayer(dmgObj.totalDamage, 1, true, `🩸 SHINIGAMI BLESSING! You are bleeding (Stacks: ${player.state.bleed})`);
            return true;
        },
        defend: () => {
            enemy.state.isDefending = true;
            enemy.health -= 15;
            enemy.state.tempBuff = 40;
            printLog(`🛡️ ${enemy.enemyType} sacrifices 15 HP! Next strike +40 Damage.`, "#ff6b9d");
            EnemyAI.endTurnSafely();
            return true;
        }
    },

    "voracium": {
        attack: () => EnemyAI.standardAttackHook(),
        special: () => {
            let cost = enemy.magic;
            if (cost < 15) return false; // AI won't waste it on low MP
            enemy.magic = 0;
            let dmg = Math.floor(cost * 3.5 + enemy.strength);
            EnemyAI.applyDamageToPlayer(dmg, 1, true, `👹 FALSE SOVEREIGN! ${enemy.enemyType} dumps ALL magic for ${dmg} damage!`);
            return true;
        },
        defend: () => {
            enemy.state.isDefending = true;
            enemy.state.mpGainFromDmg = true;
            printLog(`🛡️ ${enemy.enemyType} embraces slaughter! Incoming damage converts to Magic.`, "#ff6b9d");
            EnemyAI.endTurnSafely();
            return true;
        }
    },

    "khaos": {
        attack: () => EnemyAI.standardAttackHook(),
        special: () => {
            if (enemy.magic < 20) return false;
            enemy.magic -= 20;
            if (enemy.state.stacks > 0 && enemy.state.theftCap < 5) {
                enemy.state.theftCap++;
                enemy.strength += 10; player.strength -= 10;
                enemy.speed += 10; player.speed -= 10;
                enemy.state.stacks--;
                printLog(`🥷 TWIN OBSCENITIES! ${enemy.enemyType} permanently stole your stats!`, "#ff6b9d");
                EnemyAI.endTurnSafely();
            } else {
                let dmg = Math.floor(enemy.strength * 1.5);
                EnemyAI.applyDamageToPlayer(dmg, 1, true, `🥷 ${enemy.enemyType} strikes from the shadows for ${dmg} damage!`);
            }
            return true;
        },
        defend: () => {
            enemy.state.isDefending = true;
            if (enemy.state.stacks < 3) enemy.state.stacks++;
            printLog(`🛡️ ${enemy.enemyType} vanishes. Next Obscenity siphons stats!`, "#ff6b9d");
            EnemyAI.endTurnSafely();
            return true;
        }
    },

    "kosmos": {
        attack: () => EnemyAI.standardAttackHook(),
        special: () => {
            if (enemy.magic < 15) return false;
            enemy.magic -= 15;
            let mult = 1 + (enemy.state.stacks * 0.5);
            let dmg = Math.floor((enemy.strength * 1.2) * mult);
            enemy.state.stacks = 0;
            EnemyAI.applyDamageToPlayer(dmg, 1, true, `🌌 DIMENSIONAL OMNICIDE! Space shatters for ${dmg} damage!`);
            return true;
        },
        defend: () => {
            enemy.state.isDefending = true;
            enemy.state.stacks++;
            printLog(`🛡️ ${enemy.enemyType} shifts reality. Omnicide Stack +1!`, "#ff6b9d");
            EnemyAI.endTurnSafely();
            return true;
        }
    },

    "malignis": {
        attack: () => EnemyAI.standardAttackHook(),
        special: () => {
            if (enemy.magic < 10) return false;
            enemy.magic -= 10;
            let dmg = Math.floor(enemy.strength + (enemy.state.stacks * 35));
            enemy.state.stacks = 0;
            EnemyAI.applyDamageToPlayer(dmg, 1, true, `🛡️ SOULREND DECIMATOR! ${enemy.enemyType} executes for ${dmg} damage!`);
            return true;
        },
        defend: () => {
            enemy.state.isDefending = true;
            enemy.state.stacks++;
            printLog(`🛡️ ${enemy.enemyType} readies the arena! Gladiator Stack +1.`, "#ff6b9d");
            EnemyAI.endTurnSafely();
            return true;
        }
    },

    "excidi": {
        attack: () => EnemyAI.standardAttackHook(),
        special: () => {
            if (enemy.magic < 20) return false;
            enemy.magic -= 20;
            if (enemy.state.stacks > 0 && enemy.state.theftCap < 3) {
                enemy.state.theftCap++;
                enemy.maxHealth += 30; enemy.health += 30;
                enemy.state.stacks--;
                printLog(`☠️ NECROPULSE REAPER! ${enemy.enemyType} permanently expands Max HP!`, "#ff6b9d");
                EnemyAI.endTurnSafely();
            } else {
                let dmg = Math.floor(enemy.strength * 1.5 + (enemy.maxHealth * 0.2));
                EnemyAI.applyDamageToPlayer(dmg, 1, true, `☠️ ${enemy.enemyType} slams the Reaper for ${dmg} damage!`);
            }
            return true;
        },
        defend: () => {
            enemy.state.isDefending = true;
            enemy.state.stacks++;
            printLog(`🛡️ ${enemy.enemyType} hardens. Special primed for Max HP harvest!`, "#ff6b9d");
            EnemyAI.endTurnSafely();
            return true;
        }
    },

    "dominor": {
        attack: () => EnemyAI.standardAttackHook(),
        special: () => {
            let cost = enemy.magic;
            if (cost < 10) return false;
            enemy.magic = 0;
            let inverseScale = enemy.maxMagic - cost;
            let dmg = Math.floor(enemy.strength * 1.5 + inverseScale * 2);
            EnemyAI.applyDamageToPlayer(dmg, 1, true, `⚖️ MEMENTO MORI! ${enemy.enemyType} drains their magic for ${dmg} damage!`);
            return true;
        },
        defend: () => {
            enemy.state.isDefending = true;
            let missingMP = enemy.maxMagic - enemy.magic;
            enemy.state.tempBuff = Math.floor(missingMP * 0.8);
            printLog(`🛡️ ${enemy.enemyType} balances the scales. Next attack gains +${enemy.state.tempBuff} Damage!`, "#ff6b9d");
            EnemyAI.endTurnSafely();
            return true;
        }
    },

    "arma": {
        attack: () => EnemyAI.standardAttackHook(),
        special: () => {
            if (enemy.magic < 15) return false;
            enemy.magic -= 15;
            let dmg = Math.floor(enemy.strength * 1.8 + (enemy.state.theftCap * 25));
            EnemyAI.applyDamageToPlayer(dmg, 1, true, `🔮 INFINITE INFINITUS! ${enemy.enemyType} strikes with augmented vitality for ${dmg}!`);
            return true;
        },
        defend: () => {
            enemy.state.isDefending = true;
            if (enemy.state.theftCap < 3) enemy.state.theftCap++;
            printLog(`🛡️ ${enemy.enemyType} reinforces armor. Health Stack +1!`, "#ff6b9d");
            EnemyAI.endTurnSafely();
            return true;
        }
    },

    "illusor": {
        attack: () => EnemyAI.standardAttackHook(),
        special: () => {
            if (enemy.magic < 10) return false;
            enemy.magic -= 10;
            enemy.state.stacks += 2;
            printLog(`🌌 STALKER AMONG STAR! ${enemy.enemyType} builds 2 tracking stacks.`, "#ff6b9d");
            EnemyAI.endTurnSafely();
            return true;
        },
        defend: () => {
            enemy.state.isDefending = true;
            if (enemy.state.stacks > 0) {
                enemy.state.tempBuff = enemy.state.stacks * 30;
                enemy.state.stacks = 0;
                printLog(`🛡️ ${enemy.enemyType} shatters illusions! Next attack +${enemy.state.tempBuff} Damage!`, "#ff6b9d");
            } else {
                printLog(`🛡️ ${enemy.enemyType} defends the shadows.`, "#ff6b9d");
            }
            EnemyAI.endTurnSafely();
            return true;
        }
    },

    "amanuen": {
        attack: () => {
            if (enemy.state.stacks > 0) { enemy.state.tempBuff = 20; enemy.state.stacks--; }
            return EnemyAI.standardAttackHook();
        },
        special: () => {
            if (enemy.magic < 15) return false;
            enemy.magic -= 15;
            let buff = (enemy.state.stacks > 0) ? 1.5 : 1;
            if (enemy.state.stacks > 0) enemy.state.stacks--;
            let dmg = Math.floor(enemy.strength * 1.4 * buff);
            EnemyAI.applyDamageToPlayer(dmg, 1, true, `🪄 SCOURGE OF CREATION! ${enemy.enemyType} conjures ${dmg} damage!`);
            return true;
        },
        defend: () => {
            enemy.state.isDefending = true;
            enemy.state.stacks += 2;
            printLog(`🛡️ ${enemy.enemyType} prepares a counter. Empowerment Stacks +2!`, "#ff6b9d");
            EnemyAI.endTurnSafely();
            return true;
        }
    },

    "deus": {
        attack: () => EnemyAI.standardAttackHook(),
        special: () => {
            if (enemy.magic < 15) return false;
            enemy.magic -= 15;
            let dmg = Math.floor(enemy.strength * 1.6 + enemy.state.tempBuff);
            enemy.state.tempBuff = 0;
            EnemyAI.applyDamageToPlayer(dmg, 1, true, `👁️ AUTHORITY OVER ENDING! ${enemy.enemyType} warps reality for ${dmg} damage!`);
            return true;
        },
        defend: () => {
            enemy.state.isDefending = true;
            enemy.state.mpGainFromDmg = true;
            printLog(`🛡️ ${enemy.enemyType} activates Kinetic Siphon. Ready to absorb impact!`, "#ff6b9d");
            EnemyAI.endTurnSafely();
            return true;
        }
    }
};

const EnemyAI = {
    executeTurn: function() {
        // --- SAFETY INITIALIZERS TO PREVENT NaN ---
        if (!enemy.state) enemy.state = {};
        if (typeof enemy.state.stacks === "undefined") enemy.state.stacks = 0;
        if (typeof enemy.state.tempBuff === "undefined") enemy.state.tempBuff = 0;
        if (typeof enemy.state.theftCap === "undefined") enemy.state.theftCap = 0;
        if (typeof enemy.state.isDefending === "undefined") enemy.state.isDefending = false;
        if (typeof enemy.state.mpGainFromDmg === "undefined") enemy.state.mpGainFromDmg = false;
        // ------------------------------------------

        // Extract base class name even if they are a Boss/Overlord
        let eClass = Object.keys(CharacterDatabase).find(key => enemy.enemyType.toLowerCase().includes(key)) || "joker";
        let mechanic = EnemyMechanics[eClass];

        let hpPercent = enemy.health / enemy.maxHealth;
        let wantsToDefend = false;
        let wantsToSpecial = false;

        // --- INTELLIGENCE LOGIC ---
        // 1. Survival instinct
        if (hpPercent < 0.3 && Math.random() < 0.5) wantsToDefend = true;

        // 2. Tactical Stack Building
        if (["kosmos", "malignis", "illusor", "excidi", "amanuen"].includes(eClass) && enemy.state.stacks === 0) {
            if (Math.random() < 0.6) wantsToDefend = true; 
        }

        // 3. Special Ability Triggers
        if (enemy.magic >= 15 && !wantsToDefend) {
            // High chance to unleash hell if they have the mana
            if (Math.random() < 0.65) wantsToSpecial = true;
        }

        // 4. Custom Class Logic
        if (eClass === "voracium" || eClass === "dominor") {
            if (enemy.magic > 40) wantsToSpecial = true; // Wait until MP is high to nuke
        }
        if (eClass === "sangunuus" && enemy.health > 40 && enemy.state.tempBuff === 0) {
            if (Math.random() < 0.4) wantsToDefend = true; // Sacrifice HP for buff
        }

        // --- EXECUTION ---
        if (wantsToSpecial && mechanic && mechanic.special) {
            let success = mechanic.special();
            if (!success) this.standardAttackHook();
        } else if (wantsToDefend && mechanic && mechanic.defend) {
            mechanic.defend();
        } else if (wantsToDefend) {
            // Generic Defend fallback
            enemy.state.isDefending = true;
            enemy.magic = Math.min(enemy.maxMagic, enemy.magic + 15);
            printLog(`🛡️ ${enemy.enemyType} braces for impact. (+15 MP)`, "#ff6b9d");
            this.endTurnSafely();
        } else {
            if (mechanic && mechanic.attack) mechanic.attack();
            else this.standardAttackHook();
        }
    },

    standardAttackHook: function(forcedHits = null) {
        // Apply temporary attacker damage buffs safely if they exist
        let originalStrength = enemy.strength;
        if (enemy.state && enemy.state.tempBuff) {
            enemy.strength += enemy.state.tempBuff;
        }

        let dmgObj = BaseCombat.calculateDamage(enemy, forcedHits);
        
        // Reset strength after calculations are processed
        enemy.strength = originalStrength;
        if (enemy.state) enemy.state.tempBuff = 0;

        this.applyDamageToPlayer(dmgObj.totalDamage, dmgObj.hits, false);
        return true;
    },

    // Handles player evasion, player defending, and siphoning mechanics
    applyDamageToPlayer: function(baseDamage, hits, isSpell, customMessage) {
        let incomingDamage = Number(baseDamage) || 0; // Absolute fallback protection

        // Evasion (Only works on Physical attacks, not spells, not Mundus realm)
        if (!isSpell && !player.state.isDefending && GameManager.currentRealm && GameManager.currentRealm.type !== "mundus") {
            let dodgeChance = Math.min(35, (player.speed / (player.speed + enemy.speed)) * 100);
            if ((Math.random() * 100) < dodgeChance) {
                printLog(`💨 Whiff! You swiftly dodged ${enemy.enemyType}'s oncoming attack!`, "#ffc048");
                this.endTurnSafely();
                return;
            }
        }

        // Player Defensive Siphons & Reductions
        if (player.state.isDefending) {
            let pClass = player.classType.toLowerCase();
            if (pClass === "deus" && player.state.mpGainFromDmg) {
                incomingDamage = Math.floor(incomingDamage * 0.2);
                let heal = Math.floor(incomingDamage);
                player.health = Math.min(player.maxHealth, player.health + heal);
                player.state.tempBuff += 25;
                printLog(`👁️ Kinetic Siphon! You absorbed the blow, healed for ${heal}, and gained +25 Buff!`, "#4cd137");
            } else if (pClass === "voracium" && player.state.mpGainFromDmg) {
                incomingDamage = Math.floor(incomingDamage * 0.5);
                player.magic = Math.min(player.maxMagic, player.magic + 25);
                printLog(`👹 Blood to Magic! You tank the hit and gain +25 MP!`, "#4cd137");
            } else {
                incomingDamage = Math.floor(incomingDamage * 0.3);
                printLog("🛡️ Hardened Defenses! You absorbed the bulk of the attack.", "#4cd137");
            }
            player.state.isDefending = false; 
            player.state.mpGainFromDmg = false;
        }

        player.health = Math.max(0, player.health - incomingDamage);
        
        if (customMessage) {
            printLog(customMessage, "#ff6b9d");
        } else {
            printLog(`🩸 ${enemy.enemyType} hit ${incomingDamage} damage (${hits} hits)!`, "#ff6b9d");
        }

        // Target the player card for the visual damage number
        let playerCard = document.querySelector("#character-grid .card");
        if (playerCard) spawnDamageText("-" + incomingDamage, playerCard);
        
        GameManager.triggerDamageEffects("enemy");
        this.endTurnSafely();
    },

    endTurnSafely: function() {
        GameManager.updateVisualBars();
        if (player.health <= 0) {
            PlayerMoves.endMatch("lose");
        } else {
            PlayerMoves.processTurnEnd();
        }
    }
};