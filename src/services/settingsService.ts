import { supabase } from "@/lib/supabase";
import type { SiteSetting, SiteSettings } from "@/types";

const DEFAULT_SETTINGS: SiteSettings = {
  site_name: "Nuvia",
  site_tagline: "Premium Digital Marketplace",
  currency: "NGN",
  currency_symbol: "₦",
  whatsapp_url: "https://wa.me/message/BBF2QJWLCFJHL1",
  telegram_url: "",
  support_email: "support@nuvia.store",
  flw_configured: false,
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const { data, error } = await supabase.from("site_settings").select("*");
    if (error || !data?.length) return DEFAULT_SETTINGS;

    const settings = { ...DEFAULT_SETTINGS };
    for (const row of data) {
      if (row.key in settings) {
        const key = row.key as keyof SiteSettings;
        if (row.type === "boolean") {
          (settings as Record<string, unknown>)[key] = row.value === "true";
        } else if (row.type === "number") {
          (settings as Record<string, unknown>)[key] = Number(row.value) || 0;
        } else {
          (settings as Record<string, unknown>)[key] = row.value ?? "";
        }
      }
    }
    return settings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function adminGetSettings(): Promise<SiteSetting[]> {
  const { data, error } = await supabase.from("site_settings").select("*").order("key");
  if (error) throw error;
  return data as SiteSetting[];
}

export async function adminUpdateSetting(key: string, value: string): Promise<void> {
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw error;
}

export async function adminUpdateSettings(updates: Record<string, string>): Promise<void> {
  const rows = Object.entries(updates).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
  if (error) throw error;
}
