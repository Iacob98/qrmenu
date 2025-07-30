import { cn } from "@/lib/utils";
import { Utensils, Palette, Settings, Bot, QrCode } from "lucide-react";
import { useLocation } from "wouter";

const navigation = [
  { name: "Меню", href: "/dashboard", icon: Utensils },
  { name: "Дизайн", href: "/dashboard/design", icon: Palette },
  { name: "Настройки", href: "/dashboard/settings", icon: Settings },
  { name: "ИИ", href: "/dashboard/ai", icon: Bot },
  { name: "QR и Ссылки", href: "/dashboard/qr", icon: QrCode },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-sm h-screen sticky top-0">
      <div className="p-6 border-b">
        <div className="flex items-center">
          <Utensils className="text-primary-600 text-xl mr-3" />
          <span className="font-bold text-lg">QRMenu</span>
        </div>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
            return (
              <li key={item.name}>
                <a
                  href={item.href}
                  className={cn(
                    "flex items-center p-3 rounded-lg transition-colors",
                    isActive
                      ? "text-primary-600 bg-primary-50"
                      : "text-gray-600 hover:text-primary-600 hover:bg-gray-50"
                  )}
                >
                  <item.icon className="mr-3" size={20} />
                  {item.name}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
