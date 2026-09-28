// The canonical product list. These are Enmero's own products, each with its
// own domain, so they are listed separately from SERVICES and never routed
// through this site.
//
// The navbar turns this list into a dropdown and the footer renders it as
// plain links, so a product is only added here.
import watchtowerSymbol from '../../assets/logo/watchtower-symbol.png';
import { WATCHTOWER_URL } from '../sites.js';

export const PRODUCTS = [
  {
    id: 'watch-tower',
    name: 'Watch Tower',
    // The address lives in sites.js so a cross domain link is never written
    // by hand in a component.
    url: WATCHTOWER_URL,
    // The symbol rather than the wordmark. The row already carries the name in
    // text, so the mark only has to identify the product at a glance, and the
    // portrait symbol stays legible at a fraction of the width the wordmark
    // needs. Dark artwork, so it is only used on the light navbar dropdown.
    logo: watchtowerSymbol,
  },
  {
    id: 'stanrig',
    name: 'Stanrig',
    url: 'https://stanrig.com',
    // No official Stanrig asset yet, so the link stays text only.
  },
];
