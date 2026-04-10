// ==UserScript==
// @name        LiDAR Canvas Color Fixer with UI & YouTube (Bản 8.2 - Auto Next & Stats)
// @namespace   lidar-color-fix-pro
// @version     8.2
// @description Fix UI + Auto Next Frame + Stats Dashboard + Auto Hide Completed + YouTube
// @author      Gemini & User
// @match       https://www.ai-studio.co.kr/annotation/workLidar*
// @match       https://www.ai-studio.co.kr/annotation/reviewLidar*
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // ==========================================
    // CẤU HÌNH TOÀN CỤC
    // ==========================================
    let config = {
        autoNext: GM_getValue('lidar_auto_next', false),
        autoHideCompleted: GM_getValue('lidar_auto_hide', false),
        hue: GM_getValue('lidar_hue', 60),
        br: GM_getValue('lidar_br', 110),
        ct: GM_getValue('lidar_ct', 100),
        r: GM_getValue('lidar_r', 100),
        g: GM_getValue('lidar_g', 100),
        b: GM_getValue('lidar_b', 100),
        minColor: GM_getValue('lidar_color_min', false),
        minYt: GM_getValue('lidar_yt_min', false)
    };

    let stats = {
        startTime: Date.now(),
        framesProcessed: 0,
        lastFrameTime: Date.now()
    };

    // ==========================================
    // PHẦN 1: TIÊM KỊCH BẢN XỬ LÝ LOGIC TRANG (INJECTED SCRIPT)
    // ==========================================
    function injectPageScript() {
        const script = document.createElement('script');
        script.textContent = `
            (function() {
                // Đợi thư viện
                const waitForLibs = setInterval(() => {
                    if (typeof window.$ !== 'undefined' && $('#PCDSlider').hasClass('ui-slider')) {
                        clearInterval(waitForLibs);
                        initInternalLogic();
                    }
                }, 500);

                function initInternalLogic() {
                    // Hàm set slider chuẩn
                    window.setLidarSlider = function(selector, val) {
                        const el = $(selector);
                        if (el.length && el.hasClass('ui-slider')) {
                            el.slider('value', val);
                            const slideCb = el.slider("option", "slide");
                            if (typeof slideCb === 'function') slideCb.call(el, null, { value: val });
                            const changeCb = el.slider("option", "change");
                            if (typeof changeCb === 'function') changeCb.call(el, null, { value: val });
                        }
                    };

                    // Auto Setting cơ bản
                    const radios = ['vcp1','vlb1','vcs1','vpc1','pcc1','pcs2','pcc3','zf2','vwf1','vfc1','plrm1','rotation2','vpl2', 'IBS1', 'ICS1'];
                    radios.forEach(id => {
                        const el = $('#' + id);
                        if (el.length && !el.prop('checked')) { el.prop('checked', true).trigger('click').trigger('change'); }
                    });

                    const inputs = { 'planePosInput': '-1.8', 'planeSizeInput': '48', 'planeSizeWidthInput': '48', 'planeSizeHeightInput': '40', 'inputpolylinePz': '-1.85', 'inputpolygonPz': '-1.85' };
                    for (const [id, val] of Object.entries(inputs)) {
                        const el = $('#' + id);
                        if (el.length && el.val() !== val) el.val(val).trigger('input').trigger('change');
                    }

                    const sliders = {
                        '#PCDSlider': 1.9, '#OPLSlider': 0.2, '#SRSlider': 0.08, '#MRSlider': 0.086,
                        '#IBSlider': 45, '#ICSlider': 84, '#ROSlider': 0.97, '#CLWSlider': 5,
                        '#RLWSlider': 4, '#RCSSlider': 2.4, '#PLSlider': 1, '#PLPSlider': 5,
                        '#polygonLineSlider': 5, '#polygonPointSlider': 5
                    };
                    for (const [selector, val] of Object.entries(sliders)) {
                        window.setLidarSlider(selector, val);
                    }
                }

                // KEYBOARD HACKS
                let forceCtrl = false;
                const originalCtrlKey = Object.getOwnPropertyDescriptor(KeyboardEvent.prototype, 'ctrlKey');
                Object.defineProperty(KeyboardEvent.prototype, 'ctrlKey', {
                    get: function() {
                        if (forceCtrl) return true;
                        return originalCtrlKey ? originalCtrlKey.get.call(this) : false;
                    }
                });

                document.addEventListener('keydown', function(e) {
                    // Mũi tên luôn có Ctrl
                    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                        forceCtrl = true;
                    }

                    // Phím ~ thành Ctrl + Right
                    if (e.key === '\`' || e.key === '~') {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        forceCtrl = true;
                        const rightEvent = new KeyboardEvent('keydown', {
                            key: 'ArrowRight', code: 'ArrowRight', keyCode: 39, which: 39, bubbles: true, cancelable: true
                        });
                        (document.activeElement || document).dispatchEvent(rightEvent);
                        setTimeout(() => { forceCtrl = false; }, 50);
                    }

                    // Enter thành Tab (trừ input)
                    if (e.key === 'Enter') {
                        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', code: 'Tab', keyCode: 9, which: 9, bubbles: true, cancelable: true });
                        if (document.activeElement) document.activeElement.dispatchEvent(tabEvent);
                        else document.dispatchEvent(tabEvent);
                    }
                    
                    // Phím tắt Bật/Tắt Auto Next (Phím N)
                    if (e.key.toLowerCase() === 'n' && !e.ctrlKey && !e.metaKey) {
                         window.dispatchEvent(new CustomEvent('toggleAutoNext'));
                    }

                    // Phím tắt Bật/Tắt Auto Hide (Phím H)
                    if (e.key.toLowerCase() === 'h' && !e.ctrlKey && !e.metaKey) {
                         window.dispatchEvent(new CustomEvent('toggleAutoHide'));
                    }

                }, true);

                document.addEventListener('keyup', function(e) {
                    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                        setTimeout(() => { forceCtrl = false; }, 50);
                    }
                }, true);
            })();
        `;
        document.body.appendChild(script);
        setTimeout(() => script.remove(), 100);
    }

    // ==========================================
    // PHẦN 2: CSS UI
    // ==========================================
    GM_addStyle(`
        .lidar-panel {
            position: fixed; z-index: 2147483647;
            background: rgba(15, 15, 15, 0.95); color: #ddd;
            border-radius: 8px; border: 1px solid #555;
            font-family: 'Segoe UI', Arial, sans-serif; box-shadow: 0 5px 20px rgba(0,0,0,0.6);
            user-select: none; overflow: hidden;
            display: flex; flex-direction: column;
            resize: both; min-width: 200px;
        }
        .lidar-header {
            background: #222; padding: 8px 12px; font-size: 13px; font-weight: bold;
            color: #ff9800; cursor: grab; display: flex; justify-content: space-between; align-items: center;
            border-bottom: 1px solid #444; flex-shrink: 0;
        }
        .lidar-body { padding: 12px; flex: 1; overflow: auto; display: flex; flex-direction: column; }
        .lidar-panel.minimized .lidar-body { display: none; }
        .lidar-panel.minimized { width: 200px !important; height: auto !important; resize: none; }

        .win-btn { cursor: pointer; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border-radius: 4px; font-size: 16px; margin-left: 5px;}
        .win-btn:hover { background: #444; }

        .control-group { margin-bottom: 10px; }
        .control-group label { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px; }
        .control-group input[type=range] { width: 100%; cursor: pointer; accent-color: #ff9800; }
        
        /* Toggle Switch Style */
        .toggle-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; background: #2a2a2a; padding: 6px; border-radius: 4px; }
        .toggle-label { font-size: 12px; color: #ccc; }
        .switch { position: relative; display: inline-block; width: 34px; height: 18px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #555; transition: .4s; border-radius: 18px; }
        .slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 2px; bottom: 2px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: #ff9800; }
        input:checked + .slider:before { transform: translateX(16px); }

        .mr-presets { display: flex; gap: 4px; margin-top: 5px; }
        .mr-tag {
            flex: 1; background: #333; border: 1px solid #555; border-radius: 4px;
            padding: 4px 2px; font-size: 10px; text-align: center; cursor: pointer; transition: 0.2s;
        }
        .mr-tag:hover { background: #444; border-color: #ff9800; color: #fff; }
        .mr-tag.active { background: #ff9800; color: #000; border-color: #fff; font-weight: bold; }

        /* Stats Dashboard Style */
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-bottom: 10px; }
        .stat-item { background: #222; padding: 6px; border-radius: 4px; text-align: center; border: 1px solid #333; }
        .stat-val { font-size: 14px; font-weight: bold; color: #fff; display: block; }
        .stat-lbl { font-size: 9px; color: #aaa; text-transform: uppercase; }
        .stat-highlight { color: #4caf50; }

        .yt-btn { background: #444; border: 1px solid #666; color: #fff; cursor: pointer; padding: 4px 8px; font-size: 11px; border-radius: 3px; }
        .yt-btn:hover { background: #666; }
        .yt-paste-btn { background: #ff9800; color: #000; font-weight: bold; border: none; padding: 4px 8px; font-size: 10px; cursor: pointer; border-radius: 3px; }
        .yt-paste-btn:hover { background: #ffb74d; }

        iframe { width: 100%; height: 100%; border: none; }
    `);

    // ==========================================
    // PHẦN 3: LOGIC STATS & AUTO FEATURES
    // ==========================================
    
    function startMonitoring() {
        const observer = new MutationObserver(() => {
            updateStatsDisplay();
        });
        observer.observe(document.body, { childList: true, subtree: true });

        document.addEventListener('click', function(e) {
            const target = e.target;
            // Phát hiện nút Save dựa trên text hoặc class phổ biến
            if (target.tagName === 'BUTTON' && (target.innerText.includes('Save') || target.className.includes('save'))) {
                handleSaveAction();
            }
        }, true);
        
        window.addEventListener('toggleAutoNext', () => {
            config.autoNext = !config.autoNext;
            GM_setValue('lidar_auto_next', config.autoNext);
            updateStatsDisplay();
            alert(config.autoNext ? "Đã BẬT Auto-Next Frame (Phím N)" : "Đã TẮT Auto-Next Frame (Phím N)");
        });

        window.addEventListener('toggleAutoHide', () => {
            config.autoHideCompleted = !config.autoHideCompleted;
            GM_setValue('lidar_auto_hide', config.autoHideCompleted);
            applyAutoHide();
            alert(config.autoHideCompleted ? "Đã BẬT Auto-Hide Completed (Phím H)" : "Đã TẮT Auto-Hide Completed (Phím H)");
        });

        setInterval(updateStatsDisplay, 1000);
    }

    function handleSaveAction() {
        if (config.autoNext) {
            setTimeout(() => {
                const event = new KeyboardEvent('keydown', {
                    key: 'ArrowRight', code: 'ArrowRight', keyCode: 39, bubbles: true, cancelable: true, ctrlKey: true
                });
                document.dispatchEvent(event);
                stats.framesProcessed++;
                stats.lastFrameTime = Date.now();
            }, 300);
        }
    }

    function applyAutoHide() {
        // Lưu ý: Class '.completed-object-class' là ví dụ, cần thay bằng class thực tế của object đã hoàn thành trong source web
        if (config.autoHideCompleted) {
            // Giả lập logic ẩn (cần điều chỉnh selector cho đúng với web thực tế)
            document.querySelectorAll('.completed-object-class, .object-done').forEach(obj => obj.style.display = 'none');
        }
    }

    function getFormattedTime(ms) {
        const totalSec = Math.floor(ms / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    }

    function updateStatsDisplay() {
        const panel = document.getElementById('lidar-stats-panel');
        if (!panel) return;

        const now = Date.now();
        const elapsed = now - stats.startTime;
        const avgPerFrame = stats.framesProcessed > 0 ? Math.floor(elapsed / stats.framesProcessed) : 0;
        
        panel.querySelector('#stat-time').innerText = getFormattedTime(elapsed);
        panel.querySelector('#stat-frames').innerText = stats.framesProcessed;
        panel.querySelector('#stat-avg').innerText = avgPerFrame + 's';
        
        const autoNextSwitch = panel.querySelector('#switch-auto-next');
        if(autoNextSwitch) autoNextSwitch.checked = config.autoNext;
        
        const autoHideSwitch = panel.querySelector('#switch-auto-hide');
        if(autoHideSwitch) autoHideSwitch.checked = config.autoHideCompleted;
    }

    // ==========================================
    // PHẦN 4: LOGIC UI MÀU SẮC (GIỮ NGUYÊN)
    // ==========================================
    function applyFilter() {
        let svgBox = document.getElementById('lidar-svg-box');
        if (!svgBox) {
            svgBox = document.createElement('div');
            svgBox.id = 'lidar-svg-box';
            svgBox.innerHTML = `<svg style="display:none"><filter id="lidar-rgb-filter"><feColorMatrix id="lidar-color-matrix" type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0"/></filter></svg>`;
            document.body.appendChild(svgBox);
        }
        const r = config.r / 100, g = config.g / 100, b = config.b / 100;
        const matrix = document.getElementById('lidar-color-matrix');
        if (matrix) matrix.setAttribute('values', `${r} 0 0 0 0 0 ${g} 0 0 0 0 0 ${b} 0 0 0 0 0 1 0`);
        const filterStr = `url(#lidar-rgb-filter) hue-rotate(${config.hue}deg) brightness(${config.br}%) contrast(${config.ct}%)`;
        document.querySelectorAll('canvas, #svgSpace').forEach(el => el.style.filter = filterStr);
    }

    function createColorUI() {
        if (document.getElementById('lidar-color-panel')) return;
        const panel = document.createElement('div');
        panel.id = 'lidar-color-panel';
        panel.className = 'lidar-panel' + (config.minColor ? ' minimized' : '');
        panel.style.left = GM_getValue('lidar_color_x', 10) + 'px';
        panel.style.top = GM_getValue('lidar_color_y', 10) + 'px';
        panel.style.width = GM_getValue('lidar_color_w', 260) + 'px';
        panel.style.height = config.minColor ? 'auto' : GM_getValue('lidar_color_h', 440) + 'px';

        panel.innerHTML = `
            <div class="lidar-header" id="color-drag">
                <span>🎨 LiDAR Pro v8.2</span>
                <div class="win-btn" id="color-min-btn">${config.minColor ? '□' : '–'}</div>
            </div>
            <div class="lidar-body">
                <div class="control-group" style="background:rgba(255,152,0,0.15); padding:8px; border-radius:6px; border:1px solid #555;">
                    <label style="color:#ff9800; font-weight:bold;">⚡ Move Ratio Presets</label>
                    <div class="mr-presets">
                        <div class="mr-tag" data-val="0.01">0.01</div>
                        <div class="mr-tag" data-val="0.086">0.086</div>
                        <div class="mr-tag" data-val="0.124">0.124</div>
                    </div>
                </div>
                <div class="control-group"><label>Hue: <span>${config.hue}°</span></label><input type="range" class="sync" data-key="hue" min="0" max="360" value="${config.hue}"></div>
                <div class="control-group"><label style="color:#f44;">Red: <span>${config.r}%</span></label><input type="range" class="sync" data-key="r" min="0" max="300" value="${config.r}"></div>
                <div class="control-group"><label style="color:#4f4;">Green: <span>${config.g}%</span></label><input type="range" class="sync" data-key="g" min="0" max="300" value="${config.g}"></div>
                <div class="control-group"><label style="color:#44f;">Blue: <span>${config.b}%</span></label><input type="range" class="sync" data-key="b" min="0" max="300" value="${config.b}"></div>
                <div class="control-group"><label>Brightness: <span>${config.br}%</span></label><input type="range" class="sync" data-key="br" min="50" max="500" value="${config.br}"></div>
                <div class="control-group"><label>Contrast: <span>${config.ct}%</span></label><input type="range" class="sync" data-key="ct" min="50" max="500" value="${config.ct}"></div>
                <button class="yt-btn" id="color-reset" style="width:100%">Mặc định UI</button>
            </div>
        `;
        document.body.appendChild(panel);

        panel.querySelectorAll('.mr-tag').forEach(tag => {
            tag.onclick = () => {
                const val = parseFloat(tag.dataset.val);
                panel.querySelectorAll('.mr-tag').forEach(t => t.classList.remove('active'));
                tag.classList.add('active');
                const script = document.createElement('script');
                script.textContent = `if(window.setLidarSlider) window.setLidarSlider('#MRSlider', ${val});`;
                document.body.appendChild(script);
                script.remove();
            };
        });

        panel.querySelectorAll('.sync').forEach(input => {
            input.oninput = (e) => {
                const key = e.target.dataset.key;
                config[key] = e.target.value;
                e.target.previousElementSibling.querySelector('span').innerText = e.target.value + (key==='hue'?'°':'%');
                applyFilter();
                GM_setValue('lidar_'+key, config[key]);
            };
        });

        document.getElementById('color-min-btn').onclick = () => {
            config.minColor = !config.minColor;
            panel.classList.toggle('minimized');
            document.getElementById('color-min-btn').innerText = config.minColor ? '□' : '–';
            GM_setValue('lidar_color_min', config.minColor);
        };

        document.getElementById('color-reset').onclick = () => {
            config = { ...config, hue:60, br:110, ct:100, r:100, g:100, b:100 };
            panel.remove(); createColorUI(); applyFilter();
        };

        makeDraggable(panel, 'color-drag', 'lidar_color');
        setupResizeObserver(panel, 'lidar_color');
    }

    // ==========================================
    // PHẦN 5: STATS DASHBOARD UI (MỚI)
    // ==========================================
    function createStatsUI() {
        if (document.getElementById('lidar-stats-panel')) return;
        const panel = document.createElement('div');
        panel.id = 'lidar-stats-panel';
        panel.className = 'lidar-panel';
        panel.style.left = GM_getValue('lidar_stats_x', 10) + 'px';
        panel.style.top = GM_getValue('lidar_stats_y', 300) + 'px';
        panel.style.width = '220px';
        panel.style.height = 'auto';

        panel.innerHTML = `
            <div class="lidar-header" id="stats-drag" style="color:#4caf50;">
                <span>📊 Thống kê & Tốc độ</span>
                <div class="win-btn" id="stats-close" title="Đóng">×</div>
            </div>
            <div class="lidar-body">
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-val stat-highlight" id="stat-frames">0</span>
                        <span class="stat-lbl">Frame Đã Xong</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-val" id="stat-avg">0s</span>
                        <span class="stat-lbl">TB / Frame</span>
                    </div>
                    <div class="stat-item" style="grid-column: span 2;">
                        <span class="stat-val" id="stat-time">00:00:00</span>
                        <span class="stat-lbl">Thời gian làm việc</span>
                    </div>
                </div>
                
                <div class="toggle-row">
                    <span class="toggle-label">Auto Next (Phím N)</span>
                    <label class="switch">
                        <input type="checkbox" id="switch-auto-next" ${config.autoNext ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="toggle-row">
                    <span class="toggle-label">Auto Hide (Phím H)</span>
                    <label class="switch">
                        <input type="checkbox" id="switch-auto-hide" ${config.autoHideCompleted ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
                
                <div style="font-size:10px; color:#777; margin-top:5px; text-align:center;">
                    * Nhấn Save để kích hoạt Auto Next
                </div>
            </div>
        `;
        document.body.appendChild(panel);

        document.getElementById('switch-auto-next').addEventListener('change', (e) => {
            config.autoNext = e.target.checked;
            GM_setValue('lidar_auto_next', config.autoNext);
        });
        document.getElementById('switch-auto-hide').addEventListener('change', (e) => {
            config.autoHideCompleted = e.target.checked;
            GM_setValue('lidar_auto_hide', config.autoHideCompleted);
            applyAutoHide();
        });
        document.getElementById('stats-close').onclick = () => panel.remove();

        makeDraggable(panel, 'stats-drag', 'lidar_stats');
        updateStatsDisplay();
    }

    // ==========================================
    // PHẦN 6: UI YOUTUBE (GIỮ NGUYÊN)
    // ==========================================
    function createYoutubeUI() {
        if (document.getElementById('lidar-yt-panel')) return;
        const ytUrl = GM_getValue('lidar_yt_url', 'https://youtu.be/Hkv0yNqz3jY');
        const panel = document.createElement('div');
        panel.id = 'lidar-yt-panel';
        panel.className = 'lidar-panel' + (config.minYt ? ' minimized' : '');
        panel.style.left = GM_getValue('lidar_yt_x', window.innerWidth - 340) + 'px';
        panel.style.top = GM_getValue('lidar_yt_y', 10) + 'px';
        panel.style.width = GM_getValue('lidar_yt_w', 320) + 'px';
        panel.style.height = config.minYt ? 'auto' : GM_getValue('lidar_yt_h', 240) + 'px';

        panel.innerHTML = `
            <div class="lidar-header" id="yt-drag" style="color:#f00;">
                <span>📺 YouTube</span>
                <div class="win-btn" id="yt-min-btn">${config.minYt ? '□' : '–'}</div>
            </div>
            <div class="lidar-body">
                <div style="display:flex; gap:4px; margin-bottom:5px;">
                    <button class="yt-paste-btn" id="yt-paste">Paste</button>
                    <input type="text" id="yt-inp" style="flex:1; background:#000; color:#fff; border:1px solid #444; font-size:11px;" value="${ytUrl}">
                    <button class="yt-btn" id="yt-go">OK</button>
                </div>
                <iframe id="yt-if" src="https://www.youtube.com/embed/${getVid(ytUrl)}" style="flex:1;"></iframe>
            </div>
        `;
        document.body.appendChild(panel);

        function getVid(url) {
            if (!url) return '';
            if (url.includes('v=')) return url.split('v=')[1].split('&')[0];
            if (url.includes('youtu.be/')) return url.split('youtu.be/')[1].split('?')[0];
            return url;
        }

        const loadVideo = (url) => {
            const vid = getVid(url);
            if(vid) document.getElementById('yt-if').src = "https://www.youtube.com/embed/" + vid;
            GM_setValue('lidar_yt_url', url);
        };

        document.getElementById('yt-min-btn').onclick = () => {
            config.minYt = !config.minYt;
            panel.classList.toggle('minimized');
            document.getElementById('yt-min-btn').innerText = config.minYt ? '□' : '–';
            GM_setValue('lidar_yt_min', config.minYt);
        };

        document.getElementById('yt-go').onclick = () => loadVideo(document.getElementById('yt-inp').value);

        document.getElementById('yt-paste').onclick = async () => {
            try {
                const text = await navigator.clipboard.readText();
                if (text) {
                    document.getElementById('yt-inp').value = text;
                    loadVideo(text);
                }
            } catch (err) {
                const text = prompt("Dán link YouTube vào đây:");
                if (text) {
                    document.getElementById('yt-inp').value = text;
                    loadVideo(text);
                }
            }
        };

        makeDraggable(panel, 'yt-drag', 'lidar_yt');
        setupResizeObserver(panel, 'lidar_yt');
    }

    // ==========================================
    // TIỆN ÍCH CHUNG
    // ==========================================
    function makeDraggable(el, hId, pref) {
        const h = document.getElementById(hId);
        if(!h) return;
        h.onmousedown = (e) => {
            if (e.target.closest('.control-group') || e.target.id === 'yt-inp' || e.target.tagName === 'BUTTON' || e.target.id.includes('min-btn') || e.target.classList.contains('switch')) return;
            let sx = e.clientX - el.offsetLeft, sy = e.clientY - el.offsetTop;
            document.onmousemove = (e) => {
                el.style.left = (e.clientX - sx) + 'px';
                el.style.top = (e.clientY - sy) + 'px';
            };
            document.onmouseup = () => {
                document.onmousemove = null;
                GM_setValue(pref + '_x', el.offsetLeft);
                GM_setValue(pref + '_y', el.offsetTop);
            };
        };
    }

    function setupResizeObserver(el, pref) {
        new ResizeObserver(() => {
            if (!el.classList.contains('minimized')) {
                GM_setValue(pref + '_w', el.offsetWidth);
                GM_setValue(pref + '_h', el.offsetHeight);
            }
        }).observe(el);
    }

    // ==========================================
    // KHỞI CHẠY
    // ==========================================
    function bootstrap() {
        createColorUI();
        createStatsUI();
        createYoutubeUI();
        applyFilter();
        injectPageScript();
        startMonitoring();

        new MutationObserver(() => applyFilter()).observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'complete') bootstrap();
    else window.addEventListener('load', bootstrap);
})();
