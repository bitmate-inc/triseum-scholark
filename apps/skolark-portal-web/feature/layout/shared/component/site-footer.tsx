import Link from "next/link";

export function SiteFooter() {
	return (
		<footer className="site-footer">
			<Link className="footer-brand" href="/">SkolArk</Link>
			<p>Games for people who never stopped asking why.</p>
			<div>
				<Link href="/catalog">Catalog</Link>
				<Link href="/#subjects">Subjects</Link>
				<a href="mailto:support@skolark.example">Support</a>
			</div>
		</footer>
	);
}