import { useState } from "react"
import { cn } from "@/lib/utils"

const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// index 0 = low E, 5 = high E
const STRING_LABELS = ['E', 'A', 'D', 'G', 'B', 'E']
const OPEN_INDICES = [4, 9, 2, 7, 11, 4]
const DOT_FRETS = new Set([3, 5, 7, 9, 12])

interface Shape {
  id: number
  title: string
  description: string
  note: string
  rootStrings: number[]   // valid root string indices (0=low E)
  stringOffset: number    // octave string = rootString + stringOffset
  fretOffset: number      // octave fret = rootFret + fretOffset
}

const SHAPES: Shape[] = [
  {
    id: 1,
    title: "Shape 1",
    description: "Root on strings 6 or 5. Octave is 2 frets up, 2 strings toward high E.",
    note: "Skips 1 string between root and octave.",
    rootStrings: [0, 1],
    stringOffset: 2,
    fretOffset: 2,
  },
  {
    id: 2,
    title: "Shape 2",
    description: "Root on strings 4 or 3. Octave is 3 frets up, 2 strings toward high E.",
    note: "+3 frets (not +2) because the B string is tuned a half step lower.",
    rootStrings: [2, 3],
    stringOffset: 2,
    fretOffset: 3,
  },
  {
    id: 3,
    title: "Shape 3",
    description: "Root on strings 5 or 4. Octave is 2 frets down, 3 strings toward high E.",
    note: "Spans 3 strings — useful when shapes 1 or 2 are out of reach.",
    rootStrings: [1, 2],
    stringOffset: 3,
    fretOffset: -2,
  },
  {
    id: 4,
    title: "Shape 4",
    description: "Any note on low E (string 6) equals the same fret on high E (string 1) — 2 octaves higher.",
    note: "Both E strings are tuned identically, just 2 octaves apart.",
    rootStrings: [0],
    stringOffset: 5,
    fretOffset: 0,
  },
]

interface Dot {
  string: number
  fret: number
  type: "root" | "octave"
}

function getNoteFrets(stringIdx: number, note: string): number[] {
  const openIdx = OPEN_INDICES[stringIdx]
  const noteIdx = CHROMATIC.indexOf(note)
  const fret = (noteIdx - openIdx + 12) % 12
  // open string note appears at both fret 0 and fret 12
  return fret === 0 ? [0, 12] : [fret]
}

function computeDots(shape: Shape, note: string): Dot[] {
  const dots: Dot[] = []
  for (const rootStr of shape.rootStrings) {
    for (const rootFret of getNoteFrets(rootStr, note)) {
      const octaveFret = rootFret + shape.fretOffset
      const octaveStr = rootStr + shape.stringOffset
      if (octaveFret < 0 || octaveFret > 12 || octaveStr > 5) continue
      dots.push({ string: rootStr, fret: rootFret, type: "root" })
      dots.push({ string: octaveStr, fret: octaveFret, type: "octave" })
    }
  }
  return dots
}

function ShapeFretboard({ dots }: { dots: Dot[] }) {
  const visibleFrets = Array.from({ length: 13 }, (_, i) => i) // 0-12
  const displayOrder = [5, 4, 3, 2, 1, 0] // high E at top

  const dotMap = new Map<string, "root" | "octave">()
  for (const d of dots) dotMap.set(`${d.string}-${d.fret}`, d.type)

  return (
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
                const type = dotMap.get(`${si}-${fret}`)
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
                    {type === "root" ? (
                      <div className="relative z-10 size-7 rounded-full bg-sky-500 flex flex-col items-center justify-center">
                        <span className="text-[8px] font-bold text-white leading-none">{note}</span>
                        <span className="text-[6px] text-white/80 leading-none">root</span>
                      </div>
                    ) : type === "octave" ? (
                      <div className="relative z-10 size-7 rounded-full bg-amber-500 flex flex-col items-center justify-center">
                        <span className="text-[8px] font-bold text-white leading-none">{note}</span>
                        <span className="text-[6px] text-white/80 leading-none">8va</span>
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
                <span
                  className={cn(
                    "text-[10px] font-mono",
                    dots.some((d) => d.fret === fret)
                      ? "text-foreground font-semibold"
                      : DOT_FRETS.has(fret)
                        ? "text-muted-foreground/40"
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

export function OctaveShapes() {
  const [activeShape, setActiveShape] = useState(0)
  const [selectedNote, setSelectedNote] = useState("A")

  const shape = SHAPES[activeShape]
  const dots = computeDots(shape, selectedNote)

  return (
    <div className="flex flex-col gap-6">
      {/* Shape selector */}
      <div className="flex gap-2 flex-wrap">
        {SHAPES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActiveShape(i)}
            className={cn(
              "px-3 py-1.5 rounded-md border text-sm font-medium transition-colors",
              activeShape === i
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-accent"
            )}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* Shape info */}
      <div className="flex flex-col gap-1">
        <p className="text-sm">{shape.description}</p>
        <p className="text-xs text-muted-foreground border-l-2 border-border pl-3">{shape.note}</p>
      </div>

      {/* Note dropdown */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-muted-foreground" htmlFor="note-select">Root note</label>
        <select
          id="note-select"
          value={selectedNote}
          onChange={(e) => setSelectedNote(e.target.value)}
          className="text-sm font-mono font-semibold border rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {CHROMATIC.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>

        {/* Legend */}
        <div className="flex items-center gap-3 ml-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block size-3 rounded-full bg-sky-500" />
            root
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block size-3 rounded-full bg-amber-500" />
            {shape.id === 4 ? "+2 oct" : "+1 oct"}
          </span>
        </div>
      </div>

      <ShapeFretboard dots={dots} />

      {dots.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No valid positions for {selectedNote} with this shape in frets 0–12.
        </p>
      )}
    </div>
  )
}
