import { DatabaseSeeder } from './database.seeder';
import {
	type CatalogSeedData,
	triseumCatalogSeedData,
	triseumCatalogUserSeedList,
	triseumClassroomSeedData,
	triseumClassroomUserSeedList,
} from './triseum.data';
import { UserSeeder } from './user.seeder';

class TriseumCatalogUserSeeder extends UserSeeder {

	protected override get userSeedList() {
		return triseumCatalogUserSeedList;
	}

}

class TriseumClassroomUserSeeder extends UserSeeder {

	protected override get userSeedList() {
		return triseumClassroomUserSeedList;
	}

}

export class TriseumCatalogSeeder extends DatabaseSeeder {

	protected override get catalogSeedData(): CatalogSeedData {
		return triseumCatalogSeedData;
	}

	protected override get userSeederClass(): typeof UserSeeder {
		return TriseumCatalogUserSeeder;
	}

	protected override get shouldLinkInstructorUser(): boolean {
		return false;
	}

}

export class TriseumClassroomSeeder extends DatabaseSeeder {

	protected override get catalogSeedData(): CatalogSeedData {
		return triseumClassroomSeedData;
	}

	protected override get userSeederClass(): typeof UserSeeder {
		return TriseumClassroomUserSeeder;
	}

}