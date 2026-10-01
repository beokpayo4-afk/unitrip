/**
 * Holiday catalogue boundary.
 * Published packages come from the admin-managed API.
 * The local records are used only until an admin imports the catalogue.
 */
import { api } from "@/api/client";
import { HOLIDAY_PACKAGES } from "../data/packages";

const VERSION_KEY = "unitrip_holiday_catalog_version";
const requests = new Map();

function catalogVersion() {
  return sessionStorage.getItem(VERSION_KEY) || "0";
}

export function bumpHolidayCatalog() {
  sessionStorage.setItem(VERSION_KEY, String(Date.now()));
}

export async function fetchPublishedHolidayPackages() {
  try {
    const data = await api("/api/holiday-packages");
    if (data?.managed) return data.packages || [];
  } catch {
    return HOLIDAY_PACKAGES;
  }
  return HOLIDAY_PACKAGES;
}

export async function fetchHolidayPackage(slug) {
  try {
    return await api(`/api/holiday-packages/slug/${encodeURIComponent(slug)}`);
  } catch (error) {
    if (error.data?.managed) return null;
    return getHolidayPackage(slug);
  }
}

export function holidayListPromise() {
  const key = `list:${catalogVersion()}`;
  if (!requests.has(key)) requests.set(key, fetchPublishedHolidayPackages());
  return requests.get(key);
}

export function holidayPackagePromise(slug) {
  const key = `slug:${catalogVersion()}:${slug}`;
  if (!requests.has(key)) requests.set(key, fetchHolidayPackage(slug));
  return requests.get(key);
}

export function listHolidayPackages() {
  return HOLIDAY_PACKAGES;
}

export function getHolidayPackage(slug) {
  return HOLIDAY_PACKAGES.find((item) => item.slug === slug) || null;
}

export const mockHolidayCatalog = {
  name: "mock",
  async list() {
    return listHolidayPackages();
  },
  async getBySlug(slug) {
    return getHolidayPackage(slug);
  },
};

export const holidayCatalog = {
  provider: {
    name: "api",
    list: fetchPublishedHolidayPackages,
    getBySlug: fetchHolidayPackage,
  },

  async list() {
    return this.provider.list();
  },

  async getBySlug(slug) {
    return this.provider.getBySlug(slug);
  },
};
