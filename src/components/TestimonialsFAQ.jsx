import React, { useState } from 'react';
import styles from './TestimonialsFAQ.module.css';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const testimonials = [
  {
    quote: "Working with enmero was straightforward. They understood what we needed, communicated clearly throughout the project, and delivered a product that worked exactly as expected."
  },
  {
    quote: "The team at enmero cares about the details. Our project was handled professionally from start to finish, and the final result was better than we initially envisioned."
  },
  {
    quote: "Enmero helped us build our product from the ground up. Their combination of technical skill and design thinking made a real difference in the quality of what was delivered."
  }
];

const faqs = [
  {
    q: "What services does enmero offer?",
    a: "We offer web development, digital transformation, technology consulting, and app development. Every engagement is tailored to your specific needs. The full list is on our services page."
  },
  {
    q: "How does enmero approach a new project?",
    a: "We start by understanding your business and the problem you are trying to solve. Then we design and build the solution iteratively, keeping you involved throughout the process."
  },
  {
    q: "What types of businesses does enmero work with?",
    a: "We work with startups and established businesses across different industries. Whether you are building a new product or modernizing existing systems, we can help."
  },
  {
    q: "How long does a typical project take?",
    a: "Project timelines vary depending on scope and complexity. After our initial discovery conversation, we provide a clear timeline with milestones before work begins."
  },
  {
    q: "Does enmero provide ongoing support after launch?",
    a: "Yes. We offer maintenance and support packages to keep your product running smoothly after launch. We are available as a long-term technology partner."
  },
  {
    q: "How do I get started with enmero?",
    a: "The best way to start is by reaching out through our contact page. We will schedule a conversation to understand your needs and discuss how we can help."
  }
];

export default function TestimonialsFAQ() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  const toggleFaq = (index) => {
    setExpandedFaq(prev => (prev === index ? null : index));
  };

  return (
    <section className={styles.section} id="faq">
      <div className={`${styles.container} container`}>
        
        {/* Testimonials Block */}
        <div className={styles.testimonialContainer}>
          <span className={styles.sublabel}>What our customers say about us</span>
          
          <div className={styles.carouselWrapper}>
            <div className={styles.testimonialContent}>
              <blockquote className={styles.quoteText}>
                “{testimonials[currentSlide].quote}”
              </blockquote>
              
              <div className={styles.carouselNav}>
                <button className={styles.navBtn} onClick={handlePrevSlide} aria-label="Previous quote">
                  <ChevronLeft size={20} />
                </button>
                <button className={styles.navBtn} onClick={handleNextSlide} aria-label="Next quote">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Divider line */}
        <hr className={styles.divider} />

        {/* FAQs Block */}
        <div className={styles.faqSection}>
          <h3 className={styles.faqHeader}>Frequently Asked Questions</h3>
          
          <div className={styles.accordionList}>
            {faqs.map((faq, index) => {
              const isOpen = expandedFaq === index;
              return (
                <div key={index} className={styles.accordionItem}>
                  <button
                    className={styles.accordionQuestion}
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span>{faq.q}</span>
                    <span className={`${styles.iconWrapper} ${isOpen ? styles.iconOpen : ''}`}>
                      <ChevronDown size={18} />
                    </span>
                  </button>
                  <div
                    id={`faq-answer-${index}`}
                    className={`${styles.accordionAnswer} ${isOpen ? styles.answerOpen : ''}`}
                  >
                    <div className={styles.answerInner}>
                      {faq.a}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
