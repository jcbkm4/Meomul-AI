import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowRight,
  BedDouble,
  Building2,
  ClipboardCheck,
  DoorOpen,
  Sparkles,
  X,
} from "lucide-react";
import { AppLogo } from "@/components/brand/app-logo";
import { getSessionMember } from "@/lib/auth/session";
import type { NextPageWithAuth } from "@/types/page";

const steps = [
  {
    number: "1",
    title: "Tell us about your hotel plan",
    body: "Share the property format, target city, and the kind of guest experience you want to offer on Meomul.",
    icon: Building2,
  },
  {
    number: "2",
    title: "Make your operation stand out",
    body: "Add your business details, contact information, and the context our admin team needs to review your host access.",
    icon: Sparkles,
  },
  {
    number: "3",
    title: "Finish review and unlock hosting",
    body: "After submission your account becomes a pending agent. Approval unlocks hotel, room, chat, and booking management.",
    icon: DoorOpen,
  },
] as const;

const highlights = [
  { icon: BedDouble, label: "Hotels only", value: "Built for hotel operators, not home rentals" },
  { icon: ClipboardCheck, label: "Approval path", value: "Normal signup first, host approval second" },
] as const;

const BecomeAHostPage: NextPageWithAuth = () => {
  const member = useMemo(() => getSessionMember(), []);

  const primaryHref = member ? "/host/apply" : "/host/signup";
  const secondaryHref = member ? "/profile" : "/";

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-4 py-4 sm:px-8 sm:py-5">
          <AppLogo href="/" />
          <Link
            href={secondaryHref}
            className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <X size={16} className="mr-2" />
            Exit
          </Link>
        </header>

        <section className="flex flex-1 items-start px-4 pb-32 pt-3 sm:px-8 lg:items-center lg:px-14">
          <div className="grid w-full gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
            <div className="flex flex-col justify-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Meomul Host
              </p>
              <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-[0.98] tracking-tight text-slate-950 sm:mt-6 sm:text-6xl lg:text-7xl">
                It&apos;s easy to get started on Meomul
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:mt-6 sm:text-lg sm:leading-8">
                We use an approval-first host flow like a modern listing setup, but adapted for hotel
                operators. Start with a normal account, submit your host details, and unlock hotel
                creation once your application is approved.
              </p>

              <div className="mt-6 grid gap-3 sm:mt-10 sm:grid-cols-2">
                {highlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4 sm:rounded-[1.75rem] sm:px-5"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-sm sm:h-11 sm:w-11">
                        <Icon size={20} />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-slate-900 sm:mt-4">{item.label}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{item.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <div className="rounded-[1.6rem] border border-slate-200 bg-white sm:rounded-[2rem]">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.number}
                      className={`grid gap-4 px-4 py-5 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-5 sm:px-8 sm:py-8 ${
                        index < steps.length - 1 ? "border-b border-slate-200" : ""
                      }`}
                    >
                      <div>
                        <p className="text-xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]">
                          <span className="mr-3 align-middle text-slate-950">{step.number}</span>
                          <span className="align-middle">{step.title}</span>
                        </p>
                        <p className="mt-2 max-w-xl text-sm leading-7 text-slate-500 sm:mt-3 sm:text-base sm:leading-8">
                          {step.body}
                        </p>
                      </div>
                      <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] sm:h-20 sm:w-20 sm:rounded-[1.75rem]">
                        <Icon size={24} strokeWidth={1.8} className="sm:hidden" />
                        <Icon size={32} strokeWidth={1.8} className="hidden sm:block" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-8 sm:py-4">
          <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="h-1.5 rounded-full bg-slate-950" />
              <div className="h-1.5 rounded-full bg-slate-200" />
              <div className="h-1.5 rounded-full bg-slate-200" />
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="hidden text-sm text-slate-500 sm:block">
                Step 1 of 3: start the host flow and move into account setup.
              </p>
            <Link
              href={primaryHref}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
            >
              Get started
              <ArrowRight size={18} className="ml-2" />
            </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BecomeAHostPage;
