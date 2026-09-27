import React, { useEffect, useState } from 'react';
import styles from './ContactForm.module.css';
import useEnquirySubmit from '../hooks/useEnquirySubmit.js';
import { SERVICE_CHOICES, findServiceById } from '../data/services.js';

const CONTACT_METHODS = ['Email', 'Phone', 'No preference'];

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

  if (!values.phone.trim()) {
    errors.phone = 'Phone number is required.';
  } else {
    const digits = values.phone.replace(/\D/g, '');
    if (!/^\+?[0-9\s().-]+$/.test(values.phone.trim())) {
      errors.phone = 'Please enter a valid phone number.';
    } else if (digits.length < 6 || digits.length > 15) {
      errors.phone = 'Please enter a valid phone number.';
    }
  }

  if (values.website.trim()) {
    let candidate = values.website.trim();
    if (!/^https?:\/\//i.test(candidate)) candidate = `https://${candidate}`;
    try {
      const url = new URL(candidate);
      if (!url.hostname.includes('.')) throw new Error('missing dot');
    } catch (_e) {
      errors.website = 'Please enter a valid website URL.';
    }
  }

  if (!values.service) errors.service = 'Please select a service.';

  if (!values.project.trim()) {
    errors.project = 'Project description is required.';
  } else if (values.project.length < 10) {
    errors.project = 'Please give a brief description of at least 10 characters.';
  } else if (values.project.length > 2000) {
    errors.project = 'Please keep the description under 2000 characters.';
  }

  if (values.details.length > 2000) errors.details = 'Please keep additional details under 2000 characters.';

  return errors;
};

const initialValues = {
  fullName: '',
  company: '',
  email: '',
  phone: '',
  website: '',
  service: '',
  project: '',
  contactMethod: '',
  details: '',
  fax_number: ''
};

export default function ContactForm({ params }) {
  const requestedService = params?.get('service') || '';
  const [values, setValues] = useState(() => ({
    ...initialValues,
    service: findServiceById(requestedService)?.name || ''
  }));
  const [errors, setErrors] = useState({});
  const { submit, submitting, sent, message: submitMessage } = useEnquirySubmit();

  // Arriving from a service link on the services page fills the service field.
  // It never overwrites a choice the visitor has already made.
  useEffect(() => {
    const name = findServiceById(requestedService)?.name;
    if (!name) return;
    setValues((prev) => (prev.service ? prev : { ...prev, service: name }));
  }, [requestedService]);

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
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const trimmed = {
      fullName: values.fullName.trim(),
      company: values.company.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      website: values.website.trim(),
      service: values.service,
      project: values.project.trim(),
      contactMethod: values.contactMethod,
      details: values.details.trim()
    };

    // The honeypot is sent untouched. A person never fills it, so the function
    // sees it empty and sends the enquiry on. A bot that fills it is filtered.
    const result = await submit({ source: 'contact', fax_number: values.fax_number, ...trimmed });

    if (result.fields) {
      setErrors((prev) => ({ ...prev, ...result.fields }));
    }
  };

  if (sent) {
    return (
      <div className={styles.successBox} role="status">
        <div className={styles.successTitle}>Message sent.</div>
        <div className={styles.successDesc}>
          Thank you, <strong>{values.fullName.trim() || 'there'}</strong>. We have received your inquiry and
          will get back to you soon.
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate aria-busy={submitting}>
      <p className={styles.requiredNote}>
        Fields marked with <span className={styles.asterisk}>*</span> are required.
      </p>

      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="fax_number">Fax number</label>
        <input
          id="fax_number"
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
          <label htmlFor="phone" className={styles.label}>
            Phone Number <span className={styles.asterisk}>*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={values.phone}
            onChange={handleChange}
            maxLength={20}
            placeholder="+1 555 000 0000"
            className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
          />
          {errors.phone && (
            <span id="phone-error" className={styles.errorText}>{errors.phone}</span>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="website" className={styles.label}>
            Company Website <span className={styles.optionalTag}>optional</span>
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

        <div className={styles.fieldGroup}>
          <label htmlFor="service" className={styles.label}>
            What do you need help with? <span className={styles.asterisk}>*</span>
          </label>
          <select
            id="service"
            name="service"
            value={values.service}
            onChange={handleChange}
            className={`${styles.select} ${values.service ? '' : styles.selectPlaceholder} ${errors.service ? styles.inputError : ''}`}
            aria-invalid={!!errors.service}
            aria-describedby={errors.service ? 'service-error' : undefined}
          >
            <option value="" disabled>Select a service</option>
            {SERVICE_CHOICES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.service && (
            <span id="service-error" className={styles.errorText}>{errors.service}</span>
          )}
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="project" className={styles.label}>
          Project Description <span className={styles.asterisk}>*</span>
        </label>
        <textarea
          id="project"
          name="project"
          value={values.project}
          onChange={handleChange}
          maxLength={2000}
          rows={5}
          placeholder="Tell us briefly about the project, the goal, and the timeline you have in mind."
          className={`${styles.textarea} ${errors.project ? styles.inputError : ''}`}
          aria-invalid={!!errors.project}
          aria-describedby={errors.project ? 'project-error' : undefined}
        />
        {errors.project && (
          <span id="project-error" className={styles.errorText}>{errors.project}</span>
        )}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="contactMethod" className={styles.label}>
          Preferred Contact Method <span className={styles.optionalTag}>optional</span>
        </label>
        <select
          id="contactMethod"
          name="contactMethod"
          value={values.contactMethod}
          onChange={handleChange}
          className={`${styles.select} ${values.contactMethod ? '' : styles.selectPlaceholder}`}
        >
          <option value="" disabled>Select a method</option>
          {CONTACT_METHODS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="details" className={styles.label}>
          Additional Details <span className={styles.optionalTag}>optional</span>
        </label>
        <textarea
          id="details"
          name="details"
          value={values.details}
          onChange={handleChange}
          maxLength={2000}
          rows={3}
          placeholder="Anything else we should know before the first call."
          className={styles.textarea}
          aria-invalid={!!errors.details}
          aria-describedby={errors.details ? 'details-error' : undefined}
        />
        {errors.details && (
          <span id="details-error" className={styles.errorText}>{errors.details}</span>
        )}
      </div>

      {submitMessage && <div className={styles.errorBox} role="alert">{submitMessage}</div>}

      <button type="submit" className={styles.submitButton} disabled={submitting}>
        {submitting ? 'Sending...' : 'Send Inquiry'}
      </button>
    </form>
  );
}