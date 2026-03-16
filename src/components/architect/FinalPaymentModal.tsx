'use client';

import { useState, FormEvent } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createClient } from '@/lib/supabase/client';
import { DollarSign, CheckCircle, AlertCircle } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
  hidePostalCode: true,
};

interface ApplicationArtist {
  full_name: string;
}

interface ApplicationProject {
  title: string;
}

interface Application {
  id: string;
  artist_id: string;
  project_id: string;
  quoted_price: number;
  currency?: string;
  artist?: ApplicationArtist;
  project?: ApplicationProject;
  projects?: ApplicationProject;
}

interface FinalPaymentFormProps {
  application: Application;
  onClose: () => void;
  onSuccess: () => void;
}

interface FinalPaymentModalProps {
  application: Application;
  onClose: () => void;
  onSuccess: () => void;
}

function FinalPaymentForm({ application, onClose, onSuccess }: FinalPaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const finalAmount = application.quoted_price / 2; // 50% remaining

  const handlePayment = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { data: { session } } = await supabase.auth.getSession();

      // Get artist's Stripe account
      const { data: artistData } = await supabase
        .from('profiles')
        .select('stripe_connect_account_id')
        .eq('id', application.artist_id)
        .single();

      // Create payment intent for final 50%
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            totalAmount: application.quoted_price,
            currency: 'usd',
            applicationId: application.id,
            projectId: application.project_id,
            artistStripeAccountId: artistData?.stripe_connect_account_id,
            isFinalPayment: true // Flag to indicate this is final payment
          })
        }
      );

      const paymentData = await response.json();

      if (paymentData.error) {
        throw new Error(paymentData.error);
      }

      const { clientSecret } = paymentData;

      // Confirm card payment
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (!paymentIntent) {
        throw new Error('Payment intent not returned');
      }

      // Update application with final payment info
      const { error: updateError } = await supabase
        .from('applications')
        .update({
          final_payment_intent_id: paymentIntent.id,
          final_payment_completed: true,
          final_payment_date: new Date().toISOString()
        })
        .eq('id', application.id);

      if (updateError) throw updateError;

      alert('Final 50% payment completed successfully! Project completed.');
      onSuccess();

    } catch (err: unknown) {
      console.error('Payment error:', err);

      const errMessage = err instanceof Error ? err.message : '';

      // User-friendly error messages
      let errorMessage = 'Error processing final payment. Please try again.';

      if (errMessage.includes('card')) {
        errorMessage = 'Card error. Please verify the details and try again.';
      } else if (errMessage.includes('insufficient')) {
        errorMessage = 'Insufficient funds on card.';
      } else if (errMessage.includes('declined')) {
        errorMessage = 'Payment declined by bank. Please contact your bank.';
      } else if (errMessage.includes('network')) {
        errorMessage = 'Connection error. Check your internet and try again.';
      } else if (errMessage.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (errMessage) {
        errorMessage = errMessage;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <h2>
          <DollarSign size={28} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
          Final Payment (50%)
        </h2>

        <div style={{
          padding: '20px',
          background: '#fff3cd',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #ffc107'
        }}>
          <p style={{ marginBottom: '10px' }}>
            <strong>Project Final Payment</strong>
          </p>
          <p style={{ fontSize: '0.9rem', color: '#856404' }}>
            This is the final 50% payment of the project. The amount will be transferred directly to the artist after confirmation.
          </p>
        </div>

        <div className="payment-details" style={{ marginBottom: '20px' }}>
          <p><strong>Artist:</strong> {application.artist?.full_name}</p>
          <p><strong>Project:</strong> {application.project?.title || application.projects?.title}</p>
          <hr />
          <p><strong>Total Project Value:</strong> ${application.quoted_price?.toFixed(2)}</p>
          <p><strong>Already Paid (50%):</strong> ${(application.quoted_price / 2)?.toFixed(2)}</p>
          <p style={{ fontSize: '1.2rem', color: '#007bff' }}>
            <strong>Final Payment (50%):</strong> ${finalAmount?.toFixed(2)}
          </p>
          <hr />
          <p className="fee-notice" style={{fontSize: '0.9rem', color: '#666'}}>
            * Platform fee (10%): ${(application.quoted_price * 0.10)?.toFixed(2)}
          </p>
        </div>

        <form onSubmit={handlePayment}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
              Card Information
            </label>
            <div style={{
              padding: '12px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: '#fff'
            }}>
              <CardElement options={CARD_ELEMENT_OPTIONS} />
            </div>
          </div>

          {error && (
            <div style={{
              padding: '12px',
              background: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '6px',
              color: '#721c24',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="submit"
              disabled={!stripe || loading}
              className="btn-primary"
              style={{ background: '#28a745' }}
            >
              {loading ? 'Processing...' : `Pay $${finalAmount?.toFixed(2)}`}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>

        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#d4edda',
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: '#155724'
        }}>
          <CheckCircle size={16} style={{ verticalAlign: 'middle', marginRight: '5px' }} />
          <strong>Secure Payment:</strong> All payments are processed securely and encrypted.
        </div>
      </div>
    </div>
  );
}

function FinalPaymentModal({ application, onClose, onSuccess }: FinalPaymentModalProps) {
  return (
    <Elements stripe={stripePromise}>
      <FinalPaymentForm
        application={application}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </Elements>
  );
}

export default FinalPaymentModal;
