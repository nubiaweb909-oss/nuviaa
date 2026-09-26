import { useState, useEffect } from "react";
import { getSiteSettings } from "@/services/settingsService";
import type { SiteSettings } from "@/types";

const DEFAULT: SiteSettings = {
  site_name: "Nuvia",
  site_tagline: "Premium Digital Marketplace",
  currency: "NGN",
  currency_symbol: "₦",
  whatsapp_url: "https://wa.me/message/BBF2QJWLCFJHL1",
  telegram_url: "",
  support_email: "support@nuvia.store",
  flw_configured: false,
};

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSiteSettings()
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  return { settings, loading };
}
