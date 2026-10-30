/* ═══════════════════════════════════════════════
   タイムアウトの前後の分析（試合ページの Flow タブ）
   play-by-play から、タイムアウト前の流れ・直後の攻撃の結果・前後2分の得点を出す
   必要なもの: assets/stats.js（countPossessions）、assets/rotation.js（flElapsed・flClockSec）
   ═══════════════════════════════════════════════ */
const TO_WINDOW = 120;   // 前後の流れを見る時間（秒）
const TO_RUN = 6;        // 相手の連続得点がこれ以上なら「相手のラン」

function toShotZone(x) {
    const t = x.type?.text || '', c = x.coordinate;
    if (/Free Throw/.test(t)) return 'FT';
    if (c && c.x >= 0 && c.y >= -3 && c.y < 47) {
        const dx = c.x - 25, dy = Math.max(0, c.y);
        if (x.pointsAttempted === 3 || /three point/.test(x.text || '')) return Math.abs(dx) >= 21 && dy <= 9 ? 'コーナー3' : '3P';
        if (Math.hypot(dx, dy) <= 4) return 'リング下';
        if (Math.abs(dx) <= 8 && dy <= 13.75) return 'ペイント';
        return 'ミドル';
    }
    if (/three point/.test(x.text || '')) return '3P';
    if (/Layup|Dunk|Tip/i.test(t)) return 'リング下';
    return '2P';
}

// plays: summary.plays / sideOf: teamId → 'a' | 'h'
function analyzeTimeouts(plays, sideOf) {
    const tOf = x => flElapsed(x.period?.number || 1, x.clock?.displayValue ?? '0');
    const other = s => s === 'a' ? 'h' : 'a';
    const poss = countPossessions(plays, sideOf);
    const scores = plays.map((x, i) => ({ i, t: tOf(x), s: sideOf(x.team?.id), v: x.scoringPlay ? (x.scoreValue || 0) : 0 })).filter(x => x.v && x.s);
    const ptsIn = (side, t0, t1) => scores.filter(x => x.s === side && x.t > t0 && x.t <= t1).reduce((n, x) => n + x.v, 0);
    const isTimeout = x => /Timeout/.test(x.type?.text || '');
    const isNoise = x => isTimeout(x) || /Substitution|Challenge|Jump Ball|End of|Instant Replay/.test(x.type?.text || '');

    const isFt = p => /Free Throw/.test(p?.type?.text || '');
    // 同じ止まった時間に続けて取ったタイムアウトは、最後の1つにまとめる
    const list = plays.map((x, i) => ({ x, i })).filter(({ x }) => isTimeout(x) && sideOf(x.team?.id));
    const merged = list.filter((t, k) => {
        const nx = list[k + 1];
        return !nx || plays.slice(t.i + 1, nx.i).some(p => !isNoise(p));
    });
    return merged.map(({ x, i }) => {
        const side = sideOf(x.team.id), opp = other(side), t = tOf(x);
        const per = x.period?.number || 1, clock = flClockSec(x.clock?.displayValue ?? '0');
        const score = { a: x.awayScore ?? 0, h: x.homeScore ?? 0 };

        // 直前の流れ: 相手の連続得点（最後にこちらが点を取ってから）と、直前2分の得点
        let streak = 0;
        for (let k = scores.length - 1; k >= 0; k--) {
            if (scores[k].i >= i) continue;
            if (scores[k].s !== opp) break;
            streak += scores[k].v;
        }
        const before = { [side]: ptsIn(side, t - TO_WINDOW, t), [opp]: ptsIn(opp, t - TO_WINDOW, t) };
        const prev = plays.slice(0, i).reverse().find(p => !isNoise(p));
        const diff = score[side] - score[opp];
        let why;
        if (per >= 4 && clock <= 120 && Math.abs(diff) <= 5) why = { key: 'late', label: '終盤の作戦' };
        else if (streak >= TO_RUN) why = { key: 'run', label: `相手の ${streak}-0 ラン` };
        else if (before[opp] - before[side] >= TO_RUN) why = { key: 'run', label: `直前2分 ${before[side]}-${before[opp]}` };
        else if (prev && sideOf(prev.team?.id) === side && /Turnover/.test(prev.type?.text || '')) why = { key: 'to', label: 'ターンオーバーの後' };
        else if (prev && prev.scoringPlay && sideOf(prev.team?.id) === opp) why = { key: 'score', label: '失点の後' };
        else why = { key: 'other', label: 'その他' };

        // 直後の攻撃: タイムアウトの後に始まる最初のポゼッション。
        // フリースローの途中・直前（ファウルの後）に取ったときは、フリースローの後の攻撃を見る
        let k = poss.ends.findIndex(e => e.i > i);
        let start = i;
        const firstAfter = plays.slice(i + 1).find(p => !isNoise(p));
        let viaFt = false;
        if (k >= 0 && isFt(firstAfter)) { start = poss.ends[k].i; k++; viaFt = true; }
        const end = poss.ends[k];
        let ato = null;
        if (end) {
            const off = end.side;
            const seq = plays.slice(start + 1, end.i + 1).filter(p => !isNoise(p));
            const mine = p => sideOf(p.team?.id) === off;
            const pts = seq.filter(p => p.scoringPlay && mine(p)).reduce((n, p) => n + (p.scoreValue || 0), 0);
            const fgs = seq.filter(p => p.shootingPlay && mine(p) && !isFt(p));
            const made = fgs.find(p => p.scoringPlay);
            const key = made || fgs[0];   // 決めたシュート、なければ最初のシュート
            const tov = seq.find(p => /Turnover/.test(p.type?.text || '') && mine(p));
            const oreb = seq.some(p => /Offensive Rebound/.test(p.type?.text || '') && mine(p));
            let result;
            if (made) result = { key: 'fg', label: `${made.scoreValue}P 成功` };
            else if (pts) result = { key: 'ft', label: 'FT で得点' };
            else if (tov) result = { key: 'tov', label: 'ターンオーバー' };
            else if (fgs.length || seq.some(p => isFt(p) && mine(p))) result = { key: 'miss', label: '得点なし' };
            else result = { key: 'none', label: 'シュートなし' };
            ato = {
                off, pts, result, viaFt, oreb,
                zone: key ? toShotZone(key) : null,
                assisted: !!made && /assists\)/.test(made.text || ''),
                secs: fgs[0] ? Math.max(0, Math.round(tOf(fgs[0]) - (viaFt ? tOf(plays[start]) : t))) : null,
                text: seq.filter(p => mine(p) || p.scoringPlay).slice(0, 4).map(p => (p.text || '').replace(/\s+/g, ' ')),
            };
        }
        const after = { [side]: ptsIn(side, t, t + TO_WINDOW), [opp]: ptsIn(opp, t, t + TO_WINDOW) };
        return { i, t, side, per, clock: x.clock?.displayValue, score, why, before, after, ato };
    });
}

