export interface EntityUnitOfWorkInterface {
	transactional<Result>(work: () => Promise<Result>): Promise<Result>;
}