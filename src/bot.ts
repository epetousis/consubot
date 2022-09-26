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
import ForestCommands, { ForestButtons, ForestHandlers } from './forest/commands';

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

const buttonExports = [
  ForestButtons(),
].flat();

const buttonDefinitions = new Map<string, BotButton>();
buttonExports.forEach((button) => buttonDefinitions.set(button.id, button));

const commandExports = [
  FightCommands(),
  TimerCommands(),
  MemeCommands(),
  TextMemeCommands(),
  UtilCommands(),
  ForestCommands(),
].flat();

const commandDefinitions = new Map<string, BotCommand>();
commandExports.forEach((command) => commandDefinitions.set(command.data.name, command));

const handlerExports = [
  ForestHandlers(),
];

client.once('ready', () => {
  console.log('Ready!');

  if (!client.user) return;

  client.user.setActivity('with your emotions');

  handlerExports.forEach((exportedHandlers) => exportedHandlers.ready(client));
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
