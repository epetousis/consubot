import { Message } from 'discord.js';

const prefix = process.env.BOT_PREFIX ?? '!';

export type MessageHandlerCallback = (message: Message) => void;

export default class CommandHandler {
  private handlerMap: Map<String, MessageHandlerCallback>;

  constructor() {
    this.handlerMap = new Map<String, MessageHandlerCallback>();
  }

  addHandlers(input: {[command: string]: MessageHandlerCallback}) {
    Object.keys(input).forEach((command) => {
      this.handlerMap.set(command, input[command]);
    });
  }

  handle(message: Message) {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift()?.toLowerCase();

    if (!command) {
      return;
    }

    const handler = this.handlerMap.get(command);

    if (handler) {
      handler(message);
    }
  }
}
