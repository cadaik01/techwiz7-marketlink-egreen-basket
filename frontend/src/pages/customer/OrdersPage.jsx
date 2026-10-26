import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Countdown } from '../../components/common/Countdown';
import { DataTable } from '../../components/common/table/DataTable';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { useCustomerOrders } from '../../hooks/queries/customer/useCustomerOrders';
import { useReorder } from '../../hooks/queries/customer/useReorder';
import { formatDate, formatMoney, formatTime } from '../../utils/formatters';
import '../../styles/customer/OrdersPage.css';


const STATUSES = {
  open: [
    { value: 'PLACED', label: 'Placed' },
    { value: 'ACCEPTED', label: 'Accepted' },
    { value: 'READY_FOR_PICKUP', label: 'Ready for pickup' },
  ],
  history: [
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'DECLINED', label: 'Declined' },
    { value: 'NO_SHOW', label: 'No-show' },
    { value: 'EXPIRED', label: 'Expired' },
  ],
};


// One shortcut per row keeps the table narrow on phones; cancelling lives on the detail page only.
function primaryAction(order) {
  const allowed = order.allowed_actions ?? [];
  const base = `/customer/orders/${order.id}`;
  if (allowed.includes('REVIEW')) return { label: 'Review', to: `${base}/review` };
  if (allowed.includes('MODIFY')) return { label: 'Edit', to: `${base}/edit` };
  if (allowed.includes('REQUEST_CHANGE')) return { label: 'Change', to: `${base}/edit` };
  if (allowed.includes('REORDER')) return { label: 'Reorder' };
  return null;
}

function stop(event) {
  event.stopPropagation();
}


export default function OrdersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const reorder = useReorder();

  const tab = searchParams.get('tab') === 'history' ? 'history' : 'open';
  const selectedStatus = searchParams.get('status') ?? '';
  const params = {
    tab,
    ...(selectedStatus ? { status: selectedStatus } : {}),
    ordering: tab === 'open' ? 'pickup_start_at' : '-created_at',
  };
  const { data, isLoading } = useCustomerOrders(params);

  function switchTab(next) {
    setSearchParams(next === 'open' ? {} : { tab: next });
  }

  function selectStatus(value) {
    const nextStatus = selectedStatus === value ? '' : value;
    const query = {};
    if (tab === 'history') query.tab = tab;
    if (nextStatus) query.status = nextStatus;
    setSearchParams(query);
  }

  const columns = [
    {
      key: 'id',
      header: 'Order',
      render: (order) => (
        <Link to={`/customer/orders/${order.id}`} className="orders-page__id" onClick={stop}>{`#${order.id}`}</Link>
      ),
    },
    { key: 'farmer', header: 'Stall', render: (order) => order.farmer.stall_name },
    {
      key: 'market',
      header: 'Pickup at',
      render: (order) => (
        <span className="orders-page__market">
          {order.market.name}
          {order.stall_label ? <span className="orders-page__stall-label">{order.stall_label}</span> : null}
        </span>
      ),
    },
    {
      key: 'pickup',
      header: 'When',
      render: (order) => (
        `${formatDate(order.pickup_date)} · ${formatTime(order.pickup_start_at)}–${formatTime(order.pickup_end_at)}`
      ),
    },
    { key: 'item_count', header: 'Items' },
    { key: 'total_amount', header: 'Total', align: 'end', render: (order) => formatMoney(order.total_amount) },
    {
      key: 'status',
      header: 'Status',
      render: (order) => (
        <span className="orders-page__status">
          <StatusBadge status={order.status} />
          {order.has_pending_change ? <Badge variant="warning">Change requested</Badge> : null}
          {order.is_expiring_soon ? <Badge variant="warning">Pickup soon</Badge> : null}
        </span>
      ),
    },
    {
      key: 'cutoff',
      header: 'Deadline',
      render: (order) => (
        
        (order.allowed_actions ?? ['MODIFY']).length > 0 || tab === 'open'
          ? <Countdown targetIso={order.cutoff_at} label="Edit/cancel until" />
          : null
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'end',
      render: (order) => {
        const action = primaryAction(order);
        return (
          <div className="orders-page__actions" onClick={stop} onKeyDown={stop} role="presentation">
            {action?.to ? (
              <Button asChild variant="outline" size="sm">
                <Link to={action.to}>{action.label}</Link>
              </Button>
            ) : null}
            {action && !action.to ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                loading={reorder.isPending && reorder.variables === order.id}
                onClick={() => reorder.mutate(order.id)}
              >
                {action.label}
              </Button>
            ) : null}
            <Button asChild variant="ghost" size="sm">
              <Link to={`/customer/orders/${order.id}`} aria-label={`View order #${order.id}`}>
                View
                <ChevronRight className="orders-page__chevron" aria-hidden />
              </Link>
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <section className="orders-page">
      <PageHeader title="My orders" description="One order per stall, paid in cash when you collect." />

      <Tabs value={tab} onValueChange={switchTab}>
        <TabsList>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
      </Tabs>

      <fieldset className="orders-page__filters">
        <legend className="orders-page__filters-legend">Status</legend>
        <label className="orders-page__filter">
          <input
            type="radio"
            name="status-filter"
            className="orders-page__filter-input"
            checked={!selectedStatus}
            onChange={() => selectStatus('')}
          />
          <span className="orders-page__filter-text">All</span>
        </label>
        {STATUSES[tab].map((status) => (
          <label className="orders-page__filter" key={status.value}>
            <input
              type="radio"
              name="status-filter"
              className="orders-page__filter-input"
              checked={selectedStatus === status.value}
              onClick={() => {
                if (selectedStatus === status.value) selectStatus('');
              }}
              onChange={() => selectStatus(status.value)}
            />
            <span className="orders-page__filter-text">{status.label}</span>
          </label>
        ))}
      </fieldset>

      <DataTable
        columns={columns}
        rows={data?.results ?? []}
        rowKey={(order) => order.id}
        onRowClick={(order) => navigate(`/customer/orders/${order.id}`)}
        caption="My orders"
        isLoading={isLoading}
        emptyMessage="No orders here yet."
      />
    </section>
  );
}
