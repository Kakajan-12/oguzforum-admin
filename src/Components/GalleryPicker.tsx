"use client";
import { useEffect, useMemo } from "react";

interface Props {
  files: File[];
  onChange: (files: File[]) => void;
  label?: string;
}

// Multi-image picker with client-side previews. Selections accumulate across
// multiple picks; each can be removed before upload.
export default function GalleryPicker({
  files,
  onChange,
  label = "Gallery images",
}: Props) {
  const previews = useMemo(
    () => files.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    [files]
  );

  useEffect(
    () => () => previews.forEach((p) => URL.revokeObjectURL(p.url)),
    [previews]
  );

  const add = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    onChange([...files, ...Array.from(list)]);
  };

  const removeAt = (i: number) => onChange(files.filter((_, idx) => idx !== i));

  return (
    <div>
      <label className="block text-gray-700 font-semibold mb-2">{label}:</label>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          add(e.target.files);
          e.target.value = ""; // allow re-picking the same file / adding more
        }}
        className="border border-gray-300 rounded p-2 w-full"
      />

      {previews.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {previews.map((p, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt={p.file.name}
                className="h-24 w-32 rounded border object-cover"
              />
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label="Remove"
                className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-sm text-white hover:bg-red-700"
              >
                ×
              </button>
            </div>
          ))}
          <p className="w-full text-sm text-gray-500">
            {previews.length} image(s) selected
          </p>
        </div>
      )}
    </div>
  );
}
