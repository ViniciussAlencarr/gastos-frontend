import React from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton, LinearProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { formatMoney } from '../utils/format';
import type { Gasto } from '../types/global';

interface GastoCardProps {
    gasto: Gasto;
    onEdit: (gasto: Gasto) => void;
    onDelete: (id: string) => void;
}

const getCardColor = (card?: string) => {
    switch (card) {
        case 'Nubank':
            return { bg: '#8A05BE', color: '#FFF' };
        case 'Inter':
            return { bg: '#FF7A00', color: '#FFF' };
        case 'Mercado Pago':
            return { bg: '#009EE3', color: '#FFF' };
        default:
            return { bg: '#424242', color: '#FFF' };
    }
};

const GastoCard: React.FC<GastoCardProps> = ({ gasto, onEdit, onDelete }) => {
    const cardColor = getCardColor(gasto.card);
    const isPago = gasto.status === 'pago';
    
    // Installment calcs
    const isInstallment = gasto.isInstallment && gasto.installmentCurrent && gasto.installmentTotal;
    const progressPercent = isInstallment 
        ? ((gasto.installmentCurrent!) / gasto.installmentTotal!) * 100 
        : 0;

    return (
        <Card sx={{ 
            borderRadius: 3, 
            display: 'flex', 
            flexDirection: 'column',
            mb: 2,
            backgroundColor: 'background.paper',
            transition: '0.3s',
            boxShadow: 2,
            overflow: 'hidden',
        }}>
            <Box sx={{ 
                height: 4, 
                width: '100%', 
                backgroundColor: isPago ? '#4caf50' : (gasto.status === 'pendente' ? '#f44336' : 'transparent') 
            }} />
            
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: "bold", lineHeight: 1.2 }}>
                            {gasto.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Typography variant="body1" color={isPago ? 'success.main' : 'error.main'} sx={{ fontWeight: "bold" }}>
                                {formatMoney(gasto.value)}
                            </Typography>
                            
                            {gasto.card && gasto.card !== 'Nenhum' && (
                                <Chip 
                                    label={gasto.card} 
                                    size="small" 
                                    sx={{ backgroundColor: cardColor.bg, color: cardColor.color, fontWeight: 'bold', height: 22 }} 
                                />
                            )}
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Chip label={gasto.category || 'Sem categoria'} size="small" variant="outlined" sx={{ height: 22 }} />
                            <Chip 
                                label={isPago ? 'Pago' : 'Pendente'} 
                                size="small" 
                                color={isPago ? 'success' : 'error'}
                                variant="filled"
                                sx={{ height: 22 }} 
                            />
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <IconButton onClick={() => onEdit(gasto)} color="primary" size="small" sx={{ backgroundColor: 'action.hover' }}>
                            <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton onClick={() => onDelete(gasto._id!)} color="error" size="small" sx={{ backgroundColor: 'action.hover' }}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>

                {isInstallment && (
                    <Box sx={{ mt: 2, p: 1.5, backgroundColor: 'action.hover', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold" }}>
                                Compra Parcelada
                            </Typography>
                            <Typography variant="caption" color="primary" sx={{ fontWeight: "bold" }}>
                                {gasto.installmentCurrent} de {gasto.installmentTotal}
                            </Typography>
                        </Box>
                        <LinearProgress 
                            variant="determinate" 
                            value={progressPercent} 
                            sx={{ height: 6, borderRadius: 3, backgroundColor: 'action.disabledBackground' }} 
                        />
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default GastoCard;
