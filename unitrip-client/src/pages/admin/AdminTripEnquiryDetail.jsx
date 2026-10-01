import { Suspense, use, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { adminApi } from "@/api/client";
import AdminAlert from "@/components/admin/AdminAlert";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { SelectNative } from "@/components/ui/select-native";

const ENQUIRY_STATUSES = {
  new: "New",
  contacted: "Contacted",
  quotation_sent: "Quotation sent",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
};

const cache = new Map();

function loadEnquiry(id, version) {
  const key = `${id}:${version}`;
  if (!cache.has(key)) {
    cache.set(
      key,
      adminApi.tripEnquiry(id).then(
        (item) => ({ item, error: "" }),
        (error) => ({ item: null, error: error.message || "Request not found." })
      )
    );
  }
  return cache.get(key);
}

function Row({ label, value }) {
  return (
    <div className="grid gap-1 border-b border-border py-3 sm:grid-cols-[180px_1fr]">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value || "—"}</dd>
    </div>
  );
}

function Detail({ id, version, onChanged }) {
  const result = use(loadEnquiry(id, version));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  if (result.error) return <AdminAlert>{result.error}</AdminAlert>;
  const item = result.item;

  async function changeStatus(status) {
    setSaving(true);
    setError("");
    try {
      await adminApi.updateTripEnquiry(item._id, { status });
      onChanged();
    } catch (err) {
      setError(err.message || "Could not update the request.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <AdminAlert>{error}</AdminAlert>
      <SelectNative
        className="mb-4 max-w-xs"
        value={ENQUIRY_STATUSES[item.status] ? item.status : "new"}
        disabled={saving}
        aria-label="Enquiry status"
        onChange={(event) => changeStatus(event.target.value)}
      >
        {Object.entries(ENQUIRY_STATUSES).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </SelectNative>
      <dl>
        <Row label="Enquiry ID" value={item.reference} />
        <Row label="Customer" value={`${item.name} · ${item.email} · ${item.phone}`} />
        <Row label="WhatsApp" value={item.whatsapp} />
        <Row label="Destination" value={`${item.destination} · ${item.scope}`} />
        <Row label="Dates" value={`${item.departureDate} to ${item.returnDate}${item.flexible ? " · flexible" : ""}`} />
        <Row label="Travellers" value={`${item.adults} adults, ${item.children} children, ${item.infants} infants`} />
        <Row label="Budget" value={`${item.currency} ${item.budgetMin} – ${item.budgetMax}`} />
        <Row label="Hotel" value={item.hotel} />
        <Row label="Trip type" value={(item.tripTypes || []).join(", ")} />
        <Row label="Interests" value={(item.interests || []).join(", ")} />
        <Row label="Transport" value={(item.transport || []).join(", ")} />
        <Row label="Requirements" value={item.requirements} />
        <Row label="Status" value={ENQUIRY_STATUSES[item.status] || item.status} />
      </dl>
    </div>
  );
}

export default function AdminTripEnquiryDetail() {
  const { id } = useParams();
  const [version, setVersion] = useState(0);
  return (
    <div>
      <AdminPageHeader
        title="Custom travel request"
        description="Marking Quotation sent means an expert has sent a quote. The system does not generate the quote."
        actions={
          <Link to="/admin/trip-requests" className="text-sm font-semibold text-primary underline">
            All requests
          </Link>
        }
      />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading request…</p>}>
        <Detail id={id} version={version} onChanged={() => setVersion((current) => current + 1)} />
      </Suspense>
    </div>
  );
}
