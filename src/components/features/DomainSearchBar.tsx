import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, Globe, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { searchDomains } from "@/services/domainService";
import { formatPrice } from "@/lib/utils";
import type { DomainResult } from "@/types";

interface DomainSearchBarProps {
  large?: boolean;
  placeholder?: string;
}

export default function DomainSearchBar({ large = false, placeholder = "Search for your domain (e.g. nubia.com)" }: DomainSearchBarProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DomainResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    const res = await searchDomains(query);
    setResults(res);
    setLoading(false);
  };

  const handleBuy = (result: DomainResult) => {
    navigate(`/checkout?type=domain&domain=${result.domainName}&extension_id=${result.extension.id}&amount=${result.extension.price}`);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSearch}>
        <div className={`flex items-center gap-2 glass-strong rounded-full p-2 focus-within:shadow-glow-champagne transition-all duration-300 ${large ? "shadow-nuvia-lg" : "shadow-nuvia-sm"}`}>
          <Globe className={`ml-3 flex-shrink-0 text-nuvia-moss ${large ? "w-5 h-5" : "w-4 h-4"}`} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className={`flex-1 bg-transparent text-nuvia-espresso placeholder-nuvia-brown/50 outline-none font-sans ${large ? "text-lg py-2" : "text-sm py-1"}`}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span className={large ? "" : "hidden sm:inline"}>Search</span>
          </button>
        </div>
      </form>

      <AnimatePresence>
        {searched && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="mt-4"
          >
            {results.length === 0 ? (
              <p className="text-center text-sm text-nuvia-brown py-4">Enter a domain name to see available extensions.</p>
            ) : (
              <div className="glass-strong rounded-3xl overflow-hidden">
                <div className="px-4 py-3 border-b border-nuvia-surface/50 bg-nuvia-beige-light/40">
                  <p className="text-xs font-semibold text-nuvia-brown uppercase tracking-[0.12em]">
                    Results for "{results[0]?.domainName}" — Manually fulfilled by Nuvia
                  </p>
                </div>
                {results.map((result, i) => (
                  <motion.div
                    key={result.extension.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between px-4 py-3.5 hover:bg-nuvia-beige-light/60 transition-colors border-b border-nuvia-surface/40 last:border-0"
                  >
                    <div>
                      <span className="font-sans font-semibold text-nuvia-ink">{result.fullDomain}</span>
                      {result.extension.description && (
                        <p className="text-xs text-nuvia-brown mt-0.5">{result.extension.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-nuvia-ink">{formatPrice(result.extension.price)}</span>
                      <button
                        onClick={() => handleBuy(result)}
                        className="btn-primary text-sm py-2"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 mr-1.5" /> Buy
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
