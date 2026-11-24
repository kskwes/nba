/* ═══════════════════════════════════════════════
   その日のハイライトの判定（Games ページの Topic タブ）
   モック nba-mock/v3/highlights.js から移した。Career high は記事の文（api.js が残す careerNotes）から判定する。
   使うもの: nba/assets/stats.js（parseBoxLine・gameExcitement）、teams.js（normAbbr）

   NBAHighlights.detect(summaries, standings, opts) → ハイライトの配列（大事な順）
     summaries: 試合の summary（ESPN の .../summary?event=ID）の配列。終わった試合だけを判定する
     standings: ESPN の standings（.../apis/v2/sports/basketball/nba/standings）
     opts.experience:      { athleteId: NBA経験年数 }（チームのロスターの experience.years）。無ければルーキーの判定はしない
     opts.skipStreakTeams: 連勝・連敗を出さないチーム id（その試合の後にもう次の試合を終えたチーム）
     opts.types:           出す種類の配列（既定は DEFAULT_TYPES = gameWinner / forcedOT / comeback / careerHigh / bigLine / rookie）。'all' で全部
   表示は試合カードの中で、scope: 'game' はタグと brief（["C. Flagg", "3.6s"]）だけ、
   scope: 'player' は選手の顔写真・名前・tags・hero（主役の数字 { value, label }）・player.stats（PTS / REB / AST など）の小さなカード
   NBAHighlights.rookieCandidateTeams(summaries) → ロスターを取るべきチーム id（20得点以上の選手がいるチーム）

   1件の形: { type, size: 'big'|'small', priority, gameId, team, opp, player: { id, name, short, headshot, stats }, hero, scope, brief, value, text, ja, sub, subJa, tags, video, game }
     type: careerHigh / gameWinner / forcedOT / buzzer / comeback / bigLine / classic / streak / rookie
     同じ試合の同じ選手のハイライトは1件にまとめ、まとめた種類は tags、その文章は extras（[{ type, text, ja }]）に入れる（大事な方の type を残す）
   ═══════════════════════════════════════════════ */
(function (root) {
    const T = {
        clutchSec: 5,       // 試合終了の何秒前までの決勝点・同点弾を Game-winner / Forced OT にするか
        buzzerSec: 1,       // クォーター終了の何秒前までを Buzzer-beater にするか（Q1〜Q3。FG のみ）
        comeback: 15,       // 何点差以上をひっくり返したら Big comeback
        pts: 40, tpm: 8, reb: 20, ast: 15,
        rookiePts: 20,
        winStreakStep: 5,   // 連勝: 5, 10, 15 ...
        lossStreak: 10,     // 連敗: 10 以上は毎回、それ未満は 5 の倍数のとき
    };
    // 並べる順の基準（大きいほど上）
    const PRI = { gameWinner: 100, forcedOT: 92, comeback: 90, careerHigh: 85, classic: 70, bigLine: 60, buzzer: 50, streak: 45, rookie: 40 };
    const GAME_TYPES = new Set(['gameWinner', 'forcedOT', 'buzzer', 'comeback', 'classic', 'streak']);
    const BIG_TYPES = new Set(['gameWinner', 'forcedOT', 'comeback', 'careerHigh']);
    const TAG = {
        gameWinner: 'Game-winner', forcedOT: 'Forced OT', buzzer: 'Buzzer-beater', comeback: 'Comeback',
        careerHigh: 'Career high', bigLine: 'Big line', classic: 'Classic', streak: 'Streak', rookie: 'Rookie',
    };

    const abbr = a => (typeof normAbbr === 'function' ? normAbbr(a) : a);
    const clockSec = v => { v = String(v ?? '0'); return v.includes(':') ? (+v.split(':')[0]) * 60 + parseFloat(v.split(':')[1]) : parseFloat(v) || 0; };
    const fmtClock = s => s >= 60 ? `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}` : `${s.toFixed(1)}`;
    const pLabel = p => p <= 4 ? `Q${p}` : p === 5 ? 'OT' : `${p - 4}OT`;
    const pLabelJa = p => p <= 4 ? `第${p}Q` : p === 5 ? '延長' : `延長${p - 4}回目`;

    /* ── 1試合の土台（チーム・選手の数字） ── */
    function gameBase(d) {
        const comp = d?.header?.competitions?.[0];
        if (!comp?.status?.type?.completed) return null;
        const cs = comp.competitors;
        const away = cs.find(c => c.homeAway === 'away'), home = cs.find(c => c.homeAway === 'home');
        if (!away || !home) return null;
        const team = c => ({ id: c.team.id, abbr: abbr(c.team.abbreviation), name: c.team.displayName, short: c.team.shortDisplayName || c.team.name, score: +c.score || 0,
            logo: c.team.logos?.[0]?.href || `https://a.espncdn.com/i/teamlogos/nba/500/${abbr(c.team.abbreviation).toLowerCase()}.png` });
        const A = team(away), Hm = team(home);
        const winner = A.score > Hm.score ? A : Hm, loser = winner === A ? Hm : A;
        const players = [];
        (d.boxscore?.players || []).forEach(t => {
            const sg = t.statistics?.[0];
            (sg?.athletes || []).forEach(a => {
                const l = parseBoxLine(sg, a);
                if (!l) return;
                const me = t.team.id === A.id ? A : Hm;
                players.push({
                    id: String(a.athlete.id), name: a.athlete.displayName, short: a.athlete.shortName || a.athlete.displayName,
                    headshot: a.athlete.headshot?.href || `https://a.espncdn.com/i/headshots/nba/players/full/${a.athlete.id}.png`,
                    team: me, opp: me === A ? Hm : A, l, reb: l.oreb + l.dreb,
                });
            });
        });
        const periods = d.plays?.length ? Math.max(...d.plays.map(x => x.period?.number || 1)) : 4;
        const game = { id: String(d.header.id), away: A, home: Hm, winner, loser, periods,
            final: `${A.abbr} ${A.score}, ${Hm.abbr} ${Hm.score}${periods > 4 ? ` (${periods === 5 ? 'OT' : `${periods - 4}OT`})` : ''}` };
        return { d, game, players, byId: new Map(players.map(p => [p.id, p])) };
    }

    // 「24 PTS, 10 REB, 5 AST」の形（目立つ数字だけ）
    function statLine(p) {
        const l = p.l, parts = [`${l.pts} PTS`];
        if (p.reb >= 5) parts.push(`${p.reb} REB`);
        if (l.ast >= 5) parts.push(`${l.ast} AST`);
        if (l.tpm >= 4) parts.push(`${l.tpm} 3PM`);
        if (l.stl >= 4) parts.push(`${l.stl} STL`);
        if (l.blk >= 4) parts.push(`${l.blk} BLK`);
        return parts.join(', ');
    }
    const result = (p, g) => p.team === g.winner ? `in a win over ${p.opp.abbr}` : `in a loss to ${p.opp.abbr}`;
    const resultJa = (p, g) => p.team === g.winner ? `${p.opp.abbr} に勝利` : `${p.opp.abbr} に敗戦`;

    /* ── ハイライト動画: 選手の名前や「winner」などを見出しに含む動画。無ければ試合のハイライト動画 ── */
    function findVideo(d, words, fallback) {
        const vs = (d.videos || []).filter(v => v.thumbnail);
        // words は優先する順（先の言葉に合う動画を先に選ぶ）
        let hit = null;
        for (const w of words) {
            hit = vs.find(v => new RegExp(`\\b${w}\\b`, 'i').test(`${v.headline} ${v.description || ''}`));
            if (hit) break;
        }
        const v = hit || (fallback ? vs.find(v => /Game Highlights/i.test(v.headline)) || vs[0] : null);
        return v ? { thumb: v.thumbnail, headline: v.headline, href: v.links?.web?.href || v.links?.source?.href || null, duration: v.duration || null } : null;
    }
    const lastName = n => n.split(' ').slice(1).join(' ').replace(/\s+(Jr\.|Sr\.|II|III|IV)$/, '') || n;

    /* ── 1. Career high: 記事（article.story）に「career-high」とある選手と数字。ボックススコアと数字が合うものだけ ── */
    const CH_STAT = [
        [/points?/i, 'pts', 'points', '得点'], [/rebounds?|boards?/i, 'reb', 'rebounds', 'リバウンド'], [/assists?/i, 'ast', 'assists', 'アシスト'],
        [/3-pointers?|three-pointers?|3s\b|threes/i, 'tpm', '3-pointers', '本の3P'], [/steals?/i, 'stl', 'steals', 'スティール'], [/blocks?|blocked shots?/i, 'blk', 'blocks', 'ブロック'],
    ];
    const statVal = (p, k) => k === 'reb' ? p.reb : p.l[k];
    function careerHighs(G) {
        // 本番の api.js は記事を保存しないため、career high を含む文だけを careerNotes に残している（どちらでも読める）
        const html = G.d.article?.story || (G.d.careerNotes || []).join(' ');
        if (!html) return [];
        const text = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&rsquo;/g, "'").replace(/\s+/g, ' ').replace(/\s+([,.])/g, '$1');
        const sentences = text.split(/(?<=[.!?])\s+(?=[A-Z"“])/);
        const out = [];
        sentences.forEach(s => {
            const kw = s.search(/career[- ](high|best)/i);
            if (kw < 0) return;
            const tying = /career[- ](high|best)[- ]tying|tied (his|a) career/i.test(s);
            // 数字と項目: 「career-high 22 assists」「career-high-tying 30 points」「30 points, a career high」
            const nums = [];
            const after = s.slice(kw).match(/career[- ](?:high|best)(?:[- ]tying)?\s+(?:with\s+|of\s+)?(\d+)\s*([A-Za-z-]+)?/i);
            if (after) nums.push([+after[1], after[2] || '']);
            const before = s.slice(0, kw).match(/(\d+)\s+([A-Za-z-]+)[^.\d]{0,25}$/);
            if (before) nums.push([+before[1], before[2]]);
            if (!nums.length) return;
            // 選手: 文中に名前（フルネーム、または試合内で重ならない姓）があり、キーワードより前で一番近い人
            const cands = G.players.map(p => {
                const ln = lastName(p.name), lnUnique = G.players.filter(q => lastName(q.name) === ln).length === 1;
                let at = s.lastIndexOf(p.name, kw);
                if (at < 0 && lnUnique) at = s.slice(0, kw).search(new RegExp(`\\b${ln.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b(?![^.]*\\b${ln}\\b)`));
                return { p, at };
            }).filter(c => c.at >= 0).sort((a, b) => b.at - a.at);
            for (const c of cands) {
                for (const [n, word] of nums) {
                    const st = CH_STAT.find(x => x[0].test(word));
                    const keys = st ? [st] : CH_STAT;
                    const hit = keys.find(x => statVal(c.p, x[1]) === n);
                    if (!hit) continue;
                    if (out.some(o => o.player.id === c.p.id && o.stat === hit[1])) return;
                    const p = c.p;
                    out.push(item('careerHigh', G, {
                        player: p, value: n, stat: hit[1], tying,
                        hero: { value: n, label: { pts: 'PTS', reb: 'REB', ast: 'AST', tpm: '3PM', stl: 'STL', blk: 'BLK' }[hit[1]] },
                        text: `${p.name} ${tying ? 'tied his' : 'set a'} career high with ${n} ${hit[2]}`,
                        ja: `${p.name} が${tying ? 'キャリアハイタイの' : 'キャリアハイの'}${n}${hit[3]}`,
                        sub: `${statLine(p)} ${result(p, G.game)}`, subJa: `${statLine(p)}（${resultJa(p, G.game)}）`,
                        video: findVideo(G.d, [lastName(p.name)], true), quote: s.trim(),
                    }));
                    return;
                }
            }
        });
        return out;
    }

    /* ── 2. Game-winner / Forced OT / Buzzer-beater（play-by-play） ──
       ピリオドの残り数秒に決まり、リードを取った（または同点にした）得点のうち、そのままピリオドが終わったもの。
       ・最後のピリオドでリードを取った → Game-winner（大）
       ・第4Q以降で同点にして延長へ → Forced OT（大）
       ・第1〜3Q の終了間際（buzzerSec 秒以内）の FG で、リードを取った・同点にした → Buzzer-beater（小） */
    function clutchShots(G) {
        const plays = G.d.plays || [], g = G.game, out = [];
        const byPeriod = {};
        let prevA = 0, prevH = 0;
        plays.forEach(x => {
            const p = x.period?.number || 1;
            const a = x.awayScore ?? prevA, h = x.homeScore ?? prevH;
            if (x.scoringPlay) (byPeriod[p] ||= []).push({ x, sec: clockSec(x.clock?.displayValue), beforeA: prevA, beforeH: prevH, a, h });
            prevA = a; prevH = h;
        });
        Object.entries(byPeriod).forEach(([pStr, list]) => {
            const p = +pStr, last = list[list.length - 1], endDiff = last.a - last.h;   // ピリオド終了時の差（アウェイから見て）
            const isFinal = p === g.periods;
            const limit = p < 4 ? T.buzzerSec : T.clutchSec;
            // 最後から見て、リード（同点）を作った得点を探す
            for (let i = list.length - 1; i >= 0; i--) {
                const s = list[i];
                if (s.sec > limit) break;
                const side = s.x.team?.id === g.away.id ? 1 : s.x.team?.id === g.home.id ? -1 : 0;
                if (!side) continue;
                const before = side * (s.beforeA - s.beforeH), after = side * (s.a - s.h), end = side * endDiff;
                const tookLead = before <= 0 && after > 0 && end > 0;
                const tied = before < 0 && after === 0 && end === 0;
                if (!tookLead && !tied) continue;
                const isFT = /Free Throw/i.test(s.x.type?.text || '');
                if (p < 4 && (isFT || !s.x.shootingPlay)) break;
                const pid = String(s.x.participants?.[0]?.athlete?.id || '');
                const pl = G.byId.get(pid) || null;
                const team = side === 1 ? g.away : g.home, opp = side === 1 ? g.home : g.away;
                const who = pl?.name || team.abbr, left = fmtClock(s.sec);
                const shot = (s.x.text || '').replace(/^.*? makes /, '').replace(/\s*\(.*\)$/, '');
                let type, text, ja;
                if (isFinal && tookLead) {
                    type = 'gameWinner';
                    text = isFT ? `${who} hit the go-ahead free throws with ${left} left to beat ${opp.abbr}` : `${who} hit the game-winner with ${left} left to beat ${opp.abbr}`;
                    ja = isFT ? `${who} が残り${left}秒で勝ち越しのフリースローを決め、${opp.abbr} に勝利` : `${who} が残り${left}秒で決勝点を決め、${opp.abbr} に勝利`;
                } else if (p >= 4 && tied && !isFinal) {
                    type = 'forcedOT';
                    text = `${who} tied it with ${left} left in ${pLabel(p)} to force ${p === 4 ? 'overtime' : 'another overtime'}`;
                    ja = `${who} が${pLabelJa(p)}残り${left}秒で同点にし、延長へ`;
                } else if (p < 4) {
                    type = 'buzzer';
                    text = `${who} beat the ${pLabel(p)} buzzer to ${tied ? 'tie it' : `put ${team.abbr} ahead`}`;
                    ja = `${who} が${pLabelJa(p)}終了間際に決めて${tied ? '同点' : `${team.abbr} がリード`}`;
                } else break;   // 第4Q以降で、最後のピリオドではないのにリードを取った（延長に入らない）ことは起きない
                out.push(item(type, G, {
                    player: pl, team, opp, value: s.sec, period: p,
                    text, ja,
                    sub: `${shot ? shot[0].toUpperCase() + shot.slice(1) + ' · ' : ''}${g.final}`, subJa: g.final,
                    video: findVideo(G.d, ['game-winner', 'winner', 'buzzer', 'clutch', pl ? lastName(pl.name) : ''].filter(Boolean), type !== 'buzzer'),
                    clock: `${pLabel(p)} ${left}`,
                    brief: [pl?.short || team.abbr, `${left}s`],
                }));
                break;
            }
        });
        return out;
    }

    /* ── 3. Big comeback: 勝ったチームが試合中に何点差まで離されていたか ── */
    function comeback(G) {
        const g = G.game, wSide = g.winner === g.away ? 1 : -1;
        let max = 0, at = null;
        (G.d.plays || []).forEach(x => {
            if (x.awayScore == null) return;
            const def = -wSide * (x.awayScore - x.homeScore);
            if (def > max) { max = def; at = x; }
        });
        if (max < T.comeback) return [];
        const when = at ? `${pLabel(at.period?.number || 1)} ${fmtClock(clockSec(at.clock?.displayValue))}` : '';
        return [item('comeback', G, {
            team: g.winner, opp: g.loser, value: max,
            text: `${g.winner.short} came back from ${max} down to beat ${g.loser.abbr}`,
            ja: `${g.winner.short} が最大${max}点差をひっくり返して ${g.loser.abbr} に勝利`,
            sub: `Trailed by ${max} (${when}) · ${g.final}`, subJa: `${when} に${max}点差 · ${g.final}`,
            video: findVideo(G.d, [], true),
            brief: [`${max} pts`],
        })];
    }

    /* ── 4. Big lines（ボックススコア） ── */
    function bigLines(G) {
        const out = [];
        G.players.forEach(p => {
            // tags: [タグ(英), 日本語, 主役の数字 { value, label }]。最初のタグの数字をカードの大きな数字にする
            const l = p.l, tags = [];
            const dbl = [l.pts, p.reb, l.ast, l.stl, l.blk].filter(v => v >= 10).length;
            if (l.pts >= T.pts) tags.push([`${l.pts} PTS`, `${l.pts}得点`, { value: l.pts, label: 'PTS' }]);
            if (dbl >= 3) tags.push([dbl >= 4 ? 'Quadruple-double' : 'Triple-double', dbl >= 4 ? 'クアドルプル・ダブル' : 'トリプルダブル', { value: `${l.pts}-${p.reb}-${l.ast}`, label: 'PTS-REB-AST' }]);
            if (l.pts >= 20 && p.reb >= 20) tags.push(['20-20', '20得点20リバウンド', { value: `${l.pts}-${p.reb}`, label: 'PTS-REB' }]);
            else if (p.reb >= T.reb) tags.push([`${p.reb} REB`, `${p.reb}リバウンド`, { value: p.reb, label: 'REB' }]);
            if (l.ast >= T.ast) tags.push([`${l.ast} AST`, `${l.ast}アシスト`, { value: l.ast, label: 'AST' }]);
            if (l.tpm >= T.tpm) tags.push([`${l.tpm} 3PM`, `3P ${l.tpm}本`, { value: l.tpm, label: '3PM' }]);
            if (!tags.length) return;
            out.push(item('bigLine', G, {
                player: p, value: l.pts + (dbl >= 3 ? 30 : 0),
                text: `${p.name}: ${tags.map(t => t[0]).join(', ')}`,
                ja: `${p.name}: ${tags.map(t => t[1]).join('・')}`,
                sub: `${statLine(p)} ${result(p, G.game)}`, subJa: `${statLine(p)}（${resultJa(p, G.game)}）`,
                lineTags: tags.map(t => t[0]), tags: tags.map(t => t[0]), hero: tags[0][2],
            }));
        });
        return out;
    }

    /* ── 5. Classic（stats.js の gameExcitement） ── */
    function classic(G) {
        const ex = gameExcitement(G.d);
        if (ex?.label !== 'Classic') return [];
        const g = G.game;
        return [item('classic', G, {
            team: g.winner, opp: g.loser,
            text: `Classic: ${g.final}`, ja: `名勝負: ${g.final}`,
            sub: ex.reasons.join(' · '), subJa: ex.reasonsJa.join('・'),
        })];
    }

    /* ── 6. Streak（standings の streak。その試合で伸びた連勝・連敗が節目のとき） ── */
    function streaks(G, stMap, skip) {
        const g = G.game, out = [];
        [g.away, g.home].forEach(t => {
            if (skip.has(t.id)) return;
            const s = stMap[t.id];
            if (!s) return;
            const won = t === g.winner, n = Math.abs(s.value);
            if ((s.value > 0) !== won) return;   // standings の連勝・連敗がこの試合の結果と合わない（もう次の試合をした）
            const hit = won ? n >= T.winStreakStep && n % T.winStreakStep === 0 : n >= T.lossStreak || (n >= 5 && n % 5 === 0);
            if (!hit) return;
            const opp = t === g.away ? g.home : g.away;
            out.push(item('streak', G, {
                team: t, opp, value: s.value,
                text: won ? `${t.short} have won ${n} straight` : `${t.short} have lost ${n} straight`,
                ja: won ? `${t.short} が${n}連勝` : `${t.short} が${n}連敗`,
                sub: `${won ? 'Beat' : 'Lost to'} ${opp.abbr} · ${g.final} · ${s.record}`, subJa: `${g.final} · ${s.record}`,
            }));
        });
        return out;
    }

    /* ── 7. Rookie（ロスターの経験年数が 0〜1。本番の Daily Leaders と同じ扱い） ── */
    function rookies(G, exp) {
        if (!exp) return [];
        return G.players.filter(p => exp[p.id] != null && exp[p.id] <= 1 && p.l.pts >= T.rookiePts).map(p => item('rookie', G, {
            player: p, value: p.l.pts, hero: { value: p.l.pts, label: 'PTS' },
            text: `Rookie ${p.name} scored ${p.l.pts}`, ja: `ルーキーの ${p.name} が${p.l.pts}得点`,
            sub: `${statLine(p)} ${result(p, G.game)}`, subJa: `${statLine(p)}（${resultJa(p, G.game)}）`,
        }));
    }

    function item(type, G, o) {
        const p = o.player;
        return {
            type, size: BIG_TYPES.has(type) ? 'big' : 'small', priority: PRI[type] + Math.min(9, (o.value || 0) / 10),
            gameId: G.game.id,
            team: (o.team || p?.team) ? pickTeam(o.team || p.team) : null,
            opp: (o.opp || p?.opp) ? pickTeam(o.opp || p.opp) : null,
            player: p ? { id: p.id, name: p.name, short: p.short, headshot: p.headshot, line: statLine(p),
                stats: { min: p.l.min, pts: p.l.pts, reb: p.reb, ast: p.l.ast, tpm: p.l.tpm, stl: p.l.stl, blk: p.l.blk } } : null,
            hero: o.hero || null,
            // scope: 'game'（試合全体: Game-winner など）/ 'player'（選手のスタッツ）。brief: タグの横に出す短い値（["C. Flagg", "3.6s"]）
            scope: GAME_TYPES.has(type) ? 'game' : 'player', brief: o.brief || null,
            value: o.value ?? null, stat: o.stat || null,
            text: o.text, ja: o.ja, sub: o.sub || '', subJa: o.subJa || '',
            tags: o.tags || [TAG[type]], lineTags: o.lineTags || null, clock: o.clock || null, quote: o.quote || null,
            video: o.video || null,
            game: { away: pickTeam(G.game.away), home: pickTeam(G.game.home), final: G.game.final, periods: G.game.periods },
        };
    }
    const pickTeam = t => ({ id: t.id, abbr: t.abbr, short: t.short, logo: t.logo, score: t.score });

    // 同じ試合・同じ選手のものを1件に（大事な方を残し、種類を tags に足す）
    function merge(list) {
        const out = [];
        list.sort((a, b) => b.priority - a.priority).forEach(h => {
            // 選手のハイライトだけを選手ごとにまとめる（Game-winner などの試合全体のものは別に残す）
            const same = h.scope === 'player' && out.find(o => o.scope === 'player' && o.gameId === h.gameId && o.player?.id === h.player.id);
            if (!same) { out.push(h); return; }
            // 大きな数字と同じ内容のタグ（Career high 22 AST に対する「22 AST」）は足さない
            const heroTag = same.hero ? `${same.hero.value} ${same.hero.label}` : '';
            h.tags.forEach(t => { if (!same.tags.includes(t) && t !== heroTag) same.tags.push(t); });
            (same.extras ||= []).push({ type: h.type, text: h.text, ja: h.ja });
            if (h.lineTags) same.lineTags = [...(same.lineTags || []), ...h.lineTags];
            if (!same.video && h.video) same.video = h.video;
        });
        return out;
    }

    function standingsMap(standings) {
        const m = {};
        (standings?.children || []).forEach(conf => (conf.standings?.entries || []).forEach(e => {
            const st = e.stats?.find(s => s.name === 'streak');
            const ov = e.stats?.find(s => s.name === 'overall');
            if (st) m[e.team.id] = { value: st.value || 0, display: st.displayValue, record: ov?.displayValue || '' };
        }));
        return m;
    }

    // 既定で出す種類（2026-11-24 ユーザー指定: 選手のスタッツに絞る）。ほかは opts.types で指定すれば出せる
    // 試合全体: gameWinner / forcedOT / comeback、選手: careerHigh / bigLine / rookie（2026-11-24 ユーザー指定）。
    // buzzer（第1〜3Q）・classic・streak は判定を残すが既定では出さない
    const DEFAULT_TYPES = ['gameWinner', 'forcedOT', 'comeback', 'careerHigh', 'bigLine', 'rookie'];
    const ALL_TYPES = ['careerHigh', 'gameWinner', 'forcedOT', 'buzzer', 'comeback', 'bigLine', 'classic', 'streak', 'rookie'];
    function detect(summaries, standings, opts = {}) {
        const types = new Set(opts.types === 'all' ? ALL_TYPES : opts.types || DEFAULT_TYPES);
        const on = (...ts) => ts.some(t => types.has(t));
        const stMap = standingsMap(standings), skip = new Set((opts.skipStreakTeams || []).map(String));
        const all = [];
        (summaries || []).forEach(d => {
            const G = gameBase(d);
            if (!G) return;
            if (on('careerHigh')) all.push(...careerHighs(G));
            if (on('gameWinner', 'forcedOT', 'buzzer')) all.push(...clutchShots(G));
            if (on('comeback')) all.push(...comeback(G));
            if (on('bigLine')) all.push(...bigLines(G));
            if (on('classic')) all.push(...classic(G));
            if (on('streak')) all.push(...streaks(G, stMap, skip));
            if (on('rookie')) all.push(...rookies(G, opts.experience));
        });
        return merge(all.filter(h => types.has(h.type)));
    }

    function rookieCandidateTeams(summaries) {
        const ids = new Set();
        (summaries || []).forEach(d => {
            const G = gameBase(d);
            G?.players.forEach(p => { if (p.l.pts >= T.rookiePts) ids.add(p.team.id); });
        });
        return [...ids];
    }

    root.NBAHighlights = { detect, rookieCandidateTeams, THRESHOLDS: T, TAG, DEFAULT_TYPES, ALL_TYPES };
})(typeof window !== 'undefined' ? window : globalThis);
