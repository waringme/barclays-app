import Link from 'next/link';
import Brand from '../components/Brand';
import Icon from '../components/Icon';
import BrandConcierge from '../components/BrandConcierge';

export const metadata = {
  title: 'Brand Concierge | Barclays demo',
  description: 'Explore Barclays products with the Adobe Brand Concierge integration. Do not enter personal banking information.',
};

export default function ConciergePage() {
  const config = {
    datastreamId: process.env.BRAND_CONCIERGE_DATASTREAM_ID?.trim() || 'fe057ec8-5a57-4d9e-92a3-0b989df885ad',
    orgId: process.env.BRAND_CONCIERGE_ORG_ID?.trim() || 'BF9C27AA6464801C0A495FD0@AdobeOrg',
    region: process.env.BRAND_CONCIERGE_REGION?.trim() || 'nld2',
  };
  return (
    <div className="concierge-page">
      <header className="concierge-header"><Brand /><div className="topbar-actions"><span className="demo-badge"><span />Demo App</span><Link className="text-button" href="/">Back to my overview <Icon name="arrow" /></Link></div></header>
      <main className="concierge-main">
        <span className="section-kicker">A LITTLE GUIDANCE GOES A LONG WAY</span>
        <h1>Meet Brand Concierge</h1>
        <p className="concierge-intro">A helpful place to explore Barclays products, powered by Adobe Brand Concierge. This is an independent demo, not account support or financial advice. Never share real account details, card numbers, PINs or passcodes.</p>
        <BrandConcierge config={config} />
        <details className="concierge-config"><summary>Connection and setup information</summary><p>Adapted from the requested <a href="https://github.com/waringme/barclays-xwalk/tree/main/blocks/brand-concierge" target="_blank" rel="noopener noreferrer">Barclays Brand Concierge block</a>, using its Web SDK, agent and exported styling configuration. A loaded interface does not confirm that the conversation service is configured.</p><p>The Adobe datastream must enable Brand Concierge, have a published concierge attached and allow this deployment’s domain (including localhost for local use). Service-side errors are shown by the Adobe agent, not replaced with sample answers.</p><p>Datastream: <code>{config.datastreamId}</code><br />Organisation: <code>{config.orgId}</code><br />Region: <code>{config.region}</code></p><p>Override with <code>BRAND_CONCIERGE_DATASTREAM_ID</code>, <code>BRAND_CONCIERGE_ORG_ID</code> and <code>BRAND_CONCIERGE_REGION</code>. These are public client identifiers, not credentials.</p></details>
      </main>
    </div>
  );
}
