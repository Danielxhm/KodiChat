import { MessagesSquare } from 'lucide-react';

const Welcome = () => {
    return (
        <div className="hidden md:flex flex-col flex-1 items-center justify-center bg-gray-50">
            <div className="text-center p-6 max-w-md">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-tr from-blue-100 to-blue-50 flex items-center justify-center">
                    <MessagesSquare className="text-blue-400" size={48} />
                </div>
                <h2 className="text-2xl font-medium text-gray-800 mb-2">Tu Messenger</h2>
                <p className="text-gray-500">
                    Selecciona un chat para empezar a conversar o busca un usuario para iniciar una nueva conversación.
                </p>
            </div>
        </div>
    );
};

export default Welcome;