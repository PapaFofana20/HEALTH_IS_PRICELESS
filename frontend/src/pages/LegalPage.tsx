import { LegalPageLayout } from '../components/legal/LegalPageLayout';

/* Pages isolées (footer uniquement) : /confidentialite et /cgu. */
export default function LegalPage({ docKey }: { docKey: 'confidentialite' | 'cgu' }) {
  return <LegalPageLayout docKey={docKey} />;
}