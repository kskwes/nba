/* ═══════════════════════════════════════════════
   ボックススコアの読み取りと追加指標（TS% / eFG% / USG% / PIE）
   試合ページ・選手ページ・チームページ・試合一覧で共通
   ═══════════════════════════════════════════════ */

// ESPN の statistics は names（"PTS"）と keys（"points"）のどちらかで列を探す
function getStatIdx(names, keys, ...candidates) {
    for (const c of candidates) {
        let i = names.indexOf(c);
        if (i >= 0) return i;
        if (keys) { i = keys.indexOf(c); if (i >= 0) return i; }
    }
    return -1;
}

const BOX_RAW = {
    min: ['MIN', 'minutes'], pts: ['PTS', 'points'],
    fg: ['FG', 'fieldGoalsMade-fieldGoalsAttempted'],
    tp: ['3PT', 'threePointFieldGoalsMade-threePointFieldGoalsAttempted'],
    ft: ['FT', 'freeThrowsMade-freeThrowsAttempted'],
    oreb: ['OREB', 'offensiveRebounds'], dreb: ['DREB', 'defensiveRebounds'],
    ast: ['AST', 'assists'], stl: ['STL', 'steals'], blk: ['BLK', 'blocks'],
    to: ['TO', 'turnovers', 'TOV'], pf: ['PF', 'fouls'],
};

// 選手1行を数値に変換（出場していなければ null）
function parseBoxLine(sg, a) {
    if (a.didNotPlay || !a.stats?.length) return null;
    const names = sg.names || [], keys = sg.keys || [];
    const raw = k => { const i = getStatIdx(names, keys, ...BOX_RAW[k]); return i >= 0 ? String(a.stats[i] ?? '') : ''; };
    const num = v => parseInt(v) || 0;
    const pair = v => { const [m, x] = v.split('-'); return [num(m), num(x)]; };
    const [fgm, fga] = pair(raw('fg')), [tpm, tpa] = pair(raw('tp')), [ftm, fta] = pair(raw('ft'));
    return {
        min: num(raw('min')), pts: num(raw('pts')), fgm, fga, tpm, tpa, ftm, fta,
        oreb: num(raw('oreb')), dreb: num(raw('dreb')), ast: num(raw('ast')),
        stl: num(raw('stl')), blk: num(raw('blk')), to: num(raw('to')), pf: num(raw('pf')),
    };
}

const sumBoxLines = lines => lines.reduce((t, l) => {
    Object.keys(l).forEach(k => { t[k] = (t[k] || 0) + l[k]; });
    return t;
}, {});

const teamBoxTotals = teamData => {
    const sg = teamData.statistics?.[0];
    return sumBoxLines((sg?.athletes || []).map(a => parseBoxLine(sg, a)).filter(Boolean));
};

const pieNum = l => l.pts + l.fgm + l.ftm - l.fga - l.fta + l.dreb + 0.5 * l.oreb
    + l.ast + l.stl + 0.5 * l.blk - l.pf - l.to;

// 1試合の追加指標（表示用の文字列）。tm: 自チーム合計 / game: 両チーム合計。分母が 0 の指標は null
function advStats(l, tm, game) {
    const pct = (n, d) => d > 0 ? (100 * n / d).toFixed(1) : null;
    const tsa = l.fga + 0.44 * l.fta;
    const tmPoss = tm.fga + 0.44 * tm.fta + tm.to;
    const gamePie = pieNum(game);
    return [
        pct(l.pts, 2 * tsa),
        pct(l.fgm + 0.5 * l.tpm, l.fga),
        l.min > 0 ? pct((tsa + l.to) * (tm.min / 5), l.min * tmPoss) : null,
        gamePie ? (100 * pieNum(l) / gamePie).toFixed(1) : null,
    ];
}

// Game Score（John Hollinger）: 1試合の出来を1つの数にした指標。
// 得点・リバウンド・アシストに加え、シュートの試投数（外すと減点）・STL・BLK・TO・PF を重み付けする
const gameScore = l => l.pts + 0.4 * l.fgm - 0.7 * l.fga - 0.4 * (l.fta - l.ftm)
    + 0.7 * l.oreb + 0.3 * l.dreb + l.stl + 0.7 * l.ast + 0.7 * l.blk - 0.4 * l.pf - l.to;

// シーズン平均など（数値）。l: { pts, fgm, fga, tpm, fta, to, min }
const advPct = (n, d) => d > 0 ? 100 * n / d : null;
const calcTS  = l => advPct(l.pts, 2 * (l.fga + 0.44 * l.fta));
const calcEFG = l => advPct(l.fgm + 0.5 * l.tpm, l.fga);
// tm: チームの { fga, fta, to, min }
const calcUSG = (l, tm) => tm && l.min > 0
    ? advPct((l.fga + 0.44 * l.fta + l.to) * (tm.min / 5), l.min * (tm.fga + 0.44 * tm.fta + tm.to))
    : null;

// 試合の summary から、その選手の USG% と PIE
function boxAdvForPlayer(summary, athleteId) {
    const teams = summary?.boxscore?.players;
    if (!teams?.length) return null;
    let me = null, myTeam = null;
    const totals = teams.map(t => {
        const sg = t.statistics?.[0];
        const lines = (sg?.athletes || []).map(a => {
            const l = parseBoxLine(sg, a);
            if (l && String(a.athlete?.id) === String(athleteId)) me = l;
            return l;
        }).filter(Boolean);
        const tot = sumBoxLines(lines);
        if (me && !myTeam) myTeam = tot;
        return tot;
    });
    if (!me) return null;
    const gamePie = pieNum(sumBoxLines(totals));
    return { usg: calcUSG(me, myTeam), pie: gamePie ? 100 * pieNum(me) / gamePie : null };
}
