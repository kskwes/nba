/* ═══════════════════════════════════════════════
   ESPN API の取得とキャッシュ（全ページ共通）
   ・取得結果は IndexedDB に保存し、ページを移動しても使い回す
   ・有効期間はデータの種類ごとに決める（終わった試合は長く、試合中は短く）
   ・取得に失敗したら前回のデータを返し、画面にお知らせを出す
   IndexedDB が使えない環境（プライベートウィンドウなど）ではメモリだけで動く
   ═══════════════════════════════════════════════ */
window.NBA = window.NBA || {};

(function () {
    const SEC = 1000, MIN = 60 * SEC, HOUR = 60 * MIN, DAY = 24 * HOUR;
    const DB_NAME = 'nba-cache', STORE = 'responses';
    // 期限切れのデータも、取得失敗時の代わりとしてこの期間は残す
    const KEEP_STALE = 7 * DAY;

    const SITE = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';
    const URLS = {
        scoreboard: ymd => `${SITE}/scoreboard?dates=${ymd}&limit=25`,
        scoreboardToday: () => `${SITE}/scoreboard`,
        summary: id => `${SITE}/summary?event=${id}`,
        standings: season => `https://site.api.espn.com/apis/v2/sports/basketball/nba/standings${season ? `?season=${season}` : ''}`,
        roster: teamId => `${SITE}/teams/${teamId}/roster`,
        schedule: (teamId, q = '') => `${SITE}/teams/${teamId}/schedule${q}`,
        teamStats: (teamId, year) => `https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/seasons/${year}/types/2/teams/${teamId}/statistics`,
        athlete: id => `https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/${id}`,
        athleteStats: id => `https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/${id}/stats`,
        gamelog: id => `https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/${id}/gamelog`,
        leaders: q => `https://site.api.espn.com/apis/common/v3/sports/basketball/nba/statistics/byathlete?${q}`,
    };

    /* ── IndexedDB（失敗したら null を返し、メモリだけで続ける） ── */
    let dbPromise = null;
    function db() {
        if (!dbPromise) {
            dbPromise = new Promise(resolve => {
                try {
                    const req = indexedDB.open(DB_NAME, 1);
                    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
                    req.onsuccess = () => resolve(req.result);
                    req.onerror = () => resolve(null);
                    req.onblocked = () => resolve(null);
                } catch (e) { resolve(null); }
            });
            dbPromise.then(prune);
        }
        return dbPromise;
    }
    async function idb(mode, fn) {
        const d = await db();
        if (!d) return null;
        return new Promise(resolve => {
            try {
                const tx = d.transaction(STORE, mode);
                const req = fn(tx.objectStore(STORE));
                tx.oncomplete = () => resolve(req?.result ?? null);
                tx.onerror = tx.onabort = () => resolve(null);
            } catch (e) { resolve(null); }
        });
    }
    const idbGet = key => idb('readonly', s => s.get(key));
    const idbPut = (key, val) => idb('readwrite', s => s.put(val, key));

    // 期限が切れて KEEP_STALE を過ぎたものを消す（ページを開いたときに1回）
    function prune(d) {
        if (!d) return;
        try {
            const now = Date.now();
            const tx = d.transaction(STORE, 'readwrite');
            tx.objectStore(STORE).openCursor().onsuccess = e => {
                const c = e.target.result;
                if (!c) return;
                if (!c.value?.exp || c.value.exp + KEEP_STALE < now) c.delete();
                c.continue();
            };
        } catch (e) { /* 消せなくても動作は続ける */ }
    }

    /* ── 取得失敗のお知らせ ── */
    let staleShown = false;
    function notifyStale() {
        if (staleShown) return;
        staleShown = true;
        window.dispatchEvent(new CustomEvent('nba:stale'));
    }

    /* ── 本体 ── */
    const mem = new Map();       // url → { data, exp }
    const inflight = new Map();  // url → Promise（同じURLの同時取得をまとめる）

    // opts.ttl: 有効期間（ms）か、取得したデータから期間を決める関数。0 なら保存しない
    // opts.trim: 保存前に要らない部分を落とす関数
    // opts.fresh: true ならキャッシュを見ずに取り直す（失敗時は前回のデータを返す）
    // opts.maxAge: 期限切れでも、保存からこの時間内なら使う（怪我人など細かく追わなくてよい用途）
    async function json(url, opts = {}) {
        const usable = e => !opts.fresh && e && (e.exp > Date.now() || (opts.maxAge && Date.now() - e.t < opts.maxAge));
        const hit = mem.get(url);
        if (usable(hit)) return hit.data;
        if (inflight.has(url)) return inflight.get(url);

        const p = (async () => {
            let stored = hit || null;
            if (!stored) {
                stored = await idbGet(url);
                if (stored) mem.set(url, stored);
            }
            if (usable(stored)) return stored.data;
            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                let data = await res.json();
                if (opts.trim) data = opts.trim(data);
                const ttl = typeof opts.ttl === 'function' ? opts.ttl(data) : (opts.ttl ?? 5 * MIN);
                const entry = { data, exp: Date.now() + ttl, t: Date.now() };
                mem.set(url, entry);
                if (ttl > 0) idbPut(url, entry);
                return data;
            } catch (e) {
                if (stored) { notifyStale(); return stored.data; }
                throw e;
            }
        })();
        inflight.set(url, p);
        try { return await p; } finally { inflight.delete(url); }
    }

    /* ── データの種類ごとの取得（有効期間をここで決める） ── */
    const evState = ev => ev?.status?.type?.state || ev?.competitions?.[0]?.status?.type?.state;
    const evDone = ev => !!(ev?.status?.type?.completed || ev?.competitions?.[0]?.status?.type?.completed);

    // その日の試合: 全試合終了なら長く、試合中は30秒、開始前は5分
    function scoreboardTtl(d) {
        const evs = d?.events || [];
        if (evs.length && evs.every(evDone)) return 60 * DAY;
        if (evs.some(e => evState(e) === 'in')) return 30 * SEC;
        return 5 * MIN;
    }
    const scoreboard = (ymd, opts = {}) => json(URLS.scoreboard(ymd), { ttl: scoreboardTtl, ...opts })
        .then(d => d?.events || []);

    // 試合の summary: 終了後は7日、試合中は20秒、開始前は10分。ニュースや動画は保存しない
    const SUMMARY_DROP = ['news', 'article', 'videos', 'ticketsInfo', 'odds', 'pickcenter', 'againstTheSpread', 'meta'];
    const summary = (id, opts = {}) => json(URLS.summary(id), {
        ttl: d => {
            const st = d?.header?.competitions?.[0]?.status?.type;
            return st?.completed ? 7 * DAY : st?.state === 'in' ? 20 * SEC : 10 * MIN;
        },
        trim: d => { SUMMARY_DROP.forEach(k => delete d[k]); return d; },
        ...opts,
    });

    NBA.api = {
        SEC, MIN, HOUR, DAY, URLS, json,
        scoreboard,
        summary,
        standings: season => json(URLS.standings(season), { ttl: 10 * MIN }),
        roster: teamId => json(URLS.roster(teamId), { ttl: DAY }),
        schedule: (teamId, q = '') => json(URLS.schedule(teamId, q), { ttl: HOUR }),
        teamStats: (teamId, year) => json(URLS.teamStats(teamId, year), { ttl: 6 * HOUR }),
        athlete: id => json(URLS.athlete(id), { ttl: DAY }),
        athleteStats: id => json(URLS.athleteStats(id), { ttl: 3 * HOUR }),
        gamelog: id => json(URLS.gamelog(id), { ttl: HOUR }),
        leaders: q => json(URLS.leaders(q), { ttl: HOUR }),
    };
})();
