# STFC Group Up - An Event Scheduling Discord Bot | V1.0.0

STFC-Group Up is a Discord bot built for scheduling events in your alliance.  The bot utilizes user-friendly Buttons, Slash Commands, and Forms to create events.

The Bot code is based on https://github.com/Burn-E99/GroupUp and adjusted for organizing activities in Star Trek Fleet Command like Armadas and Territory Takeovers.
Other than the original GroupUp bot, there is no public hosting of this bot - you are free to take the code and run your own instance of it though!

## Using Group Up
After inviting the bot, if you want to create a dedicated event channel, simply run `/setup` in the desired channel and follow the on-screen prompts.  If you don't want a dedicated channel, just run `/create-event` anywhere.

Note: The `MANAGE_GUILD`, `MANAGE_CHANNELS`, and `MANAGE_ROLES` permissions are only necessary for the `/setup` command.  Once you create all of the event channel that you need, you may remove these permissions from the bot without causing any issues.
---

## Available Commands
* `/help`
  * Provides a message to help users get Group Up set up in their guild.
* `/info`
  * Outputs some information and links relating to the bot including the Privacy Policy and Terms of Service.
* `/report [issue, feature request]`
  * People aren't perfect, but this bot is trying to be.
  * If you encounter a command that errors out or returns something unexpected, please use this command to alert the developers of the problem.
  * Additionally, if you have a feature request, this is one of the ways to request one
* `/create-event`
  * Starts the event creation process.
* `/setup [options]` **ONLY Available to Guild Members with the `ADMINISTRATOR` permission**
  * Designates the current channel as a Event Channel.  After the command successfully runs, Group Up will be in control of the channel for running events.
* `/delete-lfg-channel` **ONLY Available to Guild Members with the `ADMINISTRATOR` permission**
  * Removes the Event Channel designation from the current channel
* `/event [options]` **ONLY Available to Guild Members with a Group Up Manager role in a managed Event Channel**
  * Allows Group Up Managers to Join/Leave/Alternate members to events

## Self Hosting STFC-GroupUp
STFC-GroupUp is built on [Deno](https://deno.land/) `v1.33.1` using [Discordeno](https://discordeno.mod.land/) `v17.0.1`.  If you choose to run this yourself, you will need to rename `config.example.ts` to `config.ts` and edit some values.  You will need to create a new [Discord Application](https://discord.com/developers/applications) and copy the newly generated token into the `"token"` field.  If you want to utilize some of the bots dev features, you will need to fill in the keys `"logChannel"` and `"reportChannel"` with text channel IDs and `"devServer"` with a guild ID.

You will also need to install and setup a MySQL database with a user for the bot to use to add/modify the database.  This user must have the `"DB Manager"` admin rights and `"REFERENCES"` Global Privileges.  Once the DB is installed and a user is setup, run the provided `db\initialize.ts` to create the schema and tables.  After this, run `db\populateDefaults.ts` to insert some needed values into the tables.

DB User needs Schema Permissions too before running the commands. 
GRANT SYSTEM_USER ON *.* TO stfcgroupup
Then run deno run --allow-all .\initialize.ts and deno run --allow-all .\populateDefaults.ts

Once everything is set up, starting the bot can simply be done with `deno run --allow-write=./logs --allow-net .\mod.ts`.

---

The code in this repository is provided as-is and no 

