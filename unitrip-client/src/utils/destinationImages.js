/**
 * Landmark photos for destination cards.
 * Local assets for Delhi / Goa / Udaipur; Unsplash for others.
 * Keys are lowercase city names.
 */
export const DESTINATION_IMAGES = {
  delhi: "/images/destinations/delhi.jpg",
  agra:
    "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1400&q=80",
  jaipur:
    "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1400&q=80",
  goa: "/images/destinations/goa.webp",
  mumbai:
    "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=1400&q=80",
  udaipur: "/images/destinations/udaipur.jpg",
  jodhpur:
    "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1400&q=80",
  jaisalmer:
    "https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?auto=format&fit=crop&w=1400&q=80",
  gurugram:
    "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1400&q=80",
  gurgaon:
    "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1400&q=80",
  noida:
    "https://images.unsplash.com/photo-1582510003544-4d00bce9d8c3?auto=format&fit=crop&w=1400&q=80",
  mathura:
    "https://images.unsplash.com/photo-1582510003544-4d00bce9d8c3?auto=format&fit=crop&w=1400&q=80",
  dubai:
    "https://images.unsplash.com/photo-1512453979798-5eabb7a4e0c0?auto=format&fit=crop&w=1400&q=80",
  bangkok:
    "https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=1400&q=80",
  singapore:
    "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1400&q=80",
};

const FALLBACK =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1400&q=80";

/** Prefer curated city landmark; skip random picsum placeholders. */
export function destinationImage(city, fallbackUrl = "") {
  const key = String(city || "")
    .trim()
    .toLowerCase();
  if (DESTINATION_IMAGES[key]) return DESTINATION_IMAGES[key];
  if (fallbackUrl && !/picsum\.photos/i.test(fallbackUrl)) return fallbackUrl;
  return FALLBACK;
}
