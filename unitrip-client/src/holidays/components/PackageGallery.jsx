import { useState } from "react";

export default function PackageGallery({ images, name }) {
  const [active, setActive] = useState(0);
  const current = images[active] || images[0];

  return (
    <div className="space-y-3">
      <img src={current} alt={name} className="h-72 w-full rounded-xl object-cover sm:h-112" />
      <div className="grid grid-cols-3 gap-3">
        {images.map((src, index) => (
          <button key={src} type="button" onClick={() => setActive(index)} className="overflow-hidden rounded-lg">
            <img
              src={src}
              alt=""
              className={`h-20 w-full object-cover sm:h-24 ${index === active ? "ring-2 ring-primary" : ""}`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
