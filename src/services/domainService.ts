import { supabase } from "@/lib/supabase";
import type { DomainExtension, DomainResult } from "@/types";
import { extractDomainName } from "@/lib/utils";

const FALLBACK_EXTENSIONS: DomainExtension[] = [
  { id: "ext-1", extension: ".com", price: 15, currency: "USD", description: "Most recognised domain worldwide", is_active: true, sort_order: 1, created_at: "", updated_at: "" },
  { id: "ext-2", extension: ".net", price: 13, currency: "USD", description: "Ideal for networks and technology", is_active: true, sort_order: 2, created_at: "", updated_at: "" },
  { id: "ext-3", extension: ".org", price: 12, currency: "USD", description: "Perfect for organisations", is_active: true, sort_order: 3, created_at: "", updated_at: "" },
  { id: "ext-4", extension: ".store", price: 10, currency: "USD", description: "Built for ecommerce", is_active: true, sort_order: 4, created_at: "", updated_at: "" },
  { id: "ext-5", extension: ".tech", price: 14, currency: "USD", description: "Great for tech businesses", is_active: true, sort_order: 5, created_at: "", updated_at: "" },
  { id: "ext-6", extension: ".io", price: 20, currency: "USD", description: "Popular with tech startups", is_active: true, sort_order: 6, created_at: "", updated_at: "" },
  { id: "ext-7", extension: ".co", price: 17, currency: "USD", description: "Modern alternative to .com", is_active: true, sort_order: 7, created_at: "", updated_at: "" },
  { id: "ext-8", extension: ".ng", price: 8, currency: "USD", description: "Nigeria country code", is_active: true, sort_order: 8, created_at: "", updated_at: "" },
];

export async function getDomainExtensions(): Promise<DomainExtension[]> {
  try {
    const { data, error } = await supabase
      .from("domain_extensions")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    if (error || !data?.length) return FALLBACK_EXTENSIONS;
    return data as DomainExtension[];
  } catch {
    return FALLBACK_EXTENSIONS;
  }
}

export async function searchDomains(input: string): Promise<DomainResult[]> {
  const domainName = extractDomainName(input);
  if (!domainName) return [];
  const extensions = await getDomainExtensions();
  return extensions.map((ext) => ({
    extension: ext,
    fullDomain: `${domainName}${ext.extension}`,
    domainName,
  }));
}

export async function getDomainExtensionById(id: string): Promise<DomainExtension | null> {
  try {
    const { data, error } = await supabase.from("domain_extensions").select("*").eq("id", id).single();
    if (error) return FALLBACK_EXTENSIONS.find((e) => e.id === id) ?? null;
    return data as DomainExtension;
  } catch {
    return FALLBACK_EXTENSIONS.find((e) => e.id === id) ?? null;
  }
}

export async function adminGetDomainExtensions(): Promise<DomainExtension[]> {
  const { data, error } = await supabase.from("domain_extensions").select("*").order("sort_order");
  if (error) throw error;
  return data as DomainExtension[];
}

export async function adminCreateExtension(ext: Partial<DomainExtension>): Promise<DomainExtension> {
  const { data, error } = await supabase.from("domain_extensions").insert(ext).select().single();
  if (error) throw error;
  return data as DomainExtension;
}

export async function adminUpdateExtension(id: string, updates: Partial<DomainExtension>): Promise<DomainExtension> {
  const { data, error } = await supabase
    .from("domain_extensions")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as DomainExtension;
}

export async function adminDeleteExtension(id: string): Promise<void> {
  const { error } = await supabase.from("domain_extensions").delete().eq("id", id);
  if (error) throw error;
}
