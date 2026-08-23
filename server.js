import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const port = Number(process.env.PORT || 3001);
const jwtSecret = process.env.JWT_SECRET || 'change-this-secret-before-production';
const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data');
const dataFile = path.join(dataDir, 'store.json');
const mongoUri = process.env.MONGO_URI;
const Store = mongoose.model('MandliStore', new mongoose.Schema({ key: { type: String, unique: true }, data: mongoose.Schema.Types.Mixed }, { timestamps: true }));
let mongoConnected = false;

const allowedOrigin = process.env.CLIENT_ORIGIN;
app.use(cors({ origin: (origin, callback) => {
  if (!origin || (allowedOrigin && origin === allowedOrigin) || /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) return callback(null, true);
  callback(new Error('Origin not allowed.'));
} }));
app.use(helmet());
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false }));
app.use(express.json({ limit: '32kb' }));

async function readStore() {
  if (mongoConnected) {
    const document = await Store.findOne({ key: 'main' }).lean();
    return withCollections(document?.data || { users: [], requests: [] });
  }
  try { return withCollections(JSON.parse(await fs.readFile(dataFile, 'utf8'))); }
  catch { return withCollections({ users: [], requests: [] }); }
}
async function writeStore(store) {
  if (mongoConnected) {
    await Store.findOneAndUpdate({ key: 'main' }, { key: 'main', data: withCollections(store) }, { upsert: true, new: true, setDefaultsOnInsert: true });
    return;
  }
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(store, null, 2));
}
function tokenFor(user) { return jwt.sign({ id: user.id, email: user.email, role: user.role }, jwtSecret, { expiresIn: '8h' }); }
function requireAuth(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch { res.status(401).json({ error: 'Authentication required.' }); }
}
function requireAdmin(req, res, next) { if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' }); next(); }
function requireRoles(...roles) { return (req, res, next) => roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'Insufficient permissions.' }); }
function withCollections(store) { for (const key of ['events', 'registrations', 'attendance', 'members', 'certificates', 'announcements', 'notifications', 'archive', 'auditions']) store[key] ||= []; store.auditionStatus ||= { live: false, updatedAt: null }; return store; }

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, branch = '', rollNo = '', year = '', phone = '', interest = '' } = req.body;
  if (!name?.trim() || !email?.trim() || typeof password !== 'string' || password.length < 6) return res.status(400).json({ error: 'Name, email and a password of at least 6 characters are required.' });
  const store = await readStore();
  const normalizedEmail = email.trim().toLowerCase();
  if (store.users.some(user => user.email === normalizedEmail)) return res.status(409).json({ error: 'An account with this email already exists.' });
  const user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    password: await bcrypt.hash(password, 12),
    role: 'member',
    branch: branch.trim(),
    rollNo: rollNo.trim(),
    year: year.trim(),
    phone: phone.trim(),
    interest: interest.trim(),
    verified: false,
    verificationToken: crypto.randomUUID(),
    resetToken: null,
    joinedAt: new Date().toISOString()
  };
  store.users.push(user);
  await writeStore(store);
  res.status(201).json({
    token: tokenFor(user),
    verificationToken: user.verificationToken,
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch,
      rollNo: user.rollNo,
      year: user.year,
      phone: user.phone,
      interest: user.interest,
      verified: user.verified
    }
  });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const store = await readStore();
  const user = store.users.find(item => item.email === email?.trim().toLowerCase());
  if (!user || !(await bcrypt.compare(password || '', user.password))) return res.status(401).json({ error: 'Invalid email or password.' });
  res.json({
    token: tokenFor(user),
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch || '',
      rollNo: user.rollNo || '',
      year: user.year || '',
      phone: user.phone || '',
      interest: user.interest || '',
      verified: user.verified ?? true
    }
  });
});

app.post('/api/auth/verify-email', async (req, res) => { const store = await readStore(); const user = store.users.find(item => item.verificationToken === req.body.token); if (!user) return res.status(400).json({ error: 'Invalid verification token.' }); user.verified = true; user.verificationToken = null; await writeStore(store); res.json({ verified: true }); });
app.post('/api/auth/forgot-password', async (req, res) => { const store = await readStore(); const user = store.users.find(item => item.email === req.body.email?.trim().toLowerCase()); if (!user) return res.json({ message: 'If the account exists, reset instructions have been issued.' }); user.resetToken = crypto.randomUUID(); await writeStore(store); res.json({ message: 'If the account exists, reset instructions have been issued.', resetToken: user.resetToken }); });
app.post('/api/auth/reset-password', async (req, res) => { const store = await readStore(); const user = store.users.find(item => item.resetToken === req.body.token); if (!user || typeof req.body.password !== 'string' || req.body.password.length < 6) return res.status(400).json({ error: 'Invalid reset token or password.' }); user.password = await bcrypt.hash(req.body.password, 12); user.resetToken = null; await writeStore(store); res.json({ reset: true }); });

app.post('/api/requests', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name?.trim() || !email?.trim() || !message?.trim()) return res.status(400).json({ error: 'Name, email and message are required.' });
  const store = await readStore();
  const request = { id: crypto.randomUUID(), name: name.trim(), email: email.trim().toLowerCase(), message: message.trim(), status: 'Pending', createdAt: new Date().toISOString() };
  store.requests.unshift(request);
  await writeStore(store);
  res.status(201).json({ request });
});

app.get('/api/admin/requests', requireAuth, requireAdmin, async (_req, res) => res.json({ requests: (await readStore()).requests }));
app.patch('/api/admin/requests/:id', requireAuth, requireAdmin, async (req, res) => {
  const store = await readStore();
  const request = store.requests.find(item => item.id === req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found.' });
  request.status = req.body.status === 'Handled' ? 'Handled' : 'Pending';
  await writeStore(store);
  res.json({ request });
});
app.delete('/api/admin/requests/:id', requireAuth, requireAdmin, async (req, res) => {
  const store = await readStore();
  const next = store.requests.filter(item => item.id !== req.params.id);
  if (next.length === store.requests.length) return res.status(404).json({ error: 'Request not found.' });
  store.requests = next;
  await writeStore(store);
  res.status(204).end();
});

app.get('/api/events', async (_req, res) => res.json({ events: (await readStore()).events }));
app.post('/api/events', requireAuth, requireRoles('admin', 'coordinator'), async (req, res) => {
  const { title, venue, startsAt, description = '', registrationDeadline = null, seatLimit = 0, poster = '' } = req.body;
  if (!title?.trim() || !venue?.trim() || !startsAt) return res.status(400).json({ error: 'Title, venue and date/time are required.' });
  const store = await readStore();
  const event = { id: crypto.randomUUID(), title: title.trim(), venue: venue.trim(), startsAt, description: description.trim(), registrationDeadline, seatLimit: Number(seatLimit) || 0, poster, registrationOpen: true, createdBy: req.user.id, createdAt: new Date().toISOString() };
  store.events.push(event); await writeStore(store); res.status(201).json({ event });
});
app.patch('/api/events/:id', requireAuth, requireRoles('admin', 'coordinator'), async (req, res) => { const store = await readStore(); const event = store.events.find(item => item.id === req.params.id); if (!event) return res.status(404).json({ error: 'Event not found.' }); Object.assign(event, req.body, { id: event.id }); await writeStore(store); res.json({ event }); });
app.delete('/api/events/:id', requireAuth, requireRoles('admin', 'coordinator'), async (req, res) => { const store = await readStore(); store.events = store.events.filter(item => item.id !== req.params.id); await writeStore(store); res.status(204).end(); });
app.post('/api/events/:id/register', requireAuth, async (req, res) => { const store = await readStore(); const event = store.events.find(item => item.id === req.params.id); const category = ['Dance', 'Dramatic', 'Music', 'Theatre', 'Fine Arts'].includes(req.body.category) ? req.body.category : null; if (!event || !event.registrationOpen) return res.status(404).json({ error: 'Event is unavailable for registration.' }); if (!category) return res.status(400).json({ error: 'Choose a participation category.' }); if (event.registrationDeadline && new Date(event.registrationDeadline) < new Date()) return res.status(400).json({ error: 'Registration deadline has passed.' }); if (event.seatLimit && store.registrations.filter(item => item.eventId === event.id).length >= event.seatLimit) return res.status(409).json({ error: 'This event is full.' }); if (store.registrations.some(item => item.eventId === event.id && item.userId === req.user.id)) return res.status(409).json({ error: 'Already registered.' }); const registration = { id: crypto.randomUUID(), eventId: event.id, userId: req.user.id, category, registrationId: `HM${new Date().getFullYear()}-${String(store.registrations.length + 1).padStart(4, '0')}`, registeredAt: new Date().toISOString() }; store.registrations.push(registration); await writeStore(store); res.status(201).json({ registration, qrPayload: `HM-PASS:${registration.registrationId}` }); });
app.delete('/api/events/:id/register', requireAuth, async (req, res) => { const store = await readStore(); store.registrations = store.registrations.filter(item => !(item.eventId === req.params.id && item.userId === req.user.id)); await writeStore(store); res.status(204).end(); });
app.get('/api/me/registrations', requireAuth, async (req, res) => res.json({ registrations: (await readStore()).registrations.filter(item => item.userId === req.user.id) }));
app.get('/api/admin/registrations', requireAuth, requireRoles('admin', 'coordinator'), async (req, res) => { const store = await readStore(); const category = String(req.query.category || ''); const registrations = store.registrations.filter(item => !category || item.category === category).map(item => ({ ...item, category: item.category || 'Not selected (legacy registration)', student: store.users.find(user => user.id === item.userId)?.name || 'Unknown student', email: store.users.find(user => user.id === item.userId)?.email || '', event: store.events.find(event => event.id === item.eventId)?.title || 'Unknown event' })); res.json({ registrations }); });
app.get('/api/admin/analytics', requireAuth, requireRoles('admin', 'coordinator'), async (_req, res) => { const store = await readStore(); res.json({ members: store.users.filter(user => user.role !== 'admin').length, events: store.events.length, registrations: store.registrations.length, activeEvents: store.events.filter(event => event.registrationOpen).length, attendance: store.attendance.length }); });
app.get('/api/members', requireAuth, requireRoles('admin', 'coordinator'), async (req, res) => {
  const store = await readStore();
  const query = String(req.query.search || '').toLowerCase();
  const members = store.users
    .filter(user => user.role !== 'admin')
    .filter(user => !query || `${user.name} ${user.email} ${user.branch} ${user.rollNo} ${user.phone} ${user.interest}`.toLowerCase().includes(query))
    .map(({ password, ...user }) => user);
  res.json({ members });
});
app.patch('/api/members/:id/role', requireAuth, requireAdmin, async (req, res) => { const store = await readStore(); const member = store.users.find(user => user.id === req.params.id); if (!member) return res.status(404).json({ error: 'Member not found.' }); if (!['member', 'coordinator', 'visitor'].includes(req.body.role)) return res.status(400).json({ error: 'Invalid role.' }); member.role = req.body.role; await writeStore(store); res.json({ member: { id: member.id, name: member.name, email: member.email, role: member.role } }); });
app.post('/api/events/:id/attendance', requireAuth, requireRoles('admin', 'coordinator'), async (req, res) => { const store = await readStore(); const registration = store.registrations.find(item => item.registrationId === req.body.registrationId && item.eventId === req.params.id); if (!registration) return res.status(404).json({ error: 'Registration ID not found.' }); const record = { id: crypto.randomUUID(), eventId: req.params.id, registrationId: registration.registrationId, userId: registration.userId, markedAt: new Date().toISOString() }; if (!store.attendance.some(item => item.registrationId === record.registrationId)) store.attendance.push(record); await writeStore(store); res.status(201).json({ attendance: record }); });
app.get('/api/events/:id/attendance', requireAuth, requireRoles('admin', 'coordinator'), async (req, res) => { const store = await readStore(); const registered = store.registrations.filter(item => item.eventId === req.params.id); const present = store.attendance.filter(item => item.eventId === req.params.id); res.json({ registered: registered.length, present: present.length, absent: registered.length - present.length, percentage: registered.length ? Math.round((present.length / registered.length) * 1000) / 10 : 0 }); });
app.post('/api/admin/certificates', requireAuth, requireAdmin, async (req, res) => { const store = await readStore(); const certificate = { id: crypto.randomUUID(), certificateId: `HM-CERT-${new Date().getFullYear()}-${String(store.certificates.length + 1).padStart(5, '0')}`, userId: req.body.userId, eventId: req.body.eventId, issuedAt: new Date().toISOString() }; store.certificates.push(certificate); await writeStore(store); res.status(201).json({ certificate, qrPayload: `HM-CERT:${certificate.certificateId}` }); });
app.get('/api/certificates/:certificateId/verify', async (req, res) => { const certificate = (await readStore()).certificates.find(item => item.certificateId === req.params.certificateId); res.json({ valid: Boolean(certificate), certificate: certificate || null }); });
app.post('/api/admin/announcements', requireAuth, requireRoles('admin', 'coordinator'), async (req, res) => { if (!req.body.title?.trim() || !req.body.content?.trim()) return res.status(400).json({ error: 'Title and content are required.' }); const store = await readStore(); const announcement = { id: crypto.randomUUID(), title: req.body.title.trim(), content: req.body.content.trim(), createdAt: new Date().toISOString() }; store.announcements.unshift(announcement); store.notifications.unshift({ id: crypto.randomUUID(), type: 'announcement', title: announcement.title, readBy: [], createdAt: announcement.createdAt }); await writeStore(store); res.status(201).json({ announcement }); });
app.get('/api/announcements', async (_req, res) => res.json({ announcements: (await readStore()).announcements }));
app.get('/api/notifications', requireAuth, async (req, res) => res.json({ notifications: (await readStore()).notifications.map(item => ({ ...item, read: item.readBy.includes(req.user.id) })) }));
app.get('/api/archive', async (req, res) => { const store = await readStore(); res.json({ archive: store.archive.filter(item => !req.query.category || item.category === req.query.category) }); });
app.post('/api/admin/archive', requireAuth, requireRoles('admin', 'coordinator'), async (req, res) => { const store = await readStore(); const item = { id: crypto.randomUUID(), category: req.body.category, year: req.body.year, title: req.body.title, description: req.body.description || '', mediaUrl: req.body.mediaUrl || '' }; store.archive.unshift(item); await writeStore(store); res.status(201).json({ item }); });
app.post('/api/auditions', async (req, res) => { const store = await readStore(); const audition = { id: crypto.randomUUID(), applicant: req.body.applicant, email: req.body.email, category: req.body.category, mediaUrl: req.body.mediaUrl || '', status: 'Pending', createdAt: new Date().toISOString() }; store.auditions.unshift(audition); await writeStore(store); res.status(201).json({ audition }); });
app.get('/api/auditions/status', async (_req, res) => res.json({ auditionStatus: (await readStore()).auditionStatus }));
app.patch('/api/admin/auditions/status', requireAuth, requireRoles('admin', 'coordinator'), async (req, res) => { const store = await readStore(); store.auditionStatus = { live: Boolean(req.body.live), updatedAt: new Date().toISOString() }; await writeStore(store); res.json({ auditionStatus: store.auditionStatus }); });
app.get('/api/admin/auditions', requireAuth, requireRoles('admin', 'coordinator'), async (_req, res) => res.json({ auditions: (await readStore()).auditions }));
app.patch('/api/admin/auditions/:id', requireAuth, requireRoles('admin', 'coordinator'), async (req, res) => { const store = await readStore(); const audition = store.auditions.find(item => item.id === req.params.id); if (!audition) return res.status(404).json({ error: 'Audition not found.' }); audition.status = ['Shortlisted', 'Selected', 'Rejected'].includes(req.body.status) ? req.body.status : 'Pending'; await writeStore(store); res.json({ audition }); });
app.get('/api/search', async (req, res) => { const query = String(req.query.q || '').toLowerCase(); const store = await readStore(); const match = item => JSON.stringify(item).toLowerCase().includes(query); res.json({ events: store.events.filter(match), announcements: store.announcements.filter(match), archive: store.archive.filter(match) }); });
app.post('/api/chatbot', async (req, res) => { const question = String(req.body.message || '').toLowerCase(); const event = (await readStore()).events.find(item => item.registrationOpen); let reply = 'I can help with events, registration, auditions, practice, coordinators, and contact details.'; if (question.includes('event') || question.includes('upcoming')) reply = event ? `${event.title} is scheduled at ${event.venue}.` : 'There are no upcoming events published yet.'; else if (question.includes('join') || question.includes('register')) reply = 'Create an account, open Events, and select Register on an available event.'; else if (question.includes('contact')) reply = 'Email haryanvimandli@dcrust.ac.in or use the contact form.'; res.json({ reply }); });

async function ensureAdmin() {
  const store = await readStore();
  const email = (process.env.ADMIN_EMAIL || 'admin@haryanamandli.in').toLowerCase();
  if (!store.users.some(user => user.email === email)) store.users.push({ id: crypto.randomUUID(), name: 'Haryanvi Mandli Admin', email, password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12), role: 'admin', verified: true, verificationToken: null, resetToken: null });
  await writeStore(store);
}

async function start() {
  if (mongoUri) {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
    mongoConnected = true;
    console.log('MongoDB connected');
  } else {
    console.warn('MONGO_URI is not set; using local data/store.json');
  }
  await ensureAdmin();
  app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
}

start().catch(error => { console.error('Unable to start API:', error.message); process.exit(1); });
