import dotenv from "dotenv";
import mongoose from "mongoose";
import Category from "./models/Category.js";
import Package from "./models/Package.js";
import GlobalFaq from "./models/GlobalFaq.js";
import slugify from "./utils/slugify.js";

dotenv.config();

/**
 * Real landmark photos per destination (Unsplash).
 */
const images = {
  delhi:
    "https://images.unsplash.com/photo-1587474260584-136574f4848d?auto=format&fit=crop&w=1400&q=80",
  agra:
    "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1400&q=80",
  jaipur:
    "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1400&q=80",
  goa:
    "https://images.unsplash.com/photo-1512343879784-a960cd9dce4d?auto=format&fit=crop&w=1400&q=80",
  mumbai:
    "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&w=1400&q=80",
  udaipur:
    "https://images.unsplash.com/photo-1615836245337-f5b9b593e1a9?auto=format&fit=crop&w=1400&q=80",
  jodhpur:
    "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1400&q=80",
  gurugram:
    "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1400&q=80",
  transfer:
    "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1400&q=80",
  safari:
    "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1400&q=80",
  culture:
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1400&q=80",
  dubai:
    "https://images.unsplash.com/photo-1512453979798-5eabb7a4e0c0?auto=format&fit=crop&w=1400&q=80",
  bangkok:
    "https://images.unsplash.com/photo-1563492065599-3520f775eeed?auto=format&fit=crop&w=1400&q=80",
  singapore:
    "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1400&q=80",
};

/** Remote PDF links stored in DB as URLs */
const pdfs = {
  itinerary:
    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  guide:
    "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf",
};

async function seed() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/unitrip";
  console.log(`Connecting ${uri}`);
  await mongoose.connect(uri);

  console.log("Clearing catalog collections…");
  await Promise.all([
    Package.deleteMany({}),
    Category.deleteMany({}),
    GlobalFaq.deleteMany({}),
  ]);

  console.log("Seeding categories (image links)…");
  const categoryDocs = await Category.insertMany([
    {
      name: "City & Cultural Tours",
      slug: "city-cultural-tours",
      description: "Guided walks and private city highlights across India.",
      imageUrl: images.culture,
    },
    {
      name: "Car Charters",
      slug: "car-charters",
      description: "Full-day private car hire with chauffeur for flexible city travel.",
      imageUrl: images.transfer,
    },
    {
      name: "Water Sports",
      slug: "water-sports",
      description: "Beaches, boat rides and water adventures.",
      imageUrl: images.goa,
    },
    {
      name: "Attractions & Tickets",
      slug: "attractions-tickets",
      description: "Monument tickets and skip-the-line experiences.",
      imageUrl: images.agra,
    },
    {
      name: "Private Transfers",
      slug: "private-transfers",
      description: "Airport and intercity transfers with verified drivers.",
      imageUrl: images.transfer,
    },
    {
      name: "Luxury Rail",
      slug: "luxury-rail",
      description: "Scenic and premium rail journeys.",
      imageUrl: images.culture,
    },
    {
      name: "Air Tours",
      slug: "air-tours",
      description: "Helicopter and scenic flight experiences.",
      imageUrl: images.dubai,
    },
    {
      name: "Adventure & Safari",
      slug: "adventure-safari",
      description: "Jeep safaris, waterfalls and outdoor day trips.",
      imageUrl: images.safari,
    },
    {
      name: "International Tours",
      slug: "international-tours",
      description: "Curated city tours and day experiences outside India.",
      imageUrl: images.dubai,
    },
  ]);

  const bySlug = Object.fromEntries(categoryDocs.map((c) => [c.slug, c]));

  console.log("Seeding packages (image + PDF links)…");
  const packages = [
    {
      title: "Delhi Private City Tour with Humayun's Tomb",
      category: bySlug["city-cultural-tours"]._id,
      tags: ["delhi", "heritage", "private"],
      city: "Delhi",
      state: "Delhi",
      country: "India",
      images: [images.delhi, images.culture],
      amount: 3499,
      about:
        "A full-day private tour of Delhi covering Old Delhi lanes, India Gate, Humayun's Tomb and Qutub Minar with an English-speaking guide.",
      highlights: [
        "Private AC car and driver",
        "Licensed local guide",
        "Flexible photo stops",
      ],
      itinerary: [
        "Morning: Jama Masjid & Chandni Chowk walk",
        "Midday: India Gate & Rajpath views",
        "Afternoon: Humayun's Tomb & Qutub Minar",
      ],
      inclusions: ["Hotel pickup in Delhi NCR", "Guide fees", "Bottled water"],
      exclusions: ["Monument tickets", "Meals", "Tips"],
      pdfLinks: [
        { label: "Day itinerary (PDF)", url: pdfs.itinerary },
        { label: "Guest guide (PDF)", url: pdfs.guide },
      ],
      faqs: [
        {
          question: "How long is the tour?",
          answer: "About 8 hours, depending on traffic and photo stops.",
        },
        {
          question: "Is hotel pickup included?",
          answer: "Yes, within Delhi NCR for most central hotels.",
        },
      ],
      places: [
        {
          name: "India Gate",
          description: "War memorial and Central Vista lawns",
          distanceKm: 0,
          extraAmount: 0,
          type: "included",
        },
        {
          name: "Rashtrapati Bhavan & Rajpath",
          description: "Presidential estate views along Kartavya Path",
          distanceKm: 2,
          extraAmount: 0,
          type: "included",
        },
        {
          name: "Connaught Place",
          description: "Colonial circular market & street food",
          distanceKm: 3,
          extraAmount: 0,
          type: "included",
        },
        {
          name: "Jama Masjid",
          description: "One of India's largest mosques in Old Delhi",
          distanceKm: 5,
          extraAmount: 0,
          type: "included",
        },
        {
          name: "Chandni Chowk",
          description: "Old Delhi bazaar lanes and spice markets",
          distanceKm: 5,
          extraAmount: 0,
          type: "included",
        },
        {
          name: "Red Fort",
          description: "Mughal fort complex on the Yamuna",
          distanceKm: 6,
          extraAmount: 0,
          type: "included",
        },
        {
          name: "Raj Ghat",
          description: "Mahatma Gandhi memorial",
          distanceKm: 6,
          extraAmount: 0,
          type: "included",
        },
        {
          name: "Humayun's Tomb",
          description: "UNESCO Mughal garden tomb",
          distanceKm: 8,
          extraAmount: 0,
          type: "included",
        },
        {
          name: "Lodhi Garden",
          description: "Parkland with Lodhi-era tombs",
          distanceKm: 7,
          extraAmount: 0,
          type: "included",
        },
        {
          name: "Purana Qila",
          description: "Old Fort lakeside ramparts",
          distanceKm: 7,
          extraAmount: 0,
          type: "included",
        },
        {
          name: "Safdarjung Tomb",
          description: "Late Mughal marble mausoleum",
          distanceKm: 9,
          extraAmount: 0,
          type: "included",
        },
        {
          name: "Qutub Minar",
          description: "UNESCO minaret complex in Mehrauli",
          distanceKm: 14,
          extraAmount: 0,
          type: "included",
        },
        {
          name: "Lotus Temple",
          description: "Baháʼí House of Worship — evening stop",
          distanceKm: 12,
          extraAmount: 800,
          type: "paid_addon",
        },
        {
          name: "Akshardham Temple",
          description: "Exterior photo stop (entry rules apply)",
          distanceKm: 14,
          extraAmount: 600,
          type: "paid_addon",
        },
        {
          name: "Bangla Sahib Gurudwara",
          description: "Sikh house of worship with langar",
          distanceKm: 4,
          extraAmount: 500,
          type: "paid_addon",
        },
        {
          name: "Dilli Haat INA",
          description: "Crafts bazaar and regional food stalls",
          distanceKm: 8,
          extraAmount: 700,
          type: "paid_addon",
        },
        {
          name: "Garden of Five Senses",
          description: "Landscaped gardens in Saidul Ajaib",
          distanceKm: 15,
          extraAmount: 900,
          type: "paid_addon",
        },
        {
          name: "Mathura & Vrindavan day trip",
          description: "Temple circuit beyond Delhi NCR",
          distanceKm: 160,
          extraAmount: 4500,
          type: "paid_addon",
        },
      ],
    },
    {
      title: "Old Delhi Food & Heritage Walking Tour",
      category: bySlug["city-cultural-tours"]._id,
      tags: ["delhi", "food", "walking", "old-delhi"],
      city: "Delhi",
      state: "Delhi",
      country: "India",
      images: [images.delhi, images.culture],
      amount: 2199,
      about:
        "A guided walk through Old Delhi covering Jama Masjid courtyards, Chandni Chowk sweets, spice lanes and street-food stops with a local host.",
      highlights: ["Local food host", "Heritage lanes", "Small group friendly"],
      itinerary: [
        "Meet near Jama Masjid",
        "Chandni Chowk tasting trail",
        "Paranthe Wali Gali & spice market",
      ],
      inclusions: ["Guide", "Selected tastings"],
      exclusions: ["Extra snacks", "Transport to start point"],
      pdfLinks: [{ label: "Food walk notes (PDF)", url: pdfs.guide }],
      faqs: [
        {
          question: "Is it vegetarian-friendly?",
          answer: "Yes — most stops have vegetarian options; tell us dietary needs in advance.",
        },
      ],
      places: [
        {
          name: "Paranthe Wali Gali",
          description: "Famous stuffed-paratha lane",
          distanceKm: 0,
          extraAmount: 0,
          type: "included",
        },
        {
          name: "Khari Baoli Spice Market",
          description: "Asia's largest wholesale spice market",
          distanceKm: 1,
          extraAmount: 0,
          type: "included",
        },
        {
          name: "Gali Qasim Jan haveli stop",
          description: "Optional heritage courtyard photo stop",
          distanceKm: 2,
          extraAmount: 400,
          type: "paid_addon",
        },
        {
          name: "National Museum",
          description: "Optional Janpath museum add-on (after walk)",
          distanceKm: 6,
          extraAmount: 1100,
          type: "paid_addon",
        },
      ],
    },
    {
      title: "Nearby Locations Discovery Pass — Delhi NCR",
      category: bySlug["attractions-tickets"]._id,
      tags: ["delhi", "nearby", "ncr", "budget"],
      city: "Delhi",
      state: "Delhi",
      country: "India",
      images: [images.delhi, images.gurugram],
      amount: 100,
      about:
        "Budget pass to explore popular nearby locations around Delhi — photo-stop tips, suggested routes and on-call support for NCR day trips.",
      highlights: [
        "Only ₹100",
        "Nearby NCR locations listed",
        "Digital tips & route notes",
      ],
      itinerary: [
        "Choose a nearby spot from the list",
        "Follow suggested visit window",
        "Optional paid add-on for guided assist",
      ],
      inclusions: ["Digital discovery pass", "Nearby location list", "WhatsApp tip sheet"],
      exclusions: ["Transport", "Entry tickets", "Meals"],
      pdfLinks: [{ label: "Nearby locations notes (PDF)", url: pdfs.guide }],
      faqs: [
        {
          question: "What does ₹100 cover?",
          answer:
            "A digital pass with curated nearby locations around Delhi and basic visit tips. Transport and tickets are separate.",
        },
      ],
      places: [
        {
          name: "Qutub Minar area stroll",
          description: "Mehrauli heritage zone — nearby Delhi highlight",
          distanceKm: 14,
          extraAmount: 0,
          type: "included",
        },
        {
          name: "Lotus Temple viewpoint",
          description: "Kalaji Bahai temple exterior stop",
          distanceKm: 12,
          extraAmount: 0,
          type: "included",
        },
        {
          name: "Cyber Hub Gurugram",
          description: "Nearby NCR evening plaza",
          distanceKm: 28,
          extraAmount: 0,
          type: "included",
        },
        {
          name: "Noida Sector 18 market",
          description: "Nearby shopping & street food",
          distanceKm: 18,
          extraAmount: 0,
          type: "included",
        },
        {
          name: "Akshardham exterior",
          description: "East Delhi temple complex photo stop",
          distanceKm: 14,
          extraAmount: 0,
          type: "included",
        },
        {
          name: "Local guide assist (2 hrs)",
          description: "Optional on-ground guide for your chosen nearby spot",
          distanceKm: 0,
          extraAmount: 499,
          type: "paid_addon",
        },
      ],
    },
    {
      title: "Gurugram Cyber Hub Evening Experience",
      category: bySlug["city-cultural-tours"]._id,
      tags: ["gurugram", "ncr", "evening"],
      city: "Gurugram",
      state: "Haryana",
      country: "India",
      images: [images.gurugram, images.culture],
      amount: 1899,
      about:
        "Evening transfer from Delhi NCR hotels to Cyber Hub for dinner plazas, skyline views and optional Kingdom of Dreams photo stop.",
      highlights: ["NCR hotel pickup", "Flexible dinner time", "Private car"],
      itinerary: ["Pickup", "Cyber Hub stroll", "Optional Kingdom stop", "Drop"],
      inclusions: ["Private AC car", "Driver"],
      exclusions: ["Meals", "Show tickets"],
      pdfLinks: [{ label: "NCR evening notes (PDF)", url: pdfs.itinerary }],
      faqs: [],
      places: [
        {
          name: "Cyber Hub",
          description: "Restaurants and open plazas in Gurugram",
          distanceKm: 0,
          extraAmount: 0,
          type: "included",
        },
        {
          name: "Kingdom of Dreams exterior",
          description: "Theatre complex photo stop",
          distanceKm: 4,
          extraAmount: 500,
          type: "paid_addon",
        },
        {
          name: "Ambience Mall walk",
          description: "Optional shopping stop",
          distanceKm: 6,
          extraAmount: 400,
          type: "paid_addon",
        },
      ],
    },
    {
      title: "Agra Taj Mahal Sunrise Private Tour",
      category: bySlug["city-cultural-tours"]._id,
      tags: ["agra", "taj", "sunrise"],
      city: "Agra",
      state: "Uttar Pradesh",
      country: "India",
      images: [images.agra, images.culture],
      amount: 4299,
      about:
        "Catch the Taj Mahal at sunrise with a private guide, then continue to Agra Fort and Mehtab Bagh viewpoints.",
      highlights: ["Sunrise entry timing", "Private guide", "Bottled water"],
      itinerary: [
        "Pre-dawn hotel pickup",
        "Taj Mahal sunrise visit",
        "Agra Fort & Mehtab Bagh",
      ],
      inclusions: ["Private transfers in Agra", "Guide"],
      exclusions: ["Entry tickets", "Breakfast"],
      pdfLinks: [{ label: "Agra day plan (PDF)", url: pdfs.itinerary }],
      faqs: [
        {
          question: "Do you arrange tickets?",
          answer:
            "We guide you at the counter; tickets are paid on site unless stated otherwise.",
        },
      ],
      places: [
        { name: "Taj Mahal", distanceKm: 0, extraAmount: 0, type: "included" },
        { name: "Agra Fort", distanceKm: 3, extraAmount: 0, type: "included" },
        {
          name: "Fatehpur Sikri",
          description: "Half-day extension",
          distanceKm: 40,
          extraAmount: 2500,
          type: "paid_addon",
        },
      ],
    },
    {
      title: "Jaipur Pink City Half-Day Private Tour",
      category: bySlug["city-cultural-tours"]._id,
      tags: ["jaipur", "rajasthan"],
      city: "Jaipur",
      state: "Rajasthan",
      country: "India",
      images: [images.jaipur],
      amount: 3199,
      about:
        "Half-day highlights of Jaipur including City Palace exterior, Jantar Mantar area and Hawa Mahal photo stop.",
      highlights: ["Private car", "Local guide", "Flexible timing"],
      itinerary: ["City Palace precinct", "Hawa Mahal", "Jal Mahal viewpoint"],
      inclusions: ["AC vehicle", "Guide"],
      exclusions: ["Tickets", "Meals"],
      pdfLinks: [{ label: "Jaipur notes (PDF)", url: pdfs.guide }],
      faqs: [],
      places: [
        { name: "Hawa Mahal", distanceKm: 0, extraAmount: 0, type: "included" },
        {
          name: "Amber Fort",
          description: "Add-on hill fort visit",
          distanceKm: 11,
          extraAmount: 1800,
          type: "paid_addon",
        },
      ],
    },
    {
      title: "Delhi Airport to Agra Private Transfer",
      category: bySlug["private-transfers"]._id,
      tags: ["transfer", "delhi", "agra"],
      city: "Delhi",
      state: "Delhi",
      country: "India",
      images: [images.transfer, images.agra],
      amount: 5500,
      about:
        "Point-to-point private sedan transfer from Delhi Airport / NCR to Agra hotel with meet & greet.",
      highlights: ["Meet & greet", "AC sedan", "Toll included"],
      itinerary: ["Pickup", "Expressway drive", "Agra drop"],
      inclusions: ["Driver allowance", "Toll & parking"],
      exclusions: ["Night charges after 10pm if applicable"],
      pdfLinks: [{ label: "Transfer terms (PDF)", url: pdfs.itinerary }],
      faqs: [
        {
          question: "Flight delay?",
          answer:
            "We track flight ETA for airport pickups when you share the flight number.",
        },
      ],
      places: [
        {
          name: "Delhi Airport T3",
          distanceKm: 0,
          extraAmount: 0,
          type: "included",
        },
        {
          name: "Mathura temple stop",
          distanceKm: 150,
          extraAmount: 900,
          type: "paid_addon",
        },
      ],
    },
    {
      title: "Goa Dudhsagar Waterfall Jeep Safari Day Trip",
      category: bySlug["adventure-safari"]._id,
      tags: ["goa", "jeep", "waterfall"],
      city: "Goa",
      state: "Goa",
      country: "India",
      images: [images.goa, images.safari],
      amount: 3429,
      about:
        "Thrilling jeep safari through the forest to Dudhsagar Waterfalls with shared jeep and guide support.",
      highlights: [
        "Jeep safari",
        "Waterfall swim stop (seasonal)",
        "Pickup from selected points",
      ],
      itinerary: ["Morning pickup", "Forest trail", "Falls viewpoint & return"],
      inclusions: ["Shared jeep", "Guide"],
      exclusions: ["Meals", "Personal expenses"],
      pdfLinks: [{ label: "Safari briefing (PDF)", url: pdfs.guide }],
      faqs: [
        {
          question: "Is swimming allowed?",
          answer:
            "Seasonal and subject to forest department rules on the day.",
        },
      ],
      places: [
        {
          name: "Dudhsagar Falls",
          distanceKm: 0,
          extraAmount: 0,
          type: "included",
        },
        {
          name: "Spice plantation lunch stop",
          distanceKm: 25,
          extraAmount: 700,
          type: "paid_addon",
        },
      ],
    },
    {
      title: "Mumbai Private Heritage Walk — Colaba & Fort",
      category: bySlug["city-cultural-tours"]._id,
      tags: ["mumbai", "walking"],
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      images: [images.mumbai],
      amount: 2499,
      about:
        "A guided walking tour through Colaba Causeway, Gateway of India precinct and Fort Mumbai landmarks.",
      highlights: ["Walking tour", "Local stories", "Cafe recommendations"],
      itinerary: ["Gateway of India", "Colaba Causeway", "Fort architecture"],
      inclusions: ["Guide"],
      exclusions: ["Transport", "Entry fees"],
      pdfLinks: [{ label: "Walk map notes (PDF)", url: pdfs.itinerary }],
      faqs: [],
      places: [
        {
          name: "Gateway of India",
          distanceKm: 0,
          extraAmount: 0,
          type: "included",
        },
        {
          name: "Elephanta Ferry add-on assist",
          distanceKm: 10,
          extraAmount: 1200,
          type: "paid_addon",
        },
      ],
    },
    {
      title: "Udaipur City Palace Ticket with Optional Guide",
      category: bySlug["attractions-tickets"]._id,
      tags: ["udaipur", "tickets"],
      city: "Udaipur",
      state: "Rajasthan",
      country: "India",
      images: [images.udaipur],
      amount: 600,
      about:
        "Hassle-assisted City Palace visit with digital confirmation and optional add-on private guide.",
      highlights: ["Digital confirmation", "Flexible entry window"],
      itinerary: ["Arrive City Palace", "Self-paced visit"],
      inclusions: ["Assistance voucher"],
      exclusions: ["Camera fees", "Guide (unless added)"],
      pdfLinks: [{ label: "Entry info (PDF)", url: pdfs.itinerary }],
      faqs: [],
      places: [
        {
          name: "City Palace",
          distanceKm: 0,
          extraAmount: 0,
          type: "included",
        },
        {
          name: "Lake Pichola boat ride",
          distanceKm: 2,
          extraAmount: 1500,
          type: "paid_addon",
        },
      ],
    },
    {
      title: "Jodhpur Blue City Private Half-Day Tour",
      category: bySlug["city-cultural-tours"]._id,
      tags: ["jodhpur", "blue-city"],
      city: "Jodhpur",
      state: "Rajasthan",
      country: "India",
      images: [images.jodhpur],
      amount: 2899,
      about:
        "Explore Mehrangarh Fort precinct and the blue alleyways of the old city with a private car.",
      highlights: ["Private car", "Viewpoint stops"],
      itinerary: ["Mehrangarh area", "Clock Tower market", "Blue streets walk"],
      inclusions: ["Vehicle", "Driver"],
      exclusions: ["Guide (optional)", "Tickets"],
      pdfLinks: [{ label: "Jodhpur tips (PDF)", url: pdfs.guide }],
      faqs: [],
      places: [
        {
          name: "Mehrangarh Fort",
          distanceKm: 0,
          extraAmount: 0,
          type: "included",
        },
        {
          name: "Bishnoi village safari",
          distanceKm: 25,
          extraAmount: 3200,
          type: "paid_addon",
        },
      ],
    },
    {
      title: "Dubai City Highlights Private Tour",
      category: bySlug["international-tours"]._id,
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
      pdfLinks: [{ label: "Dubai day plan (PDF)", url: pdfs.itinerary }],
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
      category: bySlug["international-tours"]._id,
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
      pdfLinks: [{ label: "Bangkok tips (PDF)", url: pdfs.guide }],
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
      category: bySlug["international-tours"]._id,
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
      pdfLinks: [{ label: "Singapore day plan (PDF)", url: pdfs.itinerary }],
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
  ].map((p) => ({
    ...p,
    slug: slugify(p.title),
    isActive: true,
    averageRating: 0,
    ratingCount: 0,
  }));

  await Package.insertMany(packages);

  console.log("Seeding global FAQs…");
  await GlobalFaq.insertMany([
    {
      question: "How do I track my booking?",
      answer:
        "Use Track Order with your Order ID and the email used at checkout. You can also redownload the PDF ticket there.",
      sortOrder: 1,
    },
    {
      question: "Can I add extra places after booking?",
      answer:
        "Yes. Open Track Order or My Bookings and select available paid add-ons for that package’s city.",
      sortOrder: 2,
    },
    {
      question: "Is GST included?",
      answer:
        "Displayed prices are all-inclusive for the package base. Add-ons are shown separately before you confirm.",
      sortOrder: 3,
    },
    {
      question: "What payment methods are supported?",
      answer:
        "When Razorpay keys are configured: UPI, cards and netbanking. Otherwise bookings stay pending until admin confirmation.",
      sortOrder: 4,
    },
  ]);

  console.log("\nSeed complete:");
  console.log(`  Categories: ${categoryDocs.length}`);
  console.log(`  Packages:   ${packages.length}`);
  console.log(`  Global FAQs: 4`);
  console.log("  Images & PDFs stored as remote URL links (no local media files).");

  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
