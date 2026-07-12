# Changelog

## [1.0.0] - 2026-06-07
### Added
- Initial push for Godthrone Gehenna

## [1.0.0] - 2026-06-08
### Refactored
- Implement core Godthrone game architecture

## [1.0.0] - 2026-06-19
### Refactored
- Change mana to magic
- Added realms.js and clean game.js
- Added combat.js and clean game.js
- Added interface.js and clean game.js
- Added storage.js and clean game.js
- Entirely strip out the items (vials/wards), the merchant, and the relics.
- Give the enemy card the exact same visual bar layout as the player
- Implement a mechanics registry
### Fixed
- Update the player's magic text

## [1.0.0] - 2026-06-20
### Added
- Implement dynamic enemy combat system
### Fixed
- Enemy card now clears correctly after a match ends

## [1.0.0] - 2026-06-22
### Refactored
- Convert realm descriptions to pure flavor text
- Add support for variable resource costs in gatekeeper
### Fixed
- Prevent premature screen clear on battle end
- Added class and type for characters

## [1.0.0] - 2026-06-25
### Added
- Integrate dynamic skill tooltips and robust combat modal handling