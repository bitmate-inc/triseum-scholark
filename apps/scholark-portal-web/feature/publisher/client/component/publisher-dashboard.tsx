"use client";

import {
	AlertCircle,
	Gamepad2,
	RefreshCw,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import styles from "../../../../asset/style/publisher.module.css";
import { useGetPublisherRevenueReportQuery } from "../api/publisher-api";

function formatMoney(minorUnitAmount: number, currency: string, locale: string): string {
	const formatter = new Intl.NumberFormat(locale, { style: "currency", currency });
	return formatter.format(minorUnitAmount / 100);
}

export function PublisherDashboard() {
	const locale = useLocale();
	const t = useTranslations("publisher");
	const { data, error, isLoading, refetch } = useGetPublisherRevenueReportQuery();

	if (isLoading) {
		return <main className={styles.page}><div className={styles.state}><RefreshCw className={styles.spin} aria-hidden="true"/><p>{t("loading")}</p></div></main>;
	}

	if (error) {
		return (
			<main className={styles.page}>
				<div className={styles.state} role="alert">
					<AlertCircle aria-hidden="true"/>
					<h1>{t("unavailable")}</h1>
					<p>{t("loadFailed")}</p>
					<button className={styles.retryButton} onClick={() => refetch()} type="button">{t("tryAgain")}</button>
				</div>
			</main>
		);
	}

	const reportList = data?.reportList ?? [];
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

	return (
		<main className={styles.page}>
			<header className={styles.pageHeader}>
				<div>
					<p className={styles.kicker}>{t("portalLabel")}</p>
					<h1>{t("pageTitle")}</h1>
					<p className={styles.description}>{t("description")}</p>
				</div>
				<p className={styles.period}>{t("allTime")}</p>
			</header>

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
		</main>
	);
}