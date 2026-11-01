import { createHash } from 'node:crypto';

import type { GameProgressSnapshotContent } from '../../game/model/game.progress.snapshot.entity';

export function getGameProgressSnapshotHash(schemaVersion: number, content: GameProgressSnapshotContent): string {
	return createHash('sha256')
		.update(stableSerialize({ content, schemaVersion }))
		.digest('hex');
}

function stableSerialize(value: unknown): string {
	if (Array.isArray(value)) {
		return `[${value.map(stableSerialize).join(',')}]`;
	}
	if (value && typeof value === 'object') {
		const propertyList = Object.entries(value)
			.sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey));
		return `{${propertyList.map(([key, entry]) => `${JSON.stringify(key)}:${stableSerialize(entry)}`).join(',')}}`;
	}
	return JSON.stringify(value) ?? 'null';
}