import { useState } from "react"
import { useMetronome } from "@/context/metronome-context"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

export function Metronome() {
  const { bpm, setBpm, isPlaying, toggle, currentBeat, beatsPerMeasure, setBeatsPerMeasure } =
    useMetronome()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {collapsed ? (
        <Button
          variant="outline"
          className={cn("size-12 rounded-full shadow-lg", isPlaying && "border-primary")}
          onClick={() => setCollapsed(false)}
          aria-label="Open metronome"
        >
          ♩
        </Button>
      ) : (
        <div className="bg-background border rounded-xl shadow-xl p-4 w-64 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Metronome</span>
            <Button variant="ghost" size="sm" className="size-6 p-0 text-xs" onClick={() => setCollapsed(true)}>
              ✕
            </Button>
          </div>

          {/* Beat indicators */}
          <div className="flex gap-1.5 justify-center">
            {Array.from({ length: beatsPerMeasure }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-3 flex-1 rounded-full transition-colors duration-75",
                  isPlaying && currentBeat === i
                    ? i === 0
                      ? "bg-primary"
                      : "bg-primary/60"
                    : "bg-muted"
                )}
              />
            ))}
          </div>

          {/* BPM */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">BPM</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="size-5 p-0 text-xs" onClick={() => setBpm(bpm - 1)}>−</Button>
                <span className="text-sm font-mono w-8 text-center">{bpm}</span>
                <Button variant="ghost" size="sm" className="size-5 p-0 text-xs" onClick={() => setBpm(bpm + 1)}>+</Button>
              </div>
            </div>
            <Slider
              min={20}
              max={240}
              step={1}
              value={[bpm]}
              onValueChange={(vals) => setBpm(Array.isArray(vals) ? vals[0] : vals as number)}
            />
          </div>

          {/* Time signature */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Beats/measure</span>
            <div className="flex gap-1">
              {[2, 3, 4, 6].map((n) => (
                <Button
                  key={n}
                  variant={beatsPerMeasure === n ? "default" : "outline"}
                  size="sm"
                  className="size-6 p-0 text-xs"
                  onClick={() => setBeatsPerMeasure(n)}
                >
                  {n}
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={toggle} variant={isPlaying ? "destructive" : "default"} size="sm">
            {isPlaying ? "Stop" : "Start"}
          </Button>
        </div>
      )}
    </div>
  )
}
