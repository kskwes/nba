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

// ファンタジーポイント: nba-fantasy と同じ配点（Yahoo 標準。nba-fantasy/app.js の CONFIG.SCORING）
// 配点を変えるときは両方を合わせて直す
const FANTASY_SCORING = { pts: 1, reb: 1.2, ast: 1.5, stl: 3, blk: 3, to: -1 };
const fantasyPoints = l => FANTASY_SCORING.pts * l.pts + FANTASY_SCORING.reb * (l.oreb + l.dreb) + FANTASY_SCORING.ast * l.ast
    + FANTASY_SCORING.stl * l.stl + FANTASY_SCORING.blk * l.blk + FANTASY_SCORING.to * l.to;

/* ── ポゼッションを play-by-play から数える ──
   攻撃が相手に移った時点で、それまで攻めていたチームのポゼッションを1回数える。
   ・FG 成功（And-1 のフリースローが続くときは、そのフリースローの後）
   ・最後のフリースローの成功（テクニカル・フレイグラントは数えない。フレイグラントの後は同じチームの攻撃が続く）
   ・相手のディフェンスリバウンド（選手がいないチームリバウンドも含む）
   ・ターンオーバー
   ・クォーターの終了（攻めていたチームに、何かプレーがあったか、残り時間がある状態でボールが移っていれば。
     残り0秒のブザービーターの後にボールが移っただけの場合は数えない。ただし試合の最後は数える。
     NBA.com の OffRtg と9チーム分を突き合わせて決めた。試合の最後の例はまだ1つだけ）
   plays: ESPN の summary の plays / sideOf(teamId) → 'a' | 'h' | undefined
   戻り値: { a: 回数, h: 回数, ends: [{ i: プレーの番号, side }] }（ends は出場区間ごとに数えるのに使う） */
const POSS_TO_RE = /Turnover|Traveling|Double Dribble|Discontinued Dribble|Palming|Basket from Below/;
function countPossessions(plays, sideOf) {
    const out = { a: 0, h: 0, ends: [] };
    let cur = null;       // 今攻めているチーム
    let andOne = null;    // And-1 のフリースローを待っているチーム
    let active = false;   // 今攻めているチームに、ボールが移ってから何かプレーがあったか
    let handoffClock = 0; // ボールが移ったときの、クォーターの残り秒数
    const other = s => s === 'a' ? 'h' : 'a';
    const clockSec = x => { const v = String(x.clock?.displayValue ?? '0'); return v.includes(':') ? (+v.split(':')[0]) * 60 + parseFloat(v.split(':')[1]) : parseFloat(v) || 0; };
    const end = (i, s) => {
        if (!s) return;
        out[s]++; out.ends.push({ i, side: s }); cur = other(s); andOne = null;
        active = false; handoffClock = clockSec(plays[i]);
    };
    // シュート成功の後、次の攻撃のプレー（シュート・リバウンド・TO）より先に同じチームの「1 of 1」のフリースローがあれば And-1
    const isAndOne = (i, s) => {
        for (let j = i + 1; j < Math.min(plays.length, i + 10); j++) {
            const y = plays[j], t = (y.type?.text || '').replace(/\n/g, ' ');
            if (/Free Throw - 1 of 1/.test(t) && sideOf(y.team?.id) === s) return true;
            if (y.shootingPlay || /Rebound|End Period|End Game/.test(t) || POSS_TO_RE.test(t)) return false;
        }
        return false;
    };
    plays.forEach((x, i) => {
        const t = (x.type?.text || '').replace(/\n/g, ' ');
        const s = sideOf(x.team?.id);
        if (/End Period|End Game/.test(t)) {
            const gameEnd = plays.slice(i + 1).every(y => /End Game|Substitution|Review|Challenge/.test(y.type?.text || ''));
            if (cur && (active || handoffClock > 0 || gameEnd)) { out[cur]++; out.ends.push({ i, side: cur }); }
            cur = null; andOne = null; active = false; return;
        }
        if (!s) return;
        if (s === cur) active = true;
        if (t === 'Defensive Rebound') { if (cur === other(s) || cur === null) end(i, other(s)); cur = s; active = true; return; }
        if (t === 'Offensive Rebound') { cur = s; active = true; return; }
        if (POSS_TO_RE.test(t)) { end(i, s); return; }
        if (/^Free Throw/.test(t)) {
            if (/Technical|Flagrant/.test(t)) return;
            const m = t.match(/(\d) of (\d)/);
            if (!m || m[1] !== m[2]) { cur = s; return; }
            // 「1 of 1」は And-1 のときだけ攻撃の終わり（それ以外はテクニカルのフリースロー）
            if (m[1] === '1' && andOne !== s) return;
            if (x.scoringPlay) end(i, s);
            else { cur = s; andOne = null; }
            return;
        }
        if (x.shootingPlay && !/Heave/.test(t)) {
            cur = s;
            if (!x.scoringPlay) return;
            if (isAndOne(i, s)) andOne = s; else end(i, s);
        }
    });
    return out;
}

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

/* ── 見どころ（終わった試合）: Games ページの試合カードのラベルと、試合ページの Summary
   ESPN の試合中の勝率の揺れ・リードの入れ替わり・終盤2分で3点差以内・延長・最終点差から内部で点数を出し、
   名勝負（85〜）/ 接戦（60〜）/ 見どころあり（40〜）/ 一方的 に分ける。点数そのものは表示しない ── */
function gameExcitement(d) {
    const comp = d?.header?.competitions?.[0];
    if (!comp?.status?.type?.completed || !d.plays?.length) return null;
    const away = comp.competitors.find(c => c.homeAway === 'away'), home = comp.competitors.find(c => c.homeAway === 'home');
    if (!away || !home) return null;
    const margin = Math.abs((+away.score || 0) - (+home.score || 0));
    const wp = (d.winprobability || []).map(w => w.homeWinPercentage).filter(v => v != null);
    let swing = 0;
    for (let i = 1; i < wp.length; i++) swing += Math.abs(wp[i] - wp[i - 1]);
    const leadChanges = parseInt((d.boxscore?.teams || []).flatMap(t => t.statistics || []).find(s => s.name === 'leadChanges')?.displayValue) || 0;
    const sec = c => { const [m, s] = String(c ?? '0').split(':'); return s == null ? parseFloat(m) || 0 : (parseInt(m) || 0) * 60 + (parseFloat(s) || 0); };
    const lateClose = d.plays.some(x => (x.period?.number || 1) >= 4 && sec(x.clock?.displayValue) <= 120 && Math.abs((x.homeScore ?? 0) - (x.awayScore ?? 0)) <= 3);
    const ot = Math.max(...d.plays.map(x => x.period?.number || 1)) - 4;
    const score = 40 * Math.min(1, swing / 12) + 20 * Math.min(1, leadChanges / 12) + (lateClose ? 20 : 0) + (ot > 0 ? 10 : 0)
        + (margin <= 5 ? 10 : margin <= 10 ? 5 : 0);
    const level = score >= 85 ? ['名勝負', 'best'] : score >= 60 ? ['接戦', 'close'] : score >= 40 ? ['見どころあり', 'some'] : ['一方的', 'flat'];
    const reasons = [ot > 0 ? `延長${ot > 1 ? ot : ''}` : '', lateClose ? '終盤まで接戦' : '', leadChanges >= 8 ? `リード交代${leadChanges}回` : '', swing >= 8 ? '勝率が大きく揺れた' : ''].filter(Boolean);
    return { label: level[0], cls: level[1], reasons, margin };
}
