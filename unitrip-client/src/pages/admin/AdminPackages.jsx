import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "@/api/client";
import AdminAlert from "@/components/admin/AdminAlert";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import {
  AdminDeleteButton,
  AdminEditButton,
  AdminRowActions,
} from "@/components/admin/AdminRowActions";
import AdminTableWrap from "@/components/admin/AdminTableWrap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/context/ToastContext";
import { formatINR } from "@/utils/format";

export default function AdminPackages() {
  const { success: toastSuccess, error: toastError } = useToast();
  const [packages, setPackages] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [active, setActive] = useState("");
  const searchRef = useRef(search);
  searchRef.current = search;

  const load = useCallback(async (overrides = {}) => {
    const params = {};
    const s = overrides.search ?? searchRef.current;
    const c = overrides.city ?? city;
    const a = overrides.active ?? active;
    if (s) params.search = s;
    if (c) params.city = c;
    if (a === "true" || a === "false") params.isActive = a;
    setPackages(await adminApi.packages(params));
  }, [city, active]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      load({ search })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [search, city, active, load]);

  async function handleDelete(id) {
    if (
      !confirm(
        "Hide this package from the site?\n\nExisting customer bookings stay intact. The package will no longer appear in the public catalog."
      )
    ) {
      return;
    }
    try {
      const res = await adminApi.deletePackage(id);
      toastSuccess(res.message || "Package hidden");
      await load();
    } catch (err) {
      toastError(err.message || "Failed to hide package");
      setError(err.message);
    }
  }

  const filtered = packages.filter((pkg) => {
    if (active === "true" && !pkg.isActive) return false;
    if (active === "false" && pkg.isActive) return false;
    return true;
  });

  return (
    <div>
      <AdminPageHeader
        title="Packages"
        description="Create and manage travel experiences. Hide removes a package from the catalog; bookings are preserved."
        actions={
          <Button asChild>
            <Link to="/admin/packages/new">New package</Link>
          </Button>
        }
      />

      <AdminAlert>{error}</AdminAlert>

      <div className="mb-4 rounded-xl border border-border bg-muted/40 p-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Search</Label>
            <Input
              placeholder="Title, city, tags…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") load({ search }).catch((err) => setError(err.message));
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label>City</Label>
            <Input
              placeholder="Delhi"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Visibility</Label>
            <SelectNative value={active} onChange={(e) => setActive(e.target.value)}>
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Hidden</option>
            </SelectNative>
          </div>
        </div>
      </div>

      {!loading && filtered.length === 0 ? (
        <AdminEmptyState
          title="No packages match"
          description="Try clearing filters or create a new package."
          action={
            <Button asChild>
              <Link to="/admin/packages/new">New package</Link>
            </Button>
          }
        />
      ) : (
        <AdminTableWrap>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((__, j) => (
                        <TableCell key={j}>
                          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : filtered.map((pkg) => {
                    const hidden = !pkg.isActive || Boolean(pkg.deletedAt);
                    return (
                      <TableRow key={pkg._id}>
                        <TableCell>
                          <div className="font-medium">{pkg.title}</div>
                          <div className="text-xs text-muted-foreground">{pkg.slug}</div>
                        </TableCell>
                        <TableCell>{pkg.city}</TableCell>
                        <TableCell>{formatINR(pkg.amount)}</TableCell>
                        <TableCell>
                          <Badge variant={hidden ? "secondary" : "success"}>
                            {hidden ? "Hidden" : "Active"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <AdminRowActions>
                            <AdminEditButton href={`/admin/packages/${pkg._id}`} />
                            {!hidden && (
                              <AdminDeleteButton
                                label="Hide"
                                onClick={() => handleDelete(pkg._id)}
                              />
                            )}
                          </AdminRowActions>
                        </TableCell>
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>
        </AdminTableWrap>
      )}
    </div>
  );
}
