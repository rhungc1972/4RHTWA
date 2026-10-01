import { useEffect, useState, useCallback } from 'react';
import { AppStateData } from '../types';
import {
  db,
  OperationType,
  handleFirestoreError,
  testConnection,
} from './firebase';
import {
  doc,
  collection,
  onSnapshot,
  setDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';

export const INITIAL_STATE: AppStateData = {
  raw: {
    form1Count: 0,
    form2Count: 0,
    surveyCount: 0,
    recentForm1: [],
    recentForm2: [],
    recentSurvey: [],
    allForm1: [],
    allForm2: [],
    allSurveys: [],
  },
  phase1_2: {
    targetCapital: 1000000,
    totalCollected: 0,
    collectedPercent: 0,
    traditionalCapitalCaptured: 0,
    excludedCapitalBlocked: 0,
    totalOfferedCapital: 0,
    traditionalDeficit: 1000000,
    respondentsCount: 0,
    qualifiedCount: 0,
    excludedCount: 0,
    exclusionRate: 0,
    distribution: {
      tier10k: 0,
      tier1k: 0,
      tier100: 0,
      tier1: 0,
    },
    traditionalInvestorsCount: 0,
  },
  phase3_4: {
    targetTokens: 100000,
    targetCapital: 1000000,
    tokensSubscribed: 0,
    usdSubscribed: 0,
    m2Absorbed: 0,
    totalM2Building: 1000,
    coOwnersCount: 0,
    fundingPercent: 0,
    floors: Array.from({ length: 10 }, (_, i) => ({
      floor: i + 1,
      percent: 0,
      isCompleted: false,
      isCurrent: false,
    })),
  },
  survey: {
    totalResponses: 0,
    avgQuality: 0,
    avgClarity: 0,
    avgNps: 0,
    npsScoreIndex: 0,
    promoters: 0,
    passives: 0,
    detractors: 0,
    topicsRanking: [],
    recentFeedback: [],
  },
  lastUpdated: Date.now(),
};

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
  ratingQuality: number;
  ratingClarity: number;
  npsScore: number;
  selectedTopics: string[];
  comments?: string;
  timestamp: number;
}

export interface RawAppState {
  form1: Form1Entry[];
  form2: Form2Entry[];
  surveys: SurveyEntry[];
  lastUpdated: number;
}

const LOCAL_STORAGE_KEY = 'rh_rwa_persisted_state_v1';
const SESSION_DOC_ID = 'rwa_live';

const TOPIC_CATALOG = [
  'Contratos Inteligentes & Derecho Notarial / Registral',
  'Tokenización de Créditos Privados & Deuda Corporativa',
  'Marco Regulatorio & Fiscalidad Cripto en Iberoamérica',
  'Vehículos Societarios, SPV y Fideicomisos para RWA',
  'Gobernanza Descentralizada (DAO) y Derecho Corporativo',
];

// BroadcastChannel for instant same-browser / multi-tab acceleration
const broadcastChannel: BroadcastChannel | null =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('rh_rwa_live_channel')
    : null;

// Dedicated remote channel for instantaneous low-latency thumb navigation on same machine
const remoteBroadcastChannel: BroadcastChannel | null =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('rh_rwa_remote_controller_channel')
    : null;

// Local persistent store accessor
export function getLocalRawState(): RawAppState {
  if (typeof window === 'undefined') {
    return { form1: [], form2: [], surveys: [], lastUpdated: Date.now() };
  }
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        form1: Array.isArray(parsed.form1) ? parsed.form1 : [],
        form2: Array.isArray(parsed.form2) ? parsed.form2 : [],
        surveys: Array.isArray(parsed.surveys) ? parsed.surveys : [],
        lastUpdated: parsed.lastUpdated || Date.now(),
      };
    }
  } catch (err) {
    console.warn('Error reading from localStorage:', err);
  }
  return { form1: [], form2: [], surveys: [], lastUpdated: Date.now() };
}

export function saveLocalRawState(rawState: RawAppState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rawState));
  } catch (err) {
    console.warn('Error writing to localStorage:', err);
  }
}

export function computeAppState(state: RawAppState): AppStateData {
  const TARGET_CAPITAL = 1_000_000;
  const TARGET_TOKENS = 100_000;
  const MIN_TICKET = 10_000;

  // Form 1 computations
  const f1Count = state.form1.length;
  const f1Total = state.form1.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const qualifiedCount = state.form1.filter((i) => (Number(i.amount) || 0) >= MIN_TICKET).length;
  const excludedCount = state.form1.filter((i) => (Number(i.amount) || 0) < MIN_TICKET).length;
  const exclusionRate = f1Count > 0 ? (excludedCount / f1Count) * 100 : 0;
  const traditionalCapitalCaptured = state.form1
    .filter((i) => (Number(i.amount) || 0) >= MIN_TICKET)
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const excludedCapitalBlocked = state.form1
    .filter((i) => (Number(i.amount) || 0) < MIN_TICKET)
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalOfferedCapital = f1Total;
  const traditionalDeficit = Math.max(0, TARGET_CAPITAL - traditionalCapitalCaptured);
  const collectedPercent = +((traditionalCapitalCaptured / TARGET_CAPITAL) * 100).toFixed(2);

  const distribution = {
    tier10k: state.form1.filter((i) => (Number(i.amount) || 0) >= 10000).length,
    tier1k: state.form1.filter((i) => (Number(i.amount) || 0) >= 1000 && (Number(i.amount) || 0) < 10000).length,
    tier100: state.form1.filter((i) => (Number(i.amount) || 0) >= 100 && (Number(i.amount) || 0) < 1000).length,
    tier1: state.form1.filter((i) => (Number(i.amount) || 0) < 100).length,
  };

  // Form 2 computations
  const f2Tokens = state.form2.reduce((sum, item) => sum + (Number(item.tokens) || 0), 0);
  const f2Usd = f2Tokens * 10;
  const f2M2 = +(f2Tokens / 100).toFixed(2);
  const uniqueCoOwners = new Set(
    state.form2.map((i) => (i.email ? i.email.toLowerCase().trim() : i.id))
  ).size;
  const fundingPercent = +((f2Tokens / TARGET_TOKENS) * 100).toFixed(2);

  // 10 floors calculation
  const floors = Array.from({ length: 10 }, (_, idx) => {
    const floorNumber = idx + 1;
    const tokensRequiredStart = idx * 10_000;
    const tokensRequiredEnd = (idx + 1) * 10_000;
    let percent = 0;
    if (f2Tokens >= tokensRequiredEnd) {
      percent = 100;
    } else if (f2Tokens > tokensRequiredStart) {
      percent = +(((f2Tokens - tokensRequiredStart) / 10_000) * 100).toFixed(1);
    }
    return {
      floor: floorNumber,
      percent,
      isCompleted: percent >= 100,
      isCurrent: percent > 0 && percent < 100,
    };
  });

  // Survey computations
  const totalSurveys = state.surveys.length;
  const avgQuality =
    totalSurveys > 0
      ? +(state.surveys.reduce((s, item) => s + (item.ratingQuality || 5), 0) / totalSurveys).toFixed(2)
      : 0;
  const avgClarity =
    totalSurveys > 0
      ? +(state.surveys.reduce((s, item) => s + (item.ratingClarity || 5), 0) / totalSurveys).toFixed(2)
      : 0;
  const avgNps =
    totalSurveys > 0
      ? +(state.surveys.reduce((s, item) => s + (item.npsScore || 10), 0) / totalSurveys).toFixed(1)
      : 0;

  const promoters = state.surveys.filter((s) => s.npsScore >= 9).length;
  const passives = state.surveys.filter((s) => s.npsScore >= 7 && s.npsScore <= 8).length;
  const detractors = state.surveys.filter((s) => s.npsScore <= 6).length;
  const npsScoreIndex =
    totalSurveys > 0 ? Math.round(((promoters - detractors) / totalSurveys) * 100) : 0;

  const topicCounts: Record<string, number> = {};
  TOPIC_CATALOG.forEach((t) => (topicCounts[t] = 0));

  state.surveys.forEach((entry) => {
    if (Array.isArray(entry.selectedTopics)) {
      entry.selectedTopics.forEach((topic) => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      });
    }
  });

  const topicsRanking = Object.entries(topicCounts)
    .map(([topic, count]) => ({
      topic,
      count,
      percentage: totalSurveys > 0 ? Math.round((count / totalSurveys) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    raw: {
      form1Count: f1Count,
      form2Count: state.form2.length,
      surveyCount: totalSurveys,
      recentForm1: state.form1.slice(-15).reverse(),
      recentForm2: state.form2.slice(-15).reverse(),
      recentSurvey: state.surveys.slice(-15).reverse(),
      allForm1: state.form1,
      allForm2: state.form2,
      allSurveys: state.surveys,
    },
    phase1_2: {
      targetCapital: TARGET_CAPITAL,
      totalCollected: traditionalCapitalCaptured,
      collectedPercent,
      traditionalCapitalCaptured,
      excludedCapitalBlocked,
      totalOfferedCapital,
      traditionalDeficit,
      respondentsCount: f1Count,
      qualifiedCount,
      excludedCount,
      exclusionRate: +exclusionRate.toFixed(1),
      distribution,
      traditionalInvestorsCount: qualifiedCount,
    },
    roomStats: {
      connectedAttendees: Math.max(1, Math.max(f1Count, state.form2.length, totalSurveys, 1)),
      totalResponses: f1Count + state.form2.length + totalSurveys,
    },
    phase3_4: {
      targetTokens: TARGET_TOKENS,
      targetCapital: TARGET_CAPITAL,
      tokensSubscribed: f2Tokens,
      usdSubscribed: f2Usd,
      m2Absorbed: f2M2,
      totalM2Building: 1000,
      coOwnersCount: uniqueCoOwners,
      fundingPercent,
      floors,
    },
    survey: {
      totalResponses: totalSurveys,
      avgQuality,
      avgClarity,
      avgNps,
      npsScoreIndex,
      promoters,
      passives,
      detractors,
      topicsRanking,
      recentFeedback: state.surveys
        .slice(-30)
        .reverse(),
    },
    lastUpdated: state.lastUpdated,
  };
}

export function publishEvent(eventPayload: { type: string; data: unknown }) {
  try {
    broadcastChannel?.postMessage(eventPayload);
  } catch (err) {
    console.warn('BroadcastChannel error:', err);
  }
}

// Universal Hook that synchronizes state from Firebase Firestore with instant offline cache
export function useRealtimeState() {
  const [state, setState] = useState<AppStateData>(() => {
    return computeAppState(getLocalRawState());
  });
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  const applyRawUpdate = useCallback((updater: (prev: RawAppState) => RawAppState) => {
    const current = getLocalRawState();
    const next = updater(current);
    saveLocalRawState(next);
    const computed = computeAppState(next);
    setState(computed);
    setLastSyncTime(new Date());
    return computed;
  }, []);

  const refresh = useCallback(async () => {
    try {
      const f1Snap = await getDocs(collection(db, 'sessions', SESSION_DOC_ID, 'form1_submissions'));
      const f2Snap = await getDocs(collection(db, 'sessions', SESSION_DOC_ID, 'form2_submissions'));
      const survSnap = await getDocs(collection(db, 'sessions', SESSION_DOC_ID, 'survey_submissions'));

      const form1: Form1Entry[] = [];
      const form2: Form2Entry[] = [];
      const surveys: SurveyEntry[] = [];

      f1Snap.forEach((d) => form1.push(d.data() as Form1Entry));
      f2Snap.forEach((d) => form2.push(d.data() as Form2Entry));
      survSnap.forEach((d) => surveys.push(d.data() as SurveyEntry));

      const updatedRaw: RawAppState = {
        form1,
        form2,
        surveys,
        lastUpdated: Date.now(),
      };
      saveLocalRawState(updatedRaw);
      setState(computeAppState(updatedRaw));
      setLastSyncTime(new Date());
      setIsConnected(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, `sessions/${SESSION_DOC_ID}`);
    }
  }, []);

  useEffect(() => {
    testConnection();

    // In-memory collections accumulator
    let currentF1: Form1Entry[] = [];
    let currentF2: Form2Entry[] = [];
    let currentSurv: SurveyEntry[] = [];
    let currentResetTs = 0;

    const syncCombinedState = () => {
      const filteredF1 = currentF1.filter((e) => (e.timestamp || 0) >= currentResetTs);
      const filteredF2 = currentF2.filter((e) => (e.timestamp || 0) >= currentResetTs);
      const filteredSurv = currentSurv.filter((e) => (e.timestamp || 0) >= currentResetTs);

      const nextRaw: RawAppState = {
        form1: filteredF1,
        form2: filteredF2,
        surveys: filteredSurv,
        lastUpdated: Date.now(),
      };
      saveLocalRawState(nextRaw);
      setState(computeAppState(nextRaw));
      setLastSyncTime(new Date());
      setIsConnected(true);
    };

    // 1. Listen to Session metadata (reset timestamp)
    const sessionDocRef = doc(db, 'sessions', SESSION_DOC_ID);
    const unsubSession = onSnapshot(
      sessionDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (typeof data.lastResetTimestamp === 'number') {
            currentResetTs = data.lastResetTimestamp;
            syncCombinedState();
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `sessions/${SESSION_DOC_ID}`);
      }
    );

    // 2. Listen to Form 1 Submissions in Firestore
    const f1ColRef = collection(db, 'sessions', SESSION_DOC_ID, 'form1_submissions');
    const unsubF1 = onSnapshot(
      f1ColRef,
      (snapshot) => {
        const items: Form1Entry[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as Form1Entry);
        });
        currentF1 = items;
        syncCombinedState();
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `sessions/${SESSION_DOC_ID}/form1_submissions`);
      }
    );

    // 3. Listen to Form 2 Submissions in Firestore
    const f2ColRef = collection(db, 'sessions', SESSION_DOC_ID, 'form2_submissions');
    const unsubF2 = onSnapshot(
      f2ColRef,
      (snapshot) => {
        const items: Form2Entry[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as Form2Entry);
        });
        currentF2 = items;
        syncCombinedState();
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `sessions/${SESSION_DOC_ID}/form2_submissions`);
      }
    );

    // 4. Listen to Survey Submissions in Firestore
    const survColRef = collection(db, 'sessions', SESSION_DOC_ID, 'survey_submissions');
    const unsubSurv = onSnapshot(
      survColRef,
      (snapshot) => {
        const items: SurveyEntry[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as SurveyEntry);
        });
        currentSurv = items;
        syncCombinedState();
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `sessions/${SESSION_DOC_ID}/survey_submissions`);
      }
    );

    // BroadcastChannel listener for local instantaneous multi-tab updates
    const handleBroadcastMessage = (event: MessageEvent) => {
      const payload = event.data;
      if (!payload || !payload.type) return;

      if (payload.type === 'FORM1') {
        const entry = payload.data as Form1Entry;
        applyRawUpdate((prev) => {
          if (prev.form1.some((e) => e.id === entry.id)) return prev;
          return { ...prev, form1: [...prev.form1, entry], lastUpdated: Date.now() };
        });
      } else if (payload.type === 'FORM2') {
        const entry = payload.data as Form2Entry;
        applyRawUpdate((prev) => {
          if (prev.form2.some((e) => e.id === entry.id)) return prev;
          return { ...prev, form2: [...prev.form2, entry], lastUpdated: Date.now() };
        });
      } else if (payload.type === 'SURVEY') {
        const entry = payload.data as SurveyEntry;
        applyRawUpdate((prev) => {
          if (prev.surveys.some((e) => e.id === entry.id)) return prev;
          return { ...prev, surveys: [...prev.surveys, entry], lastUpdated: Date.now() };
        });
      } else if (payload.type === 'RESET') {
        const cleanState: RawAppState = { form1: [], form2: [], surveys: [], lastUpdated: Date.now() };
        saveLocalRawState(cleanState);
        setState(INITIAL_STATE);
      }
    };

    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', handleBroadcastMessage);
    }

    const handleLocalReset = () => {
      const cleanState: RawAppState = { form1: [], form2: [], surveys: [], lastUpdated: Date.now() };
      saveLocalRawState(cleanState);
      setState(INITIAL_STATE);
      setLastSyncTime(new Date());
    };
    window.addEventListener('rwa_state_reset', handleLocalReset);

    return () => {
      unsubSession();
      unsubF1();
      unsubF2();
      unsubSurv();
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handleBroadcastMessage);
      }
      window.removeEventListener('rwa_state_reset', handleLocalReset);
    };
  }, [applyRawUpdate]);

  return { state, isConnected, lastSyncTime, refresh };
}

export interface RemoteCommandPayload {
  command: 'prev' | 'next' | 'scrollUp' | 'scrollDown' | 'setPhase' | 'scrollTop';
  value?: number;
  timestamp: number;
}

export async function sendRemoteCommand(command: RemoteCommandPayload['command'], value?: number) {
  const payload: RemoteCommandPayload = {
    command,
    value,
    timestamp: Date.now(),
  };

  // 1. BroadcastChannel (0ms latency for same-browser tabs)
  try {
    remoteBroadcastChannel?.postMessage(payload);
  } catch {}

  // 2. LocalStorage trigger
  try {
    localStorage.setItem('rh_rwa_remote_cmd', JSON.stringify({ ...payload, _rand: Math.random() }));
  } catch {}

  // 3. In-window dispatch for immediate local reaction
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('rwa_remote_cmd', { detail: payload }));
  }

  // 4. Firestore real-time session update (<100ms cross-device to Netlify projector)
  try {
    const sessionDocRef = doc(db, 'sessions', SESSION_DOC_ID);
    await setDoc(
      sessionDocRef,
      {
        phase: command === 'setPhase' && typeof value === 'number' ? value : 1,
        command,
        commandValue: typeof value === 'number' ? value : null,
        commandTimestamp: payload.timestamp,
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `sessions/${SESSION_DOC_ID}`);
  }
}

export function useRemoteCommands(
  onCommand: (command: RemoteCommandPayload['command'], value?: number) => void
) {
  useEffect(() => {
    const processedCommands = new Set<string>();

    const handleCommand = (payload: RemoteCommandPayload) => {
      if (!payload || !payload.command) return;
      const key = `${payload.command}_${payload.value ?? ''}_${payload.timestamp}`;
      if (processedCommands.has(key)) return;
      processedCommands.add(key);

      if (processedCommands.size > 80) {
        const first = processedCommands.values().next().value;
        if (first) processedCommands.delete(first);
      }

      onCommand(payload.command, payload.value);
    };

    // 1. Local BroadcastChannel listener (0ms same machine)
    const handleBcMessage = (event: MessageEvent) => {
      if (event.data && event.data.command) {
        handleCommand(event.data);
      }
    };

    // 2. Storage event listener (same origin tabs)
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'rh_rwa_remote_cmd' && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          handleCommand(parsed);
        } catch {}
      }
    };

    // 3. Custom window event listener
    const handleWindowEvent = (e: Event) => {
      const custom = e as CustomEvent<RemoteCommandPayload>;
      if (custom.detail) {
        handleCommand(custom.detail);
      }
    };

    if (remoteBroadcastChannel) {
      remoteBroadcastChannel.addEventListener('message', handleBcMessage);
    }
    window.addEventListener('storage', handleStorage);
    window.addEventListener('rwa_remote_cmd', handleWindowEvent);

    // 4. Firestore real-time listener for remote controller commands across mobile 4G -> proyector Netlify
    const sessionDocRef = doc(db, 'sessions', SESSION_DOC_ID);
    const unsubDoc = onSnapshot(
      sessionDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && data.command && data.commandTimestamp) {
            handleCommand({
              command: data.command,
              value: data.commandValue ?? undefined,
              timestamp: data.commandTimestamp,
            });
          }
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `sessions/${SESSION_DOC_ID}`);
      }
    );

    return () => {
      if (remoteBroadcastChannel) {
        remoteBroadcastChannel.removeEventListener('message', handleBcMessage);
      }
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('rwa_remote_cmd', handleWindowEvent);
      unsubDoc();
    };
  }, [onCommand]);
}

// -----------------------------------------------------------------------------------------
// Submissions with Direct Firestore Cloud Real-time Persistence
// -----------------------------------------------------------------------------------------

export async function submitForm1(name: string, email: string, amount: number) {
  const numAmount = Number(amount);
  const entryId = `f1_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const newEntry: Form1Entry = {
    id: entryId,
    name: (name || 'Anónimo').trim(),
    email: (email || '').trim(),
    amount: isNaN(numAmount) ? 0 : numAmount,
    timestamp: Date.now(),
    meetsMinimum: numAmount >= 10_000,
  };

  // Immediate local update for zero-latency UI reaction
  const current = getLocalRawState();
  current.form1.push(newEntry);
  current.lastUpdated = Date.now();
  saveLocalRawState(current);
  publishEvent({ type: 'FORM1', data: newEntry });

  // Write directly to Firestore
  try {
    const docRef = doc(db, 'sessions', SESSION_DOC_ID, 'form1_submissions', entryId);
    await setDoc(docRef, newEntry);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `sessions/${SESSION_DOC_ID}/form1_submissions/${entryId}`);
  }

  return { success: true, entry: newEntry };
}

export async function submitForm2(name: string, email: string, tokens: number) {
  const numTokens = Number(tokens);
  const safeTokens = isNaN(numTokens) || numTokens <= 0 ? 10 : numTokens;
  const entryId = `f2_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const newEntry: Form2Entry = {
    id: entryId,
    name: (name || 'Inversor RWA').trim(),
    email: (email || '').trim(),
    tokens: safeTokens,
    amount: safeTokens * 10,
    m2: +(safeTokens / 100).toFixed(2),
    timestamp: Date.now(),
  };

  const current = getLocalRawState();
  current.form2.push(newEntry);
  current.lastUpdated = Date.now();
  saveLocalRawState(current);
  publishEvent({ type: 'FORM2', data: newEntry });

  try {
    const docRef = doc(db, 'sessions', SESSION_DOC_ID, 'form2_submissions', entryId);
    await setDoc(docRef, newEntry);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `sessions/${SESSION_DOC_ID}/form2_submissions/${entryId}`);
  }

  return { success: true, entry: newEntry };
}

export interface SurveyPayload {
  name: string;
  email: string;
  phone?: string;
  secondaryEmail?: string;
  company?: string;
  industry?: string;
  location?: string;
  freeNotes?: string;
  ratingQuality: number;
  ratingClarity: number;
  npsScore: number;
  selectedTopics: string[];
  comments?: string;
}

export async function submitSurvey(payload: SurveyPayload) {
  const entryId = `surv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const newEntry: SurveyEntry = {
    id: entryId,
    name: (payload.name || 'Asistente').trim(),
    email: (payload.email || '').trim(),
    phone: (payload.phone || '').trim(),
    secondaryEmail: (payload.secondaryEmail || '').trim(),
    company: (payload.company || '').trim(),
    industry: (payload.industry || '').trim(),
    location: (payload.location || '').trim(),
    freeNotes: (payload.freeNotes || '').trim(),
    ratingQuality: payload.ratingQuality || 5,
    ratingClarity: payload.ratingClarity || 5,
    npsScore: payload.npsScore ?? 10,
    selectedTopics: Array.isArray(payload.selectedTopics) ? payload.selectedTopics : [],
    comments: (payload.comments || '').trim(),
    timestamp: Date.now(),
  };

  const current = getLocalRawState();
  current.surveys.push(newEntry);
  current.lastUpdated = Date.now();
  saveLocalRawState(current);
  publishEvent({ type: 'SURVEY', data: newEntry });

  try {
    const docRef = doc(db, 'sessions', SESSION_DOC_ID, 'survey_submissions', entryId);
    await setDoc(docRef, newEntry);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `sessions/${SESSION_DOC_ID}/survey_submissions/${entryId}`);
  }

  return { success: true, entry: newEntry };
}

export async function resetDatabase() {
  const resetNow = Date.now();

  try {
    localStorage.setItem('rwa_session_reset_ts', String(resetNow));
    localStorage.removeItem('rwa_attendee_form1_done');
    localStorage.removeItem('rwa_attendee_form2_done');
    localStorage.removeItem('rwa_attendee_survey_done');
  } catch {}

  const cleanState: RawAppState = {
    form1: [],
    form2: [],
    surveys: [],
    lastUpdated: resetNow,
  };
  saveLocalRawState(cleanState);

  // Broadcast to all open tabs and windows
  try {
    broadcastChannel?.postMessage({ type: 'RESET', data: cleanState });
  } catch {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('rwa_state_reset'));
  }

  // Update Firestore session with reset timestamp and reset phase to 1
  try {
    const sessionDocRef = doc(db, 'sessions', SESSION_DOC_ID);
    await setDoc(
      sessionDocRef,
      {
        phase: 1,
        command: 'setPhase',
        commandValue: 1,
        commandTimestamp: resetNow,
        lastResetTimestamp: resetNow,
        updatedAt: resetNow,
      },
      { merge: true }
    );

    // Delete existing documents in collections using batch
    const batch = writeBatch(db);
    const [f1Snap, f2Snap, survSnap] = await Promise.all([
      getDocs(collection(db, 'sessions', SESSION_DOC_ID, 'form1_submissions')),
      getDocs(collection(db, 'sessions', SESSION_DOC_ID, 'form2_submissions')),
      getDocs(collection(db, 'sessions', SESSION_DOC_ID, 'survey_submissions')),
    ]);

    f1Snap.forEach((d) => batch.delete(d.ref));
    f2Snap.forEach((d) => batch.delete(d.ref));
    survSnap.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `sessions/${SESSION_DOC_ID}`);
  }

  return { success: true };
}

export async function seedDemoData() {
  const now = Date.now();
  const demoForm1: Form1Entry[] = [
    { id: 'f1_d1', name: 'Carlos Mendoza', email: 'carlos@demo.com', amount: 10000, timestamp: now - 60000, meetsMinimum: true },
    { id: 'f1_d2', name: 'Mariana Silva', email: 'mariana@demo.com', amount: 1000, timestamp: now - 55000, meetsMinimum: false },
    { id: 'f1_d3', name: 'Diego Torres', email: 'diego@demo.com', amount: 100, timestamp: now - 50000, meetsMinimum: false },
    { id: 'f1_d4', name: 'Lucía Morales', email: 'lucia@demo.com', amount: 500, timestamp: now - 45000, meetsMinimum: false },
    { id: 'f1_d5', name: 'Fernando Ruiz', email: 'fernando@demo.com', amount: 100, timestamp: now - 40000, meetsMinimum: false },
    { id: 'f1_d6', name: 'Dra. Patricia León', email: 'patricia@demo.com', amount: 10000, timestamp: now - 35000, meetsMinimum: true },
    { id: 'f1_d7', name: 'Andrés Gómez', email: 'andres@demo.com', amount: 1000, timestamp: now - 30000, meetsMinimum: false },
    { id: 'f1_d8', name: 'Valeria Castro', email: 'valeria@demo.com', amount: 50, timestamp: now - 25000, meetsMinimum: false },
    { id: 'f1_d9', name: 'Gabriel Pardo', email: 'gabriel@demo.com', amount: 250, timestamp: now - 20000, meetsMinimum: false },
    { id: 'f1_d10', name: 'Camila Herrera', email: 'camila@demo.com', amount: 100, timestamp: now - 15000, meetsMinimum: false },
    { id: 'f1_d11', name: 'Roberto Alvarado', email: 'roberto.a@demo.com', amount: 1000, timestamp: now - 10000, meetsMinimum: false },
    { id: 'f1_d12', name: 'Sofía Navarro', email: 'sofia@demo.com', amount: 20, timestamp: now - 5000, meetsMinimum: false },
  ];

  const demoForm2: Form2Entry[] = [
    { id: 'f2_d1', name: 'Mariana Silva', email: 'mariana@demo.com', tokens: 100, amount: 1000, m2: 1.0, timestamp: now - 40000 },
    { id: 'f2_d2', name: 'Diego Torres', email: 'diego@demo.com', tokens: 50, amount: 500, m2: 0.5, timestamp: now - 35000 },
    { id: 'f2_d3', name: 'Lucía Morales', email: 'lucia@demo.com', tokens: 500, amount: 5000, m2: 5.0, timestamp: now - 30000 },
    { id: 'f2_d4', name: 'Fernando Ruiz', email: 'fernando@demo.com', tokens: 100, amount: 1000, m2: 1.0, timestamp: now - 28000 },
    { id: 'f2_d5', name: 'Carlos Mendoza', email: 'carlos@demo.com', tokens: 1000, amount: 10000, m2: 10.0, timestamp: now - 25000 },
    { id: 'f2_d6', name: 'Valeria Castro', email: 'valeria@demo.com', tokens: 10, amount: 100, m2: 0.1, timestamp: now - 22000 },
    { id: 'f2_d7', name: 'Andrés Gómez', email: 'andres@demo.com', tokens: 250, amount: 2500, m2: 2.5, timestamp: now - 18000 },
    { id: 'f2_d8', name: 'Gabriel Pardo', email: 'gabriel@demo.com', tokens: 30, amount: 300, m2: 0.3, timestamp: now - 15000 },
    { id: 'f2_d9', name: 'Camila Herrera', email: 'camila@demo.com', tokens: 100, amount: 1000, m2: 1.0, timestamp: now - 12000 },
    { id: 'f2_d10', name: 'Roberto Alvarado', email: 'roberto.a@demo.com', tokens: 500, amount: 5000, m2: 5.0, timestamp: now - 8000 },
    { id: 'f2_d11', name: 'Sofía Navarro', email: 'sofia@demo.com', tokens: 5, amount: 50, m2: 0.05, timestamp: now - 5000 },
    { id: 'f2_d12', name: 'Dra. Patricia León', email: 'patricia@demo.com', tokens: 800, amount: 8000, m2: 8.0, timestamp: now - 2000 },
  ];

  const demoSurveys: SurveyEntry[] = [
    {
      id: 'surv_d1',
      name: 'Dra. Patricia León',
      email: 'patricia@demo.com',
      ratingQuality: 5,
      ratingClarity: 5,
      npsScore: 10,
      selectedTopics: [
        'Vehículos Societarios, SPV y Fideicomisos para RWA',
        'Contratos Inteligentes & Derecho Notarial / Registral',
      ],
      comments:
        'Excelente fundamentación jurídica y constitucional. El enlace entre la doctrina de De Soto y los smart contracts fue revelador.',
      timestamp: now - 35000,
    },
    {
      id: 'surv_d2',
      name: 'Carlos Mendoza',
      email: 'carlos@demo.com',
      ratingQuality: 5,
      ratingClarity: 5,
      npsScore: 10,
      selectedTopics: [
        'Tokenización de Créditos Privados & Deuda Corporativa',
        'Marco Regulatorio & Fiscalidad Cripto en Iberoamérica',
      ],
      comments:
        'La dinámica en vivo con los teléfonos demostró empíricamente la falla del ticket tradicional. Muy pedagógico.',
      timestamp: now - 30000,
    },
    {
      id: 'surv_d3',
      name: 'Mariana Silva',
      email: 'mariana@demo.com',
      ratingQuality: 5,
      ratingClarity: 5,
      npsScore: 10,
      selectedTopics: [
        'Gobernanza Descentralizada (DAO) y Derecho Corporativo',
        'Contratos Inteligentes & Derecho Notarial / Registral',
      ],
      comments:
        'Muy claro cómo se resuelve el problema de la indivisión forzosa y la copropiedad mediante alícuotas digitales.',
      timestamp: now - 20000,
    },
  ];

  const seededState: RawAppState = {
    form1: demoForm1,
    form2: demoForm2,
    surveys: demoSurveys,
    lastUpdated: now,
  };
  saveLocalRawState(seededState);
  publishEvent({ type: 'SEED_DEMO', data: seededState });

  // Write demo data directly to Firestore
  try {
    const batch = writeBatch(db);
    demoForm1.forEach((item) => {
      const docRef = doc(db, 'sessions', SESSION_DOC_ID, 'form1_submissions', item.id);
      batch.set(docRef, item);
    });
    demoForm2.forEach((item) => {
      const docRef = doc(db, 'sessions', SESSION_DOC_ID, 'form2_submissions', item.id);
      batch.set(docRef, item);
    });
    demoSurveys.forEach((item) => {
      const docRef = doc(db, 'sessions', SESSION_DOC_ID, 'survey_submissions', item.id);
      batch.set(docRef, item);
    });
    await batch.commit();

    const sessionDocRef = doc(db, 'sessions', SESSION_DOC_ID);
    await setDoc(sessionDocRef, { updatedAt: Date.now() }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `sessions/${SESSION_DOC_ID}`);
  }

  return { success: true };
}
