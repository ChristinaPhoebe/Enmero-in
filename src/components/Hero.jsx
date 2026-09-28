import React, { useState, useRef, useEffect } from 'react';
import styles from './Hero.module.css';
import { ArrowUp, CornerDownLeft, Sparkles, X } from 'lucide-react';
import videoBg from '../../assets/herosection.mp4';
import { SERVICES } from '../data/services.js';

// Service highlights, kept in step with the canonical service list.
const logItems = SERVICES.map((service) => ({
  title: service.name,
  desc: service.headline
}));

export default function Hero() {
  const [inputValue, setInputValue] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'agent', text: 'Hey there! I am the enmero guide. Ask me anything about our consulting services and how we work with clients.' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInputValue('');
    setChatOpen(true);
    setIsTyping(true);

    setTimeout(() => {
      let reply = "Enmero is a technology consultancy. We build custom software, web applications, and digital products. Our work spans startups and established businesses.";
      
      const lower = userMessage.toLowerCase();
      if (lower.includes('service') || lower.includes('offer') || lower.includes('do')) {
        reply = "We offer web development, digital transformation, technology consulting, and app development. The full list is on our services page.";
      } else if (lower.includes('work') || lower.includes('process') || lower.includes('project')) {
        reply = "We start by understanding your requirements, then design and build the solution iteratively. You work directly with our team throughout the project.";
      } else if (lower.includes('contact') || lower.includes('start') || lower.includes('price') || lower.includes('cost')) {
        reply = "The best way to start is by filling out the contact form on our contact page. We will get back to you to discuss your project and how we can help.";
      }

      setMessages(prev => [...prev, { sender: 'agent', text: reply }]);
      setIsTyping(false);
    }, 1500);
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Cards are duplicated for a seamless infinite loop
  const renderCards = () => (
    <>
      {logItems.map((log, i) => (
        <div key={`a-${i}`} className={styles.card}>
          <span className={styles.cardTitle}>{log.title}</span>
          <p className={styles.cardDetail}>{log.desc}</p>
        </div>
      ))}
      {logItems.map((log, i) => (
        <div key={`b-${i}`} className={styles.card}>
          <span className={styles.cardTitle}>{log.title}</span>
          <p className={styles.cardDetail}>{log.desc}</p>
        </div>
      ))}
    </>
  );

  return (
    <section className={styles.hero}>
      <div className={styles.heroGrid}>
        {/* Left Column: Text Content */}
        <div className={styles.leftCol}>
          <h1 className={styles.title}>
            We{' '}
            <span className={styles.highlight}>
              <span className={styles.highlightBg} />
              build
            </span>{' '}
            what moves businesses forward.
          </h1>
          <p className={styles.subtitle}>
            Enmero builds software, web applications, and digital products. We combine engineering discipline with strong design to deliver work we are proud of.
          </p>
          <div className={styles.descWrapper}>
            <div className={styles.descAccent} />
            <p className={styles.desc}>
              From startups to established businesses, we help teams ship reliable technology.
            </p>
          </div>
          <div className={styles.ctaWrapper}>
            <a href="#/contact" className={styles.primaryBtn}>Start a Conversation</a>
            <a href="#how-it-works" className={styles.secondaryBtn}>See How We Work</a>
          </div>
        </div>

        {/* Right Column: Video Block & Scrolling Log Ticker */}
        <div className={styles.rightCol}>
          <div className={styles.videoBlock}>
            <video autoPlay loop muted playsInline className={styles.videoBg}>
              <source src={videoBg} type="video/mp4" />
            </video>
            <div className={styles.videoOverlay} />
          </div>

          {/* Vertical Scrolling Ticker */}
          <div className={styles.tickerViewport}>
            <div className={styles.tickerTrack}>
              {renderCards()}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Interactive Chat Panel */}
      {chatOpen && (
        <div className={styles.chatPanel}>
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderLeft}>
              <Sparkles size={16} className={styles.sparkleIcon} />
              <span>enmero Guide</span>
            </div>
            <button className={styles.closeChatButton} onClick={() => setChatOpen(false)}>
              <X size={16} />
            </button>
          </div>
          
          <div className={styles.chatBody}>
            {messages.map((msg, i) => (
              <div key={i} className={`${styles.chatMessage} ${msg.sender === 'user' ? styles.userMsg : styles.agentMsg}`}>
                <div className={styles.msgBubble}>{msg.text}</div>
              </div>
            ))}
            {isTyping && (
              <div className={`${styles.chatMessage} ${styles.agentMsg}`}>
                <div className={`${styles.msgBubble} ${styles.typingIndicator}`}>
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className={styles.chatPanelFooter}>
            <input 
              type="text" 
              placeholder="Ask about our services..." 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)}
              className={styles.panelInput}
            />
            <button type="submit" className={styles.panelSendButton}>
              <CornerDownLeft size={14} />
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
