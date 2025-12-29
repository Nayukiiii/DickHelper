import React, { useMemo, useState } from "react";
import {
  clearToken,
  isLoggedIn,
  login,
  pullFromCloud,
  pushToCloud,
  register,
} from "../services/cloudSync";

type Props = {
  // 可选：同步完成后刷新页面/列表用
  onAfterSync?: () => void;
};

export default function SyncPanel({ onAfterSync }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const loggedIn = useMemo(() => isLoggedIn(), [msg]); // 简单触发刷新

  async function run(fn: () => Promise<any>) {
    try {
      setBusy(true);
      setMsg("");
      const r = await fn();
      setMsg(`OK`);
      return r;
    } catch (e: any) {
      setMsg(`ERROR: ${String(e?.message || e)}`);
      throw e;
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, maxWidth: 420 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>云同步</div>

      <div style={{ display: "grid", gap: 8 }}>
        <input
          placeholder="用户名（建议英文/数字）"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={busy}
          style={{ padding: 8 }}
        />
        <input
          placeholder="密码"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={busy}
          style={{ padding: 8 }}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            disabled={busy || !username || !password}
            onClick={() => run(() => register(username, password))}
          >
            注册
          </button>
          <button
            disabled={busy || !username || !password}
            onClick={() =>
              run(async () => {
                await login(username, password);
                setMsg("OK: 已登录");
              })
            }
          >
            登录
          </button>

          <button
            disabled={busy || !loggedIn}
            onClick={() =>
              run(async () => {
                await pushToCloud();
                setMsg("OK: 已上传到云端");
              })
            }
          >
            上传（Push）
          </button>

          <button
            disabled={busy || !loggedIn}
            onClick={() =>
              run(async () => {
                await pullFromCloud();
                setMsg("OK: 已从云端下载并覆盖本地");
                onAfterSync?.();
              })
            }
          >
            下载（Pull）
          </button>

          <button
            disabled={busy || !loggedIn}
            onClick={() => {
              clearToken();
              setMsg("已退出登录（本地 token 已清除）");
            }}
          >
            退出
          </button>
        </div>

        {msg ? (
          <div style={{ marginTop: 8, whiteSpace: "pre-wrap", fontSize: 12, opacity: 0.85 }}>
            {msg}
          </div>
        ) : null}

        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
          说明：上传会把本地记录整包覆盖云端；下载会用云端整包覆盖本地。
        </div>
      </div>
    </div>
  );
}