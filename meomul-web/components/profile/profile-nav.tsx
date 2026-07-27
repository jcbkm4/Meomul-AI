import { useRouter } from "next/router";
import { useMemo } from "react";
import { getSessionMember } from "@/lib/auth/session";
import { useI18n } from "@/lib/i18n/provider";
import { getProfileCopy } from "@/lib/profile/profile-i18n";

const TABS = [
  { id: "profile", labelKey: "overview", access: "all" },
  { id: "reviews", labelKey: "reviews", access: "user+agent" },
  { id: "likes", labelKey: "savedHotels", access: "user+agent" },
  { id: "bookings", labelKey: "bookings", access: "user+agent" },
  { id: "subscription", labelKey: "subscription", access: "user" },
] as const;

export function ProfileNav() {
  const { locale } = useI18n();
  const copy = getProfileCopy(locale);
  const router = useRouter();
  const member = useMemo(() => getSessionMember(), []);
  const activeTab = (router.query.tab as string) ?? "profile";
  const memberType = member?.memberType ?? "";
  const tabs = TABS.filter((t) => {
    if (t.access === "all") return true;
    if (t.access === "user") return memberType === "USER";
    if (t.access === "user+agent") return memberType === "USER" || memberType === "AGENT";
    return false;
  });

  const goTo = (id: string) => {
    void router.push(
      { pathname: "/profile", query: id === "profile" ? {} : { tab: id } },
      undefined,
      { shallow: true },
    );
  };

  return (
    <nav
      aria-label={copy.profile}
      className="flex gap-0.5 overflow-x-auto border-b border-slate-200"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => goTo(tab.id)}
            className={`-mb-px flex-shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition ${
              isActive
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            {copy[tab.labelKey]}
          </button>
        );
      })}
    </nav>
  );
}
