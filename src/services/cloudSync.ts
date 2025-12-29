import { StorageService } from "./storage";

const API_BASE = "https://dickhelper-api.nayukicqc.workers.dev";
const TOKEN_KEY = "dh_token";

/* ========== token ========== */
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/* ========== auth ========== */
export async function register(username: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error(await res.text());

  const data = (await res.json()) as { ok: true; token: string };
  setToken(data.token);
  return data;
}

/* ========== sync ========== */

// 本地 -> 云端
export async function pushToCloud() {
  const token = getToken();
  if (!token) throw new Error("NOT_LOGGED_IN");

  const json = StorageService.exportData(); // 已经是 JSON 字符串
  const data = JSON.parse(json);

  const res = await fetch(`${API_BASE}/api/sync/push`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      data,
      updatedAt: Date.now(),
    }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// 云端 -> 本地（覆盖）
export async function pullFromCloud() {
  const token = getToken();
  if (!token) throw new Error("NOT_LOGGED_IN");

  const res = await fetch(`${API_BASE}/api/sync/pull`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error(await res.text());

  const result = (await res.json()) as {
    ok: true;
    data: any[];
  };

  // 用 storage.ts 自带的导入
  StorageService.importData(JSON.stringify(result.data));

  return result;
}