import { useMutation } from "@apollo/client/react";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Camera, Lock, X } from "lucide-react";
import { UPDATE_MEMBER_MUTATION } from "@/graphql/member.gql";
import { getSessionMember, updateSessionMember } from "@/lib/auth/session";
import { useI18n } from "@/lib/i18n/provider";
import { getProfileCopy } from "@/lib/profile/profile-i18n";
import { lockBodyScroll } from "@/lib/ui/body-scroll-lock";
import { errorAlert, successAlert } from "@/lib/ui/alerts";
import { uploadImageFile } from "@/lib/uploads/upload-image";
import { getErrorMessage } from "@/lib/utils/error";
import { resolveMediaUrl } from "@/lib/utils/media-url";

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const AVATAR_BG: Record<string, string> = {
  USER: "bg-sky-500",
  AGENT: "bg-violet-500",
  ADMIN: "bg-rose-500",
  ADMIN_OPERATOR: "bg-rose-500",
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EditableMember {
  memberType: string;
  memberNick: string;
  memberFullName?: string | null;
  memberImage?: string | null;
  memberAddress?: string | null;
  memberDesc?: string | null;
  memberPhone?: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: EditableMember;
}

// ─── EditProfileModal ─────────────────────────────────────────────────────────

export function EditProfileModal({
  isOpen,
  onClose,
  member,
}: EditProfileModalProps) {
  const { locale } = useI18n();
  const copy = getProfileCopy(locale);
  const fileRef = useRef<HTMLInputElement>(null);

  const [nick, setNick] = useState(member.memberNick);
  const [fullName, setFullName] = useState(member.memberFullName ?? "");
  const [address, setAddress] = useState(member.memberAddress ?? "");
  const [desc, setDesc] = useState(member.memberDesc ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(
    member.memberImage ?? null,
  );
  const [uploading, setUploading] = useState(false);

  const [updateMember, { loading: saving }] = useMutation(
    UPDATE_MEMBER_MUTATION,
  );

  // Re-initialize form fields every time the modal opens
  useEffect(() => {
    if (isOpen) {
      setNick(member.memberNick);
      setFullName(member.memberFullName ?? "");
      setAddress(member.memberAddress ?? "");
      setDesc(member.memberDesc ?? "");
      setImageUrl(member.memberImage ?? null);
    }
  }, [isOpen, member]);

  // Scroll-lock while open
  useEffect(() => {
    if (isOpen) {
      const releaseScrollLock = lockBodyScroll();
      return releaseScrollLock;
    }
  }, [isOpen]);

  const initials = member.memberNick.slice(0, 2).toUpperCase();
  const avatarBg = AVATAR_BG[member.memberType] ?? "bg-slate-500";

  // ── Image upload ───────────────────────────────────────────────────────
  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      await errorAlert(copy.profilePhoto, copy.imageTypeError, {
        variant: "image",
      });
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      await errorAlert(
        copy.profilePhoto,
        copy.imageSizeError.replace("{{size}}", String(MAX_IMAGE_SIZE_MB)),
        {
          variant: "image",
        },
      );
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      const uploadedUrl = await uploadImageFile(file, "member");
      setImageUrl(uploadedUrl);
    } catch (err) {
      await errorAlert(copy.profilePhoto, copy.imageUploadFailed, {
        variant: "image",
      });
      console.error(err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nick.trim() || nick.trim().length < 3) {
      await errorAlert(copy.displayName, copy.displayNameError, {
        variant: "profile",
      });
      return;
    }

    // Optimistic session update for instant header avatar refresh
    const previousSession = getSessionMember();
    updateSessionMember({
      memberNick: nick.trim(),
      memberFullName: fullName.trim() || null,
      memberImage: imageUrl || null,
    });

    try {
      await updateMember({
        variables: {
          input: {
            memberNick: nick.trim(),
            memberFullName: fullName.trim() || undefined,
            memberAddress: address.trim() || undefined,
            memberDesc: desc.trim() || undefined,
            memberImage: imageUrl || undefined,
          },
        },
      });
      await successAlert(copy.profileUpdated, undefined, {
        variant: "profile",
      });
      onClose();
    } catch (err) {
      // Rollback optimistic session update
      if (previousSession) {
        updateSessionMember({
          memberNick: previousSession.memberNick,
          memberFullName: previousSession.memberFullName ?? null,
          memberImage: previousSession.memberImage ?? null,
        });
      }
      await errorAlert(copy.editProfile, getErrorMessage(err), {
        variant: "profile",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-3xl bg-white p-6 shadow-2xl motion-pop-in">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-slate-900">
            {copy.editProfile}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Avatar upload */}
        <div className="mb-6 flex items-center gap-4">
          <div
            className="group relative flex-shrink-0 cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <div
              className={`h-16 w-16 overflow-hidden rounded-full ${avatarBg} flex items-center justify-center text-xl font-semibold text-white`}
            >
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveMediaUrl(imageUrl)}
                  alt={initials}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition group-hover:opacity-100">
              {uploading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Camera size={14} className="text-white" />
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">{copy.profilePhoto}</p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-xs font-medium text-brand transition hover:text-brand/80"
            >
              {uploading ? copy.uploading : copy.changePhoto}
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              {copy.displayName} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              minLength={3}
              maxLength={20}
              required
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
            />
          </div>

          {/* Full name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              {copy.fullName}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              maxLength={80}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
            />
          </div>

          {/* Phone — read-only */}
          {member.memberPhone && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                {copy.phone}
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500">
                <span className="flex-1">{member.memberPhone}</span>
                <Lock size={12} className="text-slate-300" />
              </div>
            </div>
          )}

          {/* Location */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              {copy.location}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              maxLength={200}
              placeholder={copy.cityDistrict}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              {copy.bio}
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              maxLength={300}
              rows={3}
              placeholder={copy.tellAboutYourself}
              className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/10"
            />
            <p className="mt-1 text-right text-xs text-slate-400">
              {desc.length}/300
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              {copy.cancel}
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
            >
              {saving ? copy.saving : copy.saveChanges}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
