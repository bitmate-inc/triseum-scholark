import { createHash } from 'node:crypto';

export function normalizeAcquisitionCode(code: string): string {
	return code.trim().toUpperCase().replace(/[\s-]/g, '');
}

export function digestAcquisitionCode(code: string): string {
	return createHash('sha256').update(normalizeAcquisitionCode(code)).digest('hex');
}

export function getAcquisitionCodeSuffix(code: string): string {
	return normalizeAcquisitionCode(code).slice(-4);
}
