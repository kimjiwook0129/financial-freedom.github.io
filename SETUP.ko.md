# 설정 가이드

[English](SETUP.md)

## 사전 요구사항

- **Node.js** 20+
- **npm**
- **ejson** — `brew install ejson`
- **jq** — `brew install jq`
- **wrangler** (`worker/`에서 `npm install` 시 자동 설치)

시크릿 복호화를 위해 팀원에게 **ejson 개인 키**를 받아야 합니다.

## 1. 클론 및 설치

```bash
git clone https://github.com/kimjiwook0129/financial-freedom.github.io.git
cd financial-freedom.github.io

# 대시보드 의존성 설치
npm install

# 워커 의존성 설치
cd worker && npm install && cd ..
```

## 2. ejson 개인 키 설정

팀원에게 개인 키를 받으세요. 공개 키는 `4f7160f09230a06b6731427d41e0b0fbb56b2433d3bf7a673cd57824e5ff5179`입니다.

```bash
sudo mkdir -p /opt/ejson/keys
sudo sh -c 'echo "여기에_개인_키_입력" > /opt/ejson/keys/4f7160f09230a06b6731427d41e0b0fbb56b2433d3bf7a673cd57824e5ff5179'
```

정상 동작 확인:

```bash
./decrypt_ejson.sh
# 출력: [OK] .env.ejson → .env
```

## 3. 로컬 환경 설정

복호화 후 로컬 개발용 파일을 생성합니다:

```bash
# 대시보드 개발 서버용 .env.development 생성
echo 'PUBLIC_API_URL=http://localhost:8787' > .env.development

# 워커 개발 서버용 .dev.vars 생성 (.env에서 값 복사)
cp .env worker/.dev.vars
```

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
npm run deploy        # 프로덕션 배포
```

Upstash 시크릿은 이미 Cloudflare 시크릿으로 설정되어 있습니다. 업데이트가 필요한 경우:

```bash
cd worker
echo "새_값" | npx wrangler secret put UPSTASH_REDIS_REST_URL
echo "새_값" | npx wrangler secret put UPSTASH_REDIS_REST_TOKEN
```

## 문제 해결

| 문제 | 해결 방법 |
|---|---|
| `./decrypt_ejson.sh` 실패 | `/opt/ejson/keys/<공개_키>` 경로에 개인 키가 있는지 확인 |
| 저장/공유 버튼이 로컬에서 실패 | 워커가 실행 중인지 (`localhost:8787`), `.env.development`가 있는지 확인 |
| 로컬에서 CORS 오류 | 워커를 `--env dev` 옵션으로 시작했는지 확인 |
| `wrangler deploy` 실패 | 먼저 `npx wrangler login` 실행 |
