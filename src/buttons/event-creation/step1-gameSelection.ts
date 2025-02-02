import { ActionRow, ApplicationCommandFlags, ApplicationCommandTypes, Bot, ButtonStyles, Interaction, InteractionResponseTypes, MessageComponentTypes, SelectMenuComponent } from '../../../deps.ts';
import { infoColor1, somethingWentWrong } from '../../commandUtils.ts';
import { CommandDetails } from '../../types/commandTypes.ts';
import { Activities } from './activities.ts';
import { generateActionRow, getNestedActivity, invalidDateTimeStr } from './utils.ts';
import { dateTimeFields, descriptionTextField, fillerChar, idSeparator, LfgEmbedIndexes, lfgStartTimeName, pathIdxEnder, pathIdxSeparator } from '../eventUtils.ts';
import { addTokenToMap, deleteTokenEarly, generateMapId, selfDestructMessage, tokenMap } from '../tokenCleanup.ts';
import utils from '../../utils.ts';
import { customId as createCustomActivityBtnId } from './step1a-openCustomModal.ts';
import { customId as finalizeEventBtnId } from './step2-finalize.ts';
import { isDSTActive, monthsShort } from './dateTimeUtils.ts';
import { dbClient, queries } from '../../db.ts';
import { createEventSlashName } from '../../commands/slashCommandNames.ts';

export const customId = 'gameSel';
const details: CommandDetails = {
	name: createEventSlashName,
	description: 'Creates a new event in this channel.',
	type: ApplicationCommandTypes.ChatInput,
};

const generateCustomEventRow = (title: string, subtitle: string): ActionRow => ({
	type: MessageComponentTypes.ActionRow,
	components: [{
		type: MessageComponentTypes.Button,
		style: ButtonStyles.Primary,
		label: 'Create Custom Event',
		customId: `${createCustomActivityBtnId}${idSeparator}${title}${pathIdxSeparator}${subtitle}${pathIdxSeparator}`,
	}],
});

const execute = async (bot: Bot, interaction: Interaction) => {
	if (interaction.data && (interaction.data.name === createEventSlashName || interaction.data.customId) && interaction.member && interaction.guildId && interaction.channelId) {
		// Light Telemetry
		if (interaction.data.name === createEventSlashName) {
			dbClient.execute(queries.callIncCnt('cmd-gameSel')).catch((e) => utils.commonLoggers.dbError('step1-gameSelection.ts@cmd', 'call sproc INC_CNT on', e));
		}
		if (interaction.data.customId === customId) {
			dbClient.execute(queries.callIncCnt('btn-gameSel')).catch((e) => utils.commonLoggers.dbError('step1-gameSelection.ts@btn', 'call sproc INC_CNT on', e));
		}

		// Check if we are done
		const customIdIdxPath = (interaction.data.customId || '').substring((interaction.data.customId || '').indexOf(idSeparator) + 1) || '';
		const valuesIdxPath = interaction.data?.values?.[0] || '';
		const strippedIdxPath = interaction.data.customId?.includes(idSeparator) ? customIdIdxPath : valuesIdxPath;
		const finalizedIdxPath = strippedIdxPath.substring(0, strippedIdxPath.lastIndexOf(pathIdxEnder));
		if ((interaction.data.customId?.includes(idSeparator) && interaction.data.customId.endsWith(pathIdxEnder)) || interaction.data?.values?.[0].endsWith(pathIdxEnder)) {
			let prefillTime = '';
			let prefillTimeZone = '';
			let prefillDate = '';
			let prefillDescription = '';
			if (interaction.message?.embeds[0].fields && interaction.message.embeds[0].fields[LfgEmbedIndexes.StartTime].name === lfgStartTimeName) {
				if (interaction.message.embeds[0].fields[LfgEmbedIndexes.StartTime].value !== invalidDateTimeStr) {
					let rawEventDateTime = interaction.message.embeds[0].fields[LfgEmbedIndexes.StartTime].value.split('\n')[0].split(' ');
					utils.commonLoggers.logMessage('step1-gameSelection.ts:Line53', 'Got rawEventDateTime: ' + rawEventDateTime);
					const monthIdx = rawEventDateTime.findIndex((item) => monthsShort.includes(item.toUpperCase()));
					prefillTime = rawEventDateTime.slice(0, monthIdx - 1).join(' ').trim();
					prefillTimeZone = (rawEventDateTime[monthIdx - 1] || '').trim();
					prefillDate = rawEventDateTime.slice(monthIdx).join(' ').trim();
				}
				prefillDescription = interaction.message.embeds[0].fields[LfgEmbedIndexes.Description].value.trim();
			}

			//Help our European Friends
			prefillDate = new Date().toLocaleDateString('de-CH');
			const isDayLightSavingTimeZone = isDSTActive();
			if (isDayLightSavingTimeZone) {
				prefillTimeZone = 'UTC+2';
			} else {
				prefillTimeZone = 'UTC+1';
			}

			prefillDescription = 'Armada Level: X. Gewünschtes Shiplevel: A-B.';

			utils.commonLoggers.logMessage('step1-gameSelection.ts:64', 'Sending Interaction Response');
			bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
				type: InteractionResponseTypes.Modal,
				data: {
					title: 'Enter Event Details',
					customId: `${finalizeEventBtnId}${idSeparator}${finalizedIdxPath}`,
					components: [...dateTimeFields(prefillTime, prefillTimeZone, prefillDate), descriptionTextField(prefillDescription)],
				},
			}).catch((e: Error) => utils.commonLoggers.interactionSendError('step1-gameSelection.ts:modal', interaction, e));
			return;
		}

		// Parse indexPath from the select value
		const rawIdxPath: Array<string> = interaction.data.values ? interaction.data.values[0].split(pathIdxSeparator) : [''];
		const idxPath: Array<number> = rawIdxPath.map((rawIdx) => rawIdx ? parseInt(rawIdx) : -1);
		const selectMenus: Array<ActionRow> = [];
		// Use fillerChar to create unique customIds for dropdowns
		// We also leverage this to determine if its the first time the user has entered gameSel
		let selectMenuCustomId = `${customId}${fillerChar}`;
		let currentBaseValue = '';

		for (let i = 0; i < idxPath.length; i++) {
			const idx = idxPath[i];
			const idxPathCopy = [...idxPath].slice(0, i);
			selectMenus.push(generateActionRow(currentBaseValue, getNestedActivity(idxPathCopy, Activities), selectMenuCustomId, idx));

			selectMenuCustomId = `${selectMenuCustomId}${fillerChar}`;
			currentBaseValue = `${currentBaseValue}${idx}${pathIdxSeparator}`;
		}

		// Prefill the custom event modal
		const prefillArray: Array<string> = [];
		selectMenus.forEach((menu) => {
			try {
				const menuOption = (menu.components[0] as SelectMenuComponent).options.find((option) => option.default);
				if (menuOption) {
					prefillArray.push(menuOption.label);
				}
			} catch (_e) {
				// do nothing, don't care
			}
		});
		selectMenus.push(generateCustomEventRow(prefillArray.length ? prefillArray[0] : '', prefillArray.length > 1 ? prefillArray[prefillArray.length - 1] : ''));

		if (interaction.data.customId?.includes(fillerChar)) {
			// Let discord know we didn't ignore the user
			utils.commonLoggers.logMessage('step1-gameSelection.ts:110', 'Sending Interaction Response Ping');
			await bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
				type: InteractionResponseTypes.DeferredUpdateMessage,
			}).catch((e: Error) => utils.commonLoggers.interactionSendError('step1-gameSelection.ts:ping', interaction, e));

			// Update the original game selector
			utils.commonLoggers.logMessage('step1-gameSelection.ts:116', 'Edit original Interaction Response');
			await bot.helpers.editOriginalInteractionResponse(tokenMap.get(generateMapId(interaction.guildId, interaction.channelId, interaction.member.id))?.token || '', {
				components: selectMenus,
			}).catch((e: Error) => utils.commonLoggers.interactionSendError('step1-gameSelection.ts:edit', interaction, e));
		} else {
			// Delete old token entry if it exists
			utils.commonLoggers.logMessage('step1-gameSelection.ts:122', 'Deleting Token Early');
			await deleteTokenEarly(bot, interaction, interaction.guildId, interaction.channelId, interaction.member.id);

			// Store token for later use
			utils.commonLoggers.logMessage('step1-gameSelection.ts:126', 'Adding Token Map');
			addTokenToMap(bot, interaction, interaction.guildId, interaction.channelId, interaction.member.id);

			// Send initial interaction
			utils.commonLoggers.logMessage('step1-gameSelection.ts:130', 'Sending Initial Interaction');
			bot.helpers.sendInteractionResponse(interaction.id, interaction.token, {
				type: InteractionResponseTypes.ChannelMessageWithSource,
				data: {
					embeds: [{
						title: 'Please select a Game and Activity, or create a Custom Event.',
						description: selfDestructMessage(new Date().getTime()),
						color: infoColor1,
					}],
					flags: ApplicationCommandFlags.Ephemeral,
					components: selectMenus,
				},
			}).catch((e: Error) => utils.commonLoggers.interactionSendError('step1-gameSelection.ts:init', interaction, e));
		}
	} else {
		somethingWentWrong(bot, interaction, 'missingCoreValuesOnGameSel');
	}
};

export const gameSelectionCommand = {
	details,
	execute,
};

export const gameSelectionButton = {
	customId,
	execute,
};
