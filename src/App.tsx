import { useState } from "react"
import { NoteGenerator } from "@/components/note-generator"
import { GuitarFretboard } from "@/components/guitar-fretboard"
import { FingeringPractice } from "@/components/fingering-practice"
import { OctaveShapes } from "@/components/octave-shapes"
import { cn } from "@/lib/utils"

type Page = "notes" | "fingering" | "octaves"

const TABS: { id: Page; label: string }[] = [
  { id: "notes", label: "Random Notes" },
  { id: "fingering", label: "Fingering Practice" },
  { id: "octaves", label: "Octave Shapes" },
]

export default function App() {
  const [page, setPage] = useState<Page>("notes")
  const [notes, setNotes] = useState<string[]>([])

  return (
    <div className="min-h-svh p-6 flex flex-col gap-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold">Guitar Practice</h1>
        <p className="text-sm text-muted-foreground">Use the metronome ♩ in the bottom-right corner.</p>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPage(tab.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              page === tab.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {page === "notes" && (
        <>
          <p className="text-sm text-muted-foreground">
            Generate notes, find each one on the fretboard, then use the metronome to time how fast you can locate them.
          </p>
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Generate Notes</h2>
            <NoteGenerator mode="generate" count={2} onChange={setNotes} />
          </div>
          <GuitarFretboard highlightNotes={notes} />
        </>
      )}

      {page === "fingering" && <FingeringPractice />}
      {page === "octaves" && <OctaveShapes />}
    </div>
  )
}
