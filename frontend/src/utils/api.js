const API_BASE = import.meta.env.VITE_API_URL !== undefined 
  ? import.meta.env.VITE_API_URL 
  : (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? '' : 'http://localhost:3001');

// Token Management
export function getAdminToken() {
  return localStorage.getItem('melofilia_admin_token');
}

export function setAdminToken(token) {
  if (token) {
    localStorage.setItem('melofilia_admin_token', token);
  } else {
    localStorage.removeItem('melofilia_admin_token');
  }
}

export function getAdminUser() {
  const user = localStorage.getItem('melofilia_admin_user');
  try {
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
}

export function setAdminUser(user) {
  if (user) {
    localStorage.setItem('melofilia_admin_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('melofilia_admin_user');
  }
}

// 1. Autenticación Real de Admin (Drop It Co)
export async function loginAdmin(usuario, password) {
  const res = await fetch(`${API_BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, password })
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Credenciales inválidas');
  }

  const data = await res.json();
  setAdminToken(data.token);
  setAdminUser(data.user);
  return data;
}

export async function verifyAdminSession() {
  const token = getAdminToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/api/admin/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      logoutAdmin();
      return null;
    }

    const data = await res.json();
    return data.user;
  } catch (e) {
    logoutAdmin();
    return null;
  }
}

export function logoutAdmin() {
  setAdminToken(null);
  setAdminUser(null);
}

function getAuthHeaders() {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

// 2. Endpoints Públicos
export async function createOrder(orderData) {
  const res = await fetch(`${API_BASE}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al crear la orden');
  }
  return res.json();
}

export async function getOrder(orderNumber) {
  const res = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(orderNumber)}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Pedido no encontrado');
  }
  return res.json();
}

export async function reviewLyrics(orderNumber, action, feedback) {
  const res = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(orderNumber)}/review-lyrics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, feedback })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al procesar la revisión de la letra');
  }
  return res.json();
}

export async function submitCorrection(orderNumber, correctionData) {
  const res = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(orderNumber)}/correction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(correctionData)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al enviar corrección');
  }
  return res.json();
}

export async function reviewDelivery(orderNumber, payload) {
  const res = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(orderNumber)}/review-delivery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al procesar la revisión de entrega');
  }
  return res.json();
}

export async function getPricingConfig() {
  const res = await fetch(`${API_BASE}/api/config/pricing`);
  if (!res.ok) throw new Error('Error al obtener configuración de precios');
  return res.json();
}

export async function getMarketingSongs() {
  const res = await fetch(`${API_BASE}/api/config/marketing-songs`);
  if (!res.ok) throw new Error('Error al obtener canciones de marketing');
  return res.json();
}

export async function sendContactMessage(contactData) {
  const res = await fetch(`${API_BASE}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contactData)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al enviar mensaje');
  }
  return res.json();
}

export async function getPublicReviews() {
  const res = await fetch(`${API_BASE}/api/reviews/public`);
  if (!res.ok) return [];
  return res.json();
}

// 3. Endpoints Protegidos de Admin
export async function getAdminOrders() {
  const res = await fetch(`${API_BASE}/api/admin/orders`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al obtener pedidos administrativos');
  }
  return res.json();
}

export async function proposeLyrics(orderNumber, lyrics) {
  const res = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(orderNumber)}/propose-lyrics`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ lyrics })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al enviar propuesta de letra');
  }
  return res.json();
}

export async function deliverTwoVersions(orderId, version_a_url, version_b_url, production_notes) {
  const res = await fetch(`${API_BASE}/api/admin/orders/${encodeURIComponent(orderId)}/deliver-versions`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ version_a_url, version_b_url, production_notes })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al entregar versiones');
  }
  return res.json();
}

export async function updateAdminOrderStatus(orderId, updateData) {
  const res = await fetch(`${API_BASE}/api/admin/orders/${encodeURIComponent(orderId)}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al actualizar estado');
  }
  return res.json();
}

export async function updateMarketingSongs(styles) {
  const res = await fetch(`${API_BASE}/api/admin/marketing-songs`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ styles })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al actualizar canciones de marketing');
  }
  return res.json();
}

export async function updatePricingConfig(pricingData) {
  const res = await fetch(`${API_BASE}/api/admin/pricing`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(pricingData)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al actualizar precios');
  }
  return res.json();
}

export async function getAdminContactMessages() {
  const res = await fetch(`${API_BASE}/api/admin/contact`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al consultar buzón de contacto');
  }
  return res.json();
}

export async function updateAdminContactMessage(id, updateData) {
  const res = await fetch(`${API_BASE}/api/admin/contact/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al actualizar mensaje');
  }
  return res.json();
}

export async function getAuditLogs() {
  const res = await fetch(`${API_BASE}/api/admin/audit-logs`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al obtener registros de auditoría');
  }
  return res.json();
}

export async function simulatePaymentApproval(orderNumber) {
  const res = await fetch(`${API_BASE}/api/admin/simulate-payment`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ orderNumber })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Error al simular pago');
  }
  return res.json();
}

export async function deleteAdminOrderAudio(orderId, type) {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/api/admin/orders/${orderId}/audio?type=${type}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al eliminar el audio');
  }
  return res.json();
}

// 12. Verify Payment
export async function verifyPayment(orderNumber, paymentId) {
  const res = await fetch(`${API_BASE}/api/orders/${orderNumber}/verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payment_id: paymentId })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error verificando pago');
  }
  return res.json();
}
