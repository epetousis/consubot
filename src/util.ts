import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

async function spoiler(message: CommandInteraction) {
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
