import { withBasePath } from "../app/basePath";

import { Mail, MapPin } from "lucide-react";

import { BrandLogo } from "./BrandLogo";

type FooterLink = {
  href: string;
  label: string;
};

const legalLinks: FooterLink[] = [
  { href: withBasePath("/terms"), label: "Terms" },
  { href: withBasePath("/privacy"), label: "Privacy" },
  { href: withBasePath("/refunds"), label: "Refunds" },
  { href: withBasePath("/support"), label: "Support" },
];

const paymentMethods = ["Visa", "Mastercard", "AmEx", "PayPal", "Apple Pay", "Google Pay"];

export function ComplianceFooter({
  contactEmail = "support@example.com",
  studioLocation = "Israel",
}: {
  contactEmail?: string;
  studioLocation?: string;
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--panel-border)] bg-[#11151c]/95 px-5 py-8 text-sm text-[var(--text-secondary)]">
      <div className="mx-auto grid w-full max-w-6xl gap-8 md:grid-cols-[1.2fr_0.8fr_1fr]">
        <section aria-label="Studio" className="space-y-3">
          <BrandLogo className="text-xl" strokeWidth={0.8} />
          <p className="max-w-md leading-6 text-[var(--text-muted)]">
            Independent software studio building durable digital games and tools.
          </p>
          <p className="max-w-md leading-6 text-[var(--text-muted)]">
            Our order process is conducted by our online reseller Paddle.com. Paddle.com is the
            Merchant of Record for all our orders. Paddle provides all customer service inquiries
            and handles returns.
          </p>
        </section>

        <nav aria-label="Legal" className="space-y-3">
          <h2 className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-primary)]">
            Legal
          </h2>
          <ul className="grid gap-2">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <a
                  className="inline-flex text-[var(--text-secondary)] underline-offset-4 hover:text-[var(--accent)] hover:underline"
                  href={link.href}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <section aria-label="Contact and payments" className="space-y-5">
          <div className="space-y-3">
            <h2 className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-primary)]">
              Contact
            </h2>
            <a
              className="inline-flex items-center gap-2 text-[var(--text-secondary)] underline-offset-4 hover:text-[var(--accent)] hover:underline"
              href={`mailto:${contactEmail}`}
            >
              <Mail aria-hidden="true" className="h-4 w-4" />
              {contactEmail}
            </a>
            <p className="flex items-center gap-2 text-[var(--text-muted)]">
              <MapPin aria-hidden="true" className="h-4 w-4" />
              Operated from {studioLocation}
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-primary)]">
              Accepted Payments
            </h2>
            <ul className="flex flex-wrap gap-2" aria-label="Accepted payment methods">
              {paymentMethods.map((method) => (
                <li
                  className="rounded border border-[var(--panel-border)] bg-[var(--panel-bg-soft)] px-2.5 py-1 font-medium text-[var(--text-primary)]"
                  key={method}
                >
                  {method}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <div className="mx-auto mt-8 flex w-full max-w-6xl flex-col gap-2 border-t border-[var(--panel-border)] pt-5 text-xs text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} [Studio Name]. All rights reserved.</p>
        <p>Digital goods and software licenses are delivered electronically.</p>
      </div>
    </footer>
  );
}
