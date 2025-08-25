import React, { useState } from 'react';
import { LogOut, MessageSquare, Users, Phone, Settings } from 'lucide-react';
import { auth } from '../api/firebase';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const [activeTab, setActiveTab] = useState('chats');
    const { currentUser } = useAuth();

    const menuItems = [
        { name: 'chats', icon: <MessageSquare size={24} />, label: 'Chats' },
        { name: 'groups', icon: <Users size={24} />, label: 'Grupos' },
        { name: 'calls', icon: <Phone size={24} />, label: 'Llamadas' },
    ];

    const settingsItem = { name: 'settings', icon: <Settings size={24} />, label: 'Ajustes' };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            toast.success('Sesión cerrada correctamente');
        } catch {
            toast.error('Error al cerrar sesión');
        }
    };

    return (
        // Paleta de colores black o OLED (MODO OSCURO) y borde para separar del ChatList
        <div className="flex h-screen w-20 flex-col items-center justify-between bg-black py-6 text-gray-400 border-r border-zinc-800">
            
            {/* Contenedor de perfil con indicador "En Línea" */}
            <div className="group relative cursor-pointer">
                <div className="relative">
                    <img 
                        src={currentUser?.photoURL || `https://api.dicebear.com/8.x/micah/svg?seed=${currentUser?.uid}`} 
                        alt="Perfil" 
                        className="h-12 w-12 rounded-full object-cover transition-transform duration-300 group-hover:scale-110" 
                    />
                    {/* El punto verde es para s "En Línea" */}
                    <span className="absolute bottom-0 right-0 block h-4 w-4 rounded-full bg-green-500 border-2 border-black" />
                </div>
                <span className="absolute left-20 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-zinc-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100">
                    {currentUser?.displayName || 'Perfil'}
                </span>
            </div>

            <nav className="flex flex-col items-center space-y-4">
                {menuItems.map(item => (
                    <IconButton key={item.name} icon={item.icon} label={item.label} onClick={() => setActiveTab(item.name)} active={activeTab === item.name} />
                ))}
            </nav>

            <div className="flex flex-col items-center space-y-4">
                <IconButton icon={settingsItem.icon} label={settingsItem.label} onClick={() => setActiveTab(settingsItem.name)} active={activeTab === settingsItem.name} />
                <IconButton icon={<LogOut size={24} />} label="Cerrar Sesión" onClick={handleLogout} isLogout />
            </div>
        </div>
    );
};

const IconButton = ({ icon, label, onClick, active = false, isLogout = false }) => (
    <div className="group relative flex items-center">
       
        <div className={`absolute -left-1 h-8 w-1 rounded-r-full bg-white transition-all duration-300 ${active ? 'opacity-100' : 'opacity-0'}`} />
        <button
            onClick={onClick}
            // colores para los estados activo y hover
            className={`p-3 rounded-xl transition-all duration-300 ${
                active 
                ? 'bg-zinc-800 text-white' 
                : 'hover:bg-zinc-800 hover:text-white'
            } ${isLogout ? 'hover:text-red-500' : ''}`}
        >
            {icon}
        </button>
      
        <span className="absolute left-20 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-zinc-800 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100">
            {label}
        </span>
    </div>
);

export default Sidebar;