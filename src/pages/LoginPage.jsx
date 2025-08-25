import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../api/firebase';
import toast from 'react-hot-toast';

const LoginPage = () => {
    // Estados para email, contraseña y estado de carga
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Maneja el inicio de sesión
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Intenta autenticar con Firebase
            await signInWithEmailAndPassword(auth, email, password);
            toast.success('¡Inicio de sesión exitoso!');
            navigate('/'); // Redirige al inicio
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            toast.error(error.message || 'Error al iniciar sesión.');
        } finally {
            setLoading(false);
        }
    };

    return (
        // Estructura visual del formulario de login
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-900">Iniciar Sesión</h2>
                <form className="space-y-6" onSubmit={handleLogin}>
                    {/* Campo de email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                    {/* Campo de contraseña */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"/>
                    </div>
                    {/* Botón con estado de carga */}
                    <button type="submit" disabled={loading} className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300">
                        {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                    </button>
                </form>
                {/* Enlace a registro */}
                <p className="text-sm text-center text-gray-600">
                    ¿No tienes una cuenta? <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">Regístrate aquí</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
