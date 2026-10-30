# 설정 가이드

[English](SETUP.md)

## 사전 요구사항

- **Node.js** 20+
- **npm**

## 1. 클론 및 설치

```bash
git clone https://github.com/kimjiwook0129/financial-freedom.github.io.git
cd financial-freedom.github.io
npm install
```

## 2. 로컬 실행

```bash
npm run dev
# http://localhost:4321에서 실행
```

브라우저에서 http://localhost:4321/financial-freedom.github.io/ 를 열어주세요.

## 3. 배포

`main` 브랜치에 푸시하면 GitHub Actions를 통해 GitHub Pages에 자동 배포됩니다.

## 워커 (선택 사항, 현재 미사용)

`worker/` 디렉토리에는 이전 저장/공유 기능에서 쓰던 Cloudflare Worker + Upstash Redis 백엔드가 들어 있습니다. 웹 클라이언트는 더 이상 이 워커를 호출하지 않으며, 추후 기능을 되살릴 경우를 위해 남겨둔 것입니다. 워커 작업을 하는 경우가 아니라면 이 섹션은 건너뛰세요.

추가 사전 요구사항: [Upstash](https://upstash.com/) 무료 계정 (Redis용), [Cloudflare](https://cloudflare.com/) 무료 계정 (Workers용).

### Upstash Redis 데이터베이스 생성

1. [console.upstash.com/redis](https://console.upstash.com/redis)에 접속
2. **Create Database** 클릭
3. 이름 (예: `financial-freedom-redis`)과 리전 선택
4. 생성 후 **UPSTASH_REDIS_REST_URL**과 **UPSTASH_REDIS_REST_TOKEN** 복사

### 로컬 실행

```bash
cd worker && npm install

cat > .dev.vars << 'EOF'
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
EOF

npm run dev -- --env dev
# http://localhost:8787에서 실행
```

값을 실제 Upstash 자격 증명으로 교체하세요.

### 배포

```bash
cd worker
npx wrangler login    # 최초 1회 Cloudflare 인증

# Upstash 시크릿 설정 (최초 1회)
echo "https://your-database.upstash.io" | npx wrangler secret put UPSTASH_REDIS_REST_URL
echo "your-token-here" | npx wrangler secret put UPSTASH_REDIS_REST_TOKEN

npm run deploy
```

### 문제 해결

| 문제 | 해결 방법 |
|---|---|
| 로컬에서 CORS 오류 | 워커를 `--env dev` 옵션으로 시작했는지 확인 |
| `wrangler deploy` 실패 | 먼저 `npx wrangler login` 실행 |
| 워커가 500 오류 반환 | `npx wrangler secret list`로 Upstash 시크릿이 설정되어 있는지 확인 |
