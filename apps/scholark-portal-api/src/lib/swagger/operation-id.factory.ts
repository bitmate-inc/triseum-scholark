import type { OperationIdFactory } from '@nestjs/swagger';

export function createOperationIdFactory(
	includeVersion = false,
): OperationIdFactory {
	return (controllerKey, methodKey, version) => {
		const controllerName = controllerKey
			.replace(/controller/i, '')
			.replace(/^./, (firstCharacter) => firstCharacter.toLowerCase());
		const operationId = `${controllerName}_${methodKey}`;

		return version && includeVersion ? `${version}_${operationId}` : operationId;
	};
}