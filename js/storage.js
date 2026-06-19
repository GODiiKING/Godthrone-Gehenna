// storage.js
const GameStorage = {
    getStreak: () => parseInt(localStorage.getItem("godthrone_streak")) || 0,
    setStreak: (value) => localStorage.setItem("godthrone_streak", value),

    // Initializes items safely if they don't exist
    initializeInventory: () => {
        if (!localStorage.getItem("gt_inv_potion")) localStorage.setItem("gt_inv_potion", "0");
        if (!localStorage.getItem("gt_inv_ward")) localStorage.setItem("gt_inv_ward", "0");
    },

    // Fetches current quantities
    getInventory: () => ({
        potions: parseInt(localStorage.getItem("gt_inv_potion")) || 0,
        wards: parseInt(localStorage.getItem("gt_inv_ward")) || 0
    }),

    // Gathers legacy relic numbers cleanly
    getRelicModifiers: () => ({
        hp: parseInt(localStorage.getItem("gt_relic_hp")) || 0,
        magic: parseInt(localStorage.getItem("gt_relic_magic")) || 0,
        str: parseInt(localStorage.getItem("gt_relic_str")) || 0,
        stamina: parseInt(localStorage.getItem("gt_relic_stamina")) || 0,
        spd: parseInt(localStorage.getItem("gt_relic_spd")) || 0
    })
};