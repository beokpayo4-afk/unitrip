/**
 * Resolve paid_addon place IDs against a package.
 * Skips invalid ids, included places, and already-selected placeIds.
 */
export function resolvePaidAddOns(pkg, placeIds = [], alreadySelectedIds = []) {
  const selected = new Set(
    (alreadySelectedIds || []).map((id) => String(id))
  );
  const requested = [...new Set((placeIds || []).map((id) => String(id)))];
  const addOns = [];

  for (const id of requested) {
    if (selected.has(id)) continue;
    const place = (pkg.places || []).find(
      (p) => String(p._id) === id && p.type === "paid_addon"
    );
    if (!place) continue;
    addOns.push({
      placeId: String(place._id),
      name: place.name,
      distanceKm: place.distanceKm || 0,
      extraAmount: Number(place.extraAmount) || 0,
    });
    selected.add(id);
  }

  return addOns;
}

export function sumAddOnAmount(addOns = []) {
  return addOns.reduce((sum, a) => sum + (Number(a.extraAmount) || 0), 0);
}

export function includedPlacesSnapshot(pkg) {
  return (pkg.places || [])
    .filter((p) => p.type === "included")
    .map((p) => ({
      placeId: String(p._id),
      name: p.name,
      description: p.description || "",
      distanceKm: p.distanceKm || 0,
    }));
}

export function availablePaidAddOns(pkg, alreadySelectedIds = []) {
  const taken = new Set((alreadySelectedIds || []).map((id) => String(id)));
  return (pkg.places || [])
    .filter((p) => p.type === "paid_addon" && !taken.has(String(p._id)))
    .map((p) => ({
      placeId: String(p._id),
      name: p.name,
      description: p.description || "",
      distanceKm: p.distanceKm || 0,
      extraAmount: Number(p.extraAmount) || 0,
    }));
}

export default {
  resolvePaidAddOns,
  sumAddOnAmount,
  includedPlacesSnapshot,
  availablePaidAddOns,
};
