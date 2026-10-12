import LegalPage from "@/pages/LegalPage";

const SECTIONS = [
  {
    title: "Who we are",
    paragraphs: [
      "UNITRIP TRAVELS PRIVATE LIMITED (“UNITRIP”, “we”, “us”) is a Delhi-based travel agency. This policy explains how we handle personal information when you use our website, create an account, enquire about a trip, or book a tour.",
    ],
  },
  {
    title: "Information we collect",
    paragraphs: ["We collect only what we need to run your account and your booking."],
    items: [
      "Account details: your name, email address, phone number, and a password. We store the password as a secure hash, not as plain text.",
      "Booking details: traveller name, email, phone number, travel date, number of travellers, and the tour or package you selected.",
      "Payment references: when you pay, our payment partner processes the payment. We keep the payment status and reference numbers (such as a Razorpay order or payment id, or a UPI transaction id you submit). We do not store your full card number.",
      "Messages you send us: the contents of a trip enquiry or a support email, including your order id if you include one.",
      "A login token saved in your browser so you can stay signed in on that device.",
    ],
  },
  {
    title: "How we use it",
    paragraphs: ["We use this information to:"],
    items: [
      "Create and protect your account.",
      "Confirm, manage, and support your bookings.",
      "Take payment and show you the status of an order.",
      "Reply when you contact us at care@unitrip.travel.",
      "Keep the website secure and fix problems.",
    ],
  },
  {
    title: "Who we share it with",
    paragraphs: [
      "We do not sell your personal information. We share it only when it is needed to provide the service:",
    ],
    items: [
      "Payment partners, so a booking can be paid for and confirmed.",
      "Hotels, transport, and tour partners, when that is required to deliver the trip you booked.",
      "Hosting and database providers that store the website and booking records for us.",
      "Authorities, if we are required to do so by law.",
    ],
  },
  {
    title: "How long we keep it",
    paragraphs: [
      "We keep account and booking records for as long as your account is open and for as long as we need them to complete a trip, handle a refund or complaint, and meet tax and accounting duties. You can ask us to delete your account when we no longer need the record for those reasons.",
    ],
  },
  {
    title: "Your choices",
    paragraphs: [
      "You can review your bookings after you sign in. You can ask us to correct your name, email, or phone number, or to close your account, by emailing care@unitrip.travel. Include the email address on the account so we can find it.",
      "You can sign out on a shared device. That removes the login token stored in that browser.",
    ],
  },
  {
    title: "Children",
    paragraphs: [
      "Our accounts are for adults booking travel. We do not knowingly create an account for a child. A booking may include other travellers in your party when you give us their names for the trip.",
    ],
  },
  {
    title: "Changes",
    paragraphs: [
      "If we change this policy, we will post the updated version on this page and change the date below. The current version was published on 12 October 2026.",
    ],
  },
  {
    title: "Contact us",
    paragraphs: [
      "Questions about this policy or your information can be sent to care@unitrip.travel. UNITRIP TRAVELS PRIVATE LIMITED, Delhi, India.",
    ],
  },
];

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy">
      {SECTIONS.map((section) => (
        <div key={section.title} className="space-y-2">
          <p className="font-semibold text-foreground">{section.title}</p>
          {section.paragraphs.map((paragraph) => (
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
