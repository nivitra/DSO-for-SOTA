import React from 'react';
import { Layers, Cpu, Zap, ShieldCheck, GitBranch, ArrowRight, Database, FileJson, Activity, AlertTriangle } from 'lucide-react';
import { Logo } from './Logo';

export const Documentation: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto custom-scrollbar">
      {/* Hero Section */}
      <div className="bg-aws-nav text-white py-12 px-8 border-b border-aws-border relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-aws-orange opacity-5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/10 p-2 rounded-sm backdrop-blur-sm border border-white/10">
              <Logo className="h-8 text-white" />
            </div>
            <span className="bg-aws-orange px-2 py-0.5 rounded-sm text-xs font-bold text-white uppercase tracking-widest shadow-sm">
              Technical Docs
            </span>
            <span className="text-slate-400 text-xs font-mono">v1.2.0-stable</span>
          </div>
          
          <h1 className="text-4xl font-bold mb-4 tracking-tight text-white">
            DSO for SOTA <span className="font-light text-slate-400 block text-2xl mt-2">Data Set Optimiser for State-of-the-Art Models</span>
          </h1>
          
          <p className="text-lg text-slate-300 max-w-2xl leading-relaxed mt-6 border-l-2 border-aws-orange pl-4">
            An enterprise-grade pipeline designed to rewrite, sanitize, and enhance conversational datasets for model training using Google's Gemini architecture with Chain-of-Thought reasoning.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-5xl mx-auto w-full py-12 px-8 grid grid-cols-12 gap-12">
        
        {/* Main Content */}
        <div className="col-span-8 space-y-12">
          
          <section>
            <h2 className="text-xl font-bold text-aws-dark mb-4 flex items-center gap-2 pb-2 border-b border-aws-border">
              <Cpu className="text-aws-orange" size={20} />
              System Capabilities
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              DSO utilizes a client-side parallel processing architecture powered by web workers and the Google GenAI SDK. This allows for high-throughput processing of large JSON datasets (100k+ records) without server-side bottlenecks or data privacy risks.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-aws-border rounded-sm bg-aws-light hover:bg-white transition-colors hover:shadow-sm group">
                <h3 className="font-bold text-sm text-aws-dark mb-2 flex items-center gap-2 group-hover:text-aws-blue transition-colors">
                    <Database size={14} /> High Volume Ingestion
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Capable of parsing and rendering JSON datasets with 100,000+ entries using DOM virtualization techniques.
                </p>
              </div>
              <div className="p-4 border border-aws-border rounded-sm bg-aws-light hover:bg-white transition-colors hover:shadow-sm group">
                <h3 className="font-bold text-sm text-aws-dark mb-2 flex items-center gap-2 group-hover:text-aws-blue transition-colors">
                    <ShieldCheck size={14} /> Zero-Trust Privacy
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your API keys and dataset content never leave your browser. All processing is done via direct-to-Google encrypted calls.
                </p>
              </div>
              <div className="p-4 border border-aws-border rounded-sm bg-aws-light hover:bg-white transition-colors hover:shadow-sm group">
                <h3 className="font-bold text-sm text-aws-dark mb-2 flex items-center gap-2 group-hover:text-aws-blue transition-colors">
                    <Activity size={14} /> Adaptive Throttling
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dynamic concurrency controls allow you to saturate your API quota (up to 10 concurrent threads) or throttle back to avoid 429 errors.
                </p>
              </div>
              <div className="p-4 border border-aws-border rounded-sm bg-aws-light hover:bg-white transition-colors hover:shadow-sm group">
                <h3 className="font-bold text-sm text-aws-dark mb-2 flex items-center gap-2 group-hover:text-aws-blue transition-colors">
                    <FileJson size={14} /> Robust Export
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  One-click export of processed datasets in strict JSON format, ready for immediate fine-tuning ingestion.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-aws-dark mb-4 flex items-center gap-2 pb-2 border-b border-aws-border">
              <GitBranch className="text-aws-blue" size={20} />
              Chain of Thought (CoT) Pipeline
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              The system strictly adheres to a two-step generation process to ensure quality. Unlike standard rewrites, DSO forces the model to output a reasoning block before the final text.
            </p>
            
            <div className="border border-aws-border rounded-sm overflow-hidden mb-8 shadow-sm">
              <div className="bg-aws-nav px-4 py-2 text-xs font-mono text-slate-300 border-b border-slate-700 flex items-center justify-between">
                <span>Pipeline Execution Flow</span>
                <span className="text-aws-orange text-[10px]">ASYNC WORKER POOL</span>
              </div>
              <div className="p-6 bg-white flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs border border-slate-200 shadow-sm">1</div>
                  <div className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-sm text-xs font-mono text-slate-600">Input: Raw conversational JSON</div>
                </div>
                <div className="flex justify-center"><ArrowRight className="rotate-90 text-slate-300" size={16}/></div>
                <div className="flex items-center gap-4">
                   <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs border border-purple-200 shadow-sm">2</div>
                   <div className="flex-1 p-3 bg-purple-50 border border-purple-200 rounded-sm text-xs">
                    <span className="font-bold block mb-1 text-purple-900">Reasoning Phase (CoT)</span>
                    <span className="text-purple-800/70">Analyze ambiguity, tone, and grammatical structure.</span>
                   </div>
                </div>
                <div className="flex justify-center"><ArrowRight className="rotate-90 text-slate-300" size={16}/></div>
                <div className="flex items-center gap-4">
                   <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200 shadow-sm">3</div>
                   <div className="flex-1 p-3 bg-blue-50 border border-blue-200 rounded-sm text-xs">
                    <span className="font-bold block mb-1 text-blue-900">Generation Phase</span>
                     <span className="text-blue-800/70">Output refined, high-quality dataset entry.</span>
                   </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-aws-dark mb-4 flex items-center gap-2 pb-2 border-b border-aws-border">
               <Layers size={20} className="text-emerald-600"/> Operational Guide
            </h2>
            
            <div className="space-y-6">
                <div>
                    <h3 className="font-bold text-sm text-slate-800 mb-2">1. Data Preparation</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        Ensure your input file is a valid JSON Array. Objects must contain one of the following keys: <code>text</code>, <code>original</code>, <code>content</code>, or <code>message</code>.
                    </p>
                    <div className="mt-2 bg-slate-50 border border-aws-border p-3 rounded-sm font-mono text-[10px] text-slate-700 shadow-inner">
                        [<br/>
                        &nbsp;&nbsp;&#123; "id": "1", "text": "hey u there?" &#125;,<br/>
                        &nbsp;&nbsp;&#123; "id": "2", "text": "need help plz" &#125;<br/>
                        ]
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-sm text-slate-800 mb-2">2. Configuration</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        Navigate to the <strong>Configuration</strong> tab. Paste your Google Gemini API key. Use <code>gemini-2.5-flash</code> for speed and cost-efficiency, or <code>gemini-3-pro</code> for complex reasoning tasks.
                    </p>
                </div>

                <div>
                    <h3 className="font-bold text-sm text-slate-800 mb-2">3. Execution & Monitoring</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        Click <strong>Start Job</strong>. The virtualized queue will update in real-time. Use the dashboard metrics to monitor throughput. If failures occur, pause the job and adjust the retry count or delay settings.
                    </p>
                </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-aws-dark mb-4 flex items-center gap-2 pb-2 border-b border-aws-border">
               <AlertTriangle size={20} className="text-red-500"/> Troubleshooting & Optimization
            </h2>
            <div className="overflow-hidden border border-aws-border rounded-sm shadow-sm">
                <table className="w-full text-xs text-left">
                    <thead className="bg-aws-light text-slate-700 font-bold border-b border-aws-border">
                        <tr>
                            <th className="p-3">Symptom / Error Code</th>
                            <th className="p-3">Root Cause</th>
                            <th className="p-3">Recommended Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-aws-border bg-white">
                        <tr>
                            <td className="p-3 font-mono text-red-600 font-bold">429: Too Many Requests</td>
                            <td className="p-3 text-slate-600">API quota exceeded for your tier.</td>
                            <td className="p-3 text-slate-600">Reduce Concurrency to 1-2. Increase Delay to 1000ms.</td>
                        </tr>
                        <tr>
                            <td className="p-3 font-mono text-red-600 font-bold">403: Permission Denied</td>
                            <td className="p-3 text-slate-600">Invalid API key or unauthorized model.</td>
                            <td className="p-3 text-slate-600">Check API key in Settings. Ensure billing is enabled for Pro models.</td>
                        </tr>
                        <tr>
                            <td className="p-3 font-mono text-aws-dark font-bold">Browser Freezing</td>
                            <td className="p-3 text-slate-600">Extremely large dataset (>50MB raw).</td>
                            <td className="p-3 text-slate-600">Split JSON into chunks of 10k items. App uses virtualization but memory limits exist.</td>
                        </tr>
                         <tr>
                            <td className="p-3 font-mono text-aws-dark font-bold">Invalid Format</td>
                            <td className="p-3 text-slate-600">Input JSON is not an array.</td>
                            <td className="p-3 text-slate-600">Ensure root element is <code>[]</code>, not <code>&#123;&#125;</code>.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
          </section>

        </div>

        {/* Sidebar */}
        <div className="col-span-4 space-y-6">
          <div className="bg-white border border-aws-border p-6 shadow-sm rounded-sm">
            <h3 className="text-sm font-bold text-aws-dark mb-4 uppercase tracking-wider border-b border-slate-100 pb-2">About the Author</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 font-bold shadow-inner">NS</div>
              <div>
                <div className="font-bold text-sm text-aws-dark">Nivas Salla</div>
                <div className="text-xs text-aws-blue font-medium">Lead Engineer</div>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Specializing in LLM infrastructure and dataset optimization pipelines. Designed and developed this tool to democratize SOTA data preparation.
            </p>
          </div>

          <div className="bg-aws-nav p-6 rounded-sm text-white shadow-md">
            <div className="flex items-center gap-2 mb-3 border-b border-slate-700 pb-2">
              <Zap className="text-aws-orange" size={16} />
              <h3 className="font-bold text-sm">learnapart.online</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Empowering developers with advanced AI tooling and educational resources.
            </p>
            <div className="text-[10px] text-slate-500 font-mono mt-2">
              © 2025 All Rights Reserved
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};