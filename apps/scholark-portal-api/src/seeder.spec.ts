import {
	describe,
	expect,
	it,
} from '@jest/globals';

import {
	triseumCatalogSeedData,
	triseumCatalogUserSeedList,
	triseumClassroomSeedData,
	triseumClassroomUserSeedList,
} from './seeder/triseum.data';

describe('Triseum seed profiles', () => {
	it('seeds only the admin and three ARTé games with their versions', () => {
		expect(triseumCatalogUserSeedList.map(({ email }) => email)).toEqual(['user1@scholark.com']);
		expect(triseumCatalogSeedData.gameSeedList.map(({ slug }) => slug)).toEqual([
			'arte-mecenas',
			'arte-lumiere',
			'arte-hemut',
		]);
		expect(triseumCatalogSeedData.publisherMemberSeedList).toEqual([
			{ email: 'user1@scholark.com', publisherSlug: 'triseum' },
		]);
		expect(triseumCatalogSeedData.gameVersionSeedList).toHaveLength(6);
		expect(triseumCatalogSeedData.publicListingSeedList).toHaveLength(0);
		expect(triseumCatalogSeedData.userGameLicenseSeedList).toHaveLength(0);
	});

	it('seeds one classroom, assigned game, and user1 acquisition with admin and teacher accounts', () => {
		expect(triseumClassroomUserSeedList.map(({ email }) => email)).toEqual([
			'user1@scholark.com',
			'user2@scholark.com',
		]);
		expect(triseumClassroomSeedData.institutionSeedList).toHaveLength(1);
		expect(triseumClassroomSeedData.courseSeedList).toHaveLength(1);
		expect(triseumClassroomSeedData.classroomSeedList).toHaveLength(1);
		expect(triseumClassroomSeedData.classroomGameListingSeedList).toHaveLength(1);
		expect(triseumClassroomSeedData.userGameLicenseSeedList).toHaveLength(1);
		expect(triseumClassroomSeedData.userGameLicenseSeedList[0].email).toBe('user1@scholark.com');
		expect(triseumClassroomSeedData.userGameLicenseSeedList[0].classroomGameListingSeedId)
			.toBe(triseumClassroomSeedData.classroomGameListingSeedList[0].id);
		expect(triseumClassroomSeedData.publisherMemberSeedList).toEqual([
			{ email: 'user1@scholark.com', publisherSlug: 'triseum' },
		]);
	});
});