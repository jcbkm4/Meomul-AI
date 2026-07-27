import Link from "next/link";
import { Instagram, Linkedin, Twitter } from "lucide-react";
import { AppLogo } from "@/components/brand/app-logo";
import { useI18n } from "@/lib/i18n/provider";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

interface FooterColumnProps {
  title: string;
  links: { label: string; href: string }[];
}

function FooterColumn({ title, links }: FooterColumnProps) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-white uppercase tracking-wider">{title}</h3>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            {link.href.startsWith("#") ? (
              <a
                href={link.href}
                className="text-sm text-slate-400 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ) : (
              <Link
                href={link.href}
                className="text-sm text-slate-400 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const { t } = useI18n();

  const EXPLORE_LINKS = [
    { label: t("footer_browse_hotels"), href: "/hotels" },
    { label: t("footer_last_minute_deals"), href: "/hotels" },
    { label: t("footer_editorial_guides"), href: "/" },
    { label: t("footer_memberships"), href: "/" },
  ];

  const ACCOUNT_LINKS = [
    { label: t("footer_sign_in"), href: "/auth/login" },
    { label: t("footer_create_account"), href: "/auth/signup" },
    { label: t("footer_become_host"), href: "/become-a-host" },
    { label: t("footer_my_bookings"), href: "/bookings" },
    { label: t("footer_profile_settings"), href: "/profile" },
  ];

  const COMPANY_LINKS = [
    { label: t("footer_about_meomul"), href: "/about" },
    { label: t("footer_contact_support"), href: "/support" },
    { label: t("footer_privacy_policy"), href: "#" },
    { label: t("footer_terms_of_service"), href: "#" },
  ];

  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="w-full px-3 py-14 sm:px-6 sm:py-16">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-4">
          {/* Brand column — spans full width on mobile */}
          <div className="col-span-2 lg:col-span-1">
            <AppLogo href="/" inverted />
            <p className="mt-3 text-sm text-slate-400 leading-relaxed max-w-xs">
              {t("footer_brand_copy")}
            </p>
            <div className="mt-5">
              <LanguageSwitcher />
            </div>
            <div className="mt-6 flex gap-4">
              <a
                href="#"
                aria-label="Twitter"
                className="text-slate-500 hover:text-teal-400 transition-colors"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://www.instagram.com/4komil"
                aria-label="Instagram"
                className="text-slate-500 hover:text-teal-400 transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://id.linkedin.com/in/4komil"
                aria-label="LinkedIn"
                className="text-slate-500 hover:text-teal-400 transition-colors"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          <FooterColumn title={t("footer_explore")} links={EXPLORE_LINKS} />
          <FooterColumn title={t("footer_account")} links={ACCOUNT_LINKS} />
          <FooterColumn title={t("footer_company")} links={COMPANY_LINKS} />
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © 2026 Meomul. {t("footer_all_rights")}
          </p>
          <div className="flex gap-4 text-xs text-slate-500">
            <a href="#" className="hover:text-slate-300 transition-colors">
              {t("footer_privacy_short")}
            </a>
            <a href="#" className="hover:text-slate-300 transition-colors">
              {t("footer_terms_short")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
