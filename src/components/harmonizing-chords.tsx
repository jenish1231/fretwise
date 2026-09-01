import { useState } from "react"
import { cn } from "@/lib/utils"

const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const STRING_LABELS = ['E', 'A', 'D', 'G', 'B', 'E']
const OPEN_INDICES = [4, 9, 2, 7, 11, 4] // low E → high E
const DOT_FRETS = new Set([3, 5, 7, 9, 12])

// Semitone offsets and chord types for each diatonic degree in a major key
const DEGREES = [
  { roman: "I", semitone: 0, intervals: [0, 4, 7], type: "major" },
  { roman: "ii", semitone: 2, intervals: [0, 3, 7], type: "minor" },
  { roman: "iii", semitone: 4, intervals: [0, 3, 7], type: "minor" },
  { roman: "IV", semitone: 5, intervals: [0, 4, 7], type: "major" },
  { roman: "V", semitone: 7, intervals: [0, 4, 7], type: "major" },
  { roman: "vi", semitone: 9, intervals: [0, 3, 7], type: "minor" },
  { roman: "vii°", semitone: 11, intervals: [0, 3, 6], type: "diminished" },
] as const

type ChordType = "major" | "minor" | "diminished"

function chordSuffix(type: ChordType) {
  if (type === "minor") return "m"
  if (type === "diminished") return "°"
  return ""
}

function typeStyle(type: ChordType) {
  if (type === "major") return "border-sky-500/50 bg-sky-500/5"
  if (type === "minor") return "border-violet-500/50 bg-violet-500/5"
  return "border-rose-500/50 bg-rose-500/5"
}

function typeBadge(type: ChordType) {
  if (type === "major") return "bg-sky-500/20 text-sky-700 dark:text-sky-300"
  if (type === "minor") return "bg-violet-500/20 text-violet-700 dark:text-violet-300"
  return "bg-rose-500/20 text-rose-700 dark:text-rose-300"
}

const DEGREE_COLORS = [
  "bg-sky-500 text-white",
  "bg-emerald-500 text-white",
  "bg-amber-500 text-white",
]
const DEGREE_LABEL = ["R", "3", "5"]

function getChordNotes(keyIdx: number, degree: typeof DEGREES[number]): string[] {
  const root = (keyIdx + degree.semitone) % 12
  return degree.intervals.map((iv) => CHROMATIC[(root + iv) % 12])
}

export function HarmonizingChords() {
  const [key, setKey] = useState("C")
  const [selected, setSelected] = useState(0)

  const keyIdx = CHROMATIC.indexOf(key)
  const chord = DEGREES[selected]
  const chordNotes = getChordNotes(keyIdx, chord)
  const noteToIdx = Object.fromEntries(chordNotes.map((n, i) => [n, i]))

  const displayOrder = [5, 4, 3, 2, 1, 0] // high E at top
  const visibleFrets = Array.from({ length: 13 }, (_, i) => i)

  return (
    <div className="flex flex-col gap-6">
      {/* Description */}
      <p className="text-sm text-muted-foreground">
        Harmonizing a major scale means building a triad on every scale degree using only notes from that key.
        Each degree produces a chord with a fixed quality — the result is 7 diatonic chords that all sound "in key" together.
        Select a key to see its chord set, then click any chord to visualize its notes on the fretboard.
      </p>

      {/* Key selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-muted-foreground" htmlFor="harm-key">Key</label>
        <select
          id="harm-key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="text-sm font-mono font-semibold border rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {CHROMATIC.map((n) => (
            <option key={n} value={n}>{n} major</option>
          ))}
        </select>
      </div>

      {/* Chord cards */}
      <div className="grid grid-cols-7 gap-1.5">
        {DEGREES.map((deg, i) => {
          const notes = getChordNotes(keyIdx, deg)
          const name = `${notes[0]}${chordSuffix(deg.type)}`
          const isSelected = selected === i
          return (
            <button
              key={deg.roman}
              onClick={() => setSelected(i)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border p-2 transition-colors hover:bg-accent text-center",
                isSelected ? typeStyle(deg.type) + " ring-1 ring-current" : ""
              )}
            >
              <span className="text-[10px] text-muted-foreground font-mono">{deg.roman}</span>
              <span className="text-sm font-bold leading-none">{name}</span>
              <span className={cn("text-[9px] rounded px-1 py-0.5 font-medium capitalize", typeBadge(deg.type))}>
                {deg.type === "diminished" ? "dim" : deg.type}
              </span>
              <div className="text-[9px] text-muted-foreground font-mono mt-0.5">
                {notes.join(" ")}
              </div>
            </button>
          )
        })}
      </div>

      {/* Selected chord info */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-sm font-semibold">
          {`${chordNotes[0]}${chordSuffix(chord.type)}`}
        </span>
        <span className="text-sm text-muted-foreground font-mono">
          {chordNotes.join(" – ")}
        </span>
        <div className="flex gap-3 text-xs ml-auto">
          {chordNotes.map((n, i) => (
            <span key={i} className="flex items-center gap-1">
              <span className={cn("inline-flex size-4 rounded-full items-center justify-center text-[8px] font-bold", DEGREE_COLORS[i])}>
                {DEGREE_LABEL[i]}
              </span>
              <span className="text-muted-foreground">{n}</span>
            </span>
          ))}
        </div>
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
                  const degIdx = noteToIdx[note]
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
                      {degIdx !== undefined ? (
                        <div className={cn("relative z-10 size-7 rounded-full flex flex-col items-center justify-center", DEGREE_COLORS[degIdx])}>
                          <span className="text-[8px] font-bold leading-none">{note}</span>
                          <span className="text-[7px] leading-none opacity-80">{DEGREE_LABEL[degIdx]}</span>
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

          <div className="flex mt-1.5">
            <div className="w-7 mr-3 shrink-0" />
            {visibleFrets.map((fret) => (
              <div key={fret} className="w-10 text-center">
                {fret === 0 ? (
                  <span className="text-[9px] text-muted-foreground">open</span>
                ) : (
                  <span className={cn("text-[10px] font-mono", DOT_FRETS.has(fret) ? "text-muted-foreground/40" : "text-muted-foreground/20")}>
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
