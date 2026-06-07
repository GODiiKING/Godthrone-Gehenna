let enemy;

function Enemy(enemyType, health, mana, strength, agility, speed) {
  this.enemyType = enemyType;  // Change from this.classType to this.enemyType
  this.health = health;
  this.mana = mana;
  this.strength = strength;
  this.agility = agility;
  this.speed = speed;
}
