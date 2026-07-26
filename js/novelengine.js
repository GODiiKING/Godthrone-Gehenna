"use strict";

let vnClickLocked = false;

window.NovelEngine = {
    currentSceneKey: "scene1",
    currentLineIndex: 0,
    currentClass: null,

    init: function() {
        const textWindow = document.getElementById("interactiveBox");
        if (textWindow) {
            textWindow.onclick = () => this.advanceLine();
        }
    },

    startScene: function(sceneKey) {
        if (!visualNovelData[sceneKey]) {
            console.error("Requested storyboard layout scene missing:", sceneKey);
            return;
        }
        this.currentSceneKey = sceneKey;
        this.currentLineIndex = 0;
        this.renderCurrentLine();
    },

    startFromCharacter: function(classType) {
        this.currentClass = classType;
        this.startScene("scene1");
    },

    renderCurrentLine: function() {
        const lines = visualNovelData[this.currentSceneKey];
        const currentData = lines[this.currentLineIndex];

        const textElement = document.getElementById("sceneText");
        const nameElement = document.getElementById("speakerName");

        const leftSprite = document.getElementById("vnSpriteLeft");
        const rightSprite = document.getElementById("vnSpriteRight");

        // Clear both sprites first
        leftSprite.style.display = "none";
        rightSprite.style.display = "none";
        leftSprite.classList.remove("active");
        rightSprite.classList.remove("active");

        // Load left sprite if provided
        if (currentData.leftSprite) {
            leftSprite.src = currentData.leftSprite;
            leftSprite.style.display = "block";
            leftSprite.classList.add("active");
        }

        // Load right sprite if provided
        if (currentData.rightSprite) {
            rightSprite.src = currentData.rightSprite;
            rightSprite.style.display = "block";
            rightSprite.classList.add("active");
        }

        if (!textElement) return;

        // Fade-out text before updating
        textElement.style.transition = "none";
        textElement.style.opacity = "0";

        // Update speaker name
        if (nameElement) {
            nameElement.innerText = currentData.speaker || "";
        }

        // Fade-in text
        setTimeout(() => {
            textElement.innerText = currentData.text;
            textElement.style.transition = "opacity 0.3s ease";
            textElement.style.opacity = "1";
        }, 150);
    },

    advanceLine: function() {

    // ⛔ Prevent spam clicking
    if (vnClickLocked) return;
    vnClickLocked = true;

    const lines = visualNovelData[this.currentSceneKey];
    this.currentLineIndex++;

    if (this.currentLineIndex < lines.length) {
        this.renderCurrentLine();
    } else {
        this.completeScene();
    }

    // 🔓 Unlock after short delay
    setTimeout(() => {
        vnClickLocked = false;
    }, 550); // 250ms delay prevents skipping
},


    completeScene: function() {
        fadeOut(() => {

            // Hide VN
            document.body.classList.remove("vn-active");
            document.querySelector(".vnViewport").style.display = "none";

            // Show combat UI
            document.querySelector(".container").style.display = "block";

            // Start game for selected class
            GameManager.setGameStart(this.currentClass);

            // Start linear combat vs first enemy
            const nextEnemy = GameManager.getNextCharacter();
            GameManager.startLinearCombat(nextEnemy);

            fadeIn();
        });
    },

    restartForNextCharacter: function() {
        fadeOut(() => {
            document.querySelector(".container").style.display = "none";
            document.querySelector(".vnViewport").style.display = "flex";

            this.startScene("scene1");
            fadeIn();
        });
    }
};

window.onload = () => {
    window.NovelEngine.init();
};

function fadeOut(callback) {
    const viewport = document.querySelector(".vnViewport");
    if (!viewport) return;

    viewport.style.transition = "opacity 0.4s ease";
    viewport.style.opacity = "0";

    setTimeout(() => {
        if (callback) callback();
    }, 400);
}

function fadeIn() {
    const viewport = document.querySelector(".vnViewport");
    if (!viewport) return;

    viewport.style.transition = "opacity 0.4s ease";
    viewport.style.opacity = "1";
}
