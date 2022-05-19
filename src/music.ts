import stream from 'stream';
import { CommandInteraction } from 'discord.js';
import ytdl from 'ytdl-core';
import { SlashCommandBuilder } from '@discordjs/builders';
import { AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnectionStatus } from '@discordjs/voice';

async function play(interaction: CommandInteraction) {
  await interaction.deferReply();

  if (!interaction.member
    || !('voice' in interaction.member)
    || !interaction.member?.voice.channelId) {
    return;
  }

  const connection = joinVoiceChannel({
    channelId: interaction.member.voice.channelId,
    guildId: interaction.member.voice.guild.id,
    adapterCreator: interaction.member.voice.guild.voiceAdapterCreator as any,
  });

  const url = interaction.options.getString('url');
  if (!url) return;
  const video = ytdl(url, { quality: 'highestaudio' });
  const pass = new stream.PassThrough();
  video.pipe(pass);
  const player = createAudioPlayer();
  const resource = createAudioResource(pass);
  player.play(resource);
  connection.subscribe(player);

  connection.on(VoiceConnectionStatus.Disconnected, () => {
    video.destroy();
    interaction.editReply('I was just disconnected :(');
  });

  player.on(AudioPlayerStatus.Idle, () => {
    connection.disconnect();
    video.destroy();
  });

  interaction.editReply('Playing song in channel.');
}

export default function MusicCommands() {
  return [
    {
      handler: play,
      data: new SlashCommandBuilder().setName('play')
        .addStringOption((option) => option.setName('url').setDescription('URL of a video to play')),
    },
  ];
}
