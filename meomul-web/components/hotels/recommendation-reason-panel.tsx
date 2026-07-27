import { memo } from "react";
import type { RecommendationExplanationDto } from "@/types/hotel";

interface RecommendationReasonPanelProps {
  explanation?: RecommendationExplanationDto | null;
  compact?: boolean;
}

const getRecommendationStageLabel = (explanation: RecommendationExplanationDto): string => {
  if (explanation.fromFallback) {
    return "Alternative match";
  }

  switch (explanation.stage) {
    case "strict":
      return "Top match";
    case "relaxed":
      return "Good match";
    case "general":
      return "Based on your activity";
    case "trending":
      return "Trending now";
    default:
      return "Recommended";
  }
};

export const RecommendationReasonPanel = memo(function RecommendationReasonPanel({
  explanation,
  compact = false,
}: RecommendationReasonPanelProps) {
  if (!explanation) {
    return null;
  }

  const primarySignal = explanation.signals[0];
  const fallbackSignal = getRecommendationStageLabel(explanation);
  const summaryText = primarySignal ?? fallbackSignal;

  return (
    <div
      className={`rounded-2xl border border-stone-100 bg-stone-50/60 ${
        compact ? "px-3 py-2.5" : "px-4 py-3"
      }`}
    >
      <p className={`${compact ? "text-[11px]" : "text-xs"} leading-5 text-slate-500/90`}>{summaryText}</p>
    </div>
  );
});
