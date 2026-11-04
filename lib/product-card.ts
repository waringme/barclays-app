export type ProductCard = {
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string | null;
};

export type ProductCardVariation = { name: string; title: string };
export type ProductCardResult = {
  card: ProductCard;
  variation: string;
  variations: ProductCardVariation[];
};

function source() {
  return {
    origin: (process.env.BARCLAYS_AEM_PUBLISH_ORIGIN?.trim() || 'https://publish-p147324-e2050468.adobeaemcloud.com').replace(/\/$/, ''),
    path: process.env.BARCLAYS_PRODUCT_CARD_PATH?.trim() || '/content/dam/barclays-xwalk/fragments/barclays-product-card',
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function requestJson(url: string, init?: RequestInit): Promise<Record<string, unknown>> {
  const freshUrl = new URL(url);
  freshUrl.searchParams.set('cq', `${Date.now()}-${crypto.randomUUID()}`);
  const response = await fetch(freshUrl.toString(), { ...init, cache: 'no-store', signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`Barclays content service returned HTTP ${response.status}.`);
  const payload: unknown = await response.json();
  if (!isRecord(payload)) throw new Error('Barclays content service returned an invalid response.');
  if (Array.isArray(payload.errors) && payload.errors.length) {
    const messages = payload.errors.map(error => isRecord(error) && typeof error.message === 'string' ? error.message : 'GraphQL error');
    throw new Error(`Barclays content service: ${messages.join('; ')}`);
  }
  if (!isRecord(payload.data)) throw new Error('Barclays content service returned no GraphQL data.');
  return payload.data;
}

function fragmentItem(data: Record<string, unknown>): Record<string, unknown> {
  const result = data.barclaysProductCardByPath;
  if (!isRecord(result) || !isRecord(result.item)) {
    throw new Error('The Barclays product-card fragment was not found. Check that it is published.');
  }
  return result.item;
}

// Render authored rich text as plain text, including the fragment's escaped <p> tags.
// React escapes the result; upstream HTML is never inserted into the document.
export function productDescription(html: string): string {
  const entities: Record<string, string> = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
    pound: '£', euro: '€', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘',
    ldquo: '“', rdquo: '”', hellip: '…',
  };
  let text = html;
  for (let pass = 0; pass < 2; pass++) {
    text = text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match: string, entity: string) => {
      if (!entity.startsWith('#')) return entities[entity.toLowerCase()] ?? match;
      const code = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
      return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : match;
    });
  }
  return text.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<br\s*\/?>|<\/(?:p|div|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function productUrl(value: string, base: string): string {
  const url = new URL(value, base);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('The Barclays product card contains an unsupported link or image URL.');
  }
  return url.href;
}

async function fetchProductVariations(): Promise<ProductCardVariation[]> {
  const { origin, path } = source();
  const query = (value: string) => requestJson(`${origin}/content/_cq_graphql/barclays-xwalk/endpoint.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: value }),
  });
  const base = fragmentItem(await query(`{ barclaysProductCardByPath(_path: ${JSON.stringify(path)}) { item { _variations title } } }`));
  if (!Array.isArray(base._variations) || !base._variations.every(name => typeof name === 'string')) {
    throw new Error('The Barclays content service did not return an authored variation list.');
  }
  const names = [...new Set(base._variations)].filter(name => name !== 'master');
  const variations = [{ name: 'master', title: typeof base.title === 'string' ? base.title : 'Master' }];
  if (!names.length) return variations;
  const aliases = names.map((name, index) => `v${index}: barclaysProductCardByPath(_path: ${JSON.stringify(path)}, variation: ${JSON.stringify(name)}) { item { title } }`);
  const titles = await query(`{ ${aliases.join('\n')} }`);
  for (const [index, name] of names.entries()) {
    const result = titles[`v${index}`];
    if (!isRecord(result) || !isRecord(result.item) || typeof result.item.title !== 'string') {
      throw new Error(`The Barclays content service did not return a title for variation "${name}".`);
    }
    variations.push({ name, title: result.item.title });
  }
  return variations;
}

export async function fetchProductCard(variation = 'master'): Promise<ProductCardResult> {
  const selected = variation.trim() || 'master';
  const variations = await fetchProductVariations();
  if (!variations.some(option => option.name === selected)) throw new Error(`Unknown Barclays product-card variation "${selected}".`);
  const { origin, path } = source();
  // AEM's matrix parameter expects literal path separators, not encoded slashes.
  const fragmentPath = encodeURIComponent(path).replace(/%2F/g, '/');
  const url = `${origin}/graphql/execute.json/barclays-xwalk/get-barclays-product-card-by-path;path=${fragmentPath};variation=${encodeURIComponent(selected)}`;
  const item = fragmentItem(await requestJson(url));
  if (typeof item.title !== 'string' || typeof item.ctaLabel !== 'string' || typeof item.ctaLink !== 'string' || !item.ctaLink.trim()) {
    throw new Error('The Barclays product card is missing its title or call to action.');
  }
  const description = isRecord(item.description) ? item.description : {};
  const text = typeof description.plaintext === 'string' ? description.plaintext : typeof description.html === 'string' ? productDescription(description.html) : '';
  const image = isRecord(item.image) ? item.image : {};
  return {
    variation: selected,
    variations,
    card: {
      title: item.title,
      description: text,
      ctaLabel: item.ctaLabel,
      ctaHref: productUrl(item.ctaLink, 'https://www.barclays.co.uk/'),
      imageUrl: typeof image._publishUrl === 'string' && image._publishUrl.trim() ? productUrl(image._publishUrl, origin) : null,
    },
  };
}
