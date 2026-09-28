import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  DEFAULT_SITE,
  ENMERO_URL,
  SITES,
  WATCHTOWER_URL,
  enmeroPage,
  getSiteFromHostname
} from '../src/sites.js';

describe('getSiteFromHostname', () => {
  test('serves the website on its own domains', () => {
    assert.equal(getSiteFromHostname('enmero.in'), 'enmero');
    assert.equal(getSiteFromHostname('www.enmero.in'), 'enmero');
  });

  test('serves the product on its own domain', () => {
    assert.equal(getSiteFromHostname('watchtower.enmero.in'), 'watchtower');
  });

  test('serves the product on its local hostname', () => {
    assert.equal(getSiteFromHostname('watchtower.localhost'), 'watchtower');
  });

  test('serves the website in local development', () => {
    assert.equal(getSiteFromHostname('localhost'), 'enmero');
    assert.equal(getSiteFromHostname('127.0.0.1'), 'enmero');
    assert.equal(getSiteFromHostname('::1'), 'enmero');
  });

  test('ignores case, a trailing port, and a trailing dot', () => {
    assert.equal(getSiteFromHostname('WatchTower.EnMero.in'), 'watchtower');
    assert.equal(getSiteFromHostname('watchtower.enmero.in:443'), 'watchtower');
    assert.equal(getSiteFromHostname('watchtower.enmero.in.'), 'watchtower');
    assert.equal(getSiteFromHostname('watchtower.localhost:3000'), 'watchtower');
  });

  test('handles a bracketed IPv6 literal without reading it as a port', () => {
    assert.equal(getSiteFromHostname('[::1]'), 'enmero');
  });

  test('falls back to the website for anything it does not recognise', () => {
    for (const host of ['', '   ', 'enmero-uat.vercel.app', 'stanrig.com', 'notenmero.in', 'watchtower.enmero.co']) {
      assert.equal(getSiteFromHostname(host), DEFAULT_SITE, `expected ${JSON.stringify(host)} to fall back`);
    }
  });

  test('falls back to the website when the hostname is missing', () => {
    assert.equal(getSiteFromHostname(undefined), DEFAULT_SITE);
    assert.equal(getSiteFromHostname(null), DEFAULT_SITE);
    assert.equal(getSiteFromHostname(42), DEFAULT_SITE);
  });
});

describe('site registry', () => {
  test('gives every site an id, a label, and a set of hosts', () => {
    for (const site of SITES) {
      assert.equal(typeof site.id, 'string');
      assert.equal(typeof site.label, 'string');
      assert.ok(site.domains.length > 0, `${site.id} has no domain`);
    }
  });

  test('never assigns one host to two sites', () => {
    const seen = new Map();
    for (const site of SITES) {
      for (const host of [...site.domains, ...site.localDomains]) {
        assert.equal(seen.has(host), false, `${host} is claimed by both ${seen.get(host)} and ${site.id}`);
        seen.set(host, site.id);
      }
    }
  });

  test('resolves every host it registers', () => {
    for (const site of SITES) {
      for (const host of [...site.domains, ...site.localDomains]) {
        assert.equal(getSiteFromHostname(host), site.id, `${host} does not resolve to ${site.id}`);
      }
    }
  });
});

describe('site urls', () => {
  test('defaults to the production domains', () => {
    assert.equal(ENMERO_URL, 'https://enmero.in');
    assert.equal(WATCHTOWER_URL, 'https://watchtower.enmero.in');
  });

  test('produces absolute links to the website pages', () => {
    assert.equal(enmeroPage('/demo'), 'https://enmero.in/#/demo');
    assert.equal(enmeroPage('/contact'), 'https://enmero.in/#/contact');
    assert.equal(enmeroPage('demo'), 'https://enmero.in/#/demo');
    assert.equal(enmeroPage('/privacy-policy'), 'https://enmero.in/#/privacy-policy');
  });
});
