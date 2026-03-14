import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminLayout } from "./layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface FeedbackRow {
  id: string;
  type: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  email: string | null;
  createdAt: string;
  userEmail: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-600",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export default function AdminFeedback() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ feedback: FeedbackRow[] }>({
    queryKey: ["/api/admin/feedback"],
  });

  const update = useMutation({
    mutationFn: ({ id, status, priority }: { id: string; status?: string; priority?: string }) =>
      apiRequest("PATCH", `/api/admin/feedback/${id}`, { status, priority }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/feedback"] });
      toast({ title: "Обновлено" });
    },
    onError: (e: Error) => toast({ title: "Ошибка", description: e.message, variant: "destructive" }),
  });

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Обратная связь</h1>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {data?.feedback.map((fb) => (
                <Card key={fb.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpanded(expanded === fb.id ? null : fb.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{fb.title}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[fb.priority] || ""}`}>{fb.priority}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[fb.status] || ""}`}>{fb.status}</span>
                            <Badge variant="outline" className="text-xs">{fb.type}</Badge>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {fb.userEmail || fb.email || "Аноним"} · {new Date(fb.createdAt).toLocaleString("ru-RU")}
                          </div>
                        </div>
                      </div>
                    </div>

                    {expanded === fb.id && (
                      <div className="px-4 pb-4 border-t bg-gray-50">
                        <p className="text-sm text-gray-700 mt-3 whitespace-pre-wrap">{fb.description}</p>

                        <div className="flex gap-2 mt-4 flex-wrap">
                          <span className="text-xs text-gray-500 self-center">Статус:</span>
                          {["open", "in_progress", "resolved", "closed"].map((s) => (
                            <Button
                              key={s}
                              size="sm"
                              variant={fb.status === s ? "default" : "outline"}
                              className="h-7 text-xs"
                              onClick={() => update.mutate({ id: fb.id, status: s })}
                            >
                              {s}
                            </Button>
                          ))}
                          <span className="text-xs text-gray-500 self-center ml-2">Приоритет:</span>
                          {["low", "medium", "high", "critical"].map((p) => (
                            <Button
                              key={p}
                              size="sm"
                              variant={fb.priority === p ? "default" : "outline"}
                              className="h-7 text-xs"
                              onClick={() => update.mutate({ id: fb.id, priority: p })}
                            >
                              {p}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
