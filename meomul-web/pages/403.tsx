import Link from "next/link";
import { ErrorNotice } from "@/components/ui/error-notice";
import { useI18n } from "@/lib/i18n/provider";

export default function ForbiddenPage() {
  const { locale } = useI18n();
  const copy =
    locale === "ko"
      ? {
          eyebrow: "접근 거부",
          title: "403 - 접근 불가",
          body: "현재 계정 권한으로는 이 페이지를 열 수 없습니다.",
          dashboard: "대시보드로 이동",
          home: "홈으로 이동",
        }
      : locale === "ru"
        ? {
            eyebrow: "Доступ запрещен",
            title: "403 - Доступ запрещен",
            body: "У вашей учетной записи нет прав для открытия этой страницы.",
            dashboard: "Перейти в панель",
            home: "На главную",
          }
        : locale === "uz"
          ? {
              eyebrow: "Kirish taqiqlangan",
              title: "403 - Ruxsat yo'q",
              body: "Hisobingiz roli bu sahifani ochishga ruxsat bermaydi.",
              dashboard: "Boshqaruv paneliga o'tish",
              home: "Bosh sahifaga o'tish",
            }
          : {
              eyebrow: "Access denied",
              title: "403 - Forbidden",
              body: "Your account role does not have permission to open this page.",
              dashboard: "Go to dashboard",
              home: "Go home",
            };
  return (
    <main className="mx-auto flex min-h-[50vh] w-full max-w-2xl flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">{copy.eyebrow}</p>
      <h1 className="mt-3 text-3xl font-semibold text-slate-900">{copy.title}</h1>
      <ErrorNotice
        className="mt-3 max-w-lg text-left"
        tone="error"
        message={copy.body}
      />
      <div className="mt-6 flex gap-3">
        <Link href="/dashboard" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          {copy.dashboard}
        </Link>
        <Link href="/" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
          {copy.home}
        </Link>
      </div>
    </main>
  );
}
