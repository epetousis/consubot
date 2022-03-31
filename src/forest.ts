import { ButtonInteraction, CommandInteraction, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import parseDuration from 'parse-duration';
import fetch from 'node-fetch';

const BOT_TOKEN = process.env.FOREST_BOT_TOKEN ?? '';

async function createRoom(duration: number | undefined, token: string) {
  const request = await fetch(
    'https://c88fef96.forestapp.cc/api/v1/rooms',
    {
      method: 'post',
      headers: {
        'content-type': 'application/json',
        cookie: `remember_token=${token}`,
        'user-agent': 'Forest/4.54.2 (com.forestapp.Forest; build:4142713.7564828918; iOS 15.4.0) Alamofire/5.2.2',
      },
      body: JSON.stringify({
        'room_type': 'chartered',
        'target_duration': duration ?? 1500,
        'tree_type': 0,
      }),
    },
  );
  return request.status === 201 ? request.json() as Record<string, any> : null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function updateRoom(room: string, options: Record<string, string | number>, token: string) {
  const request = await fetch(
    `https://c88fef96.forestapp.cc/api/v1/rooms/${room}`,
    {
      method: 'put',
      headers: {
        'content-type': 'application/json',
        cookie: `remember_token=${token}`,
        'user-agent': 'Forest/4.54.2 (com.forestapp.Forest; build:4142713.7564828918; iOS 15.4.0) Alamofire/5.2.2',
      },
      body: JSON.stringify(options),
    },
  );
  return request.status === 200;
}

async function queryRoom(room: string, token: string) {
  const request = await fetch(
    `https://c88fef96.forestapp.cc/api/v1/rooms/${room}?detail=true`,
    {
      method: 'get',
      headers: {
        'content-type': 'application/json',
        cookie: `remember_token=${token}`,
        'user-agent': 'Forest/4.54.2 (com.forestapp.Forest; build:4142713.7564828918; iOS 15.4.0) Alamofire/5.2.2',
      },
    },
  );
  // If 304, room has not changed since last query.
  return request.status === 200 ? request.json() as Record<string, any> : null;
}

async function leaveRoom(room: string, token: string) {
  const request = await fetch(
    `https://c88fef96.forestapp.cc/api/v1/rooms/${room}/leave`,
    {
      method: 'put',
      headers: {
        'content-type': 'application/json',
        cookie: `remember_token=${token}`,
        'user-agent': 'Forest/4.54.2 (com.forestapp.Forest; build:4142713.7564828918; iOS 15.4.0) Alamofire/5.2.2',
      },
      body: '{}',
    },
  );
  return request.status === 200;
}

async function startTree(room: string, token: string) {
  const request = await fetch(
    `https://c88fef96.forestapp.cc/api/v1/rooms/${room}/start`,
    {
      method: 'put',
      headers: {
        'content-type': 'application/json',
        cookie: `remember_token=${token}`,
        'user-agent': 'Forest/4.54.2 (com.forestapp.Forest; build:4142713.7564828918; iOS 15.4.0) Alamofire/5.2.2',
      },
      body: '{}',
    },
  );
  // If response code === 423, not enough people are in the room.
  return request.status === 200;
}

async function endTree(room: string, token: string) {
  const request = await fetch(
    `https://c88fef96.forestapp.cc/api/v1/rooms/${room}/chop`,
    {
      method: 'put',
      headers: {
        'content-type': 'application/json',
        cookie: `remember_token=${token}`,
        'user-agent': 'Forest/4.54.2 (com.forestapp.Forest; build:4142713.7564828918; iOS 15.4.0) Alamofire/5.2.2',
      },
      body: JSON.stringify({
        'end_time': (new Date()).toISOString(),
      }),
    },
  );
  return request.status === 200;
}

function secondsToTime(e: number){
  const h = Math.floor(e / 3600).toString().padStart(2, '0'),
    m = Math.floor(e % 3600 / 60).toString().padStart(2, '0'),
    s = Math.floor(e % 60).toString().padStart(2, '0');

  return h + ':' + m + ':' + s;
}

// TODO: place this in a database
const rooms: Record<string, Record<string, any>> = {};

async function forest(message: CommandInteraction) {
  // The Forest command makes web requests of unknown response time - buy ourselves some time
  await message.deferReply();

  const duration = parseDuration(message.options.getString('duration') ?? '25 min', 's');
  if (!duration) {
    await message.editReply('Invalid time provided.');
    return;
  }

  const roomResponse = await createRoom(duration, BOT_TOKEN);
  if (!roomResponse) {
    return message.editReply('Something went wrong trying to create a room.');
  }

  const startActionRow = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId('leaveRoom')
        .setLabel('Cancel')
        .setStyle('SECONDARY'),
      new MessageButton()
        .setCustomId('startTimer')
        .setLabel('Plant')
        .setStyle('PRIMARY'),
    );

  const duringActionRow = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId('chopTree')
        .setLabel('Give up')
        .setStyle('DANGER'),
    );

  const updateRoomMessage = async () => {
    const roomUpdateResponse = await queryRoom(roomResponse.id, BOT_TOKEN);
    if (roomUpdateResponse) {
      let actionRow = startActionRow;

      const participants = roomUpdateResponse.participants.map((participant: Record<string, any>) => participant.name);
      const fields = [
        { name: 'Length', value: `${Math.floor(roomResponse.target_duration / 60)} minutes` },
        { name: 'Participants', value: `${roomUpdateResponse.participants_count} participants\n\n${participants.join(', ')}` },
      ];
      if (roomUpdateResponse.start_time) {
        actionRow = duringActionRow;
        const startDate = new Date(roomUpdateResponse.start_time);
        const secondsElapsed = ((new Date()).getTime() - startDate.getTime()) / 1000;
        const secondsRemaining = roomUpdateResponse.target_duration - secondsElapsed;
        fields.push({ name: 'Time remaining', value: `${secondsToTime(secondsRemaining)} secs` });
      }

      const embed = new MessageEmbed()
        .setTitle('Forest room')
        .setDescription(`Room code: ${roomResponse.token}`)
        .addFields(fields)
        .setFooter('This information updates every 15 seconds. Custom trees are unfortunately not supported.');

      if (!roomUpdateResponse.is_success) {
        await message.editReply({ content: 'Someone appears to have either left the Forest app or simply given up. The tree is now dead.', embeds: [embed], components: [] });

        const room = rooms[roomResponse.token];
        await leaveRoom(room.id, BOT_TOKEN);
        clearInterval(room.roomUpdateTimer);
        delete room[roomResponse.token];

        return;
      }
      await message.editReply({ content: null, embeds: [embed], components: [actionRow] });
    } else {
      await message.editReply('Something went wrong trying to get room details.');
    }
  };

  await updateRoomMessage();
  const roomUpdateTimer = setInterval(updateRoomMessage, 15000);

  rooms[roomResponse.token] = {
    id: roomResponse.id,
    interaction: message,
    token: roomResponse.token,
    roomUpdateTimer,
  };
}

async function leaveRoomButton(interaction: ButtonInteraction) {
  const token = interaction.message.embeds[0].description?.replace('Room code: ', '');

  if (!token) {
    await interaction.reply({ content: "Couldn't find a room token.", ephemeral: true });
    return;
  }

  const room = rooms[token];
  const left = await leaveRoom(room.id, BOT_TOKEN);
  clearInterval(room.roomUpdateTimer);
  if (left) {
    await interaction.update({ content: 'Room cancelled.', components: [] });
  } else {
    await interaction.reply({ content: "Couldn't leave and cancel the room.", ephemeral: true });
  }
  delete rooms[token];
}

async function plantTreeButton(interaction: ButtonInteraction) {
  const token = interaction.message.embeds[0].description?.replace('Room code: ', '');

  if (!token) {
    await interaction.reply({ content: "Couldn't pull a room token.", ephemeral: true });
    return;
  }

  const room = rooms[token];
  const started = await startTree(room.id, BOT_TOKEN);
  if (started) {
    await interaction.update({ content: 'Started room. The information will update in just a moment.', components: [] });
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

  const room = rooms[token];
  const ended = await endTree(room.id, BOT_TOKEN);
  clearInterval(room.roomUpdateTimer);
  if (ended) {
    await interaction.update({ content: 'Killed tree.', components: [] });
  } else {
    await interaction.reply({ content: "Couldn't kill tree.", ephemeral: true });
  }
  delete rooms[token];
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
    { handler: forest, data: new SlashCommandBuilder().setName('forest').setDescription('Create a Forest room')
      .addStringOption((option) => option.setName('duration').setDescription('Duration for timer. Forest only allows a minimum of 10 minutes and a maximum of 3 hours.')) },
  ];
}
