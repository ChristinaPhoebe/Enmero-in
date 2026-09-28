// Where the enquiry forms are delivered, and how each one is labelled.
//
// Formspree is called directly from the browser, so there is no function and no
// server in between. That is deliberate: Formspree's endpoint is public by
// design, it only accepts submissions, and it cannot be used from a server
// without a secret, so the VITE_ prefix here is correct rather than careless.
// There is nothing in this file worth hiding.
//
// The endpoint is read once, from VITE_FORMSPREE_ENDPOINT, and must be the
// form's full URL, for example https://formspree.io/f/abcdwxyz
const PLACEHOLDER_ENDPOINT = 'https://formspree.io/f/your-form-id';

const configuredEndpoint = (import.meta.env.VITE_FORMSPREE_ENDPOINT || '').trim();

export const FORMSPREE_ENDPOINT = configuredEndpoint || PLACEHOLDER_ENDPOINT;

// False while the endpoint is still the placeholder, so a form can say it is not
// set up yet instead of posting to an address that does not exist.
export const FORMSPREE_CONFIGURED =
  configuredEndpoint !== '' && configuredEndpoint !== PLACEHOLDER_ENDPOINT;

// The three forms. form_type is what identifies the request in the email, so it
// is sent with every submission. The contact form reports the general enquiry
// or the service enquiry depending on which service was chosen.
export const ENQUIRY_TYPES = {
  GENERAL: 'General Contact',
  SERVICE: 'Service Enquiry',
  DEMO: 'Demo Request'
};

// The subject line, so the three forms can be told apart in the inbox without
// opening the email.
export function enquirySubject(formType, name) {
  return `[Enmero] ${formType} from ${name}`;
}

// Formspree lists only the fields it receives, so an optional field the visitor
// left blank is dropped from the request instead of arriving as an empty line.
// The honeypot is added back by the caller and is never filtered, because an
// empty honeypot is what tells Formspree the submission came from a person.
export function withoutBlanks(fields) {
  const kept = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    kept[key] = value;
  }
  return kept;
}
