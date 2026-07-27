import { useMutation, useQuery } from "@apollo/client/react";
import { useMemo } from "react";
import { ErrorNotice } from "@/components/ui/error-notice";
import {
  CANCEL_SUBSCRIPTION_MUTATION,
  GET_SUBSCRIPTION_STATUS_QUERY,
  REQUEST_SUBSCRIPTION_MUTATION,
} from "@/graphql/member.gql";
import { getSessionMember } from "@/lib/auth/session";
import { useI18n } from "@/lib/i18n/provider";
import { confirmDanger, errorAlert, successAlert } from "@/lib/ui/alerts";
import { getErrorMessage } from "@/lib/utils/error";
import { Check } from "lucide-react";

interface SubscriptionStatusDto {
  tier: string;
  active: boolean;
  expiresAt?: string | null;
  daysRemaining?: number | null;
  pendingRequestedTier?: string | null;
}

interface GetSubscriptionStatusData {
  getSubscriptionStatus: SubscriptionStatusDto;
}

interface SubscriptionCopy {
  freeLabel: string;
  forever: string;
  currentPlan: string;
  noExpiry: string;
  daysRemaining: string;
  cancelPlan: string;
  cancelling: string;
  current: string;
  pending: string;
  awaitingApproval: string;
  downgradeToFree: string;
  requestTier: string;
  reviewedNotice: string;
  requestSubmitted: string;
  cancelConfirmTitle: string;
  cancelConfirmText: string;
  cancelConfirmButton: string;
  cancelled: string;
  pendingExists: string;
  everythingIn: string;
  features: {
    browse: string;
    bookings: string;
    filters: string;
    hotelChat: string;
    alerts: string;
    history: string;
    prioritySupport: string;
    recommendations: string;
    deals: string;
    priceLock: string;
    roomFilters: string;
    concierge: string;
    exclusiveRates: string;
    topPriority: string;
    flexibility: string;
  };
}

const getSubscriptionCopy = (locale: string): SubscriptionCopy => {
  if (locale === "ko") {
    return {
      freeLabel: "무료",
      forever: "계속",
      currentPlan: "현재 플랜",
      noExpiry: "만료 없음",
      daysRemaining: "{{count}}일 남음",
      cancelPlan: "플랜 취소",
      cancelling: "취소 중...",
      current: "현재 이용 중",
      pending: "검토 중",
      awaitingApproval: "승인 대기 중...",
      downgradeToFree: "무료로 변경",
      requestTier: "{{tier}} 요청",
      reviewedNotice: "구독 요청은 수동으로 검토됩니다. 승인되면 알림을 받게 됩니다.",
      requestSubmitted: "구독 요청이 접수되었습니다. 관리자가 곧 검토합니다.",
      cancelConfirmTitle: "구독을 취소할까요?",
      cancelConfirmText: "현재 플랜 혜택은 구독 만료 시 종료됩니다.",
      cancelConfirmButton: "예, 취소",
      cancelled: "구독이 취소되었습니다.",
      pendingExists: "이미 검토 중인 요청이 있습니다. 관리자 검토를 기다려 주세요.",
      everythingIn: "{{tier}}의 모든 혜택",
      features: {
        browse: "모든 호텔 둘러보기",
        bookings: "예약 가능",
        filters: "기본 검색 필터",
        hotelChat: "호텔 채팅",
        alerts: "가격 하락 알림",
        history: "확장 검색 기록",
        prioritySupport: "우선 채팅 지원",
        recommendations: "개인화 추천",
        deals: "딜 조기 접근",
        priceLock: "가격 잠금 (30분)",
        roomFilters: "고급 객실 필터",
        concierge: "24시간 컨시어지 지원",
        exclusiveRates: "회원 전용 요금",
        topPriority: "최상위 추천 우선순위",
        flexibility: "특별 취소 유연성",
      },
    };
  }

  if (locale === "ru") {
    return {
      freeLabel: "Бесплатно",
      forever: "навсегда",
      currentPlan: "Текущий план",
      noExpiry: "Без срока окончания",
      daysRemaining: "Осталось {{count}} дн.",
      cancelPlan: "Отменить план",
      cancelling: "Отмена...",
      current: "Текущий",
      pending: "На рассмотрении",
      awaitingApproval: "Ожидает одобрения...",
      downgradeToFree: "Перейти на Free",
      requestTier: "Запросить {{tier}}",
      reviewedNotice:
        "Запросы на подписку проверяются вручную. После одобрения вы получите уведомление.",
      requestSubmitted:
        "Запрос на подписку отправлен. Администратор скоро его рассмотрит.",
      cancelConfirmTitle: "Отменить подписку?",
      cancelConfirmText:
        "Преимущества текущего плана закончатся после окончания подписки.",
      cancelConfirmButton: "Да, отменить",
      cancelled: "Подписка отменена.",
      pendingExists:
        "У вас уже есть запрос на рассмотрении. Дождитесь решения администратора.",
      everythingIn: "Все из {{tier}}",
      features: {
        browse: "Просмотр всех отелей",
        bookings: "Бронирование",
        filters: "Базовые фильтры поиска",
        hotelChat: "Чат с отелями",
        alerts: "Уведомления о снижении цены",
        history: "Расширенная история поиска",
        prioritySupport: "Приоритетная поддержка в чате",
        recommendations: "Персональные рекомендации",
        deals: "Ранний доступ к акциям",
        priceLock: "Фиксация цены (30 мин.)",
        roomFilters: "Расширенные фильтры номеров",
        concierge: "Консьерж 24/7",
        exclusiveRates: "Эксклюзивные тарифы для участников",
        topPriority: "Наивысший приоритет в рекомендациях",
        flexibility: "Гибкие условия отмены",
      },
    };
  }

  if (locale === "uz") {
    return {
      freeLabel: "Bepul",
      forever: "doimiy",
      currentPlan: "Joriy tarif",
      noExpiry: "Muddat yo'q",
      daysRemaining: "{{count}} kun qoldi",
      cancelPlan: "Tarifni bekor qilish",
      cancelling: "Bekor qilinmoqda...",
      current: "Joriy",
      pending: "Ko'rib chiqilmoqda",
      awaitingApproval: "Tasdiq kutilmoqda...",
      downgradeToFree: "Bepul tarifga o'tish",
      requestTier: "{{tier}} so'rash",
      reviewedNotice:
        "Obuna so'rovlari qo'lda ko'rib chiqiladi. Tasdiqlangach sizga bildirishnoma yuboriladi.",
      requestSubmitted:
        "Obuna so'rovi yuborildi. Admin tez orada ko'rib chiqadi.",
      cancelConfirmTitle: "Obunani bekor qilasizmi?",
      cancelConfirmText:
        "Joriy tarif imtiyozlari obuna muddati tugagach yakunlanadi.",
      cancelConfirmButton: "Ha, bekor qilish",
      cancelled: "Obuna bekor qilindi.",
      pendingExists:
        "Sizda allaqachon ko'rib chiqilayotgan so'rov bor. Admin javobini kuting.",
      everythingIn: "{{tier}} dagi barcha imkoniyatlar",
      features: {
        browse: "Barcha mehmonxonalarni ko'rish",
        bookings: "Bron qilish",
        filters: "Asosiy qidiruv filtrlari",
        hotelChat: "Mehmonxona bilan chat",
        alerts: "Narx tushishi bildirishnomalari",
        history: "Kengaytirilgan qidiruv tarixi",
        prioritySupport: "Ustuvor chat yordami",
        recommendations: "Shaxsiy tavsiyalar",
        deals: "Chegirmalarga erta kirish",
        priceLock: "Narxni qulflash (30 daqiqa)",
        roomFilters: "Kengaytirilgan xona filtrlari",
        concierge: "24/7 konsyerj yordami",
        exclusiveRates: "A'zolar uchun maxsus tariflar",
        topPriority: "Tavsiyalarda eng yuqori ustuvorlik",
        flexibility: "Moslashuvchan bekor qilish",
      },
    };
  }

  return {
    freeLabel: "Free",
    forever: "forever",
    currentPlan: "Current plan",
    noExpiry: "No expiry",
    daysRemaining: "{{count}} days remaining",
    cancelPlan: "Cancel plan",
    cancelling: "Cancelling...",
    current: "Current",
    pending: "Pending",
    awaitingApproval: "Awaiting approval...",
    downgradeToFree: "Downgrade to Free",
    requestTier: "Request {{tier}}",
    reviewedNotice:
      "Subscription requests are manually reviewed. You'll be notified once approved.",
    requestSubmitted:
      "Subscription request submitted. An admin will review it shortly.",
    cancelConfirmTitle: "Cancel subscription?",
    cancelConfirmText:
      "Your current plan benefits will end when the subscription expires.",
    cancelConfirmButton: "Yes, cancel",
    cancelled: "Subscription cancelled.",
    pendingExists:
      "You already have a pending request. Please wait for admin review.",
    everythingIn: "Everything in {{tier}}",
    features: {
      browse: "Browse all hotels",
      bookings: "Make bookings",
      filters: "Basic search filters",
      hotelChat: "Chat with hotels",
      alerts: "Price drop alerts",
      history: "Extended search history",
      prioritySupport: "Priority chat support",
      recommendations: "Personalized recommendations",
      deals: "Early access to deals",
      priceLock: "Price lock (30 min holds)",
      roomFilters: "Advanced room filters",
      concierge: "Concierge support 24/7",
      exclusiveRates: "Exclusive member-only rates",
      topPriority: "Highest recommendation priority",
      flexibility: "Special cancellation flexibility",
    },
  };
};

const TIER_LABEL: Record<string, string> = {
  FREE: "Free",
  BASIC: "Basic",
  PREMIUM: "Premium",
  ELITE: "Elite",
};

export function SubscriptionTab() {
  const { locale } = useI18n();
  const copy = getSubscriptionCopy(locale);
  const member = useMemo(() => getSessionMember(), []);

  const tiers = [
    {
      id: "FREE",
      label: copy.freeLabel,
      price: "₩0",
      period: copy.forever,
      features: [
        copy.features.browse,
        copy.features.bookings,
        copy.features.filters,
        copy.features.hotelChat,
      ],
    },
    {
      id: "BASIC",
      label: "Basic",
      price: "₩9,900",
      period: "/month",
      features: [
        copy.everythingIn.replace("{{tier}}", copy.freeLabel),
        copy.features.alerts,
        copy.features.history,
        copy.features.prioritySupport,
      ],
    },
    {
      id: "PREMIUM",
      label: "Premium",
      price: "₩19,900",
      period: "/month",
      features: [
        copy.everythingIn.replace("{{tier}}", "Basic"),
        copy.features.recommendations,
        copy.features.deals,
        copy.features.priceLock,
        copy.features.roomFilters,
      ],
    },
    {
      id: "ELITE",
      label: "Elite",
      price: "₩39,900",
      period: "/month",
      features: [
        copy.everythingIn.replace("{{tier}}", "Premium"),
        copy.features.concierge,
        copy.features.exclusiveRates,
        copy.features.topPriority,
        copy.features.flexibility,
      ],
    },
  ] as const;

  const { data, loading, error, refetch } = useQuery<GetSubscriptionStatusData>(
    GET_SUBSCRIPTION_STATUS_QUERY,
    {
      skip: !member,
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-and-network",
    },
  );

  const [requestSubscription, { loading: requesting }] = useMutation(
    REQUEST_SUBSCRIPTION_MUTATION,
  );
  const [cancelSubscription, { loading: cancelling }] = useMutation(
    CANCEL_SUBSCRIPTION_MUTATION,
  );

  const status = data?.getSubscriptionStatus;
  const currentTier = status?.tier ?? "FREE";
  const isActive = status?.active ?? false;
  const pendingTier = status?.pendingRequestedTier ?? null;

  const handleRequest = async (tierId: string) => {
    if (tierId === currentTier) return;
    try {
      await requestSubscription({ variables: { requestedTier: tierId } });
      await successAlert(copy.requestSubmitted, undefined, {
        variant: "subscription",
      });
      void refetch();
    } catch (err) {
      await errorAlert(copy.requestSubmitted, getErrorMessage(err), {
        variant: "subscription",
      });
    }
  };

  const handleCancel = async () => {
    const confirmed = await confirmDanger({
      title: copy.cancelConfirmTitle,
      text: copy.cancelConfirmText,
      confirmText: copy.cancelConfirmButton,
    });
    if (!confirmed) return;
    try {
      await cancelSubscription();
      await successAlert(copy.cancelled, undefined, {
        variant: "subscription",
      });
      void refetch();
    } catch (err) {
      await errorAlert(copy.cancelPlan, getErrorMessage(err), {
        variant: "subscription",
      });
    }
  };

  return (
    <div className="space-y-5">
      {error && <ErrorNotice message={getErrorMessage(error)} />}

      {!loading && status && (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-slate-900">
              {copy.currentPlan}:{" "}
              <span className="font-semibold">
                {TIER_LABEL[currentTier] ?? currentTier}
              </span>
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {isActive && status.daysRemaining != null
                ? copy.daysRemaining.replace(
                    "{{count}}",
                    String(status.daysRemaining),
                  )
                : copy.noExpiry}
            </p>
          </div>
          {isActive && currentTier !== "FREE" && (
            <button
              type="button"
              onClick={() => {
                void handleCancel();
              }}
              disabled={cancelling}
              className="text-xs font-medium text-rose-600 transition hover:text-rose-700 disabled:opacity-50"
            >
              {cancelling ? copy.cancelling : copy.cancelPlan}
            </button>
          )}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {tiers.map((tier) => {
          const isCurrent = tier.id === currentTier;
          const isPending = pendingTier === tier.id;
          const hasAnyPending = !!pendingTier;

          return (
            <div
              key={tier.id}
              className={`hover-lift flex flex-col rounded-2xl border p-5 shadow-sm transition ${
                isCurrent
                  ? "border-slate-900 bg-white shadow-md"
                  : isPending
                    ? "border-amber-300 bg-amber-50/30 shadow-sm"
                    : "border-slate-100/80 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {tier.label}
                  </p>
                  <p className="text-xs text-slate-500">
                    <span className="text-base font-bold text-slate-900">
                      {tier.price}
                    </span>{" "}
                    {tier.period}
                  </p>
                </div>
                {isCurrent && (
                  <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">
                    {copy.current}
                  </span>
                )}
                {isPending && (
                  <span className="rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                    {copy.pending}
                  </span>
                )}
              </div>

              <ul className="mt-3 flex-1 space-y-1.5">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-1.5 text-xs text-slate-600"
                  >
                    <Check
                      size={11}
                      className="mt-0.5 flex-shrink-0 text-emerald-500"
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              {!isCurrent && (
                <button
                  type="button"
                  onClick={async () => {
                    if (isPending || hasAnyPending) {
                      await errorAlert(copy.requestSubmitted, copy.pendingExists, {
                        variant: "subscription",
                      });
                      return;
                    }
                    void handleRequest(tier.id);
                  }}
                  disabled={requesting}
                  className={`mt-4 w-full rounded-lg border py-2 text-xs font-medium transition disabled:opacity-50 ${
                    isPending
                      ? "cursor-not-allowed border-amber-200 bg-amber-50 text-amber-600"
                      : hasAnyPending
                        ? "cursor-not-allowed border-slate-200 text-slate-400"
                        : "border-slate-200 text-slate-700 hover:border-slate-900 hover:text-slate-900"
                  }`}
                >
                  {isPending
                    ? copy.awaitingApproval
                    : tier.id === "FREE"
                      ? copy.downgradeToFree
                      : copy.requestTier.replace("{{tier}}", tier.label)}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-slate-400">{copy.reviewedNotice}</p>
    </div>
  );
}
