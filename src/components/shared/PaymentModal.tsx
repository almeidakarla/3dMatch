'use client';

import { useState, useEffect, FormEvent } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { createClient } from '@/lib/supabase/client';

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
}

interface PaymentFormProps {
  application: Application;
  onClose: () => void;
  onSuccess: () => void;
}

interface PaymentModalProps {
  application: Application;
  onClose: () => void;
  onSuccess: () => void;
}

function PaymentForm({ application, onClose, onSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [artistStripeAccount, setArtistStripeAccount] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  useEffect(() => {
    // Fetch artist's Stripe account ID
    const fetchArtistStripeAccount = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('stripe_connect_account_id')
        .eq('id', application.artist_id)
        .single();

      if (!error && data) {
        setArtistStripeAccount(data.stripe_connect_account_id);
      }
    };

    fetchArtistStripeAccount();
  }, [application.artist_id]);

  const handlePayment = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Get the Supabase session
      const { data: { session } } = await supabase.auth.getSession();

      const totalAmount = application.quoted_price;

      if (!totalAmount || totalAmount <= 0) {
        throw new Error('Invalid payment amount. Check the proposal value.');
      }

      console.log('Creating payment intent...', {
        totalAmount,
        applicationId: application.id,
        artistId: application.artist_id
      });

      // Call Edge Function to create payment intent
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            totalAmount: totalAmount,
            currency: application.currency || 'brl',
            applicationId: application.id,
            projectId: application.project_id,
            artistStripeAccountId: artistStripeAccount
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Payment intent error response:', errorText);
        throw new Error(`Failed to create payment intent: ${errorText}`);
      }

      const paymentData = await response.json();

      if (paymentData.error) {
        throw new Error(paymentData.error);
      }

      console.log('Payment intent created:', {
        clientSecret: paymentData.clientSecret ? 'received' : 'missing',
        upfrontAmount: paymentData.upfrontAmount
      });

      const { clientSecret } = paymentData;

      // Get card element
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error('Card element not found');
      }

      console.log('Confirming card payment...');

      // Confirm card payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (stripeError) {
        console.error('Stripe error:', stripeError);
        throw new Error(stripeError.message);
      }

      if (!paymentIntent) {
        throw new Error('Payment intent not returned');
      }

      console.log('Payment confirmed:', paymentIntent.id);
      console.log('Calling database function...');

      // Call database function to accept application and record payment
      const { data: acceptData, error: acceptError } = await supabase.rpc(
        'accept_application_with_payment',
        {
          p_application_id: application.id,
          p_stripe_payment_intent_id: paymentIntent.id,
          p_total_amount: totalAmount
        }
      );

      if (acceptError) {
        console.error('Database function error:', acceptError);
        throw acceptError;
      }

      console.log('Database function response:', acceptData);

      if (!acceptData || !acceptData.success) {
        throw new Error(acceptData?.error || 'Failed to accept application');
      }

      // Mark payment as successful
      setPaymentSuccess(true);

      // Show success message
      console.log('Payment flow completed successfully!');

      // Wait a moment to show success, then trigger callback
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (err: unknown) {
      console.error('Payment error:', err);

      const errMessage = err instanceof Error ? err.message : '';

      // User-friendly error messages
      let errorMessage = 'Error processing payment. Please try again.';

      if (errMessage.includes('card')) {
        errorMessage = 'Card error. Check the details and try again.';
      } else if (errMessage.includes('insufficient')) {
        errorMessage = 'Insufficient funds on card.';
      } else if (errMessage.includes('declined')) {
        errorMessage = 'Payment declined by bank. Contact your bank.';
      } else if (errMessage.includes('network')) {
        errorMessage = 'Connection error. Check your internet and try again.';
      } else if (errMessage.includes('timeout')) {
        errorMessage = 'Timeout. Please try again.';
      } else if (errMessage) {
        errorMessage = errMessage;
      }

      setError(errorMessage);
      setPaymentSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // If payment successful, show success state
  if (paymentSuccess) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="payment-success">
            <div className="success-icon">&#10003;</div>
            <h2>Payment Completed Successfully!</h2>
            <p>The artist has been notified and can start working.</p>
            <p className="success-note">
              The remaining 50% will be charged when the work is delivered and approved.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Confirm Payment</h2>

        <div className="payment-details">
          <p><strong>Artist:</strong> {application.artist?.full_name || 'N/A'}</p>
          <p><strong>Project:</strong> {application.project?.title || 'N/A'}</p>
          <hr />
          <p><strong>Total Amount:</strong> {application.currency || 'BRL'} {application.quoted_price ? application.quoted_price.toFixed(2) : '0.00'}</p>
          <p className="payment-split"><strong>Payment Now (50%):</strong> {application.currency || 'BRL'} {application.quoted_price ? (application.quoted_price / 2).toFixed(2) : '0.00'}</p>
          <p className="payment-split"><strong>Payment on Delivery (50%):</strong> {application.currency || 'BRL'} {application.quoted_price ? (application.quoted_price / 2).toFixed(2) : '0.00'}</p>
          <hr />
          <p className="fee-notice" style={{fontSize: '0.9rem', color: '#666'}}>
            * Platform fee (10%): {application.currency || 'BRL'} {application.quoted_price ? (application.quoted_price * 0.10).toFixed(2) : '0.00'}
          </p>
          <p className="fee-notice" style={{fontSize: '0.9rem', color: '#666'}}>
            * Payment is held until delivery approval
          </p>
        </div>

        <form onSubmit={handlePayment}>
          <div className="form-group" style={{ marginTop: '20px', marginBottom: '20px' }}>
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
            <div className="error-message" style={{
              marginBottom: '15px',
              padding: '12px',
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: '4px',
              color: '#c33'
            }}>
              {error}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="submit"
              disabled={!stripe || loading}
              className="btn-primary"
            >
              {loading ? 'Processing...' : `Confirm Payment (${application.currency || 'BRL'} ${application.quoted_price ? (application.quoted_price / 2).toFixed(2) : '0.00'})`}
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

        {!artistStripeAccount && (
          <div className="alert-warning" style={{ marginTop: '15px', fontSize: '0.85rem', padding: '12px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px' }}>
            The artist has not connected their bank account yet. Payment will be processed but the transfer will be pending until the artist completes the setup.
          </div>
        )}
      </div>
    </div>
  );
}

function PaymentModal({ application, onClose, onSuccess }: PaymentModalProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        application={application}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </Elements>
  );
}

export default PaymentModal;
