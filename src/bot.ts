/* eslint-disable no-console */
import { Client } from 'discord.js';
import { prefix, token } from './config.json';

const client = new Client();

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
      if (!message.mentions.users.size) {
        message.reply('you need to tag a user!');
        return;
      }

      const taggedUser = message.mentions.users.first();

      const replies = [' dealt 10 Damage', ' dealt 20 Damage', ' dealt 30 Damage', ' dealt 40 damage', ' dealt 10 damage', ' their weak punch has healed their opponent +20 health'];

      const result = Math.floor(Math.random() * replies.length);

      message.channel.send(`>>> ${message.author} has punched ${taggedUser?.username} and${replies[result]}`);
      break;
    }
    case 'kick': { // KICK
      if (!message.mentions.users.size) {
        message.reply('you need to tag a user!');
        return;
      }

      const taggedUser = message.mentions.users.first();

      const replies = [' missed', ' dealt 30 damage', ' dealt 30 damage', ' dealt 40 damage', ' dealt 50 Damage', ' dealt 60 Damage'];

      const result = Math.floor(Math.random() * replies.length);

      message.channel.send(`>>> ${message.author} has kicked ${taggedUser?.username} and${replies[result]}`);
      break;
    }
    case 'headbutt': { // HEADBUTT
      if (!message.mentions.users.size) {
        message.reply('you need to tag a user!');
        return;
      }

      const taggedUser = message.mentions.users.first();

      const replies = [' missed', ' missed', ' missed', ' missed', ' knocked their opponnent out!', ' knocked themselves out!', ' dealt 99.5 Damage'];

      const result = Math.floor(Math.random() * replies.length);

      message.channel.send(`>>> ${message.author} has headbutted ${taggedUser?.username} and${replies[result]}`);
      break;
    }
    case 'heal': { // HEAL
      const replies = [' gained 80 hp', ' gained 40 hp', ' healed to max health! Wow!', ' gained 40 hp', ' gained 50 hp', ' gained 20 hp'];

      const result = Math.floor(Math.random() * replies.length);

      message.channel.send(`>>> ${message.author} has healed themselves and${replies[result]}`);
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
