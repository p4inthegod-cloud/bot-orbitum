import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";

export default function AdminMaterials() {
  // Placeholder for materials management
  // In production, this would connect to tRPC procedures for CRUD operations

  const lessons = [
    {
      id: 1,
      number: 1,
      title: "Вступление и риск-менеджмент",
      materialsCount: 7,
      freeCount: 3,
    },
    {
      id: 2,
      number: 2,
      title: "Постоянство в трейдинге",
      materialsCount: 8,
      freeCount: 0,
    },
    {
      id: 3,
      number: 3,
      title: "Трендовая структура (часть 1)",
      materialsCount: 5,
      freeCount: 0,
    },
    {
      id: 4,
      number: 4,
      title: "Трендовая структура (часть 2)",
      materialsCount: 6,
      freeCount: 0,
    },
    {
      id: 5,
      number: 5,
      title: "Ликвидность (часть 1)",
      materialsCount: 4,
      freeCount: 0,
    },
    {
      id: 6,
      number: 6,
      title: "Ликвидность (часть 2)",
      materialsCount: 4,
      freeCount: 0,
    },
    {
      id: 7,
      number: 7,
      title: "Точки интереса (часть 1)",
      materialsCount: 3,
      freeCount: 0,
    },
    {
      id: 8,
      number: 8,
      title: "Точки интереса (часть 2)",
      materialsCount: 2,
      freeCount: 0,
    },
    {
      id: 9,
      number: 9,
      title: "Ренджи (часть 1)",
      materialsCount: 2,
      freeCount: 0,
    },
    {
      id: 10,
      number: 10,
      title: "Ренджи (часть 2)",
      materialsCount: 1,
      freeCount: 0,
    },
    {
      id: 11,
      number: 11,
      title: "SMT (Smart Money Concepts)",
      materialsCount: 1,
      freeCount: 0,
    },
    {
      id: 12,
      number: 12,
      title: "Торговые сессии",
      materialsCount: 1,
      freeCount: 0,
    },
    {
      id: 13,
      number: 13,
      title: "Проп-трейдинговые компании",
      materialsCount: 2,
      freeCount: 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Материалы обучения</h1>
        <p className="text-muted-foreground mt-2">13 уроков по трейдингу</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Структура курса</CardTitle>
          <CardDescription>Все уроки и материалы</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-2 rounded">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Урок {lesson.number}</h3>
                      <p className="text-sm text-muted-foreground">{lesson.title}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground">
                    {lesson.materialsCount} материалов
                    {lesson.freeCount > 0 && ` (${lesson.freeCount} бесплатно)`}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">Активен</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Информация</CardTitle>
          <CardDescription>О структуре доступа</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <div className="font-medium">Бесплатный доступ</div>
            <div className="text-muted-foreground">
              Первые 3 урока полностью доступны. Остальные материалы требуют подписку.
            </div>
          </div>
          <div>
            <div className="font-medium">Управление доступом</div>
            <div className="text-muted-foreground">
              Для изменения доступа к материалам свяжитесь с разработчиком.
            </div>
          </div>
          <div>
            <div className="font-medium">Всего материалов</div>
            <div className="text-muted-foreground">
              {lessons.reduce((sum, l) => sum + l.materialsCount, 0)} материалов в курсе
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
