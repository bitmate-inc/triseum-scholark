import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';

@Injectable()
export class BCryptPasswordEncoder {

	private readonly saltRounds = 12;

	encode(plainPassword: string): Promise<string> {
		return hash(plainPassword, this.saltRounds);
	}

	async isEqual(passwordHash: string, plainPassword: string): Promise<boolean> {
		try {
			return await compare(plainPassword, passwordHash);
		} catch {
			return false;
		}
	}

}
