const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

const ground = {
  x: 0,
  y: window.innerHeight - 200,
  // big numbers
  width: 0xfffffffffffffffffffffff,
  height: window.innerHeight,
};

let keydown = false;
window.addEventListener("keydown", (e) => e.key === " " && (keydown = true));
window.addEventListener("keyup", (e) => e.key === " " && (keydown = false));

const genNoise = (size, maxHeight) => {
  return Array(size)
    .fill()
    .map((_, idx) => Math.abs(noise.perlin2((idx - 500) / 100, 1)) * maxHeight);
};

const height = 2000;
const width = 10000;
const terrain = genNoise(width, height).filter((item) => item !== 0);
const xScale = 40;
const gap = 400;

const numPlayers = 600;
const batchSize = location.hash.length > 1 ? parseInt(location.hash.slice(1)) : 100;
let batch = 0;
let gen = 0;
let highestPerformance = 0;
let bestGenScore = 0;
const players = Array(numPlayers)
  .fill()
  .map(() => new Plane());
players.forEach((player) => player.reset_please());

const drawStats = (stats) => {
  ctx.font = "30px Arial";
  ctx.fillStyle = "black";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  stats.forEach(([name, value], idx) => {
    ctx.fillText(name + ": " + value.toString(), 30, 40 * idx + 60);
  });
};

const train = () => {
  players.splice(0, players.length, ...players.sort((a, b) => a.x - b.x));
  // where the good stuff happens
  const bestScore = players.reduce(
    (a, b) => (a > b.fitness ? a.fitness : b.fitness),
    players[0].fitness
  );
  console.log(bestScore);
	// only top 25% players make dem babies
  const bestPlayers = players.slice(players.length - Math.floor(numPlayers / 4));
  console.log([...bestPlayers.map((player) => player.x)]);
  const totalFitness = bestPlayers.reduce(
    (a, b) => a + b.fitness,
    bestPlayers[0].fitness
  );
  for (const player of players) {
    // select brain
    let goalSum = Math.random() * totalFitness;
    let runningSum = 0;
    /**
     * @type {Plane}
     */
    let parent;
    for (const other of bestPlayers) {
      runningSum += other.fitness;
      if (runningSum >= goalSum) {
        parent = other;
        break;
      }
    }
    if (!parent) {
      console.log("fallback:", runningSum, goalSum);
      parent = players.reduce((a, b) => (a.fitness > b.fitness ? a : b));
    }

    // mutate dem babies

    player.brain = parent.brain.mutate();
  }
};

const render = () => {
  const runPlayers = players.slice(batch * batchSize, (batch + 1) * batchSize);
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  runPlayers.forEach((player) => player.update());
  if (runPlayers.filter((player) => !player.dead).length < 1) {
    if (batch >= numPlayers / batchSize - 1) {
      train();
      players.forEach((player) => {
        player.reset_please();
        player.dead = false;
      });
      batch = 0;
      bestGenScore = 0;
      gen++;
    } else {
      batch++;
    }
  }

  const bestPlayer = runPlayers.reduce((a, b) => (b.x > a.x && !b.dead ? b : a));
  if (bestPlayer.x > highestPerformance) highestPerformance = bestPlayer.x;
  if (bestPlayer.x > bestGenScore) bestGenScore = bestPlayer.x;

  ctx.translate(
    -bestPlayer.x + window.innerWidth / 2,
    -bestPlayer.y + window.innerHeight / 2
  );
  runPlayers.forEach((player) => player.render());
  ctx.fillStyle = "gray";
  ctx.fillRect(
    ground.x - ground.width / 2,
    ground.y - ground.height / 2,
    ground.width,
    ground.height
  );
  ctx.beginPath();
  ctx.moveTo(0, ground.y - ground.height / 2);
  terrain.forEach((point, idx) =>
    ctx.lineTo(idx * xScale, -point + ground.y - ground.height / 2)
  );
  ctx.fillStyle = "black";
  ctx.lineTo(terrain.length * xScale, ground.y - ground.height / 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, ground.y - ground.height / 2 - gap);
  terrain.forEach((point, idx) =>
    ctx.lineTo(idx * xScale, -point + ground.y - ground.height / 2 - gap)
  );
  ctx.fillStyle = "black";
  ctx.lineTo(terrain.length * xScale, ground.y - ground.height / 2 - gap);
  // ctx.closePath();
  // ctx.fill();
  ctx.stroke();

  ctx.translate(
    bestPlayer.x - window.innerWidth / 2,
    bestPlayer.y - window.innerHeight / 2
  );

  drawStats([
    ["Gen", gen],
    ["Batch", batch + 1],
    ["Best score", highestPerformance.toFixed(0)],
    ["Best generation score", bestGenScore.toFixed(0)],
  ]);

  bestPlayer.brain.render(
    [
      "Rotational velocity",
      "Rotation",
      "Distance to ground",
      "Distance to bottom terrain",
      "Distance to top terrain",
    ],
    ["nay", "yay"]
  );
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;

  requestAnimationFrame(render);
};

requestAnimationFrame(render);
