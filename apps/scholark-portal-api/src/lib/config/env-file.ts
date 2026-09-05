export function getEnvFilePath(environment = process.env.NODE_ENV): string[] {
	return [
		...(environment
			? [`.env.${environment}.local`, `.env.${environment}`]
			: []),
		'.env.local',
		'.env',
	];
}