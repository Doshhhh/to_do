-- Добавление категории "Хобби" и подкатегорий всем существующим пользователям
-- sort_order = 2 (между Учёба=1 и Личное, которое сдвигается на 3)

-- Шаг 1: Сдвигаем sort_order для категорий, которые идут после Учёбы (sort_order >= 2)
UPDATE categories
SET sort_order = sort_order + 1
WHERE sort_order >= 2;

-- Шаг 2: Вставляем "Хобби" для каждого пользователя, у которого её ещё нет
INSERT INTO categories (user_id, name, icon, color_light, color_dark, sort_order)
SELECT DISTINCT c.user_id, 'Хобби', 'Palette', '#9B7653', '#B08D6A', 2
FROM categories c
WHERE NOT EXISTS (
  SELECT 1 FROM categories c2
  WHERE c2.user_id = c.user_id AND c2.name = 'Хобби'
);

-- Шаг 3: Вставляем подкатегории для каждой новой категории "Хобби"
INSERT INTO subcategories (category_id, user_id, name, icon, sort_order)
SELECT c.id, c.user_id, sub.name, sub.icon, sub.sort_order
FROM categories c
CROSS JOIN (
  VALUES
    ('Программирование', 'Code', 0),
    ('Музыка', 'Music', 1),
    ('Другое', 'MoreHorizontal', 2)
) AS sub(name, icon, sort_order)
WHERE c.name = 'Хобби'
  AND NOT EXISTS (
    SELECT 1 FROM subcategories s
    WHERE s.category_id = c.id AND s.name = sub.name
  );
