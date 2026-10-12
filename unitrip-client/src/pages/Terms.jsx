import LegalPage from "@/pages/LegalPage";

const SECTIONS = [
  {
    title: "Agreement",
    paragraphs: [
      "These terms apply when you use the UNITRIP website, create an account, or book a tour with UNITRIP TRAVELS PRIVATE LIMITED (“UNITRIP”, “we”, “us”), Delhi. By using the site or confirming a booking, you agree to these terms and to our Privacy Policy.",
    ],
  },
  {
    title: "Bookings",
    paragraphs: [
      "A booking is a request to purchase the tour or package shown at checkout. You must give a traveller name, email, phone number, travel date, and the number of travellers.",
    ],
    items: [
      "The name on the booking should match the identification you will carry on the trip.",
      "You are responsible for the accuracy of the details you enter.",
      "The price, inclusions, and any optional add-ons are those shown on the package page before you pay.",
      "A booking is confirmed only after payment is received and the order status shows confirmed.",
    ],
  },
  {
    title: "Payments",
    paragraphs: [
      "Payments are taken through our payment partner. You can pay by the methods offered at checkout, including UPI when it is available. We do not store your full card number. Keep your order id; you can use it with your email to track the booking and download the ticket.",
    ],
  },
  {
    title: "Your account",
    paragraphs: [
      "You must give a current email address and keep your password private. You are responsible for bookings made from your account. Tell us at care@unitrip.travel if you believe someone else has used it.",
    ],
  },
  {
    title: "What we provide",
    paragraphs: [
      "UNITRIP arranges the tour, transfer, or experience described in the package. Hotels, drivers, guides, and other suppliers may deliver parts of the trip. We will tell you what is included before you pay. If a listed arrangement is unavailable, we may offer a similar alternative or contact you before the travel date.",
    ],
  },
  {
    title: "Cancellations and refunds",
    paragraphs: [
      "Cancellation and refund rules are set out on the Refund & Cancellation page. Email care@unitrip.travel with your order id if you need to change or cancel a confirmed booking.",
    ],
  },
  {
    title: "Your responsibilities",
    items: [
      "Arrive at the meeting point on time with the identification required for the trip.",
      "Follow the instructions of the guide, driver, or venue.",
      "Check passport, visa, and entry rules yourself for any international trip. UNITRIP does not obtain visas for you.",
    ],
  },
  {
    title: "Use of the website",
    paragraphs: [
      "You may use the website to browse trips, create an account, and make a booking. You may not misuse the site, attempt to access another person’s account, or submit false booking or payment details.",
    ],
  },
  {
    title: "Liability",
    paragraphs: [
      "We take care in arranging your trip. We are not liable for loss or delay caused by weather, traffic, a closed monument, a supplier, or any event outside our control. Our responsibility for a booking is limited to the amount you paid UNITRIP for that booking, except where the law does not allow that limit.",
    ],
  },
  {
    title: "Governing law",
    paragraphs: [
      "These terms are governed by the laws of India. The courts at Delhi have jurisdiction over disputes arising from a booking or from use of this website.",
    ],
  },
  {
    title: "Changes",
    paragraphs: [
      "If we change these terms, we will post the updated version on this page and change the date below. The current version was published on 12 October 2026. The terms that apply to a booking are those published at the time you pay.",
    ],
  },
  {
    title: "Contact us",
    paragraphs: [
      "Questions about these terms can be sent to care@unitrip.travel. UNITRIP TRAVELS PRIVATE LIMITED, Delhi, India.",
    ],
  },
];

export default function Terms() {
  return (
    <LegalPage title="Terms & Conditions">
      {SECTIONS.map((section) => (
        <div key={section.title} className="space-y-2">
          <p className="font-semibold text-foreground">{section.title}</p>
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {section.items && (
            <ul className="list-disc space-y-1 pl-5">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </LegalPage>
  );
}
