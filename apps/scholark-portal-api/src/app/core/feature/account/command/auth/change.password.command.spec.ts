import { BCryptPasswordEncoder } from '../../../../../../lib/security/encoder/bcrypt.password-encoder';
import { Validator } from '../../../../infrastructure/validation/validator/validator';
import { UserEntityRepository } from '../../../user/repository/user.entity.repository';
import { AccountIdentityRepository } from '../../repository/account.identity.repository';
import { ChangePasswordCommand, ChangePasswordCommandData } from './change.password.command';

describe(ChangePasswordCommand.name, () => {
	it('validates command data before accessing repositories', async () => {
		const userRepository = {
			findOneBy: jest.fn(),
		} as unknown as UserEntityRepository;
		const command = new ChangePasswordCommand(
			new Validator(),
			userRepository,
			{} as AccountIdentityRepository,
			{} as BCryptPasswordEncoder,
		);

		const result = await command.execute(
			'not-a-user-id',
			ChangePasswordCommandData.create({
				currentPassword: '',
				plainPassword: 'short',
			}),
		);

		expect(result.validationResult?.errorList).toBeDefined();
		expect(userRepository.findOneBy).not.toHaveBeenCalled();
	});
});
