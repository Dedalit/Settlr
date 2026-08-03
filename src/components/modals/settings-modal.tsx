"use client"

import * as React from "react"
import { Modal } from "@/components/ui/modal"
import { Segmented } from "@/components/modals/segmented"
import { Check } from "lucide-react"

type Currency = "EUR" | "USD" | "GBP"
type Language = "EN" | "IT" | "ES"
type Theme = "light" | "dark" | "system"

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

const STORAGE_KEY = "settlr_settings"

interface Settings {
  currency: Currency
  language: Language
  theme: Theme
}

const defaultSettings: Settings = {
  currency: "EUR",
  language: "EN",
  theme: "system",
}

function loadSettings(): Settings {
  if (typeof window === "undefined") return defaultSettings
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings
  } catch {
    return defaultSettings
  }
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [settings, setSettings] = React.useState<Settings>(defaultSettings)
  const [saved, setSaved] = React.useState(false)

  const applyTheme = (theme: Theme) => {
    const isDark =
      theme === "dark" ||
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    document.documentElement.classList[isDark ? "add" : "remove"]("dark")
  }

  React.useEffect(() => {
    if (open) {
      const storedRaw = window.localStorage.getItem(STORAGE_KEY)
      const loaded = loadSettings()
      if (!storedRaw) {
        const domDark = document.documentElement.classList.contains("dark")
        setSettings({ ...loaded, theme: domDark ? "dark" : "light" })
      } else {
        setSettings(loaded)
      }
      setSaved(false)
    }
  }, [open])

  const update = (patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
    if (patch.theme) applyTheme(patch.theme)
  }

  return (
    <Modal open={open} onClose={onClose} title="Settings">
      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-xs font-semibold text-purple-200/60">Theme</label>
          <Segmented
            options={[
              { label: "Light", value: "light" },
              { label: "Dark", value: "dark" },
              { label: "System", value: "system" },
            ]}
            value={settings.theme}
            onChange={(theme) => update({ theme })}
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-purple-200/60">Currency</label>
          <Segmented
            options={[
              { label: "€ EUR", value: "EUR" },
              { label: "$ USD", value: "USD" },
              { label: "£ GBP", value: "GBP" },
            ]}
            value={settings.currency}
            onChange={(currency) => update({ currency })}
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-purple-200/60">Language</label>
          <Segmented
            options={[
              { label: "English", value: "EN" },
              { label: "Italiano", value: "IT" },
              { label: "Español", value: "ES" },
            ]}
            value={settings.language}
            onChange={(language) => update({ language })}
          />
        </div>

        {saved && (
          <p className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-400">
            <Check className="size-3.5" /> Preferences saved
          </p>
        )}

        <button
          onClick={() => update(defaultSettings)}
          className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 text-xs font-semibold text-purple-200/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          Reset to defaults
        </button>
      </div>
    </Modal>
  )
}
