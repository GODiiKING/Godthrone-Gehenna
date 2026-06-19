// interface.js - Handles all DOM logging and typewriter text effects

function printLog(message, color = "#ffffff") {
    const consoleEl = document.getElementById("combatConsole");
    if (!consoleEl) return;

    const line = document.createElement("div");
    line.style.color = color;
    line.style.marginTop = "5px";
    line.style.lineHeight = "1.6";
    
    // Consistent style highlighting for critical alerts or success returns
    if (color === "#ffc048" || color === "#4cd137" || color === "#ff4757" || color === "#ff6b9d") {
        line.style.textShadow = "0 0 8px rgba(255, 255, 255, 0.2)";
        line.style.fontWeight = "700";
    }

    consoleEl.appendChild(line);

    const chars = Array.from(message);
    let i = 0;
    
    function type() {
        if (i < chars.length) {
            line.innerHTML += chars[i];
            i++;
            consoleEl.scrollTop = consoleEl.scrollHeight;
            setTimeout(type, 12);
        }
    }
    type();
}

function printRealmLog(realm) {
    if (!realm) return;
    printLog(`🌌 CURRENT REALM: ${realm.name} - ${realm.desc}`, "#ffc048");
}