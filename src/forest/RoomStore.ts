import {
  MessageActionRow,
  MessageEmbed,
  MessageAttachment,
  Message,
} from 'discord.js';
import Room from './Room';
import { startActionRow } from './constants';

const updateRoomMessage = async (room: Room, message: Message) => {
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

    if (!room.endTime) {
      // If the room hasn't started yet, attach our QR code
      embed.setImage('attachment://forest_qrcode.png');
    }

    if (!room.isSuccess) {
      await message.edit({
        content: 'Someone appears to have either left the Forest app or simply given up. The tree is now dead.',
        embeds: [],
        files: [],
        components: [],
      });

      await cleanUpRoom(room.roomToken);

      return;
    }

    if (room.treeHasGrown) {
      await message.edit({
        content: 'Tree has grown!',
        embeds: [],
        files: [],
        components: [],
      });

      await cleanUpRoom(room.roomToken);

      return;
    }

    const qrCodeImageAttachment = room.roomQRCode ? new MessageAttachment(
      room.roomQRCode,
      'forest_qrcode.png',
    ) : null;

    await message.edit({
      content: null,
      embeds: [embed],
      files: qrCodeImageAttachment && !room.endTime ? [qrCodeImageAttachment] : undefined,
      components: actionRow ? [actionRow] : [],
    });
  } else {
    await message.edit('Something went wrong trying to get room details.');
  }
};

interface RoomStoreSerialisedRecord {
  room: string;
  messageId: string;
  channelId: string;
}

interface RoomStoreRecord {
  room: Room;
  message: Message;
  roomUpdateTimer: NodeJS.Timer;
}

export default class RoomStore {
  store: { [roomToken: string]: RoomStoreRecord } = {};

  getRoom(roomToken: string) {
    return this.store[roomToken];
  }

  async setRoom(room: Room, message: Message) {
    await updateRoomMessage(room, message);
    const roomUpdateTimer = setInterval(() => updateRoomMessage(room, message), 15000);
    this.store[room.roomToken] = {
      room,
      message,
      roomUpdateTimer,
    };
  }

  async cleanUpRoom(token: string): Promise<boolean> {
    const roomData = this.getRoom(token);
    const { room } = roomData;
    const success = await room.leaveRoom();
    clearInterval(roomData.roomUpdateTimer);
    delete this.store[token];
    return success;
  }

  toJSON() {
    return Object.values(this.store)
      .map((data): RoomStoreSerialisedRecord => ({
        room: JSON.stringify(data.room),
        messageId: data.message.id,
        channelId: data.message.channelId,
      }));
  }
}
