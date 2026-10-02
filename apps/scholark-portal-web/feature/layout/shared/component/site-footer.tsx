import { useTranslations } from "next-intl";

import { Link } from "../../../../i18n/navigation";

export function SiteFooter() {
	const t = useTranslations("footer");

	return (
		<footer className="site-footer">
			<Link className="footer-brand" href="/">ScholArk</Link>
			<p>{t("tagline")}</p>
			<div>
				<Link href="/catalog">{t("catalog")}</Link>
				<Link href="/#subjects">{t("subjects")}</Link>
				<a href="mailto:support@scholark.example">{t("support")}</a>
			</div>
		</footer>
	);
}