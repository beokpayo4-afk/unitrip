import { useEffect, useState } from "react";
import { GripVertical, Plus } from "lucide-react";
import { adminApi, catalogApi } from "@/api/client";
import AdminAlert from "@/components/admin/AdminAlert";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import {
  AdminDeleteButton,
  AdminEditButton,
  AdminRowActions,
} from "@/components/admin/AdminRowActions";
import AdminTableWrap from "@/components/admin/AdminTableWrap";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

function nextSortOrder(faqs) {
  if (!faqs.length) return 1;
  return Math.max(...faqs.map((f) => Number(f.sortOrder) || 0)) + 1;
}

export default function AdminFaqs() {
  const [faqs, setFaqs] = useState([]);
  const [form, setForm] = useState({ question: "", answer: "" });
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);
  const [reordering, setReordering] = useState(false);

  async function load() {
    setFaqs(await catalogApi.faqs());
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(""), 2000);
    return () => clearTimeout(t);
  }, [success]);

  function openCreate() {
    setEditingId(null);
    setForm({ question: "", answer: "" });
    setFormError("");
    setOpen(true);
  }

  function openEdit(f) {
    setEditingId(f._id);
    setForm({ question: f.question, answer: f.answer });
    setFormError("");
    setOpen(true);
  }

  function handleOpenChange(next) {
    setOpen(next);
    if (!next) {
      setEditingId(null);
      setForm({ question: "", answer: "" });
      setFormError("");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      const wasEdit = Boolean(editingId);
      if (editingId) {
        const existing = faqs.find((f) => f._id === editingId);
        await adminApi.updateFaq(editingId, {
          question: form.question,
          answer: form.answer,
          sortOrder: existing?.sortOrder ?? nextSortOrder(faqs),
        });
      } else {
        await adminApi.createFaq({
          question: form.question,
          answer: form.answer,
          sortOrder: nextSortOrder(faqs),
        });
      }
      setOpen(false);
      setEditingId(null);
      setForm({ question: "", answer: "" });
      setSuccess(wasEdit ? "FAQ updated" : "FAQ created");
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this FAQ?")) return;
    try {
      await adminApi.deleteFaq(id);
      setSuccess("FAQ deleted");
      if (editingId === id) handleOpenChange(false);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function persistOrder(ordered) {
    setReordering(true);
    setError("");
    try {
      const withOrder = ordered.map((f, i) => ({ ...f, sortOrder: i + 1 }));
      setFaqs(withOrder);
      await Promise.all(
        withOrder.map((f) =>
          adminApi.updateFaq(f._id, {
            question: f.question,
            answer: f.answer,
            sortOrder: f.sortOrder,
          })
        )
      );
      setSuccess("Order saved");
    } catch (err) {
      setError(err.message || "Failed to save order");
      await load().catch(() => {});
    } finally {
      setReordering(false);
    }
  }

  function onDragStart(index) {
    setDragIndex(index);
  }

  function onDragOver(e, index) {
    e.preventDefault();
    if (overIndex !== index) setOverIndex(index);
  }

  function onDrop(index) {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const next = [...faqs];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    setDragIndex(null);
    setOverIndex(null);
    persistOrder(next);
  }

  function onDragEnd() {
    setDragIndex(null);
    setOverIndex(null);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Global FAQs"
        description="Site-wide questions shown across the public site. Drag rows to change display order."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Create FAQ
          </Button>
        }
      />

      <AdminAlert>{error}</AdminAlert>
      <AdminAlert variant="success">{success}</AdminAlert>

      {faqs.length === 0 ? (
        <AdminEmptyState
          title="No FAQs yet"
          description="Add common questions travellers ask before booking."
          action={
            <Button onClick={openCreate}>
              <Plus className="size-4" />
              Create FAQ
            </Button>
          }
        />
      ) : (
        <AdminTableWrap>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12" />
                <TableHead>Question</TableHead>
                <TableHead className="hidden md:table-cell">Answer</TableHead>
                <TableHead className="w-[1%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faqs.map((f, index) => (
                <TableRow
                  key={f._id}
                  onDragOver={(e) => onDragOver(e, index)}
                  onDrop={() => onDrop(index)}
                  className={cn(
                    overIndex === index &&
                      dragIndex !== null &&
                      dragIndex !== index &&
                      "bg-muted/70",
                    dragIndex === index && "opacity-50"
                  )}
                >
                  <TableCell className="align-middle">
                    <button
                      type="button"
                      draggable={!reordering}
                      onDragStart={() => onDragStart(index)}
                      onDragEnd={onDragEnd}
                      className="inline-flex cursor-grab rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
                      title="Drag to reorder"
                      aria-label="Drag to reorder"
                    >
                      <GripVertical className="size-4" />
                    </button>
                  </TableCell>
                  <TableCell className="max-w-55 font-medium sm:max-w-xs">
                    <span className="line-clamp-2">{f.question}</span>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground md:hidden">
                      {f.answer}
                    </p>
                  </TableCell>
                  <TableCell className="hidden max-w-md text-muted-foreground md:table-cell">
                    <span className="line-clamp-2 text-sm">{f.answer}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <AdminRowActions>
                      <AdminEditButton onClick={() => openEdit(f)} />
                      <AdminDeleteButton onClick={() => handleDelete(f._id)} />
                    </AdminRowActions>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AdminTableWrap>
      )}
      {reordering && (
        <p className="text-xs text-muted-foreground">Saving order…</p>
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit FAQ" : "Create FAQ"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the question and answer, then save."
                : "New FAQs are added at the end of the list. Drag rows later to reorder."}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <AdminAlert>{formError}</AdminAlert>

            <div className="space-y-2.5">
              <Label htmlFor="faq-question" required>
                Question
              </Label>
              <Input
                id="faq-question"
                required
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
              />
            </div>
            <div className="space-y-2.5">
              <Label htmlFor="faq-answer" required>
                Answer
              </Label>
              <Textarea
                id="faq-answer"
                required
                rows={5}
                className="min-h-35 resize-y"
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : editingId ? "Update FAQ" : "Create FAQ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
