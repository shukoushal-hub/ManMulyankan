const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

/* === JSON FILE DATABASE === */
const DB_PATH = path.join(__dirname, 'db', 'data.json');

function loadDB() {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    }
  } catch(e) { console.error('DB read error:', e); }
  return { admins: [], participants: [], sessions: [], nextId: 1 };
}

function saveDB(data) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

let db = loadDB();
if (db.admins.length === 0) {
  db.admins.push({ id: 1, username: 'admin', password: bcrypt.hashSync('admin123', 10) });
  db.nextId = 2;
  saveDB(db);
  console.log('Default admin created: admin / admin123');
}

/* === MIDDLEWARE === */
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'manmulyankan-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

function requireAdmin(req, res, next) {
  if (req.session && req.session.adminId) return next();
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.redirect('/admin/login');
}

/* === PUBLIC ROUTES === */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/test/:name', (req, res) => {
  const validTests = ['depression_screening', 'trail_making', 'stroop_test', 'digit_span', 'quality_of_life', 'wisc_v', 'wais_v_young', 'wais_v_adult', 'moca'];
  if (!validTests.includes(req.params.name)) return res.status(404).send('Test not found');
  res.sendFile(path.join(__dirname, 'public', 'tests', req.params.name + '.html'));
});

/* === API: SUBMIT RESULTS === */
app.post('/api/results', (req, res) => {
  try {
    const { participant, test_type, started_at, completed_at, raw_answers, scores, interpretation } = req.body;
    if (!participant || !participant.name || !test_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    db = loadDB();
    let p = db.participants.find(x => x.name === participant.name && x.age == participant.age);
    if (!p) {
      p = { id: db.nextId++, name: participant.name, age: participant.age || null, created_at: new Date().toISOString() };
      db.participants.push(p);
    }
    const sess = {
      id: db.nextId++,
      participant_id: p.id,
      participant_name: p.name,
      participant_age: p.age,
      test_type: test_type,
      started_at: started_at || new Date().toISOString(),
      completed_at: completed_at || new Date().toISOString(),
      raw_answers: raw_answers || {},
      scores: scores || {},
      interpretation: interpretation || ''
    };
    db.sessions.push(sess);
    saveDB(db);
    res.json({ success: true, session_id: sess.id });
  } catch (err) {
    console.error('Error saving results:', err);
    res.status(500).json({ error: 'Failed to save results' });
  }
});

/* === ADMIN ROUTES === */
app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  db = loadDB();
  const admin = db.admins.find(a => a.username === username);
  if (!admin || !bcrypt.compareSync(password, admin.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  req.session.adminId = admin.id;
  req.session.adminName = admin.username;
  res.json({ success: true });
});

app.get('/admin/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

app.get('/admin', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

app.get('/api/admin/results', requireAdmin, (req, res) => {
  const { test_type, search, limit, offset } = req.query;
  db = loadDB();
  let results = db.sessions.slice().reverse();
  if (test_type && test_type !== 'all') results = results.filter(r => r.test_type === test_type);
  if (search) { const s = search.toLowerCase(); results = results.filter(r => (r.participant_name || '').toLowerCase().includes(s)); }
  const total = results.length;
  results = results.slice(parseInt(offset) || 0, (parseInt(offset) || 0) + (parseInt(limit) || 50));
  res.json({ results, total });
});

app.get('/api/admin/results/:id', requireAdmin, (req, res) => {
  db = loadDB();
  const row = db.sessions.find(s => s.id == req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

app.delete('/api/admin/results/:id', requireAdmin, (req, res) => {
  db = loadDB();
  db.sessions = db.sessions.filter(s => s.id != req.params.id);
  saveDB(db);
  res.json({ success: true });
});

app.get('/api/admin/stats', requireAdmin, (req, res) => {
  db = loadDB();
  const today = new Date().toISOString().split('T')[0];
  const byTest = {};
  db.sessions.forEach(s => { byTest[s.test_type] = (byTest[s.test_type] || 0) + 1; });
  res.json({
    totalSessions: db.sessions.length,
    totalParticipants: new Set(db.sessions.map(s => s.participant_id)).size,
    todayCount: db.sessions.filter(s => (s.completed_at || '').startsWith(today)).length,
    byTest: Object.entries(byTest).map(([test_type, count]) => ({ test_type, count })).sort((a, b) => b.count - a.count),
    recent: db.sessions.slice(-10).reverse()
  });
});

app.get('/api/admin/export', requireAdmin, (req, res) => {
  db = loadDB();
  let csv = 'ID,Participant,Age,Test,Started,Completed,Scores,Interpretation\n';
  db.sessions.forEach(r => {
    const sc = typeof r.scores === 'object' ? JSON.stringify(r.scores) : (r.scores || '');
    csv += `${r.id},"${r.participant_name||''}",${r.participant_age||''},"${r.test_type}","${r.started_at}","${r.completed_at}","${sc.replace(/"/g,'""')}","${(r.interpretation||'').replace(/"/g,'""')}"\n`;
  });
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=manmulyankan_export_' + today() + '.csv');
  res.send(csv);
});

function today() { return new Date().toISOString().split('T')[0]; }

app.post('/api/admin/change-password', requireAdmin, (req, res) => {
  const { current, newPass } = req.body;
  db = loadDB();
  const admin = db.admins.find(a => a.id === req.session.adminId);
  if (!admin || !bcrypt.compareSync(current, admin.password)) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }
  admin.password = bcrypt.hashSync(newPass, 10);
  saveDB(db);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log('\n  ManMulyankan Server running at http://localhost:' + PORT);
  console.log('  Admin panel: http://localhost:' + PORT + '/admin');
  console.log('  Default login: admin / admin123\n');
});
