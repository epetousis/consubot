import { Message, MessageEmbed } from 'discord.js';

function sendHostImage(message: Message, path: string) {
  const imageHost = process.env.IMAGE_HOST_URL;

  if (!imageHost) {
    return;
  }

  const imageEmbed = new MessageEmbed()
    .setImage(`${imageHost}/${path}`);

  message.channel.send(imageEmbed);
}

export default function MemeCommands() {
  return {
    away: (message: Message) => sendHostImage(message, 'memes/away.jpg'),
    boobs: (message: Message) => sendHostImage(message, 'memes/boobs.jpg'),
    looking: (message: Message) => sendHostImage(message, 'memes/looking.jpg'),
    respectfully: (message: Message) => sendHostImage(message, 'memes/respectfully.jpg'),
    shook: (message: Message) => sendHostImage(message, 'memes/shook.jpg'),
  };
}
