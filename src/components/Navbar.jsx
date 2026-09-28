import React, { useState, useEffect } from 'react';
import styles from './Navbar.module.css';
import { Menu, X } from 'lucide-react';
import logo from '../../assets/logo/enmero-logo.png';
import { WATCHTOWER_URL } from '../sites.js';

export default function Navbar({ isLoggedIn, onLogout, topOffset = 0 }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const onPage = () => window.location.hash.startsWith('#/');

  const goHome = (e) => {
    e.preventDefault();
    if (onPage()) {
      window.location.hash = '';
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeMobileMenu = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const handleHashChange = () => closeMobileMenu();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}
      style={topOffset ? { top: topOffset } : undefined}
    >
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <a
            href="#top"
            className={styles.logoSection}
            onClick={goHome}
            aria-label="Enmero homepage"
          >
            <img src={logo} alt="Enmero" className={styles.logoImage} />
          </a>

          {/* Desktop Left Menu Links */}
          <div className={styles.menuDesktopLeft}>
            <a href="#/services" className={styles.navLink}>Services</a>
            <a href={WATCHTOWER_URL} className={styles.navLink}>Product</a>
            <a href="#/blog" className={styles.navLink}>Blog</a>
          </div>
        </div>

        <div className={styles.menuDesktopRight}>
          {isLoggedIn ? (
            <a href="#" onClick={onLogout} className={styles.seeDemoButton}>Exit Console</a>
          ) : (
            <>
              <a href="#/contact" className={styles.seeDemoButton}>Get in Touch</a>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className={styles.menuToggle}
          onClick={() => setIsOpen((open) => !open)}
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className={styles.menuMobile} id="mobile-navigation">
          <a href="#/services" className={styles.mobileLink}>Services</a>
          <a href={WATCHTOWER_URL} className={styles.mobileLink}>Product</a>
          <a href="#/blog" className={styles.mobileLink}>Blog</a>
          <a href="#/contact" className={styles.mobileLink}>Get in Touch</a>
        </div>
      )}
    </nav>
  );
}
