# DSO for SOTA

**Data Set Optimiser for State-of-the-Art Models**

[![Version](https://img.shields.io/badge/version-1.2.0--stable-blue.svg)](https://github.com/yourusername/dso-sota)
[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB.svg)](https://reactjs.org/)

> An enterprise-grade pipeline designed to rewrite, sanitize, and enhance conversational datasets for model training using Google's Gemini architecture with Chain-of-Thought reasoning.

---

## 🚀 Overview

DSO utilizes a **client-side parallel processing architecture** powered by web workers and the Google GenAI SDK. This allows for high-throughput processing of large JSON datasets (100k+ records) without server-side bottlenecks or data privacy risks.

### Key Features

| Feature | Description |
|---------|-------------|
| 🗄️ **High Volume Ingestion** | Process JSON datasets with 100,000+ entries using DOM virtualization techniques |
| 🔒 **Zero-Trust Privacy** | API keys and dataset content never leave your browser - all processing via direct-to-Google encrypted calls |
| ⚡ **Adaptive Throttling** | Dynamic concurrency controls (up to 10 concurrent threads) with intelligent rate limiting |
| 📦 **Robust Export** | One-click export in strict JSON format, ready for immediate fine-tuning ingestion |

---

## 🧠 Chain of Thought (CoT) Pipeline

DSO strictly adheres to a **two-step generation process** to ensure quality. Unlike standard rewrites, DSO forces the model to output a reasoning block before the final text.

```
┌─────────────────────────────────────┐
│  1. Input: Raw conversational JSON  │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│  2. Reasoning Phase (CoT)           │
│     • Analyze ambiguity             │
│     • Evaluate tone                 │
│     • Check grammatical structure   │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│  3. Generation Phase                │
│     Output refined dataset entry    │
└─────────────────────────────────────┘
```

---

## 📋 Prerequisites

- Modern web browser (Chrome, Firefox, Edge, Safari)
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))
- Valid JSON dataset

---

## 🛠️ Getting Started

### 1. Data Preparation

Ensure your input file is a **valid JSON Array**. Objects must contain one of the following keys:
- `text`
- `original`
- `content`
- `message`

**Example format:**
```json
[
  { "id": "1", "text": "hey u there?" },
  { "id": "2", "text": "need help plz" }
]
```

### 2. Configuration

1. Navigate to the **Configuration** tab
2. Paste your Google Gemini API key
3. Select your model:
   - `gemini-2.5-flash` - For speed and cost-efficiency
   - `gemini-3-pro` - For complex reasoning tasks

### 3. Execution & Monitoring

1. Click **Start Job**
2. Monitor real-time progress via the virtualized queue
3. Use dashboard metrics to track throughput
4. If failures occur, pause the job and adjust retry/delay settings

---

## ⚠️ Troubleshooting

| Symptom / Error Code | Root Cause | Recommended Action |
|----------------------|------------|-------------------|
| `429: Too Many Requests` | API quota exceeded for your tier | Reduce Concurrency to 1-2. Increase Delay to 1000ms |
| `403: Permission Denied` | Invalid API key or unauthorized model | Check API key in Settings. Ensure billing is enabled for Pro models |
| Browser Freezing | Extremely large dataset (>50MB raw) | Split JSON into chunks of 10k items |
| Invalid Format | Input JSON is not an array | Ensure root element is `[]`, not `{}` |

---

## 🏗️ Technical Architecture

- **Frontend**: React + TypeScript
- **Processing**: Web Workers for parallel processing
- **API Integration**: Google GenAI SDK
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### System Capabilities

- Client-side parallel processing with web workers
- DOM virtualization for massive datasets
- Direct-to-Google encrypted API calls
- Dynamic concurrency management
- Real-time progress monitoring
- Fault-tolerant retry mechanisms

---

## 📊 Performance

- **Throughput**: Process 100k+ entries
- **Concurrency**: Up to 10 parallel threads
- **Memory**: Optimized with DOM virtualization
- **Privacy**: Zero server-side data transmission

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👨‍💻 Author

**Nivas Salla**  
Lead Engineer  
Specializing in LLM infrastructure and dataset optimization pipelines

🌐 [learnapart.online](https://learnapart.online)

---

## 📄 License

© 2025 All Rights Reserved

---

## 🙏 Acknowledgments

- Google Gemini API for powering the LLM capabilities
- React community for excellent tooling
- Open-source contributors

---

## 📞 Support

For questions, issues, or feature requests, please:
- Open an issue on GitHub
- Visit [learnapart.online](https://learnapart.online)

---

**Built with ❤️ to democratize SOTA data preparation
