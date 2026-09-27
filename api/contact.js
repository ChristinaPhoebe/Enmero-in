import {
  GENERAL_ENQUIRY_OPTION,
  SERVICE_CHOICES,
  SERVICE_OPTIONS,
  WATCHTOWER_SERVICE
} from '../src/data/services.js';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const REQUEST_TIMEOUT_MS = 10000;
const MAX_BODY_BYTES = 16 * 1024;

// The browser states which form the submission came from, but the enquiry type
// reported to the business is derived here. A crafted request therefore cannot
// relabel a general enquiry as a service enquiry or a demo request.
const ENQUIRY_SOURCES = ['contact', 'demo'];

const ENQUIRY_TYPE_LABELS = {
  general: 'General Contact',
  service: 'Service Enquiry',
  demo: 'Demo Request'
};

const CONTACT_METHODS = ['Email', 'Phone', 'No preference'];
const DEMO_PRODUCTS = [WATCHTOWER_SERVICE.name];

const FIELD_LIMITS = {
  fullName: 80,
  company: 120,
  email: 254,
  phone: 24,
  website: 200,
  service: 60,
  project: 1000,
  details: 2000,
  contactMethod: 20,
  product: 60,
  message: 2000
};

const CONTACT_REQUIRED_FIELDS = ['fullName', 'company', 'email', 'phone', 'service', 'project'];
const DEMO_REQUIRED_FIELDS = ['fullName', 'company', 'email', 'website'];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9\s().-]+$/;
const PHONE_DIGIT_COUNT = 6;

// A person never sees this field and never fills it. Bot submissions that do are
// accepted silently, so the sender gets a success response and learns nothing.
const HONEYPOT_FIELD = 'fax_number';

// The browser is a reasonable but not a complete rate limiter. This is a
// best-effort guard per warm function instance, not a quota or a bot defence on
// its own. A durable limit belongs in front of the deployment.
const RATE_LIMIT = {
  max: 5,
  windowMs: 10 * 60 * 1000,
  maxEntries: 2000
};

const MESSAGES = {
  method: 'Method not allowed',
  origin: 'Request origin not allowed',
  format: 'Unsupported request format',
  payload: 'That message is too long to send. Please shorten it and try again.',
  unreadable: 'The request could not be read. Please refresh the page and try again.',
  fields: 'Please check the highlighted fields and try again.',
  rateLimited: 'Too many messages were sent from this device. Please wait a few minutes and try again.',
  unconfigured: 'This form is temporarily unavailable. Please email contact@enmero.in.',
  undeliverable: 'Your message could not be sent right now. Please try again shortly.'
};

const FIELD_MESSAGES = {
  fullName: 'Please enter your full name.',
  company: 'Please enter your company name.',
  email: 'Please enter a valid email address.',
  phone: 'Please enter a valid phone number.',
  website: 'Please enter your website address.',
  service: 'Please choose what you would like to discuss.',
  project: 'Please give the project a little more detail.',
  details: 'Please check the details you provided.',
  contactMethod: 'Please choose how you would like to be contacted.',
  product: 'Please choose the product you are interested in.',
  message: 'Please check your message.'
};

const SUBMISSIONS = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { error: MESSAGES.method });
  }

  if (!isSameOrigin(req)) {
    return send(res, 403, { error: MESSAGES.origin });
  }

  if (!isJsonRequest(req)) {
    return send(res, 415, { error: MESSAGES.format });
  }

  if (isOversized(req)) {
    return send(res, 413, { error: MESSAGES.payload });
  }

  const payload = readJson(req);
  if (!payload) {
    return send(res, 400, { error: MESSAGES.unreadable });
  }

  if (!clientMaySubmit(req)) {
    return send(res, 429, { error: MESSAGES.rateLimited });
  }

  if (isHoneypotTripped(payload)) {
    return send(res, 200, { ok: true });
  }

  const submission = validate(payload);
  if (!submission.valid) {
    return send(res, 400, { error: MESSAGES.fields, fields: submission.fields });
  }

  const recipient = readConfig('CONTACT_TO_EMAIL');
  const sender = readConfig('CONTACT_FROM_EMAIL');
  const apiKey = readConfig('RESEND_API_KEY');

  if (!recipient || !sender || !apiKey) {
    return send(res, 500, { error: MESSAGES.unconfigured });
  }

  const delivered = await deliver({
    apiKey,
    recipient,
    sender,
    submission
  });

  if (!delivered) {
    return send(res, 502, { error: MESSAGES.undeliverable });
  }

  return send(res, 200, { ok: true });
}

async function deliver({ apiKey, recipient, sender, submission }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: sender,
        to: [recipient],
        reply_to: submission.email,
        subject: `[Enmero] ${ENQUIRY_TYPE_LABELS[submission.type]} from ${submission.fullName}`,
        text: submission.text,
        html: submission.html
      }),
      signal: controller.signal
    });

    // The provider's own error body is never returned or logged, so Resend
    // details and the API key cannot leak through a response.
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

function validate(payload) {
  const fields = {};
  const source = typeof payload.source === 'string' ? payload.source : '';

  if (!ENQUIRY_SOURCES.includes(source)) {
    fields.source = MESSAGES.fields;
    return { valid: false, fields };
  }

  const values = {};
  for (const [field, limit] of Object.entries(FIELD_LIMITS)) {
    values[field] = readField(payload, field, limit);
  }

  const required = source === 'demo' ? DEMO_REQUIRED_FIELDS : CONTACT_REQUIRED_FIELDS;
  for (const field of required) {
    if (!values[field]) {
      fields[field] = FIELD_MESSAGES[field];
    }
  }

  if (!fields.email && !EMAIL_PATTERN.test(values.email)) {
    fields.email = FIELD_MESSAGES.email;
  }

  if (!fields.phone && source !== 'demo') {
    const digits = values.phone.replace(/\D/g, '');
    if (!PHONE_PATTERN.test(values.phone) || digits.length < PHONE_DIGIT_COUNT) {
      fields.phone = FIELD_MESSAGES.phone;
    }
  }

  if (!fields.website && values.website && /\s/.test(values.website)) {
    fields.website = FIELD_MESSAGES.website;
  }

  if (!fields.contactMethod && values.contactMethod && !CONTACT_METHODS.includes(values.contactMethod)) {
    fields.contactMethod = FIELD_MESSAGES.contactMethod;
  }

  let type = null;
  if (source === 'demo') {
    if (!DEMO_PRODUCTS.includes(values.product)) {
      fields.product = FIELD_MESSAGES.product;
    } else {
      type = 'demo';
    }
  } else if (values.service === GENERAL_ENQUIRY_OPTION) {
    type = 'general';
  } else if (!fields.service) {
    if (!SERVICE_OPTIONS.includes(values.service)) {
      fields.service = FIELD_MESSAGES.service;
    } else {
      type = 'service';
    }
  }

  if (Object.keys(fields).length > 0) {
    return { valid: false, fields };
  }

  return { valid: true, ...buildSubmission(source, type, values) };
}

function buildSubmission(source, type, values) {
  const lines = [
    `Type: ${ENQUIRY_TYPE_LABELS[type]}`,
    `Form: ${source === 'demo' ? 'Watchtower demo request' : 'Contact form'}`,
    '',
    `Name: ${values.fullName}`,
    `Company: ${values.company}`,
    `Email: ${values.email}`
  ];

  if (type === 'demo') {
    lines.push(`Product: ${values.product}`);
  }

  if (type === 'service') {
    lines.push(`Service: ${values.service}`);
  }

  const optional = [];
  if (values.phone) optional.push(['Phone', values.phone]);
  if (values.website) optional.push(['Website', values.website]);
  if (values.contactMethod) optional.push(['Preferred contact', values.contactMethod]);

  if (optional.length > 0) {
    lines.push('', ...optional.map(([label, value]) => `${label}: ${value}`));
  }

  const body = type === 'demo'
    ? values.message || 'No additional message.'
    : [values.project, values.details].filter(Boolean).join('\n\n') || 'No additional message.';

  lines.push('', 'Message:', body, '', `Submitted: ${formatTimestamp()}`);

  return {
    type,
    fullName: values.fullName,
    company: values.company,
    email: values.email,
    phone: values.phone,
    website: values.website,
    service: values.service,
    product: values.product,
    contactMethod: values.contactMethod,
    project: values.project,
    details: values.details,
    message: values.message,
    text: lines.join('\n'),
    html: buildHtml(ENQUIRY_TYPE_LABELS[type], lines.slice(3))
  };
}

function buildHtml(typeLabel, lines) {
  const body = lines
    .map((line) => {
      if (line === '') return '<div style="height:16px"></div>';
      if (line === 'Message:') return '<p style="margin:0 0 8px;color:#0B0D1A;font-weight:600">Message</p>';
      const separator = line.indexOf(': ');
      if (separator === -1) return `<p style="margin:0">${escapeHtml(line)}</p>`;
      const label = escapeHtml(line.slice(0, separator));
      const value = escapeHtml(line.slice(separator + 2)).replace(/\n/g, '<br />');
      return `<p style="margin:0"><span style="color:#5A6070">${label}:</span> ${value}</p>`;
    })
    .join('');

  return [
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#0B0D1A">',
    `<p style="margin:0 0 4px;color:#5A6070">New website enquiry</p>`,
    `<h1 style="margin:0 0 20px;font-size:20px">${escapeHtml(typeLabel)}</h1>`,
    body,
    '</div>'
  ].join('');
}

function isHoneypotTripped(payload) {
  const value = payload[HONEYPOT_FIELD];
  return typeof value === 'string' && value.trim() !== '';
}

function clientMaySubmit(req) {
  const key = clientKey(req);
  if (!key) {
    return true;
  }

  const now = Date.now();
  const recent = (SUBMISSIONS.get(key) || []).filter((time) => now - time < RATE_LIMIT.windowMs);

  if (recent.length >= RATE_LIMIT.max) {
    SUBMISSIONS.set(key, recent);
    return false;
  }

  recent.push(now);
  SUBMISSIONS.set(key, recent);
  pruneSubmissions(now);
  return true;
}

function pruneSubmissions(now) {
  if (SUBMISSIONS.size <= RATE_LIMIT.maxEntries) {
    return;
  }

  for (const [key, times] of SUBMISSIONS) {
    if (times.every((time) => now - time >= RATE_LIMIT.windowMs)) {
      SUBMISSIONS.delete(key);
    }
  }
}

function clientKey(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const address = (typeof forwarded === 'string' ? forwarded.split(',')[0] : '').trim();
  if (address) {
    return address;
  }
  const real = req.headers['x-real-ip'];
  return typeof real === 'string' ? real.trim() : '';
}

function isSameOrigin(req) {
  const origin = req.headers.origin;
  if (typeof origin !== 'string' || origin === '' || origin === 'null') {
    return true;
  }

  const host = forwardedHost(req);
  if (!host) {
    return false;
  }

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function forwardedHost(req) {
  const forwarded = req.headers['x-forwarded-host'];
  if (typeof forwarded === 'string' && forwarded !== '') {
    return forwarded.split(',')[0].trim();
  }
  const host = req.headers.host;
  return typeof host === 'string' ? host.trim() : '';
}

function isJsonRequest(req) {
  const type = req.headers['content-type'];
  return typeof type === 'string' && type.split(';')[0].trim().toLowerCase() === 'application/json';
}

function isOversized(req) {
  const declared = Number(req.headers['content-length']);
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return true;
  }
  return typeof req.body === 'string' && Buffer.byteLength(req.body, 'utf8') > MAX_BODY_BYTES;
}

function readJson(req) {
  if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
    return req.body;
  }
  if (typeof req.body === 'string' && req.body !== '') {
    try {
      const parsed = JSON.parse(req.body);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
  return null;
}

function readField(payload, field, limit) {
  const value = payload[field];
  if (typeof value !== 'string') {
    return '';
  }
  // Line breaks are kept so a multi-line message reads properly. The remaining
  // control characters are dropped, and anything past the limit is cut rather
  // than rejected, so long input is still delivered.
  const cleaned = value
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return cleaned.slice(0, limit);
}

function readConfig(name) {
  const value = process.env[name];
  return typeof value === 'string' ? value.trim() : '';
}

function formatTimestamp() {
  return `${new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC`;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function send(res, status, body) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(status).json(body);
}
