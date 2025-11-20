USE lcservice_db;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE cotizacion_detalles;
TRUNCATE TABLE cotizaciones;
TRUNCATE TABLE equipos;
TRUNCATE TABLE categorias;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- 1. CATEGORÍAS
-- ==========================================
INSERT INTO categorias (nombre, descripcion) VALUES
('Mesas de Trabajo', 'Mesas de acero inoxidable para preparación de alimentos'),
('Estantes y Repisas', 'Sistemas de almacenamiento para cocinas industriales'),
('Fregaderos', 'Fregaderos simples y dobles para uso intensivo'),
('Campanas Extractoras', 'Sistemas de extracción de humos y vapores'),
('Carritos de Servicio', 'Carritos móviles para transporte de alimentos'),
('Gabinetes y Alacenas', 'Sistemas de almacenamiento cerrado'),
('Lavaderos y Escurreplatos', 'Lavaderos industriales con escurreplatos integrados'),
('Tarimas y Plataformas', 'Tarimas antideslizantes para áreas húmedas'),
('Cocinas Industriales', 'Cocinas de alto rendimiento a gas y eléctricas'),
('Hornos Profesionales', 'Hornos convectores, pasteleros y de pizza'),
('Refrigeración Industrial', 'Cámaras, mesas refrigeradas y congeladores'),
('Procesamiento de Alimentos', 'Licuadoras, procesadores, cortadoras industriales'),
('Lavado de Vajilla', 'Lavavajillas industriales y accesorios'),
('Menaje y Utensilios', 'Ollas, sartenes y utensilios de cocina profesional'),
('Exhibición y Buffet', 'Equipos para mantener alimentos calientes o fríos');

-- ==========================================
-- 2. EQUIPOS (INVENTARIO)
-- ==========================================
INSERT INTO equipos (categoria_id, codigo, nombre, descripcion, material, dimensiones, precio, stock) VALUES
-- Mesas de Trabajo (Cat 1) [IDs 1-5]
(1, 'MT-120x60', 'Mesa de Trabajo 120x60x85cm', 'Mesa de trabajo con respaldo y entrepaño inferior', 'Acero AISI 304', '120x60x85cm', 850.00, 15),
(1, 'MT-150x70', 'Mesa de Trabajo 150x70x85cm', 'Mesa de trabajo extra reforzada para uso intensivo', 'Acero AISI 304', '150x70x85cm', 1200.00, 8),
(1, 'MT-180x80', 'Mesa de Trabajo Extra Grande 180x80x85cm', 'Mesa reforzada para trabajo pesado', 'Acero AISI 304', '180x80x85cm', 1650.00, 5),
(1, 'MT-CENTRAL-200', 'Mesa Central de Trabajo 200x100x85cm', 'Mesa tipo isla, acceso por ambos lados', 'Acero AISI 304', '200x100x85cm', 2200.00, 3),
(1, 'MT-CORTE-100', 'Mesa de Corte con Tabla 100x60cm', 'Incluye tabla de polietileno de alta densidad', 'Acero AISI 304', '100x60x85cm', 950.00, 10),

-- Estantes y Repisas (Cat 2) [IDs 6-9]
(2, 'EST-3N-120', 'Estante 3 Niveles 120x40x180cm', 'Estante con capacidad de 80kg por nivel, patas regulables', 'Acero AISI 304', '120x40x180cm', 450.00, 12),
(2, 'EST-4N-150', 'Estante 4 Niveles 150x50x200cm', 'Estante con capacidad de 100kg por nivel, ideal para almacén', 'Acero AISI 304', '150x50x200cm', 680.00, 6),
(2, 'REP-MUR-100', 'Repisa Mural Lisa 100x30cm', 'Repisa para fijación a pared, incluye soportes', 'Acero AISI 304', '100x30cm', 180.00, 25),
(2, 'REP-TUB-120', 'Repisa Tubular 120x40cm', 'Diseño tubular para ollas y sartenes', 'Acero AISI 304', '120x40cm', 220.00, 15),

-- Fregaderos (Cat 3) [IDs 10-13]
(3, 'FRG-SIM-60', 'Fregadero Simple 60x60x85cm', 'Poza profunda de 30cm, incluye grifería industrial', 'Acero AISI 304', '60x60x85cm', 750.00, 10),
(3, 'FRG-DOB-120', 'Fregadero Doble 120x60x85cm', 'Dos pozas de 50x40cm c/u, separador central desmontable', 'Acero AISI 304', '120x60x85cm', 1200.00, 5),
(3, 'FRG-TRI-180', 'Fregadero Triple 180x60x85cm', 'Tres pozas independientes, grifería incluida', 'Acero AISI 304', '180x60x85cm', 1850.00, 3),
(3, 'FRG-MURAL-80', 'Fregadero Mural 80x50x100cm', 'Montaje en pared, ahorra espacio', 'Acero AISI 304', '80x50x100cm', 680.00, 8),

-- Campanas Extractoras (Cat 4) [IDs 14-16]
(4, 'CAM-120x60', 'Campana Extractora 120x60x40cm', 'Motor centrífugo incluido, filtros lavables de acero', 'Acero AISI 304', '120x60x40cm', 1800.00, 4),
(4, 'CAM-200x80', 'Campana Extractora 200x80x50cm', 'Motor de alta potencia, sistema anti-goteo integrado', 'Acero AISI 304', '200x80x50cm', 2800.00, 2),
(4, 'FILTRO-LAM', 'Filtro de Lamas 50x50cm', 'Repuesto de filtro para campanas industriales', 'Acero Inoxidable', '50x50cm', 120.00, 50),

-- Carritos de Servicio (Cat 5) [IDs 17-19]
(5, 'CAR-2N', 'Carro de Servicio 2 Niveles', 'Ruedas giratorias con freno, capacidad 50kg por nivel', 'Acero AISI 304', '80x50x90cm', 380.00, 20),
(5, 'CAR-3N-CAJ', 'Carro de Servicio 3 Niveles con Cajón', 'Cajón con cerradura, ideal para utensilios', 'Acero AISI 304', '80x50x90cm', 550.00, 15),
(5, 'CAR-BANDEJERO', 'Carro Bandejero 15 Niveles', 'Para bandejas GN 1/1, ruedas de alto tráfico', 'Acero AISI 304', '60x70x170cm', 850.00, 8),

-- Gabinetes y Alacenas (Cat 6) [IDs 20-22]
(6, 'GAB-BASE-120', 'Gabinete Base 120x60x85cm', 'Puertas batientes, entrepaño regulable interno', 'Acero AISI 304', '120x60x85cm', 950.00, 8),
(6, 'ALA-100x40', 'Alacena Aérea 100x40x60cm', 'Montaje en pared, puertas deslizantes', 'Acero AISI 304', '100x40x60cm', 650.00, 12),
(6, 'GAB-BASE-180', 'Gabinete Base Extra 180x60x85cm', 'Tres puertas batientes, dos entrepaños internos', 'Acero AISI 304', '180x60x85cm', 1450.00, 5),

-- Lavaderos y Escurreplatos (Cat 7) [IDs 23-25]
(7, 'LAV-ESC-120', 'Lavadero con Escurreplatos 120x70x85cm', 'Poza de 50x50cm, escurreplatos a la derecha', 'Acero AISI 304', '120x70x85cm', 1100.00, 6),
(7, 'LAV-DOB-ESC-180', 'Lavadero Doble con Escurreplatos 180x70x85cm', 'Dos pozas de 40x40cm, escurreplatos central', 'Acero AISI 304', '180x70x85cm', 1650.00, 4),
(7, 'ESC-PARED-100', 'Escurreplatos de Pared 100x35x60cm', 'Montaje en pared, sistema de drenaje incluido', 'Acero AISI 304', '100x35x60cm', 420.00, 10),

-- Tarimas y Plataformas (Cat 8) [IDs 26-28]
(8, 'TAR-120x80', 'Tarima Antideslizante 120x80x15cm', 'Superficie microperforada, patas regulables', 'Acero AISI 304', '120x80x15cm', 280.00, 25),
(8, 'TAR-150x100', 'Tarima Industrial 150x100x15cm', 'Capacidad 200kg, resistente a químicos', 'Acero AISI 304', '150x100x15cm', 380.00, 18),
(8, 'PLAT-60x40', 'Plataforma para Ollas 60x40x20cm', 'Ideal para cocinas, con ruedas', 'Acero AISI 304', '60x40x20cm', 180.00, 30),

-- Cocinas Industriales (Cat 9) [IDs 29-31]
(9, 'COC-IND-4H', 'Cocina Industrial 4 Hornillas', 'Hornillas de alta potencia (30,000 BTU), horno inferior', 'Acero AISI 304', '80x80x85cm', 2500.00, 3),
(9, 'COC-IND-6H', 'Cocina Industrial 6 Hornillas', 'Hornillas profesionales, horno amplio para bandejas GN 2/1', 'Acero AISI 304', '120x80x85cm', 3200.00, 2),
(9, 'COC-WOK-2', 'Cocina Wok 2 Estaciones', 'Quemadores jet de alta presión, sistema de agua', 'Acero AISI 304', '150x90x85cm', 4500.00, 2),

-- Hornos Profesionales (Cat 10) [IDs 32-34]
(10, 'HOR-PAN-3B', 'Horno Panadero 3 Bandejas', 'Control digital de temperatura, timer incluido, gas', 'Acero AISI 304', '80x70x160cm', 3800.00, 2),
(10, 'HOR-CONV-5B', 'Horno Convector 5 Bandejas', 'Sistema de convección forzada, eléctrico 220V', 'Acero AISI 304', '90x80x180cm', 5200.00, 1),
(10, 'HOR-PIZZA-2', 'Horno Pizzero 2 Cámaras', 'Piso de piedra refractaria, temperatura hasta 400°C', 'Acero Inoxidable', '100x80x150cm', 4800.00, 1),

-- Refrigeración Industrial (Cat 11) [IDs 35-39]
(11, 'MESA-REFRIG-150', 'Mesa Refrigerada 150x70x85cm', 'Temperatura 0-5°C, compresor remoto, 2 puertas', 'Acero AISI 304', '150x70x85cm', 2800.00, 4),
(11, 'MESA-REFRIG-200', 'Mesa Refrigerada 200x70x85cm', 'Tres puertas, temperatura ajustable, encimera de trabajo', 'Acero AISI 304', '200x70x85cm', 3500.00, 3),
(11, 'CONG-VERT-600L', 'Congelador Vertical 600L', 'Temperatura -18°C, 1 puerta sólida, digital', 'Acero AISI 304', '70x80x200cm', 4200.00, 2),
(11, 'CAMA-FRIA-3P', 'Cámara Fría Desmontable', 'Paneles de 100mm, unidad monoblock incluida', 'Panel PUR', '250x250x220cm', 12500.00, 1),
(11, 'ABATIDOR-5', 'Abatidor de Temperatura 5 GN', 'Abatimiento rápido +70°C a +3°C en 90 min', 'Acero AISI 304', '80x70x90cm', 6500.00, 1),

-- Procesamiento de Alimentos (Cat 12) [IDs 40-42]
(12, 'LIC-IND-15L', 'Licuadora Industrial Volcable 15L', 'Motor 1.5HP, vaso de acero inoxidable', 'Acero Inoxidable', '40x50x110cm', 1800.00, 5),
(12, 'PROC-VEG-500', 'Procesador de Vegetales 500kg/h', 'Incluye 5 discos de corte diferentes', 'Aluminio Anodizado', '30x50x60cm', 2400.00, 3),
(12, 'AMASADORA-20', 'Amasadora Espiral 20kg', 'Dos velocidades, rejilla de seguridad', 'Hierro Pintado/Acero', '50x80x90cm', 3200.00, 2),

-- Lavado de Vajilla (Cat 13) [IDs 43-44]
(13, 'LAV-VAJ-CUP', 'Lavavajillas de Cúpula', 'Ciclos de 60/120/180 seg, bomba de enjuague', 'Acero AISI 304', '70x80x150cm', 8900.00, 1),
(13, 'LAV-VASOS', 'Lavavasos Bajo Mostrador', 'Cesta 40x40cm, ideal para bares', 'Acero AISI 304', '45x55x70cm', 3500.00, 4),

-- Menaje y Utensilios (Cat 14) [IDs 45-47]
(14, 'OLLA-50L', 'Olla Alta 50 Litros', 'Fondo difusor triple, tapa incluida', 'Acero Inoxidable 18/10', '40x40cm', 350.00, 20),
(14, 'SARTEN-32', 'Sartén Profesional 32cm', 'Antiadhrente reforzado, mango remachado', 'Aluminio Forjado', '32cm', 120.00, 30),
(14, 'GASTRONORM-11', 'Bandeja GN 1/1 65mm', 'Acero inoxidable, esquinas reforzadas', 'Acero AISI 304', '53x32x6.5cm', 45.00, 100),

-- Exhibición y Buffet (Cat 15) [IDs 48-49]
(15, 'VITRINA-PAST', 'Vitrina Pastelera 1.2m', 'Vidrio curvo, 3 niveles, iluminación LED', 'Acero/Vidrio', '120x70x130cm', 4500.00, 2),
(15, 'SALAD-BAR', 'Salad Bar Refrigerado 4 GN', 'Cúpula de vidrio, ruedas, iluminación', 'Madera/Acero', '150x70x140cm', 3800.00, 1);


-- ==========================================
-- 3. USUARIOS
-- ==========================================
-- NOTA: Todas las contraseñas son 'admin123' encriptadas con bcrypt
-- Hash: $2b$12$bAM12ys6NLXUdHeecMYq6OQ1HpV2HCbPUDYR.XgbcuQRbeFn0VUtu

-- 3.1 Administradores
INSERT INTO users (email, password, nombre, apellido, role, telefono, direccion) VALUES
('admin@lcservice.pe', '$2b$12$bAM12ys6NLXUdHeecMYq6OQ1HpV2HCbPUDYR.XgbcuQRbeFn0VUtu', 'Carlos', 'Administrador', 'admin', '999888777', 'Av. Javier Prado Este 1234, San Isidro'),
('sistemas@lcservice.pe', '$2b$12$bAM12ys6NLXUdHeecMYq6OQ1HpV2HCbPUDYR.XgbcuQRbeFn0VUtu', 'Soporte', 'Técnico', 'admin', '999111222', 'Oficina Central');

-- 3.2 Vendedores
INSERT INTO users (email, password, nombre, apellido, telefono, role, direccion) VALUES
('juan.perez@lcservice.pe', '$2b$12$bAM12ys6NLXUdHeecMYq6OQ1HpV2HCbPUDYR.XgbcuQRbeFn0VUtu', 'Juan', 'Pérez', '987654321', 'vendedor', 'Zona Norte'),
('maria.lopez@lcservice.pe', '$2b$12$bAM12ys6NLXUdHeecMYq6OQ1HpV2HCbPUDYR.XgbcuQRbeFn0VUtu', 'María', 'López', '987654322', 'vendedor', 'Zona Sur'),
('pedro.castillo@lcservice.pe', '$2b$12$bAM12ys6NLXUdHeecMYq6OQ1HpV2HCbPUDYR.XgbcuQRbeFn0VUtu', 'Pedro', 'Castillo', '987654323', 'vendedor', 'Zona Este'),
('ana.torres@lcservice.pe', '$2b$12$bAM12ys6NLXUdHeecMYq6OQ1HpV2HCbPUDYR.XgbcuQRbeFn0VUtu', 'Ana', 'Torres', '987654324', 'vendedor', 'Zona Oeste'),
('luis.gonzales@lcservice.pe', '$2b$12$bAM12ys6NLXUdHeecMYq6OQ1HpV2HCbPUDYR.XgbcuQRbeFn0VUtu', 'Luis', 'Gonzales', '987654325', 'vendedor', 'Provincias');

-- 3.3 Clientes (Restaurantes y Hoteles Top Perú)
INSERT INTO users (email, password, nombre, apellido, telefono, empresa, role, direccion) VALUES
-- Restaurantes
('gerente@centralrest.com.pe', '$2b$12$bAM12ys6NLXUdHeecMYq6OQ1HpV2HCbPUDYR.XgbcuQRbeFn0VUtu', 'Virgilio', 'Martínez', '987123456', 'Central Restaurante', 'cliente', 'Av. Pedro de Osma 301, Barranco'),
('admin@maido.com.pe', '$2b$12$bAM12ys6NLXUdHeecMYq6OQ1HpV2HCbPUDYR.XgbcuQRbeFn0VUtu', 'Mitsuharu', 'Tsumura', '987123457', 'Maido', 'cliente', 'Calle San Martín 399, Miraflores'),
('operaciones@astrid-gaston.com', '$2b$12$bAM12ys6NLXUdHeecMYq6OQ1HpV2HCbPUDYR.XgbcuQRbeFn0VUtu', 'Gastón', 'Acurio', '987123458', 'Astrid y Gastón', 'cliente', 'Av. Paz Soldán 290, San Isidro'),
('chef@osso.com.pe', '$2b$12$bAM12ys6NLXUdHeecMYq6OQ1HpV2HCbPUDYR.XgbcuQRbeFn0VUtu', 'Juan Luis', 'Martínez', '987123459', 'Osso Carnicería y Salumeria', 'cliente', 'Calle Tahiti 175, La Molina'),
('contacto@elrocoto.com.pe', '$2b$12$bAM12ys6NLXUdHeecMYq6OQ1HpV2HCbPUDYR.XgbcuQRbeFn0VUtu', 'Héctor', 'Solís', '987123460', 'El Rocoto Restaurant', 'cliente', 'Av. Aviación 4907, Surco'),
('logistica@panchita.pe', '$2b$12$bAM12ys6NLXUdHeecMYq6OQ1HpV2HCbPUDYR.XgbcuQRbeFn0VUtu', 'Martha', 'Palacios', '987123461', 'Panchita', 'cliente', 'Calle Dos de Mayo 298, Miraflores'),
('compras@larmar.com.pe', '$2b$12$bAM12ys6NLXUdHeecMYq6OQ1HpV2HCbPUDYR.XgbcuQRbeFn0VUtu', 'Jorge', 'Muñoz', '987123462', 'La Mar Cebichería', 'cliente', 'Av. La Mar 770, Miraflores'),
('admin@isolina.pe', '$2b$12$bAM12ys6NLXUdHeecMYq6OQ1HpV2HCbPUDYR.XgbcuQRbeFn0VUtu', 'José', 'Del Castillo', '987123463', 'Isolina Taberna Peruana', 'cliente', 'Av. San Martín 101, Barranco'),

-- Hoteles
('compras@marriott.com.pe', '$2b$12$bAM12ys6NLXUdHeecMYq6OQ1HpV2HCbPUDYR.XgbcuQRbeFn0VUtu', 'Patricia', 'Rodríguez', '987223456', 'JW Marriott Hotel Lima', 'cliente', 'Malecón de la Reserva 615, Miraflores'),
('gerencia@belmond.com', '$2b$12$bAM12ys6NLXUdHeecMYq6OQ1HpV2HCbPUDYR.XgbcuQRbeFn0VUtu', 'Roberto', 'Sánchez', '987223457', 'Belmond Miraflores Park', 'cliente', 'Av. Malecón de la Reserva 1035, Miraflores'),
('cocina@country.com.pe', '$2b$12$bAM12ys6NLXUdHeecMYq6OQ1HpV2HCbPUDYR.XgbcuQRbeFn0VUtu', 'Carmen', 'Torres', '987223458', 'Country Club Lima Hotel', 'cliente', 'Los Eucaliptos 590, San Isidro'),
('admin@swissotel.com.pe', '$2b$12$bAM12ys6NLXUdHeecMYq6OQ1HpV2HCbPUDYR.XgbcuQRbeFn0VUtu', 'Fernando', 'Castillo', '987223459', 'Swissôtel Lima', 'cliente', 'Av. Santo Toribio 173, San Isidro'),
('logistica@westin.com.pe', '$2b$12$bAM12ys6NLXUdHeecMYq6OQ1HpV2HCbPUDYR.XgbcuQRbeFn0VUtu', 'Ricardo', 'Mendoza', '987223460', 'The Westin Lima', 'cliente', 'Calle Las Begonias 450, San Isidro'),

-- Cadenas
('operaciones@bembos.com.pe', '$2b$12$bAM12ys6NLXUdHeecMYq6OQ1HpV2HCbPUDYR.XgbcuQRbeFn0VUtu', 'Miguel', 'Vega', '987323456', 'Bembos - Sede Central', 'cliente', 'Av. Camino Real 123, San Isidro'),
('compras@chilis.com.pe', '$2b$12$bAM12ys6NLXUdHeecMYq6OQ1HpV2HCbPUDYR.XgbcuQRbeFn0VUtu', 'Lucía', 'Paredes', '987323457', 'Chilis Grill & Bar Perú', 'cliente', 'Av. Javier Prado Este 4200, Surco'),
('logistica@presto.com.pe', '$2b$12$bAM12ys6NLXUdHeecMYq6OQ1HpV2HCbPUDYR.XgbcuQRbeFn0VUtu', 'Eduardo', 'Morales', '987323458', 'Presto - Rosatel Group', 'cliente', 'Calle Los Antares 320, Surco'),
('gerente@pardos.com.pe', '$2b$12$bAM12ys6NLXUdHeecMYq6OQ1HpV2HCbPUDYR.XgbcuQRbeFn0VUtu', 'Rosa', 'Flores', '987323459', 'Pardos Chicken', 'cliente', 'Av. Benavides 730, Miraflores'),

-- Cafeterías y Otros
('chef@tostaduria.pe', '$2b$12$bAM12ys6NLXUdHeecMYq6OQ1HpV2HCbPUDYR.XgbcuQRbeFn0VUtu', 'Diego', 'Zamora', '987423456', 'Tostaduria Bisetti', 'cliente', 'Av. Pedro de Osma 116, Barranco'),
('admin@sanantonio.com.pe', '$2b$12$bAM12ys6NLXUdHeecMYq6OQ1HpV2HCbPUDYR.XgbcuQRbeFn0VUtu', 'Isabel', 'Gutiérrez', '987423457', 'Panadería San Antonio', 'cliente', 'Av. Angamos Oeste 1494, Miraflores'),
('ventas@delosi.com.pe', '$2b$12$bAM12ys6NLXUdHeecMYq6OQ1HpV2HCbPUDYR.XgbcuQRbeFn0VUtu', 'Sofía', 'Delgado', '987523456', 'Delosi Catering', 'cliente', 'Calle Los Negocios 234, Surquillo');


-- ==========================================
-- 4. COTIZACIONES
-- ==========================================
-- Estados: borrador, enviada, aprobada, rechazada, vencida
-- Fechas: Distribuidas en 2025

INSERT INTO cotizaciones (numero_cotizacion, cliente_id, vendedor_id, empresa_cliente, contacto_cliente, subtotal, igv, total, estado, fecha_vencimiento, notas, created_at) VALUES
-- Cotizaciones Aprobadas (Enero - Marzo 2025)
('COT-202501-0001', 8, 3, 'Central Restaurante', 'Virgilio Martínez', 12500.00, 2250.00, 14750.00, 'aprobada', '2025-02-15', 'Instalación incluida. Urgente para nueva temporada.', '2025-01-15 10:00:00'),
('COT-202501-0002', 9, 3, 'Maido', 'Mitsuharu Tsumura', 4500.00, 810.00, 5310.00, 'aprobada', '2025-02-20', 'Renovación de área de woks.', '2025-01-20 11:30:00'),
('COT-202502-0005', 16, 4, 'JW Marriott Hotel Lima', 'Patricia Rodríguez', 28000.00, 5040.00, 33040.00, 'aprobada', '2025-03-10', 'Equipamiento para nuevo salón de eventos.', '2025-02-10 09:15:00'),
('COT-202502-0008', 21, 5, 'Bembos - Sede Central', 'Miguel Vega', 8900.00, 1602.00, 10502.00, 'aprobada', '2025-03-25', 'Reemplazo de lavavajillas en local Larco.', '2025-02-25 14:20:00'),
('COT-202503-0012', 10, 3, 'Astrid y Gastón', 'Gastón Acurio', 6500.00, 1170.00, 7670.00, 'aprobada', '2025-04-05', 'Abatidor para área de postres.', '2025-03-05 16:45:00'),

-- Cotizaciones Rechazadas (Histórico)
('COT-202501-0003', 11, 4, 'Osso Carnicería', 'Juan Luis Martínez', 15000.00, 2700.00, 17700.00, 'rechazada', '2025-02-18', 'Cliente optó por proveedor local más económico.', '2025-01-18 15:00:00'),
('COT-202503-0015', 22, 5, 'Chilis Grill & Bar', 'Lucía Paredes', 3200.00, 576.00, 3776.00, 'rechazada', '2025-04-12', 'Presupuesto cancelado por gerencia.', '2025-03-12 10:30:00'),

-- Cotizaciones Vencidas (Sin respuesta)
('COT-202504-0020', 12, 6, 'El Rocoto Restaurant', 'Héctor Solís', 5500.00, 990.00, 6490.00, 'vencida', '2025-05-20', 'Se envió propuesta, sin respuesta tras 3 seguimientos.', '2025-04-20 11:00:00'),
('COT-202505-0025', 25, 7, 'Tostaduria Bisetti', 'Diego Zamora', 1800.00, 324.00, 2124.00, 'vencida', '2025-06-15', 'Interesados en vitrina pero pospusieron compra.', '2025-05-15 09:30:00'),

-- Cotizaciones Enviadas (Pendientes de respuesta - Recientes Noviembre 2025)
('COT-202511-0100', 8, 3, 'Central Restaurante', 'Virgilio Martínez', 3500.00, 630.00, 4130.00, 'enviada', '2025-12-15', 'Mesa refrigerada para área de investigación.', '2025-11-15 10:00:00'),
('COT-202511-0101', 17, 4, 'Belmond Miraflores Park', 'Roberto Sánchez', 12500.00, 2250.00, 14750.00, 'enviada', '2025-12-16', 'Renovación cámara fría cocina principal.', '2025-11-16 11:00:00'),
('COT-202511-0102', 26, 5, 'Panadería San Antonio', 'Isabel Gutiérrez', 8600.00, 1548.00, 10148.00, 'enviada', '2025-12-17', 'Hornos convectores para nueva sede.', '2025-11-17 14:30:00'),
('COT-202511-0103', 24, 6, 'Pardos Chicken', 'Rosa Flores', 4500.00, 810.00, 5310.00, 'enviada', '2025-12-18', 'Cocinas Wok para salteados.', '2025-11-18 09:00:00'),
('COT-202511-0104', 19, 7, 'Swissôtel Lima', 'Fernando Castillo', 6800.00, 1224.00, 8024.00, 'enviada', '2025-12-19', 'Equipamiento buffet desayuno.', '2025-11-19 08:30:00'),

-- Cotizaciones en Borrador (Trabajo en progreso)
('COT-202511-0105', 13, 3, 'Panchita', 'Martha Palacios', 0.00, 0.00, 0.00, 'borrador', '2025-12-20', 'Borrador inicial para renovación 2026.', '2025-11-19 15:00:00'),
('COT-202511-0106', 14, 4, 'La Mar Cebichería', 'Jorge Muñoz', 1200.00, 216.00, 1416.00, 'borrador', '2025-12-20', 'Cotizando mesas de corte.', '2025-11-19 16:00:00');


-- ==========================================
-- 5. DETALLES DE COTIZACIONES
-- ==========================================
INSERT INTO cotizacion_detalles (cotizacion_id, equipo_id, cantidad, precio_unitario, subtotal) VALUES
-- COT-202501-0001 (Central - Aprobada) - Cámara Fría
(1, 38, 1, 12500.00, 12500.00), -- CAMA-FRIA-3P (ID 38)

-- COT-202501-0002 (Maido - Aprobada) - Cocina Wok
(2, 31, 1, 4500.00, 4500.00), -- COC-WOK-2 (ID 31)

-- COT-202502-0005 (Marriott - Aprobada) - Varios
(3, 30, 2, 3200.00, 6400.00), -- COC-IND-6H (ID 30)
(3, 33, 2, 5200.00, 10400.00), -- HOR-CONV-5B (ID 33)
(3, 36, 2, 3500.00, 7000.00), -- MESA-REFRIG-200 (ID 36)
(3, 44, 1, 3500.00, 3500.00), -- LAV-VASOS (ID 44)
(3, 45, 2, 350.00, 700.00), -- OLLA-50L (ID 45)

-- COT-202502-0008 (Bembos - Aprobada) - Lavavajillas
(4, 43, 1, 8900.00, 8900.00), -- LAV-VAJ-CUP (ID 43)

-- COT-202503-0012 (Astrid - Aprobada) - Abatidor
(5, 39, 1, 6500.00, 6500.00), -- ABATIDOR-5 (ID 39)

-- COT-202511-0100 (Central - Enviada) - Mesa Refrig
(10, 35, 1, 3500.00, 3500.00), -- MESA-REFRIG-150 (ID 35)

-- COT-202511-0101 (Belmond - Enviada) - Cámara Fría
(11, 38, 1, 12500.00, 12500.00), -- CAMA-FRIA-3P (ID 38)

-- COT-202511-0102 (San Antonio - Enviada) - Hornos + Bandejas
(12, 33, 1, 5200.00, 5200.00), -- HOR-CONV-5B (ID 33)
(12, 32, 1, 3800.00, 3800.00), -- HOR-PAN-3B (ID 32)
(12, 47, 10, 45.00, 450.00), -- GASTRONORM-11 (ID 47)

-- COT-202511-0103 (Pardos - Enviada) - Wok
(13, 31, 1, 4500.00, 4500.00), -- COC-WOK-2 (ID 31)

-- COT-202511-0104 (Swissotel - Enviada) - Buffet
(14, 49, 1, 3800.00, 3800.00), -- SALAD-BAR (ID 49)
(14, 48, 1, 4500.00, 4500.00), -- VITRINA-PAST (ID 48)

-- COT-202511-0106 (La Mar - Borrador) - Mesas
(16, 5, 2, 950.00, 1900.00); -- MT-CORTE-100 (ID 5)