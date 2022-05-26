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
  await interaction.reply({ content: 'Joining channel', ephemeral: true });

  if (!interaction.member
    || !('voice' in interaction.member)
    || !interaction.member?.voice.channelId) {
    interaction.editReply('You\'re not in a voice channel!');
    return;
  }

  const connection = joinVoiceChannel({
    channelId: interaction.member.voice.channelId,
    guildId: interaction.member.voice.guild.id,
    adapterCreator: interaction.member.voice.guild.voiceAdapterCreator as any,
  });

  let followUp: any;

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
  connection.on(VoiceConnectionStatus.Ready, () => {
    interaction.editReply('Connected!');
  });
  connection.on(VoiceConnectionStatus.Disconnected, () => {
    video.destroy();
    followUp.edit({ content: 'I was just disconnected :(', files: [] });
  });

  player.on(AudioPlayerStatus.Idle, () => {
    connection.disconnect();
    video.destroy();
    followUp.edit({ content: 'End of tracks. Thanks for listening!', files: [] });
  });
  const { channelId } = interaction.member.voice;
  const largeFont = await Jimp.loadFont('assets/fonts/opensans48white.fnt');
  const smallFont = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
  const evenSmallerFont = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
  const artistY = Jimp.measureTextHeight(
    largeFont,
    videoInfo.videoDetails.title.substring(0, 22),
    538,
  );
  const thumbUrl = `https://i.ytimg.com/vi/${videoInfo.videoDetails.videoId}/maxresdefault.jpg`;
  const albumArt = await Jimp.read(thumbUrl);
  albumArt.cover(227, 227);
  const avatar = await Jimp.read(interaction.member.displayAvatarURL({ format: 'png' }));
  avatar
    .resize(46, 46)
    .circle();
  const albumArtBuffer = await albumArt.getBufferAsync(Jimp.MIME_PNG);
  const albumColour = await getAverageColor(albumArtBuffer);
  const nowPlayingImage = new Jimp(800, 240, albumColour.hex);
  let progressPercent = (1 / parseInt(videoInfo.videoDetails.lengthSeconds, 10));
  if (progressPercent > 1) {
    progressPercent = 1;
  }
  const barWidth = Math.floor(progressPercent * 513);
  const progressColours = ['#dfe6e9', '#636e72'];
  if (albumColour.isLight) {
    progressColours.splice(1, 1, progressColours.splice(0, 1)[0]);
  }
  const totalMinutes = Math.floor(parseInt(videoInfo.videoDetails.lengthSeconds, 10) / 60);
  const totalSeconds = (parseInt(videoInfo.videoDetails.lengthSeconds, 10) % 60);
  const nowPlayingProgress = new Jimp(barWidth, 15, progressColours[1]);
  const nowPlayingProgressBg = new Jimp(523, 25, progressColours[0]);
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
    .print(largeFont, 255, 10, videoInfo.videoDetails.title.substring(0, 22), 538)
    .print(smallFont, 255, artistY + 20, videoInfo.videoDetails.author.name, 538)
    .print(evenSmallerFont, 255, 205, `0:00 / ${totalMinutes}:${String(totalSeconds.toString()).padStart(2, '0')}`)
    .print(evenSmallerFont, 350, 200, { text: `Requested by ${interaction.member.displayName}`, alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT }, 380)
    .blit(avatar, 732, 192)
    .getBufferAsync(Jimp.MIME_PNG)
    .then(async (imageBuffer) => {
      const image = new MessageAttachment(imageBuffer, `${interaction.id}.png`)
        .setDescription(`Now playing: ${videoInfo.videoDetails.title}`);
      followUp = await interaction.followUp({ content: `Playing ${videoInfo.videoDetails.title} in <#${channelId}>`, files: [image] });
    });
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
  } else if (nowJSON.now.recording.artwork.length !== 0) {
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
  await interaction.reply({ content: 'Joining channel', ephemeral: true });

  if (!interaction.member
    || !('voice' in interaction.member)
    || !interaction.member?.voice.channelId) {
    interaction.editReply('You\'re not in a voice channel!');
    return;
  }

  const connection = joinVoiceChannel({
    channelId: interaction.member.voice.channelId,
    guildId: interaction.member.voice.guild.id,
    adapterCreator: interaction.member.voice.guild.voiceAdapterCreator as any,
  });
  const player = createAudioPlayer();
  // https://abcradiolivehls-lh.akamaihd.net/i/triplejnsw_1@327300/master.m3u8 or http://live-radio01.mediahubaustralia.com/2TJW/aac/
  const resource = createAudioResource('https://abcradiolivehls-lh.akamaihd.net/i/triplejnsw_1@327300/master.m3u8');
  player.play(resource);
  connection.subscribe(player);

  let followUp: any;

  connection.on(VoiceConnectionStatus.Ready, () => {
    interaction.editReply('Connected!');
  });

  connection.on(VoiceConnectionStatus.Disconnected, () => {
    followUp.edit({ content: 'I was just disconnected :(', files: [] });
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
  const avatar = await Jimp.read(interaction.member.displayAvatarURL({ format: 'png' }));
  avatar
    .resize(46, 46)
    .circle();
  const albumArtBuffer = await albumArt.getBufferAsync(Jimp.MIME_PNG);
  const albumColour = await getAverageColor(albumArtBuffer);
  const nowPlayingImage = new Jimp(800, 240, albumColour.hex);
  const largeFont = await Jimp.loadFont('assets/fonts/opensans48white.fnt');
  const smallFont = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
  const evenSmallerFont = await Jimp.loadFont('assets/fonts/opensans24white.fnt');
  if (albumColour.isDark) {
    nowPlayingImage.color([
      { apply: 'lighten', params: [25] },
    ]);
  } else if (albumColour.isLight) {
    nowPlayingImage.color([
      { apply: 'darken', params: [25] },
    ]);
  }
  const artistY = Jimp.measureTextHeight(largeFont, songInfo.title.substring(0, 22), 538);
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
    .print(evenSmallerFont, 255, 205, `${progressMinutes}:${String(progressSeconds.toString()).padStart(2, '0')} / ${totalMinutes}:${String(totalSeconds.toString()).padStart(2, '0')}`)
    .print(evenSmallerFont, 350, 205, { text: `Requested by ${interaction.member.displayName}`, alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT }, 380)
    .blit(avatar, 732, 192)
    .getBufferAsync(Jimp.MIME_PNG)
    .then(async (imageBuffer) => {
      const image = new MessageAttachment(imageBuffer, `${interaction.id}.png`)
        .setDescription(`Now playing: ${songInfo.title}`);
      followUp = await interaction.followUp({ content: `Playing ${songInfo.title.substring(0, 22)} in <#${channelId}>`, files: [image] });
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
