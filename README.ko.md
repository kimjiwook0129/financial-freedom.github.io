# 경제적 자유 대시보드 / Financial Freedom Dashboard

[English](README.md)

순자산 추이를 시뮬레이션하여 경제적 자유 달성 시점을 예측하는 싱글 페이지 웹 애플리케이션입니다.

## 주요 기능

- 연평균 수익률(CAGR) 기반 순자산 성장 시뮬레이션
- 수입/지출 추이 시뮬레이션 (개별 증가율 설정)
- 경제적 자유 달성 나이 계산 (전방 시뮬레이션)
- 은퇴, 경제적 자유, 자산 소진 시점이 표시되는 인터랙티브 차트
- 원화/달러 통화 전환 (자동 환산: ÷1000 / ×1000)
- 한국어/영어 언어 전환
- 다크/라이트 테마 전환
- 클라우드 기반 짧은 URL로 대시보드 저장 및 공유 (72시간 미사용 시 자동 삭제)
- 모바일/태블릿 반응형 디자인
- 실시간 입력 검증 및 천 단위 콤마 포맷

## 기술 스택

- [Astro](https://astro.build/) v5 — 정적 사이트 프레임워크
- [Tailwind CSS](https://tailwindcss.com/) v3 — 스타일링
- [Chart.js](https://www.chartjs.org/) v4 — 인터랙티브 차트
- [Cloudflare Workers](https://workers.cloudflare.com/) — 상태 저장용 API 프록시
- [Upstash Redis](https://upstash.com/) — 서버리스 키-값 저장소
- [Pretendard](https://github.com/orioncactus/pretendard) — 한국어 웹 폰트

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 빌드 미리보기
npm run preview
```

## 감사의 말

[mickeyhkim.github.io/c](https://mickeyhkim.github.io/c/)에서 영감을 받았습니다.

## 라이선스

[MIT](LICENSE) © 2026 [kimjiwook0129](https://github.com/kimjiwook0129)
