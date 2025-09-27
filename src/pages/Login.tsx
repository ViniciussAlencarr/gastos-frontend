import { useState } from 'react';
import { login, register } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [isRegister, setIsRegister] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async () => {
        try {
            const res = isRegister
                ? await register(nome, email, senha)
                : await login(email, senha);

            localStorage.setItem('token', res.token);
            navigate('/');
        } catch (err) {
            alert('Erro: ' + (err as any)?.response?.data?.error || err);
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">{isRegister ? 'Register' : 'Login'}</h1>
            {isRegister && (
                <input
                    type="text"
                    placeholder="Nome"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    className="border p-2 rounded w-full mb-2"
                />
            )}
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="border p-2 rounded w-full mb-2"
            />
            <input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                className="border p-2 rounded w-full mb-2"
            />
            <button
                onClick={handleSubmit}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full mb-2"
            >
                {isRegister ? 'Register' : 'Login'}
            </button>
            <p
                className="text-sm text-center cursor-pointer text-blue-600"
                onClick={() => setIsRegister(!isRegister)}
            >
                {isRegister ? 'Já tem conta? Faça login' : 'Não tem conta? Registre-se'}
            </p>
        </div>
    );
};

export default Login;
