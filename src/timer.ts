import { CommandInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import parseDuration from 'parse-duration';

function timer(message: CommandInteraction) {
  const duration = parseDuration(message.options.getString('duration') ?? '');

  if (!duration) {
    message.reply('I was unable to parse a time from your message.');
    return;
  }

  setTimeout(() => {
    message.channel?.send('your timer has gone off.');
    console.log(`Message sent to ${message.user.id} at ${Date.now().toString()}`);
  }, duration);

  message.reply('your timer has been set.');
}

export default function TimerCommands() {
  return [
    { handler: timer, data: new SlashCommandBuilder().setName('timer').setDescription('Start a timer')
      .addStringOption((option) => option.setName('duration').setDescription('Duration of timer').setRequired(true)) },
  ];
}
