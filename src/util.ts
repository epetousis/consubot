import { CommandInteraction, Permissions } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Canvas } from 'canvas-constructor/cairo';

async function spoiler(message: CommandInteraction) {
  if (!message.channel || !('guild' in message.channel)) {
    return message.reply({
      content: 'This command cannot be used in direct messages.',
      ephemeral: true,
    });
  }

  // TODO: make the command parser handle permission detection, and calculate bitwise perms flag
  const channelPerms = message.guild?.me?.permissionsIn(message.channel);
  if (!channelPerms?.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
    return message.reply({
      content: 'Missing Manage Messages permission. Please tell an admin to add this to my role.',
      ephemeral: true,
    });
  }

  const messages = await message.channel?.messages.fetch({ limit: 10, before: message.id });
  const mostRecentMessageFromUser = messages?.find((value) => value.member === message.member);
  if (!mostRecentMessageFromUser) {
    return message.reply({
      content: 'No recent messages found from you that can be spoiler tagged.',
      ephemeral: true,
    });
  }

  const spoileredAttachments = mostRecentMessageFromUser?.attachments
    .map((attachment) => ({ attachment: attachment.url, name: `SPOILER_${attachment.name}` }));

  await message.reply({ content: `From ${message.user}`, files: spoileredAttachments });
  await mostRecentMessageFromUser?.delete();
}

/** Generate an image of a solid colour from a hex code as input */
async function colour(message: CommandInteraction) {
  const hex = message.options.getString('colour');

  if (!hex || !/^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(hex)) {
    return message.reply({
      content: 'Please provide a valid hex code to generate an image of. It must start with a # and can be 3 or 6 characters.',
      ephemeral: true,
    });
  }

  const image = new Canvas(200, 200)
    .setColor(hex)
    .printRectangle(0, 0, 200, 200)
    .toBuffer();

  await message.reply({
    files: [{ attachment: image, name: 'colour.png' }],
  });
}

export default function UtilCommands() {
  return [
    { handler: spoiler, data: new SlashCommandBuilder().setName('spoiler').setDescription('Deletes your last sent image and reposts it with a spoilered version') },
    { handler: colour, data: new SlashCommandBuilder().setName('colour').setDescription('Generates an image from an sRGB colour and displays it.')
      .addStringOption((option) => option.setName('colour').setDescription('The colour to generate an image from.').setRequired(true)) },
  ];
}
