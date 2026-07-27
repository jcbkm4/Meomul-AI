import { useMutation } from "@apollo/client/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { SIGNUP_MEMBER_MUTATION } from "@/graphql/auth.gql";
import { useI18n } from "@/lib/i18n/provider";
import { resolvePostAuthRedirect } from "@/lib/auth/post-auth-redirect";
import { saveAuthSession } from "@/lib/auth/session";
import { errorAlert, infoAlert, successAlert } from "@/lib/ui/alerts";
import { getErrorMessage } from "@/lib/utils/error";
import type { AuthMember, SignupMemberMutationVars } from "@/types/auth";
import type { NextPageWithAuth } from "@/types/page";

interface SignupMemberMutationData {
  signupMember: AuthMember;
}

const fieldClassName =
  "mt-2 h-14 w-full rounded-2xl border border-[#dddddd] bg-white px-4 text-[15px] text-[#222222] outline-none transition placeholder:text-[#8a8a8a] focus:border-[#222222] focus:ring-4 focus:ring-black/5";

const SignupPage: NextPageWithAuth = () => {
  const { t } = useI18n();
  const router = useRouter();
  const [memberNick, setMemberNick] = useState("");
  const [memberFullName, setMemberFullName] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [memberPassword, setMemberPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const redirectTarget = useMemo(() => {
    if (typeof router.query.next !== "string") {
      return "/";
    }

    return router.query.next.startsWith("/") ? router.query.next : "/";
  }, [router.query.next]);

  const [signupMember, { loading }] = useMutation<
    SignupMemberMutationData,
    SignupMemberMutationVars
  >(SIGNUP_MEMBER_MUTATION);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nick = memberNick.trim();
    if (nick.length < 3 || nick.length > 24) {
      await errorAlert(t("auth_validation_title"), t("auth_validation_nick"));
      return;
    }
    if (!/^[0-9]{10,11}$/.test(memberPhone.replace(/-/g, ""))) {
      await errorAlert(t("auth_validation_title"), t("auth_validation_phone"));
      return;
    }
    if (memberPassword.length < 6) {
      await errorAlert(t("auth_validation_title"), t("auth_validation_password_min"));
      return;
    }
    if (memberPassword.length > 72) {
      await errorAlert(t("auth_validation_title"), t("auth_validation_password_max"));
      return;
    }

    if (memberPassword !== confirmPassword) {
      await errorAlert(t("auth_validation_password_mismatch_title"), t("auth_validation_password_mismatch_body"));
      return;
    }

    try {
      const response = await signupMember({
        variables: {
          input: {
            memberNick,
            memberFullName: memberFullName || undefined,
            memberPhone,
            memberPassword,
            memberType: "USER",
            memberAuthType: "EMAIL",
          },
        },
      });

      const authMember = response.data?.signupMember;
      if (!authMember) {
        await infoAlert(t("auth_signup_response_missing_title"), t("auth_signup_response_missing_body"));
        return;
      }

      saveAuthSession(authMember);
      const nextRoute = await resolvePostAuthRedirect(
        authMember,
        redirectTarget,
      );
      await successAlert(t("auth_signup_success_title"), t("auth_signup_success_body"));
      await router.push(nextRoute);
    } catch (error) {
      await errorAlert(t("auth_signup_failed_title"), getErrorMessage(error));
    }
  };

  return (
    <AuthShell
      title={t("auth_signup_title")}
      description={t("auth_signup_desc")}
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
              {t("auth_full_name_optional")}
            </span>
            <input
              value={memberFullName}
              onChange={(event) => setMemberFullName(event.target.value)}
              className={fieldClassName}
              autoComplete="name"
              placeholder="Full name"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-[#222222]">
              {t("auth_phone")}
            </span>
            <input
              value={memberPhone}
              onChange={(event) => setMemberPhone(event.target.value)}
              className={fieldClassName}
              autoComplete="tel"
              placeholder={t("auth_phone_placeholder")}
              maxLength={13}
              required
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-[#222222]">
                {t("auth_password")}
              </span>
              <input
                type="password"
                value={memberPassword}
                onChange={(event) => setMemberPassword(event.target.value)}
                className={fieldClassName}
                autoComplete="new-password"
                placeholder="Create password"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-[#222222]">
                {t("auth_confirm_password")}
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={fieldClassName}
                autoComplete="new-password"
                placeholder="Repeat password"
                required
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2d2d2d_0%,#111111_100%)] px-4 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? t("auth_signup_loading") : t("auth_signup_submit")}
          </button>
        </form>
      }
      footer={
        <div className="text-sm text-[#6a6a6a]">
          <Link href="/auth/login" className="font-medium text-[#222222] underline underline-offset-4">
            {t("auth_have_account")}
          </Link>
        </div>
      }
    />
  );
};

SignupPage.auth = { guestOnly: true };

export default SignupPage;
