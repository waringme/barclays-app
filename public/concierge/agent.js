/**
 * Adapted from waringme/barclays-xwalk, blocks/brand-concierge/brand-concierge.js.
 * The parent page obtains consent before this isolated SDK document is loaded.
 * Upstream source: https://github.com/waringme/barclays-xwalk/tree/main/blocks/brand-concierge
 */
const ALLOY_SRC = 'https://cdn1.adoberesources.net/alloy/2.35.1/alloy.min.js';
const AGENT_SRC = 'https://experience.adobe.net/solutions/experience-platform-brand-concierge-web-agent/static-assets/main.js';
const status = document.querySelector('.brand-concierge-status');
const params = new URLSearchParams(window.location.search);

function installAlloyQueue() {
  if (window.alloy) return;
  (window.__alloyNS = window.__alloyNS || []).push('alloy');
  window.alloy = (...args) => new Promise((resolve, reject) => {
    window.alloy.q.push([resolve, reject, args]);
  });
  window.alloy.q = [];
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Unable to load script from ${new URL(src).hostname}. Check network or content blocking.`));
    document.head.append(script);
  });
}

async function bootstrap() {
  const datastreamId = params.get('datastreamId');
  const orgId = params.get('orgId');
  const region = params.get('region');
  if (!datastreamId || !orgId || !region) throw new Error('Missing datastream, organisation or conversation region configuration.');
  const response = await fetch('/concierge/style-config.json');
  if (!response.ok) throw new Error(`Styling configuration returned HTTP ${response.status}.`);
  const styling = await response.json();
  if (!styling.theme || !styling.metadata) throw new Error('Invalid Brand Concierge styling configuration.');
  const logo = await fetch('/brand/barclays-eagle.svg');
  if (!logo.ok) throw new Error(`Brand logo returned HTTP ${logo.status}.`);
  // The Adobe agent requires inline SVG, not an image URL.
  const svg = new DOMParser().parseFromString(await logo.text(), 'image/svg+xml').documentElement;
  if (svg.localName !== 'svg') throw new Error('Invalid brand logo SVG.');
  styling.assets.icons.company = new XMLSerializer().serializeToString(svg);

  installAlloyQueue();
  await loadScript(ALLOY_SRC);
  await window.alloy('configure', {
    defaultConsent: 'in',
    edgeDomain: 'edge.adobedc.net',
    edgeBasePath: 'ee',
    datastreamId,
    orgId,
    debugEnabled: false,
    idMigrationEnabled: false,
    thirdPartyCookiesEnabled: false,
    prehidingStyle: '.personalization-container { opacity: 0 !important }',
    conversation: { region },
  });
  await window.alloy('sendEvent', {});
  await loadScript(AGENT_SRC);
  if (!window.adobe?.concierge?.bootstrap) throw new Error('Adobe Brand Concierge bootstrap is unavailable.');
  await window.adobe.concierge.bootstrap({
    instanceName: 'alloy',
    stylingConfigurations: styling,
    selector: '#brand-concierge-mount',
    stickySession: false,
  });
}

let expired = false;
const timer = setTimeout(() => {
  expired = true;
  status.dataset.error = 'true';
  status.textContent = 'Brand Concierge is taking too long to connect. Check the network and Adobe setup, then use Reload concierge above. No simulated answers are available.';
  document.querySelector('#brand-concierge-mount').hidden = true;
  console.error('Brand Concierge initialization timed out after 30 seconds.');
}, 30000);

bootstrap().then(() => {
  if (!expired) status.remove();
}).catch((error) => {
  status.dataset.error = 'true';
  status.textContent = `Brand Concierge is unavailable. ${error instanceof Error ? error.message : 'Unexpected initialization error.'} Check the connection and setup information on the parent page, then reload.`;
  document.querySelector('#brand-concierge-mount').hidden = true;
  console.error('Brand Concierge failed to load', error);
}).finally(() => clearTimeout(timer));
