'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Brand from './Brand';
import Icon, { type IconName } from './Icon';

type View = 'Home' | 'Accounts' | 'Cards' | 'Help';
type Panel = 'payment' | 'transfer' | 'goal' | 'spending' | 'activity' | 'notifications' | 'profile' | 'discover';

const navigation: { name: View; icon: IconName }[] = [
  { name: 'Home', icon: 'home' }, { name: 'Accounts', icon: 'accounts' },
  { name: 'Cards', icon: 'card' }, { name: 'Help', icon: 'help' },
];
const transactions: { name: string; category: string; date: string; amount: number; icon: IconName; color: string }[] = [
  { name: 'The Corner Coffee', category: 'Eating out', date: 'Today', amount: -4.8, icon: 'coffee', color: 'peach' },
  { name: 'Everyday Groceries', category: 'Shopping', date: 'Today', amount: -42.65, icon: 'bag', color: 'lilac' },
  { name: 'City Rail', category: 'Transport', date: 'Yesterday', amount: -12.4, icon: 'train', color: 'sky' },
  { name: 'Demo salary', category: 'Money in', date: 'Yesterday', amount: 2850, icon: 'accounts', color: 'mint' },
  { name: 'Weekend Kitchen', category: 'Eating out', date: '2 Nov', amount: -28.5, icon: 'coffee', color: 'peach' },
];
const money = (value: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);

function DemoDialog({ panel, close }: { panel: Panel; close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [amount, setAmount] = useState('');
  const [review, setReview] = useState(false);
  const [query, setQuery] = useState('');
  const titles: Record<Panel, string> = {
    payment: 'Try a payment', transfer: 'Move money', goal: 'Your next adventure',
    spending: 'Your spending snapshot', activity: 'All activity', notifications: 'You’re all caught up',
    profile: 'Your demo profile', discover: 'A little room for what’s next',
  };
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => { dialog?.close(); };
  }, []);
  const isPayment = panel === 'payment' || panel === 'transfer';
  return (
    <dialog ref={ref} className="bank-dialog" onCancel={close} onClick={(event) => { if (event.target === event.currentTarget) close(); }} aria-labelledby="dialog-title">
      <div className="dialog-heading"><span className="section-kicker">DEMO EXPLORER</span><button className="icon-button" onClick={close} aria-label="Close dialog"><Icon name="close" /></button></div>
      <h2 id="dialog-title">{titles[panel]}</h2>
      {isPayment ? (
        review ? <div className="review-state"><span className="round-icon mint"><Icon name="check" /></span><h3>Preview only. No money moved.</h3><p>You reviewed a fictional {money(Number(amount))} {panel === 'transfer' ? 'transfer from Everyday account to Rainy day savings' : 'payment to Sam Taylor (demo payee)'}. Your balances are unchanged.</p><button className="primary-button" onClick={close}>Back to my overview</button></div> :
          <form onSubmit={(event) => { event.preventDefault(); setReview(true); }} className="demo-form">
            <p>Explore the flow with fictional accounts. This demo cannot send money.</p>
            <label>From<select><option>Everyday account · 4821</option></select></label>
            <label>{panel === 'transfer' ? 'To account' : 'Demo payee'}<select><option>{panel === 'transfer' ? 'Rainy day savings · 9012' : 'Sam Taylor · fictional payee'}</option></select></label>
            <label>Amount (£)<input type="number" inputMode="decimal" min="0.01" max="2458.5" step="0.01" required value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" /></label>
            <button className="primary-button" type="submit">Review demo {panel === 'transfer' ? 'transfer' : 'payment'} <Icon name="arrow" /></button>
          </form>
      ) : panel === 'activity' ? (
        <><label className="transaction-search"><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search demo activity" aria-label="Search demo activity" /></label><TransactionList query={query} /></>
      ) : panel === 'goal' ? (
        <><div className="goal-illustration large" aria-hidden="true"><span>☀</span><i /><b /></div><p className="goal-total">£1,250 <span>of £2,000 demo goal</span></p><progress value="1250" max="2000" aria-label="Holiday goal: 62.5 percent" /><p>You’re 62.5% of the way to a little sunshine. There’s £750 left in this example goal.</p><p className="demo-note">Illustrative savings goal, not a financial recommendation.</p></>
      ) : panel === 'spending' ? (
        <><p>A fictional November snapshot. These totals illustrate a monthly budget, not just the recent activity shown on Home.</p>{[{ label: 'Shopping', amount: 245, width: '70%' }, { label: 'Eating out', amount: 168, width: '48%' }, { label: 'Transport', amount: 96, width: '28%' }].map(item => <div className="spend-row" key={item.label}><div><span>{item.label}</span><strong>{money(item.amount)}</strong></div><div className="spend-track"><i style={{ width: item.width }} /></div></div>)}</>
      ) : panel === 'notifications' ? (
        <><p>There are no new notifications in this demo.</p><div className="soft-notice"><Icon name="shield" /><span>Remember: never share your PIN, passcode or one-time security codes in a chat.</span></div></>
      ) : panel === 'profile' ? (
        <><p><strong>Alex Morgan</strong> is a fictional demo customer. No login, identity check or bank connection is used.</p><p>Card controls and preferences reset when the page is reloaded. No personal banking data is stored.</p><Link className="text-button" href="/fragments">Open content-fragment developer tools <Icon name="arrow" /></Link></>
      ) : (
        <><p>This space is ready for your Barclays content fragments. For now, explore general product information on the official Barclays website or ask Brand Concierge.</p><a className="primary-button" href="https://www.barclays.co.uk/savings/" target="_blank" rel="noopener noreferrer">Explore Barclays savings <Icon name="arrow" /></a><p className="demo-note">Opens the official website. No product application is available in this demo.</p></>
      )}
      <p className="dialog-footer">Fictional data. No real banking or transactions.</p>
    </dialog>
  );
}

function TransactionList({ query = '', limit = transactions.length, hidden = false }: { query?: string; limit?: number; hidden?: boolean }) {
  const filtered = transactions.filter(item => `${item.name} ${item.category}`.toLowerCase().includes(query.toLowerCase())).slice(0, limit);
  return <div className="transaction-list">{filtered.length ? filtered.map(item => (
    <div className="transaction" key={item.name}>
      <span className={`round-icon ${item.color}`}><Icon name={item.icon} /></span>
      <div className="transaction-name"><strong>{item.name}</strong><span>{item.category} <span aria-hidden="true">·</span> {item.date}</span></div>
      <strong className={`transaction-amount ${item.amount > 0 ? 'positive' : ''}`}>{hidden ? '••••' : `${item.amount > 0 ? '+' : '−'}${money(Math.abs(item.amount))}`}</strong>
    </div>
  )) : <p className="empty-state">No demo activity matches “{query}”.</p>}</div>;
}

export default function MobileApp() {
  const [view, setView] = useState<View>('Home');
  const [hidden, setHidden] = useState(false);
  const [frozen, setFrozen] = useState(false);
  const [panel, setPanel] = useState<Panel | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  function navigate(next: View) {
    setView(next);
    requestAnimationFrame(() => { headingRef.current?.focus({ preventScroll: true }); workspaceRef.current?.scrollTo({ top: 0 }); });
  }
  const balance = (value: number) => hidden ? '••••••' : money(value);
  return (
    <div className="bank-demo-stage">
      <p className="demo-site-warning">this is a demo site</p>
      <div className="bank-app">
      <a href="#bank-content" className="skip-link">Skip to content</a>
      <div className="bank-workspace" ref={workspaceRef}>
        <header className="bank-topbar">
          <div className="mobile-brand"><Brand /></div>
          <div className="topbar-actions"><span className="demo-badge"><span />Demo App</span><button className="icon-button notification-button" aria-label="View notifications" onClick={() => setPanel('notifications')}><Icon name="bell" /></button><button className="avatar topbar-avatar" aria-label="Open demo profile" onClick={() => setPanel('profile')}>AM</button></div>
        </header>
        <div className="demo-strip"><Icon name="shield" /><p>A little look at what’s possible. <span>All accounts, balances and activity are fictional. No real banking.</span></p></div>
        <main className="bank-main" id="bank-content">
          <div className="greeting-row"><div><p className="greeting-kicker"><Icon name="sun" />YOUR MONEY. YOUR POSSIBILITIES.</p><h1 ref={headingRef} tabIndex={-1}>{view === 'Home' ? 'Hello, Alex' : view === 'Accounts' ? 'Your accounts' : view === 'Cards' ? 'Your cards' : 'Here to help'}</h1><p className="greeting-subtitle">{view === 'Home' ? 'Let’s make your everyday a little easier.' : view === 'Accounts' ? 'Everything in one place. All figures are demo data.' : view === 'Cards' ? 'A little more control, right at your fingertips.' : 'Find a helpful answer, your way.'}</p></div>{(view === 'Home' || view === 'Accounts') && <button className="balance-toggle" onClick={() => setHidden(!hidden)} aria-pressed={hidden}><Icon name="eye" />{hidden ? 'Show balances' : 'Hide balances'}</button>}</div>

          {(view === 'Home' || view === 'Accounts') && <>
            <div className="section-heading"><h2>Your accounts</h2><span className="subtle-label">3 demo accounts</span></div>
            <section className="account-grid" aria-label="Demo accounts">
              <button className="account-card everyday" onClick={() => setPanel('activity')}><div className="account-top"><span className="account-symbol"><Icon name="accounts" /></span><span>Current account</span><Icon name="chevron" /></div><h3>Everyday account</h3><p className="account-number">•• 4821 <span>Demo account</span></p><strong className="account-balance">{balance(2458.5)}</strong><span className="account-caption">Available balance</span><div className="account-decoration" aria-hidden="true" /></button>
              <button className="account-card" onClick={() => setPanel('goal')}><div className="account-top"><span className="account-symbol mint"><Icon name="plus" /></span><span>Savings</span><Icon name="chevron" /></div><h3>Rainy day savings</h3><p className="account-number">•• 9012 <span>Demo account</span></p><strong className="account-balance">{balance(8250)}</strong><span className="account-caption">A little peace of mind</span></button>
              <button className="account-card" onClick={() => navigate('Cards')}><div className="account-top"><span className="account-symbol lilac"><Icon name="card" /></span><span>Credit card</span><Icon name="chevron" /></div><h3>Barclaycard</h3><p className="account-number">•• 6374 <span>Demo account</span></p><strong className="account-balance">{balance(328.6)}</strong><span className="account-caption">Illustrative outstanding balance</span></button>
            </section>
            <section className="quick-action-grid" aria-label="Quick actions">
              {([{ label: 'Pay someone', icon: 'arrow', panel: 'payment' }, { label: 'Move money', icon: 'transfer', panel: 'transfer' }, { label: 'Manage cards', icon: 'card' }, { label: 'Your spending', icon: 'chart', panel: 'spending' }] as const).map(item => <button key={item.label} onClick={() => 'panel' in item ? setPanel(item.panel) : navigate('Cards')}><span><Icon name={item.icon} /></span>{item.label}<Icon name="chevron" /></button>)}
            </section>
          </>}

          {view === 'Home' && <div className="dashboard-columns">
            <div className="dashboard-primary">
              <section className="surface activity-surface"><div className="section-heading"><div><h2>A little in. A little out.</h2><p>Your recent demo activity</p></div><button className="text-button" onClick={() => setPanel('activity')}>View all <Icon name="arrow" /></button></div><TransactionList limit={4} hidden={hidden} /><div className="activity-footnote"><span className="status-dot" />Sample activity · not connected to a bank</div></section>
              <section className="discover-card"><div><span className="section-kicker">MADE FOR YOUR NEXT CHAPTER</span><h2>Big plans start<br />with little steps.</h2><p>A new place. A fresh start. Whatever’s next,<br className="desktop-break" /> make room for a little possibility.</p><button className="text-button" onClick={() => setPanel('discover')}>Explore the possibilities <Icon name="arrow" /></button><span className="placeholder-label">Demo content · AEM content to come</span></div><div className="possibility-art" aria-hidden="true"><span className="art-sun" /><span className="art-arch" /><span className="art-step one" /><span className="art-step two" /><span className="art-step three" /><span className="art-plant" /></div></section>
            </div>
            <div className="dashboard-secondary">
              <section className="concierge-card"><span className="concierge-kicker"><Icon name="spark" />A LITTLE GUIDANCE GOES A LONG WAY</span><h2>Your questions.<br />A helpful place to start.</h2><p>Explore Barclays products with Brand Concierge, powered by Adobe.</p><Link href="/brand-concierge" className="primary-button">Meet Brand Concierge <Icon name="arrow" /></Link><span className="concierge-note">AI-powered · General product questions only</span></section>
              <section className="surface goal-card"><div className="section-heading"><h2>Away-day dreaming</h2><Icon name="sun" /></div><div className="goal-summary"><div className="goal-illustration" aria-hidden="true"><span>☀</span><i /><b /></div><div><h3>Your next adventure</h3><strong>{balance(1250)}</strong><span>{hidden ? 'Goal balance hidden' : 'of £2,000 demo goal'}</span></div></div><progress value="1250" max="2000" aria-label="Demo holiday goal: 62.5 percent" /><div className="goal-bottom"><span>Every little bit counts.</span><button className="icon-button" aria-label="View savings goal" onClick={() => setPanel('goal')}><Icon name="arrow" /></button></div></section>
              <div className="security-tip"><Icon name="lock" /><p><strong>A moment to stay safe</strong>We’ll never ask for your PIN or passcode in a chat.</p></div>
            </div>
          </div>}

          {view === 'Accounts' && <section className="surface account-detail"><h2>A clearer picture of your everyday</h2><p>Your savings include the illustrative £1,250 holiday goal. Account details and balances are fictional; no bank is connected.</p><div className="section-heading"><h3>Everyday account activity</h3><button className="text-button" onClick={() => setPanel('activity')}>Search activity <Icon name="search" /></button></div><TransactionList hidden={hidden} /></section>}

          {view === 'Cards' && <div className="cards-layout"><section className="surface"><div className={`debit-card ${frozen ? 'frozen' : ''}`}><span>BARCLAYS</span><Icon name="card" /><strong>•••• &nbsp; •••• &nbsp; •••• &nbsp; 4821</strong><div><span>A MORGAN<br /><small>DEMO · NOT A VALID CARD</small></span><b>VISA</b></div></div><h2>Everyday debit card</h2><p>Fictional card ending 4821. No usable card details are displayed.</p><button className="primary-button" aria-pressed={frozen} onClick={() => setFrozen(!frozen)}><Icon name="lock" />{frozen ? 'Unfreeze demo card' : 'Freeze demo card'}</button><p className="card-status" role="status">{frozen ? 'Demo card frozen. This only changes the on-screen preview.' : 'Demo card active. This control does not affect a real card.'}</p></section><section className="surface"><span className="round-icon sky"><Icon name="shield" /></span><h2>You’re in control</h2><p>Try freezing and unfreezing the demo card. The state lasts only until you reload this page.</p><p>For a lost or stolen real Barclays card, use the official Barclays app or website.</p><a className="text-button" href="https://www.barclays.co.uk/help/" target="_blank" rel="noopener noreferrer">Visit official Barclays help <Icon name="arrow" /></a></section></div>}

          {view === 'Help' && <div className="help-grid"><section className="concierge-card"><span className="round-icon"><Icon name="spark" /></span><h2>A little help from<br />Brand Concierge</h2><p>Ask general questions about Barclays products. This Adobe-powered agent cannot access your accounts or make transactions.</p><Link href="/brand-concierge" className="primary-button">Open Brand Concierge <Icon name="arrow" /></Link></section><section className="surface"><h2>Good to know</h2><details><summary>Is this a real banking app?</summary><p>No. This is an independent demonstration. All customer information and balances are fictional; no money can be moved.</p></details><details><summary>Where are the content fragments?</summary><p>The demo uses labelled placeholder content. The original AEM fetcher, API routes and fragment preview remain available in the developer tools.</p><Link href="/fragments">Open content-fragment tools</Link></details><details><summary>Can I get help with my real account?</summary><p>This demo cannot provide account support. Use the official Barclays app or visit <a href="https://www.barclays.co.uk/help/" target="_blank" rel="noopener noreferrer">Barclays help</a>. Never enter personal banking details here.</p></details></section></div>}

          <footer className="bank-footer"><span>Barclays-inspired. Built for a little exploration.</span><span>Independent demo · Not an official Barclays service</span></footer>
        </main>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation">{navigation.map(item => <button key={item.name} onClick={() => navigate(item.name)} aria-current={view === item.name ? 'page' : undefined}><Icon name={item.icon} /><span>{item.name}</span></button>)}<Link href="/brand-concierge"><Icon name="spark" /><span>Concierge</span></Link></nav>
      {panel && <DemoDialog key={panel} panel={panel} close={() => setPanel(null)} />}
      </div>
    </div>
  );
}
