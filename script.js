document.addEventListener('DOMContentLoaded', () => {
    // --- Seletores Globais (Existentes + Novos) ---
    const mainContent = document.getElementById('main-content');
    const sections = document.querySelectorAll('.section');
    const navButtons = document.querySelectorAll('.nav-button');
    const modal = document.getElementById('generic-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalFooter = document.getElementById('modal-footer');
    const headerInfo = document.getElementById('header-info');
    const searchInput = document.getElementById('search-input');
    const scheduleListContainer = document.getElementById('schedule-list');
    const schoolListContainer = document.getElementById('school-list');
    const classListContainer = document.getElementById('class-list');
    const classesSchoolName = document.getElementById('classes-school-name');
    const studentListContainer = document.getElementById('student-list-container'); // Usado extensivamente
    const classDetailsSection = document.getElementById('class-details-section');
    const classDetailsHeader = document.getElementById('class-details-header'); // Novo Header Sticky
    const classDetailsTitle = document.getElementById('class-details-title'); // Agora dentro do Header Sticky
    const backToSchoolsButton = document.getElementById('back-to-schools-button');
    const backToClassesButton = document.getElementById('back-to-classes-button'); // Agora dentro do Header Sticky
    const navClassesButton = document.getElementById('nav-classes-button');
    const navDetailsButton = document.getElementById('nav-details-button');
    const gradesTableContainer = document.getElementById('grades-table-container');
    const attendanceTableContainer = document.getElementById('attendance-table-container'); // Usado extensivamente
    const gradeSetSelect = document.getElementById('grade-set-select');
    const manageGradeStructureButton = document.getElementById('manage-grade-structure-button');
    const saveGradesButton = document.getElementById('save-grades-button');
    const exportGradesCsvButton = document.getElementById('export-grades-csv-button');
    const exportGradesPdfButton = document.getElementById('export-grades-pdf-button');
    const attendanceDateInput = document.getElementById('attendance-date');
    const saveAttendanceButton = document.getElementById('save-attendance-button');
    const viewMonthlyAttendanceButton = document.getElementById('view-monthly-attendance-button');
    const attendanceActionsContainer = document.getElementById('attendance-actions-container');
    const markAllPresentButton = document.getElementById('mark-all-present-button');
    const markNonSchoolDayButton = document.getElementById('mark-non-school-day-button');
    const lessonPlanDateInput = document.getElementById('lesson-plan-date');
    const lessonPlanTextarea = document.getElementById('lesson-plan-textarea');
    const saveLessonPlanButton = document.getElementById('save-lesson-plan-button');
    const classNotesDisplay = document.getElementById('class-notes-display');
    const classNotesContent = document.getElementById('class-notes-content');
    const classNotesEdit = document.getElementById('class-notes-edit');
    const classNotesTextarea = document.getElementById('class-notes-textarea');
    const editClassNotesButton = document.getElementById('edit-class-notes-button');
    const saveClassNotesButton = document.getElementById('save-class-notes-button');
    const cancelClassNotesButton = document.getElementById('cancel-class-notes-button');
    const addScheduleButton = document.getElementById('add-schedule-button');
    const addSchoolButton = document.getElementById('add-school-button');
    const addClassButton = document.getElementById('add-class-button');
    const copyPixButton = document.getElementById('copy-pix-button');
    const pixKeyTextElement = document.getElementById('pix-key-text');
    const notificationBanner = document.getElementById('notification-banner');
    const notificationMessage = document.getElementById('notification-message');
    const notificationCloseButton = document.getElementById('notification-close-button');
    const defaultNotificationSound = document.getElementById('notification-sound-default');
    const enableGlobalNotificationsCheckbox = document.getElementById('enable-global-notifications');
    const enableNotificationSoundCheckbox = document.getElementById('enable-notification-sound');
    const customNotificationSoundInput = document.getElementById('custom-notification-sound-input');
    const customSoundFilenameDisplay = document.getElementById('custom-sound-filename');
    const currentCustomSoundDisplay = document.getElementById('current-custom-sound-display');
    const currentCustomSoundName = document.getElementById('current-custom-sound-name');
    const removeCustomSoundButton = document.getElementById('remove-custom-sound-button');
    const editMapButton = document.getElementById('edit-map-button');
    const classroomContainerDisplay = document.getElementById('classroom-container-display');
    const classroomContainerEdit = document.getElementById('classroom-container-edit');
    const mapEditArea = document.getElementById('map-edit-area');
    const classroomMapEditControls = document.getElementById('classroom-map-edit-controls');
    const mapRowsInput = document.getElementById('map-rows-input');
    const mapColsInput = document.getElementById('map-cols-input');
    const teacherDeskPositionSelect = document.getElementById('teacher-desk-position-select');
    const unassignedStudentsContainer = document.getElementById('unassigned-students-container');
    const cancelMapEditButton = document.getElementById('cancel-map-edit-button');
    const saveMapButton = document.getElementById('save-map-button');
    const teacherDeskTemplate = document.getElementById('teacher-desk-template');
    const classroomGridTemplate = document.getElementById('classroom-grid-template');
    const toolsGrid = document.querySelector('#tools-section .tools-grid');
    const detailsHelpButton = document.getElementById('details-help-button'); // NOVO

    // --- Seletores da Calculadora ---
    const calculatorModal = document.getElementById('advanced-calculator-modal');
    const calculatorDisplay = document.getElementById('calculator-display');
    const standardCalcSection = document.getElementById('calculator-standard-section');
    const weightedCalcSection = document.getElementById('calculator-weighted-section');
    const calcModeStandardBtn = document.getElementById('calc-mode-standard');
    const calcModeWeightedBtn = document.getElementById('calc-mode-weighted');
    const calcButtonsContainer = document.querySelector('.calculator-buttons');
    const weightedGradeInput = document.getElementById('weighted-grade-input');
    const weightedWeightInput = document.getElementById('weighted-weight-input');
    const addPairButton = document.getElementById('add-pair-button');
    const weightedPairsList = document.getElementById('weighted-pairs-list');
    const calculateWeightedAvgButton = document.getElementById('calculate-weighted-avg-button');
    const weightedAverageResult = document.getElementById('weighted-average-result');


    const weekdays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const NOTIFICATION_LEAD_TIME_MINUTES = 5;
    const MAX_CUSTOM_SOUND_SIZE_MB = 2;
    let notificationCheckInterval = null;
    let shownNotificationsThisMinute = {};
    let draggedStudentId = null;
    let draggedElement = null;
    let tempClassroomLayout = null;
    let selectedSeatForAssignment = null;
    let currentStudentObservations = []; // NOVO: Para edição local de observações

    // Tool States
    let sorterStudentList = [];
    let sorterAvailableStudents = [];
    let sorterDrawnStudents = [];
    let stopwatchInterval = null;
    let stopwatchSeconds = 0;
    let isStopwatchRunning = false;

    // Calculator State
    let calculator = {
        displayValue: '0',
        firstOperand: null,
        waitingForSecondOperand: false,
        operator: null,
        mode: 'standard',
        weightedPairs: []
    };

    // Definição das chaves de armazenamento
    const DATA_STORAGE_KEY = 'superProfessorProData_v15';
    const OLD_DATA_STORAGE_KEY_V14 = 'superProfessorProData_v14';

    let appData = {
        schools: [], classes: [], students: [], schedule: [],
        settings: { theme: 'theme-light', globalNotificationsEnabled: true, notificationSoundEnabled: true, customNotificationSound: null }
    };
    let currentSchoolId = null; let currentClassId = null; let currentSection = 'schedule-section';

    // --- Funções de Estado e Persistência ---
    const saveAppState = () => { try { localStorage.setItem('lastSection', currentSection || 'schedule-section'); localStorage.setItem('lastSchoolId', currentSchoolId || ''); localStorage.setItem('lastClassId', currentClassId || ''); } catch (e) { console.error("Erro ao salvar estado:", e); } };
    const restoreAppState = () => { const lastSection = localStorage.getItem('lastSection'); const lastSchoolId = localStorage.getItem('lastSchoolId'); const lastClassId = localStorage.getItem('lastClassId'); console.log("Restoring App State:", {lastSection, lastSchoolId, lastClassId}); currentSection = 'schedule-section'; currentSchoolId = null; currentClassId = null; if (appData.schools.length > 0) { currentSchoolId = lastSchoolId || appData.schools[0].id; if (!findSchoolById(currentSchoolId)) { currentSchoolId = appData.schools[0]?.id || null; currentClassId = null; currentSection = currentSchoolId ? 'classes-section' : 'schools-section'; } else { currentClassId = lastClassId || null; if (currentClassId && !findClassById(currentClassId)) { currentClassId = null; } if (lastSection) { if (lastSection === 'class-details-section' && currentClassId && findClassById(currentClassId)) { currentSection = 'class-details-section'; } else if (lastSection === 'classes-section' && currentSchoolId) { currentSection = 'classes-section'; currentClassId = null; } else if (lastSection === 'schools-section') { currentSection = 'schools-section'; currentSchoolId = null; currentClassId = null; } else if (['schedule-section', 'tools-section', 'contact-section', 'settings-section'].includes(lastSection)){ const sectionExists = document.getElementById(lastSection); if(sectionExists) { currentSection = lastSection; if(['schedule-section', 'tools-section', 'contact-section', 'settings-section'].includes(lastSection)) { currentSchoolId = null; currentClassId = null; } } else { currentSection = currentSchoolId ? 'classes-section' : 'schools-section'; currentClassId = null; } } else { currentSection = currentSchoolId ? 'classes-section' : 'schools-section'; currentClassId = null; } } else { if (currentClassId) currentSection = 'class-details-section'; else if (currentSchoolId) currentSection = 'classes-section'; else currentSection = 'schools-section'; } } } else { currentSection = 'schedule-section'; } if(['contact-section', 'settings-section', 'tools-section'].includes(lastSection)){ currentSection = lastSection; } console.log(`Estado Final Restaurado: Section=${currentSection}, School=${currentSchoolId}, Class=${currentClassId}`); };

    // --- Funções Utilitárias ---
    const generateId = (prefix = 'id') => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const saveData = () => { try { localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(appData)); console.log(`Data saved (${DATA_STORAGE_KEY}).`); } catch (e) { console.error("Erro salvar:", e); if (e.name === 'QuotaExceededError') { alert("Erro: Não há espaço suficiente para salvar os dados. Isso pode ser devido a um arquivo de som personalizado muito grande."); } else { alert("Erro ao salvar dados."); } } };
    // loadData ATUALIZADO para incluir novas propriedades
    const loadData = () => {
        let dataToParse = localStorage.getItem(DATA_STORAGE_KEY);
        let importedVersion = 15;

        if (!dataToParse) {
            const dataV14 = localStorage.getItem(OLD_DATA_STORAGE_KEY_V14);
            if (dataV14) {
                console.log("Importing data from v14...");
                dataToParse = dataV14;
                importedVersion = 14;
            }
        }

        if (dataToParse) {
            try {
                appData = JSON.parse(dataToParse);
                // Verificações de estrutura e valores padrão
                appData.schools = appData.schools || [];
                appData.classes = appData.classes || [];
                appData.students = appData.students || [];
                appData.schedule = appData.schedule || [];
                appData.settings = appData.settings || {};
                appData.settings.theme = appData.settings.theme || 'theme-light';
                appData.settings.globalNotificationsEnabled = appData.settings.globalNotificationsEnabled !== undefined ? appData.settings.globalNotificationsEnabled : true;
                appData.settings.notificationSoundEnabled = appData.settings.notificationSoundEnabled !== undefined ? appData.settings.notificationSoundEnabled : true;
                appData.settings.customNotificationSound = appData.settings.customNotificationSound || null;

                // Aplica verificações e padrões para estruturas internas
                appData.classes.forEach(c => {
                    c.notes = c.notes || ''; c.schoolId = c.schoolId || null;
                    c.gradeStructure = c.gradeStructure || [];
                    c.gradeStructure.forEach(gs => { delete gs.periodType; if (gs.colorRanges === undefined) gs.colorRanges = []; });
                    c.lessonPlans = c.lessonPlans || {};
                    if (!c.classroomLayout) { c.classroomLayout = { rows: 5, cols: 6, teacherDeskPosition: 'top-center', seats: [] }; } else { c.classroomLayout.seats = c.classroomLayout.seats || []; const validPositions = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right', 'left-top', 'left-center', 'left-bottom', 'right-top', 'right-center', 'right-bottom']; if (!validPositions.includes(c.classroomLayout.teacherDeskPosition)) c.classroomLayout.teacherDeskPosition = 'top-center'; }
                    // NOVO: Inicializa IDs de representantes se não existirem
                    c.representativeId = c.representativeId || null;
                    c.viceRepresentativeId = c.viceRepresentativeId || null;
                 });
                appData.students.forEach(s => {
                    s.grades = s.grades || {}; s.attendance = s.attendance || {};
                    Object.keys(s.attendance).forEach(date => { const record = s.attendance[date]; if (record && typeof record === 'object') { record.status = record.status || null; record.justification = String(record.justification || ''); } else { s.attendance[date] = { status: null, justification: '' }; } });
                    // NOVO: Garante que notes seja um array e tenha a estrutura correta
                    s.notes = s.notes || []; if (typeof s.notes === 'string') { const oldNotes = s.notes.trim(); s.notes = oldNotes ? [{ date: 'N/A', text: oldNotes, category: 'Anotação' }] : []; } else if (!Array.isArray(s.notes)) { s.notes = []; }
                    s.notes = s.notes.map(note => ({ date: note?.date || 'N/A', text: note?.text || '', category: note?.category || 'Anotação', // Assume 'Anotação' como padrão
                        suspensionStartDate: note?.suspensionStartDate || null, // Inclui datas de suspensão
                        suspensionEndDate: note?.suspensionEndDate || null })).filter(note => note.text.trim());
                });
                appData.schedule.forEach(item => { if (item.notificationsEnabled === undefined) item.notificationsEnabled = true; });

                console.log(`Data loaded (from version ${importedVersion}):`, appData);

                if (importedVersion < 15) {
                    saveData();
                    localStorage.removeItem(OLD_DATA_STORAGE_KEY_V14);
                    console.log(`Migrated data saved as ${DATA_STORAGE_KEY}.`);
                }
                return true;
            } catch (e) {
                console.error("Erro ao carregar ou migrar dados:", e);
                appData = { schools: [], classes: [], students: [], schedule: [], settings: { theme: 'theme-light', globalNotificationsEnabled: true, notificationSoundEnabled: true, customNotificationSound: null } };
                localStorage.removeItem(OLD_DATA_STORAGE_KEY_V14);
                localStorage.removeItem(DATA_STORAGE_KEY);
                return false;
            }
        } else {
            appData = { schools: [], classes: [], students: [], schedule: [], settings: { theme: 'theme-light', globalNotificationsEnabled: true, notificationSoundEnabled: true, customNotificationSound: null } };
            return false;
        }
    };

    const applyTheme = (themeName) => { document.body.className = themeName || 'theme-light'; appData.settings.theme = themeName; document.querySelectorAll('.theme-button').forEach(btn => { btn.style.border = btn.dataset.theme === themeName ? '2px solid var(--accent-primary)' : 'none'; }); };
    const showSection = (sectionId) => { sections.forEach(section => section.classList.toggle('active', section.id === sectionId)); navButtons.forEach(button => button.classList.toggle('active', button.dataset.section === sectionId)); currentSection = sectionId; navClassesButton.disabled = !currentSchoolId; navDetailsButton.disabled = !currentClassId; updateHeaderInfo(); document.querySelectorAll('.fab-button').forEach(fab => fab.classList.add('hidden')); let fabToShow = null; if (sectionId === 'schedule-section') fabToShow = addScheduleButton; else if (sectionId === 'schools-section') fabToShow = addSchoolButton; else if (sectionId === 'classes-section') fabToShow = addClassButton; if (fabToShow) fabToShow.classList.remove('hidden'); mainContent.scrollTop = 0; saveAppState(); if(sectionId === 'settings-section') { updateNotificationSettingsUI(); updateCustomSoundUI(); } };
    const updateHeaderInfo = () => { let info = ''; if (currentSection === 'classes-section' && currentSchoolId) { const school = findSchoolById(currentSchoolId); info = `Escola: ${school?.name || '?'}`; } else if (currentSection === 'class-details-section' && currentClassId) { const classData = findClassById(currentClassId); const school = findSchoolById(classData?.schoolId); info = `Escola: ${school?.name || '?'} / Turma: ${classData?.name || '?'}`; } else if (currentSection === 'tools-section') { info = 'Ferramentas'; } headerInfo.textContent = info; headerInfo.title = info; };
    const showModal = (title, contentHtml, footerButtonsHtml = '', modalClass = '') => { modalTitle.textContent = title; modalBody.innerHTML = contentHtml; const defaultFooter = `<button type="button" data-dismiss="modal" class="secondary">Fechar</button>`; modalFooter.innerHTML = footerButtonsHtml ? footerButtonsHtml + defaultFooter : defaultFooter; modal.className = 'modal'; if (modalClass) modal.classList.add(modalClass); modal.classList.add('show'); modal.querySelectorAll('[data-dismiss="modal"], .close-button').forEach(btn => { const clonedBtn = btn.cloneNode(true); btn.parentNode.replaceChild(clonedBtn, btn); clonedBtn.addEventListener('click', hideModal); }); };
    const hideModal = () => { if (stopwatchInterval) { clearInterval(stopwatchInterval); stopwatchInterval = null; isStopwatchRunning = false; } modal.classList.remove('show'); calculatorModal?.classList.remove('show'); setTimeout(() => { modalTitle.textContent = ''; modalBody.innerHTML = ''; modalFooter.innerHTML = ''; modal.className = 'modal'; calculatorModal.className = 'modal calculator-modal'; }, 300); };
    const findSchoolById = (id) => appData.schools.find(s => s.id === id);
    const findClassById = (id) => appData.classes.find(c => c.id === id);
    const findStudentById = (id) => appData.students.find(s => s.id === id);
    const findScheduleById = (id) => appData.schedule.find(sch => sch.id === id);
    const getStudentsByClass = (classId) => appData.students.filter(s => s.classId === classId).sort((a, b) => (a.number || Infinity) - (b.number || Infinity)); // Ordena por número
    const formatDate = (dateString) => { if(!dateString || dateString === 'N/A') return 'Data Indef.'; try { const [y, m, d] = dateString.split('-'); return `${d}/${m}/${y}`; } catch { return dateString; } };
    const getCurrentDateString = () => new Date().toISOString().slice(0, 10);
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getDayOfWeek = (year, month, day) => new Date(year, month, day).getDay();
    const sanitizeHTML = (str) => { if (str === null || str === undefined) return ''; const temp = document.createElement('div'); temp.textContent = String(str); return temp.innerHTML; };
    function getContrastYIQ(hexcolor){ /* ... (mantido) ... */ if (!hexcolor || hexcolor.length < 4) return '#000000'; hexcolor = hexcolor.replace("#", ""); let r,g,b; if (hexcolor.length === 3) { r = parseInt(hexcolor.substr(0,1)+hexcolor.substr(0,1), 16); g = parseInt(hexcolor.substr(1,1)+hexcolor.substr(1,1), 16); b = parseInt(hexcolor.substr(2,1)+hexcolor.substr(2,1), 16); } else if (hexcolor.length === 6) { r = parseInt(hexcolor.substr(0,2), 16); g = parseInt(hexcolor.substr(2,2), 16); b = parseInt(hexcolor.substr(4,2), 16); } else { return '#000000'; } const yiq = ((r*299)+(g*587)+(b*114))/1000; return (yiq >= 128) ? '#000000' : '#FFFFFF'; }
    const getGradeBackgroundColor = (value, ranges) => { /* ... (mantido) ... */ if (value === null || value === undefined || !Array.isArray(ranges) || ranges.length === 0) { return null; } const numericValue = parseFloat(value); if (isNaN(numericValue)) { return null; } for (const range of ranges) { const min = parseFloat(range.min); const max = parseFloat(range.max); if (!isNaN(min) && !isNaN(max) && numericValue >= min && numericValue <= max) { return range.color; } } return null; };
    const applyGradeColor = (element, value, ranges) => { /* ... (mantido) ... */ const bgColor = getGradeBackgroundColor(value, ranges); if (bgColor) { element.style.backgroundColor = bgColor; element.style.color = getContrastYIQ(bgColor); } else { element.style.backgroundColor = ''; element.style.color = ''; } };
    const calculateSchoolQuorum = (schoolId, dateString, shiftFilter = "Geral") => { /* ... (mantido) ... */ const classesInSchool = appData.classes.filter(c => c.schoolId === schoolId); if (classesInSchool.length === 0) { return { present: 0, total: 0, percentage: 0, message: "Sem turmas" }; } const filteredClasses = shiftFilter === "Geral" ? classesInSchool : classesInSchool.filter(c => c.shift === shiftFilter); if (filteredClasses.length === 0 && shiftFilter !== "Geral") { return { present: 0, total: 0, percentage: 0, message: `Sem turmas (${shiftFilter})` }; } const filteredClassIds = new Set(filteredClasses.map(c => c.id)); const studentsInFilter = appData.students.filter(s => filteredClassIds.has(s.classId)); let presentCount = 0; let totalStudentsInFilter = studentsInFilter.length; if (totalStudentsInFilter === 0) { if(shiftFilter === "Geral" && classesInSchool.length > 0) { return { present: 0, total: 0, percentage: 0, message: "Sem alunos" }; } else if (shiftFilter !== "Geral") { return { present: 0, total: 0, percentage: 0, message: `Sem alunos (${shiftFilter})` }; } else { return { present: 0, total: 0, percentage: 0, message: "Sem alunos" }; } } studentsInFilter.forEach(student => { const attendanceRecord = student.attendance?.[dateString]; if (attendanceRecord?.status === 'P') { presentCount++; } }); const percentage = totalStudentsInFilter > 0 ? Math.round((presentCount / totalStudentsInFilter) * 100) : 0; return { present: presentCount, total: totalStudentsInFilter, percentage: percentage }; };

    // --- Funções de Renderização (Algumas Modificadas) ---
    const renderScheduleList = () => { /* ... (mantido como no original) ... */ scheduleListContainer.innerHTML = ''; if (appData.schedule.length === 0) { scheduleListContainer.innerHTML = '<p style="text-align: center; padding: 1rem;">Nenhum horário cadastrado.</p>'; return; } const scheduleByDay = {}; weekdays.forEach(day => scheduleByDay[day] = []); appData.schedule.forEach(item => { if (scheduleByDay[item.day]) scheduleByDay[item.day].push(item); }); for (const day in scheduleByDay) { scheduleByDay[day].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || '')); } const scheduleTemplate = document.getElementById('schedule-item-template'); weekdays.forEach(day => { if (scheduleByDay[day].length > 0) { const dayGroup = document.createElement('div'); dayGroup.classList.add('schedule-day-group'); const dayTitle = document.createElement('h3'); dayTitle.classList.add('schedule-day-title'); dayTitle.textContent = day; dayGroup.appendChild(dayTitle); scheduleByDay[day].forEach(item => { const clone = scheduleTemplate.content.cloneNode(true); const scheduleElement = clone.querySelector('.schedule-item'); scheduleElement.dataset.id = item.id; const school = findSchoolById(item.schoolId); scheduleElement.querySelector('.schedule-time').textContent = `${item.startTime || '?'} - ${item.endTime || '?'}`; scheduleElement.querySelector('.school-name').textContent = school ? sanitizeHTML(school.name) : 'Escola não encontrada'; scheduleElement.querySelector('.note').textContent = sanitizeHTML(item.note || ''); const notificationButton = clone.querySelector('.notification-toggle-button'); const notificationIndicator = clone.querySelector('.notification-indicator'); updateNotificationIcon(notificationIndicator, item.notificationsEnabled); notificationButton.addEventListener('click', (e) => { e.stopPropagation(); toggleScheduleNotification(item.id, notificationIndicator); }); clone.querySelector('.edit-schedule-button').addEventListener('click', (e) => { e.stopPropagation(); openScheduleModal(item.id); }); clone.querySelector('.delete-schedule-button').addEventListener('click', (e) => { e.stopPropagation(); if (confirm(`Excluir horário (${item.startTime} na ${school?.name || 'escola'})?`)) { deleteScheduleEntry(item.id); } }); dayGroup.appendChild(clone); }); scheduleListContainer.appendChild(dayGroup); } }); };
    const updateNotificationIcon = (indicatorElement, isEnabled) => { /* ... (mantido como no original) ... */ if (!indicatorElement) return; indicatorElement.classList.remove('icon-notificacao-on', 'icon-notificacao-off'); if (isEnabled) { indicatorElement.classList.add('icon-notificacao-on'); indicatorElement.parentElement.title = "Notificações Ativadas (Clique para desativar)"; } else { indicatorElement.classList.add('icon-notificacao-off'); indicatorElement.parentElement.title = "Notificações Desativadas (Clique para ativar)"; } };
    const renderSchoolList = () => { /* ... (mantido como no original, já usa quorum) ... */ schoolListContainer.innerHTML = ''; if (appData.schools.length === 0) { schoolListContainer.innerHTML = '<p style="text-align: center; padding: 1rem;">Nenhuma escola cadastrada.</p>'; return; } const template = document.getElementById('school-item-template'); const today = getCurrentDateString(); appData.schools.sort((a, b) => a.name.localeCompare(b.name)).forEach(school => { const clone = template.content.cloneNode(true); const item = clone.querySelector('.list-item'); item.dataset.id = school.id; item.querySelector('.school-name').textContent = sanitizeHTML(school.name); item.querySelector('.view-classes-button').addEventListener('click', (e) => { e.stopPropagation(); selectSchool(school.id); showSection('classes-section'); }); item.querySelector('.edit-school-button').addEventListener('click', (e) => { e.stopPropagation(); openSchoolModal(school.id); }); item.querySelector('.delete-school-button').addEventListener('click', (e) => { e.stopPropagation(); if (confirm(`Excluir escola "${sanitizeHTML(school.name)}" e TODOS os dados associados (turmas, alunos, etc.)?`)) { deleteSchool(school.id); } }); const quorumContainer = item.querySelector('.school-quorum-info'); const quorumDateInput = quorumContainer.querySelector('.quorum-date-input'); const quorumShiftSelect = quorumContainer.querySelector('.quorum-shift-select'); const quorumDisplay = quorumContainer.querySelector('.quorum-display'); const quorumDateLabel = quorumContainer.querySelector('label[for="quorum-date-input-ID_ESCOLA"]'); const uniqueId = `quorum-date-input-${school.id}`; if (quorumDateLabel) quorumDateLabel.setAttribute('for', uniqueId); if (quorumDateInput) { quorumDateInput.id = uniqueId; quorumDateInput.value = today; quorumDateInput.addEventListener('click', (e) => e.stopPropagation()); } if (quorumShiftSelect) { quorumShiftSelect.addEventListener('click', (e) => e.stopPropagation()); } const updateQuorumDisplay = () => { const selectedDate = quorumDateInput.value; const selectedShift = quorumShiftSelect.value; if (!selectedDate) { quorumDisplay.textContent = 'Data inválida'; quorumDisplay.classList.add('no-data'); quorumDisplay.title = 'Selecione uma data válida'; return; } const quorumData = calculateSchoolQuorum(school.id, selectedDate, selectedShift); quorumDisplay.classList.remove('no-data'); if (quorumData.message) { quorumDisplay.textContent = `(${quorumData.message})`; quorumDisplay.classList.add('no-data'); if (quorumData.message.includes('Sem turmas')) { quorumDisplay.title = `Não há turmas cadastradas para calcular o quórum (${selectedShift}) em ${formatDate(selectedDate)}`; } else if (quorumData.message.includes('Sem alunos')) { quorumDisplay.title = `Não há alunos cadastrados nas turmas para calcular o quórum (${selectedShift}) em ${formatDate(selectedDate)}`; } else { quorumDisplay.title = quorumData.message; } } else { quorumDisplay.textContent = `${quorumData.present}/${quorumData.total} (${quorumData.percentage}%)`; quorumDisplay.title = `${quorumData.present} de ${quorumData.total} alunos presentes (${selectedShift}) em ${formatDate(selectedDate)}`; } }; quorumDateInput.addEventListener('change', updateQuorumDisplay); quorumShiftSelect.addEventListener('change', updateQuorumDisplay); updateQuorumDisplay(); item.addEventListener('click', (e) => { if (!e.target.closest('.school-quorum-info, .list-item-actions')) { selectSchool(school.id); showSection('classes-section'); } }); schoolListContainer.appendChild(clone); }); };
    const renderClassList = (schoolId) => { /* ... (mantido como no original) ... */ classListContainer.innerHTML = ''; const school = findSchoolById(schoolId); classesSchoolName.textContent = school ? sanitizeHTML(school.name) : 'Selecione Escola'; if (!school) { classListContainer.innerHTML = '<p style="text-align: center; padding: 1rem;">Escola não encontrada.</p>'; return; } const classesInSchool = appData.classes.filter(c => c.schoolId === schoolId); if (classesInSchool.length === 0) { classListContainer.innerHTML = `<p style="text-align: center; padding: 1rem;">Nenhuma turma cadastrada para ${sanitizeHTML(school.name)}.</p>`; return; } const template = document.getElementById('class-item-template'); classesInSchool.sort((a, b) => a.name.localeCompare(b.name)).forEach(cls => { const clone = template.content.cloneNode(true); const item = clone.querySelector('.list-item'); item.dataset.id = cls.id; const itemInfo = item.querySelector('.item-info'); itemInfo.querySelector('.class-name').textContent = sanitizeHTML(cls.name); itemInfo.querySelector('.class-details').textContent = `${sanitizeHTML(cls.subject || 'Sem matéria')} - ${sanitizeHTML(cls.shift || 'Sem turno')} - ${sanitizeHTML(cls.schedule || 'Sem horário')}`; if(cls.id === currentClassId) item.classList.add('active'); const actions = item.querySelector('.list-item-actions'); actions.querySelector('.view-details-button').addEventListener('click', (e) => { e.stopPropagation(); selectClass(cls.id); showSection('class-details-section'); }); actions.querySelector('.edit-class-button').addEventListener('click', (e) => { e.stopPropagation(); openClassModal(cls.id); }); actions.querySelector('.delete-class-button').addEventListener('click', (e) => { e.stopPropagation(); if (confirm(`Excluir turma "${sanitizeHTML(cls.name)}" e TODOS os dados associados?`)) { deleteClass(cls.id); } }); item.addEventListener('click', () => { selectClass(cls.id); showSection('class-details-section'); }); classListContainer.appendChild(clone); }); };

    // renderStudentList ATUALIZADA para usar novo template e lógica
    const renderStudentList = (classId) => {
        studentListContainer.innerHTML = ''; // Limpa container
        const students = getStudentsByClass(classId);
        const cls = findClassById(classId);
        if (!cls) {
            studentListContainer.innerHTML = '<p>Erro: Turma não encontrada.</p>';
            return;
        }
        if (students.length === 0) {
            studentListContainer.innerHTML = '<p style="text-align: center; padding: 1rem;">Nenhum aluno nesta turma ainda.</p>';
            return;
        }

        const template = document.getElementById('student-list-item-template');
        students.forEach(std => {
            const clone = template.content.cloneNode(true);
            const item = clone.querySelector('.list-item');
            const mainRow = item.querySelector('.list-item-main-row');
            const hiddenActions = item.querySelector('.list-item-hidden-actions');
            item.dataset.id = std.id;

            // Preenche informações principais
            mainRow.querySelector('.student-number').textContent = `${std.number || '-'}.`;
            mainRow.querySelector('.student-name').textContent = sanitizeHTML(std.name);

            // Adiciona classes para representantes
            item.classList.toggle('representative', cls.representativeId === std.id);
            item.classList.toggle('vice-representative', cls.viceRepresentativeId === std.id);

            // Adiciona listener ao botão de expandir
            const expandButton = mainRow.querySelector('.expand-actions-button');
            expandButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Impede que o clique se propague para outros elementos
                toggleActions(item);
            });

            // Adiciona listeners aos botões de ação individuais
            const repBtn = hiddenActions.querySelector('.set-representative-button');
            const viceBtn = hiddenActions.querySelector('.set-vice-button');
            const notesBtn = hiddenActions.querySelector('.notes-student-button');
            const editBtn = hiddenActions.querySelector('.edit-student-button');
            const moveBtn = hiddenActions.querySelector('.move-student-button');
            const deleteBtn = hiddenActions.querySelector('.delete-student-button');

            // Atualiza tooltips dos botões de representante/vice
            repBtn.title = cls.representativeId === std.id ? "Remover Representante" : "Promover a Representante";
            viceBtn.title = cls.viceRepresentativeId === std.id ? "Remover Vice-Rep." : "Promover a Vice-Rep.";

            repBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleRepresentative(std.id); });
            viceBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleViceRepresentative(std.id); });
            notesBtn.addEventListener('click', (e) => { e.stopPropagation(); openStudentNotesModal(std.id); });
            editBtn.addEventListener('click', (e) => { e.stopPropagation(); openStudentModal(std.id); }); // Chama modal de edição
            moveBtn.addEventListener('click', (e) => { e.stopPropagation(); openMoveStudentModal(std.id); }); // Chama modal de mover
            deleteBtn.addEventListener('click', (e) => { e.stopPropagation(); if (confirm(`Excluir aluno "${sanitizeHTML(std.name)}"?`)) deleteStudent(std.id); });

            studentListContainer.appendChild(item);
        });
    };

    const renderGradeSets = (classId) => { /* ... (mantido como no original) ... */ gradeSetSelect.innerHTML = ''; const currentClass = findClassById(classId); if (!currentClass || !currentClass.gradeStructure || currentClass.gradeStructure.length === 0) { gradeSetSelect.innerHTML = '<option value="">Configure</option>'; gradesTableContainer.innerHTML = '<p style="padding: 1rem; text-align: center;">Configure a estrutura de notas clicando no ícone <span class="icon icon-estrutura"></span>.</p>'; saveGradesButton.classList.add('hidden'); manageGradeStructureButton.style.borderColor = 'var(--accent-warning)'; exportGradesCsvButton.classList.add('hidden'); exportGradesPdfButton.classList.add('hidden'); return; } manageGradeStructureButton.style.borderColor = 'transparent'; currentClass.gradeStructure.forEach(gs => { const option = document.createElement('option'); option.value = gs.id; option.textContent = sanitizeHTML(gs.name); gradeSetSelect.appendChild(option); }); if (getStudentsByClass(classId).length > 0) { renderGradesTable(classId, gradeSetSelect.value); } else { gradesTableContainer.innerHTML = '<p style="padding: 1rem; text-align: center;">Adicione alunos para registrar notas.</p>'; saveGradesButton.classList.add('hidden'); exportGradesCsvButton.classList.add('hidden'); exportGradesPdfButton.classList.add('hidden'); } };
    const renderGradesTable = (classId, gradeSetId) => { /* ... (mantido como no original) ... */ gradesTableContainer.innerHTML = ''; const currentClass = findClassById(classId); const gradeSet = currentClass?.gradeStructure?.find(gs => gs.id === gradeSetId); const studentsInClass = getStudentsByClass(classId); const colorRanges = gradeSet?.colorRanges || []; if (!gradeSet || studentsInClass.length === 0) { gradesTableContainer.innerHTML = `<p style="padding: 1rem; text-align: center;">${!gradeSet ? 'Selecione um conjunto de notas válido.' : 'Nenhum aluno para exibir notas.'}</p>`; saveGradesButton.classList.add('hidden'); if(exportGradesCsvButton) exportGradesCsvButton.classList.add('hidden'); if(exportGradesPdfButton) exportGradesPdfButton.classList.add('hidden'); return; } saveGradesButton.classList.remove('hidden'); if(exportGradesCsvButton) exportGradesCsvButton.classList.remove('hidden'); if(exportGradesPdfButton) exportGradesPdfButton.classList.remove('hidden'); const table = document.createElement('table'); table.classList.add('data-table'); const thead = table.createTHead(); const tbody = table.createTBody(); const headerRow = thead.insertRow(); const headerTemplate = document.getElementById('grades-header-template'); const headerContent = headerTemplate.content.cloneNode(true); headerRow.appendChild(headerContent.querySelector('.student-col').cloneNode(true)); gradeSet.gradeLabels.forEach(label => { const th = document.createElement('th'); th.classList.add('grade-col'); th.textContent = sanitizeHTML(label); headerRow.appendChild(th); }); headerRow.appendChild(headerContent.querySelector('.sum-col').cloneNode(true)); headerRow.appendChild(headerContent.querySelector('.avg-col').cloneNode(true)); const rowTemplate = document.getElementById('grades-row-template'); studentsInClass.forEach(std => { const clone = rowTemplate.content.cloneNode(true); const row = clone.querySelector('tr'); row.dataset.studentId = std.id; const studentCol = row.querySelector('.student-col'); if(studentCol) { studentCol.querySelector('.student-number').textContent = std.number ? `${std.number}.` : '-.'; studentCol.querySelector('.student-name').textContent = sanitizeHTML(std.name); } const sumCellTemplate = row.querySelector('.sum'); const avgCellTemplate = row.querySelector('.average'); if(sumCellTemplate) sumCellTemplate.remove(); if(avgCellTemplate) avgCellTemplate.remove(); const studentGradesForSet = std.grades[gradeSetId] || {}; const fragment = document.createDocumentFragment(); gradeSet.gradeLabels.forEach(label => { const td = document.createElement('td'); td.classList.add('grade-col'); const input = document.createElement('input'); input.type = 'number'; input.classList.add('grade-input'); input.dataset.label = label; input.min = "0"; input.max = "100"; input.step = "0.1"; input.placeholder = sanitizeHTML(label); const gradeValue = studentGradesForSet[label] ?? ''; input.value = gradeValue; applyGradeColor(input, gradeValue, colorRanges); input.addEventListener('input', (e) => { applyGradeColor(e.target, e.target.value, colorRanges); calculateAndUpdateSumAndAverage(row, gradeSet.gradeLabels, colorRanges); }); td.appendChild(input); fragment.appendChild(td); }); studentCol.after(fragment); if(sumCellTemplate) row.appendChild(sumCellTemplate); if(avgCellTemplate) row.appendChild(avgCellTemplate); calculateAndUpdateSumAndAverage(row, gradeSet.gradeLabels, colorRanges); tbody.appendChild(row); }); gradesTableContainer.appendChild(table); };
    const calculateAndUpdateSumAndAverage = (tableRow, gradeLabels, colorRanges) => { /* ... (mantido como no original) ... */ let sum = 0; let count = 0; gradeLabels.forEach(label => { const input = tableRow.querySelector(`input[data-label="${label}"]`); const value = parseFloat(input?.value); if (!isNaN(value)) { sum += value; count++; } }); const sumCell = tableRow.querySelector('.sum'); const avgCell = tableRow.querySelector('.average'); if (sumCell) { sumCell.textContent = count > 0 ? sum.toFixed(1) : '--'; } if (avgCell) { const avg = count > 0 ? (sum / count) : null; avgCell.textContent = avg !== null ? avg.toFixed(1) : '--'; if (colorRanges && colorRanges.length > 0) { applyGradeColor(avgCell, avg, colorRanges); avgCell.classList.remove('grade-low', 'grade-medium', 'grade-high'); } else { avgCell.style.backgroundColor = ''; avgCell.style.color = ''; avgCell.classList.remove('grade-low', 'grade-medium', 'grade-high'); if(avg !== null) { if (avg < 5) avgCell.classList.add('grade-low'); else if (avg < 7) avgCell.classList.add('grade-medium'); else avgCell.classList.add('grade-high'); } } } };
    const calculateSumAndAverageForData = (gradesObject) => { /* ... (mantido como no original) ... */ let sum = 0; let count = 0; let average = null; if (gradesObject) { for(const label in gradesObject) { if (label !== 'average' && label !== 'sum') { const value = parseFloat(gradesObject[label]); if (!isNaN(value)) { sum += value; count++; } } } } if (count > 0) { average = parseFloat((sum / count).toFixed(1)); sum = parseFloat(sum.toFixed(1)); } else { sum = null; } return { sum: sum, average: average }; };

    // renderAttendanceTable ATUALIZADA para lidar com suspensão
    const renderAttendanceTable = (classId, date) => {
        attendanceTableContainer.innerHTML = '';
        saveAttendanceButton.classList.add('hidden');
        attendanceActionsContainer.classList.add('hidden'); // Esconde botões de ação por padrão

        const studentsInClass = getStudentsByClass(classId);
        if (!date) {
            attendanceTableContainer.innerHTML = '<p style="padding: 1rem; text-align: center;">Selecione uma data.</p>';
            return;
        }
        if (studentsInClass.length === 0) {
            attendanceTableContainer.innerHTML = '<p style="padding: 1rem; text-align: center;">Nenhum aluno para registrar presença.</p>';
            return;
        }

        // Mostra botões de ação e botão salvar se houver alunos e data
        attendanceActionsContainer.classList.remove('hidden');
        saveAttendanceButton.classList.remove('hidden');

        const table = document.createElement('table');
        table.classList.add('data-table');
        table.innerHTML = `<thead><tr><th class="student-col">Aluno</th><th class="attendance-status">Status</th></tr></thead><tbody></tbody>`;
        const tbody = table.querySelector('tbody');
        const template = document.getElementById('attendance-row-template');

        studentsInClass.forEach(std => {
            const studentId = std.id;
            const clone = template.content.cloneNode(true);
            const row = clone.querySelector('tr');
            row.dataset.studentId = studentId;

            const studentCol = row.querySelector('.student-col');
            studentCol.querySelector('.student-number').textContent = std.number ? `${std.number}.` : '-.';
            studentCol.querySelector('.student-name').textContent = sanitizeHTML(std.name);

            const statusCell = row.querySelector('.attendance-status');
            statusCell.innerHTML = ''; // Limpa a célula

            const activeSuspension = isStudentSuspendedOnDate(studentId, date);
            const attendanceRecord = std.attendance[date] || { status: null, justification: '' };

            if (activeSuspension) {
                // Encontra o índice da nota de suspensão ativa
                const student = findStudentById(studentId);
                const noteIndex = student?.notes?.findIndex(note => note === activeSuspension) ?? -1;

                row.classList.add('suspended-student', 'clickable-suspended');
                if (noteIndex !== -1) {
                    row.dataset.suspensionNoteIndex = noteIndex; // Armazena o índice da nota
                }
                statusCell.innerHTML = `<span class="suspended-indicator">🚫 Susp.</span>`;
                // Listener adicionado globalmente na tabela para .clickable-suspended
            } else {
                // Aluno não suspenso, renderiza botões P/F/FJ
                row.classList.remove('suspended-student', 'clickable-suspended');
                row.removeAttribute('data-suspension-note-index');

                const currentStatus = attendanceRecord.status;
                const currentJustification = attendanceRecord.justification || '';
                statusCell.innerHTML = `
                    <button type="button" class="attendance-toggle present"><span class="icon icon-presenca"></span> P</button>
                    <button type="button" class="attendance-toggle absent"><span class="icon icon-falta"></span> F</button>
                `;
                const presentButton = statusCell.querySelector('.attendance-toggle.present');
                const absentButton = statusCell.querySelector('.attendance-toggle.absent');

                const updateButtonUI = (status, justification) => {
                    presentButton.classList.toggle('selected', status === 'P');
                    absentButton.classList.toggle('selected', status === 'F');
                    absentButton.classList.toggle('justified', status === 'F' && !!justification);
                    const isJustified = status === 'F' && !!justification;
                    absentButton.innerHTML = `<span class="icon icon-falta"></span> ${isJustified ? 'FJ' : 'F'}`;
                    absentButton.title = isJustified ? `Falta Justificada: ${sanitizeHTML(justification.substring(0, 30))}... (Clique para editar)` : 'Faltou (Clique para justificar)';
                };

                updateButtonUI(currentStatus, currentJustification);

                presentButton.addEventListener('click', () => updateAttendanceStatus(studentId, date, 'P'));
                absentButton.addEventListener('click', () => {
                    // Se já for falta (justificada ou não), abre modal. Senão, marca como falta.
                    if (attendanceRecord.status === 'F') {
                        openJustificationModal(studentId, date);
                    } else {
                        updateAttendanceStatus(studentId, date, 'F');
                    }
                });
            }
            tbody.appendChild(row);
        });
        attendanceTableContainer.appendChild(table);
    };

    const renderLessonPlan = (classId, date) => { /* ... (mantido como no original) ... */ const currentClass = findClassById(classId); if (!currentClass || !date || !lessonPlanTextarea) { if(lessonPlanTextarea) lessonPlanTextarea.value = ''; if(saveLessonPlanButton) saveLessonPlanButton.classList.add('hidden'); return; } currentClass.lessonPlans = currentClass.lessonPlans || {}; const plan = currentClass.lessonPlans[date] || ''; lessonPlanTextarea.value = plan; saveLessonPlanButton.classList.remove('hidden'); };
    const renderClassroomMap = (classId, isEditing = false) => { /* ... (mantido como no original) ... */ const cls = findClassById(classId); if (!cls) { console.error("Class not found for map:", classId); classroomContainerDisplay.innerHTML = '<p style="padding: 1rem; text-align: center; grid-column: 1 / -1; grid-row: 1 / -1;">Erro: Turma não encontrada.</p>'; classroomContainerEdit.innerHTML = ''; mapEditArea.classList.add('hidden'); return; } const layout = cls.classroomLayout || { rows: 5, cols: 6, teacherDeskPosition: 'top-center', seats: [] }; const currentLayoutData = isEditing ? tempClassroomLayout : layout; const students = getStudentsByClass(classId); const container = isEditing ? classroomContainerEdit : classroomContainerDisplay; container.innerHTML = ''; const teacherDeskClone = teacherDeskTemplate.content.cloneNode(true); const teacherDeskElement = teacherDeskClone.querySelector('.teacher-desk'); const gridClone = classroomGridTemplate.content.cloneNode(true); const gridContainerElement = gridClone.querySelector('.classroom-map-grid'); teacherDeskElement.className = 'teacher-desk'; teacherDeskElement.classList.add(`position-${currentLayoutData.teacherDeskPosition}`); gridContainerElement.style.gridTemplateColumns = `repeat(${currentLayoutData.cols}, auto)`; container.appendChild(teacherDeskElement); container.appendChild(gridContainerElement); const seatTemplate = document.getElementById('seat-template'); const emptySeatPlaceholder = "Toque/Arraste Aluno"; if (isEditing) clearSeatSelection(); if (currentLayoutData.rows > 0 && currentLayoutData.cols > 0) { for (let r = 1; r <= currentLayoutData.rows; r++) { for (let c = 1; c <= currentLayoutData.cols; c++) { const seatData = currentLayoutData.seats.find(s => s.row === r && s.col === c); const studentId = seatData?.studentId; const student = studentId ? findStudentById(studentId) : null; const seatClone = seatTemplate.content.cloneNode(true); const seatElement = seatClone.querySelector('.seat'); seatElement.dataset.row = r; seatElement.dataset.col = c; const numberSpan = seatElement.querySelector('.seat-student-number'); const nameSpan = seatElement.querySelector('.seat-student-name'); const placeholderSpan = seatElement.querySelector('.seat-placeholder-text'); numberSpan.textContent = ''; nameSpan.textContent = ''; placeholderSpan.textContent = ''; placeholderSpan.classList.remove('seat-placeholder-text'); seatElement.classList.remove('occupied', 'empty', 'selected-for-assignment'); seatElement.removeAttribute('data-student-id'); seatElement.setAttribute('draggable', 'false'); if (student) { seatElement.classList.add('occupied'); seatElement.dataset.studentId = student.id; numberSpan.textContent = student.number ? `${student.number}.` : ''; nameSpan.textContent = sanitizeHTML(student.name); if (isEditing) { seatElement.setAttribute('draggable', 'true'); seatElement.addEventListener('dragstart', handleSeatDragStart); seatElement.addEventListener('click', handleOccupiedSeatClick); seatElement.style.cursor = 'grab'; } else { seatElement.style.cursor = 'default'; } } else { seatElement.classList.add('empty'); if (isEditing) { seatElement.addEventListener('click', handleSeatClickForAssignment); placeholderSpan.textContent = emptySeatPlaceholder; placeholderSpan.classList.add('seat-placeholder-text'); seatElement.style.cursor = 'pointer'; } else { seatElement.style.cursor = 'default'; } } if (isEditing) { seatElement.addEventListener('dragover', handleDragOver); seatElement.addEventListener('dragleave', handleDragLeave); seatElement.addEventListener('drop', handleDropOnSeat); } gridContainerElement.appendChild(seatElement); } } } else if (!isEditing) { gridContainerElement.innerHTML = '<p style="padding: 1rem; text-align: center; grid-column: 1 / -1;">Configure o mapa clicando no botão <span class="icon icon-editar"></span>.</p>'; } else { gridContainerElement.innerHTML = '<p style="padding: 1rem; text-align: center; grid-column: 1 / -1;">Dimensões inválidas (0 fileiras ou colunas).</p>'; } if (isEditing) { renderUnassignedStudents(classId); } classroomContainerDisplay.classList.toggle('hidden', isEditing); mapEditArea.classList.toggle('hidden', !isEditing); };
    const renderUnassignedStudents = (classId) => { /* ... (mantido como no original) ... */ if (!tempClassroomLayout) return; const allStudents = getStudentsByClass(classId); const assignedStudentIds = new Set(tempClassroomLayout.seats.map(s => s.studentId).filter(id => id)); unassignedStudentsContainer.innerHTML = '<h5>Alunos sem lugar (Clique aqui após selecionar mesa vazia)</h5>'; const studentTemplate = document.getElementById('draggable-student-template'); allStudents.forEach(student => { if (!assignedStudentIds.has(student.id)) { const clone = studentTemplate.content.cloneNode(true); const studentDiv = clone.querySelector('.draggable-student'); studentDiv.dataset.studentId = student.id; studentDiv.querySelector('.student-number').textContent = student.number ? `${student.number}.` : ''; studentDiv.querySelector('.student-name').textContent = sanitizeHTML(student.name); const oldNode = studentDiv; studentDiv.replaceWith(oldNode.cloneNode(true)); const newNode = unassignedStudentsContainer.appendChild(oldNode); newNode.addEventListener('dragstart', handleStudentListDragStart); newNode.addEventListener('click', handleUnassignedStudentClickForAssignment); } }); };
    const renderMonthlyAttendanceData = (classId, year, month) => { /* ... (mantido como no original) ... */ const students = getStudentsByClass(classId); const currentModal = document.querySelector('#generic-modal.show.monthly-attendance-modal'); if (!currentModal) return; const tableWrapper = currentModal.querySelector('#monthly-attendance-table-wrapper'); const summaryContainer = currentModal.querySelector('#monthly-attendance-summary'); const chartContainer = currentModal.querySelector('#monthly-attendance-chart-container'); const exportCsvBtn = currentModal.querySelector('#export-attendance-csv-button'); const exportPdfBtn = currentModal.querySelector('#export-attendance-pdf-button'); if (!tableWrapper || !summaryContainer || !chartContainer) { console.error("Um ou mais elementos do modal mensal não encontrados."); return; } tableWrapper.innerHTML = ''; summaryContainer.innerHTML = ''; chartContainer.innerHTML = ''; if (students.length === 0) { tableWrapper.innerHTML = '<p style="text-align:center; padding: 1rem;">Nenhum aluno nesta turma.</p>'; if (exportCsvBtn) exportCsvBtn.classList.add('hidden'); if (exportPdfBtn) exportPdfBtn.classList.add('hidden'); chartContainer.classList.add('hidden'); return; } if (exportCsvBtn) exportCsvBtn.classList.remove('hidden'); if (exportPdfBtn) exportPdfBtn.classList.remove('hidden'); chartContainer.classList.remove('hidden'); const daysInMonth = getDaysInMonth(year, month); const table = document.createElement('table'); table.classList.add('monthly-attendance-table'); const thead = table.createTHead(); const tbody = table.createTBody(); const headerRow = thead.insertRow(); headerRow.innerHTML = `<th class="student-col-monthly">Aluno</th>`; for (let day = 1; day <= daysInMonth; day++) { headerRow.innerHTML += `<th>${day}</th>`; } headerRow.innerHTML += `<th class="freq-col-monthly">% Freq.</th>`; let totalClassP = 0; let totalClassPossibleAttendances = 0; const studentFrequencies = []; students.forEach(student => { const row = tbody.insertRow(); row.innerHTML = `<td class="student-col-monthly"><span class="student-number">${student.number || '-'}.</span> ${sanitizeHTML(student.name)}</td>`; let studentP = 0; let studentPossibleDays = 0; for (let day = 1; day <= daysInMonth; day++) { const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`; const attendanceRecord = student.attendance[dateStr]; const status = attendanceRecord?.status; const justification = attendanceRecord?.justification || ''; const dayOfWeek = getDayOfWeek(year, month, day); const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; let cellContent = '-'; let cellClass = ''; if (isWeekend) { cellClass = 'weekend'; cellContent = ''; } else if (status === 'H') { cellClass = 'status-H'; cellContent = 'H'; } else { studentPossibleDays++; totalClassPossibleAttendances++; if (status === 'P') { cellContent = 'P'; cellClass = 'status-P'; studentP++; totalClassP++; } else if (status === 'F') { cellClass = justification ? 'status-FJ' : 'status-F'; cellContent = justification ? 'FJ' : 'F'; } else { cellContent = '-'; } } row.innerHTML += `<td class="${cellClass}">${cellContent}</td>`; } const frequencyPercent = studentPossibleDays > 0 ? Math.round((studentP / studentPossibleDays) * 100) : 0; const frequencyText = studentPossibleDays > 0 ? frequencyPercent + '%' : '--'; row.innerHTML += `<td class="freq-col-monthly">${frequencyText}</td>`; studentFrequencies.push({ name: student.name, number: student.number, freq: frequencyPercent }); }); tableWrapper.appendChild(table); const classFrequency = totalClassPossibleAttendances > 0 ? ((totalClassP / totalClassPossibleAttendances) * 100).toFixed(0) + '%' : '--'; summaryContainer.textContent = `Frequência Média da Turma (dias letivos): ${classFrequency}`; renderMonthlyAttendanceChart(studentFrequencies); };
    const renderMonthlyAttendanceChart = (frequencies) => { /* ... (mantido como no original) ... */ const currentModal = document.querySelector('#generic-modal.show.monthly-attendance-modal'); const chartContainer = currentModal?.querySelector('#monthly-attendance-chart-container'); if (!chartContainer) return; chartContainer.innerHTML = ''; if (frequencies.length === 0) { return; } const maxFreq = 100; const chartHeight = 100; frequencies.forEach(item => { const barContainer = document.createElement('div'); barContainer.classList.add('chart-bar-container'); const bar = document.createElement('div'); bar.classList.add('chart-bar'); const barHeightValue = (item.freq / maxFreq) * chartHeight; bar.style.height = `${barHeightValue}px`; bar.style.backgroundColor = item.freq >= 70 ? 'var(--accent-success)' : item.freq >= 50 ? 'var(--accent-warning)' : 'var(--accent-danger)'; bar.dataset.percentage = `${item.freq}%`; const label = document.createElement('div'); label.classList.add('chart-label'); label.textContent = item.number ? `${item.number}.` : ''; label.title = sanitizeHTML(item.name); barContainer.appendChild(bar); barContainer.appendChild(label); chartContainer.appendChild(barContainer); }); };

    // --- Funções de CRUD (Mantidas, saveClass/saveStudent atualizadas para novas props) ---
    const openScheduleModal = (scheduleIdToEdit = null) => { /* ... (mantido como no original) ... */ const isEditing = scheduleIdToEdit !== null; const scheduleData = isEditing ? findScheduleById(scheduleIdToEdit) : { day: weekdays[new Date().getDay()], notificationsEnabled: true }; const title = isEditing ? 'Editar Horário' : 'Novo Horário'; let schoolOptions = '<option value="">-- Selecione --</option>'; appData.schools.sort((a, b) => a.name.localeCompare(b.name)).forEach(s => { schoolOptions += `<option value="${s.id}" ${scheduleData.schoolId === s.id ? 'selected' : ''}>${sanitizeHTML(s.name)}</option>`; }); let dayOptions = ''; weekdays.slice(1, 6).forEach(day => { dayOptions += `<option value="${day}" ${scheduleData.day === day ? 'selected' : ''}>${day}</option>`; }); if (weekdays.includes(scheduleData.day) && !weekdays.slice(1, 6).includes(scheduleData.day)) { dayOptions += `<option value="${scheduleData.day}" selected>${scheduleData.day}</option>`; } if (!weekdays.includes(scheduleData.day)) { dayOptions += `<option value="Sábado" ${scheduleData.day === 'Sábado' ? 'selected' : ''}>Sábado</option>`; dayOptions += `<option value="Domingo" ${scheduleData.day === 'Domingo' ? 'selected' : ''}>Domingo</option>`; } const modalContent = ` <form id="schedule-form"> <input type="hidden" id="schedule-id" value="${isEditing ? scheduleIdToEdit : ''}"> <div class="form-group"> <label for="schedule-day">Dia:</label> <select id="schedule-day" required>${dayOptions}</select> </div> <div class="form-group d-flex"> <div style="flex: 1; margin-right: 5px;"> <label for="schedule-start-time">Início:</label> <input type="time" id="schedule-start-time" required value="${scheduleData.startTime || ''}"> </div> <div style="flex: 1; margin-left: 5px;"> <label for="schedule-end-time">Fim:</label> <input type="time" id="schedule-end-time" required value="${scheduleData.endTime || ''}"> </div> </div> <div class="form-group"> <label for="schedule-school">Escola:</label> <select id="schedule-school" required>${schoolOptions}</select> </div> <div class="form-group"> <label for="schedule-note">Anotação:</label> <input type="text" id="schedule-note" placeholder="Ex: Aula Turma 8B" value="${sanitizeHTML(scheduleData.note || '')}"> </div> <div class="checkbox-group"> <input type="checkbox" id="enable-schedule-notification" ${scheduleData.notificationsEnabled ? 'checked' : ''}> <label for="enable-schedule-notification">Ativar Notificações para este Horário</label> </div> </form> `; const footerButtons = `<button type="button" id="save-schedule-button" class="success"><span class="icon icon-salvar"></span> Salvar</button>`; showModal(title, modalContent, footerButtons); document.getElementById('save-schedule-button').addEventListener('click', saveScheduleEntry); };
    const saveScheduleEntry = () => { /* ... (mantido como no original) ... */ const form = document.getElementById('schedule-form'); if (!form || !form.checkValidity()) { alert('Preencha os campos obrigatórios (Dia, Horários, Escola).'); form?.reportValidity(); return; } const id = document.getElementById('schedule-id').value; const newData = { id: id || generateId('sch'), day: document.getElementById('schedule-day').value, startTime: document.getElementById('schedule-start-time').value, endTime: document.getElementById('schedule-end-time').value, schoolId: document.getElementById('schedule-school').value, note: document.getElementById('schedule-note').value.trim(), notificationsEnabled: document.getElementById('enable-schedule-notification').checked }; if (!newData.schoolId) { alert('Selecione uma escola.'); return; } if (id) { const index = appData.schedule.findIndex(item => item.id === id); if (index > -1) appData.schedule[index] = newData; } else { appData.schedule.push(newData); } saveData(); renderScheduleList(); hideModal(); };
    const deleteScheduleEntry = (id) => { /* ... (mantido como no original) ... */ appData.schedule = appData.schedule.filter(item => item.id !== id); saveData(); renderScheduleList(); };
    const toggleScheduleNotification = (scheduleId, indicatorElement) => { /* ... (mantido como no original) ... */ const item = findScheduleById(scheduleId); if (item) { item.notificationsEnabled = !item.notificationsEnabled; saveData(); updateNotificationIcon(indicatorElement, item.notificationsEnabled); console.log(`Notification for ${scheduleId} set to: ${item.notificationsEnabled}`); } };
    const openSchoolModal = (schoolIdToEdit = null) => { /* ... (mantido como no original) ... */ const isEditing = schoolIdToEdit !== null; const schoolData = isEditing ? findSchoolById(schoolIdToEdit) : {}; const title = isEditing ? 'Editar Escola' : 'Nova Escola'; const modalContent = `<form id="school-form"><input type="hidden" id="school-id" value="${isEditing ? schoolIdToEdit : ''}"><div class="form-group"><label for="school-name">Nome:</label><input type="text" id="school-name" required value="${sanitizeHTML(schoolData.name || '')}"></div></form>`; const footerButtons = `<button type="button" id="save-school-button" class="success"><span class="icon icon-salvar"></span> Salvar</button>`; showModal(title, modalContent, footerButtons); document.getElementById('save-school-button').addEventListener('click', saveSchool); };
    const saveSchool = () => { /* ... (mantido como no original) ... */ const form = document.getElementById('school-form'); if (!form || !form.checkValidity()) { alert('Preencha o nome da escola.'); form?.reportValidity(); return; } const id = document.getElementById('school-id').value; const newSchoolData = { id: id || generateId('sch'), name: document.getElementById('school-name').value.trim() }; if (id) { const index = appData.schools.findIndex(s => s.id === id); if (index > -1) appData.schools[index] = newSchoolData; } else { appData.schools.push(newSchoolData); } saveData(); renderSchoolList(); if(currentSection === 'schedule-section') renderScheduleList(); hideModal(); };
    const deleteSchool = (id) => { /* ... (mantido como no original) ... */ const classesToDelete = appData.classes.filter(c => c.schoolId === id).map(c => c.id); appData.schools = appData.schools.filter(s => s.id !== id); appData.classes = appData.classes.filter(c => c.schoolId !== id); appData.students = appData.students.filter(s => !classesToDelete.includes(s.classId)); appData.schedule = appData.schedule.filter(sch => sch.schoolId !== id); if (currentSchoolId === id) { currentSchoolId = null; currentClassId = null; showSection('schools-section'); } saveData(); renderSchoolList(); if (currentSection === 'schedule-section') renderScheduleList(); if (currentSection === 'classes-section' && !currentSchoolId) { showSection('schools-section'); } else if (currentSection === 'classes-section') { renderClassList(currentSchoolId); } saveAppState(); };
    const selectSchool = (id) => { /* ... (mantido como no original) ... */ currentSchoolId = id; currentClassId = null; renderClassList(id); navClassesButton.disabled = false; navDetailsButton.disabled = true; updateHeaderInfo(); saveAppState(); };
    const openClassModal = (classIdToEdit = null) => { /* ... (mantido como no original) ... */ if (!currentSchoolId) return; const isEditing = classIdToEdit !== null; const classData = isEditing ? findClassById(classIdToEdit) : {}; const title = isEditing ? 'Editar Turma' : 'Nova Turma'; const schoolName = findSchoolById(currentSchoolId)?.name || '?'; const modalContent = `<form id="class-form"><input type="hidden" id="class-id" value="${isEditing ? classIdToEdit : ''}"><p class="mb-1"><strong>Escola:</strong> ${sanitizeHTML(schoolName)}</p><div class="form-group"><label for="class-name">Nome Turma:</label><input type="text" id="class-name" required value="${sanitizeHTML(classData.name || '')}"></div><div class="form-group"><label for="class-subject">Matéria:</label><input type="text" id="class-subject" value="${sanitizeHTML(classData.subject || '')}"></div><div class="form-group d-flex"><div style="flex: 1; margin-right: 5px;"><label for="class-schedule">Horário:</label><input type="time" id="class-schedule" value="${classData.schedule || ''}"></div><div style="flex: 1; margin-left: 5px;"><label for="class-shift">Turno:</label><select id="class-shift"><option value="">--</option><option value="Manhã" ${classData.shift === 'Manhã' ? 'selected' : ''}>Manhã</option><option value="Tarde" ${classData.shift === 'Tarde' ? 'selected' : ''}>Tarde</option><option value="Noite" ${classData.shift === 'Noite' ? 'selected' : ''}>Noite</option><option value="Integral" ${classData.shift === 'Integral' ? 'selected' : ''}>Integral</option></select></div></div></form>`; const footerButtons = `<button type="button" id="save-class-button" class="success"><span class="icon icon-salvar"></span> Salvar</button>`; showModal(title, modalContent, footerButtons); document.getElementById('save-class-button').addEventListener('click', saveClass); };
    // saveClass ATUALIZADO para inicializar novas propriedades
    const saveClass = () => {
        const form = document.getElementById('class-form');
        if (!form || !form.checkValidity() || !currentSchoolId) {
            alert('Preencha nome da turma e verifique escola.');
            form?.reportValidity();
            return;
        }
        const id = document.getElementById('class-id').value;
        const isEditing = !!id;
        // Cria objeto base com novas props inicializadas
        const baseClassData = {
            id: id || generateId('cls'),
            schoolId: currentSchoolId,
            name: document.getElementById('class-name').value.trim(),
            subject: document.getElementById('class-subject').value.trim(),
            schedule: document.getElementById('class-schedule').value,
            shift: document.getElementById('class-shift').value,
            notes: '', gradeStructure: [], lessonPlans: {},
            classroomLayout: { rows: 5, cols: 6, teacherDeskPosition: 'top-center', seats: [] },
            representativeId: null, // Inicializa novas props
            viceRepresentativeId: null
        };

        if (isEditing) {
            const index = appData.classes.findIndex(c => c.id === id);
            if (index > -1) {
                // Mantém dados existentes e atualiza os editados
                const existingClass = appData.classes[index];
                appData.classes[index] = {
                    ...existingClass, // Preserva dados não editáveis (grades, attendance links etc.)
                    ...baseClassData, // Sobrescreve com dados do form e IDs
                    // Garante que IDs de representantes sejam preservados se não forem alterados explicitamente
                    representativeId: existingClass.representativeId,
                    viceRepresentativeId: existingClass.viceRepresentativeId
                };
            } else { // Caso raro: ID existe mas não achou no array
                 appData.classes.push(baseClassData);
            }
        } else {
            appData.classes.push(baseClassData);
        }
        saveData();
        renderClassList(currentSchoolId);
        if (id && id === currentClassId && currentSection === 'class-details-section') {
            selectClass(id, true); // Força recarga se estiver editando a turma atual
        }
        hideModal();
    };
    const deleteClass = (id) => { /* ... (mantido como no original) ... */ appData.classes = appData.classes.filter(c => c.id !== id); appData.students = appData.students.filter(s => s.classId !== id); if (currentClassId === id) { currentClassId = null; showSection('classes-section'); } saveData(); renderClassList(currentSchoolId); if (!currentClassId) navDetailsButton.disabled = true; updateHeaderInfo(); saveAppState(); };
    const selectClass = (id, forceReload = false) => { /* ... (mantido como no original, mas usa renderStudentList atualizado) ... */ if (currentClassId !== id || forceReload) { console.log(`Selecionando Turma: ${id}, Forçar Recarga: ${forceReload}`); if (tempClassroomLayout) { cancelClassroomMapEdit(); } currentClassId = id; const selectedClass = findClassById(id); if (selectedClass) { classDetailsTitle.textContent = `${sanitizeHTML(selectedClass.name)} (${sanitizeHTML(selectedClass.subject || 'Sem matéria')})`; renderStudentList(id); renderGradeSets(id); const currentDate = attendanceDateInput.value || getCurrentDateString(); attendanceDateInput.value = currentDate; lessonPlanDateInput.value = currentDate; renderAttendanceTable(id, currentDate); renderLessonPlan(id, currentDate); renderClassroomMap(id); classNotesContent.textContent = sanitizeHTML(selectedClass.notes || 'Nenhuma anotação.'); classNotesTextarea.value = selectedClass.notes || ''; classNotesEdit.classList.add('hidden'); classNotesDisplay.classList.remove('hidden'); if (currentSection === 'classes-section') renderClassList(selectedClass.schoolId); navDetailsButton.disabled = false; classDetailsSection.querySelectorAll('.card').forEach(card => { card.classList.remove('collapsed'); const toggleBtn = card.querySelector('.card-toggle-button .icon'); if (toggleBtn) { toggleBtn.classList.remove('icon-chevron-down'); toggleBtn.classList.add('icon-chevron-up'); toggleBtn.parentElement.title = 'Esconder'; } }); } else { currentClassId = null; classDetailsTitle.textContent = "Erro: Turma não encontrada"; studentListContainer.innerHTML = '<p>Erro</p>'; gradesTableContainer.innerHTML = '<p>Erro</p>'; attendanceTableContainer.innerHTML = '<p>Erro</p>'; lessonPlanTextarea.value = ''; saveLessonPlanButton.classList.add('hidden'); classNotesContent.textContent = 'Erro'; classroomContainerDisplay.innerHTML = '<p style="padding: 1rem; text-align: center; grid-column: 1 / -1; grid-row: 1 / -1;">Erro ao carregar mapa.</p>'; navDetailsButton.disabled = true; } updateHeaderInfo(); saveAppState(); } else if (forceReload && currentSection === 'class-details-section') { console.log(`Forçando recarga da Turma ${id}`); if (tempClassroomLayout) { cancelClassroomMapEdit(); } renderStudentList(id); renderGradeSets(id); renderAttendanceTable(id, attendanceDateInput.value || getCurrentDateString()); renderLessonPlan(id, lessonPlanDateInput.value || getCurrentDateString()); renderClassroomMap(id); } else { console.log(`Turma ${id} já selecionada, sem recarga forçada.`); } };
    const openStudentModal = (studentIdToEdit = null) => { /* ... (mantido como no original) ... */ if (!currentClassId) return; const isEditing = studentIdToEdit !== null; const studentData = isEditing ? findStudentById(studentIdToEdit) : {}; const title = isEditing ? 'Editar Aluno' : 'Novo Aluno'; const className = findClassById(currentClassId)?.name || '?'; const modalContent = `<form id="student-form"><p class="mb-1"><strong>Turma:</strong> ${sanitizeHTML(className)}</p><input type="hidden" id="student-id" value="${isEditing ? studentIdToEdit : ''}"><div class="form-group d-flex align-items-center"><div style="width: 80px; margin-right: 10px;"><label for="student-number">Nº:</label><input type="number" id="student-number" min="1" step="1" value="${studentData.number || ''}" style="padding: 0.7rem 0.5rem;"></div><div style="flex-grow: 1;"><label for="student-name">Nome:</label><input type="text" id="student-name" required value="${sanitizeHTML(studentData.name || '')}"></div></div></form>`; const footerButtons = `<button type="button" id="save-student-button" class="success"><span class="icon icon-salvar"></span> Salvar</button>`; showModal(title, modalContent, footerButtons); document.getElementById('save-student-button').addEventListener('click', saveStudent); };
    // saveStudent ATUALIZADO para inicializar novas propriedades
    const saveStudent = () => {
        const form = document.getElementById('student-form');
        if (!form || !form.checkValidity()) {
            alert('Preencha o nome do aluno.');
            form?.reportValidity();
            return;
        }
        const id = document.getElementById('student-id').value;
        const studentName = document.getElementById('student-name').value.trim();
        const studentNumberInput = document.getElementById('student-number').value;
        const studentNumber = studentNumberInput ? parseInt(studentNumberInput) : null;
        if (!currentClassId) return;

        if (id) { // Editando
            const student = findStudentById(id);
            if (student) {
                student.name = studentName;
                student.number = studentNumber;
                // Preserva dados existentes (grades, attendance, notes)
            }
        } else { // Novo aluno
            const newStudent = {
                id: generateId('std'),
                name: studentName,
                number: studentNumber,
                classId: currentClassId,
                grades: {},
                attendance: {},
                notes: [] // Inicializa notes como array vazio
            };
            appData.students.push(newStudent);
        }
        saveData();
        renderStudentList(currentClassId);
        // Re-renderiza tabelas caso a ordem dos alunos mude
        if (gradeSetSelect.value) renderGradesTable(currentClassId, gradeSetSelect.value);
        if (attendanceDateInput.value) renderAttendanceTable(currentClassId, attendanceDateInput.value);
        renderClassroomMap(currentClassId); // Atualiza mapa caso aluno novo ou editado
        hideModal();
    };
    const deleteStudent = (id) => { /* ... (mantido como no original) ... */ if (currentClassId) { const cls = findClassById(currentClassId); if (cls?.classroomLayout?.seats) { cls.classroomLayout.seats.forEach(seat => { if (seat.studentId === id) { seat.studentId = null; } }); } if(cls?.representativeId === id) cls.representativeId = null; if(cls?.viceRepresentativeId === id) cls.viceRepresentativeId = null; } appData.students = appData.students.filter(s => s.id !== id); saveData(); renderStudentList(currentClassId); if (gradeSetSelect.value) renderGradesTable(currentClassId, gradeSetSelect.value); if (attendanceDateInput.value) renderAttendanceTable(currentClassId, attendanceDateInput.value); renderClassroomMap(currentClassId); };
    const openMoveStudentModal = (studentId) => { /* ... (mantido como no original) ... */ const student = findStudentById(studentId); if (!student) { alert("Erro: Aluno não encontrado."); return; } const currentClass = findClassById(student.classId); if (!currentClass) { alert("Erro: Turma atual do aluno não encontrada."); return; } const school = findSchoolById(currentClass.schoolId); if (!school) { alert("Erro: Escola do aluno não encontrada."); return; } const otherClassesInSchool = appData.classes .filter(c => c.schoolId === school.id && c.id !== currentClass.id) .sort((a, b) => a.name.localeCompare(b.name)); let classOptionsHtml = '<option value="">-- Selecione a Turma de Destino --</option>'; if (otherClassesInSchool.length > 0) { otherClassesInSchool.forEach(cls => { classOptionsHtml += `<option value="${cls.id}">${sanitizeHTML(cls.name)} (${sanitizeHTML(cls.subject || 'N/A')})</option>`; }); } else { classOptionsHtml = '<option value="" disabled>Nenhuma outra turma nesta escola</option>'; } const title = `Mover Aluno: ${sanitizeHTML(student.name)}`; const modalContent = ` <form id="move-student-form"> <p><strong>Aluno:</strong> ${sanitizeHTML(student.name)} (#${student.number || 'S/N'})</p> <p class="mb-1"><strong>Turma Atual:</strong> ${sanitizeHTML(currentClass.name)}</p> <input type="hidden" id="move-student-id" value="${studentId}"> <div class="form-group"> <label for="move-student-destination-class">Mover para a Turma:</label> <select id="move-student-destination-class" required ${otherClassesInSchool.length === 0 ? 'disabled' : ''}> ${classOptionsHtml} </select> ${otherClassesInSchool.length === 0 ? '<p class="text-secondary text-sm mt-1">Não há outras turmas cadastradas nesta escola para mover o aluno.</p>' : ''} </div> <div class="form-group"> <label>Opções de Dados:</label> <div class="checkbox-group"> <input type="checkbox" id="move-student-attendance-checkbox" checked> <label for="move-student-attendance-checkbox">Mover Histórico de Frequência?</label> </div> <p class="text-sm text-secondary mt-1">Nota: O histórico de notas e observações NÃO será movido.</p> </div> </form> `; const footerButtons = ` <button type="button" id="confirm-move-student-button" class="success" ${otherClassesInSchool.length === 0 ? 'disabled' : ''}> <span class="icon icon-mover"></span> Mover Aluno </button>`; showModal(title, modalContent, footerButtons, 'move-student-modal'); const confirmButton = document.getElementById('confirm-move-student-button'); if (confirmButton) { confirmButton.replaceWith(confirmButton.cloneNode(true)); document.getElementById('confirm-move-student-button').addEventListener('click', confirmMoveStudent); } };
    const confirmMoveStudent = () => { /* ... (mantido como no original, apenas remove do mapa e dos cargos da turma original) ... */ const studentId = document.getElementById('move-student-id')?.value; const destinationClassId = document.getElementById('move-student-destination-class')?.value; const moveAttendance = document.getElementById('move-student-attendance-checkbox')?.checked; if (!studentId || !destinationClassId) { alert("Erro: Por favor, selecione a turma de destino."); return; } const student = findStudentById(studentId); if (!student) { alert("Erro: Aluno não encontrado."); return; } const destinationClass = findClassById(destinationClassId); if (!destinationClass) { alert("Erro: Turma de destino não encontrada."); return; } const originalClass = findClassById(student.classId); if (student.classId === destinationClassId) { alert("O aluno já está nesta turma."); return; } if (!confirm(`Mover ${sanitizeHTML(student.name)} da turma "${sanitizeHTML(originalClass?.name)}" para "${sanitizeHTML(destinationClass.name)}"?\n\nATENÇÃO: Histórico de notas e observações será RESETADO.\nFrequência será ${moveAttendance ? 'mantida' : 'removida'}.`)) { return; } console.log(`Moving student ${studentId} to class ${destinationClassId}. Move Attendance: ${moveAttendance}`); if (originalClass?.classroomLayout?.seats) { originalClass.classroomLayout.seats.forEach(seat => { if (seat.studentId === studentId) { seat.studentId = null; } }); } if(originalClass?.representativeId === studentId) originalClass.representativeId = null; if(originalClass?.viceRepresentativeId === studentId) originalClass.viceRepresentativeId = null; student.classId = destinationClassId; student.grades = {}; student.notes = []; console.log(` -> Grades and Notes cleared for student ${studentId}`); if (!moveAttendance) { student.attendance = {}; console.log(` -> Attendance cleared for student ${studentId}`); } saveData(); hideModal(); if (currentClassId === originalClass?.id && currentSection === 'class-details-section') { renderStudentList(originalClass.id); if (gradeSetSelect.value) renderGradesTable(originalClass.id, gradeSetSelect.value); if (attendanceDateInput.value) renderAttendanceTable(originalClass.id, attendanceDateInput.value); renderClassroomMap(originalClass.id); } else if (currentClassId === destinationClassId && currentSection === 'class-details-section') { renderClassroomMap(destinationClassId); } alert(`Aluno ${sanitizeHTML(student.name)} movido para a turma ${sanitizeHTML(destinationClass.name)} com sucesso! (Notas e Obs. resetadas)`); };
    const openGradeStructureModal = () => { /* ... (mantido como no original) ... */ if (!currentClassId) return; const currentClass = findClassById(currentClassId); const title = `Estrutura Notas - ${sanitizeHTML(currentClass.name)}`; let structureHtml = ''; const gradeStructure = currentClass.gradeStructure || []; if (gradeStructure.length > 0) { gradeStructure.forEach((gs, index) => { const colorRanges = gs.colorRanges || []; let colorRangesHtml = ''; colorRanges.forEach((range, rIndex) => { colorRangesHtml += ` <div class="color-range-item" data-range-index="${rIndex}"> <label>De:</label> <input type="number" class="gs-color-min" step="0.1" placeholder="0.0" value="${range.min ?? ''}"> <label>Até:</label> <input type="number" class="gs-color-max" step="0.1" placeholder="10.0" value="${range.max ?? ''}"> <label>Cor:</label> <input type="color" class="gs-color-input" value="${range.color || '#ffffff'}"> <button type="button" class="delete-color-range-button danger icon-button" title="Excluir Faixa"> <span class="icon icon-excluir icon-only"></span> </button> </div> `; }); structureHtml += ` <div class="card mb-2" data-gs-index="${index}" data-gs-id="${gs.id}"> <div class="card-header"> <input type="text" class="gs-name" value="${sanitizeHTML(gs.name)}" placeholder="Nome do Conjunto de Notas"> <button type="button" class="delete-gs-button danger icon-button" title="Excluir Conjunto ${sanitizeHTML(gs.name)}"> <span class="icon icon-excluir icon-only"></span> </button> </div> <div class="card-content"> <div class="gs-section gs-instruments-container"> <h4>Instrumentos de Avaliação</h4> ${gs.gradeLabels.map((label, lblIndex) => ` <div class="grade-label-item" data-label-index="${lblIndex}"> <input type="text" class="gs-label" value="${sanitizeHTML(label)}" placeholder="Nome da Avaliação (Ex: Prova 1)"> <button type="button" class="delete-gs-label-button danger icon-button" title="Excluir Instrumento"> <span class="icon icon-excluir icon-only"></span> </button> </div>`).join('')} <button type="button" class="add-gs-label-button success mt-1"><span class="icon icon-adicionar"></span> Instrumento</button> </div> <div class="gs-section gs-color-ranges-container"> <h4>Faixas de Cores para Notas</h4> <div class="color-ranges-list">${colorRangesHtml}</div> <button type="button" class="add-color-range-button success mt-1"><span class="icon icon-adicionar"></span> Faixa de Cor</button> </div> </div> </div>`; }); } else { structureHtml = '<p>Nenhuma estrutura definida. Clique em "Adicionar Conjunto".</p>'; } const modalContent = ` <form id="grade-structure-form"> <div id="grade-sets-list">${structureHtml}</div> <button type="button" id="add-grade-set-button" class="success mt-2"><span class="icon icon-adicionar"></span> Adicionar Conjunto</button> </form>`; const footerButtons = `<button type="button" id="save-grade-structure-button" class="success"><span class="icon icon-salvar"></span> Salvar Estrutura</button>`; showModal(title, modalContent, footerButtons, 'grade-structure-modal'); setupGradeStructureModalListeners(); };
    const setupGradeStructureModalListeners = () => { /* ... (mantido como no original) ... */ const gradeSetsListContainer = document.getElementById('grade-sets-list'); if (!gradeSetsListContainer) return; const addSetButton = document.getElementById('add-grade-set-button'); const saveStructureButton = document.getElementById('save-grade-structure-button'); gradeSetsListContainer.removeEventListener('click', handleGradeStructureClicks); gradeSetsListContainer.addEventListener('click', handleGradeStructureClicks); if (addSetButton) { addSetButton.replaceWith(addSetButton.cloneNode(true)); document.getElementById('add-grade-set-button').addEventListener('click', addGradeSet); } if (saveStructureButton) { saveStructureButton.replaceWith(saveStructureButton.cloneNode(true)); document.getElementById('save-grade-structure-button').addEventListener('click', saveGradeStructure); } };
    const handleGradeStructureClicks = (e) => { /* ... (mantido como no original) ... */ if (e.target.classList.contains('add-gs-label-button') || e.target.closest('.add-gs-label-button')) { const button = e.target.closest('.add-gs-label-button'); const instrumentsContainer = button.closest('.gs-instruments-container'); const template = document.getElementById('grade-label-item-template'); const clone = template.content.cloneNode(true); instrumentsContainer.insertBefore(clone, button); } else if (e.target.classList.contains('delete-gs-label-button') || e.target.closest('.delete-gs-label-button')) { const itemToDelete = e.target.closest('.grade-label-item'); itemToDelete?.remove(); } else if (e.target.classList.contains('add-color-range-button') || e.target.closest('.add-color-range-button')) { const button = e.target.closest('.add-color-range-button'); const rangesList = button.previousElementSibling; const template = document.getElementById('color-range-item-template'); const clone = template.content.cloneNode(true); rangesList.appendChild(clone); } else if (e.target.classList.contains('delete-color-range-button') || e.target.closest('.delete-color-range-button')) { const itemToDelete = e.target.closest('.color-range-item'); itemToDelete?.remove(); } else if (e.target.classList.contains('delete-gs-button') || e.target.closest('.delete-gs-button')) { const cardToDelete = e.target.closest('.card[data-gs-index]'); const setName = cardToDelete?.querySelector('.gs-name')?.value || 'este conjunto'; if (confirm(`Tem certeza que deseja excluir "${setName}" e todas as notas associadas?`)) { const list = cardToDelete?.parentElement; cardToDelete?.remove(); list?.querySelectorAll('.card[data-gs-index]').forEach((card, i) => card.dataset.gsIndex = i); if (list && list.children.length === 0) { list.innerHTML = '<p>Nenhuma estrutura definida.</p>'; } } } };
    const addGradeSet = () => { /* ... (mantido como no original) ... */ const list = document.getElementById('grade-sets-list'); const newSetIndex = list.querySelectorAll('.card[data-gs-index]').length; const defaultRangesHtml = ` <div class="color-range-item" data-range-index="0"> <label>De:</label> <input type="number" class="gs-color-min" step="0.1" placeholder="0.0" value="0"> <label>Até:</label> <input type="number" class="gs-color-max" step="0.1" placeholder="4.9" value="4.9"> <label>Cor:</label> <input type="color" class="gs-color-input" value="#dc3545"> <button type="button" class="delete-color-range-button danger icon-button" title="Excluir Faixa"><span class="icon icon-excluir icon-only"></span></button> </div> <div class="color-range-item" data-range-index="1"> <label>De:</label> <input type="number" class="gs-color-min" step="0.1" placeholder="5.0" value="5.0"> <label>Até:</label> <input type="number" class="gs-color-max" step="0.1" placeholder="6.9" value="6.9"> <label>Cor:</label> <input type="color" class="gs-color-input" value="#ffc107"> <button type="button" class="delete-color-range-button danger icon-button" title="Excluir Faixa"><span class="icon icon-excluir icon-only"></span></button> </div> <div class="color-range-item" data-range-index="2"> <label>De:</label> <input type="number" class="gs-color-min" step="0.1" placeholder="7.0" value="7.0"> <label>Até:</label> <input type="number" class="gs-color-max" step="0.1" placeholder="10.0" value="10.0"> <label>Cor:</label> <input type="color" class="gs-color-input" value="#d4edda"> <button type="button" class="delete-color-range-button danger icon-button" title="Excluir Faixa"><span class="icon icon-excluir icon-only"></span></button> </div> `; const newSetHtml = ` <div class="card mb-2" data-gs-index="${newSetIndex}" data-gs-id=""> <div class="card-header"> <input type="text" class="gs-name" value="Novo Conjunto ${newSetIndex + 1}" placeholder="Nome do Conjunto de Notas"> <button type="button" class="delete-gs-button danger icon-button" title="Excluir Conjunto"> <span class="icon icon-excluir icon-only"></span> </button> </div> <div class="card-content"> <div class="gs-section gs-instruments-container"> <h4>Instrumentos de Avaliação</h4> <div class="grade-label-item" data-label-index="0"> <input type="text" class="gs-label" value="Nota 1" placeholder="Nome da Avaliação"> <button type="button" class="delete-gs-label-button danger icon-button" title="Excluir Instrumento"> <span class="icon icon-excluir icon-only"></span> </button> </div> <button type="button" class="add-gs-label-button success mt-1"><span class="icon icon-adicionar"></span> Instrumento</button> </div> <div class="gs-section gs-color-ranges-container"> <h4>Faixas de Cores para Notas</h4> <div class="color-ranges-list">${defaultRangesHtml}</div> <button type="button" class="add-color-range-button success mt-1"><span class="icon icon-adicionar"></span> Faixa de Cor</button> </div> </div> </div>`; const noStructureP = list.querySelector('p'); if (noStructureP) noStructureP.remove(); list.insertAdjacentHTML('beforeend', newSetHtml); };
    const saveGradeStructure = () => { /* ... (mantido como no original) ... */ if (!currentClassId) return; const currentClass = findClassById(currentClassId); if (!currentClass) return; const newStructure = []; const gradeSetCards = document.querySelectorAll('#grade-sets-list .card[data-gs-index]'); let valid = true; const existingSetIds = new Set((currentClass.gradeStructure || []).map(gs => gs.id)); const currentSetIds = new Set(); gradeSetCards.forEach(card => { if (!valid) return; const nameInput = card.querySelector('.gs-name'); const name = nameInput.value.trim(); const setId = card.dataset.gsId || `gs_${currentClassId}_${Date.now()}_${Math.random().toString(16).slice(5)}`; currentSetIds.add(setId); const labels = []; const labelInputs = card.querySelectorAll('.gs-label'); if (!name) { alert('Nome do conjunto é obrigatório.'); nameInput.focus(); valid = false; return; } if (labelInputs.length === 0) { alert(`Conjunto "${name}" precisa ter pelo menos um Instrumento de Avaliação.`); valid = false; return; } labelInputs.forEach(lblInput => { const label = lblInput.value.trim(); if (!label) { alert(`Nome do Instrumento em "${name}" é obrigatório.`); lblInput.focus(); valid = false; } if (valid) labels.push(label); }); if (!valid) return; const colorRanges = []; const rangeItems = card.querySelectorAll('.color-range-item'); rangeItems.forEach(item => { if (!valid) return; const minInput = item.querySelector('.gs-color-min'); const maxInput = item.querySelector('.gs-color-max'); const colorInput = item.querySelector('.gs-color-input'); const min = parseFloat(minInput.value); const max = parseFloat(maxInput.value); const color = colorInput.value; if (isNaN(min) || isNaN(max)) { alert(`Valores Mínimo e Máximo da faixa de cor em "${name}" devem ser números.`); (isNaN(min) ? minInput : maxInput).focus(); valid = false; return; } if (min > max) { alert(`Valor Mínimo (${min}) não pode ser maior que o Máximo (${max}) na faixa de cor em "${name}".`); minInput.focus(); valid = false; return; } colorRanges.push({ min: min, max: max, color: color }); }); if (!valid) return; newStructure.push({ id: setId, name: name, gradeLabels: labels, colorRanges: colorRanges }); }); if (valid) { const deletedSetIds = [...existingSetIds].filter(id => !currentSetIds.has(id)); if (deletedSetIds.length > 0) { console.log("Removing grades for deleted sets:", deletedSetIds); appData.students.forEach(student => { if (student.classId === currentClassId) { deletedSetIds.forEach(deletedId => { if (student.grades[deletedId]) { delete student.grades[deletedId]; } }); } }); } currentClass.gradeStructure = newStructure; saveData(); hideModal(); renderGradeSets(currentClassId); } };
    const saveGrades = () => { /* ... (mantido como no original) ... */ const gradeSetId = gradeSetSelect.value; if (!currentClassId || !gradeSetId) { console.warn("Cannot save grades: No class or grade set selected."); return; } const currentClass = findClassById(currentClassId); const gradeSet = currentClass?.gradeStructure?.find(gs => gs.id === gradeSetId); if(!gradeSet) { console.warn("Cannot save grades: Grade set not found."); return; } console.log("Saving grades for set:", gradeSetId); const rows = gradesTableContainer.querySelectorAll('tbody tr'); if(rows.length === 0) { console.warn("No student rows found to save grades."); return; } rows.forEach(row => { const studentId = row.dataset.studentId; const student = findStudentById(studentId); if (student) { if (!student.grades[gradeSetId]) student.grades[gradeSetId] = {}; const currentGrades = {}; gradeSet.gradeLabels.forEach(label => { const input = row.querySelector(`input[data-label="${label}"]`); const value = input?.value.trim(); currentGrades[label] = (value !== '' && !isNaN(parseFloat(value))) ? parseFloat(value) : null; }); const calculated = calculateSumAndAverageForData(currentGrades); student.grades[gradeSetId] = { ...currentGrades, sum: calculated.sum, average: calculated.average }; } else { console.warn(`Student with ID ${studentId} not found during grade save.`); } }); saveData(); alert(`Notas de "${sanitizeHTML(gradeSet.name)}" salvas!`); renderGradesTable(currentClassId, gradeSetId); };
    const escapeCsvField = (field) => { /* ... (mantido como no original) ... */ if (field === null || field === undefined) { return '""'; } let fieldStr = String(field); fieldStr = fieldStr.replace(/"/g, '""'); if (fieldStr.includes(',') || fieldStr.includes('"') || fieldStr.includes('\n') || fieldStr.includes('\r')) { return `"${fieldStr}"`; } return fieldStr; };
    const exportGradesCSV = () => { /* ... (mantido como no original) ... */ const gradeSetId = gradeSetSelect.value; if (!currentClassId || !gradeSetId) { alert("Selecione uma turma e um conjunto de notas para exportar."); return; } const currentClass = findClassById(currentClassId); const gradeSet = currentClass?.gradeStructure?.find(gs => gs.id === gradeSetId); const students = getStudentsByClass(currentClassId); if (!gradeSet || students.length === 0) { alert("Nenhum dado de nota para exportar."); return; } const className = currentClass?.name.replace(/[^a-z0-9]/gi, '_') || 'Turma'; const setName = gradeSet.name.replace(/[^a-z0-9]/gi, '_') || 'Conjunto'; let csvContent = "\uFEFF"; let header = [escapeCsvField("Aluno"), escapeCsvField("No.")]; gradeSet.gradeLabels.forEach(label => header.push(escapeCsvField(label))); header.push(escapeCsvField("Soma")); header.push(escapeCsvField("Média")); csvContent += header.join(",") + "\r\n"; students.forEach(student => { const studentGrades = student.grades[gradeSetId] || {}; const calculated = calculateSumAndAverageForData(studentGrades); let row = [escapeCsvField(student.name), escapeCsvField(student.number || '')]; gradeSet.gradeLabels.forEach(label => { const gradeValue = studentGrades[label]; row.push(escapeCsvField(gradeValue)); }); row.push(escapeCsvField(calculated.sum !== null ? calculated.sum.toFixed(1) : '')); row.push(escapeCsvField(calculated.average !== null ? calculated.average.toFixed(1) : '')); csvContent += row.join(",") + "\r\n"; }); const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvContent}`); const link = document.createElement("a"); link.setAttribute("href", encodedUri); link.setAttribute("download", `notas_${className}_${setName}.csv`); document.body.appendChild(link); link.click(); document.body.removeChild(link); };
    const exportGradesPDF = async () => { /* ... (mantido como no original) ... */ const gradeSetId = gradeSetSelect.value; const button = exportGradesPdfButton; if (!currentClassId || !gradeSetId) { alert("Selecione uma turma e um conjunto de notas para exportar para PDF."); return; } const currentClass = findClassById(currentClassId); const gradeSet = currentClass?.gradeStructure?.find(gs => gs.id === gradeSetId); const students = getStudentsByClass(currentClassId); if (!gradeSet || students.length === 0) { alert("Nenhum dado de nota para exportar para PDF."); return; } const classNameSanitized = currentClass?.name.replace(/[^a-z0-9]/gi, '_') || 'Turma'; const setNameSanitized = gradeSet.name.replace(/[^a-z0-9]/gi, '_') || 'Conjunto'; const filename = `notas_${classNameSanitized}_${setNameSanitized}.pdf`; let tableHTML = ` <style> body { font-family: sans-serif; font-size: 9pt; } .pdf-table { border-collapse: collapse; width: 100%; margin-top: 10px; table-layout: fixed; } .pdf-table th, .pdf-table td { border: 1px solid #ccc; padding: 3px 4px; text-align: left; word-wrap: break-word; overflow-wrap: break-word; } .pdf-table th { background-color: #f2f2f2; font-weight: bold; text-align: center; font-size: 8pt; } .pdf-table td { font-size: 8pt; } .pdf-table td.grade, .pdf-table td.sum, .pdf-table td.avg { text-align: center; } .pdf-table td.student-name { min-width: 100px; white-space: normal; } .pdf-table th.student-col { min-width: 105px; } .pdf-table th.grade-col { min-width: 40px; } .pdf-table th.sum-col, .pdf-table th.avg-col { min-width: 45px; } .pdf-table .number { font-weight: bold; display: inline-block; min-width: 15px; text-align: right; margin-right: 4px;} h4 { text-align: center; margin-bottom: 10px; font-size: 11pt; } </style> <h4>Notas - Turma: ${sanitizeHTML(currentClass.name)} - Conjunto: ${sanitizeHTML(gradeSet.name)}</h4> <table class="pdf-table"> <thead> <tr> <th class="student-col">Aluno</th> `; gradeSet.gradeLabels.forEach(label => { tableHTML += `<th class="grade-col">${sanitizeHTML(label)}</th>`; }); tableHTML += `<th class="sum-col">Soma</th><th class="avg-col">Média</th></tr></thead><tbody>`; students.forEach(student => { const studentGrades = student.grades[gradeSetId] || {}; const calculated = calculateSumAndAverageForData(studentGrades); tableHTML += `<tr><td class="student-name"><span class="number">${student.number || '-.'}</span>${sanitizeHTML(student.name)}</td>`; gradeSet.gradeLabels.forEach(label => { const gradeValue = studentGrades[label]; tableHTML += `<td class="grade">${(gradeValue !== null && gradeValue !== undefined) ? sanitizeHTML(gradeValue) : '-'}</td>`; }); tableHTML += `<td class="sum">${(calculated.sum !== null) ? calculated.sum.toFixed(1) : '-'}</td>`; tableHTML += `<td class="avg">${(calculated.average !== null) ? calculated.average.toFixed(1) : '-'}</td>`; tableHTML += `</tr>`; }); tableHTML += `</tbody></table>`; const opt = { margin: [8, 5, 8, 5], filename: filename, image: { type: 'jpeg', quality: 0.95 }, html2canvas: { scale: 2, useCORS: true, logging: false, }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }, pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } }; const originalButtonText = button.innerHTML; button.disabled = true; button.innerHTML = '<span class="icon">⏳</span>'; try { console.log("Generating PDF with options:", opt); await html2pdf().set(opt).from(tableHTML).save(); console.log("PDF de notas gerado com sucesso."); } catch (error) { console.error("Erro ao gerar PDF de notas:", error); alert("Ocorreu um erro ao gerar o PDF de notas. Verifique o console para detalhes."); } finally { button.disabled = false; button.innerHTML = originalButtonText; } };
    const saveAttendance = () => { /* ... (mantido como no original) ... */ const date = attendanceDateInput.value; if (!currentClassId || !date) { console.warn("Cannot save attendance: No class or date selected."); alert("Selecione uma turma e uma data."); return; } console.log("Saving all attendance data for", date); saveData(); alert(`Presença de ${formatDate(date)} salva!`); };

    // --- Funções de Observação (Modal ATUALIZADO) ---
    // openStudentNotesModal ATUALIZADO para novas funcionalidades
    const openStudentNotesModal = (studentId, noteIndexToHighlight = -1) => {
        const student = findStudentById(studentId);
        if (!student) return;

        // Faz uma cópia profunda das notas para edição local segura
        currentStudentObservations = JSON.parse(JSON.stringify(student.notes || []));

        const title = `Observações - ${student.number || '-'}. ${sanitizeHTML(student.name)}`;
        // Formulário atualizado com Categoria e Campos de Suspensão
        const modalContent = `
            <div id="student-observations-list"></div>
            <hr style="margin: 1rem 0 0.8rem 0; border-color: var(--border-color);">
            <div id="add-observation-section">
                <form id="add-observation-form">
                    <div class="form-group">
                        <label for="new-observation-category">Categoria:</label>
                        <select id="new-observation-category">
                            <option value="Anotação">Anotação</option>
                            <option value="Observação" selected>Observação</option>
                            <option value="Ocorrência">Ocorrência</option>
                            <option value="Advertência">Advertência</option>
                            <option value="Suspensão">Suspensão</option>
                        </select>
                    </div>
                    <!-- Campos de Suspensão (escondidos por padrão) -->
                    <div id="suspension-fields" class="form-group hidden" style="display: flex; gap: 10px;">
                        <div style="flex: 1;">
                            <label for="new-suspension-start-date">Início Suspensão:</label>
                            <input type="date" id="new-suspension-start-date">
                        </div>
                        <div style="flex: 1;">
                            <label for="new-suspension-end-date">Fim Suspensão:</label>
                            <input type="date" id="new-suspension-end-date">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="new-observation-text">Descrição:</label>
                        <textarea id="new-observation-text" required></textarea>
                    </div>
                    <button type="button" id="add-observation-button" class="success">
                        <span class="icon icon-adicionar"></span> Adicionar à Lista
                    </button>
                </form>
            </div>`;
        // Botão Salvar atualizado para indicar o tipo
        const footerButtons = `<button type="button" id="save-observations-button" class="success"><span class="icon icon-salvar"></span> Salvar Observações</button>`;
        showModal(title, modalContent, footerButtons, 'student-notes-modal');

        renderStudentObservations(studentId, noteIndexToHighlight, true); // Renderiza a cópia local

        const categorySelect = document.getElementById('new-observation-category');
        const suspensionFields = document.getElementById('suspension-fields');
        const startDateInput = document.getElementById('new-suspension-start-date');
        const endDateInput = document.getElementById('new-suspension-end-date');
        const descriptionTextarea = document.getElementById('new-observation-text');
        const saveButton = document.getElementById('save-observations-button');
        const addButton = document.getElementById('add-observation-button');

        const placeholderMap = { // Placeholders dinâmicos
            'Anotação': 'Digite uma anotação rápida...',
            'Observação': 'Descreva a observação sobre comportamento, participação, etc.',
            'Ocorrência': 'Detalhe a ocorrência (ex: conversa excessiva, falta de material).',
            'Advertência': 'Descreva o motivo da advertência formal.',
            'Suspensão': 'Descreva o motivo e informe o período da suspensão.'
        };

        // Função para atualizar UI dinâmica do form
        const updateDynamicFields = () => {
            const category = categorySelect.value || 'Observação';
            descriptionTextarea.placeholder = placeholderMap[category] || 'Digite a descrição...';
            saveButton.innerHTML = `<span class="icon icon-salvar"></span> Salvar ${category}${category.endsWith('o')||category.endsWith('a') ? 's':''}`; // Ajusta plural
            const showSuspension = category === 'Suspensão';
            suspensionFields.classList.toggle('hidden', !showSuspension);
            startDateInput.required = showSuspension;
            endDateInput.required = showSuspension;
        };

        categorySelect.addEventListener('change', updateDynamicFields);
        updateDynamicFields(); // Chama na inicialização

        // Listener para adicionar observação à lista LOCAL
        addButton.addEventListener('click', () => {
            const form = document.getElementById('add-observation-form');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            const category = categorySelect.value;
            const text = descriptionTextarea.value.trim();
            let startDate = null;
            let endDate = null;

            if (category === 'Suspensão') {
                startDate = startDateInput.value;
                endDate = endDateInput.value;
                if (!startDate || !endDate) {
                    alert("Para Suspensão, as datas de início e fim são obrigatórias.");
                    return;
                }
                if (startDate > endDate) {
                    alert("A data de início da suspensão não pode ser posterior à data de fim.");
                    return;
                }
            }

            if (text) {
                const newObservation = {
                    date: getCurrentDateString(),
                    category: category,
                    text: text,
                    suspensionStartDate: startDate,
                    suspensionEndDate: endDate
                };
                currentStudentObservations.push(newObservation); // Adiciona na cópia local
                renderStudentObservations(studentId, -1, true); // Re-renderiza a lista local
                // Limpa o formulário
                descriptionTextarea.value = '';
                categorySelect.value = 'Observação'; // Volta para padrão
                startDateInput.value = '';
                endDateInput.value = '';
                updateDynamicFields(); // Atualiza placeholders etc.
                descriptionTextarea.focus();
            }
        });

        // Listener para salvar TODAS as observações (da cópia local para appData)
        saveButton.addEventListener('click', () => saveStudentObservations(studentId));

        // Listener para deletar observação da lista LOCAL
        document.getElementById('student-observations-list').addEventListener('click', (e) => {
            const deleteButton = e.target.closest('.delete-observation-button');
            if (deleteButton) {
                const itemElement = deleteButton.closest('.observation-item');
                const index = parseInt(itemElement.dataset.index, 10);
                if (!isNaN(index) && confirm("Excluir esta observação da lista? (Será salvo ao clicar em 'Salvar Observações')")) {
                    const removed = currentStudentObservations.splice(index, 1); // Remove da cópia local
                    renderStudentObservations(studentId, -1, true); // Re-renderiza a lista local
                    console.log("Observação removida localmente:", removed);
                }
            }
        });
    };

    // renderStudentObservations ATUALIZADO para categorias, datas e destaque
    const renderStudentObservations = (studentId, noteIndexToHighlight = -1, useLocalCopy = false) => {
        const listContainer = document.getElementById('student-observations-list');
        if (!listContainer) return;

        const notes = useLocalCopy ? currentStudentObservations : (findStudentById(studentId)?.notes || []);
        listContainer.innerHTML = ''; // Limpa a lista

        if (notes.length === 0) {
            listContainer.innerHTML = '<p style="text-align: center; padding: 1rem; color: var(--text-secondary);">Nenhuma observação registrada.</p>';
            return;
        }

        // Ordena por data (mais recente primeiro) para exibição
        const sortedNotes = [...notes].sort((a, b) => (b.date || '0').localeCompare(a.date || '0'));

        const template = document.getElementById('observation-item-template');
        sortedNotes.forEach(note => {
            // Encontra o índice original antes da ordenação para o dataset
             const originalIndex = notes.findIndex(n => n === note);

            const clone = template.content.cloneNode(true);
            const itemElement = clone.querySelector('.observation-item');
            itemElement.dataset.index = originalIndex; // Usa índice original para exclusão

            // Adiciona classe de categoria para estilo CSS
            const categoryClass = (note.category || 'anotacao').toLowerCase().replace(/[^a-z0-9]/g, '');
            itemElement.classList.add(`category-${categoryClass}`);

            // Preenche informações
            itemElement.querySelector('.category').textContent = note.category || 'Anotação';
            itemElement.querySelector('.observation-date').textContent = formatDate(note.date);
            itemElement.querySelector('.observation-text').textContent = sanitizeHTML(note.text);

            // Mostra/esconde e preenche datas de suspensão
            const suspensionDatesElement = itemElement.querySelector('.observation-suspension-dates');
            if (note.category === 'Suspensão' && note.suspensionStartDate && note.suspensionEndDate) {
                suspensionDatesElement.textContent = `Período: ${formatDate(note.suspensionStartDate)} a ${formatDate(note.suspensionEndDate)}`;
                suspensionDatesElement.classList.remove('hidden');
            } else {
                suspensionDatesElement.classList.add('hidden');
            }

             // Destaque (Highlight) - Apenas na renderização inicial vinda do clique na tabela
             if (!useLocalCopy && originalIndex === noteIndexToHighlight) {
                itemElement.classList.add('highlighted-note');
                // Scroll suave para o item destacado
                setTimeout(() => itemElement.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
            }

            listContainer.appendChild(clone);
        });
    };

    // addStudentObservation REMOVIDO (agora é feito localmente no modal)

    // deleteStudentObservation REMOVIDO (agora é feito localmente no modal)

    // saveStudentObservations ATUALIZADO para salvar a cópia local e re-renderizar tabela
    const saveStudentObservations = (studentId) => {
        const student = findStudentById(studentId);
        if (!student) {
            alert("Erro: Aluno não encontrado para salvar observações.");
            return;
        }
        // Salva a cópia local editada de volta no appData
        student.notes = JSON.parse(JSON.stringify(currentStudentObservations));
        saveData(); // Salva os dados gerais do app
        hideModal();
        // Re-renderiza a tabela de presença para refletir possíveis mudanças de suspensão
        if (attendanceDateInput.value) {
            renderAttendanceTable(currentClassId, attendanceDateInput.value);
        }
        alert(`Observações de ${sanitizeHTML(student.name)} salvas com sucesso!`);
    };

    // --- Funções de Ação (ATUALIZADAS/NOVAS) ---
    // updateAttendanceStatus ATUALIZADO para verificar suspensão antes de alterar
    const updateAttendanceStatus = (studentId, date, newStatus) => {
        const student = findStudentById(studentId);
        if (!student || !date) return;

        // Verifica se o aluno está suspenso nesta data
        if (isStudentSuspendedOnDate(studentId, date)) {
            console.warn(`Tentativa de alterar presença de aluno ${studentId} suspenso em ${date}. Ação bloqueada.`);
            // Poderia mostrar um alerta, mas a UI já deve impedir isso.
            return;
        }

        if (!student.attendance[date]) student.attendance[date] = {};

        // Logica para alternar status ou limpar justificação
        student.attendance[date].status = student.attendance[date].status === newStatus ? null : newStatus;
        if (newStatus === 'P' || student.attendance[date].status === null) {
            student.attendance[date].justification = ''; // Limpa justificação se presente ou nulo
        }

        console.log(`Status de ${studentId} em ${date} atualizado para: ${student.attendance[date].status}`);
        renderAttendanceTable(currentClassId, date); // Re-renderiza a tabela para UI
        // NÃO salva aqui, o botão "Salvar Presença" faz isso.
    };

    // openJustificationModal ATUALIZADO para usar showModal padrão
    const openJustificationModal = (studentId, date) => {
        const student = findStudentById(studentId);
        if (!student || !date) return;

        // Verifica suspensão ANTES de abrir o modal
        if (isStudentSuspendedOnDate(studentId, date)) {
             alert(`Aluno ${sanitizeHTML(student.name)} está suspenso nesta data e não pode ter a falta justificada.`);
             return;
         }

        const currentJustification = student.attendance[date]?.justification || '';
        const title = `Justificativa - ${sanitizeHTML(student.name)} (${formatDate(date)})`;
        const modalContent = `
            <form id="justification-form">
                <div class="form-group">
                    <label for="justification-modal-text">Motivo da Falta:</label>
                    <textarea id="justification-modal-text" placeholder="Digite a justificativa aqui..." style="min-height: 150px;">${sanitizeHTML(currentJustification)}</textarea>
                </div>
            </form>`;
        const footerButtons = `
            <button type="button" id="save-justification-button" data-student-id="${studentId}" data-date="${date}" class="success">
                <span class="icon icon-salvar"></span> Salvar Justificativa
            </button>`;
        showModal(title, modalContent, footerButtons, 'justification-modal');

        const saveBtn = document.getElementById('save-justification-button');
        if(saveBtn) {
            // Remove listener antigo e adiciona novo para evitar duplicatas
            saveBtn.replaceWith(saveBtn.cloneNode(true));
            document.getElementById('save-justification-button').addEventListener('click', (e) => {
                const sId = e.target.dataset.studentId || e.target.closest('button').dataset.studentId;
                const jDate = e.target.dataset.date || e.target.closest('button').dataset.date;
                const justificationText = document.getElementById('justification-modal-text').value.trim();
                const studentToUpdate = findStudentById(sId);
                if (studentToUpdate && jDate) {
                     // Verifica suspensão novamente antes de salvar
                     if (isStudentSuspendedOnDate(sId, jDate)) {
                         alert(`Aluno ${sanitizeHTML(studentToUpdate.name)} está suspenso e não pode ter a falta justificada.`);
                         hideModal();
                         return;
                     }
                    if (!studentToUpdate.attendance[jDate]) studentToUpdate.attendance[jDate] = {};
                    studentToUpdate.attendance[jDate].status = 'F'; // Garante que status é Falta
                    studentToUpdate.attendance[jDate].justification = justificationText;
                    console.log(`Justificativa atualizada para ${sId} em ${jDate}: "${justificationText}"`);
                    hideModal();
                    renderAttendanceTable(currentClassId, jDate); // Atualiza UI
                    // NÃO salva aqui, o botão "Salvar Presença" faz isso.
                } else {
                    console.error("Não foi possível salvar justif.: aluno ou data não encontrados.");
                    alert("Erro ao salvar justificativa.");
                }
            });
        }
    };

    // NOVO: toggleActions
    const toggleActions = (listItemElement) => {
        if (!listItemElement) return;
        // Fecha qualquer outro item que esteja aberto
        const currentlyExpanded = studentListContainer.querySelector('.list-item.expanded');
        if (currentlyExpanded && currentlyExpanded !== listItemElement) {
            currentlyExpanded.classList.remove('expanded');
            const oldBtnIcon = currentlyExpanded.querySelector('.expand-actions-button .icon');
            if (oldBtnIcon) oldBtnIcon.classList.replace('icon-chevron-up', 'icon-chevron-down');
        }
        // Alterna o estado do item clicado
        listItemElement.classList.toggle('expanded');
        const btnIcon = listItemElement.querySelector('.expand-actions-button .icon');
        if (btnIcon) {
            btnIcon.classList.toggle('icon-chevron-up', listItemElement.classList.contains('expanded'));
            btnIcon.classList.toggle('icon-chevron-down', !listItemElement.classList.contains('expanded'));
        }
    };

    // NOVO: toggleRepresentative
    const toggleRepresentative = (studentId) => {
        const cls = findClassById(currentClassId);
        if (!cls) return;
        const studentName = findStudentById(studentId)?.name || 'Aluno(a)';

        if (cls.representativeId === studentId) { // Já é Rep -> Remover
            if (confirm(`Remover ${sanitizeHTML(studentName)} do cargo de Representante?`)) {
                cls.representativeId = null;
                console.log(`Representante ${studentId} removido.`);
                saveData(); // Salva a alteração
                renderStudentList(currentClassId); // Re-renderiza a lista
            }
        } else { // Não é Rep -> Promover
            const confirmMsg = `Promover ${sanitizeHTML(studentName)} a Representante?` +
                               (cls.viceRepresentativeId === studentId ? ' (Ele deixará de ser Vice-Representante)' : '') +
                               (cls.representativeId ? ` (O atual Rep., ${sanitizeHTML(findStudentById(cls.representativeId)?.name || 'ID:'+cls.representativeId)}, será removido do cargo)` : '');
            if (confirm(confirmMsg)) {
                if (cls.viceRepresentativeId === studentId) cls.viceRepresentativeId = null; // Remove de vice, se for
                cls.representativeId = studentId; // Define como novo rep
                console.log(`Representante definido como ${studentId}.`);
                saveData(); // Salva a alteração
                renderStudentList(currentClassId); // Re-renderiza a lista
            }
        }
    };

    // NOVO: toggleViceRepresentative
    const toggleViceRepresentative = (studentId) => {
        const cls = findClassById(currentClassId);
        if (!cls) return;
        const studentName = findStudentById(studentId)?.name || 'Aluno(a)';

        if (cls.viceRepresentativeId === studentId) { // Já é Vice -> Remover
             if (confirm(`Remover ${sanitizeHTML(studentName)} do cargo de Vice-Representante?`)) {
                cls.viceRepresentativeId = null;
                console.log(`Vice-Representante ${studentId} removido.`);
                saveData();
                renderStudentList(currentClassId);
            }
        } else { // Não é Vice -> Promover
            const confirmMsg = `Promover ${sanitizeHTML(studentName)} a Vice-Representante?` +
                               (cls.representativeId === studentId ? ' (Ele deixará de ser Representante)' : '') +
                               (cls.viceRepresentativeId ? ` (O atual Vice, ${sanitizeHTML(findStudentById(cls.viceRepresentativeId)?.name || 'ID:'+cls.viceRepresentativeId)}, será removido do cargo)` : '');
            if (confirm(confirmMsg)) {
                if (cls.representativeId === studentId) cls.representativeId = null; // Remove de rep, se for
                cls.viceRepresentativeId = studentId; // Define como novo vice
                console.log(`Vice-Representante definido como ${studentId}.`);
                saveData();
                renderStudentList(currentClassId);
            }
        }
    };

    // NOVO: isStudentSuspendedOnDate
    const isStudentSuspendedOnDate = (studentId, dateString) => {
        if (!dateString) return null; // Retorna nulo se não houver data
        const student = findStudentById(studentId);
        if (!student || !Array.isArray(student.notes)) return null;

        // Procura por uma nota de suspensão ativa na data fornecida
        const activeSuspension = student.notes.find(note =>
            note.category === 'Suspensão' &&
            note.suspensionStartDate && note.suspensionEndDate &&
            dateString >= note.suspensionStartDate && dateString <= note.suspensionEndDate
        );
        return activeSuspension || null; // Retorna a nota de suspensão ou nulo
    };

    // NOVO: showHelpModal
    const showHelpModal = () => {
        const title = "Ajuda - Detalhes da Turma";
        const content = `
            <h3><span class="icon icon-alunos"></span> Card Alunos</h3>
            <p>Lista os alunos da turma. Clique no botão <button class="expand-actions-button" disabled><span class="icon icon-chevron-down icon-only"></span></button> para ver as ações:</p>
            <ul>
                <li><span class="icon icon-representante"></span>: Define/Remove <strong>Representante</strong>.</li>
                <li><span class="icon icon-vice"></span>: Define/Remove <strong>Vice-Representante</strong>.</li>
                <li><span class="icon icon-anotacao"></span>: Acessa <strong>Observações</strong> (anotações, ocorrências, advertências, suspensões).</li>
                <li><span class="icon icon-editar"></span>: <strong>Edita</strong> dados do aluno.</li>
                <li><span class="icon icon-mover"></span>: <strong>Move</strong> aluno para outra turma.</li>
                <li><span class="icon icon-excluir"></span>: <strong>Exclui</strong> o aluno.</li>
            </ul>
            <p>Representantes terão uma borda dourada animada, Vices uma prateada.</p>

            <h3><span class="icon icon-presenca"></span> Card Presença</h3>
            <p>Registre a frequência diária:</p>
            <ul>
                <li>Selecione a <strong>Data</strong>.</li>
                <li><button class="attendance-toggle present"><span class="icon">✔️</span> P</button>: Marca <strong>Presença</strong>.</li>
                <li><button class="attendance-toggle absent"><span class="icon">❌</span> F</button>: Marca <strong>Falta</strong>. Clique novamente para adicionar/editar justificativa (vira FJ).</li>
                <li><span class="suspended-indicator">🚫 Susp.</span>: Indica aluno <strong>Suspenso</strong> nesta data (presença bloqueada). Clique na linha para ver a observação da suspensão.</li>
                <li>Clique em <button class="success"><span class="icon icon-salvar"></span> Salvar Presença</button> para gravar as alterações do dia.</li>
            </ul>

             <h3><span class="icon">⚙️</span> Outros Cards</h3>
             <p>Gerencie Mapa da Sala, Notas, Planejamento e Anotações gerais da turma nos cards correspondentes.</p>
             <p>Use o botão <button class="card-toggle-button" disabled><span class="icon icon-chevron-up"></span></button> em cada card para mostrar/esconder seu conteúdo.</p>
        `;
        // Usa classe 'help-modal' para possível estilo customizado no CSS
        showModal(title, content, '', 'help-modal');
    };

    // --- Funções de Drag and Drop, Classroom Map Edit (Mantidas como no original) ---
    const editClassroomMap = () => { /* ... (mantido) ... */ const cls = findClassById(currentClassId); if (!cls) return; tempClassroomLayout = JSON.parse(JSON.stringify(cls.classroomLayout || { rows: 5, cols: 6, teacherDeskPosition: 'top-center', seats: [] })); clearSeatSelection(); mapRowsInput.value = tempClassroomLayout.rows; mapColsInput.value = tempClassroomLayout.cols; teacherDeskPositionSelect.value = tempClassroomLayout.teacherDeskPosition; classroomMapEditControls.classList.remove('hidden'); renderClassroomMap(currentClassId, true); mapRowsInput.removeEventListener('input', handleDimensionChange); mapColsInput.removeEventListener('input', handleDimensionChange); teacherDeskPositionSelect.removeEventListener('change', handleTeacherDeskChange); mapRowsInput.addEventListener('input', handleDimensionChange); mapColsInput.addEventListener('input', handleDimensionChange); teacherDeskPositionSelect.addEventListener('change', handleTeacherDeskChange); };
    const cancelClassroomMapEdit = () => { /* ... (mantido) ... */ tempClassroomLayout = null; clearSeatSelection(); classroomMapEditControls.classList.add('hidden'); renderClassroomMap(currentClassId, false); mapRowsInput.removeEventListener('input', handleDimensionChange); mapColsInput.removeEventListener('input', handleDimensionChange); teacherDeskPositionSelect.removeEventListener('change', handleTeacherDeskChange); };
    const saveClassroomLayout = () => { /* ... (mantido) ... */ if (!currentClassId || !tempClassroomLayout) return; const cls = findClassById(currentClassId); if (!cls) return; const newLayout = { rows: parseInt(mapRowsInput.value) || 5, cols: parseInt(mapColsInput.value) || 6, teacherDeskPosition: teacherDeskPositionSelect.value || 'top-center', seats: tempClassroomLayout.seats }; if (newLayout.rows < 1 || newLayout.rows > 20 || newLayout.cols < 1 || newLayout.cols > 20) { alert("Fileiras e Colunas devem estar entre 1 e 20."); return; } cls.classroomLayout = newLayout; saveData(); tempClassroomLayout = null; cancelClassroomMapEdit(); alert("Mapa da sala salvo!"); };
    const handleDimensionChange = () => { /* ... (mantido) ... */ if (!tempClassroomLayout) return; const newRows = parseInt(mapRowsInput.value) || tempClassroomLayout.rows; const newCols = parseInt(mapColsInput.value) || tempClassroomLayout.cols; if (newRows !== tempClassroomLayout.rows || newCols !== tempClassroomLayout.cols) { const oldSeats = tempClassroomLayout.seats; tempClassroomLayout.rows = newRows; tempClassroomLayout.cols = newCols; tempClassroomLayout.seats = oldSeats.filter(seat => seat.row <= newRows && seat.col <= newCols); renderClassroomMap(currentClassId, true); } };
    const handleTeacherDeskChange = () => { /* ... (mantido) ... */ if (!tempClassroomLayout) return; tempClassroomLayout.teacherDeskPosition = teacherDeskPositionSelect.value; renderClassroomMap(currentClassId, true); };
    const handleStudentListDragStart = (e) => { /* ... (mantido) ... */ draggedElement = e.target; draggedStudentId = e.target.dataset.studentId; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', draggedStudentId); setTimeout(() => draggedElement?.classList.add('dragging'), 0); clearSeatSelection(); console.log(`Drag Start (List): Student ID ${draggedStudentId}`); };
    const handleSeatDragStart = (e) => { /* ... (mantido) ... */ draggedElement = e.target; draggedStudentId = e.target.dataset.studentId; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', draggedStudentId); setTimeout(() => draggedElement?.classList.add('dragging'), 0); clearSeatSelection(); console.log(`Drag Start (Seat): Student ID ${draggedStudentId} from Row ${e.target.dataset.row}, Col ${e.target.dataset.col}`); };
    const handleDragOver = (e) => { /* ... (mantido) ... */ e.preventDefault(); e.dataTransfer.dropEffect = 'move'; const target = e.target.closest('.seat, .unassigned-students-list'); if (target) { const targetIsSeat = target.classList.contains('seat'); const targetIsUnassigned = target.classList.contains('unassigned-students-list'); const draggingFromSeat = draggedElement && draggedElement.classList.contains('seat'); if (targetIsSeat && !target.classList.contains('occupied')) { target.classList.add('drag-over'); } else if (targetIsSeat && target.classList.contains('occupied') && draggedStudentId !== target.dataset.studentId) { target.classList.add('drag-over'); } else if (targetIsUnassigned && draggingFromSeat) { target.classList.add('drag-over'); } } };
    const handleDragLeave = (e) => { /* ... (mantido) ... */ const target = e.target.closest('.seat, .unassigned-students-list'); if (target) { target.classList.remove('drag-over'); } };
    const handleDropOnSeat = (e) => { /* ... (mantido) ... */ e.preventDefault(); const targetSeat = e.target.closest('.seat'); if (!targetSeat || !draggedStudentId || !tempClassroomLayout) return; targetSeat.classList.remove('drag-over'); const targetRow = parseInt(targetSeat.dataset.row); const targetCol = parseInt(targetSeat.dataset.col); const studentBeingDroppedId = e.dataTransfer.getData('text/plain') || draggedStudentId; console.log(`Drop: Student ${studentBeingDroppedId} onto Row ${targetRow}, Col ${targetCol}`); const existingStudentIdInTarget = targetSeat.dataset.studentId; tempClassroomLayout.seats = tempClassroomLayout.seats.filter(seat => seat.studentId !== studentBeingDroppedId); if (existingStudentIdInTarget && existingStudentIdInTarget !== studentBeingDroppedId) { console.log(` -> Target occupied by ${existingStudentIdInTarget}. Unassigning ${existingStudentIdInTarget}.`); tempClassroomLayout.seats = tempClassroomLayout.seats.filter(seat => !(seat.row === targetRow && seat.col === targetCol)); } let seatEntry = tempClassroomLayout.seats.find(s => s.row === targetRow && s.col === targetCol); if (!seatEntry) { seatEntry = { row: targetRow, col: targetCol, studentId: null }; tempClassroomLayout.seats.push(seatEntry); } else if (seatEntry.studentId && seatEntry.studentId !== studentBeingDroppedId){ seatEntry.studentId = null; } seatEntry.studentId = studentBeingDroppedId; console.log(" -> Updated Temp Layout (Drop on Seat):", JSON.parse(JSON.stringify(tempClassroomLayout.seats))); renderClassroomMap(currentClassId, true); draggedElement?.classList.remove('dragging'); draggedStudentId = null; draggedElement = null; };
    const handleDropOnUnassignedList = (e) => { /* ... (mantido) ... */ e.preventDefault(); const targetList = e.target.closest('.unassigned-students-list'); if (!targetList || !draggedStudentId || !tempClassroomLayout) return; targetList.classList.remove('drag-over'); const studentBeingDroppedId = e.dataTransfer.getData('text/plain') || draggedStudentId; console.log(`Drop: Student ${studentBeingDroppedId} onto Unassigned List`); const wasSeatOccupied = tempClassroomLayout.seats.some(seat => seat.studentId === studentBeingDroppedId); if (!wasSeatOccupied) { console.log(" -> Student was already unassigned. No change needed."); draggedElement?.classList.remove('dragging'); draggedStudentId = null; draggedElement = null; return; } tempClassroomLayout.seats = tempClassroomLayout.seats.filter(seat => seat.studentId !== studentBeingDroppedId); console.log(" -> Updated Temp Layout (Drop on Unassigned):", JSON.parse(JSON.stringify(tempClassroomLayout.seats))); renderClassroomMap(currentClassId, true); draggedElement?.classList.remove('dragging'); draggedStudentId = null; draggedElement = null; };
    const clearSeatSelection = () => { /* ... (mantido) ... */ if (selectedSeatForAssignment) { selectedSeatForAssignment.classList.remove('selected-for-assignment'); selectedSeatForAssignment = null; console.log("Seat selection cleared."); } };
    const handleSeatClickForAssignment = (event) => { /* ... (mantido) ... */ const clickedSeat = event.currentTarget; if (!clickedSeat.classList.contains('empty') || !tempClassroomLayout) return; if (selectedSeatForAssignment === clickedSeat) { clearSeatSelection(); } else { clearSeatSelection(); selectedSeatForAssignment = clickedSeat; selectedSeatForAssignment.classList.add('selected-for-assignment'); console.log(`Seat selected for assignment: Row ${clickedSeat.dataset.row}, Col ${clickedSeat.dataset.col}`); } };
    const handleOccupiedSeatClick = (event) => { /* ... (mantido) ... */ const clickedSeat = event.currentTarget; if (!tempClassroomLayout || !clickedSeat.classList.contains('occupied')) return; const studentIdToUnassign = clickedSeat.dataset.studentId; const row = parseInt(clickedSeat.dataset.row); const col = parseInt(clickedSeat.dataset.col); if (!studentIdToUnassign) return; const student = findStudentById(studentIdToUnassign); if (confirm(`Desassociar aluno ${sanitizeHTML(student?.name || studentIdToUnassign)} desta mesa (R${row}, C${col})?`)) { console.log(`Click Unassign: Student ${studentIdToUnassign} from Row ${row}, Col ${col}`); tempClassroomLayout.seats = tempClassroomLayout.seats.filter(seat => !(seat.row === row && seat.col === col)); clearSeatSelection(); renderClassroomMap(currentClassId, true); } };
    const handleUnassignedStudentClickForAssignment = (event) => { /* ... (mantido) ... */ if (!selectedSeatForAssignment) { console.log("Unassigned student clicked, but no seat selected."); return; } const clickedStudentElement = event.currentTarget; const studentIdToAssign = clickedStudentElement.dataset.studentId; const targetRow = parseInt(selectedSeatForAssignment.dataset.row); const targetCol = parseInt(selectedSeatForAssignment.dataset.col); if (!studentIdToAssign || isNaN(targetRow) || isNaN(targetCol) || !tempClassroomLayout) { console.error("Error during click assignment: Missing data"); clearSeatSelection(); return; } console.log(`Click Assign: Student ${studentIdToAssign} to Row ${targetRow}, Col ${targetCol}`); let seatEntry = tempClassroomLayout.seats.find(s => s.row === targetRow && s.col === targetCol); if (!seatEntry) { seatEntry = { row: targetRow, col: targetCol, studentId: null }; tempClassroomLayout.seats.push(seatEntry); } else if (seatEntry.studentId) { console.warn(`Target seat ${targetRow}-${targetCol} was already occupied by ${seatEntry.studentId} during click assignment. Overwriting.`); } seatEntry.studentId = studentIdToAssign; console.log(" -> Updated Temp Layout (Click Assign):", JSON.parse(JSON.stringify(tempClassroomLayout.seats))); clearSeatSelection(); renderClassroomMap(currentClassId, true); };

    // --- Funções das Ferramentas (Mantidas como no original) ---
    const openNameSorterModal = () => { /* ... (mantido) ... */ const title = "Sorteador de Nomes"; let content = ''; let footer = ''; const currentClass = currentClassId ? findClassById(currentClassId) : null; const students = currentClass ? getStudentsByClass(currentClassId) : []; if (!currentClass) { content = '<p>Por favor, selecione uma turma na aba "Detalhes" para usar o sorteador.</p>'; } else if (students.length === 0) { content = `<p>Não há alunos cadastrados na turma "${sanitizeHTML(currentClass.name)}".</p>`; } else { sorterStudentList = [...students]; sorterAvailableStudents = [...students]; sorterDrawnStudents = []; content = `<p class="mb-1 text-sm text-secondary">Turma: ${sanitizeHTML(currentClass.name)}</p> <div id="sorter-result-display">-- Clique em Sortear --</div> <div class="sorter-controls mt-2"> <div class="checkbox-group mb-0"> <input type="checkbox" id="sorter-no-repeat"> <label for="sorter-no-repeat">Sortear sem Repetição</label> </div> <span id="sorter-remaining-count" class="sorter-info hidden">${students.length} restantes</span> </div>`; footer = `<button type="button" id="reset-sorter-button" class="secondary"><span class="icon">🔄</span> Reiniciar</button> <button type="button" id="sort-next-button" class="success"><span class="icon icon-sorteio"></span> Sortear Próximo</button>`; } showModal(title, content, footer, 'name-sorter-modal'); if (currentClass && students.length > 0) { const sortButton = document.getElementById('sort-next-button'); const resetButton = document.getElementById('reset-sorter-button'); const noRepeatCheckbox = document.getElementById('sorter-no-repeat'); const remainingCountDisplay = document.getElementById('sorter-remaining-count'); const resultDisplay = document.getElementById('sorter-result-display'); const updateRemainingCount = () => { if (noRepeatCheckbox.checked) { remainingCountDisplay.textContent = `${sorterAvailableStudents.length} restantes`; remainingCountDisplay.classList.remove('hidden'); sortButton.disabled = sorterAvailableStudents.length === 0; } else { remainingCountDisplay.classList.add('hidden'); sortButton.disabled = false; } }; sortButton.addEventListener('click', () => sortNextName(resultDisplay, noRepeatCheckbox.checked, updateRemainingCount)); resetButton.addEventListener('click', () => resetSorter(resultDisplay, updateRemainingCount)); noRepeatCheckbox.addEventListener('change', () => resetSorter(resultDisplay, updateRemainingCount)); } };
    const sortNextName = (displayElement, noRepeat, updateCountCallback) => { /* ... (mantido) ... */ let listToDrawFrom = noRepeat ? sorterAvailableStudents : sorterStudentList; if (listToDrawFrom.length === 0) { displayElement.textContent = "Fim!"; updateCountCallback(); return; } const randomIndex = Math.floor(Math.random() * listToDrawFrom.length); const drawnStudent = listToDrawFrom[randomIndex]; displayElement.innerHTML = `<span style="font-weight:normal; font-size: 0.8em; display:block;">${drawnStudent.number || '-.'}</span> ${sanitizeHTML(drawnStudent.name)}`; if (noRepeat) { sorterDrawnStudents.push(drawnStudent); sorterAvailableStudents.splice(randomIndex, 1); } updateCountCallback(); };
    const resetSorter = (displayElement, updateCountCallback) => { /* ... (mantido) ... */ sorterAvailableStudents = [...sorterStudentList]; sorterDrawnStudents = []; displayElement.textContent = "-- Reiniciado --"; updateCountCallback(); };
    const formatTime = (totalSeconds) => { /* ... (mantido) ... */ const hours = Math.floor(totalSeconds / 3600); const minutes = Math.floor((totalSeconds % 3600) / 60); const seconds = totalSeconds % 60; return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`; };
    const updateStopwatchDisplay = () => { /* ... (mantido) ... */ const display = document.getElementById('timer-display'); if (display) { display.textContent = formatTime(stopwatchSeconds); } };
    const startStopwatch = () => { /* ... (mantido) ... */ if (isStopwatchRunning) return; isStopwatchRunning = true; document.getElementById('start-timer-button')?.classList.add('hidden'); document.getElementById('pause-timer-button')?.classList.remove('hidden'); stopwatchInterval = setInterval(() => { stopwatchSeconds++; updateStopwatchDisplay(); }, 1000); };
    const pauseStopwatch = () => { /* ... (mantido) ... */ if (!isStopwatchRunning) return; isStopwatchRunning = false; clearInterval(stopwatchInterval); stopwatchInterval = null; document.getElementById('start-timer-button')?.classList.remove('hidden'); document.getElementById('pause-timer-button')?.classList.add('hidden'); };
    const resetStopwatch = () => { /* ... (mantido) ... */ pauseStopwatch(); stopwatchSeconds = 0; updateStopwatchDisplay(); };
    const openTimerModal = () => { /* ... (mantido) ... */ const title = "Cronômetro / Timer"; if (stopwatchInterval) clearInterval(stopwatchInterval); stopwatchInterval = null; stopwatchSeconds = 0; isStopwatchRunning = false; const content = `<div id="timer-display">00:00:00</div> <div class="timer-controls"> <button type="button" id="start-timer-button" class="success"><span class="icon">▶️</span> Iniciar</button> <button type="button" id="pause-timer-button" class="warning hidden"><span class="icon">⏸️</span> Pausar</button> <button type="button" id="reset-timer-button" class="secondary"><span class="icon">🔄</span> Zerar</button> </div> <hr style="margin: 1.5rem 0 1rem 0; border-color: var(--border-color);"> <p class="text-center text-secondary text-sm">Funcionalidade de Timer (contagem regressiva) em desenvolvimento.</p>`; showModal(title, content, '', 'timer-modal'); document.getElementById('start-timer-button')?.addEventListener('click', startStopwatch); document.getElementById('pause-timer-button')?.addEventListener('click', pauseStopwatch); document.getElementById('reset-timer-button')?.addEventListener('click', resetStopwatch); modal.addEventListener('click', (e) => { if (e.target === modal || e.target.closest('.close-button')) { pauseStopwatch(); } }); };
    const openGroupGeneratorModal = () => { /* ... (mantido) ... */ const title = "Gerador de Grupos"; let content = ''; let footer = ''; const currentClass = currentClassId ? findClassById(currentClassId) : null; const students = currentClass ? getStudentsByClass(currentClassId) : []; if (!currentClass) { content = '<p>Por favor, selecione uma turma na aba "Detalhes" para usar o gerador.</p>'; } else if (students.length === 0) { content = `<p>Não há alunos cadastrados na turma "${sanitizeHTML(currentClass.name)}".</p>`; } else { content = ` <p class="mb-1 text-sm text-secondary">Turma: ${sanitizeHTML(currentClass.name)} (${students.length} alunos)</p> <div class="group-options"> <div class="radio-group"> <input type="radio" id="group-by-number" name="group-method" value="number" checked> <label for="group-by-number">Dividir em:</label> <input type="number" id="group-number-input" value="2" min="2"> <label for="group-number-input">grupos</label> </div> <div class="radio-group"> <input type="radio" id="group-by-size" name="group-method" value="size"> <label for="group-by-size">Grupos de:</label> <input type="number" id="group-size-input" value="2" min="1"> <label for="group-size-input">alunos</label> </div> </div> <div id="group-results-container"> <!-- Results will be displayed here --> <p class="text-secondary text-center mt-2">Clique em "Gerar Grupos".</p> </div> `; footer = `<button type="button" id="generate-groups-button" class="success"><span class="icon icon-grupos"></span> Gerar Grupos</button>`; } showModal(title, content, footer, 'group-generator-modal'); if (currentClass && students.length > 0) { const generateButton = document.getElementById('generate-groups-button'); const numberInput = document.getElementById('group-number-input'); const sizeInput = document.getElementById('group-size-input'); const numberRadio = document.getElementById('group-by-number'); const sizeRadio = document.getElementById('group-by-size'); const resultsContainer = document.getElementById('group-results-container'); numberRadio.addEventListener('change', () => { numberInput.disabled = false; sizeInput.disabled = true; }); sizeRadio.addEventListener('change', () => { numberInput.disabled = true; sizeInput.disabled = false; }); numberInput.disabled = !numberRadio.checked; sizeInput.disabled = !sizeRadio.checked; generateButton.addEventListener('click', () => generateGroups(students, resultsContainer)); } };
    const shuffleArray = (array) => { /* ... (mantido) ... */ for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } return array; };
    const generateGroups = (studentList, resultsContainer) => { /* ... (mantido) ... */ const method = document.querySelector('input[name="group-method"]:checked').value; const numberInput = document.getElementById('group-number-input'); const sizeInput = document.getElementById('group-size-input'); const shuffledStudents = shuffleArray([...studentList]); let groups = []; resultsContainer.innerHTML = ''; try { if (method === 'number') { const numGroups = parseInt(numberInput.value); if (isNaN(numGroups) || numGroups < 2 || numGroups > shuffledStudents.length) { alert("Número de grupos inválido. Deve ser entre 2 e o número de alunos."); return; } for (let i = 0; i < numGroups; i++) groups.push([]); let currentGroupIndex = 0; shuffledStudents.forEach(student => { groups[currentGroupIndex].push(student); currentGroupIndex = (currentGroupIndex + 1) % numGroups; }); } else { const groupSize = parseInt(sizeInput.value); if (isNaN(groupSize) || groupSize < 1) { alert("Tamanho do grupo inválido. Deve ser pelo menos 1."); return; } for (let i = 0; i < shuffledStudents.length; i += groupSize) { groups.push(shuffledStudents.slice(i, i + groupSize)); } } if (groups.length > 0) { groups.forEach((group, index) => { const groupDiv = document.createElement('div'); groupDiv.classList.add('generated-group'); const groupTitle = document.createElement('h5'); groupTitle.textContent = `Grupo ${index + 1}`; groupDiv.appendChild(groupTitle); const ul = document.createElement('ul'); group.forEach(student => { const li = document.createElement('li'); li.innerHTML = `<span class="student-number">${student.number || '-.'}</span> ${sanitizeHTML(student.name)}`; ul.appendChild(li); }); groupDiv.appendChild(ul); resultsContainer.appendChild(groupDiv); }); } else { resultsContainer.innerHTML = '<p class="text-secondary text-center mt-2">Não foi possível gerar grupos com essas opções.</p>'; } } catch (error) { console.error("Erro ao gerar grupos:", error); resultsContainer.innerHTML = '<p class="text-danger text-center mt-2">Ocorreu um erro ao gerar os grupos.</p>'; } };
    const openAdvancedCalculatorModal = () => { /* ... (mantido) ... */ resetCalculator(); switchCalculatorMode('standard'); calculatorModal?.classList.add('show'); const currentCalcButtonsContainer = document.querySelector('#calculator-standard-section .calculator-buttons'); currentCalcButtonsContainer?.removeEventListener('click', handleCalculatorButtonClick); currentCalcButtonsContainer?.addEventListener('click', handleCalculatorButtonClick); if(calcModeStandardBtn) calcModeStandardBtn.onclick = () => switchCalculatorMode('standard'); if(calcModeWeightedBtn) calcModeWeightedBtn.onclick = () => switchCalculatorMode('weighted'); if(addPairButton) addPairButton.onclick = addWeightedPair; if(calculateWeightedAvgButton) calculateWeightedAvgButton.onclick = calculateWeightedAverage; calculatorModal?.querySelectorAll('[data-dismiss="modal"]').forEach(btn => { btn.onclick = hideModal; }); calculatorModal?.addEventListener('click', (e) => { if (e.target === calculatorModal) { hideModal(); } }, { once: false }); };
    const openToolModal = (toolType) => { /* ... (mantido) ... */ if (toolType === 'advanced-calculator') { openAdvancedCalculatorModal(); return; } let title = "Ferramenta"; let content = "<p>Funcionalidade em desenvolvimento.</p>"; let modalClass = ''; let footer = ''; switch (toolType) { case 'name-sorter': openNameSorterModal(); return; case 'timer-stopwatch': openTimerModal(); return; case 'group-generator': openGroupGeneratorModal(); return; default: title = "Funcionalidade Indisponível"; content = "<p>Esta ferramenta ainda não foi implementada.</p>"; } showModal(title, content, footer, modalClass); };

    // --- Funções da Calculadora (Mantidas como no original) ---
    const updateCalculatorDisplay = () => { /* ... (mantido) ... */ if(calculatorDisplay) { calculatorDisplay.textContent = calculator.displayValue.replace('.', ','); } };
    const resetCalculator = () => { /* ... (mantido) ... */ calculator.displayValue = '0'; calculator.firstOperand = null; calculator.waitingForSecondOperand = false; calculator.operator = null; calculator.weightedPairs = []; if(weightedAverageResult) weightedAverageResult.textContent = '--'; renderWeightedPairsList(); updateCalculatorDisplay(); console.log('Calculator reset'); };
    const inputDigit = (digit) => { /* ... (mantido) ... */ const { displayValue, waitingForSecondOperand } = calculator; if (waitingForSecondOperand) { calculator.displayValue = digit; calculator.waitingForSecondOperand = false; } else { calculator.displayValue = displayValue === '0' ? digit : displayValue + digit; } updateCalculatorDisplay(); };
    const inputDecimal = () => { /* ... (mantido) ... */ if (calculator.waitingForSecondOperand) { calculator.displayValue = '0.'; calculator.waitingForSecondOperand = false; updateCalculatorDisplay(); return; } if (!calculator.displayValue.includes('.')) { calculator.displayValue += '.'; } updateCalculatorDisplay(); };
    const handleOperator = (nextOperator) => { /* ... (mantido) ... */ const { firstOperand, displayValue, operator } = calculator; const inputValue = parseFloat(displayValue.replace(',', '.')); if (operator && calculator.waitingForSecondOperand) { calculator.operator = nextOperator; console.log('Operator changed to', nextOperator); return; } if (firstOperand === null && !isNaN(inputValue)) { calculator.firstOperand = inputValue; } else if (operator) { const result = performCalculation[operator](firstOperand, inputValue); const resultString = Number.isFinite(result) ? String(result) : 'Erro'; calculator.displayValue = resultString; calculator.firstOperand = result; updateCalculatorDisplay(); } calculator.waitingForSecondOperand = true; calculator.operator = nextOperator; console.log('State after operator:', JSON.parse(JSON.stringify(calculator))); };
    const performCalculation = { /* ... (mantido) ... */ 'divide': (first, second) => second === 0 ? NaN : first / second, 'multiply': (first, second) => first * second, 'add': (first, second) => first + second, 'subtract': (first, second) => first - second, '=': (first, second) => second, };
    const clearAll = () => { /* ... (mantido) ... */ resetCalculator(); };
    const clearEntry = () => { /* ... (mantido) ... */ if (calculator.waitingForSecondOperand) { resetCalculator(); } else { calculator.displayValue = '0'; } updateCalculatorDisplay(); };
    const backspace = () => { /* ... (mantido) ... */ if (calculator.waitingForSecondOperand) return; calculator.displayValue = calculator.displayValue.slice(0, -1); if (calculator.displayValue === '' || calculator.displayValue === '-') { calculator.displayValue = '0'; } updateCalculatorDisplay(); };
    const handleCalculatorButtonClick = (event) => { /* ... (mantido) ... */ const { target } = event; if (!target.matches('button')) return; const action = target.dataset.action; const value = target.dataset.value; const operator = target.dataset.operator; console.log(`Button Click: action=${action}, value=${value}, operator=${operator}`); if (value !== undefined) { inputDigit(value); } else if (operator !== undefined) { handleOperator(operator); } else if (action === 'decimal') { inputDecimal(); } else if (action === 'clearAll') { clearAll(); } else if (action === 'clearEntry') { clearEntry(); } else if (action === 'backspace') { backspace(); } else if (action === 'calculate') { if (calculator.operator && calculator.firstOperand !== null) { handleOperator(calculator.operator); calculator.operator = null; calculator.waitingForSecondOperand = false; } } };
    const addWeightedPair = () => { /* ... (mantido) ... */ const gradeStr = weightedGradeInput.value.trim().replace(',', '.'); const weightStr = weightedWeightInput.value.trim().replace(',', '.'); const grade = parseFloat(gradeStr); const weight = parseFloat(weightStr); if (isNaN(grade)) { alert("Por favor, insira uma nota válida."); weightedGradeInput.focus(); return; } if (isNaN(weight) || weight <= 0) { alert("Por favor, insira um peso válido (maior que zero)."); weightedWeightInput.focus(); return; } calculator.weightedPairs.push({ grade, weight }); renderWeightedPairsList(); weightedGradeInput.value = ''; weightedWeightInput.value = ''; weightedGradeInput.focus(); weightedAverageResult.textContent = '--'; };
    const renderWeightedPairsList = () => { /* ... (mantido) ... */ if (!weightedPairsList) return; weightedPairsList.innerHTML = ''; if (calculator.weightedPairs.length === 0) { weightedPairsList.innerHTML = '<p>Nenhum par adicionado.</p>'; if (calculateWeightedAvgButton) calculateWeightedAvgButton.disabled = true; return; } if (calculateWeightedAvgButton) calculateWeightedAvgButton.disabled = false; const template = document.getElementById('weighted-pair-item-template'); calculator.weightedPairs.forEach((pair, index) => { const clone = template.content.cloneNode(true); const li = clone.querySelector('.pair-item'); li.dataset.index = index; const textSpan = li.querySelector('span'); textSpan.querySelector('strong:nth-child(1)').textContent = String(pair.grade).replace('.', ','); textSpan.querySelector('strong:nth-child(2)').textContent = String(pair.weight).replace('.', ','); const deleteButton = li.querySelector('.delete-pair-button'); deleteButton.addEventListener('click', () => removeWeightedPair(index)); weightedPairsList.appendChild(clone); }); };
    const removeWeightedPair = (index) => { /* ... (mantido) ... */ if (index >= 0 && index < calculator.weightedPairs.length) { calculator.weightedPairs.splice(index, 1); renderWeightedPairsList(); if(weightedAverageResult) weightedAverageResult.textContent = '--'; } };
    const calculateWeightedAverage = () => { /* ... (mantido) ... */ if (!weightedAverageResult) return; if (calculator.weightedPairs.length === 0) { weightedAverageResult.textContent = '--'; return; } let totalWeightedSum = 0; let totalWeight = 0; calculator.weightedPairs.forEach(pair => { totalWeightedSum += pair.grade * pair.weight; totalWeight += pair.weight; }); if (totalWeight === 0) { weightedAverageResult.textContent = 'Erro (Peso 0)'; return; } const average = totalWeightedSum / totalWeight; weightedAverageResult.textContent = `Média: ${average.toFixed(2).replace('.', ',')}`; };
    const switchCalculatorMode = (mode) => { /* ... (mantido) ... */ calculator.mode = mode; resetCalculator(); if (mode === 'standard') { standardCalcSection?.classList.remove('hidden'); weightedCalcSection?.classList.add('hidden'); calcModeStandardBtn?.classList.add('active'); calcModeWeightedBtn?.classList.remove('active'); } else { standardCalcSection?.classList.add('hidden'); weightedCalcSection?.classList.remove('hidden'); calcModeStandardBtn?.classList.remove('active'); calcModeWeightedBtn?.classList.add('active'); } };

    // --- Funções de Notificação e Som (Mantidas) ---
    const notificationMessages = { /* ... (mantido) ... */ start: ["🚀 Preparar... Apontar... Aula! Sua aula ({CLASS}) na {SCHOOL} começa em 5 minutos.", "☕ Último gole de café? Sua aula ({CLASS}) na {SCHOOL} começa em 5 minutos!", "🔔 O sino quase tocou! Aula ({CLASS}) na {SCHOOL} em 5 minutos. ", "🏃 Corre, professor! Faltam 5 minutos para a aula ({CLASS}) na {SCHOOL} começar.", "✨ Hora de brilhar! Sua aula ({CLASS}) na {SCHOOL} inicia em 5 minutos.", "⏰ Tic-tac... 5 minutos para o início da aula ({CLASS}) na {SCHOOL}!"], end: ["🏁 Quase lá! Sua aula ({CLASS}) na {SCHOOL} termina em 5 minutos.", "😮‍💨 Ufa! Só mais 5 minutinhos de aula ({CLASS}) na {SCHOOL}.", "🔔 O sino da liberdade (quase)! Aula ({CLASS}) na {SCHOOL} acaba em 5 minutos.", "🎯 Missão quase completa! A aula ({CLASS}) na {SCHOOL} termina em 5 minutos.", "👏 Bom trabalho! Reta final da aula ({CLASS}) na {SCHOOL} - 5 minutos restantes.", "⏳ Contagem regressiva: 5 minutos para o fim da aula ({CLASS}) na {SCHOOL}."] };
    const getRandomMessage = (type, scheduleItem) => { /* ... (mantido) ... */ const messages = notificationMessages[type]; if (!messages || messages.length === 0) return "Alerta de Horário!"; const randomIndex = Math.floor(Math.random() * messages.length); let message = messages[randomIndex]; const school = findSchoolById(scheduleItem.schoolId); message = message.replace('{CLASS}', sanitizeHTML(scheduleItem.note || '')); message = message.replace('{SCHOOL}', sanitizeHTML(school?.name || 'escola')); return message; };
    const showNotification = (message) => { /* ... (mantido) ... */ if (!notificationBanner || !notificationMessage) return; notificationMessage.innerHTML = message; notificationBanner.classList.add('show'); playSound(); setTimeout(hideNotification, 10000); };
    const hideNotification = () => { /* ... (mantido) ... */ if (notificationBanner) notificationBanner.classList.remove('show'); };
    const playSound = () => { /* ... (mantido) ... */ if (!appData.settings.notificationSoundEnabled) return; if (appData.settings.customNotificationSound) { try { const customAudio = new Audio(appData.settings.customNotificationSound); customAudio.play().catch(error => { console.warn("Erro ao tocar som personalizado:", error); defaultNotificationSound?.play().catch(e => console.warn("Erro ao tocar som padrão (fallback):", e)); }); } catch (error) { console.error("Erro ao criar Audio com som personalizado:", error); defaultNotificationSound?.play().catch(e => console.warn("Erro ao tocar som padrão (fallback 2):", e)); } } else { defaultNotificationSound?.play().catch(error => { console.warn("Erro ao tocar som da notificação padrão:", error); }); } };
    const checkNotifications = () => { /* ... (mantido) ... */ shownNotificationsThisMinute = {}; if (!appData.settings.globalNotificationsEnabled) { return; } const now = new Date(); const currentDayIndex = now.getDay(); const currentDayName = weekdays[currentDayIndex]; const currentHour = now.getHours(); const currentMinute = now.getMinutes(); appData.schedule.forEach(item => { if (!item.notificationsEnabled || item.day !== currentDayName || !item.startTime || !item.endTime) { return; } const notificationKeyBase = item.id; try { const [startHour, startMinute] = item.startTime.split(':').map(Number); const [endHour, endMinute] = item.endTime.split(':').map(Number); if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) { console.warn(`Invalid time format for schedule item ${item.id}`); return; } let notifyStartMinute = startMinute - NOTIFICATION_LEAD_TIME_MINUTES; let notifyStartHour = startHour; if (notifyStartMinute < 0) { notifyStartMinute += 60; notifyStartHour -= 1; if (notifyStartHour < 0) notifyStartHour = 23; } let notifyEndMinute = endMinute - NOTIFICATION_LEAD_TIME_MINUTES; let notifyEndHour = endHour; if (notifyEndMinute < 0) { notifyEndMinute += 60; notifyEndHour -= 1; if (notifyEndHour < 0) notifyEndHour = 23; } const startNotificationKey = notificationKeyBase + '_start'; if (currentHour === notifyStartHour && currentMinute === notifyStartMinute) { if (!shownNotificationsThisMinute[startNotificationKey]) { console.log(`Triggering START notification for ${item.id}`); const message = getRandomMessage('start', item); showNotification(message); shownNotificationsThisMinute[startNotificationKey] = true; } } const endNotificationKey = notificationKeyBase + '_end'; if (currentHour === notifyEndHour && currentMinute === notifyEndMinute) { if (!shownNotificationsThisMinute[endNotificationKey]) { console.log(`Triggering END notification for ${item.id}`); const message = getRandomMessage('end', item); showNotification(message); shownNotificationsThisMinute[endNotificationKey] = true; } } } catch (error) { console.error(`Error processing schedule item ${item.id}:`, error); } }); };
    const startNotificationChecker = () => { /* ... (mantido) ... */ if (notificationCheckInterval) { clearInterval(notificationCheckInterval); } console.log("Starting notification checker..."); checkNotifications(); notificationCheckInterval = setInterval(checkNotifications, 60000); };
    const stopNotificationChecker = () => { /* ... (mantido) ... */ if (notificationCheckInterval) { clearInterval(notificationCheckInterval); notificationCheckInterval = null; console.log("Stopped notification checker."); } };
    const updateNotificationSettingsUI = () => { /* ... (mantido) ... */ if (enableGlobalNotificationsCheckbox && enableNotificationSoundCheckbox) { enableGlobalNotificationsCheckbox.checked = appData.settings.globalNotificationsEnabled; enableNotificationSoundCheckbox.checked = appData.settings.notificationSoundEnabled; enableNotificationSoundCheckbox.disabled = !appData.settings.globalNotificationsEnabled; } };
    const updateCustomSoundUI = () => { /* ... (mantido) ... */ if (!customSoundFilenameDisplay || !currentCustomSoundDisplay || !currentCustomSoundName || !removeCustomSoundButton) return; const soundName = localStorage.getItem('superProfessorPro_customSoundName'); if (appData.settings.customNotificationSound && soundName) { customSoundFilenameDisplay.textContent = soundName; customSoundFilenameDisplay.title = soundName; currentCustomSoundName.textContent = soundName; currentCustomSoundDisplay.classList.remove('hidden'); } else { appData.settings.customNotificationSound = null; localStorage.removeItem('superProfessorPro_customSoundName'); customSoundFilenameDisplay.textContent = 'Nenhum arquivo escolhido'; customSoundFilenameDisplay.title = ''; currentCustomSoundDisplay.classList.add('hidden'); currentCustomSoundName.textContent = ''; } if (customNotificationSoundInput) customNotificationSoundInput.value = null; };
    const handleCustomSoundUpload = (event) => { /* ... (mantido) ... */ const file = event.target.files[0]; if (!file) { return; } if (!file.type.startsWith('audio/')) { alert('Por favor, selecione um arquivo de áudio válido (MP3, WAV, OGG, etc.).'); updateCustomSoundUI(); return; } const fileSizeMB = file.size / 1024 / 1024; if (fileSizeMB > MAX_CUSTOM_SOUND_SIZE_MB) { alert(`Arquivo muito grande (${fileSizeMB.toFixed(1)}MB). O limite é ${MAX_CUSTOM_SOUND_SIZE_MB}MB.`); updateCustomSoundUI(); return; } const reader = new FileReader(); reader.onload = (e) => { appData.settings.customNotificationSound = e.target.result; localStorage.setItem('superProfessorPro_customSoundName', file.name); saveData(); updateCustomSoundUI(); alert(`Som "${file.name}" carregado com sucesso!`); }; reader.onerror = (e) => { console.error("Erro ao ler arquivo de áudio:", e); alert("Ocorreu um erro ao tentar carregar o arquivo de som."); updateCustomSoundUI(); }; reader.readAsDataURL(file); };
    const removeCustomSound = () => { /* ... (mantido) ... */ if (confirm("Remover o som de notificação personalizado?")) { appData.settings.customNotificationSound = null; localStorage.removeItem('superProfessorPro_customSoundName'); saveData(); updateCustomSoundUI(); alert("Som personalizado removido."); } };

    // --- Funções de Ações de Presença (Mantidas) ---
    const markAllStudentsPresent = () => { /* ... (mantido) ... */ const date = attendanceDateInput.value; if (!currentClassId || !date) { alert("Selecione uma turma e uma data primeiro."); return; } const studentsInClass = getStudentsByClass(currentClassId); if (studentsInClass.length === 0) return; console.log(`Action: Marking all present for class ${currentClassId} on ${date}`); studentsInClass.forEach(student => { if (!isStudentSuspendedOnDate(student.id, date)) { if (!student.attendance[date]) student.attendance[date] = { status: null, justification: '' }; student.attendance[date].status = 'P'; student.attendance[date].justification = ''; } }); renderAttendanceTable(currentClassId, date); console.log("Data updated for Mark All Present. Remember to Save."); };
    const toggleNonSchoolDay = () => { /* ... (mantido) ... */ const date = attendanceDateInput.value; if (!currentClassId || !date) { alert("Selecione uma turma e uma data primeiro."); return; } const studentsInClass = getStudentsByClass(currentClassId); if (studentsInClass.length === 0) return; const isCurrentlyNonSchool = studentsInClass.every(std => std.attendance[date]?.status === 'H'); if (isCurrentlyNonSchool) { if (confirm(`Deseja desmarcar ${formatDate(date)} como dia NÃO LETIVO?\nA presença dos alunos será resetada para esta data.`)) { studentsInClass.forEach(student => { if (student.attendance[date]?.status === 'H') { student.attendance[date].status = null; student.attendance[date].justification = ''; }}); console.log("Action: Unmarked Non-School Day in data."); renderAttendanceTable(currentClassId, date); alert(`Dia ${formatDate(date)} desmarcado como não letivo. Clique em Salvar Presença para confirmar.`); } } else { if (confirm(`Deseja marcar ${formatDate(date)} como dia NÃO LETIVO para esta turma?\nToda a presença registrada nesta data será substituída por 'H'.`)) { studentsInClass.forEach(student => { if (!student.attendance[date]) student.attendance[date] = {}; student.attendance[date].status = 'H'; student.attendance[date].justification = ''; }); console.log("Action: Marked Non-School Day in data."); renderAttendanceTable(currentClassId, date); alert(`Dia ${formatDate(date)} marcado como não letivo. Clique em Salvar Presença para confirmar.`); } } };

    // --- Event Listeners Globais (Atualizados/Novos) ---
    navButtons.forEach(button => { button.addEventListener('click', () => { const targetSection = button.dataset.section; if (button.disabled) return; showSection(targetSection); }); });
    addScheduleButton.addEventListener('click', () => openScheduleModal());
    addSchoolButton.addEventListener('click', () => openSchoolModal());
    addClassButton.addEventListener('click', () => { if(currentSchoolId) openClassModal(); else alert("Selecione uma escola primeiro!"); });
    backToSchoolsButton.addEventListener('click', () => { currentSchoolId = null; currentClassId = null; showSection('schools-section'); });
    // backToClassesButton agora está dentro do #class-details-header, o listener é adicionado dinamicamente se existir
    if (backToClassesButton) {
        backToClassesButton.addEventListener('click', () => {
            if (tempClassroomLayout) { cancelClassroomMapEdit(); } // Cancela edição do mapa se houver
            showSection('classes-section');
        });
    }
    // NOVO: Listener para o botão de Ajuda
    if (detailsHelpButton) {
        detailsHelpButton.addEventListener('click', showHelpModal);
    }
     // NOVO: Listener para scroll e ajuste do header sticky
     if (mainContent && classDetailsHeader) {
        mainContent.addEventListener('scroll', () => {
            classDetailsHeader.classList.toggle('scrolled', mainContent.scrollTop > 10); // Adiciona/remove classe .scrolled
        });
    }
    // Listener combinado para fechar modais
    const combinedModalCloseHandler = (e) => { /* ... (mantido) ... */ const targetModal = e.currentTarget; if (e.target === targetModal || e.target.closest('.close-button[data-dismiss="modal"]') || e.target.matches('button[data-dismiss="modal"]')) { if (targetModal.id === 'generic-modal' && targetModal.querySelector('.timer-modal .modal-content')) { pauseStopwatch(); } hideModal(); } };
    modal.addEventListener('click', combinedModalCloseHandler);
    calculatorModal.addEventListener('click', combinedModalCloseHandler);
    document.getElementById('add-student-button').addEventListener('click', () => { if(currentClassId) openStudentModal(); else alert("Selecione uma turma primeiro!"); });
    gradeSetSelect.addEventListener('change', (e) => { if(currentClassId) { renderGradesTable(currentClassId, e.target.value); } });
    manageGradeStructureButton.addEventListener('click', openGradeStructureModal);
    saveGradesButton.addEventListener('click', saveGrades);
    exportGradesCsvButton?.addEventListener('click', exportGradesCSV);
    exportGradesPdfButton?.addEventListener('click', () => exportGradesPDF());
    attendanceDateInput.addEventListener('change', (e) => { if(currentClassId) { renderAttendanceTable(currentClassId, e.target.value); } });
    markAllPresentButton.addEventListener('click', markAllStudentsPresent);
    markNonSchoolDayButton.addEventListener('click', toggleNonSchoolDay);
    lessonPlanDateInput.addEventListener('change', (e) => { if(currentClassId) { renderLessonPlan(currentClassId, e.target.value); } });
    saveLessonPlanButton.addEventListener('click', saveLessonPlan);
    saveAttendanceButton.addEventListener('click', saveAttendance);
    viewMonthlyAttendanceButton.addEventListener('click', openMonthlyAttendanceModal);
    editClassNotesButton.addEventListener('click', () => toggleClassNotesEdit(true));
    saveClassNotesButton.addEventListener('click', saveClassNotes);
    cancelClassNotesButton.addEventListener('click', () => toggleClassNotesEdit(false));
    document.querySelectorAll('.theme-button').forEach(button => { button.addEventListener('click', () => {applyTheme(button.dataset.theme); saveData();}); });
    document.getElementById('export-data-button').addEventListener('click', exportData);
    document.getElementById('import-data-input').addEventListener('change', importData);
    document.getElementById('clear-data-button').addEventListener('click', clearAllData);
    searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { performSearch(searchInput.value); } });
    searchInput.addEventListener('input', () => { /* No dynamic search */ });
    searchInput.addEventListener('search', () => { if (!searchInput.value) { hideModal(); } });
    notificationCloseButton?.addEventListener('click', hideNotification);
    enableGlobalNotificationsCheckbox?.addEventListener('change', (e) => { /* ... (mantido) ... */ appData.settings.globalNotificationsEnabled = e.target.checked; enableNotificationSoundCheckbox.disabled = !e.target.checked; if (!e.target.checked) { stopNotificationChecker(); hideNotification(); } else { startNotificationChecker(); } saveData(); });
    enableNotificationSoundCheckbox?.addEventListener('change', (e) => { /* ... (mantido) ... */ appData.settings.notificationSoundEnabled = e.target.checked; saveData(); });
    customNotificationSoundInput?.addEventListener('change', handleCustomSoundUpload);
    removeCustomSoundButton?.addEventListener('click', removeCustomSound);
    editMapButton.addEventListener('click', editClassroomMap);
    cancelMapEditButton.addEventListener('click', cancelClassroomMapEdit);
    saveMapButton.addEventListener('click', saveClassroomLayout);
    unassignedStudentsContainer.addEventListener('dragover', handleDragOver);
    unassignedStudentsContainer.addEventListener('dragleave', handleDragLeave);
    unassignedStudentsContainer.addEventListener('drop', handleDropOnUnassignedList);
    // Listener para colapsar cards (agora no mainContent)
    mainContent.addEventListener('click', (e) => { const toggleButton = e.target.closest('.card-toggle-button'); if (toggleButton) { const card = toggleButton.closest('.card'); const icon = toggleButton.querySelector('.icon'); if (card && icon) { const isCollapsed = card.classList.toggle('collapsed'); icon.classList.toggle('icon-chevron-down', isCollapsed); icon.classList.toggle('icon-chevron-up', !isCollapsed); toggleButton.title = isCollapsed ? 'Mostrar' : 'Esconder'; } } });
    toolsGrid?.addEventListener('click', (e) => { const toolCard = e.target.closest('.tool-card'); if (toolCard && toolCard.dataset.tool) { const toolType = toolCard.dataset.tool; openToolModal(toolType); } });
    // NOVO: Listener para clique na linha de aluno suspenso na tabela de presença
    attendanceTableContainer.addEventListener('click', (e) => {
        const suspendedRow = e.target.closest('tr.clickable-suspended');
        if (suspendedRow) {
            const studentId = suspendedRow.dataset.studentId;
            const noteIndex = parseInt(suspendedRow.dataset.suspensionNoteIndex); // Pega o índice armazenado
            if (studentId && !isNaN(noteIndex)) {
                console.log(`Linha suspensa clicada para ${studentId}, abrindo nota índice ${noteIndex}`);
                openStudentNotesModal(studentId, noteIndex); // Abre modal destacando a nota correta
            }
        }
    });
     window.addEventListener('beforeunload', saveAppState);

    // --- Inicialização ---
    const init = () => {
        const dataWasLoaded = loadData();
        restoreAppState();
        renderScheduleList();
        renderSchoolList();
        applyTheme(appData.settings.theme);
        updateNotificationSettingsUI();
        updateCustomSoundUI();
        const todayStr = getCurrentDateString();
        if (attendanceDateInput) attendanceDateInput.value = todayStr;
        if (lessonPlanDateInput) lessonPlanDateInput.value = todayStr;

        // Renderiza a seção correta e dados associados
        if (currentSection === 'classes-section' && currentSchoolId) {
            renderClassList(currentSchoolId);
        } else if (currentSection === 'class-details-section' && currentClassId) {
            selectClass(currentClassId, true); // Força recarga para garantir UI atualizada
        } else if (currentSection === 'schools-section') {
           // Já renderizado por renderSchoolList()
        } else if (currentSection === 'schedule-section') {
           // Já renderizado por renderScheduleList()
        }
        // Mostra a seção correta
        showSection(currentSection || 'schedule-section');

        if (appData.settings.globalNotificationsEnabled) {
            startNotificationChecker();
        }
    };

    init(); // Chama a inicialização

    // --- Service Worker Registration (Mantido) ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/pwabuilder-sw.js', { scope: '/' }) // Tenta escopo raiz
                .then(registration => { console.log('ServiceWorker registration successful with scope: ', registration.scope); })
                .catch(err => { console.log('ServiceWorker registration failed (scope /): ', err); navigator.serviceWorker.register('pwabuilder-sw.js') // Fallback relativo
                        .then(registration => { console.log('ServiceWorker registration successful with relative path scope: ', registration.scope); })
                        .catch(err2 => { console.log('ServiceWorker registration failed (relative path): ', err2); if (err2.message.includes('404') || err.message.includes('404')) { console.warn("Service Worker file 'pwabuilder-sw.js' not found."); } else if (err.message.includes('scope') || err2.message.includes('scope')) { console.warn("Service Worker registration failed due to scope mismatch or security issues."); } }); }); });
    }

}); // Fim do DOMContentLoaded