import MobileApp from '../components/MobileApp';
import { getBrandConciergeConfig } from '@/lib/brand-concierge';

export const metadata = {
  title: 'Brand Concierge | Barclays demo',
  description: 'Explore Barclays products with the Adobe Brand Concierge integration. Do not enter personal banking information.',
};

export default function ConciergePage() {
  return <MobileApp initialView="Concierge" conciergeConfig={getBrandConciergeConfig()} />;
}
