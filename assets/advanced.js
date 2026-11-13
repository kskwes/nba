/* ═══════════════════════════════════════════════
   リーグ全体の分析データ（data/advanced.json）の表示
   Teams ページの Advanced タブ・チームページ（On/Off・ラインナップ・Clutch・Team Style）と、選手ページ（Player Profile）で共通
   advanced.json はローカルの nba-tools/aggregate.js が書き出す（更新は手動）
   必要なもの: assets/teams.js（NBA.link・esc）、assets/ui.js（NBA.ui.sortable）
   ═══════════════════════════════════════════════ */
window.NBA = window.NBA || {};

(function () {
    const STALE_DAYS = 7;   // これより古い集計は注意の色にする

    // 更新のたびに中身が変わるので、ブラウザのキャッシュを使わずに確かめる（変わっていなければ通信は小さい）
    // ヘッダーの鮮度表示（ui.js の NBA.data.advanced）と同じ取得を使い、二重に取得しない
    let promise = null;
    const load = () => NBA.data?.advanced ? NBA.data.advanced() : (promise ||= fetch('../data/advanced.json', { cache: 'no-cache' })
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .catch(e => { promise = null; throw e; }));

    const rating = (pts, poss) => poss > 0 ? 100 * pts / poss : null;
    const f1 = v => v == null || isNaN(v) ? '-' : v.toFixed(1);
    const sgn = v => v == null || isNaN(v) ? '-' : (v > 0 ? '+' : '') + v.toFixed(1);
    const cls = v => v > 0 ? 'pos' : v < 0 ? 'neg' : '';
    const mmss = sec => `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, '0')}`;
    const ymd = s => s ? `${+s.slice(4, 6)}/${+s.slice(6, 8)}` : '-';

    // 「集計: 10/28 9:42 時点（10/20〜10/26 の52試合）」。STALE_DAYS より古ければ注意の色と一言
    function updatedHTML(d) {
        const at = new Date(d.generatedAt);
        const days = (Date.now() - at) / 864e5;
        // 「11/12 9:17 AM」の形（en-US の「11/12, 9:17 AM」からカンマを除く）
        const when = at.toLocaleString('en-US', { timeZone: 'Asia/Tokyo', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' }).replace(',', '');
        const old = Math.floor(days);
        return `<div class="adv-updated ${days >= STALE_DAYS ? 'stale' : ''}">Analytics: ${ymd(d.from)}–${ymd(d.to)} · ${d.games} games (updated ${when})${
            days >= STALE_DAYS ? ` · <span data-ja="${old}日前の集計です。データの更新が必要です">${old} days old. Needs an update.</span>` : ''}</div>`;
    }

    // 分析データのバッジ（ui.js の NBA.ui.src.ana）。title に集計した日時を足す
    function anaBadge(d, extra) {
        const html = NBA.ui?.src?.ana ? NBA.ui.src.ana(d, extra) : '';
        if (!html || !d.generatedAt) return html;
        const when = new Date(d.generatedAt).toLocaleString('en-US', { timeZone: 'Asia/Tokyo', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' }).replace(',', '');
        return html.replace(/title="([^"]*)"/, (m, t) => `title="${t}. Updated ${when} JST"`);
    }

    /* ── サンプルが少ない行の下限（この値未満の行は tr.low で薄く表示） ── */
    const ONOFF_MIN_OPTS = [60, 150, 300];   // On/Off: On と Off の両方にかける最低出場時間（分）
    const ONOFF_LOW = 150;                   // その初期値
    const UNIT_LOW = 20;                     // ラインナップ: 出場20分未満
    const CLUTCH_LOW = 15;                   // Clutch: 15分未満
    // Player Profile の On/Off の信頼度（ベンチにいた時間で決める）
    const relLevel = offMin => offMin < 300 ? 1 : offMin < 600 ? 2 : 3;

    /* ── 行のデータ（100ポゼッションあたりに直す） ── */
    function onOffRows(d) {
        return d.players.map(p => {
            const onO = rating(p.pf, p.offPoss), onD = rating(p.pa, p.defPoss);
            const offO = rating(p.tPF - p.pf, p.tOff - p.offPoss), offD = rating(p.tPA - p.pa, p.tDef - p.defPoss);
            const onNet = onO != null && onD != null ? onO - onD : null;
            const offNet = offO != null && offD != null ? offO - offD : null;
            return { ...p, min: p.sec / 60, offMin: Math.max(0, p.tSec - p.sec) / 60,
                // おおよそのポゼッション数（攻撃と守備の平均）
                possOn: (p.offPoss + p.defPoss) / 2, possOff: Math.max(0, (p.tOff - p.offPoss + p.tDef - p.defPoss) / 2),
                onO, onD, onNet, offNet, diff: onNet != null && offNet != null ? onNet - offNet : null };
        });
    }
    const unitRows = d => d.units.map(u => {
        const o = rating(u.pf, u.offPoss), dr = rating(u.pa, u.defPoss);
        return { ...u, min: u.sec / 60, ortg: o, drtg: dr, net: o != null && dr != null ? o - dr : null };
    });
    const clutchRows = d => d.clutch.map(c => {
        const o = rating(c.pf, c.offPoss), dr = rating(c.pa, c.defPoss);
        return { ...c, min: c.sec / 60, pct: c.games ? c.w / c.games : null, ortg: o, drtg: dr, net: o != null && dr != null ? o - dr : null };
    });

    /* ── 表 ── */
    const team = abbr => `<a class="plain-link" href="${NBA.link.team(abbr)}"><b>${esc(abbr)}</b></a>`;
    const person = (id, name) => `<a class="plain-link" href="${NBA.link.player(id)}">${esc(name)}</a>`;
    const shell = wrap => { wrap.innerHTML = '<div class="adv-scroll"><table class="adv-table"><thead></thead><tbody></tbody></table></div>'; return wrap.querySelector('.adv-scroll'); };

    /* On/Off の表。rows は onOffRows の行
       minMin: On と Off のどちらかがこの分数未満の行を tr.low に（既定 150分）
       compact: 列を絞る（Player Team GP On MIN Off MIN On NET Off NET On−Off）。既定は showTeam と同じ（リーグ全体の表で絞る） */
    function renderOnOff(wrap, rows, { showTeam = true, minMin = ONOFF_LOW, compact = showTeam } = {}) {
        if (!rows.length) { wrap.innerHTML = '<div class="msg">No players</div>'; return; }
        const isLow = r => r.min < minMin || r.offMin < minMin;
        const C = {
            gp: { key: 'gp', label: 'GP', get: r => r.gp },
            onMin: { key: 'min', label: 'On MIN', get: r => r.min, title: 'Minutes on court\nコートにいた時間' },
            offMin: { key: 'offMin', label: 'Off MIN', get: r => r.offMin, title: 'Team minutes with him on the bench\nベンチにいた間のチームの試合時間' },
            boxPm: { key: 'boxPm', label: '+/-', get: r => r.boxPm, title: 'Sum of box score +/-\n公式のボックススコアの +/- の合計' },
            onO: { key: 'onO', label: 'On ORtg', get: r => r.onO, title: 'Team pts per 100 poss. with him on court\n出場中にチームが100ポゼッションで取った得点' },
            onD: { key: 'onD', label: 'On DRtg', get: r => r.onD, asc: true, title: 'Opp. pts per 100 poss. with him on court\n出場中に相手が100ポゼッションで取った得点' },
            onNet: { key: 'onNet', label: 'On NET', get: r => r.onNet, title: 'Net per 100 poss. with him on court\n出場中の100ポゼッションあたりの得失点差' },
            offNet: { key: 'offNet', label: 'Off NET', get: r => r.offNet, title: 'Net while he is on bench\nベンチにいる間の Net' },
            diff: { key: 'diff', label: 'On − Off', get: r => r.diff, title: 'On NET − Off NET. Higher = team is better with him\nOn NET − Off NET。大きいほど、その選手がいるとチームが良くなる' },
        };
        const cols = [
            { key: 'name', label: 'Player', cls: 'l', get: r => r.name, asc: true },
            ...(showTeam ? [{ key: 'team', label: 'Team', cls: 'l', get: r => r.team, asc: true }] : []),
            ...(compact ? [C.gp, C.onMin, C.offMin, C.onNet, C.offNet, C.diff]
                : [C.gp, C.onMin, C.offMin, C.boxPm, C.onO, C.onD, C.onNet, C.offNet, C.diff]),
        ];
        const td = {
            gp: r => `<td>${r.gp}</td>`, onMin: r => `<td>${mmss(r.sec)}</td>`, offMin: r => `<td>${mmss(r.offMin * 60)}</td>`,
            boxPm: r => `<td class="${cls(r.boxPm)}">${r.boxPm > 0 ? '+' : ''}${r.boxPm}</td>`,
            onO: r => `<td>${f1(r.onO)}</td>`, onD: r => `<td>${f1(r.onD)}</td>`,
            // 絞った表では On の ORtg / DRtg を title に残す
            onNet: r => `<td class="${cls(r.onNet)}"${compact ? ` title="On ORtg ${f1(r.onO)} · On DRtg ${f1(r.onD)}"` : ''}>${sgn(r.onNet)}</td>`,
            offNet: r => `<td class="${cls(r.offNet)}">${sgn(r.offNet)}</td>`,
            diff: r => `<td class="adv-key ${cls(r.diff)}">${sgn(r.diff)}</td>`,
        };
        const keys = compact ? ['gp', 'onMin', 'offMin', 'onNet', 'offNet', 'diff'] : ['gp', 'onMin', 'offMin', 'boxPm', 'onO', 'onD', 'onNet', 'offNet', 'diff'];
        NBA.ui.sortable(shell(wrap), {
            rows, cols, initial: { key: 'diff', asc: false },
            render: r => `<tr class="${isLow(r) ? 'low' : ''}"><td class="l">${person(r.id, r.name)}</td>${showTeam ? `<td class="l">${team(r.team)}</td>` : ''}${keys.map(k => td[k](r)).join('')}</tr>`,
        });
    }

    function renderUnits(wrap, rows, { showTeam = true } = {}) {
        if (!rows.length) { wrap.innerHTML = '<div class="msg">No lineups</div>'; return; }
        const cols = [
            { key: 'names', label: 'Lineup', cls: 'l', sort: false, get: () => 0 },
            ...(showTeam ? [{ key: 'team', label: 'Team', cls: 'l', get: r => r.team, asc: true }] : []),
            { key: 'gp', label: 'GP', get: r => r.gp },
            { key: 'min', label: 'MIN', get: r => r.min },
            { key: 'diffPts', label: 'PTS-OPP', get: r => r.pf - r.pa, title: 'Points scored - allowed\n得点-失点' },
            { key: 'ortg', label: 'ORtg', get: r => r.ortg },
            { key: 'drtg', label: 'DRtg', get: r => r.drtg, asc: true },
            { key: 'net', label: 'NET', get: r => r.net },
        ];
        NBA.ui.sortable(shell(wrap), {
            rows, cols, initial: { key: 'min', asc: false },
            render: r => `<tr class="${r.min < UNIT_LOW ? 'low' : ''}"><td class="l adv-unit">${r.ids.map((id, i) => person(id, r.names[i])).join(' · ')}</td>${showTeam ? `<td class="l">${team(r.team)}</td>` : ''}
                <td>${r.gp}</td><td>${mmss(r.sec)}</td><td>${r.pf}-${r.pa}</td><td>${f1(r.ortg)}</td><td>${f1(r.drtg)}</td>
                <td class="adv-key ${cls(r.net)}">${sgn(r.net)}</td></tr>`,
        });
    }

    function renderClutch(wrap, rows) {
        const cols = [
            { key: 'team', label: 'Team', cls: 'l', get: r => r.team, asc: true },
            { key: 'games', label: 'Games', get: r => r.games, title: 'Games within 5 pts in the last 5 min\n残り5分で5点差以内になった試合' },
            { key: 'pct', label: 'W-L', get: r => r.pct, title: 'Record in clutch games\n接戦の試合の勝敗' },
            { key: 'min', label: 'MIN', get: r => r.min, title: 'Total clutch time\nClutch の時間の合計' },
            { key: 'diffPts', label: 'PTS-OPP', get: r => r.pf - r.pa, title: 'Points scored - allowed\n得点-失点' },
            { key: 'ortg', label: 'ORtg', get: r => r.ortg },
            { key: 'drtg', label: 'DRtg', get: r => r.drtg, asc: true },
            { key: 'net', label: 'NET', get: r => r.net },
        ];
        NBA.ui.sortable(shell(wrap), {
            rows, cols, initial: { key: 'pct', asc: false },
            render: r => `<tr class="${r.min < CLUTCH_LOW ? 'low' : ''}"><td class="l">${team(r.team)}</td><td>${r.games}</td><td>${r.games ? `${r.w}-${r.l}` : '-'}</td>
                <td>${r.games ? mmss(r.sec) : '-'}</td><td>${r.games ? `${r.pf}-${r.pa}` : '-'}</td>
                <td>${f1(r.ortg)}</td><td>${f1(r.drtg)}</td><td class="adv-key ${cls(r.net)}">${sgn(r.net)}</td></tr>`,
        });
    }

    /* ── 共通: 順位（1 = 一番良い）と、上から何%の位置かのバー ── */
    const TEAL = '#16a6ba', GOLD = '#F5B700';
    const rankOf = (list, get, v, lowGood) => 1 + list.filter(x => get(x) != null && (lowGood ? get(x) < v : get(x) > v)).length;
    const pctBar = (rank, n) => {
        const p = 1 - (rank - 1) / Math.max(1, n - 1);
        const c = p >= .75 ? 'var(--pos)' : p <= .25 ? 'var(--neg)' : GOLD;
        return `<div class="ap-pct"><i style="width:${Math.max(4, p * 100)}%;background:${c}"></i></div>`;
    };

    /* ── 順位と散布図の対象: 出場時間が「所属チームの試合数 × 20分」以上の選手 ──
       データ（advanced.json）を更新すれば、試合数に合わせて基準も上がる */
    const MIN_PER_GAME = 20;
    const teamGames = (d, team) => (d.teamStyle || []).find(t => t.team === team)?.gp || 0;
    const minNeeded = (d, team) => teamGames(d, team) * MIN_PER_GAME;
    const qualified = d => (d.profiles || []).filter(p => p.min >= minNeeded(d, p.team));

    /* ── 使われ方と効率（リーグ全体）: 横 USG%・縦 TS% の散布図。isMe の選手を金色で ──
       名前は、強調した選手と両軸の端にいる数人だけ。重なる名前は上下にずらし、置けなければ出さない。点を押すと下に名前と数字 */
    function usageMapHTML(d, isMe) {
        const list = qualified(d);
        if (list.length < 5) return '';
        const W = 420, H = 320, L = 38, R = 12, T = 12, B = 32;
        const xs = list.map(p => p.usg), ys = list.map(p => p.ts);
        const x0 = Math.floor(Math.min(...xs) - 1), x1 = Math.ceil(Math.max(...xs) + 1), y0 = Math.floor(Math.min(...ys) - 2), y1 = Math.ceil(Math.max(...ys) + 2);
        const X = v => L + (W - L - R) * (v - x0) / (x1 - x0), Y = v => T + (H - T - B) * (1 - (v - y0) / (y1 - y0));
        const ax = xs.reduce((n, v) => n + v, 0) / xs.length, ay = ys.reduce((n, v) => n + v, 0) / ys.length;
        let g = `<line x1="${X(ax)}" x2="${X(ax)}" y1="${T}" y2="${H - B}" stroke="#55555f" stroke-dasharray="4 3"/><line x1="${L}" x2="${W - R}" y1="${Y(ay)}" y2="${Y(ay)}" stroke="#55555f" stroke-dasharray="4 3"/>`;
        const boxes = [];
        const hit = (a0, b0, a1, b1) => boxes.some(b => a0 < b[2] && a1 > b[0] && b0 < b[3] && b1 > b[1]);
        // 英字は1文字あたり約5.5px（9.5px の文字）
        const corner = (x, y, t, a) => { const w = t.length * 5.5, s0 = a === 'end' ? x - w : x; boxes.push([s0, y - 10, s0 + w, y + 2]); return `<text x="${x}" y="${y}" font-size="9.5" fill="#6f6f78" text-anchor="${a}">${t}</text>`; };
        g += corner(W - R - 2, H - B - 6, 'High usage, low efficiency', 'end') + corner(L + 4, H - B - 6, 'Low on both', 'start');
        for (let v = Math.ceil(x0 / 5) * 5; v <= x1; v += 5) g += `<text x="${X(v)}" y="${H - B + 12}" font-size="9" fill="#6f6f78" text-anchor="middle">${v}</text>`;
        for (let v = Math.ceil(y0 / 5) * 5; v <= y1; v += 5) g += `<text x="${L - 4}" y="${Y(v) + 3}" font-size="9" fill="#6f6f78" text-anchor="end">${v}</text>`;
        [...list].sort((a, b) => isMe(a) - isMe(b)).forEach(p => {
            const me = isMe(p);
            g += `<circle data-id="${p.id}" cx="${X(p.usg)}" cy="${Y(p.ts)}" r="${me ? 6 : 3.5}" fill="${me ? GOLD : TEAL}" fill-opacity="${me ? 1 : .45}"/>`;
        });
        const by = (k, dir) => [...list].sort((a, b) => dir * (b[k] - a[k]));
        const edge = new Set([...by('usg', 1).slice(0, 3), ...by('ts', 1).slice(0, 2), ...by('ts', -1).slice(0, 2)].map(p => p.id));
        [...list.filter(isMe), ...list.filter(p => !isMe(p) && edge.has(p.id))].forEach(p => {
            const me = isMe(p), fs = me ? 10.5 : 9, w = p.name.length * fs * 0.6;
            const cx = X(p.usg), cy = Y(p.ts), right = cx < W - w - 14, x = cx + (right ? 8 : -8), s0 = right ? x : x - w;
            for (const dy of [0, -11, 11, -22, 22]) {
                const y = cy + 3 + dy;
                if (y < T + 8 || y > H - B - 2 || hit(s0, y - fs, s0 + w, y + 2)) continue;
                boxes.push([s0, y - fs, s0 + w, y + 2]);
                g += `<text x="${x}" y="${y}" font-size="${fs}" font-weight="${me ? 800 : 600}" fill="${me ? GOLD : '#8b8b95'}" text-anchor="${right ? 'start' : 'end'}" pointer-events="none">${esc(p.name)}</text>`;
                break;
            }
        });
        g += `<text x="${(L + W) / 2}" y="${H - 4}" font-size="10" fill="#8b8b95" text-anchor="middle">USG% (usage) →</text><text transform="translate(10 ${(T + H - B) / 2}) rotate(-90)" font-size="10" fill="#8b8b95" text-anchor="middle">TS% (efficiency) →</text>`;
        return `<div class="ap-umap"><svg class="ap-map" viewBox="0 0 ${W} ${H}">${g}</svg><div class="ap-umap-cap">Tap a dot for name and stats</div>
            <div class="ap-note"><span data-ja="今季の通算。出場が チームの試合数 × ${MIN_PER_GAME}分 以上の ${list.length} 人">Season totals. ${list.length} players with MIN ≥ ${MIN_PER_GAME} × team GP.</span><br><span data-ja="点線はその平均">Dashed lines = their avg.</span></div></div>`;
    }
    // 点を押したとき（散布図はページに何度でも描き直されるので、押した点の図の下に出す）
    let usageData = null;
    document.addEventListener('click', e => {
        const c = e.target.closest('.ap-umap circle[data-id]');
        if (!c || !usageData) return;
        const p = usageData.profiles.find(x => x.id === c.dataset.id);
        if (p) c.closest('.ap-umap').querySelector('.ap-umap-cap').innerHTML = `<a class="plain-link" href="${NBA.link.player(p.id)}"><b>${esc(p.name)}</b></a> (${esc(p.team)}) USG ${f1(p.usg)}% · TS ${f1(p.ts)}% · ${p.gp} GP · ${p.min} min`;
    });
    const usageMap = (d, isMe) => { usageData = d; return usageMapHTML(d, isMe); };

    /* ── Player Profile（選手ページ）: 効率と役割・使われ方と効率・シュートの傾向・Game Score の安定度・On/Off ──
       順位の対象は qualified の選手。それ未満の選手は値だけ出す */
    const ZN = { rim: 'Restricted Area', paint: 'Paint (non-RA)', mid: 'Mid-range', corner3: 'Corner 3', ab3: 'Above the Break 3' };
    function profileHTML(d, id) {
        const p = (d.profiles || []).find(x => x.id === String(id));
        if (!p) return null;
        const L = qualified(d), need = minNeeded(d, p.team), ranked = p.min >= need;
        const tile = (label, key, lowGood) => {
            const r = ranked ? rankOf(L, x => x[key], p[key], lowGood) : null;
            return `<div class="ap-tile"><span>${label}</span><b>${f1(p[key])}%</b>${r ? `${pctBar(r, L.length)}<small>#${r} of ${L.length}</small>` : ''}</div>`;
        };
        const tiles = tile('TS%', 'ts') + tile('eFG%', 'efg') + tile('USG%', 'usg') + tile('AST%', 'ast') + tile('TOV%', 'tov', true) + tile('REB%', 'reb');

        // シュートの傾向（棒 = 打った割合。全体の50%で端まで。白い線はリーグ平均）
        const tot = Object.values(p.z).reduce((n, z) => n + z[1], 0) || 1;
        const lgTot = Object.values(d.lgZones).reduce((n, z) => n + z[1], 0) || 1;
        const zones = `<div class="ap-zr ap-zhead"><span>Zone</span><span>Share of FGA</span><span class="r">FG%</span><span class="r">vs Lg</span></div>` +
            Object.entries(ZN).map(([z, label]) => {
                const [m, a] = p.z[z], freq = a / tot * 100, lgFreq = d.lgZones[z][1] / lgTot * 100;
                const fg = a ? m / a * 100 : null, lg = d.lgZones[z][1] ? d.lgZones[z][0] / d.lgZones[z][1] * 100 : null, df = fg == null || lg == null ? null : fg - lg;
                const c = df == null || a < 5 ? 'mut' : df >= 3 ? 'pos' : df <= -3 ? 'neg' : 'mut';
                return `<div class="ap-zr"><span>${label}</span><div class="ap-zbar"><i style="width:${Math.min(100, freq * 2)}%"></i><b style="left:${Math.min(100, lgFreq * 2)}%"></b></div>
                    <span class="v">${a ? f1(fg) + '%' : '-'}<small>${m}/${a}</small></span><span class="d ${c}">${df == null ? '' : sgn(df)}</span></div>`;
            }).join('') + `<div class="ap-note"><span data-ja="棒の長さ = 打った割合（全体の50%で端まで）。白い線はリーグ平均。5本未満は差を灰色に">Bar = share of FGA (full at 50%). White line = league avg. Gray = under 5 attempts.</span></div>`;

        // Game Score の安定度（ばらつきが平均の30%以内なら安定、55%を超えると波あり）
        const gs = p.gs, mean = gs.reduce((n, v) => n + v, 0) / gs.length;
        const sd = Math.sqrt(gs.reduce((n, v) => n + (v - mean) ** 2, 0) / gs.length);
        const max = Math.max(...gs, 1), cv = sd / Math.max(1, mean);
        const stab = cv <= .3 ? ['Steady', 'good'] : cv <= .55 ? ['Typical', 'mid'] : ['Streaky', 'bad'];
        const gsHTML = `<div class="ap-kv"><span>Avg<b>${f1(mean)}</b></span><span>SD<b>${f1(sd)}</b></span><span>Consistency<span class="ap-tag ${stab[1]}">${stab[0]}</span></span></div>
            <div class="ap-gs">${gs.map(v => `<span style="height:${Math.max(3, Math.max(0, v) / max * 100)}%;${v < 0 ? 'background:var(--neg)' : ''}" title="${v}"></span>`).join('')}<div class="avg" style="bottom:${Math.max(0, mean) / max * 100}%"></div></div>
            <div class="ap-note"><span data-ja="${gs.length}試合を古い順に。点線が平均">${gs.length} games, oldest first. Dashed line = avg.</span><br><span data-ja="ばらつきが平均の30%以内なら「安定」、55%を超えると「波あり」">Steady = SD within 30% of avg. Streaky = SD over 55%.</span></div>`;

        // On/Off（出場中とベンチ中の、100ポゼッションあたりの得失点差）
        const o = onOffRows(d).find(x => x.id === String(id));
        // 出場分数とおおよそのポゼッション数、ベンチにいた時間で決める信頼度（300分未満 Low、600分未満 Medium、それ以上 High）
        const ooSample = (min, poss) => `<small>${Math.round(min)} min · ~${Math.round(poss)} poss</small>`;
        const rel = o ? relLevel(o.offMin) : 0, relName = ['', 'Low', 'Medium', 'High'][rel], relJa = ['', '低', '中', '高'][rel];
        const ooHTML = o ? `<div class="ap-oo"><div class="ap-tile"><span>On court</span><b class="${cls(o.onNet)}">${sgn(o.onNet)}</b>${ooSample(o.min, o.possOn)}</div><div class="ap-tile"><span>On bench</span><b class="${cls(o.offNet)}">${sgn(o.offNet)}</b>${ooSample(o.offMin, o.possOff)}</div><div class="ap-tile"><span>Diff (On − Off)</span><b class="${cls(o.diff)}">${sgn(o.diff)}</b>
                <small class="ap-rel lv${rel}" title="Reliability: ${relName}\n信頼度: ${relJa}"><i></i><i></i><i></i> ${relName}</small></div></div>
            <div class="ap-note"><span data-ja="信頼度はベンチにいた時間で決めています（300分未満は低、600分未満は中、それ以上は高）。ベンチの時間が短いと Off の数字がぶれやすいため">Reliability is based on bench minutes (Low under 300, Medium under 600, High 600+). Few bench minutes make the Off number noisy.</span></div>`
            : '<div class="ap-note"><span data-ja="集計の対象外です">Not in analytics data.</span></div>';

        const umap = usageMap(d, x => x.id === p.id);
        const DESC = [
            ['TS%: shooting efficiency incl. FT', 'TS%: FT も含めたシュートの効率'],
            ['eFG%: FG% with a 3 counted as 1.5', 'eFG%: 3P を1.5本分に数えた FG%'],
            ['USG%: share of team plays he finishes while on court', 'USG%: 出場中の攻撃のうち、その選手が終えた割合'],
            ['AST%: share of teammate FGs he assists', 'AST%: 出場中に味方が決めたシュートのうち、その選手のアシストの割合'],
            ['TOV%: share of his plays that end in a turnover (lower is better)', 'TOV%: 攻撃を終えたうち、ターンオーバーだった割合（低いほど良い）'],
            ['REB%: share of available rebounds he grabs', 'REB%: 出場中のリバウンドのうち、その選手が取った割合'],
        ];
        const sub = ranked
            ? [`Rank among ${L.length} players with MIN ≥ ${MIN_PER_GAME} × team GP (${p.team}: ${need})`, `バーと順位は、出場が チームの試合数 × ${MIN_PER_GAME}分（${p.team} は${need}分）以上の ${L.length} 人の中での位置`]
            : [`Unranked: MIN under ${MIN_PER_GAME} × team GP (${p.team}: ${need})`, `出場が チームの試合数 × ${MIN_PER_GAME}分（${p.team} は${need}分）に届かないため、順位はありません`];
        return `<div class="sd-title">Efficiency &amp; Role <span class="ap-sub" data-ja="${sub[1]}">${sub[0]}</span></div>
            <div class="ap-tiles">${tiles}</div>
            <div class="ap-desc" style="display:grid;gap:2px">${DESC.map(([en, ja]) => `<span data-ja="${ja}">${en}</span>`).join('')}</div>
            ${umap ? `<div class="sd-title" style="margin-top:16px">Usage &amp; Efficiency <span class="ap-sub" data-ja="リーグ全体の中での位置（金色がこの選手${ranked ? '' : '。対象外のため表示なし'}）">League-wide (${ranked ? 'gold = this player' : 'this player not shown: unranked'})</span></div><div class="ap-card ap-umap-card">${umap}</div>` : ''}
            <div class="ap-grid2">
                <div><div class="sd-title">Shot Profile <span class="ap-sub">Share of FGA &amp; FG%</span></div><div class="ap-card">${zones}</div></div>
                <div><div class="sd-title">Game Score Consistency <span class="ap-sub">By game</span></div><div class="ap-card">${gsHTML}</div>
                    <div class="sd-title" style="margin-top:14px">On / Off <span class="ap-sub">Point diff per 100 poss.</span></div>${ooHTML}</div>
            </div>`;
    }

    /* ── 散布図の共通部品 ── */
    // チームを強調するか（me はチームの略称か 'East' / 'West'。'all' や空なら強調なし）
    const hlTeam = me => !me || me === 'all' ? null
        : (abbr => abbr === me || ((me === 'East' || me === 'West') && NBA.teams?.byAbbr(abbr)?.conf === me));
    // 軸の目盛りの間隔（幅に合わせて 1 / 2 / 5）
    const tickStep = range => range > 14 ? 5 : range > 6 ? 2 : 1;
    // 軸の数字。fmt で単位（%）を付ける
    function axisTicks({ x0, x1, y0, y1, X, Y, L, R, W, Tp, Bt, fmt = v => v, grid = false }) {
        let g = '';
        const sx = tickStep(x1 - x0), sy = tickStep(y1 - y0);
        for (let v = Math.ceil(x0 / sx) * sx; v <= x1; v += sx) {
            if (grid) g += `<line x1="${X(v)}" x2="${X(v)}" y1="${Tp}" y2="${Bt}" stroke="#1f1f25"/>`;
            g += `<text x="${X(v)}" y="${Bt + 12}" font-size="9" fill="#6f6f78" text-anchor="middle">${fmt(v)}</text>`;
        }
        for (let v = Math.ceil(y0 / sy) * sy; v <= y1; v += sy) {
            if (grid) g += `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="#1f1f25"/>`;
            g += `<text x="${L - 4}" y="${Y(v) + 3}" font-size="9" fill="#6f6f78" text-anchor="end">${fmt(v)}</text>`;
        }
        return g;
    }
    // 名前を重ならない位置に置く。右 → 左の順に、上下に少しずつずらして空いている所を探す（見つからなければ元の位置）
    function labeler(boxes, { L, W, R, Tp, Bt }) {
        const hit = (a0, b0, a1, b1) => boxes.some(b => a0 < b[2] && a1 > b[0] && b0 < b[3] && b1 > b[1]);
        return (cx, cy, text, { fs = 9, gap = 7, attrs = '' } = {}) => {
            const w = String(text).length * fs * 0.66;
            let pick = null;
            outer: for (const side of [1, -1]) {
                for (const dy of [0, -9, 9, -18, 18, -27, 27]) {
                    const x = cx + side * gap, y = cy + 3 + dy, s0 = side > 0 ? x : x - w;
                    if (s0 < L || s0 + w > W - R + 2 || y - fs < Tp - 2 || y > Bt) continue;
                    if (hit(s0, y - fs + 1, s0 + w, y + 1)) continue;
                    pick = { x, y, s0, side }; break outer;
                }
            }
            if (!pick) { const x = cx + gap; pick = { x, y: cy + 3, s0: x, side: 1 }; }
            boxes.push([pick.s0, pick.y - fs + 1, pick.s0 + w, pick.y + 1]);
            return `<text x="${pick.x}" y="${pick.y}" font-size="${fs}" text-anchor="${pick.side > 0 ? 'start' : 'end'}" pointer-events="none" ${attrs}>${esc(text)}</text>`;
        };
    }

    /* ── Team Style のマップ（Teams の Advanced タブ・チームページ）──
       横 3PA の割合・縦 ゴール下の割合。リーグ平均の点線で4つのエリアに分ける
       点の色は ORtg（teamStyle の hc.allOrtg）の順位: 上位10 緑 / 11〜20 灰 / 下位10 赤
       me: 強調するチーム（略称）か 'East' / 'West' */
    let gradId = 0;
    const POS = '#3ddc84', NEG = '#ff6b61', MIDC = '#6b6b75';
    const ortgOf = x => x.hc?.allOrtg ?? null;
    function ortgColor(T, x) {
        const v = ortgOf(x), n = T.filter(t => ortgOf(t) != null).length;
        if (v == null || n < 3) return TEAL;
        const r = rankOf(T, ortgOf, v), third = n / 3;
        return r <= third ? POS : r > n - third ? NEG : MIDC;
    }
    function styleMapSVG(T, me, { note = true } = {}) {
        const n = T.length, avg = k => T.reduce((s, x) => s + x[k], 0) / n;
        const W = 560, H = 380, L = 40, R = 12, Tp = 12, B = 34, Bt = H - B;
        const xs = T.map(x => x.tpaRate), ys = T.map(x => x.rimRate);
        const x0 = Math.floor(Math.min(...xs) - 1), x1 = Math.ceil(Math.max(...xs) + 1), y0 = Math.floor(Math.min(...ys) - 1), y1 = Math.ceil(Math.max(...ys) + 1);
        const X = v => L + (W - L - R) * (v - x0) / (x1 - x0), Y = v => Tp + (Bt - Tp) * (1 - (v - y0) / (y1 - y0));
        const ax = X(avg('tpaRate')), ay = Y(avg('rimRate')), id = `apStyleGrad${++gradId}`;
        // 右上が緑・左下が赤のうすいグラデーション
        let g = `<defs><linearGradient id="${id}" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="${NEG}" stop-opacity=".12"/><stop offset=".5" stop-color="${NEG}" stop-opacity="0"/><stop offset=".5" stop-color="${POS}" stop-opacity="0"/><stop offset="1" stop-color="${POS}" stop-opacity=".13"/></linearGradient></defs>
            <rect x="${L}" y="${Tp}" width="${W - L - R}" height="${Bt - Tp}" fill="url(#${id})"/>`;
        g += axisTicks({ x0, x1, y0, y1, X, Y, L, R, W, Tp, Bt, fmt: v => `${v}%`, grid: true });
        g += `<line x1="${ax}" x2="${ax}" y1="${Tp}" y2="${Bt}" stroke="#8b8b95" stroke-opacity=".7" stroke-dasharray="4 4"/><line x1="${L}" x2="${W - R}" y1="${ay}" y2="${ay}" stroke="#8b8b95" stroke-opacity=".7" stroke-dasharray="4 4"/>`;
        // 4つのエリアの名前（名前を置く場所は、チーム名の置き場から外す）
        const boxes = [];
        const area = (x, y, t, anchor, col) => {
            const w = t.replace(/&amp;/g, '&').length * 10 * 0.62, s0 = anchor === 'end' ? x - w : x;
            boxes.push([s0, y - 10, s0 + w, y + 2]);
            return `<text x="${x}" y="${y}" font-size="10" font-weight="700" letter-spacing=".4" fill="${col}" text-anchor="${anchor}">${t}</text>`;
        };
        g += area(W - R - 4, Tp + 13, 'RIM &amp; 3 ▲ efficient', 'end', POS) + area(L + 4, Tp + 13, 'INSIDE-HEAVY', 'start', '#8b8b95')
            + area(W - R - 4, Bt - 7, '3-POINT HEAVY', 'end', '#8b8b95') + area(L + 4, Bt - 7, 'MID-RANGE HEAVY ▼', 'start', NEG);
        const hl = hlTeam(me), on = x => !!hl && hl(x.team);
        // 強調するチームは最後に描いて前面に。点も名前の置き場から外す
        const sorted = [...T].sort((a, b) => on(a) - on(b));
        sorted.forEach(x => { const cx = X(x.tpaRate), cy = Y(x.rimRate); boxes.push([cx - 4, cy - 4, cx + 4, cy + 4]); });
        const dots = sorted.map(x => {
            const m = on(x), dim = hl && !m, col = ortgColor(T, x), o = ortgOf(x), r = o != null ? rankOf(T, ortgOf, o) : null;
            return `<a href="${NBA.link.team(x.team)}" opacity="${dim ? .3 : 1}"><circle cx="${X(x.tpaRate)}" cy="${Y(x.rimRate)}" r="${m ? 7 : 4.5}" fill="${col}" fill-opacity="${m ? 1 : .85}" stroke="${m ? GOLD : 'none'}" stroke-width="2"><title>${x.team} · 3PA ${f1(x.tpaRate)}% · Rim ${f1(x.rimRate)}%${r ? ` · ORtg ${f1(o)} (#${r})` : ''}</title></circle></a>`;
        }).join('');
        // 名前は強調するチームから置く
        const place = labeler(boxes, { L, W, R, Tp, Bt });
        const labels = [...sorted].reverse().map(x => {
            const m = on(x), dim = hl && !m;
            return place(X(x.tpaRate), Y(x.rimRate), x.team, { fs: m ? 11 : 9, gap: m ? 9 : 7,
                attrs: `font-weight="${m ? 800 : 600}" fill="${m ? GOLD : '#8b8b95'}" opacity="${dim ? .35 : 1}"` });
        }).join('');
        g += dots + labels;
        g += `<text x="${(L + W) / 2}" y="${H - 4}" font-size="10" fill="#8b8b95" text-anchor="middle">3PA share of FGA →</text><text transform="translate(11 ${(Tp + Bt) / 2}) rotate(-90)" font-size="10" fill="#8b8b95" text-anchor="middle">Rim share of FGA →</text>`;
        return `<svg class="ap-map" viewBox="0 0 ${W} ${H}">${g}</svg>${note ? `<div class="ap-note"><span data-ja="横: 3P を打つ割合 / 縦: ゴール下で打つ割合。点線はリーグ平均">Right = more threes. Up = more rim shots. Dashed lines = league avg.</span><br><span data-ja="点の色は攻撃力（ORtg）の順位（緑 = 上位10、灰 = 11〜20位、赤 = 下位10）">Dot color = ORtg rank (green = top 10, gray = 11–20, red = bottom 10).</span><br><span data-ja="点を押すとそのチームへ">Click a dot to open that team.</span></div>` : ''}`;
    }

    /* ── Team Style のマップの見方（Teams の Advanced タブで図の横に置く）──
       ゾーンごとの1本あたりの平均得点は lgZones のリーグ全体の成功率から: 2点ゾーンは FG% × 2、3点ゾーンは FG% × 3 */
    function styleHowToHTML(d) {
        const Z = d.lgZones || {};
        const pps = Object.entries(ZN).filter(([z]) => Z[z]?.[1] > 0).map(([z, label]) => {
            const fg = Z[z][0] / Z[z][1];
            return { label, fg: fg * 100, pts: fg * (z === 'corner3' || z === 'ab3' ? 3 : 2) };
        }).sort((a, b) => b.pts - a.pts);
        const table = pps.length ? `<div class="adv-pps">${pps.map(p => `<span>${p.label} <small>(${p.fg.toFixed(0)}%)</small></span><span>${p.pts.toFixed(2)} pts</span>`).join('')}</div>
            <div class="ap-note"><span data-ja="リーグ全体の、シュート1本あたりの平均得点（FG% × 2 または × 3。フリースローは含まない）">League avg points per shot (FG% × 2 or × 3; free throws not included).</span></div>` : '';
        return `<div><b>What it shows</b><span data-ja="各チームがどこからシュートを打っているか（打ち方）。決めているかどうかではありません。">Where each team shoots from — not how well.</span></div>
            <div><b>How to read it</b><span data-ja="右ほど3Pが多く、上ほどゴール下が多い。点線はリーグ平均で、図を4つのエリアに分けています。">Right = more threes. Up = more rim shots. Dashed lines = league avg, splitting the chart into four areas.</span></div>
            <div><b>Which area is better?</b><span data-ja="1本あたりの得点はゴール下と3Pが高く、ミドルは低い。">Rim shots and threes are worth more per shot than mid-range.</span> <span data-ja="なので右上ほど効率の良い打ち方、左下ほど効率の悪い打ち方です。">So upper right = most efficient mix, lower left = least.</span>${table}</div>
            <div><b>Dot color = offense (ORtg rank)</b><div class="adv-lg"><span><i style="background:${POS}"></i>Top 10</span><span><i style="background:${MIDC}"></i>11–20</span><span><i style="background:${NEG}"></i>Bottom 10</span></div></div>
            <div><span data-ja="上の Team でチームを選ぶと、そのチームを強調します。点を押すとそのチームのページへ。">Pick a team above to highlight it. Click a dot to open that team.</span></div>`;
    }

    function teamStyleHTML(d, abbr) {
        const T = d.teamStyle || [], t = T.find(x => x.team === abbr), n = T.length;
        if (!t) return null;
        const avg = k => T.reduce((s, x) => s + x[k], 0) / n;
        const tile = (label, key, unit) => {
            const r = rankOf(T, x => x[key], t[key]);
            return `<div class="ap-tile"><span>${label}</span><b>${f1(t[key])}${unit}</b>${pctBar(r, n)}<small>#${r} (most first) · League avg ${f1(avg(key))}</small></div>`;
        };
        const tiles = tile('PACE', 'pace', '') + tile('3PA Share', 'tpaRate', '%') + tile('Rim Share', 'rimRate', '%') + tile('Mid-range Share', 'midRate', '%') + tile('FT Rate', 'ftRate', '') + tile('Fast Break PTS', 'fb', '');
        // 型の一言: 上位5位・下位5位に入る項目
        const tags = [];
        const top = (k, label, lowLabel) => { const r = rankOf(T, x => x[k], t[k]); if (r <= 5) tags.push(['acc', label]); else if (lowLabel && r > n - 5) tags.push(['mid', lowLabel]); };
        top('pace', 'Fast pace', 'Slow pace'); top('tpaRate', '3P-heavy', 'Few 3s'); top('rimRate', 'Attacks the rim'); top('midRate', 'Mid-range heavy'); top('ftRate', 'Draws fouls'); top('fb', 'Runs in transition');
        const tagHTML = (tags.length ? tags : [['mid', 'Balanced (no clear tilt)']]).map(([c, s]) => `<span class="ap-tag ${c}">${s}</span>`).join('');

        // 攻守の強み・弱み: 攻撃は eFG・ORB・FT が高いほど、TOV が低いほど良い。守備は相手の数字なので逆（TOV だけ高いほど良い）
        // [キー, 指標名, 攻撃の説明, 守備（相手の数字）の説明]
        const FF = [['efg', 'eFG%', 'Shot quality', 'Opp. shot quality'], ['tov', 'TOV%', 'TO per 100 plays', 'Opp. TO per 100 plays'],
            ['orb', 'ORB%', 'Off. rebound rate', 'Opp. off. rebound rate'], ['ftr', 'FT Rate', 'FTs drawn (FTM ÷ FGA)', 'Opp. FTs drawn (FTM ÷ FGA)']];
        const goodLow = (grp, k) => grp === 'ff' ? k === 'tov' : k !== 'tov';
        const strong = [], weak = [];
        const ffRows = (grp, title) => `<div class="ap-ff-grp">${title}</div>` + FF.map(([k, label, sub, subD]) => {
            const r = rankOf(T, x => x[grp][k], t[grp][k], goodLow(grp, k)), name = (grp === 'dff' ? 'Def. ' : '') + label;
            if (r <= 5) strong.push(`${name} (#${r})`); else if (r >= n - 4) weak.push(`${name} (#${r})`);
            return `<div class="ap-ff-row"><span>${label}<small>${grp === 'dff' ? subD : sub}</small></span><span class="v">${f1(t[grp][k])}</span><span class="r">#${r}${pctBar(r, n)}</span></div>`;
        }).join('');
        const ffBody = ffRows('ff', 'Offense') + ffRows('dff', 'Defense (opp. numbers)');
        const ffHTML = `<div class="ap-ff-sum"><div><b style="color:var(--pos)">Strengths</b>${strong.join(' · ') || 'None'}</div><div><b style="color:var(--neg)">Weaknesses</b>${weak.join(' · ') || 'None'}</div></div>${ffBody}
            <div class="ap-note"><span data-ja="順位は良い順（守備は相手の数字が悪いほど上）">Ranked best first (defense: worse opp. numbers rank higher).</span><br><span data-ja="上位5位を強み、下位5位を弱みに">Top 5 = strength. Bottom 5 = weakness.</span></div>`;

        return `<div class="ap-tags">${tagHTML}</div>
            <div class="ap-tiles">${tiles}</div>
            <div class="ap-grid2 ap-eq">
                <div><div class="sd-title">Style Map</div><div class="ap-card">${styleMapSVG(T, abbr)}</div></div>
                <div><div class="sd-title">Strengths &amp; Weaknesses <span class="ap-sub">Four Factors rank this season</span></div><div class="ap-card">${ffHTML}</div></div>
            </div>
            ${halfCourtHTML(T, t)}`;
    }

    /* ── ハーフコート／速攻（チームページの Team Style）: 攻撃・守備の2列と結論の一言 ──
       速攻 = 攻撃の始まり（守備リバウンド・相手の TO・相手の得点）から6秒以内にシュート・FT・TO があったもの（集計は aggregate.js） */
    function halfCourtHTML(T, t) {
        const L = T.filter(x => x.hc?.ortg != null), n = L.length;
        if (!t.hc || n < 2) return '';
        const g = (x, k) => x.hc[k];
        const avg = k => L.reduce((s, x) => s + g(x, k), 0) / n;
        const rank = (k, lowGood) => rankOf(L, x => g(x, k), g(t, k), lowGood);
        const row = (label, sub, k, lowGood, key) => {
            const r = rank(k, lowGood);
            return `<div class="ap-hc-row ${key ? 'key' : ''}"><span>${label}<small>${sub} · Avg ${f1(avg(k))}</small></span><span class="v">${f1(g(t, k))}</span><span class="r">#${r}${pctBar(r, n)}</span></div>`;
        };
        const off = `<div class="ap-ff-grp">Offense</div>` + row('Half-court ORtg', 'Pts per 100 set plays', 'ortg', false, true)
            + row('Transition ORtg', 'Pts per 100 transition plays', 'trOrtg') + row('Transition Freq', 'Share of plays (%)', 'trFreq') + row('Overall ORtg', 'Reference', 'allOrtg');
        const def = `<div class="ap-ff-grp">Defense</div>` + row('Half-court DRtg', 'Opp. pts per 100 set plays', 'drtg', true, true)
            + row('Transition DRtg', 'Opp. pts per 100 transition plays', 'trDrtg', true) + row('Opp. Transition Freq', 'Share of opp. plays (%)', 'trFreqD', true) + row('Overall DRtg', 'Reference', 'allDrtg', true);
        // 結論の一言: ハーフコートの攻守の順位と、速攻の多さ（[英語, 日本語]）
        const ro = rank('ortg'), rd = rank('drtg', true), rf = rank('trFreq'), rfd = rank('trFreqD', true);
        const lv = r => r <= 5 ? ['top of the league', 'リーグ上位'] : r <= 12 ? ['above average', '上の方'] : r <= 18 ? ['average', '平均的']
            : r <= 25 ? ['below average', '下の方'] : ['bottom of the league', 'リーグ下位'];
        const tr = rf <= 8 ? ['Runs a lot in transition', '速攻が多いチーム'] : rf >= n - 7 ? ['Rarely runs; plays mostly in the half court', '速攻が少なく、ほとんどをセットした攻撃で戦うチーム']
            : ['Average transition frequency', '速攻の多さは平均的'];
        const trD = rfd <= 8 ? ['limits opp. transition', '相手に速攻をあまり出させない'] : rfd >= n - 7 ? ['gives up a lot of transition', '相手に速攻を多く出されている'] : null;
        const sum = `<span data-ja="${t.team} はハーフコートの攻撃が${lv(ro)[1]}（${ro}位）、守備が${lv(rd)[1]}（${rd}位）。"><b>${t.team}</b> half-court offense: <b>${lv(ro)[0]} (#${ro})</b>. Defense: <b>${lv(rd)[0]} (#${rd})</b>.</span><br>`
            + `<span data-ja="${tr[1]}${trD ? `で、${trD[1]}` : ''}。">${tr[0]}${trD ? `; ${trD[0]}` : ''}.</span>`;
        return `<div class="sd-title" style="margin-top:16px">Half-court &amp; Transition <span class="ap-sub" data-ja="攻撃・守備を、セットした攻撃（ハーフコート）と速攻に分けた100回あたりの得点・失点">Pts scored / allowed per 100 plays, split into half-court and transition</span></div>
            <div class="ap-card"><div class="ap-hc-sum">${sum}</div><div class="ap-hc-cols"><div>${off}</div><div>${def}</div></div>
            <div class="ap-note"><span data-ja="速攻 = 攻撃の始まり（守備リバウンド・相手の TO・相手の得点）から6秒以内にシュート・FT・TO があったもの">Transition = shot, FT or TO within 6 sec of the start of a possession (def. rebound, opp. TO, opp. score).</span><br><span data-ja="ガベージタイム（第4Q以降で25点差以上）は除く">Excludes garbage time (Q4 or later, 25+ pt margin).</span><br><span data-ja="順位は良い順（攻撃は高いほど、守備は低いほど上。速攻の割合は多い順）">Ranked best first (offense: higher; defense: lower; transition freq: most first).</span><br><span data-ja="速攻は1試合に13回前後なので、速攻の数字はぶれが大きい">Only ~13 transition plays per game, so transition numbers are noisy.</span></div></div>`;
    }

    /* ── ハーフコートの攻守の散布図（Teams の Advanced タブ）: 横 HC ORtg、縦 HC DRtg（失点が少ないほど上）。me のチームを金色で ── */
    function halfCourtMapSVG(T, me) {
        const L = T.filter(x => x.hc?.ortg != null);
        if (L.length < 2) return '';
        const W = 420, H = 320, Lp = 40, R = 12, Tp = 12, B = 32;
        const xs = L.map(x => x.hc.ortg), ys = L.map(x => x.hc.drtg);
        const x0 = Math.floor(Math.min(...xs) - 1), x1 = Math.ceil(Math.max(...xs) + 1), y0 = Math.floor(Math.min(...ys) - 1), y1 = Math.ceil(Math.max(...ys) + 1);
        const X = v => Lp + (W - Lp - R) * (v - x0) / (x1 - x0), Y = v => Tp + (H - Tp - B) * (v - y0) / (y1 - y0);
        const ax = xs.reduce((n, v) => n + v, 0) / xs.length, ay = ys.reduce((n, v) => n + v, 0) / ys.length;
        // 軸の数字（縦軸は失点が少ないほど上なので、上ほど数字が小さい）
        let g = axisTicks({ x0, x1, y0, y1, X, Y, L: Lp, R, W, Tp, Bt: H - B, grid: true });
        g += `<line x1="${X(ax)}" x2="${X(ax)}" y1="${Tp}" y2="${H - B}" stroke="#55555f" stroke-dasharray="4 3"/><line x1="${Lp}" x2="${W - R}" y1="${Y(ay)}" y2="${Y(ay)}" stroke="#55555f" stroke-dasharray="4 3"/>`;
        const boxes = [[W - R - 70, Tp, W - R, Tp + 12], [Lp, H - B - 16, Lp + 70, H - B - 4]];
        g += `<text x="${W - R - 2}" y="${Tp + 10}" font-size="9.5" fill="#6f6f78" text-anchor="end">Good O &amp; D</text><text x="${Lp + 4}" y="${H - B - 6}" font-size="9.5" fill="#6f6f78">Poor O &amp; D</text>`;
        const hl = hlTeam(me), on = t => !!hl && hl(t.team);
        const sorted = [...L].sort((a, b) => on(a) - on(b));
        sorted.forEach(t => {
            const m = on(t), cx = X(t.hc.ortg), cy = Y(t.hc.drtg);
            boxes.push([cx - 4, cy - 4, cx + 4, cy + 4]);
            g += `<a href="${NBA.link.team(t.team)}" opacity="${hl && !m ? .35 : 1}"><circle cx="${cx}" cy="${cy}" r="${m ? 7 : 4}" fill="${m ? GOLD : TEAL}" fill-opacity="${m ? 1 : .55}"><title>${t.team} · HC ORtg ${f1(t.hc.ortg)} · HC DRtg ${f1(t.hc.drtg)}</title></circle></a>`;
        });
        // 名前は重なったら上下・左右にずらす（強調するチームを先に置く）
        const place = labeler(boxes, { L: Lp, W, R, Tp, Bt: H - B });
        [...sorted].reverse().forEach(t => {
            const m = on(t);
            g += place(X(t.hc.ortg), Y(t.hc.drtg), t.team, { fs: m ? 11 : 8.5, gap: m ? 9 : 6,
                attrs: `font-weight="${m ? 800 : 600}" fill="${m ? GOLD : '#8b8b95'}" opacity="${hl && !m ? .35 : 1}"` });
        });
        g += `<text x="${(Lp + W) / 2}" y="${H - 6}" font-size="10" fill="#8b8b95" text-anchor="middle">Half-court offense (HC ORtg) →</text><text transform="translate(11 ${(Tp + H - B) / 2}) rotate(-90)" font-size="10" fill="#8b8b95" text-anchor="middle">Half-court defense (HC DRtg) →</text>`;
        return `<svg class="ap-map" viewBox="0 0 ${W} ${H}">${g}</svg><div class="ap-note"><span data-ja="点線はリーグ平均。縦軸は失点が少ないほど上">Dashed lines = league avg. Up = fewer pts allowed.</span><br><span data-ja="点を押すとそのチームへ">Click a dot to open that team.</span></div>`;
    }

    // ハーフコート／速攻の表（Teams の Advanced タブ）。me のチームの行を目立たせる
    function renderHalfCourt(wrap, T, me) {
        const rows = T.filter(x => x.hc?.ortg != null).map(x => ({ team: x.team, ...x.hc, net: x.hc.ortg - x.hc.drtg }));
        const hl = hlTeam(me);
        if (!rows.length) { wrap.innerHTML = '<div class="msg">No data</div>'; return; }
        const cols = [
            { key: 'team', label: 'Team', cls: 'l', get: r => r.team, asc: true },
            { key: 'ortg', label: 'HC ORtg', get: r => r.ortg, title: 'Pts per 100 half-court plays\nセットした攻撃100回の得点' },
            { key: 'drtg', label: 'HC DRtg', get: r => r.drtg, asc: true, title: 'Opp. pts per 100 half-court plays\n相手のセットした攻撃100回の失点' },
            { key: 'net', label: 'HC NET', get: r => r.net },
            { key: 'trFreq', label: 'TR%', get: r => r.trFreq, title: 'Transition share of plays\n攻撃のうち速攻の割合' },
            { key: 'trOrtg', label: 'TR ORtg', get: r => r.trOrtg, title: 'Pts per 100 transition plays\n速攻100回の得点' },
            { key: 'trFreqD', label: 'Opp TR%', get: r => r.trFreqD, asc: true, title: 'Transition share of opp. plays\n相手の攻撃のうち速攻の割合' },
            { key: 'trDrtg', label: 'TR DRtg', get: r => r.trDrtg, asc: true, title: 'Opp. pts per 100 transition plays\n相手の速攻100回の失点' },
        ];
        NBA.ui.sortable(shell(wrap), {
            rows, cols, initial: { key: 'net', asc: false },
            render: r => `<tr class="${hl?.(r.team) ? 'adv-me' : ''}"><td class="l">${team(r.team)}</td><td>${f1(r.ortg)}</td><td>${f1(r.drtg)}</td>
                <td class="adv-key ${cls(r.net)}">${sgn(r.net)}</td><td>${f1(r.trFreq)}</td><td>${f1(r.trOrtg)}</td><td>${f1(r.trFreqD)}</td><td>${f1(r.trDrtg)}</td></tr>`,
        });
    }

    NBA.advanced = { load, updatedHTML, anaBadge, onOffRows, unitRows, clutchRows, renderOnOff, renderUnits, renderClutch, profileHTML, teamStyleHTML, styleMapSVG, styleHowToHTML, usageMap, halfCourtMapSVG, renderHalfCourt, MIN_PER_GAME, ONOFF_MIN_OPTS, ONOFF_LOW, UNIT_LOW, CLUTCH_LOW, f1, sgn, cls, mmss };
})();
