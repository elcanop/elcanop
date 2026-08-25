const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'melofilia_drop_it_co_secure_jwt_secret_2026_x89a';

// Configurar Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || 'APP_USR-8212980939632377-081801-3847772b11700e66de1416b616acd643-252390597';
const APP_URL = process.env.APP_URL || 'https://melofilia.vercel.app';

// 3. Usuario Administrador
const adminUsers = [
  {
    id: 'usr_owner_01',
    usuario: '1140884509',
    name: 'Administrador (Drop It Co)',
    role: 'OWNER',
    passwordHash: bcrypt.hashSync('@Elcanop2396', 10)
  }
];

async function logAuditEvent(eventType, actor, details, req) {
  const ip = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1') : 'SYSTEM';
  await supabase.from('audit_logs').insert([{
    event_type: eventType,
    actor,
    details,
    ip
  }]);
}

// 5. Middlewares de Autenticación
function authenticateJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso no autorizado: Token requerido.' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido o expirado.' });
    req.user = user;
    next();
  });
}

function requireRole(allowedRoles = ['OWNER']) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permisos insuficientes.' });
    }
    next();
  };
}

async function uploadAudioToStorage(base64Data, prefix) {
  if (!base64Data || !base64Data.startsWith('data:audio/')) return null;
  
  try {
    const matches = base64Data.match(/^data:audio\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return null;
    
    let ext = matches[1];
    if (ext === 'webm') ext = 'webm';
    else if (ext === 'mp4' || ext === 'x-m4a') ext = 'm4a';
    else ext = 'mp3'; // default fallback

    const buffer = Buffer.from(matches[2], 'base64');
    const fileName = `${prefix}-${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from('reference_audios')
      .upload(fileName, buffer, {
        contentType: `audio/${ext}`,
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('reference_audios')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Error uploading audio:', err);
    return null;
  }
}

// ==========================================
// ENDPOINTS
// ==========================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', environment: 'production', db: 'supabase' });
});

// ADMIN: LOGIN
app.post('/api/admin/login', authLimiter, (req, res) => {
  const { usuario, password } = req.body;
  if (!usuario || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
  }

  const admin = adminUsers.find(u => u.usuario === usuario);
  if (!admin || !bcrypt.compareSync(password, admin.passwordHash)) {
    logAuditEvent('FAILED_LOGIN_ATTEMPT', usuario, 'Credenciales inválidas o usuario no encontrado', req);
    return res.status(401).json({ error: 'Credenciales inválidas.' });
  }

  const token = jwt.sign({ id: admin.id, role: admin.role, name: admin.name }, JWT_SECRET, { expiresIn: '8h' });
  logAuditEvent('ADMIN_LOGIN_SUCCESS', admin.name, 'Inicio de sesión exitoso', req);
  res.json({ success: true, token, user: { name: admin.name, role: admin.role } });
});

// ADMIN: VERIFY SESSION
app.get('/api/admin/me', authenticateJWT, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// GET /api/marketing-styles
app.get('/api/marketing-styles', async (req, res) => {
  const { data, error } = await supabase.from('marketing_songs').select('*').order('sort_order', { ascending: true });
  if (error) return res.status(500).json({ error: 'Error al obtener estilos.' });
  res.json(data);
});

// PATCH /api/admin/marketing-styles
app.patch('/api/admin/marketing-styles', authenticateJWT, requireRole(['OWNER']), async (req, res) => {
  const { styles } = req.body;
  if (!Array.isArray(styles)) return res.status(400).json({ error: 'Formato inválido.' });

  for (const style of styles) {
    await supabase.from('marketing_songs').update({
      name: style.name,
      tagline: style.tagline,
      tempo: style.tempo,
      audio_url: style.audio_url,
      lyrics: style.lyrics,
      sort_order: style.sort_order
    }).eq('id', style.id);
  }
  
  logAuditEvent('MARKETING_STYLES_UPDATED', req.user.name, 'Estilos musicales actualizados', req);
  const { data } = await supabase.from('marketing_songs').select('*').order('sort_order', { ascending: true });
  res.json({ success: true, message: 'Estilos actualizados.', styles: data });
});

// GET /api/pricing
app.get('/api/pricing', async (req, res) => {
  const { data, error } = await supabase.from('pricing_config').select('*').eq('id', 'default').single();
  if (error || !data) return res.status(500).json({ error: 'Error al obtener configuración de precios.' });
  res.json(data);
});

// GET /api/admin/contact-messages
app.get('/api/admin/contact-messages', authenticateJWT, async (req, res) => {
  const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: 'Error BD.' });
  res.json({ total: data.length, messages: data });
});

// GET /api/reviews
app.get('/api/reviews', async (req, res) => {
  const { data, error } = await supabase.from('contact_messages')
    .select('*')
    .eq('category', 'REVIEW')
    .eq('is_approved_review', true);
  if (error) return res.status(500).json({ error: 'Error BD.' });
  res.json(data);
});

// POST /api/contact
app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name, email, category, orderNumber, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Nombre, email y mensaje son obligatorios.' });
  }

  const newMsg = {
    name,
    email,
    category: category || 'SERVICIOS',
    order_number: orderNumber || null,
    message,
    status: 'NEW',
    is_approved_review: false
  };

  const { error } = await supabase.from('contact_messages').insert([newMsg]);
  if (error) return res.status(500).json({ error: 'Error BD.' });

  logAuditEvent('CONTACT_MESSAGE_RECEIVED', 'GUEST', `Nuevo mensaje de: ${name} (${category})`, req);
  res.status(201).json({ success: true, message: 'Mensaje enviado correctamente.' });
});

// POST /api/orders
app.post('/api/orders', ordersLimiter, async (req, res) => {
  const orderData = req.body;
  
  if (!orderData.customer_name || !orderData.customer_email || !orderData.product_tier) {
    return res.status(400).json({ error: 'Faltan campos obligatorios para generar el pedido.' });
  }

  const { data: pricingData } = await supabase.from('pricing_config').select('*').eq('id', 'default').single();
  const pricing = pricingData || {
    express: { current_price: 120000 },
    semi_pro: { current_price: 280000 },
    stems_addon: { current_price: 50000 }
  };

  const isExpress = orderData.product_tier === 'EXPRESS';
  const has_stems = Boolean(orderData.has_stems);
  
  const basePrice = isExpress 
    ? pricing.express.current_price 
    : pricing.semi_pro.current_price;
  const currentStemsPrice = has_stems ? pricing.stems_addon.current_price : 0;
  const total_amount = basePrice + currentStemsPrice;

  const order_number = `MLF-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

  try {
    const preferenceData = {
      items: [
        {
          title: `Melofilia - Plan ${orderData.product_tier}`,
          description: `Canción personalizada. Género: ${orderData.genre}. Ocasión: ${orderData.occasion}`,
          quantity: 1,
          currency_id: 'COP',
          unit_price: total_amount
        }
      ],
      payer: {
        name: orderData.customer_name,
        email: orderData.customer_email
      },
      back_urls: {
        success: `${APP_URL}/checkout/success`,
        failure: `${APP_URL}/checkout/failure`,
        pending: `${APP_URL}/checkout/pending`
      },
      auto_return: "approved",
      external_reference: order_number
    };

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferenceData)
    });

    const mpResult = await mpResponse.json();

    if (!mpResponse.ok) {
      throw new Error(`Error Mercado Pago: ${JSON.stringify(mpResult)}`);
    }

    const rhythm_url = await uploadAudioToStorage(orderData.rhythm_audio_data, `rhythm-${order_number}`);
    const voice_url = await uploadAudioToStorage(orderData.voice_audio_data, `voice-${order_number}`);

    const newOrder = {
      order_number,
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      customer_phone: orderData.customer_phone || '',
      product_tier: orderData.product_tier,
      genre: orderData.genre || '',
      mood: orderData.mood || '',
      occasion: orderData.occasion || '',
      story_details: orderData.story_details || {},
      key_phrases: orderData.key_phrases || [],
      client_audio_notes: orderData.client_audio_notes || null,
      rhythm_audio_data: rhythm_url || orderData.rhythm_audio_data, // fallback si no era base64
      voice_audio_data: voice_url || orderData.voice_audio_data,
      total_amount,
      has_stems,
      payment_status: 'PENDING',
      order_status: 'AWAITING_PAYMENT',
      payment_provider_reference: mpResult.id,
      lyrics_status: 'PENDING_PROPOSAL',
      corrections_allowed: isExpress ? 1 : 2,
      corrections_used: 0
    };

    const { error } = await supabase.from('orders').insert([newOrder]);
    if (error) throw error;

    logAuditEvent('ORDER_CREATED', 'SYSTEM', `Pedido Creado: ${order_number}`, req);

    res.status(201).json({
      success: true,
      order: { order_number },
      checkoutUrl: mpResult.init_point
    });

  } catch (error) {
    console.error('Error procesando el pedido:', error);
    res.status(500).json({ error: 'Hubo un error interno al crear el pedido o conectar con Mercado Pago.' });
  }
});

// POST /api/orders/:orderNumber/verify-payment
app.post('/api/orders/:orderNumber/verify-payment', async (req, res) => {
  const { orderNumber } = req.params;
  const { payment_id } = req.body;

  try {
    // 1. Fetch order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .ilike('order_number', orderNumber)
      .single();

    if (orderError || !order) return res.status(404).json({ error: 'Pedido no encontrado.' });

    // Si ya está pagado, no hacemos nada más que devolver el pedido
    if (order.payment_status === 'COMPLETED') {
      return res.json({ success: true, order });
    }

    // 2. Si no hay payment_id, no podemos verificar
    if (!payment_id) {
      return res.status(400).json({ error: 'Falta payment_id para verificar el pago.' });
    }

    // 3. Verificar el pago con Mercado Pago
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
      }
    });

    if (!mpResponse.ok) {
      return res.status(500).json({ error: 'Error al consultar Mercado Pago.' });
    }

    const mpData = await mpResponse.json();

    // 4. Actualizar base de datos si el pago está aprobado
    if (mpData.status === 'approved') {
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'COMPLETED',
          order_status: 'IN_PROGRESS',
          payment_provider_reference: payment_id.toString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      logAuditEvent('PAYMENT_VERIFIED', 'SYSTEM', `Pago validado para pedido: ${orderNumber}`, req);
      return res.json({ success: true, order: updatedOrder });
    } else {
      return res.json({ success: false, status: mpData.status, order });
    }

  } catch (err) {
    console.error('Error verificando pago:', err);
    res.status(500).json({ error: 'Error interno verificando el pago.' });
  }
});
// GET /api/orders/:orderNumber
app.get('/api/orders/:orderNumber', async (req, res) => {
  const { orderNumber } = req.params;
  const { data: order, error } = await supabase.from('orders').select('*').ilike('order_number', orderNumber).single();
  
  if (error || !order) return res.status(404).json({ error: 'Pedido no encontrado.' });
  res.json(order);
});

// GET /api/admin/orders
app.get('/api/admin/orders', authenticateJWT, async (req, res) => {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: 'Error BD.' });
  res.json({ total: data.length, orders: data });
});

// PATCH /api/admin/orders/:id/status
app.patch('/api/admin/orders/:id/status', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { status, payment_status } = req.body;

  const { data: order } = await supabase.from('orders').select('*').or(`id.eq.${id},order_number.eq.${id}`).single();
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado.' });

  const updateData = {};
  if (status) updateData.order_status = status;
  if (payment_status) updateData.payment_status = payment_status;

  await supabase.from('orders').update(updateData).eq('id', order.id);
  
  logAuditEvent('ORDER_STATUS_UPDATED', req.user.name, `Estado del pedido ${order.order_number} actualizado`, req);
  
  const { data: updatedOrder } = await supabase.from('orders').select('*').eq('id', order.id).single();
  res.json({ success: true, order: updatedOrder });
});

// PATCH /api/admin/pricing
app.patch('/api/admin/pricing', authenticateJWT, requireRole(['OWNER']), async (req, res) => {
  const { express: exp, semi_pro: semi, stems_addon: stems } = req.body;
  
  const { data: current } = await supabase.from('pricing_config').select('*').eq('id', 'default').single();
  
  const updateData = {
    express: { ...current.express, ...exp },
    semi_pro: { ...current.semi_pro, ...semi },
    stems_addon: { ...current.stems_addon, ...stems },
    updated_at: new Date().toISOString()
  };

  await supabase.from('pricing_config').update(updateData).eq('id', 'default');

  logAuditEvent('PRICING_UPDATED', req.user.name, 'Configuración de precios actualizada', req);
  res.json({ success: true, pricing: updateData });
});

// GET /api/admin/audit-logs
app.get('/api/admin/audit-logs', authenticateJWT, requireRole(['OWNER']), async (req, res) => {
  const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(500);
  if (error) return res.status(500).json({ error: 'Error BD.' });
  res.json({ total: data.length, logs: data });
});

app.post('/api/orders/:orderNumber/propose-lyrics', authenticateJWT, async (req, res) => {
  const { orderNumber } = req.params;
  const { lyrics } = req.body;
  
  const { data: order } = await supabase.from('orders').select('*').ilike('order_number', orderNumber).single();
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado.' });

  await supabase.from('orders').update({
    current_lyrics: lyrics,
    lyrics_status: 'AWAITING_REVIEW'
  }).eq('id', order.id);

  logAuditEvent('LYRICS_PROPOSED', req.user.name, `Propuesta de letra enviada para: ${orderNumber}`, req);
  res.json({ success: true, message: 'Letra enviada al cliente para revisión.' });
});

app.post('/api/orders/:orderNumber/review-lyrics', async (req, res) => {
  const { orderNumber } = req.params;
  const { approved, feedback } = req.body;

  const { data: order } = await supabase.from('orders').select('*').ilike('order_number', orderNumber).single();
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado.' });

  const status = approved ? 'APPROVED' : 'NEEDS_CORRECTION';
  await supabase.from('orders').update({
    lyrics_status: status,
    lyrics_feedback: feedback || null
  }).eq('id', order.id);

  logAuditEvent('LYRICS_REVIEWED', 'CUSTOMER', `El cliente ${approved ? 'aprobó' : 'rechazó'} la letra: ${orderNumber}`, req);
  res.json({ success: true, status });
});

app.patch('/api/admin/orders/:id/deliver-versions', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { versionA, versionB, notes } = req.body;

  const { data: order } = await supabase.from('orders').select('*').or(`id.eq.${id},order_number.eq.${id}`).single();
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado.' });

  await supabase.from('orders').update({
    version_a_url: versionA || null,
    version_b_url: versionB || null,
    production_notes: notes,
    order_status: 'DELIVERED_PENDING_REVIEW',
    delivered_at: new Date().toISOString()
  }).eq('id', order.id);

  logAuditEvent('VERSIONS_DELIVERED', req.user.name, `Versiones entregadas (pendientes de revisión) para pedido: ${order.order_number}`, req);
  res.json({ success: true, message: 'Versiones entregadas para revisión del cliente.' });
});

app.post('/api/orders/:orderNumber/review-delivery', async (req, res) => {
  const { orderNumber } = req.params;
  const { approved, selectedVersion, feedback } = req.body;

  const { data: order } = await supabase.from('orders').select('*').ilike('order_number', orderNumber).single();
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado.' });

  if (approved) {
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 30); // 30 días para descargar

    // Determinar qué versión eligió si es que hay varias
    let finalMp3Url = order.version_a_url;
    if (selectedVersion === 'B' && order.version_b_url) finalMp3Url = order.version_b_url;

    const downloadLinks = {
      mp3: finalMp3Url,
      wav: `https://mock.url/download/${orderNumber}_${selectedVersion || 'A'}_Master.wav`,
      stems: order.has_stems ? `https://mock.url/download/${orderNumber}_Stems.zip` : null
    };

    await supabase.from('orders').update({
      order_status: 'COMPLETED',
      delivery_assets: downloadLinks,
      download_expires_at: expireDate.toISOString()
    }).eq('id', order.id);

    logAuditEvent('DELIVERY_APPROVED', 'CUSTOMER', `Cliente aprobó entrega y seleccionó versión ${selectedVersion || 'A'}.`, req);
    return res.json({ success: true, downloadLinks, expires_at: expireDate.toISOString() });
  } else {
    // Rechazo / Petición de Corrección
    if (order.corrections_used >= order.corrections_allowed) {
      return res.status(400).json({ error: 'Ya has utilizado todas tus correcciones gratuitas.' });
    }

    await supabase.from('orders').update({
      order_status: 'CORRECTION_REQUESTED',
      corrections_used: order.corrections_used + 1,
      production_notes: `[CORRECCIÓN SOLICITADA MUSICAL]: ${feedback}`
    }).eq('id', order.id);

    logAuditEvent('CORRECTION_REQUESTED', 'CUSTOMER', `Corrección musical solicitada para: ${orderNumber}`, req);
    return res.json({ success: true, message: 'Corrección solicitada. Nuestro equipo trabajará en ella.' });
  }
});

app.delete('/api/admin/orders/:id/audio', authenticateJWT, async (req, res) => {
  const { id } = req.params;
  const { type } = req.query; // 'rhythm' o 'voice'

  const { data: order } = await supabase.from('orders').select('*').or(`id.eq.${id},order_number.eq.${id}`).single();
  if (!order) return res.status(404).json({ error: 'Pedido no encontrado.' });

  const urlField = type === 'rhythm' ? 'rhythm_audio_data' : 'voice_audio_data';
  const fileUrl = order[urlField];
  
  if (fileUrl && fileUrl.includes('reference_audios/')) {
    const fileName = fileUrl.split('reference_audios/')[1];
    await supabase.storage.from('reference_audios').remove([fileName]);
  }

  await supabase.from('orders').update({ [urlField]: null }).eq('id', order.id);
  
  logAuditEvent('AUDIO_DELETED', req.user.name, `Audio ${type} eliminado del pedido ${order.order_number}`, req);
  res.json({ success: true, message: 'Audio eliminado exitosamente para liberar espacio.' });
});

module.exports = app;
