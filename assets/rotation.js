/* ═══════════════════════════════════════════════
   試合時間と、交代記録からの出場区間の再現（試合ページの Rotation と、nba-tools の集計で共通）
   ESPN の play-by-play にはコート上の5人の情報がないので、交代の記録から組み立てる
   必要なもの: assets/stats.js（getStatIdx）と assets/teams.js（normAbbr）
   ═══════════════════════════════════════════════ */

// 経過秒（Q1-4: 12分、OT: 5分）
const flPeriodLen = p => p <= 4 ? 720 : 300;
const flPeriodStart = p => p <= 4 ? (p - 1) * 720 : 2880 + (p - 5) * 300;
const flClockSec = s => String(s).includes(':') ? (+s.split(':')[0]) * 60 + parseFloat(s.split(':')[1]) : parseFloat(s) || 0;
const flElapsed = (p, clock) => flPeriodStart(p) + flPeriodLen(p) - flClockSec(clock);
const flPLabel = p => p <= 4 ? `Q${p}` : (p === 5 ? 'OT' : `OT${p - 4}`);
const flDur = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
const flOther = side => side === 'a' ? 'h' : 'a';

// フリースローの途中の交代は、+/- の区切りをその一連のフリースローの最後にずらす
// （NBA の +/- はファウルの時点でコートにいた選手にフリースローの得点を数えるため）
const RT_FT_RE = /Free Throw - (?:Flagrant )?\d of \d/;
function rtFtTripEnd(plays, i) {
    const t = plays[i].t;
    let end = i;
    for (let j = i + 1; j < plays.length && plays[j].t === t; j++) {
        if (/Foul/.test(plays[j].type) && !RT_FT_RE.test(plays[j].type)) break;   // 交代の後の新しいファウルは別のフリースロー
        if (RT_FT_RE.test(plays[j].type)) end = j;
    }
    return end;
}

// 各クォーターの開始時の5人: そのクォーターで「交代で入る」より先に何かのプレーに登場した選手、
// または交代で「下がる」側で先に登場した選手。足りなければ前のクォーター終了時にいた選手で補う
function rtBuildTeam(side, teamData, plays, periods, now) {
    const sg = teamData?.statistics?.[0];
    if (!sg?.athletes?.length) return null;
    const names = sg.names || [], keys = sg.keys || [];
    const iMin = getStatIdx(names, keys, 'MIN', 'minutes'), iPm = getStatIdx(names, keys, '+/-', 'plusMinus');
    const roster = sg.athletes.map(a => ({
        id: a.athlete?.id, name: a.athlete?.shortName || a.athlete?.displayName || '—', starter: !!a.starter,
        min: iMin >= 0 ? a.stats?.[iMin] ?? '' : '', pm: iPm >= 0 ? a.stats?.[iPm] ?? '' : '', stints: [],
    })).filter(r => r.id);
    const byId = Object.fromEntries(roster.map(r => [r.id, r]));
    const scoreAfter = i => i >= 0 ? [plays[i].as, plays[i].hs] : [0, 0];
    const mine = side === 'a' ? 0 : 1, opp = 1 - mine;
    const start = {};
    const close = (q, t1, i1) => {
        const s = start[q];
        if (!s || !byId[q]) return;
        const s0 = scoreAfter(s.i), s1 = scoreAfter(i1);
        const pf = s1[mine] - s0[mine], pa = s1[opp] - s0[opp];
        if (t1 > s.t) byId[q].stints.push({ t0: s.t, t1, pf, pa, pm: pf - pa });
        delete start[q];
    };
    let on = new Set(roster.filter(r => r.starter).map(r => r.id)), prevEnd = on;
    for (let per = 1; per <= periods; per++) {
        const pp = plays.filter(x => x.p === per);
        if (!pp.length) continue;
        if (per > 1) {
            const seen = {};
            pp.forEach(x => {
                if (x.type === 'Substitution' && x.side === side) {
                    const [i, o] = x.ids;
                    if (!(i in seen)) seen[i] = 'in';
                    if (!(o in seen)) seen[o] = 'on';
                } else x.ids.forEach(q => { if (byId[q] && !(q in seen)) seen[q] = 'on'; });
            });
            on = new Set(Object.keys(seen).filter(q => seen[q] === 'on'));
            for (const q of prevEnd) { if (on.size >= 5) break; if (!(q in seen)) on.add(q); }
        }
        on.forEach(q => { start[q] = { t: flPeriodStart(per), i: pp[0].i - 1 }; });
        pp.forEach(x => {
            if (x.type !== 'Substitution' || x.side !== side) return;
            const [inId, outId] = x.ids;
            const bi = rtFtTripEnd(plays, x.i);
            if (on.has(outId)) { close(outId, x.t, bi); on.delete(outId); }
            on.add(inId); start[inId] = { t: x.t, i: bi };
        });
        // 試合中の最終クォーターは最新プレーまで
        const pend = Math.min(flPeriodStart(per) + flPeriodLen(per), now);
        on.forEach(q => close(q, pend, pp.at(-1).i));
        prevEnd = new Set(on);
    }
    roster.forEach(r => {
        r.sec = r.stints.reduce((s, x) => s + x.t1 - x.t0, 0);
        const boxMin = parseInt(r.min);
        // 交代記録とボックススコアの出場時間が 1 分を超えてずれる選手（記録の抜けや誤り）
        r.mismatch = !isNaN(boxMin) && Math.abs(r.sec / 60 - boxMin) > 1;
    });
    return roster;
}

function buildRotation(data, away, home, isOver) {
    const side = { [away.team.id]: 'a', [home.team.id]: 'h' };
    const plays = (data.plays || []).map((x, i) => ({
        i, p: x.period?.number || 1, t: flElapsed(x.period?.number || 1, x.clock?.displayValue ?? '0'),
        side: side[x.team?.id] || '', type: (x.type?.text || '').replace(/\n/g, ' '),
        as: x.awayScore ?? 0, hs: x.homeScore ?? 0, ids: (x.participants || []).map(q => q.athlete?.id),
    }));
    if (!plays.some(x => x.type === 'Substitution')) return null;
    const periods = Math.max(4, ...plays.map(x => x.p));
    const end = flPeriodStart(periods) + flPeriodLen(periods);
    const now = isOver ? end : plays.at(-1).t;
    const teamData = id => data.boxscore?.players?.find(t => t.team?.id === id);
    const a = rtBuildTeam('a', teamData(away.team.id), plays, periods, now);
    const h = rtBuildTeam('h', teamData(home.team.id), plays, periods, now);
    if (!a || !h) return null;
    return { a, h, plays, periods, end, now, abbr: { a: normAbbr(away.team.abbreviation), h: normAbbr(home.team.abbreviation) } };
}

/* ── 5人の組み合わせ（ラインナップ）ごとの出場時間と得失点 ──
   出場区間の境目で時間を区切り、5人がそろっている区間だけを足す。
   possEnds（任意）: countPossessions の ends に経過秒 t を付けたもの。渡すとポゼッション数も数える
   戻り値: [{ ids, names, sec, pf, pa, offPoss, defPoss }] */
function lineupUnits(rot, side, possEnds) {
    const R = rot?.[side];
    if (!R) return [];
    const cuts = [...new Set(R.flatMap(r => r.stints.flatMap(s => [s.t0, s.t1])))].sort((x, y) => x - y);
    const scoreAt = t => { let sc = { as: 0, hs: 0 }; for (const p of rot.plays) { if (p.t > t) break; sc = p; } return sc; };
    const mine = side === 'a' ? 'as' : 'hs', opp = side === 'a' ? 'hs' : 'as', other = side === 'a' ? 'h' : 'a';
    const possIn = (s, a, b) => possEnds ? possEnds.filter(e => e.side === s && e.t > a && e.t <= b).length : 0;
    const units = {};
    for (let i = 0; i + 1 < cuts.length; i++) {
        const a = cuts[i], b = cuts[i + 1];
        const on = R.filter(r => r.stints.some(s => s.t0 <= a && s.t1 >= b));
        if (on.length !== 5) continue;
        const key = on.map(r => r.id).sort().join(',');
        const s0 = scoreAt(a), s1 = scoreAt(b);
        const u = (units[key] ||= { ids: on.map(r => r.id), names: on.map(r => r.name), sec: 0, pf: 0, pa: 0, offPoss: 0, defPoss: 0 });
        u.sec += b - a; u.pf += s1[mine] - s0[mine]; u.pa += s1[opp] - s0[opp];
        u.offPoss += possIn(side, a, b); u.defPoss += possIn(other, a, b);
    }
    return Object.values(units);
}
