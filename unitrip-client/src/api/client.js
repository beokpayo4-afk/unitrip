const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function getToken() {
  return localStorage.getItem("unitrip_token");
}

export async function api(path, options = {}) {
  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }

  if (!res.ok) {
    const err = new Error(data?.message || "Request failed");
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const authApi = {
  register: (body) =>
    api("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) =>
    api("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => api("/api/auth/me"),
};

export const catalogApi = {
  categories: (params = {}) => {
    const q = new URLSearchParams();
    if (params.all) q.set("all", "1");
    const search = q.toString();
    return api(`/api/categories${search ? `?${search}` : ""}`);
  },
  packages: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api(`/api/packages${q ? `?${q}` : ""}`);
  },
  destinations: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api(`/api/packages/meta/destinations${q ? `?${q}` : ""}`);
  },
  places: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api(`/api/packages/meta/places${q ? `?${q}` : ""}`);
  },
  packageBySlug: (slug) => api(`/api/packages/slug/${slug}`),
  faqs: () => api("/api/faqs"),
};

export const bookingApi = {
  create: (body) =>
    api("/api/bookings", { method: "POST", body: JSON.stringify(body) }),
  checkout: (body) =>
    api("/api/bookings/checkout", { method: "POST", body: JSON.stringify(body) }),
  track: (body) =>
    api("/api/bookings/track", { method: "POST", body: JSON.stringify(body) }),
  ticket: (orderId, email) =>
    api(
      `/api/bookings/ticket?orderId=${encodeURIComponent(orderId)}&email=${encodeURIComponent(email)}`
    ),
  ticketPdfUrl: (orderId, email) =>
    `${API_URL}/api/bookings/ticket.pdf?orderId=${encodeURIComponent(orderId)}&email=${encodeURIComponent(email)}`,
  mine: () => api("/api/bookings/mine"),
  addAddOns: (body) =>
    api("/api/bookings/addons", { method: "POST", body: JSON.stringify(body) }),
  addAddOnsAuth: (body) =>
    api("/api/bookings/addons/auth", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  createPayment: (bookingId) =>
    api(`/api/bookings/${bookingId}/pay`, { method: "POST" }),
  verifyPayment: (body) =>
    api("/api/bookings/payment/verify", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  createCartPayment: (cartGroupId) =>
    api(`/api/bookings/cart/${cartGroupId}/pay`, { method: "POST" }),
  verifyCartPayment: (body) =>
    api("/api/bookings/cart/payment/verify", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  confirmUpi: (bookingId, body = {}) =>
    api(`/api/bookings/${bookingId}/confirm-upi`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  confirmCartUpi: (cartGroupId, body = {}) =>
    api(`/api/bookings/cart/${cartGroupId}/confirm-upi`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  regeneratePdf: (bookingId) =>
    api(`/api/bookings/${bookingId}/ticket-pdf`, { method: "POST" }),
};

export const ratingApi = {
  list: (packageId) => api(`/api/ratings/package/${packageId}`),
  create: (body) =>
    api("/api/ratings", { method: "POST", body: JSON.stringify(body) }),
};

export const adminApi = {
  createCategory: (body) =>
    api("/api/categories", { method: "POST", body: JSON.stringify(body) }),
  updateCategory: (id, body) =>
    api(`/api/categories/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteCategory: (id) => api(`/api/categories/${id}`, { method: "DELETE" }),

  packages: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api(`/api/packages/admin/all${q ? `?${q}` : ""}`);
  },
  package: (id) => api(`/api/packages/admin/${id}`),
  createPackage: (body) =>
    api("/api/packages", { method: "POST", body: JSON.stringify(body) }),
  updatePackage: (id, body) =>
    api(`/api/packages/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deletePackage: (id) => api(`/api/packages/${id}`, { method: "DELETE" }),

  createFaq: (body) =>
    api("/api/faqs", { method: "POST", body: JSON.stringify(body) }),
  updateFaq: (id, body) =>
    api(`/api/faqs/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteFaq: (id) => api(`/api/faqs/${id}`, { method: "DELETE" }),

  bookings: (params = {}) => {
    const q = new URLSearchParams();
    if (typeof params === "string") {
      if (params) q.set("status", params);
    } else {
      if (params.status) q.set("status", params.status);
      if (params.q) q.set("q", params.q);
    }
    const qs = q.toString();
    return api(`/api/bookings/admin/all${qs ? `?${qs}` : ""}`);
  },
  updateBooking: (id, body) =>
    api(`/api/bookings/admin/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  tripEnquiries: () => api("/api/trip-enquiries/admin/all"),
  tripEnquiry: (id) => api(`/api/trip-enquiries/admin/${id}`),
  updateTripEnquiry: (id, body) =>
    api(`/api/trip-enquiries/admin/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  moduleBookings: (type) => api(`/api/module-bookings/admin/all?type=${encodeURIComponent(type)}`),
  moduleBooking: (id) => api(`/api/module-bookings/admin/${id}`),
  updateModuleBooking: (id, body) =>
    api(`/api/module-bookings/admin/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  holidayPackages: () => api("/api/holiday-packages/admin/all"),
  holidayPackage: (id) => api(`/api/holiday-packages/admin/${id}`),
  createHolidayPackage: (body) =>
    api("/api/holiday-packages", { method: "POST", body: JSON.stringify(body) }),
  updateHolidayPackage: (id, body) =>
    api(`/api/holiday-packages/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteHolidayPackage: (id) => api(`/api/holiday-packages/${id}`, { method: "DELETE" }),
  publishHolidayPackage: (id, published) =>
    api(`/api/holiday-packages/${id}/published`, {
      method: "PATCH",
      body: JSON.stringify({ published }),
    }),
  seedHolidayPackages: (packages) =>
    api("/api/holiday-packages/admin/seed", {
      method: "POST",
      body: JSON.stringify({ packages }),
    }),

  setPackageVisibility: (id, isActive) =>
    api(`/api/packages/${id}/visibility`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    }),

  stats: () => api("/api/admin/stats"),
  logs: (params = {}) => {
    const q = new URLSearchParams();
    if (params.level) q.set("level", params.level);
    if (params.q) q.set("q", params.q);
    if (params.page) q.set("page", String(params.page));
    if (params.limit) q.set("limit", String(params.limit));
    const qs = q.toString();
    return api(`/api/admin/logs${qs ? `?${qs}` : ""}`);
  },

  upload: async (file, kind = "image") => {
    const form = new FormData();
    form.append("file", file);
    form.append("kind", kind === "pdf" ? "pdf" : "image");
    return api("/api/uploads", { method: "POST", body: form });
  },
};

export default api;
