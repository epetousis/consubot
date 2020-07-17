import { Client, User, Message } from 'discord.js';
import http from 'http';

const prefix = process.env.CONSUBOT_PREFIX ?? '!';
const token = process.env.CONSUBOT_AUTH_TOKEN ?? '';

const client = new Client();

const healthStore: {[key: string]: number} = {};

const addHealth = (taggedUser: User, message: Message, damage: number) => {
  const upperLimit = 100;
  const lowerLimit = 0;

  if (!healthStore[taggedUser.id]) {
    healthStore[taggedUser.id] = upperLimit;
  }

  healthStore[taggedUser.id] += damage;

  if (healthStore[taggedUser.id] < lowerLimit) {
    healthStore[taggedUser.id] = lowerLimit;
    message.channel.send(`>>> ${message.author} has lost the fight :( and their health has been reset https://imgur.com/r/gifs/UKBCq4f`);
  } else if (healthStore[taggedUser.id] > upperLimit) {
    healthStore[taggedUser.id] = upperLimit;
  }
};

client.once('ready', () => {
  console.log('Ready!');

  if (!client.user) return;

  client.user.setActivity('with your emotions');
});

client.on('message', (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  switch (command) {
    // PEPPER
    case 'pepper': {
      if (!message.mentions.users.size) {
        message.reply('you need to tag a user!');
        return;
      }

      const taggedUser = message.mentions.users.first();

      const replies = [' has been caught holding the pepper! :hot_pepper:', ' has passed the pepper to another user! :star:'];

      const result = Math.floor(Math.random() * replies.length);

      message.channel.send(`>>> ${taggedUser?.username}${replies[result]}`);
      break;
    }
    // PORTAL
    case 'portal': {
      const replies = [
        ' a my lil Pudge plushie! 1/4 to collect!',
        ' a letter from Gabe Newell himself!',
        " the will to live! I'm proud of you",
        " the feeling of impending doom! What's that behind you?",
        ' Boots of Speed! Quick! Run from your problems!',
        ' a kiss from a twitch girl! +10 Strength',
        " an additional 20 problems! You don't know what they are yet but they're coming!",
        ' a my lil Dendi doll! 2/4 to collect!',
        " a lil doll of Dylan's right muscle! 3/4 to collect!",
        " a lil doll of Dylan's left muscle! 3/4 to collect!",
        ' admin permissions to the server! You heard me Nic! Hand it over!',
        ' nothing.',
        " ownership of Flippy for a day! Watch out, he'll eat your lunch!",
        ' play we are number one',
        ' another chance at summoning! This is 1 out of 100 responses!',
        " Dylan's bank details! I'm sure he'll lend you his card!",
        ' a 1v1 Pudge Wars with Ben! May the best man win...',
        " one of Jacob's PC parts, the catch is, he chooses!",
        " a flight to visit Gage! Who's paying? Who knows!",
        ' a cat, good luck!',
        ' hot cheetos, HAND EM OVER!',
        ' youre a bitch - riley',
        ' an ebgames gift card! Thanks Auntie Tessa!',
        ' a used gaming chair, sanitary wipes not included!',
        ' a mini sniper figurine, are you new?',
        " endless terrorblade clones, I CAN'T BREATHE!",
        ' more than enough garlic bread, yum.',
        ' a disney fast pass! Say hi to Donald Duck for me!',
        " Nic's endless adoration! Just kidding thats all mine! theres some for noelle too I guess...",
        ' a tooth. Yuck.',
        ' another portal! It spawned nothing!',
        ' a playboy magazine! Make sure your parents arent in the room.',
        ' a piece of paper! Get creative!',
        ' a GOLD my lil pudge plushie! EXTRA ULTRA MEGA RARE! ***SPECIAL***!',
        ' a pocket riley, remember to feed him!',
        ' a 1v1 with Dylan! Any game any time!',
        " Dylan's job, hand the suit over Charlie!",
        " I couldn't actually find anything sorry mate",
        " Adam's gym ball! Would you like a pump with that?",
        ' Portal Multicast x 4! Wow they all spawned nothing!',
        ' a thumbs up from Adam, good work!',
        ' pocket onion boy to accompany you on your next adventure!',
        ' a cook book! All this free time and you still dont know how to cook!?',
        " a dead crow, why? I don't know!",
        " a subscription to netflix, watch some stuff don't just sit there",
        ' a 1v1 with Noelle in real life!',
      ];

      const result = Math.floor(Math.random() * replies.length);

      message.channel.send(`>>> ${message.author} has summoned...${replies[result]}`);
      break;
    }
    // DISCO
    case 'dance': {
      message.channel.send(`>>> ${message.author} is dancing under the Disco Ball! :dancer: :male_dancer:`);
      break;
    }
    case 'undance': {
      message.channel.send(`>>> ${message.author} stopped dancing under the Disco Ball! :woman_in_lotus_position: :man_in_lotus_position:`);
      break;
    }
    // BALL
    case 'ball': {
      if (!message.mentions.users.size) {
        message.reply('you need to tag a user!');
        return;
      }
      const taggedUser = message.mentions.users.first();

      const replies = [` kicked the ball towards ${taggedUser?.username}... They blocked it! :soccer:`,
        ` kicked the ball towards ${taggedUser?.username}... You scored a goal! :goal:`,
      ];

      const result = Math.floor(Math.random() * replies.length);

      message.channel.send(`>>> ${message.author}${replies[result]}`);
      break;
    }
    // BANNER
    case 'banner': {
      message.channel.send(`>>> ${message.author} waves the cpofl flag proudly! https://imgur.com/a/R1IhZHI`);
      break;
    }
    // FIGHT
    case 'punch': { // PUNCH
      const taggedUser = message.mentions.users.find((v) => v != null);

      if (!message.mentions.users.size || !taggedUser) {
        message.reply('you need to tag a user!');
        return;
      }

      const damage = Math.floor(Math.random() * 50);
      const damageReply = damage === 0 ? 'their weak punch has healed their opponent +20 health' : `dealt ${damage} damage`;
      addHealth(taggedUser, message, -damage);

      message.channel.send(`>>> ${message.author} has punched ${taggedUser?.username} and ${damageReply}`);
      break;
    }
    case 'kick': { // KICK
      const taggedUser = message.mentions.users.find((v) => v != null);

      if (!message.mentions.users.size || !taggedUser) {
        message.reply('you need to tag a user!');
        return;
      }

      const damage = Math.floor(Math.random() * 100);
      const damageReply = damage === 0 ? 'missed' : `dealt ${damage} damage`;
      addHealth(taggedUser, message, -damage);

      message.channel.send(`>>> ${message.author} has kicked ${taggedUser?.username} and ${damageReply}`);
      break;
    }
    case 'headbutt': { // HEADBUTT
      const taggedUser = message.mentions.users.find((v) => v != null);

      if (!message.mentions.users.size || !taggedUser) {
        message.reply('you need to tag a user!');
        return;
      }

      const possibleDamageAmounts = [0, 0, 0, 0, 100, -100, 99.5];
      const index = Math.floor(Math.random() * possibleDamageAmounts.length);
      const damageAmount = possibleDamageAmounts[index];

      let reply = `dealt ${damageAmount} damage`;

      switch (damageAmount) {
        case 0:
          reply = 'missed';
          break;
        case 100:
          reply = 'knocked their opponent out!';
          addHealth(taggedUser, message, -damageAmount);
          break;
        case -100:
          reply = 'knocked themselves out!';
          addHealth(message.author, message, damageAmount);
          break;
        default:
          addHealth(taggedUser, message, -damageAmount);
          break;
      }

      message.channel.send(`>>> ${message.author} has headbutted ${taggedUser?.username} and ${reply}`);
      break;
    }
    case 'heal': { // HEAL
      const possibleHealAmounts = [80, 40, 100, 40, 50, 20];

      const resultIndex = Math.floor(Math.random() * possibleHealAmounts.length);
      const healAmount = possibleHealAmounts[resultIndex];
      addHealth(message.author, message, healAmount);

      const reply = healAmount === 100 ? 'healed to max health! Wow!' : `gained ${healAmount} HP`;

      message.channel.send(`>>> ${message.author} has healed themselves and ${reply}`);
      break;
    }
    case 'health': {
      const health = healthStore[message.author.id] ?? 100;
      message.channel.send(`>>> ${message.author} has ${health} health`);
      break;
    }
    // GG
    case 'gg': {
      if (!message.mentions.users.size) {
        message.reply('you need to tag a user!');
        return;
      }
      const taggedUser = message.mentions.users.first();

      message.channel.send(`>>> ${message.author} GGs ${taggedUser?.username}  https://imgur.com/a/2QFSk9Y`);
      break;
    }
    default: {
      // ROLL
      const messageWords = message.content.split(' ');
      const rollFlavor = messageWords.slice(2).join(' ');
      if (messageWords[0] === '!roll') {
        if (messageWords.length === 1) {
          // !roll
          message.reply(
            `${Math.floor(Math.random() * 100)} ${rollFlavor}`,
          );
        }
      }
      break;
    }
  }
});

client.login(token);

http.createServer((request, response) => {
  response.writeHead(200);
  response.end("i'm not a fucking web server", 'utf-8');
}).listen(process.env.PORT || 4096);
