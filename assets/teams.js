/* ═══════════════════════════════════════════════
   チームの固定情報・略称・ページ間リンク（全ページ共通）
   ═══════════════════════════════════════════════ */
window.NBA = window.NBA || {};

// ESPN略称 → 標準3文字略称
const ABBR_MAP = { NY: 'NYK', GS: 'GSW', NO: 'NOP', SA: 'SAS', UTAH: 'UTA', WSH: 'WAS' };
function normAbbr(a) { return ABBR_MAP[a] || a; }

function esc(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='78'%3E%F0%9F%8F%80%3C/text%3E%3C/svg%3E";

(function () {
    // ディビジョン編成は固定なのでチームIDで直書きする（ESPN の /teams 一覧APIはCORSで取れない）
    const DIVISIONS = [
        ['Eastern Conference', 'East', [
            ['Atlantic',  [2, 17, 18, 20, 28]],
            ['Central',   [4, 5, 8, 11, 15]],
            ['Southeast', [1, 14, 19, 27, 30]],
        ]],
        ['Western Conference', 'West', [
            ['Northwest', [7, 16, 22, 25, 26]],
            ['Pacific',   [9, 12, 13, 21, 23]],
            ['Southwest', [3, 6, 10, 24, 29]],
        ]],
    ];
    const ABBR = {
        1: 'ATL', 2: 'BOS', 3: 'NOP', 4: 'CHI', 5: 'CLE', 6: 'DAL', 7: 'DEN', 8: 'DET', 9: 'GSW', 10: 'HOU',
        11: 'IND', 12: 'LAC', 13: 'LAL', 14: 'MIA', 15: 'MIL', 16: 'MIN', 17: 'BKN', 18: 'NYK', 19: 'ORL', 20: 'PHI',
        21: 'PHX', 22: 'POR', 23: 'SAC', 24: 'SAS', 25: 'OKC', 26: 'UTA', 27: 'WAS', 28: 'TOR', 29: 'MEM', 30: 'CHA',
    };
    // ESPN のロゴURLは一部のチームだけ独自の略称を使う
    const LOGO_ABBR = { NYK: 'ny', GSW: 'gs', SAS: 'sa', NOP: 'no', UTA: 'utah', WAS: 'wsh' };

    const list = [];
    DIVISIONS.forEach(([, conf, divs]) => divs.forEach(([div, ids]) => ids.forEach(id => {
        const abbr = ABBR[id];
        list.push({ id: String(id), abbr, conf, div,
            logo: `https://a.espncdn.com/i/teamlogos/nba/500/${(LOGO_ABBR[abbr] || abbr).toLowerCase()}.png` });
    })));
    const byId = Object.fromEntries(list.map(t => [t.id, t]));
    const byAbbr = Object.fromEntries(list.map(t => [t.abbr, t]));

    // 30チームの成績（standings）とスタッツ（core API）。チーム一覧の表と試合前のプレビューで使う
    // 今季のスタッツがまだない（プレシーズンなど）ときは前のシーズン
    let leaguePromise = null;
    function leagueStats() {
        if (leaguePromise) return leaguePromise;
        leaguePromise = (async () => {
            const st = await NBA.api.standings().catch(() => null);
            const rec = {};
            (st?.children || []).forEach(c => (c.standings?.entries || []).forEach(e => {
                const v = n => { const s = e.stats?.find(x => x.name === n); return s ? Number(s.value ?? s.displayValue) : null; };
                const dv = n => e.stats?.find(x => x.name === n)?.displayValue ?? '';
                rec[String(e.team.id)] = {
                    name: e.team.displayName, location: e.team.location || '', nickname: e.team.name || '',
                    logo: e.team.logos?.[0]?.href || '', seed: v('playoffSeed'),
                    w: v('wins'), l: v('losses'), opp: v('avgPointsAgainst'), diff: v('differential'),
                    streak: dv('streak'), l10: dv('Last Ten Games'), home: dv('Home'), road: dv('Road'),
                };
            }));
            let year = NBA.SEASON;
            const load = y => Promise.all(list.map(t => NBA.api.teamStats(t.id, y).catch(() => null)));
            let stats = await load(year);
            if (!stats.some(Boolean)) { year = NBA.SEASON - 1; stats = await load(year); }
            const teams = list.map((t, i) => {
                const m = {};
                (stats[i]?.splits?.categories || []).forEach(c => (c.stats || []).forEach(x => { m[x.name] = x.value; }));
                const r = rec[t.id] || {};
                return {
                    ...t, ...r, name: r.name || t.abbr, logo: r.logo || t.logo,
                    gp: m.gamesPlayed ?? null,
                    pct: r.w + r.l > 0 ? r.w / (r.w + r.l) : null,
                    ppg: m.avgPoints, rpg: m.avgRebounds, apg: m.avgAssists, spg: m.avgSteals, bpg: m.avgBlocks,
                    tov: m.avgTurnovers, fg: m.fieldGoalPct, tp: m.threePointFieldGoalPct ?? m.threePointPct, ft: m.freeThrowPct,
                    ts: m.trueShootingPct,
                };
            });
            return { year, teams };
        })();
        leaguePromise.catch(() => { leaguePromise = null; });
        return leaguePromise;
    }

    // リーグ内の順位（1 = 最も良い）。lowerBetter なら小さい方が上
    function leagueRank(teams, key, id, lowerBetter = false) {
        const vals = teams.filter(t => t[key] != null).sort((a, b) => lowerBetter ? a[key] - b[key] : b[key] - a[key]);
        const i = vals.findIndex(t => t.id === String(id));
        return i >= 0 ? i + 1 : null;
    }

    NBA.teams = {
        DIVISIONS, list,
        ids: list.map(t => t.id),
        byId: id => byId[String(id)] || null,
        // 以前の ESPN 表記（GS・UTAH など）や小文字も受け付ける
        byAbbr: a => byAbbr[normAbbr(String(a || '').toUpperCase())] || null,
        leagueStats, leagueRank,
    };

    /* ── ページ間リンク（どのページも nba/<区分>/<ファイル> の深さにある） ── */
    NBA.link = {
        game: id => `../games/game.html?id=${encodeURIComponent(id)}`,
        player: id => `../players/player.html?id=${encodeURIComponent(id)}`,
        team: abbr => `../teams/team.html?team=${encodeURIComponent(normAbbr(abbr))}`,
        salary: abbr => `../salary/?team=${encodeURIComponent(normAbbr(abbr))}`,
        espnPlayer: id => `https://www.espn.com/nba/player/_/id/${id}`,
        espnTeam: id => `https://www.espn.com/nba/team/_/id/${id}`,
        espnGame: id => `https://www.espn.com/nba/game/_/gameId/${id}`,
    };

    /* ── チームカラー ── */
    const hex = c => /^#?[0-9a-f]{6}$/i.test(c || '') ? (c[0] === '#' ? c : `#${c}`) : null;
    const rgb = c => { const n = parseInt(c.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };

    // 試合カードのチップ用のCSS変数（"1d428a" 形式のESPNの色から）
    function chipVars(color, alt) {
        const c1 = hex(color) || '#2a2a31';
        const c2 = hex(alt) || c1;
        const [r, g, b] = rgb(c1);
        const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return `--tc:${c1};--tc2:${c2};--tc-text:${l > 0.6 ? '#111' : '#fff'}`;
    }

    NBA.color = { hex, chipVars };
})();
