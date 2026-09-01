import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  type Recording,
  saveRecording,
  getAllRecordings,
  deleteRecording,
  extForMime,
} from "@/lib/recordings-db"

function pickMime() {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"]
  return candidates.find((m) => MediaRecorder.isTypeSupported(m)) ?? ""
}

function fmt(secs: number) {
  const m = Math.floor(secs / 60)
  const s = String(Math.floor(secs % 60)).padStart(2, "0")
  return `${m}:${s}`
}

export function Recorder() {
  const [collapsed, setCollapsed] = useState(false)
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [playingId, setPlayingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const urlsRef = useRef<Map<number, string>>(new Map())

  useEffect(() => {
    getAllRecordings().then(setRecordings)
  }, [])

  function blobUrl(rec: Recording): string {
    if (!urlsRef.current.has(rec.id)) {
      urlsRef.current.set(rec.id, URL.createObjectURL(rec.blob))
    }
    return urlsRef.current.get(rec.id)!
  }

  async function startRecording() {
    setError(null)
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setError("Microphone access denied.")
      return
    }

    const mime = pickMime()
    const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
    chunksRef.current = []

    mr.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    mr.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop())
      const blob = new Blob(chunksRef.current, { type: mr.mimeType })
      const duration = (Date.now() - startRef.current) / 1000
      await saveRecording(blob, duration)
      const updated = await getAllRecordings()
      setRecordings(updated)
    }

    mr.start(100)
    mediaRef.current = mr
    startRef.current = Date.now()
    setElapsed(0)
    setRecording(true)

    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
    }, 500)
  }

  function stopRecording() {
    mediaRef.current?.stop()
    mediaRef.current = null
    if (timerRef.current) clearInterval(timerRef.current)
    setRecording(false)
  }

  const playRecording = useCallback((rec: Recording) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (playingId === rec.id) {
      setPlayingId(null)
      return
    }
    const audio = new Audio(blobUrl(rec))
    audio.onended = () => setPlayingId(null)
    audio.play()
    audioRef.current = audio
    setPlayingId(rec.id)
  }, [playingId])

  function downloadRecording(rec: Recording) {
    const a = document.createElement("a")
    a.href = blobUrl(rec)
    a.download = `${rec.name}${extForMime(rec.mimeType)}`
    a.click()
  }

  async function removeRecording(id: number) {
    if (playingId === id) {
      audioRef.current?.pause()
      audioRef.current = null
      setPlayingId(null)
    }
    const url = urlsRef.current.get(id)
    if (url) {
      URL.revokeObjectURL(url)
      urlsRef.current.delete(id)
    }
    await deleteRecording(id)
    setRecordings((prev) => prev.filter((r) => r.id !== id))
  }

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {collapsed ? (
        <Button
          variant="outline"
          className={cn("size-12 rounded-full shadow-lg", recording && "border-red-500 text-red-500")}
          onClick={() => setCollapsed(false)}
          aria-label="Open recorder"
        >
          {recording ? "●" : "⏺"}
        </Button>
      ) : (
        <div className="bg-background border rounded-xl shadow-xl p-4 w-72 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Recorder</span>
            <Button variant="ghost" size="sm" className="size-6 p-0 text-xs" onClick={() => setCollapsed(true)}>
              ✕
            </Button>
          </div>

          {/* Record controls */}
          <div className="flex items-center gap-3">
            <Button
              onClick={recording ? stopRecording : startRecording}
              variant={recording ? "destructive" : "default"}
              size="sm"
              className="flex-1"
            >
              {recording ? `■ Stop  ${fmt(elapsed)}` : "● Record"}
            </Button>
            {recording && (
              <span className="text-xs text-red-500 animate-pulse font-mono">REC</span>
            )}
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          {/* Recordings list */}
          {recordings.length > 0 && (
            <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Recordings</span>
              {recordings.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center gap-1 rounded-md border px-2 py-1.5 text-xs"
                >
                  <button
                    onClick={() => playRecording(rec)}
                    className="size-6 shrink-0 flex items-center justify-center text-muted-foreground hover:text-foreground"
                    aria-label={playingId === rec.id ? "Pause" : "Play"}
                  >
                    {playingId === rec.id ? "⏸" : "▶"}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{rec.name}</p>
                    <p className="text-muted-foreground">{fmt(rec.duration)}</p>
                  </div>
                  <button
                    onClick={() => downloadRecording(rec)}
                    className="shrink-0 text-muted-foreground hover:text-foreground px-1"
                    title="Save to disk"
                    aria-label="Download"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removeRecording(rec.id)}
                    className="shrink-0 text-muted-foreground hover:text-destructive px-1"
                    aria-label="Delete"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
