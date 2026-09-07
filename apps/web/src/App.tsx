import { useEffect, useState, type FormEvent } from 'react';
import { loadRelease, type LinkUpRelease } from './release';

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';
type Section = 'home' | 'updates' | 'contact' | 'help';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

function Mark() {
  return <div className="mark" aria-label="LinkUp">LU</div>;
}

export default function App() {
  const [section, setSection] = useState<Section>('home');
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent>();
  const [updateReady, setUpdateReady] = useState(false);
  const [release, setRelease] = useState<LinkUpRelease>();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
    };
    const onUpdate = () => setUpdateReady(true);

    window.addEventListener('beforeinstallprompt', onInstall);
    window.addEventListener('linkup:update-ready', onUpdate);
    void loadRelease().then(setRelease).catch(() => undefined);

    return () => {
      window.removeEventListener('beforeinstallprompt', onInstall);
      window.removeEventListener('linkup:update-ready', onUpdate);
    };
  }, []);

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    setInstallEvent(undefined);
  }

  async function updateNow() {
    const registration = await navigator.serviceWorker?.getRegistration('/');
    registration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSent(false);
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    if (!API_URL) {
      setError('Contact service is not connected yet. The report form is ready for the LinkUp API.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/v1/contact/reports`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Unable to submit report');
      setSent(true);
      form.reset();
    } catch {
      setError('We could not send the report right now. Please try again.');
    }
  }

  const version = release?.version ?? '1.0.0';

  return <div className="app">
    <header className="topbar">
      <button className="brand" onClick={() => setSection('home')}><Mark /><span>LinkUp</span></button>
      <nav>{(['home', 'updates', 'contact', 'help'] as Section[]).map(item => <button key={item} className={section === item ? 'active' : ''} onClick={() => setSection(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}</nav>
      <button className="install" onClick={install}>{installEvent ? 'Install LinkUp' : 'Get LinkUp'}</button>
    </header>

    {updateReady && <div className="updatebar">A fresh LinkUp web release is ready. <button onClick={() => void updateNow()}>Update now</button></div>}

    <main>
      {section === 'home' && <>
        <section className="hero">
          <div className="eyebrow">THE OFFICIAL LINKUP HOME</div>
          <h1>Connection, redesigned<br /><em>for people.</em></h1>
          <p>LinkUp brings messages, people, communities and the next generation of social connection into one evolving experience.</p>
          <div className="heroActions"><button className="primary" onClick={() => void install()}>Install LinkUp</button><button className="secondary" onClick={() => setSection('updates')}>Explore updates</button></div>
          <div className="orb"><Mark /><span>Always evolving.</span></div>
        </section>
        <section className="cards"><article><span>01</span><h2>Messages</h2><p>Private conversations and communities with a familiar flow and an original LinkUp identity.</p></article><article><span>02</span><h2>Social</h2><p>Built to grow into richer discovery, short-form content and creator experiences.</p></article><article><span>03</span><h2>Intelligence</h2><p>A future AI layer will help operate LinkUp, from everyday actions to release publishing.</p></article></section>
      </>}

      {section === 'updates' && <section className="page"><div className="eyebrow">RELEASE CENTER</div><h1>Every release,<br /><em>landed cleanly.</em></h1><p className="lead">The official update stream for LinkUp web and mobile. New releases can carry notes, availability and update guidance in one machine-readable source.</p><div className="release"><div><span className="pill">CURRENT</span><h2>LinkUp {version}</h2><p>{release?.notes.join(' · ') ?? 'Web/PWA foundation · official home · install experience · release center · contact foundation.'}</p></div><strong>{version}</strong></div><p className="muted">Web updates are delivered through the PWA service worker. Native Android updates remain user-confirmed or store-managed.</p></section>}

      {section === 'contact' && <section className="page"><div className="eyebrow">CONTACT & REPORTS</div><h1>Tell the LinkUp<br /><em>team.</em></h1><p className="lead">Report a problem, request help, or send feedback. Include your email so the team can reply.</p><form onSubmit={submitReport} className="report"><div className="row"><label>Name<input name="name" placeholder="Your name" maxLength={100} /></label><label>Email<input name="email" type="email" required placeholder="you@example.com" maxLength={254} /></label></div><label>Category<select name="category"><option>Bug report</option><option>Account & access</option><option>Safety</option><option>Feedback</option><option>Other</option></select></label><label>Subject<input name="subject" required placeholder="What happened?" maxLength={160} /></label><label>Message<textarea name="message" required placeholder="Tell us what you need help with..." maxLength={5000} /></label><button className="primary" type="submit">Send report</button>{sent && <div className="success">Report received. The LinkUp team can now reply to the email you provided.</div>}{error && <div className="error">{error}</div>}</form></section>}

      {section === 'help' && <section className="page"><div className="eyebrow">LINKUP HELP</div><h1>Simple answers.<br /><em>Clear direction.</em></h1><div className="faq"><details open><summary>How do I install LinkUp?</summary><p>On supported browsers, use the Install LinkUp button. On iPhone/iPad, use your browser's Share menu and choose Add to Home Screen.</p></details><details><summary>How do updates work?</summary><p>The PWA checks for a newer service-worker version. When one is ready, LinkUp presents an update action instead of silently changing the current session.</p></details><details><summary>How do I contact LinkUp?</summary><p>Use Contact & Reports. Your email is included as Reply-To so the team can respond directly.</p></details></div></section>}
    </main>
    <footer><div><Mark /><strong>LinkUp</strong></div><span>Official web home · built to evolve.</span><button onClick={() => setSection('contact')}>Contact team</button></footer>
  </div>;
}
