import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { adminApi, catalogApi } from "@/api/client";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { AdminDeleteButton } from "@/components/admin/AdminRowActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectNative } from "@/components/ui/select-native";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/context/ToastContext";

const empty = {
  title: "",
  slug: "",
  category: "",
  tags: "",
  city: "",
  state: "",
  country: "India",
  images: "",
  amount: "",
  about: "",
  highlights: "",
  itinerary: "",
  inclusions: "",
  exclusions: "",
  pdfLabel: "",
  pdfUrl: "",
  faqQuestion: "",
  faqAnswer: "",
  isActive: true,
};

const TABS = [
  { id: "basics", label: "1. Basics", title: "Basics", description: "Title, category, location, price and visibility." },
  {
    id: "content",
    label: "2. Content",
    title: "Content & media",
    description: "About text, images, itinerary lists, and PDF links.",
  },
  {
    id: "places",
    label: "3. Places",
    title: "Places",
    description: "Included stops and paid add-ons with distance and extra cost.",
  },
  {
    id: "faqs",
    label: "4. FAQs",
    title: "Package FAQs",
    description: "Questions specific to this experience. Review and save when ready.",
  },
];

function linesToArray(text) {
  return String(text || "")
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean);
}

function slugifyClient(text = "") {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminPackageForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { error: toastError, success: toastSuccess } = useToast();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(empty);
  const [pdfLinks, setPdfLinks] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [places, setPlaces] = useState([]);
  const [placeDraft, setPlaceDraft] = useState({
    name: "",
    description: "",
    distanceKm: 0,
    extraAmount: 0,
    type: "included",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState("basics");
  const slugManualRef = useRef(false);

  const tabIndex = TABS.findIndex((t) => t.id === tab);
  const isFirst = tabIndex <= 0;
  const isLast = tabIndex === TABS.length - 1;

  useEffect(() => {
    catalogApi.categories({ all: true }).then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    adminApi
      .package(id)
      .then((pkg) => {
        slugManualRef.current = true;
        setForm({
          title: pkg.title || "",
          slug: pkg.slug || "",
          category: pkg.category?._id || pkg.category || "",
          tags: (pkg.tags || []).join(", "),
          city: pkg.city || "",
          state: pkg.state || "",
          country: pkg.country || "India",
          images: (pkg.images || []).join("\n"),
          amount: pkg.amount ?? "",
          about: pkg.about || "",
          highlights: (pkg.highlights || []).join("\n"),
          itinerary: (pkg.itinerary || []).join("\n"),
          inclusions: (pkg.inclusions || []).join("\n"),
          exclusions: (pkg.exclusions || []).join("\n"),
          pdfLabel: "",
          pdfUrl: "",
          faqQuestion: "",
          faqAnswer: "",
          isActive: pkg.isActive !== false,
        });
        setPdfLinks(pkg.pdfLinks || []);
        setFaqs(pkg.faqs || []);
        setPlaces(
          (pkg.places || []).map((p) => ({
            _id: p._id,
            name: p.name,
            description: p.description || "",
            distanceKm: p.distanceKm || 0,
            extraAmount: p.extraAmount || 0,
            type: p.type || "included",
          }))
        );
      })
      .catch((err) => toastError(err.message || "Failed to load package"));
  }, [id, isEdit, toastError]);

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onTitleChange(value) {
    setForm((f) => ({
      ...f,
      title: value,
      slug: slugManualRef.current ? f.slug : slugifyClient(value),
    }));
  }

  function onSlugChange(value) {
    slugManualRef.current = true;
    setField("slug", slugifyClient(value) || value.toLowerCase());
  }

  function validateBasics() {
    if (!form.title.trim()) return "Title is required";
    if (!form.category) return "Category is required";
    if (!form.city.trim()) return "City is required";
    if (!form.state.trim()) return "State is required";
    if (
      form.amount === "" ||
      Number.isNaN(Number(form.amount)) ||
      Number(form.amount) < 0
    ) {
      return "Valid amount is required";
    }
    return "";
  }

  function goNext() {
    if (tab === "basics") {
      const msg = validateBasics();
      if (msg) {
        toastError(msg);
        return;
      }
    }
    if (!isLast) setTab(TABS[tabIndex + 1].id);
  }

  function goBack() {
    if (!isFirst) setTab(TABS[tabIndex - 1].id);
  }

  function addPdf() {
    if (!form.pdfLabel || !form.pdfUrl) return;
    setPdfLinks((list) => [...list, { label: form.pdfLabel, url: form.pdfUrl }]);
    setField("pdfLabel", "");
    setField("pdfUrl", "");
  }

  function addFaq() {
    if (!form.faqQuestion || !form.faqAnswer) return;
    setFaqs((list) => [
      ...list,
      { question: form.faqQuestion, answer: form.faqAnswer },
    ]);
    setField("faqQuestion", "");
    setField("faqAnswer", "");
  }

  function addPlace() {
    if (!placeDraft.name.trim()) return;
    setPlaces((list) => [
      ...list,
      {
        name: placeDraft.name.trim(),
        description: placeDraft.description || "",
        distanceKm: Number(placeDraft.distanceKm) || 0,
        extraAmount:
          placeDraft.type === "paid_addon"
            ? Number(placeDraft.extraAmount) || 0
            : 0,
        type: placeDraft.type,
      },
    ]);
    setPlaceDraft({
      name: "",
      description: "",
      distanceKm: 0,
      extraAmount: 0,
      type: "included",
    });
  }

  async function uploadImage(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const res = await adminApi.upload(file, "image");
      setField("images", form.images ? `${form.images}\n${res.url}` : res.url);
    } catch (err) {
      toastError(err.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function uploadPdf(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const res = await adminApi.upload(file, "pdf");
      const label = file.name.replace(/\.pdf$/i, "") || "Itinerary PDF";
      setPdfLinks((list) => [...list, { label, url: res.url }]);
    } catch (err) {
      toastError(err.message || "PDF upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    const basicsError = validateBasics();
    if (basicsError) {
      toastError(basicsError);
      setTab("basics");
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title,
      slug: form.slug || undefined,
      category: form.category,
      tags: form.tags,
      city: form.city,
      state: form.state,
      country: form.country,
      images: form.images,
      amount: Number(form.amount),
      about: form.about,
      highlights: linesToArray(form.highlights),
      itinerary: linesToArray(form.itinerary),
      inclusions: linesToArray(form.inclusions),
      exclusions: linesToArray(form.exclusions),
      pdfLinks,
      faqs,
      isActive: form.isActive,
      places: places.map((p) => ({
        ...(p._id ? { _id: p._id } : {}),
        name: p.name,
        description: p.description || "",
        distanceKm: Number(p.distanceKm) || 0,
        extraAmount: p.type === "paid_addon" ? Number(p.extraAmount) || 0 : 0,
        type: p.type,
      })),
    };
    try {
      if (isEdit) await adminApi.updatePackage(id, payload);
      else await adminApi.createPackage(payload);
      toastSuccess(isEdit ? "Package updated" : "Package created");
      navigate("/admin/packages");
    } catch (err) {
      toastError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const current = TABS[tabIndex] || TABS[0];

  return (
    <div className="mx-auto max-w-3xl pb-28">
      <AdminPageHeader
        title={isEdit ? "Edit package" : "New package"}
        description="Complete each tab in order, then save on the last step."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/packages">Back to list</Link>
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>{current.title}</CardTitle>
            <CardDescription>{current.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <TabsContent value="basics" className="mt-0 grid gap-4">
              <div className="space-y-2">
                <Label required>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => onTitleChange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => onSlugChange(e.target.value)}
                  placeholder="auto from title — kept unique on save"
                />
                <p className="text-xs text-muted-foreground">
                  Auto-filled from title. If taken, a unique suffix is added when you save.
                </p>
              </div>
              <div className="space-y-2">
                <Label required>Category</Label>
                <SelectNative
                  value={form.category}
                  onChange={(e) => setField("category", e.target.value)}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </SelectNative>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label required>City</Label>
                  <Input
                    value={form.city}
                    onChange={(e) => setField("city", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label required>State</Label>
                  <Input
                    value={form.state}
                    onChange={(e) => setField("state", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={form.country}
                    onChange={(e) => setField("country", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label required>Amount (INR)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.amount}
                    onChange={(e) => setField("amount", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tags (comma separated)</Label>
                  <Input
                    value={form.tags}
                    onChange={(e) => setField("tags", e.target.value)}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  className="size-4 accent-primary"
                  checked={form.isActive}
                  onChange={(e) => setField("isActive", e.target.checked)}
                />
                Active (visible on site)
              </label>
            </TabsContent>

            <TabsContent value="content" className="mt-0 grid gap-4">
              <div className="space-y-2">
                <Label>About</Label>
                <Textarea
                  value={form.about}
                  onChange={(e) => setField("about", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Images (link or upload)</Label>
                <Textarea
                  value={form.images}
                  onChange={(e) => setField("images", e.target.value)}
                  placeholder={
                    "https://example.com/photo1.jpg\nhttps://example.com/photo2.jpg"
                  }
                />
                <p className="text-xs text-muted-foreground">
                  One image URL per line, and/or upload below. Uploads append a URL.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={uploadImage}
                    disabled={uploading}
                  />
                  {uploading && (
                    <span className="text-xs text-muted-foreground">Uploading…</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.images
                    .split("\n")
                    .map((u) => u.trim())
                    .filter(Boolean)
                    .slice(0, 4)
                    .map((url) => (
                      <img
                        key={url}
                        src={url}
                        alt=""
                        className="h-20 w-28 rounded-md border border-border object-cover"
                      />
                    ))}
                </div>
              </div>
              {["highlights", "itinerary", "inclusions", "exclusions"].map((key) => (
                <div key={key} className="space-y-2">
                  <Label className="capitalize">{key} (one per line)</Label>
                  <Textarea
                    value={form[key]}
                    onChange={(e) => setField(key, e.target.value)}
                  />
                </div>
              ))}

              <div className="space-y-3 border-t border-border pt-4">
                <p className="text-sm font-semibold">PDF files (link or upload)</p>
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                  <Input
                    placeholder="Label"
                    value={form.pdfLabel}
                    onChange={(e) => setField("pdfLabel", e.target.value)}
                  />
                  <Input
                    placeholder="https://..."
                    value={form.pdfUrl}
                    onChange={(e) => setField("pdfUrl", e.target.value)}
                  />
                  <Button type="button" variant="outline" onClick={addPdf}>
                    Add link
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    accept="application/pdf"
                    onChange={uploadPdf}
                    disabled={uploading}
                  />
                  <Badge variant="secondary">or upload PDF</Badge>
                </div>
                <ul className="space-y-2 text-sm">
                  {pdfLinks.map((p, i) => (
                    <li
                      key={`${p.url}-${i}`}
                      className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                    >
                      <span className="truncate">
                        {p.label}: {p.url}
                      </span>
                      <AdminDeleteButton
                        label="Remove"
                        onClick={() =>
                          setPdfLinks((list) => list.filter((_, idx) => idx !== i))
                        }
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="places" className="mt-0 space-y-4">
              <div className="grid gap-3">
                <Input
                  placeholder="Place name"
                  value={placeDraft.name}
                  onChange={(e) => setPlaceDraft({ ...placeDraft, name: e.target.value })}
                />
                <Textarea
                  placeholder="Short description (optional)"
                  value={placeDraft.description}
                  onChange={(e) =>
                    setPlaceDraft({ ...placeDraft, description: e.target.value })
                  }
                />
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <SelectNative
                      value={placeDraft.type}
                      onChange={(e) =>
                        setPlaceDraft({ ...placeDraft, type: e.target.value })
                      }
                    >
                      <option value="included">Included</option>
                      <option value="paid_addon">Paid add-on</option>
                    </SelectNative>
                  </div>
                  <div className="space-y-2">
                    <Label>Distance (km)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={placeDraft.distanceKm}
                      onChange={(e) =>
                        setPlaceDraft({ ...placeDraft, distanceKm: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Extra amount (INR)</Label>
                    <Input
                      type="number"
                      min="0"
                      disabled={placeDraft.type !== "paid_addon"}
                      value={placeDraft.extraAmount}
                      onChange={(e) =>
                        setPlaceDraft({ ...placeDraft, extraAmount: e.target.value })
                      }
                    />
                  </div>
                </div>
                <Button type="button" variant="outline" onClick={addPlace}>
                  Add place
                </Button>
              </div>
              <ul className="space-y-3 text-sm">
                {places.map((p, i) => (
                  <li
                    key={p._id || `${p.name}-${i}`}
                    className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-border p-3"
                  >
                    <div>
                      <strong>{p.name}</strong>{" "}
                      <span className="text-muted-foreground">
                        · {p.type === "paid_addon" ? "Paid add-on" : "Included"} ·{" "}
                        {p.distanceKm} km
                        {p.type === "paid_addon" ? ` · ₹${p.extraAmount}` : ""}
                      </span>
                      {p.description && (
                        <p className="text-muted-foreground">{p.description}</p>
                      )}
                    </div>
                    <AdminDeleteButton
                      label="Remove"
                      onClick={() =>
                        setPlaces((list) => list.filter((_, idx) => idx !== i))
                      }
                    />
                  </li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="faqs" className="mt-0 space-y-4">
              <div className="grid gap-3">
                <Input
                  placeholder="Question"
                  value={form.faqQuestion}
                  onChange={(e) => setField("faqQuestion", e.target.value)}
                />
                <Textarea
                  placeholder="Answer"
                  value={form.faqAnswer}
                  onChange={(e) => setField("faqAnswer", e.target.value)}
                />
                <Button type="button" variant="outline" onClick={addFaq}>
                  Add FAQ
                </Button>
              </div>
              <ul className="space-y-3 text-sm">
                {faqs.map((f, i) => (
                  <li
                    key={`${f.question}-${i}`}
                    className="rounded-lg border border-border p-3"
                  >
                    <strong>{f.question}</strong>
                    <p className="text-muted-foreground">{f.answer}</p>
                    <AdminDeleteButton
                      label="Remove"
                      className="mt-2"
                      onClick={() =>
                        setFaqs((list) => list.filter((_, idx) => idx !== i))
                      }
                    />
                  </li>
                ))}
              </ul>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur-md no-print md:left-60">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Button type="button" variant="outline" asChild>
            <Link to="/admin/packages">Cancel</Link>
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={isFirst} onClick={goBack}>
              <ChevronLeft className="size-4" />
              Back
            </Button>
            {!isLast ? (
              <Button type="button" onClick={goNext}>
                Next
                <ChevronRight className="size-4" />
              </Button>
            ) : (
              <Button type="button" disabled={saving || uploading} onClick={handleSave}>
                {saving ? "Saving…" : isEdit ? "Update package" : "Create package"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
