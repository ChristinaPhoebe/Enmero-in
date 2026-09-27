import { useCallback, useRef, useState } from 'react';

// Submits an enquiry to the /api/contact function. The function owns validation
// and delivery, so this hook only turns its response into the form's own state:
// a sending flag, a form-level message, and the per-field messages the function
// returned. A ref rejects a second submit while one is already in flight, and a
// timeout stops a request that never resolves from leaving the button on
// "Sending" forever.
const REQUEST_TIMEOUT_MS = 15000;

const UNAVAILABLE = 'This form is temporarily unavailable. Please email vorsped04@gmail.com.';
const FAILED = 'We could not send your message right now. Please try again.';

export default function useEnquirySubmit() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');
  const inFlight = useRef(false);

  const submit = useCallback(async (payload) => {
    if (inFlight.current) {
      return { ok: false, fields: null };
    }

    inFlight.current = true;
    setSubmitting(true);
    setMessage('');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      if (response.status === 404 || response.status === 405) {
        // Local Vite has no /api/contact function, and a deployment without one
        // yet reports the same way. Say so plainly rather than failing silently.
        setMessage(UNAVAILABLE);
        return { ok: false, fields: null };
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage(typeof data?.error === 'string' ? data.error : FAILED);
        return { ok: false, fields: data?.fields || null };
      }

      if (data?.ok !== true) {
        // A 200 that is not the function's own success response means the
        // request never reached it, so something else answered. Never report a
        // message as sent on the strength of a response we do not recognise.
        setMessage(UNAVAILABLE);
        return { ok: false, fields: null };
      }

      setSent(true);
      return { ok: true, fields: null };
    } catch (_error) {
      setMessage(FAILED);
      return { ok: false, fields: null };
    } finally {
      clearTimeout(timeout);
      inFlight.current = false;
      setSubmitting(false);
    }
  }, []);

  return { submit, submitting, sent, message };
}
