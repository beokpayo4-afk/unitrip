import { Suspense, use, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "@/api/client";
import { HOLIDAY_PACKAGES } from "@/holidays/data/packages";
import { bumpHolidayCatalog } from "@/holidays/services/holidayCatalog";
import AdminAlert from "@/components/admin/AdminAlert";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTableWrap from "@/components/admin/AdminTableWrap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatINR } from "@/utils/format";

const cache = new Map();

function loadPackages(version) {
  if (!cache.has(version)) {
    cache.set(
      version,
      (async () => {
        try {
          let items = await adminApi.holidayPackages();
          if (items.length === 0) {
            items = await adminApi.seedHolidayPackages(HOLIDAY_PACKAGES);
            bumpHolidayCatalog();
          }
          return { items, error: "" };
        } catch (error) {
          return { items: [], error: error.message || "Could not load holiday packages." };
        }
      })()
    );
  }
  return cache.get(version);
}

function PackageTable({ version, onChanged }) {
  const result = use(loadPackages(version));
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  async function toggle(item) {
    setBusyId(item._id);
    setError("");
    try {
      await adminApi.publishHolidayPackage(item._id, !item.published);
      bumpHolidayCatalog();
      onChanged();
    } catch (err) {
      setError(err.message || "Could not update the package.");
    } finally {
      setBusyId("");
    }
  }

  async function remove(item) {
    if (!confirm(`Delete ${item.name}? Existing holiday requests stay saved.`)) return;
    setBusyId(item._id);
    setError("");
    try {
      await adminApi.deleteHolidayPackage(item._id);
      bumpHolidayCatalog();
      onChanged();
    } catch (err) {
      setError(err.message || "Could not delete the package.");
    } finally {
      setBusyId("");
    }
  }

  if (result.error) return <AdminAlert>{result.error}</AdminAlert>;
  if (result.items.length === 0) {
    return <AdminEmptyState title="No holiday packages" description="Add a package to publish it on the holiday packages page." />;
  }

  return (
    <>
      <AdminAlert>{error}</AdminAlert>
      <AdminTableWrap>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Package</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.items.map((item) => (
              <TableRow key={item._id}>
                <TableCell>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.durationLabel}</p>
                </TableCell>
                <TableCell>{item.destination}</TableCell>
                <TableCell>{(item.categories || []).join(", ")}</TableCell>
                <TableCell>{formatINR(item.startingPrice)}</TableCell>
                <TableCell>
                  <Badge variant={item.published ? "success" : "secondary"}>{item.published ? "Published" : "Unpublished"}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/admin/holiday-packages/${item._id}`}>Edit</Link>
                    </Button>
                    <Button size="sm" variant="outline" disabled={busyId === item._id} onClick={() => toggle(item)}>
                      {item.published ? "Unpublish" : "Publish"}
                    </Button>
                    <Button size="sm" variant="outline" disabled={busyId === item._id} onClick={() => remove(item)}>
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AdminTableWrap>
    </>
  );
}

export default function AdminHolidayPackages() {
  const [version, setVersion] = useState(0);
  return (
    <div>
      <AdminPageHeader
        title="Holiday packages"
        description="UnitTrip holiday catalogue. Unpublished packages stay off the public holiday page."
        actions={
          <Button asChild>
            <Link to="/admin/holiday-packages/new">Add package</Link>
          </Button>
        }
      />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading holiday packages…</p>}>
        <PackageTable version={version} onChanged={() => setVersion((current) => current + 1)} />
      </Suspense>
    </div>
  );
}
