import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Loader2, Upload, X, Star, GripVertical, Plus, Trash2, ArrowLeft,
  ExternalLink, RefreshCw,
} from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { adminCreateRentalProduct, adminUpdateRentalProduct, adminUpsertRentalProductImages, updateRentalProductFeatures, getRentalProductById } from "@/services/rentalService";
import { adminGetCategories } from "@/services/categoryService";
import { supabase } from "@/lib/supabase";
import { slugify } from "@/lib/utils";
import type { RentalProduct, Category, RentalProductImage } from "@/types";
import { toast } from "sonner";

interface LocalImage {
  id?: string;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  sort_order: number;
  uploading?: boolean;
  error?: string;
  localFile?: File;
  localPreview?: string;
}

export default function AdminRentalProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragIndex = useRef<number | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: "",
    slug: "",
    category_id: "",
    product_type: "website" as "website" | "app",
    overview: "",
    description: "",
    demo_url: "",
    video_url: "",
    price_1month: "",
    price_3months: "",
    price_1year: "",
    is_published: false,
    is_featured: false,
  });
  const [images, setImages] = useState<LocalImage[]>([]);
  const [features, setFeatures] = useState<string[]>([""]);

  useEffect(() => {
    adminGetCategories().then(setCategories);
    if (isEdit && id) {
      getRentalProductById(id).then((product) => {
        if (!product) { navigate("/admin/rental-products"); return; }
        setForm({
          name: product.name,
          slug: product.slug,
          category_id: product.category_id || "",
          product_type: product.product_type,
          overview: product.overview || "",
          description: product.description || "",
          demo_url: product.demo_url || "",
          video_url: product.video_url || "",
          price_1month: String(product.price_1month),
          price_3months: String(product.price_3months),
          price_1year: String(product.price_1year),
          is_published: product.is_published,
          is_featured: product.is_featured,
        });
        const imgs: LocalImage[] = (product.images || []).map((img) => ({
          id: img.id,
          url: img.url,
          alt_text: img.alt_text,
          is_primary: img.is_primary,
          sort_order: img.sort_order,
        }));
        setImages(imgs);
        setFeatures((product.features || []).map((f) => f.feature).concat(""));
        setLoading(false);
      });
    }
  }, [id, isEdit, navigate]);

  const setField = (k: keyof typeof form, v: string | boolean) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const handleNameChange = (name: string) => {
    setField("name", name);
    if (!isEdit) setField("slug", slugify(name));
  };

  // ─── Image upload ────────────────────────────────────────────────────────
  const handleFilesSelected = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = 6 - images.filter((i) => !i.error).length;
    const selected = Array.from(files).slice(0, remaining);
    if (selected.length === 0) { toast.error("Maximum 6 images allowed"); return; }

    const newImages: LocalImage[] = selected.map((file, idx) => ({
      url: "",
      is_primary: images.length === 0 && idx === 0,
      sort_order: images.length + idx,
      uploading: true,
      localFile: file,
      localPreview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);

    for (let i = 0; i < selected.length; i++) {
      const file = selected[i];
      const ext = file.name.split(".").pop();
      const path = `rental/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { data, error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type, upsert: false });

      if (error) {
        setImages((prev) =>
          prev.map((img) => img.localFile === file ? { ...img, uploading: false, error: error.message } : img)
        );
        continue;
      }

      const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(data.path);
      setImages((prev) =>
        prev.map((img) =>
          img.localFile === file ? { ...img, url: publicUrl, uploading: false, localFile: undefined } : img
        )
      );
    }
  }, [images]);

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index).map((img, i) => ({
      ...img,
      sort_order: i,
      is_primary: i === 0 ? true : img.is_primary,
    }));
    setImages(updated.map((img, i) => ({ ...img, is_primary: updated[0]?.url === img.url ? true : i !== 0 ? false : img.is_primary })));
  };

  const setPrimary = (index: number) =>
    setImages((prev) => prev.map((img, i) => ({ ...img, is_primary: i === index })));

  const retryUpload = async (index: number) => {
    const img = images[index];
    if (!img.localFile) return;
    setImages((prev) => prev.map((x, i) => i === index ? { ...x, error: undefined, uploading: true } : x));
    const ext = img.localFile.name.split(".").pop();
    const path = `rental/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await supabase.storage.from("product-images").upload(path, img.localFile, { contentType: img.localFile.type });
    if (error) {
      setImages((prev) => prev.map((x, i) => i === index ? { ...x, uploading: false, error: error.message } : x));
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(data.path);
    setImages((prev) => prev.map((x, i) => i === index ? { ...x, url: publicUrl, uploading: false, localFile: undefined, localPreview: undefined } : x));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragIndex.current = index;
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex.current === null || dragIndex.current === dropIndex) return;
    const reordered = [...images];
    const [moved] = reordered.splice(dragIndex.current, 1);
    reordered.splice(dropIndex, 0, moved);
    setImages(reordered.map((img, i) => ({ ...img, sort_order: i })));
    dragIndex.current = null;
  };

  // ─── Features ────────────────────────────────────────────────────────────
  const updateFeature = (i: number, val: string) => {
    const f = [...features]; f[i] = val;
    if (i === f.length - 1 && val) f.push("");
    setFeatures(f);
  };
  const removeFeature = (i: number) => setFeatures(features.filter((_, idx) => idx !== i));

  // ─── Save ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.some((i) => i.uploading)) { toast.error("Please wait for all uploads to complete"); return; }
    if (images.some((i) => i.error)) { toast.error("Please fix or remove failed uploads"); return; }

    setSaving(true);

    const uploadedImages = images.filter((i) => i.url && !i.error);
    const primaryImg = uploadedImages.find((i) => i.is_primary) || uploadedImages[0];

    const payload: Partial<RentalProduct> = {
      name: form.name,
      slug: form.slug,
      category_id: form.category_id || undefined,
      product_type: form.product_type,
      overview: form.overview,
      description: form.description,
      demo_url: form.demo_url || undefined,
      video_url: form.video_url || undefined,
      price_1month: Number(form.price_1month) || 0,
      price_3months: Number(form.price_3months) || 0,
      price_1year: Number(form.price_1year) || 0,
      currency: "NGN",
      is_published: form.is_published,
      is_featured: form.is_featured,
      primary_image_url: primaryImg?.url || undefined,
    };

    try {
      const product = isEdit && id
        ? await adminUpdateRentalProduct(id, payload)
        : await adminCreateRentalProduct(payload);

      await adminUpsertRentalProductImages(product.id, uploadedImages.map((img, i) => ({
        url: img.url,
        alt_text: img.alt_text,
        is_primary: img.is_primary,
        sort_order: i,
      })));

      await updateRentalProductFeatures(product.id, features.filter((f) => f.trim()));

      toast.success(isEdit ? "Rental product updated" : "Rental product created");
      navigate("/admin/rental-products");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AdminLayout><div className="min-h-[40vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-nuvia-espresso" /></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate("/admin/rental-products")} className="p-2 rounded-lg text-nuvia-brown hover:bg-nuvia-surface/60 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-2xl text-nuvia-ink font-bold">
              {isEdit ? "Edit Rental Product" : "New Rental Product"}
            </h1>
            <p className="text-sm text-nuvia-brown mt-0.5">Configure rental pricing and details</p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="card-nuvia rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-nuvia-espresso">Basic Information</h2>
          <div>
            <label className="label-nuvia">Product Name *</label>
            <input value={form.name} onChange={(e) => handleNameChange(e.target.value)} required placeholder="e.g. Arcadia Rental" className="input-nuvia" />
          </div>
          <div>
            <label className="label-nuvia">URL Slug *</label>
            <input value={form.slug} onChange={(e) => setField("slug", slugify(e.target.value))} required placeholder="arcadia-rental" className="input-nuvia font-mono text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-nuvia">Product Type</label>
              <select value={form.product_type} onChange={(e) => setField("product_type", e.target.value)} className="input-nuvia">
                <option value="website">Website</option>
                <option value="app">Application</option>
              </select>
            </div>
            <div>
              <label className="label-nuvia">Category</label>
              <select value={form.category_id} onChange={(e) => setField("category_id", e.target.value)} className="input-nuvia">
                <option value="">— No category —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label-nuvia">Short Overview</label>
            <input value={form.overview} onChange={(e) => setField("overview", e.target.value)} placeholder="One-line description" className="input-nuvia" />
          </div>
          <div>
            <label className="label-nuvia">Full Description</label>
            <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={6} placeholder="Detailed description…" className="input-nuvia resize-y" />
          </div>
        </div>

        {/* Rental Pricing */}
        <div className="card-nuvia rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-nuvia-brown" />
            <h2 className="font-semibold text-nuvia-espresso">Rental Pricing (₦ NGN)</h2>
          </div>
          <p className="text-xs text-nuvia-brown -mt-2">Enter prices in Naira. The exact amount is charged via Flutterwave.</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label-nuvia">1 Month (₦)</label>
              <input type="number" min="0" step="1" value={form.price_1month} onChange={(e) => setField("price_1month", e.target.value)} required placeholder="25000" className="input-nuvia" />
            </div>
            <div>
              <label className="label-nuvia">3 Months (₦)</label>
              <input type="number" min="0" step="1" value={form.price_3months} onChange={(e) => setField("price_3months", e.target.value)} required placeholder="65000" className="input-nuvia" />
            </div>
            <div>
              <label className="label-nuvia">1 Year (₦)</label>
              <input type="number" min="0" step="1" value={form.price_1year} onChange={(e) => setField("price_1year", e.target.value)} required placeholder="200000" className="input-nuvia" />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="card-nuvia rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-nuvia-espresso">Product Images</h2>
            <span className="text-xs text-nuvia-brown">{images.filter((i) => !i.error && i.url).length}/6</span>
          </div>
          <p className="text-xs text-nuvia-brown -mt-2">Upload 1–6 images. First image is the primary thumbnail. Drag to reorder.</p>
          <input ref={fileInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => handleFilesSelected(e.target.files)} />
          <div className="grid grid-cols-3 gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-nuvia-surface bg-nuvia-beige-light"
                draggable onDragStart={(e) => handleDragStart(e, i)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, i)}>
                <img src={img.localPreview || img.url} alt="" className="w-full h-full object-cover" />
                {img.uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
                {img.error && (
                  <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center p-2 gap-1">
                    <p className="text-white text-[10px] text-center">Upload failed</p>
                    <button type="button" onClick={() => retryUpload(i)} className="text-[10px] bg-white text-red-700 px-2 py-0.5 rounded font-medium">Retry</button>
                  </div>
                )}
                {img.is_primary && !img.uploading && !img.error && (
                  <div className="absolute top-1 left-1 bg-nuvia-champagne/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">PRIMARY</div>
                )}
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity">
                  {!img.is_primary && !img.uploading && !img.error && (
                    <button type="button" onClick={() => setPrimary(i)} className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center" title="Set as primary">
                      <Star className="w-3 h-3 fill-current" />
                    </button>
                  )}
                  <button type="button" onClick={() => removeImage(i)} className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center">
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 opacity-0 hover:opacity-100 transition-opacity">
                  <GripVertical className="w-4 h-4 text-white/80" />
                </div>
              </div>
            ))}
            {images.length < 6 && (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-nuvia-surface-2 flex flex-col items-center justify-center gap-1 text-nuvia-brown hover:border-nuvia-forest hover:text-nuvia-espresso transition-all">
                <Upload className="w-5 h-5" />
                <span className="text-xs">Add image</span>
              </button>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="card-nuvia rounded-2xl p-6 space-y-3">
          <h2 className="font-semibold text-nuvia-espresso">Features / What's Included</h2>
          {features.map((f, i) => (
            <div key={i} className="flex gap-2">
              <input value={f} onChange={(e) => updateFeature(i, e.target.value)} placeholder={i === features.length - 1 ? "Add a feature…" : `Feature ${i + 1}`} className="input-nuvia flex-1" />
              {i < features.length - 1 && (
                <button type="button" onClick={() => removeFeature(i)} className="p-2 text-nuvia-brown hover:text-red-500 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* URLs */}
        <div className="card-nuvia rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-nuvia-espresso">Links</h2>
          <div>
            <label className="label-nuvia">Demo / Live Site URL</label>
            <input type="url" value={form.demo_url} onChange={(e) => setField("demo_url", e.target.value)} placeholder="https://demo.example.com" className="input-nuvia" />
          </div>
          <div>
            <label className="label-nuvia">Video / Demo URL (YouTube, Vimeo, MP4…)</label>
            <input type="url" value={form.video_url} onChange={(e) => setField("video_url", e.target.value)} placeholder="https://youtube.com/watch?v=..." className="input-nuvia" />
          </div>
        </div>

        {/* Visibility */}
        <div className="card-nuvia rounded-2xl p-6 space-y-3">
          <h2 className="font-semibold text-nuvia-espresso">Visibility</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_published} onChange={(e) => setField("is_published", e.target.checked)} className="w-4 h-4 accent-nuvia-forest rounded" />
            <span className="text-sm text-nuvia-espresso">Published (visible to customers)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.is_featured} onChange={(e) => setField("is_featured", e.target.checked)} className="w-4 h-4 accent-nuvia-forest rounded" />
            <span className="text-sm text-nuvia-espresso">Featured (highlighted in catalogue)</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving || images.some((i) => i.uploading)} className="btn-primary flex items-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : isEdit ? "Save Changes" : "Create Rental Product"}
          </button>
          <button type="button" onClick={() => navigate("/admin/rental-products")} className="btn-ghost">Cancel</button>
        </div>
      </form>
    </AdminLayout>
  );
}
