import { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface RegisterProps {
  onNavigate: (page: 'dashboard' | 'login' | 'register') => void;
}

export default function Register({ onNavigate }: RegisterProps) {
  const [username, setUsername] = useState('saranya');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('••••••••');

  const handleRegister = () => {
    onNavigate('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#1a1d29] flex items-center justify-center p-4">
      <div className="bg-[#252936] rounded-2xl p-8 w-full max-w-md border border-[#3a3d4a]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-white mb-2">Join EventsHub</h1>
          <p className="text-gray-400">Create a new account</p>
        </div>

        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
          <div>
            <label className="block text-white mb-2 font-medium">Username</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#e5e7eb] text-black border-0 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="saranya"
            />
          </div>

          <div>
            <label className="block text-white mb-2 font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#3a3d4a] text-white border-0 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-400"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-white mb-2 font-medium">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#e5e7eb] text-black border-0 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Register
          </Button>

          <div className="text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Log in here
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}