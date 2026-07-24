import React, { createContext, useContext, useState, useCallback } from "react";

interface Settings {
  maxPages: number;
}

interface SettingsContextValue extends Settings {
  setMaxPages: (n: number) => void;
}

const DEFAULTS: Settings = {
  maxPages: 20,
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  const setMaxPages = useCallback((maxPages: number) => {
    setSettings((s) => ({ ...s, maxPages }));
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        setMaxPages,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
