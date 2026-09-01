import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { MetronomeProvider } from "@/context/metronome-context.tsx"
import { Metronome } from "@/components/metronome.tsx"
import { Recorder } from "@/components/recorder.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <MetronomeProvider>
        <App />
        <Metronome />
        <Recorder />
      </MetronomeProvider>
    </ThemeProvider>
  </StrictMode>
)
