import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { toast } from "sonner";
import { useState } from "react";

export default function AdminUsers() {
  const { data: users, isLoading, refetch } = trpc.admin.users.useQuery();
  const setSubscription = trpc.admin.setSubscription.useMutation();
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const handleStatusChange = async (telegramId: number, status: "free" | "premium" | "trial") => {
    setLoadingId(telegramId);
    try {
      await setSubscription.mutateAsync({ telegramId, status });
      toast.success("Статус обновлён");
      refetch();
    } catch {
      toast.error("Ошибка обновления статуса");
    } finally {
      setLoadingId(null);
    }
  };

  const getSubscriptionBadge = (status: string) => {
    switch (status) {
      case "premium": return <Badge className="bg-purple-100 text-purple-800">Premium</Badge>;
      case "trial":   return <Badge className="bg-blue-100 text-blue-800">Пробный</Badge>;
      default:        return <Badge className="bg-gray-100 text-gray-800">Бесплатно</Badge>;
    }
  };

  if (isLoading) return <div className="p-8 text-muted-foreground">Загрузка...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Пользователи</h1>
        <p className="text-muted-foreground mt-1">Всего: {users?.length || 0}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Подписчики бота</CardTitle>
          <CardDescription>Управление подписками пользователей</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-3 font-medium">Telegram ID</th>
                  <th className="text-left py-3 px-3 font-medium">Имя</th>
                  <th className="text-left py-3 px-3 font-medium">Username</th>
                  <th className="text-left py-3 px-3 font-medium">Статус</th>
                  <th className="text-left py-3 px-3 font-medium">Присоединился</th>
                  <th className="text-left py-3 px-3 font-medium">Действие</th>
                </tr>
              </thead>
              <tbody>
                {users && users.length > 0 ? users.map(user => (
                  <tr key={user.telegramId} className="border-b hover:bg-muted/40">
                    <td className="py-3 px-3 font-mono text-xs">{user.telegramId}</td>
                    <td className="py-3 px-3">{[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}</td>
                    <td className="py-3 px-3">{user.username ? `@${user.username}` : "—"}</td>
                    <td className="py-3 px-3">{getSubscriptionBadge(user.subscriptionStatus || "free")}</td>
                    <td className="py-3 px-3 text-xs text-muted-foreground">
                      {format(new Date(user.createdAt), "dd MMM yyyy", { locale: ru })}
                    </td>
                    <td className="py-3 px-3">
                      <Select
                        value={user.subscriptionStatus || "free"}
                        onValueChange={(v) => handleStatusChange(user.telegramId, v as any)}
                        disabled={loadingId === user.telegramId}
                      >
                        <SelectTrigger className="h-7 w-32 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Бесплатно</SelectItem>
                          <SelectItem value="trial">Пробный</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">Пользователей пока нет</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
