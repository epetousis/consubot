# Consubot

A general purpose Discord bot with relatively straightforward extendability.

## Running the bot

To run the bot locally, [create an application](https://discord.com/developers/applications) with a bot user, then copy the relevant tokens. You may opt to create a special dev server, or just use an existing one, but either way, you'll need an ID for a server to paste into `BOT_DEV_GUILD_ID`.

`BOT_CLIENT_ID=123456789012345678 BOT_AUTH_TOKEN=auth_token BOT_DEV_GUILD_ID=123456789012345678 npm run dev`

Don't forget to set `FOREST_BOT_TOKEN` if you are testing the Forest functionality.
