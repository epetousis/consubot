import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

async function sendHostImage(message: CommandInteraction, path: string) {
  const imageHost = process.env.IMAGE_HOST_URL;

  if (!imageHost) {
    await message.reply({ content: 'Someone forgot to set an image host for these meme images, so I unfortunately cannot send them. ' });
    return;
  }

  await message.reply({ files: [`${imageHost}/${path}`] });
}

export default function MemeCommands() {
  return [
    {
      handler: async (message: CommandInteraction) => sendHostImage(message, 'memes/away.jpg'),
      data: new SlashCommandBuilder().setName('away').setDescription('Away react'),
    },
    {
      handler: async (message: CommandInteraction) => sendHostImage(message, 'memes/boobs.jpg'),
      data: new SlashCommandBuilder().setName('boobs').setDescription('Boobs react'),
    },
    {
      handler: async (message: CommandInteraction) => sendHostImage(message, 'memes/looking.jpg'),
      data: new SlashCommandBuilder().setName('looking').setDescription('Looking react'),
    },
    {
      handler: async (message: CommandInteraction) => sendHostImage(message, 'memes/respectfully.jpg'),
      data: new SlashCommandBuilder().setName('respectfully').setDescription('Respectful react'),
    },
    {
      handler: async (message: CommandInteraction) => sendHostImage(message, 'memes/shook.jpg'),
      data: new SlashCommandBuilder().setName('shook').setDescription('Shook react'),
    },
  ];
}
