import React, { useState } from 'react';
import styles from './DemoContact.module.css';
import useEnquirySubmit from '../hooks/useEnquirySubmit.js';
import { WATCHTOWER_SERVICE } from '../data/services.js';
import { WATCHTOWER_URL } from '../sites.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validate = (values) => {
  const errors = {};

  if (!values.fullName.trim()) errors.fullName = 'Full name is required.';
  else if (values.fullName.length > 80) errors.fullName = 'Please keep full name under 80 characters.';

  if (!values.company.trim()) errors.company = 'Company name is required.';
  else if (values.company.length > 80) errors.company = 'Please keep company name under 80 characters.';

  if (!values.email.trim()) {
    errors.email = 'Work email is required.';
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!values.website.trim()) {
    errors.website = 'Website URL is required.';
  } else {
    let candidate = values.website.trim();
    if (!/^https?:\/\//i.test(candidate)) candidate = `https://${candidate}`;
    try {
      const url = new URL(candidate);
      if (!url.hostname.includes('.')) throw new Error('missing dot');
    } catch (_e) {
      errors.website = 'Please enter a valid website URL.';
    }
  }

  if (!values.message.trim()) {
    errors.message = 'Please tell us a little about your website.';
  } else if (errors.message && errors.message.length > 1000) {
    errors.message = 'Please keep the message under 1000 characters.';
  }

  return errors;
};

const initialValues = {
  fullName: '',
  company: '',
  email: '',
  website: '',
  message: '',
  fax_number: ''
};

export default function DemoContact() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const { submit, submitting, sent, message: submitMessage } = useEnquirySubmit();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // The honeypot is sent untouched. A person never fills it, so the function
    // sees it empty and sends the request on. A bot that fills it is filtered.
    const result = await submit({
      source: 'demo',
      product: WATCHTOWER_SERVICE.name,
      fax_number: values.fax_number,
      fullName: values.fullName.trim(),
      company: values.company.trim(),
      email: values.email.trim(),
      website: values.website.trim(),
      message: values.message.trim()
    });

    if (result.fields) {
      setErrors((prev) => ({ ...prev, ...result.fields }));
    }
  };

  if (sent) {
    return (
      <div>
        <section className={styles.hero}>
          <div className={`${styles.container} container`}>
            <span className={styles.eyebrow}>Demo request</span>
            <h1 className={styles.heroTitle}>Request a Demo</h1>
            <p className={styles.heroSubtitle}>
              See how the Enmero Protection Layer works with your website.
            </p>
          </div>
        </section>
        <section className={styles.section}>
          <div className={`${styles.container} container`}>
            <div className={styles.successBox} role="status">
              <div className={styles.successTitle}>Request received.</div>
              <div className={styles.successDesc}>
                Thank you, <strong>{values.fullName.trim() || 'there'}</strong>. We have received your
                demo request and will get back to you shortly to schedule a walkthrough.
              </div>
              <a href={WATCHTOWER_URL} className={styles.backLink}>Back to product page</a>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <section className={styles.hero}>
        <div className={`${styles.container} container`}>
          <span className={styles.eyebrow}>Demo request</span>
          <h1 className={styles.heroTitle}>Request a Demo</h1>
          <p className={styles.heroSubtitle}>
            See how the Enmero Protection Layer works with your website. Fill out the
            form below and we will schedule a walkthrough.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <div className={`${styles.container} container`}>
          <div className={styles.grid}>
            <div className={styles.formColumn}>
              <h2 className={styles.formHeading}>Tell us about your website</h2>
              <form onSubmit={handleSubmit} className={styles.form} noValidate aria-busy={submitting}>
                <p className={styles.requiredNote}>
                  Fields marked with <span className={styles.asterisk}>*</span> are required.
                </p>

                <div className={styles.honeypot} aria-hidden="true">
                  <label htmlFor="demo-fax-number">Fax number</label>
                  <input
                    id="demo-fax-number"
                    name="fax_number"
                    type="text"
                    value={values.fax_number}
                    onChange={handleChange}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div className={styles.fieldGrid}>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="fullName" className={styles.label}>
                      Full Name <span className={styles.asterisk}>*</span>
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={values.fullName}
                      onChange={handleChange}
                      maxLength={80}
                      placeholder="Your full name"
                      className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
                      aria-invalid={!!errors.fullName}
                      aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                    />
                    {errors.fullName && (
                      <span id="fullName-error" className={styles.errorText}>{errors.fullName}</span>
                    )}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="company" className={styles.label}>
                      Company Name <span className={styles.asterisk}>*</span>
                    </label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      value={values.company}
                      onChange={handleChange}
                      maxLength={80}
                      placeholder="Your company"
                      className={`${styles.input} ${errors.company ? styles.inputError : ''}`}
                      aria-invalid={!!errors.company}
                      aria-describedby={errors.company ? 'company-error' : undefined}
                    />
                    {errors.company && (
                      <span id="company-error" className={styles.errorText}>{errors.company}</span>
                    )}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="email" className={styles.label}>
                      Work Email <span className={styles.asterisk}>*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={handleChange}
                      maxLength={120}
                      placeholder="name@company.com"
                      className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    {errors.email && (
                      <span id="email-error" className={styles.errorText}>{errors.email}</span>
                    )}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="website" className={styles.label}>
                      Website URL <span className={styles.asterisk}>*</span>
                    </label>
                    <input
                      id="website"
                      name="website"
                      type="url"
                      value={values.website}
                      onChange={handleChange}
                      maxLength={200}
                      placeholder="https://example.com"
                      className={`${styles.input} ${errors.website ? styles.inputError : ''}`}
                      aria-invalid={!!errors.website}
                      aria-describedby={errors.website ? 'website-error' : undefined}
                    />
                    {errors.website && (
                      <span id="website-error" className={styles.errorText}>{errors.website}</span>
                    )}
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="message" className={styles.label}>
                    Message <span className={styles.optionalTag}>optional</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={values.message}
                    onChange={handleChange}
                    maxLength={1000}
                    rows={4}
                    placeholder="Tell us about your website and what you are looking for."
                    className={`${styles.textarea} ${errors.message ? styles.inputError : ''}`}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                  />
                  {errors.message && (
                    <span id="message-error" className={styles.errorText}>{errors.message}</span>
                  )}
                </div>

                {submitMessage && <div className={styles.errorBox} role="alert">{submitMessage}</div>}

                <button type="submit" className={styles.submitButton} disabled={submitting}>
                  {submitting ? 'Sending...' : 'Request Demo'}
                </button>
              </form>
            </div>

            <aside className={styles.infoColumn}>
              <div className={styles.infoCard}>
                <h3 className={styles.infoTitle}>What happens next</h3>
                <p className={styles.infoText}>
                  Once you submit your request, we review your website details and
                  get back to you to schedule a demo walkthrough.
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
