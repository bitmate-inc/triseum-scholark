export function listingWindowsOverlap(
	firstStartAt: Date,
	firstEndAt: Date | undefined,
	secondStartAt: Date,
	secondEndAt: Date | undefined,
): boolean {
	return (firstEndAt == null || secondStartAt < firstEndAt)
		&& (secondEndAt == null || firstStartAt < secondEndAt);
}
