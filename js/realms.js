// realms.js - Global Realm Data Matrix

const RealmsDatabase = [
    { 
        name: "Umbra Alignment", 
        desc: "🌌 Shadow forces condense. Reality thins as the veil between dimensions tears, leaving only cold, silent darkness.", 
        type: "umbra" 
    },
    { 
        name: "Elementa Flare", 
        desc: "🔥 Primal energies erupt. A chaotic storm of raw elemental fury burns through the very foundation of the arena.", 
        type: "elementa" 
    },
    { 
        name: "Mundus Gravity", 
        desc: "🌍 Structural density peaks. The crushing weight of creation presses down, anchoring all souls to the core of the world.", 
        type: "mundus" 
    }
];

// Returns a random realm object from the matrix
function getRandomRealm() {
    return RealmsDatabase[Math.floor(Math.random() * RealmsDatabase.length)];
}