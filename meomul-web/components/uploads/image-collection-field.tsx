"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { GripVertical, ImagePlus, Loader2, MoveLeft, MoveRight, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { errorAlert, infoAlert } from "@/lib/ui/alerts";
import { uploadImageFile } from "@/lib/uploads/upload-image";
import type { UploadImageTarget } from "@/lib/uploads/upload-image";
import { getErrorMessage } from "@/lib/utils/error";
import { resolveMediaUrl } from "@/lib/utils/media-url";

const MAX_IMAGE_SIZE_MB = 5;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

interface ImageCollectionFieldProps {
  target: UploadImageTarget;
  value: string[];
  onChange: (next: string[]) => void;
  maxFiles?: number;
  title?: string;
  description?: string;
  layout?: "default" | "compact";
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex) {
    return items;
  }

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

const getCopy = (locale: string) => {
  if (locale === "ko") {
    return {
      addImages: "이미지 업로드",
      uploading: "업로드 중...",
      hint: "JPG, PNG, WEBP 파일만 가능하며 최대 5MB입니다.",
      empty: "아직 업로드된 이미지가 없습니다.",
      remove: "삭제",
      cover: "대표 이미지",
      dragHint: "드래그하거나 좌우 버튼으로 순서를 변경하세요.",
      dropHint: "파일을 여기로 드롭해 바로 업로드할 수 있습니다.",
      moveLeft: "왼쪽으로 이동",
      moveRight: "오른쪽으로 이동",
      invalidType: "JPG, PNG, WEBP 이미지만 업로드할 수 있습니다.",
      invalidSize: "이미지는 최대 5MB까지 업로드할 수 있습니다.",
      uploadFailed: "이미지 업로드에 실패했습니다.",
      limitReached: "이미지 업로드 개수 제한에 도달했습니다.",
      partialLimit: "일부 이미지는 최대 개수 제한으로 업로드되지 않았습니다.",
      imageCount: "장 업로드됨",
    };
  }
  if (locale === "ru") {
    return {
      addImages: "Загрузить изображения",
      uploading: "Загрузка...",
      hint: "Поддерживаются JPG, PNG, WEBP до 5MB.",
      empty: "Изображения пока не загружены.",
      remove: "Удалить",
      cover: "Обложка",
      dragHint: "Перетаскивайте или меняйте порядок кнопками.",
      dropHint: "Перетащите файлы сюда, чтобы сразу загрузить.",
      moveLeft: "Переместить влево",
      moveRight: "Переместить вправо",
      invalidType: "Можно загружать только JPG, PNG и WEBP изображения.",
      invalidSize: "Размер изображения не должен превышать 5MB.",
      uploadFailed: "Не удалось загрузить изображение.",
      limitReached: "Достигнут лимит количества изображений.",
      partialLimit: "Часть изображений не была загружена из-за лимита.",
      imageCount: "загружено",
    };
  }
  if (locale === "uz") {
    return {
      addImages: "Rasm yuklash",
      uploading: "Yuklanmoqda...",
      hint: "Faqat JPG, PNG, WEBP va 5MB gacha fayllar qo'llanadi.",
      empty: "Hali rasm yuklanmagan.",
      remove: "O'chirish",
      cover: "Muqova rasmi",
      dragHint: "Sudrab yoki chap-o'ng tugmalar bilan tartiblang.",
      dropHint: "Fayllarni shu yerga tashlab darhol yuklang.",
      moveLeft: "Chapga surish",
      moveRight: "O'ngga surish",
      invalidType: "Faqat JPG, PNG va WEBP rasmlar yuklanadi.",
      invalidSize: "Rasm hajmi 5MB dan oshmasligi kerak.",
      uploadFailed: "Rasm yuklash muvaffaqiyatsiz tugadi.",
      limitReached: "Rasm soni limitiga yetildi.",
      partialLimit: "Ba'zi rasmlar limit sababli yuklanmadi.",
      imageCount: "ta yuklandi",
    };
  }
  return {
    addImages: "Upload images",
    uploading: "Uploading...",
    hint: "JPG, PNG, and WEBP only, up to 5MB each.",
    empty: "No images uploaded yet.",
    remove: "Remove",
    cover: "Cover image",
    dragHint: "Drag to reorder, or use the arrow controls.",
    dropHint: "Drop files here to upload them instantly.",
    moveLeft: "Move left",
    moveRight: "Move right",
    invalidType: "Only JPG, PNG, and WEBP images are allowed.",
    invalidSize: "Images must be 5MB or smaller.",
    uploadFailed: "Failed to upload image.",
    limitReached: "You have reached the maximum number of images.",
    partialLimit: "Some images were skipped because the upload limit was reached.",
    imageCount: "uploaded",
  };
};

export function ImageCollectionField({
  target,
  value,
  onChange,
  maxFiles = 10,
  title,
  description,
  layout = "default",
}: ImageCollectionFieldProps) {
  const { locale } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const copy = getCopy(locale);
  const images = value.map((item) => item.trim()).filter(Boolean);

  const remainingSlots = Math.max(0, maxFiles - images.length);
  const isCompact = layout === "compact";

  const processFiles = async (files: File[]) => {
    if (files.length === 0) {
      return;
    }
    if (remainingSlots === 0) {
      await errorAlert(copy.addImages, copy.limitReached, {
        variant: "image",
      });
      return;
    }

    let didSkipForLimit = false;
    let sawInvalidType = false;
    let sawInvalidSize = false;
    const nextFiles = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      didSkipForLimit = true;
    }

    setUploading(true);
    try {
      const uploaded: string[] = [];

      for (const file of nextFiles) {
        if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
          sawInvalidType = true;
          continue;
        }
        if (file.size > MAX_IMAGE_SIZE_BYTES) {
          sawInvalidSize = true;
          continue;
        }

        const url = await uploadImageFile(file, target);
        uploaded.push(url);
      }

      if (uploaded.length > 0) {
        onChange([...images, ...uploaded]);
      }
      if (sawInvalidType || sawInvalidSize) {
        const message = sawInvalidType && sawInvalidSize
          ? `${copy.invalidType} ${copy.invalidSize}`
          : sawInvalidType
            ? copy.invalidType
            : copy.invalidSize;
        await errorAlert(copy.addImages, message, {
          variant: "image",
        });
      }
      if (didSkipForLimit) {
        await infoAlert(copy.addImages, copy.partialLimit, {
          variant: "image",
        });
      }
    } catch (error) {
      await errorAlert(copy.addImages, getErrorMessage(error) || copy.uploadFailed, {
        variant: "image",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    await processFiles(files);
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) {
      return;
    }
    onChange(moveItem(images, fromIndex, toIndex));
  };

  const onDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const onDrop = (targetIndex: number) => {
    if (draggedIndex == null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }

    onChange(moveItem(images, draggedIndex, targetIndex));
    setDraggedIndex(null);
  };

  const onDragEnd = () => {
    setDraggedIndex(null);
  };

  const onUploadDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (event.dataTransfer.types.includes("Files")) {
      event.preventDefault();
      setDropActive(true);
    }
  };

  const onUploadDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
      return;
    }
    setDropActive(false);
  };

  const onUploadDrop = async (event: DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes("Files")) {
      return;
    }

    event.preventDefault();
    setDropActive(false);
    const files = Array.from(event.dataTransfer.files ?? []);
    await processFiles(files);
  };

  return (
    <div className="space-y-3">
      {title ? (
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-700">{title}</p>
          <p className="text-xs text-slate-500">{description ?? copy.hint}</p>
        </div>
      ) : null}

      <div
        className={`rounded-2xl border bg-slate-50/60 p-3 transition ${
          dropActive
            ? "border-slate-900 ring-2 ring-slate-200"
            : "border-slate-200"
        }`}
        onDragOver={onUploadDragOver}
        onDragLeave={onUploadDragLeave}
        onDrop={(event) => {
          void onUploadDrop(event);
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {title
              ? `${images.length}/${maxFiles} ${copy.imageCount}`
              : (description ?? copy.hint)}
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || remainingSlots === 0}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <ImagePlus size={15} />
            )}
            {uploading ? copy.uploading : copy.addImages}
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(event) => {
            void handleSelect(event);
          }}
        />

        {images.length === 0 ? (
          <div
            className={`mt-3 rounded-xl border border-dashed bg-white/80 px-4 py-8 text-center text-sm transition ${
              dropActive
                ? "border-slate-900 text-slate-900"
                : "border-slate-300 text-slate-500"
            }`}
          >
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <ImagePlus size={18} />
            </div>
            <p className="mt-3 font-medium">{copy.empty}</p>
            <p className="mt-1 text-xs text-slate-400">{copy.dropHint}</p>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
              {copy.dropHint}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-400">
              {copy.dragHint}
            </p>
            <div className={`grid gap-3 ${isCompact ? "grid-cols-3 sm:grid-cols-4 xl:grid-cols-5" : "grid-cols-2 sm:grid-cols-3"}`}>
            {images.map((image, index) => (
              <div
                key={`${image}-${index}`}
                draggable
                onDragStart={() => onDragStart(index)}
                onDragOver={onDragOver}
                onDrop={() => onDrop(index)}
                onDragEnd={onDragEnd}
                className={`group overflow-hidden rounded-2xl border bg-white transition ${
                  draggedIndex === index
                    ? "border-slate-900 shadow-md opacity-75"
                    : "border-slate-200"
                }`}
              >
                <div className={`relative bg-slate-100 ${isCompact ? "aspect-square" : "aspect-[4/3]"}`}>
                  <Image
                    src={resolveMediaUrl(image)}
                    alt={`Uploaded ${target} image ${index + 1}`}
                    fill
                    unoptimized
                    className="object-cover transition duration-300 group-hover:scale-[1.02]"
                    sizes={isCompact ? "(min-width: 1280px) 12vw, (min-width: 640px) 18vw, 28vw" : "(min-width: 640px) 220px, 44vw"}
                  />
                  <div className="pointer-events-none absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                    <GripVertical size={10} />
                    {index === 0 ? copy.cover : `${index + 1}`}
                  </div>
                </div>
                <div className={`space-y-2 ${isCompact ? "px-2.5 py-2" : "px-3 py-2"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-medium text-slate-500">
                      {target} {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className={`inline-flex items-center gap-1 rounded-full text-rose-600 transition hover:bg-rose-50 ${isCompact ? "px-1.5 py-1 text-[11px]" : "px-2 py-1 text-xs"} `}
                    >
                      <Trash2 size={12} />
                      {!isCompact ? copy.remove : null}
                    </button>
                  </div>
                  <div className={`flex items-center gap-2 ${isCompact ? "justify-between" : ""}`}>
                    <button
                      type="button"
                      onClick={() => handleMove(index, index - 1)}
                      disabled={index === 0}
                      className={`inline-flex items-center gap-1 rounded-full border font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${isCompact ? "border-stone-950 px-3 py-2 text-xs text-stone-950 hover:bg-stone-100" : "border-slate-200 px-2.5 py-1 text-[11px] text-slate-600 hover:border-slate-300 hover:bg-slate-50"}`}
                    >
                      <MoveLeft size={isCompact ? 18 : 11} />
                      {!isCompact ? copy.moveLeft : null}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(index, index + 1)}
                      disabled={index === images.length - 1}
                      className={`inline-flex items-center gap-1 rounded-full border font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${isCompact ? "border-stone-950 px-3 py-2 text-xs text-stone-950 hover:bg-stone-100" : "border-slate-200 px-2.5 py-1 text-[11px] text-slate-600 hover:border-slate-300 hover:bg-slate-50"}`}
                    >
                      <MoveRight size={isCompact ? 18 : 11} />
                      {!isCompact ? copy.moveRight : null}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>
        )}
      </div>
    </div>
  );
}
