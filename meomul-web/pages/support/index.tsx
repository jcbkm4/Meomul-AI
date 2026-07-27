import { useMutation, useQuery } from "@apollo/client/react";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CalendarCheck,
  ChevronRight,
  CreditCard,
  HelpCircle,
  Inbox,
  MessageCircle,
  Minus,
  Monitor,
  Plus,
  RotateCcw,
  Search,
  Send,
  User,
  Building2,
} from "lucide-react";
import {
  GET_MY_CHATS_QUERY,
  START_SUPPORT_CHAT_MUTATION,
} from "@/graphql/chat.gql";
import { getChatCopy, formatChatTimeAgo } from "@/lib/chat/chat-i18n";
import type {
  GetMyChatsQueryData,
  GetMyChatsQueryVars,
  StartSupportChatMutationData,
  StartSupportChatMutationVars,
} from "@/types/chat";
import { getSessionMember } from "@/lib/auth/session";
import { useI18n } from "@/lib/i18n/provider";
import { getSupportCopy } from "@/lib/support/support-i18n";
import { getErrorMessage } from "@/lib/utils/error";
import type { NextPageWithAuth } from "@/types/page";

/* ═══════════════════════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════════════════════ */

const CATEGORY_ICONS = {
  bookings: CalendarCheck,
  payments: CreditCard,
  cancellations: RotateCcw,
  account: User,
  hotel: Building2,
  technical: Monitor,
} as const;

/* ═══════════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════════ */

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    WAITING: "bg-amber-400",
    ACTIVE: "bg-emerald-400",
    CLOSED: "bg-slate-300",
  };
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full ${colors[status] ?? colors.CLOSED}`}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════════════════ */

const SupportPage: NextPageWithAuth = () => {
  const { locale } = useI18n();
  const supportCopy = getSupportCopy(locale);
  const chatCopy = getChatCopy(locale);
  const formRef = useRef<HTMLFormElement>(null);
  const faqRef = useRef<HTMLElement>(null);

  /* ── Auth ─────────────────────────────────────────────────────────────── */
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    setIsLoggedIn(Boolean(getSessionMember()));
  }, []);

  /* ── Search & FAQ ────────────────────────────────────────────────────── */
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const categories = supportCopy.categories;

  const filteredFaq = useMemo(() => {
    let items = supportCopy.faq.map((item, i) => ({ ...item, idx: i }));
    if (activeCategory) {
      items = items.filter((item) => item.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (item) =>
          item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q),
      );
    }
    return items;
  }, [search, activeCategory, supportCopy.faq]);

  /* ── Contact form ────────────────────────────────────────────────────── */
  const [topic, setTopic] = useState<string>(supportCopy.formTopics[0]);
  const [bookingRef, setBookingRef] = useState("");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<string | null>(null);

  useEffect(() => {
    setTopic((current) =>
      supportCopy.formTopics.includes(current)
        ? current
        : supportCopy.formTopics[0],
    );
  }, [supportCopy.formTopics]);

  /* ── Queries & mutations ─────────────────────────────────────────────── */
  const { data: chatsData, loading: chatsLoading } = useQuery<
    GetMyChatsQueryData,
    GetMyChatsQueryVars
  >(GET_MY_CHATS_QUERY, {
    skip: !isLoggedIn,
    variables: {
      input: { page: 1, limit: 50, sort: "createdAt", direction: -1 },
    },
    fetchPolicy: "cache-and-network",
  });

  const supportChats = useMemo(
    () =>
      (chatsData?.getMyChats.list ?? []).filter(
        (c) => c.chatScope === "SUPPORT",
      ),
    [chatsData],
  );

  const [startSupportChat, { loading: sending }] = useMutation<
    StartSupportChatMutationData,
    StartSupportChatMutationVars
  >(START_SUPPORT_CHAT_MUTATION);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const trimmed = message.trim();
    if (trimmed.length < 10) {
      setFormError(supportCopy.minCharacters);
      return;
    }
    try {
      const { data } = await startSupportChat({
        variables: {
          input: {
            topic,
            bookingId: bookingRef.trim() || undefined,
            sourcePath: "/support",
            initialMessage: trimmed,
          },
        },
      });
      if (data?.startSupportChat._id) {
        setSubmitted(data.startSupportChat._id);
      }
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  };

  /* ── Category click → scroll to FAQ ──────────────────────────────────── */
  const handleCategoryClick = (catId: string, catTopic: string) => {
    setActiveCategory(activeCategory === catId ? null : catId);
    setOpenFaq(null);
    setTopic(catTopic);
    faqRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToContact = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <>
      <Head>
        <title>{supportCopy.metaTitle}</title>
        <meta
          name="description"
          content={supportCopy.metaDescription}
        />
      </Head>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="-mx-4 -mt-6 mb-0 bg-gradient-to-b from-teal-800 via-teal-700 to-teal-600 px-4 pb-14 pt-16 sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {supportCopy.heroTitle}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-teal-100/80">
            {supportCopy.heroDescription}
          </p>

          {/* Search bar */}
          <div className="relative mx-auto mt-8 max-w-lg">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setOpenFaq(null);
              }}
              placeholder={supportCopy.searchPlaceholder}
              className="h-12 w-full rounded-xl border-0 bg-white pl-11 pr-4 text-sm text-slate-800 shadow-lg outline-none ring-1 ring-white/20 transition placeholder:text-slate-400 focus:ring-2 focus:ring-white/40"
            />
          </div>
        </div>
      </section>

      {/* ── Topic Categories ─────────────────────────────────────────────── */}
      <section className="-mt-7 mb-10">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 px-1 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id];
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id, cat.topic)}
                className={`group flex flex-col items-center rounded-xl border bg-white px-3 py-5 text-center shadow-sm transition hover:shadow-md ${
                  isActive
                    ? "border-teal-300 ring-2 ring-teal-100"
                    : "border-slate-100 hover:border-slate-200"
                }`}
              >
                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg transition ${
                    isActive
                      ? "bg-teal-600 text-white"
                      : "bg-slate-50 text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-600"
                  }`}
                >
                  <Icon size={18} />
                </div>
                <span
                  className={`text-xs font-semibold leading-tight ${
                    isActive ? "text-teal-700" : "text-slate-700"
                  }`}
                >
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section ref={faqRef} className="scroll-mt-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-slate-900">
              {activeCategory
                ? (categories.find((c) => c.id === activeCategory)?.label ??
                  supportCopy.helpArticles)
                : supportCopy.popularQuestions}
            </h2>
            {activeCategory && (
              <button
                type="button"
                onClick={() => {
                  setActiveCategory(null);
                  setOpenFaq(null);
                }}
                className="text-xs font-medium text-teal-600 transition hover:text-teal-700"
              >
                {supportCopy.viewAll}
              </button>
            )}
          </div>

          {filteredFaq.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
              <HelpCircle size={32} className="mx-auto mb-3 text-slate-200" />
              <p className="text-sm font-medium text-slate-500">
                {supportCopy.noResultsFound}
              </p>
              <p className="mx-auto mt-1 max-w-xs text-xs text-slate-400">
                {supportCopy.tryDifferentSearch}{" "}
                {isLoggedIn ? (
                  <button
                    type="button"
                    onClick={scrollToContact}
                    className="font-semibold text-teal-600 hover:underline"
                  >
                    {supportCopy.contactOurTeam}
                  </button>
                ) : (
                  <Link
                    href="/auth/login"
                    className="font-semibold text-teal-600 hover:underline"
                  >
                    {supportCopy.signInForHelp}
                  </Link>
                )}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-white">
              {filteredFaq.map((item) => {
                const isOpen = openFaq === item.idx;
                return (
                  <div key={item.idx}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : item.idx)}
                      className="flex w-full items-center justify-between gap-4 px-6 py-4.5 text-left transition hover:bg-slate-50/60"
                      aria-expanded={isOpen}
                    >
                      <span className="text-[13.5px] font-medium leading-snug text-slate-800">
                        {item.q}
                      </span>
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition group-hover:border-slate-300">
                        {isOpen ? <Minus size={12} /> : <Plus size={12} />}
                      </span>
                    </button>
                    <div
                      className={`grid transition-all duration-200 ease-out ${
                        isOpen
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-6 pb-5 text-[13px] leading-relaxed text-slate-500">
                          {item.a}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Still need help? / Contact ───────────────────────────────────── */}
      <section className="mt-16 scroll-mt-20">
        <div className="mx-auto max-w-3xl">
          {/* Header bar */}
          <div className="rounded-t-xl border border-b-0 border-slate-100 bg-slate-50 px-6 py-5">
            <h2 className="font-display text-lg font-bold text-slate-900">
              {supportCopy.stillNeedHelp}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isLoggedIn
                ? supportCopy.sendUsMessage
                : supportCopy.signInDirectly}
            </p>
          </div>

          {/* Body */}
          {!isLoggedIn ? (
            <div className="rounded-b-xl border border-slate-100 bg-white px-6 py-8 text-center">
              <p className="text-sm text-slate-500">
                {supportCopy.signInPrompt}
              </p>
              <Link
                href="/auth/login"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
              >
                {supportCopy.signIn}
                <ArrowRight size={14} />
              </Link>
            </div>
          ) : submitted ? (
            <div className="rounded-b-xl border border-slate-100 bg-white px-6 py-10 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-50">
                <MessageCircle size={20} className="text-teal-600" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                {supportCopy.messageSent}
              </h3>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-500">
                {supportCopy.supportRespond}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={`/chats/${submitted}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
                >
                  {supportCopy.viewConversation}
                  <ArrowRight size={14} />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(null);
                    setMessage("");
                    setBookingRef("");
                    setTopic(supportCopy.formTopics[0]);
                  }}
                  className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  {supportCopy.newRequest}
                </button>
              </div>
            </div>
          ) : (
            <form
              ref={formRef}
              onSubmit={(e) => {
                void handleSubmit(e);
              }}
              className="space-y-5 rounded-b-xl border border-slate-100 bg-white px-6 py-6"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="s-topic"
                    className="mb-1.5 block text-xs font-medium text-slate-500"
                  >
                    {supportCopy.topicLabel}
                  </label>
                  <select
                    id="s-topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  >
                    {supportCopy.formTopics.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="s-ref"
                    className="mb-1.5 block text-xs font-medium text-slate-500"
                  >
                    {supportCopy.bookingReference}{" "}
                    <span className="text-slate-400">({supportCopy.optional})</span>
                  </label>
                  <input
                    id="s-ref"
                    type="text"
                    value={bookingRef}
                    onChange={(e) => setBookingRef(e.target.value)}
                    placeholder={supportCopy.bookingReferencePlaceholder}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="s-msg"
                  className="mb-1.5 block text-xs font-medium text-slate-500"
                >
                  {supportCopy.helpPrompt}
                </label>
                <textarea
                  id="s-msg"
                  rows={4}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  placeholder={supportCopy.messagePlaceholder}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                />
                {formError && (
                  <p className="mt-1 text-xs text-rose-500">{formError}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <span className="mr-auto text-xs text-slate-400">
                  {message.trim().length > 0 &&
                    `${message.trim().length} ${supportCopy.characters}${message.trim().length !== 1 && locale === "en" ? "s" : ""}`}
                </span>
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      {supportCopy.sending}
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      {supportCopy.sendMessage}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ── My Support Requests ──────────────────────────────────────────── */}
      {isLoggedIn && (
        <section className="mt-14">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display mb-5 text-lg font-bold text-slate-900">
              {supportCopy.yourRequests}
            </h2>

            {chatsLoading && supportChats.length === 0 ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 rounded-lg border border-slate-100 bg-white px-5 py-4"
                  >
                    <div className="h-2 w-2 animate-pulse rounded-full bg-slate-200" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
                      <div className="h-2.5 w-44 animate-pulse rounded bg-slate-50" />
                    </div>
                  </div>
                ))}
              </div>
            ) : supportChats.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
                <Inbox size={24} className="mx-auto mb-2 text-slate-200" />
                <p className="text-sm text-slate-400">
                  {supportCopy.noSupportRequests}
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      <th className="px-5 py-3 text-xs font-medium text-slate-400">
                        {supportCopy.status}
                      </th>
                      <th className="px-5 py-3 text-xs font-medium text-slate-400">
                        {supportCopy.topicHeader}
                      </th>
                      <th className="hidden px-5 py-3 text-xs font-medium text-slate-400 sm:table-cell">
                        {supportCopy.lastUpdate}
                      </th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {supportChats.map((chat) => {
                      const preview =
                        ((chat.messages ?? [])[0]?.content ?? "").slice(
                          0,
                          60,
                        ) || "—";
                      return (
                        <tr
                          key={chat._id}
                          className="group transition hover:bg-slate-50/50"
                        >
                          <td className="px-5 py-3.5">
                            <span className="flex items-center gap-2">
                              <StatusDot status={chat.chatStatus} />
                              <span className="text-xs capitalize text-slate-500">
                                {chat.chatStatus === "WAITING"
                                  ? chatCopy.waiting
                                  : chat.chatStatus === "ACTIVE"
                                    ? chatCopy.active
                                    : chatCopy.closed}
                              </span>
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="font-medium text-slate-800">
                              {chat.supportTopic ?? supportCopy.general}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-slate-400 max-w-[200px]">
                              {preview}
                            </p>
                          </td>
                          <td className="hidden px-5 py-3.5 text-xs text-slate-400 sm:table-cell">
                            {formatChatTimeAgo(
                              locale,
                              chat.lastMessageAt || chat.createdAt,
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <Link
                              href={`/chats/${chat._id}`}
                              className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 opacity-0 transition group-hover:opacity-100"
                            >
                              {supportCopy.open}
                              <ChevronRight size={14} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Spacer */}
      <div className="h-12" />
    </>
  );
};

export default SupportPage;
