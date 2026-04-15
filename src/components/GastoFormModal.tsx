import React, { useEffect, useState } from 'react';
import { 
    TextField, 
    Button, 
    FormControl, 
    InputLabel, 
    Select, 
    MenuItem, 
Box, 
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Switch,
    FormControlLabel,
    InputAdornment
} from '@mui/material';
import type { Gasto } from '../types/global';

interface GastoFormModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (gasto: Gasto, installTimes: number) => void;
    gastoToEdit?: Gasto | null;
    mes: number;
    ano: number;
}

const categorias = ["Alimentação", "Transporte", "Serviços", "Lazer", "Outros"];
const cartoes = ["Nenhum", "Nubank", "Inter", "Mercado Pago"];

const GastoFormModal: React.FC<GastoFormModalProps> = ({ open, onClose, onSubmit, gastoToEdit, ano, mes }) => {
    const [description, setDescription] = useState('');
    const [valor, setValor] = useState('');
    const [status, setStatus] = useState('pendente');
    const [category, setCategory] = useState('');
    const [card, setCard] = useState('Nenhum');
    
    // Installment states
    const [isInstallment, setIsInstallment] = useState(false);
    const [installTimes, setInstallTimes] = useState<number>(2);

    useEffect(() => {
        if (open) {
            if (gastoToEdit) {
                setDescription(gastoToEdit.description);
                setValor(gastoToEdit.value.toString());
                setStatus(gastoToEdit.status);
                setCategory(gastoToEdit.category || '');
                setCard(gastoToEdit.card || 'Nenhum');
                setIsInstallment(gastoToEdit.isInstallment || false);
                setInstallTimes(gastoToEdit.installmentTotal || 2);
            } else {
                // Reset form on open
                setDescription('');
                setValor('');
                setStatus('pendente');
                setCategory('');
                setCard('Nenhum');
                setIsInstallment(false);
                setInstallTimes(2);
            }
        }
    }, [gastoToEdit, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !valor) return alert("Preencha descrição e valor");
        
        const date = gastoToEdit?.date ? new Date(gastoToEdit.date) : new Date(ano, mes - 1, 1);
        const parsedValue = parseFloat(valor);

        const gastoBase: Gasto = {
            description,
            value: parsedValue,
            status,
            category,
            card: card === 'Nenhum' ? undefined : card,
            date,
            isInstallment,
        };

        onSubmit(gastoBase, isInstallment ? installTimes : 1);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 }}}>
            <DialogTitle>{gastoToEdit ? 'Editar Lançamento' : 'Novo Lançamento'}</DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <TextField
                            label="Descrição do Gasto"
                            variant="outlined"
                            fullWidth
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            required
                        />
                        
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                            <TextField
                                label="Valor da Parcela/Total"
                                type="number"
                                variant="outlined"
                                fullWidth
                                value={valor}
                                onChange={e => setValor(e.target.value)}
                                required
                                inputProps={{ step: "0.01", min: "0.01" }}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                                }}
                            />
                            
                            <FormControl fullWidth variant="outlined">
                                <InputLabel>Categoria</InputLabel>
                                <Select
                                    label="Categoria"
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                >
                                    <MenuItem value=""><em>Selecione...</em></MenuItem>
                                    {categorias.map(cat => (
                                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                            <FormControl fullWidth variant="outlined">
                                <InputLabel>Método de Pagamento</InputLabel>
                                <Select
                                    label="Método de Pagamento"
                                    value={card}
                                    onChange={e => setCard(e.target.value)}
                                >
                                    {cartoes.map(c => (
                                        <MenuItem key={c} value={c}>{c}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            
                            <FormControl fullWidth variant="outlined">
                                <InputLabel>Status</InputLabel>
                                <Select
                                    label="Status"
                                    value={status}
                                    onChange={e => setStatus(e.target.value)}
                                >
                                    <MenuItem value="pendente">Pendente</MenuItem>
                                    <MenuItem value="pago">Pago</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        <FormControlLabel 
                            control={
                                <Switch 
                                    checked={isInstallment} 
                                    onChange={e => setIsInstallment(e.target.checked)} 
                                    color="primary"
                                />
                            } 
                            label="Compra Parcelada?" 
                            sx={{ mt: 1 }}
                        />

                        {isInstallment && (
                            <TextField
                                label="Quantidade de Parcelas"
                                type="number"
                                variant="outlined"
                                fullWidth
                                value={installTimes}
                                onChange={e => setInstallTimes(parseInt(e.target.value) || 2)}
                                required
                                inputProps={{ min: "2", max: "72" }}
                                helperText="Gera lançamentos para os próximos meses automaticamente."
                            />
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 1.5 }}>
                    <Button onClick={onClose} color="inherit" sx={{ textTransform: 'none' }}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="contained" color="primary" sx={{ px: 3, borderRadius: 2, textTransform: 'none' }}>
                        {gastoToEdit ? 'Atualizar Gasto' : 'Salvar Gasto'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default GastoFormModal;
