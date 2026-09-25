# 콜 가이드 웹 앱 구현 지침

## 최신 확정 사항: 가사 공유 (2026-09-24)

아래 초안의 가사 사본·import·가사 편집 관련 내용보다 이 결정이 우선합니다.
- 가사는 MONOASOBI의 `lyric_tracks`를 직접 조회하고, 원문·번역·음독·줄별 타이밍 수정도 MONOASOBI에서만 합니다.
- loudasobi는 곡별 `sync_offset`(초)만 추가 관리합니다. 실제 적용 sync는 MONOASOBI 기본 sync + sync_offset입니다.
- loudasobi 전용 가사 사본 테이블은 보관만 하며 읽거나 쓰지 않습니다. 가사 import/편집기는 만들지 않습니다.
- 콜 문서는 공통 music에 종속됩니다. 실제 콜은 공유 가사의 안정적인 줄 ID를 참조하며, 원문 변경·줄 삭제 시 선택 구간 재확인이 필요합니다.
- 남은 관리자는 콜 편집과 비공개 미리보기입니다. 콜 연결 전 MONOASOBI ID 보존 코드 배포 및 기존 가사의 ID 보강이 필요합니다.

## 1. 문서 목적

이 문서는 새로운 저장소에서 구현할 음악 콜 가이드 웹 앱의 제품 요구사항과 기술적 기준을 정의한다.

새 프로젝트는 MONOASOBI의 MV + 가사 플레이어 경험과 `lilas-korea-2026`의 숨김 YouTube 재생 방식을 참고한다. `music`과 `lyric`의 초기 데이터는 MONOASOBI에서 가져와 새 schema에 맞게 이관하는 것을 전제로 한다. 콜·박수·팬 라이트 데이터는 새 서비스의 목적에 맞게 새로 입력한다.

이 프로젝트는 단일 아티스트 전용이다. 아티스트 선택, 다중 아티스트 관계, 아티스트 CRUD를 만들지 않는다.

구현 과정에서 이 문서의 확정 사항을 우선한다. 불명확한 세부사항은 MVP를 작게 유지하는 방향으로 결정하며, 별도 요구 없이 복잡한 범용 편집기나 라이브 음원별 버전 시스템을 만들지 않는다.

## 2. 제품 목표

노래를 재생하면서 해외 팬을 포함한 사용자가 다음 정보를 가사와 함께 쉽게 익힐 수 있는 웹 앱을 만든다.

1. 박수 타이밍
2. 독립 콜과 떼창 구간
3. 곡별 고정 팬 라이트 색상

모든 타이밍은 하나의 공식 음원 또는 미리 지정한 기준 음원을 기준으로 작성한다. MVP에서는 라이브 버전, 공연별 변형, 사용자 제작 버전, 복수 음원 동기화를 지원하지 않는다.

## 3. 핵심 UX 원칙

- 가사가 화면의 중심이다.
- 박수와 챈트 정보는 별도의 복잡한 악보나 메트로놈으로 보여주지 않는다.
- 박수와 챈트가 적용되는 구간에는 각각 `박수`, `콜`, `떼창`처럼 행동을 명시적으로 표기한다.
- 표기는 cue가 활성화된 구간 동안 유지하고, 정확한 타이밍은 현재 가사 카드가 짧게 밝아지는 pulse 효과로 표현한다.
- 박수 직전에는 사용자가 따라 할 수 있도록 약 400~600ms 동안 밝기가 은은하게 차오르는 pre-glow를 제공한다.
- 떼창은 해당 가사 전체 또는 선택된 문자열만 강조한다.
- 독립 콜은 현재 가사 카드 안의 보조 문구 또는 가사 사이의 콜 카드로 표시한다.
- 팬 라이트 색상은 곡 전체의 고정 메타데이터다. 타임라인 cue로 만들지 않는다.
- 팬 라이트 색상은 카드 테두리·작은 색상 칩·은은한 ambient glow에만 반영한다. 버튼과 브랜드 주조색은 곡마다 바꾸지 않는다.
- 모바일에서도 공연 중 잠깐 보고 이해할 수 있도록 현재 가사와 행동 신호를 크게 표시한다.
- 색상만으로 의미를 전달하지 않는다. 텍스트 또는 아이콘을 함께 제공한다.
- `prefers-reduced-motion`에서는 확대와 강한 flash를 제거하고 테두리·명도 변화로 대체한다.

## 4. 기술 스택

새 저장소 생성 시점의 호환 가능한 최신 안정 버전을 사용하고 lockfile을 커밋한다.

- Next.js App Router
- React
- TypeScript strict mode
- shadcn/ui
- Tailwind CSS 및 CSS variables 기반 디자인 토큰
- `next-themes`: light/dark theme 전환 및 system theme 대응
- Lucide Icons
- Jotai: 재생 상태처럼 여러 client component가 공유해야 하는 최소 전역 상태에만 사용
- Turso/libSQL
- Drizzle ORM 및 Drizzle Kit
- Zod: API, DB JSON payload, 관리자 입력 검증
- `next-intl`: locale routing, UI 메시지, 서버/클라이언트 번역
- 영상·음원 재생: `react-player`로 고정
- ESLint 및 Prettier

Next.js API나 convention을 구현하기 전에 설치된 버전의 `node_modules/next/dist/docs/`에서 관련 문서를 확인한다. 기억에 의존해 구버전 API를 사용하지 않는다.

## 5. 시각 디자인

shadcn/ui를 사용하되 주조색, 보조색, 박수·챈트 신호색과 세부 디자인은 사용자가 직접 지정한다. 구현 에이전트가 임의의 브랜드 색상이나 시각 방향을 확정하지 않는다.

- light mode와 dark mode를 모두 지원한다.
- 초기 theme는 system 설정을 따르며 사용자가 직접 전환할 수 있게 한다.
- 사용자가 만든 디자인 토큰을 light/dark theme 양쪽에 반영한다.
- 박수와 챈트의 정보 표시는 사용자가 지정한 semantic token을 사용한다.
- 팬 라이트 실제 색상이 본문 대비를 떨어뜨리지 않게 작은 색상 chip과 반투명 glow로만 사용한다.
- 사용자가 초기 화면과 디자인 기준을 만든 뒤에 해당 패턴을 공용 컴포넌트와 나머지 route로 확장한다.

### MONOASOBI UI 계승 원칙

새 프로젝트는 MONOASOBI의 레이아웃과 전반적인 UI 경험을 거의 동일하게 계승한다. 단순한 분위기 참고가 아니라 화면 골격, 정보 밀도, 사이드바 동작, 콘텐츠 배치, 반응형 전환 방식을 구현 기준으로 삼는다.

참고할 주요 파일:

```text
src/components/layout/AppFrame.tsx
src/components/layout/AppFrame.module.css
src/components/layout/Header.tsx
src/components/layout/Header.module.css
src/components/layout/SidebarClient.tsx
src/components/layout/Sidebar.module.css
src/components/content/ContentsContainer.tsx
src/components/content/ContentsContainer.module.css
src/components/common/YouTubeLyricsPlayer.tsx
src/components/common/LyricsDisplayV2.tsx
```

계승할 구조:

- 전체 화면을 `Header + Sidebar + Main Content`로 구성한다.
- 상단 header는 약 56px 높이를 유지하며 좌측 sidebar toggle, 중앙 logo, 우측 설정 진입점의 배치를 계승한다.
- 데스크톱 sidebar는 약 360px 너비의 접이식 panel로 유지한다.
- sidebar 내부는 독립 scroll 영역이며 열림 상태와 scroll 위치를 유지한다.
- sidebar item은 72px 앨범아트, 원어 제목, 한국어/영어 제목을 조합한 현재 MONOASOBI의 밀도와 정렬을 계승한다.
- 선택된 곡은 배경색과 텍스트 tone으로 명확하게 구분한다.
- 1024px 이하에서는 sidebar를 화면 위로 나오는 overlay panel로 전환하고 바깥 영역을 누르면 닫는다.
- 360px 미만의 매우 좁은 화면에서는 앨범아트를 숨기는 등 현재의 축소 전략을 참고한다.
- main content는 남은 너비를 모두 사용하고 자체 scroll 영역과 최소 너비 처리를 유지한다.
- 곡 상단에는 현재 MONOASOBI `ContentsContainer`처럼 제목과 보조 정보를 보여주는 compact header를 둔다.
- border, card 밀도, 간격, 작은 radius, hover/active feedback 등 전반적인 감각을 유지하되 실제 색상 token과 세부 디자인은 사용자가 지정한 shadcn theme를 따른다.

음악 전용으로 변경할 부분:

- MONOASOBI의 sidebar item에 있는 소설 제목, 번역 여부, 정식 발매 badge는 가져오지 않는다.
- `ContentsContainer`의 소설 본문과 가사 플레이어 전환 구조를 가져오지 않는다.
- `?view=lyrics` query와 우측 하단의 책/음악 floating toggle을 만들지 않는다.
- 곡을 선택하면 음악 콜 가이드 플레이어가 main content의 기본이자 유일한 콘텐츠로 바로 표시된다.
- 소설, 만화, 구매 링크, 번역 안내 관련 route와 component를 만들지 않는다.
- 공개 화면에서 음악/소설을 선택하는 mode switch를 만들지 않는다.

shadcn/ui로 재구현하더라도 MONOASOBI의 화면 구조를 임의의 dashboard나 카드 grid 형태로 재해석하지 않는다. 사용자가 별도로 변경을 요청하지 않는 한 기존 레이아웃과 상호작용을 우선한다.

### 스크롤 소유권

브라우저 페이지 전체에는 세로 스크롤을 만들지 않는다. MONOASOBI에서 소설을 볼 때 `NovelReader` 컴포넌트 자체에 `ScrollArea`가 적용되는 방식과 `lilas-korea-2026`의 콜 가이드 내부 scroll 구조를 따른다.

스크롤 영역은 다음처럼 분리한다.

- 브라우저 `html/body`: 고정된 viewport이며 세로 스크롤 없음
- AppFrame: `100dvh` 안에서 header와 body를 배치하며 스크롤 없음
- Sidebar: 곡 목록만 독립 세로 스크롤
- Main Content: viewport 안에 고정되며 페이지 스크롤 없음
- Call Guide/Lyrics 컴포넌트: 가사와 콜 가이드 전체를 담는 유일한 main 세로 스크롤 영역
- 하단 재생 컨트롤: 가사 스크롤 바깥에 두고 항상 고정

필수 layout 원칙:

```css
html,
body {
  height: 100%;
  overflow: hidden;
}

.appFrame {
  height: 100dvh;
  overflow: hidden;
}

.appBody,
.mainContent,
.guideLayout,
.guideScrollWrapper {
  min-height: 0;
}

.appBody,
.mainContent,
.guideLayout {
  display: flex;
}

.guideLayout {
  flex: 1;
  flex-direction: column;
  overflow: hidden;
}

.guideScrollViewport {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}
```

위 class 이름은 예시지만 높이 전달 원칙은 유지한다. flex 자식의 `min-height: 0`을 빠뜨려 body가 늘어나면서 페이지 전체 scrollbar가 생기지 않게 한다.

- shadcn `ScrollArea`를 사용하거나 동일한 native scroll container를 구현할 수 있다.
- main scrollbar는 콜 가이드/가사 컴포넌트 우측에 나타나야 한다.
- scrollbar를 CSS로 숨기지 않는다. 사용자가 현재 위치와 스크롤 가능 여부를 알 수 있어야 한다.
- 가사 상단 정보와 하단 플레이어가 내부 scroll에 같이 밀려나지 않게 한다.
- 마지막 가사가 하단 고정 플레이어에 가려지지 않도록 scroll viewport에 충분한 bottom padding을 둔다.
- 자동 스크롤은 페이지나 `window`가 아니라 이 내부 scroll viewport의 `scrollTop` 또는 `scrollIntoView`만 변경한다.
- 곡을 바꿀 때 가사 scroll 위치를 맨 위 또는 현재 active line 위치로 명시적으로 초기화한다.
- 모바일 브라우저에서도 `100vh`보다 `100dvh`를 우선하여 주소창 변화로 이중 scrollbar가 생기지 않게 한다.

## 6. 화면 및 라우트 구조

locale prefix를 사용하는 것을 기본으로 한다.

```text
src/app/[locale]/
  page.tsx
  songs/[slug]/page.tsx
  admin/page.tsx
  admin/songs/[id]/page.tsx
```

주요 화면:

### 공개 홈

- 서비스 소개
- 곡 검색
- 곡 목록
- 최근 추가된 가이드

### 곡 상세 및 플레이어

- 원어·한국어·영어 곡 제목과 팬 라이트 색상
- 숨김 YouTube 재생을 조작하는 자체 플레이어 UI
- 이전·현재·다음 가사
- 전체 가사 스크롤
- 자동 스크롤 on/off
- 재생, 일시정지, seek, 볼륨
- 사용자 로컬 sync 보정 기능은 필요할 때만 제공하고 DB 원본은 변경하지 않는다.
- 현재/다음 콜 안내
- 박수 pre-glow 및 pulse
- 재생 컨트롤은 main content 하단에 sticky 또는 fixed 형태로 유지한다.
- 데스크톱에서는 sidebar를 제외한 content 영역 하단에, 모바일에서는 viewport 하단 safe area 위에 배치한다.
- 고정 플레이어 높이만큼 가사 scroll 영역에 하단 여백을 확보하여 마지막 가사를 가리지 않는다.

### 관리자

- 음악 CRUD
- 다국어 곡 제목 입력
- 팬 라이트 색상 입력
- 가사 import 및 편집
- 떼창 없음/전체/부분 설정
- 독립 챈트 입력
- 박수 타이밍 입력 및 미세 조정
- 공개 미리보기
- draft/published 상태 전환

데스크톱과 모바일 모두 앞 절의 MONOASOBI UI 계승 원칙을 따른다. sidebar를 shadcn `Sheet`로 바꾸더라도 현재 MONOASOBI의 너비, overlay, 닫힘 동작, 곡 item 밀도를 유지한다.

## 7. 디렉터리 원칙

```text
src/
  app/
    [locale]/
      _components/
      admin/
      songs/
    api/
  components/
    common/
    content/
    feedback/
    layout/
    player/
  atoms/
  i18n/
  lib/
  server/
    auth/
    db/
    mutations/
    queries/
    schemas/
  types/
```

- route의 상태, navigation, 권한, API 흐름에 묶인 컴포넌트는 해당 route의 `_components`에 둔다.
- 플레이어 엔진, 가사 표시, 콜 표시처럼 여러 화면에서 재사용 가능한 코드는 `src/components/player`에 둔다.
- DB 및 인증 코드는 `src/server` 밖으로 노출하지 않는다.
- 큰 client component 하나에 재생 엔진, 가사 렌더링, 관리자 폼을 섞지 않는다.
- 타이밍 계산과 payload 변환은 순수 함수로 분리한다.

## 8. 재생 시간과 동기화 규칙

재생과 타이밍의 유일한 기준은 `react-player`가 노출하는 player instance와 시간값이다. 별도의 독립 시계로 재생 시간을 추정하거나 보정하지 않는다.

`react-player` 및 underlying media element가 사용하는 재생 시간 단위는 초(second)다. 재생, seek, duration, callback 처리에는 라이브러리가 지원하는 초 단위를 그대로 사용한다.

DB와 도메인 payload에서는 비교 안정성과 직렬화를 위해 정수 millisecond를 사용할 수 있다.

```ts
type Milliseconds = number;
```

초와 millisecond의 변환은 player adapter 경계에서만 수행한다.

```ts
const secondsToMs = (seconds: number) => Math.round(seconds * 1000);
const msToSeconds = (milliseconds: number) => milliseconds / 1000;
```

- `react-player`에 전달하는 seek 값은 초 단위다.
- `react-player`에서 읽는 `currentTime`과 `duration`도 초 단위로 취급한다.
- 가사와 cue를 조회할 때만 현재 초 값을 millisecond로 변환한다.
- 컴포넌트 곳곳에서 임의로 `* 1000`, `/ 1000` 하지 않고 공용 변환 함수만 사용한다.
- 라이브러리의 callback과 ref API가 실제로 제공하는 타입을 설치된 `react-player` 버전에서 확인한다.

기준 음원과 데이터의 offset이 필요하면 `mediaOffsetMs`를 사용하고 의미를 다음 공식으로 고정한다.

```ts
timelineTimeMs = playerCurrentTimeMs - mediaOffsetMs;
```

예를 들어 `mediaOffsetMs = 800`이면 `react-player`의 43.37초가 가이드 타임라인의 42.57초에 해당한다. 부호 규칙을 한 곳에 정의하고 관리자 sync UI에도 같은 의미를 사용한다.

## 9. DB 모델

물리적으로 DB를 분리하지 않는다. 하나의 Turso DB 안에서 카탈로그, 가사, 콜 가이드를 논리적으로 분리한다.

권장 테이블:

```text
musics
lyric_tracks
call_guides
admin_users 또는 인증 제공자 연동 정보
```

### musics

- `id`
- `slug`
- `title`: 원어(일본어) 제목
- `korTitle`: 한국어 제목
- `enTitle`: 영어 제목
- `youtubeId` 또는 기준 YouTube URL
- `durationMs`
- `fanLightColor`: 로컬 팬 라이트 모델의 영문 key
- `status`: `DRAFT | PUBLISHED`
- `createdAt`
- `updatedAt`

팬 라이트는 JSON으로 저장하지 않는다. `musics.fanLightColor`에는 `blue`, `white`, `violet`처럼 영문으로 통일한 key 하나만 저장한다.

팬 라이트 이름과 실제 HEX 값은 DB가 아닌 로컬 모델에서 관리한다.

```ts
interface FanLightColor {
  key: string;
  name: string;
  hex: `#${string}`;
}

export const FAN_LIGHT_COLORS: Record<string, FanLightColor> = {
  blue: { key: "blue", name: "Blue", hex: "#0000FF" },
};
```

위 HEX 값은 구조 예시일 뿐이며 실제 목록과 색상은 사용자가 지정한다. 이 모델은 `src/lib/fanLights.ts`와 같은 로컬 파일에 둔다. DB 값이 로컬 목록에 없을 경우 안전한 fallback을 표시한다. 팬 라이트는 시간 정보를 갖지 않는다.

### lyric_tracks

- `musicId`: primary key 및 foreign key
- `mediaOffsetMs`
- `lyricJson`: 일본어 원문, 한국어 해석·음독, 영어 해석·음독을 모두 포함
- `createdAt`
- `updatedAt`

### call_guides

- `musicId`: primary key 및 foreign key
- `guideJson`
- `createdAt`
- `updatedAt`

가사와 콜 가이드 JSON은 Zod schema로 읽기와 쓰기 모두 검증한다. DB에서 읽었다는 이유만으로 JSON을 type assertion하여 신뢰하지 않는다.

## 10. 가사 데이터 모델

가사 한 줄은 다음 구조를 기본으로 한다.

```ts
interface LyricLine {
  id: string;
  startMs: number;
  endMs: number;
  original: string;
  translation: {
    ko: string;
    en: string;
  };
  pronunciation: {
    ko: string;
    en: string;
  };
}

interface LyricTrackDocument {
  lines: LyricLine[];
}
```

확정된 원칙:

- `lyric_tracks.lyricJson` 하나에 모든 locale의 가사를 함께 저장한다. locale별 lyric track 테이블을 따로 만들지 않는다.
- MONOASOBI의 `music`과 `lyric` 데이터를 초기 source로 사용하고 import 단계에서 새 필드명과 millisecond 형식으로 변환한다.
- MONOASOBI의 일본어 원문, 한국어 해석, 한국어 음독은 새로 다시 작성하지 않는다. 영문 해석·음독처럼 원본에 없는 필드만 새 프로젝트에서 보충한다.
- 가사를 segment로 쪼개서 저장하지 않는다.
- 부분 떼창은 가사와 음독에서 선택된 대상 문자열을 별도 cue에 저장한다.
- 번역문은 자연스러운 번역을 유지하며 부분 떼창 범위와 억지로 1:1 정렬하지 않는다.
- `id`는 시간이나 배열 index에서 즉석 생성하지 말고 저장된 안정적인 식별자를 사용한다.
- 같은 트랙 안에서 가사 시간 범위가 역전되거나 겹치는 경우 저장을 거부한다. 의도적인 중첩이 필요해지기 전까지 허용하지 않는다.

## 11. i18n 및 가사 표시

지원 locale MVP:

- `ko`
- `ja`
- `en`

locale별 기본 가사 표시 규칙:

### 한국어

1. 일본어 원문
2. 한국어 해석
3. 한국어 음독

### 일본어

1. 일본어 원문만 표시

### 영어

1. 일본어 원문
2. 영어 해석
3. 영어 음독 또는 romaji

UI 번역과 콘텐츠 번역을 분리한다. 버튼·메뉴는 `next-intl` message로 관리하고, 가사 번역·음독은 `lyricJson`에 저장한다.

locale을 변경해도 재생 위치, active lyric ID, 현재 call 상태가 초기화되지 않게 한다. 같은 `LyricLine.id`와 타이밍을 모든 locale에서 공유한다.

번역 fallback은 명시적으로 정의한다. 콘텐츠가 없는 locale을 빈 문자열로 조용히 표시하지 말고 관리자에서 발행을 차단하거나 사용자에게 준비 중 상태를 보여준다.

## 12. 콜 가이드 데이터 모델

MVP의 콜 종류는 다음 세 가지다.

```ts
type GuideCue = SingAlongCue | ChantCue | ClapCue;
```

### 전체 및 부분 떼창

```ts
type SingAlongCue =
  | {
      id: string;
      kind: "SING_ALONG";
      lineId: string;
      scope: "FULL";
      startMs?: number;
      endMs?: number;
    }
  | {
      id: string;
      kind: "SING_ALONG";
      lineId: string;
      scope: "PARTIAL";
      target: {
        original: string;
        pronunciationKo: string;
        pronunciationEn: string;
      };
      startMs?: number;
      endMs?: number;
    };
```

- `FULL`은 해당 가사 한 줄 전체를 강조한다.
- `PARTIAL`은 `target` 문자열만 강조한다.
- `startMs/endMs`가 없으면 연결된 가사 줄의 시간 범위를 사용한다.
- 더 짧은 시간 범위가 필요할 때만 cue 자체 시간을 입력한다.
- 부분 떼창 target은 저장 시 실제 `original` 및 각 `pronunciation`의 substring인지 검증한다.
- 같은 문자열이 한 필드에 여러 번 나타나는 사례가 생기면 `occurrence` 또는 명시적 문자 범위를 추가한다. MVP 전에는 미리 도입하지 않는다.

### 독립 챈트

가사와 별개로 외치는 `오이!`, `헤이!` 등을 표현한다.

```ts
interface ChantCue {
  id: string;
  kind: "CHANT";
  startMs: number;
  endMs: number;
  lineId?: string;
  text: {
    ja: string;
    ko: string;
    en: string;
  };
}
```

- `lineId`가 있으면 해당 가사 카드 안에 표시한다.
- `lineId`가 없거나 가사가 없는 간주라면 독립 콜 카드로 표시한다.

### 박수

```ts
interface ClapCue {
  id: string;
  kind: "CLAP";
  hitTimesMs: number[];
  label?: {
    ko?: string;
    ja?: string;
    en?: string;
  };
}
```

- 공개 재생의 기준은 BPM이 아니라 `hitTimesMs`의 정확한 시각이다.
- 한 번의 반복 패턴은 하나의 `ClapCue`로 묶을 수 있다.
- 배열은 오름차순이며 중복 값을 허용하지 않는다.
- `박수` label의 활성 구간은 첫 hit의 pre-glow 시작부터 마지막 hit의 decay 종료까지 cue 배열에서 파생한다.
- BPM과 첫 박은 향후 관리자 입력 보조 기능으로 추가할 수 있지만 공개 payload의 필수값으로 만들지 않는다.

```ts
interface CallGuideDocument {
  cues: GuideCue[];
}
```

## 13. 공개 플레이어 동작

### YouTube 재생

- 재생 라이브러리는 반드시 `react-player`를 사용한다. 다른 YouTube wrapper나 직접 작성한 IFrame API 구현으로 교체하지 않는다.
- `lilas-korea-2026`에서 검증한 것처럼 `react-player`의 YouTube 소스를 숨김 재생 요소로 두고 자체 컨트롤을 제공한다.
- `react-player` wrapper를 한 client component에 격리한다.
- autoplay에 의존하지 않는다. 최초 재생은 사용자의 명시적인 상호작용으로 시작한다.
- source 변경, seek, pause, resume, ended 상태를 명확히 처리한다.
- 볼륨은 local storage에 저장할 수 있다.
- 관리자가 sync를 조정할 수 있지만 공개 사용자에게 개발용 UI를 노출하지 않는다.

### 시간 추적

- `react-player`가 노출하는 player ref의 `currentTime`을 유일한 재생 시간으로 사용한다.
- 재생 중 UI 갱신이 더 자주 필요하면 `requestAnimationFrame` 안에서 매 frame `react-player`의 `currentTime`을 다시 읽는다.
- `performance.now()`, 별도 audio clock, 독립 interval 누적값으로 현재 재생 시간을 추정하지 않는다.
- seek도 `react-player`가 지원하는 초 단위 API를 사용한다.
- source 변경, seek, 재생 재개, 탭 visibility 복귀 시 player ref에서 시간을 즉시 다시 읽는다.
- 모든 cue를 매 frame 전체 탐색하지 않는다. 정렬된 event index 또는 binary search를 사용한다.
- React state를 매 frame 갱신하지 않는다. 현재 가사나 cue 경계가 바뀔 때만 상태를 갱신하고, 짧은 pulse는 Web Animations API 또는 CSS animation을 imperative하게 재시작한다.

### 가사 활성화

```ts
const activeLine = lines.find(
  (line) => timelineTimeMs >= line.startMs && timelineTimeMs < line.endMs,
);
```

실제 구현에서는 매번 `find`하지 않고 현재 index를 유지하거나 binary search한다.

### 부분 떼창 렌더링

HTML 문자열 삽입을 사용하지 않는다. 검증된 target 위치를 계산해 React node 세 부분으로 렌더링한다.

```text
before + highlighted target + after
```

한국어 화면에서는 `original`과 `pronunciation.ko`의 target을 강조한다. 영어 화면에서는 `original`과 `pronunciation.en`을 강조한다. 번역은 기본적으로 줄 전체를 그대로 보여준다.

### 박수 시각 효과

메트로놈, 박자 점, BPM 숫자를 공개 화면의 핵심 표현으로 사용하지 않는다.

- 박수 cue가 적용되는 가사 또는 간주 카드에 `박수` label과 아이콘을 명시적으로 표시
- 박수 약 400~600ms 전: 현재 가사 카드의 명도와 테두리가 서서히 증가
- 정확한 `hitTimeMs`: 100~150ms 정도의 선명한 flash/pulse
- 이후 약 200~300ms 동안 원래 상태로 복귀
- 같은 가사 줄에 박수가 여러 번 있으면 매 hit마다 애니메이션을 다시 시작
- 강한 scale 변화는 피하고 사용하더라도 1.01 수준으로 제한
- `prefers-reduced-motion`에서는 scale 및 flash를 없애고 테두리 굵기와 아이콘 변화로 대체

박수 이벤트가 발생한 시간의 active lyric card를 자동으로 밝힌다. 박수를 특정 line에 중복 연결해서 저장하지 않는다.

가사가 없는 간주에서는 현재 가사 카드 대신 `간주 / 박수` 상태 카드를 표시하고 그 카드를 pulse한다.

### 챈트 시각 효과

- 챈트 구간에는 `콜` label, 떼창 구간에는 `떼창` label을 명시적으로 표시
- 시작 400~600ms 전에 target 또는 콜 문구에 약한 pre-glow
- 진행 중에는 강조 유지
- 종료 후 자연스럽게 해제
- `SING_ALONG/PARTIAL`은 선택 문자열만 강조
- `SING_ALONG/FULL`은 가사 줄 전체 강조
- `CHANT`는 별도 문구를 표시

## 14. 관리자 편집기 MVP

데이터 모델이 복잡하더라도 편집자에게 내부 ID나 JSON 구조를 노출하지 않는다.

### 음악 편집

- 원어(일본어) 제목
- 한국어 제목
- 영어 제목
- slug
- YouTube ID/URL
- 곡 길이
- 로컬 팬 라이트 모델에서 영문 color key 하나 선택
- draft/published

### 가사 편집

- SRT 또는 정해진 JSON 형식 import
- 줄 추가/삭제
- 시작/종료 시각 수정
- 일본어 원문
- 한국어 해석/음독
- 영어 해석/음독
- seek하여 해당 줄 미리 듣기
- 전체 offset 조정

기존 MONOASOBI의 music/lyric schema와 데이터를 import source로 사용한다. timeline editor의 zoom, block resize, selection move, YouTube preview, offset 조정 구조도 필요한 범위에서 이식하거나 새 구조에 맞게 수정할 수 있다.

### 떼창 편집

각 가사 줄에서 다음만 제공한다.

```text
떼창: 없음 / 한 줄 전체 / 일부분
```

`일부분` 선택 시:

- 일본어 대상 문자열
- 한국어 음독 대상 문자열
- 영어 음독 대상 문자열
- 즉시 미리보기

초기 구현은 입력 필드에 대상 문자열을 복사하는 방식으로 충분하다. 이후 필요하면 가사 텍스트 drag selection으로 필드를 자동 채우되, segment editor를 만들지 않는다.

### 독립 챈트 편집

- 시작/종료 시각
- 일본어/한국어/영어 표시 문구
- 연결할 가사 줄 선택은 optional
- 미리보기

### 박수 편집

MVP에서 가장 중요한 입력 방식:

- 음원을 재생하며 지정 키를 누를 때 현재 시간을 기록
- 기록된 시간을 오름차순 목록으로 표시
- 개별 시간을 millisecond 또는 0.01초 단위로 미세 조정
- 선택한 박수 삭제
- 전체 박수 일괄 offset 이동
- 공개 플레이어와 동일한 pulse 미리보기

BPM grid, 파형 분석, 복잡한 DAW형 멀티트랙 편집기는 MVP에 포함하지 않는다.

## 15. API 및 서버 규칙

- 공개 query는 server component에서 직접 호출하는 것을 우선한다.
- client에서 필요한 데이터만 route handler를 통해 노출한다.
- mutation은 관리자 인증과 입력 검증을 반드시 통과해야 한다.
- 공개 API는 published 데이터만 반환한다.
- DB entity를 그대로 client에 전달하지 말고 mapper를 통해 공개 DTO를 만든다.
- 에러 응답 형식을 통일한다.
- 관리자 mutation 후 필요한 route만 revalidate한다.
- 읽기 전용 공개 페이지는 가능한 범위에서 캐시한다.

## 16. 인증

MVP에서는 공개 사용자 계정을 만들지 않는다. 관리자 인증만 구현한다.

- 비밀번호를 직접 평문으로 저장하지 않는다.
- 세션 cookie는 `httpOnly`, `secure`, `sameSite`를 적절히 설정한다.
- 모든 `/admin` route와 admin API를 서버에서 보호한다.
- UI에서 버튼을 숨기는 것만으로 권한 검사를 대체하지 않는다.

구체적인 인증 제공자는 프로젝트 생성 시 결정할 수 있지만, 불필요한 사용자/역할 시스템은 만들지 않는다.

## 17. Validation

최소한 다음 규칙을 Zod와 순수 validation 함수로 검사한다.

### Music

- slug가 비어 있지 않고 unique함
- YouTube ID 또는 URL 형식이 유효함
- 원어·한국어·영어 제목이 존재함
- `fanLightColor`가 로컬 팬 라이트 모델에 존재하는 영문 key임

### Lyrics

- `startMs >= 0`
- `endMs > startMs`
- 시간 순으로 정렬됨
- MVP에서는 가사 줄이 서로 겹치지 않음
- 원문 필수
- published 곡은 지원 locale에 필요한 번역과 음독 필수

### Partial sing-along

- 연결된 `lineId`가 존재함
- `target.original`이 원문에 정확히 한 번 존재함
- 한국어/영어 음독 target이 각 음독에 정확히 한 번 존재함
- target이 빈 문자열이 아님
- cue 시간이 있으면 가사 시간 범위 안에 존재함

### Chant

- `endMs > startMs`
- 필수 locale 문구가 존재함
- optional `lineId`가 실제 가사 줄을 참조함

### Clap

- 모든 값이 0 이상의 정수 millisecond
- 오름차순
- 중복 없음
- 곡 길이를 넘지 않음

validation 오류는 관리자에게 필드와 가사 줄을 식별할 수 있는 메시지로 보여준다.

## 18. 상태 관리

재생 엔진의 원본 상태를 여러 곳에 중복 저장하지 않는다.

- player element/ref: 플레이어 컴포넌트가 소유
- 모든 current time의 원본: `react-player` player ref
- 재생 여부, 현재 곡, 볼륨처럼 여러 component가 필요한 최소 상태: Jotai
- 고주파 current time: ref 중심으로 관리
- active lyric/cue처럼 UI 경계에서 필요한 파생 상태: 제한적으로 React state
- 서버 데이터: server component에서 조회하고 필요한 client boundary에 전달
- 관리자 draft: 해당 편집 route 내부 상태 또는 focused hook으로 관리

## 19. 접근성

- 재생/정지, seek, 볼륨, locale 선택을 keyboard로 조작할 수 있어야 한다.
- icon-only button에는 접근 가능한 이름을 제공한다.
- 현재 가사 변화 전체를 매 순간 screen reader live region으로 읽지 않는다.
- 중요한 콜 안내에는 적절한 빈도로 `aria-live`를 사용할 수 있지만 반복 박수마다 과도하게 알리지 않는다.
- 색상 이름을 팬 라이트 색상 chip 옆에 표시한다.
- flash는 광과민성 위험이 없는 밝기·횟수로 제한한다.
- reduced motion 환경을 지원한다.

## 20. 성능 기준

- 플레이어가 필요한 곡 상세 화면에서만 YouTube 관련 client bundle을 로드한다.
- 긴 가사 배열에서 매 frame 전체 배열을 순회하지 않는다.
- pulse마다 전체 페이지를 rerender하지 않는다.
- lyric row ref는 안정적으로 관리한다.
- 자동 스크롤은 active line이 바뀔 때만 실행한다.
- 모바일에서 layout shift 없이 재생 컨트롤 영역을 확보한다.
- `window` 또는 `document` scroll event를 가사 동기화에 사용하지 않는다.

## 21. 구현 순서와 사용자 작업 경계

프로젝트의 아주 기초적인 scaffold와 필수 라이브러리 설치 이후, 사용자가 먼저 초기 화면과 디자인 기준을 작업한다.

구현 에이전트의 최초 작업 범위:

- Next.js App Router + TypeScript 프로젝트 생성
- shadcn/ui 초기화
- `next-themes`, `next-intl`, Jotai, Drizzle/Turso, Zod, `react-player` 설치
- lint와 formatting 기본 설정
- 비어 있는 최소 디렉터리 구조

이 시점에 임의로 공개 화면, 관리자 화면, 색상 팔레트, layout을 완성하지 않는다. 사용자가 초기 디자인 작업을 마쳤다고 명시한 뒤 기존 컴포넌트와 토큰을 확인하고 후속 Phase를 진행한다.

### Phase 1: 사용자 초기 디자인 이후 기반 연결

- 사용자가 작성한 shadcn/ui 및 디자인 토큰 구조 파악
- light/dark theme 연결
- locale routing 및 `next-intl`
- Drizzle/Turso schema와 migration
- 사용자가 만든 layout을 기반으로 header, sidebar, content 구조 확장

### Phase 2: 음악과 가사

- Music CRUD
- MONOASOBI music/lyric 데이터 import 변환
- LyricTrack schema
- locale별 가사 표시
- `react-player` 기반 숨김 YouTube 플레이어와 자체 컨트롤
- active lyric 및 seek

### Phase 3: 떼창과 챈트

- `SING_ALONG FULL/PARTIAL`
- substring validation
- 부분 강조 렌더링
- 독립 `CHANT`
- pre-glow와 지속 강조

### Phase 4: 박수

- 관리자 tap recorder
- `hitTimesMs` 저장 및 편집
- 재생 scheduler
- 카드 pre-glow/pulse
- 간주 상태 카드

### Phase 5: 운영 품질

- 관리자 인증
- draft/published
- 접근성 점검
- 사용자가 수행한 모바일·브라우저 QA 결과 반영
- 오류/로딩 UI
- 신규 콜·박수·팬 라이트 자료 입력

각 Phase가 동작하는 상태를 유지하며 다음 Phase로 넘어간다. 초기부터 모든 관리자 기능과 공개 UI를 동시에 크게 만들지 않는다.

## 22. MVP에서 하지 않을 것

- 라이브 음원 및 공연별 콜 가이드 버전
- 사용자 계정과 사용자 제작 가이드
- segment 단위 가사 저장
- segment drag editor
- 단어별 karaoke timing
- 공개 화면의 BPM 메트로놈
- 파형 분석
- 자동 BPM 감지
- 복잡한 tempo map
- DAW 형태의 멀티트랙 편집기
- 팬 라이트 타임라인 cue

추후 실제 데이터 입력에서 필요성이 확인된 기능만 확장한다.

## 23. 완료 기준

MVP는 다음 조건을 모두 만족할 때 완료로 본다.

- 한국어·일본어·영어 locale route가 동작한다.
- locale별 가사 표시 규칙이 정확하다.
- 기준 YouTube 음원을 자체 컨트롤로 재생하고 seek할 수 있다.
- 재생 시간에 맞춰 현재 가사가 바뀐다.
- 전체 떼창과 부분 떼창이 서로 다르게 표시된다.
- 독립 챈트가 정확한 시간에 표시된다.
- 박수 직전 pre-glow와 박수 순간 pulse가 현재 가사 카드에 적용된다.
- 간주 박수도 사용자에게 명확히 표시된다.
- 팬 라이트 고정 색상이 곡 정보와 플레이어에 표시된다.
- 관리자가 JSON을 직접 수정하지 않고 음악·가사·콜·박수를 입력할 수 있다.
- 잘못된 부분 떼창 target과 잘못된 타임스탬프를 저장할 수 없다.
- 모바일 및 reduced-motion 환경에서 핵심 기능을 사용할 수 있다.
- light/dark mode에서 주요 화면과 상태 표시가 정상적으로 보인다.
- 페이지 전체에는 세로 scrollbar가 생기지 않고 가사·콜 가이드 컴포넌트만 독립적으로 스크롤된다.
- sidebar scroll, 가사 scroll, 하단 고정 플레이어가 서로 간섭하지 않는다.
- lint와 typecheck가 통과한다.

## 24. 구현 에이전트 작업 규칙

- 먼저 작은 수직 기능 단위로 구현하고 실제 화면에서 검증한다.
- 데이터 모델을 변경할 때 schema, Zod validation, mapper, 관리자 폼, 공개 renderer를 함께 갱신한다.
- 요구되지 않은 범용화와 추상화를 피한다.
- 타이밍 관련 상수와 부호 규칙을 코드 여러 곳에 중복하지 않는다.
- 관리자에게 내부 JSON, segment ID, DB 구조를 노출하지 않는다.
- 애니메이션 구현보다 입력 데이터의 정확성과 동기화 안정성을 우선한다.
- MONOASOBI의 music/lyric 데이터 및 유용한 편집기 구조는 이관 대상으로 취급하되, 새 서비스에 불필요한 소설·만화 등 다른 도메인은 가져오지 않는다.
- 사용자의 초기 디자인 작업 전에는 scaffold와 라이브러리 설치 범위를 넘어서지 않는다.
- 직접 코드 변경 후 최소한 lint와 typecheck를 실행한다.
- 일상적인 검증으로 production build를 반복하지 않는다. 배포 전 또는 framework 경계 변경 시에만 build를 확인한다.
- 무관한 변경을 함께 커밋하지 않는다.
- 커밋 메시지는 짧고 한 가지 변경 목적만 표현한다.
