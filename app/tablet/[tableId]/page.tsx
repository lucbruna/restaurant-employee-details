import { TabletOrderShell } from '@/components/tablet/tablet-order-shell';

export const dynamic = 'force-dynamic';

export default async function TabletOrderingPage({
  params,
}: {
  params: Promise<{ tableId: string }>;
}) {
  const { tableId } = await params;

  return <TabletOrderShell tableId={decodeURIComponent(tableId)} />;
}
