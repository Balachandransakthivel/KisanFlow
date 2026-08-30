import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Language } from '../constants/strings';
import { Strings } from '../constants/strings';

interface LangContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
}

const LangContext = createContext<LangContextType | undefined>(undefined);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('en');
  const t = (key: string) => Strings[lang][key] ?? key;
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be within LangProvider');
  return ctx;
}
