
import React, { createContext, useContext, useEffect, useReducer, useCallback, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import type { AuthUser } from "@/types";

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
}

type AuthAction =
  | { type: "SET_USER"; payload: AuthUser }
  | { type: "CLEAR_USER" }
  | { type: "SET_LOADING"; payload: boolean };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_USER":
      return { user: action.payload, loading: false };
    case "CLEAR_USER":
      return { user: null, loading: false };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

function mapSupabaseUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email!,
    username:
      user.user_metadata?.username ||
      user.user_metadata?.full_name ||
      user.email!.split("@")[0],
    full_name: user.user_metadata?.full_name,
    avatar_url: user.user_metadata?.avatar_url,
    is_admin: false, // Enriched from DB profile below
  };
}

interface AuthContextType extends AuthState {
  login: (user: AuthUser) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, { user: null, loading: true });
  // Keep a ref to current user so event-handler closures always see latest value
  // without needing `state.user` in the dependency array (avoids infinite loop).
  const userRef = useRef<AuthUser | null>(null);
  userRef.current = state.user;

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from("user_profiles")
        .select("is_admin, full_name, username, avatar_url")
        .eq("id", userId)
        .single();
      return data as { is_admin: boolean; full_name: string | null; username: string | null; avatar_url: string | null } | null;
    } catch {
      return null;
    }
  }, []);

  const login = useCallback((user: AuthUser) => {
    dispatch({ type: "SET_USER", payload: user });
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: "CLEAR_USER" });
  }, []);

  const refreshProfile = useCallback(async () => {
    const current = userRef.current;
    if (!current) return;
    const profile = await fetchProfile(current.id);
    if (profile) {
      dispatch({
        type: "SET_USER",
        payload: {
          ...current,
          is_admin: profile.is_admin ?? false,
          full_name: profile.full_name ?? current.full_name,
          username: profile.username ?? current.username,
          avatar_url: profile.avatar_url ?? current.avatar_url,
        },
      });
    }
  }, [fetchProfile]);

  useEffect(() => {
    let mounted = true;

    // Safety #1 — restore session on page load / refresh
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        const mapped = mapSupabaseUser(session.user);
        const profile = await fetchProfile(session.user.id);
        if (mounted) {
          dispatch({
            type: "SET_USER",
            payload: {
              ...mapped,
              is_admin: profile?.is_admin ?? false,
              full_name: profile?.full_name ?? mapped.full_name,
              username: profile?.username ?? mapped.username,
              avatar_url: profile?.avatar_url ?? mapped.avatar_url,
            },
          });
        }
      } else {
        if (mounted) dispatch({ type: "SET_LOADING", payload: false });
      }
    });

    // Safety #2 — react to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_IN" && session?.user) {
        const mapped = mapSupabaseUser(session.user);
        const profile = await fetchProfile(session.user.id);
        if (mounted) {
          dispatch({
            type: "SET_USER",
            payload: {
              ...mapped,
              is_admin: profile?.is_admin ?? false,
              full_name: profile?.full_name ?? mapped.full_name,
              username: profile?.username ?? mapped.username,
              avatar_url: profile?.avatar_url ?? mapped.avatar_url,
            },
          });
        }
      } else if (event === "SIGNED_OUT") {
        if (mounted) dispatch({ type: "CLEAR_USER" });
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        if (mounted) {
          const mapped = mapSupabaseUser(session.user);
          // Re-use cached is_admin from current user ref; avoid a DB round-trip on
          // every silent token refresh. Call refreshProfile() explicitly if needed.
          dispatch({
            type: "SET_USER",
            payload: {
              ...mapped,
              is_admin: userRef.current?.is_admin ?? false,
            },
          });
        }
      }

      // Always clear loading after any auth event
      if (mounted) dispatch({ type: "SET_LOADING", payload: false });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
