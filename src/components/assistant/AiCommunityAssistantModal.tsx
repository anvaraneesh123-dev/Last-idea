import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCommunity } from '../../context/CommunityContext';
import { useAuth } from '../../context/AuthContext';
import { 
  processAssistantQuery, 
  AssistantResponse, 
  AssistantSearchResultItem 
} from '../../utils/aiAssistantEngine';
import { 
  Bot, 
  Sparkles, 
  X, 
  Send, 
  MapPin, 
  Navigation, 
  ShieldCheck, 
  AlertCircle, 
  Droplet, 
  Home, 
  Zap, 
  Users, 
  Clock, 
  PlusCircle, 
  ArrowRight,
  Database,
  WifiOff,
  RotateCcw
} from 'lucide-react';

interface AiCommunityAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateRequest?: () => void;
}

interface MessageHistoryItem {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  responsePayload?: AssistantResponse;
}

export const AiCommunityAssistantModal: React.FC<AiCommunityAssistantModalProps> = ({
  isOpen,
  onClose,
  onOpenCreateRequest
}) => {
  const navigate = useNavigate();
  const { resources, volunteers, requests } = useCommunity();
  const { isDemoMode } = useAuth();

  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<MessageHistoryItem[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      timestamp: 'Just now',
      text: "Hello! I am your Nexus AI Community Assistant. I can search active resources, verified volunteers, open shelters, and mutual aid requests across Cascadia in real time. How can I assist you today?",
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "Where can I find drinking water nearby?",
    "Which shelters are listed as open?",
    "Is a wheelchair available in my area?",
    "Who can help repair electrical equipment?",
    "Which resources can fulfil this request?",
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendQuery = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: MessageHistoryItem = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: queryText.trim(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsThinking(true);

    // Simulate rapid natural response while processing real database
    setTimeout(() => {
      const isOffline = !navigator.onLine;
      const res = processAssistantQuery(
        queryText,
        resources,
        volunteers,
        requests,
        !isDemoMode,
        isOffline
      );

      const assistantMsg: MessageHistoryItem = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: res.answerText,
        responsePayload: res,
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsThinking(false);
    }, 450);
  };

  const handleNavigateToMap = (item: AssistantSearchResultItem) => {
    onClose();
    navigate(`/map?assetId=${encodeURIComponent(item.id)}&lat=${item.latitude}&lng=${item.longitude}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-blue-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] h-[720px] relative"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-blue-600/10 via-cyan-500/10 to-teal-500/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                  Nexus AI Community Assistant
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-bold">
                  Grounded • Real DB
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Natural language discovery across verified community stock and volunteer corps.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-1 border border-blue-500/20">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] space-y-2.5 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* Bubble Text */}
                <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white font-medium rounded-tr-sm shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-sm border border-slate-200/80 dark:border-slate-700/60'
                }`}>
                  <div className="whitespace-pre-line">{msg.text}</div>
                </div>

                {/* Grounded Assistant Payload Details */}
                {msg.responsePayload && (
                  <div className="space-y-2.5 w-full">
                    
                    {/* Data Source & Status Bar */}
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                      <span className={`px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                        msg.responsePayload.dataSource === 'LIVE_DATABASE'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : msg.responsePayload.dataSource === 'CACHED_OFFLINE_DB'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                      }`}>
                        <Database className="w-3 h-3" />
                        <span>Source: {msg.responsePayload.dataSource.replace(/_/g, ' ')}</span>
                      </span>

                      {msg.responsePayload.isOfflineCache && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                          <WifiOff className="w-3 h-3" />
                          <span>Offline Vector Cache</span>
                        </span>
                      )}

                      {msg.responsePayload.extractedIntent.category && (
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          Cat: {msg.responsePayload.extractedIntent.category.toUpperCase()}
                        </span>
                      )}

                      {msg.responsePayload.extractedIntent.urgency === 'critical' && (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 font-bold border border-red-500/30">
                          CRITICAL URGENCY
                        </span>
                      )}
                    </div>

                    {/* Offline Warning Banner if applicable */}
                    {msg.responsePayload.offlineWarning && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{msg.responsePayload.offlineWarning}</span>
                      </div>
                    )}

                    {/* Real Search Result Cards */}
                    {msg.responsePayload.results.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Ranked Database Records ({msg.responsePayload.results.length}):
                        </div>

                        {msg.responsePayload.results.map((resItem, idx) => (
                          <div
                            key={resItem.id}
                            className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-blue-500/20 hover:border-blue-500/40 shadow-sm transition-all space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                    #{idx + 1}
                                  </span>
                                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                    {resItem.title}
                                  </h4>
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                                  <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                                  <span>{resItem.locationName}</span>
                                  <span>•</span>
                                  <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{resItem.distance}</span>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  resItem.isAvailable
                                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                                }`}>
                                  {resItem.type === 'resource'
                                    ? `${resItem.availableQuantity} of ${resItem.totalQuantity} Ready`
                                    : resItem.isAvailable ? 'Available On-Call' : 'On Mission'}
                                </span>
                              </div>
                            </div>

                            {/* Why Recommended / Relevance Reasons */}
                            {resItem.relevanceReasons.length > 0 && (
                              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-[10px] space-y-1">
                                <span className="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                  Match Rationale:
                                </span>
                                <ul className="list-disc pl-3 text-slate-600 dark:text-slate-400 space-y-0.5">
                                  {resItem.relevanceReasons.map((reason, rIdx) => (
                                    <li key={rIdx}>{reason}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>Updated: {resItem.updatedAt}</span>
                              </span>

                              <button
                                onClick={() => handleNavigateToMap(resItem)}
                                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                              >
                                <Navigation className="w-3 h-3" />
                                <span>Locate on Map</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Ambiguity Follow-Up or No-Match Actions */}
                    {msg.responsePayload.extractedIntent.isAmbiguous && msg.responsePayload.extractedIntent.followUpPrompt && (
                      <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-500/30 text-xs text-blue-900 dark:text-blue-200 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
                          <Bot className="w-3.5 h-3.5" />
                          <span>Clarification Request:</span>
                        </div>
                        <p>{msg.responsePayload.extractedIntent.followUpPrompt}</p>
                      </div>
                    )}

                    {/* If No Match Found, offer to create request */}
                    {msg.responsePayload.results.length === 0 && (
                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                        <div className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          <span>No existing listings found for this request</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400">
                          We do not fabricate fake stock or inventory. You can create an open aid request so local volunteers and depot coordinators are notified immediately.
                        </p>
                        <button
                          onClick={() => {
                            onClose();
                            navigate('/requests');
                          }}
                          className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Submit Resource Request Ticket</span>
                        </button>
                      </div>
                    )}

                  </div>
                )}

              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex gap-3 items-center text-xs text-slate-500 dark:text-slate-400 animate-pulse pl-11">
              <Bot className="w-4 h-4 text-blue-500 animate-spin" />
              <span>Querying community directory & calculating proximity rankings...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Question Chips */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
            Suggested Community Inquiries:
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {suggestedQuestions.map((q, qIdx) => (
              <button
                key={qIdx}
                onClick={() => handleSendQuery(q)}
                disabled={isThinking}
                className="text-[11px] px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-300 font-medium transition-all text-left cursor-pointer flex items-center gap-1.5"
              >
                <span>{q}</span>
                <ArrowRight className="w-3 h-3 opacity-60" />
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask about water, medical supplies, open shelters, electricians..."
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSendQuery(inputQuery);
            }}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={() => handleSendQuery(inputQuery)}
            disabled={!inputQuery.trim() || isThinking}
            className="p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/25 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </div>

      </div>
    </div>
  );
};
