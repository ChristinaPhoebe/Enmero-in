import React, { useState, useEffect, useRef } from 'react';
import styles from './Navbar.module.css';
import { Menu, X, ChevronDown, ArrowUpRight } from 'lucide-react';
import logo from '../../assets/logo/enmero-logo.png';
import { PRODUCTS } from '../data/products.js';

export default function Navbar({ isLoggedIn, onLogout, topOffset = 0 }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);
  const productsRef = useRef(null);
  const productsTriggerRef = useRef(null);
  const pendingFocusIndex = useRef(null);

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
    setIsMobileProductsOpen(false);
  };

  const productLinks = () =>
    productsRef.current ? Array.from(productsRef.current.querySelectorAll('[data-product-link]')) : [];

  const focusProductLink = (index) => {
    const links = productLinks();
    if (links.length === 0) return;
    const wrapped = (index + links.length) % links.length;
    links[wrapped].focus();
  };

  const openProducts = (focusIndex) => {
    // The panel is hidden with visibility rather than unmounted so that opening
    // it causes no layout shift, and a hidden element cannot take focus. The
    // pending move is therefore applied after the panel becomes visible.
    pendingFocusIndex.current = focusIndex;
    setIsProductsOpen(true);
  };

  useEffect(() => {
    if (!isProductsOpen || pendingFocusIndex.current === null) return;
    focusProductLink(pendingFocusIndex.current);
    pendingFocusIndex.current = null;
  }, [isProductsOpen]);

  useEffect(() => {
    if (!isProductsOpen) return;
    const handlePointerDown = (event) => {
      if (productsRef.current && !productsRef.current.contains(event.target)) {
        setIsProductsOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isProductsOpen]);

  const handleProductsTriggerKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      openProducts(0);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      openProducts(-1);
    }
  };

  const handleProductsKeyDown = (event) => {
    const links = productLinks();
    const currentIndex = links.indexOf(document.activeElement);

    if (event.key === 'Escape') {
      event.stopPropagation();
      setIsProductsOpen(false);
      productsTriggerRef.current?.focus();
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (event.key === 'ArrowUp' && currentIndex === 0) {
        setIsProductsOpen(false);
        productsTriggerRef.current?.focus();
        return;
      }
      focusProductLink(currentIndex + (event.key === 'ArrowDown' ? 1 : -1));
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      focusProductLink(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      focusProductLink(links.length - 1);
    }
  };

  // Tabbing out of the menu closes it, so it never lingers over the page.
  const handleProductsBlur = (event) => {
    if (event.relatedTarget && productsRef.current?.contains(event.relatedTarget)) return;
    setIsProductsOpen(false);
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

            <div
              className={styles.products}
              ref={productsRef}
              onKeyDown={handleProductsKeyDown}
              onBlur={handleProductsBlur}
            >
              <button
                type="button"
                ref={productsTriggerRef}
                className={styles.navLink}
                onClick={() => setIsProductsOpen((open) => !open)}
                onKeyDown={handleProductsTriggerKeyDown}
                aria-expanded={isProductsOpen}
                aria-haspopup="true"
                aria-controls="products-menu"
              >
                Products
                <ChevronDown
                  size={14}
                  aria-hidden="true"
                  className={isProductsOpen ? styles.chevronOpen : undefined}
                />
              </button>

              <div
                className={`${styles.productsMenu} ${isProductsOpen ? styles.productsMenuOpen : ''}`}
                id="products-menu"
              >
                {PRODUCTS.map((product) => (
                  <a
                    key={product.id}
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.productLink}
                    data-product-link
                  >
                    {product.logo ? (
                      <img src={product.logo} alt="" className={styles.productLogo} />
                    ) : null}
                    <span className={styles.productName}>{product.name}</span>
                    <ArrowUpRight size={13} className={styles.productArrow} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>

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
          onClick={() => (isOpen ? closeMobileMenu() : setIsOpen(true))}
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

          <button
            type="button"
            className={`${styles.mobileLink} ${styles.mobileProductsToggle}`}
            onClick={() => setIsMobileProductsOpen((open) => !open)}
            aria-expanded={isMobileProductsOpen}
            aria-controls="mobile-products"
          >
            Products
            <ChevronDown
              size={16}
              aria-hidden="true"
              className={isMobileProductsOpen ? styles.chevronOpen : undefined}
            />
          </button>

          {isMobileProductsOpen && (
            <div className={styles.mobileProducts} id="mobile-products">
              {PRODUCTS.map((product) => (
                <a
                  key={product.id}
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.mobileProductLink}
                >
                  {product.name}
                </a>
              ))}
            </div>
          )}

          <a href="#/blog" className={styles.mobileLink}>Blog</a>
          <a href="#/contact" className={styles.mobileLink}>Get in Touch</a>
        </div>
      )}
    </nav>
  );
}
