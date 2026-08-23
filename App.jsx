import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, CheckCircle, Instagram, LayoutDashboard, LockKeyhole, LogIn, LogOut, Mail, MapPin, Menu, Music, Phone, Play, Quote, ShieldCheck, Star, Trash2, Users, X } from 'lucide-react';
import About from './About';
import Dashboard from './Dashboard';

const navItems = [
  ['About', 'about'],
  ['Activities', 'activities'],
  ['Achievements', 'achievements'],
  ['Gallery', 'gallery'],
  ['Team', 'team'],
  ['Events', 'events'],
  ['Auditions', 'auditions'],
  ['Contact', 'contact'],
];

const activities = [
  ['Dance', 'Dhamal, ghoomar and folk performances that carry Haryana\'s energy to every stage.'],
  ['Music', 'Traditional instruments, soulful ragni and contemporary arrangements rooted in folk.'],
  ['Theatre', 'Stories from Haryana brought alive through theatre, satire and student-led productions.'],
  ['Fine Arts', 'Decorative arts, costumes and visual traditions that make every celebration memorable.'],
];

const gallery = [
  ['/pictures/pic 1.jpeg', 'Folk Performance'],
  ['/pictures/pic 2.jpeg', 'Cultural Stage'],
  ['/pictures/pic3.jpeg', 'Ragni & Music'],
  ['/pictures/pic4.jpeg', 'Campus Celebration'],
];

const ADMIN_EMAIL = 'admin@haryanamandli.in';
const ADMIN_PASSWORD = 'admin123';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { headers: { 'Content-Type': 'application/json', ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}) }, ...options, body: options.body ? JSON.stringify(options.body) : undefined });
  } catch {
    throw new Error('Backend is not running. Start it with: npm run server');
  }
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.error || 'Request failed.');
  return data;
}

function AccountPanel({ onClose, onAdminLogin, initialMode = 'signup' }) {
  const [mode, setMode] = useState(initialMode);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    branch: '',
    rollNo: '',
    year: '1st Year',
    phone: '',
    interest: 'Dance (Folk / Cultural)'
  });

  function submit(event) {
    event.preventDefault();
    api(mode === 'login' ? '/auth/login' : '/auth/signup', { method: 'POST', body: form }).then(result => {
      localStorage.setItem('hm-token', result.token);
      localStorage.setItem('hm-user', JSON.stringify(result.user));
      if (result.user.role === 'admin' || result.user.role === 'coordinator' || result.user.role === 'member') onAdminLogin(result.user);
      else onClose();
    }).catch(error => setMessage(error.message));
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-haryana-dark/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="account-title">
      <div className="relative my-6 w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} aria-label="Close account panel" className="absolute right-5 top-5 text-gray-500 hover:text-haryana-red">
          <X />
        </button>
        <div className="mb-6">
          <p className="mb-1 text-xs font-bold uppercase tracking-[.2em] text-haryana-red">Haryanvi Mandli</p>
          <h2 id="account-title" className="text-2xl sm:text-3xl font-bold text-haryana-dark">
            {mode === 'login' ? 'Welcome back' : 'Join Haryanvi Mandli'}
          </h2>
          {mode === 'signup' && (
            <p className="mt-1 text-xs text-gray-500">Fill in your academic and interest details to complete your membership application.</p>
          )}
        </div>

        <form onSubmit={submit} className="space-y-3 sm:space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                <input required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="Enter your full name" className="w-full rounded border border-gray-200 p-2.5 sm:p-3 text-sm outline-none focus:border-haryana-red focus:ring-1 focus:ring-haryana-red" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Branch *</label>
                  <input required value={form.branch} onChange={event => setForm({ ...form, branch: event.target.value })} placeholder="e.g. CSE, ECE, ME" className="w-full rounded border border-gray-200 p-2.5 sm:p-3 text-sm outline-none focus:border-haryana-red focus:ring-1 focus:ring-haryana-red" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Roll Number *</label>
                  <input required value={form.rollNo} onChange={event => setForm({ ...form, rollNo: event.target.value })} placeholder="e.g. 21001001001" className="w-full rounded border border-gray-200 p-2.5 sm:p-3 text-sm outline-none focus:border-haryana-red focus:ring-1 focus:ring-haryana-red" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Year of Study *</label>
                  <select value={form.year} onChange={event => setForm({ ...form, year: event.target.value })} className="w-full rounded border border-gray-200 p-2.5 sm:p-3 text-sm outline-none focus:border-haryana-red focus:ring-1 focus:ring-haryana-red bg-white">
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                    <option>Post Graduate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Number *</label>
                  <input required type="tel" value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} placeholder="+91 9876543210" className="w-full rounded border border-gray-200 p-2.5 sm:p-3 text-sm outline-none focus:border-haryana-red focus:ring-1 focus:ring-haryana-red" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Area of Interest *</label>
                <select value={form.interest} onChange={event => setForm({ ...form, interest: event.target.value })} className="w-full rounded border border-gray-200 p-2.5 sm:p-3 text-sm outline-none focus:border-haryana-red focus:ring-1 focus:ring-haryana-red bg-white">
                  <option>Dance (Folk / Cultural)</option>
                  <option>Music & Singing</option>
                  <option>Theatre & Dramatics</option>
                  <option>Fine Arts & Craft</option>
                  <option>Management & Event Operations</option>
                  <option>Social Media & PR</option>
                  <option>Technical & Stage Setup</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
            <input required type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} placeholder="email@dcrust.ac.in" className="w-full rounded border border-gray-200 p-2.5 sm:p-3 text-sm outline-none focus:border-haryana-red focus:ring-1 focus:ring-haryana-red" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password *</label>
            <input required type="password" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} placeholder="••••••••" className="w-full rounded border border-gray-200 p-2.5 sm:p-3 text-sm outline-none focus:border-haryana-red focus:ring-1 focus:ring-haryana-red" />
          </div>

          <button className="flex w-full items-center justify-center gap-2 rounded bg-haryana-red px-5 py-3 font-semibold text-white transition-colors hover:bg-red-700 mt-2" type="submit">
            {mode === 'login' ? <><LogIn size={18} /> Log in</> : 'Submit Application & Join'}
          </button>
        </form>

        {message && <p className="mt-4 text-sm font-medium text-haryana-red">{message}</p>}

        <button className="mt-5 text-sm text-gray-600 underline hover:text-haryana-red" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(''); }}>
          {mode === 'login' ? 'New student? Join Haryanvi Mandli' : 'Already have an account? Log in'}
        </button>

        {mode === 'login' && <p className="mt-5 border-t pt-4 text-xs text-gray-500">Admin demo: {ADMIN_EMAIL} / {ADMIN_PASSWORD}</p>}
      </div>
    </div>
  );
}

function AdminPanel({ requests, setRequests, onLogout, onClose }) {
  useEffect(() => { api('/admin/requests', { token: localStorage.getItem('hm-token') }).then(result => setRequests(result.requests)).catch(() => onLogout()); }, [onLogout, setRequests]);
  function updateRequest(id, status) { api(`/admin/requests/${id}`, { method: 'PATCH', token: localStorage.getItem('hm-token'), body: { status } }).then(result => setRequests(requests.map(request => request.id === id ? result.request : request))); }
  function removeRequest(id) { api(`/admin/requests/${id}`, { method: 'DELETE', token: localStorage.getItem('hm-token') }).then(() => setRequests(requests.filter(request => request.id !== id))); }
  return <div className="fixed inset-0 z-[60] overflow-y-auto bg-haryana-cream"><div className="mx-auto min-h-screen max-w-[1400px] px-4 py-8 sm:px-8 lg:px-12"><div className="mb-10 flex flex-wrap items-center justify-between gap-4"><div><p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[.2em] text-haryana-red"><ShieldCheck size={18} /> Admin workspace</p><h2 className="mt-2 text-4xl font-bold text-haryana-dark">Request management</h2></div><div className="flex gap-3"><button onClick={onClose} className="rounded border border-haryana-dark/20 px-4 py-2 text-sm font-semibold text-haryana-dark">View website</button><button onClick={onLogout} className="flex items-center gap-2 rounded bg-haryana-dark px-4 py-2 text-sm font-semibold text-white"><LogOut size={16} /> Log out</button></div></div><div className="mb-8 grid gap-4 sm:grid-cols-3"><div className="rounded-xl bg-white p-5"><p className="text-sm text-gray-500">Total requests</p><p className="mt-2 text-3xl font-bold text-haryana-dark">{requests.length}</p></div><div className="rounded-xl bg-white p-5"><p className="text-sm text-gray-500">Pending</p><p className="mt-2 text-3xl font-bold text-haryana-red">{requests.filter(request => request.status === 'Pending').length}</p></div><div className="rounded-xl bg-white p-5"><p className="text-sm text-gray-500">Handled</p><p className="mt-2 text-3xl font-bold text-green-700">{requests.filter(request => request.status === 'Handled').length}</p></div></div><div className="space-y-4">{requests.length === 0 ? <div className="rounded-xl bg-white p-10 text-center text-gray-600">No requests have arrived yet.</div> : requests.map(request => <article key={request.id} className="rounded-xl bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="text-xl font-bold text-haryana-dark">{request.name}</h3><p className="mt-1 text-sm text-haryana-red">{request.email} · {request.date}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${request.status === 'Handled' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{request.status}</span></div><p className="mt-5 leading-relaxed text-gray-700">{request.message}</p><div className="mt-5 flex gap-3"><button onClick={() => updateRequest(request.id, request.status === 'Handled' ? 'Pending' : 'Handled')} className="flex items-center gap-2 rounded bg-haryana-dark px-4 py-2 text-sm font-semibold text-white"><CheckCircle size={16} /> {request.status === 'Handled' ? 'Mark pending' : 'Mark handled'}</button><button onClick={() => removeRequest(request.id)} aria-label={`Delete request from ${request.name}`} className="rounded border border-red-200 p-2 text-haryana-red hover:bg-red-50"><Trash2 size={17} /></button></div></article>)}</div></div></div>;
}

function Navigation({ onAccountOpen, onAdminOpen, isAdmin, isAuthenticated }) {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [auditionsLive, setAuditionsLive] = useState(false);

  useEffect(() => {
    Promise.all([api('/events'), api('/auditions/status')])
      .then(([eventResult, auditionResult]) => {
        setEvents(eventResult.events);
        setAuditionsLive(auditionResult.auditionStatus.live);
      })
      .catch(() => {
        setEvents([]);
        setAuditionsLive(false);
      });
  }, []);

  return (
    <header className="fixed top-0 z-50 w-full bg-haryana-dark/95 text-white shadow-xl backdrop-blur border-b border-white/10">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3.5 sm:px-8 lg:px-12">
        {/* Leftmost Side: Logo and Haryanvi Mandli Brand */}
        <a href="#home" className="flex items-center gap-3 group text-2xl font-extrabold tracking-tight">
          <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-haryana-mustard shadow-md transition-transform group-hover:scale-105 bg-haryana-dark flex items-center justify-center flex-shrink-0">
            <img src="/pictures/logo.jpeg" alt="Haryanvi Mandli Logo" className="h-full w-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
          </div>
          <span className="text-white group-hover:text-haryana-mustard transition-colors">
            <span className="text-haryana-mustard">Haryanvi</span> Mandli
          </span>
        </a>

        {/* Mobile Toggle Button */}
        <button className="md:hidden text-white hover:text-haryana-mustard p-2" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>

        {/* Rightmost Side: Navigation Items */}
        <nav className={`${open ? 'absolute left-0 top-full flex' : 'hidden'} w-full flex-col gap-2 bg-haryana-dark/98 px-6 py-5 shadow-2xl md:static md:flex md:w-auto md:flex-row md:items-center md:gap-4 md:bg-transparent md:p-0 md:shadow-none md:ml-auto`}>
          {navItems.map(([label, id]) =>
            id === 'auditions' ? (
              <button
                key={id}
                onClick={() => {
                  setOpen(false);
                  onAccountOpen();
                }}
                className="rounded-lg px-3.5 py-2 text-sm font-semibold text-white/85 transition-all hover:bg-white/10 hover:text-haryana-mustard text-left flex items-center gap-1.5"
              >
                <span className="h-2 w-2 rounded-full bg-haryana-mustard animate-pulse"></span>
                {label}
              </button>
            ) : (
              <a
                key={id}
                href={`#${id}`}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3.5 py-2 text-sm font-semibold text-white/85 transition-all hover:bg-white/10 hover:text-haryana-mustard"
              >
                {label}
              </a>
            )
          )}
          <button
            onClick={() => {
              setOpen(false);
              isAuthenticated ? onAdminOpen() : onAccountOpen();
            }}
            className="mt-3 md:mt-0 ml-0 md:ml-2 inline-flex items-center justify-center gap-2 rounded-full border-2 border-haryana-mustard bg-haryana-mustard/10 px-5 py-2 text-sm font-bold text-haryana-mustard backdrop-blur transition-all hover:bg-haryana-mustard hover:text-haryana-dark shadow-md"
          >
            {isAuthenticated ? (isAdmin ? 'Admin Panel' : 'My Dashboard') : 'Join Mandli / Login'}
          </button>
        </nav>
      </div>

      {/* Ticker Banner */}
      <div className="border-t border-white/10 bg-haryana-red py-2" aria-label="Upcoming events">
        <div className="overflow-hidden whitespace-nowrap">
          <div className="event-ticker inline-flex min-w-full items-center gap-12 px-4 text-sm font-semibold">
            <button onClick={onAccountOpen} className="hover:text-haryana-mustard font-semibold cursor-pointer text-left">
              📢 Auditions are live — click here to fill the registration form! <span className="ml-12 text-haryana-mustard">◆</span>
            </button>
            {(events.length ? events : [{ id: 'empty', title: 'Haryanvi Mandli cultural events and auditions', href: '#events' }]).map(event => (
              <a key={event.id} href={event.href || '#events'} className="hover:text-haryana-mustard">
                {event.title}
                {event.startsAt ? ` · ${new Date(event.startsAt).toLocaleDateString()}` : ''} <span className="ml-12 text-haryana-mustard">◆</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

const heroBgs = [
  '/pictures/background.jpg.jpeg',
  '/pictures/pic 1.jpeg',
  '/pictures/pic 2.jpeg',
  '/pictures/pic3.jpeg',
  '/pictures/pic4.jpeg',
  '/pictures/pic5.jpg.jpeg',
  '/pictures/pic6.jpg.jpeg',
  '/pictures/core.jpeg',
  '/pictures/DSC_6022.JPG.jpeg',
];

function Hero({ onJoinOpen }) {
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex(prev => (prev + 1) % heroBgs.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" className="relative flex min-h-[92vh] lg:min-h-screen items-center justify-center overflow-hidden pt-44 pb-32 text-white">
      {/* Moving Background Image Slideshow (1.5s interval) */}
      {heroBgs.map((src, idx) => (
        <div
          key={src}
          className={`absolute inset-0 bg-cover bg-[center_15%] md:bg-[center_20%] transition-opacity duration-1000 transform scale-105 ${
            idx === bgIndex ? 'opacity-100 scale-100' : 'opacity-0 pointer-events-none'
          }`}
          style={{ backgroundImage: `url("${encodeURI(src)}")` }}
        />
      ))}

      {/* Overlay gradient & folk styling */}
      <div className="absolute inset-0 bg-gradient-to-b from-haryana-dark/85 via-haryana-dark/70 to-haryana-dark/95" />
      <div className="glow-orb-1" />
      <div className="glow-orb-2" />
      <div className="absolute inset-0 bg-folk-pattern opacity-15 pointer-events-none" />
      
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-8">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7 }}>
          <p className="mb-6 inline-block rounded-full border border-haryana-mustard/30 bg-haryana-mustard/10 px-5 py-2 text-sm font-semibold uppercase tracking-[.25em] text-haryana-mustard backdrop-blur">
            DCRUST Cultural Society
          </p>
          <h1 className="mb-10 text-5xl font-extrabold leading-tight md:text-7xl lg:text-8xl tracking-tight drop-shadow-lg">
            Where Haryana&apos;s <span className="text-haryana-mustard">heartbeat</span> takes the stage.
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button onClick={onJoinOpen} className="inline-flex items-center gap-2 rounded-full bg-haryana-red px-8 py-4 text-lg font-semibold shadow-lg shadow-haryana-red/30 transition-all hover:scale-105 hover:bg-red-700">
              Join Haryanvi Mandli <ArrowRight size={20} />
            </button>
            <a href="#activities" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold backdrop-blur transition-all hover:bg-white/20">
              Explore our culture
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Activities() {
  return <section id="activities" className="bg-white py-28 lg:py-36"><div className="mx-auto max-w-[1400px] px-4 sm:px-8 lg:px-12"><SectionHeading eyebrow="What we do" title="Tradition, made alive" /> <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{activities.map(([title, text], index) => <motion.article whileHover={{ y: -8 }} key={title} className="folk-border rounded-2xl bg-haryana-cream p-8 md:p-10 shadow-sm"><Music className="mb-8 text-haryana-red" size={40} /><h3 className="mb-3 text-2xl md:text-3xl font-bold text-haryana-dark">{title}</h3><p className="leading-relaxed text-gray-600 text-base">{text}</p><span className="mt-8 block text-base font-bold text-haryana-red">0{index + 1}</span></motion.article>)}</div></div></section>;
}

function SectionHeading({ eyebrow, title }) { return <div className="mb-12"><p className="mb-2 text-sm font-bold uppercase tracking-[.2em] text-haryana-red">{eyebrow}</p><h2 className="text-4xl font-bold text-haryana-dark md:text-5xl">{title}</h2></div>; }

function Achievements() { return <section id="achievements" className="bg-haryana-red py-28 lg:py-36 text-white"><div className="mx-auto max-w-[1400px] px-4 sm:px-8 lg:px-12"><SectionHeading eyebrow="Our milestones" title="A decade of showing up" /><div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">{[['50+', 'Awards won'], ['200+', 'Active members'], ['100+', 'Events performed'], ['10+', 'Years of excellence']].map(([value, label]) => <div key={label} className="border-l-2 border-white/30 p-6 md:p-8"><p className="text-5xl md:text-6xl font-bold text-haryana-mustard">{value}</p><p className="mt-3 text-lg text-white/90 font-medium">{label}</p></div>)}</div></div></section>; }

function Gallery() { return <section id="gallery" className="bg-haryana-cream py-28 lg:py-36"><div className="mx-auto max-w-[1400px] px-4 sm:px-8 lg:px-12"><SectionHeading eyebrow="From the archive" title="Moments worth remembering" /><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{gallery.map(([src, alt]) => <figure key={alt} className="group relative overflow-hidden rounded-2xl bg-haryana-dark shadow-xl"><img src={src} alt={alt} className="h-[420px] md:h-[480px] w-full object-cover object-[center_20%] transition duration-500 group-hover:scale-110 group-hover:opacity-85" /><figcaption className="absolute bottom-0 w-full bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 pt-16 text-lg font-bold text-white">{alt}</figcaption></figure>)}</div></div></section>; }

function Team() {
  const teacher = [
    'Ar. Sneh',
    'Cultural Coordinator (Faculty Leadership)',
    'Assistant Professor, Department of Architecture',
    'Guiding the society, mentoring student leadership, and supporting every cultural initiative across DCRUST.',
    '/pictures/ar. sneh  teacher coordinator.jpeg'
  ];

  const students = [
    [
      'Mukul',
      'Coordinator',
      'Electrical Engineering · Final Year',
      'Keeping rehearsals, performances and campus programs in rhythm.',
      '/pictures/mukul coordinator.jpeg'
    ],
    [
      'Prince',
      'Management Head',
      'Computer Science & Engineering · Final Year',
      'Organizing resources, administration, and making each event run smoothly.',
      '/pictures/prince management coordinator.jpeg'
    ],
    [
      'Yash',
      'Social Media Head',
      'Electronics & Communication Engineering · Final Year',
      'Sharing Haryanvi Mandli performances and stories with the world.',
      '/pictures/yash social media head.jpeg'
    ],
    [
      'Viren',
      'Dramatic Head',
      'Chemical Engineering · 3rd Year',
      'Leading scripts, stagecraft and expressive dramatic productions.',
      '/pictures/viren dramatic head.jpeg'
    ],
    [
      'Khushboo',
      'PR Head / Treasurer',
      'Chemical Engineering · 3rd Year',
      'Managing budgets and public relations so creativity can take the stage.',
      '/pictures/khusboo pr head.jpeg'
    ],
  ];

  return (
    <section id="team" className="bg-white py-28 lg:py-36">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8 lg:px-12">
        <SectionHeading eyebrow="The people" title="Meet the Mandli team" />

        {/* Teacher Coordinator - Top Middle */}
        <div className="mb-16 flex justify-center">
          <div className="w-full max-w-lg rounded-3xl border-2 border-haryana-red/20 bg-gradient-to-b from-haryana-cream/50 to-white p-10 text-center shadow-2xl folk-border">
            <div className="mx-auto mb-6 h-44 w-44 sm:h-52 sm:w-52 overflow-hidden rounded-2xl border-4 border-haryana-mustard shadow-xl bg-haryana-cream">
              <img src={encodeURI(teacher[4])} alt={teacher[0]} className="h-full w-full object-cover object-[center_15%]" onError={e => { e.target.style.display = 'none'; }} />
            </div>
            <span className="inline-block rounded-full bg-haryana-red/10 px-5 py-1.5 text-xs font-bold text-haryana-red uppercase tracking-wider mb-3">
              {teacher[1]}
            </span>
            <h3 className="text-3xl font-bold text-haryana-dark">{teacher[0]}</h3>
            <p className="mt-2 text-base font-bold text-haryana-red">{teacher[2]}</p>
            <p className="mt-4 text-base leading-relaxed text-gray-600">{teacher[3]}</p>
          </div>
        </div>

        {/* Student Team Heading */}
        <div className="mb-12 text-center">
          <h3 className="text-3xl font-bold text-haryana-dark">Student Coordinators & Heads</h3>
          <div className="mx-auto mt-3 h-1.5 w-20 rounded bg-haryana-mustard"></div>
        </div>

        {/* Student Team Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {students.map(([name, title, dept, description, photo]) => (
            <div key={name} className="rounded-2xl border border-haryana-red/10 bg-white p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl folk-border flex flex-col items-center justify-between">
              <div>
                <div className="mx-auto mb-6 h-36 w-36 sm:h-44 sm:w-44 overflow-hidden rounded-2xl border-3 border-haryana-mustard shadow-lg bg-haryana-cream">
                  <img src={encodeURI(photo)} alt={name} className="h-full w-full object-cover object-[center_15%]" onError={e => { e.target.style.display = 'none'; }} />
                </div>
                <h3 className="text-2xl font-bold text-haryana-dark">{name}</h3>
                <p className="mt-1 font-bold text-haryana-dark text-base">{title}</p>
                <p className="mt-2 font-semibold text-haryana-red text-xs bg-haryana-red/10 px-3 py-1 rounded-full inline-block">{dept}</p>
                <p className="mt-4 text-sm leading-relaxed text-gray-600">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Events() { return <section id="events" className="bg-haryana-dark py-20 text-white"><div className="mx-auto max-w-[1400px] px-4 sm:px-8 lg:px-12"><SectionHeading eyebrow="Join us" title="Coming up on stage" /><div className="grid gap-5 md:grid-cols-3">{[['Aagaz 2026', '12 Sep 2026', 'DCRUST Amphitheatre'], ['Rang-e-Haryana', '04 Oct 2026', 'University Cultural Fest'], ['Open Auditions', '18 Oct 2026', 'Mandli Practice Hall']].map(([name, date, place]) => <article key={name} className="rounded-xl border border-white/15 bg-white/5 p-6"><CalendarDays className="mb-8 text-haryana-mustard" /><h3 className="text-2xl font-bold">{name}</h3><p className="mt-3 text-haryana-mustard">{date}</p><p className="mt-2 text-white/60">{place}</p></article>)}</div></div></section>; }

function EventsFromApi({ api, onRegister, onAccountOpen }) { const [events, setEvents] = useState([]); const [selectedEvent, setSelectedEvent] = useState(null); useEffect(() => { api('/events').then(result => setEvents(result.events)).catch(() => setEvents([])); }, [api]); return <section id="events" className="bg-haryana-dark py-28 lg:py-36 text-white"><div className="mx-auto max-w-[1400px] px-4 sm:px-8 lg:px-12"><SectionHeading eyebrow="Join us" title="Coming up on stage" /><div className="grid gap-6 md:grid-cols-3">{events.length === 0 ? [['Aagaz 2026', '12 Sep 2026', 'DCRUST Amphitheatre'], ['Rang-e-Haryana', '04 Oct 2026', 'University Cultural Fest'], ['Open Auditions 2026', '18 Oct 2026', 'Mandli Practice Hall']].map(([name, date, place]) => <article key={name} className="rounded-2xl border border-white/15 bg-white/5 p-8 flex flex-col justify-between min-h-[320px]"><div><CalendarDays className="mb-8 text-haryana-mustard" size={38} /><h3 className="text-2xl md:text-3xl font-bold">{name}</h3><p className="mt-4 text-haryana-mustard text-lg font-semibold">{date}</p><p className="mt-2 text-white/70">{place}</p></div><button onClick={onAccountOpen} className="mt-8 rounded-xl bg-haryana-mustard px-5 py-3 font.bold text-haryana-dark hover:bg-yellow-400 transition-colors w-full font-semibold">{name.includes('Audition') ? 'Apply for Audition' : 'Register / get pass'}</button></article>) : events.map(event => <article key={event.id} className="rounded-2xl border border-white/15 bg-white/5 p-8 flex flex-col justify-between min-h-[320px]"><div><CalendarDays className="mb-8 text-haryana-mustard" size={38} /><h3 className="text-2xl md:text-3xl font-bold">{event.title}</h3><p className="mt-4 text-haryana-mustard text-lg font-semibold">{new Date(event.startsAt).toLocaleString()}</p><p className="mt-2 text-white/70">{event.venue}</p><p className="mt-4 text-white/80">{event.description}</p></div><button onClick={() => event.title?.toLowerCase().includes('audition') ? onAccountOpen() : setSelectedEvent(event)} className="mt-8 rounded-xl bg-haryana-mustard px-5 py-3 font-semibold text-haryana-dark hover:bg-yellow-400 transition-colors w-full">{event.title?.toLowerCase().includes('audition') ? 'Apply for Audition' : 'Register / get pass'}</button></article>)}</div></div>{selectedEvent && <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-xl bg-white p-7 text-haryana-dark"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-[.2em] text-haryana-red">Registration</p><h3 className="mt-2 text-2xl font-bold">{selectedEvent.title}</h3></div><button onClick={() => setSelectedEvent(null)} aria-label="Close registration options"><X /></button></div><p className="mt-5 text-gray-600">Choose your participation category:</p><div className="mt-4 grid gap-3 sm:grid-cols-2">{['Dance', 'Dramatic', 'Music', 'Theatre', 'Fine Arts'].map(category => <button key={category} onClick={() => { setSelectedEvent(null); onRegister(selectedEvent.id, category); }} className="rounded border border-haryana-red/20 px-4 py-3 text-left font-semibold hover:bg-haryana-cream">{category}</button>)}</div></div></div>}</section>; }
function Testimonials() { return <section className="bg-haryana-cream py-28 lg:py-36"><div className="mx-auto max-w-4xl px-4 text-center sm:px-8"><Quote className="mx-auto mb-8 text-haryana-red" size={52} /><p className="text-3xl font-semibold leading-relaxed text-haryana-dark md:text-4xl">“Haryanvi Mandli gave me a stage, a family and a deeper connection with where I come from.”</p><div className="mt-8 flex justify-center gap-1.5 text-haryana-mustard">{[1, 2, 3, 4, 5].map(star => <Star key={star} size={22} className="fill-current" />)}</div><p className="mt-4 text-gray-600 text-lg">Former student performer</p></div></section>; }
function Contact() { const [submitted, setSubmitted] = useState(false); const [error, setError] = useState(''); return <section id="contact" className="bg-white py-28 lg:py-36"><div className="mx-auto grid max-w-[1400px] gap-12 px-4 sm:px-8 lg:grid-cols-2 lg:px-12"><div><SectionHeading eyebrow="Say salaam" title="Bring your energy" /><p className="max-w-md text-lg leading-relaxed text-gray-600">Want to perform, collaborate or know more about Haryanvi Mandli? Reach out and we&apos;ll get back to you.</p><div className="mt-10 space-y-5 text-gray-700 text-lg"><p className="flex items-center gap-4"><Mail className="text-haryana-red" size={24} /> haryanvimandli@dcrust.ac.in</p><p className="flex items-center gap-4"><Phone className="text-haryana-red" size={24} /> +91 130 248 4000</p><p className="flex items-center gap-4"><MapPin className="text-haryana-red" size={24} /> DCRUST, Murthal, Sonipat, Haryana</p></div></div><form className="space-y-5 rounded-2xl bg-haryana-cream p-8 md:p-10 shadow-sm" onSubmit={event => { event.preventDefault(); const data = new FormData(event.currentTarget); setError(''); api('/requests', { method: 'POST', body: { name: data.get('name'), email: data.get('email'), message: data.get('message') } }).then(() => { setSubmitted(true); event.currentTarget.reset(); }).catch(requestError => setError(requestError.message)); }}><input required name="name" aria-label="Your name" placeholder="Your name" className="w-full rounded-lg border-0 p-4 text-base" /><input required name="email" type="email" aria-label="Email address" placeholder="Email address" className="w-full rounded-lg border-0 p-4 text-base" /><textarea required name="message" aria-label="Your message" placeholder="Tell us what you have in mind" rows="5" className="w-full rounded-lg border-0 p-4 text-base" /> {error && <p className="text-sm font-medium text-haryana-red">{error}</p>}<button className="inline-flex items-center gap-2 rounded-xl bg-haryana-red px-8 py-4 text-lg font-semibold text-white hover:bg-red-700 transition-colors" type="submit">{submitted ? <><CheckCircle size={20} /> Request sent</> : <>Send request <ArrowRight size={20} /></>}</button></form></div></section>; }
function Footer() { return <footer className="bg-haryana-dark py-8 text-white"><div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-4 px-4 text-sm text-white/60 sm:flex-row sm:px-8 lg:px-12"><p>© 2026 Haryanvi Mandli, DCRUST</p><a href="#home" aria-label="Haryanvi Mandli on Instagram" className="hover:text-haryana-mustard"><Instagram size={20} /></a></div></footer>; }

function App() {
  const [accountOpen, setAccountOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => JSON.parse(localStorage.getItem('hm-user') || 'null')?.role === 'admin');
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('hm-user') || 'null'));
  const [pendingRegistration, setPendingRegistration] = useState(null);
  const [requests, setRequests] = useState([]);
  return (
    <div className="min-h-screen">
      <Navigation onAccountOpen={() => setAccountOpen(true)} onAdminOpen={() => setAdminOpen(true)} isAdmin={isAdmin} isAuthenticated={Boolean(user)} />
      <Hero onJoinOpen={() => setAccountOpen(true)} />
      <About />
      <Activities />
      <Achievements />
      <Gallery />
      <Team />
      <EventsFromApi api={api} onAccountOpen={() => setAccountOpen(true)} onRegister={(eventId, category) => { setPendingRegistration({ eventId, category }); user ? setAdminOpen(true) : setAccountOpen(true); }} />
      <Testimonials />
      <Contact />
      <Footer />
      {accountOpen && <AccountPanel onClose={() => setAccountOpen(false)} onAdminLogin={signedInUser => { setAccountOpen(false); setUser(signedInUser); setIsAdmin(signedInUser.role === 'admin'); setAdminOpen(true); }} />}
      {adminOpen && user && <Dashboard api={api} user={user} token={localStorage.getItem('hm-token')} pendingRegistration={pendingRegistration} onClose={() => { setAdminOpen(false); setPendingRegistration(null); }} onLogout={() => { localStorage.removeItem('hm-token'); localStorage.removeItem('hm-user'); setAdminOpen(false); setUser(null); setIsAdmin(false); setPendingRegistration(null); }} />}
    </div>
  );
}
export default App;
