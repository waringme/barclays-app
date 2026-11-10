'use client';

import { useState } from 'react';

export const demoPersonas = [
  { name: 'Tim', cta: 'Treat yourself' },
  { name: 'Alex', cta: 'Plan ahead' },
  { name: 'Sam', cta: 'Explore more' },
] as const;

export type DemoPersona = typeof demoPersonas[number];

function TemplateImage({ url, persona }: { url: string; persona: DemoPersona }) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  return <div className="dynamic-media-image" aria-busy={status === 'loading'}>
    {status !== 'error' && <img key={attempt} src={url} width={800} height={533}
      alt={`Personalized Barclays demo artwork for ${persona.name}: ${persona.cta}`}
      hidden={status === 'loading'}
      onLoad={() => setStatus('loaded')}
      onError={() => { console.error('Unable to load Dynamic Media template', url); setStatus('error'); }} />}
    {status === 'loading' && <p className="product-loading" role="status">Loading personalized artwork for {persona.name}…</p>}
    {status === 'error' && <div className="product-error" role="alert">
      <h3>Personalized artwork is unavailable</h3>
      <p>Scene7 could not load this template. Check that AGS487/credit-offer is published and publicly accessible. No substitute image is shown.</p>
      <button className="primary-button" onClick={() => { setStatus('loading'); setAttempt(value => value + 1); }}>Retry artwork</button>
    </div>}
  </div>;
}

export function PersonaSelector({ persona, onPersonaChange }: { persona: DemoPersona; onPersonaChange: (persona: DemoPersona) => void }) {
  return <section className="product-variation-control" aria-label="Demo persona options">
    <div className="product-variation-heading"><label htmlFor="demo-persona">Demo persona</label></div>
    <select id="demo-persona" value={persona.name} onChange={event => {
      const selected = demoPersonas.find(item => item.name === event.target.value);
      if (selected) onPersonaChange(selected);
    }}>
      {demoPersonas.map(item => <option key={item.name} value={item.name}>{item.name} · {item.cta}</option>)}
    </select>
  </section>;
}

export default function DynamicMediaCard({ persona }: { persona: DemoPersona }) {
  const url = new URL('https://s7g10.scene7.com/is/template/AGS487/credit-offer');
  for (const [name, value] of Object.entries({
    '$cta': persona.cta, '$firstname': persona.name,
    wid: '800', hei: '533', qlt: '80', fit: 'constrain', fmt: 'png-alpha',
  })) url.searchParams.set(name, value);

  return <section className="dynamic-media-card surface" aria-labelledby="dynamic-media-title">
    <span className="section-kicker">LIVE DYNAMIC MEDIA · FICTIONAL PERSONAS</span>
    <h2 id="dynamic-media-title">A little more personal</h2>
    <TemplateImage key={url.href} url={url.href} persona={persona} />
  </section>;
}
