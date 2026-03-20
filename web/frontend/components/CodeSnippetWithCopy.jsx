import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "./CodeSnippet.css";

const QuickSetupGuide = () => {
  const [copied, setCopied] = useState({});

  const codeSnippets = {
    sectionName: `
mx-brand-logo
    `,
    headingIdea: `
Trusted by ambitious retail brands
    `,
    bestPractice: `
Upload PNG or SVG logos with similar aspect ratios for a cleaner marquee rhythm.
    `,
  };

  const copyIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="28px"
      viewBox="0 -960 960 960"
      width="28px"
      fill="#fff"
    >
      <g transform="scale(1, 1)">
        <path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" />
      </g>
    </svg>
  );

  const copiedIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="28px"
      viewBox="0 -960 960 960"
      width="28px"
      fill="#f5f5f5"
    >
      <g transform="scale(0.9, 0.9)">
        <path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z" />
      </g>
    </svg>
  );

  const handleCopy = (key) => {
    navigator.clipboard.writeText(codeSnippets[key].trim());
    setCopied((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => setCopied((prev) => ({ ...prev, [key]: false })), 300);
  };

  return (
    <div className="setup-guide-container">
      <h2>Theme Editor Notes</h2>

      <div className="whishlist-basic-setup">
        <h4>Quick Reference</h4>
        <div className="instruction-points">
          <h3>Section name to look for</h3>
          <p>
            Merchants can add the feature directly from the theme editor by
            choosing the app section below.
          </p>
          <div className="copy-code-flex">
            <SyntaxHighlighter language="text" style={oneDark}>
              {codeSnippets.sectionName}
            </SyntaxHighlighter>
            <button
              onClick={() => handleCopy("sectionName")}
              className="code-sinppet-btn"
            >
              {copied.sectionName ? copiedIcon : copyIcon}
            </button>
          </div>
        </div>

        <div className="instruction-points">
          <h3>Suggested heading copy</h3>
          <p>
            Use a short credibility-focused heading above the marquee for better
            visual impact.
          </p>
          <div className="copy-code-flex">
            <SyntaxHighlighter language="text" style={oneDark}>
              {codeSnippets.headingIdea}
            </SyntaxHighlighter>
            <button
              onClick={() => handleCopy("headingIdea")}
              className="code-sinppet-btn"
            >
              {copied.headingIdea ? copiedIcon : copyIcon}
            </button>
          </div>
        </div>
      </div>

      <div className="whishlist-adavance-setup">
        <h4>Best Practice</h4>
        <div className="instruction-points">
          <h3>Prepare logos before upload</h3>
          <p>
            Consistent logo proportions help the marquee feel more premium and
            reduce uneven spacing.
          </p>
          <div className="copy-code-flex">
            <SyntaxHighlighter language="text" style={oneDark}>
              {codeSnippets.bestPractice}
            </SyntaxHighlighter>
            <button
              onClick={() => handleCopy("bestPractice")}
              className="code-sinppet-btn"
            >
              {copied.bestPractice ? copiedIcon : copyIcon}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickSetupGuide;
