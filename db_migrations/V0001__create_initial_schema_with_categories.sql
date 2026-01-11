-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('customer', 'master')),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы профилей мастеров
CREATE TABLE IF NOT EXISTS masters (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
    specialty VARCHAR(255) NOT NULL,
    description TEXT,
    experience_years INTEGER,
    city VARCHAR(100) NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0.00,
    reviews_count INTEGER DEFAULT 0,
    completed_projects INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы категорий услуг
CREATE TABLE IF NOT EXISTS service_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка основных категорий услуг
INSERT INTO service_categories (name, icon, description) VALUES
    ('Кухни', 'ChefHat', 'Изготовление кухонной мебели на заказ'),
    ('Шкафы', 'DoorOpen', 'Шкафы-купе и гардеробные системы'),
    ('Столы', 'Table', 'Обеденные, письменные и журнальные столы'),
    ('Кровати', 'Bed', 'Кровати и спальные гарнитуры'),
    ('Офисная мебель', 'Briefcase', 'Мебель для офисов и рабочих пространств'),
    ('Декор', 'Palette', 'Декоративные элементы и аксессуары'),
    ('Замерщик', 'Ruler', 'Профессиональный замер помещений'),
    ('Проектировщик', 'Layout', 'Проектирование мебели и пространств'),
    ('Дизайнер', 'PenTool', 'Дизайн интерьера и мебели'),
    ('Монтажник', 'Wrench', 'Сборка и установка мебели'),
    ('Изготовитель', 'Hammer', 'Изготовление мебели из различных материалов')
ON CONFLICT (name) DO NOTHING;

-- Связь мастеров с категориями услуг (многие-ко-многим)
CREATE TABLE IF NOT EXISTS master_categories (
    master_id INTEGER NOT NULL REFERENCES masters(id),
    category_id INTEGER NOT NULL REFERENCES service_categories(id),
    PRIMARY KEY (master_id, category_id)
);

-- Создание таблицы портфолио мастеров
CREATE TABLE IF NOT EXISTS portfolio_items (
    id SERIAL PRIMARY KEY,
    master_id INTEGER NOT NULL REFERENCES masters(id),
    image_url TEXT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    category_id INTEGER REFERENCES service_categories(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы заявок
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES users(id),
    master_id INTEGER REFERENCES masters(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category_id INTEGER REFERENCES service_categories(id),
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    city VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы отзывов
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    master_id INTEGER NOT NULL REFERENCES masters(id),
    customer_id INTEGER NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для улучшения производительности
CREATE INDEX IF NOT EXISTS idx_masters_city ON masters(city);
CREATE INDEX IF NOT EXISTS idx_masters_rating ON masters(rating DESC);
CREATE INDEX IF NOT EXISTS idx_masters_verified ON masters(verified);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_category ON orders(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_master ON orders(master_id);
CREATE INDEX IF NOT EXISTS idx_reviews_master ON reviews(master_id);
CREATE INDEX IF NOT EXISTS idx_master_categories_master ON master_categories(master_id);
CREATE INDEX IF NOT EXISTS idx_master_categories_category ON master_categories(category_id);