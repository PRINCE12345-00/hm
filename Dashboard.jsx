import { useEffect, useState } from 'react';
import { Archive, BarChart3, CalendarPlus, CheckCircle, ClipboardCheck, FileBadge, LogOut, Megaphone, Search, ShieldCheck, Ticket, Trash2, Users, X, QrCode, UserCheck, AlertCircle, Award, Printer } from 'lucide-react';

const adminTabs = [
  ['overview', 'Overview', BarChart3],
  ['events', 'Events', CalendarPlus],
  ['registrations', 'Registrations', Ticket],
  ['members', 'Members', Users],
  ['attendance', 'Attendance', CheckCircle],
  ['certificates', 'Certificates', FileBadge],
  ['senior-reviews', 'Passout Reviews', Award],
  ['requests', 'Requests', ClipboardCheck],
  ['announcements', 'Notices', Megaphone],
  ['auditions', 'Auditions', ShieldCheck],
  ['reviews', 'Review sessions', ClipboardCheck],
  ['archive', 'Archive', Archive],
  ['notifications', 'Notifications', Megaphone],
];

const memberTabs = [
  ['events', 'Events', CalendarPlus],
  ['my-registrations', 'My Passes', Ticket],
  ['my-certificates', 'My Certificates', FileBadge],
  ['reviews', 'Review sessions', ClipboardCheck],
  ['profile', 'Profile', Users],
];

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-100">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-haryana-dark">{value}</p>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="block text-sm font-semibold text-gray-700">
      {label}
      <input {...props} className="mt-1 w-full rounded-lg border border-gray-200 p-3 font-normal outline-none focus:border-haryana-red focus:ring-1 focus:ring-haryana-red" />
    </label>
  );
}

export default function Dashboard({ api, user, token, pendingRegistration, onClose, onLogout }) {
  const isAdmin = user.role === 'admin' || user.role === 'coordinator';
  const [tab, setTab] = useState(isAdmin ? 'overview' : 'events');
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [allRegistrations, setAllRegistrations] = useState([]);
  const [registrationCategory, setRegistrationCategory] = useState('');
  const [analytics, setAnalytics] = useState({});
  const [members, setMembers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [auditions, setAuditions] = useState([]);
  const [auditionsLive, setAuditionsLive] = useState(false);

  // Attendance state
  const [selectedAttendanceEventId, setSelectedAttendanceEventId] = useState('');
  const [attendanceStats, setAttendanceStats] = useState({ registered: 0, present: 0, absent: 0, percentage: 0 });
  const [attendanceRoster, setAttendanceRoster] = useState([]);
  const [scanInput, setScanInput] = useState('');
  const [attendanceSearch, setAttendanceSearch] = useState('');

  // Certificates state
  const [certificateForm, setCertificateForm] = useState({ userId: '', eventId: '' });
  const [certificates, setCertificates] = useState([]);
  const [myCertificates, setMyCertificates] = useState([]);

  // Senior passout reviews state
  const [seniorReviews, setSeniorReviews] = useState([]);
  const [seniorReviewForm, setSeniorReviewForm] = useState({ authorName: '', role: 'Former Cultural Secretary', year: 'Batch 2022', quote: '', rating: '5', isPublic: true });

  // Misc state
  const [archive, setArchive] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reviewSessions, setReviewSessions] = useState([]);
  const [reviewSessionForm, setReviewSessionForm] = useState({ title: '', startsAt: '', venue: '', description: '' });
  const [archiveForm, setArchiveForm] = useState({ title: '', category: 'Dance', year: new Date().getFullYear(), description: '', mediaUrl: '' });
  const [registrationEvent, setRegistrationEvent] = useState(null);
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [eventForm, setEventForm] = useState({ title: '', venue: '', startsAt: '', description: '', registrationDeadline: '', seatLimit: '' });

  function load() {
    api('/events').then(data => {
      setEvents(data.events || []);
      if (data.events?.length && !selectedAttendanceEventId) {
        setSelectedAttendanceEventId(data.events[0].id);
      }
    }).catch(() => setEvents([]));

    api('/me/registrations', { token }).then(data => setRegistrations(data.registrations || [])).catch(() => setRegistrations([]));
    api('/me/certificates', { token }).then(data => setMyCertificates(data.certificates || [])).catch(() => setMyCertificates([]));
    api('/review-sessions').then(data => setReviewSessions(data.reviewSessions || [])).catch(() => setReviewSessions([]));

    if (isAdmin) {
      api(`/admin/registrations${registrationCategory ? `?category=${encodeURIComponent(registrationCategory)}` : ''}`, { token }).then(data => setAllRegistrations(data.registrations || [])).catch(() => setAllRegistrations([]));
      api('/admin/analytics', { token }).then(setAnalytics).catch(() => setAnalytics({}));
      api('/members', { token }).then(data => setMembers(data.members || [])).catch(() => setMembers([]));
      api('/admin/requests', { token }).then(data => setRequests(data.requests || [])).catch(() => setRequests([]));
      api('/announcements').then(data => setAnnouncements(data.announcements || [])).catch(() => setAnnouncements([]));
      api('/admin/auditions', { token }).then(data => setAuditions(data.auditions || [])).catch(() => setAuditions([]));
      api('/auditions/status').then(data => setAuditionsLive(data.auditionStatus?.live || false)).catch(() => setAuditionsLive(false));
      api('/archive').then(data => setArchive(data.archive || [])).catch(() => setArchive([]));
      api('/notifications', { token }).then(data => setNotifications(data.notifications || [])).catch(() => setNotifications([]));
      api('/admin/certificates', { token }).then(data => setCertificates(data.certificates || [])).catch(() => setCertificates([]));
      api('/admin/reviews', { token }).then(data => setSeniorReviews(data.reviews || [])).catch(() => setSeniorReviews([]));
    }
  }

  useEffect(load, [token, registrationCategory]);

  // Load attendance data when event changes or tab becomes 'attendance'
  function fetchAttendanceData(eventId) {
    if (!eventId) return;
    api(`/events/${eventId}/attendance`, { token }).then(setAttendanceStats).catch(() => setAttendanceStats({ registered: 0, present: 0, absent: 0, percentage: 0 }));
    api(`/events/${eventId}/attendance/list`, { token }).then(data => setAttendanceRoster(data.roster || [])).catch(() => setAttendanceRoster([]));
  }

  useEffect(() => {
    if (isAdmin && selectedAttendanceEventId && tab === 'attendance') {
      fetchAttendanceData(selectedAttendanceEventId);
    }
  }, [selectedAttendanceEventId, tab, isAdmin]);

  useEffect(() => {
    if (pendingRegistration && !isAdmin) {
      action(() => api(`/events/${pendingRegistration.eventId}/register`, { method: 'POST', token, body: { category: pendingRegistration.category } }), `Registered for ${pendingRegistration.category}. Your QR pass is ready in My Passes.`);
    }
  }, [pendingRegistration, isAdmin]);

  async function action(work, success = 'Saved.') {
    try {
      await work();
      setNotice(success);
      load();
      if (selectedAttendanceEventId && tab === 'attendance') {
        fetchAttendanceData(selectedAttendanceEventId);
      }
    } catch (error) {
      setNotice(error.message);
    }
  }

  // Attendance actions
  async function submitScanAttendance(event) {
    event.preventDefault();
    if (!scanInput.trim() || !selectedAttendanceEventId) return;
    try {
      const res = await api(`/events/${selectedAttendanceEventId}/attendance`, { method: 'POST', token, body: { registrationId: scanInput.trim() } });
      setNotice(`Attendance marked Present for ${res.studentName || 'Student'} (${scanInput})`);
      setScanInput('');
      fetchAttendanceData(selectedAttendanceEventId);
    } catch (err) {
      setNotice(err.message);
    }
  }

  async function toggleStudentAttendance(registrationId, currentStatus) {
    if (!selectedAttendanceEventId) return;
    try {
      await api(`/events/${selectedAttendanceEventId}/attendance/toggle`, { method: 'POST', token, body: { registrationId, present: !currentStatus } });
      fetchAttendanceData(selectedAttendanceEventId);
    } catch (err) {
      setNotice(err.message);
    }
  }

  // Events & Admin actions
  async function createEvent(event) {
    event.preventDefault();
    await action(() => api('/events', { method: 'POST', token, body: eventForm }), 'Event created.');
    setEventForm({ title: '', venue: '', startsAt: '', description: '', registrationDeadline: '', seatLimit: '' });
  }

  function register(eventId, category) {
    action(() => api(`/events/${eventId}/register`, { method: 'POST', token, body: { category } }), `Registered for ${category}. Your QR pass is ready in My Passes.`);
    setRegistrationEvent(null);
  }

  function markRequest(id, status) {
    action(() => api(`/admin/requests/${id}`, { method: 'PATCH', token, body: { status } }));
  }

  function changeRole(id, role) {
    action(() => api(`/members/${id}/role`, { method: 'PATCH', token, body: { role } }), 'Role updated.');
  }

  function changeAudition(id, status) {
    action(() => api(`/admin/auditions/${id}`, { method: 'PATCH', token, body: { status } }), 'Audition updated.');
  }

  function toggleAuditions() {
    action(() => api('/admin/auditions/status', { method: 'PATCH', token, body: { live: !auditionsLive } }).then(() => setAuditionsLive(!auditionsLive)), auditionsLive ? 'Auditions closed.' : 'Auditions are live.');
  }

  async function issueCertificate(event) {
    event.preventDefault();
    await action(() => api('/admin/certificates', { method: 'POST', token, body: certificateForm }), 'Certificate generated and ready to print.');
    setCertificateForm({ userId: '', eventId: '' });
  }

  async function createSeniorReview(event) {
    event.preventDefault();
    await action(() => api('/admin/reviews', { method: 'POST', token, body: seniorReviewForm }), 'Senior passout review published.');
    setSeniorReviewForm({ authorName: '', role: 'Former Cultural Lead', year: 'Batch 2022', quote: '', rating: '5', isPublic: true });
    load();
  }

  function toggleSeniorReviewPublic(id, currentPublic) {
    action(() => api(`/admin/reviews/${id}`, { method: 'PATCH', token, body: { isPublic: !currentPublic } })).then(load);
  }

  function deleteSeniorReview(id) {
    action(() => api(`/admin/reviews/${id}`, { method: 'DELETE', token }), 'Review removed.').then(load);
  }

  async function createReviewSession(event) {
    event.preventDefault();
    await action(() => api('/admin/review-sessions', { method: 'POST', token, body: reviewSessionForm }), 'Review session scheduled.');
    setReviewSessionForm({ title: '', startsAt: '', venue: '', description: '' });
  }

  function deleteReviewSession(id) {
    action(() => api(`/admin/review-sessions/${id}`, { method: 'DELETE', token }), 'Review session removed.');
  }

  function printCertificate(certificate) {
    const escapeHtml = value => String(value || '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]);

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=HM-CERT:${encodeURIComponent(certificate.certificateId)}`;

    const htmlContent = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Certificate - ${escapeHtml(certificate.certificateId)}</title>
  <style>
    @page { size: A4 landscape; margin: 0; }
    html, body { width: 100%; height: 100%; margin: 0; padding: 0; background: #faf6ed; font-family: 'Georgia', 'Times New Roman', serif; color: #2c1810; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print-bar { background: #1a1a1a; color: #fff; padding: 12px; text-align: center; font-family: system-ui, sans-serif; font-size: 14px; position: sticky; top: 0; z-index: 100; display: flex; align-items: center; justify-content: center; gap: 16px; border-bottom: 2px solid #d4a53c; }
    .no-print-btn { background: #d4a53c; color: #1a1a1a; border: none; padding: 8px 20px; font-weight: bold; border-radius: 6px; cursor: pointer; font-size: 14px; transition: background 0.2s; }
    .no-print-btn:hover { background: #e2b755; }
    .cert-page { width: 100%; min-height: calc(100vh - 55px); box-sizing: border-box; padding: 12mm; display: flex; align-items: center; justify-content: center; }
    .cert-container { box-sizing: border-box; width: 280mm; height: 195mm; padding: 10mm; position: relative; background: #fffdf9; border: 16px solid #7d1d1d; outline: 4px solid #d4a53c; outline-offset: -10px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); text-align: center; display: flex; flex-direction: column; justify-content: space-between; }
    .inner-border { border: 2px dashed #d4a53c; height: 100%; box-sizing: border-box; padding: 20px 30px; display: flex; flex-direction: column; justify-content: space-between; position: relative; }
    .org-name { font-size: 15px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase; color: #7d1d1d; margin-bottom: 4px; }
    .sub-org { font-size: 12px; font-family: system-ui, sans-serif; letter-spacing: 2px; text-transform: uppercase; color: #b8860b; margin-bottom: 10px; }
    .title { font-size: 34px; font-weight: bold; color: #7d1d1d; text-transform: uppercase; letter-spacing: 3px; margin: 4px 0 10px; border-bottom: 2px solid #d4a53c; display: inline-block; padding-bottom: 4px; }
    .present-text { font-size: 15px; font-style: italic; color: #555; margin-bottom: 6px; }
    .name { font-size: 34px; font-weight: bold; color: #1a1a1a; margin: 6px 0; font-family: 'Georgia', serif; letter-spacing: 1px; text-decoration: underline decoration-color #d4a53c; text-underline-offset: 6px; }
    .desc { font-size: 16px; color: #444; max-width: 800px; margin: 10px auto; line-height: 1.5; }
    .event-title { font-size: 22px; font-weight: bold; color: #7d1d1d; }
    .details { font-size: 13px; font-family: system-ui, sans-serif; color: #666; margin-top: 4px; }
    .footer-sec { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 15px; font-family: system-ui, sans-serif; }
    .sig-box { text-align: center; width: 180px; }
    .sig-line { border-top: 1.5px solid #2c1810; margin-bottom: 6px; }
    .sig-title { font-size: 12px; font-weight: bold; color: #333; }
    .qr-box { text-align: center; }
    .qr-box img { width: 85px; height: 85px; border: 1px solid #ddd; padding: 2px; background: white; }
    .cert-id { font-size: 11px; font-family: monospace; color: #7d1d1d; font-weight: bold; margin-top: 4px; }
    @media print {
      .no-print-bar { display: none !important; }
      body { background: white; }
      .cert-page { padding: 0; min-height: 100vh; }
      .cert-container { width: 297mm; height: 210mm; border-color: #7d1d1d; box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <span>Certificate Preview — Ready to Print or Save as PDF</span>
    <button class="no-print-btn" onclick="window.print()">Print / Save PDF</button>
  </div>
  <div class="cert-page">
    <div class="cert-container">
      <div class="inner-border">
        <div>
          <div class="org-name">Deenbandhu Chhotu Ram University of Science & Technology</div>
          <div class="sub-org">Haryanvi Mandli Cultural Society</div>
          <div class="title">Certificate of Participation</div>
        </div>
        <div>
          <div class="present-text">This certificate is proudly awarded to</div>
          <div class="name">${escapeHtml(certificate.recipient?.name || 'Member')}</div>
          ${certificate.recipient?.rollNo ? `<div class="details">Roll No: <strong>${escapeHtml(certificate.recipient.rollNo)}</strong> ${certificate.recipient.branch ? `| Branch: <strong>${escapeHtml(certificate.recipient.branch)}</strong>` : ''}</div>` : ''}
          <div class="desc">
            for active participation and valuable cultural performance in <br>
            <span class="event-title">${escapeHtml(certificate.event?.title || 'Cultural Event')}</span>
          </div>
          <div class="details">Held at ${escapeHtml(certificate.event?.venue || 'DCRUST Campus')} · Issued on ${new Date(certificate.issuedAt || Date.now()).toLocaleDateString()}</div>
        </div>
        <div class="footer-sec">
          <div class="sig-box">
            <div class="sig-line"></div>
            <div class="sig-title">Cultural Coordinator</div>
          </div>
          <div class="qr-box">
            <img src="${qrUrl}" alt="QR Verification" />
            <div class="cert-id">${escapeHtml(certificate.certificateId)}</div>
          </div>
          <div class="sig-box">
            <div class="sig-line"></div>
            <div class="sig-title">Society President</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <script>
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        window.print();
      }, 400);
    });
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const printWindow = window.open(blobUrl, '_blank');
    if (!printWindow) {
      setNotice('Please allow pop-ups in your browser to print certificates.');
    }
  }

  async function createArchiveItem(event) {
    event.preventDefault();
    await action(() => api('/admin/archive', { method: 'POST', token, body: archiveForm }), 'Archive item added.');
    setArchiveForm({ title: '', category: 'Dance', year: new Date().getFullYear(), description: '', mediaUrl: '' });
  }

  const filteredRoster = attendanceRoster.filter(item => {
    const q = attendanceSearch.toLowerCase();
    return !q || `${item.studentName} ${item.email} ${item.rollNo} ${item.registrationId} ${item.category}`.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-haryana-cream">
      <div className="min-h-screen w-full px-4 sm:px-6 py-8">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-[.2em] text-haryana-red">
              <ShieldCheck size={17} /> {isAdmin ? 'Management workspace' : 'Member workspace'}
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-haryana-dark">
              {isAdmin ? 'Mandli Control Center' : `Namaste, ${user.name || 'member'}`}
            </h1>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-lg border border-haryana-dark/20 p-2 text-haryana-dark hover:bg-white transition-colors" aria-label="Close dashboard">
              <X />
            </button>
            <button onClick={onLogout} className="flex items-center gap-2 rounded-lg bg-haryana-dark px-4 py-2 text-sm font-semibold text-white hover:bg-black transition-colors">
              <LogOut size={16} /> Log out
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="mb-8 flex gap-2 overflow-x-auto border-b border-haryana-dark/10 pb-2">
          {(isAdmin ? adminTabs : memberTabs).map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                tab === id ? 'bg-haryana-dark text-white shadow-md' : 'text-haryana-dark hover:bg-white'
              }`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {notice && (
          <div className="mb-5 flex items-center justify-between rounded-xl bg-haryana-dark px-5 py-3.5 text-sm text-white shadow-lg">
            <span>{notice}</span>
            <button onClick={() => setNotice('')} aria-label="Dismiss message">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Modal for student registration category selection */}
        {registrationEvent && !isAdmin && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.2em] text-haryana-red">Registration</p>
                  <h2 className="mt-1 text-2xl font-bold text-haryana-dark">{registrationEvent.title}</h2>
                </div>
                <button onClick={() => setRegistrationEvent(null)} aria-label="Close registration options" className="text-gray-500 hover:text-red-500">
                  <X />
                </button>
              </div>
              <p className="mt-4 text-sm text-gray-600">Choose your participation category:</p>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {['Dance', 'Dramatic', 'Music', 'Theatre', 'Fine Arts'].map(category => (
                  <button
                    key={category}
                    onClick={() => register(registrationEvent.id, category)}
                    className="rounded-lg border border-haryana-red/20 px-4 py-3 text-left font-semibold text-haryana-dark hover:bg-haryana-cream transition-colors"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <section>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Stat label="Members" value={analytics.members || 0} />
              <Stat label="Events" value={analytics.events || 0} />
              <Stat label="Registrations" value={analytics.registrations || 0} />
              <Stat label="Active events" value={analytics.activeEvents || 0} />
              <Stat label="Present scans" value={analytics.attendance || 0} />
            </div>
            <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-haryana-dark">Platform Status</h2>
              <p className="mt-2 text-gray-600">The dashboard is connected to the protected API and persistent data store. Use the navigation tabs to manage members, events, attendance, and certificates.</p>
            </div>
          </section>
        )}

        {/* MEMBER PASSES & REGISTRATIONS TAB */}
        {tab === 'my-registrations' && (
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-haryana-dark">My Event Passes</h2>
              <p className="text-sm text-gray-600">Present your entry pass ID or QR payload at the event check-in desk.</p>
            </div>
            {registrations.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 text-center text-gray-600 shadow-sm">You have not registered for any events yet. Check the Events tab to register!</div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {registrations.map(reg => {
                  const ev = events.find(e => e.id === reg.eventId);
                  return (
                    <div key={reg.id} className="rounded-2xl border-2 border-haryana-red/20 bg-white p-6 shadow-md folk-border flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="rounded-full bg-haryana-red/10 px-3 py-1 text-xs font-bold text-haryana-red">{reg.category}</span>
                          <QrCode className="text-haryana-dark" size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-haryana-dark">{ev?.title || 'Cultural Event'}</h3>
                        <p className="mt-1 text-xs text-gray-500">{ev?.venue || 'Campus Venue'} · {ev?.startsAt ? new Date(ev.startsAt).toLocaleString() : ''}</p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-dashed border-gray-200">
                        <p className="text-xs text-gray-400 font-medium">Registration ID</p>
                        <p className="text-lg font-mono font-bold text-haryana-red">{reg.registrationId}</p>
                        <p className="mt-1 text-[11px] text-gray-400 font-mono">Payload: HM-PASS:{reg.registrationId}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* MEMBER CERTIFICATES TAB */}
        {tab === 'my-certificates' && (
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-haryana-dark">My Certificates</h2>
              <p className="text-sm text-gray-600">Official verified certificates awarded to you by Haryanvi Mandli.</p>
            </div>
            {myCertificates.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 text-center text-gray-600 shadow-sm">No certificates issued to your account yet. Participating in Mandli events qualifies you for digital certificates!</div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {myCertificates.map(cert => (
                  <div key={cert.id} className="rounded-2xl border border-haryana-mustard/40 bg-white p-6 shadow-md flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-haryana-red font-bold text-sm mb-2">
                        <Award size={18} /> Official Participation Certificate
                      </div>
                      <h3 className="text-2xl font-bold text-haryana-dark">{cert.event?.title || 'Cultural Event'}</h3>
                      <p className="mt-1 text-sm text-gray-600">{cert.event?.venue} · Issued: {new Date(cert.issuedAt).toLocaleDateString()}</p>
                      <p className="mt-3 font-mono text-xs font-semibold text-haryana-red">ID: {cert.certificateId}</p>
                    </div>
                    <button onClick={() => printCertificate(cert)} className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-haryana-dark px-4 py-2.5 text-sm font-semibold text-white hover:bg-black transition-colors w-full">
                      <Printer size={16} /> Print / Download PDF
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ALL REGISTRATIONS TAB (ADMIN) */}
        {tab === 'registrations' && (
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-haryana-dark">Event Registrations</h2>
                <p className="mt-1 text-gray-600">Student selections collected from every event form.</p>
              </div>
              <select value={registrationCategory} onChange={event => setRegistrationCategory(event.target.value)} className="rounded-lg border border-gray-200 p-3 bg-white text-sm outline-none">
                <option value="">All categories</option>
                <option>Dance</option>
                <option>Dramatic</option>
                <option>Music</option>
                <option>Theatre</option>
                <option>Fine Arts</option>
              </select>
            </div>
            <div className="overflow-x-auto rounded-2xl bg-white shadow-sm border border-gray-100">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="border-b bg-gray-50 text-gray-500 font-semibold">
                  <tr>
                    <th className="p-4">Student</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Event</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Registration ID</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {allRegistrations.length === 0 ? (
                    <tr><td colSpan="6" className="p-8 text-center text-gray-600">No student registrations found.</td></tr>
                  ) : (
                    allRegistrations.map(registration => (
                      <tr key={registration.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="p-4 font-semibold text-haryana-dark">{registration.student}</td>
                        <td className="p-4 text-gray-600">{registration.email}</td>
                        <td className="p-4 font-medium text-gray-800">{registration.event}</td>
                        <td className="p-4"><span className="rounded-full bg-haryana-cream px-3 py-1 font-semibold text-xs text-haryana-red">{registration.category}</span></td>
                        <td className="p-4 font-mono text-xs font-bold text-haryana-dark">{registration.registrationId}</td>
                        <td className="p-4 text-gray-500">{new Date(registration.registeredAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* EVENTS TAB */}
        {tab === 'events' && (
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-haryana-dark">{isAdmin ? 'Manage Events' : 'Upcoming Events'}</h2>
            </div>
            {isAdmin && (
              <form onSubmit={createEvent} className="mb-8 grid gap-4 rounded-2xl bg-white p-6 shadow-sm border border-gray-100 md:grid-cols-2">
                <Field label="Event title *" required value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} />
                <Field label="Venue *" required value={eventForm.venue} onChange={e => setEventForm({ ...eventForm, venue: e.target.value })} />
                <Field label="Date and time *" required type="datetime-local" value={eventForm.startsAt} onChange={e => setEventForm({ ...eventForm, startsAt: e.target.value })} />
                <Field label="Registration deadline" type="datetime-local" value={eventForm.registrationDeadline} onChange={e => setEventForm({ ...eventForm, registrationDeadline: e.target.value })} />
                <Field label="Seat limit" type="number" min="0" value={eventForm.seatLimit} onChange={e => setEventForm({ ...eventForm, seatLimit: e.target.value })} />
                <label className="text-sm font-semibold text-gray-700">
                  Description *
                  <textarea required className="mt-1 w-full rounded-lg border border-gray-200 p-3 font-normal outline-none focus:border-haryana-red" rows="2" value={eventForm.description} onChange={e => setEventForm({ ...eventForm, description: e.target.value })} />
                </label>
                <button className="rounded-xl bg-haryana-red px-5 py-3 font-semibold text-white hover:bg-red-700 transition-colors md:col-span-2">Create Event</button>
              </form>
            )}
            <div className="grid gap-5 lg:grid-cols-2">
              {events.length === 0 ? (
                <div className="rounded-2xl bg-white p-8 text-gray-600 shadow-sm">No events published yet.</div>
              ) : (
                events.map(event => (
                  <article key={event.id} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-haryana-red">{new Date(event.startsAt).toLocaleString()}</p>
                        <h3 className="mt-1 text-2xl font-bold text-haryana-dark">{event.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">{event.venue}</p>
                      </div>
                      <Ticket className="text-haryana-red" size={28} />
                    </div>
                    <p className="mt-4 text-gray-600 leading-relaxed text-sm">{event.description}</p>
                    {!isAdmin && (
                      <button onClick={() => setRegistrationEvent(event)} className="mt-5 flex items-center gap-2 rounded-lg bg-haryana-dark px-4 py-2.5 text-sm font-semibold text-white hover:bg-black transition-colors">
                        <CheckCircle size={16} /> Register / Get Pass
                      </button>
                    )}
                  </article>
                ))
              )}
            </div>
          </section>
        )}

        {/* PROFILE TAB */}
        {tab === 'profile' && (
          <section className="max-w-3xl rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
            <h2 className="text-3xl font-bold text-haryana-dark">My Profile</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Stat label="Name" value={user.name} />
              <Stat label="Email" value={user.email} />
              <Stat label="Role" value={user.role} />
              <Stat label="Branch" value={user.branch || 'Not specified'} />
              <Stat label="Roll No" value={user.rollNo || 'Not specified'} />
              <Stat label="Year" value={user.year || 'Not specified'} />
              <Stat label="Mobile No" value={user.phone || 'Not specified'} />
              <Stat label="Interest" value={user.interest || 'Not specified'} />
              <Stat label="Registered events" value={registrations.length} />
            </div>
          </section>
        )}

        {/* MEMBERS TAB (ADMIN) */}
        {tab === 'members' && (
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full max-w-md bg-white rounded-lg px-3 py-1 border border-gray-200">
                <Search className="text-gray-400" size={18} />
                <input value={search} onChange={e => { setSearch(e.target.value); api(`/members?search=${encodeURIComponent(e.target.value)}`, { token }).then(data => setMembers(data.members || [])); }} placeholder="Search name, branch, roll no, interest..." className="w-full border-0 p-2 text-sm outline-none" />
              </div>
              <span className="text-sm font-semibold text-gray-500">Total Mandli Members: {members.length}</span>
            </div>
            <div className="overflow-x-auto rounded-2xl bg-white shadow-sm border border-gray-100">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b bg-haryana-cream/50 text-gray-600 font-semibold">
                  <tr>
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Mobile No</th>
                    <th className="p-4">Branch</th>
                    <th className="p-4">Roll No</th>
                    <th className="p-4">Year</th>
                    <th className="p-4">Interest</th>
                    <th className="p-4">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {members.length === 0 ? (
                    <tr><td colSpan="8" className="p-8 text-center text-gray-600">No members match your search criteria.</td></tr>
                  ) : (
                    members.map(member => (
                      <tr key={member.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="p-4 font-bold text-haryana-dark">{member.name}</td>
                        <td className="p-4 text-gray-600">{member.email}</td>
                        <td className="p-4 font-mono text-xs">{member.phone || '—'}</td>
                        <td className="p-4"><span className="rounded bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">{member.branch || '—'}</span></td>
                        <td className="p-4 font-mono text-xs text-gray-600">{member.rollNo || '—'}</td>
                        <td className="p-4 text-xs font-medium text-gray-600">{member.year || '—'}</td>
                        <td className="p-4"><span className="rounded-full bg-haryana-cream px-3 py-1 text-xs font-bold text-haryana-red">{member.interest || 'General'}</span></td>
                        <td className="p-4">
                          <select value={member.role} onChange={e => changeRole(member.id, e.target.value)} className="rounded border border-gray-200 p-1.5 text-xs font-semibold bg-white outline-none">
                            <option>member</option>
                            <option>coordinator</option>
                            <option>visitor</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ATTENDANCE MANAGEMENT TAB (ADMIN) */}
        {tab === 'attendance' && (
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-haryana-dark">Attendance Management Center</h2>
              <p className="text-sm text-gray-600">Select an event, view registered student rosters, mark present/absent, or scan Registration IDs.</p>
            </div>

            {/* Event Selector */}
            <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Select Event for Attendance</label>
              <select
                value={selectedAttendanceEventId}
                onChange={e => setSelectedAttendanceEventId(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-3 font-semibold text-haryana-dark outline-none focus:border-haryana-red"
              >
                {events.length === 0 ? <option value="">No events available</option> : events.map(event => <option key={event.id} value={event.id}>{event.title} ({new Date(event.startsAt).toLocaleDateString()})</option>)}
              </select>
            </div>

            {/* Stats Grid */}
            <div className="mb-6 grid gap-4 sm:grid-cols-4">
              <Stat label="Registered Students" value={attendanceStats.registered} />
              <Stat label="Present" value={attendanceStats.present} />
              <Stat label="Absent" value={attendanceStats.absent} />
              <Stat label="Attendance %" value={`${attendanceStats.percentage}%`} />
            </div>

            {/* Quick Scan / Registration ID Box */}
            <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-haryana-dark mb-2 flex items-center gap-2">
                <QrCode className="text-haryana-red" size={20} /> Quick Scan / Mark Attendance
              </h3>
              <p className="text-xs text-gray-500 mb-4">Enter or scan Registration ID (e.g. <strong>HM2026-0001</strong> or <strong>HM-PASS:HM2026-0001</strong>) to instantly mark attendance.</p>
              <form onSubmit={submitScanAttendance} className="flex gap-3 max-w-xl">
                <input
                  value={scanInput}
                  onChange={e => setScanInput(e.target.value)}
                  placeholder="Scan or type Registration ID (e.g. HM2026-0001)..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-mono outline-none focus:border-haryana-red focus:ring-1 focus:ring-haryana-red"
                />
                <button type="submit" className="shrink-0 rounded-xl bg-haryana-red px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-colors flex items-center gap-2">
                  <UserCheck size={18} /> Mark Present
                </button>
              </form>
            </div>

            {/* Student Roster Table */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <h3 className="text-lg font-bold text-haryana-dark">Registered Student Roster</h3>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-full max-w-xs">
                  <Search className="text-gray-400" size={16} />
                  <input value={attendanceSearch} onChange={e => setAttendanceSearch(e.target.value)} placeholder="Filter roster..." className="w-full bg-transparent outline-none text-xs" />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px] text-left text-sm">
                  <thead className="border-b bg-gray-50 text-gray-500 font-semibold">
                    <tr>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Branch & Roll</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Registration ID</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRoster.length === 0 ? (
                      <tr><td colSpan="6" className="p-8 text-center text-gray-500">No students registered for this event yet.</td></tr>
                    ) : (
                      filteredRoster.map(student => (
                        <tr key={student.registrationId} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="p-3 font-semibold text-haryana-dark">
                            <div>{student.studentName}</div>
                            <div className="text-xs font-normal text-gray-500">{student.email}</div>
                          </td>
                          <td className="p-3 text-xs text-gray-600">
                            <div>{student.branch || '—'}</div>
                            <div className="font-mono text-gray-500">{student.rollNo || '—'}</div>
                          </td>
                          <td className="p-3"><span className="rounded-full bg-haryana-cream px-2.5 py-0.5 text-xs font-bold text-haryana-red">{student.category}</span></td>
                          <td className="p-3 font-mono text-xs font-bold text-haryana-dark">{student.registrationId}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${student.present ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {student.present ? <CheckCircle size={13} /> : <AlertCircle size={13} />}
                              {student.present ? 'Present' : 'Absent'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => toggleStudentAttendance(student.registrationId, student.present)}
                              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                                student.present ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              {student.present ? 'Mark Absent' : 'Mark Present'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* CERTIFICATES MANAGEMENT TAB (ADMIN) */}
        {tab === 'certificates' && (
          <section>
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-haryana-dark">Digital Certificates Management</h2>
              <p className="mt-1 text-sm text-gray-600">Generate verified certificates for members and print high-resolution copies.</p>
            </div>

            <form onSubmit={issueCertificate} className="mb-8 grid gap-4 rounded-2xl bg-white p-6 shadow-sm border border-gray-100 sm:grid-cols-2">
              <label className="text-sm font-semibold text-gray-700">
                Select Member *
                <select required value={certificateForm.userId} onChange={e => setCertificateForm({ ...certificateForm, userId: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-200 p-3 bg-white font-normal outline-none focus:border-haryana-red">
                  <option value="">Choose member</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>{member.name} ({member.email})</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold text-gray-700">
                Select Event *
                <select required value={certificateForm.eventId} onChange={e => setCertificateForm({ ...certificateForm, eventId: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-200 p-3 bg-white font-normal outline-none focus:border-haryana-red">
                  <option value="">Choose event</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>{event.title}</option>
                  ))}
                </select>
              </label>
              <button className="rounded-xl bg-haryana-red px-5 py-3 font-semibold text-white hover:bg-red-700 transition-colors sm:col-span-2 flex items-center justify-center gap-2">
                <Award size={18} /> Generate Official Certificate
              </button>
            </form>

            <div className="space-y-4">
              {certificates.length === 0 ? (
                <div className="rounded-2xl bg-white p-8 text-center text-gray-600 shadow-sm">No certificates generated yet.</div>
              ) : (
                certificates.map(certificate => (
                  <article key={certificate.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                    <div>
                      <h3 className="text-lg font-bold text-haryana-dark">{certificate.recipient?.name || 'Member'}</h3>
                      <p className="mt-1 text-sm text-gray-600">{certificate.event?.title} · Issued on {new Date(certificate.issuedAt).toLocaleDateString()}</p>
                      <p className="mt-2 font-mono text-xs font-bold text-haryana-red">{certificate.certificateId}</p>
                    </div>
                    <button onClick={() => printCertificate(certificate)} className="flex items-center gap-2 rounded-xl bg-haryana-dark px-4 py-2.5 text-sm font-semibold text-white hover:bg-black transition-colors">
                      <Printer size={16} /> Print / Save PDF
                    </button>
                  </article>
                ))
              )}
            </div>
          </section>
        )}

        {/* SENIOR PASSOUT REVIEWS TAB (ADMIN) */}
        {tab === 'senior-reviews' && (
          <section>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-haryana-dark">Senior Passout Reviews & Testimonials</h2>
                <p className="mt-1 text-sm text-gray-600">Manage alumni feedback. Toggle public visibility to publish directly to the home page.</p>
              </div>
            </div>

            {isAdmin && (
              <form onSubmit={createSeniorReview} className="mb-8 grid gap-4 rounded-2xl bg-white p-6 shadow-sm border border-gray-100 sm:grid-cols-2">
                <Field label="Alumni / Passout Name *" required value={seniorReviewForm.authorName} onChange={e => setSeniorReviewForm({ ...seniorReviewForm, authorName: e.target.value })} placeholder="e.g. Rohan Sharma" />
                <Field label="Role / Designation *" required value={seniorReviewForm.role} onChange={e => setSeniorReviewForm({ ...seniorReviewForm, role: e.target.value })} placeholder="e.g. Former Cultural Lead · CSE" />
                <Field label="Passout Year / Batch *" required value={seniorReviewForm.year} onChange={e => setSeniorReviewForm({ ...seniorReviewForm, year: e.target.value })} placeholder="e.g. Batch 2021" />
                <label className="text-sm font-semibold text-gray-700">
                  Star Rating (1 - 5)
                  <select value={seniorReviewForm.rating} onChange={e => setSeniorReviewForm({ ...seniorReviewForm, rating: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-200 p-3 bg-white outline-none">
                    <option value="5">5 Stars (Excellent)</option>
                    <option value="4">4 Stars (Great)</option>
                    <option value="3">3 Stars (Good)</option>
                  </select>
                </label>
                <label className="text-sm font-semibold text-gray-700 sm:col-span-2">
                  Testimonial / Review Text *
                  <textarea required className="mt-1 w-full rounded-lg border border-gray-200 p-3 font-normal outline-none focus:border-haryana-red" rows="3" placeholder="Share their experience and words of wisdom..." value={seniorReviewForm.quote} onChange={e => setSeniorReviewForm({ ...seniorReviewForm, quote: e.target.value })} />
                </label>
                <div className="flex items-center gap-3 sm:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={seniorReviewForm.isPublic} onChange={e => setSeniorReviewForm({ ...seniorReviewForm, isPublic: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-haryana-red focus:ring-haryana-red" />
                    Make Public on Website
                  </label>
                </div>
                <button className="rounded-xl bg-haryana-red px-5 py-3 font-semibold text-white hover:bg-red-700 transition-colors sm:col-span-2">Publish Senior Review</button>
              </form>
            )}

            <div className="space-y-4">
              {seniorReviews.length === 0 ? (
                <div className="rounded-2xl bg-white p-7 text-center text-gray-600 shadow-sm">No senior reviews added yet.</div>
              ) : (
                seniorReviews.map(review => (
                  <article key={review.id} className="flex flex-col sm:flex-row items-start justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-haryana-dark text-lg">{review.authorName}</h3>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${review.isPublic !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {review.isPublic !== false ? 'Public' : 'Hidden'}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-haryana-red">{review.role} · {review.year}</p>
                      <p className="text-gray-700 text-sm italic leading-relaxed pt-1">“{review.quote}”</p>
                    </div>
                    <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                      <button onClick={() => toggleSeniorReviewPublic(review.id, review.isPublic !== false)} className="rounded-lg bg-haryana-dark/5 px-3 py-1.5 text-xs font-semibold text-haryana-dark hover:bg-haryana-dark hover:text-white transition-colors">
                        {review.isPublic !== false ? 'Hide from Public' : 'Make Public'}
                      </button>
                      <button onClick={() => deleteSeniorReview(review.id)} className="rounded-lg border border-red-200 p-1.5 text-haryana-red hover:bg-red-50" aria-label="Delete review">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        )}

        {/* REQUESTS TAB (ADMIN) */}
        {tab === 'requests' && (
          <section>
            <h2 className="mb-5 text-2xl font-bold text-haryana-dark">Contact Requests</h2>
            <div className="space-y-4">
              {requests.map(request => (
                <article key={request.id} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                  <div className="flex justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-haryana-dark text-lg">{request.name}</h3>
                      <p className="text-sm text-haryana-red">{request.email}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${request.status === 'Handled' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{request.status}</span>
                  </div>
                  <p className="mt-3 text-gray-600 leading-relaxed text-sm">{request.message}</p>
                  <button onClick={() => markRequest(request.id, request.status === 'Handled' ? 'Pending' : 'Handled')} className="mt-4 rounded-lg bg-haryana-dark px-4 py-2 text-xs font-semibold text-white hover:bg-black">
                    Toggle Status
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* NOTICES TAB (ADMIN) */}
        {tab === 'announcements' && (
          <section>
            <h2 className="mb-5 text-2xl font-bold text-haryana-dark">Announcements</h2>
            {announcements.map(item => (
              <article key={item.id} className="mb-4 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-haryana-dark text-lg">{item.title}</h3>
                <p className="mt-2 text-gray-600 text-sm leading-relaxed">{item.content}</p>
              </article>
            ))}
          </section>
        )}

        {/* AUDITIONS TAB (ADMIN) */}
        {tab === 'auditions' && (
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-haryana-dark">Audition Applications Review</h2>
              <button onClick={toggleAuditions} className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm ${auditionsLive ? 'bg-haryana-red hover:bg-red-700' : 'bg-haryana-dark hover:bg-black'}`}>
                {auditionsLive ? 'Close Auditions' : 'Start Auditions'}
              </button>
            </div>
            <p className="mb-5 text-sm text-gray-600">Public Status: <strong>{auditionsLive ? 'Auditions are Live' : 'Auditions are Closed'}</strong></p>
            <div className="space-y-4">
              {auditions.map(item => (
                <article key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                  <div>
                    <h3 className="font-bold text-haryana-dark text-lg">{item.applicant}</h3>
                    <p className="text-sm text-gray-500">{item.email} · Category: <strong className="text-haryana-red">{item.category}</strong></p>
                  </div>
                  <select value={item.status} onChange={e => changeAudition(item.id, e.target.value)} className="rounded-lg border border-gray-200 p-2 text-xs font-semibold bg-white outline-none">
                    <option>Pending</option>
                    <option>Shortlisted</option>
                    <option>Selected</option>
                    <option>Rejected</option>
                  </select>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* REVIEWS TAB */}
        {tab === 'reviews' && (
          <section>
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-haryana-dark">Review Sessions</h2>
              <p className="mt-1 text-sm text-gray-600">{isAdmin ? 'Schedule review meetings for performances, preparations, and event feedback.' : 'Keep track of upcoming Mandli review sessions.'}</p>
            </div>
            {isAdmin && (
              <form onSubmit={createReviewSession} className="mb-8 grid gap-4 rounded-2xl bg-white p-6 shadow-sm border border-gray-100 sm:grid-cols-2">
                <Field label="Session title *" required value={reviewSessionForm.title} onChange={e => setReviewSessionForm({ ...reviewSessionForm, title: e.target.value })} />
                <Field label="Date and time *" required type="datetime-local" value={reviewSessionForm.startsAt} onChange={e => setReviewSessionForm({ ...reviewSessionForm, startsAt: e.target.value })} />
                <Field label="Venue / meeting link *" required value={reviewSessionForm.venue} onChange={e => setReviewSessionForm({ ...reviewSessionForm, venue: e.target.value })} />
                <label className="text-sm font-semibold text-gray-700">
                  Agenda or notes
                  <textarea className="mt-1 w-full rounded-lg border border-gray-200 p-3 font-normal outline-none focus:border-haryana-red" rows="2" value={reviewSessionForm.description} onChange={e => setReviewSessionForm({ ...reviewSessionForm, description: e.target.value })} />
                </label>
                <button className="rounded-xl bg-haryana-red px-5 py-3 font-semibold text-white hover:bg-red-700 transition-colors sm:col-span-2">Schedule Review Session</button>
              </form>
            )}
            <div className="grid gap-4 lg:grid-cols-2">
              {reviewSessions.length === 0 ? (
                <div className="rounded-2xl bg-white p-7 text-gray-600 shadow-sm">No review sessions scheduled.</div>
              ) : (
                reviewSessions.map(session => (
                  <article key={session.id} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-haryana-red">{new Date(session.startsAt).toLocaleString()}</p>
                        <h3 className="mt-1 text-xl font-bold text-haryana-dark">{session.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">{session.venue}</p>
                      </div>
                      {isAdmin && (
                        <button onClick={() => deleteReviewSession(session.id)} className="rounded-lg border border-red-200 p-2 text-haryana-red hover:bg-red-50" aria-label={`Delete ${session.title}`}>
                          <Trash2 size={17} />
                        </button>
                      )}
                    </div>
                    {session.description && <p className="mt-4 text-sm text-gray-600 leading-relaxed">{session.description}</p>}
                  </article>
                ))
              )}
            </div>
          </section>
        )}

        {/* ARCHIVE TAB */}
        {tab === 'archive' && (
          <section>
            <h2 className="mb-5 text-2xl font-bold text-haryana-dark">Cultural Archive</h2>
            {isAdmin && (
              <form onSubmit={createArchiveItem} className="mb-8 grid gap-4 rounded-2xl bg-white p-6 shadow-sm border border-gray-100 sm:grid-cols-2">
                <Field label="Title *" required value={archiveForm.title} onChange={e => setArchiveForm({ ...archiveForm, title: e.target.value })} />
                <Field label="Year *" required type="number" value={archiveForm.year} onChange={e => setArchiveForm({ ...archiveForm, year: e.target.value })} />
                <label className="text-sm font-semibold text-gray-700">
                  Category
                  <select value={archiveForm.category} onChange={e => setArchiveForm({ ...archiveForm, category: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-200 p-3 bg-white outline-none">
                    <option>Dance</option>
                    <option>Theatre</option>
                    <option>Folk Music</option>
                    <option>Festivals</option>
                    <option>Competitions</option>
                    <option>Workshops</option>
                  </select>
                </label>
                <Field label="Media URL" value={archiveForm.mediaUrl} onChange={e => setArchiveForm({ ...archiveForm, mediaUrl: e.target.value })} />
                <label className="text-sm font-semibold text-gray-700 sm:col-span-2">
                  Description
                  <textarea className="mt-1 w-full rounded-lg border border-gray-200 p-3 font-normal outline-none focus:border-haryana-red" rows="2" value={archiveForm.description} onChange={e => setArchiveForm({ ...archiveForm, description: e.target.value })} />
                </label>
                <button className="rounded-xl bg-haryana-red px-5 py-3 font-semibold text-white hover:bg-red-700 transition-colors sm:col-span-2">Add Archive Item</button>
              </form>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {archive.map(item => (
                <article key={item.id} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-haryana-red">{item.category} · {item.year}</p>
                  <h3 className="mt-1 text-xl font-bold text-haryana-dark">{item.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{item.description}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* NOTIFICATIONS TAB */}
        {tab === 'notifications' && (
          <section>
            <h2 className="mb-5 text-2xl font-bold text-haryana-dark">Notifications</h2>
            {notifications.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 text-center text-gray-600 shadow-sm">No notifications yet.</div>
            ) : (
              notifications.map(item => (
                <article key={item.id} className="mb-4 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-haryana-dark">{item.title}</h3>
                  <p className="mt-2 text-xs text-gray-400">{new Date(item.createdAt).toLocaleString()}</p>
                </article>
              ))
            )}
          </section>
        )}
      </div>
    </div>
  );
}
