import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminLayout } from "./layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, Shield, ShieldOff, ChevronRight } from "lucide-react";

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
  emailVerified: boolean;
  onboarded: boolean;
  createdAt: string;
  restaurantCount: number;
  totalTokens: number;
  aiRequestCount: number;
}

interface UsersResponse {
  users: UserRow[];
  pagination: { page: number; total: number; pages: number };
}

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery<UsersResponse>({
    queryKey: ["/api/admin/users", page, search],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users?page=${page}&search=${encodeURIComponent(search)}`, { credentials: "include" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || res.statusText);
      return res.json();
    },
  });

  const toggleAdmin = useMutation({
    mutationFn: ({ id, isAdmin }: { id: string; isAdmin: boolean }) =>
      apiRequest("PATCH", `/api/admin/users/${id}`, { isAdmin }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "Обновлено" });
    },
    onError: (e: Error) => toast({ title: "Ошибка", description: e.message, variant: "destructive" }),
  });

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Пользователи</h1>
            <span className="text-sm text-gray-500">Всего: {data?.pagination.total ?? "..."}</span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Поиск по email или имени..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-medium text-gray-600">Email</th>
                    <th className="text-left p-3 font-medium text-gray-600">Имя</th>
                    <th className="text-right p-3 font-medium text-gray-600">Рестораны</th>
                    <th className="text-right p-3 font-medium text-gray-600">Токенов</th>
                    <th className="text-right p-3 font-medium text-gray-600">AI запросов</th>
                    <th className="text-center p-3 font-medium text-gray-600">Статус</th>
                    <th className="text-right p-3 font-medium text-gray-600">Дата</th>
                    <th className="p-3" />
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? Array.from({ length: 10 }).map((_, i) => (
                        <tr key={i} className="border-b">
                          {Array.from({ length: 8 }).map((_, j) => (
                            <td key={j} className="p-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                          ))}
                        </tr>
                      ))
                    : isError ? (
                        <tr><td colSpan={8} className="p-8 text-center text-gray-500">Не удалось загрузить пользователей</td></tr>
                      )
                    : data?.users.length === 0 ? (
                        <tr><td colSpan={8} className="p-8 text-center text-gray-500">Пользователи не найдены</td></tr>
                      )
                    : data?.users.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="p-3 font-medium">{user.email}</td>
                          <td className="p-3 text-gray-600">{user.name || "—"}</td>
                          <td className="p-3 text-right">{user.restaurantCount}</td>
                          <td className="p-3 text-right font-mono">{Number(user.totalTokens).toLocaleString()}</td>
                          <td className="p-3 text-right">{user.aiRequestCount}</td>
                          <td className="p-3 text-center">
                            <div className="flex justify-center gap-1 flex-wrap">
                              {user.isAdmin && <Badge variant="default" className="text-xs">Admin</Badge>}
                              {user.emailVerified && <Badge variant="outline" className="text-xs">Verified</Badge>}
                            </div>
                          </td>
                          <td className="p-3 text-right text-gray-500 text-xs">
                            {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1 justify-end">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2"
                                title={user.isAdmin ? "Снять admin" : "Сделать admin"}
                                onClick={() => toggleAdmin.mutate({ id: user.id, isAdmin: !user.isAdmin })}
                              >
                                {user.isAdmin ? <ShieldOff className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2"
                                onClick={() => setLocation(`/admin/users/${user.id}`)}
                              >
                                <ChevronRight className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {data && data.pagination.pages > 1 && (
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Назад
              </Button>
              <span className="text-sm text-gray-600 py-2">
                {page} / {data.pagination.pages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= data.pagination.pages} onClick={() => setPage((p) => p + 1)}>
                Вперёд
              </Button>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
