import React, { useState } from 'react';
import {
  X,
  Bot,
  Send,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';
import { AssistantPlan } from '../types';

interface AssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onActionExecuted: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'USER' | 'ASSISTANT';
  text: string;
  plan?: AssistantPlan;
}

export const AssistantDrawer: React.FC<AssistantDrawerProps> = ({
  isOpen,
  onClose,
  onActionExecuted,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ASSISTANT',
      text: 'Hello! I am your HomeSense AI assistant. How can I help make your home more comfortable, safe, or energy-efficient today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'USER',
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const plan = await api.askAssistant(query);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ASSISTANT',
        text: plan.explanation,
        plan: plan.actions && plan.actions.length > 0 ? plan : undefined,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ASSISTANT',
          text: 'Sorry, I encountered an issue processing that instruction. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePlan = async (msgId: string, plan: AssistantPlan) => {
    setExecuting(true);
    try {
      await api.executeAssistantPlan(plan.actions);
      onActionExecuted();

      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId && m.plan
            ? {
                ...m,
                plan: { ...m.plan, status: 'EXECUTED', requiresConfirmation: false },
              }
            : m
        )
      );
    } catch (err) {
      console.error('Failed to execute actions:', err);
    } finally {
      setExecuting(false);
    }
  };

  const quickPrompts = [
    'Prepare the study room for a 45-minute session',
    'Turn off all lights in living room',
    'Make the house comfortable for sleeping',
    'We are leaving the house',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border-l border-white/10 flex flex-col h-full shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>HomeSense AI Assistant</span>
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 rounded text-[9px] font-bold">
                  LOCAL EDGE
                </span>
              </h3>
              <p className="text-xs text-slate-400">Natural language control with human approval guardrails</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'USER' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs ${
                  m.sender === 'USER'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-800/90 text-slate-200 border border-white/5 rounded-bl-none'
                }`}
              >
                {m.text}

                {/* Structured Action Plan Card */}
                {m.plan && m.plan.actions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-300">
                      <span>Proposed Action Plan:</span>
                      <span className="text-[10px] bg-indigo-500/20 px-2 py-0.5 rounded uppercase">
                        {m.plan.intent}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {m.plan.actions.map((act, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-white/5 text-[11px]"
                        >
                          <span className="text-white font-medium">{act.deviceName}</span>
                          <span className="font-mono text-emerald-400 font-semibold">
                            {act.action} {act.value !== undefined && act.value !== null ? `(${act.value})` : ''}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Action Execution Button */}
                    {m.plan.status === 'PENDING_CONFIRMATION' ? (
                      <button
                        onClick={() => handleApprovePlan(m.id, m.plan!)}
                        disabled={executing}
                        className="w-full mt-2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/25 transition-all"
                      >
                        {executing ? (
                          <span className="animate-spin text-sm">⏳</span>
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        <span>Approve & Execute Actions</span>
                      </button>
                    ) : (
                      <div className="mt-2 py-1.5 px-2 rounded-lg bg-emerald-500/20 text-emerald-400 font-semibold text-[11px] flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Actions Approved & Executed</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1">
                {m.sender === 'USER' ? 'You' : 'HomeSense Engine'}
              </span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-indigo-400 p-2">
              <span className="animate-spin">🌀</span>
              <span>HomeSense is interpreting household context...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="p-3 border-t border-white/5 bg-slate-950/40">
          <div className="text-[11px] font-medium text-slate-400 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Try asking:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p)}
                className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/5 transition-colors text-left"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-white/10 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a smart home command..."
            className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-colors shadow-md shadow-indigo-600/25"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
