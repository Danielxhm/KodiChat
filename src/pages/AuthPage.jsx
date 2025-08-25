import React, { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';

const AuthPage = () => {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        {isLoginView ? <Login /> : <Register />}
        <p className="text-center text-gray-600">
          {isLoginView ? "¿No tienes una cuenta?" : '¿Ya tienes una cuenta?'}
          <button
            onClick={() => setIsLoginView(!isLoginView)}
            className="ml-2 font-medium text-blue-500 hover:text-blue-600"
          >
            {isLoginView ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;