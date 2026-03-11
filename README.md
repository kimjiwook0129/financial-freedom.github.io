# Financial Freedom Dashboard / 경제적 자유 대시보드

[한국어](README.ko.md)

A single-page financial freedom dashboard that projects your net worth over time and estimates when you can achieve financial independence.

## Features

- Net worth projection with compound growth (CAGR)
- Income/expense trend simulation with individual growth rates
- Financial freedom age calculation (full forward simulation)
- Interactive charts with annotated milestones (retirement, financial freedom, asset depletion)
- KRW/USD currency toggle with automatic value conversion (÷1000 / ×1000)
- Korean/English language toggle
- Shareable dashboard via compact URL encoding
- Responsive design with condensed navbar on mobile/tablet
- Comma-formatted money inputs with real-time validation

## Tech Stack

- [Astro](https://astro.build/) v5 — static site framework
- [Tailwind CSS](https://tailwindcss.com/) v3 — styling
- [Chart.js](https://www.chartjs.org/) v4 — interactive charts
- [Pretendard](https://github.com/orioncactus/pretendard) — Korean web font

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Acknowledgements

Inspired by [mickeyhkim.github.io/c](https://mickeyhkim.github.io/c/)

## License

[MIT](LICENSE) © 2026 [kimjiwook0129](https://github.com/kimjiwook0129)
