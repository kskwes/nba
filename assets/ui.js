/* ═══════════════════════════════════════════════
   画面の共通部品（全ページ共通）
   ═══════════════════════════════════════════════ */
window.NBA = window.NBA || {};

(function () {
    /* ── 取得に失敗して前回のデータを出しているときのお知らせ（api.js が nba:stale を出す） ── */
    window.addEventListener('nba:stale', () => {
        if (document.querySelector('.stale-note')) return;
        const el = document.createElement('div');
        el.className = 'stale-note';
        el.setAttribute('role', 'status');
        el.innerHTML = '<span data-ja="一部のデータを更新できませんでした。前回のデータを表示しています">Couldn\'t refresh some data. Showing the last saved data.</span><button aria-label="Close">×</button>';
        el.querySelector('button').addEventListener('click', () => el.remove());
        document.body.appendChild(el);
    });

    /* ── URL パラメータ ── */
    NBA.url = {
        get: name => new URLSearchParams(location.search).get(name),
        // 値が null / '' のパラメータは消す。push=false なら履歴を増やさない
        set(params, push = false) {
            const url = new URL(location.href);
            Object.entries(params).forEach(([k, v]) => {
                if (v == null || v === '') url.searchParams.delete(k); else url.searchParams.set(k, v);
            });
            if (url.href === location.href) return;
            history[push ? 'pushState' : 'replaceState'](history.state, '', url);
        },
    };

    // NBA のシーズン年（10月以降は翌年。2026-27 シーズン → 2027）
    const now = new Date();
    NBA.SEASON = now.getMonth() >= 9 ? now.getFullYear() + 1 : now.getFullYear();

    /* ── 列見出しをクリックして並び替える表 ──
       th[data-key] が並び替えられる列。行のデータと描画関数を渡す
       cols: [{ key, label, get: row => 値, asc: 小さい順が良いか, cls, title: 見出しの説明 }]
       render(row, cols) は <tr> の HTML を返す */
    NBA.ui = NBA.ui || {};
    NBA.ui.sortable = function (wrap, { rows, cols, render, head, initial, onSort }) {
        let sortKey = initial?.key ?? null, asc = initial?.asc ?? false;
        const val = (r, c) => { const v = c.get(r); return v == null || (typeof v === 'number' && isNaN(v)) ? null : v; };
        function draw() {
            const col = cols.find(c => c.key === sortKey);
            const sorted = col ? [...rows].sort((a, b) => {
                const x = val(a, col), y = val(b, col);
                if (x == null && y == null) return 0;
                if (x == null) return 1;           // 値なしは常に下
                if (y == null) return -1;
                const d = typeof x === 'string' ? x.localeCompare(y) : x - y;
                return asc ? d : -d;
            }) : rows;
            const th = cols.map(c => {
                if (c.sort === false) return `<th class="${c.cls || ''}">${c.label}</th>`;
                const on = c.key === sortKey;
                return `<th class="sortable ${c.cls || ''} ${on ? 'sorted' : ''} ${on && asc ? 'asc' : ''}" data-key="${c.key}" title="${c.title ? `${c.title}\n(Click to sort)` : 'Click to sort'}">${c.label}</th>`;
            }).join('');
            wrap.querySelector('thead').innerHTML = `<tr>${head || ''}${th}</tr>`;
            wrap.querySelector('tbody').innerHTML = sorted.map((r, i) => render(r, i, col)).join('');
        }
        wrap.querySelector('thead').addEventListener('click', e => {
            const th = e.target.closest('th[data-key]');
            if (!th) return;
            const col = cols.find(c => c.key === th.dataset.key);
            // 1回目は「良い方が上」、同じ列をもう一度押すと逆順
            if (sortKey === col.key) asc = !asc; else { sortKey = col.key; asc = !!col.asc; }
            draw();
            onSort?.(sortKey, asc);
        });
        draw();
        return { redraw: draw, set(r) { rows = r; draw(); } };
    };
})();

/* ═══════════════════════════════════════════════
   ヘッダーの共通部品（2026-11 リニューアル）
   ・全体検索（選手・チーム。/ キーで開く）
   ・データの鮮度: ESPN を取得した時刻と、分析データ（advanced.json）の対象期間
   ・日本語訳: data-ja を持つ要素に JA ボタンを付ける（後から描画された要素にも自動で付く）
   ═══════════════════════════════════════════════ */
(function () {
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const ABBR_FIX = { NY: 'NYK', GS: 'GSW', NO: 'NOP', SA: 'SAS', UTAH: 'UTA', WSH: 'WAS' };
    const fixAbbr = a => ABBR_FIX[a] || a;
    const TEAM_IDS = Array.from({ length: 30 }, (_, i) => String(i + 1));   // ESPN のチームID（1〜30）

    /* ── 分析データ（advanced.json）。advanced.js と共有して二重に取得しない ── */
    NBA.data = NBA.data || {};
    let advPromise = null;
    NBA.data.advanced = () => advPromise ||= fetch('../data/advanced.json', { cache: 'no-cache' })
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .catch(e => { advPromise = null; throw e; });

    /* ── データの鮮度 ── */
    let fetchedAt = null;
    // ESPN のデータを表示し終えたときに各ページが呼ぶ
    NBA.ui.fetched = (d = new Date()) => { fetchedAt = d; drawFresh(); };
    let anaMeta = null;
    const hhmm = d => d.toLocaleTimeString('en-GB', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit' });
    function drawFresh() {
        const box = document.querySelector('.fresh');
        if (!box) return;
        const espn = fetchedAt
            ? `<span class="fresh-chip" title="Last fetched from ESPN (games, stats, standings, injuries)"><i></i>ESPN<span class="long">&nbsp;${hhmm(fetchedAt)}</span></span>` : '';
        let ana = '';
        if (anaMeta) {
            const to = anaMeta.to, end = new Date(+to.slice(0, 4), +to.slice(4, 6) - 1, +to.slice(6, 8));
            const days = Math.floor((Date.now() - end) / 864e5);
            const lv = days >= 7 ? 'stale' : days >= 3 ? 'warn' : '';
            const at = new Date(anaMeta.generatedAt).toLocaleString('en-US', { timeZone: 'Asia/Tokyo', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' });
            ana = `<span class="fresh-chip ${lv}" title="Analytics data covers ${+anaMeta.from.slice(4, 6)}/${+anaMeta.from.slice(6)}–${+to.slice(4, 6)}/${+to.slice(6)} (${anaMeta.games} games). Updated ${at}"><i></i>Analytics<span class="long">&nbsp;thru ${+to.slice(4, 6)}/${+to.slice(6)} (${days}d ago)</span></span>`;
        }
        box.innerHTML = espn + ana;
    }

    /* ── 全体検索 ── */
    let index = null, indexPromise = null;
    function loadIndex() {
        if (indexPromise) return indexPromise;
        const ids = NBA.teams?.ids || TEAM_IDS;
        indexPromise = Promise.allSettled(ids.map(id => NBA.api.roster(id))).then(rs => {
            const players = [], teams = [];
            for (const r of rs) {
                if (r.status !== 'fulfilled') continue;
                const t = r.value.team || {}, abbr = fixAbbr(t.abbreviation || '');
                if (abbr) teams.push({ kind: 'team', name: t.displayName || '', sub: abbr, abbr, logo: t.logo || t.logos?.[0]?.href || '' });
                for (const p of r.value.athletes || []) players.push({ kind: 'player', id: String(p.id), name: p.displayName || p.fullName || '', sub: [abbr, p.position?.abbreviation].filter(Boolean).join(' · '), img: p.headshot?.href || '' });
            }
            index = [...teams, ...players];
            return index;
        });
        return indexPromise;
    }
    const href = it => it.kind === 'team' ? `../teams/team.html?team=${encodeURIComponent(it.abbr)}` : `../players/player.html?id=${encodeURIComponent(it.id)}`;

    function initSearch(right) {
        const box = document.createElement('div');
        box.className = 'gsearch';
        box.innerHTML = '<input type="search" placeholder="Search players &amp; teams" aria-label="Search players and teams" autocomplete="off"><kbd>/</kbd><ul role="listbox"></ul>';
        right.prepend(box);
        const inp = box.querySelector('input'), ul = box.querySelector('ul');
        let sel = 0, hits = [];
        const draw = () => {
            const q = inp.value.trim().toLowerCase();
            if (!q) { box.classList.remove('open'); return; }
            if (!index) { ul.innerHTML = '<li class="msg-li">Loading…</li>'; box.classList.add('open'); return; }
            hits = index.filter(it => (it.name + ' ' + it.sub).toLowerCase().includes(q)).slice(0, 8);
            ul.innerHTML = hits.length ? hits.map((h, i) => `<li class="${i === sel ? 'sel' : ''}"><a href="${href(h)}">
                ${h.img || h.logo ? `<img src="${esc(h.img || h.logo)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">` : '<span class="ph"></span>'}
                <span class="nm">${esc(h.name)}</span><span class="sub">${esc(h.sub)}</span></a></li>`).join('')
                : '<li class="msg-li">No results</li>';
            box.classList.add('open');
        };
        inp.addEventListener('focus', () => loadIndex().then(draw));
        inp.addEventListener('input', () => { sel = 0; draw(); });
        inp.addEventListener('keydown', e => {
            if (e.key === 'ArrowDown') { sel = Math.min(sel + 1, hits.length - 1); draw(); e.preventDefault(); }
            else if (e.key === 'ArrowUp') { sel = Math.max(sel - 1, 0); draw(); e.preventDefault(); }
            else if (e.key === 'Enter' && hits[sel]) location.href = href(hits[sel]);
            else if (e.key === 'Escape') { inp.value = ''; draw(); inp.blur(); }
        });
        inp.addEventListener('blur', () => setTimeout(() => box.classList.remove('open'), 150));
        document.addEventListener('keydown', e => {
            if (e.key !== '/' || e.metaKey || e.ctrlKey) return;
            const tag = document.activeElement?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || document.activeElement?.isContentEditable) return;
            e.preventDefault(); inp.focus();
        });
    }

    /* ── 日本語訳（JA ボタン）──
       マウスを乗せると訳が吹き出しで出る。押すと文章の下に訳を固定表示（もう一度押すと消える） */
    function addJa(root) {
        if (!root.querySelectorAll) return;
        const els = root.matches?.('[data-ja]') ? [root, ...root.querySelectorAll('[data-ja]')] : root.querySelectorAll('[data-ja]');
        els.forEach(el => {
            if (!el.dataset.ja || el.querySelector(':scope > .ja-btn')) return;
            const b = document.createElement('button');
            b.type = 'button'; b.className = 'ja-btn'; b.textContent = 'JA';
            b.setAttribute('aria-label', 'Japanese translation'); b.dataset.tip = el.dataset.ja;
            el.append(b);
        });
    }
    NBA.ui.ja = addJa;
    document.addEventListener('click', e => {
        const b = e.target.closest('.ja-btn');
        if (!b) return;
        e.preventDefault(); e.stopPropagation();
        const el = b.parentElement, line = el.querySelector(':scope > .ja-line');
        if (line) { line.remove(); b.classList.remove('on'); }
        else { const s = document.createElement('span'); s.className = 'ja-line'; s.textContent = el.dataset.ja; el.append(s); b.classList.add('on'); }
    }, true);

    function init() {
        const right = document.querySelector('header .header-right');
        if (right) {
            initSearch(right);
            const fresh = document.createElement('div');
            fresh.className = 'fresh';
            right.querySelector('.last-updated')?.replaceWith(fresh);
            const btn = right.querySelector('.refresh-btn'); if (btn) right.append(btn);
            drawFresh();
            NBA.data.advanced().then(d => { anaMeta = { generatedAt: d.generatedAt, from: d.from, to: d.to, games: d.games }; drawFresh(); }).catch(() => {});
        }
        addJa(document.body);
        new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => n.nodeType === 1 && !n.classList?.contains('ja-line') && addJa(n))))
            .observe(document.body, { childList: true, subtree: true });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

/* ═══════════════════════════════════════════════
   段階2の共通部品
   ・NBA.ui.src.live(text) / .ana(meta) / .file(text): 出どころと期間のバッジの HTML
   ・NBA.ui.secnav(nav): ページ内の目次。nav の中の <a href="#id"> と、id を持つセクション（data-sec を付ける）を結び、今いる位置を光らせる
   ═══════════════════════════════════════════════ */
(function () {
    const md = s => `${+s.slice(4, 6)}/${+s.slice(6, 8)}`;
    NBA.ui.src = {
        // ESPN からその場で取った数字。text 省略時は「ESPN · 2026-27」
        live: (text) => `<span class="src live" title="Fetched from ESPN on page load">${text || `ESPN · ${NBA.SEASON - 1}-${String(NBA.SEASON).slice(2)}`}</span>`,
        // 分析データ（advanced.json / assists.json）。meta は { from, to, games }、extra は「· 8 GP」など
        ana: (meta, extra = '') => {
            if (!meta) return '';
            const to = meta.to, end = new Date(+to.slice(0, 4), +to.slice(4, 6) - 1, +to.slice(6, 8));
            const days = Math.floor((Date.now() - end) / 864e5);
            const lv = days >= 7 ? 'stale' : days >= 3 ? 'warn' : '';
            return `<span class="src ana ${lv}" title="Analytics data: ${md(meta.from)}–${md(to)}, ${meta.games} games (${days}d ago)">Analytics · ${md(meta.from)}–${md(to)} · ${meta.games} games${extra ? ` · ${extra}` : ''}</span>`;
        },
        file: (text) => `<span class="src file">${text}</span>`,
    };

    NBA.ui.secnav = function (nav) {
        if (!nav) return;
        const links = [...nav.querySelectorAll('a[href^="#"]')];
        const io = new IntersectionObserver(es => es.forEach(e => {
            if (!e.isIntersecting) return;
            links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
            nav.querySelector('a.on')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }), { rootMargin: '-120px 0px -70% 0px' });
        links.forEach(a => { const s = document.getElementById(a.getAttribute('href').slice(1)); if (s) io.observe(s); });
    };
})();
