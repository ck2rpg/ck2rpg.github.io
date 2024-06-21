/**
 * Simulates an asteroid storm by creating a specified number of asteroid impacts on the world map.
 * 
 * @param {number} num - The number of asteroids to create.
 */
function asteroidStorm(num) {
  for (let i = 0; i < num; i++) {
    const rand = getRandomInt(1, 50);
    const randX = getRandomInt(0, world.width);
    const randY = getRandomInt(0, world.height);
    try {
      createAsteroid(rand, randX, randY);
    } catch (e) {
      console.error('Error creating asteroid:', e);
    }
  }
}

/**
 * Creates an asteroid impact at the specified coordinates, modifying the terrain to reflect the impact.
 * 
 * @param {number} size - The size (diameter) of the asteroid.
 * @param {number} x - The x-coordinate of the impact point.
 * @param {number} y - The y-coordinate of the impact point.
 */
function createAsteroid(size, x, y) {
  const impactPoint = xy(x, y);
  const diameter = size;
  const depth = Math.floor(1.5 * diameter);
  const backMod = Math.floor(diameter / 2) * -1;
  const forwardMod = diameter / 2;
  const asteroidName = "Placeholder";
  const asteroid = {
    impactPoint: impactPoint,
    name: asteroidName,
    cells: [impactPoint],
    size: size
  };

  impactPoint.impactPoint = true;
  impactPoint.asteroidCrater = true;
  impactPoint.asteroidNames = impactPoint.asteroidNames || [];
  impactPoint.asteroidNames.push(asteroidName);

  console.log(backMod);
  console.log(forwardMod);

  for (let n = backMod; n < forwardMod; n++) {
    for (let j = backMod; j < forwardMod; j++) {
      const newX = impactPoint.x + j;
      const newY = impactPoint.y + n;
      try {
        const nextCell = xy(newX, newY);
        console.log(nextCell);
        const dist = Math.floor(getDistance(nextCell.x, nextCell.y, impactPoint.x, impactPoint.y));
        console.log(dist);
        if (dist < forwardMod) {
          const sub = Math.max(depth - dist, 1);
          nextCell.elevation -= sub;
          nextCell.asteroidCrater = true;
          nextCell.asteroidNames = nextCell.asteroidNames || [];
          nextCell.asteroidNames.push(asteroidName);
          asteroid.cells.push(nextCell);
        }
      } catch (e) {
        console.error('Error processing cell:', e);
      }
    }
  }
  world.asteroids.push(asteroid);
}