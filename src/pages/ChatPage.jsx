import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatList from '../components/ChatList';
import ChatPanel from '../components/ChatPanel';

const ChatPage = () => {
  // Este estado es el cerebro de todo. Si es `null`, no hay chat activo.
  const [activeChat, setActiveChat] = useState(null);

  return (
    <div className="flex h-screen w-full bg-black">
      
      {/* --- INICIO: LAYOUT PARA DESKTOP (Visible desde 'md' en adelante) --- */}
      <div className="hidden md:flex h-full">
        <Sidebar />
      </div>
      <div className="hidden md:flex flex-1 h-full">
        {/* El ChatList siempre visible en su espacio */}
        <div className="w-96 shrink-0 h-full">
          <ChatList onSelectChat={setActiveChat} activeChat={activeChat} />
        </div>
        {/* El ChatPanel solo se muestra si hay un chat activo */}
        <div className="flex-1 h-full">
          {activeChat ? (
            <ChatPanel activeChat={activeChat} />
          ) : (
            // Mensaje de bienvenida si no hay chat seleccionado
            <div className="dark flex h-full flex-1 items-center justify-center bg-[#1F242A]">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-white">Bienvenido a DanielChat</h2>
                <p className="mt-2 text-gray-400">Selecciona una conversación para empezar.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* --- FIN: LAYOUT PARA DESKTOP --- */}


      {/* --- INICIO: LAYOUT PARA MÓVIL/TABLET (Oculto desde 'md' en adelante) --- */}
      <div className="w-full h-full md:hidden">
        {!activeChat ? (
          // Si NO hay chat activo, muestra la LISTA
          <ChatList onSelectChat={setActiveChat} activeChat={activeChat} />
        ) : (
          // Si SÍ hay chat activo, muestra el PANEL
          <ChatPanel 
            activeChat={activeChat} 
            // Le damos la función para volver atrás (poner activeChat en null)
            onGoBack={() => setActiveChat(null)} 
          />
        )}
      </div>
      {/* --- FIN: LAYOUT PARA MÓVIL/TABLET --- */}
      
    </div>
  );
};

export default ChatPage;