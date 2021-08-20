const fs = require('fs');
const prompts = require('prompts');

const NEW_PLAYER = "New Player";
const AGENTS = ['Astra', 'Brimstone', 'Breach', 'Cypher', 'Jett', 'KAYO', 'Killjoy', 'Omen', 'Phoenix', 'Raze', 'Reyna', 'Sage', 'Skye', 'Sova', 'Viper', 'Yoru'];

const mapToTitle = title => ({ title, value: title });
const prefixNewAccItem = arr => [mapToTitle(NEW_PLAYER), ...arr];
const pickAgent = (agentPool) => agentPool[Math.floor(Math.random() * agentPool.length)];

(async () => {
  const { players } = await prompts({
    type: 'list',
    name: 'players',
    message: 'Whos playin? Seperate with ,',
    separator: ','
  });

  const heroMap = {};

  for (let i = 0; i < players.length; i++) {
    const data = JSON.parse(fs.readFileSync('./data.json'));
    const name = players[i].toLowerCase();

    // If we match the name, just pull from data
    if (data[name]) {
      heroMap[name] = data[name];
      continue;
    }

    const questions = [
      {
        type: 'autocomplete',
        name: 'accName',
        message: `Cannot find "${name}". Try searching in the list below or select: "${NEW_PLAYER}".`,
        initial: 1,
        suggest: (input, choices) => choices.filter(i => i.title.toLowerCase().includes(input.toLowerCase())),
        choices: prefixNewAccItem(Object.keys(data).map(mapToTitle))
      },
      {
        type: prev => prev === NEW_PLAYER && 'autocompleteMultiselect',
        name: 'avoids',
        message: `SPACE to pick the heroes to avoid for ${name}`,
        choices: AGENTS.map(mapToTitle),
        hint: '- RETURN to submit.'
      }
    ];

    // Establish new user or alias
    const { accName, avoids } = await prompts(questions)
    if (accName === NEW_PLAYER) {
      fs.writeFileSync('./data.json', JSON.stringify({ ...data, [name]: avoids }))
      heroMap[name] = avoids;
    } else {
      heroMap[name] = data[name];
    }
  }

  const maxPlayerName = Object.keys(heroMap).reduce((prev, next) => next.length > prev ? next.length : prev, 1)
  const thisMatchAgentPool = AGENTS.slice();

  console.log("\n");
  Object.entries(heroMap).forEach(([key, value]) => {
    const agentPool = AGENTS.filter(a => !value.includes(a));
    const agent = pickAgent(agentPool);
    thisMatchAgentPool.splice(thisMatchAgentPool.findIndex(a => a === agent), 1);
    console.log(key + " ".repeat(maxPlayerName - key.length), ' - ', agent)
  })
  console.log("\n");
})();