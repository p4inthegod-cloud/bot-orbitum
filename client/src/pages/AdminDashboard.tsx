import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Send, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading } = trpc.admin.stats.useQuery();

  if (isLoading) {
    return <div className="p-8">Загрузка...</div>;
  }

  const statCards = [
    {
      title: "Всего пользователей",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Бесплатные пользователи",
      value: stats?.freeUsers || 0,
      icon: Users,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Premium пользователи",
      value: stats?.premiumUsers || 0,
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Материалов в курсе",
      value: stats?.totalMaterials || 0,
      icon: BookOpen,
      color: "bg-orange-100 text-orange-600",
    },
    {
      title: "Отправлено рассылок",
      value: stats?.totalBroadcasts || 0,
      icon: Send,
      color: "bg-pink-100 text-pink-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Панель управления</h1>
        <p className="text-muted-foreground mt-2">Добро пожаловать в админ-панель бота</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
            <CardDescription>Управление контентом и рассылками</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="/admin/users"
              className="block p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="font-medium">Управление пользователями</div>
              <div className="text-sm text-muted-foreground">Просмотр и управление подписками</div>
            </a>
            <a
              href="/admin/broadcasts"
              className="block p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="font-medium">Отправить рассылку</div>
              <div className="text-sm text-muted-foreground">Создать и отправить сообщение</div>
            </a>
            <a
              href="/admin/materials"
              className="block p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="font-medium">Управление материалами</div>
              <div className="text-sm text-muted-foreground">Добавить или отредактировать уроки</div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Информация</CardTitle>
            <CardDescription>О боте и системе</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <div className="font-medium">Структура курса</div>
              <div className="text-muted-foreground">13 уроков по трейдингу</div>
            </div>
            <div>
              <div className="font-medium">Доступ</div>
              <div className="text-muted-foreground">Первые 3 урока бесплатно, остальное за подписку</div>
            </div>
            <div>
              <div className="font-medium">Платформа</div>
              <div className="text-muted-foreground">Telegram Bot + Web Admin Panel</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
