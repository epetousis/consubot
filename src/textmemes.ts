import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import Jimp from 'jimp';

enum ReactionImage {
  Rdj = 'rdj',
  Jesse = 'jesse',
  Gus = 'gus',
}

interface TextObject {
  text: string;
  alignmentX: number;
}

interface TextAttributes {
  xPos: number;
  yPos: number;
  maxWidth: number;
  fontColour: string;
  text: TextObject;
}

const emojiRegex = /\p{Extended_Pictographic}/ug;

async function reactTextImage(
  message: CommandInteraction,
  path: string,
  attr: TextAttributes[],
) {
  const image = await Jimp.read(path);
  const loadedImage = image;
  const font = await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
  const textImage = new Jimp(image.bitmap.width, image.bitmap.height, 0x0, (err) => {
    if (err) throw err;
  });
  attr.forEach((textObject) => {
    const tempImage = new Jimp(image.bitmap.width, image.bitmap.height, 0x0, (err) => {
      if (err) throw err;
    });
    tempImage.print(font, textObject.xPos, textObject.yPos, textObject.text, textObject.maxWidth);
    tempImage.color([{ apply: 'xor', params: [textObject.fontColour] }]);
    textImage.blit(tempImage, 0, 0);
  });
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
  const bottomText = interaction.options.getString('text2') as string;
  const textArray: TextAttributes[] = [];

  switch (reactionImage) {
    case ReactionImage.Rdj:
      textArray.push({
        xPos: 69, yPos: 69, maxWidth: 434, fontColour: '#000', text: { text: reactionText.replaceAll(emojiRegex, ''), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT },
      });
      return reactTextImage(interaction, 'public/memes/rdj.png', textArray);
    case ReactionImage.Jesse:
      textArray.push({
        xPos: 0, yPos: 500, maxWidth: 1280, fontColour: '#fff', text: { text: reactionText.replaceAll(emojiRegex, ''), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER },
      });
      return reactTextImage(interaction, 'public/memes/jesse.png', textArray);
    case ReactionImage.Gus:
      textArray.push({
        xPos: 12, yPos: 12, maxWidth: 680, fontColour: '#fff', text: { text: reactionText.replaceAll(emojiRegex, ''), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER },
      });
      if (bottomText != null) {
        textArray.push({
          xPos: 12, yPos: 860, maxWidth: 680, fontColour: '#fff', text: { text: bottomText.replaceAll(emojiRegex, ''), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER },
        });
      }
      return reactTextImage(interaction, 'public/memes/gus.png', textArray);
    default:
      return null;
  }
}

export default function TextMemeCommands() {
  return [
    {
      handler: reactText,
      data: new SlashCommandBuilder()
        .setName('textreact')
        .setDescription('Send a reaction image... with text')
        .addStringOption((option) => option.setName('meme')
          .setDescription('The reaction image to send.')
          .setRequired(true)
          .addChoices(Object.entries(ReactionImage)))
        .addStringOption((option) => option.setName('text')
          .setDescription('The text to be added to the image.')
          .setRequired(true))
        .addStringOption((option) => option.setName('text2')
          .setDescription('The second text to be added (only applies for double lined memes)')
          .setRequired(false)),
    },
  ];
}
