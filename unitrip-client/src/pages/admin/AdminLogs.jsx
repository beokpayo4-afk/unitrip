import { useCallback, useEffect, useState } from "react";
import { adminApi } from "@/api/client";
import AdminAlert from "@/components/admin/AdminAlert";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
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
import { formatDateTime } from "@/utils/format";

function levelVariant(level) {
  if (level === "error") return "destructive";
  if (level === "warn") return "warning";
  return "secondary";
}

export default function AdminLogs() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState("");
  const [q, setQ] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminApi.logs({
        level: level || undefined,
        q: q || undefined,
        page,
        limit: 40,
      });
      setItems(data.items || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err) {
      setError(err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [level, q, page]);

  useEffect(() => {
    const t = setTimeout(() => {
      load();
    }, 250);
    return () => clearTimeout(t);
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [level, q]);

  return (
    <div>
      <AdminPageHeader
        title="System logs"
        description="Readable audit trail of important admin and booking events. Detailed server logs also write to the logs/ folder."
        actions={
          <Button type="button" variant="outline" size="sm" onClick={() => load()}>
            Refresh
          </Button>
        }
      />

      <AdminAlert>{error}</AdminAlert>

      <div className="mb-4 rounded-xl border border-border bg-muted/40 p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Search</Label>
            <Input
              placeholder="Action, message, actor…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Level</Label>
            <SelectNative value={level} onChange={(e) => setLevel(e.target.value)}>
              <option value="">All</option>
              <option value="info">Info</option>
              <option value="warn">Warn</option>
              <option value="error">Error</option>
            </SelectNative>
          </div>
        </div>
      </div>

      {!loading && items.length === 0 ? (
        <AdminEmptyState
          title="No logs yet"
          description="Events appear here when packages are hidden, bookings change status, payments verify, or admins sign in."
        />
      ) : (
        <>
          <AdminTableWrap>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Actor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 5 }).map((__, j) => (
                          <TableCell key={j}>
                            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : items.map((log) => (
                      <TableRow key={log._id}>
                        <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                          {formatDateTime(log.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={levelVariant(log.level)}>{log.level}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{log.action}</TableCell>
                        <TableCell className="max-w-md text-sm">{log.message}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {log.actor?.email || log.actor?.role || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </AdminTableWrap>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>
              {total} event{total === 1 ? "" : "s"} · page {page} of {pages}
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={page >= pages || loading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
