/**
 * Upserts International Tours category + sample packages without wiping the catalog.
 * Usage: node seed-international.js
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import Category from "./models/Category.js";
import Package from "./models/Package.js";
import slugify, { uniquePackageSlug } from "./utils/slugify.js";

dotenv.config();

const images = {
  dubai:
    "https://images.unsplash.com/photo-1512453979798-5eabb7a4e0c0?auto=format&fit=crop&w=1400&q=80",
  bangkok:
    "https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=1400&q=80",
  singapore:
    "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1400&q=80",
};

const pdf =
  "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

async function run() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/unitrip";
  await mongoose.connect(uri);

  let category = await Category.findOne({ slug: "international-tours" });
  if (!category) {
    category = await Category.create({
      name: "International Tours",
      slug: "international-tours",
      description: "Curated city tours and day experiences outside India.",
      imageUrl: images.dubai,
    });
    console.log("Created category: International Tours");
  } else {
    console.log("Category already exists: International Tours");
  }

  const packages = [
    {
      title: "Dubai City Highlights Private Tour",
      tags: ["dubai", "uae", "international"],
      city: "Dubai",
      state: "Dubai",
      country: "United Arab Emirates",
      images: [images.dubai],
      amount: 8999,
      about:
        "A private half-day tour of Dubai covering the Old Souk, Dubai Frame views, and Marina skyline with hotel pickup.",
      highlights: ["Private vehicle", "English-speaking driver-guide", "Flexible photo stops"],
      itinerary: [
        "Morning: Al Fahidi & Spice Souk",
        "Midday: Dubai Frame photo stop",
        "Afternoon: Marina & JBR promenade",
      ],
      inclusions: ["Hotel pickup (selected areas)", "Bottled water"],
      exclusions: ["Attraction tickets", "Meals", "Tips"],
      pdfLinks: [{ label: "Dubai day plan (PDF)", url: pdf }],
      faqs: [
        {
          question: "Is Burj Khalifa entry included?",
          answer: "No. Entry tickets can be arranged as a paid add-on on request.",
        },
      ],
      places: [
        {
          name: "Dubai Marina walk",
          description: "Waterfront skyline stroll",
          distanceKm: 0,
          extraAmount: 0,
          type: "included",
        },
        {
          name: "Burj Khalifa At the Top",
          description: "Skip-the-line ticket (subject to availability)",
          distanceKm: 8,
          extraAmount: 4500,
          type: "paid_addon",
        },
      ],
    },
    {
      title: "Bangkok Temples & River Private Tour",
      tags: ["bangkok", "thailand", "international"],
      city: "Bangkok",
      state: "Bangkok",
      country: "Thailand",
      images: [images.bangkok],
      amount: 7499,
      about:
        "Private temple circuit with Wat Pho and Grand Palace area, plus a short Chao Phraya river stop.",
      highlights: ["Licensed local guide", "Private AC car", "Temple etiquette briefing"],
      itinerary: [
        "Morning: Wat Pho & Reclining Buddha",
        "Midday: Grand Palace outer circuit",
        "Afternoon: River pier photo stop",
      ],
      inclusions: ["Guide", "Vehicle", "Bottled water"],
      exclusions: ["Temple tickets where applicable", "Meals"],
      pdfLinks: [{ label: "Bangkok tips (PDF)", url: pdf }],
      faqs: [],
      places: [
        {
          name: "Wat Arun viewpoint",
          distanceKm: 3,
          extraAmount: 900,
          type: "paid_addon",
        },
      ],
    },
    {
      title: "Singapore Gardens & Marina Bay Half-Day",
      tags: ["singapore", "marina-bay", "international"],
      city: "Singapore",
      state: "Singapore",
      country: "Singapore",
      images: [images.singapore],
      amount: 9999,
      about:
        "Half-day private highlights covering Gardens by the Bay exterior, Merlion Park, and Marina Bay waterfront.",
      highlights: ["Private chauffeur", "Iconic photo stops", "Flexible timing"],
      itinerary: [
        "Gardens by the Bay (exterior & Supertree Grove)",
        "Merlion Park",
        "Marina Bay waterfront walk",
      ],
      inclusions: ["Private car", "Driver"],
      exclusions: ["Cloud Forest tickets", "Meals"],
      pdfLinks: [{ label: "Singapore day plan (PDF)", url: pdf }],
      faqs: [],
      places: [
        {
          name: "Cloud Forest dome entry",
          distanceKm: 1,
          extraAmount: 3200,
          type: "paid_addon",
        },
      ],
    },
  ];

  let created = 0;
  for (const p of packages) {
    const baseSlug = slugify(p.title);
    const existing = await Package.findOne({
      $or: [{ slug: baseSlug }, { title: p.title }],
    });
    if (existing) {
      console.log(`Skip (exists): ${p.title}`);
      continue;
    }
    const slug = await uniquePackageSlug(Package, baseSlug);
    await Package.create({
      ...p,
      slug,
      category: category._id,
      isActive: true,
      averageRating: 0,
      ratingCount: 0,
    });
    created += 1;
    console.log(`Created: ${p.title}`);
  }

  console.log(`\nDone. New packages: ${created}`);
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
