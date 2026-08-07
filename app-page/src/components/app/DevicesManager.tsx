import { useState, useEffect } from 'react';
import { toast } from 'diva-ui/components/sonner';
import { useT } from '@lib/i18n/useT';
import DataList from './DataList';
import type { Column } from './DataList';

interface DeviceData {
  device_id: string;
  device_name?: string;
  user_id?: string;
  created_at?: number;
  updated_at?: number;
}

interface DevicesManagerProps {
  uid?: string;
  initialDevices: Record<string, unknown>[] | null;
  isVerified?: boolean;
  lang?: string;
}

function formatDate(ts?: number) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString();
}

export default function DevicesManager({ uid, initialDevices, isVerified = true, lang = 'en' }: DevicesManagerProps) {
  const t = useT(lang);
  const [devices, setDevices] = useState<DeviceData[]>(initialDevices as DeviceData[] | null || []);
  const [refreshing, setRefreshing] = useState(false);
  const needsLoad = initialDevices === null;

  const basePath = uid ? `/api/user/${uid}/devices` : '/api/devices';

  useEffect(() => {
    if (needsLoad) {
      refetchDevices();
    }
    // run once on mount to load server-fetched data lazily
  }, []);

  const refetchDevices = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(basePath);
      if (res.ok) {
        const json = await res.json();
        setDevices(json.data || []);
      } else {
        toast.error(t('devicesPage.failedFetch'));
      }
    } catch {
      toast.error(t('devicesPage.failedFetch'));
    }
    setRefreshing(false);
  };

  const deleteDevice = async (deviceId: string, device?: DeviceData) => {
    const deletePath = uid
      ? `/api/user/${uid}/devices/${deviceId}`
      : `/api/user/${device?.user_id}/devices/${deviceId}`;
    try {
      const res = await fetch(deletePath, { method: 'DELETE' });
      if (res.ok) {
        toast.success(t('devicesPage.deleted'));
        setDevices((prev) => prev.filter((d) => d.device_id !== deviceId));
      } else {
        toast.error(t('devicesPage.failedDelete'));
      }
    } catch {
      toast.error(t('devicesPage.failedDelete'));
    }
  };

  const deviceColumns: Column<DeviceData>[] = [
    {
      key: 'name',
      header: t('devicesPage.name') || 'Name',
      sortValue: (d: DeviceData) => d.device_name || '',
      csvValue: (d: DeviceData) => d.device_name || '',
      render: (d: DeviceData) => (
        <span className="text-sm font-medium">{d.device_name || t('devicesPage.unknownDevice')}</span>
      ),
    },
    {
      key: 'created',
      header: t('devicesPage.created'),
      sortValue: (d: DeviceData) => d.created_at ?? 0,
      csvValue: (d: DeviceData) => (d.created_at ? new Date(d.created_at).toISOString() : ''),
      render: (d: DeviceData) => (
        <div className="text-muted-foreground text-xs whitespace-nowrap">
          {formatDate(d.created_at)}
        </div>
      ),
    },
    {
      key: 'lastSeen',
      header: t('devicesPage.lastSeen'),
      sortValue: (d: DeviceData) => d.updated_at ?? 0,
      csvValue: (d: DeviceData) => (d.updated_at ? new Date(d.updated_at).toISOString() : ''),
      render: (d: DeviceData) => (
        <div className="text-muted-foreground text-xs whitespace-nowrap">
          {formatDate(d.updated_at)}
        </div>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (d: DeviceData) => (
        <button
          className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-destructive hover:text-destructive-foreground h-8 px-3"
          onClick={() => deleteDevice(d.device_id, d)}
        >
          {t('devicesPage.delete')}
        </button>
      ),
    },
  ];

  return (
    <DataList
      columns={deviceColumns}
      data={devices}
      getId={(d: DeviceData) => d.device_id}
      selectable={false}
      searchable
      searchPlaceholder={t('table.searchDevices')}
      searchText={(d: DeviceData) => `${d.device_name || ''} ${d.device_id || ''}`}
      sortable
      defaultSortKey="created"
      paginated
      pageSize={10}
      exportable
      exportFilename="devices"
      exportLabel={t('table.export')}
      loading={refreshing || needsLoad}
      emptyMessage={t('devicesPage.noDevices')}
      emptyDescription={t('devicesPage.noDevicesDesc')}
      hasPermission={isVerified}
      toolbar={
        <div className="flex items-center justify-between px-6 py-4">
          <h3 className="font-semibold">{t('devicesPage.title')}</h3>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
              onClick={refetchDevices}
              disabled={refreshing || !isVerified}
            >
              {refreshing ? t('devicesPage.refreshing') : t('devicesPage.refresh')}
            </button>
          </div>
        </div>
      }
    />
  );
}
