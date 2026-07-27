"use client";

import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import {
  Film,
  GripVertical,
  Link2,
  Loader2,
  MoveLeft,
  MoveRight,
  Trash2,
  Upload,
} from "lucide-react";
import { useI18n } from "@/lib/i18n/provider";
import { errorAlert, infoAlert } from "@/lib/ui/alerts";
import { uploadVideoFile } from "@/lib/uploads/upload-video";
import { getErrorMessage } from "@/lib/utils/error";
import { resolveMediaUrl } from "@/lib/utils/media-url";
import { getYouTubeEmbedUrl, isYouTubeUrl } from "@/lib/utils/youtube";

const MAX_VIDEO_SIZE_MB = 50;
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;
const ACCEPTED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
]);

interface VideoCollectionFieldProps {
  value: string[];
  onChange: (next: string[]) => void;
  maxFiles?: number;
  title?: string;
  description?: string;
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
      addVideos: "영상 업로드",
      uploading: "업로드 중...",
      hint: "MP4, MOV, WEBM 파일만 가능하며 최대 50MB입니다.",
      empty: "아직 업로드된 영상이 없습니다.",
      remove: "삭제",
      addYoutube: "YouTube 링크 추가",
      youtubePlaceholder: "https://www.youtube.com/watch?v=...",
      invalidYoutube: "올바른 YouTube 링크를 입력해 주세요.",
      cover: "대표 영상",
      orderHint: "드래그하거나 좌우 버튼으로 순서를 변경하세요.",
      dropHint: "파일을 여기로 드롭해 바로 업로드할 수 있습니다.",
      moveLeft: "왼쪽으로 이동",
      moveRight: "오른쪽으로 이동",
      invalidType: "MP4, MOV, WEBM 영상만 업로드할 수 있습니다.",
      invalidSize: "영상은 최대 50MB까지 업로드할 수 있습니다.",
      uploadFailed: "영상 업로드에 실패했습니다.",
      limitReached: "영상 업로드 개수 제한에 도달했습니다.",
      partialLimit: "일부 영상은 최대 개수 제한으로 업로드되지 않았습니다.",
      videoCount: "개 업로드됨",
    };
  }
  if (locale === "ru") {
    return {
      addVideos: "Загрузить видео",
      uploading: "Загрузка...",
      hint: "Поддерживаются MP4, MOV, WEBM до 50MB.",
      empty: "Видео пока не загружены.",
      remove: "Удалить",
      addYoutube: "Добавить ссылку YouTube",
      youtubePlaceholder: "https://www.youtube.com/watch?v=...",
      invalidYoutube: "Введите корректную ссылку YouTube.",
      cover: "Главное видео",
      orderHint: "Перетаскивайте или меняйте порядок кнопками.",
      dropHint: "Перетащите файлы сюда, чтобы сразу загрузить.",
      moveLeft: "Переместить влево",
      moveRight: "Переместить вправо",
      invalidType: "Можно загружать только MP4, MOV и WEBM видео.",
      invalidSize: "Размер видео не должен превышать 50MB.",
      uploadFailed: "Не удалось загрузить видео.",
      limitReached: "Достигнут лимит количества видео.",
      partialLimit: "Часть видео не была загружена из-за лимита.",
      videoCount: "загружено",
    };
  }
  if (locale === "uz") {
    return {
      addVideos: "Video yuklash",
      uploading: "Yuklanmoqda...",
      hint: "Faqat MP4, MOV, WEBM va 50MB gacha fayllar qo'llanadi.",
      empty: "Hali video yuklanmagan.",
      remove: "O'chirish",
      addYoutube: "YouTube havola qo'shish",
      youtubePlaceholder: "https://www.youtube.com/watch?v=...",
      invalidYoutube: "Yaroqli YouTube havolasini kiriting.",
      cover: "Muqova video",
      orderHint: "Sudrab yoki chap-o'ng tugmalar bilan tartiblang.",
      dropHint: "Fayllarni shu yerga tashlab darhol yuklang.",
      moveLeft: "Chapga surish",
      moveRight: "O'ngga surish",
      invalidType: "Faqat MP4, MOV va WEBM videolar yuklanadi.",
      invalidSize: "Video hajmi 50MB dan oshmasligi kerak.",
      uploadFailed: "Video yuklash muvaffaqiyatsiz tugadi.",
      limitReached: "Video soni limitiga yetildi.",
      partialLimit: "Ba'zi videolar limit sababli yuklanmadi.",
      videoCount: "ta yuklandi",
    };
  }
  return {
    addVideos: "Upload videos",
    uploading: "Uploading...",
    hint: "MP4, MOV, and WEBM only, up to 50MB each.",
    empty: "No videos uploaded yet.",
    remove: "Remove",
    addYoutube: "Add YouTube link",
    youtubePlaceholder: "https://www.youtube.com/watch?v=...",
    invalidYoutube: "Enter a valid YouTube URL.",
    cover: "Primary video",
    orderHint: "Drag to reorder, or use the arrow controls.",
    dropHint: "Drop files here to upload them instantly.",
    moveLeft: "Move left",
    moveRight: "Move right",
    invalidType: "Only MP4, MOV, and WEBM videos are allowed.",
    invalidSize: "Videos must be 50MB or smaller.",
    uploadFailed: "Failed to upload video.",
    limitReached: "You have reached the maximum number of videos.",
    partialLimit: "Some videos were skipped because the upload limit was reached.",
    videoCount: "uploaded",
  };
};

export function VideoCollectionField({
  value,
  onChange,
  maxFiles = 4,
  title,
  description,
}: VideoCollectionFieldProps) {
  const { locale } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const copy = getCopy(locale);
  const videos = value.map((item) => item.trim()).filter(Boolean);
  const remainingSlots = Math.max(0, maxFiles - videos.length);

  const processFiles = async (files: File[]) => {
    if (files.length === 0) return;
    if (remainingSlots === 0) {
      await errorAlert(copy.addVideos, copy.limitReached, {
        variant: "video",
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
        if (!ACCEPTED_VIDEO_TYPES.has(file.type)) {
          sawInvalidType = true;
          continue;
        }
        if (file.size > MAX_VIDEO_SIZE_BYTES) {
          sawInvalidSize = true;
          continue;
        }

        const url = await uploadVideoFile(file, "hotel");
        uploaded.push(url);
      }

      if (uploaded.length > 0) {
        onChange([...videos, ...uploaded]);
      }
      if (sawInvalidType || sawInvalidSize) {
        const message = sawInvalidType && sawInvalidSize
          ? `${copy.invalidType} ${copy.invalidSize}`
          : sawInvalidType
            ? copy.invalidType
            : copy.invalidSize;
        await errorAlert(copy.addVideos, message, {
          variant: "video",
        });
      }
      if (didSkipForLimit) {
        await infoAlert(copy.addVideos, copy.partialLimit, {
          variant: "video",
        });
      }
    } catch (error) {
      await errorAlert(copy.addVideos, getErrorMessage(error) || copy.uploadFailed, {
        variant: "video",
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
    onChange(videos.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleAddYoutube = () => {
    const trimmed = youtubeUrl.trim();
    if (!trimmed) {
      return;
    }
    if (remainingSlots === 0) {
      void errorAlert(copy.addVideos, copy.limitReached, {
        variant: "video",
      });
      return;
    }
    if (!isYouTubeUrl(trimmed) || !getYouTubeEmbedUrl(trimmed)) {
      void errorAlert(copy.addVideos, copy.invalidYoutube, {
        variant: "video",
      });
      return;
    }
    onChange([...videos, trimmed]);
    setYoutubeUrl("");
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= videos.length) {
      return;
    }
    onChange(moveItem(videos, fromIndex, toIndex));
  };

  const onCardDragStart = (index: number) => setDraggedIndex(index);
  const onCardDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };
  const onCardDrop = (targetIndex: number) => {
    if (draggedIndex == null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }
    onChange(moveItem(videos, draggedIndex, targetIndex));
    setDraggedIndex(null);
  };
  const onCardDragEnd = () => setDraggedIndex(null);

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
          dropActive ? "border-slate-900 ring-2 ring-slate-200" : "border-slate-200"
        }`}
        onDragOver={onUploadDragOver}
        onDragLeave={onUploadDragLeave}
        onDrop={(event) => {
          void onUploadDrop(event);
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {title ? `${videos.length}/${maxFiles} ${copy.videoCount}` : (description ?? copy.hint)}
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading || remainingSlots === 0}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            {uploading ? copy.uploading : copy.addVideos}
          </button>
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={youtubeUrl}
              onChange={(event) => setYoutubeUrl(event.target.value)}
              placeholder={copy.youtubePlaceholder}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            />
          </div>
          <button
            type="button"
            onClick={handleAddYoutube}
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
          >
            {copy.addYoutube}
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          multiple
          className="hidden"
          onChange={(event) => {
            void handleSelect(event);
          }}
        />

        {videos.length === 0 ? (
          <div
            className={`mt-3 rounded-xl border border-dashed bg-white/80 px-4 py-8 text-center text-sm transition ${
              dropActive ? "border-slate-900 text-slate-900" : "border-slate-300 text-slate-500"
            }`}
          >
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <Film size={18} />
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
              {copy.orderHint}
            </p>
            <div className="grid gap-3">
              {videos.map((video, index) => (
                <div
                  key={`${video}-${index}`}
                  draggable
                  onDragStart={() => onCardDragStart(index)}
                  onDragOver={onCardDragOver}
                  onDrop={() => onCardDrop(index)}
                  onDragEnd={onCardDragEnd}
                  className={`overflow-hidden rounded-2xl border bg-white transition ${
                    draggedIndex === index ? "border-slate-900 shadow-md opacity-80" : "border-slate-200"
                  }`}
                >
                  <div className="grid gap-3 p-3 sm:grid-cols-[220px_1fr]">
                    <div className="relative overflow-hidden rounded-xl bg-slate-100">
                      {getYouTubeEmbedUrl(video) ? (
                        <iframe
                          src={getYouTubeEmbedUrl(video)}
                          title={`YouTube video ${index + 1}`}
                          allow="autoplay; encrypted-media; picture-in-picture"
                          allowFullScreen
                          className="aspect-video w-full border-0"
                        />
                      ) : (
                        <video
                          src={resolveMediaUrl(video)}
                          controls
                          muted
                          playsInline
                          preload="metadata"
                          className="aspect-video w-full object-cover"
                        />
                      )}
                      <div className="pointer-events-none absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                        <GripVertical size={10} />
                        {index === 0 ? copy.cover : `#${index + 1}`}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium text-slate-700">
                          hotel video {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemove(index)}
                          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                        >
                          <Trash2 size={12} />
                          {copy.remove}
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleMove(index, index - 1)}
                          disabled={index === 0}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <MoveLeft size={11} />
                          {copy.moveLeft}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(index, index + 1)}
                          disabled={index === videos.length - 1}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <MoveRight size={11} />
                          {copy.moveRight}
                        </button>
                      </div>
                      <p className="truncate text-xs text-slate-400">
                        {getYouTubeEmbedUrl(video) ? video : resolveMediaUrl(video)}
                      </p>
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
