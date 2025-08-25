import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../api/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(res.user, {
        displayName,
        photoURL: `https://api.dicebear.com/9.x/big-smile/png?seed=${encodeURIComponent(displayName)}`
 // Generador de avatares simple
      });
      // POST endpoint: Crear usuario en la colección 'users'
      await setDoc(doc(db, 'users', res.user.uid), {
        uid: res.user.uid,
        displayName,
        email,
        photoURL: `https://api.dicebear.com/9.x/big-smile/png?seed=${encodeURIComponent(displayName)}`

      });
      navigate('/');
    } catch (err) {
      setError('No se ha podido crear una cuenta.');
      console.error(err);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center">Register</h2>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input type="text" placeholder="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full px-4 py-2 border rounded-md" required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border rounded-md" required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border rounded-md" required />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600">Register</button>
      </form>
    </div>
  );
};

export default Register;