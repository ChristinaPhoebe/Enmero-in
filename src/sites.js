// One Vercel project serves every domain Enmero owns, so the hostname is what
// decides which application renders. There is no shared prefix, no /product
// route, and no link to follow first: the address a visitor arrives on is the
// site they get.
//
// Adding a product is one entry in SITES plus one line in SITE_ROOTS in
// main.jsx. Nothing else in the codebase needs to know a new host exists.

export const DEFAULT_SITE = 'enmero';

export const SITES = [
  {
    id: 'enmero',
    label: 'Enmero',
    // The apex is configured to redirect to www, so both are the website.
    domains: ['enmero.in', 'www.enmero.in'],
    localDomains: ['localhost', '127.0.0.1', '::1']
  },
  {
    id: 'watchtower',
    label: 'Watch Tower',
    domains: ['watchtower.enmero.in'],
    // Browsers send any *.localhost name to the loopback address on their own,
    // so the product can be developed on its own hostname with no hosts file
    // entry and no dependency on the production domain.
    localDomains: ['watchtower.localhost']
  }
];

// Public URLs only. Anything VITE_ prefixed is baked into the client bundle and
// is readable by anyone, which is fine here because these are addresses a
// visitor already has in the address bar. They live here so a cross-domain
// link is never written by hand in a component.
const env = import.meta.env || {};

const SITE_URLS = {
  enmero: env.VITE_ENMERO_URL || 'https://enmero.in',
  watchtower: env.VITE_WATCHTOWER_URL || 'https://watchtower.enmero.in'
};

export const ENMERO_URL = SITE_URLS.enmero;
export const WATCHTOWER_URL = SITE_URLS.watchtower;

// Builds a link to a page on the website, which is reached by hash route. The
// address is trimmed first so the result is right whether or not the
// configured value was written with a trailing slash.
export function enmeroPage(path) {
  const base = ENMERO_URL.replace(/\/+$/, '');
  const route = String(path).replace(/^#?\/?/, '/');
  return `${base}/#${route}`;
}

// window.location.hostname never carries a port, but a host read from
// elsewhere might, and the unit tests pass bare values. IPv6 literals are
// bracketed in a Host header and are not given a port.
function normaliseHost(hostname) {
  if (typeof hostname !== 'string') return '';

  const host = hostname.trim().toLowerCase();
  if (!host) return '';

  if (host.startsWith('[')) {
    const end = host.indexOf(']');
    return end === -1 ? '' : host.slice(1, end);
  }

  const bare = host.split(':').length - 1 > 1 ? host : host.replace(/:\d+$/, '');
  return bare.replace(/\.$/, '');
}

export function getSiteFromHostname(hostname) {
  const host = normaliseHost(hostname);
  if (!host) return DEFAULT_SITE;

  const site = SITES.find(
    (candidate) => candidate.domains.includes(host) || candidate.localDomains.includes(host)
  );

  // An unrecognised host, including a preview or development one, is the
  // website rather than a product. Guessing a product would serve the wrong
  // site to a visitor.
  return site ? site.id : DEFAULT_SITE;
}
