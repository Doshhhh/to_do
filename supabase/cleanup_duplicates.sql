-- Удаление дублирующихся категорий и их подкатегорий
-- Для каждого пользователя оставляет только одну категорию с каждым именем (самую старую)

-- 1. Удалить подкатегории, привязанные к дублирующимся категориям
DELETE FROM subcategories
WHERE category_id IN (
  SELECT c.id
  FROM categories c
  INNER JOIN (
    SELECT user_id, name, MIN(created_at) AS first_created
    FROM categories
    GROUP BY user_id, name
  ) keep ON c.user_id = keep.user_id AND c.name = keep.name
  WHERE c.created_at > keep.first_created
);

-- 2. Удалить дублирующиеся категории (оставить самую раннюю по created_at)
DELETE FROM categories
WHERE id IN (
  SELECT c.id
  FROM categories c
  INNER JOIN (
    SELECT user_id, name, MIN(created_at) AS first_created
    FROM categories
    GROUP BY user_id, name
  ) keep ON c.user_id = keep.user_id AND c.name = keep.name
  WHERE c.created_at > keep.first_created
);
