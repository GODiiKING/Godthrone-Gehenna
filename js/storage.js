// storage.js - Stripped minimal baseline state tracking
const GameStorage = {
    getStreak: () => parseInt(localStorage.getItem("godthrone_streak")) || 0,
    setStreak: (value) => localStorage.setItem("godthrone_streak", value)
};