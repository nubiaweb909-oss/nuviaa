import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-nuvia-ivory pt-16 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="glass rounded-3xl p-10 light-streak">
          <p className="font-display text-8xl font-bold text-champagne-gradient mb-4 leading-none">404</p>
          <h1 className="font-display text-3xl text-nuvia-ink font-bold mb-3">Page not found</h1>
          <p className="text-nuvia-brown mb-8">The page you're looking for doesn't exist or has been moved.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="btn-primary flex items-center gap-2 justify-center">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <Link to="/marketplace" className="btn-secondary">Browse Marketplace</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
