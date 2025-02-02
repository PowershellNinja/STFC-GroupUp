import config from './config.ts';
import { DEBUG, LOCALMODE } from './flags.ts';
import { createBot, enableCachePlugin, enableCacheSweepers, initLog, Intents, startBot } from './deps.ts';
import { events } from './src/events.ts';
import { createSlashCommands } from './src/commands/_index.ts';
import { tokenMap } from './src/buttons/tokenCleanup.ts';
import utils from './src/utils.ts';

// Initialize logging client with folder to use for logs, needs --allow-write set on Deno startup
initLog('logs', DEBUG);

// Set up the Discord Bot
const bot = enableCachePlugin(createBot({
	token: LOCALMODE ? config.localToken : config.token,
	intents: Intents.MessageContent | Intents.GuildMessages | Intents.DirectMessages | Intents.Guilds | Intents.GuildMessageReactions,
	events,
	rest: {
		debug: (debugStr: string) => utils.commonLoggers.logMessage('REST-Debug', debugStr),
	  },
}));
enableCacheSweepers(bot);

// Start the bot
await startBot(bot);

// Announce the slash commands so users can use them
await createSlashCommands(bot);
