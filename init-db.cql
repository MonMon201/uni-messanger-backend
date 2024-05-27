-- Create the keyspace
CREATE KEYSPACE IF NOT EXISTS test WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 3};

-- Use the keyspace
USE test;

-- Create User table
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    avatar TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Create Chat table
CREATE TABLE IF NOT EXISTS chats (
    chat_id UUID PRIMARY KEY,
    name TEXT,
    slug TEXT,
    description TEXT,
    avatar TEXT,
    owner_id UUID,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Create ChatUser table
CREATE TABLE IF NOT EXISTS users_by_chat (
    chat_id UUID,
    user_id UUID,
    permission_id UUID,
    is_blocked BOOLEAN,
    PRIMARY KEY (chat_id, user_id)
);

-- Create ChatMessage table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY,
    chat_id UUID,
    date DATE,
    user_id UUID,
    content TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    reply_to UUID
);

-- Create Auth table
CREATE TABLE IF NOT EXISTS auth (
    user_id UUID PRIMARY KEY,
    email TEXT,
    password TEXT,
    refresh_token TEXT
);

CREATE INDEX IF NOT EXISTS email_idx ON auth (email);
CREATE INDEX IF NOT EXISTS username_idx ON users (username);
CREATE INDEX IF NOT EXISTS slug_idx ON chats (slug);
CREATE INDEX IF NOT EXISTS chat_messages_date_idx ON chat_messages (date);
CREATE INDEX IF NOT EXISTS users_by_chat_user_id_idx ON users_by_chat (user_id);

