import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';

import { AccountIdentity, AccountIdentityProvider } from '../app/core/feature/account/model/account.identity.entity';
import { User } from '../app/core/feature/user/model/user.entity';
import { BCryptPasswordEncoder } from '../lib/security/encoder/bcrypt.password-encoder';
import { userSeedList } from './user.data';

export class UserSeeder extends Seeder {

	async run(em: EntityManager): Promise<void> {
		await em.transactional(async (transactionalEm) => {
			const passwordEncoder = new BCryptPasswordEncoder();

			for (const userSeed of userSeedList) {
				const email = userSeed.email.trim().toLowerCase();
				let user = await transactionalEm.findOne(User, { email });

				if (user) {
					transactionalEm.assign(user, {
						firstName: userSeed.firstName,
						lastName: userSeed.lastName,
						status: userSeed.status,
					});
				} else {
					user = transactionalEm.create(User, {
						email,
						firstName: userSeed.firstName,
						lastName: userSeed.lastName,
						status: userSeed.status,
					});
				}

				const passwordHash = await passwordEncoder.encode(userSeed.plainPassword);
				const identity = await transactionalEm.findOne(AccountIdentity, {
					provider: AccountIdentityProvider.LOCAL,
					providerAccountId: email,
				});

				if (identity) {
					transactionalEm.assign(identity, { passwordHash, user });
				} else {
					transactionalEm.persist(
						AccountIdentity.createLocal(user, email, passwordHash),
					);
				}
			}

			await transactionalEm.flush();
		});
	}

}
