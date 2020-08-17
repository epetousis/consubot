import { Message, MessageEmbed } from 'discord.js';

const prefix = process.env.BOT_PREFIX ?? '!';

export type MessageHandlerCallback = (message: Message) => void;

export function parseArguments(messageContent: string, delimiter?: string) {
  const args = messageContent.slice(prefix.length).trim().split(delimiter ?? ' ');
  const command = args.shift()?.toLowerCase();
  const message = args.join();

  return {
    command,
    args,
    message,
  };
}

export default class CommandHandler {
  private handlerMap: Map<String, MessageHandlerCallback>;

  private commandList: {[category: string]: string};

  constructor() {
    this.handlerMap = new Map<String, MessageHandlerCallback>();
    this.commandList = {};
  }

  addHandlers(input: {[command: string]: MessageHandlerCallback}, category: string) {
    const inputKeys = Object.keys(input);

    if (inputKeys.includes('help')) {
      throw new Error('help is a reserved command name.');
    }

    inputKeys.forEach((command) => {
      this.handlerMap.set(command, input[command]);
    });

    this.commandList[category] = inputKeys.map((command) => `\`${command}\``).join(', ');
  }

  handle(message: Message) {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    console.log(`Message recieved from ${message.author.id} at ${Date.now()}`);

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift()?.toLowerCase();

    if (!command) {
      return;
    }

    if (command === 'help') {
      const fields = Object.keys(this.commandList)
        .map((category) => ({ name: category, value: this.commandList[category] }));
      const helpEmbed = new MessageEmbed()
        .addFields(fields);
      message.channel.send(helpEmbed);
      return;
    }

    const handler = this.handlerMap.get(command);

    if (handler) {
      handler(message);
    }
  }
}
