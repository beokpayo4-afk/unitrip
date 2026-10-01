import { Suspense, use, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "@/api/client";
import AdminAlert from "@/components/admin/AdminAlert";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTableWrap from "@/components/admin/AdminTableWrap";
import { SelectNative } from "@/components/ui/select-native";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const cache = new Map();

const ENQUIRY_STATUSES = {
  new: "New",
  contacted: "Contacted",
  quotation_sent: "Quotation sent",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
};

function loadEnquiries(version) {
  if (!cache.has(version)) {
    cache.set(
      version,
      adminApi.tripEnquiries().then(
        (items) => ({ items, error: "" }),
        (error) => ({ items: [], error: error.message || "Could not load requests." })
      )
    );
  }
  return cache.get(version);
}

function showDay(value) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function EnquiryTable({ version, onChanged }) {
  const result = use(loadEnquiries(version));
  const [savingId, setSavingId] = useState("");
  const [actionError, setActionError] = useState("");

  async function changeStatus(id, status) {
    setSavingId(id);
    setActionError("");
    try {
      await adminApi.updateTripEnquiry(id, { status });
      onChanged();
    } catch (error) {
      setActionError(error.message || "Could not update the request.");
    } finally {
      setSavingId("");
    }
  }

  if (result.error) return <AdminAlert>{result.error}</AdminAlert>;
  if (result.items.length === 0) {
    return (
      <AdminEmptyState
        title="No custom travel requests"
        description="Requests from the trip planner will appear here. A quote is not created until an expert sends one."
      />
    );
  }

  return (
    <>
      <AdminAlert>{actionError}</AdminAlert>
      <AdminTableWrap>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Enquiry ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Travellers</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Requirements</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.items.map((item) => (
              <TableRow key={item._id}>
                <TableCell>
                  <Link className="font-semibold text-primary underline" to={`/admin/trip-requests/${item._id}`}>
                    {item.reference}
                  </Link>
                </TableCell>
                <TableCell>
                  <p>{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.email}</p>
                </TableCell>
                <TableCell>{item.destination}</TableCell>
                <TableCell>
                  {showDay(item.departureDate)} – {showDay(item.returnDate)}
                  {item.flexible ? " · flexible" : ""}
                </TableCell>
                <TableCell>
                  {item.adults} {Number(item.adults) === 1 ? "adult" : "adults"}, {item.children}{" "}
                  {Number(item.children) === 1 ? "child" : "children"}, {item.infants}{" "}
                  {Number(item.infants) === 1 ? "infant" : "infants"}
                </TableCell>
                <TableCell>
                  {item.currency} {Number(item.budgetMin).toLocaleString("en-IN")} – {Number(item.budgetMax).toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="max-w-xs truncate">{item.requirements || "—"}</TableCell>
                <TableCell>
                  <SelectNative
                    value={ENQUIRY_STATUSES[item.status] ? item.status : "new"}
                    disabled={savingId === item._id}
                    aria-label={`Status for ${item.reference}`}
                    onChange={(event) => changeStatus(item._id, event.target.value)}
                  >
                    {Object.entries(ENQUIRY_STATUSES).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </SelectNative>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AdminTableWrap>
    </>
  );
}

export default function AdminTripEnquiries() {
  const [version, setVersion] = useState(0);
  return (
    <div>
      <AdminPageHeader
        title="Custom travel requests"
        description="A UnitTrip expert reviews these requests. Choosing Quotation sent records that an expert sent a quote. This screen does not calculate one."
      />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading requests…</p>}>
        <EnquiryTable version={version} onChanged={() => setVersion((current) => current + 1)} />
      </Suspense>
    </div>
  );
}
