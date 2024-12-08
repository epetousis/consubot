import { CommandInteraction, MessageAttachment } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import Jimp from 'jimp';

enum ReactionImage {
  Rdj = 'rdj',
  Jesse = 'jesse',
  Gus = 'gus',
  Bugs = 'bugs',
  Peter = 'peter',
  PeterRun = 'peterrun',
  Defector = 'defector',
  Competition = 'competition',
}

enum AltText {
  Rdj = 'A greyscale image of Robert Downey Jr. paired with the comment: ',
  Jesse = 'A conversation between Breaking Bad characters Walter White and Jesse Pinkman, with Jesse using modern internet slang and Walter not understanding it and asking what he is talking about. The image has the following comment overlaid: ',
  Gus = 'Image of Breaking Bad character Gustavo Fring, paired with the comment: ',
  Bugs = 'An image of Bugs Bunny in a tuxedo with the comment: ',
  Peter = 'An image of Peter Griffin on a black background, paired with the comment: ',
  PeterRun = 'An image of Peter Griffin running from a plane with the following comment overlaid: ',
  Defector = 'An image of North Korean Defector Yeonmi Park, paired with the comment: ',
  Competition = 'An image of Squidward from SpongeBob SquarePants looking shocked with the comment: ',
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
  altText: string,
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
    let newYPos = textObject.yPos;
    if (textObject.yPos < 0) {
      newYPos = -textObject.yPos
       - Jimp.measureTextHeight(font, textObject.text.text, textObject.maxWidth);
    }
    tempImage.print(font, textObject.xPos, newYPos, textObject.text, textObject.maxWidth);
    tempImage.color([{ apply: 'xor', params: [textObject.fontColour] }]);
    textImage.blit(tempImage, 0, 0);
  });
  await loadedImage.blit(textImage, 0, 0)
    .getBufferAsync(Jimp.MIME_PNG)
    .then(async (imageBuffer) => {
      const finalImage = new MessageAttachment(imageBuffer, `${message.id}.png`)
        .setDescription(altText.slice(0, 1024));
      await message.editReply({ content: null, files: [finalImage] });
    });
}

async function reactText(interaction: CommandInteraction) {
  const reactionImage = interaction.options.getString('meme') as ReactionImage | null;
  const reactionText = interaction.options.getString('text') as string;
  const bottomText = interaction.options.getString('text2') as string;
  const textArray: TextAttributes[] = [];

  let altText = '';
  let imageText = '';
  if (bottomText === null) {
    imageText = reactionText;
  } else {
    imageText = `${reactionText} ${bottomText}`;
  }

  await interaction.reply(imageText);

  switch (reactionImage) {
    case ReactionImage.Rdj:
      textArray.push({
        xPos: 69, yPos: 69, maxWidth: 434, fontColour: '#000', text: { text: reactionText.replaceAll(emojiRegex, ''), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT },
      });
      altText = `${AltText.Rdj}${textArray[0].text.text}`;
      return reactTextImage(interaction, 'public/memes/rdj.png', textArray, altText);
    case ReactionImage.Jesse:
      textArray.push({
        xPos: 0, yPos: -710, maxWidth: 1280, fontColour: '#fff', text: { text: reactionText.replaceAll(emojiRegex, ''), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER },
      });
      altText = `${AltText.Jesse}${textArray[0].text.text}`;
      return reactTextImage(interaction, 'public/memes/jesse.png', textArray, altText);
    case ReactionImage.Gus:
      textArray.push({
        xPos: 12, yPos: 12, maxWidth: 680, fontColour: '#fff', text: { text: reactionText.replaceAll(emojiRegex, ''), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER },
      });
      altText = `${AltText.Gus}${textArray[0].text.text}`;
      if (bottomText != null) {
        textArray.push({
          xPos: 12, yPos: -988, maxWidth: 680, fontColour: '#fff', text: { text: bottomText.replaceAll(emojiRegex, ''), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER },
        });
        altText = `${altText} ${textArray[1].text.text}`;
      }
      return reactTextImage(interaction, 'public/memes/gus.png', textArray, altText);
    case ReactionImage.Bugs:
      textArray.push({
        xPos: 35, yPos: 100, maxWidth: 370, fontColour: '#fff', text: { text: reactionText.replaceAll(emojiRegex, ''), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER },
      });
      altText = `${AltText.Bugs}I wish all ${textArray[0].text.text} a very `;
      if (bottomText != null) {
        textArray.push({
          xPos: 35, yPos: 305, maxWidth: 370, fontColour: '#fff', text: { text: bottomText.replaceAll(emojiRegex, ''), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER },
        });
        altText = `${altText}${textArray[1].text.text}`;
      }
      return reactTextImage(interaction, 'public/memes/bugs.jpg', textArray, altText);
    case ReactionImage.Peter:
      textArray.push({
        xPos: 680, yPos: 90, maxWidth: 920, fontColour: '#fff', text: { text: reactionText.replaceAll(emojiRegex, ''), alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT },
      });
      altText = `${AltText.Peter}${textArray[0].text.text}`;
      return reactTextImage(interaction, 'public/memes/peter.jpg', textArray, altText);
    case ReactionImage.PeterRun:
      textArray.push({
        xPos: 0, yPos: 0, maxWidth: 768, fontColour: '#fff', text: { text: reactionText.replaceAll(emojiRegex, ''), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER },
      });
      altText = `${AltText.PeterRun}${textArray[0].text.text}`;
      if (bottomText != null) {
        textArray.push({
          xPos: 0, yPos: -576, maxWidth: 768, fontColour: '#fff', text: { text: bottomText.replaceAll(emojiRegex, ''), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER },
        });
        altText = `${altText} ${textArray[1].text.text}`;
      }
      return reactTextImage(interaction, 'public/memes/peterrun.jpg', textArray, altText);
    case ReactionImage.Defector:
      textArray.push({
        xPos: 0, yPos: 0, maxWidth: 1252, fontColour: '#fff', text: { text: reactionText.replaceAll(emojiRegex, ''), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER },
      });
      altText = `${AltText.Defector}${textArray[0].text.text}`;
      if (bottomText != null) {
        textArray.push({
          xPos: 0, yPos: -990, maxWidth: 1252, fontColour: '#fff', text: { text: bottomText.replaceAll(emojiRegex, ''), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER },
        });
        altText = `${altText} ${textArray[1].text.text}`;
      }
      return reactTextImage(interaction, 'public/memes/defector.jpg', textArray, altText);
    case ReactionImage.Competition:
      textArray.push({
        xPos: 0, yPos: 90, maxWidth: 916, fontColour: '#000', text: { text: reactionText.replaceAll(emojiRegex, ''), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER },
      });
      altText = `${AltText.Competition}when I'm in a  ${textArray[0].text.text} competition and my opponent is `;
      if (bottomText != null) {
        textArray.push({
          xPos: 525, yPos: 340, maxWidth: 391, fontColour: '#000', text: { text: bottomText.replaceAll(emojiRegex, ''), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER },
        });
        altText = `${altText}${textArray[1].text.text}`;
      }
      return reactTextImage(interaction, 'public/memes/competition.jpg', textArray, altText);
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
