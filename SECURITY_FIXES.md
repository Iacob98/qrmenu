# Security Audit Fixes Tracker

## CRITICAL

- [x] 1. Mass Assignment — whitelist полей в PUT /api/restaurants/:id
- [x] 2. API ключи в ответах — убрать aiToken из всех API ответов
- [x] 3. API ключи в docker-compose — убрать дефолтные пароли
- [x] 4. AI токены в БД plaintext — шифрование aiToken (AES-256-GCM, env ENCRYPTION_KEY)
- [x] 5. Поиск без авторизации — auth + ownership check + query validation
- [x] 6. ILIKE инъекция + баг в searchDishes — fix column + escape wildcards
- [x] 7. XSS через QR SVG — DOMPurify санитизация
- [x] 8. XSS в print template — escapeHtml для name/url

## HIGH

- [x] 9. Session Fixation — session.regenerate() при логине и регистрации
- [ ] 10. DEFERRED: CSRF защита — требует значительных изменений клиент+сервер
- [x] 11. Нет helmet — добавить security headers
- [x] 12. SSRF через storage proxy — валидация URL, только /v1/object/public/
- [x] 13. Удаление чужих файлов — проверка владельца через restaurants/dishes
- [ ] 14. DEFERRED: WebSocket auth — требует рефактор WS handshake
- [x] 15. Mock email в проде — throw в production, не логирует токены
- [x] 16. Null dereference — проверка category перед использованием (4 места)
- [x] 17. HTML injection в email/Telegram — escapeHtml для всех user-supplied полей
- [x] 18. CORS substring match — exact origin comparison
- [x] 19. Нет валидации пароля — min 8, max 128, email validation
- [x] 20. Порты БД наружу — убраны ports для db, redis, supabase-db, kong
- [x] 21. SSL — rejectUnauthorized: true по умолчанию (opt-out через env)
- [x] 22. Open Redirect в QR — валидация протокола URL

## MEDIUM

- [x] 23. /api/init — minimal response for unauthenticated, full only for logged-in
- [x] 24. Redis KEYS команда — заменить на SCAN
- [x] 25. Лимит размера AI-запросов — max 50k chars для text analysis
- [ ] 26. DEFERRED: Per-user AI cost control — требует новую таблицу
- [x] 27. Console.log с sensitive data — убраны из routes, add-dish, edit-dish, feedback
- [ ] 28. DEFERRED: File upload magic bytes — требует file-type пакет
- [x] 29. isFavorite/isHidden/favoritesTitle — type + length validation
- [ ] 30. DEFERRED: Password change/reset — отдельная фича
- [ ] 31. DEFERRED: CSS injection preview — нужен whitelist design полей
- [x] 32. Upload — добавлены credentials: include
- [ ] 33. DEFERRED: Rate limits на feedback/restaurant — нужна конфигурация
- [x] 34. Translation cache index vs UNIQUE — сделать unique constraint
- [x] 35. window global timeout — заменён на useRef
- [x] 36. Graceful shutdown — убран SIGINT из db.ts, pool.end() в index.ts

## LOW

- [x] 37. bcrypt rounds 10 -> 12
- [x] 38. @types/* перемещены в devDependencies
- [x] 39. Добавить updatedAt на таблицы
- [x] 40. Unique constraint (categoryId, name) для dishes
- [x] 41. Session cookie переименован в qrmenu.sid
- [x] 42. queryClient.ts — парсит JSON message вместо raw text
- [x] 43. translationCache — логирование ошибок вместо silent swallow
- [x] 44. Discount поля CHECK constraint
