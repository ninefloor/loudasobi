# loudasobi

YOASOBI 음악 콜 가이드. 공유 DB 기반 곡·가사 조회와 관리자 전용 곡 설정을 지원합니다.

## 실행

```sh
npm install
npm run dev
```

기본 주소: http://localhost:3000

## 구성 및 범위

Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui(Radix 기반), Lucide를 사용합니다.
next-themes로 라이트·다크·시스템 테마를 지원합니다.
Jotai, next-intl, react-player, Turso/libSQL, Drizzle, Zod도 설치되어 있습니다.

- 56px 헤더와 접이식 360px 사이드바
- 모바일 Sheet와 내부 곡 목록 스크롤
- 가사 내부 스크롤과 하단 고정 재생 컨트롤 영역
- 곡 선택, 테마 전환, 사이드바 열기·닫기 동작
- react-player 기반 재생·탐색·볼륨 조절과 가사 위치 연동

DB·인증 환경 변수 설정은 `docs/admin-setup.md`를 참고하세요. `/admin`에서 전용 음원 ID·팬라이트·공개 여부를 설정합니다.
공개 목록과 가사는 DB에서 읽으며, 전곡 비공개라면 빈 목록이 정상입니다. 공유 music의 삭제 상태도 반영합니다.
가사는 MONOASOBI 원본 트랙을 직접 읽습니다. 원본 변경은 다음 조회부터 반영됩니다. 원본의 초 단위 sync에 곡 설정의 추가 싱크 보정값을 더합니다. 가사 편집은 MONOASOBI에서만 진행합니다.
이전 정적 스냅샷은 보관만 하며 공개 화면에서는 사용하지 않습니다. 앨범아트는 여전히 로컬 파일입니다.

## 디자인 수정 위치

- `src/app/globals.css`: 브랜드 OKLCH 팔레트 및 light/dark 테마 변수.
- `src/components/layout`: 헤더, 곡 목록, 반응형 프레임
- `src/components/player`: 가사와 하단 플레이어 틀
- `src/components/ui`: shadcn 생성 컴포넌트
- `src/data/preview`: 보관용 스냅샷 및 개발용 콜 UI 샘플 생성 함수
- `PROJECT_PLAN.md`: 전체 구현 청사진

화면 높이 100dvh 안에서 가사와 목록만 스크롤하는 구조를 유지합니다.

## 정적 검증

```sh
npm run lint
npm run typecheck
npm run format:check
```

기능 QA는 사용자가 직접 수행합니다.

## 색상 사용

모든 색상은 `src/app/globals.css`에서 OKLCH로 정의합니다.
각 팔레트의 `500`은 제공된 원본 색상이며, 낮은 숫자는 밝고 높은 숫자는 어둡습니다.

팔레트: `magenta`, `cyan`, `navy`, `black`, `white`, `charcoal`, `gray`,
`yellow`, `green`, `orange`, `purple`, `lilas-blue`, `ayase-green`.
각각 100부터 900까지 9단계입니다. `green`은 NTMY, `ayase-green`은 별도 색상입니다.

```tsx
<div className="bg-magenta-500 text-black-500" />
<div className="bg-cyan-100 text-cyan-900 dark:bg-cyan-900 dark:text-cyan-100" />
<div className="border-lilas-blue-500 bg-ayase-green-500/20" />
<Button>주조색 버튼</Button>
<Button variant="secondary">보조색 버튼</Button>
```

공용 UI는 `bg-primary`, `bg-secondary`, `bg-accent` 등 의미 기반 클래스를 우선합니다.
primary는 magenta, secondary는 cyan입니다. 라이트 primary는 밝은 글자 대비를 위해 600,
다크 primary는 어두운 글자와 400을 사용합니다. 원본색은 언제든 500으로 사용할 수 있습니다.
기존 변수명(`--y-a-s-b--magenta` 등)도 해당 500의 별칭으로 보존했습니다.
기본 `bg-black`, `bg-white` 등 동일 이름의 Tailwind 색상도 제공한 원본색으로 연결됩니다.

밝은 단계는 OKLab 흰색 혼합, 어두운 단계는 명도·채도 비례 감소로 생성했습니다.
팔레트별 색상각을 유지하고 sRGB 범위에 맞춰 채도를 제한했습니다.
무채색도 원본 500을 유지하므로 black/white의 단계 간 밝기 폭은 서로 다릅니다.

## MONOASOBI UI 계승

- 작은 라운드와 단색 패널, 목록 120ms / 패널 180ms / 가사 200ms 전환을 사용합니다.
- 곡 목록과 가사는 shadcn ScrollArea 내부에서만 스크롤합니다.
- react-player의 currentTime과 duration(초)을 그대로 사용합니다. 별도 타이머로 재생 시간을 추정하지 않습니다.
- 가사 클릭/콜 구간 바로가기는 해당 위치부터 재생합니다. 곡 변경 시 이전 재생 인스턴스를 해제합니다.
- 개발 환경의 SYNC는 가사와 콜 시간을 함께 조절하며, 새로고침/곡 변경 시 초기화됩니다.
- 관리자 곡 설정에서 콜 편집·비공개 미리보기를 엽니다. 박수·콜·부분 떼창과 펄스를 작성하고 저장하면 공개 플레이어에도 반영됩니다.
- 편집은 세로 가사/콜 트랙에서 진행합니다. 간주 생성, 드래그 이동·길이 조절, 8카운트 패턴, 개별 펄스, 블록 ±0.01초 이동, 실행 취소와 구간 반복을 지원합니다. 가사 싱크 추가 보정은 블록 이동과 별도이며 전체 저장 시 함께 반영합니다.
- 개발 환경의 "콜 UI 샘플"은 가상 구간/박수 타이밍입니다. 실제 콜 가이드가 아니며, 제공 상태에 포함하지 않습니다.
- 공개 UI는 한국어·일본어·영어를 지원합니다. 설정 → 언어에서 변경하며 가사 표시도 함께 전환됩니다. 일본어는 원문만, 한국어/영어는 해당 번역·음독을 함께 표시합니다. 없는 번역 자료는 준비 중으로 안내합니다.
- 가사는 MONOASOBI에서만 편집합니다. loudasobi에서는 공유 가사를 읽고 전용 콜 가이드만 편집합니다. 상세 운영 기준은 `docs/admin-setup.md`를 참고하세요.

## 공유 메타데이터

- 관리자 ‘사이드바 · 추천 정렬’에서 공개곡 순서와 1단계 그룹 이름·배치를 편집합니다. 공개 목록 기본은 추천순이며 발매일순을 선택하면 기존 곡 순서로 표시합니다. 정렬 변경 시 음원은 유지됩니다.
- 추천 목록 저장에는 MONOASOBI `0007_loudasobi_sidebar` 마이그레이션이 필요합니다. 상세 정책은 `docs/admin-setup.md`, 관리자 UI/UX 검토는 `docs/admin-ux-review.md`를 참고하세요.

- 최초 언어는 저장된 `loudasobi_locale` 쿠키 → 브라우저 Accept-Language → 한국어 순서입니다. 선택은 1년간 저장하며 언어 전환 시 플레이어를 재생성하거나 페이지를 이동하지 않습니다.
- UI 번역은 `src/i18n/messages.ts`, 가사 번역은 공유 DB에서 별도로 관리합니다. 콜의 사용자 작성 설명은 자동 번역하지 않습니다. 관리자 화면과 관리자 미리보기는 한국어를 유지합니다.
- locale별 URL은 만들지 않습니다. 최초 응답의 HTML lang과 메타데이터는 요청 언어에 맞춥니다. 언어별 검색 노출용 URL·hreflang은 별도 작업입니다.

- 배포 전 NEXT_PUBLIC_SITE_URL에 실제 사이트 원점(예: https://your-domain.example)을 지정하세요.
- 도메인이 없으면 canonical을 임의로 지정하지 않습니다.
- icon.svg / apple-icon.tsx / opengraph-image.tsx는 magenta·cyan 기반 임시 브랜드 그래픽입니다.
- 소설용 설정, cacheComponents, React Compiler는 이관하지 않았습니다.

## 가사 동기화와 자동 따라가기

- 시간 기준은 react-player의 실제 currentTime(초)뿐입니다.
- 가사 활성 줄은 정렬된 시작 시간의 이진 탐색으로 찾으며 줄이 바뀔 때만 React에 알립니다.
- 진행 바만 0.1초 단위의 위치 변화를 별도로 구독합니다. 탐색·일시정지·탭 복귀는 즉시 반영합니다.
- pulse는 해당 카드의 Web Animations API로 재생하고, 탐색·일시정지·곡 변경·탭 전환 시 취소합니다. 지나간 박수를 몰아서 재생하지 않습니다.
- 자동 따라가기 기본값은 ON입니다. 휠·터치 스크롤·스크롤바 드래그·스크롤 키 입력은 따라가기를 일시 중단합니다.
- ‘현재 가사로’는 재생 위치를 유지하며 화면만 현재 가사로 이동하고 따라가기를 재개합니다.
- 가사/구간 바로가기는 재생 위치를 변경합니다. 곡을 바꾸면 따라가기·스크롤도 초기화됩니다.
- 모션 감소 설정에서는 즉시 스크롤하며 pulse는 밝기 flash 대신 테두리 변화로 표시합니다.
