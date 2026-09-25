# loudasobi 작업 지침

- 한국어와 존댓말을 사용합니다.
- 제품 설계는 `PROJECT_PLAN.md`를 참고합니다.
- 공유 DB 연결·관리자 인증·전용 곡 설정·싱크 보정·공유 가사 조회·콜 편집 및 관리자 전용 미리보기를 구현했습니다. 가사 편집은 MONOASOBI에서만 진행합니다.
- 이후 디자인과 브랜드 색상은 사용자가 먼저 정합니다. 요청 없이 기능을 확대하지 않습니다.
- shadcn/ui, Tailwind CSS, TypeScript, App Router를 사용합니다.
- Next.js 변경 전에 설치된 `node_modules/next/dist/docs/`의 관련 문서를 읽습니다.
- 주 컴포넌트는 상위에, 보조 hooks와 utils는 같은 이름의 하위 폴더에 둡니다.
- 컴포넌트 파일은 PascalCase, hooks는 useSomething 형식입니다. shadcn 생성 파일은 원래 이름을 유지합니다.
- 화면은 100dvh로 고정합니다. 사이드바와 가사만 독립 스크롤하며 하단 플레이어는 스크롤 밖에 둡니다.
- `src/data/preview`와 loudasobi_lyric_tracks는 보관용이며 공개 화면에서 사용하지 않습니다. 공개 목록은 활성 musics와 publish=true인 전용 설정을 결합하고, 가사는 공통 lyric_tracks에서 읽습니다. 최종 sync는 원본 sync + 전용 sync_offset입니다. 정적 fallback 및 MONOASOBI MV ID fallback은 금지합니다.
- DB·인증 운영 기준은 `docs/admin-setup.md`를 따릅니다. 마이그레이션은 MONOASOBI에서만 관리하고, loudasobi에서 공유 스키마를 push하지 않습니다. 관리자 조회마다 인증, 쓰기에는 관리자 권한과 동일 출처 검증을 적용합니다. 공개 조회는 삭제/공개 필터를 반드시 적용합니다.
- 고주파 재생 시간은 알림 저장소로 전달합니다. 가사 활성 상태는 경계에서만 갱신하고 진행 바는 별도 구독하며, pulse는 카드의 Web Animations API로 처리합니다.
- 자동 따라가기는 가사 내부 스크롤만 이동합니다. 수동 스크롤 시 일시 중단하며 ‘현재 가사로’는 재생 위치를 바꾸지 않고 따라가기를 재개합니다.
- 실제 음원 재생과 타이밍은 react-player를 기준으로 구현합니다.
- 콜 편집은 세로 시간축의 읽기 전용 가사/독립 콜 트랙입니다. guide_json v2의 start/end와 펄스가 기준이며 간주를 허용합니다. 블록 ±0.01초 이동과 전체 sync_offset은 별도입니다. 전체 저장은 콜과 sync_offset을 트랜잭션으로 반영합니다. 기존 버전은 읽기 변환만 하고 사용자 저장 전 DB를 변경하지 않습니다.
- 공개 UI는 next-intl의 ko/ja/en 메시지를 사용합니다. 언어는 쿠키와 Accept-Language로 초기화하고 클라이언트에서 변경하며 플레이어를 재마운트하지 않습니다. UI와 가사 locale을 함께 전환하되 원문·타이밍은 공유합니다. 관리자 화면은 한국어입니다.
- 기능 QA는 사용자가 직접 수행합니다. 별도 자동화 테스트 환경을 추가하지 않습니다.
- 변경 후 npm run lint와 npm run typecheck를 수행합니다. npm run build는 사용자 요청 없이 실행하지 않습니다.
- 커밋은 요청이 있을 때만 수행하고 메시지는 짧은 영어 한 줄로 작성합니다.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
