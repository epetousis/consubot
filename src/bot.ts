import { Client } from 'discord.js';
import http from 'http';
import CommandHandler from './handler';
import FightCommands from './fight';

const clientId = process.env.BOT_CLIENT_ID ?? '';
const permissions = 2048;
const token = process.env.BOT_AUTH_TOKEN ?? '';

const client = new Client();

const commandHandler = new CommandHandler();
commandHandler.addHandlers(FightCommands());

client.once('ready', () => {
  console.log('Ready!');

  if (!client.user) return;

  client.user.setActivity('with your emotions');
});

client.on('message', (message) => {
  commandHandler.handle(message);
});

client.login(token);

http.createServer((request, response) => {
  response.writeHead(302, {
    Location: `https://discord.com/api/oauth2/authorize?client_id=${clientId}&scope=bot&permissions=${permissions}`,
  });
  response.end();
}).listen(process.env.PORT || 4096);
