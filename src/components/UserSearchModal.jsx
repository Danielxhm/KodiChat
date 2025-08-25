import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../api/firebase';
import { useAuth } from '../context/AuthContext';
import useDebounce from '../hooks/useDebounce';
import { X, Search, Loader2 } from 'lucide-react';

const UserSearchModal = ({ isOpen, onClose, onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();
  

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const searchUsers = async () => {
      if (!debouncedSearchTerm.trim()) {
        setUsers([]);
        return;
      }

      setIsLoading(true);
      const q = query(
        collection(db, 'users'),
        where('displayName', '>=', debouncedSearchTerm),
        where('displayName', '<=', debouncedSearchTerm + '\uf8ff')
      );
      
      try {
        const querySnapshot = await getDocs(q);
        const foundUsers = querySnapshot.docs
          .map(doc => doc.data())
          .filter(user => user.uid !== currentUser.uid); // Excluir al usuario actual
        setUsers(foundUsers);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    searchUsers();
  }, [debouncedSearchTerm, currentUser.uid]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="relative flex flex-col w-full max-w-md h-full max-h-[80vh] m-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Start a new chat</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              autoFocus
            />
          </div>
        </div>

        {/* Resultados */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {isLoading && (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
            </div>
          )}
          {!isLoading && users.length > 0 && (
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.uid}
                  onClick={() => onSelectUser(user)}
                  className="flex items-center p-3 cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <img src={user.photoURL} alt={user.displayName} className="w-12 h-12 rounded-full mr-4 object-cover" />
                  <span className="font-medium text-gray-800 dark:text-gray-200">{user.displayName}</span>
                </div>
              ))}
            </div>
          )}
          {!isLoading && users.length === 0 && debouncedSearchTerm && (
             <p className="text-center text-gray-500 mt-8">No se han encontrado usuarios.</p>
          )}
          {!isLoading && !debouncedSearchTerm && (
             <p className="text-center text-gray-500 mt-8">Empieza a escribir para encontrar usuarios con los que chatear.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSearchModal;