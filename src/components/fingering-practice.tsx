import { useState } from "react"
import { cn } from "@/lib/utils"

const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
// Display order: high E (index 0) to low E (index 5)
const STRING_NAMES = ['E', 'B', 'G', 'D', 'A', 'E']
const OPEN_INDICES = [4, 11, 7, 2, 9, 4] // high E → low E
const DOT_FRETS = new Set([3, 5, 7, 9, 12])

// strings[0]=low E, strings[5]=high E
interface ExerciseDef {
  title: string
  description: string
  tip?: string
  strings?: number[][] // undefined = description-only card
}

const EXERCISES: ExerciseDef[] = [
  {
    title: "Spider",
    description: "Play frets 1-2-3-4 on each string with fingers 1-2-3-4. Start ascending (low E → high E), then descending (high E → low E). Use downstrokes.",
    tip: "Begin with just ascending (1 2 3 4). When solid, add reverse (4 3 2 1), then combine both directions.",
    strings: [
      [1, 2, 3, 4],
      [1, 2, 3, 4],
      [1, 2, 3, 4],
      [1, 2, 3, 4],
      [1, 2, 3, 4],
      [1, 2, 3, 4],
    ],
  },
  {
    title: "G Minor Pentatonic Scale",
    description: "G minor pentatonic box 1 pattern. Moveable — slide to 5th fret for A minor pentatonic.",
    tip: "All scales are moveable on the guitar.",
    strings: [
      [3, 6], // low E: G, Bb
      [3, 5], // A: C, D
      [3, 5], // D: F, G
      [3, 5], // G: Bb, C
      [3, 6], // B: D, F
      [3, 6], // high E: G, Bb
    ],
  },
  {
    title: "C Major Scale (Open)",
    description: "Open position C major scale. Start on A string fret 3 (C).",
    tip: "Keep fingers 1, 2, 3 floating over frets 1, 2, 3 the whole time.",
    strings: [
      [],        // low E: not played
      [3, 5],    // A: C, D
      [0, 2, 3], // D: D, E, F
      [0, 2],    // G: G, A
      [0, 1, 3], // B: B, C, D
      [0, 1, 3], // high E: E, F, G
    ],
  },
  {
    title: "G Major Scale (Open)",
    description: "Open position G major scale. Same hand position as C major — start with 3rd finger.",
    tip: "When you reach the D string fret 4, use your 4th (pinky) finger.",
    strings: [
      [3],       // low E: G
      [0, 2],    // A: A, B
      [0, 2, 4], // D: D, E, F# (4th fret = F#, use pinky)
      [0, 2, 4], // G: G, A, B
      [0, 1, 3], // B: B, C, D
      [0, 2, 3], // high E: E, F#, G
    ],
  },
  {
    title: "G Major Scale — 3 Notes Per String",
    description: "G major scale across the neck, 3 notes per string starting at 3rd fret.",
    tip: "For low E and A strings, use fingers 1-2-4 (or 1-3-4). Moveable — start at 5th fret for A major.",
    strings: [
      [3, 5, 7], // low E: G, A, B
      [3, 5, 7], // A: C, D, E
      [4, 5, 7], // D: F#, G, A
      [4, 5, 7], // G: B, C, D
      [5, 7, 8], // B: E, F#, G
      [5, 7, 8], // high E: A, B, C
    ],
  },
  {
    title: "4 Note Ascending Pattern (G Major)",
    description: "Play the G major scale in ascending groups of 4: G-A-B-C, A-B-C-D, B-C-D-E, C-D-E-F#… and so on up the neck.",
    tip: "Use the 3-notes-per-string pattern above as your fret reference and play overlapping groups of 4 consecutive scale notes.",
  },
  {
    title: "A Minor Scale",
    description: "Natural A minor scale starting at 5th fret, 2-3 notes per string.",
    strings: [
      [5, 7, 8], // low E: A, B, C
      [5, 7, 8], // A: D, E, F
      [5, 7, 9], // D: G, A, B
      [5, 7],    // G: C, D
      [5, 6, 8], // B: E, F, G
      [5, 7, 8], // high E: A, B, C
    ],
  },
  {
    title: "A Minor Scale (V2)",
    description: "Same A minor notes, different string distribution. Compare with V1 — pick whichever feels more comfortable.",
    strings: [
      [5, 7, 8], // low E: A, B, C
      [5, 7, 8], // A: D, E, F
      [5, 7],    // D: G, A
      [4, 5, 7], // G: B, C, D
      [5, 6, 8], // B: E, F, G
      [5, 7, 8], // high E: A, B, C
    ],
  },
]

function FretboardView({ strings }: { strings: number[][] }) {
  // strings[0]=low E, strings[5]=high E
  const allFrets = strings.flat()
  const hasOpen = allFrets.includes(0)
  const nonZero = allFrets.filter((f) => f > 0)
  const minFret = nonZero.length ? Math.min(...nonZero) : 1
  const maxFret = allFrets.length ? Math.max(...allFrets) : 4

  const startFret = hasOpen ? 0 : Math.max(0, minFret - 1)
  const endFret = Math.max(maxFret + 1, startFret + 6)
  const visibleFrets = Array.from({ length: endFret - startFret + 1 }, (_, i) => startFret + i)

  // Display: reverse strings so high E (index 5) is at top
  const displayStrings = [...strings].reverse()
  const displayOpen = [...OPEN_INDICES] // already high→low

  return (
    <div className="overflow-x-auto rounded-lg border bg-card p-4">
      <div className="inline-flex flex-col min-w-max">
        {displayStrings.map((stringFrets, di) => {
          const openIdx = displayOpen[di]
          const fretSet = new Set(stringFrets)
          return (
            <div key={di} className="flex items-center">
              <span className="text-xs w-4 text-right mr-3 text-muted-foreground font-mono shrink-0">
                {STRING_NAMES[di]}
              </span>
              {visibleFrets.map((fret) => {
                const note = CHROMATIC[(openIdx + fret) % 12]
                const isActive = fretSet.has(fret)
                const isNut = fret === 0 && startFret === 0

                return (
                  <div
                    key={fret}
                    className={cn(
                      "relative flex items-center justify-center w-10 h-8",
                      isNut
                        ? "border-r-[3px] border-r-foreground/70"
                        : "border-r border-r-border/40"
                    )}
                  >
                    <div
                      className={cn(
                        "absolute inset-x-0 top-1/2 -translate-y-1/2 bg-border/80",
                        di === 0 || di === 5 ? "h-[1.5px]" : "h-px"
                      )}
                    />
                    {isActive ? (
                      <div className="relative z-10 size-7 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-[9px] font-bold text-primary-foreground">{note}</span>
                      </div>
                    ) : (
                      <span className="relative z-10 text-[9px] text-muted-foreground/30 font-mono">
                        {fret > 0 ? note : ""}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}

        <div className="flex mt-1.5">
          <div className="w-7 mr-3 shrink-0" />
          {visibleFrets.map((fret) => (
            <div key={fret} className="w-10 text-center">
              {fret === 0 ? (
                <span className="text-[9px] text-muted-foreground">open</span>
              ) : (
                <span
                  className={cn(
                    "text-[10px] font-mono",
                    strings.flat().includes(fret) || DOT_FRETS.has(fret)
                      ? strings.flat().includes(fret)
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground/40"
                      : "text-muted-foreground/20"
                  )}
                >
                  {fret}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function FingeringPractice() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-1">
      {EXERCISES.map((ex, i) => (
        <div key={i} className="rounded-lg border overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-accent transition-colors text-left gap-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-muted-foreground w-4 shrink-0">{i + 1}</span>
              <span>{ex.title}</span>
            </div>
            <span className="text-muted-foreground text-xs shrink-0">{open === i ? "▲" : "▼"}</span>
          </button>

          {open === i && (
            <div className="border-t bg-muted/20 p-4 flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">{ex.description}</p>
              {ex.tip && (
                <p className="text-xs text-muted-foreground border-l-2 border-border pl-3">{ex.tip}</p>
              )}
              {ex.strings && <FretboardView strings={ex.strings} />}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
