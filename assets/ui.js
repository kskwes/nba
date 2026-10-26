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
        el.innerHTML = '一部のデータを更新できませんでした。前回のデータを表示しています<button aria-label="閉じる">×</button>';
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
       cols: [{ key, label, get: row => 値, asc: 小さい順が良いか, cls }]
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
                return `<th class="sortable ${c.cls || ''} ${on ? 'sorted' : ''} ${on && asc ? 'asc' : ''}" data-key="${c.key}" title="クリックで並び替え">${c.label}</th>`;
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
