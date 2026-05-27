# AnarchKey

> The last API key manager you'll ever need.

---

## The Problem

Every developer has been there—API keys scattered across `.env` files, Slack messages, and sticky notes. When a key leaks (and they do), you're left scrambling through repositories, revoking access, and hoping nothing critical was exposed. The cost isn't just time; it's trust, security, and sometimes, compliance violations that carry real financial penalties.

**Hardcoded credentials remain the #1 source of data breaches in cloud environments.** Yet most teams still treat API key management as an afterthought—trading security for convenience.

---

## The Solution

**AnarchKey** is a purpose-built API key management platform that brings enterprise-grade security to teams of any size—without the enterprise-grade complexity.

Built on the principle that **security and usability shouldn't be trade-offs**, AnarchKey provides:

- **Military-grade encryption** — AES-256-GCM envelope encryption with hardware-backed key sharding
- **Zero-downtime key rotation** — Rotate keys in production without breaking existing integrations
- **Real-time security auditing** — Automated scans detect hardcoded keys and potential leakage before they become breaches
- **Granular usage analytics** — Understand exactly which keys are being used, where, and by whom
- **Developer-first SDKs** — Drop-in clients for Python and Node.js with a 3-line integration

---

## Why This Matters

In an era where a single leaked API key can expose millions of user records, proper secrets management isn't optional—it's foundational infrastructure. Yet existing solutions force a false choice: either pay enterprise prices for overbuilt features, or roll your own and inherit the security burden.

**AnarchKey bridges this gap.** It brings the security posture of a Fortune 500 KMS to indie developers and growing teams alike—at a fraction of the cost and complexity.

---

## Built With

- **Frontend:** React 19, Vite, Tailwind CSS — for a responsive, modern dashboard experience
- **Backend:** Node.js, Express, MongoDB — for scalable, document-based data persistence
- **Security:** JWT authentication, bcrypt hashing, request rate limiting — defense in depth
- **DevEx:** Modular SDK design with idiomatic APIs for Python and Node.js

---

## The Philosophy

> *"Stop compromising on security. AnarchKey provides military-grade encryption for your API keys with zero compromise on usability."*

This isn't marketing copy—it's the core design constraint that shaped every architectural decision. From the cryptographic primitives to the CLI workflow, every component exists to make secure secrets management the path of least resistance.

---

## Key Capabilities

| Capability | What It Means For You |
|------------|----------------------|
| **Project-based organization** | Isolate keys per environment (dev, staging, prod) or per microservice |
| **Role-based access control** | Define who can create, view, or rotate keys—no more shared credentials |
| **Usage logging & analytics** | Identify underutilized keys, detect anomalies, and optimize API spend |
| **Multi-language support** | Native SDKs that feel idiomatic, not like foreign adapters |
| **Self-hostable architecture** | Deploy on your own infrastructure when compliance demands it |

---

## What I Learned Building This

Building AnarchKey reinforced a fundamental truth about security tooling: **the best security is invisible security.** Every additional click, every forced context switch, every arcane command—each one increases the likelihood that developers will bypass the tool entirely.

The challenge wasn't implementing AES-256 (libraries exist for that). The challenge was making military-grade encryption feel as effortless as copying a string into a `.env` file—while actually being safer.

This project deepened my expertise in:
- Cryptographic architecture and key lifecycle management
- Designing developer experience for security-critical workflows
- Building full-stack applications with real-time monitoring capabilities
- Balancing security rigor with practical usability

---

## What's Next

- **Team collaboration features** — Shared workspaces with audit trails
- **Advanced alerting** — Webhook notifications for anomalous usage patterns
- **Expanded SDK support** — Go, Rust, and Ruby clients
- **Compliance certifications** — SOC 2 Type II and ISO 27001 alignment

---

*Built by developers, for developers. Because your secrets deserve better than a text file.*

---

**[Try AnarchKey Live →](https://anarchkey.vercel.app)**
