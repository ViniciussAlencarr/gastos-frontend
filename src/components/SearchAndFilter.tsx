import React, { useState, useMemo } from 'react';
import GastoCard from './GastoCard';
import type { Gasto } from '../types/global';

interface Props {
    gastos: Gasto[];
    setEditingGasto: (gasto: Gasto) => void;
    handleDelete: (id: string) => void;
}

const categorias = ["Todas", "Alimentação", "Transporte", "Serviços", "Lazer", "Outros"];

const SearchAndFilter: React.FC<Props> = ({ gastos, setEditingGasto, handleDelete }) => {
    const [search, setSearch] = useState('');
    const [categoriaFilter, setCategoriaFilter] = useState('Todas');

    // Filtragem combinada
    const gastosFiltrados = useMemo(() => {
        return gastos.filter(gasto => {
            // Filtrar por categoria
            if (categoriaFilter !== 'Todas' && gasto.category !== categoriaFilter) return false;

            // Filtrar por qualquer campo
            const searchLower = search.toLowerCase();
            return Object.values(gasto).some(value => {
                if (!value) return false;
                return value.toString().toLowerCase().includes(searchLower);
            });
        });
    }, [gastos, search, categoriaFilter]);

    return (
        <div className="mb-6">
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    placeholder="Buscar gastos..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="border p-2 rounded w-full"
                />
                <select
                    value={categoriaFilter}
                    onChange={e => setCategoriaFilter(e.target.value)}
                    className="border p-2 rounded bg-[#242424]"
                >
                    {categorias.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                {gastosFiltrados.map(gasto => (
                    <GastoCard
                        key={gasto._id}
                        gasto={gasto}
                        onEdit={setEditingGasto}
                        onDelete={handleDelete}
                    />
                ))}

                {gastosFiltrados.length === 0 && (
                    <p className="text-gray-500">Nenhum gasto encontrado.</p>
                )}
            </div>
        </div>
    );
};

export default SearchAndFilter;
