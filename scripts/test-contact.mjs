import assert from 'node:assert/strict';
import { after, beforeEach, describe, test } from 'node:test';

import handler from '../api/contact.js';

const API_KEY = 're_test_key_not_a_real_key';
const TO_EMAIL = 'enquiries@enmero.in';
const FROM_EMAIL = 'website@enmero.in';

const realFetch = globalThis.fetch;

// Each request gets its own address so the function's per address rate limit
// never interferes with an unrelated assertion. The rate limit test below passes
// a fixed address of its own.
let addresses = 0;

// A fake Vercel request.
function request(overrides = {}) {
  const { headers, ...rest } = overrides;

  return {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      origin: 'https://enmero.in',
      host: 'enmero.in',
      'x-forwarded-for': `10.0.0.${(addresses += 1)}`,
      ...headers
    },
    body: {},
    ...rest
  };
}

// A fake Vercel response, recording what the function did.
function response() {
  return {
    statusCode: null,
    body: null,
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
}

// Captures the request the function makes to Resend. No network call is made and
// no real key is needed, so these tests run anywhere.
function stubResend({ ok = true } = {}) {
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init, sent: JSON.parse(init.body) });
    return {
      ok,
      status: ok ? 200 : 422,
      json: async () => ({ message: 'provider rejected the request', name: 'validation_error' })
    };
  };
  return calls;
}

function validContact(overrides = {}) {
  return {
    source: 'contact',
    fullName: 'Asha Menon',
    company: 'Northwind Traders',
    email: 'asha@northwind.example',
    phone: '+91 98765 43210',
    website: 'https://northwind.example',
    service: 'App Development',
    project: 'We need a customer portal for our service business.',
    contactMethod: 'Email',
    details: 'Budget is approved for the next quarter.',
    ...overrides
  };
}

function validDemo(overrides = {}) {
  return {
    source: 'demo',
    product: 'Watchtower',
    fullName: 'Ravi Kumar',
    company: 'Coastal Labs',
    email: 'ravi@coastal.example',
    website: 'https://coastal.example',
    message: 'We want to see the protection layer on our marketing site.',
    ...overrides
  };
}

beforeEach(() => {
  process.env.RESEND_API_KEY = API_KEY;
  process.env.CONTACT_TO_EMAIL = TO_EMAIL;
  process.env.CONTACT_FROM_EMAIL = FROM_EMAIL;
});

after(() => {
  globalThis.fetch = realFetch;
});

describe('delivered enquiry types', () => {
  test('a named service is reported as a Service Enquiry', async () => {
    const calls = stubResend();
    const res = response();

    await handler(request({ body: validContact() }), res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { ok: true });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://api.resend.com/emails');
    assert.match(calls[0].sent.text, /Type: Service Enquiry/);
    assert.match(calls[0].sent.text, /Service: App Development/);
    assert.match(calls[0].sent.subject, /Service Enquiry from Asha Menon/);
  });

  test('the catch-all choice is reported as a General Contact', async () => {
    const calls = stubResend();
    const res = response();

    await handler(request({ body: validContact({ service: 'Something else' }) }), res);

    assert.equal(res.statusCode, 200);
    assert.match(calls[0].sent.text, /Type: General Contact/);
    assert.doesNotMatch(calls[0].sent.text, /Service:/);
  });

  test('a demo request is reported as a Demo Request for Watchtower', async () => {
    const calls = stubResend();
    const res = response();

    await handler(request({ body: validDemo() }), res);

    assert.equal(res.statusCode, 200);
    assert.match(calls[0].sent.text, /Type: Demo Request/);
    assert.match(calls[0].sent.text, /Product: Watchtower/);
    assert.match(calls[0].sent.text, /Form: Watchtower demo request/);
  });

  test('the reply address is the sender, the recipient is never taken from the request', async () => {
    const calls = stubResend();
    const res = response();

    await handler(
      request({
        body: validContact({ to: 'attacker@evil.example', recipient: 'attacker@evil.example' })
      }),
      res
    );

    assert.equal(res.statusCode, 200);
    assert.deepEqual(calls[0].sent.to, [TO_EMAIL]);
    assert.equal(calls[0].sent.from, FROM_EMAIL);
    assert.equal(calls[0].sent.reply_to, 'asha@northwind.example');
  });

  // The published inbox and the configured destination must stay the same place,
  // so a visitor who emails directly and a visitor who uses a form both reach
  // one inbox. This pins the value in .env.example.
  test('enquiries go only to the published inbox, whatever the request asks for', async () => {
    process.env.CONTACT_TO_EMAIL = 'vorsped04@gmail.com';
    const calls = stubResend();

    for (const body of [
      validContact(),
      validContact({ service: 'Something else' }),
      validContact({ to: 'contact@enmero.in', cc: 'contact@enmero.in', bcc: 'contact@enmero.in' }),
      validDemo()
    ]) {
      const res = response();
      await handler(request({ body }), res);
      assert.equal(res.statusCode, 200);
    }

    assert.equal(calls.length, 4);
    for (const call of calls) {
      assert.deepEqual(call.sent.to, ['vorsped04@gmail.com']);
      // The old inbox must not survive anywhere in the outbound message.
      assert.equal(JSON.stringify(call.sent).includes('contact@enmero.in'), false);
    }
  });

  test('the API key is only sent to Resend and never returned', async () => {
    const calls = stubResend();
    const res = response();

    await handler(request({ body: validContact() }), res);

    assert.equal(calls[0].init.headers.Authorization, `Bearer ${API_KEY}`);
    assert.equal(JSON.stringify(res.body).includes(API_KEY), false);
  });
});

describe('the form type cannot be forged', () => {
  test('a request without a known source is rejected', async () => {
    const calls = stubResend();
    const res = response();

    const { source, ...withoutSource } = validContact();
    await handler(request({ body: withoutSource }), res);

    assert.equal(res.statusCode, 400);
    assert.ok(res.body.fields.source);
    assert.equal(calls.length, 0);
  });

  test('an unknown source is rejected', async () => {
    const calls = stubResend();
    const res = response();

    await handler(request({ body: validContact({ source: 'admin' }) }), res);

    assert.equal(res.statusCode, 400);
    assert.equal(calls.length, 0);
  });

  test('a claimed type is ignored in favour of the derived type', async () => {
    const calls = stubResend();
    const res = response();

    await handler(
      request({ body: validContact({ type: 'service', service: 'Something else' }) }),
      res
    );

    assert.equal(res.statusCode, 200);
    assert.match(calls[0].sent.text, /Type: General Contact/);
  });

  test('a service outside the published list is rejected', async () => {
    const calls = stubResend();
    const res = response();

    await handler(request({ body: validContact({ service: 'Discount SEO' }) }), res);

    assert.equal(res.statusCode, 400);
    assert.ok(res.body.fields.service);
    assert.equal(calls.length, 0);
  });

  test('a demo product outside the published list is rejected', async () => {
    const calls = stubResend();
    const res = response();

    await handler(request({ body: validDemo({ product: 'Something else' }) }), res);

    assert.equal(res.statusCode, 400);
    assert.ok(res.body.fields.product);
    assert.equal(calls.length, 0);
  });

  test('a demo request cannot claim a service enquiry', async () => {
    const calls = stubResend();
    const res = response();

    await handler(request({ body: validDemo({ service: 'App Development' }) }), res);

    assert.equal(res.statusCode, 200);
    assert.match(calls[0].sent.text, /Type: Demo Request/);
    assert.doesNotMatch(calls[0].sent.text, /Service:/);
  });

  test('an unknown preferred contact method is rejected', async () => {
    const calls = stubResend();
    const res = response();

    await handler(request({ body: validContact({ contactMethod: 'Carrier pigeon' }) }), res);

    assert.equal(res.statusCode, 400);
    assert.ok(res.body.fields.contactMethod);
    assert.equal(calls.length, 0);
  });
});

describe('required fields and formats', () => {
  test('missing required contact fields are named back to the form', async () => {
    const calls = stubResend();
    const res = response();

    await handler(request({ body: { source: 'contact' } }), res);

    assert.equal(res.statusCode, 400);
    for (const field of ['fullName', 'company', 'email', 'phone', 'service', 'project']) {
      assert.ok(res.body.fields[field], `expected an error for ${field}`);
    }
    assert.equal(calls.length, 0);
  });

  test('a demo request requires a website', async () => {
    const calls = stubResend();
    const res = response();

    await handler(request({ body: validDemo({ website: '' }) }), res);

    assert.equal(res.statusCode, 400);
    assert.ok(res.body.fields.website);
    assert.equal(calls.length, 0);
  });

  test('a demo request does not require the contact only fields', async () => {
    const calls = stubResend();
    const res = response();

    await handler(request({ body: validDemo({ phone: '', project: '' }) }), res);

    assert.equal(res.statusCode, 200);
    assert.equal(calls.length, 1);
  });

  test('an address that is not an email is rejected', async () => {
    const calls = stubResend();
    const res = response();

    await handler(request({ body: validContact({ email: 'asha@' }) }), res);

    assert.equal(res.statusCode, 400);
    assert.ok(res.body.fields.email);
    assert.equal(calls.length, 0);
  });

  test('a phone number with no digits is rejected', async () => {
    const calls = stubResend();
    const res = response();

    await handler(request({ body: validContact({ phone: 'not a number' }) }), res);

    assert.equal(res.statusCode, 400);
    assert.ok(res.body.fields.phone);
    assert.equal(calls.length, 0);
  });

  test('an optional website with a space in it is rejected', async () => {
    const calls = stubResend();
    const res = response();

    await handler(request({ body: validContact({ website: 'northwind example' }) }), res);

    assert.equal(res.statusCode, 400);
    assert.ok(res.body.fields.website);
    assert.equal(calls.length, 0);
  });

  test('a field sent as an object is treated as empty rather than trusted', async () => {
    const calls = stubResend();
    const res = response();

    await handler(request({ body: validContact({ fullName: { toString: () => 'Asha' } }) }), res);

    assert.equal(res.statusCode, 400);
    assert.ok(res.body.fields.fullName);
    assert.equal(calls.length, 0);
  });
});

describe('spam controls', () => {
  test('a filled honeypot is accepted silently without sending anything', async () => {
    const calls = stubResend();
    const res = response();

    await handler(request({ body: validContact({ fax_number: '+1 555 000 1234' }) }), res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { ok: true });
    assert.equal(calls.length, 0);
  });

  test('an empty honeypot still sends', async () => {
    const calls = stubResend();
    const res = response();

    await handler(request({ body: validContact({ fax_number: '   ' }) }), res);

    assert.equal(res.statusCode, 200);
    assert.equal(calls.length, 1);
  });

  test('too many submissions from one address are refused', async () => {
    const calls = stubResend();
    const headers = { 'x-forwarded-for': '203.0.113.99' };

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const res = response();
      await handler(request({ headers: { ...headers }, body: validContact() }), res);
      assert.equal(res.statusCode, 200, `attempt ${attempt + 1} should be accepted`);
    }

    const blocked = response();
    await handler(request({ headers: { ...headers }, body: validContact() }), blocked);

    assert.equal(blocked.statusCode, 429);
    assert.equal(calls.length, 5);
  });
});

describe('request shape', () => {
  test('anything other than POST is refused', async () => {
    const calls = stubResend();
    const res = response();

    await handler(request({ method: 'GET', body: undefined }), res);

    assert.equal(res.statusCode, 405);
    assert.equal(res.headers.Allow, 'POST');
    assert.equal(calls.length, 0);
  });

  test('a cross origin submission is refused', async () => {
    const calls = stubResend();
    const res = response();

    await handler(
      request({
        body: validContact(),
        headers: { origin: 'https://evil.example', host: 'enmero.in' }
      }),
      res
    );

    assert.equal(res.statusCode, 403);
    assert.equal(calls.length, 0);
  });

  test('the same origin on a preview deployment is allowed', async () => {
    const calls = stubResend();
    const res = response();

    await handler(
      request({
        body: validContact(),
        headers: {
          origin: 'https://enmero-git-main.vercel.app',
          'x-forwarded-host': 'enmero-git-main.vercel.app',
          host: 'enmero-git-main.vercel.app'
        }
      }),
      res
    );

    assert.equal(res.statusCode, 200);
    assert.equal(calls.length, 1);
  });

  test('a non JSON submission is refused', async () => {
    const calls = stubResend();
    const res = response();

    await handler(
      request({ headers: { 'content-type': 'application/x-www-form-urlencoded' } }),
      res
    );

    assert.equal(res.statusCode, 415);
    assert.equal(calls.length, 0);
  });

  test('malformed JSON is refused', async () => {
    const calls = stubResend();
    const res = response();

    await handler(request({ body: '{"source":"contact",' }), res);

    assert.equal(res.statusCode, 400);
    assert.equal(calls.length, 0);
  });

  test('a JSON array is not treated as a submission', async () => {
    const calls = stubResend();
    const res = response();

    await handler(request({ body: [validContact()] }), res);

    assert.equal(res.statusCode, 400);
    assert.equal(calls.length, 0);
  });

  test('an oversized submission is refused before it is read', async () => {
    const calls = stubResend();
    const res = response();

    await handler(
      request({ headers: { 'content-length': String(64 * 1024) } }),
      res
    );

    assert.equal(res.statusCode, 413);
    assert.equal(calls.length, 0);
  });

  test('an oversized JSON body string is refused', async () => {
    const calls = stubResend();
    const res = response();

    await handler(request({ body: JSON.stringify({ pad: 'a'.repeat(64 * 1024) }) }), res);

    assert.equal(res.statusCode, 413);
    assert.equal(calls.length, 0);
  });

  test('a large but permitted message is delivered, trimmed to the limit', async () => {
    const calls = stubResend();
    const res = response();

    await handler(request({ body: validContact({ project: 'x'.repeat(9000) }) }), res);

    assert.equal(res.statusCode, 200);
    assert.ok(calls[0].sent.text.length < 12000);
  });
});

describe('message content', () => {
  test('markup in a field is escaped in the HTML part', async () => {
    const calls = stubResend();
    const res = response();

    await handler(
      request({ body: validContact({ project: '<script>alert(1)</script>' }) }),
      res
    );

    assert.equal(res.statusCode, 200);
    assert.doesNotMatch(calls[0].sent.html, /<script>/);
    assert.match(calls[0].sent.html, /&lt;script&gt;/);
  });

  test('a quote in a field cannot break out of an HTML attribute', async () => {
    const calls = stubResend();
    const res = response();

    await handler(request({ body: validContact({ fullName: 'A" onmouseover="x' }) }), res);

    assert.equal(res.statusCode, 200);
    assert.doesNotMatch(calls[0].sent.html, /onmouseover="x/);
    assert.match(calls[0].sent.html, /&quot;/);
  });

  test('the same content is present in the plain text part', async () => {
    const calls = stubResend();
    const res = response();

    await handler(request({ body: validContact() }), res);

    assert.match(calls[0].sent.text, /Name: Asha Menon/);
    assert.match(calls[0].sent.text, /Company: Northwind Traders/);
    assert.match(calls[0].sent.text, /customer portal/);
    assert.match(calls[0].sent.text, /Submitted: \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} UTC/);
  });

  test('an empty long form field falls back to a clear line', async () => {
    const calls = stubResend();
    const res = response();

    await handler(request({ body: validDemo({ message: '' }) }), res);

    assert.equal(res.statusCode, 200);
    assert.match(calls[0].sent.text, /No additional message\./);
  });

  test('browser and technical details are not collected', async () => {
    const calls = stubResend();
    const res = response();

    await handler(
      request({
        body: validContact({
          userAgent: 'Mozilla/5.0',
          ip: '203.0.113.1',
          referer: 'https://enmero.in/contact',
          path: '/api/contact'
        })
      }),
      res
    );

    assert.equal(res.statusCode, 200);
    for (const leak of ['Mozilla', '203.0.113.1', 'referer', 'api/contact']) {
      assert.equal(calls[0].sent.text.includes(leak), false, `text should not contain ${leak}`);
    }
  });
});

describe('delivery configuration and failures', () => {
  test('a missing API key is reported without sending', async () => {
    const calls = stubResend();
    delete process.env.RESEND_API_KEY;
    const res = response();

    await handler(request({ body: validContact() }), res);

    assert.equal(res.statusCode, 500);
    assert.equal(calls.length, 0);
    delete process.env.RESEND_API_KEY;
  });

  test('a missing recipient is reported without sending', async () => {
    const calls = stubResend();
    delete process.env.CONTACT_TO_EMAIL;
    const res = response();

    await handler(request({ body: validContact() }), res);

    assert.equal(res.statusCode, 500);
    assert.equal(calls.length, 0);
  });

  test('a missing sender is reported without sending', async () => {
    const calls = stubResend();
    delete process.env.CONTACT_FROM_EMAIL;
    const res = response();

    await handler(request({ body: validContact() }), res);

    assert.equal(res.statusCode, 500);
    assert.equal(calls.length, 0);
  });

  test('a rejected send is reported as a temporary failure', async () => {
    stubResend({ ok: false });
    const res = response();

    await handler(request({ body: validContact() }), res);

    assert.equal(res.statusCode, 502);
    assert.equal(res.body.ok, undefined);
  });

  test("the provider's own error text is never returned to the visitor", async () => {
    stubResend({ ok: false });
    const res = response();

    await handler(request({ body: validContact() }), res);

    assert.equal(JSON.stringify(res.body).includes('provider rejected'), false);
    assert.equal(JSON.stringify(res.body).includes('validation_error'), false);
  });

  test('a network failure is reported as a temporary failure', async () => {
    globalThis.fetch = async () => {
      throw new Error('connection reset');
    };
    const res = response();

    await handler(request({ body: validContact() }), res);

    assert.equal(res.statusCode, 502);
  });

  test('responses are not cached', async () => {
    const calls = stubResend();
    const res = response();

    await handler(request({ body: validContact() }), res);

    assert.equal(res.headers['Cache-Control'], 'no-store');
  });
});
