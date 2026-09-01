import { cn } from "@/lib/utils"

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// strings from high (top) to low (bottom) for display
const STRING_NAMES = ['E', 'B', 'G', 'D', 'A', 'E']
const OPEN_INDICES = [4, 11, 7, 2, 9, 4] // E4, B3, G3, D3, A2, E2

const DOT_FRETS = new Set([3, 5, 7, 9, 12])
const FRET_COUNT = 13

// Cycle through distinct highlight colors for multiple notes
const HIGHLIGHT_COLORS = [
  "bg-primary text-primary-foreground",
  "bg-rose-500 text-white",
  "bg-emerald-500 text-white",
  "bg-amber-500 text-white",
  "bg-violet-500 text-white",
]

interface Props {
  highlightNotes: string[]
}

export function GuitarFretboard({ highlightNotes }: Props) {
  const noteColorMap = new Map(
    highlightNotes.map((note, i) => [note, HIGHLIGHT_COLORS[i % HIGHLIGHT_COLORS.length]])
  )

  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Fretboard</h2>
      <div className="overflow-x-auto rounded-lg border bg-card p-4">
        <div className="inline-flex flex-col min-w-max">
          {STRING_NAMES.map((stringName, si) => {
            const openIdx = OPEN_INDICES[si]
            return (
              <div key={si} className="flex items-center">
                <span className="text-xs w-4 text-right mr-3 text-muted-foreground font-mono shrink-0">
                  {stringName}
                </span>
                {Array.from({ length: FRET_COUNT }).map((_, fret) => {
                  const note = NOTES[(openIdx + fret) % 12]
                  const color = noteColorMap.get(note)
                  const isNut = fret === 0
                  const isLastString = si === STRING_NAMES.length - 1

                  return (
                    <div
                      key={fret}
                      className={cn(
                        "relative flex items-center justify-center",
                        "w-10 h-8",
                        isNut ? "border-r-[3px] border-r-foreground/70" : "border-r border-r-border/40",
                        isLastString ? "" : ""
                      )}
                    >
                      {/* string line */}
                      <div
                        className={cn(
                          "absolute inset-x-0 top-1/2 -translate-y-1/2",
                          si === 0 || si === STRING_NAMES.length - 1 ? "h-[1.5px]" : "h-px",
                          "bg-border/80"
                        )}
                      />
                      {color ? (
                        <div
                          className={cn(
                            "relative z-10 size-6 rounded-full flex items-center justify-center",
                            color
                          )}
                        >
                          <span className="text-[9px] font-bold leading-none">{note}</span>
                        </div>
                      ) : (
                        highlightNotes.length === 0 && (
                          <span className="relative z-10 text-[9px] text-muted-foreground/40 font-mono">
                            {note}
                          </span>
                        )
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}

          {/* Fret numbers row */}
          <div className="flex mt-1.5">
            <div className="w-7 mr-3 shrink-0" />
            {Array.from({ length: FRET_COUNT }).map((_, fret) => (
              <div key={fret} className="w-10 text-center">
                {fret === 0 ? (
                  <span className="text-[9px] text-muted-foreground">open</span>
                ) : DOT_FRETS.has(fret) ? (
                  <span className="text-[10px] text-muted-foreground font-mono">{fret}</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
      {highlightNotes.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {highlightNotes.map((note, i) => (
            <span key={note} className="flex items-center gap-1">
              <span
                className={cn(
                  "inline-block size-2.5 rounded-full",
                  HIGHLIGHT_COLORS[i % HIGHLIGHT_COLORS.length].split(" ")[0]
                )}
              />
              {note}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
