import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader2, Minimize2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: Date
  error?: boolean
}

// ─── Webhook config ───────────────────────────────────────────────────────────

const WEBHOOK_URL = 'https://automations.quind.io/webhook/0b753b94-1a88-4a80-80a7-6a5ae4930f7c'

// Persist session ID across component remounts
function getSessionId(): string {
  const key = 'okianus_chat_session'
  let id = sessionStorage.getItem(key)
  if (!id) {
    id = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    sessionStorage.setItem(key, id)
  }
  return id
}

// Extract text from various n8n response shapes
function extractText(data: unknown): string {
  if (typeof data === 'string') return data
  if (Array.isArray(data) && data.length > 0) return extractText(data[0])
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>
    for (const key of ['output', 'message', 'response', 'text', 'answer', 'reply', 'content']) {
      if (typeof d[key] === 'string' && d[key]) return d[key] as string
    }
  }
  return 'No pude procesar la respuesta. Intenta de nuevo.'
}

// ─── Welcome messages by role ─────────────────────────────────────────────────

const WELCOME: Record<string, string> = {
  ADMIN:    '¡Hola! Soy el asistente de Okianus Terminals. Puedo ayudarte con inventario, ciclo operativo, reportes y configuración. ¿En qué te ayudo?',
  OPERATOR: '¡Hola! Soy el asistente operativo de Okianus. Puedo orientarte en el ciclo del camión, checklist, pesaje y bahías. ¿Qué necesitas?',
  CLIENT:   '¡Hola! Soy el asistente de tu portal Okianus. Puedo informarte sobre tu inventario, movimientos y vehículos en planta. ¿En qué puedo ayudarte?',
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FloatingChat() {
  const { user }                         = useAuth()
  const [open,        setOpen]           = useState(false)
  const [messages,    setMessages]       = useState<Message[]>([])
  const [input,       setInput]          = useState('')
  const [loading,     setLoading]        = useState(false)
  const [unread,      setUnread]         = useState(0)
  const messagesEndRef                   = useRef<HTMLDivElement>(null)
  const inputRef                         = useRef<HTMLInputElement>(null)
  const sessionId                        = useRef(getSessionId())

  // Seed welcome message when user is available
  useEffect(() => {
    if (!user || messages.length > 0) return
    setMessages([{
      id:        'welcome',
      role:      'assistant',
      text:      WELCOME[user.role] ?? WELCOME.CLIENT,
      timestamp: new Date(),
    }])
  }, [user])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opening
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 120)
      setUnread(0)
    }
  }, [open])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = {
      id:        `u_${Date.now()}`,
      role:      'user',
      text,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(WEBHOOK_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message:   text,
          sessionId: sessionId.current,
          role:      user?.role ?? 'CLIENT',
          userName:  user?.name ?? 'Usuario',
          clientId:  user?.clientId ?? null,
        }),
      })

      let replyText: string
      if (res.ok) {
        try {
          const data = await res.json()
          replyText = extractText(data)
        } catch {
          replyText = await res.text() || 'Respuesta recibida sin contenido.'
        }
      } else {
        replyText = `Error del servidor (${res.status}). Intenta de nuevo.`
      }

      const assistantMsg: Message = {
        id:        `a_${Date.now()}`,
        role:      'assistant',
        text:      replyText,
        timestamp: new Date(),
        error:     !res.ok,
      }

      setMessages(prev => [...prev, assistantMsg])
      if (!open) setUnread(n => n + 1)

    } catch (err) {
      setMessages(prev => [...prev, {
        id:        `err_${Date.now()}`,
        role:      'assistant',
        text:      'No se pudo conectar con el asistente. Verifica tu conexión e intenta de nuevo.',
        timestamp: new Date(),
        error:     true,
      }])
    } finally {
      setLoading(false)
    }
  }, [input, loading, open, user])

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  if (!user) return null

  return (
    <>
      {/* ── Chat panel ───────────────────────────────────────────────────────── */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex w-[360px] flex-col rounded-2xl border border-[#E8EDF2] bg-white shadow-2xl overflow-hidden"
          style={{ maxHeight: 'min(560px, calc(100vh - 120px))' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5"
            style={{ background: 'linear-gradient(135deg, #1C2434 0%, #2D3A4A 100%)' }}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1E88E5]">
              <Bot className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white leading-tight">Asistente Okianus</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[11px] text-white/60">En línea</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 hover:bg-white/10 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F7F9FC]">
            {messages.map(msg => (
              <div key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold mt-0.5 ${
                  msg.role === 'user' ? 'bg-[#1E88E5]' : msg.error ? 'bg-red-500' : 'bg-[#1C2434]'
                }`}>
                  {msg.role === 'user'
                    ? <User className="h-3.5 w-3.5" />
                    : <Bot  className="h-3.5 w-3.5" />
                  }
                </div>
                {/* Bubble */}
                <div className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#1C2434] text-white rounded-tr-sm'
                    : msg.error
                      ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-sm'
                      : 'bg-white text-[#1C2434] border border-[#E8EDF2] shadow-sm rounded-tl-sm'
                }`}>
                  {msg.text}
                  <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-white/40 text-right' : 'text-[#9BAEC8]'}`}>
                    {msg.timestamp.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1C2434] text-white mt-0.5">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="bg-white border border-[#E8EDF2] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#9BAEC8] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#9BAEC8] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#9BAEC8] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-[#E8EDF2] bg-white p-3">
            <div className="flex items-center gap-2 rounded-xl border border-[#E8EDF2] bg-[#F7F9FC] px-3 py-2 focus-within:border-[#1E88E5] transition-colors">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Escribe un mensaje…"
                disabled={loading}
                className="flex-1 bg-transparent text-sm text-[#1C2434] placeholder:text-[#9BAEC8] outline-none disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || loading}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1C2434] text-white hover:bg-[#2D3A4A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Send    className="h-3.5 w-3.5" />
                }
              </button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-[#9BAEC8]">
              Powered by Okianus AI · Quind
            </p>
          </div>
        </div>
      )}

      {/* ── Floating button ───────────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #1C2434 0%, #2D3A4A 100%)' }}
        aria-label="Abrir asistente"
      >
        {open
          ? <X              className="h-5 w-5 text-white" />
          : <MessageCircle  className="h-5 w-5 text-white" />
        }
        {/* Unread badge */}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#1E88E5] text-[10px] font-bold text-white shadow-md">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
    </>
  )
}
