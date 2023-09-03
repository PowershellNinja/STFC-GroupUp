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
						name: 'Uncommon',
						maxMembers: 6,
					},
					{
						name: 'Rare',
						maxMembers: 6,
					},
					{
						name: 'Epic',
						maxMembers: 6,
					},
				],
			},
			{
				name: 'Formation Armada',
				options: [
					{
						name: 'Uncommon',
						maxMembers: 12,
					},
					{
						name: 'Rare',
						maxMembers: 12,
					},
				],
			},
			{
				name: 'Territory Takeover',
				options: [
					{
						name: 'Attack',
						maxMembers: 999,
					},
					{
						name: 'Defense',
						maxMembers: 999,
					},
				],
			},
			{
				name: 'Infinite Incursion',
				options: [
					{
						name: 'I moved my base out of territory and shielded',
						maxMembers: 999,
					},
				],
			},
		],
	},
];
