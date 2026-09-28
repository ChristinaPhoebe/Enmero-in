import React, { useRef, useState } from 'react';
import styles from './AgentJourney.module.css';
import { Sparkles, Loader, Send, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { WATCHTOWER_URL } from '../sites.js';

const totalSlides = 3;

export default function AgentJourney() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const touchStartX = useRef(null);

  const handleTouchStart = (event) => {
    if (event.touches.length === 1) {
      touchStartX.current = event.touches[0].clientX;
    }
  };

  const handleTouchEnd = (event) => {
    const startX = touchStartX.current;
    touchStartX.current = null;

    if (startX === null || event.changedTouches.length === 0) return;

    const distance = event.changedTouches[0].clientX - startX;
    if (Math.abs(distance) < 40) return;

    if (distance < 0) {
      handleNext();
    } else {
      handlePrev();
    }
  };

  return (
    <section className={styles.section} id="how-it-works">
      <div className={`${styles.container} container`}>
        {/* Section Title */}
        <div className={styles.introBlock}>
          <h2 className={styles.introTitle}>
            How we work
          </h2>
          <p className={styles.introSubtitle}>
            Every project follows a clear process. We keep things simple, communicate openly, and deliver work that stands up to scrutiny.
          </p>
        </div>

        {/* Slide Carousel */}
        <div
          className={styles.carousel}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={() => { touchStartX.current = null; }}
        >
          <div
            className={styles.carouselTrack}
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >

            {/* Stage 1: Understanding */}
            <div className={styles.slide}>
              <div className={styles.journeyRow}>
                <div className={styles.textSide}>
                  <span className={styles.agentTag}>Step 1</span>
                  <h3 className={styles.agentTitle}>Understand the problem</h3>
                  <ul className={styles.points}>
                    <li>
                      <strong>Listen first</strong>
                      <span>We start by understanding your business, your users, and the problem you are trying to solve.</span>
                    </li>
                    <li>
                      <strong>Define scope</strong>
                      <span>Together we clarify what success looks like, what is in scope, and what constraints we are working within.</span>
                    </li>
                    <li>
                      <strong>Plan the approach</strong>
                      <span>We outline the technical approach, timeline, and milestones before any design or code begins.</span>
                    </li>
                  </ul>
                </div>
                <div className={styles.cardSide}>
                  <div className={`${styles.card} ${styles.blueCard} grainy`}>
                    <div className={`${styles.floatingPill} ${styles.pillVisitor}`}>
                      <div className={styles.visitorAvatar}>
                        <Sparkles size={12} className={styles.sparkleIcon} />
                      </div>
                      <span>Discovery call</span>
                    </div>
                    <div className={`${styles.floatingPill} ${styles.pillCompany}`}>Requirements gathering</div>
                    <div className={`${styles.floatingPill} ${styles.pillArr}`}>Scope definition</div>
                    <div className={`${styles.floatingPill} ${styles.pillEmployees}`}>Technical planning</div>
                    <div className={`${styles.floatingPill} ${styles.pillProduct}`}>Timeline & milestones</div>
                    <div className={`${styles.floatingPill} ${styles.pillGoal}`}>Project brief</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stage 2: Design & Build */}
            <div className={styles.slide}>
              <div className={`${styles.journeyRow} ${styles.reverseRow}`}>
                <div className={styles.textSide}>
                  <span className={styles.agentTag}>Step 2</span>
                  <h3 className={styles.agentTitle}>Design and build</h3>
                  <ul className={styles.points}>
                    <li>
                      <strong>Design the solution</strong>
                      <span>We create interface designs and technical architecture that address the problem clearly.</span>
                    </li>
                    <li>
                      <strong>Build iteratively</strong>
                      <span>Development happens in focused sprints. You see progress regularly and can provide feedback throughout.</span>
                    </li>
                    <li>
                      <strong>Test continuously</strong>
                      <span>We verify quality at every stage, not just at the end. Issues are caught and resolved early.</span>
                    </li>
                  </ul>
                </div>
                <div className={styles.cardSide}>
                  <div className={`${styles.card} ${styles.greenCard} grainy`}>
                    <div className={`${styles.floatingPill} ${styles.pillLoader}`}>
                      <Loader size={12} className={styles.loaderIcon} />
                      <span>Building your project...</span>
                    </div>

                    <div className={styles.chatCardMock}>
                      <div className={styles.chatMockLabel}>Progress:</div>
                      <div className={styles.chatMockBubble}>
                        Design phase complete
                      </div>
                      <div className={styles.chatMockBubble}>
                        Development sprint 2 in progress
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stage 3: Deliver & Support */}
            <div className={styles.slide}>
              <div className={styles.journeyRow}>
                <div className={styles.textSide}>
                  <span className={styles.agentTag}>Step 3</span>
                  <h3 className={styles.agentTitle}>Deliver and support</h3>
                  <ul className={styles.points}>
                    <li>
                      <strong>Launch with confidence</strong>
                      <span>We handle deployment, testing, and handoff so your product launches smoothly.</span>
                    </li>
                    <li>
                      <strong>Provide documentation</strong>
                      <span>Clear documentation ensures your team can work with and maintain the product long after launch.</span>
                    </li>
                    <li>
                      <strong>Stay available</strong>
                      <span>We offer ongoing support and maintenance. Your product stays reliable, and we stay a phone call away.</span>
                    </li>
                  </ul>
                </div>
                <div className={styles.cardSide}>
                  <div className={`${styles.card} ${styles.orangeCard} grainy`}>
                    <div className={styles.chatCardMockOnboarding}>
                      <div className={styles.onboardBubbleUser}>Project status:</div>
                      <div className={styles.onboardBubbleAgent}>
                        Design approved
                      </div>
                      <div className={styles.onboardBubbleAgent}>
                        Development complete
                      </div>
                      <div className={styles.onboardBubbleAgent}>
                        Launched and supported
                      </div>
                    </div>

                    <div className={styles.onboardInputBar}>
                      <div className={styles.onboardLogo}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <rect x="3" y="5" width="4" height="2" rx="1"/>
                          <rect x="9" y="5" width="6" height="2" rx="1"/>
                          <rect x="17" y="5" width="4" height="2" rx="1"/>
                          <rect x="3" y="11" width="6" height="2" rx="1"/>
                          <rect x="11" y="11" width="4" height="2" rx="1"/>
                          <rect x="17" y="11" width="4" height="2" rx="1"/>
                        </svg>
                      </div>
                      <span className={styles.onboardPlaceholder}>Ready to launch</span>
                      <div className={styles.onboardSendBtn}>
                        <Send size={10} fill="currentColor" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Carousel Navigation */}
        <div className={styles.carouselNav}>
          <button className={styles.carouselBtn} onClick={handlePrev} aria-label="Previous slide">
            <ChevronLeft size={20} />
          </button>
          <div className={styles.carouselDots}>
            {Array.from({ length: totalSlides }, (_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === currentSlide ? styles.dotActive : ''}`}
                onClick={() => setCurrentSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <button className={styles.carouselBtn} onClick={handleNext} aria-label="Next slide">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className={styles.watchTowerCta}>
          <div className={styles.watchTowerCtaText}>
            <h3 className={styles.watchTowerCtaTitle}>
              Looking for ongoing product management?
            </h3>
            <p className={styles.watchTowerCtaDesc}>
              Watchtower is Enmero&apos;s long-term management service, offered as a 15-month
              engagement with simple monthly pricing.
            </p>
          </div>
          <a href={WATCHTOWER_URL} className={styles.watchTowerCtaBtn}>
            Explore Watchtower
            <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}