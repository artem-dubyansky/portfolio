document.addEventListener('DOMContentLoaded', async () => {
    const buttons = document.querySelectorAll('.tab-btn');
    const contentCard = document.getElementById('main-content');

    // 1. PWA & Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(e => console.log('SW pass', e));
    }

    let deferredPrompt;
    const pwaBanner = document.getElementById('pwa-install-banner');
    const pwaBtn = document.getElementById('pwa-install-btn');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (pwaBanner) pwaBanner.style.display = 'block';
    });

    if (pwaBtn) {
        pwaBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') pwaBanner.style.display = 'none';
                deferredPrompt = null;
            } else {
                alert("Чтобы установить приложение на iPhone (iOS):\nНажмите кнопку «Поделиться» (квадрат со стрелкой) в Safari и выберите «На экран «Домой»».");
            }
        });
    }

    // 2. ЯДРО C++ (WASM)
    const wasmBytes = new Uint8Array([
        0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
        0x01, 0x09, 0x01, 0x60, 0x04, 0x7f, 0x7f, 0x7f, 0x7f, 0x01, 0x7f,
        0x03, 0x02, 0x01, 0x00,
        0x07, 0x17, 0x01, 0x13, 0x63, 0x61, 0x6c, 0x63, 0x75, 0x6c, 0x61, 0x74, 0x65, 0x4d, 0x61, 0x74, 0x63, 0x68, 0x53, 0x63, 0x6f, 0x72, 0x65, 0x00, 0x00,
        0x0a, 0x29, 0x01, 0x27, 0x00,
        0x41, 0x37,
        0x41, 0x10, 0x41, 0x05, 0x20, 0x00, 0x1b, 0x6a,
        0x20, 0x01, 0x41, 0x05, 0x6c, 0x6a,
        0x41, 0x05, 0x41, 0x00, 0x20, 0x02, 0x1b, 0x6a,
        0x41, 0x08, 0x41, 0x7c, 0x20, 0x03, 0x41, 0x00, 0x4c, 0x1b, 0x6a,
        0x0b
    ]);

    let wasmCalculateMatch = null;
    let wasmActive = false;

    try {
        const wasmModule = await WebAssembly.instantiate(wasmBytes);
        wasmCalculateMatch = wasmModule.instance.exports.calculateMatchScore;
        wasmActive = true;
    } catch (e) {
        console.warn("WASM fallback", e);
    }

    // Справочники
    const olympList = [
        "Научно-практическая конференция «Инженеры будущего»",
        "Всероссийская олимпиада школьников (ВсОШ)",
        "Олимпиада школьников «Шаг в будущее» (МГТУ Баумана)",
        "Московская олимпиада школьников (МОШ)",
        "Олимпиада «Курчатов»",
        "Олимпиада «Высшая проба» (НИУ ВШЭ)",
        "Предпрофессиональная олимпиада",
        "Олимпиада «Ломоносов» (МГУ)",
        "Хакатон / Конкурс инженерных проектов"
    ];

    const subjectList = [
        "Технология (робототехника/машиностроение)", 
        "Физика", "Информатика", "Математика", 
        "Схемотехника и электроника", "Экономика и предпринимательство", "Химия"
    ];

    const availableTech = [
        "Инженерия", "3D-печать (CAD)", "Схемотехника/Пайка", "C++", 
        "Python", "Робототехника", "Физика", "Алгебра/Геометрия", 
        "Экономика", "Управление проектами", "Веб-технологии"
    ];

    const schoolsData = [
        { id: 1, name: "Бауманская инженерная школа № 1580", profile: "Инженерно-технологический", targetTrack: "eng", minScore: 88, requiredTech: ["Инженерия", "Физика", "3D-печать (CAD)"], description: "Базовый лицей при МГТУ им. Баумана. Проектирование, робототехника и прикладная физика." },
        { id: 2, name: "Лицей НИУ ВШЭ", profile: "Экономика и предпринимательские классы", targetTrack: "biz", minScore: 86, requiredTech: ["Экономика", "Управление проектами", "Алгебра/Геометрия"], description: "Подготовка специалистов в сфере экономики, управления и цифрового бизнеса." },
        { id: 3, name: "Колледж современных технологий (КСТ)", profile: "Прикладные технологии и мастерство", targetTrack: "craft", minScore: 75, requiredTech: ["Схемотехника/Пайка", "3D-печать (CAD)", "Инженерия"], description: "Мехатроника, обработка на ЧПУ, монтаж и наладка электроники." },
        { id: 4, name: "Школа № 179", profile: "Математика и C++ алгоритмы", targetTrack: "eng", minScore: 92, requiredTech: ["C++", "Алгебра/Геометрия", "Python"], description: "Специализированные классы системного программирования и теоретической математики." },
        { id: 5, name: "Школа № 1502 при МЭИ", profile: "Энергетика и прикладная инженерия", targetTrack: "eng", minScore: 84, requiredTech: ["Физика", "Инженерия", "Схемотехника/Пайка"], description: "Лаборатории электроники, энергетики и инженерного конструирования." },
        { id: 6, name: "Политехнический колледж № 8 им. Павлова", profile: "Аппаратные технологии и робототехника", targetTrack: "craft", minScore: 74, requiredTech: ["Робототехника", "Схемотехника/Пайка", "3D-печать (CAD)"], description: "Практическая работа с микроконтроллерами, схемотехникой и станками." }
    ];

    function getSavedStack() {
        const raw = localStorage.getItem('portfolio_stack_v4');
        return raw ? JSON.parse(raw) : ["Инженерия", "3D-печать (CAD)", "Схемотехника/Пайка", "Физика", "C++"];
    }

    function getSavedOlymps() {
        const raw = localStorage.getItem('portfolio_olymps_v4');
        return raw ? JSON.parse(raw) : [
            {
                name: "Научно-практическая конференция «Инженеры будущего»",
                subject: "Технология (робототехника/машиностроение)",
                grade: "8",
                stage: "regional",
                status: "winner",
                image: "" 
            }
        ];
    }

    // Сжатие фото через Canvas (чтобы не перегружать память устройства)
    function compressImage(file, callback) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxDim = 600;

                if (width > height && width > maxDim) {
                    height = Math.round((height * maxDim) / width);
                    width = maxDim;
                } else if (height > maxDim) {
                    width = Math.round((width * maxDim) / height);
                    height = maxDim;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                // Качественный сжатый JPEG ~40-60 КБ
                const dataUrl = canvas.toDataURL('image/jpeg', 0.72);
                callback(dataUrl);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function calculateMatch(school) {
        const savedTrack = localStorage.getItem('portfolio_track_v4') || 'eng';
        const olymps = getSavedOlymps();
        const userStack = getSavedStack();

        const trackMatch = (savedTrack === school.targetTrack) ? 1 : 0;
        let matchedTech = 0;
        school.requiredTech.forEach(t => {
            if (userStack.includes(t)) matchedTech++;
        });
        if (matchedTech > 3) matchedTech = 3;

        const hasAchievements = olymps.some(o => o.status === 'winner' || o.status === 'prizewinner') ? 1 : 0;
        const examDelta = 3; 

        if (wasmCalculateMatch) {
            const rawScore = wasmCalculateMatch(trackMatch, matchedTech, hasAchievements, examDelta);
            return Math.max(50, Math.min(rawScore, 99));
        }
        let score = 55 + (trackMatch ? 18 : 6) + Math.min(matchedTech * 6, 18) + (hasAchievements ? 6 : 0);
        return Math.max(50, Math.min(score, 99));
    }

    // Лепестковая диаграмма компетенций
    function drawRadar(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2 + 4;
        const rMax = 72;

        ctx.clearRect(0, 0, w, h);

        const stack = getSavedStack();
        const olymps = getSavedOlymps();

        const axes = [
            { label: "Инженерия", val: Math.min(1, 0.4 + (stack.includes("Инженерия") ? 0.3 : 0) + (stack.includes("Физика") ? 0.3 : 0)) },
            { label: "Мастерство/CAD", val: Math.min(1, 0.35 + (stack.includes("3D-печать (CAD)") ? 0.35 : 0) + (stack.includes("Схемотехника/Пайка") ? 0.3 : 0)) },
            { label: "C++ / Код", val: Math.min(1, 0.3 + (stack.includes("C++") ? 0.4 : 0) + (stack.includes("Python") ? 0.3 : 0)) },
            { label: "Олимпиады", val: Math.min(1, 0.3 + olymps.length * 0.25) },
            { label: "Математика", val: Math.min(1, 0.4 + (stack.includes("Алгебра/Геометрия") ? 0.4 : 0)) }
        ];

        const n = axes.length;
        const step = (Math.PI * 2) / n;

        for (let l = 1; l <= 4; l++) {
            const r = (rMax / 4) * l;
            ctx.beginPath();
            for (let i = 0; i < n; i++) {
                const a = i * step - Math.PI / 2;
                const x = cx + r * Math.cos(a);
                const y = cy + r * Math.sin(a);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
            ctx.stroke();
        }

        ctx.font = "600 10px sans-serif";
        ctx.fillStyle = "#94a3b8";
        ctx.textAlign = "center";

        for (let i = 0; i < n; i++) {
            const a = i * step - Math.PI / 2;
            const lx = cx + (rMax + 22) * Math.cos(a);
            const ly = cy + (rMax + 22) * Math.sin(a) + 3;
            ctx.fillText(axes[i].label, lx, ly);

            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + rMax * Math.cos(a), cy + rMax * Math.sin(a));
            ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
            ctx.stroke();
        }

        ctx.beginPath();
        for (let i = 0; i < n; i++) {
            const a = i * step - Math.PI / 2;
            const r = rMax * axes[i].val;
            const x = cx + r * Math.cos(a);
            const y = cy + r * Math.sin(a);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = "rgba(59, 130, 246, 0.35)";
        ctx.fill();
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Отрисовка красивого печатного портфолио А4
    function showPrintablePortfolio() {
        const name = localStorage.getItem('portfolio_name_v4') || 'Дубянский Артём';
        const grade = localStorage.getItem('portfolio_grade_v4') || '8 «Д»';
        const school = localStorage.getItem('portfolio_school_v4') || 'ГБОУ «Бауманская инженерная школа № 1580»';
        const projectTitle = localStorage.getItem('portfolio_proj_title_v4') || 'Стенд аппаратного прототипирования и навигатор поступления на C++ (WASM)';
        const projectDesc = localStorage.getItem('portfolio_proj_desc_v4') || 'Сборка узлов на 3D-принтере, распайка модулей телеметрии, написание алгоритмов анализа на C++.';
        const motivation = localStorage.getItem('portfolio_motivation_v4') || 'Хочу углубленно изучать инженерное дело и робототехнику, чтобы создавать реальные приборы и аппараты.';
        const olymps = getSavedOlymps();
        const stack = getSavedStack();

        const stageNames = { school: "Школьный", municipal: "Муниципальный", regional: "Региональный", allros: "Заключительный" };
        const statusNames = { winner: "Победитель", prizewinner: "Призёр", participant: "Участник" };

        let diplomasHtml = '';
        const olympsWithPhotos = olymps.filter(o => o.image);

        if (olympsWithPhotos.length > 0) {
            diplomasHtml = `
                <div style="margin-top: 14px;">
                    <div style="font-weight: 700; color: #1e3a8a; border-bottom: 1px solid #93c5fd; padding-bottom: 2px; margin-bottom: 8px;">
                        ФОТОФИКСАЦИЯ И СКАНЫ ПРИКРЕПЛЕННЫХ ГРАМОТ:
                    </div>
                    <div class="print-diploma-grid">
                        ${olympsWithPhotos.map(o => `
                            <div class="print-diploma-item">
                                <img src="${o.image}" alt="Грамота">
                                <div style="font-size: 10px; font-weight: 600; margin-top: 3px; color: #1f2937;">${o.subject}</div>
                                <div style="font-size: 9px; color: #4b5563;">${statusNames[o.status] || o.status}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        const olympsRows = olymps.map((o, idx) => `
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 6px 8px;"><b>${idx + 1}. ${o.name}</b></td>
                <td style="padding: 6px 8px;">${o.subject} (${o.grade} кл.)</td>
                <td style="padding: 6px 8px;">${stageNames[o.stage] || o.stage}</td>
                <td style="padding: 6px 8px; font-weight: 700; color: #1d4ed8;">${statusNames[o.status] || o.status}</td>
            </tr>
        `).join('');

        const sheet = document.getElementById('print-sheet-content');
        sheet.innerHTML = `
            <div style="border-bottom: 2px solid #1e40af; padding-bottom: 10px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: flex-end;">
                <div>
                    <h1 style="font-size: 20px; color: #111827; margin-bottom: 2px;">ОФИЦИАЛЬНОЕ ПОРТФОЛИО УЧЕНИКА</h1>
                    <div style="font-size: 12px; color: #4b5563;">Предпрофильная инженерная вертикаль • МГТУ им. Н.Э. Баумана</div>
                </div>
                <div style="text-align: right; font-size: 11px; color: #6b7280;">
                    Дата: ${new Date().toLocaleDateString('ru-RU')}
                </div>
            </div>

            <table style="width: 100%; margin-bottom: 14px; font-size: 13px;">
                <tr>
                    <td style="width: 130px; font-weight: 700; color: #374151;">Учащийся:</td>
                    <td style="font-size: 15px; font-weight: 700; color: #111827;">${name}</td>
                </tr>
                <tr>
                    <td style="font-weight: 700; color: #374151;">Класс и школа:</td>
                    <td>${grade}, ${school}</td>
                </tr>
                <tr>
                    <td style="font-weight: 700; color: #374151;">Стек навыков:</td>
                    <td>${stack.join(', ')}</td>
                </tr>
            </table>

            <div style="margin-bottom: 14px;">
                <div style="font-weight: 700; color: #1e3a8a; border-bottom: 1px solid #93c5fd; padding-bottom: 2px; margin-bottom: 4px;">
                    1. МОИ ПРАКТИЧЕСКИЕ И ИНЖЕНЕРНЫЕ ПРОЕКТЫ
                </div>
                <p style="margin-bottom: 3px;"><b>${projectTitle}</b></p>
                <p style="color: #374151; font-size: 12px;">${projectDesc}</p>
            </div>

            <div style="margin-bottom: 14px;">
                <div style="font-weight: 700; color: #1e3a8a; border-bottom: 1px solid #93c5fd; padding-bottom: 2px; margin-bottom: 4px;">
                    2. МОТИВАЦИЯ И ВЫБОР ПРОФИЛЯ
                </div>
                <p style="color: #374151; font-size: 12px;">${motivation}</p>
            </div>

            <div style="margin-bottom: 14px;">
                <div style="font-weight: 700; color: #1e3a8a; border-bottom: 1px solid #93c5fd; padding-bottom: 2px; margin-bottom: 6px;">
                    3. ОЛИМПИАДЫ, КОНКУРСЫ И НАГРАДЫ (${olymps.length} зафиксировано)
                </div>
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <thead style="background: #f3f4f6; text-align: left;">
                        <tr>
                            <th style="padding: 5px 8px;">Олимпиада/Конкурс</th>
                            <th style="padding: 5px 8px;">Предмет</th>
                            <th style="padding: 5px 8px;">Этап</th>
                            <th style="padding: 5px 8px;">Результат</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${olympsRows}
                    </tbody>
                </table>
            </div>

            ${diplomasHtml}

            <div style="margin-top: 24px; border-top: 1px solid #d1d5db; padding-top: 10px; display: flex; justify-content: space-between; font-size: 11px; color: #6b7280;">
                <div>Документ сформирован из веб-системы портфолио ученика</div>
                <div>Подпись учащегося: ___________________</div>
            </div>
        `;

        document.getElementById('print-modal').style.display = 'flex';
    }

    document.getElementById('modal-close-action').onclick = () => {
        document.getElementById('print-modal').style.display = 'none';
    };

    document.getElementById('modal-print-action').onclick = () => {
        window.print();
    };

    // Отрисовка вкладок
    function renderTab(tabIndex) {
        buttons.forEach((b, idx) => b.classList.toggle('active', idx === parseInt(tabIndex)));

        if (tabIndex === '0') {
            const track = localStorage.getItem('portfolio_track_v4') || 'eng';

            contentCard.innerHTML = `
                <h2>Профориентационный тест: Выбор профильного вектора</h2>
                <p>Выберите главное направление обучения для перехода в старшие классы:</p>
                <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 12px;">
                    <select id="select-track" class="form-select">
                        <option value="eng" ${track==='eng'?'selected':''}>Инженерия, физика и микроэлектроника (МГТУ Баумана)</option>
                        <option value="biz" ${track==='biz'?'selected':''}>Экономика, бизнес и управление проектами (НИУ ВШЭ, РЭУ)</option>
                        <option value="craft" ${track==='craft'?'selected':''}>Прикладные технологии, 3D-печать, станки ЧПУ и роботы</option>
                        <option value="it" ${track==='it'?'selected':''}>IT-разработка, системное и прикладное программирование</option>
                        <option value="science" ${track==='science'?'selected':''}>Фундаментальная математика и научные исследования</option>
                    </select>
                    <button id="save-track-btn" class="btn-primary">Зафиксировать вектор</button>
                    <span id="track-status" style="font-size: 12px; color: var(--success); display: none;">Вектор сохранен в алгоритмической модели!</span>
                </div>
            `;

            document.getElementById('save-track-btn').onclick = () => {
                localStorage.setItem('portfolio_track_v4', document.getElementById('select-track').value);
                const s = document.getElementById('track-status');
                s.style.display = 'block';
                setTimeout(() => s.style.display = 'none', 2000);
            };

        } else if (tabIndex === '1') {
            const name = localStorage.getItem('portfolio_name_v4') || 'Дубянский Артём';
            const grade = localStorage.getItem('portfolio_grade_v4') || '8 «Д»';
            const school = localStorage.getItem('portfolio_school_v4') || 'ГБОУ «Бауманская инженерная школа № 1580»';
            const projTitle = localStorage.getItem('portfolio_proj_title_v4') || 'Стенд аппаратного прототипирования и навигатор поступления на C++ (WASM)';
            const projDesc = localStorage.getItem('portfolio_proj_desc_v4') || 'Сборка узлов на 3D-принтере, распайка модулей телеметрии, написание алгоритмов анализа на C++.';
            const motivation = localStorage.getItem('portfolio_motivation_v4') || 'Хочу углубленно изучать инженерное дело и робототехнику, чтобы создавать реальные приборы и аппараты.';

            let currentStack = getSavedStack();
            let currentOlymps = getSavedOlymps();

            contentCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 14px;">
                    <div>
                        <h2>Моё портфолио и грамоты</h2>
                        <p style="margin-bottom: 0;">Реальные проекты, фото грамот и баланс компетенций</p>
                    </div>
                    <button id="preview-styled-portfolio-btn" class="btn-secondary" style="border-color: #10b981; color: #10b981; font-weight: 700;">
                        👁️ Посмотреть оформленное портфолио (А4 / Печать)
                    </button>
                </div>

                <div class="portfolio-grid">
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        
                        <!-- Личные данные -->
                        <div class="section-box">
                            <div class="section-title">👤 Данные ученика</div>
                            <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                                <div style="flex: 2;">
                                    <label class="form-label">ФИО</label>
                                    <input type="text" id="input-name" class="form-input" value="${name}">
                                </div>
                                <div style="flex: 1;">
                                    <label class="form-label">Класс</label>
                                    <input type="text" id="input-grade" class="form-input" value="${grade}">
                                </div>
                            </div>
                            <div>
                                <label class="form-label">Школа / Инженерный класс</label>
                                <input type="text" id="input-school" class="form-input" value="${school}">
                            </div>
                        </div>

                        <!-- Проекты и практика -->
                        <div class="section-box">
                            <div class="section-title">⚙️ Мои инженерные и учебные проекты</div>
                            <div style="margin-bottom: 8px;">
                                <label class="form-label">Название проекта / разработки</label>
                                <input type="text" id="input-proj-title" class="form-input" value="${projTitle}">
                            </div>
                            <div>
                                <label class="form-label">Что конкретно сделано своими руками (пайка, 3D-печать, код)</label>
                                <textarea id="input-proj-desc" class="form-textarea" rows="2">${projDesc}</textarea>
                            </div>
                        </div>

                        <!-- Мотивация -->
                        <div class="section-box">
                            <div class="section-title">🎯 Мотивация и цель поступления</div>
                            <textarea id="input-motivation" class="form-textarea" rows="2" placeholder="Почему вы выбрали это направление?">${motivation}</textarea>
                        </div>

                        <!-- ОЛИМПИАДЫ С ПРИКРЕПЛЕНИЕМ ФОТО ГРАМОТ -->
                        <div class="section-box">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                <div class="section-title" style="margin-bottom: 0;">🏆 Олимпиады и грамоты (с фотофиксацией)</div>
                                <button id="add-olymp-btn" type="button" style="background: rgba(59, 130, 246, 0.2); border: 1px solid var(--accent-blue); color: #60a5fa; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">
                                    + Добавить олимпиаду
                                </button>
                            </div>
                            <div id="olymps-container"></div>
                        </div>

                        <!-- Стек дисциплин -->
                        <div class="section-box">
                            <div class="section-title">🛠️ Освоенные технологии и стек</div>
                            <div id="tech-chips" style="display: flex; flex-wrap: wrap; gap: 6px;"></div>
                        </div>

                        <button id="save-all-btn" class="btn-primary">💾 Сохранить все данные</button>
                        <span id="save-status" style="font-size: 12px; color: var(--success); display: none;">Все данные и грамоты успешно сохранены!</span>
                    </div>

                    <!-- Правая колонка с картой компетенций -->
                    <div class="radar-box">
                        <span style="font-size: 13px; font-weight: 700; color: #f0f4f8; margin-bottom: 4px;">Карта компетенций</span>
                        <canvas id="skills-radar" width="300" height="240"></canvas>
                        <div style="font-size: 11px; color: var(--text-muted); margin-top: 8px; line-height: 1.4;">
                            Радар пересчитывается автоматически: учитываются выбранные навыки, проекты и подтвержденные дипломы.
                        </div>
                    </div>
                </div>
            `;

            // Отрисовка карточек олимпиад с фото
            const olympsContainer = document.getElementById('olymps-container');

            function renderOlympsList() {
                olympsContainer.innerHTML = '';
                if (currentOlymps.length === 0) {
                    olympsContainer.innerHTML = '<p style="font-size: 12px; color: var(--text-muted);">Нет добавленных грамот. Нажмите кнопку «+ Добавить олимпиаду».</p>';
                    return;
                }

                currentOlymps.forEach((olymp, idx) => {
                    const card = document.createElement('div');
                    card.className = 'ach-card';

                    const olympOptions = olympList.map(o => `<option value="${o}" ${olymp.name === o ? 'selected' : ''}>${o}</option>`).join('');
                    const subjectOptions = subjectList.map(s => `<option value="${s}" ${olymp.subject === s ? 'selected' : ''}>${s}</option>`).join('');

                    card.innerHTML = `
                        <button type="button" class="ach-remove-btn" data-del="${idx}" title="Удалить">✕</button>
                        
                        <div>
                            <span class="form-label">Олимпиада / Конкурс:</span>
                            <select class="form-select ach-field" data-idx="${idx}" data-field="name">
                                ${olympOptions}
                            </select>
                        </div>

                        <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 6px;">
                            <div>
                                <span class="form-label">Предмет:</span>
                                <select class="form-select ach-field" data-idx="${idx}" data-field="subject">
                                    ${subjectOptions}
                                </select>
                            </div>
                            <div>
                                <span class="form-label">Класс:</span>
                                <select class="form-select ach-field" data-idx="${idx}" data-field="grade">
                                    <option value="7" ${olymp.grade==='7'?'selected':''}>7 класс</option>
                                    <option value="8" ${olymp.grade==='8'?'selected':''}>8 класс</option>
                                    <option value="9" ${olymp.grade==='9'?'selected':''}>9 класс</option>
                                </select>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                            <div>
                                <span class="form-label">Этап:</span>
                                <select class="form-select ach-field" data-idx="${idx}" data-field="stage">
                                    <option value="school" ${olymp.stage==='school'?'selected':''}>Школьный</option>
                                    <option value="municipal" ${olymp.stage==='municipal'?'selected':''}>Муниципальный</option>
                                    <option value="regional" ${olymp.stage==='regional'?'selected':''}>Региональный</option>
                                    <option value="allros" ${olymp.stage==='allros'?'selected':''}>Заключительный</option>
                                </select>
                            </div>
                            <div>
                                <span class="form-label">Результат:</span>
                                <select class="form-select ach-field" data-idx="${idx}" data-field="status">
                                    <option value="winner" ${olymp.status==='winner'?'selected':''}>Победитель</option>
                                    <option value="prizewinner" ${olymp.status==='prizewinner'?'selected':''}>Призёр</option>
                                    <option value="participant" ${olymp.status==='participant'?'selected':''}>Участник</option>
                                </select>
                            </div>
                        </div>

                        <!-- Блок фото грамоты -->
                        <div class="photo-preview-box">
                            <input type="file" accept="image/*" id="photo-input-${idx}" style="display: none;">
                            <button type="button" class="btn-secondary attach-photo-btn" data-idx="${idx}" style="font-size: 11px; padding: 6px 10px;">
                                📸 ${olymp.image ? 'Заменить фото грамоты' : 'Сфотографировать / Прикрепить грамоту'}
                            </button>
                            ${olymp.image ? `
                                <img src="${olymp.image}" class="diploma-thumb" title="Нажмите, чтобы открыть">
                                <span style="font-size: 11px; color: var(--success); font-weight: 600;">✓ Грамота прикреплена</span>
                                <button type="button" class="remove-photo-btn" data-idx="${idx}" style="background: none; border: none; color: var(--danger); font-size: 11px; cursor: pointer; margin-left: auto;">Удалить фото</button>
                            ` : `
                                <span style="font-size: 11px; color: var(--text-muted);">Фото не прикреплено</span>
                            `}
                        </div>
                    `;
                    olympsContainer.appendChild(card);
                });

                // Обработчики полей
                document.querySelectorAll('.ach-field').forEach(el => {
                    el.onchange = (e) => {
                        const i = parseInt(e.target.dataset.idx);
                        const field = e.target.dataset.field;
                        currentOlymps[i][field] = e.target.value;
                        localStorage.setItem('portfolio_olymps_v4', JSON.stringify(currentOlymps));
                        drawRadar('skills-radar');
                    };
                });

                // Удаление карточки
                document.querySelectorAll('.ach-remove-btn').forEach(btn => {
                    btn.onclick = (e) => {
                        const i = parseInt(e.target.dataset.del);
                        currentOlymps.splice(i, 1);
                        localStorage.setItem('portfolio_olymps_v4', JSON.stringify(currentOlymps));
                        renderOlympsList();
                        drawRadar('skills-radar');
                    };
                });

                // Загрузка фото грамоты
                document.querySelectorAll('.attach-photo-btn').forEach(btn => {
                    btn.onclick = () => {
                        const idx = btn.dataset.idx;
                        const input = document.getElementById(`photo-input-${idx}`);
                        input.click();
                        input.onchange = (ev) => {
                            if (ev.target.files && ev.target.files[0]) {
                                compressImage(ev.target.files[0], (compressedData) => {
                                    currentOlymps[idx].image = compressedData;
                                    localStorage.setItem('portfolio_olymps_v4', JSON.stringify(currentOlymps));
                                    renderOlympsList();
                                    drawRadar('skills-radar');
                                });
                            }
                        };
                    };
                });

                // Удаление фото
                document.querySelectorAll('.remove-photo-btn').forEach(btn => {
                    btn.onclick = () => {
                        const idx = btn.dataset.idx;
                        currentOlymps[idx].image = "";
                        localStorage.setItem('portfolio_olymps_v4', JSON.stringify(currentOlymps));
                        renderOlympsList();
                    };
                });

                // Просмотр фото на весь экран при клике на миниатюру
                document.querySelectorAll('.diploma-thumb').forEach(img => {
                    img.onclick = () => {
                        const w = window.open("");
                        w.document.write(`<img src="${img.src}" style="max-width:100%; height:auto;">`);
                    };
                });
            }

            renderOlympsList();

            document.getElementById('add-olymp-btn').onclick = () => {
                currentOlymps.push({
                    name: olympList[0],
                    subject: subjectList[0],
                    grade: "8",
                    stage: "municipal",
                    status: "prizewinner",
                    image: ""
                });
                localStorage.setItem('portfolio_olymps_v4', JSON.stringify(currentOlymps));
                renderOlympsList();
                drawRadar('skills-radar');
            };

            // Чипы навыков
            const chipsBox = document.getElementById('tech-chips');
            function renderChips() {
                chipsBox.innerHTML = '';
                availableTech.forEach(tech => {
                    const sel = currentStack.includes(tech);
                    const chip = document.createElement('button');
                    chip.type = 'button';
                    chip.textContent = tech;
                    chip.style.cssText = `
                        padding: 4px 9px; border-radius: 14px; font-size: 11px; font-weight: 600; cursor: pointer;
                        border: 1px solid ${sel ? 'var(--accent-blue)' : 'var(--border-color)'};
                        background: ${sel ? 'rgba(59, 130, 246, 0.25)' : '#090e18'};
                        color: ${sel ? '#fff' : 'var(--text-muted)'};
                    `;
                    chip.onclick = () => {
                        if (currentStack.includes(tech)) {
                            currentStack = currentStack.filter(t => t !== tech);
                        } else {
                            currentStack.push(tech);
                        }
                        localStorage.setItem('portfolio_stack_v4', JSON.stringify(currentStack));
                        renderChips();
                        drawRadar('skills-radar');
                    };
                    chipsBox.appendChild(chip);
                });
            }

            renderChips();
            drawRadar('skills-radar');

            document.getElementById('save-all-btn').onclick = () => {
                localStorage.setItem('portfolio_name_v4', document.getElementById('input-name').value);
                localStorage.setItem('portfolio_grade_v4', document.getElementById('input-grade').value);
                localStorage.setItem('portfolio_school_v4', document.getElementById('input-school').value);
                localStorage.setItem('portfolio_proj_title_v4', document.getElementById('input-proj-title').value);
                localStorage.setItem('portfolio_proj_desc_v4', document.getElementById('input-proj-desc').value);
                localStorage.setItem('portfolio_motivation_v4', document.getElementById('input-motivation').value);
                localStorage.setItem('portfolio_olymps_v4', JSON.stringify(currentOlymps));

                const s = document.getElementById('save-status');
                s.style.display = 'block';
                setTimeout(() => s.style.display = 'none', 2000);
            };

            document.getElementById('preview-styled-portfolio-btn').onclick = showPrintablePortfolio;

        } else if (tabIndex === '2') {
            const userStack = getSavedStack();

            contentCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                    <div>
                        <h2>Навигатор профильных школ (C++ WASM)</h2>
                        <p style="margin-bottom: 0;">Мгновенный расчет совместимости на базе WebAssembly:</p>
                    </div>
                    <span style="font-size: 11px; padding: 4px 8px; border-radius: 8px; background: rgba(16, 185, 129, 0.15); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.35);">
                        ${wasmActive ? '● WASM C++ Ядро активно' : '● Резервный расчет'}
                    </span>
                </div>

                <div id="schools-list" style="display: flex; flex-direction: column; gap: 10px;"></div>
            `;

            const list = document.getElementById('schools-list');
            const ranked = schoolsData
                .map(s => ({ ...s, matchScore: calculateMatch(s) }))
                .sort((a, b) => b.matchScore - a.matchScore);

            ranked.forEach(school => {
                const card = document.createElement('div');
                card.style.cssText = "background: var(--card-inner); border: 1px solid var(--border-color); padding: 12px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; gap: 12px;";

                const badges = school.requiredTech.map(t => {
                    const m = userStack.includes(t);
                    return `<span style="display: inline-block; padding: 2px 6px; border-radius: 5px; font-size: 10px; margin-right: 4px; background: ${m ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255,255,255,0.05)'}; color: ${m ? '#fff' : 'var(--text-muted)'}; border: 1px solid ${m ? 'var(--accent-blue)' : 'transparent'};">${t}</span>`;
                }).join('');

                card.innerHTML = `
                    <div style="flex: 1;">
                        <h3 style="font-size: 14px; color: #f0f4f8; margin-bottom: 3px;">${school.name}</h3>
                        <p style="font-size: 12px; color: var(--accent-blue); margin-bottom: 4px;">${school.profile} • Проходной: ${school.minScore}</p>
                        <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px;">${school.description}</p>
                        <div>${badges}</div>
                    </div>
                    <div style="min-width: 58px; height: 58px; border-radius: 50%; border: 3px solid ${school.matchScore >= 80 ? 'var(--accent-blue)' : '#64748b'}; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(59, 130, 246, 0.1);">
                        <span style="font-size: 13px; font-weight: 700; color: #fff;">${school.matchScore}%</span>
                        <span style="font-size: 8px; color: var(--text-muted);">C++ WASM</span>
                    </div>
                `;
                list.appendChild(card);
            });
        }
    }

    renderTab('1');
    buttons.forEach(btn => btn.onclick = () => renderTab(btn.getAttribute('data-tab')));
});
