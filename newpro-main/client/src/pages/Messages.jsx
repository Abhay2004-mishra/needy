import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { messagesAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Messages() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [conversation, setConversation] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)

  const conversationThreads = useMemo(() => {
    const threads = {}
    messages.forEach((message) => {
      const other = message.sender._id === user._id ? message.recipient : message.sender
      if (!threads[other._id]) {
        threads[other._id] = {
          user: other,
          lastMessage: message,
          unread: 0
        }
      }
      if (message.recipient._id === user._id && !message.read) {
        threads[other._id].unread += 1
      }
    })
    return Object.values(threads).sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt))
  }, [messages, user])

  useEffect(() => {
    if (!user) { navigate('/'); return }
    loadMessages()
  }, [user, navigate])

  const loadMessages = async () => {
    setLoading(true)
    try {
      const res = await messagesAPI.getAll()
      setMessages(res.data.data)
    } catch (err) {
      showToast('Failed to load messages', 'error')
    } finally {
      setLoading(false)
    }
  }

  const openConversation = async (other) => {
    setSelectedUser(other)
    setMessageText('')
    try {
      const res = await messagesAPI.getConversation(other._id)
      setConversation(res.data.data)
    } catch (err) {
      showToast('Failed to load conversation', 'error')
    }
  }

  const handleSend = async () => {
    if (!selectedUser || !messageText.trim()) return
    try {
      await messagesAPI.send({ recipientId: selectedUser._id, content: messageText })
      setMessageText('')
      openConversation(selectedUser)
      loadMessages()
      showToast('Message sent', 'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send message', 'error')
    }
  }

  if (!user) return null

  return (
    <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-[320px_1fr] gap-6">
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Conversations</h2>
          {loading ? (
            <p className="text-slate-400">Loading conversations…</p>
          ) : conversationThreads.length === 0 ? (
            <p className="text-slate-400">No conversations yet. Open a job and contact a poster to start.</p>
          ) : (
            <div className="space-y-3">
              {conversationThreads.map(thread => (
                <button key={thread.user._id} onClick={() => openConversation(thread.user)} className={`block w-full text-left p-4 rounded-xl border ${selectedUser?._id === thread.user._id ? 'border-emerald-500 bg-[#111827]' : 'border-[#2d3748]'} hover:border-emerald-400 transition-colors`}>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="font-medium">{thread.user.firstName} {thread.user.lastName}</div>
                      <div className="text-sm text-slate-400 truncate max-w-[220px]">{thread.lastMessage.content}</div>
                    </div>
                    {thread.unread > 0 && <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full">{thread.unread}</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Message Thread</h2>
              <p className="text-sm text-slate-500">Select a conversation to view messages.</p>
            </div>
          </div>
          {!selectedUser ? (
            <div className="py-12 text-center text-slate-400">Select a conversation on the left.</div>
          ) : (
            <>
              <div className="space-y-4 mb-4 max-h-[480px] overflow-y-auto px-2">
                {conversation.map((message) => (
                  <div key={message._id} className={`p-4 rounded-2xl ${message.sender._id === user._id ? 'bg-emerald-500/10 self-end' : 'bg-[#111827]'} ${message.sender._id === user._id ? 'ml-auto' : ''}`}>
                    <div className="text-sm text-slate-400 mb-2">{message.sender._id === user._id ? 'You' : `${message.sender.firstName} ${message.sender.lastName}`}</div>
                    <p className="text-sm leading-6">{message.content}</p>
                    <div className="text-xs text-slate-500 mt-2">{new Date(message.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} rows="4" className="input-field w-full" placeholder="Type your message..." />
                <button onClick={handleSend} className="btn-primary w-full py-3">Send Message</button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
