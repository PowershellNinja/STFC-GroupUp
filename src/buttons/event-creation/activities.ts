// Activity should either have maxMembers or options specified, NOT both
export type Activity = {
	name: string;
	maxMembers?: number;
	options?: Array<Activity>;
};

// Max depth is limited to 4, 5th component row must be reserved for the custom button
export const Activities: Array<Activity> = [
	{
		name: 'STFC',
		options: [
			{
				name: 'Group Armada',
				options: [
					{
						name: 'Faction Armada - Uncommon',
						maxMembers: 6,
					},
					{
						name: 'Faction Armada - Rare',
						maxMembers: 6,
					},
					{
						name: 'Faction Armada - Epic',
						maxMembers: 6,
					},
					{
						name: 'Borg Expansion Cube',
						maxMembers: 6,
					},
					{
						name: 'Swarm Armada',
						maxMembers: 6,
					},
				],
			},
			{
				name: 'Formation Armada',
				options: [
					{
						name: 'Formation Armada - Uncommon',
						maxMembers: 12,
					},
					{
						name: 'Formation Armada - Rare',
						maxMembers: 12,
					},
				],
			},
			{
				name: 'Territory Takeover',
				options: [
					{
						name: 'Territory Takeover - Attack',
						maxMembers: 999,
					},
					{
						name: 'Territory Takeover - Defense',
						maxMembers: 999,
					},
				],
			},
			{
				name: 'Infinite Incursion',
				options: [
					{
						name: 'Infinite Incursion - I moved my base out of territory and shielded',
						maxMembers: 999,
					},
				],
			},
		],
	},
];
