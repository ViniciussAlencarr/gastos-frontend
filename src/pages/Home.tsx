import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Alert,
    Fab,
    AppBar,
    Paper,
    Snackbar,
    Divider,
    Toolbar,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import {
    getGastosPorMes,
    criarGasto,
    editarGasto,
    removerGasto,
    getSalario,
    setSalario,
    getGastosAcumulados
} from '../services/api';
import GastoFormModal from '../components/GastoFormModal';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
    const [gastosFiltrados, setGastosFiltrados] = useState<Gasto[]>([]);
    const [totalPendente, setTotalPendente] = useState(0);
    const [totalFiltrado, setTotalFiltrado] = useState(0);
    const [saldo, setSaldo] = useState(0);
    const [salario, setSalarioState] = useState(0);
    
    // Modal and Drawer states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [editingGasto, setEditingGasto] = useState<Gasto | null>(null);

    const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1);
    const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
    const [gastosAcumulados, setGastosAcumulados] = useState<{ mes: string; total: number }[]>([]);
    
    // Feedback Snackbar
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

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

        const total = gastosData.filter(g => g.status === 'pendente').reduce((acc, g) => acc + g.value, 0);
        setTotalPendente(total);

        // Saldo = Salario - TODOS os gastos do mes (pagos e pendentes)
        const totalGeral = gastosData.reduce((acc, g) => acc + g.value, 0);
        setSaldo(salario - totalGeral);
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

    useEffect(() => {
        const totalGeral = gastos.reduce((acc, g) => acc + g.value, 0);
        setSaldo(salario - totalGeral);
    }, [salario, gastos]);

    useEffect(() => {
        fetchGastosMes();
    }, [mesSelecionado, anoSelecionado, fetchGastosMes]);

    useEffect(() => {
        // Atualiza total filtrado
        const totalFiltro = gastosFiltrados.reduce((acc, g) => acc + g.value, 0);
        setTotalFiltrado(totalFiltro);
    }, [gastosFiltrados]);

    const handleSalarioChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const valor = parseFloat(e.target.value) || 0;
        setSalarioState(valor);
        await setSalario(valor);
    };

    const handleAddGasto = async (gasto: Gasto, installTimes: number = 1) => {
        try {
            if (editingGasto) {
                await editarGasto(editingGasto._id!, gasto);
                setEditingGasto(null);
                setSnackbar({ open: true, message: 'Gasto atualizado!', severity: 'success' });
            } else {
                if (gasto.isInstallment && installTimes > 1) {
                    const promises = [];
                    for(let i = 0; i < installTimes; i++) {
                        const nextDate = new Date(gasto.date);
                        nextDate.setMonth(nextDate.getMonth() + i);
                        const installmentGasto = {
                            ...gasto,
                            date: nextDate,
                            installmentCurrent: i + 1,
                            installmentTotal: installTimes,
                        };
                        promises.push(criarGasto(installmentGasto));
                    }
                    await Promise.all(promises);
                    setSnackbar({ open: true, message: `${installTimes} parcelas adicionadas!`, severity: 'success' });
                } else {
                    await criarGasto(gasto);
                    setSnackbar({ open: true, message: 'Gasto adicionado!', severity: 'success' });
                }
            }
            setIsModalOpen(false);
            fetchGastosMes();
            fetchGastosAcumulados();
        } catch (err) {
            console.error(err);
            setSnackbar({ open: true, message: 'Erro ao salvar gasto', severity: 'error' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Deseja realmente excluir este gasto?")) return;
        try {
            const sucesso = await removerGasto(id);
            if (sucesso) {
                setGastos(gastos.filter(g => g._id !== id));
                setSnackbar({ open: true, message: 'Gasto excluído', severity: 'info' });
                fetchGastosMes();
                fetchGastosAcumulados();
            }
        } catch (err) {
            console.error(err);
            setSnackbar({ open: true, message: 'Erro ao excluir gasto', severity: 'error' });
        }
    };

    const handleOpenEditModal = (gasto: Gasto) => {
        setEditingGasto(gasto);
        setIsModalOpen(true);
    };

    // Gráfico de pizza por categoria
    const dadosParaGrafico = gastosFiltrados.length > 0 || gastos.length === 0 ? gastosFiltrados : gastos;
    const dadosGrafico = categorias.map(cat => ({
        name: cat,
        value: dadosParaGrafico.filter(g => g.category === cat).reduce((acc, g) => acc + g.value, 0)
    })).filter(d => d.value > 0);

    return (
        <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', pb: 10 }}>
            <AppBar position="sticky" color="inherit" elevation={1} sx={{ mb: 4, py: 0.5, zIndex: 20 }}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }} onClick={() => setIsDrawerOpen(true)}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" color="primary" fontWeight="bold" sx={{ flexGrow: 1 }}>
                        Minhas Finanças
                    </Typography>
                </Toolbar>
            </AppBar>

            <Drawer anchor="left" open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
                <Box sx={{ width: 250 }} role="presentation" onClick={() => setIsDrawerOpen(false)}>
                    <Box sx={{ p: 3, backgroundColor: 'primary.dark', color: 'white' }}>
                        <Typography variant="h6" fontWeight="bold">Minhas Finanças</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>Menu Principal</Typography>
                    </Box>
                    <List sx={{ mt: 1 }}>
                        <ListItem disablePadding>
                            <ListItemButton selected>
                                <ListItemIcon><DashboardIcon color="primary" /></ListItemIcon>
                                <ListItemText primary="Dashboard" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton>
                                <ListItemIcon><AccountBalanceIcon /></ListItemIcon>
                                <ListItemText primary="Meus Cartões" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton>
                                <ListItemIcon><SettingsIcon /></ListItemIcon>
                                <ListItemText primary="Configurações" />
                            </ListItemButton>
                        </ListItem>
                    </List>
                    <Divider sx={{ my: 1 }} />
                    <List>
                        <ListItem disablePadding>
                            <ListItemButton sx={{ color: 'error.main' }}>
                                <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
                                <ListItemText primary="Sair" />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Box>
            </Drawer>

            <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {/* Salário */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
                            <CardContent>
                                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                    Renda Mensal
                                </Typography>
                                <TextField
                                    type="number"
                                    value={salario}
                                    onChange={handleSalarioChange}
                                    size="small"
                                    fullWidth
                                    variant="outlined"
                                    inputProps={{ step: "0.01" }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Filtro Mês/Ano */}
                    <Grid item xs={12} md={8}>
                        <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
                            <CardContent sx={{ display: 'flex', gap: 3, alignItems: 'center', height: '100%' }}>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                        Mês de Referência
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <FormControl size="small" sx={{ minWidth: 150 }}>
                                            <InputLabel>Mês</InputLabel>
                                            <Select
                                                value={mesSelecionado}
                                                label="Mês"
                                                onChange={e => setMesSelecionado(parseInt(e.target.value as string))}
                                                sx={{ borderRadius: 2 }}
                                            >
                                                {Array.from({ length: 12 }, (_, i) => (
                                                    <MenuItem key={i + 1} value={i + 1}>
                                                        {new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <TextField
                                            label="Ano"
                                            type="number"
                                            size="small"
                                            value={anoSelecionado}
                                            onChange={e => setAnoSelecionado(parseInt(e.target.value))}
                                            sx={{ width: 100, '.MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        />
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Resumo Financeiro */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={4}>
                        <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 4, backgroundColor: 'error.dark', color: 'white' }}>
                            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Pendente à Pagar</Typography>
                            <Typography variant="h5" fontWeight="bold">{formatMoney(totalPendente)}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 4, backgroundColor: saldo >= 0 ? 'success.dark' : 'error.dark', color: 'white' }}>
                            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Saldo Restante (Mês)</Typography>
                            <Typography variant="h5" fontWeight="bold">{formatMoney(saldo)}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 4, backgroundColor: 'primary.dark', color: 'white' }}>
                            <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Valor do Filtro Abaixo</Typography>
                            <Typography variant="h5" fontWeight="bold">{formatMoney(totalFiltrado)}</Typography>
                        </Paper>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4, opacity: 0.5 }} />

                {/* Layout de lista + gráficos */}
                <Grid container spacing={4} sx={{ position: 'relative' }}>
                    {/* Lista de gastos */}
                    <Grid item xs={12} md={6} lg={5}>
                        <SearchAndFilter
                            gastos={gastos}
                            setEditingGasto={handleOpenEditModal}
                            handleDelete={handleDelete}
                            onFilteredListUpdate={(filtered) => setGastosFiltrados(filtered)}
                        />
                    </Grid>

                    {/* Gráficos */}
                    <Grid item xs={12} md={6} lg={7} sx={{ flex: 1 }}>
                        <Box sx={{ 
                            position: { md: 'sticky' }, 
                            top: { md: 100 }, 
                            width: '100%',
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: 3 
                        }}>
                            {/* Pizza por categoria */}
                            <Card elevation={1} sx={{ borderRadius: 3, boxShadow: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom color="textSecondary">Proporção (Filtrada)</Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', height: 420 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={dadosGrafico}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={90}
                                                    outerRadius={140}
                                                    label
                                                >
                                                    {dadosGrafico.map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value: number) => formatMoney(value)} />
                                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* Linha de saldo acumulado */}
                            <Card elevation={1} sx={{ borderRadius: 3, boxShadow: 2 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom color="textSecondary">Histórico de Volume</Typography>
                                    <Box sx={{ width: '100%', height: 350 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={gastosAcumulados} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                                <XAxis dataKey="mes" opacity={0.7} />
                                                <YAxis opacity={0.7} width={80} />
                                                <Tooltip formatter={(value: number) => formatMoney(value)} />
                                                <Line type="monotone" dataKey="total" stroke="#7e57c2" strokeWidth={4} dot={{ r: 5 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>
                    </Grid>
                </Grid>

            </Container>

            {/* Float Action Button para adicionar lançamentos */}
            <Fab 
                color="primary" 
                aria-label="add" 
                sx={{ position: 'fixed', bottom: 32, right: 32 }}
                onClick={() => { setEditingGasto(null); setIsModalOpen(true); }}
            >
                <AddIcon />
            </Fab>

            {/* Modal de Lançamento */}
            <GastoFormModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleAddGasto}
                gastoToEdit={editingGasto}
                ano={anoSelecionado}
                mes={mesSelecionado}
            />

            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={4000} 
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} sx={{ width: '100%', borderRadius: 2 }} elevation={6} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Home;
