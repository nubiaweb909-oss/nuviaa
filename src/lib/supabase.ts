
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Validates that required env vars are present. Throws a clear error during
// initialization instead of letting the app crash silently or show a blank screen.
function assertEnv(name: string, value: string | undefined): string {
  if (!value || value.trim() === "") {
    throw new Error(
      `[Nuvia] Missing required environment variable: ${name}.\n` +
        `Please set this in your Netlify → Site settings → Environment variables (or .env for local dev).`
    );
  }
  return value.trim();
}

export let supabaseConfigured = false;
export let supabaseConfigError: string | null = null;

// We create the client lazily so that missing env vars produce a readable error
// rather than a blank screen crash inside @supabase/supabase-js.
function createSafeClient() {
  try {
    const url = assertEnv("VITE_SUPABASE_URL", supabaseUrl);
    const key = assertEnv("VITE_SUPABASE_ANON_KEY", supabaseAnonKey);

    const client = createClient(url, key, {
      auth: {
        storage: typeof localStorage !== "undefined" ? localStorage : undefined,
        persistSession: true,
        autoRefreshToken: true,
        flowType: "pkce",
      },
    });

    supabaseConfigured = true;
    return client;
  } catch (err) {
    supabaseConfigError = err instanceof Error ? err.message : String(err);
    console.error(supabaseConfigError);

    // Return a no-op proxy so imports never throw at module level —
    // the ConfigError component will surface the problem in the UI.
    return new Proxy({} as ReturnType<typeof createClient>, {
      get(_target, prop) {
        // Allow chaining: supabase.from(...).select(...) etc. all return empty results
        const noopAsync = async () => ({ data: null, error: new Error("Supabase not configured") });
        const handler: ProxyHandler<object> = {
          get(_t, _p) {
            if (typeof _p === "string" && _p === "then") return undefined; // not a Promise
            return new Proxy(noopAsync, handler);
          },
          apply() {
            return new Proxy({}, handler);
          },
        };
        if (prop === "auth") {
          return {
            getSession: noopAsync,
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            signOut: noopAsync,
            signInWithPassword: noopAsync,
            signInWithOtp: noopAsync,
            verifyOtp: noopAsync,
            updateUser: noopAsync,
            getUser: noopAsync,
          };
        }
        if (prop === "storage") {
          return {
            from: () => ({
              upload: noopAsync,
              remove: noopAsync,
              getPublicUrl: () => ({ data: { publicUrl: "" } }),
            }),
          };
        }
        if (prop === "functions") {
          return { invoke: noopAsync };
        }
        // Table query builder
        return new Proxy(noopAsync, handler);
      },
    });
  }
}

export const supabase = createSafeClient();
