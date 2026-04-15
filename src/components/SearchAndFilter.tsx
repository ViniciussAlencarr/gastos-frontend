import React, { useState, useMemo, useEffect } from 'react';
import { TextField, FormControl, InputLabel, Select, MenuItem, Grid, Typography, Card, CardContent } from '@mui/material';
import GastoCard from './GastoCard';
import type { Gasto } from '../types/global';

interface Props {
    gastos: Gasto[];
    setEditingGasto: (gasto: Gasto) => void;
    handleDelete: (id: string) => void;
    onFilteredListUpdate?: (filtered: Gasto[]) => void;
}

const categorias = ["Todas", "Alimentação", "Transporte", "Serviços", "Lazer", "Outros"];
const cartoes = ["Todos", "Nenhum", "Nubank", "Inter", "Mercado Pago"];

const SearchAndFilter: React.FC<Props> = ({ gastos, setEditingGasto, handleDelete, onFilteredListUpdate }) => {
    const [search, setSearch] = useState('');
    const [categoriaFilter, setCategoriaFilter] = useState('Todas');
    const [cartaoFilter, setCartaoFilter] = useState('Todos');
    const [ordenacao, setOrdenacao] = useState('recentes');

    // Filtragem combinada
    const gastosFiltrados = useMemo(() => {
        let result = gastos.filter(gasto => {
            // Filtrar por categoria
            if (categoriaFilter !== 'Todas' && gasto.category !== categoriaFilter) return false;
            
            // Filtrar por cartão
            if (cartaoFilter !== 'Todos') {
                const cardValue = gasto.card || "Nenhum";
                if (cardValue !== cartaoFilter) return false;
            }

            // Filtrar por texto (descrição, valor, etc)
            if (search) {
                const searchLower = search.toLowerCase();
                const textMatch = Object.values(gasto).some(value => {
                    if (!value) return false;
                    return value.toString().toLowerCase().includes(searchLower);
                });
                if (!textMatch) return false;
            }

            return true;
        });

        // Ordenação
        result.sort((a, b) => {
            if (ordenacao === 'recentes') return new Date(b.date).getTime() - new Date(a.date).getTime();
            if (ordenacao === 'antigos') return new Date(a.date).getTime() - new Date(b.date).getTime();
            if (ordenacao === 'maior-valor') return b.value - a.value;
            if (ordenacao === 'menor-valor') return a.value - b.value;
            return 0;
        });

        return result;
    }, [gastos, search, categoriaFilter, cartaoFilter, ordenacao]);

    useEffect(() => {
        if (onFilteredListUpdate) {
            onFilteredListUpdate(gastosFiltrados);
        }
    }, [gastosFiltrados, onFilteredListUpdate]);

    return (
        <div style={{ marginBottom: 24 }}>
            <Card sx={{ 
                mb: 3, 
                boxShadow: 4, 
                position: { md: 'sticky' }, 
                top: { md: 90 }, 
                zIndex: 10,
                backgroundColor: 'rgba(30, 30, 30, 0.65)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
            }}>
                <CardContent sx={{ pb: 2 }}>
                    <Typography variant="h6" gutterBottom>Filtros e Ordenação</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Buscar gastos..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                size="small"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth variant="outlined" size="small">
                                <InputLabel>Categoria</InputLabel>
                                <Select
                                    label="Categoria"
                                    value={categoriaFilter}
                                    onChange={e => setCategoriaFilter(e.target.value)}
                                >
                                    {categorias.map(cat => (
                                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth variant="outlined" size="small">
                                <InputLabel>Cartão / Banco</InputLabel>
                                <Select
                                    label="Cartão / Banco"
                                    value={cartaoFilter}
                                    onChange={e => setCartaoFilter(e.target.value)}
                                >
                                    {cartoes.map(c => (
                                        <MenuItem key={c} value={c}>{c}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth variant="outlined" size="small">
                                <InputLabel>Ordernar por</InputLabel>
                                <Select
                                    label="Ordernar por"
                                    value={ordenacao}
                                    onChange={e => setOrdenacao(e.target.value)}
                                >
                                    <MenuItem value="recentes">Mais Recentes</MenuItem>
                                    <MenuItem value="antigos">Mais Antigos</MenuItem>
                                    <MenuItem value="maior-valor">Maior Valor</MenuItem>
                                    <MenuItem value="menor-valor">Menor Valor</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {gastosFiltrados.map(gasto => (
                    <GastoCard
                        key={gasto._id}
                        gasto={gasto}
                        onEdit={setEditingGasto}
                        onDelete={handleDelete}
                    />
                ))}

                {gastosFiltrados.length === 0 && (
                    <Typography color="textSecondary" align="center" sx={{ mt: 4 }}>
                        Nenhum gasto encontrado nesses filtros.
                    </Typography>
                )}
            </div>
        </div>
    );
};

export default SearchAndFilter;
