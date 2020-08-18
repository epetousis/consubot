import { User, Message } from 'discord.js';

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
    message.channel.send(`>>> ${taggedUser} has lost the fight :( and their health has been reset https://imgur.com/r/gifs/UKBCq4f`);
  } else if (healthStore[taggedUser.id] > upperLimit) {
    healthStore[taggedUser.id] = upperLimit;
  }
};

function punch(message: Message) {
  const taggedUser = message.mentions.users.find((v) => v != null);

  if (!message.mentions.users.size || !taggedUser) {
    message.reply('you need to tag a user!');
    return;
  }

  const damage = Math.floor(Math.random() * 50);
  const damageReply = damage === 0 ? 'their weak punch has healed their opponent +20 health' : `dealt ${damage} damage`;
  addHealth(taggedUser, message, -damage);

  message.channel.send(`>>> ${message.author} has punched ${taggedUser?.username} and ${damageReply}`);
}

function kick(message: Message) {
  const taggedUser = message.mentions.users.find((v) => v != null);

  if (!message.mentions.users.size || !taggedUser) {
    message.reply('you need to tag a user!');
    return;
  }

  const damage = Math.floor(Math.random() * 100);
  const damageReply = damage === 0 ? 'missed' : `dealt ${damage} damage`;
  addHealth(taggedUser, message, -damage);

  message.channel.send(`>>> ${message.author} has kicked ${taggedUser?.username} and ${damageReply}`);
}

function headbutt(message: Message) {
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
}

function heal(message: Message) {
  const possibleHealAmounts = [80, 40, 100, 40, 50, 20];

  const resultIndex = Math.floor(Math.random() * possibleHealAmounts.length);
  const healAmount = possibleHealAmounts[resultIndex];
  addHealth(message.author, message, healAmount);

  const reply = healAmount === 100 ? 'healed to max health! Wow!' : `gained ${healAmount} HP`;

  message.channel.send(`>>> ${message.author} has healed themselves and ${reply}`);
}

function health(message: Message) {
  const callerHealth = healthStore[message.author.id] ?? 100;
  message.channel.send(`>>> ${message.author} has ${callerHealth} health`);
}

function gg(message: Message) {
  if (!message.mentions.users.size) {
    message.reply('you need to tag a user!');
    return;
  }
  const taggedUser = message.mentions.users.first();

  message.channel.send(`>>> ${message.author} GGs ${taggedUser?.username}  https://imgur.com/a/2QFSk9Y`);
}

export default function FightCommands() {
  return {
    punch,
    kick,
    headbutt,
    heal,
    health,
    gg,
  };
}
