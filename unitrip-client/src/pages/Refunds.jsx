import LegalPage from "@/pages/LegalPage";

const SECTIONS = [
  {
    title: "How to cancel",
    paragraphs: [
      "To cancel a UNITRIP booking, email care@unitrip.travel from the email address on the booking. Include your order id and the travel date. A cancellation is complete only after we confirm it by email and the order status shows cancelled.",
    ],
  },
  {
    title: "Bookings that are not paid",
    paragraphs: [
      "A booking that is still waiting for payment is not confirmed. If you do not pay, there is no amount to refund. The tour is not held for you.",
    ],
  },
  {
    title: "Confirmed bookings",
    paragraphs: [
      "If your booking is confirmed and you cancel before the travel date, email us as soon as you can. We will tell you by email whether the amount you paid can be returned, and how much.",
    ],
    items: [
      "Cancel before the travel date and we will review the request against the arrangements already made for your trip.",
      "If the travel date has passed, or you do not arrive for the trip, the amount paid is not refunded.",
      "Optional add-ons follow the same booking. They are not refunded separately once the trip has started.",
    ],
  },
  {
    title: "If UNITRIP cancels",
    paragraphs: [
      "If we cancel a confirmed trip and cannot offer you another date that you accept, we refund the amount you paid UNITRIP for that booking.",
    ],
  },
  {
    title: "How a refund is paid",
    paragraphs: [
      "An approved refund is sent back through the same payment method you used, such as UPI or the card payment handled by our payment partner. We do not store your full card number. Your bank or UPI app may take additional time to show the money after we send it.",
    ],
  },
  {
    title: "Changes",
    paragraphs: [
      "If we change this policy, we will post the updated version on this page and change the date below. The current version was published on 12 October 2026. The rules that apply to a booking are those published at the time you pay.",
    ],
  },
  {
    title: "Contact us",
    paragraphs: [
      "Questions about a cancellation or a refund can be sent to care@unitrip.travel. Include your order id. UNITRIP TRAVELS PRIVATE LIMITED, Delhi, India.",
    ],
  },
];

export default function Refunds() {
  return (
    <LegalPage title="Refund & Cancellation">
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
