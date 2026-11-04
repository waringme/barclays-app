import MobileApp from './components/MobileApp';
import { getBrandConciergeConfig } from '@/lib/brand-concierge';

export default function Home() {
  return <MobileApp conciergeConfig={getBrandConciergeConfig()} />;
}
