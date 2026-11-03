"use client";

import {
	AlertCircle,
	CalendarDays,
	Gamepad2,
	RefreshCw,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import styles from "../../../../asset/style/publisher.module.css";
import {
	type PublisherRevenueInterval,
	type PublisherRevenueReportItem,
	type PublisherRevenueTimeSeriesItem,
	useGetPublisherRevenueReportQuery,
} from "../api/publisher-api";

const intervalList: PublisherRevenueInterval[] = ["day", "week", "month", "year"];
const intervalLabelByValue = {
	day: "intervalDay",
	week: "intervalWeek",
	month: "intervalMonth",
	year: "intervalYear",
} as const;

type DateRange = { from: string; to: string };

type RevenueChartSeries = {
	amountList: number[];
	bucketStartAtList: string[];
	currency: string;
};

function formatMoney(minorUnitAmount: number, currency: string, locale: string): string {
	const formatter = new Intl.NumberFormat(locale, { style: "currency", currency });
	return formatter.format(minorUnitAmount / 100);
}

function dateToString(date: Date): string {
	return date.toISOString().slice(0, 10);
}

function parseDate(date: string): Date {
	return new Date(`${date}T00:00:00.000Z`);
}

function getDefaultDateRange(): DateRange {
	const toDate = new Date();
	const fromDate = new Date(toDate);
	fromDate.setUTCDate(fromDate.getUTCDate() - 29);
	return { from: dateToString(fromDate), to: dateToString(toDate) };
}

function getBucketStart(date: Date, interval: PublisherRevenueInterval): Date {
	const bucketStart = new Date(date);
	if (interval === "week") {
		bucketStart.setUTCDate(bucketStart.getUTCDate() - ((bucketStart.getUTCDay() + 6) % 7));
	} else if (interval === "month") {
		bucketStart.setUTCDate(1);
	} else if (interval === "year") {
		bucketStart.setUTCMonth(0, 1);
	}
	return bucketStart;
}

function getBucketStartList(from: string, to: string, interval: PublisherRevenueInterval): string[] {
	const bucketStartList: string[] = [];
	const endDate = parseDate(to);
	let bucketStart = getBucketStart(parseDate(from), interval);

	while (bucketStart <= endDate) {
		bucketStartList.push(dateToString(bucketStart));
		const nextBucketStart = new Date(bucketStart);
		if (interval === "day") {
			nextBucketStart.setUTCDate(nextBucketStart.getUTCDate() + 1);
		} else if (interval === "week") {
			nextBucketStart.setUTCDate(nextBucketStart.getUTCDate() + 7);
		} else if (interval === "month") {
			nextBucketStart.setUTCMonth(nextBucketStart.getUTCMonth() + 1);
		} else {
			nextBucketStart.setUTCFullYear(nextBucketStart.getUTCFullYear() + 1);
		}
		bucketStart = nextBucketStart;
	}

	return bucketStartList;
}

function getRevenueChartSeries(
	reportList: PublisherRevenueReportItem[],
	timeSeriesList: PublisherRevenueTimeSeriesItem[],
	from: string,
	to: string,
	interval: PublisherRevenueInterval,
): RevenueChartSeries[] {
	const currencySet = new Set([
		...reportList.map(({ currency }) => currency),
		...timeSeriesList.map(({ currency }) => currency),
	]);
	const currencyList = [...currencySet].sort();
	const bucketStartAtList = getBucketStartList(from, to, interval);

	return currencyList.map((currency) => {
		const amountByBucket = new Map<string, number>();
		for (const item of timeSeriesList) {
			if (item.currency === currency) {
				amountByBucket.set(item.bucketStartAt, (amountByBucket.get(item.bucketStartAt) ?? 0) + item.paidSalesMinorUnitAmount);
			}
		}

		return {
			amountList: bucketStartAtList.map((bucketStartAt) => amountByBucket.get(bucketStartAt) ?? 0),
			bucketStartAtList,
			currency,
		};
	});
}

function getLabelIndexList(length: number): number[] {
	if (length <= 6) {
		return Array.from({ length }, (_, index) => index);
	}

	const step = Math.ceil((length - 1) / 4);
	const indexList = Array.from({ length }, (_, index) => index).filter((index) => index % step === 0);
	if (indexList[indexList.length - 1] !== length - 1) {
		indexList.push(length - 1);
	}
	return indexList;
}

function formatBucketLabel(date: string, interval: PublisherRevenueInterval, locale: string): string {
	const options: Intl.DateTimeFormatOptions = interval === "year"
		? { year: "numeric" }
		: interval === "month"
			? { month: "short", year: "2-digit" }
			: { day: "numeric", month: "short" };
	return new Intl.DateTimeFormat(locale, options).format(parseDate(date));
}

function RevenueChart({
	from,
	interval,
	locale,
	series,
	to,
	t,
}: {
	from: string;
	interval: PublisherRevenueInterval;
	locale: string;
	series: RevenueChartSeries;
	to: string;
	t: ReturnType<typeof useTranslations<"publisher">>;
}) {
	const chartWidth = 760;
	const chartHeight = 270;
	const left = 96;
	const right = 18;
	const top = 18;
	const bottom = 220;
	const maxAmount = Math.max(...series.amountList, 0);
	const scaleMax = Math.max(100, Math.ceil(maxAmount / 100) * 100);
	const x = (index: number) => left + index / Math.max(series.amountList.length - 1, 1) * (chartWidth - left - right);
	const y = (amount: number) => bottom - amount / scaleMax * (bottom - top);
	const pointList = series.bucketStartAtList.map((bucketStartAt, index) => {
		const amount = series.amountList[index] ?? 0;
		return { amount, bucketStartAt, x: x(index), y: y(amount) };
	});
	const linePath = pointList.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
	const firstPoint = pointList[0];
	const lastPoint = pointList.at(-1);
	const areaPath = firstPoint && lastPoint
		? `${linePath} L ${lastPoint.x} ${bottom} L ${firstPoint.x} ${bottom} Z`
		: "";
	const tickList = [0, scaleMax / 2, scaleMax];
	const labelIndexList = getLabelIndexList(series.bucketStartAtList.length);
	const total = series.amountList.reduce((sum, amount) => sum + amount, 0);

	return (
		<div className={styles.chartPanel}>
			<div className={styles.chartHeading}>
				<span className={styles.currencyLabel}>{series.currency}</span>
				<strong>{formatMoney(total, series.currency, locale)}</strong>
			</div>
			<div className={styles.chartScroll}>
				<svg
					aria-label={t("chartAriaLabel", { currency: series.currency, from, to })}
					className={styles.chart}
					role="img"
					viewBox={`0 0 ${chartWidth} ${chartHeight}`}
				>
					<title>{t("revenueByInterval", { interval: t(intervalLabelByValue[interval]) })}</title>
					<desc>{t("chartDescription", { currency: series.currency, from, to })}</desc>
					{tickList.map((tick) => (
						<g className={styles.chartGrid} key={tick}>
							<line x1={left} x2={chartWidth - right} y1={y(tick)} y2={y(tick)}/>
							<text textAnchor="end" x={left - 12} y={y(tick) + 4}>{formatMoney(tick, series.currency, locale)}</text>
						</g>
					))}
					<path className={styles.chartArea} d={areaPath}/>
					<path className={styles.chartLine} d={linePath}/>
					{pointList.map((point) => (
						<circle className={styles.chartPoint} cx={point.x} cy={point.y} key={point.bucketStartAt} r="3.5">
							<title>{t("chartPoint", {
								date: formatBucketLabel(point.bucketStartAt, interval, locale),
								revenue: formatMoney(point.amount, series.currency, locale),
							})}</title>
						</circle>
					))}
					<g className={styles.chartAxisLabels}>
						{labelIndexList.map((index) => {
							const bucketStartAt = series.bucketStartAtList[index];
							if (!bucketStartAt) {
								return null;
							}

							return (
								<text
									key={bucketStartAt}
									textAnchor={index === 0 ? "start" : index === series.bucketStartAtList.length - 1 ? "end" : "middle"}
									x={x(index)}
									y={chartHeight - 14}
								>
									{formatBucketLabel(bucketStartAt, interval, locale)}
								</text>
							);
						})}
					</g>
				</svg>
			</div>
		</div>
	);
}

export function PublisherDashboard() {
	const locale = useLocale();
	const t = useTranslations("publisher");
	const [dateRange, setDateRange] = useState(getDefaultDateRange);
	const [interval, setInterval] = useState<PublisherRevenueInterval>("day");
	const isDateRangeInvalid = !dateRange.from || !dateRange.to || dateRange.from > dateRange.to;
	const {
		currentData,
		error,
		isFetching,
		isLoading,
		refetch,
	} = useGetPublisherRevenueReportQuery(
		{ from: dateRange.from, interval, to: dateRange.to },
		{ skip: isDateRangeInvalid },
	);
	const reportList = currentData?.reportList ?? [];
	const timeSeriesList = currentData?.timeSeriesList ?? [];
	const totalByCurrency = new Map<string, number>();
	for (const report of reportList) {
		totalByCurrency.set(
			report.currency,
			(totalByCurrency.get(report.currency) ?? 0) + report.paidSalesMinorUnitAmount,
		);
	}
	const grossSales = totalByCurrency.size
		? [...totalByCurrency.entries()].map(([currency, amount]) => formatMoney(amount, currency, locale)).join(" · ")
		: formatMoney(0, "USD", locale);
	const paidAcquisitionCount = reportList.reduce((total, report) => total + report.paidAcquisitionCount, 0);
	const gameCount = new Set(reportList.map((report) => `${report.publisherId}:${report.gameId}`)).size;
	const chartSeriesList = isDateRangeInvalid
		? []
		: getRevenueChartSeries(reportList, timeSeriesList, dateRange.from, dateRange.to, interval);
	const dateFormatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" });
	const isCurrentLoading = isLoading || (isFetching && !currentData);
	const periodLabel = dateRange.from && dateRange.to
		? `${dateFormatter.format(parseDate(dateRange.from))} – ${dateFormatter.format(parseDate(dateRange.to))}`
		: t("chooseDateRange");

	return (
		<main className={styles.page}>
			<header className={styles.pageHeader}>
				<div>
					<p className={styles.kicker}>{t("portalLabel")}</p>
					<h1>{t("pageTitle")}</h1>
					<p className={styles.description}>{t("description")}</p>
				</div>
				<p className={styles.period}>{periodLabel}</p>
			</header>

			<section aria-label={t("filtersLabel")} className={styles.filters}>
				<div className={styles.dateFields}>
					<label>
						<span>{t("fromDate")}</span>
						<input
							max={dateRange.to || undefined}
							onChange={(event) => setDateRange((range) => ({ ...range, from: event.target.value }))}
							type="date"
							value={dateRange.from}
						/>
					</label>
					<label>
						<span>{t("toDate")}</span>
						<input
							min={dateRange.from || undefined}
							onChange={(event) => setDateRange((range) => ({ ...range, to: event.target.value }))}
							type="date"
							value={dateRange.to}
						/>
					</label>
				</div>
				<fieldset className={styles.intervalFieldset}>
					<legend>{t("intervalLabel")}</legend>
					<div className={styles.intervalControl} role="group" aria-label={t("intervalLabel")}>
						{intervalList.map((option) => (
							<button
								aria-pressed={interval === option}
								className={interval === option ? styles.intervalSelected : undefined}
								key={option}
								onClick={() => setInterval(option)}
								type="button"
							>
								{t(intervalLabelByValue[option])}
							</button>
						))}
					</div>
				</fieldset>
			</section>

			{isDateRangeInvalid ? <p className={styles.rangeError} role="alert">{t("invalidDateRange")}</p> : null}
			{!isDateRangeInvalid && error && !currentData ? (
				<div className={styles.state} role="alert">
					<AlertCircle aria-hidden="true"/>
					<h2>{t("unavailable")}</h2>
					<p>{t("loadFailed")}</p>
					<button className={styles.retryButton} onClick={() => refetch()} type="button">{t("tryAgain")}</button>
				</div>
			) : null}
			{!isDateRangeInvalid && isCurrentLoading ? <div className={styles.state}><RefreshCw className={styles.spin} aria-hidden="true"/><p>{t("loading")}</p></div> : null}
			{!isDateRangeInvalid && currentData && !error ? <>
				<section aria-label={t("summaryLabel")} className={styles.metrics}>
					<div className={styles.metric}>
						<p className={styles.metricLabel}>{t("grossSales")}</p>
						<strong className={styles.metricValue}>{grossSales}</strong>
						<span className={styles.metricNote}>{t("grossSalesNote")}</span>
					</div>
					<div className={styles.metric}>
						<p className={styles.metricLabel}>{t("paidAcquisitions")}</p>
						<strong className={styles.metricValue}>{paidAcquisitionCount.toLocaleString(locale)}</strong>
						<span className={styles.metricNote}>{t("acquisitionCountNote")}</span>
					</div>
					<div className={styles.metric}>
						<p className={styles.metricLabel}>{t("games")}</p>
						<strong className={styles.metricValue}>{gameCount.toLocaleString(locale)}</strong>
						<span className={styles.metricNote}>{t("gameCountNote", { count: gameCount })}</span>
					</div>
				</section>

				<section aria-labelledby="publisher-revenue-chart-title" className={styles.revenueSection}>
					<div className={styles.sectionHeader}>
						<div><p className={styles.kicker}>{t("reportLabel")}</p><h2 id="publisher-revenue-chart-title"><CalendarDays aria-hidden="true"/>{t("revenueOverTime")}</h2></div>
					</div>
					{gameCount > 0 ? (
						<div className={styles.chartList}>
							{chartSeriesList.map((series) => <RevenueChart
								from={dateRange.from}
								interval={interval}
								key={series.currency}
								locale={locale}
								series={series}
								to={dateRange.to}
								t={t}
							/>)}
						</div>
					) : (
						<div className={styles.emptyState}><h3>{t("emptyTitle")}</h3><p>{t("emptyDescription")}</p></div>
					)}
				</section>

				<section aria-labelledby="publisher-revenue-title" className={styles.revenueSection}>
					<div className={styles.sectionHeader}>
						<div><p className={styles.kicker}>{t("reportLabel")}</p><h2 id="publisher-revenue-title"><Gamepad2 aria-hidden="true"/>{t("revenueByGame")}</h2></div>
					</div>
					{reportList.length ? (
						<div className={styles.tableWrap}>
							<table className={styles.table}>
								<thead>
									<tr>
										<th scope="col">{t("publisher")}</th>
										<th scope="col">{t("game")}</th>
										<th scope="col">{t("paidAcquisitions")}</th>
										<th scope="col">{t("grossSales")}</th>
									</tr>
								</thead>
								<tbody>
									{reportList.map((report) => (
										<tr key={`${report.publisherId}:${report.gameId}:${report.currency}`}>
											<td>{report.publisherName}</td>
											<th scope="row">{report.gameTitle}</th>
											<td>{report.paidAcquisitionCount.toLocaleString(locale)}</td>
											<td>{formatMoney(report.paidSalesMinorUnitAmount, report.currency, locale)}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<div className={styles.emptyState}>
							<h3>{t("emptyTitle")}</h3>
							<p>{t("emptyDescription")}</p>
						</div>
					)}
				</section>
			</> : null}
		</main>
	);
}