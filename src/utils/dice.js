export function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

export function rollDice(count, sides, modifier = 0) {
  const rolls = Array.from({ length: count }, () => rollDie(sides));
  const sum = rolls.reduce((a, b) => a + b, 0) + modifier;
  return { rolls, modifier, total: sum };
}
