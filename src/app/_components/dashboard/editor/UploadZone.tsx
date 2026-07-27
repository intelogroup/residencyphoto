"use client";

import { FileImage, LockKeyhole, ShieldCheck, Upload } from "lucide-react";

interface UploadZoneProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (event: React.DragEvent) => void;
}

const REQUIREMENTS = ["JPG, PNG, HEIC, or HEIF", "Portrait orientation", "Plain, light background"];

export function UploadZone({ onFileChange, onDrop }: UploadZoneProps) {
  return (
    <section className="card relative overflow-hidden bg-white p-5 sm:p-8">
      <div aria-hidden="true" className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><FileImage aria-hidden={true} className="h-5 w-5" /></div>
            <div>
              <h2 className="text-lg font-semibold text-heading">Upload a Headshot</h2>
              <p className="mt-1 text-sm leading-6 text-muted">Upload a headshot, then crop and refine it for the ERAS requirements.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-primary-dark"><LockKeyhole aria-hidden={true} className="h-3.5 w-3.5" />Processed in your browser</div>
        </div>

        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={onDrop}
          className="group mt-6 flex min-h-[310px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 px-6 py-10 text-center transition-[border-color,background-color,box-shadow] duration-150 hover:border-primary hover:bg-primary/5 focus-within:border-primary focus-within:bg-primary/5 focus-within:ring-4 focus-within:ring-primary/10"
        >
          <input type="file" id="file-upload" name="photo" accept="image/jpeg,image/png,image/heic,image/heif" className="sr-only" onChange={onFileChange} aria-describedby="file-upload-help" />
          <label htmlFor="file-upload" className="flex w-full cursor-pointer flex-col items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white text-primary shadow-sm transition-transform duration-150 group-hover:-translate-y-0.5"><Upload aria-hidden={true} className="h-6 w-6" /></div>
            <span className="mt-5 text-base font-semibold text-heading">Upload a Headshot</span>
            <span id="file-upload-help" className="mt-2 max-w-sm text-sm leading-6 text-muted">Drag a photo here or choose one from your device.</span>
            <span className="mt-5 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-150 group-hover:bg-primary-dark">Choose Photo</span>
          </label>
        </div>

        <ul className="mt-5 grid gap-2 text-xs text-muted sm:grid-cols-3">
          {REQUIREMENTS.map((requirement) => <li key={requirement} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5"><ShieldCheck aria-hidden={true} className="h-4 w-4 shrink-0 text-primary" />{requirement}</li>)}
        </ul>
      </div>
    </section>
  );
}
