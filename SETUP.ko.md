# 설정 가이드

[English](SETUP.md)

## 사전 요구사항

- **Node.js** 20+
- **npm**
- [Upstash](https://upstash.com/) 무료 계정 (Redis용)
- [Cloudflare](https://cloudflare.com/) 무료 계정 (Workers용)

## 1. 클론 및 설치

```bash
git clone https://github.com/kimjiwook0129/financial-freedom.github.io.git
cd financial-freedom.github.io

# 대시보드 의존성 설치
npm install

# 워커 의존성 설치
cd worker && npm install && cd ..
```

## 2. Upstash Redis 데이터베이스 생성

1. [console.upstash.com/redis](https://console.upstash.com/redis)에 접속
2. **Create Database** 클릭
3. 이름 (예: `financial-freedom-redis`)과 리전 선택
4. 생성 후 **UPSTASH_REDIS_REST_URL**과 **UPSTASH_REDIS_REST_TOKEN** 복사

## 3. 로컬 환경 설정

```bash
# 대시보드 개발 서버용 .env.development 생성
echo 'PUBLIC_API_URL=http://localhost:8787' > .env.development

# 워커 개발 서버용 .dev.vars 생성
cat > worker/.dev.vars << 'EOF'
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
EOF
```

값을 실제 Upstash 자격 증명으로 교체하세요.

## 4. 로컬 실행

**터미널 2개**를 열어주세요:

```bash
# 터미널 1 — 워커 (worker/ 디렉토리에서)
cd worker
npm run dev -- --env dev
# http://localhost:8787에서 실행

# 터미널 2 — 대시보드 (프로젝트 루트에서)
npm run dev
# http://localhost:4321에서 실행
```

브라우저에서 http://localhost:4321/financial-freedom.github.io/ 를 열어주세요.

## 5. 배포

### 대시보드

`main` 브랜치에 푸시하면 GitHub Actions를 통해 GitHub Pages에 자동 배포됩니다.

### 워커

```bash
cd worker
npx wrangler login    # 최초 1회 Cloudflare 인증

# Upstash 시크릿 설정 (최초 1회)
echo "https://your-database.upstash.io" | npx wrangler secret put UPSTASH_REDIS_REST_URL
echo "your-token-here" | npx wrangler secret put UPSTASH_REDIS_REST_TOKEN

# 배포
npm run deploy
```

## 문제 해결

| 문제 | 해결 방법 |
|---|---|
| 저장/공유 버튼이 로컬에서 실패 | 워커가 실행 중인지 (`localhost:8787`), `.env.development`가 있는지 확인 |
| 로컬에서 CORS 오류 | 워커를 `--env dev` 옵션으로 시작했는지 확인 |
| `wrangler deploy` 실패 | 먼저 `npx wrangler login` 실행 |
| 워커가 500 오류 반환 | `npx wrangler secret list`로 Upstash 시크릿이 설정되어 있는지 확인 |
