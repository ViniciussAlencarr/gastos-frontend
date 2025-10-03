import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    getGastosPorMes,
    criarGasto,
    editarGasto,
    removerGasto,
    getSalario,
    setSalario,
    getGastosAcumulados
} from '../services/api';
import GastoForm from '../components/GastoForm';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

// utils
import { formatMoney } from '../utils/format';

// components
import SearchAndFilter from '../components/SearchAndFilter';

// types
import type { Gasto } from '../types/global';

const categorias = ["Alimentação", "Transporte", "Serviços", "Lazer", "Outros"];
const cores = ["#10519F", "#E3B83A", "#F9F6F8", "#E0D9DD", "#FF6B6B"];

const Home = () => {
    const [gastos, setGastos] = useState<Gasto[]>([]);
    const [totalPendente, setTotalPendente] = useState(0);
    const [saldo, setSaldo] = useState(0);
    const [salario, setSalarioState] = useState(0);
    const [editingGasto, setEditingGasto] = useState<Gasto | null>(null);
    const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1);
    const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
    const [gastosAcumulados, setGastosAcumulados] = useState<{ mes: string; total: number }[]>([]);

    const fetchedRef = useRef(false);

    // Carregar salário
    const fetchSalario = async () => {
        const valor = await getSalario();
        setSalarioState(valor);
    };

    // Buscar gastos do mês
    const fetchGastosMes = useCallback(async () => {
        const gastosData = await getGastosPorMes(anoSelecionado, mesSelecionado);
        setGastos(gastosData);

        const total = gastosData.reduce((acc, g) => acc + g.value, 0);
        setTotalPendente(total);

        setSaldo(salario - total);
    }, [anoSelecionado, mesSelecionado, salario]);

    // Buscar gastos acumulados por mês
    const fetchGastosAcumulados = async () => {
        const res = await getGastosAcumulados();
        setGastosAcumulados(res.map(d => ({
            mes: `${d._id.mes}/${d._id.ano}`,
            total: d.total
        })));
    };

    useEffect(() => {
        if (!fetchedRef.current) {
            fetchedRef.current = true;
            fetchSalario();
            fetchGastosMes();
            fetchGastosAcumulados();
        }
    }, [fetchGastosMes]);

    useEffect(() => setSaldo(salario - totalPendente), [salario, totalPendente]);

    useEffect(() => {
        fetchGastosMes();
    }, [mesSelecionado, anoSelecionado, fetchGastosMes]);

    const handleSalarioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const valor = parseFloat(e.target.value) || 0;
        setSalarioState(valor);
        await setSalario(valor);
    };

    const handleAddGasto = async (gasto: Gasto) => {
        if (editingGasto) {
            await editarGasto(editingGasto._id!, gasto);
            setEditingGasto(null);
        } else {
            await criarGasto(gasto);
        }
        fetchGastosMes();
        fetchGastosAcumulados();
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Deseja realmente excluir este gasto?")) return;
        const sucesso = await removerGasto(id);
        if (sucesso) {
            setGastos(gastos.filter(g => g._id !== id));
            fetchGastosMes();
            fetchGastosAcumulados();
        }
    };

    // Gráfico de pizza por categoria
    const dadosGrafico = categorias.map(cat => ({
        name: cat,
        value: gastos.filter(g => g.category === cat).reduce((acc, g) => acc + g.value, 0)
    }));

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Dashboard de Gastos</h1>

            {/* Salário */}
            <div className="mb-6 flex gap-2 items-center">
                <label className="font-semibold">Salário: </label>
                <input
                    type="number"
                    value={salario}
                    onChange={handleSalarioChange}
                    placeholder="R$ 0,00"
                    className="border p-2 rounded w-32"
                />
            </div>

            {/* Filtro mês/ano */}
            <div className="mb-6 flex gap-2 items-center">
                <label className="font-semibold">Filtrar mês: </label>
                <select
                    value={mesSelecionado}
                    onChange={e => setMesSelecionado(parseInt(e.target.value))}
                    className="border p-2 rounded bg-[#242424]"
                >
                    {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                            {new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}
                        </option>
                    ))}
                </select>
                <input
                    type="number"
                    value={anoSelecionado}
                    onChange={e => setAnoSelecionado(parseInt(e.target.value))}
                    className="border p-2 rounded w-24"
                />
            </div>

            {/* Total e saldo */}
            <div className="mb-6 flex justify-between">
                <div>
                    <span className="text-lg font-semibold">Total pendente: </span>
                    <span className="text-xl text-red-500">{formatMoney(totalPendente)}</span>
                </div>
                <div>
                    <span className="text-lg font-semibold">Saldo mensal: </span>
                    <span className={`text-xl ${saldo >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatMoney(saldo)}
                    </span>
                </div>
            </div>

            {/* Formulário de gasto */}
            <GastoForm
                onSubmit={handleAddGasto}
                gasto={editingGasto!}
                mes={mesSelecionado}
                ano={anoSelecionado} />

            {/* Layout de lista + gráficos */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lista de gastos */}
                <SearchAndFilter
                    gastos={gastos}
                    setEditingGasto={setEditingGasto}
                    handleDelete={handleDelete}
                />

                {/* Gráficos */}
                <div className="space-y-6">
                    {/* Pizza por categoria */}
                    <div className="border p-4 rounded shadow">
                        <h2 className="font-semibold mb-2">Gastos por categoria</h2>
                        <PieChart width={300} height={300}>
                            <Pie
                                data={dadosGrafico}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label
                            >
                                {dadosGrafico.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => formatMoney(value)} />
                            <Legend />
                        </PieChart>
                    </div>

                    {/* Linha de saldo acumulado */}
                    <div className="border p-4 rounded shadow">
                        <h2 className="font-semibold mb-2">Saldo acumulado por mês</h2>
                        <LineChart width={400} height={250} data={gastosAcumulados}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="mes" />
                            <YAxis />
                            <Tooltip contentStyle={{ 'background': '#242424' }} formatter={(value: number) => formatMoney(value)} />
                            <Line type="monotone" dataKey="total" stroke="#10519F" />
                        </LineChart>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
