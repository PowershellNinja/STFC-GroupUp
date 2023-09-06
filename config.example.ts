export const config = {
	'name': 'Group Up', // [Mandatory] Name of the bot
	'version': '1.0.3', // [Mandatory] Version of the bot
	'token': 'the_bot_token', // [Mandatory] Discord API Token for this bot
	'localToken': 'local_testing_token', // [Optional] Discord API Token for a secondary OPTIONAL testing bot, THIS MUST BE DIFFERENT FROM "token"
	'prefix': '/', // [Mandatory] Prefix for all commands
	'db': { // [Mandatory] Settings for the MySQL database, this is required for use with the API, if you do not want to set this up, you will need to rip all code relating to the DB out of the bot
		'host': '', // [Mandatory] IP address for the db, usually localhost or 127.0.0.1
		'localhost': '', // [Optional] IP address for a secondary OPTIONAL local testing DB, usually also is localhost, but depends on your dev environment
		'port': 3306, // [Mandatory] Port for the db
		'username': '', // [Mandatory] Username for the account that will access your DB, this account will need "DB Manager" admin rights and "REFERENCES" Global Privileges
		'password': '', // [Mandatory] Password for the account, user account may need to be authenticated with the "Standard" Authentication Type if this does not work out of the box
		'name': '', // [Mandatory] Name of the database Schema (DB Name) to use for the bot
	},
	'links': { // Links to various sites
		'sourceCode': 'https://github.com/Burn-E99/GroupUp', // [Mandatory] Link to the repository
		'supportServer': '', // Invite link to the Discord support server
		'addToCalendar': '', // [Mandatory] Link to where the icsGenerator is hosted
		'creatorIcon': '', // [Mandatory] Link to where the GroupUpSinglePerson.png (or similar image) is hosted. Any .png on a web url will do
	},
	'logChannel': 0n, // [Optional] Discord channel ID where the bot should put startup messages and other error messages needed
	'reportChannel': 0n, // [Optional] Discord channel ID where reports will be sent when using the built-in report command
	'devServer': 0n, // [Optional] Discord guild ID where testing of indev features/commands will be handled, used in conjunction with the DEVMODE bool in mod.ts
	'owner': 0n, // [Optional] Discord user ID of the bot admin
	'botLists': [ // [Optional] Array of objects containing all bot lists that stats should be posted to
		{ // Bot List object, duplicate for each bot list
			'name': 'Bot List Name', // Name of bot list, not used
			'enabled': false, // Should statistics be posted to this list?
			'apiUrl': 'https://example.com/api/bots/?{bot_id}/stats', // API URL, use ?{bot_id} in place of the bot id so that it can be dynamically replaced
			'headers': [ // Array of headers that need to be added to the request
				{ // Header Object, duplicate for every header needed
					'header': 'header_name', // Name of header needed, usually Authorization is needed
					'value': 'header_value', // Value for the header
				},
			],
			'body': { // Data payload to send to the bot list, will be turned into a string and any ?{} will be replaced with the required value, currently only has ?{server_count}
				'param_name': '?{param_value}', // Add more params as needed
			},
		},
	],
};

export default config;
