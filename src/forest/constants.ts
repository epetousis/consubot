import {
  MessageActionRow,
  MessageButton,
} from 'discord.js';

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

export { startActionRow };
