'use client';

import { create } from 'zustand';

type Theme = 'dark' | 'light';

const SETTINGS_KEY = 'tacticalpadel_settings';

interface Settings {
  theme: Theme;
  keyboardShortcutsEnabled: boolean;
  voiceEnabled: boolean;
  showTimers: boolean;
  animationsEnabled: boolean;
}

const defaultSettings: Settings = {
  theme: 'dark',
  keyboardShortcutsEnabled: true,
  voiceEnabled: false,
  showTimers: true,
  animationsEnabled: true,
};

function loadSettings(): Settings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

function saveSettings(settings: Settings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

interface SettingsState extends Settings {
  setTheme: (theme: Theme) => void;
  toggleKeyboardShortcuts: () => void;
  toggleVoice: () => void;
  toggleTimers: () => void;
  toggleAnimations: () => void;
  loadSettings: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...defaultSettings,

  setTheme: (theme) => {
    const settings = { ...get(), theme };
    saveSettings(settings);
    set({ theme });
    // Apply theme to document
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      document.documentElement.classList.toggle('light', theme === 'light');
    }
  },

  toggleKeyboardShortcuts: () => {
    const newVal = !get().keyboardShortcutsEnabled;
    const settings = { ...get(), keyboardShortcutsEnabled: newVal };
    saveSettings(settings);
    set({ keyboardShortcutsEnabled: newVal });
  },

  toggleVoice: () => {
    const newVal = !get().voiceEnabled;
    const settings = { ...get(), voiceEnabled: newVal };
    saveSettings(settings);
    set({ voiceEnabled: newVal });
  },

  toggleTimers: () => {
    const newVal = !get().showTimers;
    const settings = { ...get(), showTimers: newVal };
    saveSettings(settings);
    set({ showTimers: newVal });
  },

  toggleAnimations: () => {
    const newVal = !get().animationsEnabled;
    const settings = { ...get(), animationsEnabled: newVal };
    saveSettings(settings);
    set({ animationsEnabled: newVal });
  },

  loadSettings: () => {
    const settings = loadSettings();
    set(settings);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', settings.theme === 'dark');
      document.documentElement.classList.toggle('light', settings.theme === 'light');
    }
  },
}));
