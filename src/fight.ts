import { User, CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

const healthStore: { [key: string]: number } = {};

const addHealth = (taggedUser: User, message: CommandInteraction, damage: number) => {
  const upperLimit = 100;
  const lowerLimit = 0;

  if (!healthStore[taggedUser.id]) {
    healthStore[taggedUser.id] = upperLimit;
  }

  healthStore[taggedUser.id] += damage;

  if (healthStore[taggedUser.id] < lowerLimit) {
    healthStore[taggedUser.id] = lowerLimit;
    message.reply(`>>> ${taggedUser} has lost the fight :( and their health has been reset https://imgur.com/r/gifs/UKBCq4f`);
  } else if (healthStore[taggedUser.id] > upperLimit) {
    healthStore[taggedUser.id] = upperLimit;
  }
};

function punch(message: CommandInteraction) {
  const taggedUser = message.options.getUser('someone');

  if (!taggedUser) {
    message.reply('you need to tag a user!');
    return;
  }

  const damage = Math.floor(Math.random() * 50);
  const damageReply = damage === 0 ? 'their weak punch has healed their opponent +20 health' : `dealt ${damage} damage`;
  addHealth(taggedUser, message, -damage);

  message.reply(`>>> ${message.user} has punched ${taggedUser?.username} and ${damageReply}`);
}

function kick(message: CommandInteraction) {
  const taggedUser = message.options.getUser('someone');

  if (!taggedUser) {
    message.reply('you need to tag a user!');
    return;
  }

  const damage = Math.floor(Math.random() * 100);
  const damageReply = damage === 0 ? 'missed' : `dealt ${damage} damage`;
  addHealth(taggedUser, message, -damage);

  message.reply(`>>> ${message.user} has kicked ${taggedUser?.username} and ${damageReply}`);
}

function headbutt(message: CommandInteraction) {
  const taggedUser = message.options.getUser('someone');

  if (!taggedUser) {
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
      addHealth(message.user, message, damageAmount);
      break;
    default:
      addHealth(taggedUser, message, -damageAmount);
      break;
  }

  message.reply(`>>> ${message.user} has headbutted ${taggedUser?.username} and ${reply}`);
}

function heal(message: CommandInteraction) {
  const possibleHealAmounts = [80, 40, 100, 40, 50, 20];

  const resultIndex = Math.floor(Math.random() * possibleHealAmounts.length);
  const healAmount = possibleHealAmounts[resultIndex];
  addHealth(message.user, message, healAmount);

  const reply = healAmount === 100 ? 'healed to max health! Wow!' : `gained ${healAmount} HP`;

  message.reply(`>>> ${message.user} has healed themselves and ${reply}`);
}

function health(message: CommandInteraction) {
  const callerHealth = healthStore[message.user.id] ?? 100;
  message.reply(`>>> ${message.user} has ${callerHealth} health`);
}

function gg(message: CommandInteraction) {
  const taggedUser = message.options.getUser('someone');

  if (!taggedUser) {
    message.reply('you need to tag a user!');
    return;
  }

  message.reply(`>>> ${message.user} GGs ${taggedUser?.username}  https://imgur.com/a/2QFSk9Y`);
}

export default function FightCommands() {
  return [
    { handler: punch, data: new SlashCommandBuilder().setName('punch').setDescription('Punch someone')
      .addUserOption((option) => option.setName('someone').setDescription('Person to attack').setRequired(true)) },
    { handler: kick, data: new SlashCommandBuilder().setName('kick').setDescription('Kick someone')
      .addUserOption((option) => option.setName('someone').setDescription('Person to attack').setRequired(true)) },
    { handler: headbutt, data: new SlashCommandBuilder().setName('headbutt').setDescription('Headbutt someone')
      .addUserOption((option) => option.setName('someone').setDescription('Person to attack').setRequired(true)) },
    { handler: heal, data: new SlashCommandBuilder().setName('heal').setDescription('Heal yourself') },
    { handler: health, data: new SlashCommandBuilder().setName('health').setDescription('Get health') },
    { handler: gg, data: new SlashCommandBuilder().setName('gg').setDescription('Surrender')
      .addUserOption((option) => option.setName('someone').setDescription('Person to surrender to').setRequired(true)) },
  ];
}
