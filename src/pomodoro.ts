import { Message, VoiceChannel } from 'discord.js';
import parseDuration from 'parse-duration';

function pomodoro(message: Message) {
  const VALID_CHANNEL_NAMES = ['study', 'pomodoro', 'uni', 'work'];
  
  const voiceChannel = (message.member) ? (message.member.voice.channel) : null;
  if (!voiceChannel || !VALID_CHANNEL_NAMES.includes(voiceChannel.name.toLowerCase())) {
    message.reply(`You must be in a voice channel entitled one of: \`${VALID_CHANNEL_NAMES.join(", ")}\` to use this command.`);
    return;
  }

  if (message.content.trim().toLowerCase() == 'done') {
    if (inPomodoro(voiceChannel)) {
      message.reply('Finishing pomodoro timer early.')
      endPomodoro(voiceChannel);
    }
    else {
      message.reply('No pomodoro running.')
    }
    return;
  }

  const duration = parseDuration(message.content);
  if (!duration) {
    message.reply('I was unable to parse a time from your message. Use `!pomodoro done` to override the timer.');
    return;
  }

  if (!inPomodoro(voiceChannel)) {
    startPomodoro(voiceChannel);
    message.reply('Pomodoro timer started.');
  }
  else {
    message.reply('A pomodoro timer is already running for this channel! `!pomodoro done` to cancel it.')
    return;
  }

  message.client.setTimeout(() => {
    if (inPomodoro(voiceChannel)) {
      endPomodoro(voiceChannel);
    }
    message.reply(`Pomodoro set by ${message.author} is done!`);
    console.log(`Pomodoro set by ${message.author.id} completed at ${Date.now().toString()}`);
  }, duration);
}

function inPomodoro(voiceChannel: VoiceChannel): boolean {
  const perms = voiceChannel.permissionsFor(voiceChannel.guild.roles.everyone);
  return !perms.has('SPEAK');
}

function startPomodoro(voiceChannel: VoiceChannel) {
  voiceChannel.overwritePermissions([
    {
      id: voiceChannel.guild.roles.everyone.id,
      deny: ['SPEAK']
    },
  ]);
}

function endPomodoro(voiceChannel: VoiceChannel) {
  voiceChannel.overwritePermissions([
    {
      id: voiceChannel.guild.roles.everyone.id,
      allow: ['SPEAK']
    }
  ]);
}

export default function PomodoroCommands() {
  return {
    pomodoro,
  };
}