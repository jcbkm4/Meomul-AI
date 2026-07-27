import { useMutation } from "@apollo/client/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LOGIN_MEMBER_MUTATION } from "@/graphql/auth.gql";
import { useI18n } from "@/lib/i18n/provider";
import { resolvePostAuthRedirect } from "@/lib/auth/post-auth-redirect";
import { saveAuthSession } from "@/lib/auth/session";
import { errorAlert, infoAlert, successAlert } from "@/lib/ui/alerts";
import { getErrorMessage } from "@/lib/utils/error";
import type { AuthMember, LoginMemberMutationVars } from "@/types/auth";
import type { NextPageWithAuth } from "@/types/page";

interface LoginMemberMutationData {
  loginMember: AuthMember;
}

const fieldClassName =
  "mt-2 h-14 w-full rounded-2xl border border-[#dddddd] bg-white px-4 text-[15px] text-[#222222] outline-none transition placeholder:text-[#8a8a8a] focus:border-[#222222] focus:ring-4 focus:ring-black/5";

const LoginPage: NextPageWithAuth = () => {
  const { t } = useI18n();
  const router = useRouter();
  const [memberNick, setMemberNick] = useState("");
  const [memberPassword, setMemberPassword] = useState("");

  const redirectTarget = useMemo(() => {
    if (typeof router.query.next !== "string") {
      return "/";
    }

    return router.query.next.startsWith("/") ? router.query.next : "/";
  }, [router.query.next]);

  const [loginMember, { loading }] = useMutation<
    LoginMemberMutationData,
    LoginMemberMutationVars
  >(LOGIN_MEMBER_MUTATION);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nick = memberNick.trim();
    if (nick.length < 3 || nick.length > 24) {
      await errorAlert(t("auth_validation_title"), t("auth_validation_nick"));
      return;
    }
    if (memberPassword.length < 6 || memberPassword.length > 72) {
      await errorAlert(t("auth_validation_title"), t("auth_validation_password_range"));
      return;
    }

    try {
      const response = await loginMember({
        variables: {
          input: {
            memberNick,
            memberPassword,
          },
        },
      });

      const authMember = response.data?.loginMember;
      if (!authMember) {
        await infoAlert(t("auth_login_response_missing_title"), t("auth_login_response_missing_body"));
        return;
      }

      saveAuthSession(authMember);
      const nextRoute = await resolvePostAuthRedirect(
        authMember,
        redirectTarget,
      );
      await successAlert(t("auth_login_success_title"), t("auth_login_success_body"));
      await router.push(nextRoute);
    } catch (error) {
      await errorAlert(t("auth_login_failed_title"), getErrorMessage(error));
    }
  };

  return (
    <AuthShell
      title={t("auth_login_title")}
      description={t("auth_login_desc")}
      form={
        <form className="space-y-5" onSubmit={onSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-[#222222]">
              {t("auth_member_nick")}
            </span>
            <input
              value={memberNick}
              onChange={(event) => setMemberNick(event.target.value)}
              className={fieldClassName}
              autoComplete="username"
              minLength={3}
              maxLength={24}
              placeholder="Nickname"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[#222222]">
              {t("auth_password")}
            </span>
            <input
              type="password"
              value={memberPassword}
              onChange={(event) => setMemberPassword(event.target.value)}
              className={fieldClassName}
              autoComplete="current-password"
              minLength={6}
              maxLength={72}
              placeholder="Password"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2d2d2d_0%,#111111_100%)] px-4 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? t("auth_login_loading") : t("auth_login_submit")}
          </button>
        </form>
      }
      footer={
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link href="/auth/signup" className="font-medium text-[#222222] underline underline-offset-4">
            {t("auth_create_account")}
          </Link>
          <span className="hidden text-[#cfcfcf] sm:inline">•</span>
          <Link
            href="/auth/forgot-password"
            className="font-medium text-[#6a6a6a] underline underline-offset-4"
          >
            {t("auth_forgot_password")}
          </Link>
        </div>
      }
    />
  );
};

LoginPage.auth = { guestOnly: true };

export default LoginPage;
