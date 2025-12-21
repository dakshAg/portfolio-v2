---
title: "Automating Partner Onboarding at Scale"
description: "AI Engineering in Production: Automating the Trust Layer with Gemini and n8n"
pubDate: 2025-12-22
updatedDate: 2025-12-22
heroImage: "/images/automation.png"
tags: ["AI", "automation", "logistics"]
draft: false
---
### **Executive Summary**

We are currently processing hundreds of new partner applications daily. The previous operational model—reliant on manual human verification—reached a breaking point, creating a linear cost function that scaled poorly with growth.

We have successfully deployed an automated conversational pipeline using **WhatsApp, n8n, Cloudflare, and Gemini 2.5 Flash**. This architecture shifts the burden of data collection, initial validation, and document OCR from human operators to AI agents. Humans now remain in the loop strictly for high-level fraud detection and edge cases.

**Key Outcome:** We have decoupled partner growth from operational headcount.

---

### **1. The Market Friction: Operational Drag**

Our partner acquisition funnel faces a classic "high volume, low complexity" bottleneck.

* **The Volume:** Hundreds of partners onboard daily.
* **The Inefficiency:** Ops teams spend 80% of their time answering the same ten questions ("What is the status?", "Which doc do I upload?") and manually transcribing text from images.
* **The Channel Conflict:** While our backend requires structured data, our partners operate primarily on mobile. Forcing them to download a dedicated app causes significant drop-off. They live on WhatsApp; we need to meet them there.
* **The Risk:** When humans are overwhelmed by volume, scrutiny drops. Fake or expired documents slip through the cracks due to fatigue.

### **2. The Solution Thesis: Asymmetric Automation**

We did not build a "chatbot." We built an automated compliance officer.

By leveraging the **WhatsApp Business API** as the frontend, we remove user friction. By utilizing **Gemini 2.5 Flash** as the intelligence layer, we can instantly validate documents and answer queries.

The new workflow allows the system to:

1. **Ingest & Classify:** Instantly categorize user intent (query vs. submission).
2. **Validate:** Use Computer Vision to read ID cards and Licenses.
3. **Filter:** AI detects red flags—mismatched names, expired dates, or obvious forgeries—before a human ever sees the file.
4. **Escalate:** Only "green-lit" or ambiguous applications reach the human verification queue.

---

### **3. Architecture & Technical Strategy**

Our stack was chosen for **velocity, observability, and cost-efficiency**. We avoided heavy, bespoke backend services in favor of a composable architecture.
<img src="/images/ai.png" alt="AI Partner Onboarding Architecture Diagram" style="display: block; margin: 2rem auto; max-width: 700px; width: 100%;" />


**The Stack:**

* **Ingestion:** WhatsApp Business API  Cloudflare Workers
* **Orchestration:** n8n (Self-hosted)
* **Intelligence:** Gemini 2.5 Flash
* **State & Storage:** Supabase (PostgreSQL + Storage)
* **Human Loop:** Flutter App (for internal ops)

#### **Strategic Component Analysis**

**A. The Edge Layer: Cloudflare Workers**
Directly connecting Meta's webhooks to our orchestration layer was risky. We inserted Cloudflare Workers as a sanitization layer. It validates the cryptographic signature from Meta (security), filters out noise (like "message read" events), and routes only actionable payloads to n8n. This reduces compute costs on the orchestration side.

**B. The Intelligence: Gemini 2.5 Flash**
We selected Gemini 2.5 Flash for its high token throughput and low latency.

* *Why not Tool Calling?* While Gemini’s function calling is powerful, we found it inconsistent for complex, multi-step state management in this specific context.
* *The Fix:* We treat Gemini as the "Brain" but n8n as the "Hands." n8n handles the deterministic logic (database lookups, routing), while Gemini handles the probabilistic tasks (intent recognition, entity extraction, empathy). We are monitoring the **Gemini 3.0** release closely for n8n support to further compress latency.

**C. The Challenge: Media Handling on n8n**
A significant engineering hurdle was handling binary media from WhatsApp. n8n’s low-code environment struggles with complex multipart file uploads.

* *The Workaround:* We had to bypass standard nodes and construct raw HTTP requests within n8n to pipe binary streams directly into Supabase Storage. It is a brittle "hack," but it enables us to keep the architecture serverless without spinning up a dedicated container just for file handling.

---

### **4. Security & Governance**

In a system processing identity documents, trust is binary.

* **Trusted Ingestion:** We validate the X-Hub-Signature on every incoming packet. If it’s not signed by Meta, it’s dropped at the Cloudflare edge.
* **Row Level Security (RLS):** Our Supabase architecture uses strict RLS policies. The internal Flutter app used by our ops team cannot query data arbitrarily; agents are cryptographically restricted to viewing only the cases assigned to their specific queue.

### **5. Closing Thoughts**

This architecture represents a shift from "human-powered" to "human-verified."

By automating the "grunt work" of data extraction and initial validity checks (expiry, mismatch), we have freed our human capital to focus on what they do best: judgment. We aren't just processing forms faster; we are building a dataset of verified partners with higher fidelity and lower cost-per-acquisition.

The next phase involves migrating to Gemini 3.0 and moving n8n to a fully self-hosted cluster to eliminate third-party dependency as volume scales.