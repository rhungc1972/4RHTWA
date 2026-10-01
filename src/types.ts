export interface Form1Entry {
  id: string;
  name: string;
  email: string;
  amount: number;
  timestamp: number;
  meetsMinimum: boolean;
}

export interface Form2Entry {
  id: string;
  name: string;
  email: string;
  tokens: number;
  amount: number;
  m2: number;
  timestamp: number;
}

export interface SurveyEntry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  secondaryEmail?: string;
  company?: string;
  industry?: string;
  location?: string;
  freeNotes?: string;
  ratingQuality: number; // 1 to 5
  ratingClarity: number; // 1 to 5
  npsScore: number; // 1 to 10
  selectedTopics: string[];
  comments?: string;
  timestamp: number;
}

export interface SurveyTopicStat {
  topic: string;
  count: number;
  percentage: number;
}

export interface SurveyAggregated {
  totalResponses: number;
  avgQuality: number;
  avgClarity: number;
  avgNps: number;
  npsScoreIndex: number;
  promoters: number;
  passives: number;
  detractors: number;
  topicsRanking: SurveyTopicStat[];
  recentFeedback: SurveyEntry[];
}

export interface FloorStatus {
  floor: number;
  percent: number;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface AppStateData {
  raw: {
    form1Count: number;
    form2Count: number;
    surveyCount: number;
    recentForm1: Form1Entry[];
    recentForm2: Form2Entry[];
    recentSurvey: SurveyEntry[];
    allForm1?: Form1Entry[];
    allForm2?: Form2Entry[];
    allSurveys?: SurveyEntry[];
  };
  phase1_2: {
    targetCapital: number;
    totalCollected: number;
    collectedPercent: number;
    traditionalCapitalCaptured?: number;
    excludedCapitalBlocked?: number;
    totalOfferedCapital?: number;
    traditionalDeficit?: number;
    respondentsCount: number;
    qualifiedCount: number;
    excludedCount: number;
    exclusionRate: number;
    distribution: {
      tier10k: number;
      tier1k: number;
      tier100: number;
      tier1: number;
    };
    traditionalInvestorsCount: number;
  };
  phase3_4: {
    targetTokens: number;
    targetCapital: number;
    tokensSubscribed: number;
    usdSubscribed: number;
    m2Absorbed: number;
    totalM2Building: number;
    coOwnersCount: number;
    fundingPercent: number;
    floors: FloorStatus[];
  };
  roomStats?: {
    connectedAttendees: number;
    totalResponses: number;
  };
  survey: SurveyAggregated;
  lastUpdated: number;
}

export type AppViewMode =
  | 'presenter'
  | 'remote'
  | 'audience'
  | 'attendee_form1'
  | 'attendee_form2'
  | 'attendee_survey';
