import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../api/firebase';
import { Smile, Send, Paperclip, Mic, Video, MoreVertical, Phone, CheckCheck, ArrowLeft } from 'lucide-react';
import MyEmojiPicker from './MyEmojiPicker';

// Hook personalizado para detectar clic fuera de un elemento
const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
};

const ChatPanel = ({ activeChat, onGoBack }) => {
  // Estado para el texto del mensaje
  const [message, setMessage] = useState('');
  // Estado para la lista de mensajes
  const [messages, setMessages] = useState([]);
  // Estado para mostrar/ocultar el selector de emojis
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Referencias para scroll y emoji picker
  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Cerrar el emoji picker si se hace clic afuera
  useClickOutside(emojiPickerRef, () => setShowEmojiPicker(false));

  // Función para hacer scroll al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // Formatea la hora del mensaje
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000 || timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Escuchar en tiempo real los mensajes de Firestore
  useEffect(() => {
    if (!activeChat?.chatId) return;
    const q = query(collection(db, 'chats', activeChat.chatId, 'messages'), orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [activeChat]);

  // Enviar un mensaje nuevo
  const handleSendMessage = async () => {
    if (!message.trim() || !activeChat) return;
    const messageData = {
      text: message,
      senderId: auth.currentUser.uid,
      timestamp: serverTimestamp(),
      read: false, 
    };
    await addDoc(collection(db, 'chats', activeChat.chatId, 'messages'), messageData);
    await updateDoc(doc(db, 'chats', activeChat.chatId), {
      lastMessage: { text: message, timestamp: new Date() },
    });
    setMessage('');
    setShowEmojiPicker(false);
  };

  // Añadir emoji al mensaje
  const handleEmojiSelect = (emoji) => {
    setMessage((prev) => prev + emoji);
  };

  return (
    <div className="h-full w-full bg-black md:p-4">
      {/* Contenedor principal del chat */}
      <div className="dark flex flex-1 flex-col h-full md:rounded-2xl border-zinc-800 md:border bg-zinc-900 overflow-hidden">

        {/* Header con info del usuario y acciones */}
        <header className="flex shrink-0 items-center justify-between gap-4 p-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            {onGoBack && (
              <button onClick={onGoBack} className="rounded-full p-2 text-gray-400 hover:bg-zinc-800 md:hidden" aria-label="Volver">
                <ArrowLeft className="h-6 w-6" />
              </button>
            )}
            <img src={activeChat.otherUser.photoURL} alt={activeChat.otherUser.displayName} className="h-12 w-12 rounded-full object-cover"/>
            <div>
              <h3 className="text-lg font-semibold text-white">{activeChat.otherUser.displayName}</h3>
              <p className="text-xs text-gray-400">En línea</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            {/* Botones de llamada, video y más */}
            <button className="rounded-full p-2 hover:bg-zinc-800 transition-colors"><Phone className="h-5 w-5" /></button>
            <button className="rounded-full p-2 hover:bg-zinc-800 transition-colors"><Video className="h-5 w-5" /></button>
            <button className="rounded-full p-2 hover:bg-zinc-800 transition-colors"><MoreVertical className="h-5 w-5" /></button>
          </div>
        </header>

        {/* Área de mensajes */}
        <main className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {/* Estilos del scrollbar */}
          <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgb(63 63 70); border-radius: 20px; }
            .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgb(63 63 70) transparent; }
          `}</style>

          {/* Indicador de fecha */}
          <div className="flex justify-center my-4"><span className="bg-zinc-800 text-xs text-gray-300 rounded-full px-3 py-1">Hoy</span></div>
          
          {/* Lista de mensajes */}
          <div className="space-y-2">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === auth.currentUser.uid ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-lg rounded-xl px-4 py-2 text-sm ${msg.senderId === auth.currentUser.uid ? 'rounded-br-none bg-zinc-600 text-white' : 'rounded-bl-none bg-zinc-800 text-gray-300'}`}>
                  <p className="break-words">{msg.text}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[10px] text-zinc-400">{formatTime(msg.timestamp)}</span>
                    {/* Icono doble check solo si es mi mensaje */}
                    {msg.senderId === auth.currentUser.uid && (<CheckCheck className="h-3 w-3 text-zinc-400" />)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Footer con input y acciones */}
        <footer className="p-3 border-t border-zinc-800">
          <div className="relative flex items-center gap-2" ref={emojiPickerRef}>
            {/* Selector de emojis */}
            {showEmojiPicker && (<div className="absolute bottom-full mb-2 z-10"><MyEmojiPicker onEmojiSelect={handleEmojiSelect} /></div>)}
            <button onClick={() => setShowEmojiPicker((prev) => !prev)} className="rounded-full p-2 text-gray-400 transition hover:bg-zinc-800" aria-label="Abrir selector de emojis"><Smile className="h-6 w-6" /></button>
            <button className="rounded-full p-2 text-gray-400 transition hover:bg-zinc-800" aria-label="Adjuntar archivo"><Paperclip className="h-6 w-6" /></button>
            
            {/* Input del mensaje */}
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Escribe un mensaje..."
              className="flex-1 rounded-lg bg-zinc-800 px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 min-w-0" 
            />
            
            {/* Botón enviar o grabar */}
            <button
              onClick={message.trim() ? handleSendMessage : handleRecordAudio}
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition-all duration-200 ${message.trim() ? 'bg-white text-black hover:bg-gray-200' : 'bg-zinc-700 text-white hover:bg-zinc-600'}`}
              aria-label={message.trim() ? 'Enviar mensaje' : 'Grabar audio'}
            >
              {message.trim() ? <Send className="h-5 w-5" /> : <Mic className="h-6 w-6" />}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ChatPanel;
