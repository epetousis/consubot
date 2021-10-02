import { CommandInteraction, Permissions } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

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

  const spoileredAttachments = mostRecentMessageFromUser?.attachments
    .map((attachment) => ({ attachment: attachment.url, name: `SPOILER_${attachment.name}` }));

  await message.reply({ content: `From ${message.user}`, files: spoileredAttachments });
  await mostRecentMessageFromUser?.delete();
}

export default function UtilCommands() {
  return [
    { handler: spoiler, data: new SlashCommandBuilder().setName('spoiler').setDescription('Deletes your last sent image and reposts it with a spoilered version') },
  ];
}
