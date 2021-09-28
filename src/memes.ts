import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

async function sendHostImage(message: CommandInteraction, path: string) {
  const imageHost = process.env.IMAGE_HOST_URL;
  const prehosted = path.startsWith('http://') || path.startsWith('https://');

  if (!imageHost && !prehosted) {
    await message.reply({ content: 'Someone forgot to set an image host for these meme images, so I unfortunately cannot send them. ' });
    return;
  }

  await message.reply({ files: [prehosted ? path : `${imageHost}/${path}`] });
}

async function react(interaction: CommandInteraction) {
  switch (interaction.options.getString('reaction')) {
    case 'away':
      return sendHostImage(interaction, 'memes/away.jpg');
    case 'boobs':
      return sendHostImage(interaction, 'memes/boobs.jpg');
    case 'looking':
      return sendHostImage(interaction, 'memes/looking.jpg');
    case 'respectfully':
      return sendHostImage(interaction, 'memes/respectfully.jpg');
    case 'shook':
      return sendHostImage(interaction, 'memes/shook.jpg');
    case 'sheesh':
      return sendHostImage(interaction, 'https://cdn.discordapp.com/attachments/736915758558478336/892303098142416896/Asian_Old_Man_Sheesh.mp4');
    default:
      break;
  }
}

export default function MemeCommands() {
  return [
    {
      handler: react,
      data: new SlashCommandBuilder().setName('react').setDescription('Send a reaction image')
        .addStringOption((option) => option.setName('reaction').setDescription('The reaction image to send').setRequired(true)),
    },
  ];
}
