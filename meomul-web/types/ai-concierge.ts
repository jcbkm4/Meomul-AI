import type { HotelLocation, StayPurpose } from "@/types/hotel";

export interface AskStayConciergeInput {
  message: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  budgetMax?: number;
  language?: "en" | "ko";
}

export interface StayIntentDto {
  location?: HotelLocation | null;
  district?: string | null;
  checkIn?: string | null;
  checkOut?: string | null;
  guests?: number | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  purpose?: StayPurpose | null;
  amenities: string[];
  roomPreferences: string[];
  safetyPreferences: string[];
  transportPreferences: string[];
  language: "en" | "ko";
  confidence: number;
}

export interface StayCandidateDto {
  hotelId: string;
  hotelTitle: string;
  roomId?: string | null;
  roomName?: string | null;
  fitScore: number;
  reasons: string[];
  tradeoffs: string[];
  trustSignals: string[];
  priceInsights: string[];
  estimatedPrice?: number | null;
  cheapestDate?: string | null;
  cheapestPrice?: number | null;
}

export interface StayConciergeResultDto {
  provider: string;
  intent: StayIntentDto;
  candidates: StayCandidateDto[];
  clarifyingQuestions: string[];
  summary: string;
  nextAction: string;
}

export interface AskStayConciergeMutationData {
  askStayConcierge: StayConciergeResultDto;
}

export interface AskStayConciergeMutationVars {
  input: AskStayConciergeInput;
}

