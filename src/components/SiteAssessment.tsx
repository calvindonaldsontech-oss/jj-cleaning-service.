import type { SitePhoto } from '@/lib/sitePhotos';

interface SiteAssessmentProps {
  photos: SitePhoto[];
}

export default function SiteAssessment({ photos }: SiteAssessmentProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
      <h2 className="text-lg font-semibold text-slate-900">Site Assessment &amp; Pre-Existing Conditions</h2>
      <p className="mt-1 text-sm leading-normal text-slate-600">
        Photos taken before the job began. They record the condition of the property so that any existing damage or
        wear is documented.
      </p>
      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo) => (
          <li key={photo.id}>
            <img
              src={photo.dataUrl}
              alt={photo.name}
              className="aspect-square w-full rounded-lg border border-slate-200 object-cover"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
