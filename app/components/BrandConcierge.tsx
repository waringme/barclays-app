'use client';

import { useState } from 'react';
import Icon from './Icon';
import type { BrandConciergeConfig } from '@/lib/brand-concierge';

export default function BrandConcierge({ config }: { config: BrandConciergeConfig }) {
  const [consented, setConsented] = useState(false);
  const [attempt, setAttempt] = useState(0);
  if (!consented) {
    return <section className="surface concierge-consent"><span className="round-icon"><Icon name="spark" /></span><h2>A quick note before we chat</h2><p>Continuing loads Adobe’s Web SDK and Brand Concierge. It connects your browser to Adobe services, which process connection data and the messages you choose to send.</p><p>Use general product questions and fictional examples only. This demo cannot access your bank accounts or move money. AI answers can be incorrect; check important information on the official Barclays website.</p><button className="primary-button" onClick={() => setConsented(true)}>Agree and open concierge <Icon name="arrow" /></button><p className="demo-note">No Adobe scripts or conversation requests load until you choose to continue. Closing the concierge stops this embedded interface, but does not erase data already sent.</p></section>;
  }
  const query = new URLSearchParams(config).toString();
  return <section className="concierge-session" aria-label="Adobe Brand Concierge">
    <div className="concierge-toolbar"><span>Adobe-powered demo · General product questions only</span><button className="text-button" onClick={() => setConsented(false)}>Close concierge <Icon name="close" /></button></div>
    {/* A separate document owns the SDK lifecycle, avoiding duplicate Alloy configuration on React remounts. */}
    <iframe key={attempt} className="concierge-frame" src={`/concierge/agent.html?${query}`} title="Adobe Brand Concierge chat" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox" referrerPolicy="strict-origin-when-cross-origin" />
    <p className="concierge-service-note">Connection trouble? Check setup below or <button className="text-button" onClick={() => setAttempt(attempt + 1)}>Reload concierge</button>. No simulated answers.</p>
  </section>;
}
