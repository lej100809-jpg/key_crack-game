-- =============================================
-- KEY CRACK — Supabase 스키마
-- Supabase 대시보드 > SQL Editor 에서 실행
-- =============================================

-- 1. players 테이블
create table if not exists public.players (
  id           uuid primary key,           -- auth.users.id와 동일
  nickname     text not null default 'AGENT',
  rank_points  integer not null default 0,
  coins        integer not null default 300,
  rating       integer not null default 1000,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- 2. RLS 활성화
alter table public.players enable row level security;

-- 3. 정책: 누구나 읽기 (리더보드)
create policy "Anyone can read players"
  on public.players for select
  using (true);

-- 4. 정책: 본인만 삽입
create policy "Users can insert own record"
  on public.players for insert
  with check (auth.uid() = id);

-- 5. 정책: 본인만 수정
create policy "Users can update own record"
  on public.players for update
  using (auth.uid() = id);

-- 6. RP 증가용 RPC 함수 (원자적 증가 — race condition 방지)
create or replace function public.increment_rp(player_id uuid, amount integer)
returns void language plpgsql security definer as $$
begin
  insert into public.players (id, rank_points)
  values (player_id, amount)
  on conflict (id)
  do update set
    rank_points = players.rank_points + amount,
    updated_at  = now();
end;
$$;

-- 7. updated_at 자동 갱신 트리거
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger players_updated_at
  before update on public.players
  for each row execute function public.set_updated_at();
