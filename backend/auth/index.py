import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import hashlib
import secrets
from datetime import datetime, timedelta

def get_db_connection():
    """Создание подключения к базе данных"""
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password: str) -> str:
    """Хеширование пароля"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token() -> str:
    """Генерация токена сессии"""
    return secrets.token_urlsafe(32)

def handler(event: dict, context) -> dict:
    """API для регистрации и авторизации пользователей"""
    
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
        if method == 'POST' and action == 'register':
            return register_user(event)
        elif method == 'POST' and action == 'login':
            return login_user(event)
        elif method == 'GET' and action == 'profile':
            return get_profile(event)
        else:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Endpoint not found. Use ?action=register, ?action=login, or ?action=profile'}),
                'isBase64Encoded': False
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def register_user(event: dict) -> dict:
    """Регистрация нового пользователя"""
    data = json.loads(event.get('body', '{}'))
    
    email = data.get('email')
    password = data.get('password')
    full_name = data.get('full_name')
    phone = data.get('phone')
    user_type = data.get('user_type', 'customer')
    
    if not email or not password or not full_name:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Email, password and full_name are required'}),
            'isBase64Encoded': False
        }
    
    password_hash = hash_password(password)
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                INSERT INTO users (email, password_hash, full_name, phone, user_type)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id, email, full_name, user_type, created_at
                """,
                (email, password_hash, full_name, phone, user_type)
            )
            user = cur.fetchone()
            conn.commit()
            
            if user_type == 'master':
                city = data.get('city', 'Москва')
                specialty = data.get('specialty', 'Мебель на заказ')
                cur.execute(
                    """
                    INSERT INTO masters (user_id, specialty, city)
                    VALUES (%s, %s, %s)
                    RETURNING id
                    """,
                    (user['id'], specialty, city)
                )
                master = cur.fetchone()
                conn.commit()
                user['master_id'] = master['id']
            
            token = generate_token()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'user': dict(user),
                    'token': token
                }, default=str),
                'isBase64Encoded': False
            }
    except psycopg2.IntegrityError:
        conn.rollback()
        return {
            'statusCode': 409,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'User with this email already exists'}),
            'isBase64Encoded': False
        }
    finally:
        conn.close()

def login_user(event: dict) -> dict:
    """Авторизация пользователя"""
    data = json.loads(event.get('body', '{}'))
    
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Email and password are required'}),
            'isBase64Encoded': False
        }
    
    password_hash = hash_password(password)
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT u.id, u.email, u.full_name, u.user_type, u.phone, u.avatar_url,
                       m.id as master_id, m.specialty, m.city, m.rating, m.verified
                FROM users u
                LEFT JOIN masters m ON u.id = m.user_id
                WHERE u.email = %s AND u.password_hash = %s
                """,
                (email, password_hash)
            )
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid email or password'}),
                    'isBase64Encoded': False
                }
            
            token = generate_token()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'user': dict(user),
                    'token': token
                }, default=str),
                'isBase64Encoded': False
            }
    finally:
        conn.close()

def get_profile(event: dict) -> dict:
    """Получение профиля пользователя по токену"""
    auth_header = event.get('headers', {}).get('X-Authorization', '')
    
    if not auth_header:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Authorization required'}),
            'isBase64Encoded': False
        }
    
    user_id = event.get('queryStringParameters', {}).get('user_id')
    
    if not user_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'user_id is required'}),
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT u.id, u.email, u.full_name, u.user_type, u.phone, u.avatar_url,
                       m.id as master_id, m.specialty, m.city, m.rating, m.verified,
                       m.description, m.experience_years, m.completed_projects, m.reviews_count
                FROM users u
                LEFT JOIN masters m ON u.id = m.user_id
                WHERE u.id = %s
                """,
                (user_id,)
            )
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'user': dict(user)}, default=str),
                'isBase64Encoded': False
            }
    finally:
        conn.close()