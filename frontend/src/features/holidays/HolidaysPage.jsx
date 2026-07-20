import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { holidayApi } from '@/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { apiError } from '@/lib/axios';
import { fdate, DOW, todayISO } from '@/utils/format';
import { PageHeader, Card, StatCard, Button, Icon, Chip, DataTable, useConfirm } from '@/components/ui';
import HolidayFormModal from './HolidayFormModal';

const THIS_YEAR = new Date().getFullYear();
const YEARS = [THIS_YEAR - 1, THIS_YEAR, THIS_YEAR + 1];

export default function HolidaysPage() {
  const { can } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();
  const confirm = useConfirm();

  const [year, setYear] = useState(String(THIS_YEAR));
  const [formOpen, setFormOpen] = useState(false);

  const { data: list = [], isLoading } = useQuery({
    queryKey: ['holidays', { year }],
    queryFn: () => holidayApi.list(year ? { year } : undefined),
    select: (r) => r.data,
    placeholderData: keepPreviousData,
  });

  const { data: upcoming = [] } = useQuery({
    queryKey: ['holidays', 'upcoming'],
    queryFn: holidayApi.upcoming,
    select: (r) => r.data,
  });

  const del = useMutation({
    mutationFn: (id) => holidayApi.remove(id),
    onSuccess: () => {
      toast('Holiday removed');
      qc.invalidateQueries({ queryKey: ['holidays'] });
    },
    onError: (e) => toast(apiError(e), 'error'),
  });

  const onDelete = async (h) => {
    const ok = await confirm({
      title: 'Remove holiday?',
      message: `${h.name} (${fdate(h.date)}) will be removed from the calendar.`,
      okLabel: 'Remove',
      danger: true,
    });
    if (ok) del.mutate(h._id);
  };

  const manage = can('manageHoliday');
  const today = todayISO();
  const remaining = list.filter((h) => h.date >= today).length;
  const next = upcoming[0];

  const columns = [
    { key: 'date', header: 'Date', render: (h) => <b>{fdate(h.date)}</b> },
    { key: 'day', header: 'Day', render: (h) => DOW[new Date(h.date).getDay()] },
    { key: 'name', header: 'Holiday', render: (h) => <span className="cell-main">{h.name}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (h) => (h.date < today ? <Chip variant="line">Gone</Chip> : <Chip variant="sky">Upcoming</Chip>),
    },
    ...(manage
      ? [{
          key: 'actions',
          header: 'Actions',
          align: 'right',
          render: (h) => (
            <Button size="sm" variant="ghost" icon="trash" onClick={() => onDelete(h)}>Remove</Button>
          ),
        }]
      : []),
  ];

  return (
    <>
      <PageHeader
        title="Holidays"
        hint="The company holiday calendar. Upcoming ones are highlighted and also shown on the dashboard."
        actions={manage && <Button icon="plus" onClick={() => setFormOpen(true)}>Add holiday</Button>}
      />

      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <StatCard label={`Holidays in ${year || 'all years'}`} icon="sun" value={list.length} trend="company-declared" />
        <StatCard label="Remaining" icon="cal" value={remaining} trend="from today onwards" />
        <StatCard
          label="Next holiday"
          icon="clock"
          value={next ? next.name : '—'}
          trend={next ? `${fdate(next.date)} · ${DOW[new Date(next.date).getDay()]}` : 'nothing upcoming'}
        />
      </div>

      {upcoming.length > 0 && (
        <Card title="Upcoming" sub="the next days off" className="section-gap">
          <div style={{ marginTop: 6 }}>
            {upcoming.map((h) => (
              <div className="list-row" key={h._id || h.date}>
                <span className="lr-ico"><Icon name="sun" width={16} height={16} /></span>
                <div className="lr-main">
                  <b>{h.name}</b>
                  <span>{fdate(h.date)} · {DOW[new Date(h.date).getDay()]}</span>
                </div>
                <span className="chip chip-sky">Upcoming</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card pad={false} className="section-gap">
        <div className="card-pad" style={{ paddingBottom: 0 }}>
          <div className="filter-bar">
            <select className="input" value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="">All years</option>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <div className="spacer" />
            <span className="chip chip-sky">{list.length} holidays</span>
          </div>
        </div>
        <DataTable
          columns={columns}
          rows={list}
          loading={isLoading}
          minWidth={620}
          emptyLabel="No holidays"
          emptyHint={manage ? 'Add the first holiday to the calendar.' : 'No holidays declared for this period.'}
        />
      </Card>

      <HolidayFormModal open={formOpen} onClose={() => setFormOpen(false)} />
    </>
  );
}
