# 텍스트 매크로 (whale-text-macro)

네이버 웨일(Whale) 브라우저 확장 프로그램. 단축키 또는 오른쪽 클릭 메뉴로 미리 저장한 문구를 현재 포커스된 입력창에 붙여넣는다.

- 스토어: https://store.whale.naver.com/detail/bphadkjajekcgjbjheohcnghdodaieaj
- 현재 버전: manifest.json의 `version` (README.md 상단에 버전별 변경 이력)
- 크롬 확장이 아니라 **웨일 전용**이다. 확장 API는 `chrome.*`이 아니라 전역 `whale.*` 네임스페이스를 쓴다. Manifest V3.

## 구조

빌드 도구, 패키지 매니저, 테스트, 린터 없음. 파일을 그대로 웨일에 "압축해제된 확장 프로그램"으로 로드해서 확인한다 (`whale://extensions`, 개발자 모드).

| 파일 | 역할 |
|---|---|
| manifest.json | 사이드바(`sidebar_action`, 기본 페이지 index.html), 서비스 워커, 권한, 단축키(`commands`) 정의 |
| scripts/background.js | 서비스 워커(ES module). 저장, 컨텍스트 메뉴 생성, 단축키/메뉴 클릭 처리, 백업/복원 |
| index.html + scripts/popup.js | 사이드바 화면 1: 단축키 매크로 4개 편집, 저장/백업/불러오기 |
| context_menu.html + scripts/context_menu_popup.js | 사이드바 화면 2: 오른쪽 클릭 매크로 편집 (추가/삭제/저장) |
| index.css | 두 화면 공통 스타일. 하단 고정 탭 버튼(`.bottom`) 포함 |
| bootstrap-3.3.2-dist/ | 벤더 파일 (Bootstrap 3.3.2, jQuery). 수정 금지 |

두 화면은 같은 사이드바 안에서 `location.href`로 전환한다. 하단 "단축키 문구 지정 / 오른쪽 클릭 문구 지정" 버튼이 그 역할.

## 두 가지 매크로 종류

### 1. 단축키 매크로
- 개수 고정 4개. 사이드바 textarea id: `macro0`~`macro3`.
- manifest `commands`의 이름도 `macro0`~`macro3`. **이름이 textarea id, 스토리지 키와 일치해야 한다.** 개수를 바꾸려면 manifest, index.html, popup.js의 `for (i = 0; i < 4; ...)` 세 곳을 같이 고친다.
- 기본 키: Ctrl+Shift+1~4 (mac: Alt+Shift+1~4, 화면 표기는 Option), `global` 없음.
- 스토리지: `whale.storage.sync` 키 `key_macro`, 값은 `{ macro0: "내용", macro2: "내용" }`. 빈 내용은 저장 시 생략된다.

### 2. 오른쪽 클릭 매크로
- 동적 개수, 최대 15개. 제목 최대 50자 (`checkStrRestriction`, input `maxlength=51`).
- 스토리지: 키 `cntxt_macro_data`, 값은 `[{ "제목": "내용" }, ...]`. **제목이 객체의 키**다. 제목 읽기는 `Object.keys(obj)[0]`.
- 컨텍스트 메뉴 항목 id는 배열 인덱스 문자열(`"0"`, `"1"`...). 클릭 시 id로 스토리지 배열에서 꺼낸다. 제목이 빈 문자열이면 메뉴에는 "빈 제목"으로 표시.
- 설치 시 id `"first"`, 제목 "없음"의 placeholder 메뉴를 하나 만든다. 클릭 핸들러는 `"first"`를 무시한다.

## 데이터 흐름

사이드바 페이지는 스토리지에 직접 쓰지 않고, `whale.runtime.connect({name})` 포트로 background에 메시지를 보낸다. 읽기는 페이지가 `whale.storage.sync.get`으로 직접 한다.

| 포트 이름 | 보내는 곳 | background 동작 |
|---|---|---|
| `save_key_macro` | popup.js 저장 | `key_macro` 저장 |
| `save_cntxt_data` | context_menu_popup.js 저장 | `cntxt_macro_data` 저장 + `initContxtMenu`로 메뉴 전체 재생성 |
| `BACKUP` | popup.js 백업 | 두 데이터를 읽어 `runtime.sendMessage({SIGNAL:"BACKUP_RES", CONTXT, SHORTCUT})` 응답 |
| `UPLOAD` | popup.js 불러오기 | JSON 파싱 후 두 데이터 저장, 메뉴 재생성, `UPLOAD_COMPLETE` / `UPLOAD_FAIL` 신호 |

백업 파일: `whale_txtmacro_backup_<날짜>.txt` (JSON, `{ contxt: {cntxt_macro_data}, shortcut: {key_macro} }`). popup.js가 Blob + `whale.downloads.download`로 내려받는다. 이 형식을 바꾸면 이미 사용자가 가진 백업 파일이 깨지므로 하위 호환을 유지할 것.

## 붙여넣기 동작

단축키/메뉴 클릭 → background가 활성 탭에 `whale.scripting.executeScript`(`allFrames: true`)로 `copyAndPasteTxt(txt)`를 주입한다. 이 함수는 클립보드에 텍스트를 쓰고, `document.activeElement.value += txt`로 **포커스된 요소의 값 끝에 덧붙인다.**

알려진 제약 (고치려면 의도적으로):
- `<input>`/`<textarea>`만 동작. contenteditable, 에디터형 입력창은 안 됨.
- 커서 위치가 아니라 항상 끝에 붙는다. `input` 이벤트를 발생시키지 않아 React 등 프레임워크 입력창은 값이 반영 안 될 수 있다.
- `allFrames: true`라서 여러 프레임에서 실행된다. 포커스 없는 프레임에서는 `activeElement`가 body라 무해하지만 에러가 날 수 있다.
- `readText` 호출은 결과를 쓰지 않는 잔재 코드.

## 매크로 변수

붙여넣기 직전에 background.js의 `applyVariables`가 `{{변수}}`를 치환한다 (괄호 안 공백 무시, 모르는 변수는 원문 유지). 변수 추가는 `MACRO_VARIABLES`에 항목만 넣으면 된다. 현재: `day`(요일, "월요일"), `date`(YYYY-MM-DD), `year`, `month`, `dayofmonth`(0 패딩 없음), `time`(HH:mm), `datetime`, `yesterday`, `tomorrow`(날짜 형식). 모두 로컬 시간 기준.
변수를 추가하면 `scripts/var_modal.js`의 `MACRO_VARIABLE_DOCS`(두 화면 공통 "변수 목록" 모달)도 같이 고친다.

## 알려진 주의점

- 컨텍스트 메뉴는 **저장/불러오기 시에만** 재생성된다 (`initContxtMenu`). `onInstalled`는 `install`일 때만 placeholder를 만들고, 브라우저 시작이나 업데이트 시 메뉴를 복원하는 코드는 없다.
- `background.js`의 `onMessage` 대신 포트 + `runtime.sendMessage` 혼용. 응답은 popup.js의 `whale.runtime.onMessage`가 받는다.
- popup.js, context_menu_popup.js에 선언 없는 전역 변수(`i`, `key`, `data`, `keyOfData`)가 있다. 건드릴 때 `let`으로 바꿔도 무방.
- `getContextData`에서 `Object.keys(...)` 배열을 그대로 `.value`에 대입한다(문자열 변환에 의존).
- 권한은 `host_permissions: *://*/*` 포함 넓은 편. 스토어 심사에 영향이 있으니 늘리지 말 것.
- 단축키 이력: v1.1.0에서 Ctrl+Shift+6~9로 바꿨다가 v1.1.1에서 1~4로 롤백. 단축키 변경은 사용자에게 영향이 크므로 신중히.

## 작업 규칙

- UI 문구와 주석은 한국어. 기존 스타일(2칸 들여쓰기, 큰따옴표, 세미콜론)을 따른다.
- 버전을 올릴 때: manifest.json `version` + README.md 상단에 `### vX.Y.Z` 항목(변경 내용) 추가. 최신이 위. 커밋 메시지 예: `v1.1.1 버전 업, manifest 수정`.
- 브라우저 API는 반드시 `whale.*`를 쓴다. 새 UI는 Bootstrap 3 클래스를 사용하고, 새 의존성은 추가하지 않는다.
- 자동 테스트가 없으므로 변경 후에는 웨일에서 확장을 새로고침해 단축키, 오른쪽 클릭, 백업/불러오기를 직접 확인해야 한다.
