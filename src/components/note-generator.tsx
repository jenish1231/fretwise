import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

function randomNotes(count: number): string[] {
  const result: string[] = []
  const pool = [...CHROMATIC]
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * pool.length)
    result.push(pool.splice(idx, 1)[0])
  }
  return result
}

interface Props {
  mode: "pick" | "generate"
  count?: number
  onChange: (notes: string[]) => void
}

export function NoteGenerator({ mode, count = 2, onChange }: Props) {
  const [noteCount, setNoteCount] = useState(count)
  const [generated, setGenerated] = useState<string[]>([])
  const [picked, setPicked] = useState<string | null>(null)

  function generate() {
    const notes = randomNotes(noteCount)
    setGenerated(notes)
    onChange(notes)
  }

  function pick(note: string) {
    setPicked(note)
    onChange([note])
  }

  if (mode === "generate") {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Notes</span>
          <div className="flex items-center gap-1 ml-auto">
            <Button
              variant="ghost"
              size="sm"
              className="size-6 p-0 text-xs"
              onClick={() => setNoteCount((n) => Math.max(1, n - 1))}
            >
              −
            </Button>
            <span className="text-sm font-mono w-4 text-center">{noteCount}</span>
            <Button
              variant="ghost"
              size="sm"
              className="size-6 p-0 text-xs"
              onClick={() => setNoteCount((n) => Math.min(12, n + 1))}
            >
              +
            </Button>
          </div>
          <Button size="sm" onClick={generate}>
            Generate
          </Button>
        </div>
        {generated.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {generated.map((n) => (
              <Badge key={n} className="text-sm px-3 py-1 font-mono">
                {n}
              </Badge>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-muted-foreground">Pick a note</span>
      <div className="flex flex-wrap gap-1.5">
        {CHROMATIC.map((note) => (
          <button
            key={note}
            onClick={() => pick(note)}
            className={cn(
              "font-mono text-sm px-3 py-1 rounded-md border transition-colors hover:bg-accent",
              picked === note && "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
            )}
          >
            {note}
          </button>
        ))}
      </div>
    </div>
  )
}
