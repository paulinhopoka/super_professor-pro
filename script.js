/* --- INÍCIO ARQUIVO: script.js (MODIFICADO) --- */

document.addEventListener('DOMContentLoaded', () => {
    // --- Seletores Globais (Existentes) ---
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
    const schoolListContainer = document.getElementById('school-list'); // Já existe
    const classListContainer = document.getElementById('class-list');
    const classesSchoolName = document.getElementById('classes-school-name');
    // Removido: studentListContainer (agora gerenciado pelo módulo)
    // Removido: classDetailsSection (referência principal usada pelo módulo)
    // Removido: classDetailsHeader (agora dentro da section e gerenciado pelo módulo)
    // Removido: classDetailsTitle (agora dentro do header sticky gerenciado pelo módulo)
    const backToSchoolsButton = document.getElementById('back-to-schools-button');
    const backToClassesButton = document.getElementById('back-to-classes-button');
    const navClassesButton = document.getElementById('nav-classes-button');
    const navDetailsButton = document.getElementById('nav-details-button');
    const gradesTableContainer = document.getElementById('grades-table-container');
    // Removido: attendanceTableContainer (agora gerenciado pelo módulo)
    const gradeSetSelect = document.getElementById('grade-set-select');
    const manageGradeStructureButton = document.getElementById('manage-grade-structure-button');
    const saveGradesButton = document.getElementById('save-grades-button');
    const exportGradesCsvButton = document.getElementById('export-grades-csv-button');
    const exportGradesPdfButton = document.getElementById('export-grades-pdf-button');
    // Removido: attendanceDateInput (agora gerenciado pelo módulo)
    // Removido: saveAttendanceButton (agora gerenciado pelo módulo)
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
    const addStudentButton = document.getElementById('add-student-button'); // Botão de adicionar aluno (agora no card de detalhes)
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
    let sorterStudentList = [];
    let sorterAvailableStudents = [];
    let sorterDrawnStudents = [];
    let stopwatchInterval = null;
    let stopwatchSeconds = 0;
    let isStopwatchRunning = false;
    let calculator = { displayValue: '0', firstOperand: null, waitingForSecondOperand: false, operator: null, mode: 'standard', weightedPairs: [] };
    const DATA_STORAGE_KEY = 'superProfessorProData_v15';
    const OLD_DATA_STORAGE_KEY_V14 = 'superProfessorProData_v14';

    let appData = { schools: [], classes: [], students: [], schedule: [], settings: { theme: 'theme-light', globalNotificationsEnabled: true, notificationSoundEnabled: true, customNotificationSound: null } };
    let currentSchoolId = null; let currentClassId = null; let currentSection = 'schedule-section';

    // --- Funções de Estado e Persistência (Inalteradas) ---
    const saveAppState = () => { try { localStorage.setItem('lastSection', currentSection || 'schedule-section'); localStorage.setItem('lastSchoolId', currentSchoolId || ''); localStorage.setItem('lastClassId', currentClassId || ''); } catch (e) { console.error("Erro ao salvar estado:", e); } };
    const restoreAppState = () => {
        const lastSection = localStorage.getItem('lastSection');
        const lastSchoolId = localStorage.getItem('lastSchoolId');
        const lastClassId = localStorage.getItem('lastClassId');
        console.log("Restoring App State:", {lastSection, lastSchoolId, lastClassId});
        currentSection = 'schedule-section'; // Default
        currentSchoolId = null;
        currentClassId = null;

        if (appData.schools.length > 0) {
            currentSchoolId = lastSchoolId || appData.schools[0].id;
            if (!findSchoolById(currentSchoolId)) { // Check if stored school still exists
                currentSchoolId = appData.schools[0]?.id || null;
                currentClassId = null;
                currentSection = currentSchoolId ? 'classes-section' : 'schools-section';
            } else {
                // School exists, try to restore class
                currentClassId = lastClassId || null;
                if (currentClassId && !findClassById(currentClassId)) { // Check if stored class still exists
                    currentClassId = null;
                }

                // Restore section based on valid IDs
                if (lastSection) {
                    if (lastSection === 'class-details-section' && currentClassId) {
                        currentSection = 'class-details-section';
                    } else if (lastSection === 'classes-section' && currentSchoolId) {
                        currentSection = 'classes-section';
                        currentClassId = null; // Clear class if going back to class list
                    } else if (lastSection === 'schools-section') {
                        currentSection = 'schools-section';
                        currentSchoolId = null;
                        currentClassId = null;
                    } else if (['schedule-section', 'tools-section', 'contact-section', 'settings-section'].includes(lastSection)){
                         const sectionExists = document.getElementById(lastSection);
                         if(sectionExists) {
                             currentSection = lastSection;
                             // Reset school/class IDs for these global sections
                            currentSchoolId = null;
                            currentClassId = null;
                         } else { // Fallback if section doesn't exist anymore
                             currentSection = currentSchoolId ? 'classes-section' : 'schools-section';
                             currentClassId = null;
                         }
                    } else { // Fallback for unknown sections
                         currentSection = currentSchoolId ? 'classes-section' : 'schools-section';
                         currentClassId = null;
                    }
                } else { // No last section saved, determine based on IDs
                     if (currentClassId) currentSection = 'class-details-section';
                     else if (currentSchoolId) currentSection = 'classes-section';
                     else currentSection = 'schools-section';
                }
            }
        } else { // No schools
            currentSection = 'schedule-section'; // Default to schedule if no schools
        }
         // Final override for specific global sections if they were the last viewed
         if(['contact-section', 'settings-section', 'tools-section'].includes(lastSection)){
            currentSection = lastSection;
            currentSchoolId = null;
            currentClassId = null;
         }

        console.log(`Estado Final Restaurado: Section=${currentSection}, School=${currentSchoolId}, Class=${currentClassId}`);
    };

    // --- Funções Utilitárias (Inalteradas - Expõe globalmente para o módulo usar se necessário) ---
    window.generateId = (prefix = 'id') => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const saveData = () => { try { localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(appData)); console.log(`Data saved (${DATA_STORAGE_KEY}).`); } catch (e) { console.error("Erro salvar:", e); if (e.name === 'QuotaExceededError') { alert("Erro: Não há espaço suficiente para salvar os dados. Isso pode ser devido a um arquivo de som personalizado muito grande."); } else { alert("Erro ao salvar dados."); } } };
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
                // Default values and structure checks (ESSENTIAL to keep updated)
                appData.schools = appData.schools || [];
                appData.classes = appData.classes || [];
                appData.students = appData.students || [];
                appData.schedule = appData.schedule || [];
                appData.settings = appData.settings || {};
                appData.settings.theme = appData.settings.theme || 'theme-light';
                appData.settings.globalNotificationsEnabled = appData.settings.globalNotificationsEnabled !== undefined ? appData.settings.globalNotificationsEnabled : true;
                appData.settings.notificationSoundEnabled = appData.settings.notificationSoundEnabled !== undefined ? appData.settings.notificationSoundEnabled : true;
                appData.settings.customNotificationSound = appData.settings.customNotificationSound || null;

                // Apply checks and defaults to internal structures
                appData.classes.forEach(c => {
                    c.notes = c.notes || '';
                    c.schoolId = c.schoolId || null;
                    c.gradeStructure = c.gradeStructure || [];
                    c.gradeStructure.forEach(gs => {
                        delete gs.periodType; // Remove deprecated field if exists
                        if (gs.colorRanges === undefined) { gs.colorRanges = []; } // Add default colorRanges if missing
                    });
                    c.lessonPlans = c.lessonPlans || {};
                    if (!c.classroomLayout) {
                        c.classroomLayout = { rows: 5, cols: 6, teacherDeskPosition: 'top-center', seats: [] };
                    } else {
                        c.classroomLayout.seats = c.classroomLayout.seats || [];
                        const validPositions = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right', 'left-top', 'left-center', 'left-bottom', 'right-top', 'right-center', 'right-bottom'];
                        if (!validPositions.includes(c.classroomLayout.teacherDeskPosition)) {
                            c.classroomLayout.teacherDeskPosition = 'top-center'; // Default if invalid
                        }
                    }
                     // **** ADICIONADO: Garante representativeId e viceRepresentativeId ****
                     c.representativeId = c.representativeId || null;
                     c.viceRepresentativeId = c.viceRepresentativeId || null;
                });
                appData.students.forEach(s => {
                    s.grades = s.grades || {};
                    s.attendance = s.attendance || {};
                    Object.keys(s.attendance).forEach(date => {
                        const record = s.attendance[date];
                        if (record && typeof record === 'object') {
                            record.status = record.status || null;
                            record.justification = String(record.justification || '');
                        } else { // Fix invalid attendance record
                            s.attendance[date] = { status: null, justification: '' };
                        }
                    });
                     // Fix/Update notes structure
                    s.notes = s.notes || [];
                     if (typeof s.notes === 'string') { // Convert old string notes
                         const oldNotes = s.notes.trim();
                         s.notes = oldNotes ? [{ date: 'N/A', category: 'Anotação', text: oldNotes }] : [];
                     } else if (!Array.isArray(s.notes)) { // Ensure it's an array
                         s.notes = [];
                     }
                     // Ensure all notes have required fields (date, text, category)
                     s.notes = s.notes.map(note => ({
                         date: note?.date || getCurrentDateString(), // Default date
                         category: note?.category || 'Anotação', // Default category
                         text: note?.text || '',
                         suspensionStartDate: note?.suspensionStartDate || null,
                         suspensionEndDate: note?.suspensionEndDate || null
                     })).filter(note => note.text.trim()); // Remove notes with empty text
                });
                 appData.schedule.forEach(item => {
                     if (item.notificationsEnabled === undefined) { item.notificationsEnabled = true; } // Add default if missing
                 });

                console.log(`Data loaded (from version ${importedVersion}):`, appData);

                 // Data Migration Logic (if needed for future versions)
                 if (importedVersion < 15) {
                     // Apply necessary transformations for v15 here
                     // Example: appData.someNewFeature = appData.someNewFeature || defaultValue;
                     saveData(); // Save with the new key after migration
                     localStorage.removeItem(OLD_DATA_STORAGE_KEY_V14); // Remove the old key
                     console.log(`Migrated data saved as ${DATA_STORAGE_KEY}.`);
                 }
                return true; // Data loaded successfully
            } catch (e) {
                console.error("Erro ao carregar ou migrar dados:", e);
                alert("Erro ao carregar dados. Resetando para o padrão. Se você tiver um backup, importe-o.");
                appData = { schools: [], classes: [], students: [], schedule: [], settings: { theme: 'theme-light', globalNotificationsEnabled: true, notificationSoundEnabled: true, customNotificationSound: null } };
                localStorage.removeItem(OLD_DATA_STORAGE_KEY_V14); // Clean up old keys on error too
                localStorage.removeItem(DATA_STORAGE_KEY);
                saveData(); // Save default empty state
                return false; // Error loading data
            }
        } else {
            // No data found at all
            appData = { schools: [], classes: [], students: [], schedule: [], settings: { theme: 'theme-light', globalNotificationsEnabled: true, notificationSoundEnabled: true, customNotificationSound: null } };
            return false; // No data loaded
        }
    };
    window.applyTheme = (themeName) => { document.body.className = themeName || 'theme-light'; appData.settings.theme = themeName; document.querySelectorAll('.theme-button').forEach(btn => { btn.style.border = btn.dataset.theme === themeName ? '2px solid var(--accent-primary)' : 'none'; }); };

    // --- Função showSection MODIFICADA para gerenciar ativação/desativação do módulo ---
    const showSection = (sectionId) => {
        // **** NOVO: Desativa o módulo de detalhes se estiver saindo dele ****
        if (currentSection === 'class-details-section' && sectionId !== 'class-details-section') {
            if (typeof ClassDetailsModule !== 'undefined' && ClassDetailsModule.deactivate) {
                ClassDetailsModule.deactivate();
            }
        }

        sections.forEach(section => section.classList.toggle('active', section.id === sectionId));
        navButtons.forEach(button => button.classList.toggle('active', button.dataset.section === sectionId));
        currentSection = sectionId;
        navClassesButton.disabled = !currentSchoolId;
        navDetailsButton.disabled = !currentClassId;
        updateHeaderInfo();
        document.querySelectorAll('.fab-button').forEach(fab => fab.classList.add('hidden'));
        let fabToShow = null;
        if (sectionId === 'schedule-section') fabToShow = addScheduleButton;
        else if (sectionId === 'schools-section') fabToShow = addSchoolButton;
        else if (sectionId === 'classes-section') fabToShow = addClassButton;
        // O FAB de adicionar aluno está no card de detalhes agora
        if (fabToShow) fabToShow.classList.remove('hidden');
        mainContent.scrollTop = 0;
        saveAppState();

        if (sectionId === 'settings-section') {
            updateNotificationSettingsUI();
            updateCustomSoundUI();
        }

        // **** NOVO: Ativa o módulo de detalhes se estiver entrando nele ****
        // (A inicialização principal ocorre em selectClass)
        if (sectionId === 'class-details-section' && currentClassId) {
            if (typeof ClassDetailsModule !== 'undefined' && ClassDetailsModule.activate) {
                ClassDetailsModule.activate();
            }
            // Não inicializa aqui, selectClass faz isso para garantir dados corretos
        }
    };
    // --- Fim da showSection modificada ---

    const updateHeaderInfo = () => { /* ...código inalterado... */ };

    // --- Funções de Modal (Globais - Mantidas e exportadas para o módulo usar) ---
    window.showModal = (title, contentHtml, footerButtonsHtml = '', modalClass = '') => {
        const targetModal = modalClass === 'calculator-modal' ? calculatorModal : modal;
        if (!targetModal) { console.error("Modal não encontrado para:", modalClass || 'generic'); return; }
        const targetTitle = targetModal.querySelector('.modal-header h2');
        const targetBody = targetModal.querySelector('.modal-body');
        const targetFooter = targetModal.querySelector('.modal-footer');
        if(!targetTitle || !targetBody || !targetFooter) { console.error("Estrutura interna do modal não encontrada:", targetModal); return; }

        targetTitle.textContent = title;
        targetBody.innerHTML = contentHtml;
        const defaultFooter = `<button type="button" data-dismiss="modal" class="secondary">Fechar</button>`;
        targetFooter.innerHTML = footerButtonsHtml ? footerButtonsHtml + defaultFooter : defaultFooter;

        targetModal.className = 'modal';
        if (modalClass) targetModal.classList.add(modalClass);
        targetModal.classList.add('show');

        targetModal.querySelectorAll('[data-dismiss="modal"]').forEach(btn => {
            const clonedBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(clonedBtn, btn);
            clonedBtn.addEventListener('click', () => hideModal(targetModal));
        });
        if (targetModal !== calculatorModal) {
             targetModal.removeEventListener('click', combinedModalCloseHandler);
             targetModal.addEventListener('click', combinedModalCloseHandler);
        }
    };
     window.hideModal = (modalToHide = null) => {
         const targetModal = modalToHide || modal || calculatorModal;
         if (!targetModal || !targetModal.classList.contains('show')) return;

         if (targetModal.id === 'generic-modal' && targetModal.querySelector('.timer-modal .modal-content')) {
             if (typeof pauseStopwatch === 'function') pauseStopwatch();
         }

        targetModal.classList.remove('show');
        setTimeout(() => {
            const title = targetModal.querySelector('.modal-header h2');
            const body = targetModal.querySelector('.modal-body');
            const footer = targetModal.querySelector('.modal-footer');
            if (title) title.textContent = '';
            if (body) body.innerHTML = '';
            if (footer) footer.innerHTML = '';
            targetModal.className = 'modal';
             if (targetModal.id === 'advanced-calculator-modal') targetModal.classList.add('calculator-modal');
        }, 300);
    };

    // Funções find (Inalteradas)
    const findSchoolById = (id) => appData.schools.find(s => s.id === id);
    const findClassById = (id) => appData.classes.find(c => c.id === id);
    window.findStudentById = (id) => appData.students.find(s => s.id === id); // Expõe globalmente
    const findScheduleById = (id) => appData.schedule.find(sch => sch.id === id);
    window.getStudentsByClass = (classId) => appData.students.filter(s => s.classId === classId).sort((a, b) => { const numA = parseInt(a.number) || Infinity; const numB = parseInt(b.number) || Infinity; if (numA !== numB) return numA - numB; return a.name.localeCompare(b.name); }); // Expõe globalmente
    window.formatDate = (dateString) => { if(!dateString || dateString === 'N/A') return 'Data Indefinida'; try { const date = new Date(dateString + 'T00:00:00'); if (isNaN(date.getTime())) return 'Data Inválida'; return date.toLocaleDateString('pt-BR'); } catch { return dateString; } };
    window.getCurrentDateString = () => new Date().toISOString().slice(0, 10);
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getDayOfWeek = (year, month, day) => new Date(year, month, day).getDay();
    window.sanitizeHTML = (str) => { if (str === null || str === undefined) return ''; const temp = document.createElement('div'); temp.textContent = String(str); return temp.innerHTML; };
    function getContrastYIQ(hexcolor){ /* ...código inalterado... */ }
    const getGradeBackgroundColor = (value, ranges) => { /* ...código inalterado... */ };
    const applyGradeColor = (element, value, ranges) => { /* ...código inalterado... */ };
    const calculateSchoolQuorum = (schoolId, dateString, shiftFilter = "Geral") => { /* ...código inalterado... */ };


    // --- Funções de Renderização (Globais - Exceto as movidas para o módulo) ---
    const renderScheduleList = () => { /* ...código inalterado... */ };
    const updateNotificationIcon = (indicatorElement, isEnabled) => { /* ...código inalterado... */ };
    const renderSchoolList = () => { /* ...código inalterado... */ };
    const renderClassList = (schoolId) => { /* ...código inalterado... */ };
    // Funções de Notas e Estrutura (Globais - Mantidas)
    window.renderGradeSets = (classId) => { /* ...código inalterado... */ };
    window.renderGradesTable = (classId, gradeSetId) => { /* ...código inalterado... */ };
    const calculateAndUpdateSumAndAverage = (tableRow, gradeLabels, colorRanges) => { /* ...código inalterado... */ };
    const calculateSumAndAverageForData = (gradesObject) => { /* ...código inalterado... */ };
    // Funções de Planejamento e Notas da Turma (Globais - Mantidas)
     window.renderLessonPlan = (classId, date) => { /* ...código inalterado... */ };
     window.renderClassroomMap = (classId, isEditing = false) => { /* ...código inalterado... */ };

    // --- Funções de CRUD (Globais - Mantidas, pois são usadas em vários lugares) ---
     const openScheduleModal = (scheduleIdToEdit = null) => { /* ...código inalterado... */ };
     const saveScheduleEntry = () => { /* ...código inalterado... */ };
     const deleteScheduleEntry = (id) => { /* ...código inalterado... */ };
     const toggleScheduleNotification = (scheduleId, indicatorElement) => { /* ...código inalterado... */ };
     const openSchoolModal = (schoolIdToEdit = null) => { /* ...código inalterado... */ };
     const saveSchool = () => { /* ...código inalterado... */ };
     const deleteSchool = (id) => { /* ...código inalterado... */ };
     const selectSchool = (id) => {
         // **** NOVO: Desativa o módulo de detalhes se estiver ativo ****
         if (currentSection === 'class-details-section' && typeof ClassDetailsModule !== 'undefined' && ClassDetailsModule.deactivate) {
             ClassDetailsModule.deactivate();
         }
         currentSchoolId = id;
         currentClassId = null; // Reseta a turma ao selecionar escola
         renderClassList(id);
         navClassesButton.disabled = false;
         navDetailsButton.disabled = true; // Desabilita detalhes ao ir para lista de turmas
         updateHeaderInfo();
         saveAppState();
         // Não mostra a seção aqui, pois pode ter vindo de outra seção que não escolas
     };
     const openClassModal = (classIdToEdit = null) => { /* ...código inalterado... */ };
     const saveClass = () => { /* ...código inalterado... */ };
     const deleteClass = (id) => { /* ...código inalterado... */ };

    // --- Função selectClass MODIFICADA para inicializar o módulo ---
     const selectClass = (id, forceReload = false) => {
        if (!forceReload && currentSection === 'class-details-section' && currentClassId === id) {
             console.log(`Turma ${id} já selecionada e visível.`);
             // Mesmo se já selecionada, garante que o módulo está ativo se a seção for de detalhes
             if (currentSection === 'class-details-section' && typeof ClassDetailsModule !== 'undefined' && ClassDetailsModule.activate) {
                 ClassDetailsModule.activate();
             }
             return;
        }

        console.log(`Selecionando Turma: ${id}, Forçar Recarga: ${forceReload}`);
        if (tempClassroomLayout) {
             if (typeof cancelClassroomMapEdit === 'function') cancelClassroomMapEdit();
         }

        currentClassId = id;
        const selectedClass = findClassById(id);

        if (selectedClass) {
            // ATIVA/INICIALIZA o módulo de detalhes da turma
             if (typeof ClassDetailsModule !== 'undefined' && ClassDetailsModule.init) {
                 // Passa referências necessárias
                ClassDetailsModule.init(currentClassId, appData, saveData, showModal, hideModal);
             } else {
                 console.error("ClassDetailsModule não está carregado ou não possui init.");
                 const dtTitle = document.getElementById('class-details-title');
                 if (dtTitle) dtTitle.textContent = "Erro ao carregar módulo";
            }

            // Renderiza partes globais da seção (se houver necessidade de chamá-las aqui)
             if (typeof renderGradeSets === 'function') renderGradeSets(id);
             if (typeof renderLessonPlan === 'function') renderLessonPlan(id, lessonPlanDateInput?.value || getCurrentDateString());
             if (typeof renderClassroomMap === 'function') renderClassroomMap(id);
            // Atualiza anotações da turma (global)
            if (classNotesContent) classNotesContent.textContent = sanitizeHTML(selectedClass.notes || 'Nenhuma anotação.');
            if (classNotesTextarea) classNotesTextarea.value = selectedClass.notes || '';
            if (classNotesEdit) classNotesEdit.classList.add('hidden');
            if (classNotesDisplay) classNotesDisplay.classList.remove('hidden');

            // Atualiza estado da navegação
            if (currentSection === 'classes-section') renderClassList(selectedClass.schoolId);
            navDetailsButton.disabled = false;

            // Garante que os cards não estejam colapsados
            const detailsSection = document.getElementById('class-details-section');
            detailsSection?.querySelectorAll('.card')?.forEach(card => {
                 card.classList.remove('collapsed');
                 const toggleBtnIcon = card.querySelector('.card-toggle-button .icon');
                 if (toggleBtnIcon) {
                     toggleBtnIcon.classList.remove('icon-chevron-down');
                     toggleBtnIcon.classList.add('icon-chevron-up');
                     const toggleBtn = toggleBtnIcon.closest('button');
                     if(toggleBtn) toggleBtn.title = 'Esconder';
                 }
             });

        } else { // Classe não encontrada
             currentClassId = null;
             const dtTitle = document.getElementById('class-details-title');
             if(dtTitle) dtTitle.textContent = "Erro: Turma não encontrada";
             if(gradesTableContainer) gradesTableContainer.innerHTML = '<p>Erro</p>';
             if(lessonPlanTextarea) lessonPlanTextarea.value = '';
             if(saveLessonPlanButton) saveLessonPlanButton.classList.add('hidden');
             if(classNotesContent) classNotesContent.textContent = 'Erro';
             if(classroomContainerDisplay) classroomContainerDisplay.innerHTML = '<p>Erro</p>';
             if (typeof ClassDetailsModule !== 'undefined' && ClassDetailsModule.init) {
                 ClassDetailsModule.init(null, appData, saveData, showModal, hideModal); // Limpa o módulo
             }
             navDetailsButton.disabled = true;
        }

        updateHeaderInfo();
        saveAppState();

        // Mostra a seção DEPOIS de tudo carregado/configurado
        if (currentSection !== 'class-details-section') {
            showSection('class-details-section');
        }
    };
    // --- Fim da selectClass modificada ---

    // CRUD de Aluno (Globais - Mantidos para serem chamados pelo módulo ou botão global)
    window.openStudentModal = (studentIdToEdit = null) => { /* ...código inalterado... */ };
    const saveStudent = () => { /* ...código inalterado... */ };
    window.deleteStudent = (id) => { /* ...código inalterado... */ };
    // CRUD de Mover Aluno (Global - Mantido)
    window.openMoveStudentModal = (studentId) => { /* ...código inalterado... */ };
    const confirmMoveStudent = () => { /* ...código inalterado... */ };
    // CRUD de Estrutura de Notas (Global - Mantido)
    const openGradeStructureModal = () => { /* ...código inalterado... */ };
    const setupGradeStructureModalListeners = () => { /* ...código inalterado... */ };
    const handleGradeStructureClicks = (e) => { /* ...código inalterado... */ };
    const addGradeSet = () => { /* ...código inalterado... */ };
    const saveGradeStructure = () => { /* ...código inalterado... */ };
    const saveGrades = () => { /* ...código inalterado... */ };
    const escapeCsvField = (field) => { /* ...código inalterado... */ };
    const exportGradesCSV = () => { /* ...código inalterado... */ };
    const exportGradesPDF = async () => { /* ...código inalterado... */ };
    // CRUD de Plano de Aula (Global - Mantido)
    const saveLessonPlan = () => { /* ...código inalterado... */ };
    // Funções de Frequência Mensal (Global - Mantido)
    const openMonthlyAttendanceModal = () => { /* ...código inalterado... */ };
    const renderMonthlyAttendanceData = (classId, year, month) => { /* ...código inalterado... */ };
    const renderMonthlyAttendanceChart = (frequencies) => { /* ...código inalterado... */ };
    const exportMonthlyAttendanceCSV = (classId, year, month) => { /* ...código inalterado... */ };
    const exportMonthlyAttendancePDF = async (classId, year, month, button) => { /* ...código inalterado... */ };
    // Funções de Busca (Global - Mantido)
    const performSearch = (term) => { /* ...código inalterado... */ };
    const renderSearchResults = (results, term) => { /* ...código inalterado... */ };
    // Funções de Anotações da Turma (Global - Mantido)
    const toggleClassNotesEdit = (showEdit) => { /* ...código inalterado... */ };
    const saveClassNotes = () => { /* ...código inalterado... */ };
    // Funções de Import/Export/Clear (Global - Mantido)
    const exportData = () => { /* ...código inalterado... */ };
    const importData = (event) => { /* ...código inalterado... */ };
    const clearAllData = () => { /* ...código inalterado... */ };
    // Função de Copiar PIX (Global - Mantido)
    if (copyPixButton && pixKeyTextElement) { copyPixButton.addEventListener('click', () => { /* ...código inalterado... */ }); }
    // Lógica de Swipe (Global - Mantido)
    let touchStartX = 0; let touchEndX = 0; let touchStartY = 0; let isSwiping = false; const swipeThreshold = 110; const verticalThreshold = 60;
    mainContent.addEventListener('touchstart', (e) => { /* ...código inalterado... */ }, { passive: true });
    mainContent.addEventListener('touchmove', (e) => { /* ...código inalterado... */ }, { passive: true });
    mainContent.addEventListener('touchend', (e) => { /* ...código inalterado... */ });
    // Funções de Notificação (Global - Mantido)
    const notificationMessages = { /* ...código inalterado... */ };
    const getRandomMessage = (type, scheduleItem) => { /* ...código inalterado... */ };
    const showNotification = (message) => { /* ...código inalterado... */ };
    const hideNotification = () => { /* ...código inalterado... */ };
    const playSound = () => { /* ...código inalterado... */ };
    const checkNotifications = () => { /* ...código inalterado... */ };
    const startNotificationChecker = () => { /* ...código inalterado... */ };
    const stopNotificationChecker = () => { /* ...código inalterado... */ };
    const updateNotificationSettingsUI = () => { /* ...código inalterado... */ };
    const updateCustomSoundUI = () => { /* ...código inalterado... */ };
    const handleCustomSoundUpload = (event) => { /* ...código inalterado... */ };
    const removeCustomSound = () => { /* ...código inalterado... */ };

    // Funções de Ações de Presença (Globais - Mantidas, mas precisam chamar render do módulo)
     const markAllStudentsPresent = () => {
         const dateInput = document.getElementById('attendance-date'); // Busca o input (gerenciado pelo módulo)
         const date = dateInput?.value;
         if (!currentClassId || !date) { alert("Selecione uma turma e uma data primeiro."); return; }
         const studentsInClass = getStudentsByClass(currentClassId);
         if (studentsInClass.length === 0) return;
         console.log(`Action: Marking all present for class ${currentClassId} on ${date}`);
         studentsInClass.forEach(student => {
             if (!student.attendance) student.attendance = {};
             if (!student.attendance[date]) student.attendance[date] = { status: null, justification: '' };
             if (student.attendance[date].status !== 'H') {
                 student.attendance[date].status = 'P';
                 student.attendance[date].justification = '';
             }
         });
         // Se a seção de detalhes estiver ativa, chama o render do módulo
         if (currentSection === 'class-details-section' && typeof ClassDetailsModule !== 'undefined' && ClassDetailsModule.renderAttendanceTable) {
             ClassDetailsModule.renderAttendanceTable(currentClassId, date);
         }
         console.log("Data updated for Mark All Present. Remember to Save.");
     };
     const toggleNonSchoolDay = () => {
         const dateInput = document.getElementById('attendance-date'); // Busca o input
         const date = dateInput?.value;
         if (!currentClassId || !date) { alert("Selecione uma turma e uma data primeiro."); return; }
         const studentsInClass = getStudentsByClass(currentClassId);
         if (studentsInClass.length === 0) return;
         const isCurrentlyNonSchool = studentsInClass.every(std => std.attendance?.[date]?.status === 'H');

         if (isCurrentlyNonSchool) {
             if (confirm(`Deseja desmarcar ${formatDate(date)} como dia NÃO LETIVO?\nA presença dos alunos será resetada para esta data.`)) {
                 studentsInClass.forEach(student => {
                     if (!student.attendance) student.attendance = {};
                     if (!student.attendance[date]) student.attendance[date] = {};
                     student.attendance[date].status = null;
                     student.attendance[date].justification = '';
                 });
                 console.log("Action: Unmarked Non-School Day in data.");
                 if (currentSection === 'class-details-section' && typeof ClassDetailsModule !== 'undefined' && ClassDetailsModule.renderAttendanceTable) {
                     ClassDetailsModule.renderAttendanceTable(currentClassId, date);
                 }
                 alert(`Dia ${formatDate(date)} desmarcado como não letivo. Clique em Salvar Presença para confirmar.`);
             }
         } else {
             if (confirm(`Deseja marcar ${formatDate(date)} como dia NÃO LETIVO para esta turma?\nToda a presença registrada nesta data será substituída por 'H'.`)) {
                 studentsInClass.forEach(student => {
                     if (!student.attendance) student.attendance = {};
                     if (!student.attendance[date]) student.attendance[date] = {};
                     student.attendance[date].status = 'H';
                     student.attendance[date].justification = '';
                 });
                 console.log("Action: Marked Non-School Day in data.");
                  if (currentSection === 'class-details-section' && typeof ClassDetailsModule !== 'undefined' && ClassDetailsModule.renderAttendanceTable) {
                     ClassDetailsModule.renderAttendanceTable(currentClassId, date);
                  }
                 alert(`Dia ${formatDate(date)} marcado como não letivo. Clique em Salvar Presença para confirmar.`);
             }
         }
         // O botão Salvar Presença (gerenciado pelo módulo) persiste a mudança
      };

    // Funções de Mapa da Sala (Global - Mantido)
    const editClassroomMap = () => { /* ...código inalterado... */ };
    window.cancelClassroomMapEdit = () => { /* ...código inalterado... */ };
    const saveClassroomLayout = () => { /* ...código inalterado... */ };
    const handleDimensionChange = () => { /* ...código inalterado... */ };
    const handleTeacherDeskChange = () => { /* ...código inalterado... */ };
    const renderUnassignedStudents = (classId) => { /* ...código inalterado... */ };
    const handleStudentListDragStart = (e) => { /* ...código inalterado... */ };
    const handleSeatDragStart = (e) => { /* ...código inalterado... */ };
    const handleDragOver = (e) => { /* ...código inalterado... */ };
    const handleDragLeave = (e) => { /* ...código inalterado... */ };
    const handleDropOnSeat = (e) => { /* ...código inalterado... */ };
    const handleDropOnUnassignedList = (e) => { /* ...código inalterado... */ };
    window.clearSeatSelection = () => { /* ...código inalterado... */ };
    const handleSeatClickForAssignment = (event) => { /* ...código inalterado... */ };
    const handleOccupiedSeatClick = (event) => { /* ...código inalterado... */ };
    const handleUnassignedStudentClickForAssignment = (event) => { /* ...código inalterado... */ };
    // Função de Toggle Card (Global - Mantida)
    window.toggleCardCollapse = (button) => { /* ...código inalterado... */ };
    // Funções das Ferramentas (Global - Mantido)
    const openNameSorterModal = () => { /* ...código inalterado... */ };
    const sortNextName = (displayElement, noRepeat, updateCountCallback) => { /* ...código inalterado... */ };
    const resetSorter = (displayElement, updateCountCallback) => { /* ...código inalterado... */ };
    const formatTime = (totalSeconds) => { /* ...código inalterado... */ };
    const updateStopwatchDisplay = () => { /* ...código inalterado... */ };
    const startStopwatch = () => { /* ...código inalterado... */ };
    window.pauseStopwatch = () => { /* ...código inalterado... */ }; // Expõe globalmente
    const resetStopwatch = () => { /* ...código inalterado... */ };
    const openTimerModal = () => { /* ...código inalterado... */ };
    const openGroupGeneratorModal = () => { /* ...código inalterado... */ };
    const shuffleArray = (array) => { /* ...código inalterado... */ };
    const generateGroups = (studentList, resultsContainer) => { /* ...código inalterado... */ };
    const updateCalculatorDisplay = () => { /* ...código inalterado... */ };
    const resetCalculator = () => { /* ...código inalterado... */ };
    const inputDigit = (digit) => { /* ...código inalterado... */ };
    const inputDecimal = () => { /* ...código inalterado... */ };
    const handleOperator = (nextOperator) => { /* ...código inalterado... */ };
    const performCalculation = { /* ...código inalterado... */ };
    const clearAll = () => { /* ...código inalterado... */ };
    const clearEntry = () => { /* ...código inalterado... */ };
    const backspace = () => { /* ...código inalterado... */ };
    const handleCalculatorButtonClick = (event) => { /* ...código inalterado... */ };
    const addWeightedPair = () => { /* ...código inalterado... */ };
    const renderWeightedPairsList = () => { /* ...código inalterado... */ };
    const removeWeightedPair = (index) => { /* ...código inalterado... */ };
    const calculateWeightedAverage = () => { /* ...código inalterado... */ };
    const switchCalculatorMode = (mode) => { /* ...código inalterado... */ };
    const openAdvancedCalculatorModal = () => { /* ...código inalterado... */ };
    const openToolModal = (toolType) => { /* ...código inalterado... */ };

    // --- Event Listeners Globais ---
    navButtons.forEach(button => { button.addEventListener('click', () => { const targetSection = button.dataset.section; if (button.disabled) return; showSection(targetSection); }); });
    addScheduleButton?.addEventListener('click', () => openScheduleModal());
    addSchoolButton?.addEventListener('click', () => openSchoolModal());
    addClassButton?.addEventListener('click', () => { if(currentSchoolId) openClassModal(); else alert("Selecione uma escola primeiro!"); });
    // Listener para o botão Add Aluno (que está dentro do card agora)
    // Usamos delegação de evento no mainContent para pegar cliques dentro da seção de detalhes
    mainContent.addEventListener('click', (e) => {
        if (e.target.id === 'add-student-button' || e.target.closest('#add-student-button')) {
             if (currentClassId) openStudentModal();
             else alert("Selecione uma turma primeiro!");
        }
    });
    backToSchoolsButton?.addEventListener('click', () => { if (typeof ClassDetailsModule !== 'undefined' && ClassDetailsModule.deactivate) ClassDetailsModule.deactivate(); currentSchoolId = null; currentClassId = null; showSection('schools-section'); });
    backToClassesButton?.addEventListener('click', () => { if (tempClassroomLayout) { cancelClassroomMapEdit(); } if (typeof ClassDetailsModule !== 'undefined' && ClassDetailsModule.deactivate) ClassDetailsModule.deactivate(); currentClassId = null; showSection('classes-section'); });
    const combinedModalCloseHandler = (e) => { /* ...código inalterado... */ };
    modal?.addEventListener('click', combinedModalCloseHandler);
    calculatorModal?.addEventListener('click', combinedModalCloseHandler);
    gradeSetSelect?.addEventListener('change', (e) => { if(currentClassId) { renderGradesTable(currentClassId, e.target.value); } });
    manageGradeStructureButton?.addEventListener('click', openGradeStructureModal);
    saveGradesButton?.addEventListener('click', saveGrades);
    exportGradesCsvButton?.addEventListener('click', exportGradesCSV);
    exportGradesPdfButton?.addEventListener('click', () => exportGradesPDF());
    // REMOVIDO: Listener do attendanceDateInput (agora no módulo)
    markAllPresentButton?.addEventListener('click', markAllStudentsPresent);
    markNonSchoolDayButton?.addEventListener('click', toggleNonSchoolDay);
    lessonPlanDateInput?.addEventListener('change', (e) => { if(currentClassId) { renderLessonPlan(currentClassId, e.target.value); } });
    saveLessonPlanButton?.addEventListener('click', saveLessonPlan);
    // REMOVIDO: Listener do saveAttendanceButton (agora no módulo)
    viewMonthlyAttendanceButton?.addEventListener('click', openMonthlyAttendanceModal);
    editClassNotesButton?.addEventListener('click', () => toggleClassNotesEdit(true));
    saveClassNotesButton?.addEventListener('click', saveClassNotes);
    cancelClassNotesButton?.addEventListener('click', () => toggleClassNotesEdit(false));
    document.querySelectorAll('.theme-button').forEach(button => { button.addEventListener('click', () => {applyTheme(button.dataset.theme); saveData();}); });
    document.getElementById('export-data-button')?.addEventListener('click', exportData);
    document.getElementById('import-data-input')?.addEventListener('change', importData);
    document.getElementById('clear-data-button')?.addEventListener('click', clearAllData);
    searchInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') { performSearch(searchInput.value); } });
    searchInput?.addEventListener('input', () => { /* No dynamic search */ });
    searchInput?.addEventListener('search', () => { if (!searchInput.value) { hideModal(); } });
    notificationCloseButton?.addEventListener('click', hideNotification);
    enableGlobalNotificationsCheckbox?.addEventListener('change', (e) => { /* ...código inalterado... */ });
    enableNotificationSoundCheckbox?.addEventListener('change', (e) => { /* ...código inalterado... */ });
    customNotificationSoundInput?.addEventListener('change', handleCustomSoundUpload);
    removeCustomSoundButton?.addEventListener('click', removeCustomSound);
    editMapButton?.addEventListener('click', editClassroomMap);
    cancelMapEditButton?.addEventListener('click', cancelClassroomMapEdit);
    saveMapButton?.addEventListener('click', saveClassroomLayout);
    unassignedStudentsContainer?.addEventListener('dragover', handleDragOver);
    unassignedStudentsContainer?.addEventListener('dragleave', handleDragLeave);
    unassignedStudentsContainer?.addEventListener('drop', handleDropOnUnassignedList);
    // Listener global para toggle de cards (mantido)
    mainContent.addEventListener('click', (e) => { const toggleButton = e.target.closest('.card-toggle-button'); if (toggleButton) { toggleCardCollapse(toggleButton); } });
    toolsGrid?.addEventListener('click', (e) => { /* ...código inalterado... */ });
    window.addEventListener('beforeunload', saveAppState);

    // --- Inicialização (Inalterada na lógica principal) ---
    const dataWasLoaded = loadData();
    restoreAppState();
    renderScheduleList();
    renderSchoolList();
    applyTheme(appData.settings.theme);
    updateNotificationSettingsUI();
    updateCustomSoundUI();
    const todayStr = getCurrentDateString();
    if (lessonPlanDateInput) lessonPlanDateInput.value = todayStr;
    // Inicializa a seção correta
    if (currentSection === 'class-details-section' && currentClassId) {
        selectClass(currentClassId, true); // Chama selectClass que inicializa o módulo
    } else if (currentSection === 'classes-section' && currentSchoolId) {
        renderClassList(currentSchoolId);
        showSection('classes-section');
    } else {
        showSection(currentSection || 'schedule-section');
    }
    if (appData.settings.globalNotificationsEnabled) { startNotificationChecker(); }

    // --- Service Worker Registration (Inalterado) ---
    if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('/pwabuilder-sw.js', { scope: '/' }).then(reg => console.log('SW registered.', reg)).catch(err => console.log('SW registration failed:', err)); }); }

}); // Fim do DOMContentLoaded

/* --- FIM ARQUIVO: script.js (MODIFICADO) --- */