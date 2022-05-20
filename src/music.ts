import stream from 'stream';
import { CommandInteraction } from 'discord.js';
import ytdl from 'ytdl-core';
import axios from 'axios';
import { SlashCommandBuilder } from '@discordjs/builders';
import {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  VoiceConnectionStatus,
} from '@discordjs/voice';

async function play(interaction: CommandInteraction) {
  await interaction.reply('Joining channel');

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
  const videoInfo = await ytdl.getInfo(url);
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
  interaction.editReply(`Playing ${videoInfo.videoDetails.title} in <#${interaction.member.voice.channelId}>`);
}

async function playJJJ(interaction: CommandInteraction) {
  await interaction.reply('Joining channel');

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
  const player = createAudioPlayer();
  const resource = createAudioResource('http://live-radio01.mediahubaustralia.com/2TJW/aac/');
  player.play(resource);
  connection.subscribe(player);

  connection.on(VoiceConnectionStatus.Disconnected, () => {
    interaction.editReply('I was just disconnected :(');
  });

  player.on(AudioPlayerStatus.Idle, () => {
    connection.disconnect();
  });
  const now = await axios({
    method: 'GET',
    url: 'https://music.abcradio.net.au/api/v1/plays/triplej/now.json',
  });

  interaction.editReply(`Playing ${now.data.now.recording.title} in <#${interaction.member.voice.channelId}>`);
}

export default function MusicCommands() {
  return [
    {
      handler: play,
      data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play music in voice channel')
        .addStringOption((option) => option.setName('url')
          .setDescription('URL of a video to play')
          .setRequired(true)),
    },
    {
      handler: playJJJ,
      data: new SlashCommandBuilder()
        .setName('playtriplej')
        .setDescription('Play triple j live radio in a voice channel'),
    },
  ];
}
