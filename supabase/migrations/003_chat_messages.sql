-- Chat Messages table for persistent chat history
-- Run this in the Supabase SQL editor

create table if not exists public.chat_messages (
    id uuid default gen_random_uuid() primary key,
    document_id uuid not null references public.documents(id) on delete cascade,
    user_id text not null,
    role text not null check (role in ('user', 'assistant')),
    content text not null,
    created_at timestamptz default now() not null
);

create index idx_chat_messages_doc_user on public.chat_messages(document_id, user_id);

alter table public.chat_messages enable row level security;

create policy "Users can manage their own chat messages"
    on public.chat_messages
    for all
    using (user_id = current_setting('request.jwt.claims', true)::json ->> 'sub')
    with check (user_id = current_setting('request.jwt.claims', true)::json ->> 'sub');
