# 모바일 청첩장 제작 서비스

Next.js와 Tailwind CSS로 만든 모바일 청첩장 편집기입니다.

고객은 `/edit`에서 청첩장을 만들고 Supabase에 저장할 수 있습니다. 저장 후에는 보기 링크와 고객용 편집 링크가 생성됩니다.

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://127.0.0.1:3000/edit`로 접속합니다.

## Supabase 환경변수

`.env.local.example`을 복사해서 `.env.local`을 만들고 값을 채웁니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Vercel 배포 시에도 Project Settings > Environment Variables에 같은 값을 넣어야 합니다.

## Supabase DB 준비

처음 세팅할 때는 Supabase SQL Editor에서 `supabase/schema.sql` 전체를 실행합니다.

이미 배포된 DB에 고객별 편집 링크 기능만 추가하려면 `supabase/customer-edit-links.sql`을 실행합니다.

주요 테이블은 `public.invitations`입니다.

- `slug`: 공개 보기 링크 주소
- `edit_secret`: 고객용 편집 링크에 들어가는 비밀코드
- `design_settings`: 청첩장 전체 설정 JSON
- `cover_image_url`, `gallery_images`: 저장된 사진 URL
- `qa_items`, `story_items`, `account_info`: 스토리/Q&A/계좌 정보

## 링크 구조

- 새 청첩장 만들기: `/edit`
- 공개 보기 링크: `/w/[slug]`
- 고객용 편집 링크: `/edit/[slug]?key=[edit_secret]`

고객용 편집 링크는 비밀코드가 들어간 관리 주소입니다. 이 주소를 가진 사람만 해당 청첩장을 다시 불러와 수정할 수 있습니다.

## 저장 흐름

1. `/edit`에서 청첩장 내용을 입력합니다.
2. `Supabase에 저장` 버튼을 누릅니다.
3. 사진은 Supabase Storage의 `wedding-images` 버킷에 업로드됩니다.
4. 청첩장 데이터는 `invitations` 테이블에 저장됩니다.
5. 보기 링크와 고객용 편집 링크가 생성됩니다.

기존 localStorage 저장은 임시저장 용도로 유지됩니다.

## 빌드 확인

```bash
npm run build
```
