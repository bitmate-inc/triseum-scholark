import { BCryptPasswordEncoder } from '../../../../../../lib/security/encoder/bcrypt.password-encoder';
import { Validator } from '../../../../infrastructure/validation/validator/validator';
import { UserRepository } from '../../../user/repository/user.repository';
import { AccountIdentityService } from '../../service/account.identity.service';
import { ChangePasswordCommand, ChangePasswordCommandData } from './change.password.command';

describe(ChangePasswordCommand.name, () => {
	it('validates command data before accessing repositories', async () => {
		const userRepository = {
			findById: jest.fn(),
		} as unknown as UserRepository;
		const command = new ChangePasswordCommand(
			new Validator(),
			userRepository,
			{} as AccountIdentityService,
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
		expect(userRepository.findById).not.toHaveBeenCalled();
	});
});
