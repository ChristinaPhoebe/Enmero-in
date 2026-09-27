import React from 'react';
import styles from './Contact.module.css';
import ContactForm from '../components/ContactForm.jsx';

export default function Contact({ params }) {
  return (
    <div>
      <section className={styles.hero}>
        <div className={`${styles.container} container`}>
          <span className={styles.eyebrow}>Get in touch</span>
          <h1 className={styles.heroTitle}>Contact Enmero</h1>
          <p className={styles.heroSubtitle}>
            Tell us a little about your project and the Enmero team will get back to you to schedule a
            conversation. We work with startups and established businesses to build reliable technology.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={`${styles.container} container`}>
          <div className={styles.grid}>
            <div className={styles.formColumn}>
              <h2 className={styles.formHeading}>Start a conversation</h2>
              <ContactForm params={params} />
            </div>

            <aside className={styles.infoColumn}>
              <div className={styles.infoCard}>
                <h3 className={styles.infoTitle}>How we respond</h3>
                <p className={styles.infoText}>
                  Once you send your inquiry, we review the details and get back to you to schedule a
                  conversation about your project.
                </p>
              </div>

              <div className={styles.infoCard}>
                <h3 className={styles.infoTitle}>Email</h3>
                <a href="mailto:contact@enmero.in" className={styles.infoLink}>
                  contact@enmero.in
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
