import Package from "../models/Package.js";
import Category from "../models/Category.js";
import Booking from "../models/Booking.js";
import slugify, { uniquePackageSlug } from "../utils/slugify.js";
import asyncHandler from "../utils/asyncHandler.js";
import { audit } from "../utils/audit.js";
import { citiesWithNearby, nearbyCitiesFor } from "../utils/nearbyCities.js";

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cityMatchFilter(city, { includeNearby = false } = {}) {
  const cities = includeNearby ? citiesWithNearby(city) : [city.trim()];
  const pattern = cities.map(escapeRegex).join("|");
  return new RegExp(`^(${pattern})$`, "i");
}

function buildPackageFilter(query, { admin = false } = {}) {
  const filter = {};
  if (!admin) filter.isActive = true;

  if (query.city) {
    const includeNearby =
      query.nearby !== "0" &&
      query.nearby !== "false" &&
      query.nearby !== "no";
    filter.city = cityMatchFilter(query.city, { includeNearby });
  }
  if (query.state) filter.state = new RegExp(`^${escapeRegex(query.state)}$`, "i");
  if (query.country) filter.country = new RegExp(`^${escapeRegex(query.country)}$`, "i");
  else if (query.scope === "india") {
    filter.country = new RegExp("^India$", "i");
  } else if (query.scope === "international") {
    filter.country = { $not: new RegExp("^India$", "i") };
  }
  if (query.tag) filter.tags = new RegExp(`^${escapeRegex(query.tag)}$`, "i");
  if (query.category) filter.category = query.category;
  if (query.search) {
    const s = query.search.trim();
    filter.$or = [
      { title: new RegExp(s, "i") },
      { about: new RegExp(s, "i") },
      { city: new RegExp(s, "i") },
      { tags: new RegExp(s, "i") },
      { "places.name": new RegExp(s, "i") },
    ];
  }
  return filter;
}

export const listPackages = asyncHandler(async (req, res) => {
  const filter = buildPackageFilter(req.query);

  if (req.query.categorySlug) {
    const cat = await Category.findOne({ slug: req.query.categorySlug });
    if (!cat) return res.json([]);
    filter.category = cat._id;
  }

  const packages = await Package.find(filter)
    .populate("category", "name slug")
    .sort({ createdAt: -1 });

  res.json(packages);
});

export const listDestinations = asyncHandler(async (req, res) => {
  const match = { isActive: true };
  if (req.query.scope === "india") {
    match.country = new RegExp("^India$", "i");
  } else if (req.query.scope === "international") {
    match.country = { $not: new RegExp("^India$", "i") };
  } else if (req.query.country) {
    match.country = new RegExp(`^${escapeRegex(req.query.country)}$`, "i");
  }

  const rows = await Package.aggregate([
    { $match: match },
    {
      $group: {
        _id: { city: "$city", state: "$state", country: "$country" },
        count: { $sum: 1 },
        minAmount: { $min: "$amount" },
        image: { $first: { $arrayElemAt: ["$images", 0] } },
      },
    },
    { $sort: { "_id.country": 1, "_id.city": 1 } },
  ]);

  res.json(
    rows.map((r) => ({
      city: r._id.city,
      state: r._id.state,
      country: r._id.country,
      packageCount: r.count,
      fromAmount: r.minAmount,
      image: r.image || "",
    }))
  );
});

function placeKey(name) {
  return String(name || "")
    .trim()
    .toLowerCase();
}

function collectPlaces(packages, { cityFilter } = {}) {
  const byName = new Map();

  for (const pkg of packages) {
    if (cityFilter && !cityFilter(pkg.city)) continue;
    const image = pkg.images?.[0] || "";
    for (const place of pkg.places || []) {
      const key = placeKey(place.name);
      if (!key) continue;
      const existing = byName.get(key);
      if (!existing) {
        byName.set(key, {
          name: place.name,
          description: place.description || "",
          distanceKm: Number(place.distanceKm) || 0,
          extraAmount: Number(place.extraAmount) || 0,
          type: place.type || "included",
          city: pkg.city,
          state: pkg.state,
          country: pkg.country,
          packageSlug: pkg.slug,
          packageTitle: pkg.title,
          packageId: String(pkg._id),
          image,
        });
        continue;
      }
      // Prefer richer description / lower distance when merging duplicates
      if (!existing.description && place.description) {
        existing.description = place.description;
      }
      if (
        (Number(place.distanceKm) || 0) > 0 &&
        (existing.distanceKm === 0 ||
          (Number(place.distanceKm) || 0) < existing.distanceKm)
      ) {
        existing.distanceKm = Number(place.distanceKm) || 0;
      }
    }
  }

  return [...byName.values()].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
}

/** Places to visit in a city + places in nearby cities / day-trip stops. */
export const listPlacesByCity = asyncHandler(async (req, res) => {
  const city = (req.query.city || "").trim();
  if (!city) {
    return res.status(400).json({ message: "city query is required" });
  }

  const nearbyNames = nearbyCitiesFor(city);
  const allCities = citiesWithNearby(city);

  const packages = await Package.find({
    isActive: true,
    city: new RegExp(
      `^(${allCities.map(escapeRegex).join("|")})$`,
      "i"
    ),
  })
    .select(
      "title slug city state country images places amount category"
    )
    .lean();

  const primaryKey = city.toLowerCase();
  const nearbyKeys = new Set(nearbyNames.map((c) => c.toLowerCase()));

  const placesInCity = collectPlaces(packages, {
    cityFilter: (pkgCity) => String(pkgCity || "").toLowerCase() === primaryKey,
  });

  const nearbyPlaces = collectPlaces(packages, {
    cityFilter: (pkgCity) =>
      nearbyKeys.has(String(pkgCity || "").toLowerCase()),
  });

  // Also surface paid add-ons / farther stops from primary-city packages as "nearby"
  const dayTripFromCity = [];
  const seenNearby = new Set(nearbyPlaces.map((p) => placeKey(p.name)));
  for (const pkg of packages) {
    if (String(pkg.city || "").toLowerCase() !== primaryKey) continue;
    for (const place of pkg.places || []) {
      const km = Number(place.distanceKm) || 0;
      const isAddon = place.type === "paid_addon";
      if (km < 20 && !isAddon) continue;
      const key = placeKey(place.name);
      if (!key || seenNearby.has(key)) continue;
      // Skip if already listed as an in-city place under ~20km included stop
      if (placesInCity.some((p) => placeKey(p.name) === key && p.distanceKm < 20)) {
        continue;
      }
      seenNearby.add(key);
      dayTripFromCity.push({
        name: place.name,
        description: place.description || "",
        distanceKm: km,
        extraAmount: Number(place.extraAmount) || 0,
        type: place.type || "included",
        city: pkg.city,
        state: pkg.state,
        country: pkg.country,
        packageSlug: pkg.slug,
        packageTitle: pkg.title,
        packageId: String(pkg._id),
        image: pkg.images?.[0] || "",
        fromCity: true,
      });
    }
  }

  const nearbyMerged = [...nearbyPlaces, ...dayTripFromCity].sort((a, b) => {
    const d = (a.distanceKm || 0) - (b.distanceKm || 0);
    if (d !== 0) return d;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });

  res.json({
    city,
    nearbyCities: nearbyNames,
    placesInCity,
    nearbyPlaces: nearbyMerged,
  });
});

export const getPackageBySlug = asyncHandler(async (req, res) => {
  const pkg = await Package.findOne({
    slug: req.params.slug,
    isActive: true,
  }).populate("category", "name slug");

  if (!pkg) {
    return res.status(404).json({ message: "Package not found" });
  }
  res.json(pkg);
});

export const adminListPackages = asyncHandler(async (req, res) => {
  const filter = buildPackageFilter(req.query, { admin: true });
  const packages = await Package.find(filter)
    .populate("category", "name slug")
    .sort({ createdAt: -1 });
  res.json(packages);
});

export const adminGetPackage = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id).populate(
    "category",
    "name slug"
  );
  if (!pkg) {
    return res.status(404).json({ message: "Package not found" });
  }
  res.json(pkg);
});

function normalizePackageBody(body) {
  const data = { ...body };
  if (data.title && !data.slug) {
    data.slug = slugify(data.title);
  }
  if (typeof data.tags === "string") {
    data.tags = data.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  if (typeof data.images === "string") {
    data.images = data.images
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  ["highlights", "itinerary", "inclusions", "exclusions"].forEach((key) => {
    if (typeof data[key] === "string") {
      data[key] = data[key]
        .split("\n")
        .map((t) => t.trim())
        .filter(Boolean);
    }
  });
  if (!Array.isArray(data.places)) data.places = data.places || [];
  return data;
}

export const createPackage = asyncHandler(async (req, res) => {
  const data = normalizePackageBody(req.body);

  if (!data.title || !data.category || data.amount == null || !data.city) {
    return res.status(400).json({
      message: "title, category, amount, and city are required",
    });
  }

  const category = await Category.findById(data.category);
  if (!category) {
    return res.status(400).json({ message: "Invalid category" });
  }

  if (!data.slug) data.slug = slugify(data.title);
  data.slug = await uniquePackageSlug(Package, data.slug);

  const pkg = await Package.create({
    title: data.title,
    slug: data.slug,
    category: data.category,
    tags: data.tags || [],
    city: data.city,
    state: data.state || "",
    country: data.country || "India",
    images: data.images || [],
    amount: data.amount,
    about: data.about || "",
    highlights: data.highlights || [],
    itinerary: data.itinerary || [],
    inclusions: data.inclusions || [],
    exclusions: data.exclusions || [],
    pdfLinks: data.pdfLinks || [],
    faqs: data.faqs || [],
    isActive: data.isActive !== undefined ? data.isActive : true,
    places: data.places || [],
  });

  const populated = await Package.findById(pkg._id).populate(
    "category",
    "name slug"
  );

  await audit({
    level: "info",
    action: "package.create",
    message: `Package created: "${pkg.title}"`,
    meta: {
      packageId: String(pkg._id),
      slug: pkg.slug,
      city: pkg.city,
      amount: pkg.amount,
      isActive: pkg.isActive,
    },
    actor: req.user,
  });

  res.status(201).json(populated);
});

export const updatePackage = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  if (!pkg) {
    return res.status(404).json({ message: "Package not found" });
  }

  const prevActive = pkg.isActive;
  const data = normalizePackageBody(req.body);
  const fields = [
    "title",
    "slug",
    "category",
    "tags",
    "city",
    "state",
    "country",
    "images",
    "amount",
    "about",
    "highlights",
    "itinerary",
    "inclusions",
    "exclusions",
    "pdfLinks",
    "faqs",
    "isActive",
    "places",
  ];

  fields.forEach((key) => {
    if (data[key] !== undefined) pkg[key] = data[key];
  });

  if (pkg.isActive === true && pkg.deletedAt) {
    pkg.deletedAt = null;
  }
  if (pkg.isActive === false && !pkg.deletedAt) {
    pkg.deletedAt = new Date();
  }

  const slugSource =
    data.slug !== undefined && data.slug !== ""
      ? data.slug
      : data.title && !req.body.slug
        ? data.title
        : pkg.slug;
  pkg.slug = await uniquePackageSlug(Package, slugSource, pkg._id);

  await pkg.save();
  const populated = await Package.findById(pkg._id).populate(
    "category",
    "name slug"
  );

  await audit({
    level: "info",
    action: "package.update",
    message: `Package updated: "${pkg.title}"`,
    meta: {
      packageId: String(pkg._id),
      slug: pkg.slug,
      isActive: pkg.isActive,
      visibilityChanged: prevActive !== pkg.isActive,
    },
    actor: req.user,
  });

  res.json(populated);
});

export const deletePackage = asyncHandler(async (req, res) => {
  const pkg = await Package.findById(req.params.id);
  if (!pkg) {
    return res.status(404).json({ message: "Package not found" });
  }

  if (pkg.deletedAt) {
    return res.json({
      message: "Package is already hidden from the site",
      bookingCount: await Booking.countDocuments({
        "packageSnapshot.packageId": pkg._id,
      }),
      softDeleted: true,
    });
  }

  const bookingCount = await Booking.countDocuments({
    "packageSnapshot.packageId": pkg._id,
  });

  pkg.isActive = false;
  pkg.deletedAt = new Date();
  await pkg.save();

  const message =
    bookingCount > 0
      ? `Package hidden. ${bookingCount} existing booking(s) remain intact.`
      : "Package hidden from the site. Existing bookings (if any) stay intact.";

  await audit({
    level: bookingCount > 0 ? "warn" : "info",
    action: "package.soft_delete",
    message: `Package "${pkg.title}" soft-deleted (${bookingCount} booking(s))`,
    meta: {
      packageId: String(pkg._id),
      slug: pkg.slug,
      bookingCount,
    },
    actor: req.user,
  });

  res.json({ message, bookingCount, softDeleted: true });
});
