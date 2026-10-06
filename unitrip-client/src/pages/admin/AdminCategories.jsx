import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
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

const emptyForm = { name: "", description: "", imageUrl: "" };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function load() {
    setCategories(await catalogApi.categories({ all: true }));
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
    setForm(emptyForm);
    setFormError("");
    setOpen(true);
  }

  function openEdit(c) {
    setEditingId(c._id);
    setForm({
      name: c.name,
      description: c.description || "",
      imageUrl: c.imageUrl || "",
    });
    setFormError("");
    setOpen(true);
  }

  function handleOpenChange(next) {
    setOpen(next);
    if (!next) {
      setEditingId(null);
      setForm(emptyForm);
      setFormError("");
    }
  }

  async function uploadImage(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setFormError("");
    try {
      const res = await adminApi.upload(file, "image");
      setForm((f) => ({ ...f, imageUrl: res.url }));
    } catch (err) {
      setFormError(err.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      const wasEdit = Boolean(editingId);
      if (editingId) await adminApi.updateCategory(editingId, form);
      else await adminApi.createCategory(form);
      setOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      setSuccess(wasEdit ? "Category updated" : "Category created");
      await load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this category?")) return;
    try {
      await adminApi.deleteCategory(id);
      setSuccess("Category deleted");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Categories"
        description="Organize packages by topic or destination type."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Create category
          </Button>
        }
      />

      <AdminAlert>{error}</AdminAlert>
      <AdminAlert variant="success">{success}</AdminAlert>

      {categories.length === 0 ? (
        <AdminEmptyState
          title="No categories yet"
          description="Create your first category to group packages."
          action={
            <Button onClick={openCreate}>
              <Plus className="size-4" />
              Create category
            </Button>
          }
        />
      ) : (
        <>
          <div className="hidden sm:block">
            <AdminTableWrap>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((c) => (
                    <TableRow key={c._id}>
                      <TableCell>
                        <div className="flex items-center gap-3 py-1">
                          {c.imageUrl && (
                            <img
                              src={c.imageUrl}
                              alt=""
                              className="size-11 rounded-md object-cover"
                            />
                          )}
                          <span className="font-medium">{c.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                      <TableCell className="text-right">
                        <AdminRowActions>
                          <AdminEditButton onClick={() => openEdit(c)} />
                          <AdminDeleteButton onClick={() => handleDelete(c._id)} />
                        </AdminRowActions>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AdminTableWrap>
          </div>

          <div className="space-y-4 sm:hidden">
            {categories.map((c) => (
              <Card key={c._id}>
                <CardContent className="flex items-start gap-4 p-5">
                  {c.imageUrl && (
                    <img
                      src={c.imageUrl}
                      alt=""
                      className="size-14 shrink-0 rounded-md object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{c.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{c.slug}</p>
                    <div className="mt-4">
                      <AdminRowActions>
                        <AdminEditButton onClick={() => openEdit(c)} />
                        <AdminDeleteButton onClick={() => handleDelete(c._id)} />
                      </AdminRowActions>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit category" : "Create category"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update details, then save."
                : "Add a name, optional description, and an image link or upload."}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <AdminAlert>{formError}</AdminAlert>

              <div className="space-y-2.5">
                <Label htmlFor="cat-name" required>
                  Name
                </Label>
              <Input
                id="cat-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea
                id="cat-desc"
                rows={4}
                className="min-h-25 resize-y"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
              <div>
                <p className="text-sm font-semibold">Image</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Paste a URL, or upload a file — either works.
                </p>
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="cat-image-url">Image URL</Label>
                <Input
                  id="cat-image-url"
                  placeholder="https://example.com/category.jpg"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="cat-image-file">Upload</Label>
                <Input
                  id="cat-image-file"
                  type="file"
                  accept="image/*"
                  onChange={uploadImage}
                  disabled={uploading}
                />
              </div>
              {uploading && (
                <p className="text-xs text-muted-foreground">Uploading…</p>
              )}
              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  alt=""
                  className="h-24 w-36 rounded-lg border border-border object-cover"
                />
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || uploading}>
                {saving
                  ? "Saving…"
                  : editingId
                    ? "Update category"
                    : "Create category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
