import { Camera, Loader2, X } from 'lucide-react';
import type { SitePhoto } from '@/lib/sitePhotos';

interface PhotoUploaderProps {
  photos: SitePhoto[];
  isProcessing: boolean;
  error: string | null;
  onAdd: (files: File[]) => void;
  onRemove: (photoId: string) => void;
}

export default function PhotoUploader({ photos, isProcessing, error, onAdd, onRemove }: PhotoUploaderProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith('image/'));
    if (files.length > 0) onAdd(files);
    event.target.value = '';
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">Pre-Job Photos</h2>
      <p className="mt-1 text-sm text-slate-600">
        Document pre-existing conditions. On a phone, you can take new photos or pick from your gallery.
      </p>

      <label
        htmlFor="pre-job-photos"
        aria-disabled={isProcessing}
        className={`mt-5 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition focus-within:ring-2 focus-within:ring-brand-600 ${
          isProcessing ? 'cursor-wait opacity-70' : 'cursor-pointer hover:border-brand-600 hover:bg-brand-50'
        }`}
      >
        {isProcessing ? (
          <Loader2 className="h-6 w-6 animate-spin text-brand-700" aria-hidden="true" />
        ) : (
          <Camera className="h-6 w-6 text-brand-700" aria-hidden="true" />
        )}
        <span className="text-sm font-medium text-slate-800">
          {isProcessing ? 'Processing photos...' : 'Upload / Take Pre-Job Photos'}
        </span>
        <span className="text-xs text-slate-500">JPG, PNG or HEIC from your device</span>
        <input
          id="pre-job-photos"
          type="file"
          accept="image/*"
          multiple
          disabled={isProcessing}
          onChange={handleChange}
          className="sr-only"
        />
      </label>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {photos.length > 0 && (
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo) => (
            <li key={photo.id} className="flex flex-col gap-2">
              <img
                src={photo.dataUrl}
                alt={photo.name}
                className="aspect-square w-full rounded-lg border border-slate-200 object-cover"
              />
              <button
                type="button"
                onClick={() => onRemove(photo.id)}
                className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
