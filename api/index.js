const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'melofilia_drop_it_co_secure_jwt_secret_2026_x89a';

// 1. Seguridad Básica: Helmet & CORS
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '5mb' }));

// 2. Limitadores de Tasa
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Demasiados intentos de autenticación. Intenta nuevamente en 15 minutos.' }
});

const ordersLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: { error: 'Límite de pedidos alcanzado temporalmente por seguridad.' }
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 40,
  message: { error: 'Límite de mensajes alcanzado temporalmente.' }
});

// Credenciales Mercado Pago
const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || 'APP_USR-2803351916309112-081801-49203340d94970d8bccbecc8819c2a18-3621585263';
const MP_PUBLIC_KEY = process.env.MERCADO_PAGO_PUBLIC_KEY || 'APP_USR-4da66e49-ed48-4662-ade7-bb5ed537e912';
const APP_URL = process.env.APP_URL || 'https://melofilia.vercel.app';

// 3. Usuarios Administradores del Sistema (Drop It Co)
const adminUsers = [
  {
    id: 'usr_owner_01',
    email: 'admin@melofilia.com',
    name: 'Admin General (Drop It Co)',
    role: 'OWNER',
    passwordHash: bcrypt.hashSync('MelofiliaOwner2026!', 10)
  },
  {
    id: 'usr_prod_01',
    email: 'producer@melofilia.com',
    name: 'Productor Musical',
    role: 'PRODUCER',
    passwordHash: bcrypt.hashSync('MelofiliaProd2026!', 10)
  }
];

// 4. Registro de Auditoría
const auditLogs = [
  {
    id: 'aud_init_01',
    timestamp: new Date().toISOString(),
    event_type: 'SYSTEM_STARTUP',
    actor: 'SYSTEM',
    details: 'Melofilia Secure Vercel Serverless API iniciada bajo el grupo Drop It Co',
    ip: '127.0.0.1'
  }
];

function logAuditEvent(eventType, actor, details, req) {
  const ip = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1') : 'SYSTEM';
  const entry = {
    id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    event_type: eventType,
    actor,
    details,
    ip
  };
  auditLogs.unshift(entry);
  if (auditLogs.length > 500) auditLogs.pop();
}

// 5. Middlewares de Autenticación
function authenticateJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso no autorizado: Token de autenticación requerido.' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado. Inicia sesión nuevamente.' });
    }
    req.user = user;
    next();
  });
}

function requireRole(allowedRoles = ['OWNER']) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Permisos insuficientes. Esta acción requiere rol: ${allowedRoles.join(', ')}.` 
      });
    }
    next();
  };
}

// 6. Configuración de Canciones de Marketing Multi-Estilo
let marketingSongStyles = [
  {
    id: 'balada',
    name: 'Balada Pop Acústica',
    tagline: 'Emotiva, íntima y profunda',
    tempo: '85 BPM',
    audio_url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=acoustic-guitars-ambient-112347.mp3',
    lyrics: `[Verso 1]
Tienes una historia que merece ser cantada,
un recuerdo, un amor, una vida compartida.
En Melofilia no usamos fórmulas armadas,
creamos tu canción de forma sentida.

[Coro]
Cuéntanos tu historia, te enviamos la letra hoy,
tú la revisas y apruebas con emoción.
Te entregamos dos versiones para que elijas tu voz,
en 48 horas sonando en tu corazón.

[Verso 2]
Desde tres horas si tienes urgencia especial,
con calidad de estudio y master profesional.
Tu historia en melodía se vuelve inmortal,
¡Melofilia es tu música real!`
  },
  {
    id: 'pop',
    name: 'Pop Latino Moderno',
    tagline: 'Alegre, brillante y pegajosa',
    tempo: '115 BPM',
    audio_url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=tropical-house-summer-pop-10338.mp3',
    lyrics: `[Verso 1]
¡Hey! Cuéntanos tu momento especial,
un cumpleaños, aniversario o detalle sin igual.
Escribimos la letra para que la leas primero,
la ajustamos contigo, somos tu equipo sincero.

[Coro]
¡Dos versiones de tu tema para bailar y cantar!
Revisa tu letra y prepárate a vibrar.
Máximo en 48 horas tu historia va a sonar,
Melofilia en la pista te va a enamorar.`
  },
  {
    id: 'urbano',
    name: 'Urbano / Reggaetón Flow',
    tagline: 'Ritmo moderno, bajo potente y fresco',
    tempo: '96 BPM',
    audio_url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8b18721c4.mp3?filename=reggaeton-beat-10982.mp3',
    lyrics: `[Verso 1]
De la historia a la pista, sin filtro y con flow,
Melofilia en la casa armándote el show.
Escribimos las rimas, revisas el plan,
aprobamos la letra y los beats llegarán.

[Coro]
Dos canciones casi iguales para que elijas la mejor,
máximo en 48 horas o en 3 con calor.
Tu historia suena a radio, calidad superior,
Melofilia Studio rompiendo el altavoz.`
  },
  {
    id: 'vallenato',
    name: 'Vallenato Romántico',
    tagline: 'Sentimiento puro, acordeón y tradición',
    tempo: '90 BPM',
    audio_url: 'https://cdn.pixabay.com/download/audio/2022/11/06/audio_2c52670e30.mp3?filename=latin-acoustic-groove-125488.mp3',
    lyrics: `[Verso 1]
Ay, mi gente querida, les vengo a contar,
que cualquier recuerdo se puede cantar.
Nos das tu relato y con devoción,
hacemos los versos de tu gran canción.

[Coro]
Te paso la letra pa que des el sí,
te entrego dos temas sabrosos pa ti.
En 48 horas o en 3 si es de afán,
con Melofilia los versos nunca morirán.`
  },
  {
    id: 'rock',
    name: 'Rock Acústico Orgánico',
    tagline: 'Guitarras potentes, orgánico y auténtico',
    tempo: '120 BPM',
    audio_url: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3?filename=indie-folk-acoustic-117517.mp3',
    lyrics: `[Verso 1]
La guitarra marca el pulso de la verdad,
convertimos anécdotas en eternidad.
Lees la letra antes de empezar a grabar,
dos versiones de estudio para recordar.

[Coro]
Melofilia suena con fuerza y pasión,
tu historia en acorde, tu propia canción.
Máximo en 48 horas master final,
un regalo que nadie podrá igualar.`
  }
];

// 7. Configuración de Precios
let pricingConfig = {
  express: {
    name: 'Express',
    regular_price: 160000,
    current_price: 120000,
    discount_enabled: true,
    discount_badge: '25% OFF',
    delivery_hours: 48,
    format: '2 Canciones (Versión A y B) + Revisión de Letra + MP3 + PDF',
    description: 'Entrega estándar en 48h (posibilidad express desde 3h). 2 canciones casi iguales para elegir.'
  },
  semi_pro: {
    name: 'Semi-Pro',
    regular_price: 350000,
    current_price: 280000,
    discount_enabled: true,
    discount_badge: '20% OFF',
    delivery_hours: 48,
    format: '2 Canciones en MP3 + WAV Studio (24-bit) + Revisión de Letra + Carátula Digital + PDF',
    description: 'Máxima fidelidad acústica multicapa, 2 versiones completas y opción de stems.'
  },
  stems_addon: {
    name: 'Stems Multipista (STEMS.ZIP)',
    regular_price: 70000,
    current_price: 50000,
    discount_enabled: true,
    discount_badge: 'Ahorra $20.000 COP',
    description: 'Pistas individuales por separado en archivo ZIP.'
  }
};

// 8. Órdenes en Memoria
const orders = [
  {
    id: 'f8b1c4e2-8e3d-4c8d-9c3a-2f4b5a6c7d8e',
    order_number: 'MP-2026-000184',
    customer_name: 'Camila Montoya',
    customer_email: 'camila.montoya@ejemplo.com',
    customer_phone: '+57 312 456 7890',
    product_tier: 'SEMI_PRO',
    genre: 'Balada Pop Acústica',
    mood: 'Emotiva y Romántica',
    occasion: 'Aniversario de Bodas (5 años)',
    story_details: {
      recipient_name: 'Mariana',
      relationship: 'Esposa',
      key_memories: 'Nos conocimos en una cafetería en Medellín un día lluvioso. Ella siempre pide capuchino sin azúcar. El viaje a Santa Marta donde nos comprometimos frente al mar.',
      voice_preference: 'Voz Femenina Cálida',
      tempo_bpm: 85
    },
    key_phrases: [
      'El café bajo la lluvia',
      'Nuestro atardecer en Santa Marta',
      'Cinco años y toda una vida por delante'
    ],
    current_lyrics: `[Verso 1]
La lluvia caía sobre aquel café en Medellín,
pediste un capuchino y te vi sonreír sin fin.
Desde esa tarde supe que no había marcha atrás,
eras el hogar que siempre quise encontrar.

[Coro]
Nuestro atardecer en Santa Marta frente al mar,
la promesa eterna de quererte y cuidar.
Cinco años juntos y toda una vida por delante,
mi Mariana hermosa, mi amor más constante.`,
    lyrics_status: 'APPROVED',
    lyrics_feedback: null,
    version_a_url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=acoustic-guitars-ambient-112347.mp3',
    version_b_url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=tropical-house-summer-pop-10338.mp3',
    total_amount: 280000,
    currency: 'COP',
    has_stems: true,
    payment_status: 'APPROVED',
    payment_provider: 'MERCADO_PAGO',
    order_status: 'READY_FOR_CLIENT_REVIEW',
    corrections_allowed: 1,
    corrections_used: 0,
    delivery_assets: {
      mp3_version_a: 'https://melofilia-storage.r2.cloudflarestorage.com/orders/MP-2026-000184/version_a.mp3',
      mp3_version_b: 'https://melofilia-storage.r2.cloudflarestorage.com/orders/MP-2026-000184/version_b.mp3',
      wav_version_a: 'https://melofilia-storage.r2.cloudflarestorage.com/orders/MP-2026-000184/version_a_24bit.wav',
      wav_version_b: 'https://melofilia-storage.r2.cloudflarestorage.com/orders/MP-2026-000184/version_b_24bit.wav',
      cover_art_url: 'https://melofilia-storage.r2.cloudflarestorage.com/orders/MP-2026-000184/cover.jpg',
      lyrics_pdf_url: 'https://melofilia-storage.r2.cloudflarestorage.com/orders/MP-2026-000184/lyrics.pdf',
      stems_zip_url: 'https://melofilia-storage.r2.cloudflarestorage.com/orders/MP-2026-000184/STEMS.ZIP'
    },
    delivered_at: '2026-08-18T00:00:00Z',
    download_expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    created_at: '2026-08-15T10:00:00Z',
    updated_at: '2026-08-18T00:00:00Z'
  }
];

const contactMessages = [
  {
    id: 'msg_001',
    name: 'Carolina Velásquez',
    email: 'carolina.v@ejemplo.com',
    category: 'REVIEW',
    order_number: 'MP-2026-000184',
    message: '¡Poder escuchar las dos versiones fue maravilloso! Nos quedamos con la versión acústica para el video. Excelente servicio.',
    status: 'RESOLVED',
    is_approved_review: true,
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  }
];

// ==========================================
// ENDPOINTS
// ==========================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Melofilia API Server (Vercel Serverless)',
    organization: 'Drop It Co',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/auth/login', authLimiter, (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contraseña requeridos.' });
  }

  const user = adminUsers.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    logAuditEvent('LOGIN_FAILED', email, 'Intento fallido de inicio de sesión', req);
    return res.status(401).json({ error: 'Credenciales inválidas. Verifica tu correo y contraseña.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '4h' }
  );

  logAuditEvent('LOGIN_SUCCESS', user.email, `Inicio de sesión exitoso con rol ${user.role}`, req);

  res.json({
    success: true,
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
});

app.get('/api/auth/me', authenticateJWT, (req, res) => {
  res.json({ success: true, user: req.user });
});

app.get('/api/config/marketing-songs', (req, res) => {
  res.json(marketingSongStyles);
});

app.put('/api/admin/marketing-songs', authenticateJWT, (req, res) => {
  const { styles } = req.body;
  if (!Array.isArray(styles) || styles.length === 0) {
    return res.status(400).json({ error: 'Formato de estilos inválido.' });
  }
  marketingSongStyles = styles;
  logAuditEvent('MARKETING_SONGS_UPDATED', req.user.email, `Canciones de marketing actualizadas`, req);
  res.json({ success: true, message: 'Estilos actualizados.', styles: marketingSongStyles });
});

app.get('/api/config/pricing', (req, res) => {
  res.json(pricingConfig);
});

app.get('/api/reviews/public', (req, res) => {
  const approved = contactMessages.filter(m => m.category === 'REVIEW' && m.is_approved_review);
  res.json(approved);
});

app.post('/api/orders', ordersLimiter, async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      product_tier = 'SEMI_PRO',
      genre,
      mood,
      occasion,
      story_details,
      key_phrases = [],
      has_stems = false,
      client_audio_notes = ''
    } = req.body;

    if (!customer_name || !customer_email || !genre) {
      return res.status(400).json({ error: 'Faltan campos obligatorios para registrar la orden.' });
    }

    const orderNumber = `MP-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const currentBasePrice = product_tier === 'EXPRESS' 
      ? pricingConfig.express.current_price 
      : pricingConfig.semi_pro.current_price;
    const currentStemsPrice = has_stems ? pricingConfig.stems_addon.current_price : 0;
    const totalAmount = currentBasePrice + currentStemsPrice;

    const newOrder = {
      id: orderId,
      order_number: orderNumber,
      customer_name,
      customer_email,
      customer_phone,
      product_tier,
      genre,
      mood,
      occasion,
      story_details: story_details || {},
      key_phrases,
      client_audio_notes,
      total_amount: totalAmount,
      currency: 'COP',
      has_stems,
      payment_status: 'PENDING',
      payment_provider: 'MERCADO_PAGO',
      payment_provider_reference: null,
      order_status: 'AWAITING_PAYMENT',
      current_lyrics: null,
      lyrics_status: 'PENDING_PROPOSAL',
      lyrics_feedback: null,
      version_a_url: null,
      version_b_url: null,
      corrections_allowed: 1,
      corrections_used: 0,
      download_expires_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    let checkoutUrl = '';
    let preferenceId = '';

    try {
      const hostUrl = req.headers.host ? `https://${req.headers.host}` : APP_URL;
      const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: [
            {
              id: orderId,
              title: `Melofilia - Canción Personalizada (${product_tier}) - 2 Versiones`,
              description: `Producción de 2 canciones para ${customer_name} - Pedido ${orderNumber}`,
              quantity: 1,
              currency_id: 'COP',
              unit_price: totalAmount
            }
          ],
          payer: { email: customer_email },
          external_reference: orderNumber,
          back_urls: {
            success: `${hostUrl}/?order=${orderNumber}&payment_status=approved`,
            failure: `${hostUrl}/?order=${orderNumber}&payment_status=rejected`,
            pending: `${hostUrl}/?order=${orderNumber}&payment_status=pending`
          },
          statement_descriptor: 'MELOFILIA'
        })
      });

      if (mpResponse.ok) {
        const mpData = await mpResponse.json();
        preferenceId = mpData.id;
        checkoutUrl = mpData.sandbox_init_point || mpData.init_point;
        newOrder.payment_provider_reference = preferenceId;
      }
    } catch (mpErr) {
      console.error('Error comunicando con Mercado Pago:', mpErr);
    }

    orders.unshift(newOrder);
    logAuditEvent('ORDER_CREATED', customer_email, `Orden creada ${orderNumber} por $${totalAmount} COP`, req);

    res.status(201).json({
      success: true,
      order: newOrder,
      checkoutUrl: checkoutUrl || `/?order=${orderNumber}&simulated_payment=true`,
      preferenceId
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar la orden: ' + error.message });
  }
});

app.get('/api/orders/:orderNumber', (req, res) => {
  const { orderNumber } = req.params;
  const order = orders.find(o => o.order_number.toUpperCase() === orderNumber.toUpperCase());
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado.' });
  res.json(order);
});

app.post('/api/orders/:orderNumber/propose-lyrics', authenticateJWT, (req, res) => {
  const { orderNumber } = req.params;
  const { lyrics } = req.body;
  if (!lyrics || !lyrics.trim()) return res.status(400).json({ error: 'Texto de letra requerido.' });

  const order = orders.find(o => o.order_number.toUpperCase() === orderNumber.toUpperCase());
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

  order.current_lyrics = lyrics.trim();
  order.lyrics_status = 'AWAITING_CLIENT_APPROVAL';
  order.order_status = 'LYRICS_CLIENT_REVIEW';
  order.updated_at = new Date().toISOString();

  logAuditEvent('LYRICS_PROPOSED', req.user.email, `Propuesta de letra para ${orderNumber}`, req);
  res.json({ success: true, message: 'Propuesta enviada al cliente.', order });
});

app.post('/api/orders/:orderNumber/review-lyrics', (req, res) => {
  const { orderNumber } = req.params;
  const { action, feedback } = req.body;

  const order = orders.find(o => o.order_number.toUpperCase() === orderNumber.toUpperCase());
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

  if (action === 'APPROVE') {
    order.lyrics_status = 'APPROVED';
    order.order_status = 'IN_PRODUCTION';
    order.lyrics_feedback = null;
    logAuditEvent('LYRICS_APPROVED', order.customer_email, `Letra aprobada para ${orderNumber}`, req);
  } else if (action === 'REQUEST_ADJUSTMENT') {
    if (!feedback || !feedback.trim()) return res.status(400).json({ error: 'Indica los ajustes deseados.' });
    order.lyrics_status = 'ADJUSTMENT_REQUESTED';
    order.lyrics_feedback = feedback.trim();
    order.order_status = 'LYRICS_IN_REVISION';
    logAuditEvent('LYRICS_ADJUSTMENT_REQUESTED', order.customer_email, `Ajuste solicitado para ${orderNumber}`, req);
  }

  order.updated_at = new Date().toISOString();
  res.json({ success: true, order });
});

app.patch('/api/admin/orders/:id/deliver-versions', authenticateJWT, (req, res) => {
  const { id } = req.params;
  const { version_a_url, version_b_url, production_notes } = req.body;

  const order = orders.find(o => o.id === id || o.order_number === id);
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

  if (version_a_url) order.version_a_url = version_a_url;
  if (version_b_url) order.version_b_url = version_b_url;
  if (production_notes) order.production_notes = production_notes;
  order.order_status = 'READY_FOR_CLIENT_REVIEW';
  order.updated_at = new Date().toISOString();

  logAuditEvent('VERSIONS_DELIVERED', req.user.email, `2 Versiones entregadas para ${order.order_number}`, req);
  res.json({ success: true, order });
});

app.post('/api/orders/:orderNumber/correction', (req, res) => {
  const { orderNumber } = req.params;
  const { category = 'AUDIO_MIX', specific_instructions } = req.body;

  const order = orders.find(o => o.order_number.toUpperCase() === orderNumber.toUpperCase());
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

  if (order.corrections_used >= order.corrections_allowed) {
    return res.status(400).json({ error: 'Este pedido ya consumió su ronda de corrección.' });
  }

  order.corrections_used += 1;
  order.order_status = 'CORRECTION_REQUESTED';
  order.updated_at = new Date().toISOString();

  logAuditEvent('CORRECTION_REQUESTED', order.customer_email, `Corrección de audio para ${orderNumber}`, req);
  res.json({ success: true, order });
});

app.post('/api/orders/:orderNumber/download-grant', (req, res) => {
  const { orderNumber } = req.params;
  const order = orders.find(o => o.order_number.toUpperCase() === orderNumber.toUpperCase());
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

  const token = jwt.sign(
    { order_id: order.id, order_number: order.order_number, purpose: 'download_vault' },
    JWT_SECRET,
    { expiresIn: '5m' }
  );

  res.json({
    success: true,
    token,
    assets: {
      mp3_version_a: `${order.delivery_assets?.mp3_version_a || ''}?grant=${token}`,
      mp3_version_b: `${order.delivery_assets?.mp3_version_b || ''}?grant=${token}`,
      wav_version_a: order.product_tier === 'SEMI_PRO' ? `${order.delivery_assets?.wav_version_a || ''}?grant=${token}` : null,
      wav_version_b: order.product_tier === 'SEMI_PRO' ? `${order.delivery_assets?.wav_version_b || ''}?grant=${token}` : null,
      lyrics_pdf_url: `${order.delivery_assets?.lyrics_pdf_url || ''}?grant=${token}`,
      stems_zip_url: order.has_stems ? `${order.delivery_assets?.stems_zip_url || ''}?grant=${token}` : null
    }
  });
});

app.post('/api/contact', contactLimiter, (req, res) => {
  const { name, email, category = 'SERVICIOS', message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'Datos requeridos.' });

  const msg = {
    id: `msg_${Date.now()}`,
    name: name.trim(),
    email: email.trim(),
    category: category.toUpperCase(),
    message: message.trim(),
    status: 'NEW',
    is_approved_review: false,
    created_at: new Date().toISOString()
  };
  contactMessages.unshift(msg);
  logAuditEvent('CONTACT_MESSAGE', email, `Mensaje categoría ${category}`, req);
  res.status(201).json({ success: true, message: 'Mensaje recibido.' });
});

app.get('/api/admin/orders', authenticateJWT, (req, res) => {
  res.json({ total: orders.length, orders });
});

app.patch('/api/admin/orders/:id/status', authenticateJWT, (req, res) => {
  const { id } = req.params;
  const { status, version_a_url, version_b_url } = req.body;
  const order = orders.find(o => o.id === id || o.order_number === id);
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });

  order.order_status = status;
  if (version_a_url) order.version_a_url = version_a_url;
  if (version_b_url) order.version_b_url = version_b_url;
  if (status === 'DELIVERED') {
    order.delivered_at = new Date().toISOString();
    order.download_expires_at = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
  }
  order.updated_at = new Date().toISOString();
  res.json({ success: true, order });
});

app.put('/api/admin/pricing', authenticateJWT, requireRole(['OWNER']), (req, res) => {
  const { express: exp, semi_pro: semi, stems_addon: stems } = req.body;
  if (exp) pricingConfig.express = { ...pricingConfig.express, ...exp };
  if (semi) pricingConfig.semi_pro = { ...pricingConfig.semi_pro, ...semi };
  if (stems) pricingConfig.stems_addon = { ...pricingConfig.stems_addon, ...stems };
  logAuditEvent('PRICING_UPDATED', req.user.email, 'Precios actualizados', req);
  res.json({ success: true, pricing: pricingConfig });
});

app.get('/api/admin/contact', authenticateJWT, (req, res) => {
  res.json({ total: contactMessages.length, messages: contactMessages });
});

app.get('/api/admin/audit-logs', authenticateJWT, (req, res) => {
  res.json({ total: auditLogs.length, logs: auditLogs });
});

module.exports = app;
