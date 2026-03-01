-- Сначала удаляем дубликаты подкатегорий (оставляем самую раннюю)
DELETE FROM subcategories
WHERE id NOT IN (
  SELECT DISTINCT ON (category_id, name) id
  FROM subcategories
  ORDER BY category_id, name, created_at ASC
);

-- Удаляем дубликаты категорий (сначала подкатегории дубликатов)
DELETE FROM subcategories
WHERE category_id IN (
  SELECT id FROM categories
  WHERE id NOT IN (
    SELECT DISTINCT ON (user_id, name) id
    FROM categories
    ORDER BY user_id, name, created_at ASC
  )
);

DELETE FROM categories
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, name) id
  FROM categories
  ORDER BY user_id, name, created_at ASC
);

-- Добавляем unique constraints
ALTER TABLE categories ADD CONSTRAINT unique_user_category UNIQUE (user_id, name);
ALTER TABLE subcategories ADD CONSTRAINT unique_user_subcategory UNIQUE (category_id, name);
