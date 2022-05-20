import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import Jimp from 'jimp';

enum ReactionImage {
  Rdj = 'rdj',
  Jesse = 'jesse',
}

class TextObject {
  text!: string;

  alignmentX: number | undefined;
}

const emojiRegex = /\p{Extended_Pictographic}/ug;

async function reactTextImage(
  message: CommandInteraction,
  path: string,
  text: TextObject,
  xPos: number,
  yPos: number,
  maxWidth: number,
  fontColour: string,
) {
  const textNoEmoji = { text: '', alignmentX: text.alignmentX };
  textNoEmoji.text = text.text.replaceAll(emojiRegex, '');
  const image = await Jimp.read(path);
  const loadedImage = image;
  const font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
  const textImage = new Jimp(image.bitmap.width, image.bitmap.height, 0x0, (err) => {
    if (err) throw err;
  });
  textImage.print(font, xPos, yPos, textNoEmoji, maxWidth);
  textImage.color([{ apply: 'xor', params: [fontColour] }]);
  await loadedImage.blit(textImage, 0, 0)
    .getBufferAsync(Jimp.MIME_PNG)
    .then(async (imageBuffer) => {
      await message.editReply({ files: [imageBuffer] });
    });
}

async function reactText(interaction: CommandInteraction) {
  await interaction.deferReply();

  const reactionImage = interaction.options.getString('meme') as ReactionImage | null;
  const reactionText = interaction.options.getString('text') as string;

  switch (reactionImage) {
    case ReactionImage.Rdj:
      return reactTextImage(interaction, 'public/memes/rdj.png', { text: reactionText, alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT }, 69, 69, 434, '#000');
    case ReactionImage.Jesse:
      return reactTextImage(interaction, 'public/memes/jesse.png', { text: reactionText, alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER }, 0, 600, 1280, '#fff');
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
