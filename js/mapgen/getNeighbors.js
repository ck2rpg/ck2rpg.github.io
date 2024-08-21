function getLongNeighbors(x, y, num) {
  let neighbors = [];
  let div = Math.floor(num / 2);
  let negDiv = div * -1;
  for (let i = negDiv; i < div; i++) {
    for (let j = negDiv; j < div; j++) {
      let n = xy(x + j, y + i);
      neighbors.push(n);
    }
  }
  return neighbors;
}

function getNeighbors(x, y) {
  let neighbors = [];
  try {
    neighbors.push(xy(x - 1, y));
  } catch {

  }
  try {
    neighbors.push(xy(x + 1, y));
  } catch {

  }
  try {
    neighbors.push(xy(x + 1, y + 1));
  } catch {

  }
  try {
    neighbors.push(xy(x - 1, y - 1));
  } catch {

  }
  try {
    neighbors.push(xy(x, y + 1));
  } catch {

  }
  try {
    neighbors.push(xy(x, y - 1));
  } catch {

  }
  try {
    neighbors.push(xy(x - 1, y + 1));
  } catch {

  }
  try {
    neighbors.push(xy(x + 1, y - 1))
  } catch {

  }
  return neighbors;
}

function getCardinalNeighbors(x, y) {
  let neighbors = [];
  try {
    neighbors.push(xy(x - 1, y));
  } catch {

  }
  try {
    neighbors.push(xy(x + 1, y));
  } catch {

  }


  try {
    neighbors.push(xy(x, y + 1));
  } catch {

  }
  try {
    neighbors.push(xy(x, y - 1));
  } catch {

  }

  return neighbors;
}