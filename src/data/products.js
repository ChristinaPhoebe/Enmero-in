// The canonical product list. These are Enmero's own products, each with its
// own domain, so they are listed separately from SERVICES and never routed
// through this site.
//
// The navbar turns this list into a dropdown and the footer renders it as
// plain links, so a product is only added here.
import watchtowerLogo from '../../assets/logo/watchtower-logo.png';
import { WATCHTOWER_URL } from '../sites.js';

export const PRODUCTS = [
  {
    id: 'watch-tower',
    name: 'Watch Tower',
    // The address lives in sites.js so a cross domain link is never written
    // by hand in a component.
    url: WATCHTOWER_URL,
    // Dark artwork, so it is only used on the light navbar dropdown.
    logo: watchtowerLogo,
  },
  {
    id: 'stanrig',
    name: 'Stanrig',
    url: 'https://stanrig.com',
    // No official Stanrig asset yet, so the link stays text only.
  },
];
