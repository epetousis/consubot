import { Client, Collection, CommandInteraction, Intents } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import express from 'express';
import setupAutoReacts from './autoreacts';

import FightCommands from './fight';
import TimerCommands from './timer';
import MemeCommands from './memes';
import PomodoroCommands from './pomodoro';
import UtilCommands from './util';

type BotCommand = {
  data: Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>,
  handler: (interaction: CommandInteraction) => void,
};

const clientId = process.env.BOT_CLIENT_ID ?? '';
const permissions = 2147493888;
const token = process.env.BOT_AUTH_TOKEN ?? '';

const client = new Client({ intents: [
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
] });

const commandExports = [
  FightCommands(),
  TimerCommands(),
  MemeCommands(),
  PomodoroCommands(),
  UtilCommands(),
].flat();

const commands = new Collection<string, BotCommand>();
commandExports.forEach((command) => commands.set(command.data.name, command));

client.once('ready', () => {
  console.log('Ready!');

  if (!client.user) return;

  client.user.setActivity('with your emotions');
});

client.on('interactionCreate', async interaction => {
  // Taken from https://discordjs.guide/creating-your-bot/command-handling.html#dynamically-executing-commands
  // This code segment is licensed under the MIT license: see https://github.com/discordjs/guide/blob/main/LICENSE
  /* MIT License

  Copyright (c) 2017 - 2021 Sanctuary

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE. */
  if (!interaction.isCommand()) return;

  const command = commands.get(interaction.commandName);

  if (!command) {
    await interaction.reply({ content: 'Command wasn\'t found...?', ephemeral: true });
    return;
  }

  try {
    await command.handler(interaction);
    if (!interaction.replied) await interaction.reply({ content: 'Some goober added a command to me that didn\'t output a reply on completion. Possibly a bug?', ephemeral: true });
  } catch (error) {
    console.error(error);
    const messageContent = { content: 'There was an error while executing this command!', ephemeral: true };

    if (interaction.replied) {
      await interaction.followUp(messageContent);
    } else {
      await interaction.reply(messageContent);
    }
  }
});

setupAutoReacts(client);

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
