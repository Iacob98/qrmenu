import { useQuery } from "@tanstack/react-query";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminLayout } from "./layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UtensilsCrossed, Zap, TrendingUp, Cpu } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface Stats {
  totals: {
    users: number;
    restaurants: number;
    dishes: number;
    aiRequests: number;
    tokens: number;
  };
  tokensByType: { requestType: string; count: number; totalTokens: number }[];
  newUsersDaily: { date: string; count: number }[];
  aiRequestsDaily: { date: string; count: number; tokens: number }[];
}

function StatCard({ title, value, icon: Icon, sub }: { title: string; value: string | number; icon: React.ElementType; sub?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{typeof value === "number" ? value.toLocaleString() : value}</div>
        {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading, isError } = useQuery<Stats>({ queryKey: ["/api/admin/stats"] });

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Обзор платформы</h1>

          {isError ? (
            <Card><CardContent className="py-8 text-center text-gray-500">Не удалось загрузить статистику</CardContent></Card>
          ) : isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}><CardContent className="pt-6"><div className="h-8 bg-gray-200 rounded animate-pulse" /></CardContent></Card>
              ))}
            </div>
          ) : stats ? (
            <>
              {/* Stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard title="Пользователи" value={stats.totals.users} icon={Users} />
                <StatCard title="Рестораны" value={stats.totals.restaurants} icon={UtensilsCrossed} />
                <StatCard title="Блюда" value={stats.totals.dishes} icon={TrendingUp} />
                <StatCard title="AI запросов" value={stats.totals.aiRequests} icon={Zap} />
                <StatCard title="Всего токенов" value={stats.totals.tokens.toLocaleString()} icon={Cpu} sub="за всё время" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* New users chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Новые пользователи (30 дней)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={stats.newUsersDaily}>
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                        <Tooltip labelFormatter={(v) => `Дата: ${v}`} formatter={(v: number) => [v, "Новых"]} />
                        <Bar dataKey="count" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* AI requests chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">AI запросы — токены (30 дней)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={stats.aiRequestsDaily}>
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip labelFormatter={(v) => `Дата: ${v}`} formatter={(v: number) => [v.toLocaleString(), "Токенов"]} />
                        <Line type="monotone" dataKey="tokens" stroke="#8b5cf6" dot={false} strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Tokens by type */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Использование токенов по типу запроса</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.tokensByType.map((item) => (
                      <div key={item.requestType} className="flex items-center gap-3">
                        <span className="w-40 text-sm text-gray-600 shrink-0">{item.requestType}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{
                              width: `${Math.min(100, (item.totalTokens / (stats.totals.tokens || 1)) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-24 text-right">{Number(item.totalTokens).toLocaleString()}</span>
                        <span className="text-xs text-gray-400 w-16 text-right">{item.count} req</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
