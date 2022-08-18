import {
  ButtonInteraction,
  CommandInteraction,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
} from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import Forest from './Forest';

const BOT_TOKEN = process.env.FOREST_BOT_TOKEN ?? '';

const forestApi = new Forest(BOT_TOKEN);

// TODO: place this in a database
const rooms: Record<string, Record<string, any>> = {};

async function cleanUpRoom(token: string) {
  const roomData = rooms[token];
  const { room } = roomData;
  await room.leaveRoom();
  clearInterval(room.roomUpdateTimer);
  delete room[token];
}

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

  // const duringActionRow = new MessageActionRow()
  //   .addComponents(
  //     new MessageButton()
  //       .setCustomId('chopTree')
  //       .setLabel('Give up')
  //       .setStyle('DANGER'),
  //   );

  const updateRoomMessage = async () => {
    const roomUpdated = await room.queryRoom();
    if (roomUpdated) {
      let actionRow: MessageActionRow | null = startActionRow;

      const participants = room.participants
        ?.map((participant) => participant.name);

      const fields = [
        { name: 'Length', value: `${room.targetDurationInMinutes} minutes` },
      ];

      if (participants) {
        fields.push(
          { name: 'Participants', value: `${room.participants?.length} participants\n\n${participants.join(', ')}` },
        );
      }

      if (room.startTime) {
        actionRow = null;
        fields.push({ name: 'Time remaining', value: `${room.humanReadableTimeRemaining} secs` });
      }

      const embed = new MessageEmbed()
        .setTitle('Forest room')
        .setDescription(`Room code: ${room.roomToken}`)
        .setURL(`https://www.forestapp.cc/join-room?token=${room.roomToken}`)
        .addFields(fields)
        .setFooter({ text: 'This information updates every 15 seconds. Custom trees are unfortunately not supported.' });

      if (!room.isSuccess) {
        await message.edit({
          content: 'Someone appears to have either left the Forest app or simply given up. The tree is now dead.',
          embeds: [],
          components: [],
        });

        await cleanUpRoom(room.roomToken);

        return;
      }

      if (room.treeHasGrown) {
        await message.edit({ content: 'Tree has grown!', embeds: [], components: [] });

        await cleanUpRoom(room.roomToken);

        return;
      }

      await message.edit({
        content: null,
        embeds: [embed],
        components: actionRow ? [actionRow] : [],
      });
    } else {
      await message.edit('Something went wrong trying to get room details.');
    }
  };

  await updateRoomMessage();
  const roomUpdateTimer = setInterval(updateRoomMessage, 15000);

  rooms[room.roomToken] = {
    room,
    message,
    roomUpdateTimer,
  };
}

async function leaveRoomButton(interaction: ButtonInteraction) {
  const token = interaction.message.embeds[0].description?.replace('Room code: ', '');

  if (!token) {
    await interaction.reply({ content: "Couldn't find a room token.", ephemeral: true });
    return;
  }

  const roomData = rooms[token];
  if (!roomData) {
    await interaction.reply({ content: "This room doesn't exist. You probably tried to run an action on an old message.", ephemeral: true });
    return;
  }
  const { room } = roomData;
  const left = await room.leaveRoom();
  clearInterval(room.roomUpdateTimer);
  if (left) {
    await interaction.update({ content: 'Room cancelled.', embeds: [], components: [] });
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

  const roomData = rooms[token];
  if (!roomData) {
    await interaction.reply({ content: "This room doesn't exist. You probably tried to run an action on an old message.", ephemeral: true });
    return;
  }
  const { room } = roomData;
  const started = await room.startTree();
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

  const roomData = rooms[token];
  if (!roomData) {
    await interaction.reply({ content: "This room doesn't exist. You probably tried to run an action on an old message.", ephemeral: true });
    return;
  }
  const { room } = roomData;
  const ended = await room.endTree();
  clearInterval(room.roomUpdateTimer);
  if (ended) {
    await interaction.update({ content: 'Killed tree.', embeds: [], components: [] });
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
