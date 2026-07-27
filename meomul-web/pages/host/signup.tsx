import { useMutation } from "@apollo/client/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, UserRound, X } from "lucide-react";
import { AppLogo } from "@/components/brand/app-logo";
import { SIGNUP_MEMBER_MUTATION } from "@/graphql/auth.gql";
import { saveAuthSession } from "@/lib/auth/session";
import { errorAlert, infoAlert, successAlert } from "@/lib/ui/alerts";
import { getErrorMessage } from "@/lib/utils/error";
import type { AuthMember, SignupMemberMutationVars } from "@/types/auth";
import type { NextPageWithAuth } from "@/types/page";

interface SignupMemberMutationData {
  signupMember: AuthMember;
}

const HostSignupPage: NextPageWithAuth = () => {
  const router = useRouter();
  const [memberNick, setMemberNick] = useState("");
  const [memberFullName, setMemberFullName] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [memberPassword, setMemberPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const nextTarget = useMemo(() => {
    if (typeof router.query.next !== "string") {
      return "/host/apply";
    }
    return router.query.next.startsWith("/") ? router.query.next : "/host/apply";
  }, [router.query.next]);

  const [signupMember, { loading }] = useMutation<
    SignupMemberMutationData,
    SignupMemberMutationVars
  >(SIGNUP_MEMBER_MUTATION);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nick = memberNick.trim();
    if (nick.length < 3 || nick.length > 24) {
      await errorAlert("Host signup", "Nickname must be between 3 and 24 characters.");
      return;
    }
    if (!/^[0-9]{10,11}$/.test(memberPhone.replace(/-/g, ""))) {
      await errorAlert("Host signup", "Enter a valid phone number.");
      return;
    }
    if (memberPassword.length < 6 || memberPassword.length > 72) {
      await errorAlert("Host signup", "Password must be between 6 and 72 characters.");
      return;
    }
    if (memberPassword !== confirmPassword) {
      await errorAlert("Host signup", "Password confirmation does not match.");
      return;
    }

    try {
      const response = await signupMember({
        variables: {
          input: {
            memberNick: nick,
            memberFullName: memberFullName.trim() || undefined,
            memberPhone,
            memberPassword,
            memberType: "AGENT",
            memberAuthType: "EMAIL",
          },
        },
      });

      const authMember = response.data?.signupMember;
      if (!authMember) {
        await infoAlert("Host signup", "Signup response was empty. Please try again.");
        return;
      }

      saveAuthSession(authMember);
      await successAlert("Agent account created", "Continue with your host application.");
      await router.push(nextTarget);
    } catch (error) {
      await errorAlert("Host signup", getErrorMessage(error));
    }
  };

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-4 py-4 sm:px-8 sm:py-5">
          <AppLogo href="/" />
          <Link
            href="/become-a-host"
            className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <X size={16} className="mr-2" />
            Exit
          </Link>
        </header>

        <section className="mx-auto flex w-full max-w-6xl flex-1 items-start px-4 pb-32 pt-3 sm:px-8 lg:items-center">
          <div className="grid w-full gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
            <div className="order-2 flex flex-col justify-center lg:order-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Meomul Host
              </p>
              <div className="mt-4 flex items-center gap-2 sm:mt-6 sm:gap-3">
                <span className="inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-full bg-slate-950 px-3 text-sm font-semibold text-white">
                  1
                </span>
                <div className="h-px flex-1 bg-slate-200" />
                <span className="inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-full bg-slate-100 px-3 text-sm font-semibold text-slate-400">
                  2
                </span>
                <div className="h-px flex-1 bg-slate-200" />
                <span className="inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-full bg-slate-100 px-3 text-sm font-semibold text-slate-400">
                  3
                </span>
              </div>
              <p className="mt-3 text-sm font-medium text-slate-500 sm:mt-4">
                Step 1 of 3: create your account
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:mt-3 sm:text-5xl">
                Start your Meomul host journey
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:mt-4 sm:text-base sm:leading-8">
                Create an agent account first, then move straight into the host application wizard.
                Approved-only hotel tools still stay locked until admin review is complete.
              </p>

              <div className="mt-6 space-y-3 sm:mt-8 sm:space-y-4">
                <div className="flex items-start gap-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4 sm:rounded-[1.5rem]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-sm">
                    <UserRound size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Agent account first</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      This signup creates an agent account immediately. Host access is still locked
                      until you finish the application and pass review.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4 sm:rounded-[1.5rem]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-sm">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Host flow continues next</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      After signup, you move straight into the same host application wizard used for hotel onboarding.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4 sm:rounded-[1.5rem]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-sm">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Then complete your hotel plan</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Next step covers hotel type, location, target trip purpose, and operator details.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_-36px_rgba(15,23,42,0.24)] sm:rounded-[2rem] sm:p-7 lg:order-2">
              <div className="mb-5 border-b border-slate-100 pb-4">
                <p className="text-lg font-semibold text-slate-950">Create host account</p>
                <p className="mt-1 text-sm text-slate-500">
                  This creates an agent account and continues into your host application automatically.
                </p>
              </div>
              <form id="host-signup-form" onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Member nickname
                  </label>
                  <input
                    value={memberNick}
                    onChange={(event) => setMemberNick(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                    autoComplete="username"
                    minLength={3}
                    maxLength={24}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Full name
                  </label>
                  <input
                    value={memberFullName}
                    onChange={(event) => setMemberFullName(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Phone
                  </label>
                  <input
                    value={memberPhone}
                    onChange={(event) => setMemberPhone(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                    autoComplete="tel"
                    maxLength={13}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <input
                    type="password"
                    value={memberPassword}
                    onChange={(event) => setMemberPassword(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                    autoComplete="new-password"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                    autoComplete="new-password"
                    required
                  />
                </div>

              </form>

              <div className="mt-5 text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  href={`/auth/login?next=${encodeURIComponent(nextTarget)}`}
                  className="font-semibold text-slate-900 underline underline-offset-4"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/96 px-4 py-3 backdrop-blur sm:px-8 sm:py-4">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="h-1.5 rounded-full bg-slate-200">
                <div className="h-1.5 w-full rounded-full bg-slate-950" />
              </div>
              <div className="h-1.5 rounded-full bg-slate-200" />
              <div className="h-1.5 rounded-full bg-slate-200" />
            </div>

            <p className="hidden text-sm text-slate-500 sm:block">
              Step 1 of 3: create the account, then continue into the hotel application.
            </p>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:justify-between sm:gap-4">
              <Link
                href="/become-a-host"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:justify-start sm:border-0 sm:px-1 sm:py-2"
              >
                <X size={16} className="mr-2" />
                Back
              </Link>
              <button
                type="submit"
                form="host-signup-form"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-35"
              >
                {loading ? "Creating account..." : "Continue"}
                <ArrowRight size={16} className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

HostSignupPage.auth = { guestOnly: true };

export default HostSignupPage;
