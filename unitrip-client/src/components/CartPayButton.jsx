import { useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "react-qr-code";
import { CheckCircle2 } from "lucide-react";
import { bookingApi } from "@/api/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/utils/format";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CartPayButton({
  cartGroupId,
  grandTotal,
  paymentAvailable,
  upiPayment,
  razorpayAvailable,
  onPaid,
}) {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [rzpLoading, setRzpLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [upiTxnId, setUpiTxnId] = useState("");
  const [payerUpiId, setPayerUpiId] = useState("");

  if (!cartGroupId) return null;

  if (!paymentAvailable && !upiPayment) {
    return (
      <p className="text-sm text-muted-foreground">
        Online cart payment is not configured. Total due: {formatINR(grandTotal)}.
      </p>
    );
  }

  if (!isAuthenticated || isAdmin) {
    return (
      <Button asChild>
        <Link to="/login" state={{ from: "/my-bookings" }}>
          Log in to pay cart ({formatINR(grandTotal)})
        </Link>
      </Button>
    );
  }

  async function handleConfirmUpi() {
    setError("");
    setSuccess("");
    if (!payerUpiId.trim() || !payerUpiId.includes("@")) {
      setError("Enter the UPI ID you paid from (e.g. yourname@oksbi)");
      return;
    }
    setLoading(true);
    try {
      const res = await bookingApi.confirmCartUpi(cartGroupId, {
        payerUpiId: payerUpiId.trim(),
        upiTxnId: upiTxnId.trim() || undefined,
      });
      setSuccess("Payment successful! All cart bookings are confirmed.");
      onPaid?.(res);
    } catch (err) {
      setError(err.message || "Could not confirm payment");
    } finally {
      setLoading(false);
    }
  }

  async function handleRazorpay() {
    setError("");
    setRzpLoading(true);
    try {
      const ready = await loadRazorpayScript();
      if (!ready) {
        setError("Could not load Razorpay checkout");
        return;
      }
      const order = await bookingApi.createCartPayment(cartGroupId);
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "UNITRIP",
        description: `Cart ${cartGroupId}`,
        order_id: order.orderId,
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone,
        },
        theme: { color: "#0d6e6e" },
        handler: async (response) => {
          try {
            const verified = await bookingApi.verifyCartPayment({
              cartGroupId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setSuccess("Payment successful!");
            onPaid?.(verified);
          } catch (err) {
            setError(err.message || "Payment verification failed");
          }
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => {
        setError(resp.error?.description || "Payment failed");
      });
      rzp.open();
    } catch (err) {
      setError(err.message || "Could not start payment");
    } finally {
      setRzpLoading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div>
        <h3 className="font-display text-lg font-bold">Pay cart with UPI</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Scan and pay <strong>{formatINR(grandTotal)}</strong> for this cart
        </p>
      </div>

      {upiPayment?.uri && (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-border">
            <QRCode value={upiPayment.uri} size={180} level="M" />
          </div>
          <div className="w-full flex-1 space-y-3 text-sm">
            <p className="font-medium">{upiPayment.payeeName}</p>
            <p>
              <span className="text-muted-foreground">Amount:</span>{" "}
              <strong>{formatINR(grandTotal)}</strong>
            </p>
            <Button asChild variant="secondary" size="sm">
              <a href={upiPayment.uri}>Open UPI app</a>
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2 border-t border-border pt-4">
        <Label htmlFor="cart-payer-upi">Your UPI ID (required)</Label>
        <Input
          id="cart-payer-upi"
          value={payerUpiId}
          onChange={(e) => setPayerUpiId(e.target.value)}
          placeholder="e.g. yourname@oksbi"
          required
        />
        <Label htmlFor="cart-upi-ref">UPI reference / UTR (optional)</Label>
        <Input
          id="cart-upi-ref"
          value={upiTxnId}
          onChange={(e) => setUpiTxnId(e.target.value)}
          placeholder="Paste UTR from your UPI app"
        />
        <Button type="button" disabled={loading} onClick={handleConfirmUpi}>
          {loading ? "Confirming…" : `I’ve paid ${formatINR(grandTotal)}`}
        </Button>
      </div>

      {razorpayAvailable && (
        <Button
          type="button"
          variant="outline"
          disabled={rzpLoading}
          onClick={handleRazorpay}
        >
          {rzpLoading ? "Opening…" : "Pay with Razorpay instead"}
        </Button>
      )}

      {success && (
        <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="size-4" /> {success}
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
