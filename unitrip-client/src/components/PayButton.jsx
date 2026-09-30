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

export default function PayButton({ ticket, onPaid }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [rzpLoading, setRzpLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [upiTxnId, setUpiTxnId] = useState("");
  const [payerUpiId, setPayerUpiId] = useState("");

  if (!ticket || ticket.status === "cancelled") return null;

  if (ticket.status === "confirmed" && ticket.paidAt) {
    return (
      <div className="no-print rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
        <p className="flex items-center gap-2 font-medium">
          <CheckCircle2 className="size-5 shrink-0" aria-hidden />
          Payment successful — booking confirmed
        </p>
        <p className="mt-1 text-sm text-emerald-800/80">
          You can download your PDF ticket below.
        </p>
      </div>
    );
  }

  if (!ticket.paymentAvailable) {
    return (
      <p className="no-print text-xs text-muted-foreground">
        Online payment is not configured yet. An admin can confirm this booking.
      </p>
    );
  }

  if (!isAuthenticated || isAdmin) {
    return (
      <Button asChild className="no-print w-full">
        <Link to="/login" state={{ from: "/my-bookings" }}>
          Log in to pay
        </Link>
      </Button>
    );
  }

  const upi = ticket.upiPayment;
  const amount = ticket.totalAmount;

  async function handleConfirmUpi() {
    setError("");
    setSuccess("");
    if (!payerUpiId.trim() || !payerUpiId.includes("@")) {
      setError("Enter the UPI ID you paid from (e.g. yourname@oksbi)");
      return;
    }
    setLoading(true);
    try {
      const res = await bookingApi.confirmUpi(ticket.id, {
        payerUpiId: payerUpiId.trim(),
        upiTxnId: upiTxnId.trim() || undefined,
      });
      setSuccess("Payment successful! Your booking is confirmed.");
      onPaid?.(res.booking);
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

      const order = await bookingApi.createPayment(ticket.id);
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "UNITRIP",
        description: ticket.package?.title || "Travel booking",
        order_id: order.orderId,
        prefill: {
          name: ticket.travellerName,
          email: ticket.email,
          contact: ticket.phone,
        },
        theme: { color: "#0d6e6e" },
        handler: async (response) => {
          try {
            const verified = await bookingApi.verifyPayment({
              bookingId: ticket.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setSuccess("Payment successful! Your booking is confirmed.");
            onPaid?.(verified.booking);
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
    <div className="no-print space-y-4 rounded-xl border border-border bg-card p-4">
      <div>
        <h3 className="font-display text-lg font-bold">Pay with UPI</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Scan this QR with GPay, PhonePe, Paytm or any UPI app. Amount{" "}
          <strong>{formatINR(amount)}</strong>
        </p>
      </div>

      {upi?.uri ? (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-border">
            <QRCode value={upi.uri} size={180} level="M" />
          </div>
          <div className="w-full flex-1 space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground">Pay to</p>
              <p className="font-medium">{upi.payeeName}</p>
            </div>
            <p>
              <span className="text-muted-foreground">Amount:</span>{" "}
              <strong>{formatINR(amount)}</strong>
            </p>
            <p>
              <span className="text-muted-foreground">Note / Order:</span>{" "}
              <strong>{ticket.orderId}</strong>
            </p>
            {upi.uri.startsWith("upi://") && (
              <Button asChild variant="secondary" size="sm" className="w-full sm:w-auto">
                <a href={upi.uri}>Open UPI app</a>
              </Button>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">UPI details unavailable.</p>
      )}

      <div className="space-y-2 border-t border-border pt-4">
        <Label htmlFor={`payer-upi-${ticket.id}`}>Your UPI ID (required)</Label>
        <Input
          id={`payer-upi-${ticket.id}`}
          value={payerUpiId}
          onChange={(e) => setPayerUpiId(e.target.value)}
          placeholder="e.g. yourname@oksbi"
          required
        />
        <Label htmlFor={`upi-ref-${ticket.id}`}>
          UPI reference / UTR (optional)
        </Label>
        <Input
          id={`upi-ref-${ticket.id}`}
          value={upiTxnId}
          onChange={(e) => setUpiTxnId(e.target.value)}
          placeholder="Paste UTR from your UPI app"
        />
        <Button
          type="button"
          className="w-full"
          disabled={loading}
          onClick={handleConfirmUpi}
        >
          {loading ? "Confirming…" : "I’ve paid — confirm booking"}
        </Button>
        <p className="text-xs text-muted-foreground">
          After you pay, enter the UPI ID you paid from, then confirm. Your PDF unlocks on
          success.
        </p>
      </div>

      {ticket.razorpayAvailable && (
        <div className="border-t border-border pt-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={rzpLoading}
            onClick={handleRazorpay}
          >
            {rzpLoading ? "Opening…" : "Pay with Razorpay instead"}
          </Button>
        </div>
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
