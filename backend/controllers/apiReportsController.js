const { pool } = require('../config/database');

const apiReportsController = {
    // KPI: Total Ventas, Total Ordenes, Ticket Promedio, Conversion Rate
    getKPIs: async (req, res) => {
        try {
            // 1. Total Ventas y Total Ordenes (Solo Aprobadas)
            const [salesStats] = await pool.query(`
                SELECT 
                    COUNT(*) as totalOrdenes,
                    COALESCE(SUM(total), 0) as totalVentas
                FROM cotizaciones 
                WHERE estado = 'aprobada'
            `);

            // 2. Conversion Rate (Aprobadas / Total)
            const [conversionStats] = await pool.query(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN estado = 'aprobada' THEN 1 ELSE 0 END) as aprobadas
                FROM cotizaciones
            `);

            const totalVentas = Number(salesStats[0].totalVentas);
            const totalOrdenes = Number(salesStats[0].totalOrdenes);
            const totalCotizaciones = Number(conversionStats[0].total);
            const totalAprobadas = Number(conversionStats[0].aprobadas);

            const ticketPromedio = totalOrdenes > 0 ? totalVentas / totalOrdenes : 0;
            const conversionRate = totalCotizaciones > 0 ? (totalAprobadas / totalCotizaciones) * 100 : 0;

            res.json({
                success: true,
                data: {
                    totalVentas,
                    totalOrdenes,
                    ticketPromedio,
                    conversionRate
                }
            });
        } catch (error) {
            console.error('Error en getKPIs:', error);
            res.status(500).json({ success: false, error: 'Error al obtener KPIs' });
        }
    },

    // Gráfico 1: Ventas por Mes
    getSalesByMonth: async (req, res) => {
        try {
            // Agrupar por mes y año. 
            // Nota: DATE_FORMAT(created_at, '%Y-%m') ordena cronológicamente mejor que '%m/%Y'
            const [rows] = await pool.query(`
                SELECT 
                    DATE_FORMAT(created_at, '%m/%Y') as name,
                    DATE_FORMAT(created_at, '%Y-%m') as sortKey,
                    SUM(total) as ventas
                FROM cotizaciones
                WHERE estado = 'aprobada'
                GROUP BY sortKey, name
                ORDER BY sortKey ASC
                LIMIT 12
            `);

            // Mapeamos para devolver solo lo necesario
            const data = rows.map(row => ({
                name: row.name,
                ventas: Number(row.ventas)
            }));

            res.json({ success: true, data });
        } catch (error) {
            console.error('Error en getSalesByMonth:', error);
            res.status(500).json({ success: false, error: 'Error al obtener ventas por mes' });
        }
    },

    // Gráfico 2: Ventas por Vendedor
    getSalesBySeller: async (req, res) => {
        try {
            const [rows] = await pool.query(`
                SELECT 
                    u.nombre as vendedor,
                    SUM(c.total) as ventas
                FROM cotizaciones c
                JOIN users u ON c.vendedor_id = u.id
                WHERE c.estado = 'aprobada'
                GROUP BY c.vendedor_id, u.nombre
                ORDER BY ventas DESC
                LIMIT 10
            `);

            const data = rows.map(row => ({
                name: row.vendedor.split(' ')[0], // Primer nombre
                fullName: row.vendedor,
                ventas: Number(row.ventas)
            }));

            res.json({ success: true, data });
        } catch (error) {
            console.error('Error en getSalesBySeller:', error);
            res.status(500).json({ success: false, error: 'Error al obtener ventas por vendedor' });
        }
    },

    // Gráfico 3: Estado de Cotizaciones
    getSalesStatus: async (req, res) => {
        try {
            const [rows] = await pool.query(`
                SELECT 
                    estado,
                    COUNT(*) as value
                FROM cotizaciones
                GROUP BY estado
            `);

            // Mapeo de colores y nombres amigables
            const config = {
                'aprobada': { name: 'Aprobadas', color: '#10B981' },
                'enviada': { name: 'Pendientes', color: '#F59E0B' },
                'rechazada': { name: 'Rechazadas', color: '#EF4444' },
                'borrador': { name: 'Borrador', color: '#9CA3AF' },
                'vencida': { name: 'Vencidas', color: '#6B7280' }
            };

            const data = rows.map(row => {
                const conf = config[row.estado] || { name: row.estado, color: '#000000' };
                return {
                    name: conf.name,
                    value: Number(row.value),
                    color: conf.color
                };
            }).filter(item => item.value > 0);

            res.json({ success: true, data });
        } catch (error) {
            console.error('Error en getSalesStatus:', error);
            res.status(500).json({ success: false, error: 'Error al obtener estado de ventas' });
        }
    }
};

module.exports = apiReportsController;
