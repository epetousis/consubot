import { Message } from 'discord.js';
import parseDuration from 'parse-duration';

function bread(message: Message) {
  const duration = parseDuration(message.content);

  if (!duration) {
    message.reply('I was unable to parse a time from your message.');
    return;
  }

  message.client.setTimeout(() => {
    message.reply('your timer has gone off.');
    console.log(`Message sent to ${message.author.id} at ${Date.now().toString()}`);
  }, duration);
}

export default function TimerCommands() {
  return {
    bread,
  };
}
