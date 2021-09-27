import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

import FightCommands from './fight';
import TimerCommands from './timer';
import MemeCommands from './memes';
import PomodoroCommands from './pomodoro';

const clientId = process.env.BOT_CLIENT_ID ?? '';
const devGuildId = process.env.BOT_DEV_GUILD_ID ?? '';
const token = process.env.BOT_AUTH_TOKEN ?? '';

const commands = [
  FightCommands(),
  TimerCommands(),
  MemeCommands(),
  PomodoroCommands(),
].flat().map(command => command.data.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, devGuildId), { body: commands })
  .then(() => console.log('Application commands have been registered.'))
  .catch(console.error);