# LK 폴리머 홈페이지

LK 폴리머 회사 홈페이지의 기본 정적 사이트입니다.

## 구성

- `index.html`: 메인 페이지
- `about-*.html`: 회사소개
- `products-*.html`: 제품소개
- `factory-*.html`: 공장소개
- `certification.html`: 인증현황
- `contact-*.html`: 연락문의
- `assets/css/style.css`: 공통 스타일
- `assets/js/site.js`: 햄버거 메뉴 스크립트

## GitHub Pages 배포 방법

1. GitHub에서 새 저장소를 생성합니다.
2. 현재 폴더의 파일을 저장소 루트에 업로드합니다.
3. GitHub 저장소의 `Settings > Pages`로 이동합니다.
4. `Build and deployment`에서 브랜치를 선택합니다.
5. 보통 `main` 브랜치의 `/root`를 선택하면 됩니다.
6. 저장 후 잠시 기다리면 배포 주소가 생성됩니다.

## 수정 포인트

- 회사 정보: 각 페이지 하단 푸터 문구
- 메인 소개 문구: `index.html`
- 메뉴별 상세 문구: 각 HTML 파일 본문
- 색상/레이아웃: `assets/css/style.css`

## 참고

현재 문의 폼은 디자인용 정적 폼입니다. 실제 접수를 받으려면 이메일 연동, Formspree, Netlify Forms, 자체 백엔드 등의 추가 연결이 필요합니다.
