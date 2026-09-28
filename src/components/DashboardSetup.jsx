import React, { useState } from 'react';
import styles from './DashboardSetup.module.css';
import { 
  LayoutDashboard, Clock, Bot, FileText, TrendingUp, GitBranch, 
  Globe, Mail, Activity, Lock, Key, Zap, Database, Cpu, ListTodo, 
  AlertTriangle, Network, Shuffle, Hexagon, Settings, Shield, 
  Star, Sparkles, ChevronDown, ChevronRight, Copy, Check, 
  ExternalLink, Info, MessageSquare, BookOpen, AlertCircle, 
  ShieldAlert, ShieldCheck, Clipboard, Play, UserCheck, Plus, X
} from 'lucide-react';

const playSynthesizedSound = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'chime') {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.05);
        gain.gain.setValueAtTime(0.0, now);
        gain.gain.linearRampToValueAtTime(0.06, now + index * 0.05 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.05 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + index * 0.05);
        osc.stop(now + index * 0.05 + 0.25);
      });
    } else if (type === 'success') {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.25);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.3);
    } else if (type === 'simulation') {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.12);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.15);
    }
  } catch (err) {
    console.warn("Web Audio API is not supported or blocked in this browser context:", err);
  }
};

export default function DashboardSetup({ fullscreen, onLogout }) {
  const [activeTab, setActiveTab] = useState('sources'); // 'sources' | 'library'
  const [activeSidebar, setActiveSidebar] = useState('Overview');
  const [isSecurityExpanded, setIsSecurityExpanded] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [activeReviewLog, setActiveReviewLog] = useState(null);
  const [tourStep, setTourStep] = useState(null);

  // AIS: Identities State
  const [identities, setIdentities] = useState([
    { name: 'Support Agent Node', did: 'did:enmero:support-agent-prod', status: 'Key Verification Active' },
    { name: 'Billing Service Node', did: 'did:enmero:billing-v1', status: 'Key Verification Active' }
  ]);
  const [newIdentityName, setNewIdentityName] = useState('');
  const [showAddIdentity, setShowAddIdentity] = useState(false);

  // ADS: Services Registry State
  const [discoveryServices, setDiscoveryServices] = useState([
    { name: 'Order Management Service', capability: 'order-retrieval', url: 'https://api.internal/v2/orders', trustScore: '100.00', status: 'Active & Verified' },
    { name: 'Payroll Service Endpoint', capability: 'payroll-service', url: 'https://api.internal/v1/payroll', trustScore: '98.50', status: 'Active & Verified' }
  ]);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceCap, setNewServiceCap] = useState('');
  const [newServiceUrl, setNewServiceUrl] = useState('');
  const [showAddService, setShowAddService] = useState(false);

  // AZT: Policies State
  const [policies, setPolicies] = useState([
    { subject: 'did:enmero:support-agent-prod', capability: 'order-retrieval', action: 'Read Customer Orders', effect: 'ALLOW' },
    { subject: 'did:enmero:support-agent-prod', capability: 'payroll-service', action: 'Access Payroll', effect: 'DENY' }
  ]);
  const [newPolicySubject, setNewPolicySubject] = useState(identities[0]?.did || '');
  const [newPolicyCap, setNewPolicyCap] = useState(discoveryServices[0]?.capability || '');
  const [newPolicyAction, setNewPolicyAction] = useState('');
  const [newPolicyEffect, setNewPolicyEffect] = useState('ALLOW');
  const [showAddPolicy, setShowAddPolicy] = useState(false);

  // ATL: Ledger Logs State
  const [ledgerLogs, setLedgerLogs] = useState([
    { 
      time: '23:04:12', 
      date: 'Jun 11, 2026', 
      subject: 'Support Agent Node', 
      action: 'Read Customer Orders (order-retrieval)', 
      result: 'ALLOWED', 
      signature: '0x8a92fb2c',
      severity: 'Moderate',
      category: 'Exposed Infrastructure',
      type: 'API abuse'
    },
    { 
      time: '23:03:07', 
      date: 'Jun 11, 2026', 
      subject: 'Support Agent Node', 
      action: 'Access Payroll (payroll-service)', 
      result: 'DENIED', 
      signature: '0xe2b4cf91',
      severity: 'High',
      category: 'Suspicious activity',
      type: 'Web application exploits'
    }
  ]);

  const tourSteps = [
    {
      title: 'Console Header & Control Plane',
      description: 'The top bar displays the active domain (enmero.com) running on the Enterprise tier, the system status indicator (Canary), and access to the Ask AI support agent.'
    },
    {
      title: 'Unified Navigation Control',
      description: 'The left sidebar provides shortcuts to all trust and routing options. enmero core services—AIS, AZT, ADS, and ATL—are nested under the expandable Security group.'
    },
    {
      title: 'Security Action Items & Audit Logs',
      description: 'Here you can view incoming security threats and transaction validations, categorized by severity (Moderate/High) and audit result (Audit Pass/Blocked).'
    },
    {
      title: 'Live SDK Transaction Simulation',
      description: 'Click the "Simulate Transaction" button to append a live API request log. Watch it execute and sign the security checks against active access rules.'
    },
    {
      title: 'Request Distribution Analytics',
      description: 'View the volume and percentage of requests: orange segments are mitigated/blocked threats, blue are cached by enmero, and dark teal are routed directly to your origin servers.'
    },
    {
      title: 'Active Security Services',
      description: 'Monitor the status of individual firewall engines (Web app exploits, DDoS mitigation, Bot traffic) running across edge proxies.'
    },
    {
      title: 'Ask AI Security Copilot',
      description: 'Need help resolving policy conflicts? Click "Ask AI" to query natural language logs, analyze audit signatures, or receive recommendations.'
    }
  ];

  const handleStartTour = () => {
    playSynthesizedSound('chime');
    setTourStep(1);
  };

  const handleTourNext = () => {
    playSynthesizedSound('click');
    if (tourStep < tourSteps.length) {
      setTourStep(prev => prev + 1);
    } else {
      setTourStep(null);
      playSynthesizedSound('success');
      alert("Congratulations on completing the enmero Console Tour!");
    }
  };

  const handleTourBack = () => {
    playSynthesizedSound('click');
    if (tourStep > 1) {
      setTourStep(prev => prev - 1);
    }
  };

  const handleTourSkip = () => {
    playSynthesizedSound('click');
    setTourStep(null);
  };

  const handleLogoutAction = (e) => {
    playSynthesizedSound('click');
    if (onLogout) {
      onLogout(e);
    } else {
      window.location.hash = '';
      window.location.reload();
    }
  };

  const handleCopyText = (text, id) => {
    playSynthesizedSound('click');
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleAddIdentity = (e) => {
    e.preventDefault();
    playSynthesizedSound('click');
    if (!newIdentityName.trim()) return;
    
    const name = newIdentityName.trim();
    const cleanSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const did = `did:enmero:${cleanSlug || 'node'}`;
    
    setIdentities(prev => [...prev, { name, did, status: 'Key Verification Active' }]);
    setNewIdentityName('');
    setShowAddIdentity(false);
    
    if (!newPolicySubject) {
      setNewPolicySubject(did);
    }
  };

  const handleAddService = (e) => {
    e.preventDefault();
    playSynthesizedSound('click');
    if (!newServiceName.trim() || !newServiceCap.trim()) return;

    const name = newServiceName.trim();
    const capability = newServiceCap.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    const url = newServiceUrl.trim() || `https://api.internal/v1/${capability}`;

    setDiscoveryServices(prev => [...prev, { name, capability, url, trustScore: '100.00', status: 'Active & Verified' }]);
    setNewServiceName('');
    setNewServiceCap('');
    setNewServiceUrl('');
    setShowAddService(false);

    if (!newPolicyCap) {
      setNewPolicyCap(capability);
    }
  };

  const handleAddPolicy = (e) => {
    e.preventDefault();
    playSynthesizedSound('click');
    if (!newPolicySubject || !newPolicyCap || !newPolicyAction.trim()) return;

    setPolicies(prev => [...prev, {
      subject: newPolicySubject,
      capability: newPolicyCap,
      action: newPolicyAction.trim(),
      effect: newPolicyEffect
    }]);

    setNewPolicyAction('');
    setShowAddPolicy(false);
  };

  const handleSimulateTransaction = () => {
    playSynthesizedSound('simulation');
    if (identities.length === 0) {
      alert("Please register at least one Identity Node first (AIS).");
      return;
    }
    
    const randomIdent = identities[Math.floor(Math.random() * identities.length)];
    
    const simulationTargets = [
      { action: 'Read Customer Orders', capability: 'order-retrieval', category: 'Exposed Infrastructure', type: 'API abuse' },
      { action: 'Access Payroll', capability: 'payroll-service', category: 'Suspicious activity', type: 'Web application exploits' },
      { action: 'Delete Customer Record', capability: 'order-retrieval', category: 'Suspicious activity', type: 'Web application exploits' },
      { action: 'Update Billing Profile', capability: 'billing-v1', category: 'Exposed Infrastructure', type: 'API abuse' }
    ];
    const target = simulationTargets[Math.floor(Math.random() * simulationTargets.length)];
    
    const matchingPolicy = policies.find(p => 
      p.subject === randomIdent.did && 
      p.capability === target.capability &&
      p.action.toLowerCase() === target.action.toLowerCase()
    );

    let result = 'ALLOWED';
    if (matchingPolicy) {
      result = matchingPolicy.effect === 'ALLOW' ? 'ALLOWED' : 'DENIED';
    } else {
      const generalPolicy = policies.find(p => p.subject === randomIdent.did && p.capability === target.capability);
      if (generalPolicy) {
        result = generalPolicy.effect === 'ALLOW' ? 'ALLOWED' : 'DENIED';
      } else {
        if (target.action.includes('Payroll') || target.action.includes('Delete')) {
          result = 'DENIED';
        } else {
          result = 'ALLOWED';
        }
      }
    }

    const hex = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    const signature = `0x${hex}7c`;
    
    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dateString = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

    setLedgerLogs(prev => [
      {
        time: timeString,
        date: dateString,
        subject: randomIdent.name,
        action: `${target.action} (${target.capability})`,
        result,
        signature,
        severity: result === 'ALLOWED' ? 'Moderate' : 'High',
        category: target.category,
        type: target.type
      },
      ...prev
    ]);
  };

  const resolveIdentityName = (did) => {
    const found = identities.find(i => i.did === did);
    return found ? found.name : did;
  };

  return (
    <div className={`${styles.workspaceMockup} ${fullscreen ? styles.workspaceMockupFullscreen : ''}`}>
      
      {/* 1. Top Header Bar */}
      <header className={`${styles.headerBar} ${tourStep === 1 ? styles.tourHighlighted : ''}`}>
        <div className={styles.headerLeft}>
          <span className={styles.logoText}>enmero console</span>
          <div className={styles.domainSelector}>
            <span className={styles.domainName}>enmero.com</span>
            <span className={styles.starIcon}>
              <Star size={13} fill="#f59e0b" color="#f59e0b" />
            </span>
            <span className={styles.enterpriseBadge}>Enterprise</span>
          </div>
        </div>
        
        <div className={styles.headerRight}>
          <div className={styles.canaryBadge}>
            <span className={styles.canaryDot} />
            <span>Canary</span>
          </div>
          <button 
            className={`${styles.askAiBtn} ${tourStep === 7 ? styles.tourHighlighted : ''}`}
            onClick={() => { playSynthesizedSound('click'); alert("enmero AI Assistant is online."); }}
          >
            <Sparkles size={13} color="#0051c3" fill="#e0ebff" />
            <span>Ask AI</span>
          </button>
          <button className={styles.headerSupportBtn} onClick={() => { playSynthesizedSound('click'); alert("Opening Support Channels..."); }}>
            <span>Support</span>
            <ChevronDown size={12} />
          </button>
          <div className={styles.userAvatar} onClick={() => { playSynthesizedSound('click'); alert("User settings profile"); }}>
            <Settings size={14} />
          </div>
        </div>
      </header>

      {/* 2. Main Content Grid */}
      <div className={styles.mainLayout}>
        
        {/* Left Sidebar */}
        <aside className={`${styles.sidebar} ${tourStep === 2 ? styles.tourHighlighted : ''}`}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon}>
              <Globe size={13} />
            </span>
            <input type="text" placeholder="Quick search..." className={styles.searchInput} readOnly />
            <span className={styles.searchKey}>Ctrl+K</span>
          </div>
          
          <button className={styles.backButton} onClick={(e) => { e.preventDefault(); playSynthesizedSound('click'); setActiveSidebar('Overview'); }}>
            <ChevronRight size={13} style={{ transform: 'rotate(180deg)' }} />
            <span>Back to Domains</span>
          </button>

          <nav className={styles.navMenu}>
            <button 
              className={`${styles.navLink} ${activeSidebar === 'Overview' ? styles.navLinkActive : ''}`}
              onClick={() => { playSynthesizedSound('click'); setActiveSidebar('Overview'); }}
            >
              <LayoutDashboard size={14} />
              <span>Overview</span>
            </button>
            
            <button 
              className={`${styles.navLink} ${activeSidebar === 'Recents' ? styles.navLinkActive : ''}`}
              onClick={() => { playSynthesizedSound('click'); setActiveSidebar('Recents'); }}
            >
              <Clock size={14} />
              <span>Recents</span>
            </button>
            
            <button 
              className={`${styles.navLink} ${activeSidebar === 'Agent Crawl Control' ? styles.navLinkActive : ''}`}
              onClick={() => { playSynthesizedSound('click'); setActiveSidebar('Agent Crawl Control'); }}
            >
              <Bot size={14} />
              <span>Agent Crawl Control</span>
            </button>
            
            <button 
              className={`${styles.navLink} ${activeSidebar === 'Log Explorer' ? styles.navLinkActive : ''}`}
              onClick={() => { playSynthesizedSound('click'); setActiveSidebar('Log Explorer'); }}
            >
              <FileText size={14} />
              <span>Log Explorer</span>
            </button>
            
            <button 
              className={`${styles.navLink} ${activeSidebar === 'Analytics & Logs' ? styles.navLinkActive : ''}`}
              onClick={() => { playSynthesizedSound('click'); setActiveSidebar('Analytics & Logs'); }}
            >
              <TrendingUp size={14} />
              <span>Analytics & Logs</span>
            </button>
            
            <button 
              className={`${styles.navLink} ${activeSidebar === 'Version Management' ? styles.navLinkActive : ''}`}
              onClick={() => { playSynthesizedSound('click'); setActiveSidebar('Version Management'); }}
            >
              <GitBranch size={14} />
              <span>Version Management</span>
            </button>
            
            <button 
              className={`${styles.navLink} ${activeSidebar === 'ADS (Discovery)' ? styles.navLinkActive : ''}`}
              onClick={() => { playSynthesizedSound('click'); setActiveSidebar('ADS (Discovery)'); }}
            >
              <Globe size={14} />
              <span>ADS (Discovery)</span>
            </button>
            
            <button 
              className={`${styles.navLink} ${activeSidebar === 'Secure Channels' ? styles.navLinkActive : ''}`}
              onClick={() => { playSynthesizedSound('click'); setActiveSidebar('Secure Channels'); }}
            >
              <Mail size={14} />
              <span>Secure Channels</span>
            </button>
            
            <button 
              className={`${styles.navLink} ${activeSidebar === 'Agent Mesh' ? styles.navLinkActive : ''}`}
              onClick={() => { playSynthesizedSound('click'); setActiveSidebar('Agent Mesh'); }}
            >
              <Activity size={14} />
              <span>Agent Mesh</span>
            </button>
            
            <button 
              className={`${styles.navLink} ${activeSidebar === 'AIS (Identity & Keys)' ? styles.navLinkActive : ''}`}
              onClick={() => { playSynthesizedSound('click'); setActiveSidebar('AIS (Identity & Keys)'); }}
            >
              <Lock size={14} />
              <span>AIS (Identity & Keys)</span>
            </button>

            {/* Security Dropdown Accordion Section */}
            <div className={styles.menuGroup}>
              <button 
                className={`${styles.navLink}`}
                onClick={() => { playSynthesizedSound('click'); setIsSecurityExpanded(!isSecurityExpanded); }}
                style={{ justifyContent: 'space-between' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Shield size={14} />
                  <span>Security</span>
                </span>
                {isSecurityExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
              
              {isSecurityExpanded && (
                <div className={styles.navSubGroup}>
                  <button
                    className={`${styles.navLinkSub} ${activeSidebar === 'Overview' ? styles.navLinkSubActive : ''}`}
                    onClick={() => { playSynthesizedSound('click'); setActiveSidebar('Overview'); }}
                  >
                    <span>Overview</span>
                  </button>
                  <button
                    className={`${styles.navLinkSub} ${activeSidebar === 'AIS (Identities)' ? styles.navLinkSubActive : ''}`}
                    onClick={() => {
                      playSynthesizedSound('click');
                      setActiveSidebar('AIS (Identities)');
                      setActiveTab('sources');
                    }}
                  >
                    <span>AIS (Identities)</span>
                  </button>
                  <button
                    className={`${styles.navLinkSub} ${activeSidebar === 'AZT (Policies)' ? styles.navLinkSubActive : ''}`}
                    onClick={() => {
                      playSynthesizedSound('click');
                      setActiveSidebar('AZT (Policies)');
                      setActiveTab('sources');
                    }}
                  >
                    <span>AZT (Policies)</span>
                  </button>
                  <button
                    className={`${styles.navLinkSub} ${activeSidebar === 'ADS (Discovery)' ? styles.navLinkSubActive : ''}`}
                    onClick={() => {
                      playSynthesizedSound('click');
                      setActiveSidebar('ADS (Discovery)');
                      setActiveTab('sources');
                    }}
                  >
                    <span>ADS (Discovery)</span>
                  </button>
                  <button
                    className={`${styles.navLinkSub} ${activeSidebar === 'ATL (Ledger Logs)' ? styles.navLinkSubActive : ''}`}
                    onClick={() => {
                      playSynthesizedSound('click');
                      setActiveSidebar('ATL (Ledger Logs)');
                      setActiveTab('sources');
                    }}
                  >
                    <span>ATL (Ledger Logs)</span>
                  </button>
                  <button
                    className={`${styles.navLinkSub} ${activeSidebar === 'Security Rules' ? styles.navLinkSubActive : ''}`}
                    onClick={() => { playSynthesizedSound('click'); setActiveSidebar('Security Rules'); }}
                  >
                    <span>Security Rules</span>
                  </button>
                  <button
                    className={`${styles.navLinkSub} ${activeSidebar === 'Settings' ? styles.navLinkSubActive : ''}`}
                    onClick={() => { playSynthesizedSound('click'); setActiveSidebar('Settings'); }}
                  >
                    <span>Settings</span>
                  </button>
                </div>
              )}
            </div>

            <button 
              className={`${styles.navLink} ${activeSidebar === 'AZT (Zero Trust)' ? styles.navLinkActive : ''}`}
              onClick={() => { playSynthesizedSound('click'); setActiveSidebar('AZT (Zero Trust)'); }}
            >
              <Key size={14} />
              <span>AZT (Zero Trust)</span>
            </button>
            
            <button 
              className={`${styles.navLink} ${activeSidebar === 'ADN (Delivery)' ? styles.navLinkActive : ''}`}
              onClick={() => { playSynthesizedSound('click'); setActiveSidebar('ADN (Delivery)'); }}
            >
              <Zap size={14} />
              <span>ADN (Delivery)</span>
            </button>
            
            <button 
              className={`${styles.navLink} ${activeSidebar === 'Context Caching' ? styles.navLinkActive : ''}`}
              onClick={() => { playSynthesizedSound('click'); setActiveSidebar('Context Caching'); }}
            >
              <Database size={14} />
              <span>Context Caching</span>
            </button>
            
            <button 
              className={`${styles.navLink} ${activeSidebar === 'Agent Workers' ? styles.navLinkActive : ''}`}
              onClick={() => { playSynthesizedSound('click'); setActiveSidebar('Agent Workers'); }}
            >
              <Cpu size={14} />
              <span>Agent Workers</span>
            </button>
            
            <button 
              className={`${styles.navLink} ${activeSidebar === 'Trust Rules' ? styles.navLinkActive : ''}`}
              onClick={() => { playSynthesizedSound('click'); setActiveSidebar('Trust Rules'); }}
            >
              <ListTodo size={14} />
              <span>Trust Rules</span>
            </button>
            
            <button 
              className={`${styles.navLink} ${activeSidebar === 'Guardrail Blocker' ? styles.navLinkActive : ''}`}
              onClick={() => { playSynthesizedSound('click'); setActiveSidebar('Guardrail Blocker'); }}
              style={{ justifyContent: 'space-between' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={14} />
                <span>Guardrail Blocker</span>
              </span>
              <span className={styles.enterpriseBadge} style={{ backgroundColor: '#111827', color: '#ffffff', border: 'none', padding: '1px 5px', textTransform: 'none' }}>New</span>
            </button>
            
            <button 
              className={`${styles.navLink} ${activeSidebar === 'Secure Network' ? styles.navLinkActive : ''}`}
              onClick={() => { playSynthesizedSound('click'); setActiveSidebar('Secure Network'); }}
            >
              <Network size={14} />
              <span>Secure Network</span>
            </button>
            
            <button 
              className={`${styles.navLink} ${activeSidebar === 'Agent Traffic' ? styles.navLinkActive : ''}`}
              onClick={() => { playSynthesizedSound('click'); setActiveSidebar('Agent Traffic'); }}
            >
              <Shuffle size={14} />
              <span>Agent Traffic</span>
            </button>
            
            <button 
              className={`${styles.navLink} ${activeSidebar === 'Decentralized Ledger' ? styles.navLinkActive : ''}`}
              onClick={() => { playSynthesizedSound('click'); setActiveSidebar('Decentralized Ledger'); }}
            >
              <Hexagon size={14} />
              <span>Decentralized Ledger</span>
            </button>
          </nav>

          <button onClick={handleLogoutAction} className={styles.sidebarSignOut}>
            Sign out
          </button>
        </aside>

        {/* Main Content Area */}
        <div className={styles.mainContent}>
          
          {/* Breadcrumbs Title Row */}
          <div className={styles.welcomeRow}>
            <span className={styles.welcomeText}>Security</span>
            <h1 className={styles.dashboardTitle}>
              {activeSidebar === 'Overview' ? 'Overview' : activeSidebar}
            </h1>
            <p className={styles.sectionHeaderSubtitle}>
              {activeSidebar === 'Overview' 
                ? 'Quickly identify security action items and view the security posture of your domain.'
                : `Manage and configure enmero's ${activeSidebar} control plane.`
              }
            </p>
            
            {activeSidebar === 'Overview' && (
              <div className={styles.docLinksRow}>
                <a href="#docs" className={styles.docLink} onClick={(e) => { e.preventDefault(); playSynthesizedSound('click'); alert("Opening security overview docs..."); }}>
                  <BookOpen size={12} />
                  <span>Security Overview documentation</span>
                  <ExternalLink size={10} />
                </a>
                <a href="#tour" className={styles.docLink} onClick={(e) => { e.preventDefault(); handleStartTour(); }}>
                  <Info size={12} />
                  <span>Dashboard tour</span>
                  <ExternalLink size={10} />
                </a>
              </div>
            )}
          </div>

          {/* 2-Column Grid */}
          <div className={styles.overviewGrid}>
            
            {/* Left Column */}
            <div className={styles.leftColumn}>
              
              {activeSidebar === 'Overview' ? (
                /* 1. Overview Screen: Security Action Items Card */
                <div className={`${styles.actionItemsCard} ${tourStep === 3 ? styles.tourHighlighted : ''}`}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>Security action items</span>
                    <div className={styles.cardHeaderActions}>
                      <button 
                        className={`${styles.textLinkBtn} ${tourStep === 4 ? styles.tourHighlighted : ''}`} 
                        onClick={handleSimulateTransaction}
                      >
                        <Play size={11} />
                        Simulate Transaction
                      </button>
                      <button className={styles.textLinkBtn} onClick={() => playSynthesizedSound('click')}>Filters</button>
                      <button className={styles.textLinkBtn} onClick={() => playSynthesizedSound('click')}>Archived</button>
                    </div>
                  </div>
                  
                  <div className={styles.alertList}>
                    {/* Render live simulated audit logs as security actions */}
                    {ledgerLogs.map((log, idx) => (
                      <div key={idx} className={styles.alertItem}>
                        <div className={styles.alertLeft}>
                          <div className={styles.alertDateRow}>
                            <span className={log.result === 'ALLOWED' ? styles.alertDot : styles.alertDotRed} />
                            <span className={styles.alertDate}>{log.date} {log.time}</span>
                          </div>
                          <h4 className={styles.alertTitle}>{log.action}</h4>
                          <div className={styles.alertBadgeRow}>
                            <span className={log.result === 'ALLOWED' ? styles.badgeModerate : styles.badgeHigh}>
                              {log.result === 'ALLOWED' ? 'Audit Pass' : 'Blocked'}
                            </span>
                            <span className={styles.alertTag}>{log.subject}</span>
                            <span className={styles.alertTag}>Hash: {log.signature}</span>
                          </div>
                        </div>
                        <div className={styles.alertRight}>
                          <button 
                            className={styles.iconBtn} 
                            onClick={() => handleCopyText(log.signature, `sig-${idx}`)}
                            title="Copy transaction signature"
                          >
                            {copiedId === `sig-${idx}` ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                          </button>
                          <button 
                            className={styles.reviewBtn} 
                            onClick={() => { playSynthesizedSound('click'); setActiveReviewLog(log); }}
                          >
                            Review
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Default fallback alerts */}
                    <div className={styles.alertItem}>
                      <div className={styles.alertLeft}>
                        <div className={styles.alertDateRow}>
                          <span className={styles.alertDot} />
                          <span className={styles.alertDate}>Mar 2, 2026 14:20:11</span>
                        </div>
                        <h4 className={styles.alertTitle}>Personally identifiable information detected in LLM prompts</h4>
                        <div className={styles.alertBadgeRow}>
                          <span className={styles.badgeModerate}>Moderate</span>
                          <span className={styles.alertTag}>Suspicious activity</span>
                          <span className={styles.alertTag}>Web exploits</span>
                        </div>
                      </div>
                      <div className={styles.alertRight}>
                        <button className={styles.iconBtn} onClick={() => handleCopyText("0x5a18b93b", "p1")}>
                          {copiedId === "p1" ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                        </button>
                        <button 
                          className={styles.reviewBtn} 
                          onClick={() => {
                            playSynthesizedSound('click');
                            setActiveReviewLog({
                              date: 'Mar 2, 2026', time: '14:20:11',
                              subject: 'Chatbot Agent Node',
                              action: 'Personally identifiable information detected in LLM prompts',
                              result: 'ALLOWED', signature: '0x5a18b93b',
                              severity: 'Moderate', category: 'Suspicious activity', type: 'Web application exploits'
                            });
                          }}
                        >
                          Review
                        </button>
                      </div>
                    </div>

                    <div className={styles.alertItem}>
                      <div className={styles.alertLeft}>
                        <div className={styles.alertDateRow}>
                          <span className={styles.alertDot} />
                          <span className={styles.alertDate}>Mar 2, 2026 13:02:45</span>
                        </div>
                        <h4 className={styles.alertTitle}>Traffic scored as attacks are reaching your origin</h4>
                        <div className={styles.alertBadgeRow}>
                          <span className={styles.badgeModerate}>Moderate</span>
                          <span className={styles.alertTag}>Suspicious activity</span>
                          <span className={styles.alertTag}>Web application exploits</span>
                        </div>
                      </div>
                      <div className={styles.alertRight}>
                        <button className={styles.iconBtn} onClick={() => handleCopyText("0xe3b72c11", "p2")}>
                          {copiedId === "p2" ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                        </button>
                        <button 
                          className={styles.reviewBtn} 
                          onClick={() => {
                            playSynthesizedSound('click');
                            setActiveReviewLog({
                              date: 'Mar 2, 2026', time: '13:02:45',
                              subject: 'Gateway Node 1',
                              action: 'Traffic scored as attacks are reaching your origin',
                              result: 'ALLOWED', signature: '0xe3b72c11',
                              severity: 'Moderate', category: 'Suspicious activity', type: 'Web application exploits'
                            });
                          }}
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.cardFooter}>
                    <a href="#logs" className={styles.viewAllLink} onClick={(e) => { e.preventDefault(); playSynthesizedSound('click'); setActiveSidebar('ATL (Ledger Logs)'); }}>
                      View all ({ledgerLogs.length + 2})
                    </a>
                  </div>
                </div>
              ) : (
                /* 2. Specific Action View Content: AIS / AZT / ADS / ATL */
                <div className={styles.singleViewCard}>
                  {/* AIS identities view */}
                  {(activeSidebar === 'AIS (Identities)' || activeSidebar === 'AIS (Identity & Keys)') && (
                    <>
                      <div className={styles.panelHeader}>
                        <h3 className={styles.panelTitle}>Identity Credentials (AIS)</h3>
                        <div className={styles.tabs}>
                          <button 
                            className={`${styles.tab} ${activeTab === 'sources' ? styles.activeTab : ''}`}
                            onClick={() => { playSynthesizedSound('click'); setActiveTab('sources'); }}
                          >
                            Active DIDs
                          </button>
                          <button 
                            className={`${styles.tab} ${activeTab === 'library' ? styles.activeTab : ''}`}
                            onClick={() => { playSynthesizedSound('click'); setActiveTab('library'); }}
                          >
                            Gateways
                          </button>
                        </div>
                      </div>

                      {activeTab === 'sources' ? (
                        <div className={styles.panelContent}>
                          <div className={styles.sectionBlock}>
                            <h4 className={styles.blockTitle}>Active Cryptographic DIDs</h4>
                            <p className={styles.blockSubtitle}>Manage decentralized identities bound to microservice nodes.</p>
                            
                            <div className={styles.itemsList}>
                              {identities.map((item, idx) => (
                                <div key={idx} className={styles.dataBox}>
                                  <div className={styles.boxLeft}>
                                    <div className={styles.iconCircle}>
                                      <Lock size={14} />
                                    </div>
                                    <div className={styles.boxText}>
                                      <div className={styles.boxName}>{item.name}</div>
                                      <div className={styles.boxStatus} style={{ fontFamily: 'monospace', fontSize: '9px' }}>{item.did}</div>
                                    </div>
                                  </div>
                                  <span className={styles.badgeAllowed} style={{ fontSize: '8px' }}>Active</span>
                                </div>
                              ))}
                            </div>

                            {showAddIdentity ? (
                              <form onSubmit={handleAddIdentity} className={styles.addSiteForm}>
                                <input 
                                  type="text" 
                                  placeholder="e.g. Chatbot Agent Service" 
                                  value={newIdentityName} 
                                  onChange={(e) => setNewIdentityName(e.target.value)}
                                  className={styles.siteInput}
                                  required
                                  autoFocus
                                />
                                <div className={styles.formBtns}>
                                  <button type="submit" className={styles.formBtnAdd}>Register DID</button>
                                  <button type="button" onClick={() => { playSynthesizedSound('click'); setShowAddIdentity(false); }} className={styles.formBtnCancel}>Cancel</button>
                                </div>
                              </form>
                            ) : (
                              <button className={styles.addBtn} onClick={() => { playSynthesizedSound('click'); setShowAddIdentity(true); }}>
                                <Plus size={14} />
                                <span>Register Identity Node</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className={styles.panelContentEmpty}>
                          <p>Gateways active. All incoming/outgoing microservice requests are protected by cryptographically secure key signatures.</p>
                        </div>
                      )}
                    </>
                  )}

                  {/* AZT Policies view */}
                  {(activeSidebar === 'AZT (Policies)' || activeSidebar === 'AZT (Zero Trust)') && (
                    <>
                      <div className={styles.panelHeader}>
                        <h3 className={styles.panelTitle}>Authorization Engine (AZT)</h3>
                        <div className={styles.tabs}>
                          <button 
                            className={`${styles.tab} ${activeTab === 'sources' ? styles.activeTab : ''}`}
                            onClick={() => { playSynthesizedSound('click'); setActiveTab('sources'); }}
                          >
                            Access Rules
                          </button>
                          <button 
                            className={`${styles.tab} ${activeTab === 'library' ? styles.activeTab : ''}`}
                            onClick={() => { playSynthesizedSound('click'); setActiveTab('library'); }}
                          >
                            Budget Profiles
                          </button>
                        </div>
                      </div>

                      {activeTab === 'sources' ? (
                        <div className={styles.panelContent}>
                          <div className={styles.sectionBlock}>
                            <h4 className={styles.blockTitle}>Active Zero-Trust Access Policies</h4>
                            <p className={styles.blockSubtitle}>Rules determining capability scopes and execution constraints for endpoints.</p>
                            
                            <div className={styles.itemsList}>
                              {policies.map((p, idx) => (
                                <div key={idx} className={styles.dataBox}>
                                  <div className={styles.boxLeft}>
                                    <div className={styles.iconCircle}>
                                      <Key size={14} />
                                    </div>
                                    <div className={styles.boxText}>
                                      <div className={styles.boxName}>{p.action}</div>
                                      <div className={styles.boxStatus}>
                                        {resolveIdentityName(p.subject)} &rarr; {p.capability}
                                      </div>
                                    </div>
                                  </div>
                                  <span className={p.effect === 'ALLOW' ? styles.badgeAllowed : styles.badgeDenied}>
                                    {p.effect}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {showAddPolicy ? (
                              <form onSubmit={handleAddPolicy} className={styles.addSiteForm}>
                                <label className={styles.formLabel}>Select Node Identity (AIS)</label>
                                <select 
                                  value={newPolicySubject} 
                                  onChange={(e) => setNewPolicySubject(e.target.value)}
                                  className={styles.formSelect}
                                >
                                  {identities.map((i, idx) => (
                                    <option key={idx} value={i.did}>{i.name}</option>
                                  ))}
                                </select>

                                <label className={styles.formLabel}>Target Capability (ADS)</label>
                                <select 
                                  value={newPolicyCap} 
                                  onChange={(e) => setNewPolicyCap(e.target.value)}
                                  className={styles.formSelect}
                                >
                                  {discoveryServices.map((s, idx) => (
                                    <option key={idx} value={s.capability}>{s.capability} ({s.name})</option>
                                  ))}
                                </select>

                                <label className={styles.formLabel}>Action Description</label>
                                <input 
                                  type="text" 
                                  placeholder="e.g. Read Customer Orders" 
                                  value={newPolicyAction} 
                                  onChange={(e) => setNewPolicyAction(e.target.value)}
                                  className={styles.siteInput}
                                  required
                                />

                                <label className={styles.formLabel}>Action Rule Effect</label>
                                <select 
                                  value={newPolicyEffect} 
                                  onChange={(e) => setNewPolicyEffect(e.target.value)}
                                  className={styles.formSelect}
                                >
                                  <option value="ALLOW">ALLOW</option>
                                  <option value="DENY">DENY</option>
                                </select>

                                <div className={styles.formBtns} style={{ marginTop: '6px' }}>
                                  <button type="submit" className={styles.formBtnAdd}>Apply Policy</button>
                                  <button type="button" onClick={() => { playSynthesizedSound('click'); setShowAddPolicy(false); }} className={styles.formBtnCancel}>Cancel</button>
                                </div>
                              </form>
                            ) : (
                              <button className={styles.addBtn} onClick={() => {
                                playSynthesizedSound('click');
                                if (identities.length === 0 || discoveryServices.length === 0) {
                                  alert("Please register identities and discovery endpoints first.");
                                  return;
                                }
                                setNewPolicySubject(identities[0].did);
                                setNewPolicyCap(discoveryServices[0].capability);
                                setShowAddPolicy(true);
                              }}>
                                <Plus size={14} />
                                <span>Add Access Policy Rule</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className={styles.panelContentEmpty}>
                          <p>Budgets enable rate limiting and financial limits on agent capability calls (e.g. restricting billing transactions to $500.00/day).</p>
                        </div>
                      )}
                    </>
                  )}

                  {/* ADS view */}
                  {activeSidebar === 'ADS (Discovery)' && (
                    <>
                      <div className={styles.panelHeader}>
                        <h3 className={styles.panelTitle}>Discovery Directory (ADS)</h3>
                        <div className={styles.tabs}>
                          <button 
                            className={`${styles.tab} ${activeTab === 'sources' ? styles.activeTab : ''}`}
                            onClick={() => { playSynthesizedSound('click'); setActiveTab('sources'); }}
                          >
                            Service Registry
                          </button>
                          <button 
                            className={`${styles.tab} ${activeTab === 'library' ? styles.activeTab : ''}`}
                            onClick={() => { playSynthesizedSound('click'); setActiveTab('library'); }}
                          >
                            Peers
                          </button>
                        </div>
                      </div>

                      {activeTab === 'sources' ? (
                        <div className={styles.panelContent}>
                          <div className={styles.sectionBlock}>
                            <h4 className={styles.blockTitle}>Verified Endpoint Directories</h4>
                            <p className={styles.blockSubtitle}>Registry map to resolve and locate capabilities dynamically.</p>
                            
                            <div className={styles.itemsList}>
                              {discoveryServices.map((s, idx) => (
                                <div key={idx} className={styles.dataBox}>
                                  <div className={styles.boxLeft}>
                                    <div className={styles.iconCircle}>
                                      <Globe size={14} />
                                    </div>
                                    <div className={styles.boxText}>
                                      <div className={styles.boxName}>{s.name}</div>
                                      <div className={styles.boxStatus} style={{ fontFamily: 'monospace', fontSize: '9px' }}>
                                        {s.capability} &rarr; {s.url}
                                      </div>
                                    </div>
                                  </div>
                                  <span className={styles.badgeAllowed} style={{ fontSize: '8px' }}>Trust Score: {s.trustScore}</span>
                                </div>
                              ))}
                            </div>

                            {showAddService ? (
                              <form onSubmit={handleAddService} className={styles.addSiteForm}>
                                <input 
                                  type="text" 
                                  placeholder="Service Name (e.g. Customer CRM)" 
                                  value={newServiceName} 
                                  onChange={(e) => setNewServiceName(e.target.value)}
                                  className={styles.siteInput}
                                  required
                                />
                                <input 
                                  type="text" 
                                  placeholder="Capability (e.g. crm-v2)" 
                                  value={newServiceCap} 
                                  onChange={(e) => setNewServiceCap(e.target.value)}
                                  className={styles.siteInput}
                                  required
                                />
                                <input 
                                  type="text" 
                                  placeholder="Endpoint URL (e.g. https://crm.internal/api)" 
                                  value={newServiceUrl} 
                                  onChange={(e) => setNewServiceUrl(e.target.value)}
                                  className={styles.siteInput}
                                />
                                <div className={styles.formBtns}>
                                  <button type="submit" className={styles.formBtnAdd}>Publish Endpoint</button>
                                  <button type="button" onClick={() => { playSynthesizedSound('click'); setShowAddService(false); }} className={styles.formBtnCancel}>Cancel</button>
                                </div>
                              </form>
                            ) : (
                              <button className={styles.addBtn} onClick={() => { playSynthesizedSound('click'); setShowAddService(true); }}>
                                <Plus size={14} />
                                <span>Publish Capability Endpoint</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className={styles.panelContentEmpty}>
                          <p>No external federated peer registries connected. You are resolving services locally.</p>
                        </div>
                      )}
                    </>
                  )}

                  {/* ATL Ledger Logs view */}
                  {(activeSidebar === 'ATL (Ledger Logs)' || activeSidebar === 'Decentralized Ledger') && (
                    <>
                      <div className={styles.panelHeader}>
                        <h3 className={styles.panelTitle}>Trust Ledger Logs (ATL)</h3>
                        <div className={styles.tabs}>
                          <button 
                            className={`${styles.tab} ${activeTab === 'sources' ? styles.activeTab : ''}`}
                            onClick={() => { playSynthesizedSound('click'); setActiveTab('sources'); }}
                          >
                            Append-Only Logs
                          </button>
                          <button 
                            className={`${styles.tab} ${activeTab === 'library' ? styles.activeTab : ''}`}
                            onClick={() => { playSynthesizedSound('click'); setActiveTab('library'); }}
                          >
                            Proofs
                          </button>
                        </div>
                      </div>

                      {activeTab === 'sources' ? (
                        <div className={styles.panelContent}>
                          <div className={styles.sectionBlock}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                              <div>
                                <h4 className={styles.blockTitle}>Verifiable Audit Trail</h4>
                                <p className={styles.blockSubtitle}>Ledger logs cryptographically signed at edge mesh gateways.</p>
                              </div>
                              <button className={styles.simulateBtn} onClick={handleSimulateTransaction}>
                                <Play size={12} />
                                <span>Simulate Request</span>
                              </button>
                            </div>
                            
                            <div className={styles.logsContainer}>
                              {ledgerLogs.map((log, idx) => (
                                <div key={idx} className={styles.logItem}>
                                  <div className={styles.logMeta}>
                                    <span className={styles.logTime}>{log.time}</span>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                      <span style={{ fontWeight: '600' }}>{log.subject}</span>
                                      <span style={{ color: '#4b5563' }}>{log.action}</span>
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                    <span className={log.result === 'ALLOWED' ? styles.badgeAllowed : styles.badgeDenied}>
                                      {log.result}
                                    </span>
                                    <span className={styles.logHash}>{log.signature}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.panelContentEmpty}>
                          <p>Anchor Merkle root hash: <code style={{ fontFamily: 'monospace' }}>0x7d39a1f28b49e30a9e...</code></p>
                          <p style={{ marginTop: '8px' }}>Ledger records are signed using cryptographically secure proofs for compliance audits.</p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Informational Custom Placeholder Views for other options */}
                  {activeSidebar !== 'AIS (Identities)' && activeSidebar !== 'AIS (Identity & Keys)' && 
                   activeSidebar !== 'AZT (Policies)' && activeSidebar !== 'AZT (Zero Trust)' && 
                   activeSidebar !== 'ADS (Discovery)' && activeSidebar !== 'ATL (Ledger Logs)' && 
                   activeSidebar !== 'Decentralized Ledger' && (
                    <div className={styles.panelContent}>
                      <h3 className={styles.panelTitle}>{activeSidebar} Configuration</h3>
                      <div style={{ border: '1px solid #e2e8f0', borderRadius: '4px', padding: '24px', backgroundColor: '#fafafb', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <div style={{ width: '40px', height: '40px', backgroundColor: '#ebf8ff', color: '#2b6cb0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
                            <Shield size={20} />
                          </div>
                          <div>
                            <h4 style={{ fontWeight: '700', fontSize: '14px' }}>enmero {activeSidebar} Module</h4>
                            <p style={{ fontSize: '12px', color: '#4b5563' }}>Enterprise compliance verification and network routing</p>
                          </div>
                        </div>
                        <hr style={{ border: 'none', borderBottom: '1px solid #e2e8f0', margin: '8px 0' }} />
                        <p style={{ fontSize: '13px', lineHeight: '1.5', color: '#1f2937' }}>
                          The enmero control plane is active. All inbound request streams mapped to this node scope are monitored continuously at edge proxies. Config profiles can be deployed locally using the `@enmero/sdk` client library.
                        </p>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                          <button className={styles.simulateBtn} onClick={() => { playSynthesizedSound('click'); alert(`${activeSidebar} rules are synchronized with edge clusters.`); }}>Sync Rules</button>
                          <button className={styles.formBtnCancel} onClick={() => { playSynthesizedSound('click'); setActiveSidebar('Overview'); }}>Return to Overview</button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Traffic Overview Row */}
              {activeSidebar === 'Overview' && (
                <div className={`${styles.trafficOverviewSection} ${tourStep === 5 ? styles.tourHighlighted : ''}`}>
                  <div className={styles.trafficRow}>
                    
                    {/* Card 1: Monthly Requests */}
                    <div className={styles.requestsCard}>
                      <h4 className={styles.cardSubTitle}>Monthly requests</h4>
                      <div className={styles.metricsRow}>
                        <div className={styles.metricItem}>
                          <span className={styles.metricLabel}>Total</span>
                          <span className={styles.metricVal}>274.82M</span>
                        </div>
                        <div className={styles.metricItem}>
                          <span className={styles.metricLabel}>
                            <span style={{ width: '6px', height: '6px', backgroundColor: '#f97316', borderRadius: '50%', display: 'inline-block' }} />
                            Mitigated
                          </span>
                          <span className={styles.metricVal}>29.37%</span>
                        </div>
                        <div className={styles.metricItem}>
                          <span className={styles.metricLabel}>
                            <span style={{ width: '6px', height: '6px', backgroundColor: '#3b82f6', borderRadius: '50%', display: 'inline-block' }} />
                            Served by Cloudflare
                          </span>
                          <span className={styles.metricVal}>30.43%</span>
                        </div>
                        <div className={styles.metricItem}>
                          <span className={styles.metricLabel}>
                            <span style={{ width: '6px', height: '6px', backgroundColor: '#115e59', borderRadius: '50%', display: 'inline-block' }} />
                            Served by origin
                          </span>
                          <span className={styles.metricVal}>40.20%</span>
                        </div>
                      </div>
                      
                      {/* Bar chart matching layout */}
                      <div className={styles.horizontalBarChart}>
                        <div className={styles.barSegment} style={{ width: '29.37%', backgroundColor: '#f97316' }} />
                        <div className={styles.barSegment} style={{ width: '30.43%', backgroundColor: '#3b82f6' }} />
                        <div className={styles.barSegment} style={{ width: '40.2%', backgroundColor: '#115e59' }} />
                      </div>
                    </div>

                    {/* Card 2: How you compare to your peers */}
                    <div className={styles.compareCard}>
                      <h4 className={styles.cardSubTitle}>How you compare to your peers</h4>
                      <span className={styles.compareSub}>From your last Security report (all enterprise domains)</span>
                      
                      <div className={styles.noticeBox}>
                        <div className={styles.noticeIcon}>
                          <AlertCircle size={16} />
                        </div>
                        <p className={styles.noticeText}>
                          Your industry hasn't been assigned. <a href="#industry" className={styles.noticeLink} onClick={(e) => { e.preventDefault(); playSynthesizedSound('click'); alert("Select your industry modal is mock-only."); }}>Select your industry</a> to see how your company compares to your peer.
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>

            {/* Right Column (Widgets) */}
            <div className={styles.rightColumn}>
              
              {/* Detection Tools Status List Widget */}
              <div className={`${styles.toolsCard} ${tourStep === 6 ? styles.tourHighlighted : ''}`}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardTitle}>Detection tools</span>
                </div>
                <div className={styles.toolsList}>
                  {[
                    { name: 'Web app exploits', status: '5/6 running', statusType: 'warn', count: 1 },
                    { name: 'DDoS attacks', status: 'All running', statusType: 'ok', count: 2 },
                    { name: 'Bot traffic', status: '1/2 running', statusType: 'warn', count: 1 },
                    { name: 'API abuse', status: 'All running', statusType: 'ok', count: 4 },
                    { name: 'Client-side abuse', status: 'All running', statusType: 'ok', count: 1 }
                  ].map((tool, idx) => (
                    <div key={idx} className={styles.toolItem}>
                      <div className={styles.toolLeft}>
                        <span className={styles.toolIcon}>
                          {tool.statusType === 'warn' ? (
                            <ShieldAlert size={14} className={styles.toolIconYellow} />
                          ) : (
                            <ShieldCheck size={14} className={styles.toolIconGreen} />
                          )}
                        </span>
                        <span className={styles.toolName}>{tool.name}</span>
                      </div>
                      <div className={styles.toolRight}>
                        <span className={styles.toolStatus}>{tool.status}</span>
                        <span className={styles.toolCountBadge}>{tool.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Updates & Feedback Widget */}
              <div className={styles.updatesCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardTitle}>Updates & feedback</span>
                </div>
                <div className={styles.updatesList}>
                  <div className={styles.updateItem}>
                    <span className={styles.updateTitle} onClick={() => { playSynthesizedSound('click'); alert("Opening feedback modal..."); }}>
                      <MessageSquare size={13} color="#0051c3" />
                      <span>Give feedback</span>
                    </span>
                    <p className={styles.updateDesc}>How is your experience with the dashboard?</p>
                  </div>
                  <div className={styles.updateItem}>
                    <span className={styles.updateTitle} onClick={() => { playSynthesizedSound('click'); alert("Opening changelog feed..."); }}>
                      <BookOpen size={13} color="#0051c3" />
                      <span>Cloudflare Changelog</span>
                    </span>
                    <p className={styles.updateDesc}>Our newest releases can be found here.</p>
                  </div>
                </div>
              </div>

              {/* Dashboard Tour Widget */}
              <div className={styles.tourCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardTitle}>Dashboard tour</span>
                </div>
                <div className={styles.tourCardContent}>
                  <div className={styles.tourGraphic}>
                    <div className={styles.tourGraphicRadar} />
                    <div className={styles.tourGraphicRadarInner} />
                    <div className={styles.tourGraphicCenter}>
                      <Shield size={16} />
                    </div>
                  </div>
                  <div className={styles.tourFooter}>
                    <span className={styles.tourTitleText}>Welcome Tour</span>
                    <button className={styles.startTourBtn} onClick={handleStartTour}>
                      Start Tour
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Interactive Dashboard Tour Modal Overlay */}
      {tourStep !== null && (
        <div className={styles.tourModal}>
          <div className={styles.tourModalHeader}>
            <span className={styles.tourModalStepNum}>Step {tourStep} of {tourSteps.length}</span>
            <button className={styles.tourModalClose} onClick={handleTourSkip}>
              <X size={14} />
            </button>
          </div>
          <div className={styles.tourModalBody}>
            <h4 className={styles.tourModalTitle}>{tourSteps[tourStep - 1].title}</h4>
            <p className={styles.tourModalDesc}>{tourSteps[tourStep - 1].description}</p>
          </div>
          <div className={styles.tourModalFooter}>
            <button className={styles.tourModalSkipBtn} onClick={handleTourSkip}>Skip Tour</button>
            <div className={styles.tourModalNavBtns}>
              {tourStep > 1 && (
                <button 
                  className={styles.tourModalBtnBack}
                  onClick={handleTourBack}
                >
                  Back
                </button>
              )}
              <button 
                className={styles.tourModalBtnNext}
                onClick={handleTourNext}
              >
                {tourStep === tourSteps.length ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Log Detailed Modal popup */}
      {activeReviewLog && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          fontFamily: 'sans-serif'
        }}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid #cbd5e1',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)', width: '500px', maxWidth: '90%',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '12px 16px', borderBottom: '1px solid #e2e8f0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              backgroundColor: '#f8fafc'
            }}>
              <span style={{ fontWeight: '700', fontSize: '14px', color: '#111827' }}>Review Audit Proof Details</span>
              <button 
                onClick={() => { playSynthesizedSound('click'); setActiveReviewLog(null); }} 
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }}
              >
                <X size={16} />
              </button>
            </div>
            
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600' }}>Event Action</span>
                <span style={{ fontSize: '13.5px', fontWeight: '600', color: '#1f2937' }}>{activeReviewLog.action}</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600' }}>Origin node</span>
                  <span style={{ fontSize: '12.5px', color: '#1f2937' }}>{activeReviewLog.subject}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600' }}>Verifiable Proof Hash</span>
                  <span style={{ fontSize: '12.5px', fontFamily: 'monospace', color: '#1f2937' }}>{activeReviewLog.signature}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600' }}>Audit Verification</span>
                  <span className={activeReviewLog.result === 'ALLOWED' ? styles.badgeAllowed : styles.badgeDenied} style={{ alignSelf: 'flex-start', margin: 0 }}>
                    {activeReviewLog.result === 'ALLOWED' ? 'Pass (Allowed)' : 'Block (Denied)'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600' }}>Event Timestamp</span>
                  <span style={{ fontSize: '12.5px', color: '#1f2937' }}>{activeReviewLog.date} {activeReviewLog.time}</span>
                </div>
              </div>

              <hr style={{ border: 'none', borderBottom: '1px solid #e2e8f0', margin: '4px 0' }} />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#6b7280', fontWeight: '600' }}>Cryptographic Proof Status</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#15803d', backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '4px', border: '1px solid #bbf7d0' }}>
                  <ShieldCheck size={16} />
                  <span style={{ fontSize: '12px', fontWeight: '600' }}>Proof validation check successful. Signed by enmero edge mesh gateways.</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button 
                className={styles.reviewBtn} 
                onClick={() => handleCopyText(JSON.stringify(activeReviewLog, null, 2), "log-raw")}
              >
                {copiedId === "log-raw" ? "Copied Raw Data!" : "Copy Raw Proof"}
              </button>
              <button 
                className={styles.formBtnAdd} 
                onClick={() => { playSynthesizedSound('click'); setActiveReviewLog(null); }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
