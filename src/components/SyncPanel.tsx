import { useMemo, useState } from "react";
import { Box, Button, TextField, Typography, Stack } from "@mui/material";

import {
  register,
  login,
  pushToCloud,
  pullFromCloud,
} from "../services/cloudSync";

type Props = {
  onAfterSync?: () => void;
};

const TOKEN_KEY = "dh_token";

export default function SyncPanel({ onAfterSync }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>("");

  // 完全不依赖 cloudSync.ts
  const loggedIn = useMemo(
    () => !!localStorage.getItem(TOKEN_KEY),
    [message]
  );

  async function run(action: () => Promise<any>, successMsg: string) {
    try {
      setBusy(true);
      setMessage("");
      await action();
      setMessage(successMsg);
    } catch (e: any) {
      setMessage(`ERROR: ${String(e?.message || e)}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" sx={{ mb: 1 }}>
        云同步 / 登录
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          size="small"
          disabled={busy}
          fullWidth
        />

        <TextField
          label="密码"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          size="small"
          disabled={busy}
          fullWidth
        />

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button
            variant="outlined"
            disabled={busy || !username || !password}
            onClick={() =>
              run(() => register(username, password), "注册成功")
            }
          >
            注册
          </Button>

          <Button
            variant="contained"
            disabled={busy || !username || !password}
            onClick={() =>
              run(() => login(username, password), "登录成功")
            }
          >
            登录
          </Button>

          <Button
            variant="contained"
            color="success"
            disabled={busy || !loggedIn}
            onClick={() =>
              run(() => pushToCloud(), "已上传到云端")
            }
          >
            上传（Push）
          </Button>

          <Button
            variant="contained"
            color="info"
            disabled={busy || !loggedIn}
            onClick={() =>
              run(async () => {
                await pullFromCloud();
                onAfterSync?.();
              }, "已从云端下载")
            }
          >
            下载（Pull）
          </Button>

          <Button
            variant="outlined"
            color="error"
            disabled={busy || !loggedIn}
            onClick={() => {
              localStorage.removeItem(TOKEN_KEY);
              setMessage("已退出登录");
            }}
          >
            退出
          </Button>
        </Stack>

        {message && (
          <Typography
            variant="body2"
            sx={{ whiteSpace: "pre-wrap", opacity: 0.85 }}
          >
            {message}
          </Typography>
        )}

        <Typography variant="caption" sx={{ opacity: 0.6 }}>
          说明：上传会用本地数据覆盖云端；下载会用云端数据覆盖本地。
        </Typography>
      </Stack>
    </Box>
  );
}