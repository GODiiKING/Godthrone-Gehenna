// realms.js - Global Realm Data Matrix

const RealmsDatabase = [
    { name: "Umbra Alignment", desc: "🌌 Shadow forces condense. Speed metrics are halved, but Soul Bursts cost 10 less Magic!", type: "umbra" },
    { name: "Elementa Flare", desc: "🔥 Primal energies erupt. Physical attacks deal 35% more damage, but active Defense yields 0 Magic.", type: "elementa" },
    { name: "Mundus Gravity", desc: "🌍 Structural density peaks. Maximum HP is boosted by 50 points, but evasion calculations are disabled.", type: "mundus" }
];

// Returns a random realm object from the matrix
function getRandomRealm() {
    return RealmsDatabase[Math.floor(Math.random() * RealmsDatabase.length)];
}