import { cn } from "@/lib/utils"

const EXERCISES = [
  {
    id: 1,
    title: "Vertical Single Note",
    description: "Select a note and play it on each string vertically.",
    bpm: 40,
  },
  {
    id: 2,
    title: "Note + Next 2",
    description: "Select a note and play it along with the next 2 chromatic notes.",
    bpm: 40,
  },
  {
    id: 3,
    title: "Two Random Notes",
    description: "Generate 2 random notes. Play each note on 1 string, then move to the next string.",
    bpm: 40,
  },
] as const

export type ExerciseId = (typeof EXERCISES)[number]["id"]

interface Props {
  selected: ExerciseId | null
  onSelect: (id: ExerciseId) => void
}

export function ExerciseList({ selected, onSelect }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Exercises</h2>
      {EXERCISES.map((ex) => (
        <button
          key={ex.id}
          onClick={() => onSelect(ex.id)}
          className={cn(
            "text-left rounded-lg border p-3 transition-colors hover:bg-accent",
            selected === ex.id && "border-primary bg-accent"
          )}
        >
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-xs font-mono font-bold size-5 rounded-full flex items-center justify-center shrink-0",
                selected === ex.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              {ex.id}
            </span>
            <span className="text-sm font-medium">{ex.title}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 pl-7">{ex.description}</p>
          <p className="text-xs text-muted-foreground pl-7 mt-0.5">Start at {ex.bpm} BPM</p>
        </button>
      ))}
    </div>
  )
}
