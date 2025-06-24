import {
  ButtonInteraction,
  Client,
  CommandInteraction,
  Intents,
} from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import express from 'express';
import setupAutoReacts from './autoreacts';
import setupObama from './obama';

import FightCommands from './fight';
import TimerCommands from './timer';
import MemeCommands from './memes';
import TextMemeCommands from './textmemes';
import UtilCommands from './util';
import ForestCommands, { ForestButtons } from './forest/commands';
import Room from './forest/Room';
import forestRoomStore from './common/forest/forestRoomStoreInstance';
import { updateForestRoomMessage } from './forest/commands';

type BotButton = {
  id: string,
  handler: (interaction: ButtonInteraction) => void | Promise<unknown>,
};

type BotCommand = {
  data: Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>,
  handler: (interaction: CommandInteraction) => void | Promise<unknown>,
};

const clientId = process.env.BOT_CLIENT_ID ?? '';
const permissions = 2147493888;
const token = process.env.BOT_AUTH_TOKEN ?? '';

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});

const buttonDefinitions = new Map<string, BotButton>();

const commandDefinitions = new Map<string, BotCommand>();

client.once('ready', () => {
  console.log('Ready!');

  if (!client.user) return;

  client.user.setActivity('with your emotions');

  // Restore rooms and timers on startup (now that client is available and ready)
  restoreForestRooms();
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isCommand()) {
    const commandDefinition = commandDefinitions.get(interaction.commandName);

    if (!commandDefinition) {
      await interaction.reply({ content: 'Command wasn\'t found. This can happen while the bot is in the middle of an update. Try again in a few minutes.', ephemeral: true });
      return;
    }

    try {
      await commandDefinition.handler(interaction);
      if (!interaction.replied) await interaction.reply({ content: 'Some goober added a command to me that didn\'t output a reply on completion. Possibly a bug?', ephemeral: true });
    } catch (error) {
      console.error('Error occurred during app command handling:', error);
      const messageContent = { content: 'There was an error while executing this command!', ephemeral: true };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(messageContent);
      } else {
        await interaction.reply(messageContent);
      }
    }
  } else if (interaction.isButton()) {
    const buttonDefinition = buttonDefinitions.get(interaction.customId);

    if (!buttonDefinition) {
      await interaction.reply({ content: 'Button action failed to run. This can happen while the bot is in the middle of an update, or if the operator broke something. Try again in a few minutes.', ephemeral: true });
      return;
    }

    try {
      await buttonDefinition.handler(interaction);
    } catch (error) {
      console.error('Error occurred during button handling:', error);
      const messageContent = { content: 'There was an error while executing this button action!', ephemeral: true };

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(messageContent);
      } else {
        await interaction.reply(messageContent);
      }
    }
  }
});

const setupCommandsAndButtons = async () => {
  const commandExports = [
    FightCommands(),
    TimerCommands(),
    MemeCommands(),
    TextMemeCommands(),
    UtilCommands(),
    ForestCommands(),
  ].flat();
  commandExports.forEach((command) => commandDefinitions.set(command.data.name, command));

  ForestButtons().forEach((button) => buttonDefinitions.set(button.id, button));
};

setupCommandsAndButtons();

// Restore rooms and timers on startup (now that client is available)
const BOT_TOKEN = process.env.FOREST_BOT_TOKEN ?? '';
const rooms: Record<string, Record<string, any>> = {};

async function restoreForestRooms() {
  const loadedRooms = await forestRoomStore.loadRooms();
  loadedRooms.forEach(async (roomObj: any) => {
    if (roomObj && roomObj.data && roomObj.channelId && roomObj.messageId) {
      const room = new Room(BOT_TOKEN, roomObj.data);
      try {
        const channel = await client.channels.fetch(roomObj.channelId);
        if (channel && 'messages' in channel) {
          const message = await channel.messages.fetch(roomObj.messageId);
          const startActionRow = null;
          const updateRoomMessage = async () =>
            updateForestRoomMessage({ room, message, startActionRow });
          const roomUpdateTimer = setInterval(updateRoomMessage, 15000);
          rooms[room.roomToken] = { room, message, roomUpdateTimer };
        }
      } catch (e) {
        console.error(e);
        // Could not restore message/timer, skip
      }
    }
  });
}

setupAutoReacts(client);
setupObama(client);
client.login(token);

const app = express();
const port = process.env.PORT || 4096;

app.use(express.static('public'));

app.get('/', (_req, res) => {
  res.header('Location', `https://discord.com/api/oauth2/authorize?client_id=${clientId}&scope=bot%20applications.commands&permissions=${permissions}`);
  res.status(302);
  res.send();
});

app.listen(port, () => {
  console.log(`Bot running on port ${port}`);
});

export default client;
