export const HIDDEN_CATEGORY_SLUGS = new Set([
  "air-tours",
  "luxury-rail",
  "water-sports",
  "car-charters",
  "attractions-tickets",
]);

export function isPublicCategory(category) {
  return Boolean(category?.slug) && !HIDDEN_CATEGORY_SLUGS.has(category.slug);
}
