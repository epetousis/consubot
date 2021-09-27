import { CommandInteraction, VoiceChannel } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import parseDuration from 'parse-duration';

function inPomodoro(voiceChannel: VoiceChannel): boolean {
  const perms = voiceChannel.permissionsFor(voiceChannel.guild.roles.everyone);
  return !perms?.has('SPEAK');
}

function startPomodoro(voiceChannel: VoiceChannel) {
  voiceChannel.permissionOverwrites.create(voiceChannel.guild.roles.everyone, { SPEAK: false });
}

function endPomodoro(voiceChannel: VoiceChannel) {
  voiceChannel.permissionOverwrites.create(voiceChannel.guild.roles.everyone, { SPEAK: true });
}

async function pomodoro(message: CommandInteraction) {
  const VALID_CHANNEL_NAMES = ['study', 'pomodoro', 'uni', 'work'];
  const voiceChannel = (message.member && 'voice' in message.member) ? (message.member.voice.channel) : null;
  if (!voiceChannel || !VALID_CHANNEL_NAMES.includes(voiceChannel.name.toLowerCase()) || voiceChannel.isVoice()) {
    await message.reply(`You must be in a voice channel entitled one of: \`${VALID_CHANNEL_NAMES.join(', ')}\` to use this command.`);
    return;
  }

  if (message.options.getString('command')?.toLowerCase() === 'done') {
    if (inPomodoro(voiceChannel)) {
      await message.reply('Finishing pomodoro timer early.');
      endPomodoro(voiceChannel);
    } else {
      await message.reply('No pomodoro running.');
    }
    return;
  }

  const duration = parseDuration(message.options.getString('command') ?? '');
  if (!duration) {
    await message.reply('I was unable to parse a time from your message. Use `!pomodoro done` to override the timer.');
    return;
  }

  if (!inPomodoro(voiceChannel)) {
    startPomodoro(voiceChannel);
    await message.reply('Pomodoro timer started.');
  } else {
    await message.reply('A pomodoro timer is already running for this channel! `!pomodoro done` to cancel it.');
    return;
  }

  setTimeout(() => {
    if (inPomodoro(voiceChannel)) {
      endPomodoro(voiceChannel);
      message.channel?.send(`Pomodoro set by ${message.user} is done!`);
    }
    console.log(`Pomodoro set by ${message.user.id} completed at ${Date.now().toString()}`);
  }, duration);
}

export default function PomodoroCommands() {
  return [
    { handler: pomodoro, data: new SlashCommandBuilder().setName('pomodoro').setDescription('Control the pomodoro timer')
      .addStringOption((option) => option.setName('command').setDescription('Command to control timer, or specific duration for pomodoro')) },
  ];
}
