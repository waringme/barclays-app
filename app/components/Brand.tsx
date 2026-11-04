import Link from 'next/link';

export default function Brand() {
  return (
    <Link href="/" className="barclays-brand" aria-label="Barclays demo home">
      {/* Official brand assets from the user-supplied Barclays reference. */}
      <img src="/brand/barclays-eagle.svg" alt="" width="34" height="37" />
      <img src="/brand/barclays-wordmark.svg" alt="Barclays" width="118" height="24" />
    </Link>
  );
}
