import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    """Создание подключения к базе данных"""
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    """API для работы с мастерами и заявками"""
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters', {}) or {}
    action = params.get('action', '')
    
    try:
        if method == 'GET' and action == 'list':
            return get_masters_list(event)
        elif method == 'GET' and action == 'categories':
            return get_categories(event)
        elif method == 'POST' and action == 'create_order':
            return create_order(event)
        elif method == 'GET' and action == 'orders':
            return get_orders(event)
        else:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Endpoint not found. Use ?action=list, ?action=categories, ?action=create_order, or ?action=orders'}),
                'isBase64Encoded': False
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def get_masters_list(event: dict) -> dict:
    """Получение списка мастеров с фильтрами"""
    params = event.get('queryStringParameters', {}) or {}
    
    city = params.get('city')
    category = params.get('category')
    min_rating = params.get('min_rating')
    verified_only = params.get('verified') == 'true'
    search = params.get('search')
    
    query = """
        SELECT 
            m.id, m.user_id, m.specialty, m.description, m.experience_years,
            m.city, m.rating, m.reviews_count, m.completed_projects, m.verified,
            u.full_name, u.avatar_url, u.phone,
            COALESCE(
                json_agg(
                    DISTINCT jsonb_build_object('url', p.image_url, 'title', p.title)
                ) FILTER (WHERE p.id IS NOT NULL),
                '[]'
            ) as portfolio,
            COALESCE(
                json_agg(
                    DISTINCT sc.name
                ) FILTER (WHERE sc.id IS NOT NULL),
                '[]'
            ) as categories
        FROM masters m
        JOIN users u ON m.user_id = u.id
        LEFT JOIN portfolio_items p ON m.id = p.master_id
        LEFT JOIN master_categories mc ON m.id = mc.master_id
        LEFT JOIN service_categories sc ON mc.category_id = sc.id
        WHERE 1=1
    """
    
    query_params = []
    
    if city:
        query += " AND m.city ILIKE %s"
        query_params.append(f'%{city}%')
    
    if category:
        query += " AND EXISTS (SELECT 1 FROM master_categories mc2 JOIN service_categories sc2 ON mc2.category_id = sc2.id WHERE mc2.master_id = m.id AND sc2.name = %s)"
        query_params.append(category)
    
    if min_rating:
        query += " AND m.rating >= %s"
        query_params.append(float(min_rating))
    
    if verified_only:
        query += " AND m.verified = true"
    
    if search:
        query += " AND (u.full_name ILIKE %s OR m.specialty ILIKE %s OR m.description ILIKE %s)"
        search_pattern = f'%{search}%'
        query_params.extend([search_pattern, search_pattern, search_pattern])
    
    query += """
        GROUP BY m.id, u.full_name, u.avatar_url, u.phone
        ORDER BY m.rating DESC, m.reviews_count DESC
        LIMIT 50
    """
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, query_params)
            masters = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'masters': [dict(m) for m in masters],
                    'count': len(masters)
                }, default=str),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def get_categories(event: dict) -> dict:
    """Получение списка категорий услуг"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT id, name, icon, description
                FROM service_categories
                ORDER BY id
                """
            )
            categories = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'categories': [dict(c) for c in categories]
                }),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def create_order(event: dict) -> dict:
    """Создание новой заявки"""
    auth_header = event.get('headers', {}).get('X-Authorization', '')
    
    if not auth_header:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Authorization required'}),
            'isBase64Encoded': False
        }
    
    data = json.loads(event.get('body', '{}'))
    
    customer_id = data.get('customer_id')
    title = data.get('title')
    description = data.get('description')
    category_name = data.get('category')
    city = data.get('city')
    budget_min = data.get('budget_min')
    budget_max = data.get('budget_max')
    
    if not all([customer_id, title, description, city]):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'customer_id, title, description and city are required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            category_id = None
            if category_name:
                cur.execute("SELECT id FROM service_categories WHERE name = %s", (category_name,))
                category = cur.fetchone()
                if category:
                    category_id = category['id']
            
            cur.execute(
                """
                INSERT INTO orders (customer_id, title, description, category_id, city, budget_min, budget_max)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id, customer_id, title, description, city, status, created_at
                """,
                (customer_id, title, description, category_id, city, budget_min, budget_max)
            )
            order = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'order': dict(order)}, default=str),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def get_orders(event: dict) -> dict:
    """Получение списка заявок"""
    params = event.get('queryStringParameters', {}) or {}
    
    customer_id = params.get('customer_id')
    master_id = params.get('master_id')
    status = params.get('status')
    
    query = """
        SELECT 
            o.id, o.title, o.description, o.city, o.status,
            o.budget_min, o.budget_max, o.created_at,
            u.full_name as customer_name, u.phone as customer_phone,
            sc.name as category_name
        FROM orders o
        JOIN users u ON o.customer_id = u.id
        LEFT JOIN service_categories sc ON o.category_id = sc.id
        WHERE 1=1
    """
    
    query_params = []
    
    if customer_id:
        query += " AND o.customer_id = %s"
        query_params.append(int(customer_id))
    
    if master_id:
        query += " AND o.master_id = %s"
        query_params.append(int(master_id))
    
    if status:
        query += " AND o.status = %s"
        query_params.append(status)
    
    query += " ORDER BY o.created_at DESC LIMIT 50"
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, query_params)
            orders = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'orders': [dict(o) for o in orders],
                    'count': len(orders)
                }, default=str),
                'isBase64Encoded': False
            }
    finally:
        conn.close()