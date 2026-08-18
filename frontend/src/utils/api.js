const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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

export async function requestDownloadGrant(orderNumber) {
  const res = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(orderNumber)}/download-grant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al autorizar descarga');
  }
  return res.json();
}

export async function getPricingConfig() {
  const res = await fetch(`${API_BASE}/api/config/pricing`);
  if (!res.ok) throw new Error('Error al obtener configuración de precios');
  return res.json();
}

export async function updatePricingConfig(pricingData) {
  const res = await fetch(`${API_BASE}/api/admin/pricing`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pricingData)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Error al actualizar precios');
  }
  return res.json();
}

export async function getAdminOrders() {
  const res = await fetch(`${API_BASE}/api/admin/orders`);
  if (!res.ok) throw new Error('Error al obtener pedidos administrativos');
  return res.json();
}

export async function updateAdminOrderStatus(orderId, updateData) {
  const res = await fetch(`${API_BASE}/api/admin/orders/${encodeURIComponent(orderId)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData)
  });
  if (!res.ok) throw new Error('Error al actualizar estado');
  return res.json();
}

export async function simulatePaymentApproval(orderNumber) {
  const res = await fetch(`${API_BASE}/api/admin/simulate-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderNumber })
  });
  if (!res.ok) throw new Error('Error al simular pago');
  return res.json();
}
