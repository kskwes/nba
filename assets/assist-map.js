/* ═══════════════════════════════════════════════
   チームページの Assist Map（data/assists.json）
   名コンビの上位3組・選手ごとのパスの行き先（選んだ選手を真ん中に、右にパスした相手、左にパスを受けた相手）・相手ごとの表
   assists.json はローカルの nba-tools/aggregate.js が書き出す（advanced.json と同時に更新）
   必要なもの: assets/teams.js（esc）
   ═══════════════════════════════════════════════ */
window.NBA = window.NBA || {};

(function () {
    const GOLD = '#F5B700', TEAL = '#16a6ba', GRAY = '#55555f';
    const TOGETHER_MIN = 50;   // 一緒に出た時間がこれ未満の得失点差は灰色に（ぶれが大きいため）
    const KIND_COLORS = ['#ff9f6b', '#ff6b61', '#c9a7ff', '#7ad7a8', GOLD];   // ロブ・ダンク・レイアップ・ジャンパー・3P
    // assists.json の kinds は日本語のまま（データの形は変えない）。表示は英語に
    const KIND_EN = { 'ロブ': 'Lob', 'ダンク': 'Dunk', 'レイアップ': 'Layup', 'ジャンパー': 'Jumper', '3P': '3P' };

    let promise = null;
    const load = () => promise ||= fetch('../data/assists.json', { cache: 'no-cache' })
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .catch(e => { promise = null; throw e; });

    // 円のふち: アシスト・アシストされて決めた・自分で決めた の割合
    function ring(cx, cy, r, p, w) {
        const parts = [[p.ast, GOLD], [p.astd, TEAL], [p.fgm - p.astd, GRAY]];
        const tot = parts.reduce((n, x) => n + x[0], 0) || 1;
        let a0 = -Math.PI / 2, out = '';
        parts.forEach(([v, c]) => {
            if (!v) return;
            const a1 = a0 + 2 * Math.PI * v / tot;
            if (v === tot) { out += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${c}" stroke-width="${w}"/>`; return; }
            const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0), x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
            out += `<path d="M${x0},${y0} A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1},${y1}" fill="none" stroke="${c}" stroke-width="${w}"/>`;
            a0 = a1;
        });
        return out;
    }

    function mount(root, data, abbr) {
        const T = data.teams[abbr];
        if (!T) { root.innerHTML = '<div class="msg">No data</div>'; return; }
        const KINDS = data.kinds.map((n, i) => [KIND_EN[n] || n, KIND_COLORS[i]]);
        const kindsBar = k => {
            const tot = k.reduce((n, v) => n + v, 0) || 1;
            return `<div class="am-kinds">${KINDS.map(([n, c], i) => k[i] ? `<span style="width:${k[i] / tot * 100}%;background:${c}" title="${n} ${k[i]}"></span>` : '').join('')}</div>`;
        };
        const kindsText = k => KINDS.map(([n, c], i) => [n, c, k[i]]).filter(x => x[2]).sort((a, b) => b[2] - a[2])
            .map(([n, c, v]) => `<span><i style="background:${c}"></i>${n} ${v}</span>`).join('');
        let range = 'season', center = null;

        root.innerHTML = `
            <div class="am-head"><div class="am-sub"></div><div class="am-seg"><button data-v="season" class="active">Season</button><button data-v="last5">Last 5</button></div></div>
            <div class="sd-title">Top Duos <span class="ap-sub">Passer → scorer</span></div>
            <div class="am-duos"></div>
            <div class="sd-title" style="margin-top:16px">Passing by Player <span class="ap-sub">Click a player to center him</span></div>
            <div class="am-chips"></div>
            <div class="am-ego"><svg></svg>
                <div class="am-legend"><span><i style="background:${GOLD}"></i>Assists</span><span><i style="background:${TEAL}"></i>Assisted FGM</span><span><i style="background:${GRAY}"></i>Unassisted FGM</span><span>(ring = share)</span></div></div>
            <div class="am-tables"></div>
            <p class="adv-note"><span data-ja="名コンビの得失点差は On/Off と同じ計算（ポゼッションは play-by-play から実際に数えた回数）。">Duo point diff uses the same method as On/Off (possessions counted from play-by-play).</span><br><span data-ja="得点プレー（フリースローを除く）の記録で、決めた選手とアシストした選手が両方記録されているものを数えています。">Counts made FGs (no FTs) where both scorer and assister are recorded.</span><br><span data-ja="シュートの型は記録の種類と文章から分けています（ロブ＝アリウープ）。">Shot type comes from play type and text (Lob = alley-oop).</span></p>`;

        function render() {
            const D = T[range];
            const players = Object.entries(D.players).map(([id, v]) => ({ id, name: T.names[id] || id, min: v[0], gp: v[1], ast: v[2], astd: v[3], fgm: v[4] })).sort((a, b) => b.min - a.min);
            const by = Object.fromEntries(players.map(p => [p.id, p]));
            const pairs = D.pairs.map(([from, to, n, pts, k, tg]) => ({ from, to, n, pts, k, tg })).sort((a, b) => b.n - a.n || b.pts - a.pts);
            if (!center || !by[center]) center = [...players].sort((a, b) => b.ast - a.ast)[0]?.id;
            root.querySelector('.am-sub').textContent = `${range === 'season' ? 'Season' : 'Last'} · ${D.games} games`;
            if (!pairs.length || !center) {
                ['.am-duos', '.am-chips', '.am-tables'].forEach(s => { root.querySelector(s).innerHTML = ''; });
                root.querySelector('.am-duos').innerHTML = '<div class="msg">No assists yet</div>';
                root.querySelector('.am-ego').hidden = true;
                return;
            }
            root.querySelector('.am-ego').hidden = false;

            // 名コンビ。下に「2人が一緒にコートにいるとき」の100ポゼッションあたりの得失点差（On/Off と同じ計算）とチーム全体
            const net = t => t && t[2] && t[3] ? 100 * t[0] / t[2] - 100 * t[1] / t[3] : null;
            const sgn = v => v == null ? '-' : (v > 0 ? '+' : '') + v.toFixed(1);
            const teamNet = net(D.team);
            const together = p => {
                const v = net(p.tg), min = Math.round((p.tg?.[4] || 0) / 60), short = min < TOGETHER_MIN;
                const c = short || v == null ? 'mut' : v > 0 ? 'pos' : 'neg';
                return `<div class="am-together"><b class="${c}">${sgn(v)}</b>when both on court<small>${min} min${short ? ' <span data-ja="短いのでぶれが大きい">(small sample)</span>' : ''} · team ${sgn(teamNet)} (point diff per 100 poss.)</small></div>`;
            };
            root.querySelector('.am-duos').innerHTML = pairs.slice(0, 3).map((p, i) => `<div class="am-duo" data-center="${p.from}">
                <div class="names"><span class="rk">${i + 1}</span>${esc(by[p.from].name)}<em>→</em>${esc(by[p.to].name)}</div>
                <div class="nums">${p.n} AST<small>${p.pts} PTS · ${(p.n / D.games).toFixed(1)} per game</small></div>
                ${kindsBar(p.k)}<div class="am-kind-legend">${kindsText(p.k)}</div>${together(p)}</div>`).join('');

            // 選手の選択（出場時間の多い12人）。役割の一言は、ふちの3色のうち一番多いもの
            const role = p => { const m = Math.max(p.ast, p.astd, p.fgm - p.astd); return m === p.ast ? 'Playmaker' : m === p.astd ? 'Finisher' : 'Self-creator'; };
            root.querySelector('.am-chips').innerHTML = players.slice(0, 12).map(p => `<button class="am-chip ${p.id === center ? 'on' : ''}" data-center="${p.id}">
                <svg width="22" height="22" viewBox="0 0 22 22">${ring(11, 11, 8, p, 4)}</svg>${esc(p.name)} <small>${role(p)}</small></button>`).join('');

            // 中心の図
            const c = by[center];
            const out = pairs.filter(p => p.from === center).slice(0, 7), inn = pairs.filter(p => p.to === center).slice(0, 7);
            const w = root.querySelector('.am-ego').clientWidth;
            const narrow = w < 520, W = narrow ? 380 : 620, rows = Math.max(out.length, inn.length, 3);   // 1人あたりの高さは42（PC では図の幅を640px までにして、文字や円が大きくなりすぎないように）
            const TOP = 30, H = Math.max(220, rows * 42 + TOP + 20), CX = W / 2, CY = TOP + (H - TOP) / 2;
            const XR = narrow ? W * 0.68 : W * 0.72, XL = W - XR;
            const label = n => narrow ? n.split(' ').slice(1).join(' ') || n : n;   // スマホは名字だけ
            const nMax = Math.max(1, ...out.map(p => p.n), ...inn.map(p => p.n));
            const nodeR = n => 6 + 12 * Math.sqrt(n / nMax);
            let g = '';
            const side = (list, x, isOut) => list.forEach((p, i) => {
                const y = list.length === 1 ? CY : TOP + 18 + i * (H - TOP - 40) / (list.length - 1);
                const other = by[isOut ? p.to : p.from], r = nodeR(p.n), col = isOut ? GOLD : TEAL;
                const share = isOut ? p.n / (c.ast || 1) : p.n / (c.astd || 1);
                g += `<path d="M${CX + (isOut ? 30 : -30)},${CY} C${(CX + x) / 2},${CY} ${(CX + x) / 2},${y} ${x + (isOut ? -r : r)},${y}" fill="none" stroke="${col}" stroke-width="${1.5 + 9 * p.n / nMax}" stroke-opacity=".55" stroke-linecap="round"/>`;
                g += `<g class="am-node" data-center="${other.id}">${ring(x, y, r + 3, other, 3)}<circle cx="${x}" cy="${y}" r="${r}" fill="${col}" fill-opacity=".9"/>
                    <text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11" font-family="Oswald, sans-serif" font-weight="600" fill="#141000">${p.n}</text>
                    <text x="${x + (isOut ? r + 8 : -r - 8)}" y="${y - 1}" text-anchor="${isOut ? 'start' : 'end'}" font-size="11.5" font-weight="700" fill="#e6e6ea">${esc(label(other.name))}</text>
                    <text x="${x + (isOut ? r + 8 : -r - 8)}" y="${y + 12}" text-anchor="${isOut ? 'start' : 'end'}" font-size="10" fill="#8b8b95">${Math.round(share * 100)}%</text></g>`;
            });
            side(out, XR, true);
            side(inn, XL, false);
            g += `${ring(CX, CY, 30, c, 7)}<circle cx="${CX}" cy="${CY}" r="25" fill="#1d1d22"/>
                <text x="${CX}" y="${CY - 2}" text-anchor="middle" font-size="11" font-weight="800" fill="#f2f2f4">${esc(c.name.split(' ').pop())}</text>
                <text x="${CX}" y="${CY + 12}" text-anchor="middle" font-size="9.5" fill="#8b8b95">${c.ast} AST</text>`;
            g += `<text x="${XR}" y="14" text-anchor="middle" font-size="10" font-weight="700" fill="${GOLD}">Passes to →</text>`;
            g += `<text x="${XL}" y="14" text-anchor="middle" font-size="10" font-weight="700" fill="${TEAL}">← Passes from</text>`;
            if (!out.length) g += `<text x="${XR}" y="${CY}" text-anchor="middle" font-size="11" fill="#8b8b95">None</text>`;
            if (!inn.length) g += `<text x="${XL}" y="${CY}" text-anchor="middle" font-size="11" fill="#8b8b95">None</text>`;
            const svg = root.querySelector('.am-ego svg');
            svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
            svg.innerHTML = g;

            // 相手ごとの表
            const table = (list, isOut, title, total) => `<div><h4>${title} <small>${total} AST</small></h4>
                <table class="am-pt"><thead><tr><th class="l">Player</th><th>AST</th><th>Share</th><th>PTS</th><th>Shot type</th></tr></thead><tbody>
                ${list.map(p => `<tr><td class="l">${esc(by[isOut ? p.to : p.from].name)}</td><td>${p.n}</td><td>${Math.round(p.n / (total || 1) * 100)}%</td><td>${p.pts}</td><td>${kindsBar(p.k)}</td></tr>`).join('') || '<tr><td class="l" colspan="5">None</td></tr>'}
                </tbody></table></div>`;
            root.querySelector('.am-tables').innerHTML =
                table(pairs.filter(p => p.from === center), true, `${esc(c.name)} › Passes to`, c.ast) +
                table(pairs.filter(p => p.to === center), false, `${esc(c.name)} › Passes from`, c.astd) +
                `<div class="am-kind-legend" style="grid-column:1/-1">${KINDS.map(([n, col]) => `<span><i style="background:${col}"></i>${n}</span>`).join('')}</div>`;
        }

        root.addEventListener('click', e => {
            const t = e.target.closest('[data-center]');
            if (t) { center = t.dataset.center; render(); return; }
            const r = e.target.closest('.am-seg [data-v]');
            if (r) { range = r.dataset.v; root.querySelectorAll('.am-seg button').forEach(b => b.classList.toggle('active', b === r)); render(); }
        });
        // 幅が変わったとき（スマホの縦横など）は描き直す
        let lastW = 0;
        addEventListener('resize', () => { const w = root.clientWidth; if (w !== lastW) { lastW = w; render(); } });
        render();
    }

    NBA.assistMap = { load, mount };
})();
