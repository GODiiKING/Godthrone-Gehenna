// Central Database for perfectly mirrored balance
const CharacterDatabase = {
    "joker":      { name: "Joker",      health: 200, mana: 50,  strength: 200, agility: 100, speed: 50 },
    "sangunuus":  { name: "Sangunuus",  health: 100, mana: 80,  strength: 150, agility: 120, speed: 60 },
    "voracium":   { name: "Voracium",   health: 180, mana: 40,  strength: 220, agility: 80,  speed: 70 },
    "khaos":      { name: "Khaos",      health: 150, mana: 100, strength: 180, agility: 150, speed: 80 },
    "illusor":    { name: "Illusor",    health: 140, mana: 150, strength: 120, agility: 180, speed: 90 },
    "amanuen":    { name: "Amanuen",    health: 250, mana: 60,  strength: 190, agility: 70,  speed: 40 },
    "excidi":     { name: "Excidi",     health: 170, mana: 90,  strength: 210, agility: 110, speed: 75 },
    "malignis":   { name: "Malignis",   health: 220, mana: 120, strength: 160, agility: 100, speed: 65 },
    "dominor":    { name: "Dominor",    health: 190, mana: 130, strength: 200, agility: 140, speed: 85 },
    "kosmos":     { name: "Kosmos",     health: 300, mana: 200, strength: 100, agility: 100, speed: 50 },
    "deus":       { name: "Deus",       health: 160, mana: 180, strength: 130, agility: 150, speed: 95 },
    "arma":       { name: "Arma",       health: 180, mana: 70,  strength: 230, agility: 160, speed: 100 }
};

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

// Global state trackers
let player;
let enemy;