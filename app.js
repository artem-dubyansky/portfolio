document.addEventListener('DOMContentLoaded', async () => {
    const buttons = document.querySelectorAll('.tab-btn');
    const contentCard = document.getElementById('main-content');

    // 1. Service Worker & PWA установка
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(err => console.log('SW setup pass', err));
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
                alert("Чтобы установить приложение на телефон:\nНа iPhone: нажмите «Поделиться» (квадрат со стрелкой вверх) ➔ «На экран «Домой»».\nНа Android: три точки в меню браузера ➔ «Установить на главный экран».");
            }
        });
    }

    // 2. БИНАРНЫЙ МОДУЛЬ WEBASSEMBLY (Алгоритмическое ядро C++)
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
        console.warn("WASM fallback active", e);
    }

    // Справочники для олимпиад
    const olympList = [
        "Научно-практическая конференция «Инженеры будущего»",
        "Всероссийская олимпиада школьников (ВсОШ)",
        "Московская олимпиада школьников (МОШ)",
        "Олимпиада школьников «Шаг в будущее» (МГТУ Баумана)",
        "Олимпиада «Курчатов»",
        "Олимпиада «Высшая проба» (НИУ ВШЭ)",
        "Олимпиада «Ломоносов» (МГУ)",
        "Предпрофессиональная олимпиада",
        "Конкурс проектов «Школа старшеклассников»"
    ];

    const subjectList = [
        "Технология (робототехника/машиностроение)",
        "Физика",
        "Информатика",
        "Математика",
        "Экономика и предпринимательство",
        "Обществознание",
        "Химия",
        "Астрономия"
    ];

    const availableTech = [
        "Инженерия", "3D-моделирование (CAD)", "Схемотехника/Пайка", "Робототехника", 
        "C++", "Python", "Физика", "Математика", "Экономика/Финансы", 
        "Управление проектами", "Веб-дизайн", "Анализ данных"
    ];

    const schoolsData = [
        { id: 1, name: "Бауманская инженерная школа № 1580", profile: "Инженерно-технологический", targetTrack: "eng", minScore: 88, requiredTech: ["Инженерия", "Физика", "Математика"], description: "Базовый лицей при МГТУ им. Баумана. Инженерная графика, прототипирование и прикладная физика." },
        { id: 2, name: "Лицей НИУ ВШЭ (Экономика и Бизнес)", profile: "Предпринимательский и соцэк", targetTrack: "biz", minScore: 86, requiredTech: ["Экономика/Финансы", "Управление проектами", "Математика"], description: "Подготовка предпринимателей, бизнес-аналитиков и специалистов по управлению." },
        { id: 3, name: "Колледж современных технологий (КСТ)", profile: "Прикладные технологии и мастерство", targetTrack: "craft", minScore: 75, requiredTech: ["Схемотехника/Пайка", "3D-моделирование (CAD)", "Инженерия"], description: "Практическая работа на станках с ЧПУ, мехатроника, монтаж радиоэлектронных систем." },
        { id: 4, name: "Школа № 179", profile: "Математика и C++ алгоритмы", targetTrack: "eng", minScore: 92, requiredTech: ["C++", "Математика", "Анализ данных"], description: "Специализированные классы по системному программированию и математике." },
        { id: 5, name: "Экономический лицей РЭУ им. Г.В. Плеханова", profile: "Финансы и бизнес-проекты", targetTrack: "biz", minScore: 82, requiredTech: ["Экономика/Финансы", "Управление проектами", "Веб-дизайн"], description: "Основы финансовой грамотности, предпринимательское право и маркетинг." },
        { id: 6, name: "Политехнический колледж № 8 им. Павлова", profile: "Аппаратные технологии и роботы", targetTrack: "craft", minScore: 74, requiredTech: ["Робототехника", "Схемотехника/Пайка", "3D-моделирование (CAD)"], description: "Лаборатории микроэлектроники, робототехнические комплексы, мастерские металлообработки." },
        { id: 7, name: "Школа № 1502 при МЭИ", profile: "Энергетика и машиностроение", targetTrack: "eng", minScore: 84, requiredTech: ["Физика", "Инженерия", "3D-моделирование (CAD)"], description: "Инженерные вертикали, практическая работа в лабораториях Московского энергетического института." },
        { id: 8, name: "Школа № 1535 (Информационно-технологический)", profile: "IT и разработка ПО", targetTrack: "it", minScore: 89, requiredTech: ["Python", "C++", "Веб-дизайн"], description: "Программирование современных сервисов, алгоритмические базы данных и сетевые технологии." },
        { id: 9, name: "Колледж предпринимательства № 11", profile: "Прикладной бизнес и коммерция", targetTrack: "biz", minScore: 76, requiredTech: ["Экономика/Финансы", "Управление проектами", "Веб-дизайн"], description: "Практические бизнес-модели, запуск собственных проектов, логистика." },
        { id: 10, name: "Инженерный корпус школы № 548 «Царицыно»", profile: "Архитектура, CAD и инженерия", targetTrack: "craft", minScore: 81, requiredTech: ["3D-моделирование (CAD)", "Инженерия", "Робототехника"], description: "Проектирование реальных физических объектов, работа в мастерских и фаблабах." }
    ];

    function getSavedStack() {
        const raw = localStorage.getItem('portfolio_stack_v4');
        return raw ? JSON.parse(raw) : ["Инженерия", "3D-моделирование (CAD)", "Схемотехника/Пайка", "Физика", "C++"];
    }

    function getSavedOlymps() {
        const raw = localStorage.getItem('portfolio_olymps_v4');
        if (raw) return JSON.parse(raw);
        
        // Перенос данных из предыдущей версии (если есть)
        const old = localStorage.getItem('portfolio_olymps_v3');
        if (old) {
            try { return JSON.parse(old); } catch(e){}
        }

        return [
            {
                name: "Научно-практическая конференция «Инженеры будущего»",
                subject: "Технология (робототехника/машиностроение)",
                grade: "8",
                stage: "regional",
                status: "winner",
                photo: ""
            },
            {
                name: "Всероссийская олимпиада школьников (ВсОШ)",
                subject: "Физика",
                grade: "8",
                stage: "municipal",
                status: "prizewinner",
                photo: ""
            }
        ];
    }

    function calculateExamForecast() {
        const math = parseInt(localStorage.getItem('exam_math') || '5');
        const inf = parseInt(localStorage.getItem('exam_inf') || '5');
        const phys = parseInt(localStorage.getItem('exam_phys') || '5');
        const rus = parseInt(localStorage.getItem('exam_rus') || '5');

        const avgGrade = (math + inf + phys + rus) / 4;
        const predictedOge = Math.round(avgGrade * 6.6);
        const predictedEge = Math.round(50 + (avgGrade - 3) * 23);

        return { math, inf, phys, rus, avgGrade: avgGrade.toFixed(1), predictedOge, predictedEge };
    }

    function calculateMatch(school) {
        const savedTrack = localStorage.getItem('portfolio_track_v4') || 'eng';
        const olymps = getSavedOlymps();
        const userStack = getSavedStack();
        const exam = calculateExamForecast();

        const trackMatch = (savedTrack === school.targetTrack) ? 1 : 0;
        let matchedTech = 0;
        school.requiredTech.forEach(t => {
            if (userStack.includes(t)) matchedTech++;
        });
        if (matchedTech > 3) matchedTech = 3;

        // Дополнительный балл, если есть не просто олимпиада, а подтверждённая грамота с фото
        let hasAchievements = olymps.some(o => o.status === 'winner' || o.status === 'prizewinner') ? 1 : 0;
        let hasPhotoProof = olymps.some(o => o.photo && o.photo.length > 50) ? 1 : 0;
        const examDelta = exam.predictedEge - school.minScore;

        if (wasmCalculateMatch) {
            const rawScore = wasmCalculateMatch(trackMatch, matchedTech, hasAchievements, examDelta);
            return Math.max(45, Math.min(rawScore + (hasPhotoProof ? 2 : 0), 99));
        }

        let score = 55 + (trackMatch ? 16 : 5) + Math.min(matchedTech * 5, 15) + (hasAchievements ? 5 : 0) + (hasPhotoProof ? 3 : 0) + (examDelta >= 0 ? 8 : -4);
        return Math.max(45, Math.min(score, 99));
    }

    // Сжатие фото диплома/грамоты через Canvas перед сохранением в память
    function compressImage(file, callback) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const maxDim = 800; // Оптимально для просмотра на телефоне и экране

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
                // Сжимаем в легкий JPEG с качеством 0.7 (весит 35-60 КБ)
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                callback(dataUrl);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Сохранение файла на устройство с резервной копией в модальное окно
    function safeDownloadText(filename, textContent) {
        try {
            const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 1500);
        } catch (err) {
            console.error("Direct download pass:", err);
        }
        showTextModal(filename, textContent);
    }

    function showTextModal(title, text) {
        let modal = document.getElementById('text-preview-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'text-preview-modal';
            modal.style.cssText = "position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; justify-content: center; align-items: center; z-index: 9999; padding: 14px;";
            modal.innerHTML = `
                <div style="background: #111827; border: 1px solid var(--border-color); border-radius: 14px; width: 100%; max-width: 580px; max-height: 85vh; display: flex; flex-direction: column; padding: 18px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h3 id="modal-doc-title" style="font-size: 15px; color: #f0f4f8;">Файл сформирован</h3>
                        <button id="modal-close-btn" style="background: transparent; border: none; color: #94a3b8; font-size: 20px; cursor: pointer;">✕</button>
                    </div>
                    <p style="font-size: 12px; color: #94a3b8; margin-bottom: 8px;">Если файл не загрузился автоматически, скопируйте текст в заметки:</p>
                    <textarea id="modal-doc-text" readonly style="flex: 1; min-height: 220px; background: #080c14; color: #f0f4f8; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px; font-family: monospace; font-size: 12px; resize: none; margin-bottom: 12px;"></textarea>
                    <div style="display: flex; gap: 8px;">
                        <button id="modal-copy-btn" class="btn-primary" style="flex: 1;">Скопировать весь текст</button>
                        <button id="modal-done-btn" class="btn-secondary" style="flex: 1;">Закрыть</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            document.getElementById('modal-close-btn').onclick = () => modal.style.display = 'none';
            document.getElementById('modal-done-btn').onclick = () => modal.style.display = 'none';
            document.getElementById('modal-copy-btn').onclick = () => {
                const ta = document.getElementById('modal-doc-text');
                ta.select();
                navigator.clipboard.writeText(ta.value).then(() => {
                    const btn = document.getElementById('modal-copy-btn');
                    btn.textContent = "✓ Текст скопирован!";
                    setTimeout(() => btn.textContent = "Скопировать весь текст", 2000);
                });
            };
        }

        document.getElementById('modal-doc-title').textContent = title;
        document.getElementById('modal-doc-text').value = text;
        modal.style.display = 'flex';
    }

    // 1-Й ДОКУМЕНТ: ПОРТФОЛИО УЧЕНИКА ДЛЯ ШКОЛЫ (Чистый человеческий текст)
    function exportPurePortfolio() {
        const name = localStorage.getItem('portfolio_name') || 'Дубянский Артём';
        const grade = localStorage.getItem('portfolio_grade') || '8 «Д» класс';
        const track = localStorage.getItem('portfolio_track_v4') || 'eng';
        const schoolHistory = localStorage.getItem('portfolio_school_history') || 'ГБОУ Бауманская инженерная школа № 1580';
        const aboutMe = localStorage.getItem('portfolio_about_me') || 'Сборка и пайка радиоэлектронных схем, 3D-моделирование деталей, программирование алгоритмов на C++.';
        
        const olymps = getSavedOlymps();
        const stack = getSavedStack();
        const exam = calculateExamForecast();

        const trackNames = {
            eng: "Инженерно-технологический профиль (физика, проектирование, C++)",
            biz: "Экономика, бизнес и управление проектами",
            craft: "Прикладные технологии и мастерство (CAD, электроника, работа руками)",
            it: "Информационные технологии и программирование",
            science: "Фундаментальная математика и наука"
        };

        const stageNames = { school: "Школьный этап", municipal: "Муниципальный этап", regional: "Региональный этап", allros: "Заключительный этап" };
        const statusNames = { winner: "Победитель", prizewinner: "Призёр", participant: "Участник" };

        const olympsText = olymps.map((o, idx) => {
            const hasProof = (o.photo && o.photo.length > 50) ? " (фото грамоты прикреплено в приложении)" : "";
            return `${idx + 1}. ${o.name}\n   Предмет: ${o.subject}\n   Класс участия: ${o.grade} класс\n   Этап: ${stageNames[o.stage] || o.stage}\n   Результат: ${statusNames[o.status] || o.status}${hasProof}`;
        }).join('\n\n');

        const lines = [
            "ПОРТФОЛИО УЧЕНИКА",
            "",
            `ФИО: ${name}`,
            `Класс: ${grade}`,
            `Выбранный профиль: ${trackNames[track] || track}`,
            `Учебные заведения и кружки: ${schoolHistory}`,
            "",
            "Академическая успеваемость:",
            `Средний балл по профильным предметам: ${exam.avgGrade} из 5.0`,
            `Текущие отметки: Математика (${exam.math}), Информатика (${exam.inf}), Физика (${exam.phys}), Русский язык (${exam.rus})`,
            "",
            "Освоенные навыки и направления:",
            stack.join(", "),
            "",
            "Олимпиады, конкурсы и достижения:",
            olympsText || "Нет добавленных записей",
            "",
            "О себе, увлечения и цели:",
            aboutMe,
            "",
            "Дата составления: " + new Date().toLocaleDateString('ru-RU')
        ];

        safeDownloadText(`Портфолио_${name.replace(/\s+/g, '_')}.txt`, lines.join('\r\n'));
    }

    // 2-Й ДОКУМЕНТ: АНАЛИТИЧЕСКИЙ ОТЧЕТ НАВИГАТОРА
    function exportAdmissionReport() {
        const name = localStorage.getItem('portfolio_name') || 'Дубянский Артём';
        const exam = calculateExamForecast();
        const rankedSchools = schoolsData
            .map(s => ({ ...s, score: calculateMatch(s) }))
            .sort((a, b) => b.score - a.score);

        const lines = [
            "АНАЛИТИЧЕСКИЙ ОТЧЁТ: НАВИГАТОР ПОСТУПЛЕНИЯ",
            "",
            `Ученик: ${name}`,
            `Прогноз первичных баллов ОГЭ: около ${exam.predictedOge} баллов`,
            `Прогноз баллов ЕГЭ: около ${exam.predictedEge} баллов`,
            "",
            "Рейтинг совместимости со школами и колледжами (расчёт C++ / WebAssembly):",
            ...rankedSchools.map((s, idx) => 
                `${idx + 1}. ${s.name}\n` +
                `   Профиль: ${s.profile}\n` +
                `   Совместимость: ${s.score}%\n` +
                `   Проходной порог: ${s.minScore} б.\n` +
                `   Приоритетные дисциплины: ${s.requiredTech.join(', ')}\n`
            ),
            "Дата расчёта: " + new Date().toLocaleDateString('ru-RU')
        ];

        safeDownloadText(`Отчёт_Навигатора_${name.replace(/\s+/g, '_')}.txt`, lines.join('\r\n'));
    }

    // 3-Й ДОКУМЕНТ: ПЕЧАТНАЯ ВЕРСИЯ ПОРТФОЛИО С ФОТОГРАФИЯМИ ГРАМОТ (Печать / Сохранить в PDF)
    function printPortfolioWithPhotos() {
        const name = localStorage.getItem('portfolio_name') || 'Дубянский Артём';
        const grade = localStorage.getItem('portfolio_grade') || '8 «Д» класс';
        const schoolHistory = localStorage.getItem('portfolio_school_history') || 'ГБОУ Бауманская инженерная школа № 1580';
        const aboutMe = localStorage.getItem('portfolio_about_me') || 'Сборка и пайка схем, 3D-моделирование, разработка на C++.';
        const olymps = getSavedOlymps();
        const stack = getSavedStack();
        const exam = calculateExamForecast();

        const stageNames = { school: "Школьный", municipal: "Муниципальный", regional: "Региональный", allros: "Заключительный" };
        const statusNames = { winner: "Победитель", prizewinner: "Призёр", participant: "Участник" };

        let printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert("Пожалуйста, разрешите всплывающие окна в браузере для печати портфолио.");
            return;
        }

        let olympsHtml = olymps.map((o, idx) => {
            let imgTag = o.photo ? `<div style="margin-top: 8px;"><img src="${o.photo}" style="max-width: 220px; max-height: 160px; border-radius: 6px; border: 1px solid #ccc; box-shadow: 0 2px 5px rgba(0,0,0,0.15);" alt="Грамота"></div>` : '<div style="color: #666; font-size: 11px; margin-top: 4px;"><i>(Скан не прикреплен)</i></div>';
            return `
                <div style="border-bottom: 1px solid #e5e7eb; padding: 10px 0;">
                    <b>${idx + 1}. ${o.name}</b><br>
                    <span style="font-size: 13px; color: #374151;">Предмет: ${o.subject} | Класс: ${o.grade} кл. | Этап: ${stageNames[o.stage] || o.stage} | Результат: <b>${statusNames[o.status] || o.status}</b></span>
                    ${imgTag}
                </div>
            `;
        }).join('');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="ru">
            <head>
                <meta charset="UTF-8">
                <title>Портфолио - ${name}</title>
                <style>
                    body { font-family: "Segoe UI", Arial, sans-serif; color: #111827; padding: 24px; line-height: 1.5; font-size: 13px; }
                    h1 { font-size: 20px; margin-bottom: 4px; text-transform: uppercase; color: #1f2937; }
                    .header { border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 16px; }
                    .section-title { font-size: 14px; font-weight: bold; margin-top: 14px; margin-bottom: 6px; color: #2563eb; text-transform: uppercase; }
                    .badge { display: inline-block; background: #e5e7eb; padding: 3px 8px; border-radius: 4px; margin: 2px 4px 2px 0; font-size: 12px; }
                    @media print {
                        body { padding: 0; }
                        button { display: none; }
                    }
                </style>
            </head>
            <body>
                <div style="text-align: right; margin-bottom: 12px;">
                    <button onclick="window.print()" style="background: #2563eb; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600;">Сохранить в PDF / Распечатать</button>
                </div>
                <div class="header">
                    <h1>Портфолио ученика</h1>
                    <div><b>ФИО:</b> ${name} &nbsp;|&nbsp; <b>Класс:</b> ${grade}</div>
                    <div><b>Учебные заведения и кружки:</b> ${schoolHistory}</div>
                    <div><b>Средний балл по профильным предметам:</b> ${exam.avgGrade} из 5.0 (М: ${exam.math}, Инф: ${exam.inf}, Физ: ${exam.phys}, Рус: ${exam.rus})</div>
                </div>

                <div class="section-title">Освоенные дисциплины и стек навыков</div>
                <div>${stack.map(s => `<span class="badge">${s}</span>`).join('')}</div>

                <div class="section-title">Олимпиады, конкурсы и подтверждающие грамоты</div>
                ${olympsHtml || '<p>Нет добавленных олимпиад</p>'}

                <div class="section-title">О себе и реализованные проекты</div>
                <p style="white-space: pre-wrap;">${aboutMe}</p>

                <div style="margin-top: 24px; font-size: 11px; color: #6b7280; text-align: right;">
                    Сформировано в сервисе «Онлайн-портфолио и навигатор профильного поступления» • ${new Date().toLocaleDateString('ru-RU')}
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
    }

    // ЛЕПЕСТКОВАЯ ДИАГРАММА НА CANVAS
    function drawRadarChart(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2 + 4;
        const maxRadius = 72;

        ctx.clearRect(0, 0, width, height);

        const stack = getSavedStack();
        const exam = calculateExamForecast();
        const track = localStorage.getItem('portfolio_track_v4') || 'eng';

        const axes = [
            { label: "Инженерия", val: Math.min(1, 0.35 + (stack.includes("Инженерия") || stack.includes("Физика") ? 0.35 : 0) + (track === "eng" ? 0.25 : 0)) },
            { label: "Бизнес/Управл.", val: Math.min(1, 0.3 + (stack.includes("Экономика/Финансы") || stack.includes("Управление проектами") ? 0.45 : 0) + (track === "biz" ? 0.25 : 0)) },
            { label: "Мастерство/CAD", val: Math.min(1, 0.3 + (stack.includes("3D-моделирование (CAD)") || stack.includes("Схемотехника/Пайка") ? 0.45 : 0) + (track === "craft" ? 0.25 : 0)) },
            { label: "IT / Код", val: Math.min(1, 0.3 + (stack.includes("C++") || stack.includes("Python") || stack.includes("Веб-дизайн") ? 0.4 : 0) + (track === "it" ? 0.25 : 0)) },
            { label: "Математика", val: Math.min(1, 0.3 + (exam.math - 2) * 0.2 + (stack.includes("Математика") ? 0.2 : 0)) }
        ];

        const numAxes = axes.length;
        const angleStep = (Math.PI * 2) / numAxes;

        for (let level = 1; level <= 4; level++) {
            const r = (maxRadius / 4) * level;
            ctx.beginPath();
            for (let i = 0; i < numAxes; i++) {
                const angle = i * angleStep - Math.PI / 2;
                const x = centerX + r * Math.cos(angle);
                const y = centerY + r * Math.sin(angle);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.strokeStyle = "rgba(148, 163, 184, 0.18)";
            ctx.stroke();
        }

        ctx.font = "600 10px sans-serif";
        ctx.fillStyle = "#94a3b8";
        ctx.textAlign = "center";

        for (let i = 0; i < numAxes; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const labelRadius = maxRadius + 24;
            const lx = centerX + labelRadius * Math.cos(angle);
            const ly = centerY + labelRadius * Math.sin(angle) + 4;
            ctx.fillText(axes[i].label, lx, ly);

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + maxRadius * Math.cos(angle), centerY + maxRadius * Math.sin(angle));
            ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
            ctx.stroke();
        }

        ctx.beginPath();
        for (let i = 0; i < numAxes; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const r = maxRadius * axes[i].val;
            const x = centerX + r * Math.cos(angle);
            const y = centerY + r * Math.sin(angle);
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

    function renderTab(tabIndex) {
        buttons.forEach((b, idx) => b.classList.toggle('active', idx === parseInt(tabIndex)));

        if (tabIndex === '0') {
            const track = localStorage.getItem('portfolio_track_v4') || 'eng';

            contentCard.innerHTML = `
                <h2>Профориентационный тест: Выбор профильного направления</h2>
                <p>Выберите ведущий вектор обучения в предпрофессиональных классах (8–11 класс):</p>
                
                <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 14px;">
                    <div>
                        <label style="display: block; font-size: 13px; color: var(--text-muted); margin-bottom: 6px;">Какая область деятельности вам ближе всего?</label>
                        <select id="select-track" class="form-select">
                            <option value="eng" ${track==='eng'?'selected':''}>Инженерия, физика, конструирование и робототехника (Бауманская школа, МЭИ)</option>
                            <option value="biz" ${track==='biz'?'selected':''}>Бизнес, экономика, финансы и управление проектами (НИУ ВШЭ, Плехановский лицей)</option>
                            <option value="craft" ${track==='craft'?'selected':''}>Прикладные технологии, 3D-моделирование, станки ЧПУ и схемотехника</option>
                            <option value="it" ${track==='it'?'selected':''}>IT-разработка, системное и прикладное программирование</option>
                            <option value="science" ${track==='science'?'selected':''}>Фундаментальная математика, теория и исследовательская физика</option>
                        </select>
                    </div>

                    <button id="save-track-btn" class="btn-primary">Сохранить выбор</button>
                    <span id="track-status" style="font-size: 12px; color: var(--success); display: none;">Направление зафиксировано! Карта навыков пересчитана.</span>
                </div>
            `;

            document.getElementById('save-track-btn').onclick = () => {
                localStorage.setItem('portfolio_track_v4', document.getElementById('select-track').value);
                const s = document.getElementById('track-status');
                s.style.display = 'block';
                setTimeout(() => s.style.display = 'none', 2000);
            };

        } else if (tabIndex === '1') {
            const name = localStorage.getItem('portfolio_name') || 'Дубянский Артём';
            const grade = localStorage.getItem('portfolio_grade') || '8 «Д»';
            const schoolHistory = localStorage.getItem('portfolio_school_history') || 'ГБОУ Бауманская инженерная школа № 1580';
            const aboutMe = localStorage.getItem('portfolio_about_me') || 'Сборка и пайка радиоэлектронных схем, моделирование механических узлов на 3D-принтере и разработка алгоритмов на C++.';

            let currentStack = getSavedStack();
            let currentOlymps = getSavedOlymps();

            contentCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">
                    <h2 style="margin-bottom: 0;">Анкета, Олимпиады и Грамоты</h2>
                    <button id="demo-fill-btn" style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.4); padding: 5px 10px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer;">
                        Заполнить пример профиля
                    </button>
                </div>

                <div class="portfolio-grid">
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <div style="display: flex; gap: 8px;">
                            <div style="flex: 2;">
                                <label style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 3px;">ФИО ученика</label>
                                <input type="text" id="input-name" class="form-input" value="${name}">
                            </div>
                            <div style="flex: 1;">
                                <label style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 3px;">Класс</label>
                                <input type="text" id="input-grade" class="form-input" value="${grade}">
                            </div>
                        </div>

                        <div>
                            <label style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 3px;">Где учились / курсы / кружки / фаблабы</label>
                            <input type="text" id="input-school-history" class="form-input" value="${schoolHistory}" placeholder="Школа, кружок робототехники, курсы...">
                        </div>

                        <div>
                            <label style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 3px;">О себе, проекты и инженерные цели</label>
                            <textarea id="input-about-me" class="form-textarea" rows="2" placeholder="Опишите ваши проекты, чем любите заниматься">${aboutMe}</textarea>
                        </div>

                        <!-- ОЛИМПИАДЫ И ГРАМОТЫ С ФОТО -->
                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                <label style="font-size: 12px; font-weight: 600; color: #f0f4f8;">Олимпиады, конкурсы и грамоты:</label>
                                <button id="add-olymp-btn" type="button" style="background: rgba(59, 130, 246, 0.2); border: 1px solid var(--accent-blue); color: #60a5fa; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">
                                    + Добавить олимпиаду
                                </button>
                            </div>
                            <div id="olymps-container"></div>
                        </div>

                        <!-- Стек навыков -->
                        <div>
                            <label style="font-size: 11px; color: var(--text-muted); display: block; margin-bottom: 5px;">Мой стек навыков и дисциплин (нажмите, чтобы выбрать):</label>
                            <div id="tech-chips" style="display: flex; flex-wrap: wrap; gap: 6px;"></div>
                        </div>

                        <!-- Кнопки действий -->
                        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
                            <button id="save-btn" class="btn-primary">Сохранить анкету и грамоты</button>
                            
                            <button id="print-full-btn" class="btn-secondary" style="border-color: #38bdf8; color: #38bdf8; font-weight: 700;">
                                🖨️ Официальный бланк портфолио с фото (Печать / PDF)
                            </button>

                            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                                <button id="export-pure-btn" class="btn-secondary" style="flex: 1; min-width: 160px; border-color: #10b981; color: #10b981;">
                                    📄 Текст портфолио для школы
                                </button>
                                <button id="export-report-btn" class="btn-secondary" style="flex: 1; min-width: 160px;">
                                    📊 Отчёт навигатора школ
                                </button>
                            </div>
                        </div>
                        <span id="save-status" style="font-size: 12px; color: var(--success); display: none;">Данные и фото грамот успешно сохранены в памяти!</span>
                    </div>

                    <div class="radar-box">
                        <span style="font-size: 13px; font-weight: 600; color: #f0f4f8; margin-bottom: 2px;">Карта моих компетенций</span>
                        <canvas id="skills-radar" width="300" height="240"></canvas>
                        <div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">
                            Направления: <b>Инженерия</b>, <b>Бизнес</b>, <b>Мастерство/CAD</b>, <b>IT/Код</b>, <b>Математика</b>.
                        </div>
                    </div>
                </div>
            `;

            // Отрисовка динамических олимпиад с фото
            const olympsContainer = document.getElementById('olymps-container');

            function renderOlympsList() {
                olympsContainer.innerHTML = '';
                if (currentOlymps.length === 0) {
                    olympsContainer.innerHTML = '<p style="font-size: 12px; color: var(--text-muted); margin-bottom: 6px;">Пока нет олимпиад. Нажмите «+ Добавить олимпиаду».</p>';
                    return;
                }

                currentOlymps.forEach((olymp, idx) => {
                    const card = document.createElement('div');
                    card.className = 'ach-card';

                    const olympOptions = olympList.map(item => `<option value="${item}" ${olymp.name === item ? 'selected' : ''}>${item}</option>`).join('');
                    const subjectOptions = subjectList.map(s => `<option value="${s}" ${olymp.subject === s ? 'selected' : ''}>${s}</option>`).join('');

                    const photoPreviewHtml = olymp.photo ? `
                        <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                            <img src="${olymp.photo}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; border: 1px solid var(--accent-blue);" alt="Грамота">
                            <span style="font-size: 11px; color: #10b981;">✓ Грамота прикреплена</span>
                            <button type="button" class="del-photo-btn" data-idx="${idx}" style="background: none; border: none; color: #ef4444; font-size: 11px; text-decoration: underline; cursor: pointer;">Удалить фото</button>
                        </div>
                    ` : `
                        <div style="margin-top: 4px;">
                            <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 11px; color: #60a5fa; cursor: pointer; padding: 4px 8px; border: 1px dashed var(--accent-blue); border-radius: 6px; background: rgba(59, 130, 246, 0.08);">
                                📷 Сфоткать / загрузить грамоту
                                <input type="file" accept="image/*" capture="environment" class="photo-input" data-idx="${idx}" style="display: none;">
                            </label>
                        </div>
                    `;

                    card.innerHTML = `
                        <button type="button" class="ach-remove-btn" data-del="${idx}" title="Удалить">✕</button>
                        
                        <div>
                            <span style="font-size: 10px; color: var(--text-muted); display: block; margin-bottom: 2px;">Название олимпиады / конкурса:</span>
                            <select class="form-select ach-field" data-idx="${idx}" data-field="name">
                                ${olympOptions}
                            </select>
                        </div>

                        <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 6px;">
                            <div>
                                <span style="font-size: 10px; color: var(--text-muted); display: block; margin-bottom: 2px;">Предмет:</span>
                                <select class="form-select ach-field" data-idx="${idx}" data-field="subject">
                                    ${subjectOptions}
                                </select>
                            </div>
                            <div>
                                <span style="font-size: 10px; color: var(--text-muted); display: block; margin-bottom: 2px;">Класс участия:</span>
                                <select class="form-select ach-field" data-idx="${idx}" data-field="grade">
                                    <option value="7" ${olymp.grade==='7'?'selected':''}>7 класс</option>
                                    <option value="8" ${olymp.grade==='8'?'selected':''}>8 класс</option>
                                    <option value="9" ${olymp.grade==='9'?'selected':''}>9 класс</option>
                                    <option value="10" ${olymp.grade==='10'?'selected':''}>10 класс</option>
                                    <option value="11" ${olymp.grade==='11'?'selected':''}>11 класс</option>
                                </select>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                            <div>
                                <span style="font-size: 10px; color: var(--text-muted); display: block; margin-bottom: 2px;">Этап / Уровень:</span>
                                <select class="form-select ach-field" data-idx="${idx}" data-field="stage">
                                    <option value="school" ${olymp.stage==='school'?'selected':''}>Школьный</option>
                                    <option value="municipal" ${olymp.stage==='municipal'?'selected':''}>Муниципальный</option>
                                    <option value="regional" ${olymp.stage==='regional'?'selected':''}>Региональный</option>
                                    <option value="allros" ${olymp.stage==='allros'?'selected':''}>Заключительный</option>
                                </select>
                            </div>
                            <div>
                                <span style="font-size: 10px; color: var(--text-muted); display: block; margin-bottom: 2px;">Результат:</span>
                                <select class="form-select ach-field" data-idx="${idx}" data-field="status">
                                    <option value="winner" ${olymp.status==='winner'?'selected':''}>Победитель</option>
                                    <option value="prizewinner" ${olymp.status==='prizewinner'?'selected':''}>Призёр</option>
                                    <option value="participant" ${olymp.status==='participant'?'selected':''}>Участник</option>
                                </select>
                            </div>
                        </div>

                        ${photoPreviewHtml}
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
                    };
                });

                // Загрузка фото грамоты
                document.querySelectorAll('.photo-input').forEach(input => {
                    input.onchange = (e) => {
                        const i = parseInt(e.target.dataset.idx);
                        const file = e.target.files[0];
                        if (file) {
                            compressImage(file, (compressedBase64) => {
                                currentOlymps[i].photo = compressedBase64;
                                localStorage.setItem('portfolio_olymps_v4', JSON.stringify(currentOlymps));
                                renderOlympsList();
                            });
                        }
                    };
                });

                // Удаление фото
                document.querySelectorAll('.del-photo-btn').forEach(btn => {
                    btn.onclick = (e) => {
                        const i = parseInt(e.target.dataset.idx);
                        currentOlymps[i].photo = "";
                        localStorage.setItem('portfolio_olymps_v4', JSON.stringify(currentOlymps));
                        renderOlympsList();
                    };
                });

                // Удаление всей карточки олимпиады
                document.querySelectorAll('.ach-remove-btn').forEach(btn => {
                    btn.onclick = (e) => {
                        const i = parseInt(e.target.dataset.del);
                        currentOlymps.splice(i, 1);
                        localStorage.setItem('portfolio_olymps_v4', JSON.stringify(currentOlymps));
                        renderOlympsList();
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
                    photo: ""
                });
                localStorage.setItem('portfolio_olymps_v4', JSON.stringify(currentOlymps));
                renderOlympsList();
            };

            // Чипы навыков
            const chipsContainer = document.getElementById('tech-chips');
            function renderChips() {
                chipsContainer.innerHTML = '';
                availableTech.forEach(tech => {
                    const isSelected = currentStack.includes(tech);
                    const chip = document.createElement('button');
                    chip.type = 'button';
                    chip.textContent = tech;
                    chip.style.cssText = `
                        padding: 4px 9px; border-radius: 14px; font-size: 11px; font-weight: 600; cursor: pointer;
                        border: 1px solid ${isSelected ? 'var(--accent-blue)' : 'var(--border-color)'};
                        background: ${isSelected ? 'rgba(59, 130, 246, 0.25)' : '#0b111c'};
                        color: ${isSelected ? '#fff' : 'var(--text-muted)'};
                    `;
                    chip.onclick = () => {
                        if (currentStack.includes(tech)) {
                            currentStack = currentStack.filter(t => t !== tech);
                        } else {
                            currentStack.push(tech);
                        }
                        localStorage.setItem('portfolio_stack_v4', JSON.stringify(currentStack));
                        renderChips();
                        drawRadarChart('skills-radar');
                    };
                    chipsContainer.appendChild(chip);
                });
            }

            renderChips();
            drawRadarChart('skills-radar');

            document.getElementById('save-btn').onclick = () => {
                localStorage.setItem('portfolio_name', document.getElementById('input-name').value);
                localStorage.setItem('portfolio_grade', document.getElementById('input-grade').value);
                localStorage.setItem('portfolio_school_history', document.getElementById('input-school-history').value);
                localStorage.setItem('portfolio_about_me', document.getElementById('input-about-me').value);
                localStorage.setItem('portfolio_olymps_v4', JSON.stringify(currentOlymps));

                const s = document.getElementById('save-status');
                s.style.display = 'block';
                setTimeout(() => s.style.display = 'none', 2000);
                drawRadarChart('skills-radar');
            };

            document.getElementById('demo-fill-btn').onclick = () => {
                localStorage.setItem('portfolio_name', 'Дубянский Артём');
                localStorage.setItem('portfolio_grade', '8 «Д»');
                localStorage.setItem('portfolio_track_v4', 'eng');
                localStorage.setItem('portfolio_school_history', 'ГБОУ Бауманская инженерная школа № 1580');
                localStorage.setItem('portfolio_about_me', 'Проектирование и 3D-печать узлов механизмов, схемотехника и пайка радиоэлектронных плат, разработка алгоритмических модулей на C++.');
                localStorage.setItem('portfolio_stack_v4', JSON.stringify(["Инженерия", "3D-моделирование (CAD)", "Схемотехника/Пайка", "Физика", "C++"]));
                localStorage.setItem('portfolio_olymps_v4', JSON.stringify([
                    { name: "Научно-практическая конференция «Инженеры будущего»", subject: "Технология (робототехника/машиностроение)", grade: "8", stage: "regional", status: "winner", photo: "" },
                    { name: "Всероссийская олимпиада школьников (ВсОШ)", subject: "Физика", grade: "8", stage: "municipal", status: "prizewinner", photo: "" }
                ]));
                renderTab('1');
            };

            document.getElementById('export-pure-btn').onclick = exportPurePortfolio;
            document.getElementById('export-report-btn').onclick = exportAdmissionReport;
            document.getElementById('print-full-btn').onclick = printPortfolioWithPhotos;

        } else if (tabIndex === '2') {
            const userStack = getSavedStack();

            contentCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                    <div>
                        <h2>Навигатор профильных школ и колледжей</h2>
                        <p style="margin-bottom: 0;">Расчёт совместимости алгоритмом на C++ (WebAssembly):</p>
                    </div>
                    <span style="font-size: 11px; padding: 4px 8px; border-radius: 8px; background: rgba(16, 185, 129, 0.15); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.35);">
                        ${wasmActive ? '● WASM C++ модуль запущен' : '● Резервный расчет'}
                    </span>
                </div>

                <div style="display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap;">
                    <input type="text" id="school-search" class="form-input" placeholder="Поиск (Бауманская, ВШЭ, Колледж...)" style="flex: 2; min-width: 170px;">
                    <select id="school-filter" class="form-select" style="flex: 1; min-width: 150px;">
                        <option value="all">Все направления</option>
                        <option value="eng">Инженерия и C++</option>
                        <option value="biz">Бизнес и Экономика</option>
                        <option value="craft">Прикладное мастерство и CAD</option>
                        <option value="it">IT и Разработка</option>
                    </select>
                </div>

                <div id="schools-list" style="display: flex; flex-direction: column; gap: 10px; max-height: 460px; overflow-y: auto;"></div>
            `;

            const container = document.getElementById('schools-list');
            const searchInput = document.getElementById('school-search');
            const filterSelect = document.getElementById('school-filter');

            function renderSchoolsList() {
                const query = searchInput.value.trim().toLowerCase();
                const filter = filterSelect.value;
                container.innerHTML = '';

                const ranked = schoolsData
                    .map(s => ({ ...s, matchScore: calculateMatch(s) }))
                    .filter(s => {
                        const matchesTrack = (filter === 'all') || (s.targetTrack === filter);
                        const matchesQuery = !query || s.name.toLowerCase().includes(query) || s.profile.toLowerCase().includes(query);
                        return matchesTrack && matchesQuery;
                    })
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
                            <p style="font-size: 12px; color: var(--accent-blue); margin-bottom: 4px;">${school.profile} • Проходной балл: ${school.minScore}</p>
                            <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px;">${school.description}</p>
                            <div>${badges}</div>
                        </div>
                        <div style="min-width: 58px; height: 58px; border-radius: 50%; border: 3px solid ${school.matchScore >= 80 ? 'var(--accent-blue)' : '#64748b'}; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(59, 130, 246, 0.1);">
                            <span style="font-size: 13px; font-weight: 700; color: #fff;">${school.matchScore}%</span>
                            <span style="font-size: 8px; color: var(--text-muted);">C++ WASM</span>
                        </div>
                    `;
                    container.appendChild(card);
                });
            }

            searchInput.oninput = renderSchoolsList;
            filterSelect.onchange = renderSchoolsList;
            renderSchoolsList();
        }
    }

    renderTab('1');
    buttons.forEach(btn => btn.onclick = () => renderTab(btn.getAttribute('data-tab')));
});
