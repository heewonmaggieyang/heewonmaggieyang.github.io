# Heewon Yang — academic website

GitHub Pages용 개인 학술 홈페이지입니다. 별도 빌드나 패키지 설치 없이 작동합니다.

홈페이지 주소: https://heewonmaggieyang.github.io/

## 파일 수정

- `index.html`: 소개, 논문 제목과 공저자, 학회 발표
- `assets/style.css`: 글꼴, 색상, 간격, 모바일 화면
- `assets/fonts/`: 홈페이지에서 직접 제공하는 Lato Regular, Italic, Bold 및 SIL Open Font License. 본문은 18px이며 제목과 보조 정보도 함께 확대했습니다.
- `assets/cv_heewon_yang.pdf`: 공개 CV. CV를 수정한 뒤 이 파일도 갱신합니다.
- `assets/favicon.svg`: 브라우저 탭 아이콘
- `assets/photo4.jpg`: 프로필 사진. 원본 파일을 유지하고 CSS로 표시 영역을 조정합니다.
- `assets/papers/sme-policy-draft.pdf`: SME 정책 논문 초안 (2026년 8월)
- `assets/papers/exchange-rates-draft.pdf`: 환율 논문 영문 초안 (2026년 10월)

논문은 현재 CV의 Working Papers / Work in Progress 분류를 유지합니다. Working Papers 두 편에는 공저자 아래에 PDF 초안 링크와 초안 날짜를 표시합니다.

프로필 사진은 `Yonsei/PhD Application/photo4.jpg`에서 가져왔습니다. 첫 논문은 `epc_2025/03 발표 자료/2026년 10월 16일-midewest/midwest_draft_v1.pdf`, 두 번째는 `TEC/06 보고서/english_draft_v3/paper_draft_v3_en.pdf`의 사본입니다. PDF 내용은 수정하지 않았습니다. 첫 초안의 표제는 "The Impact of SME Support on Supply Chain Networks"이며, 홈페이지 제목은 기존 CV 기준 표기를 유지합니다.

## GitHub Pages 배포

1. GitHub의 `heewonmaggieyang` 계정에 `heewonmaggieyang.github.io` 저장소를 생성합니다. 기존 저장소가 있다면 먼저 내용을 확인하고 합칩니다.
2. 이 폴더의 파일을 `main` 브랜치에 올립니다.
3. 저장소 Settings → Pages → Build and deployment에서 **Deploy from a branch**를 선택합니다.
4. Branch는 **main**, 폴더는 **/ (root)**로 설정하고 저장합니다.
5. 배포 완료 후 https://heewonmaggieyang.github.io/ 를 확인합니다.

GitHub 공식 안내: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

## 구성

Eva Lestant의 학술 홈페이지를 참고해 프로필 사이드바, 여백, 연구 분류 중심의 구조를 새로 구현했습니다. 다른 연구자의 사진·소개·논문 내용은 포함하지 않았습니다. 개인정보와 연구 내용의 기준은 본인의 CV 및 제공한 SOP입니다.

Lato는 Google Fonts의 배포 파일을 저장소에 포함하여 제공합니다. 방문 시 외부 글꼴 서비스에 연결하지 않습니다. 홈페이지는 분석 추적 도구, 폼, 쿠키를 사용하지 않습니다. GitHub Pages 외에도 정적 파일 호스팅에서 작동합니다.

## Richmond ED 지도

`research/richmond/`는 1940·1950년 Richmond ED 디지털화 작업의 공개용 인터랙티브 경계 지도입니다. 별도 서버나 외부 JavaScript 라이브러리가 필요하지 않습니다.

홈페이지의 Work in Progress에 있는 “It Takes a Village to Raise a Child” 프로젝트 공저자 아래에 지도 링크를 배치합니다. 별도 Research Resources 섹션은 사용하지 않습니다.

- 원본 작업 위치: `names_local/outputs/richmond_ed_pilot`의 2026-10-28 경계 결과물.
- 1940년 22개, 1950년 122개 경계 및 공개 설명·지도 출처를 포함합니다. 151개 ED의 인구통계 집계를 함께 제공하며 개인·가구 레코드와 식별자는 포함하지 않습니다.
- 지도는 동기화된 확대·이동, ED 선택, 도로·라벨·조선소 레이어, 원본 설명 링크와 GeoJSON 다운로드를 지원합니다.
- 1940년 7-62·7-63·7-80은 낮은 확신도의 잠정 경계로 표시합니다. 1950년 전체 129개 중 7개는 공개 경계가 없습니다. 방법과 범위는 페이지에 설명되어 있습니다.
- `map-data.js`와 두 GeoJSON은 허용한 지리·출처 필드만 추출한 공개용 사본입니다. 원본 `data.js`, `full_count_*`, 검토 전 통계 파일은 업로드하지 않습니다.
- `ed_descriptives_data.js`, `ed_summary.csv`, `ed_categories.csv`는 원본 프로젝트의 검토·소규모 셀 처리가 적용된 집계 결과를 그대로 사용합니다. `demographics.js`가 지표별 지도 색상, ED 통계 카드와 분포 표를 표시합니다. 경계가 없는 1950년 7개 ED도 메뉴에서 통계를 조회할 수 있습니다.
- 기본 지도 범위는 원본 작업과 동일한 `Common reconstructed area`입니다. `comparison-data.js`와 `ed-1940-common.geojson`·`ed-1950-common.geojson`에 기존 공통 표시 경계를 보존합니다. 두 연도에 같은 마스크를 적용하며, 인구통계는 잘린 부분으로 배분하지 않고 전체 ED 기준으로 유지합니다. 메뉴에서 전체 원래 경계로 전환할 수 있습니다.
