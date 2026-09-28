import React, { useEffect, useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import styles from './WatchTowerApp.module.css';
import WatchTower from './WatchTower.jsx';
import { LEGAL_PAGES } from '../routes.js';
import { ENMERO_URL, enmeroPage } from '../sites.js';
import watchtowerLogo from '../../assets/logo/watchtower-logo.png';
import watchtowerSymbol from '../../assets/logo/watchtower-symbol.png';

const DEMO_URL = enmeroPage('/demo');

const SECTIONS = [
  { id: 'wt-overview', label: 'Overview' },
  { id: 'wt-globe', label: 'Traffic' },
  { id: 'wt-how-it-works', label: 'How it works' },
  { id: 'wt-capabilities', label: 'Capabilities' }
];

// The Watch Tower product shell. The product has its own domain, so it gets a
// header and footer of its own instead of the website ones. The Enmero
// navigation lives behind its own domain and is never repeated here.
export default function WatchTowerApp() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const goTop = (event) => {
    event.preventDefault();
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.bar}>
          <div className={styles.brandGroup}>
            <a href="#top" className={styles.brand} onClick={goTop} aria-label="Watch Tower, back to the top">
              <img src={watchtowerSymbol} alt="Watch Tower" className={styles.brandMark} />
            </a>
            <nav className={styles.sectionNav} aria-label="Watch Tower sections">
              {SECTIONS.map((section) => (
                <a key={section.id} href={`#${section.id}`} className={styles.sectionLink}>
                  {section.label}
                </a>
              ))}
            </nav>
          </div>

          <div className={styles.actions}>
            <a href={DEMO_URL} className={styles.demoLink}>
              Request a Demo
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
            <button
              type="button"
              className={styles.menuToggle}
              onClick={() => setIsOpen((open) => !open)}
              aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isOpen}
              aria-controls="watch-tower-navigation"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <nav className={styles.mobileNav} id="watch-tower-navigation" aria-label="Watch Tower sections">
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={styles.mobileLink}
                onClick={() => setIsOpen(false)}
              >
                {section.label}
              </a>
            ))}
            <a
              href={DEMO_URL}
              className={styles.mobileLink}
              onClick={() => setIsOpen(false)}
            >
              Request a Demo
            </a>
          </nav>
        )}
      </header>

      <main>
        <WatchTower />
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerBar}>
          <div className={styles.footerIdentity}>
            <img src={watchtowerLogo} alt="Watch Tower" className={styles.footerMark} />
            <p className={styles.footerNote}>
              is a product by{' '}
              <a href={ENMERO_URL} className={styles.footerLink}>
                Enmero
              </a>
              .
            </p>
          </div>

          <nav className={styles.footerLegal} aria-label="Legal">
            {LEGAL_PAGES.map((page) => (
              <a key={page.path} href={enmeroPage(page.path)} className={styles.footerLink}>
                {page.label}
              </a>
            ))}
            <a href="mailto:contact@enmero.in" className={styles.footerLink}>
              contact@enmero.in
            </a>
          </nav>
        </div>
      </footer>
    </>
  );
}
