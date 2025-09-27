import React from 'react';
import { formatMoney } from '../utils/format';
import type { Gasto } from '../types/global';

interface GastoCardProps {
    gasto: Gasto;
    onEdit: (gasto: Gasto) => void;
    onDelete: (id: string) => void;
}

const GastoCard: React.FC<GastoCardProps> = ({ gasto, onEdit, onDelete }) => {
    return (
        <div className="border p-4 rounded shadow flex justify-between items-center">
            <div>
                <h3 className="font-semibold">{gasto.description}</h3>
                <p>Valor: {formatMoney(gasto.value)}</p>
                <p>Categoria: {gasto.category || 'Sem categoria'}</p>
                <p>Status: {gasto.status}</p>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => onEdit(gasto)}
                    className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500"
                >
                    Editar
                </button>
                <button
                    onClick={() => onDelete(gasto._id!)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                    Excluir
                </button>
            </div>
        </div>
    );
};

export default GastoCard;
