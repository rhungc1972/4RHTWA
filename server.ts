import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

interface Form1Entry {
  id: string;
  name: string;
  email: string;
  amount: number;
  timestamp: number;
  meetsMinimum: boolean;
}

interface Form2Entry {
  id: string;
  name: string;
  email: string;
  tokens: number;
  amount: number;
  m2: number;
  timestamp: number;
}

interface SurveyEntry {
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
  comments: string;
  timestamp: number;
}

interface AppState {
  form1: Form1Entry[];
  form2: Form2Entry[];
  surveys: SurveyEntry[];
  lastUpdated: number;
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'rwa_state.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let state: AppState = {
  form1: [],
  form2: [],
  surveys: [],
  lastUpdated: Date.now(),
};

// Try loading persisted state
if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    state = {
      form1: parsed.form1 || [],
      form2: parsed.form2 || [],
      surveys: parsed.surveys || [],
      lastUpdated: parsed.lastUpdated || Date.now(),
    };
  } catch {
    // Keep initial state
  }
}

function persistState() {
  state.lastUpdated = Date.now();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving state:', err);
  }
}

// SSE clients
let sseClients: Response[] = [];

// Keep-alive heartbeat interval to prevent mobile browser disconnects
setInterval(() => {
  sseClients.forEach((client) => {
    try {
      client.write(': heartbeat\n\n');
    } catch {}
  });
}, 12000);

function broadcastState() {
  persistState();
  const payload = `data: ${JSON.stringify(getComputedState())}\n\n`;
  sseClients.forEach((client) => {
    try {
      client.write(payload);
    } catch {
      // client disconnected
    }
  });
}

const TOPIC_CATALOG = [
  'Contratos Inteligentes & Derecho Notarial / Registral',
  'Tokenización de Créditos Privados & Deuda Corporativa',
  'Marco Regulatorio & Fiscalidad Cripto en Iberoamérica',
  'Vehículos Societarios, SPV y Fideicomisos para RWA',
  'Gobernanza Descentralizada (DAO) y Derecho Corporativo',
];

function getComputedState() {
  const TARGET_CAPITAL = 1_000_000;
  const TARGET_TOKENS = 100_000;
  const MIN_TICKET = 10_000;

  // Form 1 computations
  const f1Count = state.form1.length;
  const f1Total = state.form1.reduce((sum, item) => sum + item.amount, 0);
  const qualifiedCount = state.form1.filter((i) => i.amount >= MIN_TICKET).length;
  const excludedCount = state.form1.filter((i) => i.amount < MIN_TICKET).length;
  const exclusionRate = f1Count > 0 ? (excludedCount / f1Count) * 100 : 0;
  const traditionalCapitalCaptured = state.form1
    .filter((i) => i.amount >= MIN_TICKET)
    .reduce((sum, item) => sum + item.amount, 0);
  const excludedCapitalBlocked = state.form1
    .filter((i) => i.amount < MIN_TICKET)
    .reduce((sum, item) => sum + item.amount, 0);
  const totalOfferedCapital = f1Total;
  const traditionalDeficit = Math.max(0, TARGET_CAPITAL - traditionalCapitalCaptured);
  const collectedPercent = +((traditionalCapitalCaptured / TARGET_CAPITAL) * 100).toFixed(2);

  const distribution = {
    tier10k: state.form1.filter((i) => i.amount >= 10000).length,
    tier1k: state.form1.filter((i) => i.amount >= 1000 && i.amount < 10000).length,
    tier100: state.form1.filter((i) => i.amount >= 100 && i.amount < 1000).length,
    tier1: state.form1.filter((i) => i.amount < 100).length,
  };

  // Form 2 computations
  const f2Tokens = state.form2.reduce((sum, item) => sum + item.tokens, 0);
  const f2Usd = f2Tokens * 10;
  const f2M2 = +(f2Tokens / 100).toFixed(2);
  const uniqueCoOwners = new Set(state.form2.map((i) => i.email.toLowerCase().trim() || i.id)).size;
  const fundingPercent = +((f2Tokens / TARGET_TOKENS) * 100).toFixed(2);

  // 10 floors calculation (each floor = 10,000 tokens = $100k = 100 m²)
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

  // NPS breakdown: Promoters (9-10), Passives (7-8), Detractors (1-6)
  const promoters = state.surveys.filter((s) => s.npsScore >= 9).length;
  const passives = state.surveys.filter((s) => s.npsScore >= 7 && s.npsScore <= 8).length;
  const detractors = state.surveys.filter((s) => s.npsScore <= 6).length;
  const npsScoreIndex =
    totalSurveys > 0
      ? Math.round(((promoters - detractors) / totalSurveys) * 100)
      : 0;

  // Topic interest counts
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
    },
    roomStats: {
      connectedAttendees: Math.max(1, sseClients.length),
      totalResponses: f1Count + state.form2.length + totalSurveys,
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

// REST API
app.get('/api/state', (_req: Request, res: Response) => {
  res.json(getComputedState());
});

app.get('/api/room-stats', (_req: Request, res: Response) => {
  res.json({
    connectedAttendees: Math.max(1, sseClients.length),
    totalResponses: state.form1.length + state.form2.length + state.surveys.length,
    timestamp: Date.now(),
  });
});

app.post('/api/remote/command', (req: Request, res: Response) => {
  const { command, value, timestamp } = req.body;
  if (!command) {
    res.status(400).json({ error: 'Comando requerido' });
    return;
  }

  const payload = `data: ${JSON.stringify({
    type: 'remote_command',
    command,
    value,
    timestamp: timestamp || Date.now(),
  })}\n\n`;

  sseClients.forEach((client) => {
    try {
      client.write(payload);
    } catch {}
  });

  res.json({ success: true, command, value });
});

app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send current state immediately
  res.write(`data: ${JSON.stringify(getComputedState())}\n\n`);

  sseClients.push(res);

  req.on('close', () => {
    sseClients = sseClients.filter((client) => client !== res);
  });
});

app.post('/api/submit-form1', (req: Request, res: Response) => {
  const { name, email, amount } = req.body;
  const numAmount = Number(amount);

  if (isNaN(numAmount) || numAmount < 0) {
    res.status(400).json({ error: 'Monto inválido' });
    return;
  }

  const newEntry: Form1Entry = {
    id: `f1_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: (name || 'Anónimo').trim(),
    email: (email || '').trim(),
    amount: numAmount,
    timestamp: Date.now(),
    meetsMinimum: numAmount >= 10_000,
  };

  state.form1.push(newEntry);
  broadcastState();

  res.json({ success: true, entry: newEntry });
});

app.post('/api/submit-form2', (req: Request, res: Response) => {
  const { name, email, tokens } = req.body;
  const numTokens = Number(tokens);

  if (isNaN(numTokens) || numTokens <= 0) {
    res.status(400).json({ error: 'Cantidad de tokens inválida' });
    return;
  }

  const amountUsd = numTokens * 10;
  const m2Acquired = +(numTokens / 100).toFixed(2);

  const newEntry: Form2Entry = {
    id: `f2_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: (name || 'Inversor RWA').trim(),
    email: (email || '').trim(),
    tokens: numTokens,
    amount: amountUsd,
    m2: m2Acquired,
    timestamp: Date.now(),
  };

  state.form2.push(newEntry);
  broadcastState();

  res.json({
    success: true,
    entry: newEntry,
    summary: {
      tokens: numTokens,
      amount: amountUsd,
      m2: m2Acquired,
    },
  });
});

app.post('/api/submit-survey', (req: Request, res: Response) => {
  const {
    name,
    email,
    phone,
    secondaryEmail,
    company,
    industry,
    location,
    freeNotes,
    ratingQuality,
    ratingClarity,
    npsScore,
    selectedTopics,
    comments,
  } = req.body;

  const quality = Math.min(5, Math.max(1, Number(ratingQuality) || 5));
  const clarity = Math.min(5, Math.max(1, Number(ratingClarity) || 5));
  const nps = Math.min(10, Math.max(1, Number(npsScore) || 10));

  const newSurvey: SurveyEntry = {
    id: `surv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: (name || 'Asistente Anónimo').trim(),
    email: (email || '').trim(),
    phone: (phone || '').trim(),
    secondaryEmail: (secondaryEmail || '').trim(),
    company: (company || '').trim(),
    industry: (industry || '').trim(),
    location: (location || '').trim(),
    freeNotes: (freeNotes || '').trim(),
    ratingQuality: quality,
    ratingClarity: clarity,
    npsScore: nps,
    selectedTopics: Array.isArray(selectedTopics) ? selectedTopics : [],
    comments: (comments || '').trim(),
    timestamp: Date.now(),
  };

  state.surveys.push(newSurvey);
  broadcastState();

  res.json({ success: true, entry: newSurvey });
});

const handleResetRequest = (_req: Request, res: Response) => {
  state = {
    form1: [],
    form2: [],
    surveys: [],
    lastUpdated: Date.now(),
  };
  persistState();
  broadcastState();

  // Reset presentation screen to phase 1
  const resetCommandPayload = `data: ${JSON.stringify({
    type: 'remote_command',
    command: 'setPhase',
    value: 1,
    timestamp: Date.now(),
  })}\n\n`;

  sseClients.forEach((client) => {
    try {
      client.write(resetCommandPayload);
    } catch {}
  });

  res.json({ success: true, message: 'Conferencia reiniciada a cero' });
};

app.post('/api/reset', handleResetRequest);
app.get('/api/reset', handleResetRequest);

app.post('/api/seed-demo', (_req: Request, res: Response) => {
  const demoForm1: Form1Entry[] = [
    { id: 'f1_d1', name: 'Carlos Mendoza', email: 'carlos@demo.com', amount: 10000, timestamp: Date.now() - 60000, meetsMinimum: true },
    { id: 'f1_d2', name: 'Mariana Silva', email: 'mariana@demo.com', amount: 1000, timestamp: Date.now() - 55000, meetsMinimum: false },
    { id: 'f1_d3', name: 'Diego Torres', email: 'diego@demo.com', amount: 100, timestamp: Date.now() - 50000, meetsMinimum: false },
    { id: 'f1_d4', name: 'Lucía Morales', email: 'lucia@demo.com', amount: 500, timestamp: Date.now() - 45000, meetsMinimum: false },
    { id: 'f1_d5', name: 'Fernando Ruiz', email: 'fernando@demo.com', amount: 100, timestamp: Date.now() - 40000, meetsMinimum: false },
    { id: 'f1_d6', name: 'Dra. Patricia León', email: 'patricia@demo.com', amount: 10000, timestamp: Date.now() - 35000, meetsMinimum: true },
    { id: 'f1_d7', name: 'Andrés Gómez', email: 'andres@demo.com', amount: 1000, timestamp: Date.now() - 30000, meetsMinimum: false },
    { id: 'f1_d8', name: 'Valeria Castro', email: 'valeria@demo.com', amount: 50, timestamp: Date.now() - 25000, meetsMinimum: false },
    { id: 'f1_d9', name: 'Gabriel Pardo', email: 'gabriel@demo.com', amount: 250, timestamp: Date.now() - 20000, meetsMinimum: false },
    { id: 'f1_d10', name: 'Camila Herrera', email: 'camila@demo.com', amount: 100, timestamp: Date.now() - 15000, meetsMinimum: false },
    { id: 'f1_d11', name: 'Roberto Alvarado', email: 'roberto.a@demo.com', amount: 1000, timestamp: Date.now() - 10000, meetsMinimum: false },
    { id: 'f1_d12', name: 'Sofía Navarro', email: 'sofia@demo.com', amount: 20, timestamp: Date.now() - 5000, meetsMinimum: false },
  ];

  const demoForm2: Form2Entry[] = [
    { id: 'f2_d1', name: 'Mariana Silva', email: 'mariana@demo.com', tokens: 100, amount: 1000, m2: 1.0, timestamp: Date.now() - 40000 },
    { id: 'f2_d2', name: 'Diego Torres', email: 'diego@demo.com', tokens: 50, amount: 500, m2: 0.5, timestamp: Date.now() - 35000 },
    { id: 'f2_d3', name: 'Lucía Morales', email: 'lucia@demo.com', tokens: 500, amount: 5000, m2: 5.0, timestamp: Date.now() - 30000 },
    { id: 'f2_d4', name: 'Fernando Ruiz', email: 'fernando@demo.com', tokens: 100, amount: 1000, m2: 1.0, timestamp: Date.now() - 28000 },
    { id: 'f2_d5', name: 'Carlos Mendoza', email: 'carlos@demo.com', tokens: 1000, amount: 10000, m2: 10.0, timestamp: Date.now() - 25000 },
    { id: 'f2_d6', name: 'Valeria Castro', email: 'valeria@demo.com', tokens: 10, amount: 100, m2: 0.1, timestamp: Date.now() - 22000 },
    { id: 'f2_d7', name: 'Andrés Gómez', email: 'andres@demo.com', tokens: 250, amount: 2500, m2: 2.5, timestamp: Date.now() - 18000 },
    { id: 'f2_d8', name: 'Gabriel Pardo', email: 'gabriel@demo.com', tokens: 30, amount: 300, m2: 0.3, timestamp: Date.now() - 15000 },
    { id: 'f2_d9', name: 'Camila Herrera', email: 'camila@demo.com', tokens: 100, amount: 1000, m2: 1.0, timestamp: Date.now() - 12000 },
    { id: 'f2_d10', name: 'Roberto Alvarado', email: 'roberto.a@demo.com', tokens: 500, amount: 5000, m2: 5.0, timestamp: Date.now() - 8000 },
    { id: 'f2_d11', name: 'Sofía Navarro', email: 'sofia@demo.com', tokens: 5, amount: 50, m2: 0.05, timestamp: Date.now() - 5000 },
    { id: 'f2_d12', name: 'Dra. Patricia León', email: 'patricia@demo.com', tokens: 800, amount: 8000, m2: 8.0, timestamp: Date.now() - 2000 },
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
      comments: 'Excelente fundamentación jurídica y constitucional. El enlace entre la doctrina de De Soto y los smart contracts fue revelador.',
      timestamp: Date.now() - 35000,
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
      comments: 'La dinámica en vivo con los teléfonos demostró empíricamente la falla del ticket tradicional. Muy pedagógico.',
      timestamp: Date.now() - 30000,
    },
    {
      id: 'surv_d3',
      name: 'Mariana Silva',
      email: 'mariana@demo.com',
      ratingQuality: 5,
      ratingClarity: 4,
      npsScore: 9,
      selectedTopics: [
        'Contratos Inteligentes & Derecho Notarial / Registral',
        'Gobernanza Descentralizada (DAO) y Derecho Corporativo',
      ],
      comments: 'Me encantaría un taller práctico profundizando en el régimen sucesoral de los tokens inmobiliarios.',
      timestamp: Date.now() - 25000,
    },
    {
      id: 'surv_d4',
      name: 'Andrés Gómez',
      email: 'andres@demo.com',
      ratingQuality: 5,
      ratingClarity: 5,
      npsScore: 10,
      selectedTopics: [
        'Vehículos Societarios, SPV y Fideicomisos para RWA',
        'Marco Regulatorio & Fiscalidad Cripto en Iberoamérica',
      ],
      comments: 'Imprescindible para el sector inmobiliario y financiero moderno. Muy agradecido por la claridad de Roberto.',
      timestamp: Date.now() - 20000,
    },
    {
      id: 'surv_d5',
      name: 'Lucía Morales',
      email: 'lucia@demo.com',
      ratingQuality: 4,
      ratingClarity: 5,
      npsScore: 9,
      selectedTopics: [
        'Tokenización de Créditos Privados & Deuda Corporativa',
      ],
      comments: 'Muy buena exposición y el edificio llenándose piso por piso causó un impacto visual enorme en la sala.',
      timestamp: Date.now() - 15000,
    },
    {
      id: 'surv_d6',
      name: 'Roberto Alvarado',
      email: 'roberto.a@demo.com',
      ratingQuality: 5,
      ratingClarity: 4,
      npsScore: 10,
      selectedTopics: [
        'Marco Regulatorio & Fiscalidad Cripto en Iberoamérica',
        'Contratos Inteligentes & Derecho Notarial / Registral',
      ],
      comments: 'Esperando con ansias la siguiente convocatoria sobre regulación tributaria de dividendos on-chain.',
      timestamp: Date.now() - 10000,
    },
  ];

  state.form1 = demoForm1;
  state.form2 = demoForm2;
  state.surveys = demoSurveys;
  broadcastState();

  res.json({ success: true, message: 'Datos de demostración cargados con encuestas' });
});

// Setup Vite or static serving
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RWA Platform running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
