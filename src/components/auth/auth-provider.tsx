"use client";

import { Session } from "@supabase/supabase-js";
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type AuthContextValue = {
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribed = false;
    supabase.auth.getSession().then(({ data }) => {
      if (!unsubscribed) {
        setSession(data.session ?? null);
        setLoading(false);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => {
      unsubscribed = true;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isLoading,
      signOut: async () => {
        await supabase.auth.signOut();
        setSession(null);
      },
    }),
    [session, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

