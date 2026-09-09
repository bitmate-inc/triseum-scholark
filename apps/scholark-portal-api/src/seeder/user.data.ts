import { UserStatus } from '../app/core/feature/user/model/user.entity';

export type UserSeed = {
	email: string;
	firstName: string;
	lastName: string;
	plainPassword: string;
	status: UserStatus;
};

export const userSeedList: UserSeed[] = [
	{
		email: 'user1@scholark.com',
		firstName: 'Test',
		lastName: 'User',
		plainPassword: 'password',
		status: UserStatus.ACTIVE,
	},
	{
		email: 'student2@scholark.com',
		firstName: 'Avery',
		lastName: 'Morgan',
		plainPassword: 'password',
		status: UserStatus.ACTIVE,
	},
];
