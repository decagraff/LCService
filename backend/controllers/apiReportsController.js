const { pool } = require('../config/database');

const apiReportsController = {
    // KPI: Total Ventas, Total Ordenes, Ticket Promedio, Conversion Rate (con filtros)
    getKPIs: async (req, res) => {
        try {
            const { startDate, endDate, vendorId, clientId, categoryId, estado } = req.query;

            let whereConditions = [];
            let params = [];

            if (startDate) {
                whereConditions.push('c.created_at >= ?');
                params.push(startDate);
            }
            if (endDate) {
                whereConditions.push('c.created_at <= ?');
                params.push(endDate);
            }
            if (vendorId) {
                whereConditions.push('c.vendedor_id = ?');
                params.push(vendorId);
            }
            if (clientId) {
                whereConditions.push('c.cliente_id = ?');
                params.push(clientId);
            }
            if (categoryId) {
                whereConditions.push('cd.equipo_id IN (SELECT id FROM equipos WHERE categoria_id = ?)');
                params.push(categoryId);
            }

            const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

            // 1. Total Ventas y Total Ordenes (Solo Aprobadas)
            const salesQuery = categoryId
                ? `SELECT COUNT(DISTINCT c.id) as totalOrdenes, COALESCE(SUM(c.total), 0) as totalVentas
                   FROM cotizaciones c
                   JOIN cotizacion_detalles cd ON c.id = cd.cotizacion_id
                   ${whereClause} ${whereClause ? 'AND' : 'WHERE'} c.estado = 'aprobada'`
                : `SELECT COUNT(*) as totalOrdenes, COALESCE(SUM(total), 0) as totalVentas
                   FROM cotizaciones c
                   ${whereClause}${whereClause ? ' AND' : 'WHERE'} c.estado = 'aprobada'`;

            const [salesStats] = await pool.query(salesQuery, params);

            // 2. Conversion Rate (Aprobadas / Total)
            const conversionQuery = categoryId
                ? `SELECT COUNT(DISTINCT c.id) as total,
                          SUM(CASE WHEN c.estado = 'aprobada' THEN 1 ELSE 0 END) as aprobadas
                   FROM cotizaciones c
                   JOIN cotizacion_detalles cd ON c.id = cd.cotizacion_id
                   ${whereClause}`
                : `SELECT COUNT(*) as total,
                          SUM(CASE WHEN c.estado = 'aprobada' THEN 1 ELSE 0 END) as aprobadas
                   FROM cotizaciones c
                   ${whereClause}`;

            const [conversionStats] = await pool.query(conversionQuery, params);

            const totalVentas = Number(salesStats[0].totalVentas || 0);
            const totalOrdenes = Number(salesStats[0].totalOrdenes || 0);
            const totalCotizaciones = Number(conversionStats[0].total || 0);
            const totalAprobadas = Number(conversionStats[0].aprobadas || 0);

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

    // Gráfico 1: Ventas por Período (con filtros y agrupación)
    getSalesByMonth: async (req, res) => {
        try {
            const { startDate, endDate, vendorId, clientId, categoryId, estado, groupBy = 'month' } = req.query;

            // Build WHERE clause
            let whereConditions = ["c.estado = 'aprobada'"];
            let params = [];

            if (startDate) {
                whereConditions.push('c.created_at >= ?');
                params.push(startDate);
            }
            if (endDate) {
                whereConditions.push('c.created_at <= ?');
                params.push(endDate);
            }
            if (vendorId) {
                whereConditions.push('c.vendedor_id = ?');
                params.push(vendorId);
            }
            if (clientId) {
                whereConditions.push('c.cliente_id = ?');
                params.push(clientId);
            }
            if (categoryId) {
                whereConditions.push('cd.equipo_id IN (SELECT id FROM equipos WHERE categoria_id = ?)');
                params.push(categoryId);
            }
            if (estado) {
                // Si se filtra por estado específico, removemos el filtro por defecto 'aprobada'
                whereConditions = whereConditions.filter(c => !c.includes("c.estado = 'aprobada'"));
                whereConditions.push('c.estado = ?');
                params.push(estado);
            }

            const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

            // Determine grouping format
            let dateFormat, sortFormat, groupLabel;
            switch (groupBy) {
                case 'day':
                    dateFormat = '%d/%m';
                    sortFormat = '%Y-%m-%d';
                    groupLabel = 'Día';
                    break;
                case 'week':
                    dateFormat = 'Sem %v';
                    sortFormat = '%Y-%v';
                    groupLabel = 'Semana';
                    break;
                case 'year':
                    dateFormat = '%Y';
                    sortFormat = '%Y';
                    groupLabel = 'Año';
                    break;
                case 'month':
                default:
                    dateFormat = '%m/%Y';
                    sortFormat = '%Y-%m';
                    groupLabel = 'Mes';
            }

            const query = categoryId
                ? `SELECT 
                       DATE_FORMAT(c.created_at, '${dateFormat}') as name,
                       DATE_FORMAT(c.created_at, '${sortFormat}') as sortKey,
                       SUM(c.total) as ventas
                   FROM cotizaciones c
                   JOIN cotizacion_detalles cd ON c.id = cd.cotizacion_id
                   ${whereClause}
                   GROUP BY sortKey, name
                   ORDER BY sortKey ASC
                   LIMIT 50`
                : `SELECT 
                       DATE_FORMAT(c.created_at, '${dateFormat}') as name,
                       DATE_FORMAT(c.created_at, '${sortFormat}') as sortKey,
                       SUM(c.total) as ventas
                   FROM cotizaciones c
                   ${whereClause}
                   GROUP BY sortKey, name
                   ORDER BY sortKey ASC
                   LIMIT 50`;

            const [rows] = await pool.query(query, params);

            const data = rows.map(row => ({
                name: row.name,
                ventas: Number(row.ventas)
            }));

            res.json({ success: true, data, groupBy: groupLabel });
        } catch (error) {
            console.error('Error en getSalesByMonth:', error);
            res.status(500).json({ success: false, error: 'Error al obtener ventas por período' });
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
    },

    // Ventas por Categoría (with filters)
    getSalesByCategory: async (req, res) => {
        try {
            const { startDate, endDate, vendorId, clientId, estado } = req.query;

            let whereConditions = ["c.estado = 'aprobada'"];
            let params = [];

            if (startDate) {
                whereConditions.push('c.created_at >= ?');
                params.push(startDate);
            }
            if (endDate) {
                whereConditions.push('c.created_at <= ?');
                params.push(endDate);
            }
            if (vendorId) {
                whereConditions.push('c.vendedor_id = ?');
                params.push(vendorId);
            }
            if (clientId) {
                whereConditions.push('c.cliente_id = ?');
                params.push(clientId);
            }
            if (estado) {
                whereConditions[0] = 'c.estado = ?';
                params.unshift(estado);
            }

            const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

            const [rows] = await pool.query(`
                SELECT 
                    cat.nombre as categoria,
                    SUM(cd.subtotal) as ventas,
                    COUNT(DISTINCT c.id) as cotizaciones
                FROM cotizaciones c
                JOIN cotizacion_detalles cd ON c.id = cd.cotizacion_id
                JOIN equipos e ON cd.equipo_id = e.id
                JOIN categorias cat ON e.categoria_id = cat.id
                ${whereClause}
                GROUP BY cat.id, cat.nombre
                ORDER BY ventas DESC
                LIMIT 10
            `, params);

            const data = rows.map(row => ({
                name: row.categoria,
                ventas: Number(row.ventas),
                cotizaciones: Number(row.cotizaciones)
            }));

            res.json({ success: true, data });
        } catch (error) {
            console.error('Error en getSalesByCategory:', error);
            res.status(500).json({ success: false, error: 'Error al obtener ventas por categoría' });
        }
    },

    // ==========================================
    // FUNCIONES AUXILIARES PARA CÁLCULOS REALES
    // ==========================================

    // Función para calcular eficiencia (0-10) basada en tiempo (minutos)
    _calculateEfficiency: (avgMinutes) => {
        if (!avgMinutes && avgMinutes !== 0) return 0;
        // Base: 2 horas (120 min) = 9.5 puntos. 1 día (1440 min) = 8 puntos.
        if (avgMinutes <= 120) return 9.5; // Muy eficiente
        if (avgMinutes <= 1440) return 8.0; // 1 día
        if (avgMinutes <= 4320) return 5.0; // 3 días
        return 2.0; // > 3 días
    },

    // Función para calcular satisfacción (0-10) basada en tasa de aprobación y tiempo
    _calculateSatisfaction: (approvalRate, efficiencyScore) => {
        // Ponderado: 70% Tasa de Aprobación, 30% Eficiencia percibida
        const approvalScore = approvalRate / 10; // Convertir % a 0-10
        return (approvalScore * 0.7) + (efficiencyScore * 0.3);
    },

    // Función genérica para extraer datos Pre/Post
    _getTestData: async (req, res, baseWhereCondition) => {
        const { startDate, endDate, vendorId, clientId } = req.query;
        let whereConditions = [baseWhereCondition];
        let params = [];

        // Aplicar filtros extras sobre el conjunto base
        if (startDate) { whereConditions.push('created_at >= ?'); params.push(startDate); }
        if (endDate) { whereConditions.push('created_at <= ?'); params.push(endDate); }
        if (vendorId) { whereConditions.push('vendedor_id = ?'); params.push(vendorId); }
        if (clientId) { whereConditions.push('cliente_id = ?'); params.push(clientId); }

        const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

        // 1. Tiempo Promedio (Minutos) - Solo de las aprobadas (ciclo cerrado)
        const [timeRows] = await pool.query(`
            SELECT AVG(TIMESTAMPDIFF(MINUTE, created_at, updated_at)) as avgMinutes
            FROM cotizaciones ${whereClause} AND estado = 'aprobada'
        `, params);

        // 2. Tasas (Total, Aprobadas, Rechazadas)
        const [rateRows] = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN estado = 'aprobada' THEN 1 ELSE 0 END) as approved,
                SUM(CASE WHEN estado = 'rechazada' THEN 1 ELSE 0 END) as rejected
            FROM cotizaciones ${whereClause}
        `, params);

        // 3. Distribución para Gráfico de Dispersión
        const [distRows] = await pool.query(`
            SELECT id, TIMESTAMPDIFF(MINUTE, created_at, updated_at) / 60 as hours
            FROM cotizaciones ${whereClause} AND estado = 'aprobada'
            LIMIT 100
        `, params);

        // 4. Evolución Temporal
        const [evolRows] = await pool.query(`
            SELECT DATE_FORMAT(created_at, '%d/%m') as name, SUM(total) as ventas
            FROM cotizaciones ${whereClause} AND estado = 'aprobada'
            GROUP BY DATE_FORMAT(created_at, '%d/%m'), DATE(created_at)
            ORDER BY DATE(created_at) ASC LIMIT 20
        `, params);

        // Cálculos
        const avgResponseTime = Number(timeRows[0].avgMinutes) || 0;
        const total = Number(rateRows[0].total) || 0;
        const approved = Number(rateRows[0].approved) || 0;
        const rejected = Number(rateRows[0].rejected) || 0;

        const errorRate = total > 0 ? (rejected / total) * 100 : 0;
        const approvalRate = total > 0 ? (approved / total) * 100 : 0;

        // Calcular métricas dinámicas
        const efficiency = apiReportsController._calculateEfficiency(avgResponseTime);
        const satisfaction = apiReportsController._calculateSatisfaction(approvalRate, efficiency);

        res.json({
            success: true,
            data: {
                avgResponseTime, // En minutos
                errorRate,
                satisfaction: Number(satisfaction.toFixed(1)), // 0-10
                efficiency: Number(efficiency.toFixed(1)),     // 0-10
                distribution: distRows.map(r => ({ id: r.id, hours: Number(r.hours) })),
                salesByPeriod: evolRows.map(r => ({ name: r.name, ventas: Number(r.ventas) }))
            }
        });
    },

    // ==========================================
    // DATOS DETALLADOS PRE Y POST TEST (REALES)
    // ==========================================

    // Pre-Test Detailed Data (Datos ANTIGUOS > 30 días)
    getPreTestDetailed: async (req, res) => {
        try {
            const whereBase = "created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)";
            await apiReportsController._getTestData(req, res, whereBase);
        } catch (error) {
            console.error('Error Pre-Test:', error);
            res.status(500).json({ success: false, error: 'Error Pre-Test' });
        }
    },

    // Post-Test Detailed Data (Datos RECIENTES <= 30 días)
    getPostTestDetailed: async (req, res) => {
        try {
            const whereBase = "created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
            await apiReportsController._getTestData(req, res, whereBase);
        } catch (error) {
            console.error('Error Post-Test:', error);
            res.status(500).json({ success: false, error: 'Error Post-Test' });
        }
    },

    // Thesis KPIs wrapper (Mantenido por compatibilidad, pero devuelve objeto vacío)
    getThesisKPIs: async (req, res) => {
        res.json({ success: true, data: {} });
    }
};

module.exports = apiReportsController;