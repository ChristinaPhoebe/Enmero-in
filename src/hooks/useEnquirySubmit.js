import { useCallback, useRef, useState } from 'react';
import {
  FORMSPREE_ENDPOINT,
  FORMSPREE_CONFIGURED,
  enquirySubject
} from '../data/forms.js';

// Submits an enquiry straight to Formspree. Nothing runs in between, so this
// hook owns the whole path: it posts the form, decides whether Formspree
// accepted it, and turns that into the form's own state. A ref rejects a second
// submit while one is already in flight, and a timeout stops a request that
// never resolves from leaving the button on "Sending" forever.
//
// The Accept header is what makes this work. Formspree answers with JSON when
// it is asked to, and otherwise redirects a successful submission, and a
// redirect cannot be told apart from a failure after the fact.
const REQUEST_TIMEOUT_MS = 15000;

const FAILED = 'We could not send your message right now. Please try again.';
const UNCONFIGURED = 'This form is not set up yet. Please email contact@enmero.in.';

// Field names are written the way a person reads them, because Formspree puts
// the field name straight into the email. The forms already validate every
// required field before submitting, so a Formspree field error would be a second
// opinion on a value the visitor was shown as valid, and one report is clearer
// than two. Field problems are therefore reported as a single form level
// message rather than pasted onto an input.
export default function useEnquirySubmit() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');
  const inFlight = useRef(false);

  const submit = useCallback(async ({ formType, honeypot, ...fields }) => {
    if (inFlight.current) {
      return { ok: false };
    }

    if (!FORMSPREE_CONFIGURED) {
      setMessage(UNCONFIGURED);
      return { ok: false };
    }

    inFlight.current = true;
    setSubmitting(true);
    setMessage('');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...fields,
          form_type: formType,
          // _replyto is what makes "Reply" in the inbox reach the visitor.
          // A form with no usable email address is still worth receiving, so an
          // empty value is sent rather than a made up one.
          _replyto: fields.Email || '',
          _subject: enquirySubject(formType, fields.Name || 'the website'),
          // Formspree reads a filled honeypot as a bot and drops the
          // submission. A person never sees the field, so it arrives empty.
          _gotcha: honeypot || ''
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        setMessage(FAILED);
        return { ok: false };
      }

      setSent(true);
      return { ok: true };
    } catch (_error) {
      setMessage(FAILED);
      return { ok: false };
    } finally {
      clearTimeout(timeout);
      inFlight.current = false;
      setSubmitting(false);
    }
  }, []);

  return { submit, submitting, sent, message };
}
