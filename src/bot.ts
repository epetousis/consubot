import { Client } from 'discord.js';
import express from 'express';
import CommandHandler from './handler';
import FightCommands from './fight';
import TimerCommands from './timer';

const clientId = process.env.BOT_CLIENT_ID ?? '';
const permissions = 2048;
const token = process.env.BOT_AUTH_TOKEN ?? '';

const client = new Client();

const app = express();
const port = process.env.PORT || 4096;

const commandHandler = new CommandHandler();
commandHandler.addHandlers(FightCommands(), 'Fighting');
commandHandler.addHandlers(TimerCommands(), 'Timer');

client.once('ready', () => {
  console.log('Ready!');

  if (!client.user) return;

  client.user.setActivity('with your emotions');
});

client.on('message', (message) => {
  commandHandler.handle(message);
});

client.login(token);

app.get('/', (_req, res) => {
  res.header('Location', `https://discord.com/api/oauth2/authorize?client_id=${clientId}&scope=bot&permissions=${permissions}`);
  res.status(302);
  res.send();
});

app.listen(port, () => {
  console.log(`Bot running on port ${port}`);
});
