'use client';

import { useState, useRef, useEffect } from 'react';

interface KnownFace {
  name: string;
  updatedAt?: string;
}

/**
 * Compact face registration button — opens a dropdown to upload a face photo
 * with a name, and lists/deletes existing known faces.
 */
export default function FaceUpload() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [faces, setFaces] = useState<KnownFace[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchFaces = async () => {
    try {
      const res = await fetch('/api/sentinel/face');
      const data = await res.json();
      setFaces(data.faces ?? []);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    if (open) fetchFaces();
  }, [open]);

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file || !name.trim()) {
      setStatus('Name and photo required');
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      // Convert file to base64
      const buffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      const res = await fetch('/api/sentinel/face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), image: base64 }),
      });

      if (res.ok) {
        setStatus(`Registered: ${name.trim()}`);
        setName('');
        if (fileRef.current) fileRef.current.value = '';
        fetchFaces();
      } else {
        const err = await res.json();
        setStatus(err.error || 'Upload failed');
      }
    } catch {
      setStatus('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (faceName: string) => {
    try {
      await fetch('/api/sentinel/face', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: faceName }),
      });
      fetchFaces();
    } catch { /* ignore */ }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-md bg-zinc-800 border border-zinc-700 px-2 py-1 text-[10px] font-mono text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
      >
        FACES {faces.length > 0 && <span className="text-blue-400 ml-1">{faces.length}</span>}
      </button>

      {open && (
        <div className="absolute right-0 top-9 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl z-50 w-72 p-3 flex flex-col gap-3">
          <h3 className="text-xs font-mono font-bold text-zinc-400 tracking-widest uppercase">
            Register Known Face
          </h3>

          {/* Name input */}
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Person's name"
            className="w-full rounded bg-zinc-800 border border-zinc-700 px-2 py-1.5 text-xs font-mono text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
          />

          {/* File input */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="w-full text-xs font-mono text-zinc-400 file:mr-2 file:rounded file:border-0 file:bg-zinc-700 file:px-2 file:py-1 file:text-xs file:font-mono file:text-zinc-300 file:cursor-pointer hover:file:bg-zinc-600"
          />

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full rounded bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 px-3 py-1.5 text-xs font-mono font-bold text-white transition-colors"
          >
            {loading ? 'Uploading...' : 'Register Face'}
          </button>

          {/* Status message */}
          {status && (
            <p className={`text-[10px] font-mono ${status.startsWith('Registered') ? 'text-green-400' : 'text-red-400'}`}>
              {status}
            </p>
          )}

          {/* Known faces list */}
          {faces.length > 0 && (
            <>
              <div className="h-px bg-zinc-800" />
              <h4 className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase">
                Known ({faces.length})
              </h4>
              <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                {faces.map(f => (
                  <div key={f.name} className="flex items-center justify-between rounded bg-zinc-800 px-2 py-1">
                    <span className="text-xs font-mono text-blue-400">{f.name}</span>
                    <button
                      onClick={() => handleDelete(f.name)}
                      className="text-zinc-600 hover:text-red-400 text-[10px] font-mono transition-colors"
                    >
                      DEL
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Close */}
          <button
            onClick={() => setOpen(false)}
            className="text-zinc-600 hover:text-zinc-400 text-[10px] font-mono text-center transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
