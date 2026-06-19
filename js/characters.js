// js/characters.js

// Central Database for perfectly mirrored balance
const CharacterDatabase = {
    "joker":      { name: "Joker",      weapon: "Material World and Light",   health: 200, magic: 50,  strength: 200, stamina: 100, speed: 50 },
    "sangunuus":  { name: "Sangunuus",  weapon: "Shinigami Blessing",         health: 100, magic: 80,  strength: 150, stamina: 120, speed: 60 },
    "voracium":   { name: "Voracium",   weapon: "False Sovereign",            health: 180, magic: 40,  strength: 220, stamina: 80,  speed: 70 },
    "khaos":      { name: "Khaos",      weapon: "Twin Obscenities",           health: 150, magic: 100, strength: 180, stamina: 150, speed: 80 },
    "illusor":    { name: "Illusor",    weapon: "Stalker Among Star",         health: 140, magic: 150, strength: 120, stamina: 180, speed: 90 },
    "amanuen":    { name: "Amanuen",    weapon: "Scourge of Creation",        health: 250, magic: 60,  strength: 190, stamina: 70,  speed: 40 },
    "excidi":     { name: "Excidi",     weapon: "Necropulse Reaper",          health: 170, magic: 90,  strength: 210, stamina: 110, speed: 75 },
    "malignis":   { name: "Malignis",   weapon: "Soulrend Decimator",         health: 220, magic: 120, strength: 160, stamina: 100, speed: 65 },
    "dominor":    { name: "Dominor",    weapon: "Memento Mori",               health: 190, magic: 130, strength: 200, stamina: 140, speed: 85 },
    "kosmos":     { name: "Kosmos",     weapon: "Dimensional Omnicide",       health: 300, magic: 200, strength: 100, stamina: 100, speed: 50 },
    "deus":       { name: "Deus",       weapon: "Authority Over Ending",      health: 160, magic: 180, strength: 130, stamina: 150, speed: 95 },
    "arma":       { name: "Arma",       weapon: "Infinite Infinitus",         health: 180, magic: 70,  strength: 230, stamina: 160, speed: 100 }
};

function Player(classType, health, magic, strength, stamina, speed) {
    this.classType = classType;
    this.health = health;
    this.magic = magic;
    this.strength = strength;
    this.stamina = stamina;
    this.speed = speed;
    
    // Tracks character-specific hooks, stacks, and modifiers
    this.state = {
        stacks: 0,
        tempBuff: 0,
        theftCap: 0,
        mpGainFromDmg: false,
        isDefending: false
    };
}

function Enemy(enemyType, health, magic, strength, stamina, speed) {
    this.enemyType = enemyType;
    this.health = health;
    this.magic = magic;
    this.strength = strength;
    this.stamina = stamina;
    this.speed = speed;
    
    // Tracks debuffs like Sangunuus's bleed
    this.state = {
        bleed: 0
    };
}

let player;
let enemy;