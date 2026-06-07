let player;

function Player(classType, health, mana, strength, agility, speed) {
    this.classType = classType;
    this.health = health;
    this.mana = mana;
    this.strength = strength;
    this.agility = agility;
    this.speed = speed;
}

let PlayerMoves = {
    calcAttack: function() {
        let getPlayerSpeed = player.speed;
        let getEnemySpeed = enemy.speed;
        let getPlayerHealth = document.querySelector(".health-player");
        let getEnemyHealth = document.querySelector(".health-enemy");

        if (getPlayerSpeed >= getEnemySpeed) {
            let playerAttackValues = this.attack(player);
            enemy.health -= playerAttackValues.totalDamage;
            alert(`You hit ${playerAttackValues.damage} damage ${playerAttackValues.hits} times.`);
            
            if (enemy.health <= 0) {
                alert("You win! Refresh the browser to play again.");
                getEnemyHealth.innerHTML = "Health: 0";
                return;
            } else {
                getEnemyHealth.innerHTML = "Health: " + enemy.health;
            }
            this.enemyAttack(getPlayerHealth);
        } else {
            this.enemyAttack(getPlayerHealth);
            if (player.health > 0) {
                let playerAttackValues = this.attack(player);
                enemy.health -= playerAttackValues.totalDamage;
                getEnemyHealth.innerHTML = "Health: " + enemy.health;
            }
        }
    },

    attack: function(attacker) {
        let damage = (attacker.mana > 0) ? attacker.strength * attacker.mana / 1000 : attacker.strength * attacker.agility / 1000;
        let offset = Math.floor(Math.random() * 10);
        let totalDamage = Math.floor(damage + offset);
        let hits = Math.floor(Math.random() * Math.floor(attacker.agility / 10) / 2) + 1;
        return { totalDamage: totalDamage * hits, damage: totalDamage, hits: hits };
    },

    enemyAttack: function(getPlayerHealth) {
        let enemyAttackValues = this.attack(enemy);
        player.health -= enemyAttackValues.totalDamage;
        alert(`Enemy hit ${enemyAttackValues.damage} damage ${enemyAttackValues.hits} times.`);
        
        if (player.health <= 0) {
            alert("You lose! Refresh the browser to play again.");
            getPlayerHealth.innerHTML = "Health: 0";
        } else {
            getPlayerHealth.innerHTML = "Health: " + player.health;
        }
    }
};