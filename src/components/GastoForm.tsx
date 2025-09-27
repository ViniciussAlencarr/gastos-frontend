import React, { useEffect, useState } from 'react';
import type { Gasto } from '../types/global';

interface GastoFormProps {
    onSubmit: (gasto: Gasto) => void;
    gasto?: Gasto;
}

const categorias = ["Alimentação", "Transporte", "Serviços", "Lazer", "Outros"];

const GastoForm: React.FC<GastoFormProps> = ({ onSubmit, gasto }) => {
    const [description, setDescription] = useState('');
    const [valor, setValor] = useState('');
    const [status, setStatus] = useState('pendente');
    const [category, setCategory] = useState('');

    useEffect(() => {
        if (gasto) {
            setDescription(gasto.description);
            setValor(gasto.value.toString());
            setStatus(gasto.status);
            setCategory(gasto.category || '');
        }
    }, [gasto]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !valor) return alert("Preencha descrição e valor");
        onSubmit({
            description,
            value: parseFloat(valor),
            status,
            category,
            date: gasto?.date || new Date()
        });
        setDescription('');
        setValor('');
        setStatus('pendente');
        setCategory('');
    };

    return (
        <form onSubmit={handleSubmit} className="border p-4 rounded shadow mb-6">
            <div className="mb-2">
                <input
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Descrição"
                    className="border p-2 rounded w-full"
                />
            </div>

            <div className="mb-2 flex gap-2">
                <input
                    type="number"
                    value={valor}
                    onChange={e => setValor(e.target.value)}
                    placeholder="Valor"
                    className="border p-2 rounded w-1/2"
                />
                <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="border p-2 rounded w-1/2 bg-[#242424]"
                >
                    <option value="">Categoria</option>
                    {categorias.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <div className="mb-2">
                <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="border p-2 rounded w-full bg-[#242424]"
                >
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago</option>
                </select>
            </div>

            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                {gasto ? 'Atualizar' : 'Adicionar'}
            </button>
        </form>
    );
};

export default GastoForm;
