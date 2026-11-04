'use client';

import { useEffect, useState } from 'react';
import type { ProductCardResult, ProductCardVariation } from '@/lib/product-card';
import Icon from './Icon';

export function useProductCard() {
  const [variation, setVariation] = useState('master');
  const [variations, setVariations] = useState<ProductCardVariation[]>([]);
  const [result, setResult] = useState<ProductCardResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setResult(null);
    async function load() {
      try {
        const response = await fetch(`/api/product-card?variation=${encodeURIComponent(variation)}`, { signal: controller.signal, cache: 'no-store' });
        const payload: ProductCardResult & { error?: string } = await response.json();
        if (!response.ok) throw new Error(payload.error || `Product-card request returned HTTP ${response.status}.`);
        if (controller.signal.aborted) return;
        setResult(payload);
        setVariations(payload.variations);
      } catch (failure) {
        if (controller.signal.aborted) return;
        console.error('Unable to load Barclays product card', failure);
        setError(failure instanceof Error ? failure.message : 'Unexpected content-service error.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [variation, attempt]);

  return { variation, setVariation, variations, result, loading, error, retry: () => setAttempt(attempt + 1) };
}

type ProductCardState = ReturnType<typeof useProductCard>;

export function ProductVariationSelector({ state }: { state: ProductCardState }) {
  const { variation, setVariation, variations, error } = state;
  return <section className="product-variation-control" aria-label="Content fragment options">
    <div className="product-variation-heading"><label htmlFor="product-variation">Content fragment variation</label><span>{variations.length ? `${variations.length} in AEM` : 'Live AEM content'}</span></div>
    <select id="product-variation" value={variation} aria-describedby="product-variation-help" onChange={event => setVariation(event.target.value)} disabled={!variations.length}>
      {variations.length ? variations.map(option => <option key={option.name} value={option.name}>{option.title}{option.name === 'master' ? ' · Master' : ''}</option>) : <option value="master">{error ? 'Variations unavailable' : 'Loading authored variations…'}</option>}
    </select>
    <p id="product-variation-help">Updates the product card on Home inside the app.</p>
  </section>;
}

export default function ProductCard({ state }: { state: ProductCardState }) {
  const { result, loading, error, retry } = state;
  const [imageError, setImageError] = useState(false);
  useEffect(() => { setImageError(false); }, [result?.card.imageUrl]);

  return <section className="product-card surface" aria-label="Barclays product content fragment" aria-busy={loading}>
    {loading && <p className="product-loading" role="status">Loading published Barclays content…</p>}
    {error && <div className="product-error" role="alert"><h2>Barclays content is unavailable</h2><p>{error}</p><p>No sample or unrelated content has been substituted.</p><button className="primary-button" onClick={retry}>Retry content <Icon name="arrow" /></button></div>}
    {result && <div className="product-content" aria-live="polite">
      {result.card.imageUrl && !imageError && <img src={result.card.imageUrl} alt="" loading="lazy" onError={() => setImageError(true)} />}
      {imageError && <p className="product-image-error" role="status">The authored product image could not be loaded.</p>}
      <div className="product-copy"><span className="section-kicker">SPONSORED · LIVE CONTENT FRAGMENT</span><h2>{result.card.title}</h2><p className="product-description">{result.card.description}</p><a className="primary-button" href={result.card.ctaHref} target="_blank" rel="noopener noreferrer">{result.card.ctaLabel} <Icon name="arrow" /></a><p className="demo-note">Opens the Barclays website. No application or transaction is available in this demo.</p></div>
    </div>}
  </section>;
}
