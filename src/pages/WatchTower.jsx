import React, { useEffect, useRef } from 'react';
import styles from './WatchTower.module.css';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import Globe from '../components/watchtower/Globe.jsx';
import watchtowerLogo from '../../assets/logo/watchtower-logo.png';
import { WATCHTOWER_URL, enmeroPage } from '../sites.js';

// The forms live on the Enmero website. The product has its own domain and no
// router of its own, so these are absolute links rather than hash routes.
const DEMO_URL = enmeroPage('/demo');
const CONTACT_URL = enmeroPage('/contact');

const TITLE = 'Watch Tower | Website protection layer | enmero';
const DESCRIPTION =
  'Watch Tower is an enmero product that sits between your website and its visitors. Incoming traffic is inspected, unwanted traffic is filtered, and clean requests are forwarded to your server.';

const REQUESTS = [
  { path: 'GET /pricing', state: 'allowed' },
  { path: 'POST /login', state: 'allowed' },
  { path: 'GET /.env', state: 'blocked' },
  { path: 'POST /wp-login.php', state: 'blocked' }
];

const FILTERS = ['Traffic protection', 'DDoS protection', 'Bot protection', 'WAF rules', 'Rate limiting', 'HTTPS'];

const REASONS = [
  {
    title: 'Inspected before your server',
    desc: 'Requests are evaluated at the Watch Tower layer, so unwanted traffic is filtered before it reaches your infrastructure.'
  },
  {
    title: 'No rebuild of your website',
    desc: 'Watch Tower sits in front of your existing site. There is no application rewrite and no change to how your site is built.'
  },
  {
    title: 'Real visitors see the same site',
    desc: 'Clean traffic is passed through. Visitors load the same pages, from the same server, in the same way they did before.'
  },
  {
    title: 'Abuse is limited early',
    desc: 'Excessive requests from a single source are capped at the protection layer, so traffic spikes do not reach your application.'
  },
  {
    title: 'Attack patterns are filtered',
    desc: 'Firewall rules inspect the content of each request and block common attack patterns before they are processed.'
  },
  {
    title: 'Automated traffic is separated',
    desc: 'Bot protection distinguishes normal visitors from automated traffic so unwanted activity does not consume your capacity.'
  }
];

const STEPS = [
  {
    label: 'Inspect',
    desc: 'The request is read at the Watch Tower layer. Method, path, headers, and request rate are read before anything reaches your server.'
  },
  {
    label: 'Evaluate',
    desc: 'Traffic protection, bot protection, and firewall rules are applied to the request to decide how it should be handled.'
  },
  {
    label: 'Filter',
    desc: 'Blocked requests stop at the protection layer. Traffic from a single source beyond the configured limit is reduced.'
  },
  {
    label: 'Forward',
    desc: 'Requests that pass are forwarded to your website over a secure HTTPS connection. Your application handles them normally.'
  }
];

const CAPABILITIES = [
  {
    label: 'layer-01',
    title: 'Traffic Protection',
    desc: 'Incoming traffic is inspected before reaching your website. Suspicious or unwanted requests are identified and filtered, so only legitimate visitors reach your server.'
  },
  {
    label: 'layer-02',
    title: 'DDoS Protection',
    desc: 'Traffic floods designed to overwhelm a website are absorbed and filtered at the protection layer so the site stays available for real visitors.'
  },
  {
    label: 'layer-03',
    title: 'Bot Protection',
    desc: 'Normal visitors are distinguished from automated or suspicious traffic, reducing unwanted bot activity without blocking legitimate users.'
  },
  {
    label: 'layer-04',
    title: 'Web Application Firewall',
    desc: 'Requests are checked against security rules before being passed to your website, which helps block common attack patterns and malicious input.'
  },
  {
    label: 'layer-05',
    title: 'Rate Limiting',
    desc: 'Excessive requests from a single source are limited to prevent abuse and unnecessary load, keeping the website stable during traffic spikes.'
  },
  {
    label: 'layer-06',
    title: 'HTTPS / Secure Traffic',
    desc: 'The protection layer sits in front of your website while maintaining secure HTTPS traffic. Visitors see the connection they expect.'
  }
];

// The globe section explains the same two outcomes as the request diagram below
// it, so both are labelled the same way rather than inventing a third term.
const ROUTES = [
  { state: 'forwarded', label: 'Forwarded to your website' },
  { state: 'stopped', label: 'Stopped at the protection layer' }
];

const READINGS = [
  {
    title: 'Read on arrival',
    desc: 'Method, path, headers, and request rate are read as the request arrives, before anything reaches your server.'
  },
  {
    title: 'Decided in one place',
    desc: 'Firewall rules, bot checks, and rate limits all run at the protection layer rather than inside your application.'
  },
  {
    title: 'Forwarded unchanged',
    desc: 'Traffic that passes is delivered to your website over HTTPS, in the same way it was before.'
  }
];

const ANCHORS = [
  { id: 'wt-overview', label: 'Overview' },
  { id: 'wt-globe', label: 'Traffic' },
  { id: 'wt-how-it-works', label: 'How it works' },
  { id: 'wt-capabilities', label: 'Capabilities' },
  { id: 'wt-request-demo', label: 'Request a demo' }
];

export default function WatchTower() {
  const rootRef = useRef(null);

  useEffect(() => {
    const previousTitle = document.title;
    const meta = document.querySelector('meta[name="description"]');
    const previousDescription = meta ? meta.getAttribute('content') : null;

    // One project serves several domains, so the product domain is declared the
    // one home for this content. Without it the same page is reachable under
    // every host the project answers on.
    const canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', `${WATCHTOWER_URL}/`);
    document.head.appendChild(canonical);

    document.title = TITLE;
    if (meta) meta.setAttribute('content', DESCRIPTION);

    return () => {
      document.title = previousTitle;
      if (meta && previousDescription !== null) meta.setAttribute('content', previousDescription);
      canonical.remove();
    };
  }, []);

  // Sections fade in as they enter the viewport, matching the restrained
  // entrance behaviour used across the reference composition.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const targets = Array.from(root.querySelectorAll('[data-reveal]'));
    if (targets.length === 0) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion.matches || typeof IntersectionObserver === 'undefined') {
      targets.forEach((node) => node.classList.add(styles.revealed));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add(styles.revealed);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
    );

    targets.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => (event) => {
    event.preventDefault();
    const target = rootRef.current && rootRef.current.querySelector(`#${id}`);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div ref={rootRef} className={styles.watchtower}>
      {/* Hero */}
      <section className={styles.hero} id="wt-overview">
        <div className={`${styles.container} container`}>
          <div className={styles.heroInner} data-reveal>
            <img src={watchtowerLogo} alt="Watch Tower" className={styles.heroMark} />
            <span className={styles.eyebrow}>enmero product</span>
            <h1 className={styles.heroTitle}>A protection layer in front of your website</h1>
            <p className={styles.heroSubtitle}>
              Watch Tower sits between your visitors and your server. Every request is inspected,
              unwanted traffic is filtered out, and legitimate visitors reach your site over a
              secure connection.
            </p>
            <div className={styles.heroCta}>
              <a href={DEMO_URL} className={styles.primaryBtn}>
                Request a Demo
                <ArrowUpRight size={15} aria-hidden="true" />
              </a>
              <button type="button" className={styles.secondaryBtn} onClick={scrollTo('wt-globe')}>
                How traffic is handled
              </button>
            </div>
            <nav className={styles.anchorNav} aria-label="Watch Tower sections">
              {ANCHORS.map((anchor) => (
                <button
                  key={anchor.id}
                  type="button"
                  className={styles.anchorLink}
                  onClick={scrollTo(anchor.id)}
                >
                  {anchor.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
        <div className={styles.heroRule} aria-hidden="true" />
      </section>

      {/* Inbound traffic. The globe is the product idea rather than a network
          claim: it shows where requests come from, not where Watch Tower runs. */}
      <section className={styles.globeSection} id="wt-globe" aria-labelledby="wt-globe-title">
        <div className={`${styles.container} container`}>
          <div className={styles.globeHead} data-reveal>
            <p className={styles.darkEyebrow}>Incoming traffic</p>
            <h2 className={styles.globeTitle} id="wt-globe-title">
              Every request is judged before your server is involved
            </h2>
            <p className={styles.globeLead}>
              A visitor can be on the other side of the world and the handling is identical. Each
              request is read as it arrives, and only the traffic that passes is forwarded to your
              website.
            </p>
          </div>

          <Globe />

          <ul className={styles.routeLegend} data-reveal>
            {ROUTES.map((route) => (
              <li
                key={route.state}
                className={route.state === 'forwarded' ? styles.routeForwarded : styles.routeStopped}
              >
                <span className={styles.routeSwatch} aria-hidden="true" />
                {route.label}
              </li>
            ))}
          </ul>

          <dl className={styles.readings} data-reveal>
            {READINGS.map((reading) => (
              <div key={reading.title} className={styles.reading}>
                <dt className={styles.readingTitle}>{reading.title}</dt>
                <dd className={styles.readingDesc}>{reading.desc}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Request flow */}
      <section className={styles.block} aria-labelledby="wt-flow-title">
        <div className={`${styles.container} container`}>
          <div className={styles.panel} data-reveal>
            <div className={styles.flow}>
              <div className={styles.flowNode}>
                <p className={styles.nodeLabel}>01 &nbsp;Incoming traffic</p>
                <h2 className={styles.nodeTitle} id="wt-flow-title">Every request arrives here first</h2>
                <ul className={styles.requestList}>
                  {REQUESTS.map((request) => (
                    <li
                      key={request.path}
                      className={request.state === 'allowed' ? styles.requestOk : styles.requestBlocked}
                    >
                      <span className={styles.requestPath}>{request.path}</span>
                      <span className={styles.requestVerdict}>
                        {request.state === 'allowed' ? 'pass' : 'blocked'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.flowLane} aria-hidden="true">
                <span className={`${styles.packet} ${styles.packetOk}`} />
                <span className={`${styles.packet} ${styles.packetBlocked}`} />
              </div>

              <div className={styles.tower}>
                <p className={styles.nodeLabel}>02 &nbsp;Watch Tower</p>
                <img src={watchtowerLogo} alt="" className={styles.towerMark} />
                <ul className={styles.filterList}>
                  {FILTERS.map((filter) => (
                    <li key={filter} className={styles.filterItem}>
                      <span className={styles.filterMark} aria-hidden="true" />
                      {filter}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`${styles.flowLane} ${styles.flowLaneSecond}`} aria-hidden="true">
                <span className={`${styles.packet} ${styles.packetOk}`} />
              </div>

              <div className={styles.flowNode}>
                <p className={styles.nodeLabel}>03 &nbsp;Your website</p>
                <h2 className={styles.nodeTitle}>Clean requests only</h2>
                <ul className={styles.requestList}>
                  <li className={styles.requestOk}>
                    <span className={styles.requestPath}>GET /pricing</span>
                    <span className={styles.requestVerdict}>delivered</span>
                  </li>
                  <li className={styles.requestOk}>
                    <span className={styles.requestPath}>POST /login</span>
                    <span className={styles.requestVerdict}>delivered</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className={styles.flowFooter}>
              <span className={styles.flowLegend}>
                <span className={`${styles.legendSwatch} ${styles.legendOk}`} aria-hidden="true" />
                Allowed
              </span>
              <span className={styles.flowLegend}>
                <span className={`${styles.legendSwatch} ${styles.legendBlocked}`} aria-hidden="true" />
                Stopped at the protection layer
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Statement */}
      <section className={styles.block}>
        <div className={`${styles.container} container`}>
          <div className={styles.statement} data-reveal>
            <h2 className={styles.statementTitle}>
              Inspection happens before your server is involved
            </h2>
            <p className={styles.statementLead}>
              Watch Tower evaluates traffic as it arrives rather than after it has already reached
              your infrastructure. Unwanted requests are handled at the protection layer, and only
              traffic that passes is forwarded to your website.
            </p>
          </div>
        </div>
      </section>

      {/* Why it matters */}
      <section className={styles.block}>
        <div className={`${styles.container} container`}>
          <div className={styles.panel} data-reveal>
            <div className={styles.cellGrid}>
              {REASONS.map((reason) => (
                <div key={reason.title} className={styles.cell}>
                  <h3 className={styles.cellTitle}>{reason.title}</h3>
                  <p className={styles.cellDesc}>{reason.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How a request is handled. Deep teal, with the four checks read as one
          continuous run rather than four separate cards. */}
      <section className={styles.tealSection} id="wt-how-it-works" aria-labelledby="wt-steps-title">
        <div className={`${styles.container} container`}>
          <div className={styles.tealHead} data-reveal>
            <p className={styles.darkEyebrow}>How a request is handled</p>
            <h2 className={styles.tealTitle} id="wt-steps-title">One request, four checks</h2>
            <p className={styles.tealLead}>
              The same sequence runs for every request that reaches the protection layer, whether
              it comes from a first-time visitor or from an automated script.
            </p>
          </div>

          <ol className={styles.steps}>
            {STEPS.map((step, index) => (
              <li
                key={step.label}
                className={styles.step}
                data-reveal
                style={{ '--wt-order': index }}
              >
                <span className={styles.stepNode} aria-hidden="true" />
                <p className={styles.stepIndex}>0{index + 1}</p>
                <h3 className={styles.stepTitle}>{step.label}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </li>
            ))}
          </ol>

          <div className={styles.tealFoot} data-reveal>
            <span className={styles.codeChip}>
              <code className={styles.codeText}>watchtower</code>
            </span>
            <a href={DEMO_URL} className={styles.tealLink}>
              Request a Demo
              <ArrowRight size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      {/* Capabilities. A second teal value, composed as a list of layers beside
          its own heading rather than a grid of equal cards. */}
      <section className={styles.layerSection} id="wt-capabilities" aria-labelledby="wt-capabilities-title">
        <div className={`${styles.container} container`}>
          <div className={styles.layerLayout}>
            <div className={styles.layerIntro} data-reveal>
              <p className={styles.darkEyebrow}>Capabilities</p>
              <h2 className={styles.layerTitle} id="wt-capabilities-title">
                What the protection layer handles
              </h2>
              <p className={styles.layerLead}>
                Six capabilities run at the layer. Each one addresses a different kind of unwanted
                traffic, and all of them operate before your website responds.
              </p>
            </div>

            <ol className={styles.layers}>
              {CAPABILITIES.map((capability, index) => (
                <li
                  key={capability.title}
                  className={styles.layer}
                  data-reveal
                  style={{ '--wt-order': index }}
                >
                  <span className={styles.layerLabel}>{capability.label}</span>
                  <h3 className={styles.layerName}>{capability.title}</h3>
                  <p className={styles.layerDesc}>{capability.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className={styles.ctaBlock} id="wt-request-demo">
        <div className={`${styles.container} container`}>
          <div className={styles.ctaPanel} data-reveal>
            <h2 className={styles.ctaTitle}>See Watch Tower in front of your site</h2>
            <p className={styles.ctaDesc}>
              Request a demo and we will walk through how traffic is inspected, filtered, and
              forwarded for your website.
            </p>
            <div className={styles.ctaActions}>
              <a href={DEMO_URL} className={styles.ctaPrimary}>
                Request a Demo
                <ArrowUpRight size={15} aria-hidden="true" />
              </a>
              <a href={CONTACT_URL} className={styles.ctaSecondary}>Get in Touch</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
