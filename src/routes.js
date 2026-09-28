import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import TermsAndConditions from './pages/TermsAndConditions.jsx';
import RefundCancellation from './pages/RefundCancellation.jsx';
import CookiePolicy from './pages/CookiePolicy.jsx';
import Disclaimer from './pages/Disclaimer.jsx';
import Services from './pages/Services.jsx';
import ServiceDetail from './pages/ServiceDetail.jsx';
import Contact from './pages/Contact.jsx';
import DemoContact from './pages/DemoContact.jsx';
import Blog from './pages/Blog.jsx';
import BlogDetail from './pages/BlogDetail.jsx';
import { SERVICES, servicePath } from './data/services.js';
import { BLOG_ARTICLES, articlePath } from './data/blog.js';

export const LEGAL_PAGES = [
  { path: '/privacy-policy', label: 'Privacy Policy', Component: PrivacyPolicy, legal: true },
  { path: '/terms-and-conditions', label: 'Terms & Conditions', Component: TermsAndConditions, legal: true },
  { path: '/refund-cancellation', label: 'Refund & Cancellation Policy', Component: RefundCancellation, legal: true },
  { path: '/cookie-policy', label: 'Cookie Policy', Component: CookiePolicy, legal: true },
  { path: '/disclaimer', label: 'Disclaimer', Component: Disclaimer, legal: true },
];

// One route per service. The path comes from the service list so a service can
// never appear in the navigation without a page behind it.
export const SERVICE_PAGES = SERVICES.map((service) => ({
  path: servicePath(service.id),
  label: service.name,
  Component: ServiceDetail,
  serviceId: service.id
}));

// One route per blog article.
export const BLOG_PAGES = BLOG_ARTICLES.map((article) => ({
  path: articlePath(article.id),
  label: article.title,
  Component: BlogDetail,
  articleId: article.id
}));

export const STATIC_PAGES = [
  // Watch Tower is deliberately absent. It is a product with its own domain
  // and is reached by hostname, never as a page of this site.
  { path: '/services', label: 'Services', Component: Services },
  ...SERVICE_PAGES,
  { path: '/blog', label: 'Blog', Component: Blog },
  ...BLOG_PAGES,
  { path: '/contact', label: 'Contact', Component: Contact },
  { path: '/demo', label: 'Request a Demo', Component: DemoContact },
  ...LEGAL_PAGES,
];

export function getStaticPage(hash) {
  if (typeof hash !== 'string' || !hash.startsWith('#/')) return null;

  const [path, query] = hash.slice(1).split('?');
  const page = STATIC_PAGES.find((candidate) => candidate.path === path);
  if (!page) return null;

  return { ...page, params: new URLSearchParams(query || '') };
}
