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

interface SongInfo {
  title: string,
  artist: string,
  duration: number,
  airTime: Date,
}

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

async function getJJJAlbumArt(nowJSON: Record<string, any>): Promise<string> {
  if (Object.keys(nowJSON.now).length === 0) {
    return getJJJAlbumArt({ now: nowJSON.prev });
  } if (nowJSON.now.recording.releases.length !== 0) {
    if (nowJSON.now.recording.releases[0].artwork.length !== 0) {
      return nowJSON.now.recording.releases[0].artwork[0].url;
    } if (nowJSON.now.recording.releases.length > 1) {
      if (nowJSON.now.recording.releases[1].artwork.length !== 0) {
        return nowJSON.now.recording.releases[1].artwork[0].url;
      }
    }
  } else if (nowJSON.now.recording.artwork !== 0) {
    return nowJSON.now.recording.artwork[0].url;
  } else if (Object.keys(nowJSON.now.release).length !== 0) {
    if (nowJSON.now.release.artwork.length !== 0) {
      return nowJSON.now.release.artwork[0].url;
    }
  }
  return 'assets/images/unknownart.png';
}

async function getJJJSongInfo(nowJSON: Record<string, any>): Promise<SongInfo> {
  if (Object.keys(nowJSON.now).length === 0) {
    return getJJJSongInfo({ now: nowJSON.prev });
  }
  return {
    title: nowJSON.now.recording.title,
    artist: nowJSON.now.recording.artists[0].name,
    duration: nowJSON.now.recording.duration,
    airTime: new Date(nowJSON.now.played_time),
  };
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
  const albumArt = await Jimp.read(await getJJJAlbumArt(now.data));
  const songInfo = await getJJJSongInfo(now.data);
  albumArt.resize(227, 227);
  const albumArtBuffer = await albumArt.getBufferAsync(Jimp.MIME_PNG);
  const albumColour = await getAverageColor(albumArtBuffer);
  const nowPlayingImage = new Jimp(800, 240, albumColour.hex);
  const largeFont = await Jimp.loadFont('assets/fonts/opensans48white.fnt');
  const smallFont = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
  const evenSmallerFont = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
  if (albumColour.isDark) {
    nowPlayingImage.color([
      { apply: 'lighten', params: [25] },
    ]);
  } else if (albumColour.isLight) {
    nowPlayingImage.color([
      { apply: 'darken', params: [25] },
    ]);
  }
  const artistY = Jimp.measureTextHeight(largeFont, songInfo.title, 538);
  const progressColours = ['#dfe6e9', '#636e72'];
  if (albumColour.isLight) {
    progressColours.splice(1, 1, progressColours.splice(0, 1)[0]);
  }
  const nowPlayingProgressBg = new Jimp(523, 25, progressColours[0]);
  const datePlayed = new Date(songInfo.airTime);
  const dateNow = new Date();
  const totalMinutes = Math.floor(songInfo.duration / 60);
  const totalSeconds = (songInfo.duration % 60);
  const progress = (dateNow.getTime() - datePlayed.getTime()) / 1000;
  const progressMinutes = Math.floor(progress / 60);
  const progressSeconds = Math.floor(progress % 60);
  let progressPercent = (progress / songInfo.duration);
  if (progressPercent > 1) {
    progressPercent = 1;
  }
  const barWidth = Math.floor(progressPercent * 513);
  const nowPlayingProgress = new Jimp(barWidth, 15, progressColours[1]);
  const nowPlayingProgressBgMask = await Jimp.read('assets/images/progressmaskbg.png');
  const nowPlayingProgressMask = await Jimp.read('assets/images/progressmask.png');
  nowPlayingProgress
    .mask(nowPlayingProgressMask, 0, 0)
    .mask(nowPlayingProgressMask, -513 - -barWidth, 0);
  nowPlayingProgressBg
    .mask(nowPlayingProgressBgMask, 0, 0)
    .blit(nowPlayingProgress, 5, 5);
  nowPlayingImage
    .blit(albumArt, 6, 6)
    .blit(nowPlayingProgressBg, 255, 165)
    .print(largeFont, 255, 10, songInfo.title, 538)
    .print(smallFont, 255, artistY + 20, songInfo.artist, 538)
    .print(evenSmallerFont, 255, 200, `${progressMinutes}:${String(progressSeconds.toString()).padStart(2, '0')} / ${totalMinutes}:${String(totalSeconds.toString()).padStart(2, '0')}`)
    .getBufferAsync(Jimp.MIME_PNG)
    .then(async (imageBuffer) => {
      const image = new MessageAttachment(imageBuffer, `${interaction.id}.png`)
        .setDescription(`Now playing: ${songInfo.title}`);
      await interaction.editReply({ content: `Playing ${songInfo.title} in <#${channelId}>`, files: [image] });
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
