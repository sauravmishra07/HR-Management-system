import { useQuery, useMutation } from '@tanstack/react-query';
import { recruitmentApi } from '@/api';
import { useToast } from '@/hooks/useToast';
import { apiError } from '@/lib/axios';
import { fdate, money } from '@/utils/format';
import { Card, Button, DataTable } from '@/components/ui';

export default function OffersTab({ onView }) {
  const toast = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['recruitment', 'offers'],
    queryFn: () => recruitmentApi.offers(),
    select: (r) => r.data,
  });
  const rows = data || [];

  const open = useMutation({
    mutationFn: (id) => recruitmentApi.getOffer(id),
    onSuccess: (res) => onView(res.data),
    onError: (e) => toast(apiError(e), 'error'),
  });

  const columns = [
    {
      key: 'name',
      header: 'Offer',
      render: (o) => (
        <div>
          <div className="cell-main">{o.name}</div>
          <div className="cell-sub mono">{o.code}</div>
        </div>
      ),
    },
    { key: 'role', header: 'Role' },
    { key: 'dept', header: 'Department' },
    { key: 'ctc', header: 'CTC', render: (o) => <span className="amt">{money(o.ctc)}</span> },
    { key: 'joinDate', header: 'Joining', render: (o) => fdate(o.joinDate) },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (o) => (
        <Button
          size="sm"
          variant="soft"
          icon="eye"
          loading={open.isPending && open.variables === o._id}
          onClick={() => open.mutate(o._id)}
        >
          View letter
        </Button>
      ),
    },
  ];

  return (
    <Card pad={false}>
      <div className="card-pad" style={{ paddingBottom: 0 }}>
        <div className="card-title">
          <span>Offers <span className="sub">every generated offer letter, ready to download or print</span></span>
        </div>
      </div>
      <DataTable
        columns={columns}
        rows={rows}
        loading={isLoading}
        minWidth={740}
        emptyLabel="No offers yet"
        emptyHint="Generate one from a candidate at the 'Offer' stage."
      />
    </Card>
  );
}
