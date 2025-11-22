import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, Pause, Upload, Download, Activity, 
  Zap, Brain, CheckCircle2, AlertCircle, RefreshCw,
  Search, ChevronRight, ChevronDown, Settings, Server, ShieldAlert, RotateCcw, Layers, FileJson, Info, Loader2
} from 'lucide-react';
import { ConversationItem, PipelineConfig, ProcessingStatus, PipelineStats } from '../types';
import { GeminiService } from '../services/geminiService';
import { StatsCard } from './StatsCard';
import { DEFAULT_SYSTEM_INSTRUCTION, DEFAULT_PROMPT_TEMPLATE, SAMPLE_DATASET, MODELS } from '../constants';

// Reduced row height for higher density
const ROW_HEIGHT = 50; 

export const PipelineDashboard: React.FC = () => {
  // --- State ---
  const [items, setItems] = useState<ConversationItem[]>([]);
  const [config, setConfig] = useState<PipelineConfig>({
    provider: 'google',
    apiKey: process.env.API_KEY || '',
    model: 'gemini-2.5-flash',
    temperature: 0.7,
    concurrency: 2,
    delayMs: 500,
    maxRetries: 3,
    systemInstruction: DEFAULT_SYSTEM_INSTRUCTION,
    promptTemplate: DEFAULT_PROMPT_TEMPLATE,
    useNativeThinking: false,
    thinkingBudget: 1024
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'valid' | 'invalid'>('unknown');
  const [dragActive, setDragActive] = useState(false);
  
  // Combined View: Left panel is queue/settings, Right is details
  const [leftPanelTab, setLeftPanelTab] = useState<'queue' | 'settings'>('queue');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  
  // UI State for CoT
  const [cotExpanded, setCotExpanded] = useState(true);
  const [expandedStepIndex, setExpandedStepIndex] = useState<number | null>(0); // Default expand first step

  // Virtualization State
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(800);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Refs for processing loop
  const itemsRef = useRef<ConversationItem[]>([]);
  const isProcessingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const geminiServiceRef = useRef<GeminiService | null>(null);

  // Sync items state to ref for the worker loop
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Measure container for virtualization
  useEffect(() => {
    if (listContainerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerHeight(entry.contentRect.height);
        }
      });
      resizeObserver.observe(listContainerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [leftPanelTab]);

  // Initialize Service & Validate
  useEffect(() => {
    if (config.provider === 'google' && config.apiKey) {
      geminiServiceRef.current = new GeminiService(config.apiKey);
      setConnectionStatus('unknown'); // Reset status on key change
    }
  }, [config.provider, config.apiKey]);

  const validateConnection = async () => {
    if (!geminiServiceRef.current) return false;
    const isValid = await geminiServiceRef.current.validateConnection(config.model);
    setConnectionStatus(isValid ? 'valid' : 'invalid');
    return isValid;
  };

  // --- Actions ---

  const processFileContent = async (content: string) => {
    setIsUploading(true);
    // Small timeout to let UI render the loading state
    await new Promise(r => setTimeout(r, 100));

    try {
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch (e) {
        alert("JSON Syntax Error: The file is not valid JSON. Please check the syntax.");
        setIsUploading(false);
        return;
      }

      let dataArray = parsed;
      
      // Handle Wrapper Objects (e.g. { "data": [...] })
      if (!Array.isArray(parsed)) {
         if (typeof parsed === 'object' && parsed !== null) {
             // Find the first key that is an array
             const arrayKey = Object.keys(parsed).find(key => Array.isArray(parsed[key]));
             if (arrayKey) {
                 dataArray = parsed[arrayKey];
                 console.info(`Found array in key: ${arrayKey}`);
             } else {
                 alert("Invalid Structure: Uploaded JSON must be an Array or contain an Array property.");
                 setIsUploading(false);
                 return;
             }
         } else {
             alert("Invalid Structure: Root element must be an Array or Object.");
             setIsUploading(false);
             return;
         }
      }

      // Permissive Schema Validation
      let validCount = 0;
      const newItems: ConversationItem[] = [];
      
      dataArray.forEach((row: any, idx: number) => {
         let textContent: string | null = null;

         // Case 1: Row is a simple string
         if (typeof row === 'string') {
             textContent = row;
         } 
         // Case 2: Row is an object
         else if (typeof row === 'object' && row !== null) {
            // Try standard keys first
            textContent = row.text || row.original || row.content || row.message || row.prompt || row.input || row.instruction || row.dialogue || row.question;
            
            // Fallback: Find ANY string value if standard keys fail
            if (!textContent) {
                const values = Object.values(row);
                const firstString = values.find(v => typeof v === 'string' && v.length > 0) as string | undefined;
                if (firstString) textContent = firstString;
            }
         }

         if (textContent) {
           newItems.push({
             id: row.id || `ID-${String(idx + 1).padStart(5, '0')}`,
             original: textContent,
             status: ProcessingStatus.IDLE,
             retryCount: 0
           });
           validCount++;
         }
      });

      if (validCount === 0) {
        alert("Structure Error: Could not find any text content in the dataset. Ensure your JSON contains strings or objects with text fields.");
        setIsUploading(false);
        return;
      }

      if (validCount < dataArray.length) {
        console.warn(`Skipped ${dataArray.length - validCount} items that didn't match the schema.`);
      }

      setItems(newItems);
      setLeftPanelTab('queue'); // Switch to queue to see items
    } catch (err) {
      console.error(err);
      alert("Unknown Error: Failed to process file.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUploadTrigger = () => {
    if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset so same file can be selected
        fileInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        if (e.target?.result) {
            processFileContent(e.target.result as string);
        }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.type === "application/json" || file.name.endsWith('.json')) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    processFileContent(ev.target.result as string);
                }
            };
            reader.readAsText(file);
        } else {
            alert("Only JSON files are supported.");
        }
    }
  };

  const loadSampleData = () => {
    const samples = SAMPLE_DATASET.map(s => ({ 
      ...s, 
      status: ProcessingStatus.IDLE,
      retryCount: 0
    } as ConversationItem));
    setItems(samples);
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "DSO_Export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleRetryFailed = () => {
    setItems(prev => prev.map(item => 
      item.status === ProcessingStatus.FAILED 
        ? { ...item, status: ProcessingStatus.IDLE, error: undefined } 
        : item
    ));
  };

  // --- Pipeline Logic ---

  const processQueue = useCallback(async () => {
    if (!config.apiKey) {
      alert("Configuration Error: API Key is missing. Please configure it in the settings tab.");
      setLeftPanelTab('settings');
      return;
    }

    if (itemsRef.current.every(i => i.status === ProcessingStatus.COMPLETED)) {
      alert("Job Complete: All items have been processed.");
      return;
    }

    // Pre-flight check
    setIsProcessing(true); // Show loading state immediately
    
    // Only validate if we haven't already confirmed it's valid
    if (connectionStatus !== 'valid') {
       const isValid = await validateConnection();
       if (!isValid) {
         alert("Connection Error: Could not validate API Key with the selected model. Please check your credentials.");
         setIsProcessing(false);
         setLeftPanelTab('settings');
         return;
       }
    }

    isProcessingRef.current = true;
    abortControllerRef.current = new AbortController();

    // Processing Loop
    const processNextBatch = async () => {
      if (!isProcessingRef.current) return;

      // Find items that are IDLE
      const pendingItems = itemsRef.current.filter(i => i.status === ProcessingStatus.IDLE);
      
      if (pendingItems.length === 0) {
        setIsProcessing(false);
        isProcessingRef.current = false;
        return;
      }

      // Take a batch based on concurrency
      const batch = pendingItems.slice(0, config.concurrency);

      // Mark as processing
      setItems(prev => prev.map(item => 
        batch.find(b => b.id === item.id) 
          ? { ...item, status: ProcessingStatus.PROCESSING } 
          : item
      ));

      // Execute batch
      const promises = batch.map(async (item) => {
        if (!isProcessingRef.current) return;
        
        try {
          // Artificial delay to avoid rate limits if needed
          if (config.delayMs > 0) {
            await new Promise(r => setTimeout(r, config.delayMs));
          }

          if (!geminiServiceRef.current) throw new Error("Service not initialized");
          
          const result = await geminiServiceRef.current.processItem(item.original, config);
          
          setItems(prev => prev.map(i => 
            i.id === item.id 
              ? { 
                  ...i, 
                  status: ProcessingStatus.COMPLETED, 
                  rewritten: result.rewritten,
                  reasoning: result.reasoning,
                  timestamp: Date.now()
                }
              : i
          ));
        } catch (err: any) {
            setItems(prev => prev.map(i => {
                if (i.id !== item.id) return i;
                
                // Auto-retry logic logic could be added here in future, 
                // currently we just mark failed and count
                return { 
                    ...i, 
                    status: ProcessingStatus.FAILED, 
                    error: err.message,
                    retryCount: i.retryCount + 1
                };
            }));
        }
      });

      await Promise.all(promises);

      // Loop
      if (isProcessingRef.current) {
        processNextBatch();
      }
    };

    processNextBatch();

  }, [config, connectionStatus]);

  const stopProcessing = () => {
    isProcessingRef.current = false;
    setIsProcessing(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setItems(prev => prev.map(i => 
      i.status === ProcessingStatus.PROCESSING ? { ...i, status: ProcessingStatus.IDLE } : i
    ));
  };

  // --- Stats ---
  const stats: PipelineStats = {
    total: items.length,
    processed: items.filter(i => i.status === ProcessingStatus.COMPLETED || i.status === ProcessingStatus.FAILED).length,
    successful: items.filter(i => i.status === ProcessingStatus.COMPLETED).length,
    failed: items.filter(i => i.status === ProcessingStatus.FAILED).length,
    startTime: null,
    estimatedTimeRemaining: null
  };
  
  const progress = stats.total > 0 ? (stats.processed / stats.total) * 100 : 0;

  // --- Virtualization Logic ---
  const onListScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Calculate range
  const startIndex = Math.floor(scrollTop / ROW_HEIGHT);
  const visibleCount = Math.ceil(containerHeight / ROW_HEIGHT);
  // Add buffer to prevent flickering
  const buffer = 5;
  const startBuffered = Math.max(0, startIndex - buffer);
  const endBuffered = Math.min(items.length, startIndex + visibleCount + buffer);
  
  const visibleItems = items.slice(startBuffered, endBuffered).map((item, index) => ({
    ...item,
    absoluteIndex: startBuffered + index,
    offsetY: (startBuffered + index) * ROW_HEIGHT
  }));

  const totalContentHeight = items.length * ROW_HEIGHT;

  // --- Render Helpers ---
  const renderReasoningSteps = (text: string) => {
    if (!text) return <div className="text-slate-400 italic p-4">No reasoning available.</div>;

    // Try to match numbered steps or bullet points
    // Splitting by "1. ", "2. " or "- " newlines
    const stepRegex = /(?:^|\n)(\d+\.|-|\*)\s+/;
    
    if (!stepRegex.test(text)) {
      // Fallback: Standard paragraphs if no structure found
      return <div className="p-4 whitespace-pre-wrap text-xs text-slate-600">{text}</div>;
    }

    const segments = text.split(stepRegex);
    const steps: { marker: string; content: string }[] = [];
    
    // Rudimentary parser to reconstruct segments into steps
    for (let i = 1; i < segments.length; i += 2) {
      const marker = segments[i];
      const content = segments[i+1];
      if (content) steps.push({ marker, content: content.trim() });
    }

    if (steps.length === 0) return <div className="p-4 whitespace-pre-wrap text-xs">{text}</div>;

    return (
      <div className="flex flex-col bg-slate-50/50">
        {steps.map((step, idx) => {
          const isExpanded = expandedStepIndex === idx;
          return (
            <div key={idx} className="border-b border-aws-border last:border-b-0">
               <button 
                onClick={() => setExpandedStepIndex(isExpanded ? null : idx)}
                className={`w-full flex items-start text-left gap-3 p-3 hover:bg-slate-100 transition-colors group ${isExpanded ? 'bg-white' : ''}`}
               >
                 <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border ${
                   isExpanded 
                    ? 'bg-purple-100 text-purple-700 border-purple-200' 
                    : 'bg-slate-200 text-slate-500 border-slate-300 group-hover:border-slate-400'
                 }`}>
                   {idx + 1}
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isExpanded ? 'text-slate-800' : 'text-slate-600'}`}>
                        Reasoning Step {idx + 1}
                      </span>
                      {isExpanded 
                        ? <ChevronDown size={12} className="text-slate-400" /> 
                        : <ChevronRight size={12} className="text-slate-400" />
                      }
                    </div>
                    {!isExpanded && (
                      <p className="text-[10px] text-slate-500 truncate mt-1 max-w-[90%]">
                        {step.content}
                      </p>
                    )}
                 </div>
               </button>
               {isExpanded && (
                 <div className="px-11 pb-4 pt-1 bg-white text-xs text-slate-700 leading-relaxed border-l-4 border-purple-500/20 ml-5 mb-2">
                    {step.content}
                 </div>
               )}
            </div>
          )
        })}
      </div>
    );
  };

  const renderItemRow = (item: ConversationItem, offsetY?: number) => {
    let statusIcon = <div className="w-2 h-2 rounded-full bg-slate-300" />;
    let rowClass = "hover:bg-aws-hover";
    
    if (item.status === ProcessingStatus.COMPLETED) {
      statusIcon = <CheckCircle2 size={14} className="text-emerald-600" />;
    } else if (item.status === ProcessingStatus.FAILED) {
      statusIcon = <AlertCircle size={14} className="text-red-600" />;
      rowClass = "bg-red-50/30 hover:bg-red-50/50";
    } else if (item.status === ProcessingStatus.PROCESSING) {
      statusIcon = <RefreshCw size={14} className="text-aws-blue animate-spin" />;
      rowClass = "bg-blue-50/30 hover:bg-blue-50/50";
    }

    const isSelected = selectedItemId === item.id;
    if (isSelected) {
        rowClass = "bg-aws-selected border-l-2 border-aws-blue";
    } else {
        rowClass += " border-l-2 border-transparent";
    }

    const style = offsetY !== undefined ? {
      position: 'absolute',
      top: 0,
      transform: `translateY(${offsetY}px)`,
      width: '100%',
      height: `${ROW_HEIGHT}px`
    } as React.CSSProperties : {};

    return (
      <div 
        key={item.id}
        onClick={() => setSelectedItemId(item.id)}
        style={style}
        className={`px-3 border-b border-aws-border cursor-pointer transition-colors flex items-center ${rowClass}`}
      >
        <div className="flex items-center gap-3 min-w-0 w-full">
          <div className="shrink-0">{statusIcon}</div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between">
                <span className={`text-[10px] font-mono ${isSelected ? 'text-aws-blue font-bold' : 'text-slate-500'}`}>
                  {item.id}
                </span>
                {item.retryCount > 0 && (
                   <span className="text-[9px] bg-slate-200 text-slate-600 px-1 rounded-sm">Retry {item.retryCount}</span>
                )}
            </div>
            <p className={`text-xs truncate ${isSelected ? 'text-aws-dark font-medium' : 'text-slate-600'}`}>
              {item.original}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const selectedItem = items.find(i => i.id === selectedItemId);

  return (
    <div className="flex flex-1 h-full overflow-hidden" onDragEnter={handleDrag}>
        
        {/* Left Sidebar: Controls & Queue (Increased Width) */}
        <div className="w-[450px] bg-white border-r border-aws-border flex flex-col z-10 shrink-0 transition-all">
          
          {/* Sidebar Tabs */}
          <div className="flex border-b border-aws-border bg-aws-light">
            <button 
              onClick={() => setLeftPanelTab('queue')}
              className={`flex-1 py-2 text-xs font-bold transition-colors ${
                leftPanelTab === 'queue' 
                  ? 'bg-white border-t-2 border-t-aws-orange text-aws-dark' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white'
              }`}
            >
               Dataset Queue
            </button>
            <button 
              onClick={() => setLeftPanelTab('settings')}
              className={`flex-1 py-2 text-xs font-bold transition-colors ${
                leftPanelTab === 'settings' 
                  ? 'bg-white border-t-2 border-t-aws-orange text-aws-dark' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white'
              }`}
            >
               Configuration
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden flex flex-col bg-white">
            {leftPanelTab === 'queue' && (
              <div className="flex flex-col h-full">
                
                {/* Toolbar */}
                <div className="p-2 border-b border-aws-border flex gap-2 bg-white sticky top-0 z-10 shrink-0">
                  <div className="flex-1 relative">
                    <Search className="absolute left-2 top-2 text-slate-400" size={14} />
                    <input type="text" placeholder="Filter items (coming soon)..." disabled className="w-full pl-8 pr-2 py-1.5 text-xs border border-aws-border rounded-sm bg-slate-50 cursor-not-allowed" />
                  </div>
                  <button 
                    onClick={handleExport}
                    disabled={stats.processed === 0}
                    className="px-2 py-1 bg-white hover:bg-slate-50 border border-aws-border rounded-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed text-slate-700"
                    title="Export Results"
                  >
                    <Download size={14} />
                  </button>
                </div>

                {/* Virtualized List / Drop Zone */}
                <div 
                  className="flex-1 overflow-y-auto bg-white relative" 
                  ref={listContainerRef}
                  onScroll={onListScroll}
                  onDragEnter={handleDrag} 
                  onDragLeave={handleDrag} 
                  onDragOver={handleDrag} 
                  onDrop={handleDrop}
                >
                  {dragActive && (
                    <div className="absolute inset-0 bg-aws-blue/10 z-50 border-2 border-dashed border-aws-blue flex items-center justify-center backdrop-blur-sm">
                       <div className="bg-white p-4 rounded-md shadow-lg text-center">
                          <Upload size={32} className="mx-auto text-aws-blue mb-2" />
                          <h3 className="text-sm font-bold text-aws-dark">Drop JSON File Here</h3>
                       </div>
                    </div>
                  )}
                  
                  {isUploading && (
                     <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center backdrop-blur-sm">
                       <div className="flex flex-col items-center gap-3">
                          <Loader2 size={32} className="text-aws-orange animate-spin" />
                          <h3 className="text-sm font-bold text-aws-dark">Parsing dataset...</h3>
                          <p className="text-xs text-slate-500">This may take a moment for large files.</p>
                       </div>
                    </div>
                  )}

                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4 absolute inset-0 p-8 text-center border-2 border-dashed border-transparent hover:border-slate-200 transition-colors m-4 rounded-sm bg-slate-50/50">
                      <div className="p-4 bg-white rounded-full shadow-sm border border-slate-100">
                        <FileJson size={48} className="text-slate-300" />
                      </div>
                      <div>
                         <h3 className="text-sm font-bold text-slate-600 mb-1">No dataset loaded</h3>
                         <p className="text-xs text-slate-400">Drag and drop your JSON file here</p>
                      </div>
                      
                      <div className="flex gap-3 mt-2">
                        <button 
                            onClick={handleFileUploadTrigger}
                            className="cursor-pointer px-4 py-2 bg-aws-orange text-white text-xs font-bold rounded-sm hover:bg-orange-600 transition-colors flex items-center gap-2 shadow-sm"
                        >
                            <Upload size={14} />
                            Upload JSON
                        </button>
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            accept=".json,application/json" 
                            onChange={handleFileChange} 
                            className="hidden" 
                        />
                         <button onClick={loadSampleData} className="px-4 py-2 border border-aws-border bg-white text-slate-700 text-xs font-bold rounded-sm hover:bg-slate-50 shadow-sm">
                            Load Sample
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-6 max-w-[240px] leading-relaxed">
                        Supports <strong>JSON Arrays</strong> <code>[...]</code>, wrapped objects <code>&#123; "data": [...] &#125;</code>, or lists of strings.
                      </p>
                    </div>
                  ) : (
                    <div style={{ height: totalContentHeight, position: 'relative' }}>
                      {visibleItems.map(item => renderItemRow(item, item.offsetY))}
                    </div>
                  )}
                </div>

                {/* Status Footer */}
                <div className="p-2 bg-aws-light border-t border-aws-border text-[10px] font-mono text-slate-500 flex justify-between">
                    <span>Queue: {items.length} items</span>
                    <span>Processed: {stats.processed}</span>
                </div>
              </div>
            )}

            {leftPanelTab === 'settings' && (
              <div className="p-4 space-y-6 overflow-y-auto h-full custom-scrollbar">
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-sm flex items-start gap-2">
                   <Info size={14} className="text-blue-600 mt-0.5" />
                   <p className="text-[10px] text-blue-800 leading-relaxed">
                     Adjust concurrency based on your tier limits. Paid tiers support higher concurrency (5-10). Free tiers should stick to 1-2.
                   </p>
                </div>

                <section className="space-y-2">
                  <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider border-b border-slate-100 pb-1 flex items-center gap-2">
                    <Server size={12} /> Connection
                  </h3>
                  
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Provider</label>
                    <select 
                      value={config.provider}
                      onChange={(e) => setConfig({...config, provider: e.target.value as any})}
                      className="w-full bg-white border border-aws-border rounded-sm px-2 py-1.5 text-xs text-slate-900 focus:border-aws-blue outline-none shadow-sm"
                    >
                      <option value="google">Google Gemini (Native)</option>
                      <option value="openai" disabled>OpenAI (Enterprise Add-on)</option>
                      <option value="anthropic" disabled>Anthropic (Enterprise Add-on)</option>
                    </select>
                    <p className="text-[9px] text-slate-400">Enterprise tier enables multi-cloud routing.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">API Key</label>
                    <div className="flex gap-2">
                        <input 
                            type="password" 
                            value={config.apiKey}
                            onChange={(e) => setConfig({...config, apiKey: e.target.value})}
                            placeholder="Paste your API key here..."
                            className="flex-1 bg-white border border-aws-border rounded-sm px-2 py-1.5 text-xs text-slate-900 focus:border-aws-blue outline-none shadow-sm font-mono"
                        />
                        <button 
                            onClick={validateConnection}
                            className="px-2 py-1 bg-slate-100 border border-aws-border hover:bg-slate-200 rounded-sm text-xs font-bold text-slate-600"
                        >
                            Test
                        </button>
                    </div>
                    {connectionStatus !== 'unknown' && (
                         <div className={`text-[10px] flex items-center gap-1 mt-1 ${connectionStatus === 'valid' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {connectionStatus === 'valid' ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                            {connectionStatus === 'valid' ? 'Connection Verified' : 'Invalid Credentials'}
                         </div>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700">Model</label>
                    <select 
                      value={config.model}
                      onChange={(e) => setConfig({...config, model: e.target.value})}
                      className="w-full bg-white border border-aws-border rounded-sm px-2 py-1.5 text-xs text-slate-900 focus:border-aws-blue outline-none shadow-sm"
                    >
                      {MODELS.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </section>

                <section className="space-y-2">
                  <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider border-b border-slate-100 pb-1 flex items-center gap-2">
                    <Settings size={12} /> Processing
                  </h3>
                  <div>
                     <div className="flex justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">Concurrency</label>
                        <span className="text-[10px] font-mono text-slate-500">{config.concurrency} threads</span>
                      </div>
                      <input 
                        type="range" 
                        min="1" max="10" 
                        value={config.concurrency}
                        onChange={(e) => setConfig({...config, concurrency: parseInt(e.target.value)})}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-aws-orange"
                      />
                  </div>
                  <div>
                     <div className="flex justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700">Throttle (Delay)</label>
                        <span className="text-[10px] font-mono text-slate-500">{config.delayMs} ms</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" max="2000" step="100"
                        value={config.delayMs}
                        onChange={(e) => setConfig({...config, delayMs: parseInt(e.target.value)})}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-aws-orange"
                      />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                      <label className="text-xs font-bold text-slate-700">Max Retries</label>
                      <input 
                        type="number" 
                        min="0" max="5"
                        value={config.maxRetries}
                        onChange={(e) => setConfig({...config, maxRetries: parseInt(e.target.value)})}
                        className="w-12 bg-white border border-aws-border rounded-sm px-1 py-1 text-right text-xs"
                      />
                  </div>
                </section>

                <section className="space-y-2">
                   <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider border-b border-slate-100 pb-1">
                    Instructions
                  </h3>
                  <div className="space-y-1">
                     <label className="block text-xs font-bold text-slate-700">System Prompt</label>
                     <textarea 
                      value={config.systemInstruction}
                      onChange={(e) => setConfig({...config, systemInstruction: e.target.value})}
                      rows={6}
                      className="w-full bg-white border border-aws-border rounded-sm px-2 py-1.5 text-[10px] font-mono text-slate-800 focus:border-aws-blue outline-none shadow-sm"
                    />
                  </div>
                  <div className="space-y-1">
                     <label className="block text-xs font-bold text-slate-700">Input Template</label>
                     <textarea 
                      value={config.promptTemplate}
                      onChange={(e) => setConfig({...config, promptTemplate: e.target.value})}
                      rows={3}
                      className="w-full bg-white border border-aws-border rounded-sm px-2 py-1.5 text-[10px] font-mono text-slate-800 focus:border-aws-blue outline-none shadow-sm"
                    />
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-aws-light">
          
          {/* Context / Stats Bar */}
          <div className="bg-white border-b border-aws-border p-4 flex items-center justify-between shrink-0 shadow-sm z-10">
             <div className="flex gap-4">
                <StatsCard 
                    label="Queue Progress" 
                    value={`${Math.round(progress)}%`} 
                    icon={<Activity size={16} />} 
                />
                <StatsCard 
                    label="Throughput" 
                    value={isProcessing ? `${(config.concurrency * (1000 / (config.delayMs + 1000))).toFixed(1)}/s` : "0/s"}
                    icon={<Zap size={16} />} 
                />
                {stats.failed > 0 && (
                    <StatsCard 
                        label="Failures" 
                        value={stats.failed}
                        icon={<ShieldAlert size={16} className="text-red-500" />} 
                    />
                )}
             </div>

             <div className="flex gap-2">
                 {stats.failed > 0 && !isProcessing && (
                    <button
                        onClick={handleRetryFailed}
                        className="flex items-center gap-2 px-4 py-2 rounded-sm font-bold text-xs uppercase tracking-wider transition-all shadow-sm bg-white border border-red-200 text-red-600 hover:bg-red-50"
                    >
                        <RotateCcw size={14} /> Retry Failed ({stats.failed})
                    </button>
                 )}

                 <button 
                    onClick={isProcessing ? stopProcessing : processQueue}
                    className={`flex items-center gap-2 px-6 py-2 rounded-sm font-bold text-xs uppercase tracking-wider transition-all shadow-sm ${
                    isProcessing 
                        ? 'bg-white border border-red-300 text-red-600 hover:bg-red-50' 
                        : 'bg-aws-orange text-white hover:bg-orange-600 border border-transparent'
                    }`}
                >
                    {isProcessing ? <><Pause size={14} /> Stop Job</> : <><Play size={14} /> Start Job</>}
                </button>
            </div>
          </div>

          {/* Detail View */}
          <div className="flex-1 p-6 overflow-y-auto">
            {selectedItem ? (
              <div className="flex flex-col h-full max-w-6xl mx-auto gap-4">
                
                {/* Original Source */}
                <div className="bg-white border border-aws-border rounded-sm shadow-sm">
                  <div className="px-4 py-2 bg-slate-50 border-b border-aws-border flex items-center justify-between">
                     <span className="text-xs font-bold text-slate-700">INPUT SOURCE</span>
                     <span className="text-[10px] font-mono text-slate-400">{selectedItem.id}</span>
                  </div>
                  <div className="p-4 max-h-40 overflow-y-auto custom-scrollbar bg-slate-50/30">
                    <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap">{selectedItem.original}</pre>
                  </div>
                </div>

                {/* Results Area */}
                <div className="flex-1 flex flex-col gap-4 min-h-0">
                  
                  {/* Error Banner */}
                  {selectedItem.status === ProcessingStatus.FAILED && (
                      <div className="bg-red-50 border border-red-200 p-3 rounded-sm flex items-start gap-3">
                          <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={16} />
                          <div>
                              <h4 className="text-xs font-bold text-red-800">Processing Failed</h4>
                              <p className="text-xs text-red-700 mt-1">{selectedItem.error || "Unknown error occurred"}</p>
                              {selectedItem.retryCount > 0 && <p className="text-[10px] text-red-600 mt-1">Retried {selectedItem.retryCount} times</p>}
                          </div>
                      </div>
                  )}

                  {/* CoT Accordion */}
                  <div className="flex flex-col bg-white border border-aws-border rounded-sm shadow-sm overflow-hidden transition-all duration-300 flex-1 min-h-0">
                    <button 
                        onClick={() => setCotExpanded(!cotExpanded)}
                        className="w-full px-4 py-2 bg-slate-50 border-b border-aws-border flex items-center justify-between hover:bg-slate-100 transition-colors shrink-0"
                    >
                        <div className="flex items-center gap-2">
                            <Brain size={14} className="text-purple-600" />
                            <span className="text-xs font-bold text-slate-700">CHAIN OF THOUGHT</span>
                        </div>
                        {cotExpanded ? <ChevronDown size={14} className="text-slate-400"/> : <ChevronRight size={14} className="text-slate-400"/>}
                    </button>
                    
                    {cotExpanded && (
                        <div className="bg-white overflow-y-auto custom-scrollbar h-full">
                             {selectedItem.status === ProcessingStatus.PROCESSING ? (
                                <div className="flex items-center gap-2 text-slate-400 italic animate-pulse p-4 text-xs">
                                    <Brain size={14} /> Generating reasoning traces...
                                </div>
                            ) : (
                                selectedItem.reasoning 
                                    ? renderReasoningSteps(selectedItem.reasoning)
                                    : <span className="text-slate-400 italic p-4 block text-xs">No reasoning data available.</span>
                            )}
                        </div>
                    )}
                  </div>

                  {/* Final Output */}
                  <div className="flex flex-col bg-white border border-aws-border rounded-sm shadow-sm h-[200px] shrink-0">
                    <div className="px-4 py-2 bg-slate-50 border-b border-aws-border flex items-center gap-2">
                        <Zap size={14} className="text-aws-orange" />
                        <span className="text-xs font-bold text-slate-700">OPTIMIZED OUTPUT</span>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto custom-scrollbar font-mono text-xs leading-relaxed text-aws-dark">
                        {selectedItem.status === ProcessingStatus.PROCESSING ? (
                            <div className="flex items-center gap-2 text-slate-400 italic animate-pulse">
                                <Zap size={14} /> Finalizing output...
                            </div>
                        ) : (
                             selectedItem.rewritten || <span className="text-slate-400 italic">Pending execution...</span>
                        )}
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                 <Layers size={48} className="mb-4 text-slate-300" />
                 <h3 className="text-sm font-bold text-slate-500">No Object Selected</h3>
                 <p className="text-xs text-slate-400 mt-1">Select an item from the queue to inspect results.</p>
              </div>
            )}
          </div>
        </div>
    </div>
  );
};