import stream from 'stream';
import { CommandInteraction, MessageAttachment } from 'discord.js';
import ytdl from 'ytdl-core';
import axios from 'axios';
import Jimp from 'jimp';
import { getAverageColor } from 'fast-average-color-node';
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

async function getJJJAlbumArt(nowJSON: Record<string, any>) {
  switch (nowJSON) {
    case (nowJSON.now):
      switch (nowJSON.now) {
        default:
          return 'assets/images/unknownart.png';
      }
    default:
      return 'assets/images/unknownart.png';
  }
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

  const { channelId } = interaction.member.voice;
  const albumArtPath = await getJJJAlbumArt(now.data);
  const albumArt = await Jimp.read(albumArtPath);
  // now.data.now.recording.releases[0].artwork[0].url);
  albumArt.resize(227, 227);
  const albumArtBuffer = await albumArt.getBufferAsync(Jimp.MIME_PNG);
  const albumColour = await getAverageColor(albumArtBuffer);
  const nowPlayingImage = new Jimp(800, 240, albumColour.hex, (err) => {
    if (err) throw err;
  });
  const largeFont = await Jimp.loadFont('assets/fonts/opensans48white.fnt');
  const smallFont = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
  if (albumColour.isDark) {
    nowPlayingImage.color([
      { apply: 'lighten', params: [25] },
    ]);
  } else if (albumColour.isLight) {
    nowPlayingImage.color([
      { apply: 'darken', params: [25] },
    ]);
  }
  const artistY = Jimp.measureTextHeight(largeFont, now.data.now.recording.title, 538);
  nowPlayingImage
    .blit(albumArt, 6, 6)
    .print(largeFont, 255, 10, now.data.now.recording.title, 538)
    .print(smallFont, 255, artistY + 20, now.data.now.recording.artists[0].name, 538)
    .getBufferAsync(Jimp.MIME_PNG)
    .then(async (imageBuffer) => {
      const image = new MessageAttachment(imageBuffer, `${interaction.id}.png`)
        .setDescription(`Now playing: ${now.data.now.recording.title}`);
      await interaction.editReply({ content: `Playing ${now.data.now.recording.title} in <#${channelId}>`, files: [image] });
    });
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
