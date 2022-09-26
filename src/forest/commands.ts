import {
  ButtonInteraction,
  Client,
  CommandInteraction,
} from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import Forest from './Forest';
import RoomStore, { RoomStoreSerialisedRecord } from './RoomStore';
import Room from './Room';
import { readFile, writeFile } from 'node:fs/promises';

const BOT_TOKEN = process.env.FOREST_BOT_TOKEN ?? '';

const forestApi = new Forest(BOT_TOKEN);

const roomStore = new RoomStore();

const onDiscordInit = async (client: Client) => {
  const roomStoreData = await readFile('roomdata.json', 'utf-8');
  const roomStoreObjects: RoomStoreSerialisedRecord[] = JSON.parse(roomStoreData);
  roomStoreObjects.forEach(async (roomRecord) => {
    const roomData = JSON.parse(roomRecord.room);
    // Check that room data is valid
    if (!('type' in roomData && roomData.type !== 'room')) return;
    const room = new Room(BOT_TOKEN, roomData);

    const channel = client.channels.cache.get(roomRecord.channelId);
    if (!channel?.isText()) return;
    const message = channel.messages.cache.get(roomRecord.messageId) ?? await channel.messages.fetch(roomRecord.messageId);

    roomStore.setRoom(room, message);
  });
};

const dumpStore = async () => {
  try {
    console.log('[Forest] Exit signal received. Writing room data...');
    const roomStoreData = JSON.stringify(roomStore);
    await writeFile('roomdata.json', roomStoreData);
  } catch (e) {
    console.log(`[Forest] Unable to write room data: ${e}`);
  }
};

process.on('exit', dumpStore);
process.on('uncaughtException', dumpStore);

async function forest(interaction: CommandInteraction) {
  // The Forest command makes web requests of unknown response time - buy ourselves some time
  await interaction.deferReply();

  // Get duration in seconds
  const duration = (interaction.options.getInteger('duration') ?? 25) * 60;
  const message = await interaction.fetchReply();
  if (!('edit' in message)) {
    await interaction.editReply('A critical error occurred. Discord has broken something.');
    return;
  }

  const room = await forestApi.createRoom(duration);
  if (!room) {
    await interaction.editReply('Something went wrong trying to create a room. You may have entered an invalid time - Forest only allows a minimum of 10 minutes and a maximum of 3 hours.');
    return;
  }

  await interaction.editReply('Room created. Reloading data...');

  roomStore.setRoom(room, message);
}

async function leaveRoomButton(interaction: ButtonInteraction) {
  const token = interaction.message.embeds[0].description?.replace('Room code: ', '');

  if (!token) {
    await interaction.reply({ content: "Couldn't find a room token.", ephemeral: true });
    return;
  }

  const roomData = roomStore.getRoom(token);
  if (!roomData) {
    await interaction.reply({ content: "This room doesn't exist. You probably tried to run an action on an old message.", ephemeral: true });
    return;
  }

  const left = await roomStore.cleanUpRoom(token);

  if (left) {
    await interaction.update({
      content: 'Room cancelled.',
      embeds: [],
      files: [],
      components: [],
    });
  } else {
    await interaction.reply({ content: "Couldn't leave and cancel the room.", ephemeral: true });
  }
}

async function plantTreeButton(interaction: ButtonInteraction) {
  const token = interaction.message.embeds[0].description?.replace('Room code: ', '');

  if (!token) {
    await interaction.reply({ content: "Couldn't pull a room token.", ephemeral: true });
    return;
  }

  const roomData = roomStore.getRoom(token);
  if (!roomData) {
    await interaction.reply({ content: "This room doesn't exist. You probably tried to run an action on an old message.", ephemeral: true });
    return;
  }
  const { room } = roomData;
  const started = await room.startTree();
  if (started) {
    await interaction.update({ content: 'Started room. The information will update in just a moment.', files: [], components: [] });
  } else {
    await interaction.reply({ content: "Couldn't start timer. Not enough people in your room?", ephemeral: true });
  }
}

async function cancelButton(interaction: ButtonInteraction) {
  const token = interaction.message.embeds[0].description?.replace('Room code: ', '');

  if (!token) {
    await interaction.reply({ content: "Couldn't find a room token.", ephemeral: true });
    return;
  }

  const roomData = roomStore.getRoom(token);
  if (!roomData) {
    await interaction.reply({ content: "This room doesn't exist. You probably tried to run an action on an old message.", ephemeral: true });
    return;
  }
  const { room } = roomData;
  const ended = await room.endTree();
  const left = await roomStore.cleanUpRoom(token);
  if (ended && left) {
    await interaction.update({
      content: 'Killed tree.',
      embeds: [],
      files: [],
      components: [],
    });
  } else {
    await interaction.reply({ content: "Couldn't kill tree.", ephemeral: true });
  }
}

export function ForestHandlers() {
  return {
    ready: onDiscordInit,
  };
}

export function ForestButtons() {
  return [
    { handler: cancelButton, id: 'chopTree' },
    { handler: leaveRoomButton, id: 'leaveRoom' },
    { handler: plantTreeButton, id: 'startTimer' },
  ];
}

export default function ForestCommands() {
  return [
    {
      handler: forest,
      data: new SlashCommandBuilder().setName('forest').setDescription('Create a Forest room')
        .addIntegerOption(
          (option) => option
            .setName('duration')
            .setMinValue(10)
            .setMaxValue(180)
            .setDescription('Duration for timer in minutes. Defaults to 25 minutes.'),
        ),
    },
  ];
}
