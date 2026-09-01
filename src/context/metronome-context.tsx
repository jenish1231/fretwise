import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"

interface MetronomeContextValue {
  bpm: number
  setBpm: (bpm: number) => void
  isPlaying: boolean
  toggle: () => void
  currentBeat: number
  beatsPerMeasure: number
  setBeatsPerMeasure: (n: number) => void
}

const MetronomeContext = createContext<MetronomeContextValue | null>(null)

// Schedule beats 100ms ahead to avoid audio glitches
const SCHEDULE_AHEAD = 0.1
const LOOKAHEAD_MS = 25

export function MetronomeProvider({ children }: { children: React.ReactNode }) {
  const [bpm, setBpmState] = useState(120)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentBeat, setCurrentBeat] = useState(0)
  const [beatsPerMeasure, setBeatsPerMeasure] = useState(4)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const nextBeatTimeRef = useRef(0)
  const currentBeatRef = useRef(0)
  const bpmRef = useRef(bpm)
  const beatsPerMeasureRef = useRef(beatsPerMeasure)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isPlayingRef = useRef(false)

  bpmRef.current = bpm
  beatsPerMeasureRef.current = beatsPerMeasure
  isPlayingRef.current = isPlaying

  const scheduleClick = useCallback((time: number, beat: number) => {
    const ctx = audioCtxRef.current!
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    // Accent on beat 1
    osc.frequency.value = beat === 0 ? 1000 : 800
    gain.gain.setValueAtTime(beat === 0 ? 1 : 0.7, time)
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05)

    osc.start(time)
    osc.stop(time + 0.05)
  }, [])

  const scheduler = useCallback(() => {
    if (!audioCtxRef.current || !isPlayingRef.current) return

    const ctx = audioCtxRef.current
    while (nextBeatTimeRef.current < ctx.currentTime + SCHEDULE_AHEAD) {
      scheduleClick(nextBeatTimeRef.current, currentBeatRef.current)

      const beat = currentBeatRef.current
      const schedTime = nextBeatTimeRef.current
      // Update React state near when the beat fires
      setTimeout(() => {
        if (isPlayingRef.current) setCurrentBeat(beat)
      }, (schedTime - ctx.currentTime) * 1000)

      nextBeatTimeRef.current += 60 / bpmRef.current
      currentBeatRef.current = (currentBeatRef.current + 1) % beatsPerMeasureRef.current
    }

    timerRef.current = setTimeout(scheduler, LOOKAHEAD_MS)
  }, [scheduleClick])

  const toggle = useCallback(() => {
    if (isPlayingRef.current) {
      setIsPlaying(false)
      if (timerRef.current) clearTimeout(timerRef.current)
      setCurrentBeat(0)
      currentBeatRef.current = 0
    } else {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext()
      }
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume()
      }
      nextBeatTimeRef.current = audioCtxRef.current.currentTime + 0.05
      currentBeatRef.current = 0
      setIsPlaying(true)
    }
  }, [])

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setTimeout(scheduler, LOOKAHEAD_MS)
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [isPlaying, scheduler])

  const setBpm = useCallback((v: number) => setBpmState(Math.min(240, Math.max(20, v))), [])

  return (
    <MetronomeContext.Provider
      value={{ bpm, setBpm, isPlaying, toggle, currentBeat, beatsPerMeasure, setBeatsPerMeasure }}
    >
      {children}
    </MetronomeContext.Provider>
  )
}

export function useMetronome() {
  const ctx = useContext(MetronomeContext)
  if (!ctx) throw new Error("useMetronome must be used inside MetronomeProvider")
  return ctx
}
