import Link from "next/link";
import Head from "next/head";
import { useI18n } from "@/lib/i18n/provider";

export default function NotFoundPage() {
  const { locale } = useI18n();
  const copy =
    locale === "ko"
      ? {
          meta: "페이지를 찾을 수 없음 — Meomul",
          eyebrow: "페이지를 찾을 수 없음",
          title: "404 — 찾을 수 없음",
          body: "요청한 페이지를 찾을 수 없습니다. 이동되었거나 더 이상 존재하지 않을 수 있습니다.",
          hotels: "호텔 둘러보기",
          home: "홈으로 이동",
        }
      : locale === "ru"
        ? {
            meta: "Страница не найдена — Meomul",
            eyebrow: "Страница не найдена",
            title: "404 — Не найдено",
            body: "Не удалось найти запрошенную страницу. Возможно, она была перемещена или больше не существует.",
            hotels: "Смотреть отели",
            home: "На главную",
          }
        : locale === "uz"
          ? {
              meta: "Sahifa topilmadi — Meomul",
              eyebrow: "Sahifa topilmadi",
              title: "404 — Topilmadi",
              body: "Siz qidirayotgan sahifa topilmadi. U ko'chirilgan yoki endi mavjud emas bo'lishi mumkin.",
              hotels: "Mehmonxonalarni ko'rish",
              home: "Bosh sahifaga o'tish",
            }
          : {
              meta: "Page Not Found — Meomul",
              eyebrow: "Page not found",
              title: "404 — Not Found",
              body: "Sorry, we couldn't find the page you're looking for. It may have been moved or no longer exists.",
              hotels: "Browse hotels",
              home: "Go home",
            };
  return (
    <>
      <Head>
        <title>{copy.meta}</title>
      </Head>

      <main className="mx-auto flex min-h-[50vh] w-full max-w-2xl flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          {copy.eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">
          {copy.title}
        </h1>
        <p className="mt-3 max-w-md text-sm text-slate-600">
          {copy.body}
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/hotels"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {copy.hotels}
          </Link>
          <Link
            href="/"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
          >
            {copy.home}
          </Link>
        </div>
      </main>
    </>
  );
}
