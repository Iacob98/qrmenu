import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminLayout } from "./layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";

interface UserDetail {
  user: { id: string; email: string; name: string | null; isAdmin: boolean; emailVerified: boolean; createdAt: string };
  restaurants: { id: string; name: string; city: string | null; aiProvider: string | null; categoryCount: number; dishCount: number; createdAt: string }[];
  recentLogs: { id: string; requestType: string; model: string | null; provider: string | null; totalTokens: number; success: boolean; createdAt: string }[];
  stats: { totalTokens: number; totalRequests: number };
}

export default function AdminUserDetail() {
  const [, params] = useRoute("/admin/users/:id");
  const [, setLocation] = useLocation();
  const id = params?.id;

  const { data, isLoading, isError } = useQuery<UserDetail>({
    queryKey: [`/api/admin/users/${id}`],
    enabled: Boolean(id),
  });

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6 max-w-4xl">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/admin/users")}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Назад
            </Button>
            <h1 className="text-xl font-bold text-gray-900">
              {isLoading ? "Загрузка..." : data?.user.email}
            </h1>
          </div>

          {isError ? (
            <Card><CardContent className="py-8 text-center text-gray-500">Не удалось загрузить данные пользователя</CardContent></Card>
          ) : isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-gray-100 rounded-lg" />
              <div className="h-48 bg-gray-100 rounded-lg" />
            </div>
          ) : data ? (
            <>
              {/* User info */}
              <Card>
                <CardHeader><CardTitle className="text-sm">Информация о пользователе</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-gray-500">Email:</span> <span className="font-medium">{data.user.email}</span></div>
                  <div><span className="text-gray-500">Имя:</span> <span>{data.user.name || "—"}</span></div>
                  <div>
                    <span className="text-gray-500">Email подтверждён:</span>{" "}
                    {data.user.emailVerified ? <CheckCircle className="inline h-4 w-4 text-green-500" /> : <XCircle className="inline h-4 w-4 text-red-400" />}
                  </div>
                  <div>
                    <span className="text-gray-500">Роль:</span>{" "}
                    {data.user.isAdmin ? <Badge>Admin</Badge> : <Badge variant="outline">User</Badge>}
                  </div>
                  <div><span className="text-gray-500">AI запросов:</span> <span className="font-medium">{data.stats.totalRequests}</span></div>
                  <div><span className="text-gray-500">Всего токенов:</span> <span className="font-medium font-mono">{data.stats.totalTokens.toLocaleString()}</span></div>
                  <div><span className="text-gray-500">Зарегистрирован:</span> <span>{new Date(data.user.createdAt).toLocaleString("ru-RU")}</span></div>
                </CardContent>
              </Card>

              {/* Restaurants */}
              <Card>
                <CardHeader><CardTitle className="text-sm">Рестораны ({data.restaurants.length})</CardTitle></CardHeader>
                <CardContent className="p-0">
                  {data.restaurants.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500">Нет ресторанов</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-3 font-medium text-gray-600">Название</th>
                          <th className="text-left p-3 font-medium text-gray-600">Город</th>
                          <th className="text-right p-3 font-medium text-gray-600">Категории</th>
                          <th className="text-right p-3 font-medium text-gray-600">Блюда</th>
                          <th className="text-left p-3 font-medium text-gray-600">AI</th>
                          <th className="text-right p-3 font-medium text-gray-600">Создан</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.restaurants.map((r) => (
                          <tr key={r.id} className="border-b">
                            <td className="p-3 font-medium">{r.name}</td>
                            <td className="p-3 text-gray-600">{r.city || "—"}</td>
                            <td className="p-3 text-right">{r.categoryCount}</td>
                            <td className="p-3 text-right">{r.dishCount}</td>
                            <td className="p-3 text-gray-500">{r.aiProvider || "openai"}</td>
                            <td className="p-3 text-right text-gray-500 text-xs">{new Date(r.createdAt).toLocaleDateString("ru-RU")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>

              {/* Recent AI logs */}
              <Card>
                <CardHeader><CardTitle className="text-sm">Последние AI запросы (20)</CardTitle></CardHeader>
                <CardContent className="p-0">
                  {data.recentLogs.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500">Нет запросов</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-3 font-medium text-gray-600">Тип</th>
                          <th className="text-left p-3 font-medium text-gray-600">Модель</th>
                          <th className="text-right p-3 font-medium text-gray-600">Токенов</th>
                          <th className="text-center p-3 font-medium text-gray-600">Статус</th>
                          <th className="text-right p-3 font-medium text-gray-600">Время</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.recentLogs.map((log) => (
                          <tr key={log.id} className="border-b">
                            <td className="p-3 font-mono text-xs">{log.requestType}</td>
                            <td className="p-3 text-gray-600 text-xs">{log.model || log.provider || "—"}</td>
                            <td className="p-3 text-right font-mono">{Number(log.totalTokens).toLocaleString()}</td>
                            <td className="p-3 text-center">
                              {log.success
                                ? <CheckCircle className="inline h-3.5 w-3.5 text-green-500" />
                                : <XCircle className="inline h-3.5 w-3.5 text-red-400" />}
                            </td>
                            <td className="p-3 text-right text-gray-500 text-xs">{new Date(log.createdAt).toLocaleString("ru-RU")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
