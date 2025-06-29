// src/components/Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/HomePage.module.css';
import aiIllustration from '../assets/ai-chatbot-illustration.jpeg'; // <--- NEW: Import your local image

function Home() {
  const navigate = useNavigate();

  const handleGetStartedClick = () => {
    navigate('/dashboard'); // Redirect to the /dashboard route
  };

  return (
    <div className={styles.homeContainer}>
      {/* Hero Section: Catchy title and brief overview */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            RuleMaster AI: <br />Your **AI-Powered Rules Engine** for Smart Automation
          </h1>
          <p className={styles.heroSubtitle}>
            Define, manage, and apply custom business rules with unprecedented ease, powered by
            natural language and an intuitive chatbot interface.
          </p>
          <div className={styles.heroActions}>
            <button className={styles.primaryButton} onClick={handleGetStartedClick}>
              Get Started with RuleMaster AI
            </button>
            <button className={styles.secondaryButton}>Learn More</button>
          </div>
        </div>
        {/* The Image Placeholder */}
        <div className={styles.heroImagePlaceholder}>
          <img
            src={aiIllustration} // <--- UPDATED: Referencing the imported image variable
            alt="AI Logic Automation Illustration - Chatbot"
            className={styles.heroImage}
          />
        </div>
      </section>

      {/* Introduction Section (rest of your Home.jsx content) */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>What is RuleMaster AI?</h2>
        <p className={styles.sectionText}>
          RuleMaster AI is a cutting-edge B2B solution meticulously designed to empower business users
          to define, manage, and dynamically apply custom business rules. Its core innovation lies in an
          intuitive **chatbot interface**, allowing you to express complex "if-then" logic in natural language.
          These intelligently crafted rules are then persistently stored and can be applied to various data inputs
          to automate critical decisions or calculations, such as structuring commission payouts or
          enforcing content moderation guidelines.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Our Goal: Seamless Automation for Every Business</h2>
        <p className={styles.sectionText}>
          Our primary goal with RuleMaster AI is to provide a **flexible, user-friendly, and scalable platform**
          that enables even non-technical users to automate conditional logic and decision-making processes.
          This dramatically reduces manual effort, ensures the consistent application of business rules
          across diverse contexts, and streamlines operations. For highly complex or asynchronous logic,
          the platform is engineered to allow advanced users to author and persist custom JavaScript functions
          for robust runtime use and reuse.
        </p>
      </section>

      <section className={styles.capabilitiesSection}>
        <h2 className={styles.sectionTitle}>Key Capabilities</h2>
        <div className={styles.capabilitiesGrid}>
          <div className={styles.capabilityCard}>
            <span className={styles.capabilityIcon}>✍️</span>
            <h3 className={styles.capabilityTitle}>Intuitive Rule Definition</h3>
            <p className={styles.capabilityDescription}>
              Define new rules using natural language via the chatbot (FR1). The system intelligently parses your input into a structured format (FR2) and clarifies ambiguities (FR6), supporting complex logical (FR3) and comparison (FR4) operators.
            </p>
          </div>
          <div className={styles.capabilityCard}>
            <span className={styles.capabilityIcon}>🚀</span>
            <h3 className={styles.capabilityTitle}>Dynamic Rule Application</h3>
            <p className={styles.capabilityDescription}>
              Apply active rules to various data inputs via API, chatbot, or dedicated fields (FR13). RuleMaster AI returns precise outcomes (FR14), handles multiple rule sets (FR15), and manages prioritization for seamless execution (FR16).
            </p>
          </div>
          <div className={styles.capabilityCard}>
            <span className={styles.capabilityIcon}>🗂️</span>
            <h3 className={styles.capabilityTitle}>Robust Storage & Management</h3>
            <p className={styles.capabilityDescription}>
              All rules are securely stored (FR8) and easily managed. View, edit (FR10), activate/deactivate (FR11), and delete (FR12) your rules with ease through a dedicated UI or the chatbot, simplifying your workflow.
            </p>
          </div>
          <div className={styles.capabilityCard}>
            <span className={styles.capabilityIcon}>🔔</span>
            <h3 className={styles.capabilityTitle}>Diverse Action Types</h3>
            <p className={styles.capabilityDescription}>
              Beyond logic, define powerful actions: automated calculations (e.g., percentages, fixed amounts), instant notifications (alerts), and intelligent categorization or tagging of data (FR5), automating a wide range of business processes.
            </p>
          </div>
          <div className={styles.capabilityCard}>
            <span className={styles.capabilityIcon}>🧠</span>
            <h3 className={styles.capabilityTitle}>Continuous AI Learning</h3>
            <p className={styles.capabilityDescription}>
              Our chatbot continuously learns from your corrections and preferences. This iterative feedback loop significantly improves the accuracy of rule parsing and generation over time (FR17), making the system smarter with every interaction.
            </p>
          </div>
          <div className={styles.capabilityCard}>
            <span className={styles.capabilityIcon}>🏢</span>
            <h3 className={styles.capabilityTitle}>Secure Multi-Tenant Architecture</h3>
            <p className={styles.capabilityDescription}>
              Designed for B2B, RuleMaster AI supports onboarding and managing multiple independent tenants (FR18). Each tenant's data and resources are logically or physically isolated (FR19), with robust, tenant-specific authentication (FR20).
            </p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Performance & Security You Can Trust</h2>
        <div className={styles.nfrGrid}>
          <div className={styles.nfrItem}>
            <h3 className={styles.nfrTitle}>Blazing-Fast Performance</h3>
            <p className={styles.nfrDescription}>
              Rule creation and storage occur in near real-time (NFR1). Rule application to data is highly efficient, completing common use cases ideally within 2-3 seconds (NFR2), ensuring your automations are always responsive.
            </p>
          </div>
          <div className={styles.nfrItem}>
            <h3 className={styles.nfrTitle}>Ironclad Security</h3>
            <p className={styles.nfrDescription}>
              Your user-defined rules and all associated data inputs are rigorously secured against unauthorized access or modification (NFR3). Access to all rule management functions is strictly authenticated (NFR4), protecting your critical business logic.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;