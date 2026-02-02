import { useState } from 'react'
import Groq from "groq-sdk"
import './App.css'


const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true 
})

function MessageBubble({ text, isUser }) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
      <div
        className={`max-w-[70%] p-3 rounded-2xl shadow-sm text-sm ${
          isUser
            ? 'bg-[#dcf8c6] rounded-tr-none text-right text-black'
            : 'bg-white rounded-tl-none text-left text-black'
        }`}
      >
        {text}
      </div>
    </div>
  )
}

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userText = input
    setMessages((prev) => [...prev, { text: userText, isUser: true }])
    setInput('')
    setLoading(true)

    try {
      const history = messages.map(msg =>({
        role: msg.isUser ? "user" : "assistant",
        content : msg.text
      }));
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Sen bir sohbet asistanısın ve benimle arkadaş gibi konuşmalısın. Türkçe konuş ve sohbeti çok uzatma."
          },
          ...history,
          {
            role: "user",
            content: userText
          }
        ],
        model: "llama-3.3-70b-versatile",
      })

      
      const botText = chatCompletion.choices[0]?.message?.content || "Cevap alınamadı."
      setMessages((prev) => [...prev, { text: botText, isUser: false }])

    } catch (err) {
      console.error('Groq taraflı hata', err)
      setMessages((prev) => [
        ...prev,
        {
          text: 'Groq bağlantısında bir sorun oldu. Lütfen keyi kontrol et.',
          isUser: false,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#e5ddd5] font-sans">
      <div className="bg-[#075e54] text-white p-4 flex items-center gap-3 shadow-md">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl">
          😎
        </div>
        <div>
          <h1 className="font-bold text-base m-0">AI DOSTUM CANO</h1>
          <p className="text-[10px] opacity-80 m-0">
            {loading ? 'Yazıyor...' : 'Çevrimiçi'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        {messages.map((msg, i) => (
          <MessageBubble key={i} text={msg.text} isUser={msg.isUser} />
        ))}

        {loading && (
          <div className="text-xs text-gray-500 italic ml-2">
            Cano düşünüyor...
          </div>
        )}

        {messages.length === 0 && (
          <div className="text-gray-500 text-center text-sm mt-20 bg-white/50 p-4 rounded-lg mx-10">
            Selam! CANO muhabbetin belini kırmaya hazır mısın?
          </div>
        )}
      </div>

      <div className="flex items-center bg-[#f0f0f0] p-3 gap-2 border-t border-gray-300">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Mesajını yaz..."
          className="flex-1 bg-white p-3 rounded-full px-5 outline-none text-sm shadow-sm text-black"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-md ${
            loading ? 'bg-gray-400' : 'bg-[#00a884]'
          }`}
        >
          <span className="text-white text-xl">➤</span>
        </button>
      </div>
    </div>
  )
}

export default App