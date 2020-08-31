import stream from 'stream';
import { Message } from 'discord.js';
import ytdl from 'ytdl-core';

async function play(message: Message) {
  if (!message.member?.voice.channel) {
    return;
  }

  const connection = await message.member.voice.channel.join();

  const video = ytdl(message.content, { quality: 'highestaudio' });
  const pass = new stream.PassThrough();
  video.pipe(pass);
  const dispatcher = connection.play(pass, { volume: 0.05 });

  connection.on('disconnect', () => {
    video.destroy();
    dispatcher.destroy();
    message.channel.send('I was just disconnected :(');
  });

  dispatcher.on('finish', () => {
    connection.disconnect();
    video.destroy();
    dispatcher.destroy();
  });
}

export default function MusicCommands() {
  return {
    play,
  };
}
