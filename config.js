// Alamat backend (Cloudflare Worker + D1). Ganti NAMA dengan subdomain workers.dev Anda.
window.API_BASE = 'https://royal-roulette-api.nurmuhammadkhafi2267.workers.dev';
window.CF_MODE = true;      // putaran dan penyelesaian taruhan dilakukan server
window.POLL_MS = 6000;      // jeda pembaruan data (ms). Makin besar makin hemat kuota, makin lambat chat.
