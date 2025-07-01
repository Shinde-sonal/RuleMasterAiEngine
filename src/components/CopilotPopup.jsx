// src/components/CopilotPopup.jsx - With "AI is thinking..." indicator

import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/CopilotPopup.module.css'; // Confirmed correct CSS module name
import { chatBot } from '../services/api-service';
import { useRuleContext } from '../contexts/RuleContext'; // Import useRuleContext

function CustomChatPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! How can I help you with your rules today?" }
  ]);
  const [isThinking, setIsThinking] = useState(false); // New state for thinking indicator
  const messagesEndRef = useRef(null);

  const { fetchRules } = useRuleContext();

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]); // Add isThinking to dependency array so it scrolls when thinking state changes

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setIsThinking(true); // Set thinking to true when message is sent

    try {
      const result = await chatBot(null, input); // realmFromArg is handled by interceptor

      const botMessageContent = result.response || result.message || JSON.stringify(result);
      const botMessage = { role: 'assistant', content: botMessageContent };
      setMessages((prevMessages) => [...prevMessages, botMessage]);

      console.log("Chatbot interaction successful. Triggering rule list refresh.");
      await fetchRules();

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { role: 'assistant', content: `Error: ${error.message || 'Something went wrong.'}` };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsThinking(false); // Set thinking to false when response is received (or error occurs)
    }
  };

  return (
    <>
      <button className={styles.fab} onClick={togglePopup}>
        🤖
      </button>

      {isOpen && (
        <div className={styles.chatPopup}>
          <div className={styles.chatHeader}>
            <span>RuleMaster AI Copilot</span>
            <button onClick={togglePopup} className={styles.closeButton}>X</button>
          </div>
          <div className={styles.chatBody}>
            {messages.map((msg, index) => (
              <div key={index} className={`${styles.message} ${styles[msg.role]}`}>
                <div className={styles.messageContent}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isThinking && ( // Conditionally render thinking indicator
              <div className={`${styles.message} ${styles.assistant}`}>
                <div className={styles.messageContent}>
                  <div className={styles.typingIndicator}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form className={styles.chatInputForm} onSubmit={handleSendMessage}>
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask your copilot..."
              className={styles.chatInput}
            />
            <button type="submit" className={styles.sendButton}>Send</button>
          </form>
        </div>
      )}
    </>
  );
}

export default CustomChatPopup;