import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminLayout } from "./layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ImageIcon,
} from "lucide-react";

interface Dish {
  id: string;
  name: string;
  description: string | null;
  price: string;
  available: boolean;
  image: string | null;
  sortOrder: number;
}

interface Category {
  id: string;
  name: string;
  icon: string | null;
  sortOrder: number;
  dishes: Dish[];
}

interface RestaurantInfo {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  phone: string | null;
  currency: string;
  language: string;
  targetLanguages: string[] | null;
  logo: string | null;
  banner: string | null;
  design: any;
  aiProvider: string | null;
  aiModel: string | null;
  createdAt: string;
  userId: string;
  ownerEmail: string | null;
  ownerName: string | null;
}

interface RestaurantDetailData {
  restaurant: RestaurantInfo;
  categories: Category[];
  aiStats: { totalTokens: number; totalRequests: number };
}

export default function AdminRestaurantDetail() {
  const [, params] = useRoute("/admin/restaurants/:id");
  const [, setLocation] = useLocation();
  const id = params?.id;

  const { data, isLoading, isError } = useQuery<RestaurantDetailData>({
    queryKey: [`/api/admin/restaurants/${id}`],
    enabled: Boolean(id),
  });

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const r = data?.restaurant;

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6 max-w-4xl">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/admin/restaurants")}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Назад
            </Button>
            <h1 className="text-xl font-bold text-gray-900">
              {isLoading ? "Загрузка..." : r?.name}
            </h1>
          </div>

          {isError ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                Не удалось загрузить данные ресторана
              </CardContent>
            </Card>
          ) : isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-gray-100 rounded-lg" />
              <div className="h-48 bg-gray-100 rounded-lg" />
              <div className="h-64 bg-gray-100 rounded-lg" />
            </div>
          ) : data && r ? (
            <>
              {/* Logo & Banner */}
              {(r.logo || r.banner) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Медиа</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-4">
                    {r.logo && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Лого</p>
                        <img
                          src={r.logo}
                          alt="Logo"
                          className="h-20 w-20 object-contain rounded border"
                        />
                      </div>
                    )}
                    {r.banner && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Баннер</p>
                        <img
                          src={r.banner}
                          alt="Banner"
                          className="h-20 max-w-xs object-cover rounded border"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Restaurant info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Информация о ресторане
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Название:</span>{" "}
                    <span className="font-medium">{r.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Slug:</span>{" "}
                    <span className="font-mono text-xs">{r.slug}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Город:</span>{" "}
                    <span>{r.city || "---"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Телефон:</span>{" "}
                    <span>{r.phone || "---"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Валюта:</span>{" "}
                    <span>{r.currency}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Язык:</span>{" "}
                    <span>{r.language}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">AI провайдер:</span>{" "}
                    <span>{r.aiProvider || "openai"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">AI модель:</span>{" "}
                    <span className="text-xs">
                      {r.aiModel
                        ? r.aiModel.split("/").pop()
                        : "---"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Создан:</span>{" "}
                    <span>
                      {new Date(r.createdAt).toLocaleString("ru-RU")}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Публичное меню:</span>{" "}
                    <a
                      href={`/menu/${r.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      /menu/{r.slug}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Owner */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Владелец</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <div>
                    <span className="text-gray-500">Email:</span>{" "}
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() =>
                        setLocation(`/admin/users/${r.userId}`)
                      }
                    >
                      {r.ownerEmail}
                    </button>
                  </div>
                  <div>
                    <span className="text-gray-500">Имя:</span>{" "}
                    <span>{r.ownerName || "---"}</span>
                  </div>
                </CardContent>
              </Card>

              {/* AI Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">AI статистика</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Всего запросов:</span>{" "}
                    <span className="font-medium">
                      {data.aiStats.totalRequests}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Всего токенов:</span>{" "}
                    <span className="font-medium font-mono">
                      {data.aiStats.totalTokens.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Categories & Dishes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Меню ({data.categories.length}{" "}
                    {data.categories.length === 1 ? "категория" : "категорий"},{" "}
                    {data.categories.reduce(
                      (sum, c) => sum + c.dishes.length,
                      0
                    )}{" "}
                    блюд)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {data.categories.length === 0 ? (
                    <p className="p-4 text-sm text-gray-500">
                      Нет категорий
                    </p>
                  ) : (
                    <div className="divide-y">
                      {data.categories.map((cat) => {
                        const isOpen = expandedCategories.has(cat.id);
                        return (
                          <div key={cat.id}>
                            <button
                              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors text-left"
                              onClick={() => toggleCategory(cat.id)}
                            >
                              <div className="flex items-center gap-2">
                                {isOpen ? (
                                  <ChevronDown className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-gray-400" />
                                )}
                                {cat.icon && (
                                  <span className="text-base">
                                    {cat.icon}
                                  </span>
                                )}
                                <span className="font-medium text-sm">
                                  {cat.name}
                                </span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {cat.dishes.length} блюд
                              </Badge>
                            </button>
                            {isOpen && (
                              <div className="bg-gray-50/50 divide-y">
                                {cat.dishes.length === 0 ? (
                                  <p className="px-8 py-3 text-xs text-gray-400">
                                    Нет блюд в категории
                                  </p>
                                ) : (
                                  cat.dishes.map((dish) => (
                                    <div
                                      key={dish.id}
                                      className="flex items-start gap-3 px-8 py-3"
                                    >
                                      {dish.image ? (
                                        <img
                                          src={dish.image}
                                          alt={dish.name}
                                          className="w-12 h-12 object-cover rounded flex-shrink-0"
                                        />
                                      ) : (
                                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                                          <ImageIcon className="h-4 w-4 text-gray-300" />
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium truncate">
                                            {dish.name}
                                          </span>
                                          {!dish.available && (
                                            <Badge
                                              variant="secondary"
                                              className="text-[10px] px-1.5"
                                            >
                                              Недоступно
                                            </Badge>
                                          )}
                                        </div>
                                        {dish.description && (
                                          <p className="text-xs text-gray-500 truncate mt-0.5">
                                            {dish.description}
                                          </p>
                                        )}
                                      </div>
                                      <span className="text-sm font-mono font-medium text-gray-700 flex-shrink-0">
                                        {Number(dish.price).toLocaleString()}{" "}
                                        {r.currency}
                                      </span>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
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
