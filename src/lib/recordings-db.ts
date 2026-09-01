const DB_NAME = "guitar-practice"
const STORE = "recordings"

export interface Recording {
  id: number
  name: string
  blob: Blob
  duration: number // seconds
  timestamp: number
  mimeType: string
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () =>
      req.result.createObjectStore(STORE, { keyPath: "id", autoIncrement: true })
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveRecording(blob: Blob, duration: number): Promise<number> {
  const db = await open()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite")
    const record: Omit<Recording, "id"> = {
      name: `Take ${new Date().toLocaleString()}`,
      blob,
      duration,
      timestamp: Date.now(),
      mimeType: blob.type,
    }
    const req = tx.objectStore(STORE).add(record)
    req.onsuccess = () => resolve(req.result as number)
    req.onerror = () => reject(req.error)
  })
}

export async function getAllRecordings(): Promise<Recording[]> {
  const db = await open()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, "readonly").objectStore(STORE).getAll()
    req.onsuccess = () => resolve((req.result as Recording[]).reverse())
    req.onerror = () => reject(req.error)
  })
}

export async function deleteRecording(id: number): Promise<void> {
  const db = await open()
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, "readwrite").objectStore(STORE).delete(id)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export function extForMime(mimeType: string): string {
  if (mimeType.includes("mp4")) return ".m4a"
  if (mimeType.includes("ogg")) return ".ogg"
  return ".webm"
}
