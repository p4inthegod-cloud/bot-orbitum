import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Home() {
  const { user, loading } = useAuth();
  const [secret, setSecret] = useState("");
  const [isLogging, setIsLogging] = useState(false);

  const handleAdminLogin = async () => {
    if (!secret.trim()) return;
    setIsLogging(true);
    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ secret }),
      });
      if (res.ok) {
        window.location.href = "/admin";
      } else {
        toast.error("Неверный секрет");
      }
    } catch {
      toast.error("Ошибка подключения");
    } finally {
      setIsLogging(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 p-8 max-w-sm w-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Trading Funnel Bot</h1>
          <p className="text-muted-foreground mt-2 text-sm">Панель администратора</p>
        </div>

        <div className="w-full space-y-3">
          <input
            type="password"
            placeholder="Введите секретный ключ"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdminLogin()}
            className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button
            onClick={handleAdminLogin}
            disabled={isLogging || !secret.trim()}
            className="w-full"
          >
            {isLogging ? "Вход..." : "Войти в панель"}
          </Button>
        </div>
      </div>
    </div>
  );
}
