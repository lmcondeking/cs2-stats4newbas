"use client";

import { useState } from "react";

export default function DemoUploader() {
  const [fileName, setFileName] = useState("");

  return (
    <div className="rounded-2xl border border-red-600 bg-zinc-950 p-6">
      <h3 className="mb-4 text-2xl font-black text-red-500">
        Subir demo de CS2
      </h3>

      <input
        type="file"
        accept=".dem"
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (!file) return;

          setFileName(file.name);
        }}
        className="block w-full cursor-pointer rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-sm text-zinc-300"
      />

      {fileName && (
        <p className="mt-4 text-green-400">
          Demo seleccionada: {fileName}
        </p>
      )}
    </div>
  );
}