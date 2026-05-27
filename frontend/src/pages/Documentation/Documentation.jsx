import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Shield, BookOpen, Terminal, Code, Copy, Check, ChevronRight, ArrowLeft, Cpu, Key, HelpCircle, Layers, Server } from 'lucide-react';
import logo from '../../assets/logo.png';
import DecryptText from '../../components/ui/DecryptText';
import TerminalDemo from '../Landing/TerminalDemo';
import styles from './Documentation.module.css';

// Documentation content structure
const DOCS_DATA = {
  getting_started: {
    title: 'Getting Started',
    icon: <BookOpen size={18} />,
    items: {
      introduction: {
        title: 'Introduction',
        description: 'AnarchKey 2.0 is a military-grade secure API key vault and management service. It enables developers to eliminate hardcoded secrets, automate rotations, monitor usage statistics in real-time, and retrieve secrets securely via blazing-fast client SDKs.',
        content: (
          <div className={styles.extraContent}>
            <h4>Why AnarchKey?</h4>
            <p>Storing credentials in configuration files or directly in codebase invites catastrophic breaches. AnarchKey isolates your API keys in an encrypted central vault. When your application boots, it initializes a secure connection and fetches secrets dynamically in-memory. Zero secrets remain stored on disc or source control.</p>
            <div className={styles.callout}>
              <Shield size={20} className={styles.calloutIcon} />
              <div>
                <strong>Security Architecture:</strong> Our proprietary "Double-Handshake" authentication model uses temporary cryptographic salts (salt-hash token) generated on service startup, preventing replay attacks or token extraction.
              </div>
            </div>
          </div>
        )
      },
      architecture: {
        title: 'Security & Architecture',
        description: 'AnarchKey is designed with a zero-trust model in mind. Under this paradigm, secrets are encrypted in transit and only decrypted in application memory using multi-factor client handshakes.',
        content: (
          <div className={styles.extraContent}>
            <h4>The Double Handshake Flow</h4>
            <ol className={styles.numberedList}>
              <li>
                <strong>Service Initialization:</strong> The SDK calls `/api/v1/sdk/anarchkey_init` with verified user credentials. The server generates a unique cryptographic salt hash, saves it temporarily, and returns an initialization token.
              </li>
              <li>
                <strong>Secret Retrieval:</strong> All subsequent dynamic requests to `/api/v1/sdk/secrets` present both the project-specific <em>Access Key</em> and the startup <em>Initialization Token</em> inside the `x-anarchkey-init` header. 
              </li>
              <li>
                <strong>Auto-Decryption:</strong> If authentication parameters match, AnarchKey releases the target API key. The key resides purely in memory and is automatically cached locally by the SDK client for subsequent sub-millisecond retrieval.
              </li>
            </ol>
          </div>
        )
      }
    }
  },
  sdk_installation: {
    title: 'SDK Installation',
    icon: <Terminal size={18} />,
    items: {
      install_python: {
        title: 'Python SDK',
        description: 'Install the AnarchKey Python client via pip and initialize secure secret retrieval in your applications.',
        content: <TerminalDemo mode="python" />
      },
      install_node: {
        title: 'Node.js SDK',
        description: 'Install the AnarchKey Node.js client via npm and securely manage API keys in your applications.',
        content: <TerminalDemo mode="node" />
      }
    }
  },
  sdk_reference: {
    title: 'SDK Integration (Vault)',
    icon: <Cpu size={18} />,
    items: {
      sdk_init: {
        title: 'Initialize Service',
        description: 'Establish a secure handshake session between your application and the AnarchKey vault.',
        method: 'POST',
        endpoint: '/api/v1/sdk/anarchkey_init',
        params: [
          { name: 'username', type: 'string', desc: 'The username of the account owning the vault.', req: true },
          { name: 'password', type: 'string', desc: 'The password of the vault owner.', req: true }
        ],
        code: {
          curl: `curl -X POST "http://localhost:5001/api/v1/sdk/anarchkey_init" \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "developer",
    "password": "secure_password_123"
  }'`,
          python: `from AnarchKeyClient import AnarchKey

# Secure initialization triggers the first handshake
# and generates the salt-hash token automatically.
vault = AnarchKey.init(
    username="developer",
    password="secure_password_123"
)`,
          node: `const { AnarchKey } = require('anarchkey-client');

// Secure initialization triggers the first handshake
// and stores the salt-hash token in memory.
const vault = await AnarchKey.init({
  username: 'developer',
  password: 'secure_password_123'
});`
        },
        response: `{
  "token": "salt_hash_8f93a1b02e7c4f55a1d..."
}`
      },
      sdk_secrets: {
        title: 'Retrieve Secret',
        description: 'Fetch the decrypted API key or secret dynamically into your application\'s memory.',
        method: 'POST',
        endpoint: '/api/v1/sdk/secrets',
        headers: [
          { name: 'x-anarchkey-init', type: 'string', desc: 'The initialization token returned from anarchkey_init.', req: true }
        ],
        params: [
          { name: 'access_token', type: 'string', desc: 'The project-specific access token generated on project creation.', req: true },
          { name: 'secret_name', type: 'string', desc: 'The exact unique name of the key/secret to retrieve.', req: true }
        ],
        code: {
          curl: `curl -X POST "http://localhost:5001/api/v1/sdk/secrets" \\
  -H "Content-Type: application/json" \\
  -H "x-anarchkey-init: salt_hash_8f93a1b02e7c4f55a1d..." \\
  -d '{
    "access_token": "proj_acc_902a1b1d4e78f92...",
    "secret_name": "STRIPE_API_KEY"
  }'`,
          python: `# Fetch decrypted secret in-memory
# (Automatic local caching applied for high-performance requests)
stripe_key = vault.get_secret(
    access_token="proj_acc_902a1b1d4e78f92...",
    secret_name="STRIPE_API_KEY"
)
print(stripe_key) # Output: sk_live_51M3a...`,
          node: `// Fetch decrypted secret in-memory
// (Dynamic logging and tracking is fired asynchronously)
const stripeKey = await vault.getSecret({
  accessToken: 'proj_acc_902a1b1d4e78f92...',
  secretName: 'STRIPE_API_KEY'
});

console.log(stripeKey); // Output: sk_live_51M3a...`
        },
        response: `{
  "secret_name": "STRIPE_API_KEY",
  "api_key": "sk_live_51M3a58F102dA1d89B..."
}`
      }
    }
  }
};

const Documentation = () => {
  const [activeSection, setActiveSection] = useState('introduction');
  const [activeLang, setActiveLang] = useState('curl');
  const [copiedText, setCopiedText] = useState(false);
  const [copiedType, setCopiedType] = useState('');

  // Find active items
  let activeData = null;
  let activeCatId = '';
  
  for (const [catId, cat] of Object.entries(DOCS_DATA)) {
    if (cat.items[activeSection]) {
      activeData = cat.items[activeSection];
      activeCatId = catId;
      break;
    }
  }

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setCopiedType(type);
    setTimeout(() => {
      setCopiedText(false);
      setCopiedType('');
    }, 2000);
  };

  const getMethodClass = (method) => {
    if (!method) return '';
    switch (method.toUpperCase()) {
      case 'GET': return styles.getMethod;
      case 'POST': return styles.postMethod;
      case 'PUT': return styles.putMethod;
      case 'DELETE': return styles.deleteMethod;
      default: return '';
    }
  };

  return (
    <div className={styles.container}>
      {/* Navbar Header */}
      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          <Link to="/" className={styles.backBtn}>
            <ArrowLeft size={16} />
            <span>Home</span>
          </Link>
          <div className={styles.logo}>
            <img src={logo} alt="AnarchKey Logo" className={styles.logoImg} />
            <span>AnarchKey <span className={styles.docsBadge}>Docs</span></span>
          </div>
          <div className={styles.navActions}>
            <Link to="/dashboard" className={styles.consoleLinkBtn}>
              Developer Console
            </Link>
          </div>
        </div>
      </nav>

      {/* Main docs grid layout */}
      <div className={styles.mainLayout}>
        
        {/* LEFT COLUMN: Sidebar Navigation */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarInner}>
            {Object.entries(DOCS_DATA).map(([catId, cat]) => (
              <div key={catId} className={styles.navGroup}>
                <div className={styles.navGroupTitle}>
                  {cat.icon}
                  <span>{cat.title}</span>
                </div>
                <div className={styles.navItemsList}>
                  {Object.entries(cat.items).map(([itemId, item]) => (
                    <button
                      key={itemId}
                      className={`${styles.navItem} ${activeSection === itemId ? styles.activeNavItem : ''}`}
                      onClick={() => setActiveSection(itemId)}
                    >
                      <span>{item.title}</span>
                      {item.method && (
                        <span className={`${styles.methodBadge} ${getMethodClass(item.method)}`}>
                          {item.method}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* MIDDLE COLUMN: Documentation Details */}
        <section className={styles.contentColumn}>
          {activeData && (
            <div className={styles.contentInner}>
              <div className={styles.breadcrumbs}>
                <span>{DOCS_DATA[activeCatId].title}</span>
                <ChevronRight size={14} />
                <span className={styles.activeBreadcrumb}>{activeData.title}</span>
              </div>

              <h1 className={styles.sectionTitle}>
                <DecryptText text={activeData.title} reveal={true} />
              </h1>

              {activeData.endpoint && (
                <div className={styles.endpointBar}>
                  <span className={`${styles.methodTag} ${getMethodClass(activeData.method)}`}>
                    {activeData.method}
                  </span>
                  <code className={styles.endpointPath}>{activeData.endpoint}</code>
                </div>
              )}

              <p className={styles.sectionDesc}>{activeData.description}</p>

              {activeData.content && (
                <div className={styles.richContent}>
                  {activeData.content}
                </div>
              )}

              {/* Headers Table */}
              {activeData.headers && activeData.headers.length > 0 && (
                <div className={styles.paramsSection}>
                  <h3>Headers</h3>
                  <table className={styles.paramsTable}>
                    <thead>
                      <tr>
                        <th>Header</th>
                        <th>Type</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeData.headers.map((h, i) => (
                        <tr key={i}>
                          <td>
                            <code className={styles.paramName}>{h.name}</code>
                            {h.req && <span className={styles.requiredTag}>required</span>}
                          </td>
                          <td><span className={styles.paramType}>{h.type}</span></td>
                          <td className={styles.paramDesc}>{h.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Request Parameters Table */}
              {activeData.params && activeData.params.length > 0 && (
                <div className={styles.paramsSection}>
                  <h3>Body Parameters</h3>
                  <table className={styles.paramsTable}>
                    <thead>
                      <tr>
                        <th>Parameter</th>
                        <th>Type</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeData.params.map((p, i) => (
                        <tr key={i}>
                          <td>
                            <code className={styles.paramName}>{p.name}</code>
                            {p.req && <span className={styles.requiredTag}>required</span>}
                          </td>
                          <td><span className={styles.paramType}>{p.type}</span></td>
                          <td className={styles.paramDesc}>{p.desc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: Code View Panel */}
        <section className={styles.codeColumn}>
          {activeData && activeData.code ? (
            <div className={styles.codeInner}>
              <div className={styles.codeTabsBar}>
                <div className={styles.langSelectors}>
                  <button
                    className={`${styles.langTab} ${activeLang === 'curl' ? styles.activeLangTab : ''}`}
                    onClick={() => setActiveLang('curl')}
                  >
                    cURL
                  </button>
                  <button
                    className={`${styles.langTab} ${activeLang === 'python' ? styles.activeLangTab : ''}`}
                    onClick={() => setActiveLang('python')}
                  >
                    Python Client
                  </button>
                  <button
                    className={`${styles.langTab} ${activeLang === 'node' ? styles.activeLangTab : ''}`}
                    onClick={() => setActiveLang('node')}
                  >
                    Node.js Client
                  </button>
                </div>

                <button
                  onClick={() => copyToClipboard(activeData.code[activeLang], 'request')}
                  className={styles.copyBtn}
                  title="Copy Request Code"
                >
                  {copiedText && copiedType === 'request' ? (
                    <>
                      <Check size={14} className={styles.successColor} />
                      <span className={`${styles.copyText} ${styles.successColor}`}>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span className={styles.copyText}>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className={styles.codeContainer}>
                <pre className={styles.codeBlock}>
                  <code>{activeData.code[activeLang]}</code>
                </pre>
              </div>

              {activeData.response && (
                <div className={styles.responseContainer}>
                  <div className={styles.responseTabsBar}>
                    <span>Response Payload</span>
                    <button
                      onClick={() => copyToClipboard(activeData.response, 'response')}
                      className={styles.copyBtn}
                      title="Copy Response JSON"
                    >
                      {copiedText && copiedType === 'response' ? (
                        <Check size={14} className={styles.successColor} />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                  <pre className={styles.responseBlock}>
                    <code>{activeData.response}</code>
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.emptyCodeState}>
              <Terminal size={32} className={styles.emptyIcon} />
              <h4>Sandbox Environment</h4>
              <p>Select an API route in the sidebar to review the integration code examples and response schemas.</p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default Documentation;
