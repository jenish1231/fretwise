import { useState } from "react"
import { cn } from "@/lib/utils"

const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// index 0 = low E, 5 = high E (display reversed: high E at top)
const STRING_LABELS = ['E', 'A', 'D', 'G', 'B', 'E']
const OPEN_INDICES = [4, 9, 2, 7, 11, 4]
const DOT_FRETS = new Set([3, 5, 7, 9, 12])

type Degree = "root" | "third" | "fifth"

const DEGREE_STYLES: Record<Degree, string> = {
  root:  "bg-sky-500 text-white",
  third: "bg-emerald-500 text-white",
  fifth: "bg-amber-500 text-white",
}

const DEGREE_LABELS: Record<Degree, string> = {
  root:  "R",
  third: "3",
  fifth: "5",
}

function triadNotes(root: string): Record<string, Degree> {
  const ri = CHROMATIC.indexOf(root)
  return {
    [CHROMATIC[ri]]:          "root",
    [CHROMATIC[(ri + 4) % 12]]: "third",  // major 3rd
    [CHROMATIC[(ri + 7) % 12]]: "fifth",  // perfect 5th
  }
}

export function MajorTriads() {
  const [root, setRoot] = useState("C")

  const noteMap = triadNotes(root)
  const [rootNote, thirdNote, fifthNote] = [
    root,
    CHROMATIC[(CHROMATIC.indexOf(root) + 4) % 12],
    CHROMATIC[(CHROMATIC.indexOf(root) + 7) % 12],
  ]

  const displayOrder = [5, 4, 3, 2, 1, 0] // high E at top
  const visibleFrets = Array.from({ length: 13 }, (_, i) => i)

  return (
    <div className="flex flex-col gap-6">
      {/* Description */}
      <p className="text-sm text-muted-foreground">
        A major triad is built from 3 notes: the <strong className="text-foreground">root</strong>, a <strong className="text-foreground">major 3rd</strong> (4 semitones up), and a <strong className="text-foreground">perfect 5th</strong> (7 semitones up).
        Select a root note to see every occurrence of those 3 notes across the full fretboard.
      </p>

      {/* Root selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-sm text-muted-foreground" htmlFor="triad-root">Root note</label>
        <select
          id="triad-root"
          value={root}
          onChange={(e) => setRoot(e.target.value)}
          className="text-sm font-mono font-semibold border rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {CHROMATIC.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>

        {/* Triad label */}
        <span className="text-sm font-semibold">{root} major</span>
        <span className="text-sm text-muted-foreground font-mono">
          {rootNote} – {thirdNote} – {fifthNote}
        </span>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs">
        {(["root", "third", "fifth"] as Degree[]).map((deg) => (
          <span key={deg} className="flex items-center gap-1.5">
            <span className={cn("inline-flex size-5 rounded-full items-center justify-center text-[9px] font-bold", DEGREE_STYLES[deg])}>
              {DEGREE_LABELS[deg]}
            </span>
            <span className="text-muted-foreground">
              {deg === "root" ? `Root (${rootNote})` : deg === "third" ? `Major 3rd (${thirdNote})` : `Perfect 5th (${fifthNote})`}
            </span>
          </span>
        ))}
      </div>

      {/* Fretboard */}
      <div className="overflow-x-auto rounded-lg border bg-card p-4">
        <div className="inline-flex flex-col min-w-max">
          {displayOrder.map((si, di) => {
            const openIdx = OPEN_INDICES[si]
            return (
              <div key={si} className="flex items-center">
                <span className="text-xs w-4 text-right mr-3 text-muted-foreground font-mono shrink-0">
                  {STRING_LABELS[si]}
                </span>
                {visibleFrets.map((fret) => {
                  const note = CHROMATIC[(openIdx + fret) % 12]
                  const degree = noteMap[note] as Degree | undefined
                  const isNut = fret === 0

                  return (
                    <div
                      key={fret}
                      className={cn(
                        "relative flex items-center justify-center w-10 h-8",
                        isNut ? "border-r-[3px] border-r-foreground/70" : "border-r border-r-border/40"
                      )}
                    >
                      {di === 5 && DOT_FRETS.has(fret) && (
                        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 size-1 rounded-full bg-muted-foreground/30" />
                      )}
                      <div
                        className={cn(
                          "absolute inset-x-0 top-1/2 -translate-y-1/2 bg-border/80",
                          di === 0 || di === 5 ? "h-[1.5px]" : "h-px"
                        )}
                      />
                      {degree ? (
                        <div className={cn("relative z-10 size-7 rounded-full flex flex-col items-center justify-center", DEGREE_STYLES[degree])}>
                          <span className="text-[8px] font-bold leading-none">{note}</span>
                          <span className="text-[7px] leading-none opacity-80">{DEGREE_LABELS[degree]}</span>
                        </div>
                      ) : (
                        <span className="relative z-10 text-[9px] text-muted-foreground/25 font-mono">
                          {fret > 0 ? note : ""}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}

          {/* Fret numbers */}
          <div className="flex mt-1.5">
            <div className="w-7 mr-3 shrink-0" />
            {visibleFrets.map((fret) => (
              <div key={fret} className="w-10 text-center">
                {fret === 0 ? (
                  <span className="text-[9px] text-muted-foreground">open</span>
                ) : (
                  <span className={cn(
                    "text-[10px] font-mono",
                    DOT_FRETS.has(fret) ? "text-muted-foreground/40" : "text-muted-foreground/20"
                  )}>
                    {fret}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
