# 모바일 청첩장 제작 서비스

Next.js와 Tailwind CSS로 만든 모바일 청첩장 편집기입니다. `/edit`에서 내용을 수정하고, Supabase에 저장하면 `/w/[slug]` 형태의 공유 링크로 청첩장을 볼 수 있습니다.

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://127.0.0.1:3000/edit`로 접속합니다.

## Supabase 환경변수

`.env.local.example`을 복사해서 `.env.local`을 만들고 값을 채워주세요.

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Vercel에 배포할 때도 Project Settings > Environment Variables에 같은 값을 추가해야 합니다.

## Supabase DB 준비

Supabase SQL Editor에서 `supabase/schema.sql` 내용을 실행합니다.

생성되는 주요 항목:

- `public.invitations` 테이블
- `slug` unique 인덱스
- 청첩장 JSON 저장용 컬럼들
- `wedding-images` Storage bucket
- MVP용 공개 읽기/쓰기 정책

저장 컬럼:

- `id`
- `slug`
- `groom_name`
- `bride_name`
- `wedding_date`
- `wedding_time`
- `venue_name`
- `venue_address`
- `invitation_text`
- `family_info`
- `design_settings`
- `cover_image_url`
- `gallery_images`
- `music_url`
- `qa_items`
- `story_items`
- `account_info`
- `rsvp_enabled`
- `guestbook_enabled`
- `created_at`
- `updated_at`

## 저장 흐름

1. `/edit`에서 청첩장 내용을 수정합니다.
2. `Supabase에 저장` 버튼을 누릅니다.
3. 첨부된 data URL 이미지는 Supabase Storage의 `wedding-images` 버킷에 업로드됩니다.
4. 반환된 이미지 URL과 청첩장 데이터가 `invitations` 테이블에 저장됩니다.
5. `/w/[slug]` 공유 링크가 생성됩니다.

기존 localStorage 저장은 임시 저장용으로 유지됩니다.

## 빌드 확인

```bash
npm run build
```
