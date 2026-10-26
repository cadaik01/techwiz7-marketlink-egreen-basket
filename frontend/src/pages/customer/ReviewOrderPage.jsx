import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Store } from 'lucide-react';
import { FormAlert } from '../../components/common/forms/FormAlert';
import { RatingInput } from '../../components/common/forms/RatingInput';
import { LazyImage } from '../../components/common/LazyImage';
import { PageHeader } from '../../components/common/PageHeader';
import { PageSkeleton } from '../../components/feedback/PageSkeleton';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { useCustomerOrder } from '../../hooks/queries/customer/useCustomerOrder';
import { useReviewFarmer, useReviewItem } from '../../hooks/queries/customer/useReviews';
import { ApiError } from '../../lib/ApiError';
import '../../styles/customer/ReviewOrderPage.css';


const STALL_HINT = 'How was the stall? e.g. friendly, on time, well packed (optional)';
const PRODUCT_HINT = 'How was the product? e.g. fresh, as described, good value (optional)';


function SubjectHeader({ kind, title, image, detail }) {
  return (
    <span className="review-order__subject">
      <span className="review-order__thumb">
        {image === undefined ? (
          <Store className="review-order__thumb-icon" aria-hidden />
        ) : (
          <LazyImage src={image ?? ''} alt="" className="review-order__thumb-image" />
        )}
      </span>
      <span className="review-order__subject-text">
        <span className="review-order__kind">{kind}</span>
        <span className="review-order__subject-title">{title}</span>
        {detail ? <span className="review-order__subject-detail">{detail}</span> : null}
      </span>
    </span>
  );
}

SubjectHeader.propTypes = {
  kind: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  image: PropTypes.string,
  detail: PropTypes.string,
};


function ReviewForm({ subject, name, hint, onSubmit, onError }) {
  const [rating, setRating] = useState(null);
  const [comment, setComment] = useState('');
  const [pending, setPending] = useState(false);
  const headingId = `review-${name}`;

  return (
    <section className="review-order__form" aria-labelledby={headingId}>
      <div className="review-order__heading" id={headingId}>{subject}</div>

      <RatingInput name={name} value={rating} onChange={setRating} disabled={pending} />

      <Textarea
        aria-label="Comment"
        maxLength={1000}
        placeholder={hint}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
      />

      <Button
        type="button"
        disabled={rating === null}
        loading={pending}
        onClick={async () => {
          setPending(true);
          try {
            await onSubmit({ rating, comment: comment.trim() || null });
          } catch (error) {
            onError(ApiError.fromUnknown(error));
          } finally {
            setPending(false);
          }
        }}
      >
        Submit review
      </Button>
    </section>
  );
}

ReviewForm.propTypes = {
  subject: PropTypes.node.isRequired,
  name: PropTypes.string.isRequired,
  hint: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};


function Reviewed({ subject }) {
  return (
    <section className="review-order__form is-reviewed">
      <div className="review-order__heading">{subject}</div>
      <span className="review-order__reviewed">
        <CheckCircle2 className="review-order__reviewed-icon" aria-hidden />
        Reviewed
      </span>
    </section>
  );
}

Reviewed.propTypes = {
  subject: PropTypes.node.isRequired,
};


export default function ReviewOrderPage() {
  const { orderId } = useParams();
  const { data: order, isLoading } = useCustomerOrder(orderId);
  const reviewFarmer = useReviewFarmer(orderId);
  const reviewItem = useReviewItem(orderId);
  const [error, setError] = useState(null);

  if (isLoading || !order) return <PageSkeleton />;

  const state = order.review_state;
  const pending = new Set(state?.items_pending_review ?? []);
  const left = state ? Number(!state.farmer_reviewed) + pending.size : 0;
  const total = order.items.length + 1;

  function report(apiError) {
    setError(apiError.friendlyMessage);
  }

  const stallSubject = <SubjectHeader kind="Rate the stall" title={order.farmer.stall_name} />;

  return (
    <section className="review-order">
      <PageHeader
        title={`Review order #${order.id}`}
        description="Rate the stall and each product you collected. Your name is shortened on the public page, and the stall may reply."
      />

      <FormAlert message={error} />

      {left === 0 ? (
        <p className="review-order__done">
          Everything in this order has already been reviewed. Thank you.
        </p>
      ) : (
        <>
          <p className="review-order__progress">{`${left} of ${total} left to review`}</p>
          <div className="review-order__forms">
            {state.farmer_reviewed ? (
              <Reviewed subject={stallSubject} />
            ) : (
              <ReviewForm
                subject={stallSubject}
                name="farmer"
                hint={STALL_HINT}
                onError={report}
                onSubmit={async (payload) => {
                  setError(null);
                  await reviewFarmer.mutateAsync(payload);
                }}
              />
            )}

            {order.items.map((item) => {
              const subject = (
                <SubjectHeader
                  kind="Rate the product"
                  title={item.product_name}
                  image={item.product_image}
                  detail={`${item.quantity} ${item.unit}`}
                />
              );
              return pending.has(item.id) ? (
                <ReviewForm
                  key={item.id}
                  subject={subject}
                  name={`item-${item.id}`}
                  hint={PRODUCT_HINT}
                  onError={report}
                  onSubmit={async (payload) => {
                    setError(null);
                    await reviewItem.mutateAsync({ itemId: item.id, ...payload });
                  }}
                />
              ) : (
                <Reviewed key={item.id} subject={subject} />
              );
            })}
          </div>
        </>
      )}

      <p className="review-order__back">
        <Link to={`/customer/orders/${order.id}`}>Back to the order</Link>
      </p>
    </section>
  );
}
