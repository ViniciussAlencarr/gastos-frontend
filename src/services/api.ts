import axios from 'axios';
import type { Gasto, GastoAcumulado } from '../types/global';

export const BASE_URL = 'http://localhost:3000';

// Cria uma instância do axios
const api = axios.create({
    baseURL: BASE_URL,
});

// Interceptor para adicionar o token automaticamente
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// Auth
export const login = async (email: string, password: string) => {
    const res = await api.post('/login', { email, password });
    localStorage.setItem('token', res.data.token); // salva token
    return res.data;
};

export const register = async (name: string, email: string, password: string) => {
    const res = await api.post('/register', { name, email, password });
    localStorage.setItem('token', res.data.token); // salva token
    return res.data;
};

// Gastos
export const getGastosPorMes = async (ano: number, mes: number): Promise<Gasto[]> => {
    const res = await api.get(`/gastos/${ano}/${mes}`);
    return res.data;
};

export const criarGasto = async (gasto: Gasto) => {
    const res = await api.post('/gastos', gasto);
    return res.data;
};

export const editarGasto = async (id: string, gasto: Gasto) => {
    const res = await api.put(`/gastos/${id}`, gasto);
    return res.data;
};

export const removerGasto = async (id: string) => {
    const res = await api.delete(`/gastos/${id}`);
    return res.data;
};

// Gastos acumulados
export const getGastosAcumulados = async (): Promise<GastoAcumulado[]> => {
    const res = await api.get('/gastos-acumulados');
    return res.data;
};

// Salário
export const getSalario = async () => {
    const res = await api.get('/salario');
    return res.data;
};

export const setSalario = async (value: number) => {
    const res = await api.post('/salario', { value });
    return res.data;
};
