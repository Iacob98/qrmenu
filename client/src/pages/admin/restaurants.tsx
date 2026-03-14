import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminLayout } from "./layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface RestaurantRow {
  id: string;
  name: string;
  city: string | null;
  aiProvider: string | null;
  aiModel: string | null;
  language: string;
  createdAt: string;
  ownerEmail: string | null;
  ownerName: string | null;
  userId: string;
  categoryCount: number;
  dishCount: number;
  tokenUsage: number;
}

interface RestaurantsResponse {
  restaurants: RestaurantRow[];
  pagination: { page: number; total: number; pages: number };
}

export default function AdminRestaurants() {
  const [page, setPage] = useState(1);
  const [, setLocation] = useLocation();

  const { data, isLoading } = useQuery<RestaurantsResponse>({
    queryKey: ["/api/admin/restaurants", page],
    queryFn: async () => {
      const res = await fetch(`/api/admin/restaurants?page=${page}`, { credentials: "include" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || res.statusText);
      return res.json();
    },
  });

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Рестораны</h1>
            <span className="text-sm text-gray-500">Всего: {data?.pagination.total ?? "..."}</span>
          </div>

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-medium text-gray-600">Ресторан</th>
                    <th className="text-left p-3 font-medium text-gray-600">Владелец</th>
                    <th className="text-left p-3 font-medium text-gray-600">Город</th>
                    <th className="text-right p-3 font-medium text-gray-600">Категории</th>
                    <th className="text-right p-3 font-medium text-gray-600">Блюда</th>
                    <th className="text-left p-3 font-medium text-gray-600">AI</th>
                    <th className="text-right p-3 font-medium text-gray-600">Токенов</th>
                    <th className="text-right p-3 font-medium text-gray-600">Создан</th>
                    <th className="p-3" />
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? Array.from({ length: 10 }).map((_, i) => (
                        <tr key={i} className="border-b">
                          {Array.from({ length: 9 }).map((_, j) => (
                            <td key={j} className="p-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                          ))}
                        </tr>
                      ))
                    : data?.restaurants.length === 0 ? (
                        <tr><td colSpan={9} className="p-8 text-center text-gray-500">Рестораны не найдены</td></tr>
                      )
                    : data?.restaurants.map((r) => (
                        <tr key={r.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="p-3 font-medium">{r.name}</td>
                          <td className="p-3 text-gray-600 text-xs">
                            <button className="hover:underline" onClick={() => setLocation(`/admin/users/${r.userId}`)}>
                              {r.ownerEmail}
                            </button>
                          </td>
                          <td className="p-3 text-gray-500">{r.city || "—"}</td>
                          <td className="p-3 text-right">{r.categoryCount}</td>
                          <td className="p-3 text-right">{r.dishCount}</td>
                          <td className="p-3 text-gray-500 text-xs">{r.aiProvider || "openai"}{r.aiModel ? ` / ${r.aiModel.split("/").pop()}` : ""}</td>
                          <td className="p-3 text-right font-mono text-xs">{Number(r.tokenUsage).toLocaleString()}</td>
                          <td className="p-3 text-right text-gray-500 text-xs">{new Date(r.createdAt).toLocaleDateString("ru-RU")}</td>
                          <td className="p-3">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs"
                              onClick={() => setLocation(`/admin/ai-logs?restaurantId=${r.id}`)}
                            >
                              Логи
                            </Button>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {data && data.pagination.pages > 1 && (
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Назад</Button>
              <span className="text-sm text-gray-600 py-2">{page} / {data.pagination.pages}</span>
              <Button variant="outline" size="sm" disabled={page >= data.pagination.pages} onClick={() => setPage((p) => p + 1)}>Вперёд</Button>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
