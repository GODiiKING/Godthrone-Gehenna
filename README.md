# 🌌 Godthrone | Gehenna

Welcome to **Godthrone | Gehenna**, an immersive, web-based turn-based tactical battle arena set within the dark cosmic mythos of the *Godthrone* universe. Choose your divine or horrific entity, scan for ancient adversaries, and seize victory in the arena of the gods.

---

## 📸 Screenshots

Here is a preview of the interface and tactical battle arena in action:

![Character Selection Screen](images/README.md/example1.png)
*Figure 1: The Cosmic Character Selection Grid featuring deep space visuals and shrunken tactile cards.*

![Battle Arena Interface](images/README.md/example2.png)
*Figure 2: Active turn-based combat showing state changes, modular player statistics, and enemy health monitoring.*

---

## ✨ Features

* **12 Playable Cosmic Entities:** Choose from highly specialized classes from the ancient and cursed *Joker* to the absolute authority of *Deus* each packed with custom mechanical profiles and deep lore tags.
* **Dynamic Combat Engine:** A robust speed-based initiative system that determines turn sequence, featuring randomized critical multipliers, hit rates scaled by Agility, and damage formulas shifting dynamically based on Mana pools.
* **Premium Visual Identity:** Built with a custom cosmic aesthetic using a deep space radial gradient layout, featuring the sharp typography of **Acme** for headings and **Lexend Exa** for pristine body text tracking.
* **The "Secret Sauce" Interface:** Interactive card designs and UI elements configured with radial glows (`::before`), sweeping motion effects (`::after`), and smooth scale/lift transitions on hover.
* **Fully Responsive Architecture:** Optimized interface grid using modern CSS Grid auto-fit properties that fluidly transitions from 4-card desktop layouts to compact, centered mobile stacks without layout cracking.

---

## 🛠️ Technical Stack

* **Structure:** Semantic HTML5 Markup
* **Styling:** Modern, responsive Vanilla CSS3 (No framework dependencies)
* **Game Logic:** Vanilla JavaScript (ES6 Modules/State Objects)

---

## 📂 Project Architecture

```text
├── index.html               # Main entry point & embedded combat logic
├── favicon.svg              # Project site icon
├── css/
│   └── global.css           # Unified global design protocol & layout system
└── images/
    ├── README.md/
    │   ├── example1.png     # Readme image asset 1
    │   └── example2.png     # Readme image asset 2
    └── exiliumarch/
        ├── joker.png        # Character specific avatars
        ├── sangunuus.png
        └── ...