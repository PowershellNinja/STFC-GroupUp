import { Bot, Interaction } from '../../../deps.ts';
import { somethingWentWrong } from '../../commandUtils.ts';
import { createLFGPost, getFinalActivity } from './utils.ts';
import { eventDateId, eventDescriptionId, eventTimeId, eventTimeZoneId, idSeparator, noDescProvided, pathIdxSeparator } from '../eventUtils.ts';
import { addTokenToMap, deleteTokenEarly } from '../tokenCleanup.ts';
import { Activities, Activity } from './activities.ts';
import { getDateFromRawInput } from './dateTimeUtils.ts';
import utils from '../../utils.ts';
import { dbClient, queries } from '../../db.ts';
import { sendRequestCustom } from '../../custom.ts';

export const customId = 'finalize';

const execute = async (bot: Bot, interaction: Interaction) => {
	utils.commonLoggers.logMessage('step2-finalize.ts:15', 'Entering Execute');
	if (interaction.data?.components?.length && interaction.guildId && interaction.channelId && interaction.member && interaction.member.user) {
		// User selected activity and has filled out fields, delete the selectMenus
		utils.commonLoggers.logMessage('step2-finalize.ts:18', 'Deleting Token Early');
		await deleteTokenEarly(bot, interaction, interaction.guildId, interaction.channelId, interaction.member.id);

		const tempDataMap: Map<string, string> = new Map();
		for (const row of interaction.data.components) {
			if (row.components?.[0]) {
				const textField = row.components[0];
				tempDataMap.set(textField.customId || 'missingCustomId', textField.value || '');
			}
		}

		utils.commonLoggers.logMessage('step2-finalize.ts:29', 'Setup');
		const customIdIdxPath = (interaction.data.customId || '').substring((interaction.data.customId || '').indexOf(idSeparator) + 1) || '';
		const rawIdxPath: Array<string> = customIdIdxPath.split(pathIdxSeparator);
		const idxPath: Array<number> = rawIdxPath.map((rawIdx) => rawIdx ? parseInt(rawIdx) : -1);
		let category: string;
		let activity: Activity;
		let customAct = false;
		if (idxPath.some((idx) => isNaN(idx) || idx < 0)) {
			customAct = true;
			// Handle custom activity
			utils.commonLoggers.logMessage('step2-finalize.ts:39', 'Handle custom activity');
			category = rawIdxPath[0];
			activity = {
				name: rawIdxPath[1],
				maxMembers: parseInt(rawIdxPath[2]) || NaN,
			};
		} else {
			// Handle preset activity
			utils.commonLoggers.logMessage('step2-finalize.ts:47', 'Handle preset activity');
			category = Activities[idxPath[0]].name;
			activity = getFinalActivity(idxPath, Activities);
		}

		if (!category || !activity.name || !activity.maxMembers || isNaN(activity.maxMembers)) {
			// Error out if our activity or category is missing
			utils.commonLoggers.logMessage('step2-finalize.ts:54', 'Error out if our actiivty or category is missing');
			somethingWentWrong(bot, interaction, `missingActivityFromFinalize@${category}_${activity.name}_${activity.maxMembers}`);
		}

		// Log custom event to see if we should add it as a preset
		if (customAct) {
			utils.commonLoggers.logMessage('step2-finalize.ts:60', 'Check Preset');
			dbClient.execute(queries.insertCustomActivity, [interaction.guildId, category, activity.name, activity.maxMembers]).catch((e) =>
				utils.commonLoggers.dbError('step2-finalize.ts@custom', 'insert into', e)
			);
		}

		const rawEventTime = tempDataMap.get(eventTimeId) ?? '';
		const rawEventTimeZone = tempDataMap.get(eventTimeZoneId) ?? '';
		const rawEventDate = tempDataMap.get(eventDateId) ?? '';
		const eventDescription = tempDataMap.get(eventDescriptionId) ?? noDescProvided;
		if (!rawEventTime || !rawEventTimeZone || !rawEventDate) {
			// Error out if user somehow failed to provide one of the fields (eventDescription is allowed to be null/empty)
			utils.commonLoggers.logMessage('step2-finalize.ts:72', 'Error out as fields are missing');
			somethingWentWrong(bot, interaction, `missingFieldFromEventDescription@${rawEventTime}_${rawEventTimeZone}_${rawEventDate}`);
			return;
		}

		// Get Date Object from user input
		utils.commonLoggers.logMessage('step2-finalize.ts:78', 'Getting Date from Input');
		const [eventDateTime, eventDateTimeStr, eventInFuture, dateTimeValid] = getDateFromRawInput(rawEventTime, rawEventTimeZone, rawEventDate);
		utils.commonLoggers.logMessage('step2-finalize.ts:780', 'EventDateTime: ' + eventDateTime.toString());
		utils.commonLoggers.logMessage('step2-finalize.ts:81', 'EventDateTimeString: ' + eventDateTimeStr);
		utils.commonLoggers.logMessage('step2-finalize.ts:82', 'EventInFuture: ' + eventInFuture.toString());
		utils.commonLoggers.logMessage('step2-finalize.ts:83', 'DateTimeValid: ' + dateTimeValid.toString());

		addTokenToMap(bot, interaction, interaction.guildId, interaction.channelId, interaction.member.id);

		//Create LFG Post
		utils.commonLoggers.logMessage('step2-finalize.ts:88', 'Creating LFG Post');
		const lfgPost = createLFGPost(
			category,
			activity,
			eventDateTime,
			eventDateTimeStr,
			eventDescription,
			interaction.member.id,
			interaction.member.user.username,
			[{
				id: interaction.member.id,
				name: interaction.member.user.username,
			}],
			[],
			customIdIdxPath,
			eventInFuture,
			dateTimeValid,
		);

		utils.commonLoggers.logMessage('step2-finalize.ts:107', 'Sending Interaction Response');

		/*
		bot.helpers.sendInteractionResponse(
			interaction.id,
			interaction.token,
			lfgPost,
		).catch((e: Error) => utils.commonLoggers.interactionSendError('step2-finalize.ts', interaction, e));
		*/

		await sendRequestCustom<void>(bot.rest, {
			url: bot.constants.routes.INTERACTION_ID_TOKEN(interaction.id, interaction.token),
			method: 'POST',
			payload: bot.rest.createRequestBody(bot.rest, {
				method: 'POST',
				body: {
					...bot.transformers.reverse.interactionResponse(bot, lfgPost),
					file: lfgPost.data?.file,
				},
				// Remove authorization header
				headers: { Authorization: '' },
			}),
		});
		

		utils.commonLoggers.logMessage('step2-finalize.ts:131', 'Sent Interaction Response');
	} else {
		utils.commonLoggers.logMessage('step2-finalize.ts:133', 'Error out as noDataFromEventDescriptionModal');
		somethingWentWrong(bot, interaction, 'noDataFromEventDescriptionModal');
	}
};

export const finalizeEventButton = {
	customId,
	execute,
};
