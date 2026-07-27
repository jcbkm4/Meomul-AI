import Link from "next/link";
import { Check, Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { getSessionMember } from "@/lib/auth/session";
import { useI18n } from "@/lib/i18n/provider";

// ─── Tier definitions ──────────────────────────────────────────────────────────

interface Tier {
  id: string;
  labelKey:
    | "home_tier_free_label"
    | "home_tier_basic_label"
    | "home_tier_premium_label"
    | "home_tier_elite_label";
  price: string;
  periodKey: "home_tier_period_forever" | "home_tier_period_month";
  popular: boolean;
  featureKeys: Array<
    | "home_tier_feature_browse_hotels"
    | "home_tier_feature_make_bookings"
    | "home_tier_feature_basic_filters"
    | "home_tier_feature_chat_hotels"
    | "home_tier_feature_everything_free"
    | "home_tier_feature_price_drop_alerts"
    | "home_tier_feature_search_history"
    | "home_tier_feature_priority_support"
    | "home_tier_feature_everything_basic"
    | "home_tier_feature_personalized_recommendations"
    | "home_tier_feature_early_deals"
    | "home_tier_feature_price_lock"
    | "home_tier_feature_advanced_room_filters"
    | "home_tier_feature_everything_premium"
    | "home_tier_feature_concierge"
    | "home_tier_feature_exclusive_rates"
    | "home_tier_feature_highest_priority"
    | "home_tier_feature_cancellation_flexibility"
  >;
}

const TIERS: Tier[] = [
  {
    id: "FREE",
    labelKey: "home_tier_free_label",
    price: "₩0",
    periodKey: "home_tier_period_forever",
    popular: false,
    featureKeys: [
      "home_tier_feature_browse_hotels",
      "home_tier_feature_make_bookings",
      "home_tier_feature_basic_filters",
      "home_tier_feature_chat_hotels",
    ],
  },
  {
    id: "BASIC",
    labelKey: "home_tier_basic_label",
    price: "₩9,900",
    periodKey: "home_tier_period_month",
    popular: false,
    featureKeys: [
      "home_tier_feature_everything_free",
      "home_tier_feature_price_drop_alerts",
      "home_tier_feature_search_history",
      "home_tier_feature_priority_support",
    ],
  },
  {
    id: "PREMIUM",
    labelKey: "home_tier_premium_label",
    price: "₩19,900",
    periodKey: "home_tier_period_month",
    popular: true,
    featureKeys: [
      "home_tier_feature_everything_basic",
      "home_tier_feature_personalized_recommendations",
      "home_tier_feature_early_deals",
      "home_tier_feature_price_lock",
      "home_tier_feature_advanced_room_filters",
    ],
  },
  {
    id: "ELITE",
    labelKey: "home_tier_elite_label",
    price: "₩39,900",
    periodKey: "home_tier_period_month",
    popular: false,
    featureKeys: [
      "home_tier_feature_everything_premium",
      "home_tier_feature_concierge",
      "home_tier_feature_exclusive_rates",
      "home_tier_feature_highest_priority",
      "home_tier_feature_cancellation_flexibility",
    ],
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export function SubscriptionPlansSection() {
  const { t } = useI18n();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(getSessionMember()));
  }, []);

  const ctaHref = isLoggedIn ? "/profile?tab=subscription" : "/auth/signup";
  const ctaLabel = isLoggedIn
    ? t("home_subscriptions_view_plans")
    : t("home_subscriptions_get_started");

  return (
    <section className="border-t border-slate-100 py-16">
      {/* Header */}
      <div className="mb-10 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500">
          <Crown size={11} />
          {t("home_subscriptions_badge")}
        </span>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
          {t("home_subscriptions_title")}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
          {t("home_subscriptions_desc")}
        </p>
      </div>

      {/* Tier grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {TIERS.map((tier) => (
          <div
            key={tier.id}
            className={`relative flex flex-col rounded-2xl p-3 sm:p-6 ${
              tier.popular
                ? "border-2 border-slate-900 bg-white shadow-sm"
                : "border border-slate-100 bg-white"
            }`}
          >
            {tier.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-3 py-0.5 text-[11px] font-semibold text-white">
                {t("home_subscriptions_popular")}
              </span>
            )}

            <Crown
              size={15}
              className={tier.popular ? "text-slate-900" : "text-slate-300"}
            />

            <p className="mt-2 text-sm font-bold text-slate-900 sm:mt-3 sm:text-base">
              {t(tier.labelKey)}
            </p>

            <p className="mt-1 flex items-baseline gap-1">
              <span className="text-xl font-bold text-slate-900 sm:text-2xl">{tier.price}</span>
              <span className="text-[11px] text-slate-400 sm:text-xs">{t(tier.periodKey)}</span>
            </p>

            <ul className="mt-4 flex-1 space-y-1.5 sm:mt-5 sm:space-y-2">
              {tier.featureKeys.map((featureKey) => (
                <li key={featureKey} className="flex items-start gap-1.5 text-xs leading-5 text-slate-600 sm:gap-2 sm:text-sm">
                  <Check size={12} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                  {t(featureKey)}
                </li>
              ))}
            </ul>

            <Link
              href={ctaHref}
              className={`mt-4 block rounded-lg px-3 py-2 text-center text-xs font-medium transition sm:mt-6 sm:px-4 sm:text-sm ${
                tier.popular
                  ? "bg-slate-900 text-white hover:bg-slate-700"
                  : "border border-slate-200 text-slate-700 hover:border-slate-400"
              }`}
            >
              {ctaLabel}
            </Link>
          </div>
        ))}
      </div>

      {/* Footnote */}
      <p className="mt-6 text-center text-xs text-slate-400">
        {t("home_subscriptions_footnote")}
      </p>
    </section>
  );
}
