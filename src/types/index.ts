export type CardTemplateType = "bento" | "clean" | "terminal";
export type CardColorType = "indigo" | "cyan" | "emerald" | "amber" | "rose";

export type CardData = {
  badge: string;
  title: string;
  subtitle: string;
  highlights: string[];
  template?: CardTemplateType;
  themeColor?: CardColorType;
  watermark?: boolean;
};

export interface GeneratedPayload {
  changelog: {
    features: string[];
    improvements: string[];
    fixes: string[];
  };
  social_drafts: {
    story: string;
    bullet: string;
    short_hook: string;
  };
  visual_card: CardData;
}

export interface PRSummary {
  owner: string;
  repo: string;
  pullNumber: number;
  title: string;
  body: string;
  author: string;
  labels: string[];
  changedFiles: string[];
  htmlUrl: string;
}

export interface GenerateRequest {
  prUrl: string;
  notes?: string;
  language?: "auto" | "en" | "zh";
}

export interface GenerateResponse {
  success: boolean;
  data?: GeneratedPayload;
  pr?: PRSummary;
  numbersAudit?: {
    unmatchedNumbers: string[];
  };
  error?: string;
}
