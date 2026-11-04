export type BrandConciergeConfig = {
  datastreamId: string;
  orgId: string;
  region: string;
};

export function getBrandConciergeConfig(): BrandConciergeConfig {
  return {
    datastreamId: process.env.BRAND_CONCIERGE_DATASTREAM_ID?.trim() || 'fe057ec8-5a57-4d9e-92a3-0b989df885ad',
    orgId: process.env.BRAND_CONCIERGE_ORG_ID?.trim() || 'BF9C27AA6464801C0A495FD0@AdobeOrg',
    region: process.env.BRAND_CONCIERGE_REGION?.trim() || 'nld2',
  };
}
