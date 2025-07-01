// src/contexts/RuleContext.jsx
import React, { createContext, useContext } from 'react';

// 1. Create the Context
// It's initialized with 'null' because the actual value will be provided by the Provider.
const RuleContext = createContext(null);

// 2. Custom Hook to Consume the Context
// This hook makes it easy and safe to use the context in functional components.
export const useRuleContext = () => {
  const context = useContext(RuleContext);
  if (!context) {
    // This check ensures that 'useRuleContext' is always called within a <RuleProvider>.
    // If not, it throws an error, helping you debug incorrect usage.
    throw new Error('useRuleContext must be used within a RuleProvider');
  }
  return context; // Returns the value passed to the Provider's 'value' prop
};

// 3. Provider Component
// This component "provides" the value to any component wrapped inside it.
// 'children' is a special prop that represents whatever JSX is nested inside the Provider.
// 'fetchRules' is the function that we want to make available throughout our app.
export const RuleProvider = ({ children, fetchRules }) => {
  // The 'value' prop of RuleContext.Provider is what all consumers will receive.
  // Here, we provide an object containing the 'fetchRules' function.
  return (
    <RuleContext.Provider value={{ fetchRules }}>
      {children}
    </RuleContext.Provider>
  );
};