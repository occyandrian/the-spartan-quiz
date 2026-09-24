const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const { QUESTIONS, CORRECT, same } = require('./_quiz');

const app = express();
const PORT = process.env.PORT || 3000;
const DURATION = 480000;

const dbUrl = process.env.DATABASE_URL;
const pool = dbUrl
  ? new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false }, max: 5 })
  : null;

let tableReady = null;
async function ensureTable() {
  if (!pool) throw new Error('DATABASE_URL belum tersedia');
  if (!tableReady) {
    tableReady = pool.query(`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        started_at BIGINT NOT NULL,
        submitted_at BIGINT,
        score INTEGER,
        answers JSONB,
        reason TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `).catch(err => { tableReady = null; throw err; });
  }
  await tableReady;
}

app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/quiz', (req, res) => {
  res.json({ id: 1, title: 'Quiz 1 — The Spartan', durationSeconds: 480, questions: QUESTIONS });
});

app.post('/api/start', async (req, res) => {
  try {
    await ensureTable();
    const { name, token } = req.body || {};
    if (!name || name.trim().length < 2) return res.status(400).json({ error: 'Nama wajib diisi.' });
    const expectedToken = process.env.QUIZ_TOKEN || 'SPARTAN2026';
    if (token !== expectedToken) return res.status(403).json({ error: 'Token salah' });

    const started = Date.now();
    const result = await pool.query(
      'INSERT INTO quiz_attempts (name, started_at) VALUES ($1, $2) RETURNING id',
      [name.trim().slice(0, 60), started]
    );
    res.json({ attemptId: String(result.rows[0].id), startedAt: started, expiresAt: started + DURATION });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database belum tersambung. Tambahkan PostgreSQL Railway dan DATABASE_URL.' });
  }
});

app.post('/api/submit', async (req, res) => {
  try {
    await ensureTable();
    const { attemptId, answers, reason } = req.body || {};
    if (!attemptId) return res.status(400).json({ error: 'Attempt tidak ditemukan' });

    const result = await pool.query('SELECT * FROM quiz_attempts WHERE id = $1 LIMIT 1', [attemptId]);
    const attempt = result.rows[0];
    if (!attempt) return res.status(404).json({ error: 'Attempt tidak ditemukan' });
    if (attempt.submitted_at) return res.json({ score: attempt.score, total: QUESTIONS.length, alreadySubmitted: true });

    const now = Date.now();
    const finalReason = now > Number(attempt.started_at) + DURATION + 15000 ? 'time_expired' : (reason || 'manual');
    let score = 0;
    for (let i = 1; i <= QUESTIONS.length; i++) {
      if (same(answers?.[i], CORRECT[i])) score++;
    }

    await pool.query(
      'UPDATE quiz_attempts SET submitted_at = $1, score = $2, answers = $3::jsonb, reason = $4 WHERE id = $5',
      [now, score, JSON.stringify(answers || {}), finalReason, attemptId]
    );
    res.json({ score, total: QUESTIONS.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menyimpan hasil ke database' });
  }
});

function adminAuth(req) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Basic ')) return false;
  const raw = Buffer.from(h.slice(6), 'base64').toString();
  const i = raw.indexOf(':');
  if (i < 1) return false;
  return raw.slice(0, i) === (process.env.ADMIN_USER || 'admin') &&
         raw.slice(i + 1) === (process.env.ADMIN_PASS || 'andrian11');
}

app.get('/api/admin', async (req, res) => {
  if (!adminAuth(req)) {
    res.setHeader('WWW-Authenticate', 'Basic realm="The Spartan Admin"');
    return res.status(401).json({ error: 'Admin login diperlukan' });
  }
  try {
    await ensureTable();
    const result = await pool.query('SELECT id,name,started_at,submitted_at,score,answers,reason FROM quiz_attempts ORDER BY id DESC');
    const out = result.rows.map(a => {
      const answers = a.answers || {};
      const details = {};
      for (let i = 1; i <= QUESTIONS.length; i++) {
        const got = answers[i] || [];
        details[i] = {
          answer: got,
          correct: CORRECT[i],
          status: got.length === 0 ? 'unanswered' : same(got, CORRECT[i]) ? 'correct' : 'wrong'
        };
      }
      return { ...a, id: String(a.id), details };
    });
    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database belum tersambung' });
  }
});

app.get('/health', (req, res) => res.json({ ok: true, databaseConfigured: !!dbUrl }));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log(`The Spartan Quiz running on port ${PORT}`));
