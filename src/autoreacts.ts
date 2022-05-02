import { Client } from 'discord.js';

const reacts = ['omegalul', 'kekw'];

/**
 * Adds event listeners to allow for doubling up message reacts.
 * @param client The Discord client.
 */
export default function setupAutoReacts(client: Client) {
  client.on('messageReactionAdd', async (reaction) => {
    if (reacts.some((react) => reaction.emoji.name?.toLowerCase().includes(react))) {
      reaction.message.react(reaction.emoji);
    }
  });

  client.on('messageReactionRemove', async (reaction) => {
    // React removal is buggy.
    if (!reaction.count || !client.user) return;

    if (reacts.some((react) => reaction.emoji.name?.toLowerCase().includes(react))
      && reaction.count <= 1
      && reaction.users.resolve(client.user)) {
      reaction.users.remove(client.user);
    }
  });
}
