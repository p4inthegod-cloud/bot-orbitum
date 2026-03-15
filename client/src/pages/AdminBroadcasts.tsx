import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { toast } from "sonner";
import { Send, Users, CheckCircle2 } from "lucide-react";

export default function AdminBroadcasts() {
  const { data: broadcasts, isLoading, refetch } = trpc.admin.broadcasts.useQuery();
  const createBroadcast = trpc.admin.createBroadcast.useMutation();
  const sendBroadcast = trpc.admin.sendBroadcast.useMutation();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetUsers, setTargetUsers] = useState<"all" | "free" | "premium" | "specific">("all");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) { toast.error("Заполните все поля"); return; }
    setIsCreating(true);
    try {
      await createBroadcast.mutateAsync({ title, content, targetUsers });
      toast.success("Рассылка создана");
      setTitle(""); setContent(""); setTargetUsers("all");
      refetch();
    } catch { toast.error("Ошибка при создании рассылки"); }
    finally { setIsCreating(false); }
  };

  const handleSend = async (broadcastId: number) => {
    try {
      const result = await sendBroadcast.mutateAsync({ broadcastId });
      toast.success(`Отправлено: ${result.sent} из ${result.total} пользователей`);
      refetch();
    } catch { toast.error("Ошибка при отправке"); }
  };

  const targetLabel = (t: string) => ({
    all: "Все", free: "Бесплатные", premium: "Premium", specific: "Конкретные",
  }[t] ?? t);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Рассылки</h1>
        <p className="text-muted-foreground mt-2">Создание и отправка сообщений в Telegram</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Новая рассылка</CardTitle>
          <CardDescription>Сообщение будет отправлено выбранной аудитории в Telegram</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Заголовок (для внутреннего учёта)</label>
            <Input placeholder="Название рассылки" value={title} onChange={e => setTitle(e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Текст сообщения (поддерживает Markdown)</label>
            <Textarea placeholder="Текст сообщения..." value={content} onChange={e => setContent(e.target.value)} className="mt-1 min-h-32 font-mono text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium">Аудитория</label>
            <Select value={targetUsers} onValueChange={v => setTargetUsers(v as any)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все пользователи</SelectItem>
                <SelectItem value="free">Только бесплатные</SelectItem>
                <SelectItem value="premium">Только Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleCreate} disabled={isCreating} className="w-full">
            <Send className="mr-2 h-4 w-4" />
            {isCreating ? "Создание..." : "Создать рассылку"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>История рассылок</CardTitle>
          <CardDescription>{broadcasts?.length ?? 0} рассылок всего</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Загрузка...</div>
          ) : broadcasts && broadcasts.length > 0 ? (
            <div className="space-y-3">
              {broadcasts.map(b => (
                <div key={b.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-medium truncate">{b.title}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{b.content}</p>
                    </div>
                    <Badge variant={b.status === "sent" ? "default" : "secondary"} className="shrink-0">
                      {b.status === "sent" ? "Отправлена" : "Черновик"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {targetLabel(b.targetUsers ?? "all")}
                      </span>
                      {b.status === "sent" && b.successCount !== null && (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="h-3 w-3" /> {b.successCount} доставлено
                        </span>
                      )}
                      <span>{format(new Date(b.createdAt), "dd MMM yyyy HH:mm", { locale: ru })}</span>
                    </div>
                    {b.status === "draft" && (
                      <Button size="sm" onClick={() => handleSend(b.id)} disabled={sendBroadcast.isPending}>
                        <Send className="mr-1 h-3 w-3" /> Отправить
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">Нет рассылок</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
