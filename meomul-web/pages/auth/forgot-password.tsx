import { useMutation } from "@apollo/client/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { RESET_PASSWORD_MUTATION } from "@/graphql/auth.gql";
import { errorAlert, successAlert } from "@/lib/ui/alerts";
import { getErrorMessage } from "@/lib/utils/error";
import type {
  ResetPasswordMutationData,
  ResetPasswordMutationVars,
} from "@/types/auth";
import type { NextPageWithAuth } from "@/types/page";

const fieldClassName =
  "mt-2 h-14 w-full rounded-2xl border border-[#dddddd] bg-white px-4 text-[15px] text-[#222222] outline-none transition placeholder:text-[#8a8a8a] focus:border-[#222222] focus:ring-4 focus:ring-black/5";

const ForgotPasswordPage: NextPageWithAuth = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [memberNick, setMemberNick] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [resetPassword, { loading }] = useMutation<
    ResetPasswordMutationData,
    ResetPasswordMutationVars
  >(RESET_PASSWORD_MUTATION);

  const title = useMemo(
    () => (step === 1 ? "Reset your password" : "Create a new password"),
    [step],
  );

  const description = useMemo(
    () =>
      step === 1
        ? "Confirm your username and phone number to continue."
        : "Choose a new password for your account.",
    [step],
  );

  const validateIdentityStep = async () => {
    const nick = memberNick.trim();
    const normalizedPhone = memberPhone.replace(/-/g, "").trim();

    if (nick.length < 3 || nick.length > 24) {
      await errorAlert("Check your details", "Enter a valid username.");
      return false;
    }

    if (!/^[0-9]{10,11}$/.test(normalizedPhone)) {
      await errorAlert("Check your details", "Enter the phone number used on your account.");
      return false;
    }

    return true;
  };

  const validatePasswordStep = async () => {
    if (newPassword.length < 6) {
      await errorAlert("Choose a stronger password", "Password must be at least 6 characters.");
      return false;
    }

    if (newPassword.length > 72) {
      await errorAlert("Choose a stronger password", "Password must be 72 characters or fewer.");
      return false;
    }

    if (newPassword !== confirmPassword) {
      await errorAlert("Passwords do not match", "Confirm the same new password to continue.");
      return false;
    }

    return true;
  };

  const onContinue = async () => {
    const valid = await validateIdentityStep();
    if (!valid) return;
    setStep(2);
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const identityValid = await validateIdentityStep();
    if (!identityValid) {
      setStep(1);
      return;
    }

    const passwordValid = await validatePasswordStep();
    if (!passwordValid) return;

    try {
      const response = await resetPassword({
        variables: {
          input: {
            memberNick: memberNick.trim(),
            memberPhone: memberPhone.replace(/-/g, "").trim(),
            newPassword,
          },
        },
      });

      if (!response.data?.resetPassword.success) {
        await errorAlert("Reset password", "Password reset could not be completed.");
        return;
      }

      await successAlert(
        "Password updated",
        "Your password was changed. Log in again with the new password.",
      );
      await router.push("/auth/login");
    } catch (error) {
      await errorAlert("Reset password", getErrorMessage(error));
    }
  };

  return (
    <AuthShell
      title={title}
      description={description}
      form={
        <form className="space-y-5" onSubmit={onSubmit}>
          {step === 1 ? (
            <>
              <label className="block">
                <span className="text-sm font-medium text-[#222222]">Username</span>
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
                <span className="text-sm font-medium text-[#222222]">Phone number</span>
                <input
                  value={memberPhone}
                  onChange={(event) => setMemberPhone(event.target.value)}
                  className={fieldClassName}
                  autoComplete="tel"
                  placeholder="01012345678"
                  maxLength={13}
                  required
                />
              </label>

              <button
                type="button"
                onClick={onContinue}
                className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2d2d2d_0%,#111111_100%)] px-4 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Continue
              </button>
            </>
          ) : (
            <>
              <div className="rounded-2xl border border-[#ebebeb] bg-[#fafafa] px-4 py-3 text-sm text-[#6a6a6a]">
                <span className="font-medium text-[#222222]">{memberNick.trim() || "Username"}</span>
                {" · "}
                <span>{memberPhone.trim() || "Phone number"}</span>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-[#222222]">New password</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className={fieldClassName}
                  autoComplete="new-password"
                  minLength={6}
                  maxLength={72}
                  placeholder="Create password"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-[#222222]">Confirm password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className={fieldClassName}
                  autoComplete="new-password"
                  minLength={6}
                  maxLength={72}
                  placeholder="Repeat password"
                  required
                />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex h-14 items-center justify-center rounded-2xl border border-[#dddddd] px-5 text-sm font-semibold text-[#222222] transition hover:bg-[#f7f7f7]"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-14 flex-1 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2d2d2d_0%,#111111_100%)] px-4 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Updating password..." : "Update password"}
                </button>
              </div>
            </>
          )}
        </form>
      }
      footer={
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Link href="/auth/login" className="font-medium text-[#222222] underline underline-offset-4">
            Back to login
          </Link>
          <span className="hidden text-[#cfcfcf] sm:inline">•</span>
          <Link href="/support" className="font-medium text-[#6a6a6a] underline underline-offset-4">
            Contact support
          </Link>
        </div>
      }
    />
  );
};

ForgotPasswordPage.auth = { guestOnly: true };

export default ForgotPasswordPage;
