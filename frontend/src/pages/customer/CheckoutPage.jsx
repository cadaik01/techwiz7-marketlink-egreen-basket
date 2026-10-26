import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { CalendarClock, Info } from 'lucide-react';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { DirectionsButton } from '../../components/common/maps/DirectionsButton';
import { FormAlert } from '../../components/common/forms/FormAlert';
import { PageHeader } from '../../components/common/PageHeader';
import { LazyImage } from '../../components/common/LazyImage';
import { PageSkeleton } from '../../components/feedback/PageSkeleton';
import { Button } from '../../components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Textarea } from '../../components/ui/Textarea';
import { useNow } from '../../hooks/useNow';
import { usePickupOptions, useProductPickupOptions } from '../../hooks/queries/customer/usePickupOptions';
import { useCheckout } from '../../hooks/queries/customer/useCheckout';
import { ApiError } from '../../lib/ApiError';
import { cartGroups, isOrderable, MAX_FARMERS_PER_CHECKOUT, useCartStore } from '../../stores/cart.store';
import { formatDate, formatDateTime, formatMoney } from '../../utils/formatters';
import { moneyToNumber } from '../../utils/helpers/domain';
import { cn } from '../../lib/cn';
import '../../styles/customer/CheckoutPage.css';


function readItemErrors(fieldErrors, subOrders) {
  const byItem = {};
  Object.entries(fieldErrors ?? {}).forEach(([key, messages]) => {
    const match = /^groups\.(\d+)\.items\.(\d+)\./.exec(key);
    if (!match) return;
    const subOrder = subOrders[Number(match[1])];
    const item = subOrder?.items[Number(match[2])];
    if (item) byItem[`${subOrder.key}:${item.line.product_id}`] = messages[0];
  });
  return byItem;
}


function readGroupErrors(fieldErrors, subOrders) {
  const bySubOrder = {};
  Object.entries(fieldErrors ?? {}).forEach(([key, messages]) => {
    const match = /^groups\.(\d+)\.(pickup_slot_id|pickup_date|farmer_id|note)$/.exec(key);
    if (!match) return;
    const subOrder = subOrders[Number(match[1])];
    if (subOrder) bySubOrder[subOrder.key] = messages[0];
  });
  return bySubOrder;
}


function intersect(lists) {
  if (lists.length === 0) return [];
  return lists[0].filter((id) => lists.every((list) => list.includes(id)));
}


// Each item is collected at one market; items of a stall that share a market form one order.
function buildStalls(groups, byProduct, chosen) {
  return groups.map((group) => {
    const marketsOf = (line) => (byProduct[line.product_id] ?? []).map((option) => option.market_id);
    const shared = intersect(group.lines.map(marketsOf));
    const subOrders = new Map();

    const lines = group.lines.map((line) => {
      const markets = byProduct[line.product_id] ?? [];
      const ids = marketsOf(line);
      const pick = chosen[line.product_id];
      const marketId = ids.includes(pick) ? pick : shared[0] ?? ids[0] ?? null;

      if (marketId !== null) {
        const key = `${group.farmer_id}-${marketId}`;
        if (!subOrders.has(key)) {
          const market = markets.find((option) => option.market_id === marketId);
          subOrders.set(key, {
            key, farmer_id: group.farmer_id, market_id: marketId, market_name: market.market_name, items: [],
          });
        }
        subOrders.get(key).items.push({ line, quantity: line.quantity });
      }

      return { line, markets, market_id: marketId };
    });

    return { ...group, lines, subOrders: [...subOrders.values()] };
  });
}


function LineAssignment({ entry, loading, onChange }) {
  const { line, markets, market_id: marketId } = entry;

  return (
    <li className="checkout-page__choice checkout-page__choice-foi0" aria-label={line.name}>
      <div className="checkout-page__choice-media">
        <LazyImage src={line.image ?? ''} alt="" className="checkout-page__choice-image" />
      </div>
      <div className="checkout-page__choice-body">
        <span className="checkout-page__item-name">{`${line.name} × ${line.quantity} ${line.unit}`}</span>

        {loading ? null : markets.length === 0 ? (
          <p className="checkout-page__error">
            This stall has no pickup window for this item in the next few days. Remove it to continue.
          </p>
        ) : markets.length > 1 ? (
          <div className="checkout-page__chips">
            {markets.map((option) => (
              <label key={option.market_id} className="checkout-page__chip">
                <input
                  type="radio"
                  className="checkout-page__chip-input"
                  name={`market-${line.product_id}`}
                  aria-label={option.market_name}
                  checked={option.market_id === marketId}
                  onChange={() => onChange(option.market_id)}
                />
                <span className="checkout-page__chip-text">{option.market_name}</span>
              </label>
            ))}
          </div>
        ) : (
          <span className="checkout-page__where">{`Pickup at ${markets[0].market_name}`}</span>
        )}
      </div>
    </li>
  );
}

LineAssignment.propTypes = {
  entry: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};


function PickupPicker({ subOrder, stallName, selection, onChange, error }) {
  const { data: options, isLoading } = usePickupOptions(
    subOrder.farmer_id,
    subOrder.items.map((item) => item.line.product_id),
  );
  const now = useNow();

  if (isLoading) return <PageSkeleton />;
  const market = options?.find((option) => option.market_id === subOrder.market_id);
  if (!market) {
    return (
      <p className="checkout-page__none">
        {`No pickup window at ${subOrder.market_name} fits all of these items in the next few days. Pick another market for one of them.`}
      </p>
    );
  }

  const day = market.dates.find((entry) => entry.date === selection.date) ?? market.dates[0];

  return (
    <div className="checkout-page__picker">
      <fieldset className="checkout-page__field">
        <legend className="checkout-page__legend">Pickup date</legend>
        <div className="checkout-page__chips">
          {market.dates.map((entry) => (
            <label key={entry.date} className="checkout-page__chip">
              <input
                type="radio"
                className="checkout-page__chip-input"
                name={`date-${subOrder.key}`}
                aria-label={formatDate(entry.date)}
                checked={entry.date === day.date}
                onChange={() => onChange({ date: entry.date, pickup_slot_id: null, cutoff_at: null })}
              />
              <span className="checkout-page__chip-text">{formatDate(entry.date)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="checkout-page__field">
        <legend className="checkout-page__legend">Pickup window</legend>
        <div className="checkout-page__chips">
          {day.slots.map((slot) => {
            const passed = new Date(slot.cutoff_at).getTime() <= now;
            return (
              <label key={slot.pickup_slot_id} className={cn('checkout-page__chip', passed && 'is-disabled')}>
                <input
                  type="radio"
                  className="checkout-page__chip-input"
                  name={`slot-${subOrder.key}`}
                  aria-label={`${slot.start_time}–${slot.end_time}`}
                  disabled={passed}
                  checked={slot.pickup_slot_id === selection.pickup_slot_id}
                  onChange={() => onChange({
                    date: day.date,
                    pickup_slot_id: slot.pickup_slot_id,
                    cutoff_at: slot.cutoff_at,
                  })}
                />
                <span className="checkout-page__chip-text" title={passed ? 'Pre-order cutoff has passed' : undefined}>
                  {`${slot.start_time}–${slot.end_time}`}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {selection.cutoff_at ? (
        <p className="checkout-page__cutoff">
          <CalendarClock className="checkout-page__cutoff-icon" aria-hidden />
          {`Edit or cancel until: ${formatDateTime(selection.cutoff_at)}`}
        </p>
      ) : null}

      <div className="checkout-page__where-row checkout-page__where-row-h5zi">
        <span className="checkout-page__address">
          <span>{market.market_name}</span>
          {market.stall_label ? (
            <span className="checkout-page__stall-label">{` · ${market.stall_label}`}</span>
          ) : null}
        </span>
        <DirectionsButton latitude={market.latitude} longitude={market.longitude} />
      </div>

      <div className="checkout-page__field">
        <label className="checkout-page__legend" htmlFor={`note-${subOrder.key}`}>
          {`Note for ${stallName}`}
        </label>
        <Textarea
          id={`note-${subOrder.key}`}
          maxLength={300}
          value={selection.note ?? ''}
          onChange={(event) => onChange({ note: event.target.value })}
        />
      </div>

      {error ? <p className="checkout-page__error">{error}</p> : null}
    </div>
  );
}

PickupPicker.propTypes = {
  subOrder: PropTypes.object.isRequired,
  stallName: PropTypes.string.isRequired,
  selection: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
};


export default function CheckoutPage() {
  const lines = useCartStore((state) => state.lines);
  const checkout = useCheckout();
  const [chosenMarkets, setChosenMarkets] = useState({});
  const [selections, setSelections] = useState({});
  const [confirming, setConfirming] = useState(false);
  const [itemErrors, setItemErrors] = useState({});
  const [groupErrors, setGroupErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [limitMessage, setLimitMessage] = useState(null);

  const groups = useMemo(
    () => cartGroups(lines)
      .map((group) => ({ ...group, lines: group.lines.filter(isOrderable) }))
      .filter((group) => group.lines.length > 0),
    [lines],
  );
  const orderable = useMemo(() => groups.flatMap((group) => group.lines), [groups]);
  const { isLoading: loadingMarkets, byProduct } = useProductPickupOptions(orderable);

  const stalls = buildStalls(groups, byProduct, chosenMarkets);
  const subOrders = stalls.flatMap((stall) => stall.subOrders);
  const linesReady = !loadingMarkets
    && stalls.every((stall) => stall.lines.every((entry) => entry.markets.length > 0));
  const tooMany = subOrders.length > MAX_FARMERS_PER_CHECKOUT;

  const body = {
    groups: subOrders.map((subOrder) => {
      const selection = selections[subOrder.key] ?? {};
      const note = selection.note?.trim();
      return {
        farmer_id: subOrder.farmer_id,
        pickup_slot_id: selection.pickup_slot_id,
        pickup_date: selection.date,
        ...(note ? { note } : {}),
        items: subOrder.items.map((item) => ({ product_id: item.line.product_id, quantity: item.quantity })),
      };
    }),
  };
  const ready = linesReady && !tooMany && subOrders.length > 0
    && body.groups.every((group) => group.pickup_slot_id && group.pickup_date);
  const total = groups.reduce((sum, group) => sum + group.subtotal, 0);

  function update(key, patch) {
    setSelections((current) => ({ ...current, [key]: { ...current[key], ...patch } }));
  }

  async function place() {
    setItemErrors({});
    setGroupErrors({});
    setFormError(null);
    try {
      await checkout.mutateAsync(body);
    } catch (error) {
      const apiError = ApiError.fromUnknown(error);
      setConfirming(false);
      if (apiError.code === 'OPEN_ORDER_LIMIT_EXCEEDED') {
        setLimitMessage(apiError.apiMessage);
        return;
      }
      const items = readItemErrors(apiError.fieldErrors, subOrders);
      const perGroup = readGroupErrors(apiError.fieldErrors, subOrders);
      setItemErrors(items);
      setGroupErrors(perGroup);
      if (Object.keys(items).length === 0 && Object.keys(perGroup).length === 0) {
        setFormError(apiError.friendlyMessage);
      }
    }
  }

  if (groups.length === 0) {
    return (
      <section className="checkout-page">
        <PageHeader title="Checkout" />
        <p className="checkout-page__none">
          There is nothing to order. <Link to="/customer/cart">Back to cart</Link>
        </p>
      </section>
    );
  }

  return (
    <section className="checkout-page">
      <PageHeader
        title="Checkout"
        description={`You are placing ${subOrders.length} separate order(s) — one per stall and pickup market.`}
      />

      <FormAlert message={formError} />

      <div className="checkout-page__groups">
        {stalls.map((stall) => (
          <section key={stall.farmer_id} className="checkout-page__group" aria-labelledby={`group-${stall.farmer_id}`}>
            <h2 className="checkout-page__group-title" id={`group-${stall.farmer_id}`}>
              {stall.farmer_stall_name}
            </h2>

            <ul className="checkout-page__items h-42">
              {stall.lines.map((entry) => (
                <LineAssignment
                  key={entry.line.product_id}
                  entry={entry}
                  loading={loadingMarkets}
                  onChange={(marketId) => setChosenMarkets((current) => ({ ...current, [entry.line.product_id]: marketId }))}
                />
              ))}
            </ul>

            {loadingMarkets ? <PageSkeleton /> : stall.subOrders.map((subOrder) => (
              <div key={subOrder.key} className="checkout-page__suborder">
                <h3 className="checkout-page__suborder-title">{`Pickup at ${subOrder.market_name}`}</h3>
                <ul className="checkout-page__items">
                  {subOrder.items.map((item) => (
                    <li key={item.line.product_id} className="checkout-page__item">
                      <span className="checkout-page__item-name">
                        {`${item.line.name} × ${item.quantity} ${item.line.unit}`}
                      </span>
                      <span className="checkout-page__item-amount">
                        {formatMoney(moneyToNumber(item.line.price) * item.quantity)}
                      </span>
                      {itemErrors[`${subOrder.key}:${item.line.product_id}`] ? (
                        <p className="checkout-page__error">{itemErrors[`${subOrder.key}:${item.line.product_id}`]}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
                <PickupPicker
                  subOrder={subOrder}
                  stallName={stall.farmer_stall_name}
                  selection={selections[subOrder.key] ?? {}}
                  onChange={(patch) => update(subOrder.key, patch)}
                  error={groupErrors[subOrder.key]}
                />
              </div>
            ))}
          </section>
        ))}
      </div>

      <aside className="checkout-page__summary">
        <p className="checkout-page__total">
          <span>Total</span>
          <span className="checkout-page__total-value">{formatMoney(total)}</span>
        </p>
        {tooMany ? (
          <p className="checkout-page__error">
            {`A checkout covers at most ${MAX_FARMERS_PER_CHECKOUT} orders. Use fewer pickup markets or order the rest separately.`}
          </p>
        ) : null}
        <Button size="lg" disabled={!ready} onClick={() => setConfirming(true)}>
          {`Confirm ${subOrders.length} orders`}
        </Button>
        <p className="checkout-page__hint">
          <Info className="checkout-page__hint-icon" aria-hidden />
          Stock is reserved only when the farmer accepts your order.
        </p>
        <p className="checkout-page__hint">Pay in cash at the stall when you collect.</p>
      </aside>

      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={`Place ${subOrders.length} orders?`}
        description={`Each order is confirmed by its stall. Total ${formatMoney(total)}, paid on pickup.`}
        confirmLabel={`Place ${subOrders.length} orders`}
        loading={checkout.isPending}
        onConfirm={place}
      />

      <Dialog open={limitMessage !== null} onOpenChange={() => setLimitMessage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Too many orders waiting</DialogTitle>
            <DialogDescription>{limitMessage}</DialogDescription>
          </DialogHeader>
          <div className="checkout-page__dialog-actions">
            <Button variant="outline" onClick={() => setLimitMessage(null)}>Close</Button>
            <Button asChild>
              <Link to="/customer/orders">My orders</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
