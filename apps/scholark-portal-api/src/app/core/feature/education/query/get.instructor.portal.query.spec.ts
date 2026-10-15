import { EntityManager } from '@mikro-orm/postgresql';

import { GameLicense } from '../../game/model/game.license.entity';
import { Classroom } from '../model/classroom.entity';
import { ClassroomGameListing } from '../model/classroom.game.listing.entity';
import { InstructorUser } from '../model/instructor.user.entity';
import { GetInstructorClassroomQuery } from './get.instructor.portal.query';

describe('GetInstructorClassroomQuery', () => {
	const find = jest.fn();
	const findOne = jest.fn();
	const entityManager = { find, findOne } as unknown as EntityManager;
	const query = new GetInstructorClassroomQuery(entityManager);

	beforeEach(() => {
		find.mockReset();
		findOne.mockReset();
	});

	it('restricts classrooms to assigned instructors and rosters to classroom listings', async () => {
		const instructorUser = { instructor: { id: 'instructor-1' } };
		const classroom = { id: 'classroom-1' };
		const listingList = [{ id: 'listing-1' }];
		const licenseList = [{ id: 'license-1' }];
		findOne
			.mockResolvedValueOnce(instructorUser)
			.mockResolvedValueOnce(classroom);
		find
			.mockResolvedValueOnce(listingList)
			.mockResolvedValueOnce(licenseList);

		const result = await query.execute('user-1', 'classroom-1');

		expect(findOne).toHaveBeenNthCalledWith(
			1,
			InstructorUser,
			{ user: 'user-1' },
			{ populate: ['instructor'] },
		);
		expect(findOne).toHaveBeenNthCalledWith(
			2,
			Classroom,
			{ id: 'classroom-1', instructorList: 'instructor-1' },
			{ populate: ['institution'] },
		);
		expect(find).toHaveBeenNthCalledWith(
			1,
			ClassroomGameListing,
			{ classroom: 'classroom-1' },
			expect.objectContaining({ populate: ['gameVersion.game.publisher'] }),
		);
		expect(find).toHaveBeenNthCalledWith(
			2,
			GameLicense,
			{ classroomGameListing: { id: { $in: ['listing-1'] } } },
			expect.objectContaining({ populate: ['user', 'classroomGameListing'] }),
		);
		expect(result).toEqual({
			classroom,
			classroomGameListingList: listingList,
			gameLicenseList: licenseList,
		});
	});

	it('does not query student licenses when the classroom has no game listings', async () => {
		findOne
			.mockResolvedValueOnce({ instructor: { id: 'instructor-1' } })
			.mockResolvedValueOnce({ id: 'classroom-1' });
		find.mockResolvedValueOnce([]);

		const result = await query.execute('user-1', 'classroom-1');

		expect(find).toHaveBeenCalledTimes(1);
		expect(result?.gameLicenseList).toEqual([]);
	});

	it('returns no classroom data when the instructor is not assigned', async () => {
		findOne
			.mockResolvedValueOnce({ instructor: { id: 'instructor-1' } })
			.mockResolvedValueOnce(null);

		const result = await query.execute('user-1', 'other-classroom');

		expect(result).toBeUndefined();
		expect(find).not.toHaveBeenCalled();
	});
});