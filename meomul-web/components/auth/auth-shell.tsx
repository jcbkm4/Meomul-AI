import type { ReactNode } from "react";
import { AppLogo } from "@/components/brand/app-logo";

interface AuthShellProps {
  title: string;
  description: string;
  form: ReactNode;
  footer: ReactNode;
}

export function AuthShell({
  title,
  description,
  form,
  footer,
}: AuthShellProps) {
  return (
    <main className="mx-auto flex w-full max-w-2xl items-center justify-center py-10 sm:py-14">
      <section className="w-full rounded-[2rem] border border-black/8 bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.08)] sm:p-9 lg:p-10">
        <div className="motion-pop-in">
          <AppLogo href="/" className="gap-3" markSize={46} textClassName="text-[1rem] tracking-[0.2em]" />
          <h1 className="mt-8 text-[1.95rem] font-semibold leading-[1.02] tracking-[-0.025em] text-[#222222] sm:text-[2.15rem]">
            {title}
          </h1>
          <p className="mt-3 max-w-lg text-[15px] leading-7 text-[#6a6a6a]">{description}</p>
        </div>

        <div className="mt-8 motion-fade-up motion-delay-1">{form}</div>

        <div className="mt-8 border-t border-[#ebebeb] pt-5 text-sm text-[#6a6a6a] motion-fade-up motion-delay-2">
          {footer}
        </div>
      </section>
    </main>
  );
}
