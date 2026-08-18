const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno desde la raíz del proyecto
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Credenciales Mercado Pago
const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || 'APP_USR-2803351916309112-081801-49203340d94970d8bccbecc8819c2a18-3621585263';
const MP_PUBLIC_KEY = process.env.MERCADO_PAGO_PUBLIC_KEY || 'APP_USR-4da66e49-ed48-4662-ade7-bb5ed537e912';
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

// Configuración de Precios y Simulación de Descuentos (Administrable desde /admin)
let pricingConfig = {
  express: {
    name: 'Express',
    regular_price: 160000,
    current_price: 120000,
    discount_enabled: true,
    discount_badge: '25% OFF',
    delivery_hours: 48,
    format: 'MP3 320kbps',
    description: 'Ideal para detalles espontáneos, cumpleaños y sorpresas directas al corazón.'
  },
  semi_pro: {
    name: 'Semi-Pro',
    regular_price: 350000,
    current_price: 280000,
    discount_enabled: true,
    discount_badge: '20% OFF',
    delivery_hours: 72,
    format: 'MP3 + WAV Studio (24-bit) + PDF',
    description: 'Para aniversarios, bodas y homenajes memorables con arreglos multicapa y máxima fidelidad.'
  },
  stems_addon: {
    name: 'Stems Multipista (ZIP)',
    regular_price: 70000,
    current_price: 50000,
    discount_enabled: true,
    discount_badge: 'Ahorra $20.000 COP',
    description: 'Pistas individuales por separado (Voz, Batería, Bajo, Guitarras, Teclados).'
  }
};

// Almacén en memoria persistente durante la ejecución (Pre-cargado con datos de demo)
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
    occasion: 'Aniversario 5 años de matrimonio',
    story_details: {
      recipient_name: 'Alejandro',
      key_memories: 'Nos conocimos en una cafetería de Medellín lloviendo. El viaje a Santa Marta donde nos comprometimos.',
      custom_vibe: 'Guitarras de madera, piano suave y voz cálida y sentida.'
    },
    key_phrases: ['El café de la 70 bajo la lluvia', 'Nuestra promesa en el mar de Santa Marta', 'Cinco años que saben a eternidad'],
    rhythm_reference_path: null,
    vocal_reference_path: null,
    client_audio_notes: 'Preferiblemente voz femenina con afinación cálida y natural.',
    total_amount: 330000,
    currency: 'COP',
    has_stems: true,
    payment_status: 'APPROVED',
    payment_provider: 'MERCADO_PAGO',
    payment_provider_reference: 'MP-PREF-9921',
    order_status: 'READY_FOR_CLIENT_REVIEW',
    corrections_allowed: 1,
    corrections_used: 0,
    download_expires_at: null,
    created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    preview_audio_url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=acoustic-guitars-ambient-112347.mp3',
    production_notes: 'BPM 85, Tonalidad Sol Mayor. Guitarras Martin acústicas grabadas en estéreo, voz principal centrada con compresión suave.',
    versions: [
      { version: 'V01', label: 'Boceto Inicial', created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString() },
      { version: 'V02', label: 'Mezcla Preview Cliente', created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), active_preview: true }
    ],
    corrections: []
  },
  {
    id: 'a1c2e3f4-5b6c-7d8e-9f0a-1b2c3d4e5f6a',
    order_number: 'MP-2026-000185',
    customer_name: 'Santiago Rivas',
    customer_email: 'santiago.rivas@ejemplo.com',
    customer_phone: '+57 300 889 1234',
    product_tier: 'EXPRESS',
    genre: 'Urbano / Reggaetón Suave',
    mood: 'Alegre y Enérgico',
    occasion: 'Cumpleaños 30 de mi hermano Carlos',
    story_details: {
      recipient_name: 'Carlos "El Flaco"',
      key_memories: 'Le encanta jugar fútbol los domingos, siempre pierde las llaves y es el alma de la fiesta.',
      custom_vibe: 'Beat pegajoso, estilo Feid / Manuel Turizo.'
    },
    key_phrases: ['El 10 de la cancha los domingos', '¿Dónde dejaste las llaves otra vez?', '30 años rompiéndola'],
    rhythm_reference_path: null,
    vocal_reference_path: null,
    client_audio_notes: 'Voz masculina juvenil y fresca.',
    total_amount: 120000,
    currency: 'COP',
    has_stems: false,
    payment_status: 'APPROVED',
    payment_provider: 'MERCADO_PAGO',
    payment_provider_reference: 'MP-PREF-9922',
    order_status: 'IN_PRODUCTION',
    corrections_allowed: 1,
    corrections_used: 0,
    download_expires_at: null,
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    production_notes: 'BPM 98, Dembow sutil, sintetizadores atmosféricos. Producción en marcha.',
    versions: [],
    corrections: []
  }
];

// Generador de número de orden secuencial
let orderCounter = 187;
function generateOrderNumber() {
  const year = new Date().getFullYear();
  const pad = String(orderCounter++).padStart(6, '0');
  return `MP-${year}-${pad}`;
}

/**
 * Endpoint de Salud
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Melofilia API',
    mercadopago_configured: !!MP_ACCESS_TOKEN,
    time: new Date().toISOString()
  });
});

/**
 * Obtener configuración pública de precios y descuentos
 */
app.get('/api/config/pricing', (req, res) => {
  res.json(pricingConfig);
});

/**
 * Actualizar configuración de precios y descuentos desde el perfil Admin
 */
app.put('/api/admin/pricing', (req, res) => {
  try {
    const { express: newExpress, semi_pro: newSemiPro, stems_addon: newStems } = req.body;

    if (newExpress) {
      pricingConfig.express = {
        ...pricingConfig.express,
        current_price: Number(newExpress.current_price) || pricingConfig.express.current_price,
        regular_price: Number(newExpress.regular_price) || pricingConfig.express.regular_price,
        discount_enabled: Boolean(newExpress.discount_enabled),
        discount_badge: newExpress.discount_badge || pricingConfig.express.discount_badge
      };
    }

    if (newSemiPro) {
      pricingConfig.semi_pro = {
        ...pricingConfig.semi_pro,
        current_price: Number(newSemiPro.current_price) || pricingConfig.semi_pro.current_price,
        regular_price: Number(newSemiPro.regular_price) || pricingConfig.semi_pro.regular_price,
        discount_enabled: Boolean(newSemiPro.discount_enabled),
        discount_badge: newSemiPro.discount_badge || pricingConfig.semi_pro.discount_badge
      };
    }

    if (newStems) {
      pricingConfig.stems_addon = {
        ...pricingConfig.stems_addon,
        current_price: Number(newStems.current_price) || pricingConfig.stems_addon.current_price,
        regular_price: Number(newStems.regular_price) || pricingConfig.stems_addon.regular_price,
        discount_enabled: Boolean(newStems.discount_enabled),
        discount_badge: newStems.discount_badge || pricingConfig.stems_addon.discount_badge
      };
    }

    res.json({
      success: true,
      message: 'Configuración de precios y descuentos actualizada exitosamente.',
      pricing: pricingConfig
    });
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar precios: ' + err.message });
  }
});

/**
 * Crear un nuevo pedido e inicializar pago con Mercado Pago
 */
app.post('/api/orders', async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      product_tier = 'SEMI_PRO',
      genre,
      mood,
      occasion,
      story_details = {},
      key_phrases = [],
      has_stems = false,
      client_audio_notes = ''
    } = req.body;

    if (!customer_name || !customer_email || !genre || !mood) {
      return res.status(400).json({ error: 'Faltan campos obligatorios para crear la orden' });
    }

    // Calcular precio dinámico según pricingConfig
    const tierKey = product_tier.toLowerCase() === 'express' ? 'express' : 'semi_pro';
    const basePrice = pricingConfig[tierKey]?.current_price || (product_tier === 'EXPRESS' ? 120000 : 280000);
    const stemsPrice = has_stems ? (pricingConfig.stems_addon?.current_price || 50000) : 0;
    const totalAmount = basePrice + stemsPrice;

    const orderNumber = generateOrderNumber();
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const newOrder = {
      id: orderId,
      order_number: orderNumber,
      customer_name,
      customer_email,
      customer_phone: customer_phone || '',
      product_tier,
      genre,
      mood,
      occasion: occasion || 'Especial',
      story_details,
      key_phrases: Array.isArray(key_phrases) ? key_phrases : [],
      rhythm_reference_path: null,
      vocal_reference_path: null,
      client_audio_notes,
      total_amount: totalAmount,
      currency: 'COP',
      has_stems,
      payment_status: 'PENDING',
      payment_provider: 'MERCADO_PAGO',
      payment_provider_reference: null,
      order_status: 'AWAITING_PAYMENT',
      corrections_allowed: 1,
      corrections_used: 0,
      download_expires_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      versions: [],
      corrections: []
    };

    // Crear preferencia en Mercado Pago API
    let checkoutUrl = '';
    let preferenceId = '';

    try {
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
              title: `Melofilia - Canción Personalizada (${product_tier})`,
              description: `Producción de canción para ${customer_name} - Pedido ${orderNumber}`,
              quantity: 1,
              currency_id: 'COP',
              unit_price: totalAmount
            }
          ],
          payer: {
            email: customer_email
          },
          external_reference: orderNumber,
          back_urls: {
            success: `${APP_URL}/pedido/${orderNumber}?payment_status=approved`,
            failure: `${APP_URL}/pedido/${orderNumber}?payment_status=rejected`,
            pending: `${APP_URL}/pedido/${orderNumber}?payment_status=pending`
          },
          ...(APP_URL.startsWith('https://') ? { auto_return: 'approved' } : {}),
          statement_descriptor: 'MELOFILIA'
        })
      });

      if (mpResponse.ok) {
        const mpData = await mpResponse.json();
        preferenceId = mpData.id;
        checkoutUrl = mpData.sandbox_init_point || mpData.init_point;
        newOrder.payment_provider_reference = preferenceId;
      } else {
        const errText = await mpResponse.text();
        console.error('Error de Mercado Pago al crear preferencia:', errText);
      }
    } catch (mpErr) {
      console.error('Error comunicando con Mercado Pago:', mpErr);
    }

    orders.unshift(newOrder);

    res.status(201).json({
      success: true,
      order: newOrder,
      checkoutUrl: checkoutUrl || `${APP_URL}/pedido/${orderNumber}?simulated_payment=true`,
      preferenceId
    });
  } catch (error) {
    console.error('Error al crear orden:', error);
    res.status(500).json({ error: error.message || 'Error interno al procesar el pedido' });
  }
});

/**
 * Consultar un pedido por su número comercial (MP-YYYY-XXXXXX)
 */
app.get('/api/orders/:orderNumber', (req, res) => {
  const { orderNumber } = req.params;
  const order = orders.find(o => o.order_number.toUpperCase() === orderNumber.toUpperCase());

  if (!order) {
    return res.status(404).json({ error: 'Pedido no encontrado' });
  }

  // Devolver datos seguros para el portal del cliente
  res.json({
    order_number: order.order_number,
    customer_name: order.customer_name,
    customer_email_masked: order.customer_email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
    product_tier: order.product_tier,
    genre: order.genre,
    mood: order.mood,
    occasion: order.occasion,
    key_phrases: order.key_phrases,
    total_amount: order.total_amount,
    currency: order.currency,
    payment_status: order.payment_status,
    order_status: order.order_status,
    corrections_allowed: order.corrections_allowed,
    corrections_used: order.corrections_used,
    preview_audio_url: order.preview_audio_url || null,
    download_expires_at: order.download_expires_at,
    created_at: order.created_at,
    delivered_at: order.delivered_at || null,
    corrections: order.corrections || []
  });
});

/**
 * Solicitar la única ronda de corrección permitida
 */
app.post('/api/orders/:orderNumber/correction', (req, res) => {
  const { orderNumber } = req.params;
  const { category, description, timestamp_hint } = req.body;

  const order = orders.find(o => o.order_number.toUpperCase() === orderNumber.toUpperCase());

  if (!order) {
    return res.status(404).json({ error: 'Pedido no encontrado' });
  }

  if (order.order_status !== 'READY_FOR_CLIENT_REVIEW') {
    return res.status(400).json({ error: 'El pedido no está en estado de revisión de previsualización' });
  }

  if (order.corrections_used >= order.corrections_allowed) {
    return res.status(400).json({ error: 'Ya has utilizado la ronda de corrección incluida para este pedido' });
  }

  if (!description || description.trim().length < 10) {
    return res.status(400).json({ error: 'Por favor proporciona una descripción detallada de la corrección' });
  }

  const correctionEntry = {
    id: `corr_${Date.now()}`,
    category: category || 'LETRA',
    description: description.trim(),
    timestamp_hint: timestamp_hint || 'General',
    status: 'REQUESTED',
    requested_at: new Date().toISOString()
  };

  order.corrections.push(correctionEntry);
  order.corrections_used += 1;
  order.order_status = 'CORRECTION_REQUESTED';
  order.updated_at = new Date().toISOString();

  res.json({
    success: true,
    message: 'Solicitud de corrección registrada exitosamente. Nuestro equipo productor iniciará la revisión.',
    order_status: order.order_status,
    corrections_used: order.corrections_used,
    correction: correctionEntry
  });
});

/**
 * Generar Grant de Descarga segura temporal
 */
app.post('/api/orders/:orderNumber/download-grant', (req, res) => {
  const { orderNumber } = req.params;
  const order = orders.find(o => o.order_number.toUpperCase() === orderNumber.toUpperCase());

  if (!order) {
    return res.status(404).json({ error: 'Pedido no encontrado' });
  }

  if (order.order_status !== 'DELIVERED') {
    return res.status(403).json({ error: 'Las descargas finales solo están habilitadas cuando el pedido ha sido entregado.' });
  }

  // Comprobar ventana de 7 días
  if (order.download_expires_at && new Date(order.download_expires_at) < new Date()) {
    return res.status(410).json({ error: 'El período de acceso y descarga de 7 días para este pedido ha expirado.' });
  }

  // Generar URL firmada temporal de descarga (válida por 5 minutos)
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const downloadUrl = `https://storage.melofilia.com/vault/${order.order_number}/master_final.mp3?token=${token}&expires=${Date.now() + 300000}`;
  const stemsZipUrl = order.has_stems 
    ? `https://storage.melofilia.com/vault/${order.order_number}/stems.zip?token=${token}&expires=${Date.now() + 300000}`
    : null;

  res.json({
    success: true,
    expires_in_seconds: 300,
    download_url_mp3: downloadUrl,
    download_url_wav: downloadUrl.replace('.mp3', '.wav'),
    download_url_stems_zip: stemsZipUrl,
    lyrics_pdf_url: `https://storage.melofilia.com/vault/${order.order_number}/letra_acordes.pdf?token=${token}`
  });
});

/**
 * Webhook de Mercado Pago
 */
app.post('/api/webhooks/mercadopago', async (req, res) => {
  try {
    const { type, data, action } = req.body;
    console.log('Webhook recibido de Mercado Pago:', { type, data, action });

    const paymentId = data?.id || req.query['data.id'] || req.query.id;

    if (paymentId) {
      try {
        const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` }
        });

        if (mpRes.ok) {
          const paymentData = await mpRes.json();
          const orderNumber = paymentData.external_reference;
          const status = paymentData.status;

          if (orderNumber) {
            const order = orders.find(o => o.order_number === orderNumber);
            if (order) {
              if (status === 'approved') {
                order.payment_status = 'APPROVED';
                if (order.order_status === 'AWAITING_PAYMENT') {
                  order.order_status = 'QUEUED';
                }
              } else if (status === 'rejected' || status === 'cancelled') {
                order.payment_status = 'FAILED';
                order.order_status = 'PAYMENT_FAILED';
              }
              order.updated_at = new Date().toISOString();
            }
          }
        }
      } catch (checkErr) {
        console.error('Error verificando pago en Mercado Pago:', checkErr);
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error en webhook de Mercado Pago:', error);
    res.status(500).send('Webhook Error');
  }
});

/**
 * Endpoints Administrativos (Melofilia Admin)
 */
app.get('/api/admin/orders', (req, res) => {
  res.json({
    total: orders.length,
    orders: orders
  });
});

app.patch('/api/admin/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, preview_audio_url, production_notes } = req.body;

  const order = orders.find(o => o.id === id || o.order_number === id);
  if (!order) {
    return res.status(404).json({ error: 'Pedido no encontrado' });
  }

  // Permitir transiciones
  order.order_status = status;
  if (preview_audio_url) order.preview_audio_url = preview_audio_url;
  if (production_notes) order.production_notes = production_notes;
  
  if (status === 'DELIVERED') {
    order.delivered_at = new Date().toISOString();
    // Expiración a 7 días
    order.download_expires_at = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
  }

  order.updated_at = new Date().toISOString();

  res.json({
    success: true,
    order
  });
});

// Simulación directa de pago para testing
app.post('/api/admin/simulate-payment', (req, res) => {
  const { orderNumber } = req.body;
  const order = orders.find(o => o.order_number.toUpperCase() === orderNumber.toUpperCase());

  if (!order) {
    return res.status(404).json({ error: 'Pedido no encontrado' });
  }

  order.payment_status = 'APPROVED';
  order.order_status = 'QUEUED';
  order.updated_at = new Date().toISOString();

  res.json({
    success: true,
    message: `Pago simulado como APROBADO para el pedido ${orderNumber}. El pedido avanzó a cola de producción.`,
    order
  });
});

// Almacén en memoria de Mensajes del Buzón de Contacto (Sección 30-35)
const contactMessages = [
  {
    id: 'msg_001',
    name: 'Carolina Velásquez',
    email: 'carolina.v@ejemplo.com',
    category: 'REVIEW',
    order_number: 'MP-2026-000184',
    message: '¡La canción para mi esposo quedó increíble! Lloramos los dos cuando la escuchamos. Muchas gracias a todo el equipo de producción.',
    status: 'RESOLVED',
    is_approved_review: true,
    internal_notes: 'Cliente muy satisfecha. Aprobada para testimonios.',
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  },
  {
    id: 'msg_002',
    name: 'Andrés Felipe Morales',
    email: 'andres.felipe@ejemplo.com',
    category: 'COTIZACIÓN',
    order_number: null,
    message: 'Hola, me gustaría saber si hacen canciones en género Salsa tradicional con metales y coro para los 50 años de mi padre.',
    status: 'NEW',
    is_approved_review: false,
    internal_notes: null,
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
  }
];

/**
 * Endpoint Público: Enviar mensaje al Buzón de Contacto (Sección 31)
 */
app.post('/api/contact', (req, res) => {
  try {
    const { name, email, category = 'SERVICIOS', order_number, message, data_consent } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Nombre, correo y mensaje son obligatorios.' });
    }

    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      email: email.trim(),
      category: category.toUpperCase(),
      order_number: order_number ? order_number.trim().toUpperCase() : null,
      message: message.trim(),
      status: 'NEW', // 'NEW' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED'
      is_approved_review: false,
      internal_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    contactMessages.unshift(newMessage);

    res.status(201).json({
      success: true,
      message: 'Tu mensaje ha sido recibido por el equipo de Melofilia. Te responderemos a la brevedad.',
      entry: newMessage
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar el mensaje: ' + err.message });
  }
});

/**
 * Endpoints Administrativos: Buzón de Contacto
 */
app.get('/api/admin/contact', (req, res) => {
  res.json({
    total: contactMessages.length,
    messages: contactMessages
  });
});

app.patch('/api/admin/contact/:id', (req, res) => {
  const { id } = req.params;
  const { status, is_approved_review, internal_notes, linked_order_number } = req.body;

  const msg = contactMessages.find(m => m.id === id);
  if (!msg) {
    return res.status(404).json({ error: 'Mensaje no encontrado' });
  }

  if (status) msg.status = status;
  if (is_approved_review !== undefined) msg.is_approved_review = is_approved_review;
  if (internal_notes !== undefined) msg.internal_notes = internal_notes;
  if (linked_order_number !== undefined) msg.order_number = linked_order_number;
  msg.updated_at = new Date().toISOString();

  res.json({
    success: true,
    message: 'Mensaje de contacto actualizado exitosamente',
    entry: msg
  });
});

/**
 * Reviews públicas aprobadas para la Landing Page
 */
app.get('/api/reviews/public', (req, res) => {
  const approved = contactMessages.filter(m => m.category === 'REVIEW' && m.is_approved_review);
  res.json(approved);
});

app.listen(PORT, () => {
  console.log(`🎵 Melofilia API Server escuchando en http://localhost:${PORT}`);
  console.log(`💳 Mercado Pago Sandbox: ACTIVO (Moneda: COP)`);
  console.log(`🏷️ Precios Dinámicos y Descuentos: HABILITADOS`);
  console.log(`📬 Buzón de Contacto y Reviews: HABILITADOS`);
});

