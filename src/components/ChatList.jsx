import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../api/firebase';
import { useAuth } from '../context/AuthContext';
import { MessageSquarePlus } from 'lucide-react';
import UserSearchModal from './UserSearchModal';

// Historias ficticias Reels
const mockStories = [
  { id: 1, name: 'Alice', photoURL: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
  { id: 2, name: 'Bob', photoURL: 'https://i.pravatar.cc/150?u=a042581f4e29026705d' },
  { id: 3, name: 'Charlie', photoURL: 'https://i.pravatar.cc/150?u=a042581f4e29026706d' },
  { id: 4, name: 'Diana', photoURL: 'https://i.pravatar.cc/150?u=a042581f4e29026707d' },
  { id: 5, name: 'Edward', photoURL: 'https://i.pravatar.cc/150?u=a042581f4e29026708d' },
];

// Formatea el timestamp de cada chat (Hoy, Ayer o fecha)
const formatChatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date >= today) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (date >= yesterday) {
        return 'Ayer';
    }
    return date.toLocaleDateString();
};

const ChatList = ({ onSelectChat, activeChat }) => {
  const [chats, setChats] = useState([]); // Lista de chats del usuario
  const [isSearchOpen, setIsSearchOpen] = useState(false); // Control del modal de búsqueda
  const { currentUser } = useAuth(); // Usuario autenticado

  // Crear o abrir un chat con el usuario seleccionado
  const handleSelectUser = async (user) => {
    if (!currentUser || !user) return;

    // ID único combinando los UID (para evitar duplicados)
    const combinedId = currentUser.uid > user.uid ? currentUser.uid + user.uid : user.uid + currentUser.uid;

    try {
      const chatDoc = await getDoc(doc(db, 'chats', combinedId));
      
      // Si no existe el chat, lo creamos en Firestore
      if (!chatDoc.exists()) {
        await setDoc(doc(db, 'chats', combinedId), {
          members: [currentUser.uid, user.uid],
          memberInfo: {
            [currentUser.uid]: { displayName: currentUser.displayName, photoURL: currentUser.photoURL },
            [user.uid]: { displayName: user.displayName, photoURL: user.photoURL },
          },
          lastMessage: { text: '', timestamp: serverTimestamp() },
          unreadCount: { [currentUser.uid]: 0, [user.uid]: 0 }
        });
      }

      // Abrimos el chat seleccionado
      onSelectChat({ chatId: combinedId, otherUser: user });
      setIsSearchOpen(false);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  // Escuchar en tiempo real los chats del usuario
  useEffect(() => {
    if (!currentUser) return;

    // Consultar los chats donde está el usuario
    const q = query(collection(db, 'chats'), where('members', 'array-contains', currentUser.uid));

    // Suscripción en tiempo real a Firestore
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userChats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Ordenar chats por último mensaje
      userChats.sort(
        (a, b) => (b.lastMessage?.timestamp?.toDate() || 0) - (a.lastMessage?.timestamp?.toDate() || 0)
      );

      setChats(userChats);
    });

    return () => unsubscribe(); // Limpiar suscripción
  }, [currentUser]);

  return (
    <>
      <div className="flex flex-col w-96 shrink-0 bg-black h-screen border-r border-zinc-800">
        {/* Estilos para ocultar scrollbar y personalizarlo */}
        <style>{`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          .transparent-scrollbar::-webkit-scrollbar { width: 6px; }
          .transparent-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .transparent-scrollbar::-webkit-scrollbar-thumb { background-color: rgb(63 63 70); border-radius: 20px; }
          .transparent-scrollbar { scrollbar-width: thin; scrollbar-color: rgb(63 63 70) transparent; }
        `}</style>
        
        {/* Header con título y botón para buscar usuarios */}
        <header className="flex items-center justify-between p-4 border-b border-zinc-800 shrink-0">
          <h1 className="text-2xl font-bold text-gray-100">KodiChat</h1>
          <button onClick={() => setIsSearchOpen(true)} className="p-2 rounded-full text-gray-400 hover:bg-zinc-800 hover:text-white transition-colors">
            <MessageSquarePlus className="w-6 h-6" />
          </button>
        </header>

        {/* Historias (simulación tipo Instagram) */}
        <div className="p-4 border-b border-zinc-800 shrink-0">
            <h2 className="text-xs font-bold text-gray-400 uppercase mb-3">Historias</h2>
            <div className="flex space-x-4 overflow-x-auto pb-2 -mb-2 hide-scrollbar">
                {mockStories.map(story => (
                    <div key={story.id} className="flex flex-col items-center flex-shrink-0 w-20 cursor-pointer group">
                        <div className="relative p-0.5 rounded-full ring-2 ring-zinc-700 group-hover:ring-zinc-500 transition-all">
                            <img src={story.photoURL} alt={story.name} className="w-16 h-16 rounded-full object-cover border-2 border-black" />
                        </div>
                        <p className="text-xs text-gray-400 group-hover:text-white mt-1 truncate transition-colors">{story.name}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* Lista de chats */}
        <div className="flex-1 min-h-0 overflow-y-auto transparent-scrollbar p-2">
          {chats.map((chat) => {
            const otherUserId = chat.members.find((uid) => uid !== currentUser?.uid);
            const otherUserInfo = chat.memberInfo[otherUserId];
            if (!otherUserInfo) return null;

            const isActive = activeChat?.chatId === chat.id; // Chat abierto actualmente
            const unreadMessages = chat.unreadCount ? chat.unreadCount[currentUser.uid] : 0; // Contador no leídos
            const hasUnread = unreadMessages > 0;

            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat({ chatId: chat.id, otherUser: otherUserInfo })}
                className={`flex items-center p-2 mb-2 rounded-xl cursor-pointer transition-all duration-200
                  ${ isActive
                    ? 'bg-zinc-700' 
                    : 'bg-zinc-800/40 backdrop-blur-sm border border-zinc-700/60 hover:bg-zinc-800/70 hover:border-zinc-700'
                  }`
                }
              >
                {/* Foto del otro usuario */}
                <img src={otherUserInfo.photoURL} alt={otherUserInfo.displayName} className="w-12 h-12 rounded-full mr-3 object-cover" />
                
                {/* Nombre y último mensaje */}
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-semibold text-white">{otherUserInfo.displayName}</h3>
                  <p className="text-sm text-gray-400 truncate">{chat.lastMessage?.text || 'No hay mensajes'}</p>
                </div>

                {/* Hora y contador de no leídos */}
                <div className="flex flex-col items-end ml-2 text-xs text-gray-500 space-y-1 shrink-0">
                    <span className={isActive ? 'text-gray-300' : 'text-gray-400'}>{formatChatTimestamp(chat.lastMessage?.timestamp)}</span>
                    {hasUnread && (
                        <span className="flex items-center justify-center w-5 h-5 bg-white text-black text-[10px] font-bold rounded-full">
                            {unreadMessages}
                        </span>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Modal para buscar y agregar nuevos chats */}
      <UserSearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        onSelectUser={handleSelectUser}
      />
    </>
  );
};

export default ChatList;
