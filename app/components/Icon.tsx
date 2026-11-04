import type { CSSProperties } from 'react';

const paths = {
  home: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
  accounts: 'M3 10h18M5 10v8m5-8v8m4-8v8m5-8v8M3 21h18M2 7l10-5 10 5Z',
  card: 'M3 8h18M4 4h16a1 1 0 0 1 1 1v14H3V5a1 1 0 0 1 1-1Zm3 11h4',
  help: 'M9.1 9a3 3 0 1 1 5.7 1.3C14 11.5 12 11.7 12 14m0 3h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  arrow: 'M5 12h14m-5-5 5 5-5 5',
  transfer: 'M3 7h17m-4-4 4 4-4 4M21 17H4m4-4-4 4 4 4',
  plus: 'M12 5v14M5 12h14',
  chart: 'M4 3v17h17M8 15v-4m5 4V7m5 8v-6',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  shield: 'm12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6Zm-4 10 3 3 5-6',
  chat: 'M21 11a9 9 0 0 1-9 9H4l-3 2 2-7a9 9 0 1 1 18-4ZM8 10h8m-8 4h5',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4',
  chevron: 'm9 5 7 7-7 7',
  search: 'm21 21-5-5m2-6a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
  close: 'm6 6 12 12M6 18 18 6',
  coffee: 'M3 8h14v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Zm14 1h2a3 3 0 0 1 0 6h-2M6 2v3m5-3v3',
  bag: 'M5 7h14l2 14H3Zm3 0V5a4 4 0 0 1 8 0v2',
  train: 'M6 17 4 21m14-4 2 4M7 3h10a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm-2 7h14M8 14h1m6 0h1',
  check: 'm5 12 4 4L19 6',
  lock: 'M5 10h14v11H5Zm3 0V6a4 4 0 0 1 8 0v4m-4 5v2',
  sun: 'M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1m-2 7a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z',
  spark: 'm12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4m-2-2h4',
  settings: 'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8ZM12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2',
} as const;

export type IconName = keyof typeof paths;

export default function Icon({ name, style }: { name: IconName; style?: CSSProperties }) {
  return <svg style={style} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
