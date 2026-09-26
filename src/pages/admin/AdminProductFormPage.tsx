import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Plus, X, Loader2, Upload, Image as ImageIcon,
  GripVertical, Star, RefreshCw, AlertCircle,
} from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { getProductById, adminCreateProduct, adminUpdateProduct, updateProductFeatures } from "@/services/productService";
import { adminUpsertProductImages, adminDeleteProductImage } from "@/services/adminService";
import { adminGetCategories } from "@/services/categoryService";
import { supabase } from "@/lib/supabase";
import type { Category } from "@/types";
import { slugify } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const MAX_IMAGES = 6;
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

interface ImageEntry {
  id?: string; // existing db id
  file?: File; // new file to upload
  url: string; // preview url or uploaded url
  is_primary: boolean;
  sort_order: number;
  status: "ready" | "uploading" | "uploaded" | "error";
  errorMsg?: string;
}

export default function AdminProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState("");
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "", slug: "", product_type: "website" as "website" | "app",
    category_id: "", price: "", currency: "NGN",
    overview: "", description: "", demo_url: "", video_url: "",
    is_featured: false, is_published: false,
  });

  useEffect(() => {
    adminGetCategories().then(setCategories);
    if (isEdit && id) {
      getProductById(id).then((p) => {
        if (!p) return;
        setForm({
          name: p.name, slug: p.slug, product_type: p.product_type,
          category_id: p.category_id || "", price: String(p.price), currency: p.currency,
          overview: p.overview || "", description: p.description || "",
          demo_url: p.demo_url || "", video_url: p.video_url || "",
          is_featured: p.is_featured, is_published: p.is_published,
        });
        setFeatures(p.features?.map((f) => f.feature) || []);
        // Load existing images
        if (p.images && p.images.length > 0) {
          setImages(
            p.images
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((img) => ({
                id: img.id,
                url: img.url,
                is_primary: img.is_primary,
                sort_order: img.sort_order,
                status: "uploaded",
              }))
          );
        } else if (p.primary_image_url) {
          setImages([{
            url: p.primary_image_url,
            is_primary: true,
            sort_order: 0,
            status: "uploaded",
          }]);
        }
      });
    }
  }, [isEdit, id]);

  const setField = (key: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  // --- Image handling ---

  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    const current = images.length;
    if (current >= MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }
    const toAdd = arr.slice(0, MAX_IMAGES - current);
    const invalid = toAdd.filter(
      (f) => !ACCEPTED.includes(f.type) || f.size > MAX_FILE_SIZE
    );
    if (invalid.length) {
      toast.error("Some files were skipped: only JPEG/PNG/WebP/AVIF under 8MB allowed.");
    }
    const valid = toAdd.filter(
      (f) => ACCEPTED.includes(f.type) && f.size <= MAX_FILE_SIZE
    );
    const newEntries: ImageEntry[] = valid.map((file, i) => ({
      file,
      url: URL.createObjectURL(file),
      is_primary: current + i === 0 && images.length === 0,
      sort_order: current + i,
      status: "ready",
    }));
    setImages((prev) => [...prev, ...newEntries]);
  }, [images]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDropZone = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const removeImage = async (index: number) => {
    const img = images[index];
    // If it's an uploaded image in the DB, delete from storage + DB
    if (img.id) {
      try {
        await adminDeleteProductImage(img.id, img.url);
      } catch {
        // continue anyway; DB entry might not exist
      }
    }
    if (img.file && img.url.startsWith("blob:")) {
      URL.revokeObjectURL(img.url);
    }
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      // Re-assign sort orders and ensure a primary
      return next.map((img, i) => ({
        ...img,
        sort_order: i,
        is_primary: i === 0 ? true : (img.is_primary && i !== 0 ? false : img.is_primary),
      })).map((img, i, arr) => ({
        ...img,
        is_primary: arr.findIndex((x) => x.is_primary) === -1 ? i === 0 : img.is_primary,
      }));
    });
  };

  const setPrimary = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, is_primary: i === index }))
    );
  };

  const retryUpload = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => i === index ? { ...img, status: "ready", errorMsg: undefined } : img)
    );
  };

  // Drag-to-reorder
  const handleDragStart = (index: number) => setDragIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };
  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragOverIndex(null);
      return;
    }
    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next.map((img, i) => ({ ...img, sort_order: i }));
    });
    setDragIndex(null);
    setDragOverIndex(null);
  };
  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  // Upload a single image to Supabase Storage
  const uploadImage = async (entry: ImageEntry, productId: string): Promise<string> => {
    if (!entry.file) return entry.url;
    const ext = entry.file.name.split(".").pop() || "jpg";
    const path = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(path, entry.file, { upsert: false, contentType: entry.file.type });
    if (error) throw new Error(error.message);
    const { data: { publicUrl } } = supabase.storage
      .from("product-images")
      .getPublicUrl(data.path);
    return publicUrl;
  };

  // --- Form submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error("Product name is required."); return; }
    if (!form.price || isNaN(Number(form.price))) { toast.error("Valid price is required."); return; }
    setSaving(true);

    try {
      const slug = form.slug || slugify(form.name);
      const payload = {
        ...form,
        slug,
        price: Number(form.price),
        category_id: form.category_id || undefined,
        demo_url: form.demo_url.trim() || null, // optional — empty field saves as NULL
        primary_image_url: undefined as string | undefined,
      };

      // Save product first (need ID for images)
      let saved;
      if (isEdit && id) {
        saved = await adminUpdateProduct(id, payload);
      } else {
        saved = await adminCreateProduct(payload);
      }

      // Upload new images
      const uploadedImages = [...images];
      for (let i = 0; i < uploadedImages.length; i++) {
        const img = uploadedImages[i];
        if (img.file && img.status !== "uploaded") {
          uploadedImages[i] = { ...img, status: "uploading" };
          setImages([...uploadedImages]);
          try {
            const url = await uploadImage(img, saved.id);
            uploadedImages[i] = { ...uploadedImages[i], url, status: "uploaded", file: undefined };
            setImages([...uploadedImages]);
          } catch (err) {
            uploadedImages[i] = {
              ...uploadedImages[i],
              status: "error",
              errorMsg: (err as Error).message,
            };
            setImages([...uploadedImages]);
            toast.error(`Failed to upload image ${i + 1}: ${(err as Error).message}`);
          }
        }
      }

      // Persist image records to DB
      const finalImages = uploadedImages.filter((img) => img.status !== "error" && img.url);
      if (finalImages.length > 0) {
        await adminUpsertProductImages(
          saved.id,
          finalImages.map((img, i) => ({
            id: img.id,
            product_id: saved.id,
            url: img.url,
            is_primary: img.is_primary,
            sort_order: i,
            alt_text: form.name,
          }))
        );
        // Update primary_image_url on product
        const primary = finalImages.find((i) => i.is_primary) || finalImages[0];
        if (primary) {
          await adminUpdateProduct(saved.id, { primary_image_url: primary.url });
        }
      }

      // Save features
      const validFeatures = features.filter((f) => f.trim());
      await updateProductFeatures(saved.id, validFeatures);

      toast.success(isEdit ? "Product updated successfully" : "Product created successfully");
      navigate("/admin/products");
    } catch (err: unknown) {
      toast.error((err as Error).message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const addFeature = () => {
    const trimmed = featureInput.trim();
    if (trimmed && !features.includes(trimmed)) {
      setFeatures((f) => [...f, trimmed]);
      setFeatureInput("");
    }
  };
  const removeFeature = (i: number) => setFeatures((f) => f.filter((_, idx) => idx !== i));

  const uploadingCount = images.filter((i) => i.status === "uploading").length;
  const errorCount = images.filter((i) => i.status === "error").length;

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl text-nuvia-ink font-bold">
              {isEdit ? "Edit Product" : "Create Product"}
            </h1>
            <p className="text-sm text-nuvia-brown mt-0.5">
              {isEdit ? "Update product information and images" : "Add a new product to your marketplace"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Info */}
          <div className="card-nuvia rounded-2xl p-5 sm:p-6 space-y-4">
            <h2 className="font-semibold text-nuvia-espresso flex items-center gap-2">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label-nuvia">Product Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => {
                    setField("name", e.target.value);
                    if (!isEdit) setField("slug", slugify(e.target.value));
                  }}
                  required
                  className="input-nuvia text-base"
                  placeholder="e.g. Arcadia Studio Pro"
                />
              </div>
              <div>
                <label className="label-nuvia">URL Slug *</label>
                <input
                  value={form.slug}
                  onChange={(e) => setField("slug", e.target.value)}
                  required
                  className="input-nuvia font-mono text-sm"
                  placeholder="arcadia-studio-pro"
                />
              </div>
              <div>
                <label className="label-nuvia">Product Type *</label>
                <select
                  value={form.product_type}
                  onChange={(e) => setField("product_type", e.target.value)}
                  className="input-nuvia"
                >
                  <option value="website">Website</option>
                  <option value="app">Application</option>
                </select>
              </div>
              <div>
                <label className="label-nuvia">Category</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setField("category_id", e.target.value)}
                  className="input-nuvia"
                >
                  <option value="">No category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-nuvia">Price (NGN) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setField("price", e.target.value)}
                  required
                  min={0}
                  step={500}
                  className="input-nuvia"
                  placeholder="95000"
                />
              </div>
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) => setField("is_published", e.target.checked)}
                    className="w-4 h-4 accent-nuvia-forest rounded"
                  />
                  <span className="text-sm text-nuvia-espresso font-medium">Published</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setField("is_featured", e.target.checked)}
                    className="w-4 h-4 accent-nuvia-forest rounded"
                  />
                  <span className="text-sm text-nuvia-espresso font-medium">Featured</span>
                </label>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="card-nuvia rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-nuvia-espresso">
                Product Images
                <span className="ml-2 text-xs font-normal text-nuvia-brown">
                  ({images.length}/{MAX_IMAGES})
                </span>
              </h2>
              {uploadingCount > 0 && (
                <span className="text-xs text-nuvia-brown flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Uploading {uploadingCount}…
                </span>
              )}
              {errorCount > 0 && (
                <span className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errorCount} failed
                </span>
              )}
            </div>

            {/* Image grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                {images.map((img, i) => (
                  <div
                    key={i}
                    draggable
                    onDragStart={() => handleDragStart(i)}
                    onDragOver={(e) => handleDragOver(e, i)}
                    onDrop={(e) => handleDrop(e, i)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "relative group rounded-xl overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing",
                      img.is_primary
                        ? "border-nuvia-forest shadow-nuvia-sm"
                        : "border-nuvia-surface hover:border-nuvia-brown",
                      dragOverIndex === i && "border-nuvia-brown scale-105",
                      img.status === "error" && "border-red-400"
                    )}
                  >
                    {/* 1:1 aspect ratio */}
                    <div className="aspect-square bg-nuvia-beige-light">
                      <img
                        src={img.url}
                        alt={`Product image ${i + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-nuvia-forest/0 group-hover:bg-nuvia-forest/40 transition-all flex items-center justify-center gap-2">
                      {/* Primary button */}
                      <button
                        type="button"
                        onClick={() => setPrimary(i)}
                        title={img.is_primary ? "Primary image" : "Set as primary"}
                        className={cn(
                          "opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-full",
                          img.is_primary
                            ? "bg-nuvia-forest text-nuvia-ivory opacity-100"
                            : "bg-white/80 text-nuvia-espresso hover:bg-white"
                        )}
                      >
                        <Star className={cn("w-3.5 h-3.5", img.is_primary && "fill-current")} />
                      </button>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        title="Remove image"
                        className="opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      {/* Retry on error */}
                      {img.status === "error" && (
                        <button
                          type="button"
                          onClick={() => retryUpload(i)}
                          title="Retry upload"
                          className="opacity-100 p-1.5 rounded-full bg-amber-500 text-white"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Status indicators */}
                    {img.status === "uploading" && (
                      <div className="absolute inset-0 bg-nuvia-forest/50 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-nuvia-ivory animate-spin" />
                      </div>
                    )}
                    {img.status === "error" && (
                      <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-[10px] px-2 py-1 truncate">
                        Upload failed
                      </div>
                    )}

                    {/* Primary badge */}
                    {img.is_primary && (
                      <div className="absolute top-2 left-2 bg-nuvia-forest text-nuvia-ivory text-[9px] font-medium px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-current" /> Primary
                      </div>
                    )}

                    {/* Drag handle */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-60 transition-opacity">
                      <GripVertical className="w-4 h-4 text-white" />
                    </div>

                    {/* Sort order */}
                    <div className="absolute bottom-2 right-2 bg-black/40 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                      {i + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Drop zone */}
            {images.length < MAX_IMAGES && (
              <label
                className={cn(
                  "flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all",
                  "border-nuvia-surface-2 hover:border-nuvia-brown hover:bg-nuvia-beige-light/50"
                )}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropZone}
              >
                <input
                  type="file"
                  multiple
                  accept={ACCEPTED.join(",")}
                  onChange={handleFileInput}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-full bg-nuvia-beige-light flex items-center justify-center mb-3">
                  {images.length === 0 ? (
                    <ImageIcon className="w-5 h-5 text-nuvia-brown" />
                  ) : (
                    <Upload className="w-5 h-5 text-nuvia-brown" />
                  )}
                </div>
                <p className="text-sm font-medium text-nuvia-espresso mb-1">
                  {images.length === 0 ? "Upload product images" : "Add more images"}
                </p>
                <p className="text-xs text-nuvia-brown text-center">
                  Drag & drop or click · JPEG, PNG, WebP, AVIF · Max 8MB each
                </p>
                <p className="text-xs text-nuvia-brown mt-1">
                  {MAX_IMAGES - images.length} slot{MAX_IMAGES - images.length !== 1 ? "s" : ""} remaining · Displayed as 1:1
                </p>
              </label>
            )}

            <p className="text-xs text-nuvia-brown/70">
              Drag images to reorder · ★ to set primary · Hover to remove
            </p>
          </div>

          {/* Links */}
          <div className="card-nuvia rounded-2xl p-5 sm:p-6 space-y-4">
            <h2 className="font-semibold text-nuvia-espresso">Links & Demo</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label-nuvia">Live Demo URL (optional)</label>
                <input
                  value={form.demo_url}
                  onChange={(e) => setField("demo_url", e.target.value)}
                  type="url"
                  className="input-nuvia"
                  placeholder="https://demo.yoursite.com"
                />
                <p className="text-xs text-nuvia-brown mt-1">Shown as "View Live Demo" external link</p>
              </div>
              <div>
                <label className="label-nuvia">Demo Video URL</label>
                <input
                  value={form.video_url}
                  onChange={(e) => setField("video_url", e.target.value)}
                  className="input-nuvia"
                  placeholder="YouTube, Vimeo, Cloudinary, or .mp4 URL"
                />
                <p className="text-xs text-nuvia-brown mt-1">Opens in a modal player on the product page</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="card-nuvia rounded-2xl p-5 sm:p-6 space-y-4">
            <h2 className="font-semibold text-nuvia-espresso">Content</h2>
            <div>
              <label className="label-nuvia">Overview (short summary)</label>
              <textarea
                value={form.overview}
                onChange={(e) => setField("overview", e.target.value)}
                rows={2}
                className="input-nuvia resize-y"
                placeholder="One-sentence summary shown on product cards"
              />
            </div>
            <div>
              <label className="label-nuvia">Full Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                rows={10}
                className="input-nuvia resize-y"
                placeholder="Detailed product description. Supports multiple paragraphs separated by blank lines."
                style={{ minHeight: "200px" }}
              />
              <p className="text-xs text-nuvia-brown mt-1">
                {form.description.length} characters · Use blank lines to separate paragraphs
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="card-nuvia rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-nuvia-espresso">Features & Inclusions</h2>
              <span className="text-xs text-nuvia-brown">{features.length} feature{features.length !== 1 ? "s" : ""}</span>
            </div>

            {features.length > 0 && (
              <div className="space-y-2">
                {features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 group">
                    <div className="flex-1 flex items-center gap-2 bg-nuvia-beige-light px-3 py-2.5 rounded-xl">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      <span className="text-sm text-nuvia-espresso flex-1">{f}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFeature(i)}
                      className="p-1.5 text-nuvia-brown hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Remove feature"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                className="input-nuvia flex-1"
                placeholder="Type a feature and press Enter or click +"
              />
              <button
                type="button"
                onClick={addFeature}
                disabled={!featureInput.trim()}
                className="btn-secondary px-3 min-w-[44px] disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-3 pb-8">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center justify-center gap-2 px-8 py-3.5 text-base"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              ) : (
                isEdit ? "Update Product" : "Create Product"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/products")}
              disabled={saving}
              className="btn-secondary px-8 py-3.5"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
