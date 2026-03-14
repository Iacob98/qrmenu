import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminLayout } from "./layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

interface LogRow {
  id: string;
  requestType: string;
  model: string | null;
  provider: string | null;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  success: boolean;
  errorMessage: string | null;
  createdAt: string;
  userEmail: string | null;
  restaurantName: string | null;
  userId: string;
  restaurantId: string | null;
  estimatedCost: number | null;
}

interface LogsResponse {
  logs: LogRow[];
  pagination: { page: number; total: number; pages: number };
}

const REQUEST_TYPES = ["analyze-text", "analyze-pdf", "analyze-photo", "generate-image", "improve-description", "translate"];

export default function AdminAiLogs() {
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState("");
  const [, setLocation] = useLocation();

  // Initialize restaurantId from URL, then manage in React state
  const [restaurantId, setRestaurantId] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("restaurantId") || "";
    }
    return "";
  });

  const { data, isLoading } = useQuery<LogsResponse>({
    queryKey: ["/api/admin/ai-logs", page, filterType, restaurantId],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page) });
      if (filterType) params.set("requestType", filterType);
      if (restaurantId) params.set("restaurantId", restaurantId);
      const res = await fetch(`/api/admin/ai-logs?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || res.statusText);
      return res.json();
    },
  });

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">AI логи</h1>
              {restaurantId && (
                <Badge variant="outline" className="cursor-pointer" onClick={() => setRestaurantId("")}>
                  Ресторан: {data?.logs[0]?.restaurantName || restaurantId} ✕
                </Badge>
              )}
            </div>
            <span className="text-sm text-gray-500">Всего: {data?.pagination.total ?? "..."}</span>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={filterType === "" ? "default" : "outline"}
              onClick={() => { setFilterType(""); setPage(1); }}
            >
              Все
            </Button>
            {REQUEST_TYPES.map((t) => (
              <Button
                key={t}
                size="sm"
                variant={filterType === t ? "default" : "outline"}
                onClick={() => { setFilterType(t); setPage(1); }}
              >
                {t}
              </Button>
            ))}
          </div>

          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-medium text-gray-600">Тип</th>
                    <th className="text-left p-3 font-medium text-gray-600">Пользователь</th>
                    <th className="text-left p-3 font-medium text-gray-600">Ресторан</th>
                    <th className="text-left p-3 font-medium text-gray-600">Модель</th>
                    <th className="text-right p-3 font-medium text-gray-600">Prompt</th>
                    <th className="text-right p-3 font-medium text-gray-600">Completion</th>
                    <th className="text-right p-3 font-medium text-gray-600">Total</th>
                    <th className="text-right p-3 font-medium text-gray-600">Цена</th>
                    <th className="text-center p-3 font-medium text-gray-600">OK</th>
                    <th className="text-right p-3 font-medium text-gray-600">Время</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? Array.from({ length: 15 }).map((_, i) => (
                        <tr key={i} className="border-b">
                          {Array.from({ length: 10 }).map((_, j) => (
                            <td key={j} className="p-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                          ))}
                        </tr>
                      ))
                    : data?.logs.length === 0 ? (
                        <tr><td colSpan={10} className="p-8 text-center text-gray-500">AI логи не найдены</td></tr>
                      )
                    : data?.logs.map((log) => (
                        <tr key={log.id} className={`border-b hover:bg-gray-50 transition-colors ${!log.success ? "bg-red-50" : ""}`}>
                          <td className="p-3 font-mono text-xs">{log.requestType}</td>
                          <td className="p-3 text-xs">
                            <button className="hover:underline text-blue-600" onClick={() => setLocation(`/admin/users/${log.userId}`)}>
                              {log.userEmail || "—"}
                            </button>
                          </td>
                          <td className="p-3 text-gray-600 text-xs">{log.restaurantName || "—"}</td>
                          <td className="p-3 text-gray-500 text-xs">{log.model || log.provider || "—"}</td>
                          <td className="p-3 text-right font-mono text-xs">{Number(log.promptTokens).toLocaleString()}</td>
                          <td className="p-3 text-right font-mono text-xs">{Number(log.completionTokens).toLocaleString()}</td>
                          <td className="p-3 text-right font-mono text-xs font-medium">{Number(log.totalTokens).toLocaleString()}</td>
                          <td className="p-3 text-right font-mono text-xs text-green-600">{log.estimatedCost != null ? `$${log.estimatedCost.toFixed(4)}` : "—"}</td>
                          <td className="p-3 text-center">
                            {log.success
                              ? <CheckCircle className="inline h-3.5 w-3.5 text-green-500" />
                              : <span title={log.errorMessage || ""}><XCircle className="inline h-3.5 w-3.5 text-red-400" /></span>}
                          </td>
                          <td className="p-3 text-right text-gray-500 text-xs">{new Date(log.createdAt).toLocaleString("ru-RU")}</td>
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
