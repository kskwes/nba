/* ═══════════════════════════════════════════════
   リーグ全体の分析データ（data/advanced.json）の表示
   Teams ページの Advanced タブと、チームページで共通
   advanced.json はローカルの nba-tools/aggregate.js が書き出す（更新は手動）
   必要なもの: assets/teams.js（NBA.link・esc）、assets/ui.js（NBA.ui.sortable）
   ═══════════════════════════════════════════════ */
window.NBA = window.NBA || {};

(function () {
    const STALE_DAYS = 7;   // これより古い集計は注意の色にする

    // 更新のたびに中身が変わるので、ブラウザのキャッシュを使わずに確かめる（変わっていなければ通信は小さい）
    let promise = null;
    const load = () => promise ||= fetch('../data/advanced.json', { cache: 'no-cache' })
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .catch(e => { promise = null; throw e; });

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
        const when = at.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' });
        return `<div class="adv-updated ${days >= STALE_DAYS ? 'stale' : ''}">集計: ${when} 時点（${ymd(d.from)}〜${ymd(d.to)} の ${d.games} 試合）${
            days >= STALE_DAYS ? `・${Math.floor(days)}日前の集計です。データの更新が必要です` : ''}</div>`;
    }

    /* ── 行のデータ（100ポゼッションあたりに直す） ── */
    function onOffRows(d) {
        return d.players.map(p => {
            const onO = rating(p.pf, p.offPoss), onD = rating(p.pa, p.defPoss);
            const offO = rating(p.tPF - p.pf, p.tOff - p.offPoss), offD = rating(p.tPA - p.pa, p.tDef - p.defPoss);
            const onNet = onO != null && onD != null ? onO - onD : null;
            const offNet = offO != null && offD != null ? offO - offD : null;
            return { ...p, min: p.sec / 60, onO, onD, onNet, offNet, diff: onNet != null && offNet != null ? onNet - offNet : null };
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

    function renderOnOff(wrap, rows, { showTeam = true } = {}) {
        if (!rows.length) { wrap.innerHTML = '<div class="msg">該当する選手がいません</div>'; return; }
        const cols = [
            { key: 'name', label: 'Player', cls: 'l', get: r => r.name, asc: true },
            ...(showTeam ? [{ key: 'team', label: 'Team', cls: 'l', get: r => r.team, asc: true }] : []),
            { key: 'gp', label: 'GP', get: r => r.gp },
            { key: 'min', label: 'MIN', get: r => r.min },
            { key: 'boxPm', label: '+/-', get: r => r.boxPm, title: '公式のボックススコアの +/- の合計' },
            { key: 'onO', label: 'On ORtg', get: r => r.onO, title: '出場中にチームが100ポゼッションで取った得点' },
            { key: 'onD', label: 'On DRtg', get: r => r.onD, asc: true, title: '出場中に相手が100ポゼッションで取った得点' },
            { key: 'onNet', label: 'On Net', get: r => r.onNet },
            { key: 'offNet', label: 'Off Net', get: r => r.offNet, title: 'ベンチにいる間の Net' },
            { key: 'diff', label: 'On − Off', get: r => r.diff, title: 'On Net − Off Net。大きいほど、その選手がいるとチームが良くなる' },
        ];
        NBA.ui.sortable(shell(wrap), {
            rows, cols, initial: { key: 'diff', asc: false },
            render: r => `<tr><td class="l">${person(r.id, r.name)}</td>${showTeam ? `<td class="l">${team(r.team)}</td>` : ''}
                <td>${r.gp}</td><td>${mmss(r.sec)}</td><td class="${cls(r.boxPm)}">${r.boxPm > 0 ? '+' : ''}${r.boxPm}</td>
                <td>${f1(r.onO)}</td><td>${f1(r.onD)}</td><td class="${cls(r.onNet)}">${sgn(r.onNet)}</td>
                <td class="${cls(r.offNet)}">${sgn(r.offNet)}</td><td class="adv-key ${cls(r.diff)}">${sgn(r.diff)}</td></tr>`,
        });
    }

    function renderUnits(wrap, rows, { showTeam = true } = {}) {
        if (!rows.length) { wrap.innerHTML = '<div class="msg">該当するラインナップがありません</div>'; return; }
        const cols = [
            { key: 'names', label: '5人', cls: 'l', sort: false, get: () => 0 },
            ...(showTeam ? [{ key: 'team', label: 'Team', cls: 'l', get: r => r.team, asc: true }] : []),
            { key: 'gp', label: 'GP', get: r => r.gp },
            { key: 'min', label: 'MIN', get: r => r.min },
            { key: 'diffPts', label: '得点-失点', get: r => r.pf - r.pa },
            { key: 'ortg', label: 'ORtg', get: r => r.ortg },
            { key: 'drtg', label: 'DRtg', get: r => r.drtg, asc: true },
            { key: 'net', label: 'NET', get: r => r.net },
        ];
        NBA.ui.sortable(shell(wrap), {
            rows, cols, initial: { key: 'min', asc: false },
            render: r => `<tr><td class="l adv-unit">${r.ids.map((id, i) => person(id, r.names[i])).join(' · ')}</td>${showTeam ? `<td class="l">${team(r.team)}</td>` : ''}
                <td>${r.gp}</td><td>${mmss(r.sec)}</td><td>${r.pf}-${r.pa}</td><td>${f1(r.ortg)}</td><td>${f1(r.drtg)}</td>
                <td class="adv-key ${cls(r.net)}">${sgn(r.net)}</td></tr>`,
        });
    }

    function renderClutch(wrap, rows) {
        const cols = [
            { key: 'team', label: 'Team', cls: 'l', get: r => r.team, asc: true },
            { key: 'games', label: '接戦', get: r => r.games, title: '残り5分で5点差以内になった試合' },
            { key: 'pct', label: 'W-L', get: r => r.pct, title: '接戦の試合の勝敗' },
            { key: 'min', label: 'MIN', get: r => r.min, title: 'Clutch の時間の合計' },
            { key: 'diffPts', label: '得点-失点', get: r => r.pf - r.pa },
            { key: 'ortg', label: 'ORtg', get: r => r.ortg },
            { key: 'drtg', label: 'DRtg', get: r => r.drtg, asc: true },
            { key: 'net', label: 'NET', get: r => r.net },
        ];
        NBA.ui.sortable(shell(wrap), {
            rows, cols, initial: { key: 'pct', asc: false },
            render: r => `<tr><td class="l">${team(r.team)}</td><td>${r.games}</td><td>${r.games ? `${r.w}-${r.l}` : '-'}</td>
                <td>${r.games ? mmss(r.sec) : '-'}</td><td>${r.games ? `${r.pf}-${r.pa}` : '-'}</td>
                <td>${f1(r.ortg)}</td><td>${f1(r.drtg)}</td><td class="adv-key ${cls(r.net)}">${sgn(r.net)}</td></tr>`,
        });
    }

    NBA.advanced = { load, updatedHTML, onOffRows, unitRows, clutchRows, renderOnOff, renderUnits, renderClutch, f1, sgn, cls, mmss };
})();
