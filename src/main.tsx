import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import App from "./App";
import { AuthProvider } from "./stores/authStore";
import { supabaseConfigured, supabaseConfigError } from "./lib/supabase";
import "./index.css";

// ─── Config Error Screen ─────────────────────────────────────────────────────
// Shown when VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are missing.
// Prevents a completely blank white screen in production.
function ConfigErrorScreen({ message }: { message: string }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FAF8F2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "Manrope, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: "#FAF8F2",
          border: "1px solid #E3D8C2",
          borderRadius: "20px",
          padding: "40px",
          maxWidth: "520px",
          width: "100%",
          boxShadow: "0 8px 48px rgba(23,35,31,0.12)",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            background: "#174C42",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px",
          }}
        >
          <span style={{ color: "#FAF8F2", fontSize: "20px", fontWeight: 700, fontFamily: "Sora, sans-serif" }}>N</span>
        </div>
        <h1
          style={{
            fontFamily: "Sora, sans-serif",
            fontSize: "22px",
            color: "#174C42",
            marginBottom: "12px",
          }}
        >
          Configuration Required
        </h1>
        <p style={{ color: "#52645B", fontSize: "14px", lineHeight: "1.6", marginBottom: "20px" }}>
          Nuvia needs Supabase environment variables to run. Please add the following to your{" "}
          <strong>Netlify → Site settings → Environment variables</strong>:
        </p>
        <div
          style={{
            background: "#F4EDDC",
            borderRadius: "10px",
            padding: "16px",
            marginBottom: "20px",
            fontFamily: "monospace",
            fontSize: "13px",
            color: "#174C42",
          }}
        >
          <div style={{ marginBottom: "8px" }}>
            <strong>VITE_SUPABASE_URL</strong>
            <br />
            <span style={{ color: "#52645B" }}>Your Supabase project URL (e.g. https://xxx.supabase.co)</span>
          </div>
          <div>
            <strong>VITE_SUPABASE_ANON_KEY</strong>
            <br />
            <span style={{ color: "#52645B" }}>Your Supabase anon/public key</span>
          </div>
        </div>
        <p style={{ color: "#52645B", fontSize: "13px", lineHeight: "1.5" }}>
          Find both values in your Supabase dashboard under{" "}
          <strong>Project Settings → API</strong>. After adding them in Netlify, trigger a new deploy.
        </p>
        {message && (
          <details style={{ marginTop: "16px" }}>
            <summary style={{ color: "#71836F", fontSize: "12px", cursor: "pointer" }}>
              Technical details
            </summary>
            <pre
              style={{
                marginTop: "8px",
                fontSize: "11px",
                color: "#71836F",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

// ─── Runtime Error Boundary ───────────────────────────────────────────────────
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[Nuvia] Unhandled render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      const isConfigError =
        this.state.error?.message?.includes("Missing required environment variable") ||
        this.state.error?.message?.includes("VITE_SUPABASE");
      return (
        <ConfigErrorScreen
          message={this.state.error?.message || "An unexpected error occurred."}
        />
      );
      // Suppress unused variable warning — isConfigError reserved for future use
      void isConfigError;
    }
    return this.props.children;
  }
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById("root")!);

if (!supabaseConfigured) {
  // Show the config error screen immediately — no React Router, no auth provider
  root.render(
    <React.StrictMode>
      <ConfigErrorScreen message={supabaseConfigError ?? "Supabase not configured."} />
    </React.StrictMode>
  );
} else {
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <AuthProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "#FAF8F2",
                  border: "1px solid #E3D8C2",
                  color: "#174C42",
                  fontFamily: "Manrope, system-ui, sans-serif",
                  borderRadius: "12px",
                },
              }}
            />
          </AuthProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>
  );
}
