/* --- The Brain: GameManager --- */
let player;
let enemy;

function Player(classType, health, mana, strength, agility, speed) {
    this.classType = classType;
    this.health = health;
    this.mana = mana;
    this.strength = strength;
    this.agility = agility;
    this.speed = speed;
}

function Enemy(enemyType, health, mana, strength, agility, speed) {
    this.enemyType = enemyType;
    this.health = health;
    this.mana = mana;
    this.strength = strength;
    this.agility = agility;
    this.speed = speed;
}

let GameManager = {
    setGameStart: function(classType) {
        this.resetPlayer(classType);
        this.setPreFight();
    },

    resetPlayer: function(classType) {
        // Logic remains modular. Add new characters here.
        switch (classType) {
            case "Joker":
                player = new Player(classType, 200, 0, 200, 100, 50);
                break;
            case "Khalifa":
                player = new Player(classType, 100, 0, 150, 120, 60);
                break;
            // ... add other cases
        }

        let getInterface = document.querySelector(".interface");
        getInterface.innerHTML = `
            <div class="selected-character-card">
                <img src="./images/exiliumarch/${classType.toLowerCase().replace(" ", "_")}.png" class="img-avatar">
                <div class="stats-display">
                    <h3>${classType}</h3>
                    <p>Health: ${player.health}</p>
                    <p>Strength: ${player.strength}</p>
                    <p>Speed: ${player.speed}</p>
                </div>
            </div>`;
    },

    setPreFight: function() {
        let getHeader = document.querySelector(".header");
        let getActions = document.querySelector(".actions");
        let getArena = document.querySelector(".arena");

        getHeader.innerHTML = "<h2>Prepare for Battle</h2><p>Find an enemy!</p>";
        getActions.innerHTML = `<button class="btn-prefight" onclick="GameManager.setFight()">Search for enemy</button>`;
        getArena.style.visibility = "visible";
    },

    setFight: function() {
        let getHeader = document.querySelector(".header");
        let getActions = document.querySelector(".actions");
        let getEnemyArea = document.querySelector(".enemy");

        // Enemy database
        let enemy00 = new Enemy("Zizius", 200, 0, 150, 100, 50);
        let enemy01 = new Enemy("Kiana", 150, 0, 100, 150, 80);
        let chooseRandomEnemy = Math.floor(Math.random() * 2);

        switch (chooseRandomEnemy) {
            case 0: enemy = enemy00; break;
            case 1: enemy = enemy01; break;
        }

        getHeader.innerHTML = "<h2>Combat</h2><p>Make your move!</p>";
        getActions.innerHTML = `<button class="btn-prefight" onclick="PlayerMoves.calcAttack()">Attack</button>`;
        getEnemyArea.innerHTML = `
            <div class="selected-character-card" style="border-color: #ff4757;">
                <img src="./images/exiliumarch/${enemy.enemyType.toLowerCase().replace(" ", "_")}.png" class="img-avatar">
                <div class="stats-display">
                    <h3 style="color: #ff4757;">${enemy.enemyType}</h3>
                    <p>Health: ${enemy.health}</p>
                </div>
            </div>`;
    }
};

let PlayerMoves = {
    calcAttack: function() {
        // Logic for combat calculations goes here
    }
};