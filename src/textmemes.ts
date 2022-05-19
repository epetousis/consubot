import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import Jimp from 'jimp';
import Fs from 'fs';

enum ReactionImage {
  Rdj = 'rdj',
}

async function reactTextImage(
  message: CommandInteraction,
  path: string,
  text: string,
  xPos: number,
  yPos: number,
  maxWidth: number,
) {
  const image = await Jimp.read(path);
  const loadedImage = image;
  const font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
  await loadedImage.print(font, xPos, yPos, text, maxWidth)
    .writeAsync(`/tmp/consubot/${message.id}.png`);
  const tempImgId = message.id;
  await message.editReply({ files: [`/tmp/consubot/${message.id}.png`] });
  Fs.unlinkSync(`/tmp/consubot/${tempImgId}.png`);
}

async function reactText(interaction: CommandInteraction) {
  await interaction.deferReply();

  const reactionImage = interaction.options.getString('meme') as ReactionImage | null;
  const reactionText = interaction.options.getString('text') as string;

  switch (reactionImage) {
    case ReactionImage.Rdj:
      return reactTextImage(interaction, 'public/memes/rdj.png', reactionText, 69, 69, 434);
    default:
      return null;
  }
}

export default function TextMemeCommands() {
  return [
    {
      handler: reactText,
      data: new SlashCommandBuilder().setName('textreact').setDescription('Send a reaction image... with text')
        .addStringOption((option) => option.setName('meme')
          .setDescription('The reaction image to send.')
          .setRequired(true)
          .addChoices(Object.entries(ReactionImage)))
        .addStringOption((option) => option.setName('text')
          .setDescription('The text to be added to the image.')
          .setRequired(true)),
    },
  ];
}
