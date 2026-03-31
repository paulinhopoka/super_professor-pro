import { auth, db, provider, signInWithPopup, signOut, onAuthStateChanged, doc, getDoc, setDoc, onSnapshot, createUserWithEmailAndPassword, signInWithEmailAndPassword } from './firebase.js';
import { GoogleGenAI } from '@google/genai';
import { ptCategories, ptElements, catDescriptions } from './periodic-table-data.js';

window.ptCategories = ptCategories;
window.ptElements = ptElements;
window.showElementInfo = (num) => {
    const el = window.ptElements.find(e => e[0] === num);
    if (!el) return;
    const [n, sym, name, mass, group, period, cat] = el;
    
    document.getElementById('pt-details').style.display = 'block';
    document.getElementById('pt-detail-name').textContent = `${name} (${sym})`;
    document.getElementById('pt-detail-sym').textContent = sym;
    document.getElementById('pt-detail-num').textContent = n;
    document.getElementById('pt-detail-mass').textContent = mass;
    document.getElementById('pt-detail-cat').textContent = window.ptCategories[cat];
    document.getElementById('pt-detail-group').textContent = group || '-';
    document.getElementById('pt-detail-period').textContent = period;
    document.getElementById('pt-detail-desc').textContent = catDescriptions[cat];
};

window.filterPeriodicTable = () => {
    const checkboxes = document.querySelectorAll('.pt-legend-checkbox');
    const activeCategories = Array.from(checkboxes).filter(cb => cb.checked).map(cb => parseInt(cb.value));
    
    document.querySelectorAll('.pt-element').forEach(el => {
        // Check if it's an actual element (has a category class)
        let hasCategory = false;
        let elementCategory = -1;
        
        for (let i = 0; i <= 10; i++) {
            if (el.classList.contains(`pt-cat-${i}`)) {
                hasCategory = true;
                elementCategory = i;
                break;
            }
        }
        
        if (!hasCategory) return; // Skip placeholders
        
        if (activeCategories.includes(elementCategory)) {
            el.classList.remove('dimmed');
        } else {
            el.classList.add('dimmed');
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    // --- Seletores Globais (Existentes e Novos) ---
    let showingWhatsNew = false;
    const mainContent = document.getElementById('main-content');
    const sections = document.querySelectorAll('.section');
    const navButtons = document.querySelectorAll('.nav-button');
    const modal = document.getElementById('generic-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalFooter = document.getElementById('modal-footer');
    const searchInput = document.getElementById('search-input');
    const authButton = document.getElementById('auth-button');
    const logoutButton = document.getElementById('logout-button');
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            appData.settings.language = e.target.value;
            saveData();
            updateLanguageUI();
        });
    }

    const updateLanguageUI = () => {
        const lang = appData.settings.language || 'pt-BR';
        if (languageSelect) languageSelect.value = lang;
        
        const t = translations[lang];
        if (!t) return;

        // Update navigation buttons
        document.querySelectorAll('.nav-button').forEach(btn => {
            const id = btn.id;
            if (id === 'nav-schedule-button') btn.querySelector('span:not(.icon)').textContent = t.nav_schedule;
            if (id === 'nav-schools-button') btn.querySelector('span:not(.icon)').textContent = t.nav_schools;
            if (id === 'nav-tools-button') btn.querySelector('span:not(.icon)').textContent = t.nav_tools;
            if (id === 'nav-contact-button') btn.querySelector('span:not(.icon)').textContent = t.nav_contact;
            if (id === 'nav-settings-button') btn.querySelector('span:not(.icon)').textContent = t.nav_settings;
        });

        // Update section titles
        document.querySelectorAll('.section > h2').forEach(h2 => {
            const icon = h2.querySelector('.icon');
            if (h2.closest('#schedule-section')) { h2.innerHTML = ''; if(icon) h2.appendChild(icon); h2.appendChild(document.createTextNode(' ' + t.title_schedule)); }
            if (h2.closest('#schools-section')) { h2.innerHTML = ''; if(icon) h2.appendChild(icon); h2.appendChild(document.createTextNode(' ' + t.title_schools)); }
            if (h2.closest('#classes-section')) { h2.innerHTML = ''; if(icon) h2.appendChild(icon); h2.appendChild(document.createTextNode(' ' + t.title_classes)); }
            if (h2.closest('#tools-section')) { h2.innerHTML = ''; if(icon) h2.appendChild(icon); h2.appendChild(document.createTextNode(' ' + t.title_tools)); }
            if (h2.closest('#contact-section')) { h2.innerHTML = ''; if(icon) h2.appendChild(icon); h2.appendChild(document.createTextNode(' ' + t.title_contact)); }
            if (h2.closest('#settings-section')) { h2.innerHTML = ''; if(icon) h2.appendChild(icon); h2.appendChild(document.createTextNode(' ' + t.title_settings)); }
        });

        // Update cards in settings
        const settingsSection = document.getElementById('settings-section');
        if (settingsSection) {
            settingsSection.querySelectorAll('.card h3').forEach(h3 => {
                const icon = h3.querySelector('.icon');
                const text = h3.textContent.trim();
                if (text.includes('Sincronização') || text.includes('Sync') || text.includes('Sincronización')) { h3.innerHTML = ''; if(icon) h3.appendChild(icon); h3.appendChild(document.createTextNode(' ' + t.settings_sync)); }
                else if (text === 'Conta' || text === 'Account' || text === 'Cuenta') { h3.innerHTML = ''; if(icon) h3.appendChild(icon); h3.appendChild(document.createTextNode(' ' + t.settings_account)); }
                else if (text.includes('Temas') || text.includes('Themes')) { h3.innerHTML = ''; if(icon) h3.appendChild(icon); h3.appendChild(document.createTextNode(' ' + t.settings_themes)); }
                else if (text.includes('Dados') || text.includes('Data') || text.includes('Datos')) { h3.innerHTML = ''; if(icon) h3.appendChild(icon); h3.appendChild(document.createTextNode(' ' + t.settings_data)); }
                else if (text.includes('Notificações') || text.includes('Notifications') || text.includes('Notificaciones')) { h3.innerHTML = ''; if(icon) h3.appendChild(icon); h3.appendChild(document.createTextNode(' ' + t.settings_notifications)); }
                else if (text.includes('Novidades') || text.includes('News') || text.includes('Novedades')) { h3.innerHTML = ''; if(icon) h3.appendChild(icon); h3.appendChild(document.createTextNode(' ' + t.settings_news)); }
                else if (text.includes('Navegação') || text.includes('Navigation') || text.includes('Navegación')) { h3.innerHTML = ''; if(icon) h3.appendChild(icon); h3.appendChild(document.createTextNode(' ' + t.settings_nav)); }
                else if (text.includes('Contato') || text.includes('Contact') || text.includes('Contacto')) { h3.innerHTML = ''; if(icon) h3.appendChild(icon); h3.appendChild(document.createTextNode(' ' + t.nav_contact)); }
            });
        }

        // Update other UI elements
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.placeholder = t.search_placeholder;

        const welcomeName = document.getElementById('settings-welcome-name');
        if (welcomeName) {
            const name = appData.userProfile.name || (lang === 'pt-BR' ? 'Professor(a)' : (lang === 'en-US' ? 'Teacher' : 'Profesor(a)'));
            welcomeName.textContent = name;
        }
    };

    const translations = {
        'pt-BR': {
            nav_schedule: 'Horários', nav_schools: 'Escolas', nav_tools: 'Ferramentas', nav_contact: 'Contato', nav_settings: 'Ajustes',
            title_schedule: 'Meus Horários', title_schools: 'Minhas Escolas', title_classes: 'Minhas Turmas', title_tools: 'Ferramentas Úteis', title_contact: 'Contato & Suporte', title_settings: 'Configurações',
            search_placeholder: 'Pesquisar...',
            settings_sync: 'Sincronização e Nuvem', settings_account: 'Conta', settings_themes: 'Temas', settings_data: 'Dados', settings_notifications: 'Notificações de Horários', settings_news: 'Novidades da Versão', settings_nav: 'Navegação'
        },
        'en-US': {
            nav_schedule: 'Schedule', nav_schools: 'Schools', nav_tools: 'Tools', nav_contact: 'Contact', nav_settings: 'Settings',
            title_schedule: 'My Schedule', title_schools: 'My Schools', title_classes: 'My Classes', title_tools: 'Useful Tools', title_contact: 'Contact & Support', title_settings: 'Settings',
            search_placeholder: 'Search...',
            settings_sync: 'Sync & Cloud', settings_account: 'Account', settings_themes: 'Themes', settings_data: 'Data', settings_notifications: 'Schedule Notifications', settings_news: 'Version News', settings_nav: 'Navigation'
        },
        'es-ES': {
            nav_schedule: 'Horarios', nav_schools: 'Escuelas', nav_tools: 'Herramientas', nav_contact: 'Contacto', nav_settings: 'Ajustes',
            title_schedule: 'Mis Horarios', title_schools: 'Mis Escuelas', title_classes: 'Mis Clases', title_tools: 'Herramientas Útiles', title_contact: 'Contacto y Soporte', title_settings: 'Configuraciones',
            search_placeholder: 'Buscar...',
            settings_sync: 'Sincronización y Nube', settings_account: 'Cuenta', settings_themes: 'Temas', settings_data: 'Datos', settings_notifications: 'Notificaciones de Horarios', settings_news: 'Novedades de la Versión', settings_nav: 'Navegación'
        }
    };

    const scheduleListContainer = document.getElementById('schedule-list');
    const schoolListContainer = document.getElementById('school-list');
    const classListContainer = document.getElementById('class-list');
    const classesSchoolName = document.getElementById('classes-school-name');
    const studentListContainer = document.getElementById('student-list-container');
    const classDetailsSection = document.getElementById('class-details-section');
    const classDetailsHeader = document.getElementById('class-details-header');
    const classDetailsTitle = document.getElementById('class-details-title');
    const backToSchoolsButton = document.getElementById('back-to-schools-button');
    const backToClassesButton = document.getElementById('back-to-classes-button');
    const navClassesButton = document.getElementById('nav-classes-button');
    const navDetailsButton = document.getElementById('nav-details-button');
    const gradesTableContainer = document.getElementById('grades-table-container');
    const attendanceTableContainer = document.getElementById('attendance-table-container');
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
    const classNotesDisplay = document.getElementById('class-notes-display-container');
    const editClassNotesButton = document.getElementById('edit-class-notes-button');
    const addScheduleButton = document.getElementById('add-schedule-button');
    const addSchoolButton = document.getElementById('add-school-button');
    const addClassButton = document.getElementById('add-class-button');
    const addStudentButton = document.getElementById('add-student-button');
    const renumberStudentsButton = document.getElementById('renumber-students-button');
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
    const forceSyncButton = document.getElementById('force-sync-button');
    const syncStatusText = document.getElementById('sync-status-text');
    const lastSyncTimeDisplay = document.getElementById('last-sync-time');
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
    const randomizeMapButton = document.getElementById('randomize-map-button');
    const teacherDeskTemplate = document.getElementById('teacher-desk-template');
    const classroomGridTemplate = document.getElementById('classroom-grid-template');
    const toolsGrid = document.getElementById('tools-section');
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
    const helpButton = document.getElementById('details-help-button');
    const toolsHelpButton = document.getElementById('tools-help-button');
    const whatsNewModal = document.getElementById('whats-new-modal');
    const whatsNewTitle = document.getElementById('whats-new-title');
    const whatsNewBody = document.getElementById('whats-new-body');
    const profileAvatarImg = document.getElementById('profile-avatar-img');
    const profileAvatarPlaceholder = document.getElementById('profile-avatar-placeholder');
    const profileAvatarInput = document.getElementById('profile-avatar-input');
    const profileNameInput = document.getElementById('profile-name-input');
    const profileSubjectsInput = document.getElementById('profile-subjects-input');
    const saveProfileButton = document.getElementById('save-profile-button');
    const profileAvatarContainer = document.getElementById('profile-avatar-container');

    // --- Novos Seletores para Menu Lateral ---
    const hamburgerMenuButton = document.getElementById('hamburger-menu-button');
    const sideMenu = document.getElementById('side-menu');
    const closeSideMenu = document.getElementById('close-side-menu');
    const sideMenuOverlay = document.getElementById('side-menu-overlay');
    const sideNavButtons = document.querySelectorAll('.side-nav-button');
    const sideNavClassesButton = document.getElementById('side-nav-classes-button');
    const sideNavDetailsButton = document.getElementById('side-nav-details-button');

    // --- Side Menu Logic ---
    const openSideMenu = () => {
        sideMenu.classList.add('open');
        sideMenuOverlay.classList.add('show');
    };

    const closeSideMenuFunc = () => {
        sideMenu.classList.remove('open');
        sideMenuOverlay.classList.remove('show');
    };

    if (hamburgerMenuButton) hamburgerMenuButton.addEventListener('click', openSideMenu);
    if (closeSideMenu) closeSideMenu.addEventListener('click', closeSideMenuFunc);
    if (sideMenuOverlay) sideMenuOverlay.addEventListener('click', closeSideMenuFunc);

    sideNavButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sectionId = button.getAttribute('data-section');
            showSection(sectionId);
            closeSideMenuFunc();
        });
    });

    const sideMenuProfile = document.getElementById('side-menu-profile');
    if (sideMenuProfile) {
        sideMenuProfile.addEventListener('click', () => {
            showSection('profile-section');
            closeSideMenuFunc();
        });
    }

    const closeWhatsNewButton = document.getElementById('close-whats-new');
    const okWhatsNewButton = document.getElementById('ok-whats-new');
    const showWhatsNewManualButton = document.getElementById('show-whats-new-manual-button');

    const weekdays = ["Domingo", "Segunda-Feira", "Terça-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira", "Sábado"];
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
    let currentStudentObservations = [];

    let scheduleUpdateInterval = null;

    // ATUALIZADO: Versão do App
    const CURRENT_APP_VERSION = '1.8.2';

    const DATA_STORAGE_KEY = 'superProfessorProData_v15'; // Mantido por enquanto, mas a estrutura interna mudou
    const OLD_DATA_STORAGE_KEY_V14 = 'superProfessorProData_v14';

    let appData = {
        schools: [], classes: [], students: [], schedule: [],
        settings: { theme: 'theme-light', globalNotificationsEnabled: true, notificationSoundEnabled: true, customNotificationSound: null, language: 'pt-BR' },
        userProfile: { name: '', avatar: '' },
        lastUpdated: 0
    };
    let currentSchoolId = null; let currentClassId = null; let currentSection = 'schedule-section';

    // --- Funções de Estado e Persistência ---
    const saveAppState = () => { try { localStorage.setItem('lastSection', currentSection || 'schedule-section'); localStorage.setItem('lastSchoolId', currentSchoolId || ''); localStorage.setItem('lastClassId', currentClassId || ''); } catch (e) { console.error("Erro ao salvar estado:", e); } };
    const restoreAppState = () => { const lastSection = localStorage.getItem('lastSection'); const lastSchoolId = localStorage.getItem('lastSchoolId'); const lastClassId = localStorage.getItem('lastClassId'); console.log("Restoring App State:", {lastSection, lastSchoolId, lastClassId}); currentSection = 'schedule-section'; currentSchoolId = null; currentClassId = null; if (appData.schools.length > 0) { currentSchoolId = lastSchoolId || appData.schools[0].id; if (!findSchoolById(currentSchoolId)) { currentSchoolId = appData.schools[0]?.id || null; currentClassId = null; currentSection = currentSchoolId ? 'classes-section' : 'schools-section'; } else { currentClassId = lastClassId || null; if (currentClassId && !findClassById(currentClassId)) { currentClassId = null; } if (lastSection) { if (lastSection === 'class-details-section' && currentClassId && findClassById(currentClassId)) { currentSection = 'class-details-section'; } else if (lastSection === 'classes-section' && currentSchoolId) { currentSection = 'classes-section'; currentClassId = null; } else if (lastSection === 'schools-section') { currentSection = 'schools-section'; currentSchoolId = null; currentClassId = null; } else if (['schedule-section', 'tools-section', 'contact-section', 'settings-section'].includes(lastSection)){ const sectionExists = document.getElementById(lastSection); if(sectionExists) { currentSection = lastSection; if(['schedule-section', 'tools-section', 'contact-section', 'settings-section'].includes(lastSection)) { currentSchoolId = null; currentClassId = null; } } else { currentSection = currentSchoolId ? 'classes-section' : 'schools-section'; currentClassId = null; } } else { currentSection = currentSchoolId ? 'classes-section' : 'schools-section'; currentClassId = null; } } else { if (currentClassId) currentSection = 'class-details-section'; else if (currentSchoolId) currentSection = 'classes-section'; else currentSection = 'schools-section'; } } } else { currentSection = 'schedule-section'; } if(['contact-section', 'settings-section', 'tools-section'].includes(lastSection)){ currentSection = lastSection; } console.log(`Estado Final Restaurado: Section=${currentSection}, School=${currentSchoolId}, Class=${currentClassId}`); };
    const saveData = () => { 
        try { 
            appData.lastUpdated = Date.now();
            localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(appData)); 
            console.log(`Data saved (${DATA_STORAGE_KEY}).`); 
            if (typeof saveToFirestore === 'function') { 
                saveToFirestore(); 
            } 
        } catch (e) { 
            console.error("Erro salvar:", e); 
            if (e.name === 'QuotaExceededError') { 
                customAlert("Erro: Não há espaço suficiente para salvar os dados. Isso pode ser devido a um arquivo de som personalizado muito grande."); 
            } else { 
                customAlert("Erro ao salvar dados."); 
            } 
        } 
    };
    const loadData = () => {
        console.log("loadData called");
        let dataToParse = localStorage.getItem(DATA_STORAGE_KEY);
        let importedVersion = 15; // Assuming current data is effectively v15 structure before this change
        if (!dataToParse) {
            const dataV14 = localStorage.getItem(OLD_DATA_STORAGE_KEY_V14);
            if (dataV14) { console.log("Importing data from v14..."); dataToParse = dataV14; importedVersion = 14; }
        }
        if (dataToParse) {
            try {
                appData = JSON.parse(dataToParse);
                appData.schools = appData.schools || [];
                appData.classes = appData.classes || [];
                appData.students = appData.students || [];
                appData.schedule = appData.schedule || [];
                appData.settings = appData.settings || {};
                appData.settings.theme = appData.settings.theme || 'theme-light';
                appData.settings.navStyle = appData.settings.navStyle || 'fixed';
                appData.settings.globalNotificationsEnabled = appData.settings.globalNotificationsEnabled !== undefined ? appData.settings.globalNotificationsEnabled : true;
                appData.settings.notificationSoundEnabled = appData.settings.notificationSoundEnabled !== undefined ? appData.settings.notificationSoundEnabled : true;
                appData.settings.interactionSoundsEnabled = appData.settings.interactionSoundsEnabled !== undefined ? appData.settings.interactionSoundsEnabled : true;
                appData.settings.customNotificationSound = appData.settings.customNotificationSound || null;
                
                // Migrate schedule days to add '-Feira' back or capitalize 'F'
                appData.schedule.forEach(item => {
                    if (item.day && ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'].includes(item.day)) {
                        item.day = item.day + '-Feira';
                    } else if (item.day && item.day.includes('-feira')) {
                        item.day = item.day.replace('-feira', '-Feira');
                    }
                });
                appData.settings.language = appData.settings.language || 'pt-BR';
                appData.userProfile = appData.userProfile || { name: '', avatar: '' };

                appData.classes.forEach(c => {
                    c.notes = c.notes || ''; c.schoolId = c.schoolId || null;
                    c.gradeStructure = c.gradeStructure || [];
                    c.gradeStructure.forEach(gs => { delete gs.periodType; if (gs.colorRanges === undefined) { gs.colorRanges = []; } });
                    c.lessonPlans = c.lessonPlans || {};
                    if (!c.classroomLayout) { c.classroomLayout = { rows: 5, cols: 6, teacherDeskPosition: 'top-center', seats: [] }; } else { c.classroomLayout.seats = c.classroomLayout.seats || []; const validPositions = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right', 'left-top', 'left-center', 'left-bottom', 'right-top', 'right-center', 'right-bottom']; if (!validPositions.includes(c.classroomLayout.teacherDeskPosition)) { c.classroomLayout.teacherDeskPosition = 'top-center'; } }
                    if (c.representativeId === undefined) c.representativeId = null;
                    if (c.viceRepresentativeId === undefined) c.viceRepresentativeId = null;
                });
                appData.students.forEach(s => {
                    s.grades = s.grades || {}; s.attendance = s.attendance || {};
                    Object.keys(s.attendance).forEach(date => { const record = s.attendance[date]; if (record && typeof record === 'object') { record.status = record.status || null; record.justification = String(record.justification || ''); } else { s.attendance[date] = { status: null, justification: '' }; } });
                    s.notes = s.notes || [];
                    if (typeof s.notes === 'string') { const oldNotes = s.notes.trim(); s.notes = oldNotes ? [{ date: getCurrentDateString(), text: oldNotes, category: 'Anotação' }] : []; }
                    else if (!Array.isArray(s.notes)) { s.notes = []; }
                    s.notes = s.notes.map(note => ({
                         date: note?.date && note.date !== 'N/A' ? note.date : getCurrentDateString(),
                         text: note?.text || '',
                         category: note?.category || 'Anotação',
                         suspensionStartDate: note?.suspensionStartDate || null,
                         suspensionEndDate: note?.suspensionEndDate || null
                     })).filter(note => note.text.trim());
                    // **** NOVO: Inicializa campo de programas governamentais ****
                    s.governmentPrograms = Array.isArray(s.governmentPrograms) ? s.governmentPrograms : [];
                 });
                appData.schedule.forEach(item => { if (item.notificationsEnabled === undefined) { item.notificationsEnabled = true; } });

                console.log(`Data loaded (from version ${importedVersion}):`, appData);

                // Se os dados foram migrados de uma versão mais antiga que a atual lógica base (v15),
                // salva para consolidar as migrações.
                if (importedVersion < 15) { // Se importou de v14 ou anterior
                    saveData(); // Salva com as migrações até v15 + a nova de governmentPrograms
                    if (localStorage.getItem(OLD_DATA_STORAGE_KEY_V14)) {
                         localStorage.removeItem(OLD_DATA_STORAGE_KEY_V14);
                    }
                    console.log(`Migrated data saved as ${DATA_STORAGE_KEY}.`);
                }
                updateLanguageUI();
                return true;
            } catch (e) {
                console.error("Erro ao carregar ou migrar dados:", e);
                appData = { schools: [], classes: [], students: [], schedule: [], settings: { theme: 'theme-light', globalNotificationsEnabled: true, notificationSoundEnabled: true, customNotificationSound: null, language: 'pt-BR' }, userProfile: { name: '', avatar: '' } };
                // Inicializa campo para novos dados vazios
                appData.students.forEach(s => s.governmentPrograms = []);
                localStorage.removeItem(OLD_DATA_STORAGE_KEY_V14);
                localStorage.removeItem(DATA_STORAGE_KEY);
                updateLanguageUI();
                return false;
            }
        } else {
            appData = { schools: [], classes: [], students: [], schedule: [], settings: { theme: 'theme-light', globalNotificationsEnabled: true, notificationSoundEnabled: true, customNotificationSound: null, language: 'pt-BR' }, userProfile: { name: '', avatar: '' } };
            // Inicializa campo para novos dados vazios
            appData.students.forEach(s => s.governmentPrograms = []);
            updateLanguageUI();
            return false;
        }
    };

    // --- Funções Utilitárias ---
    const generateId = (prefix = 'id') => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const applyTheme = (themeName) => { 
        // Remove existing theme classes
        const themeClasses = Array.from(document.body.classList).filter(cls => cls.startsWith('theme-'));
        themeClasses.forEach(cls => document.body.classList.remove(cls));
        
        // Add new theme class
        document.body.classList.add(themeName || 'theme-light');
        
        appData.settings.theme = themeName; 
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.value = themeName;
        }
    };
    const applyNavStyle = (navStyle) => {
        console.log("Applying nav style:", navStyle);
        appData.settings.navStyle = navStyle || 'fixed';
        document.body.classList.remove('nav-side');
        
        if (appData.settings.navStyle === 'side') {
            document.body.classList.add('nav-side');
        }
        
        const select = document.getElementById('nav-style-select');
        if (select) select.value = appData.settings.navStyle;
        saveData();
    };
    const showSection = (sectionId) => { 
        sections.forEach(section => section.classList.toggle('active', section.id === sectionId)); 
        navButtons.forEach(button => button.classList.toggle('active', button.dataset.section === sectionId)); 
        sideNavButtons.forEach(button => button.classList.toggle('active', button.dataset.section === sectionId));
        
        currentSection = sectionId; 
        navClassesButton.disabled = !currentSchoolId; 
        navDetailsButton.disabled = !currentClassId; 
        sideNavClassesButton.disabled = !currentSchoolId;
        sideNavDetailsButton.disabled = !currentClassId;
        
        document.querySelectorAll('.fab-button').forEach(fab => { if (fab.id !== 'floating-nav-toggle') fab.classList.add('hidden'); }); 
        let fabToShow = null; 
        if (sectionId === 'schedule-section') fabToShow = addScheduleButton; 
        else if (sectionId === 'schools-section') fabToShow = addSchoolButton; 
        else if (sectionId === 'classes-section') fabToShow = addClassButton; 
        
        if (fabToShow) fabToShow.classList.remove('hidden'); 
        mainContent.scrollTop = 0; 
        saveAppState(); 
        if (sectionId === 'settings-section') { updateNotificationSettingsUI(); updateCustomSoundUI(); } 
        if (sectionId === 'schedule-section') { startScheduleUpdates(); } else { stopScheduleUpdates(); } 
    };
    const showModal = (title, contentHtml, footerButtonsHtml = '', modalClass = '') => { 
        modalTitle.textContent = title; 
        modalBody.innerHTML = contentHtml; 
        const defaultFooter = `<button type="button" data-dismiss="modal" class="secondary">Fechar</button>`; 
        // Otimização: Se já houver um botão de fechar/cancelar ou for um modal de decisão, não adiciona o "Fechar" padrão
        if (footerButtonsHtml.includes('data-dismiss="modal"') || 
            modalClass === 'login-prompt-modal' || 
            modalClass === 'sync-conflict-modal') {
            modalFooter.innerHTML = footerButtonsHtml;
        } else {
            modalFooter.innerHTML = footerButtonsHtml ? footerButtonsHtml + defaultFooter : defaultFooter; 
        }
        modal.className = 'modal'; 
        if (modalClass) modal.classList.add(modalClass); 
        modal.classList.add('show'); 
        

        modal.querySelectorAll('[data-dismiss="modal"]').forEach(btn => { 
            const newBtn = btn.cloneNode(true); 
            btn.parentNode.replaceChild(newBtn, btn); 
            newBtn.addEventListener('click', hideModal); 
        }); 
    };
    const hideModal = () => { 
        if (stopwatchInterval) { clearInterval(stopwatchInterval); stopwatchInterval = null; isStopwatchRunning = false; } 
        modal.classList.remove('show'); 
        calculatorModal?.classList.remove('show'); 
        const aiToolModal = document.getElementById('ai-tool-modal');
        if (aiToolModal) aiToolModal.classList.remove('show');
        setTimeout(() => { modalTitle.textContent = ''; modalBody.innerHTML = ''; modalFooter.innerHTML = ''; modal.className = 'modal'; }, 300); 
    };

    const showAlert = (message, title = 'Alerta') => {
        showModal(title, `<p style="text-align: center; padding: 1rem;">${message}</p>`, `<button type="button" class="primary" data-dismiss="modal">OK</button>`);
    };

    const showConfirm = (message, onConfirm, title = 'Confirmação') => {
        const footer = `
            <button type="button" class="secondary" data-dismiss="modal">Cancelar</button>
            <button type="button" class="danger" id="confirm-action-button">Confirmar</button>
        `;
        showModal(title, `<p style="text-align: center; padding: 1rem;">${message}</p>`, footer);
        document.getElementById('confirm-action-button').onclick = () => {
            onConfirm();
            hideModal();
        };
    };

    const alert = showAlert;
    const confirm = (msg) => {
        console.warn("Uso de confirm() síncrono detectado. Use showConfirm() para melhor experiência em iframe.");
        return window.confirm(msg);
    };
    const findSchoolById = (id) => appData.schools.find(s => s.id === id);
    const findClassById = (id) => appData.classes.find(c => c.id === id);
    const findStudentById = (id) => appData.students.find(s => s.id === id);
    const findScheduleById = (id) => appData.schedule.find(sch => sch.id === id);
    const getStudentsByClass = (classId) => appData.students.filter(s => s.classId === classId).sort((a, b) => { const numA = parseInt(a.number) || Infinity; const numB = parseInt(b.number) || Infinity; if (numA !== numB) return numA - numB; return a.name.localeCompare(b.name); });
    const formatDate = (dateString) => { if(!dateString || dateString === 'N/A') return 'Data Indefinida'; try { const [y, m, d] = dateString.split('-'); if (isNaN(new Date(y, m-1, d).getTime())) return 'Data Inválida'; return `${d}/${m}/${y}`; } catch { return dateString; } };
    const getCurrentDateString = () => new Date().toISOString().slice(0, 10);
    const getYesterdayDateString = () => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10); };
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getDayOfWeek = (year, month, day) => new Date(year, month, day).getDay();
    const sanitizeHTML = (str) => { if (str === null || str === undefined) return ''; const temp = document.createElement('div'); temp.textContent = String(str); return temp.innerHTML; };
    const customConfirm = (message) => {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay show';
            overlay.style.zIndex = '9999';
            overlay.innerHTML = `
                <div class="modal-content" style="max-width: 400px; text-align: center;">
                    <h3 style="margin-top: 0;">Confirmação</h3>
                    <p style="white-space: pre-wrap; margin: 20px 0;">${sanitizeHTML(message)}</p>
                    <div style="display: flex; justify-content: center; gap: 10px;">
                        <button class="custom-confirm-yes danger">Sim</button>
                        <button class="custom-confirm-no secondary">Não</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
            
            overlay.querySelector('.custom-confirm-yes').onclick = () => {
                document.body.removeChild(overlay);
                resolve(true);
            };
            overlay.querySelector('.custom-confirm-no').onclick = () => {
                document.body.removeChild(overlay);
                resolve(false);
            };
        });
    };

    const customAlert = (message) => {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay show';
            overlay.style.zIndex = '9999';
            overlay.innerHTML = `
                <div class="modal-content" style="max-width: 400px; text-align: center;">
                    <h3 style="margin-top: 0;">Aviso</h3>
                    <p style="white-space: pre-wrap; margin: 20px 0;">${sanitizeHTML(message)}</p>
                    <div style="display: flex; justify-content: center;">
                        <button class="custom-alert-ok primary">OK</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
            
            overlay.querySelector('.custom-alert-ok').onclick = () => {
                document.body.removeChild(overlay);
                resolve(true);
            };
        });
    };
    function getContrastYIQ(hexcolor){ if (!hexcolor || hexcolor.length < 4) return '#000000'; hexcolor = hexcolor.replace("#", ""); let r,g,b; if (hexcolor.length === 3) { r = parseInt(hexcolor.substr(0,1)+hexcolor.substr(0,1), 16); g = parseInt(hexcolor.substr(1,1)+hexcolor.substr(1,1), 16); b = parseInt(hexcolor.substr(2,1)+hexcolor.substr(2,1), 16); } else if (hexcolor.length === 6) { r = parseInt(hexcolor.substr(0,2), 16); g = parseInt(hexcolor.substr(2,2), 16); b = parseInt(hexcolor.substr(4,2), 16); } else { return '#000000'; } const yiq = ((r*299)+(g*587)+(b*114))/1000; return (yiq >= 128) ? '#000000' : '#FFFFFF'; }
    const getGradeBackgroundColor = (value, ranges) => { if (value === null || value === undefined || !Array.isArray(ranges) || ranges.length === 0) { return null; } const numericValue = parseFloat(value); if (isNaN(numericValue)) { return null; } for (const range of ranges) { const min = parseFloat(range.min); const max = parseFloat(range.max); if (!isNaN(min) && !isNaN(max) && numericValue >= min && numericValue <= max) { return range.color; } } return null; };
    const applyGradeColor = (element, value, ranges) => { const bgColor = getGradeBackgroundColor(value, ranges); if (bgColor) { element.style.backgroundColor = bgColor; element.style.color = getContrastYIQ(bgColor); } else { element.style.backgroundColor = ''; element.style.color = ''; } };
    const calculateSchoolQuorum = (schoolId, dateString, shiftFilter = "Geral") => { const classesInSchool = appData.classes.filter(c => c.schoolId === schoolId); if (classesInSchool.length === 0) { return { present: 0, total: 0, percentage: 0, message: "Sem turmas" }; } const filteredClasses = shiftFilter === "Geral" ? classesInSchool : classesInSchool.filter(c => c.shift === shiftFilter); if (filteredClasses.length === 0 && shiftFilter !== "Geral") { return { present: 0, total: 0, percentage: 0, message: `Sem turmas (${shiftFilter})` }; } const filteredClassIds = new Set(filteredClasses.map(c => c.id)); const studentsInFilter = appData.students.filter(s => filteredClassIds.has(s.classId)); let presentCount = 0; let totalStudentsInFilter = studentsInFilter.length; if (totalStudentsInFilter === 0) { if(shiftFilter === "Geral" && classesInSchool.length > 0) { return { present: 0, total: 0, percentage: 0, message: "Sem alunos" }; } else if (shiftFilter !== "Geral") { return { present: 0, total: 0, percentage: 0, message: `Sem alunos (${shiftFilter})` }; } else { return { present: 0, total: 0, percentage: 0, message: "Sem alunos" }; } } studentsInFilter.forEach(student => { const attendanceRecord = student.attendance?.[dateString]; if (attendanceRecord?.status === 'P') { presentCount++; } }); const percentage = totalStudentsInFilter > 0 ? Math.round((presentCount / totalStudentsInFilter) * 100) : 0; return { present: presentCount, total: totalStudentsInFilter, percentage: percentage }; };
    const isStudentSuspendedOnDate = (studentId, dateString) => { const student = findStudentById(studentId); if (!student || !Array.isArray(student.notes) || !dateString) return null; return student.notes.find(note => note.category === 'Suspensão' && note.suspensionStartDate && note.suspensionEndDate && dateString >= note.suspensionStartDate && dateString <= note.suspensionEndDate); };
    const timeToMinutes = (timeString) => { if (!timeString || !timeString.includes(':')) return NaN; const [hours, minutes] = timeString.split(':').map(Number); if (isNaN(hours) || isNaN(minutes)) return NaN; return hours * 60 + minutes; };

    // --- Funções de Renderização ---
    const renderScheduleList = () => {
        scheduleListContainer.innerHTML = '';
        if (appData.schedule.length === 0) {
            scheduleListContainer.innerHTML = '<p style="text-align: center; padding: 1rem;">Nenhum horário cadastrado.</p>';
            return;
        }
        const now = new Date();
        const currentDayIndex = now.getDay();
        const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
        
        const scheduleByDiff = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
        
        appData.schedule.forEach(item => {
            let dayIndex = weekdays.indexOf(item.day);
            if (dayIndex === -1) return;
            let diff = (dayIndex - currentDayIndex + 7) % 7;
            let startMins = timeToMinutes(item.startTime) || 0;
            let endMins = timeToMinutes(item.endTime);
            if (isNaN(endMins)) endMins = startMins + 60;
            
            if (diff === 0 && endMins <= currentTimeInMinutes) {
                diff = 7;
            }
            scheduleByDiff[diff].push(item);
        });

        const orderedDiffs = [0, 1, 2, 3, 4, 5, 6, 7];

        const scheduleTemplate = document.getElementById('schedule-item-template');
        const fragment = document.createDocumentFragment();
        
        orderedDiffs.forEach((diff) => {
            const itemsForDay = scheduleByDiff[diff];
            if (itemsForDay.length > 0) {
                itemsForDay.sort((a, b) => (timeToMinutes(a.startTime) || 0) - (timeToMinutes(b.startTime) || 0));
                const dayGroup = document.createElement('div');
                dayGroup.classList.add('schedule-day-group');
                const dayTitle = document.createElement('h3');
                dayTitle.classList.add('schedule-day-title');
                
                let titleText = '';
                if (diff === 0) titleText = `${weekdays[currentDayIndex]} (Hoje - Próximos)`;
                else if (diff === 7) titleText = `${weekdays[currentDayIndex]} (Hoje - Anteriores)`;
                else titleText = weekdays[(currentDayIndex + diff) % 7];
                
                dayTitle.textContent = titleText;
                dayGroup.appendChild(dayTitle);
                
                let nextItemFoundForToday = false;
                
                itemsForDay.forEach(item => {
                    const clone = scheduleTemplate.content.cloneNode(true);
                    const scheduleElement = clone.querySelector('.schedule-item');
                    const progressBar = clone.querySelector('.progress-bar');
                    scheduleElement.dataset.id = item.id;
                    const startMinutes = timeToMinutes(item.startTime);
                    const endMinutes = timeToMinutes(item.endTime);
                    scheduleElement.dataset.startMinutes = isNaN(startMinutes) ? '' : String(startMinutes);
                    scheduleElement.dataset.endMinutes = isNaN(endMinutes) ? '' : String(endMinutes);
                    const school = findSchoolById(item.schoolId);
                    scheduleElement.querySelector('.schedule-time').textContent = `${item.startTime || '?'} - ${item.endTime || '?'}`;
                    scheduleElement.querySelector('.school-name').textContent = school ? sanitizeHTML(school.name) : 'Escola não encontrada';
                    scheduleElement.querySelector('.note').textContent = sanitizeHTML(item.note || '');
                    clone.querySelector('.edit-schedule-button').addEventListener('click', (e) => { e.stopPropagation(); openScheduleModal(item.id); });
                    
                    const isToday = diff === 0 || diff === 7;
                    if (isToday && !isNaN(startMinutes) && !isNaN(endMinutes)) {
                        const isCurrent = currentTimeInMinutes >= startMinutes && currentTimeInMinutes < endMinutes;
                        const isUpcoming = currentTimeInMinutes < startMinutes;
                        if (isCurrent) {
                            scheduleElement.classList.add('current');
                            const duration = endMinutes - startMinutes;
                            const elapsed = currentTimeInMinutes - startMinutes;
                            const progress = duration > 0 ? Math.min(100, Math.max(0, (elapsed / duration) * 100)) : 0;
                            if (progressBar) progressBar.style.width = `${progress}%`;
                        } else if (isUpcoming && !nextItemFoundForToday && diff === 0) {
                            scheduleElement.classList.add('next');
                            nextItemFoundForToday = true;
                            if (progressBar) progressBar.style.width = '0%';
                        } else {
                            if (progressBar) progressBar.style.width = '0%';
                        }
                    } else {
                        if (progressBar) progressBar.style.width = '0%';
                    }
                    dayGroup.appendChild(clone);
                });
                fragment.appendChild(dayGroup);
            }
        });
        scheduleListContainer.appendChild(fragment);
    };
    const updateNotificationIcon = (indicatorElement, isEnabled) => { if (!indicatorElement) return; indicatorElement.classList.remove('icon-notificacao-on', 'icon-notificacao-off'); if (isEnabled) { indicatorElement.classList.add('icon-notificacao-on'); indicatorElement.parentElement.title = "Notificações Ativadas (Clique para desativar)"; } else { indicatorElement.classList.add('icon-notificacao-off'); indicatorElement.parentElement.title = "Notificações Desativadas (Clique para ativar)"; } };
    const renderSchoolList = () => { schoolListContainer.innerHTML = ''; if (appData.schools.length === 0) { schoolListContainer.innerHTML = '<p style="text-align: center; padding: 1rem;">Nenhuma escola cadastrada.</p>'; return; } const template = document.getElementById('school-item-template'); const today = getCurrentDateString(); appData.schools.sort((a, b) => a.name.localeCompare(b.name)).forEach(school => { const clone = template.content.cloneNode(true); const item = clone.querySelector('.list-item'); item.dataset.id = school.id; item.querySelector('.school-name').textContent = sanitizeHTML(school.name); item.querySelector('.view-classes-button').addEventListener('click', (e) => { e.stopPropagation(); selectSchool(school.id); showSection('classes-section'); }); item.querySelector('.edit-school-button').addEventListener('click', (e) => { e.stopPropagation(); openSchoolModal(school.id); }); const quorumContainer = item.querySelector('.school-quorum-info'); const quorumDateInput = quorumContainer.querySelector('.quorum-date-input'); const quorumShiftSelect = quorumContainer.querySelector('.quorum-shift-select'); const quorumDisplay = quorumContainer.querySelector('.quorum-display'); const quorumDateLabel = quorumContainer.querySelector('label[for="quorum-date-input-ID_ESCOLA"]'); const uniqueId = `quorum-date-input-${school.id}`; if (quorumDateLabel) quorumDateLabel.setAttribute('for', uniqueId); if (quorumDateInput) { quorumDateInput.id = uniqueId; quorumDateInput.value = today; quorumDateInput.addEventListener('click', (e) => e.stopPropagation()); } if (quorumShiftSelect) { quorumShiftSelect.addEventListener('click', (e) => e.stopPropagation()); } const updateQuorumDisplay = () => { const selectedDate = quorumDateInput.value; const selectedShift = quorumShiftSelect.value; if (!selectedDate) { quorumDisplay.textContent = 'Data inválida'; quorumDisplay.classList.add('no-data'); quorumDisplay.title = 'Selecione uma data válida'; return; } const quorumData = calculateSchoolQuorum(school.id, selectedDate, selectedShift); quorumDisplay.classList.remove('no-data'); if (quorumData.message) { quorumDisplay.textContent = `(${quorumData.message})`; quorumDisplay.classList.add('no-data'); if (quorumData.message.includes('Sem turmas')) { quorumDisplay.title = `Não há turmas cadastradas para calcular o quórum (${selectedShift}) em ${formatDate(selectedDate)}`; } else if (quorumData.message.includes('Sem alunos')) { quorumDisplay.title = `Não há alunos cadastrados nas turmas para calcular o quórum (${selectedShift}) em ${formatDate(selectedDate)}`; } else { quorumDisplay.title = quorumData.message; } } else { quorumDisplay.textContent = `${quorumData.present}/${quorumData.total} (${quorumData.percentage}%)`; quorumDisplay.title = `${quorumData.present} de ${quorumData.total} alunos presentes (${selectedShift}) em ${formatDate(selectedDate)}`; } }; quorumDateInput.addEventListener('change', updateQuorumDisplay); quorumShiftSelect.addEventListener('change', updateQuorumDisplay); updateQuorumDisplay(); item.addEventListener('click', (e) => { if (!e.target.closest('.school-quorum-info, .list-item-actions')) { selectSchool(school.id); showSection('classes-section'); } }); schoolListContainer.appendChild(clone); }); };
    const renderClassList = (schoolId) => { classListContainer.innerHTML = ''; const school = findSchoolById(schoolId); classesSchoolName.textContent = school ? sanitizeHTML(school.name) : 'Selecione Escola'; if (!school) { classListContainer.innerHTML = '<p style="text-align: center; padding: 1rem;">Escola não encontrada.</p>'; return; } const classesInSchool = appData.classes.filter(c => c.schoolId === schoolId); if (classesInSchool.length === 0) { classListContainer.innerHTML = `<p style="text-align: center; padding: 1rem;">Nenhuma turma cadastrada para ${sanitizeHTML(school.name)}.</p>`; return; } const template = document.getElementById('class-item-template'); classesInSchool.sort((a, b) => a.name.localeCompare(b.name)).forEach(cls => { const clone = template.content.cloneNode(true); const item = clone.querySelector('.list-item'); item.dataset.id = cls.id; const itemInfo = item.querySelector('.item-info'); itemInfo.querySelector('.class-name').textContent = `${sanitizeHTML(cls.name)}${cls.year ? ' (' + sanitizeHTML(cls.year) + ')' : ''}`; let scheduleText = sanitizeHTML(cls.schedule || 'Sem horário'); if (cls.scheduleEnd) scheduleText += ` às ${sanitizeHTML(cls.scheduleEnd)}`; itemInfo.querySelector('.class-details').textContent = `${sanitizeHTML(cls.subject || 'Sem matéria')} - ${sanitizeHTML(cls.shift || 'Sem turno')} - ${scheduleText}`; if(cls.id === currentClassId) item.classList.add('active'); const actions = item.querySelector('.list-item-actions'); actions.querySelector('.view-details-button').addEventListener('click', (e) => { e.stopPropagation(); selectClass(cls.id); showSection('class-details-section'); }); actions.querySelector('.edit-class-button').addEventListener('click', (e) => { e.stopPropagation(); openClassModal(cls.id); }); item.addEventListener('click', () => { selectClass(cls.id); showSection('class-details-section'); }); classListContainer.appendChild(clone); }); };
    const renderStudentList = (classId) => {
        studentListContainer.innerHTML = '';
        const studentsInClass = getStudentsByClass(classId);
        const cls = findClassById(classId);
        if (studentsInClass.length === 0) {
            studentListContainer.innerHTML = '<p style="text-align: center; padding: 1rem;">Nenhum aluno nesta turma ainda.</p>';
            return;
        }
        const template = document.getElementById('student-list-item-template');
        studentsInClass.forEach(std => {
            const clone = template.content.cloneNode(true);
            const item = clone.querySelector('.list-item');
            const wrapper = item.querySelector('.list-item-content-wrapper');
            const mainRow = wrapper.querySelector('.list-item-main-row');
            const hiddenActions = wrapper.querySelector('.list-item-hidden-actions');
            item.dataset.id = std.id;
            mainRow.querySelector('.student-number').textContent = std.number ? `${std.number}.` : '-.';
            mainRow.querySelector('.student-name').textContent = sanitizeHTML(std.name);

            // **** NOVO: Renderizar indicadores de programas governamentais ****
            const programsIndicatorContainer = mainRow.querySelector('.student-programs-indicator');
            if (programsIndicatorContainer) {
                programsIndicatorContainer.innerHTML = ''; // Limpa badges antigos
                if (std.governmentPrograms && std.governmentPrograms.length > 0) {
                    std.governmentPrograms.forEach(program => {
                        const badge = document.createElement('span');
                        badge.classList.add('program-badge');
                        let badgeText = '';
                        let programKey = '';

                        if (program === 'Bolsa Família') {
                            badgeText = 'BF';
                            programKey = 'bolsa-familia';
                        } else if (program === 'Pé de Meia') {
                            badgeText = 'PM';
                            programKey = 'pe-de-meia';
                        } else { // Fallback para outros programas não mapeados
                            badgeText = program.substring(0, 2).toUpperCase();
                            programKey = program.toLowerCase().replace(/[^a-z0-9]/g, '-');
                        }
                        badge.textContent = badgeText;
                        badge.title = program;
                        badge.classList.add(`program-badge-${programKey}`);
                        programsIndicatorContainer.appendChild(badge);
                    });
                }
            }
            // **** FIM: Indicadores de programas ****

            const expandButton = mainRow.querySelector('.expand-actions-button');
            expandButton.addEventListener('click', (e) => { e.stopPropagation(); toggleActions(item); });
            const moveButton = hiddenActions.querySelector('.move-student-button');
            if (moveButton) { moveButton.addEventListener('click', (e) => { e.stopPropagation(); openMoveStudentModal(std.id); }); }
            const repBtn = hiddenActions.querySelector('.set-representative-button');
            const viceBtn = hiddenActions.querySelector('.set-vice-button');
            const notesBtn = hiddenActions.querySelector('.notes-student-button');
            const editBtn = hiddenActions.querySelector('.edit-student-button');
            const deleteBtn = hiddenActions.querySelector('.delete-student-button');
            if (cls?.representativeId === std.id) { item.classList.add('representative'); if (repBtn) repBtn.title = "Remover Rep."; }
            else { if (repBtn) repBtn.title = "Promover a Rep."; }
            if (cls?.viceRepresentativeId === std.id) { item.classList.add('vice-representative'); if (viceBtn) viceBtn.title = "Remover Vice"; }
            else { if (viceBtn) viceBtn.title = "Promover a Vice"; }
            repBtn?.addEventListener('click', (e) => { e.stopPropagation(); toggleRepresentative(std.id); });
            viceBtn?.addEventListener('click', (e) => { e.stopPropagation(); toggleViceRepresentative(std.id); });
            notesBtn?.addEventListener('click', (e) => { e.stopPropagation(); openStudentNotesModal(std.id); });
            editBtn?.addEventListener('click', (e) => { e.stopPropagation(); openStudentModal(std.id); });
            deleteBtn?.addEventListener('click', async (e) => { e.stopPropagation(); if (await customConfirm(`Excluir aluno "${sanitizeHTML(std.name)}"?`)) { deleteStudent(std.id); } });
            studentListContainer.appendChild(clone);
        });
    };
    const renderGradeSets = (classId) => { gradeSetSelect.innerHTML = ''; const currentClass = findClassById(classId); if (!currentClass || !currentClass.gradeStructure || currentClass.gradeStructure.length === 0) { gradeSetSelect.innerHTML = '<option value="">Configure</option>'; gradesTableContainer.innerHTML = '<p style="padding: 1rem; text-align: center;">Configure a estrutura de notas clicando no ícone <span class="icon icon-estrutura"></span>.</p>'; saveGradesButton.classList.add('hidden'); manageGradeStructureButton.style.borderColor = 'var(--accent-warning)'; exportGradesCsvButton.classList.add('hidden'); exportGradesPdfButton.classList.add('hidden'); return; } manageGradeStructureButton.style.borderColor = 'transparent'; currentClass.gradeStructure.forEach(gs => { const option = document.createElement('option'); option.value = gs.id; option.textContent = sanitizeHTML(gs.name); gradeSetSelect.appendChild(option); }); const finalOption = document.createElement('option'); finalOption.value = 'final_average'; finalOption.textContent = 'Média Final (Anual)'; gradeSetSelect.appendChild(finalOption); if (getStudentsByClass(classId).length > 0) { renderGradesTable(classId, gradeSetSelect.value); } else { gradesTableContainer.innerHTML = '<p style="padding: 1rem; text-align: center;">Adicione alunos para registrar notas.</p>'; saveGradesButton.classList.add('hidden'); exportGradesCsvButton.classList.add('hidden'); exportGradesPdfButton.classList.add('hidden'); } };
    const renderGradesTable = (classId, gradeSetId) => { gradesTableContainer.innerHTML = ''; const currentClass = findClassById(classId); const isFinalAverage = gradeSetId === 'final_average'; const gradeSet = currentClass?.gradeStructure?.find(gs => gs.id === gradeSetId); const studentsInClass = getStudentsByClass(classId); const colorRanges = gradeSet?.colorRanges || []; if ((!gradeSet && !isFinalAverage) || studentsInClass.length === 0) { gradesTableContainer.innerHTML = `<p style="padding: 1rem; text-align: center;">${(!gradeSet && !isFinalAverage) ? 'Selecione um conjunto de notas válido.' : 'Nenhum aluno para exibir notas.'}</p>`; saveGradesButton.classList.add('hidden'); if(exportGradesCsvButton) exportGradesCsvButton.classList.add('hidden'); if(exportGradesPdfButton) exportGradesPdfButton.classList.add('hidden'); return; } if (isFinalAverage) { renderFinalAverageTable(classId, studentsInClass, currentClass); return; } saveGradesButton.classList.remove('hidden'); if(exportGradesCsvButton) exportGradesCsvButton.classList.remove('hidden'); if(exportGradesPdfButton) exportGradesPdfButton.classList.remove('hidden'); const table = document.createElement('table'); table.classList.add('data-table'); const thead = table.createTHead(); const tbody = table.createTBody(); const headerRow = thead.insertRow(); const headerTemplate = document.getElementById('grades-header-template'); const headerContent = headerTemplate.content.cloneNode(true); headerRow.appendChild(headerContent.querySelector('.student-col').cloneNode(true)); gradeSet.gradeLabels.forEach(label => { const th = document.createElement('th'); th.classList.add('grade-col'); th.textContent = sanitizeHTML(label); headerRow.appendChild(th); if (gradeSet.recoveryLabels && gradeSet.recoveryLabels.includes(label)) { const thRec = document.createElement('th'); thRec.classList.add('grade-col', 'recovery-col'); thRec.textContent = 'Rec. ' + sanitizeHTML(label); headerRow.appendChild(thRec); } }); headerRow.appendChild(headerContent.querySelector('.sum-col').cloneNode(true)); headerRow.appendChild(headerContent.querySelector('.avg-col').cloneNode(true)); const rowTemplate = document.getElementById('grades-row-template'); studentsInClass.forEach(std => { const clone = rowTemplate.content.cloneNode(true); const row = clone.querySelector('tr'); row.dataset.studentId = std.id; const studentCol = row.querySelector('.student-col'); if(studentCol) { studentCol.querySelector('.student-number').textContent = std.number ? `${std.number}.` : '-.'; studentCol.querySelector('.student-name').textContent = sanitizeHTML(std.name); } const sumCellTemplate = row.querySelector('.sum'); const avgCellTemplate = row.querySelector('.average'); if(sumCellTemplate) sumCellTemplate.remove(); if(avgCellTemplate) avgCellTemplate.remove(); const studentGradesForSet = std.grades[gradeSetId] || {}; const fragment = document.createDocumentFragment(); gradeSet.gradeLabels.forEach(label => { const td = document.createElement('td'); td.classList.add('grade-col'); const input = document.createElement('input'); input.type = 'number'; input.classList.add('grade-input'); input.dataset.label = label; input.min = "0"; input.max = "100"; input.step = "0.1"; input.placeholder = sanitizeHTML(label); const gradeValue = studentGradesForSet[label] ?? ''; input.value = gradeValue; applyGradeColor(input, gradeValue, colorRanges); input.addEventListener('input', (e) => { applyGradeColor(e.target, e.target.value, colorRanges); calculateAndUpdateSumAndAverage(row, gradeSet, colorRanges); }); td.appendChild(input); fragment.appendChild(td); if (gradeSet.recoveryLabels && gradeSet.recoveryLabels.includes(label)) { const tdRec = document.createElement('td'); tdRec.classList.add('grade-col', 'recovery-col'); const inputRec = document.createElement('input'); inputRec.type = 'number'; inputRec.classList.add('grade-input', 'recovery-input'); inputRec.dataset.label = label + '_recovery'; inputRec.min = "0"; inputRec.max = "100"; inputRec.step = "0.1"; inputRec.placeholder = 'Rec.'; const recValue = studentGradesForSet[label + '_recovery'] ?? ''; inputRec.value = recValue; applyGradeColor(inputRec, recValue, colorRanges); inputRec.addEventListener('input', (e) => { applyGradeColor(e.target, e.target.value, colorRanges); calculateAndUpdateSumAndAverage(row, gradeSet, colorRanges); }); tdRec.appendChild(inputRec); fragment.appendChild(tdRec); } }); studentCol.after(fragment); if(sumCellTemplate) row.appendChild(sumCellTemplate); if(avgCellTemplate) row.appendChild(avgCellTemplate); calculateAndUpdateSumAndAverage(row, gradeSet, colorRanges); tbody.appendChild(row); }); gradesTableContainer.appendChild(table); };
    
const renderFinalAverageTable = (classId, studentsInClass, currentClass) => {
    saveGradesButton.classList.add('hidden');
    if(exportGradesCsvButton) exportGradesCsvButton.classList.add('hidden');
    if(exportGradesPdfButton) exportGradesPdfButton.classList.add('hidden');
    
    const table = document.createElement('table');
    table.classList.add('data-table');
    const thead = table.createTHead();
    const tbody = table.createTBody();
    const headerRow = thead.insertRow();
    
    const thStudent = document.createElement('th');
    thStudent.classList.add('student-col');
    thStudent.textContent = 'Aluno';
    headerRow.appendChild(thStudent);
    
    currentClass.gradeStructure.forEach(gs => {
        const th = document.createElement('th');
        th.classList.add('grade-col');
        th.textContent = sanitizeHTML(gs.name);
        headerRow.appendChild(th);
    });
    
    const thFinal = document.createElement('th');
    thFinal.classList.add('avg-col');
    thFinal.textContent = 'Média Final';
    headerRow.appendChild(thFinal);
    
    const finalAvgMethod = currentClass.finalAverageMethod || 'average_of_averages';
    
    studentsInClass.forEach(std => {
        const row = tbody.insertRow();
        const tdStudent = document.createElement('td');
        tdStudent.classList.add('student-col');
        tdStudent.innerHTML = `<span class="student-number">${std.number ? std.number + '.' : '-.'}</span><span class="student-name">${sanitizeHTML(std.name)}</span>`;
        row.appendChild(tdStudent);
        
        let totalSumOfAverages = 0;
        let totalCountOfAverages = 0;
        let allInstrumentsSum = 0;
        let allInstrumentsCount = 0;
        
        currentClass.gradeStructure.forEach(gs => {
            const td = document.createElement('td');
            td.classList.add('grade-col');
            const studentGradesForSet = std.grades[gs.id] || {};
            const calculated = calculateSumAndAverageForData(studentGradesForSet, gs);
            
            if (calculated.average !== null) {
                if (finalAvgMethod === 'sum_of_all') {
                    td.textContent = calculated.sum.toFixed(1);
                    applyGradeColor(td, calculated.sum, gs.colorRanges);
                } else {
                    td.textContent = calculated.average.toFixed(1);
                    applyGradeColor(td, calculated.average, gs.colorRanges);
                }
                totalSumOfAverages += calculated.average;
                totalCountOfAverages++;
            } else {
                td.textContent = '-';
            }
            
            if (calculated.sum !== null) {
                allInstrumentsSum += calculated.sum;
                allInstrumentsCount += calculated.count;
            }
            
            row.appendChild(td);
        });
        
        const tdFinal = document.createElement('td');
        tdFinal.classList.add('avg-col');
        
        let finalAvg = null;
        if (finalAvgMethod === 'average_of_averages' && totalCountOfAverages > 0) {
            finalAvg = totalSumOfAverages / totalCountOfAverages;
        } else if (finalAvgMethod === 'sum_of_averages' && totalCountOfAverages > 0) {
            finalAvg = totalSumOfAverages;
        } else if (finalAvgMethod === 'average_of_all' && allInstrumentsCount > 0) {
            finalAvg = allInstrumentsSum / allInstrumentsCount;
        } else if (finalAvgMethod === 'sum_of_all' && allInstrumentsCount > 0) {
            finalAvg = allInstrumentsSum;
        }
        
        if (finalAvg !== null) {
            tdFinal.textContent = finalAvg.toFixed(1);
            if (finalAvg < 5) tdFinal.classList.add('grade-low');
            else if (finalAvg < 7) tdFinal.classList.add('grade-medium');
            else tdFinal.classList.add('grade-high');
        } else {
            tdFinal.textContent = '-';
        }
        row.appendChild(tdFinal);
    });
    
    gradesTableContainer.appendChild(table);
};

    const calculateAndUpdateSumAndAverage = (tableRow, gradeSet, colorRanges) => { let sum = 0; let count = 0; gradeSet.gradeLabels.forEach(label => { const input = tableRow.querySelector(`input[data-label="${label}"]`); let value = parseFloat(input?.value); if (gradeSet.recoveryLabels && gradeSet.recoveryLabels.includes(label)) { const recInput = tableRow.querySelector(`input[data-label="${label}_recovery"]`); const recValue = parseFloat(recInput?.value); if (!isNaN(recValue)) { if (isNaN(value) || recValue > value) { value = recValue; } } } if (!isNaN(value)) { sum += value; count++; } }); const sumCell = tableRow.querySelector('.sum'); const avgCell = tableRow.querySelector('.average'); if (sumCell) { sumCell.textContent = count > 0 ? sum.toFixed(1) : '--'; } if (avgCell) { const avg = count > 0 ? (sum / count) : null; avgCell.textContent = avg !== null ? avg.toFixed(1) : '--'; if (colorRanges && colorRanges.length > 0) { applyGradeColor(avgCell, avg, colorRanges); avgCell.classList.remove('grade-low', 'grade-medium', 'grade-high'); } else { avgCell.style.backgroundColor = ''; avgCell.style.color = ''; avgCell.classList.remove('grade-low', 'grade-medium', 'grade-high'); if(avg !== null) { if (avg < 5) avgCell.classList.add('grade-low'); else if (avg < 7) avgCell.classList.add('grade-medium'); else avgCell.classList.add('grade-high'); } } } };
    const calculateSumAndAverageForData = (gradesObject, gradeSet) => { let sum = 0; let count = 0; let average = null; if (gradesObject && gradeSet) { gradeSet.gradeLabels.forEach(label => { let value = parseFloat(gradesObject[label]); if (gradeSet.recoveryLabels && gradeSet.recoveryLabels.includes(label)) { const recValue = parseFloat(gradesObject[label + '_recovery']); if (!isNaN(recValue)) { if (isNaN(value) || recValue > value) { value = recValue; } } } if (!isNaN(value)) { sum += value; count++; } }); } else if (gradesObject) { for(const label in gradesObject) { if (label !== 'average' && label !== 'sum' && !label.endsWith('_recovery')) { let value = parseFloat(gradesObject[label]); const recValue = parseFloat(gradesObject[label + '_recovery']); if (!isNaN(recValue) && (isNaN(value) || recValue > value)) { value = recValue; } if (!isNaN(value)) { sum += value; count++; } } } } if (count > 0) { average = parseFloat((sum / count).toFixed(1)); sum = parseFloat(sum.toFixed(1)); } else { sum = null; } return { sum: sum, average: average, count: count }; };
    const renderAttendanceTable = (classId, date) => { attendanceTableContainer.innerHTML = ''; saveAttendanceButton.classList.add('hidden'); attendanceActionsContainer.classList.add('hidden'); const studentsInClass = getStudentsByClass(classId); if (!date) { attendanceTableContainer.innerHTML = '<p style="padding: 1rem; text-align: center;">Selecione uma data.</p>'; return; } if (studentsInClass.length === 0) { attendanceTableContainer.innerHTML = '<p style="padding: 1rem; text-align: center;">Nenhum aluno para registrar presença.</p>'; return; } const isNonSchoolDay = studentsInClass.every(std => std.attendance[date]?.status === 'H'); console.log(`Rendering attendance for ${date}. Is Non-School Day: ${isNonSchoolDay}`); attendanceActionsContainer.classList.remove('hidden'); saveAttendanceButton.classList.remove('hidden'); markAllPresentButton.disabled = isNonSchoolDay; if (isNonSchoolDay) { markNonSchoolDayButton.innerHTML = `<span class="icon icon-nao-letivo"></span>Desm. Não Letivo`; markNonSchoolDayButton.classList.remove('secondary'); markNonSchoolDayButton.classList.add('danger'); markNonSchoolDayButton.title = "Reverter para dia letivo normal"; } else { markNonSchoolDayButton.innerHTML = `<span class="icon icon-nao-letivo"></span>Não Letivo`; markNonSchoolDayButton.classList.remove('danger'); markNonSchoolDayButton.classList.add('secondary'); markNonSchoolDayButton.title = "Marcar este dia como não letivo"; } const table = document.createElement('table'); table.classList.add('data-table'); table.innerHTML = `<thead><tr><th class="student-col">Aluno</th><th class="attendance-status">Status</th></tr></thead><tbody></tbody>`; const tbody = table.querySelector('tbody'); const template = document.getElementById('attendance-row-template'); studentsInClass.forEach(std => { const studentId = std.id; const clone = template.content.cloneNode(true); const row = clone.querySelector('tr'); row.dataset.studentId = studentId; const studentCol = row.querySelector('.student-col'); studentCol.querySelector('.student-number').textContent = std.number ? `${std.number}.` : '-.'; studentCol.querySelector('.student-name').textContent = sanitizeHTML(std.name); const statusCell = row.querySelector('.attendance-status'); statusCell.innerHTML = ''; const activeSuspension = isStudentSuspendedOnDate(studentId, date); const attendanceRecord = std.attendance[date] || { status: null, justification: '' }; const currentStatus = attendanceRecord.status; const currentJustification = attendanceRecord.justification || ''; if (activeSuspension) { const noteIndex = appData.students.find(s => s.id === studentId)?.notes.findIndex(n => n === activeSuspension) ?? -1; row.classList.add('suspended-student', 'clickable-suspended'); if (noteIndex !== -1) { row.dataset.suspensionNoteIndex = noteIndex; } statusCell.innerHTML = `<span class="suspended-indicator" title="${sanitizeHTML(activeSuspension.text)}"><span class="icon icon-block"></span> Susp.</span>`; studentCol.style.opacity = '0.7'; } else if (currentStatus === 'H') { statusCell.textContent = 'H'; statusCell.classList.add('status-H'); statusCell.title = "Dia não letivo"; } else { row.classList.remove('suspended-student', 'clickable-suspended'); row.removeAttribute('data-suspension-note-index'); studentCol.style.opacity = '1'; statusCell.innerHTML = ` <button type="button" class="attendance-toggle present"><span class="icon icon-presenca"></span> P</button> <button type="button" class="attendance-toggle absent"><span class="icon icon-falta"></span> F</button> `; const presentButton = statusCell.querySelector('.present'); const absentButton = statusCell.querySelector('.absent'); presentButton.disabled = isNonSchoolDay; absentButton.disabled = isNonSchoolDay; const updateButtonUI = (status, justification) => { presentButton.classList.toggle('selected', status === 'P'); absentButton.classList.toggle('selected', status === 'F'); const isJustified = status === 'F' && !!justification; absentButton.classList.toggle('justified', isJustified); absentButton.innerHTML = `<span class="icon icon-falta"></span> ${isJustified ? 'FJ' : 'F'}`; absentButton.title = isJustified ? `Just.: ${sanitizeHTML(justification.substring(0, 30))}... (Clique para editar)` : 'Faltou (Clique para justificar)'; }; updateButtonUI(currentStatus, currentJustification); presentButton.addEventListener('click', () => { if (presentButton.disabled) return; updateAttendanceStatus(studentId, date, 'P'); }); absentButton.addEventListener('click', () => { if (absentButton.disabled) return; const currentAttendance = findStudentById(studentId)?.attendance[date]; if (currentAttendance?.status === 'F') { openJustificationModal(studentId, date); } else { updateAttendanceStatus(studentId, date, 'F'); } }); } tbody.appendChild(row); }); attendanceTableContainer.appendChild(table); };
    const renderLessonPlan = (classId, date) => { 
        const currentClass = findClassById(classId); 
        const displayDiv = document.getElementById('lesson-plan-display');
        if (!currentClass || !date || !displayDiv) { 
            if(displayDiv) displayDiv.innerHTML = 'Nenhum planejamento para esta data.'; 
            return; 
        } 
        currentClass.lessonPlans = currentClass.lessonPlans || {}; 
        const plan = currentClass.lessonPlans[date] || ''; 
        displayDiv.innerHTML = plan ? marked.parse(plan) : 'Nenhum planejamento para esta data.'; 
    };
    const renderClassNotes = (classId, date) => { 
        const currentClass = findClassById(classId); 
        const displayDiv = document.getElementById('class-notes-display');
        if (!currentClass || !date || !displayDiv) { 
            if(displayDiv) displayDiv.innerHTML = 'Nenhuma anotação para esta data.'; 
            return; 
        } 
        currentClass.classNotes = currentClass.classNotes || {}; 
        const notes = currentClass.classNotes[date] || ''; 
        displayDiv.innerHTML = notes ? marked.parse(notes) : 'Nenhuma anotação para esta data.'; 
    };

    const renderClassroomMap = (classId, isEditing = false) => { const cls = findClassById(classId); if (!cls) { console.error("Class not found for map:", classId); classroomContainerDisplay.innerHTML = '<p style="padding: 1rem; text-align: center; grid-column: 1 / -1; grid-row: 1 / -1;">Erro: Turma não encontrada.</p>'; classroomContainerEdit.innerHTML = ''; mapEditArea.classList.add('hidden'); return; } const layout = cls.classroomLayout || { rows: 5, cols: 6, teacherDeskPosition: 'top-center', seats: [] }; const currentLayoutData = isEditing ? tempClassroomLayout : layout; const students = getStudentsByClass(classId); const container = isEditing ? classroomContainerEdit : classroomContainerDisplay; container.innerHTML = ''; const teacherDeskClone = teacherDeskTemplate.content.cloneNode(true); const teacherDeskElement = teacherDeskClone.querySelector('.teacher-desk'); const gridClone = classroomGridTemplate.content.cloneNode(true); const gridContainerElement = gridClone.querySelector('.classroom-map-grid'); teacherDeskElement.className = 'teacher-desk'; const teacherPos = currentLayoutData.teacherDeskPosition || 'top-center'; teacherDeskElement.classList.add(`position-${teacherPos}`); gridContainerElement.style.gridTemplateColumns = `repeat(${currentLayoutData.cols}, minmax(0, 1fr))`; container.appendChild(teacherDeskElement); container.appendChild(gridContainerElement); const seatTemplate = document.getElementById('seat-template'); const emptySeatPlaceholder = "Toque/Arraste Aluno"; if (isEditing) clearSeatSelection(); if (currentLayoutData.rows > 0 && currentLayoutData.cols > 0) { for (let r = 1; r <= currentLayoutData.rows; r++) { for (let c = 1; c <= currentLayoutData.cols; c++) { const seatData = currentLayoutData.seats.find(s => s.row === r && s.col === c); const studentId = seatData?.studentId; const student = studentId ? findStudentById(studentId) : null; const seatClone = seatTemplate.content.cloneNode(true); const seatElement = seatClone.querySelector('.seat'); seatElement.dataset.row = r; seatElement.dataset.col = c; const numberSpan = seatElement.querySelector('.seat-student-number'); const nameSpan = seatElement.querySelector('.seat-student-name'); const placeholderSpan = seatElement.querySelector('.seat-placeholder-text'); numberSpan.textContent = ''; nameSpan.textContent = ''; placeholderSpan.textContent = ''; placeholderSpan.classList.remove('seat-placeholder-text'); seatElement.classList.remove('occupied', 'empty', 'selected-for-assignment'); seatElement.removeAttribute('data-student-id'); seatElement.setAttribute('draggable', 'false'); if (student) { seatElement.classList.add('occupied'); seatElement.dataset.studentId = student.id; numberSpan.textContent = student.number ? `${student.number}.` : ''; nameSpan.textContent = sanitizeHTML(student.name); if (isEditing) { seatElement.setAttribute('draggable', 'true'); seatElement.addEventListener('dragstart', handleSeatDragStart); seatElement.addEventListener('click', handleOccupiedSeatClick); seatElement.style.cursor = 'grab'; } else { seatElement.style.cursor = 'default'; } } else { seatElement.classList.add('empty'); if (isEditing) { seatElement.addEventListener('click', handleSeatClickForAssignment); placeholderSpan.textContent = emptySeatPlaceholder; placeholderSpan.classList.add('seat-placeholder-text'); seatElement.style.cursor = 'pointer'; } else { seatElement.style.cursor = 'default'; } } if (isEditing) { seatElement.addEventListener('dragover', handleDragOver); seatElement.addEventListener('dragleave', handleDragLeave); seatElement.addEventListener('drop', handleDropOnSeat); } gridContainerElement.appendChild(seatElement); } } } else if (!isEditing) { gridContainerElement.innerHTML = '<p style="padding: 1rem; text-align: center; grid-column: 1 / -1;">Configure o mapa clicando no botão <span class="icon icon-editar"></span>.</p>'; } else { gridContainerElement.innerHTML = '<p style="padding: 1rem; text-align: center; grid-column: 1 / -1;">Dimensões inválidas (0 fileiras ou colunas).</p>'; } if (isEditing) { renderUnassignedStudents(classId); } classroomContainerDisplay.classList.toggle('hidden', isEditing); mapEditArea.classList.toggle('hidden', !isEditing); };
    const renderUnassignedStudents = (classId) => { if (!tempClassroomLayout) return; const allStudents = getStudentsByClass(classId); const assignedStudentIds = new Set(tempClassroomLayout.seats.map(s => s.studentId).filter(id => id)); unassignedStudentsContainer.innerHTML = '<h5>Alunos sem lugar (Clique aqui após selecionar mesa vazia)</h5>'; const studentTemplate = document.getElementById('draggable-student-template'); allStudents.forEach(student => { if (!assignedStudentIds.has(student.id)) { const clone = studentTemplate.content.cloneNode(true); const studentDiv = clone.querySelector('.draggable-student'); studentDiv.dataset.studentId = student.id; studentDiv.querySelector('.student-number').textContent = student.number ? `${student.number}.` : ''; studentDiv.querySelector('.student-name').textContent = sanitizeHTML(student.name); const oldNode = studentDiv; studentDiv.replaceWith(oldNode.cloneNode(true)); const newNode = unassignedStudentsContainer.appendChild(oldNode); newNode.addEventListener('dragstart', handleStudentListDragStart); newNode.addEventListener('click', handleUnassignedStudentClickForAssignment); } }); };
    const renderStudentObservations = (studentId, noteIndexToHighlight = -1, useLocalCopy = false) => { const listContainer = document.getElementById('student-observations-list'); if (!listContainer) { console.error("Container #student-observations-list não encontrado no modal."); return; } const notes = useLocalCopy ? currentStudentObservations : (findStudentById(studentId)?.notes || []); listContainer.innerHTML = ''; if (notes.length === 0) { listContainer.innerHTML = '<p style="text-align: center; padding: 1rem; color: var(--text-secondary);">Nenhuma observação registrada.</p>'; return; } const sortedNotes = [...notes].sort((a, b) => (b.date || '').localeCompare(a.date || '')); const template = document.getElementById('observation-item-template'); sortedNotes.forEach(note => { const originalIndex = notes.findIndex(n => n === note); if (originalIndex === -1) return; const clone = template.content.cloneNode(true); const itemElement = clone.querySelector('.observation-item'); itemElement.dataset.index = originalIndex; const categoryClean = (note.category || 'anotacao').toLowerCase().replace(/[^a-z0-9]/g, ''); itemElement.classList.add(`category-${categoryClean}`); itemElement.querySelector('.category').textContent = `${note.category || 'Anotação'}`; itemElement.querySelector('.observation-date').textContent = formatDate(note.date); itemElement.querySelector('.observation-text').textContent = sanitizeHTML(note.text); const suspDatesSpan = itemElement.querySelector('.observation-suspension-dates'); if (note.category === 'Suspensão' && note.suspensionStartDate && note.suspensionEndDate) { suspDatesSpan.textContent = `Período: ${formatDate(note.suspensionStartDate)} a ${formatDate(note.suspensionEndDate)}`; suspDatesSpan.classList.remove('hidden'); } else { suspDatesSpan.classList.add('hidden'); } if (!useLocalCopy && originalIndex === noteIndexToHighlight) { itemElement.classList.add('highlighted-note'); setTimeout(() => itemElement.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150); } listContainer.appendChild(clone); }); };

    // --- Funções de CRUD ---
    const openScheduleModal = (scheduleIdToEdit = null) => {
        const isEditing = scheduleIdToEdit !== null;
        const scheduleData = isEditing ? findScheduleById(scheduleIdToEdit) : { day: weekdays[new Date().getDay()], notificationsEnabled: true };
        const title = isEditing ? 'Editar Horário' : 'Novo Horário';
        
        let schoolOptions = '<option value="">-- Selecione a escola --</option>';
        appData.schools.sort((a, b) => a.name.localeCompare(b.name)).forEach(s => {
            const isSelected = scheduleData.schoolId === s.id ? 'selected' : '';
            schoolOptions += `<option value="${s.id}" ${isSelected}>${sanitizeHTML(s.name)}</option>`;
        });
        schoolOptions += `<option value="NEW">Outra (digitar manualmente)...</option>`;

        const existingClasses = scheduleData.note ? scheduleData.note.split(',').map(c => c.trim()) : [];
        const extraClasses = existingClasses.join(', ');

        let dayOptions = '';
        const allDays = ['Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado', 'Domingo'];
        allDays.forEach(day => {
            const isSelected = scheduleData.day === day ? 'selected' : '';
            dayOptions += `<option value="${day}" ${isSelected}>${day}</option>`;
        });

        const modalContent = `
            <form id="schedule-form">
                <input type="hidden" id="schedule-id" value="${isEditing ? scheduleIdToEdit : ''}">
                <div class="form-group">
                    <label for="schedule-day">Dia:</label>
                    <select id="schedule-day" required>
                        ${dayOptions}
                    </select>
                </div>
                <div class="form-group d-flex">
                    <div style="flex: 1; margin-right: 5px;">
                        <label for="schedule-start-time">Início:</label>
                        <input type="time" id="schedule-start-time" required value="${scheduleData.startTime || ''}">
                    </div>
                    <div style="flex: 1; margin-left: 5px;">
                        <label for="schedule-end-time">Fim:</label>
                        <input type="time" id="schedule-end-time" required value="${scheduleData.endTime || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label for="schedule-school-select">Escola:</label>
                    <select id="schedule-school-select" required>
                        ${schoolOptions}
                    </select>
                    <input type="text" id="schedule-school-input" style="display: none; margin-top: 5px;" placeholder="Digite o nome da nova escola">
                </div>
                <div class="form-group">
                    <label>Turma(s):</label>
                    <div id="schedule-classes-container" style="max-height: 120px; overflow-y: auto; border: 1px solid var(--border-color); padding: 8px; border-radius: 4px; margin-bottom: 5px; background: var(--bg-primary);">
                        <!-- Checkboxes will be rendered here -->
                    </div>
                    <input type="text" id="schedule-note-extra" placeholder="Outras turmas (separadas por vírgula)" value="${sanitizeHTML(extraClasses)}">
                </div>
                <div class="form-group" style="margin-top: 1.5rem;">
                    <label>Opções do Horário:</label>
                    <div class="toggle-container mt-2" style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 500;">Ativar Notificações para este Horário</span>
                        <label class="switch">
                            <input type="checkbox" id="enable-schedule-notification" ${scheduleData.notificationsEnabled ? 'checked' : ''}>
                            <span class="slider round"></span>
                        </label>
                    </div>
                </div>
            </form>
        `;
        
        let footerButtons = `<button type="button" id="save-schedule-button" class="success"><span class="icon icon-salvar"></span> Salvar</button>`;
        if (isEditing) {
            footerButtons = `<button type="button" id="delete-schedule-btn-modal" class="danger"><span class="icon icon-excluir"></span> Excluir</button>` + footerButtons;
        }
        showModal(title, modalContent, footerButtons);
        
        const schoolSelect = document.getElementById('schedule-school-select');
        const schoolInput = document.getElementById('schedule-school-input');
        const classesContainer = document.getElementById('schedule-classes-container');
        const extraClassesInput = document.getElementById('schedule-note-extra');
        
        const updateClassesList = () => {
            const selectedSchoolId = schoolSelect.value;
            let classCheckboxes = '';
            
            // Re-create existingClasses from scheduleData.note to avoid losing state on school change
            const currentExistingClasses = scheduleData.note ? scheduleData.note.split(',').map(c => c.trim()) : [];
            
            if (selectedSchoolId && selectedSchoolId !== 'NEW') {
                const schoolClasses = appData.classes.filter(c => c.schoolId === selectedSchoolId);
                const uniqueClassNames = [...new Set(schoolClasses.map(c => c.name))].sort((a, b) => a.localeCompare(b));
                
                uniqueClassNames.forEach(className => {
                    const isChecked = currentExistingClasses.includes(className) ? 'checked' : '';
                    classCheckboxes += `<label style="display: block; margin-bottom: 5px; cursor: pointer;"><input type="checkbox" value="${sanitizeHTML(className)}" class="schedule-class-cb" ${isChecked}> ${sanitizeHTML(className)}</label>`;
                    
                    // Remove from currentExistingClasses so we don't duplicate it in the extra classes input
                    const idx = currentExistingClasses.indexOf(className);
                    if (idx > -1) currentExistingClasses.splice(idx, 1);
                });
            }
            
            classesContainer.innerHTML = classCheckboxes || '<span style="color: var(--text-secondary); font-size: 0.9em;">Nenhuma turma cadastrada para esta escola.</span>';
            
            // Update extra classes input with any remaining classes that weren't found in the school's classes
            if (isEditing && currentExistingClasses.length > 0) {
                extraClassesInput.value = currentExistingClasses.join(', ');
            } else {
                extraClassesInput.value = '';
            }
        };
        
        schoolSelect.addEventListener('change', () => {
            if (schoolSelect.value === 'NEW') {
                schoolInput.style.display = 'block';
                schoolInput.required = true;
            } else {
                schoolInput.style.display = 'none';
                schoolInput.required = false;
            }
            updateClassesList();
        });
        
        // Initial render of classes
        updateClassesList();
        
        document.getElementById('save-schedule-button').addEventListener('click', saveScheduleEntry);
        
        if (isEditing) {
            document.getElementById('delete-schedule-btn-modal').addEventListener('click', async () => {
                if (await customConfirm('Excluir este horário?')) {
                    deleteScheduleEntry(scheduleIdToEdit);
                    hideModal();
                }
            });
        }
    };

    const saveScheduleEntry = () => {
        const form = document.getElementById('schedule-form');
        if (!form || !form.checkValidity()) {
            customAlert('Preencha os campos obrigatórios (Dia, Horários, Escola).');
            form?.reportValidity();
            return;
        }
        
        const id = document.getElementById('schedule-id').value;
        const schoolSelect = document.getElementById('schedule-school-select');
        const schoolInput = document.getElementById('schedule-school-input');
        
        let schoolId = schoolSelect.value;
        
        if (schoolId === 'NEW') {
            const newSchoolName = schoolInput.value.trim();
            if (!newSchoolName) {
                customAlert('Digite o nome da nova escola.');
                return;
            }
            const existingSchool = appData.schools.find(s => s.name.toLowerCase() === newSchoolName.toLowerCase());
            if (existingSchool) {
                schoolId = existingSchool.id;
            } else {
                schoolId = generateId('sch');
                appData.schools.push({ id: schoolId, name: newSchoolName });
                renderSchoolList();
            }
        }

        const selectedClasses = [];
        document.querySelectorAll('.schedule-class-cb:checked').forEach(cb => {
            selectedClasses.push(cb.value);
        });
        const extraClasses = document.getElementById('schedule-note-extra').value.trim();
        if (extraClasses) {
            extraClasses.split(',').forEach(c => {
                if (c.trim()) selectedClasses.push(c.trim());
            });
        }
        
        const finalNote = selectedClasses.join(', ');

        const newData = {
            id: id || generateId('sch'),
            day: document.getElementById('schedule-day').value,
            startTime: document.getElementById('schedule-start-time').value,
            endTime: document.getElementById('schedule-end-time').value,
            schoolId: schoolId,
            note: finalNote,
            notificationsEnabled: document.getElementById('enable-schedule-notification').checked
        };
        
        if (id) {
            const index = appData.schedule.findIndex(item => item.id === id);
            if (index > -1) appData.schedule[index] = newData;
        } else {
            appData.schedule.push(newData);
        }
        
        saveData();
        renderScheduleList();
        hideModal();
    };
    const deleteScheduleEntry = (id) => { appData.schedule = appData.schedule.filter(item => item.id !== id); saveData(); renderScheduleList(); };
    const toggleScheduleNotification = (scheduleId, indicatorElement) => { const item = findScheduleById(scheduleId); if (item) { item.notificationsEnabled = !item.notificationsEnabled; saveData(); updateNotificationIcon(indicatorElement, item.notificationsEnabled); console.log(`Notification for ${scheduleId} set to: ${item.notificationsEnabled}`); } };
    const openSchoolModal = (schoolIdToEdit = null) => { const isEditing = schoolIdToEdit !== null; const schoolData = isEditing ? findSchoolById(schoolIdToEdit) : {}; const title = isEditing ? 'Editar Escola' : 'Nova Escola'; const modalContent = `<form id="school-form"><input type="hidden" id="school-id" value="${isEditing ? schoolIdToEdit : ''}"><div class="form-group"><label for="school-name">Nome:</label><input type="text" id="school-name" required value="${sanitizeHTML(schoolData.name || '')}"></div></form>`; let footerButtons = `<button type="button" id="save-school-button" class="success"><span class="icon icon-salvar"></span> Salvar</button>`; if (isEditing) { footerButtons = `<button type="button" id="delete-school-btn-modal" class="danger"><span class="icon icon-excluir"></span> Excluir</button>` + footerButtons; } showModal(title, modalContent, footerButtons); document.getElementById('save-school-button').addEventListener('click', saveSchool); if (isEditing) { document.getElementById('delete-school-btn-modal').addEventListener('click', async () => { if (await customConfirm(`Excluir escola "${sanitizeHTML(schoolData.name)}" e TODOS os dados associados (turmas, alunos, etc.)?`)) { deleteSchool(schoolIdToEdit); hideModal(); } }); } };
    const saveSchool = () => { const form = document.getElementById('school-form'); if (!form || !form.checkValidity()) { customAlert('Preencha o nome da escola.'); form?.reportValidity(); return; } const id = document.getElementById('school-id').value; const newSchoolData = { id: id || generateId('sch'), name: document.getElementById('school-name').value.trim() }; if (id) { const index = appData.schools.findIndex(s => s.id === id); if (index > -1) appData.schools[index] = newSchoolData; } else { appData.schools.push(newSchoolData); } saveData(); renderSchoolList(); if(currentSection === 'schedule-section') renderScheduleList(); hideModal(); };
    const deleteSchool = (id) => { const classesToDelete = appData.classes.filter(c => c.schoolId === id).map(c => c.id); appData.schools = appData.schools.filter(s => s.id !== id); appData.classes = appData.classes.filter(c => c.schoolId !== id); appData.students = appData.students.filter(s => !classesToDelete.includes(s.classId)); appData.schedule = appData.schedule.filter(sch => sch.schoolId !== id); if (currentSchoolId === id) { currentSchoolId = null; currentClassId = null; showSection('schools-section'); } saveData(); renderSchoolList(); if (currentSection === 'schedule-section') renderScheduleList(); if (currentSection === 'classes-section' && !currentSchoolId) { showSection('schools-section'); } else if (currentSection === 'classes-section') { renderClassList(currentSchoolId); } saveAppState(); };
    const selectSchool = (id) => { currentSchoolId = id; currentClassId = null; renderClassList(id); navClassesButton.disabled = false; navDetailsButton.disabled = true; saveAppState(); };
    const openClassModal = (classIdToEdit = null) => { if (!currentSchoolId) return; const isEditing = classIdToEdit !== null; const classData = isEditing ? findClassById(classIdToEdit) : {}; const title = isEditing ? 'Editar Turma' : 'Nova Turma'; const schoolName = findSchoolById(currentSchoolId)?.name || '?'; const modalContent = `<form id="class-form"><input type="hidden" id="class-id" value="${isEditing ? classIdToEdit : ''}"><p class="mb-1"><strong>Escola:</strong> ${sanitizeHTML(schoolName)}</p><div class="form-group"><label for="class-name">Nome Turma:</label><input type="text" id="class-name" required value="${sanitizeHTML(classData.name || '')}"></div><div class="form-group"><label for="class-year">Ano/Série:</label><input type="text" id="class-year" list="years-list" placeholder="Ex: 6º Ano do Fundamental" value="${sanitizeHTML(classData.year || '')}"><datalist id="years-list"><option value="Educação Infantil"><option value="1º Ano do Fundamental"><option value="2º Ano do Fundamental"><option value="3º Ano do Fundamental"><option value="4º Ano do Fundamental"><option value="5º Ano do Fundamental"><option value="6º Ano do Fundamental"><option value="7º Ano do Fundamental"><option value="8º Ano do Fundamental"><option value="9º Ano do Fundamental"><option value="1º Ano do Ensino Médio"><option value="2º Ano do Ensino Médio"><option value="3º Ano do Ensino Médio"><option value="EJA"></datalist></div><div class="form-group"><label for="class-subject">Matéria:</label><input type="text" id="class-subject" list="subjects-list" placeholder="Ex: Matemática" value="${sanitizeHTML(classData.subject || '')}"><datalist id="subjects-list"><option value="Português"><option value="Matemática"><option value="História"><option value="Geografia"><option value="Ciências"><option value="Física"><option value="Química"><option value="Biologia"><option value="Inglês"><option value="Espanhol"><option value="Artes"><option value="Educação Física"><option value="Filosofia"><option value="Sociologia"><option value="Ensino Religioso"></datalist></div><div class="form-group d-flex"><div style="flex: 1; margin-right: 5px;"><label for="class-schedule">Horário Início:</label><input type="time" id="class-schedule" value="${classData.schedule || ''}"></div><div style="flex: 1; margin-left: 5px; margin-right: 5px;"><label for="class-schedule-end">Horário Término:</label><input type="time" id="class-schedule-end" value="${classData.scheduleEnd || ''}"></div><div style="flex: 1; margin-left: 5px;"><label for="class-shift">Turno:</label><input type="text" id="class-shift" list="shifts-list" placeholder="Ex: Manhã" value="${sanitizeHTML(classData.shift || '')}"><datalist id="shifts-list"><option value="Manhã"><option value="Tarde"><option value="Noite"><option value="Integral"></datalist></div></div><div class="form-group"><label for="class-final-avg-method">Cálculo da Média Final:</label><select id="class-final-avg-method"><option value="average_of_averages" ${classData.finalAverageMethod === 'average_of_averages' || !classData.finalAverageMethod ? 'selected' : ''}>Média das médias dos conjuntos</option><option value="sum_of_averages" ${classData.finalAverageMethod === 'sum_of_averages' ? 'selected' : ''}>Soma das médias dos conjuntos</option><option value="average_of_all" ${classData.finalAverageMethod === 'average_of_all' ? 'selected' : ''}>Média de todos os instrumentos do ano</option><option value="sum_of_all" ${classData.finalAverageMethod === 'sum_of_all' ? 'selected' : ''}>Soma de todos os instrumentos do ano</option></select></div></form>`; let footerButtons = `<button type="button" id="save-class-button" class="success"><span class="icon icon-salvar"></span> Salvar</button>`; if (isEditing) { footerButtons = `<button type="button" id="delete-class-btn-modal" class="danger"><span class="icon icon-excluir"></span> Excluir</button>` + footerButtons; } showModal(title, modalContent, footerButtons); document.getElementById('save-class-button').addEventListener('click', saveClass); if (isEditing) { document.getElementById('delete-class-btn-modal').addEventListener('click', async () => { if (await customConfirm(`Excluir turma "${sanitizeHTML(classData.name)}" e TODOS os dados associados?`)) { deleteClass(classIdToEdit); hideModal(); } }); } };
    const saveClass = () => { const form = document.getElementById('class-form'); if (!form || !form.checkValidity() || !currentSchoolId) { customAlert('Preencha nome da turma e verifique escola.'); form?.reportValidity(); return; } const id = document.getElementById('class-id').value; const isEditing = !!id; const existingData = isEditing ? findClassById(id) : {}; const newClassData = { id: id || generateId('cls'), schoolId: currentSchoolId, name: document.getElementById('class-name').value.trim(), year: document.getElementById('class-year').value.trim(), subject: document.getElementById('class-subject').value.trim(), schedule: document.getElementById('class-schedule').value, scheduleEnd: document.getElementById('class-schedule-end').value, shift: document.getElementById('class-shift').value.trim(), finalAverageMethod: document.getElementById('class-final-avg-method').value, notes: existingData?.notes || '', gradeStructure: existingData?.gradeStructure || [], lessonPlans: existingData?.lessonPlans || {}, classroomLayout: existingData?.classroomLayout || { rows: 5, cols: 6, teacherDeskPosition: 'top-center', seats: [] }, representativeId: existingData?.representativeId || null, viceRepresentativeId: existingData?.viceRepresentativeId || null }; if (isEditing) { const index = appData.classes.findIndex(c => c.id === id); if (index > -1) appData.classes[index] = newClassData; } else { appData.classes.push(newClassData); } saveData(); renderClassList(currentSchoolId); if (id && id === currentClassId && currentSection === 'class-details-section') { selectClass(id, true); } hideModal(); };
    const deleteClass = (id) => { appData.classes = appData.classes.filter(c => c.id !== id); appData.students = appData.students.filter(s => s.classId !== id); if (currentClassId === id) { currentClassId = null; showSection('classes-section'); } saveData(); renderClassList(currentSchoolId); if (!currentClassId) navDetailsButton.disabled = true; saveAppState(); };
    const selectClass = (id, forceReload = false) => { if (currentClassId !== id || forceReload) { console.log(`Selecionando Turma: ${id}, Forçar Recarga: ${forceReload}`); if (tempClassroomLayout) { cancelClassroomMapEdit(); } currentClassId = id; const selectedClass = findClassById(id); if (selectedClass) { classDetailsTitle.textContent = `${sanitizeHTML(selectedClass.name)}${selectedClass.year ? ' (' + sanitizeHTML(selectedClass.year) + ')' : ''} - ${sanitizeHTML(selectedClass.subject || 'Sem matéria')}`; renderStudentList(id); renderGradeSets(id); const currentDate = attendanceDateInput.value || getCurrentDateString(); attendanceDateInput.value = currentDate; lessonPlanDateInput.value = currentDate; const classNotesDateInput = document.getElementById('class-notes-date'); if(classNotesDateInput) classNotesDateInput.value = currentDate; renderAttendanceTable(id, currentDate); renderLessonPlan(id, currentDate); renderClassNotes(id, currentDate); renderClassroomMap(id); if (currentSection === 'classes-section') renderClassList(selectedClass.schoolId); navDetailsButton.disabled = false; classDetailsSection.querySelectorAll('.card').forEach(card => { card.classList.add('collapsed'); const toggleBtn = card.querySelector('.card-toggle-button .icon'); if (toggleBtn) { toggleBtn.classList.remove('icon-chevron-up'); toggleBtn.classList.remove('icon-chevron-down'); toggleBtn.classList.add('icon-more-vert'); if(toggleBtn.parentElement) toggleBtn.parentElement.title = 'Mostrar Opções'; } }); } else { currentClassId = null; classDetailsTitle.textContent = "Erro: Turma não encontrada"; studentListContainer.innerHTML = '<p>Erro</p>'; gradesTableContainer.innerHTML = '<p>Erro</p>'; attendanceTableContainer.innerHTML = '<p>Erro</p>'; const displayDiv = document.getElementById('lesson-plan-display'); if(displayDiv) displayDiv.innerHTML = ''; const notesDisplayDiv = document.getElementById('class-notes-display'); if(notesDisplayDiv) notesDisplayDiv.innerHTML = ''; classroomContainerDisplay.innerHTML = '<p style="padding: 1rem; text-align: center; grid-column: 1 / -1; grid-row: 1 / -1;">Erro ao carregar mapa.</p>'; navDetailsButton.disabled = true; } saveAppState(); } else { console.log(`Turma ${id} já selecionada.`); } };
    const openStudentModal = (studentIdToEdit = null) => {
        if (!currentClassId) return;
        const isEditing = studentIdToEdit !== null;
        const studentData = isEditing ? findStudentById(studentIdToEdit) : { governmentPrograms: [] }; // Initialize for new student
        const title = isEditing ? 'Editar Aluno' : 'Novo Aluno';
        const className = findClassById(currentClassId)?.name || '?';

        // **** NOVO: HTML para Programas Governamentais ****
        const programsHtml = `
            <div class="form-group" style="margin-top: 1rem;">
                <label>Programas Governamentais:</label>
                <div class="toggle-container mt-2" style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 500;">Bolsa Família</span>
                    <label class="switch">
                        <input type="checkbox" id="student-program-bolsa-familia" value="Bolsa Família" ${studentData.governmentPrograms && studentData.governmentPrograms.includes('Bolsa Família') ? 'checked' : ''}>
                        <span class="slider round"></span>
                    </label>
                </div>
                <div class="toggle-container mt-2" style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 500;">Pé de Meia</span>
                    <label class="switch">
                        <input type="checkbox" id="student-program-pe-de-meia" value="Pé de Meia" ${studentData.governmentPrograms && studentData.governmentPrograms.includes('Pé de Meia') ? 'checked' : ''}>
                        <span class="slider round"></span>
                    </label>
                </div>
            </div>
        `;

        const modalContent = `
            <form id="student-form">
                <p class="mb-1"><strong>Turma:</strong> ${sanitizeHTML(className)}</p>
                <input type="hidden" id="student-id" value="${isEditing ? studentIdToEdit : ''}">
                <div class="form-group d-flex align-items-center">
                    <div style="width: 80px; margin-right: 10px;">
                        <label for="student-number">Nº:</label>
                        <input type="number" id="student-number" min="1" step="1" value="${studentData.number || ''}" style="padding: 0.7rem 0.5rem;">
                    </div>
                    <div style="flex-grow: 1;">
                        <label for="student-name">Nome:</label>
                        <input type="text" id="student-name" required value="${sanitizeHTML(studentData.name || '')}">
                    </div>
                </div>
                ${programsHtml} 
            </form>`;
        const footerButtons = `<button type="button" id="save-student-button" class="success"><span class="icon icon-salvar"></span> Salvar</button>`;
        showModal(title, modalContent, footerButtons);
        document.getElementById('save-student-button').addEventListener('click', saveStudent);
    };
    const saveStudent = () => {
        const form = document.getElementById('student-form');
        if (!form || !form.checkValidity()) {
            customAlert('Preencha o nome do aluno.');
            form?.reportValidity();
            return;
        }
        const id = document.getElementById('student-id').value;
        const studentName = document.getElementById('student-name').value.trim();
        const studentNumberInput = document.getElementById('student-number').value;
        const studentNumber = studentNumberInput ? parseInt(studentNumberInput) : null;

        // **** NOVO: Coleta de dados dos programas ****
        const selectedPrograms = [];
        const bolsaFamiliaCheckbox = document.getElementById('student-program-bolsa-familia');
        const peDeMeiaCheckbox = document.getElementById('student-program-pe-de-meia');
        if (bolsaFamiliaCheckbox && bolsaFamiliaCheckbox.checked) selectedPrograms.push('Bolsa Família');
        if (peDeMeiaCheckbox && peDeMeiaCheckbox.checked) selectedPrograms.push('Pé de Meia');

        if (!currentClassId) return;

        if (!id) {
            const studentsInClass = getStudentsByClass(currentClassId);
            if (studentsInClass.length >= 100) {
                customAlert('Limite máximo de 100 alunos por turma atingido.');
                return;
            }
        }

        if (id) {
            const student = findStudentById(id);
            if (student) {
                student.name = studentName;
                student.number = studentNumber;
                student.governmentPrograms = selectedPrograms; // Salva programas
            }
        } else {
            const newStudent = {
                id: generateId('std'),
                name: studentName,
                number: studentNumber,
                classId: currentClassId,
                grades: {},
                attendance: {},
                notes: [],
                governmentPrograms: selectedPrograms // Salva programas
            };
            appData.students.push(newStudent);
        }
        saveData();
        renderStudentList(currentClassId);
        if (gradeSetSelect.value) renderGradesTable(currentClassId, gradeSetSelect.value);
        if (attendanceDateInput.value) renderAttendanceTable(currentClassId, attendanceDateInput.value);
        renderClassroomMap(currentClassId);
        hideModal();
    };
    const deleteStudent = (id) => { if (currentClassId) { const cls = findClassById(currentClassId); if (cls?.classroomLayout?.seats) { cls.classroomLayout.seats.forEach(seat => { if (seat.studentId === id) { seat.studentId = null; } }); } if(cls?.representativeId === id) cls.representativeId = null; if(cls?.viceRepresentativeId === id) cls.viceRepresentativeId = null; } appData.students = appData.students.filter(s => s.id !== id); saveData(); renderStudentList(currentClassId); if (gradeSetSelect.value) renderGradesTable(currentClassId, gradeSetSelect.value); if (attendanceDateInput.value) renderAttendanceTable(currentClassId, attendanceDateInput.value); renderClassroomMap(currentClassId); };

    const openRenumberStudentsModal = () => {
        if (!currentClassId) return;
        const currentClass = findClassById(currentClassId);
        if (!currentClass) return;

        const title = 'Renumerar Alunos';
        const modalContent = `
            <p>Escolha o critério para renumerar automaticamente os alunos da turma <strong>${sanitizeHTML(currentClass.name)}</strong>:</p>
            <div class="form-group">
                <label for="renumber-criteria">Critério:</label>
                <select id="renumber-criteria">
                    <option value="alphabetical">Ordem Alfabética</option>
                    <option value="creation_date">Data de Entrada na Turma (Restaurar)</option>
                    <option value="random">Aleatória</option>
                </select>
            </div>
            <p class="text-secondary" style="font-size: 0.9em; margin-top: 1rem;">
                <strong>Atenção:</strong> Esta ação irá sobrescrever os números de chamada atuais de todos os alunos desta turma. Você ainda poderá editá-los manualmente depois.
            </p>
        `;
        const footerButtons = `<button type="button" id="confirm-renumber-button" class="success"><span class="icon icon-sorteio"></span> Confirmar</button>`;
        showModal(title, modalContent, footerButtons);

        document.getElementById('confirm-renumber-button').addEventListener('click', () => {
            const criteria = document.getElementById('renumber-criteria').value;
            renumberStudents(currentClassId, criteria);
        });
    };

    const renumberStudents = (classId, criteria) => {
        const students = getStudentsByClass(classId);
        if (students.length === 0) {
            customAlert("Não há alunos nesta turma para renumerar.");
            hideModal();
            return;
        }

        if (criteria === 'alphabetical') {
            students.sort((a, b) => a.name.localeCompare(b.name));
            customAlert("Alunos renumerados com sucesso por ordem alfabética!");
        } else if (criteria === 'creation_date') {
            students.sort((a, b) => {
                const timeA = parseInt(a.id.split('_')[1]) || 0;
                const timeB = parseInt(b.id.split('_')[1]) || 0;
                return timeA - timeB;
            });
            customAlert("Alunos renumerados com sucesso por data de entrada!");
        } else if (criteria === 'random') {
            students.sort(() => Math.random() - 0.5);
            customAlert("Alunos renumerados com sucesso de forma aleatória!");
        }

        students.forEach((student, index) => {
            student.number = index + 1;
        });
        saveData();
        renderStudentList(classId);
        hideModal();
    };

    const openStudentNotesModal = (studentId, noteIndexToHighlight = -1) => { const student = findStudentById(studentId); if (!student) return; currentStudentObservations = JSON.parse(JSON.stringify(student.notes || [])); const title = `Observações - ${student.number || '-'}. ${sanitizeHTML(student.name)}`; const modalContent = ` <div id="student-observations-list"></div> <hr style="margin: 1rem 0 0.8rem 0; border-color: var(--border-color);"> <div id="add-observation-section"> <form id="add-observation-form"> <div class="form-group"> <label for="new-observation-category">Categoria:</label> <select id="new-observation-category"> <option value="Anotação">Anotação</option> <option value="Observação" selected>Observação</option> <option value="Ocorrência">Ocorrência</option> <option value="Advertência">Advertência</option> <option value="Suspensão">Suspensão</option> </select> </div> <div id="suspension-fields" class="form-group hidden" style="display: flex; gap: 10px;"> <div style="flex: 1;"> <label for="new-suspension-start-date">Início Suspensão:</label> <input type="date" id="new-suspension-start-date"> </div> <div style="flex: 1;"> <label for="new-suspension-end-date">Fim Suspensão:</label> <input type="date" id="new-suspension-end-date"> </div> </div> <div class="form-group"> <label for="new-observation-text">Descrição:</label> <textarea id="new-observation-text" required></textarea> </div> <button type="button" id="add-observation-button" class="success"><span class="icon icon-adicionar"></span> Adicionar à Lista</button> </form> </div>`; const footerButtons = `<button type="button" id="save-observations-button" class="success"><span class="icon icon-salvar"></span> Salvar Observações</button>`; showModal(title, modalContent, footerButtons, 'student-notes-modal'); renderStudentObservations(studentId, noteIndexToHighlight, true); const categorySelect = document.getElementById('new-observation-category'); const suspensionFields = document.getElementById('suspension-fields'); const startDateInput = document.getElementById('new-suspension-start-date'); const endDateInput = document.getElementById('new-suspension-end-date'); const descriptionTextarea = document.getElementById('new-observation-text'); const saveButton = document.getElementById('save-observations-button'); const addToListButton = document.getElementById('add-observation-button'); const observationsListContainer = document.getElementById('student-observations-list'); const placeholderMap = { 'Anotação': 'Digite uma anotação rápida...', 'Observação': 'Descreva a observação comportamental, acadêmica, etc.', 'Ocorrência': 'Detalhe a ocorrência (briga, desrespeito, etc.).', 'Advertência': 'Descreva o motivo da advertência formal.', 'Suspensão': 'Descreva o motivo grave e o período da suspensão.' }; const updateDynamicFields = () => { const cat = categorySelect.value || 'Observação'; descriptionTextarea.placeholder = placeholderMap[cat] || 'Digite a descrição...'; const pluralSuffix = cat.endsWith('o') || cat.endsWith('a') ? 's' : (cat.endsWith('m') ? 'ns' : 's'); saveButton.innerHTML = `<span class="icon icon-salvar"></span> Salvar ${cat}${pluralSuffix}`; const showSusp = cat === 'Suspensão'; suspensionFields.classList.toggle('hidden', !showSusp); startDateInput.required = showSusp; endDateInput.required = showSusp; if (!showSusp) { startDateInput.value = ''; endDateInput.value = ''; } }; categorySelect.addEventListener('change', updateDynamicFields); updateDynamicFields(); addToListButton?.addEventListener('click', () => { const form = document.getElementById('add-observation-form'); if (!form.checkValidity()) { form.reportValidity(); return; } const category = categorySelect.value; const text = descriptionTextarea.value.trim(); let startDate = null, endDate = null; if (category === 'Suspensão') { startDate = startDateInput.value; endDate = endDateInput.value; if (!startDate || !endDate) { customAlert("Para Suspensão, as datas de início e fim são obrigatórias."); return; } if (startDate > endDate) { customAlert("A data de início da suspensão não pode ser posterior à data de fim."); return; } } if (text) { const newObservation = { date: getCurrentDateString(), category: category, text: text, suspensionStartDate: startDate, suspensionEndDate: endDate }; currentStudentObservations.push(newObservation); renderStudentObservations(studentId, -1, true); descriptionTextarea.value = ''; categorySelect.value = 'Observação'; startDateInput.value = ''; endDateInput.value = ''; updateDynamicFields(); descriptionTextarea.focus(); } else { customAlert("A descrição não pode estar vazia."); descriptionTextarea.focus(); } }); saveButton?.addEventListener('click', () => saveStudentObservations(studentId)); observationsListContainer?.addEventListener('click', async (e) => { const deleteButton = e.target.closest('.delete-observation-button'); if (deleteButton) { const itemElement = deleteButton.closest('.observation-item'); const index = parseInt(itemElement?.dataset.index, 10); if (!isNaN(index) && await customConfirm("Excluir esta observação permanentemente?")) { const removed = currentStudentObservations.splice(index, 1); if (removed.length > 0) { console.log("Observação removida (localmente):", removed[0]); renderStudentObservations(studentId, -1, true); } else { console.warn("Tentativa de excluir observação com índice inválido:", index); } } } }); };
    const saveStudentObservations = (studentId) => { const student = findStudentById(studentId); if (!student) { console.error("Erro: Aluno não encontrado ao salvar observações:", studentId); customAlert("Erro ao salvar: Aluno não encontrado."); return; } student.notes = JSON.parse(JSON.stringify(currentStudentObservations)); saveData(); hideModal(); renderAttendanceTable(currentClassId, attendanceDateInput.value || getCurrentDateString()); customAlert(`Observações de ${sanitizeHTML(student.name)} salvas com sucesso!`); console.log("Observações salvas:", student.notes); };
    const updateAttendanceStatus = (studentId, date, newStatus) => { const student = findStudentById(studentId); if (!student) { console.warn(`Aluno ${studentId} não encontrado para atualizar presença.`); return; } if (!date) { console.warn("Data inválida para atualizar presença."); return; } if (!student.attendance[date]) { student.attendance[date] = { status: null, justification: '' }; } const currentStatus = student.attendance[date].status; if (currentStatus === newStatus) { student.attendance[date].status = null; student.attendance[date].justification = ''; } else { student.attendance[date].status = newStatus; if (newStatus === 'P') { student.attendance[date].justification = ''; } } console.log(`Status de presença atualizado para ${studentId} em ${date}:`, student.attendance[date]); renderAttendanceTable(currentClassId, date); };
    const openJustificationModal = (studentId, date) => { const student = findStudentById(studentId); if (!student || !date) { console.error("Aluno ou data inválida para justificação."); return; } if (!student.attendance[date]) { student.attendance[date] = { status: 'F', justification: '' }; } else { student.attendance[date].status = 'F'; } const currentJustification = student.attendance[date].justification || ''; const title = `Justificativa - ${sanitizeHTML(student.name)} (${formatDate(date)})`; const modalContent = ` <form id="justification-form"> <div class="form-group"> <label for="justification-modal-text">Motivo da Falta:</label> <textarea id="justification-modal-text" placeholder="Digite a justificativa aqui..." style="min-height: 100px;">${sanitizeHTML(currentJustification)}</textarea> </div> </form>`; const footerButtons = `<button type="button" id="save-justification-button" class="success"><span class="icon icon-salvar"></span> Salvar Justificativa</button>`; showModal(title, modalContent, footerButtons, 'justification-modal'); const saveBtn = document.getElementById('save-justification-button'); if(saveBtn) { const newSaveBtn = saveBtn.cloneNode(true); saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn); newSaveBtn.addEventListener('click', () => { const justificationText = document.getElementById('justification-modal-text').value.trim(); const studentToUpdate = findStudentById(studentId); if (studentToUpdate && studentToUpdate.attendance[date]) { studentToUpdate.attendance[date].status = 'F'; studentToUpdate.attendance[date].justification = justificationText; console.log(`Justificativa atualizada para ${studentId} em ${date}: "${justificationText}"`); hideModal(); renderAttendanceTable(currentClassId, date); } else { console.error("Não foi possível salvar justificação: aluno ou registro de presença ausente."); customAlert("Erro ao salvar justificativa."); hideModal(); } }); } };
    const openMoveStudentModal = (studentId) => { const student = findStudentById(studentId); if (!student) { customAlert("Erro: Aluno não encontrado."); return; } const currentClass = findClassById(student.classId); if (!currentClass) { customAlert("Erro: Turma atual do aluno não encontrada."); return; } const school = findSchoolById(currentClass.schoolId); if (!school) { customAlert("Erro: Escola do aluno não encontrada."); return; } const otherClassesInSchool = appData.classes .filter(c => c.schoolId === school.id && c.id !== currentClass.id) .sort((a, b) => a.name.localeCompare(b.name)); let classOptionsHtml = '<option value="">-- Selecione a Turma de Destino --</option>'; if (otherClassesInSchool.length > 0) { otherClassesInSchool.forEach(cls => { classOptionsHtml += `<option value="${cls.id}">${sanitizeHTML(cls.name)} (${sanitizeHTML(cls.subject || 'N/A')})</option>`; }); } else { classOptionsHtml = '<option value="" disabled>Nenhuma outra turma nesta escola</option>'; } const title = `Mover Aluno: ${sanitizeHTML(student.name)}`; const modalContent = ` <form id="move-student-form"> <p><strong>Aluno:</strong> ${sanitizeHTML(student.name)} (#${student.number || 'S/N'})</p> <p class="mb-1"><strong>Turma Atual:</strong> ${sanitizeHTML(currentClass.name)}</p> <input type="hidden" id="move-student-id" value="${studentId}"> <div class="form-group"> <label for="move-student-destination-class">Mover para a Turma:</label> <select id="move-student-destination-class" required ${otherClassesInSchool.length === 0 ? 'disabled' : ''}> ${classOptionsHtml} </select> ${otherClassesInSchool.length === 0 ? '<p class="text-secondary text-sm mt-1">Não há outras turmas cadastradas nesta escola para mover o aluno.</p>' : ''} </div> <div class="form-group"> <label>Opções de Dados:</label> <div class="toggle-container mt-2" style="display: flex; justify-content: space-between; align-items: center;"> <span style="font-weight: 500;">Mover Histórico de Frequência?</span> <label class="switch"> <input type="checkbox" id="move-student-attendance-checkbox" checked> <span class="slider round"></span> </label> </div> <p class="text-sm text-secondary mt-1">Nota: O histórico de notas NÃO será movido.</p> </div> </form> `; const footerButtons = ` <button type="button" id="confirm-move-student-button" class="success" ${otherClassesInSchool.length === 0 ? 'disabled' : ''}> <span class="icon icon-mover"></span> Mover Aluno </button>`; showModal(title, modalContent, footerButtons, 'move-student-modal'); const confirmButton = document.getElementById('confirm-move-student-button'); if (confirmButton) { confirmButton.replaceWith(confirmButton.cloneNode(true)); document.getElementById('confirm-move-student-button').addEventListener('click', confirmMoveStudent); } };
    const confirmMoveStudent = async () => { const studentId = document.getElementById('move-student-id')?.value; const destinationClassId = document.getElementById('move-student-destination-class')?.value; const moveAttendance = document.getElementById('move-student-attendance-checkbox')?.checked; if (!studentId || !destinationClassId) { customAlert("Erro: Por favor, selecione a turma de destino."); return; } const student = findStudentById(studentId); if (!student) { customAlert("Erro: Aluno não encontrado."); return; } const destinationClass = findClassById(destinationClassId); if (!destinationClass) { customAlert("Erro: Turma de destino não encontrada."); return; } const originalClass = findClassById(student.classId); if (student.classId === destinationClassId) { customAlert("O aluno já está nesta turma."); return; } if (!(await customConfirm(`Mover ${sanitizeHTML(student.name)} da turma "${sanitizeHTML(originalClass?.name)}" para "${sanitizeHTML(destinationClass.name)}"?\n\nATENÇÃO: O histórico de notas será RESETADO.\nFrequência será ${moveAttendance ? 'mantida' : 'removida'}.`))) { return; } console.log(`Moving student ${studentId} to class ${destinationClassId}. Move Attendance: ${moveAttendance}`); if (originalClass?.classroomLayout?.seats) { originalClass.classroomLayout.seats.forEach(seat => { if (seat.studentId === studentId) { seat.studentId = null; } }); } student.classId = destinationClassId; student.grades = {}; console.log(` -> Grades cleared for student ${studentId}`); if (!moveAttendance) { student.attendance = {}; console.log(` -> Attendance cleared for student ${studentId}`); } saveData(); hideModal(); if (currentClassId === originalClass?.id && currentSection === 'class-details-section') { renderStudentList(originalClass.id); if (gradeSetSelect.value) renderGradesTable(originalClass.id, gradeSetSelect.value); if (attendanceDateInput.value) renderAttendanceTable(originalClass.id, attendanceDateInput.value); renderClassroomMap(originalClass.id); } else if (currentClassId === destinationClassId && currentSection === 'class-details-section') { renderClassroomMap(destinationClassId); } customAlert(`Aluno ${sanitizeHTML(student.name)} movido para a turma ${sanitizeHTML(destinationClass.name)} com sucesso! (Histórico de notas resetado)`); };
    const openGradeStructureModal = () => { if (!currentClassId) return; const currentClass = findClassById(currentClassId); const title = `Estrutura Notas - ${sanitizeHTML(currentClass.name)}`; let structureHtml = ''; const gradeStructure = currentClass.gradeStructure || []; if (gradeStructure.length > 0) { gradeStructure.forEach((gs, index) => { const colorRanges = gs.colorRanges || []; let colorRangesHtml = ''; colorRanges.forEach((range, rIndex) => { colorRangesHtml += ` <div class="color-range-item" data-range-index="${rIndex}"> <label>De:</label> <input type="number" class="gs-color-min" step="0.1" placeholder="0.0" value="${range.min ?? ''}"> <label>Até:</label> <input type="number" class="gs-color-max" step="0.1" placeholder="10.0" value="${range.max ?? ''}"> <label>Cor:</label> <input type="color" class="gs-color-input" value="${range.color || '#ffffff'}"> <button type="button" class="delete-color-range-button danger icon-button" title="Excluir Faixa"> <span class="icon icon-excluir icon-only"></span> </button> </div> `; }); structureHtml += ` <div class="card mb-2" data-gs-index="${index}" data-gs-id="${gs.id}"> <div class="card-header"> <input type="text" class="gs-name" value="${sanitizeHTML(gs.name)}" placeholder="Nome do Conjunto de Notas"> <button type="button" class="delete-gs-button danger icon-button" title="Excluir Conjunto ${sanitizeHTML(gs.name)}"> <span class="icon icon-excluir icon-only"></span> </button> </div> <div class="card-content"> <div class="gs-section gs-instruments-container"> <h4>Instrumentos de Avaliação</h4> ${gs.gradeLabels.map((label, lblIndex) => ` <div class="grade-label-item" data-label-index="${lblIndex}"> <input type="text" class="gs-label" value="${sanitizeHTML(label)}" placeholder="Nome da Avaliação (Ex: Prova 1)"> <label style="font-size: 0.8rem; margin-left: 5px; display: flex; align-items: center; gap: 3px;"><input type="checkbox" class="gs-has-recovery" ${gs.recoveryLabels && gs.recoveryLabels.includes(label) ? 'checked' : ''}> Recuperação</label> <button type="button" class="delete-gs-label-button danger icon-button" title="Excluir Instrumento"> <span class="icon icon-excluir icon-only"></span> </button> </div>`).join('')} <button type="button" class="add-gs-label-button success mt-1"><span class="icon icon-adicionar"></span> Instrumento</button> </div> <div class="gs-section gs-color-ranges-container"> <h4>Faixas de Cores para Notas</h4> <div class="color-ranges-list">${colorRangesHtml}</div> <button type="button" class="add-color-range-button success mt-1"><span class="icon icon-adicionar"></span> Faixa de Cor</button> </div> </div> </div>`; }); } else { structureHtml = '<p>Nenhuma estrutura definida. Clique em "Adicionar Conjunto".</p>'; } const modalContent = ` <form id="grade-structure-form"> <div id="grade-sets-list">${structureHtml}</div> <button type="button" id="add-grade-set-button" class="success mt-2"><span class="icon icon-adicionar"></span> Adicionar Conjunto</button> </form>`; const footerButtons = `<button type="button" id="save-grade-structure-button" class="success"><span class="icon icon-salvar"></span> Salvar Estrutura</button>`; showModal(title, modalContent, footerButtons, 'grade-structure-modal'); setupGradeStructureModalListeners(); };
    const setupGradeStructureModalListeners = () => { const gradeSetsListContainer = document.getElementById('grade-sets-list'); if (!gradeSetsListContainer) return; const addSetButton = document.getElementById('add-grade-set-button'); const saveStructureButton = document.getElementById('save-grade-structure-button'); gradeSetsListContainer.removeEventListener('click', handleGradeStructureClicks); gradeSetsListContainer.addEventListener('click', handleGradeStructureClicks); if (addSetButton) { addSetButton.replaceWith(addSetButton.cloneNode(true)); document.getElementById('add-grade-set-button').addEventListener('click', addGradeSet); } if (saveStructureButton) { saveStructureButton.replaceWith(saveStructureButton.cloneNode(true)); document.getElementById('save-grade-structure-button').addEventListener('click', saveGradeStructure); } };
    const handleGradeStructureClicks = async (e) => { if (e.target.classList.contains('add-gs-label-button') || e.target.closest('.add-gs-label-button')) { const button = e.target.closest('.add-gs-label-button'); const instrumentsContainer = button.closest('.gs-instruments-container'); const template = document.getElementById('grade-label-item-template'); const clone = template.content.cloneNode(true); instrumentsContainer.insertBefore(clone, button); } else if (e.target.classList.contains('delete-gs-label-button') || e.target.closest('.delete-gs-label-button')) { const itemToDelete = e.target.closest('.grade-label-item'); itemToDelete?.remove(); } else if (e.target.classList.contains('add-color-range-button') || e.target.closest('.add-color-range-button')) { const button = e.target.closest('.add-color-range-button'); const rangesList = button.previousElementSibling; const template = document.getElementById('color-range-item-template'); const clone = template.content.cloneNode(true); rangesList.appendChild(clone); } else if (e.target.classList.contains('delete-color-range-button') || e.target.closest('.delete-color-range-button')) { const itemToDelete = e.target.closest('.color-range-item'); itemToDelete?.remove(); } else if (e.target.classList.contains('delete-gs-button') || e.target.closest('.delete-gs-button')) { const cardToDelete = e.target.closest('.card[data-gs-index]'); const setName = cardToDelete?.querySelector('.gs-name')?.value || 'este conjunto'; if (await customConfirm(`Tem certeza que deseja excluir "${setName}" e todas as notas associadas?`)) { const list = cardToDelete?.parentElement; cardToDelete?.remove(); list?.querySelectorAll('.card[data-gs-index]').forEach((card, i) => card.dataset.gsIndex = i); if (list && list.children.length === 0) { list.innerHTML = '<p>Nenhuma estrutura definida.</p>'; } } } };
    const addGradeSet = () => { const list = document.getElementById('grade-sets-list'); const newSetIndex = list.querySelectorAll('.card[data-gs-index]').length; const defaultRangesHtml = ` <div class="color-range-item" data-range-index="0"> <label>De:</label> <input type="number" class="gs-color-min" step="0.1" placeholder="0.0" value="0"> <label>Até:</label> <input type="number" class="gs-color-max" step="0.1" placeholder="4.9" value="4.9"> <label>Cor:</label> <input type="color" class="gs-color-input" value="#dc3545"> <button type="button" class="delete-color-range-button danger icon-button" title="Excluir Faixa"><span class="icon icon-excluir icon-only"></span></button> </div> <div class="color-range-item" data-range-index="1"> <label>De:</label> <input type="number" class="gs-color-min" step="0.1" placeholder="5.0" value="5.0"> <label>Até:</label> <input type="number" class="gs-color-max" step="0.1" placeholder="6.9" value="6.9"> <label>Cor:</label> <input type="color" class="gs-color-input" value="#ffc107"> <button type="button" class="delete-color-range-button danger icon-button" title="Excluir Faixa"><span class="icon icon-excluir icon-only"></span></button> </div> <div class="color-range-item" data-range-index="2"> <label>De:</label> <input type="number" class="gs-color-min" step="0.1" placeholder="7.0" value="7.0"> <label>Até:</label> <input type="number" class="gs-color-max" step="0.1" placeholder="10.0" value="10.0"> <label>Cor:</label> <input type="color" class="gs-color-input" value="#d4edda"> <button type="button" class="delete-color-range-button danger icon-button" title="Excluir Faixa"><span class="icon icon-excluir icon-only"></span></button> </div> `; const newSetHtml = ` <div class="card mb-2" data-gs-index="${newSetIndex}" data-gs-id=""> <div class="card-header"> <input type="text" class="gs-name" value="Novo Conjunto ${newSetIndex + 1}" placeholder="Nome do Conjunto de Notas"> <button type="button" class="delete-gs-button danger icon-button" title="Excluir Conjunto"> <span class="icon icon-excluir icon-only"></span> </button> </div> <div class="card-content"> <div class="gs-section gs-instruments-container"> <h4>Instrumentos de Avaliação</h4> <div class="grade-label-item" data-label-index="0"> <input type="text" class="gs-label" value="Nota 1" placeholder="Nome da Avaliação"> <label style="font-size: 0.8rem; margin-left: 5px; display: flex; align-items: center; gap: 3px;"><input type="checkbox" class="gs-has-recovery"> Recuperação</label> <button type="button" class="delete-gs-label-button danger icon-button" title="Excluir Instrumento"> <span class="icon icon-excluir icon-only"></span> </button> </div> <button type="button" class="add-gs-label-button success mt-1"><span class="icon icon-adicionar"></span> Instrumento</button> </div> <div class="gs-section gs-color-ranges-container"> <h4>Faixas de Cores para Notas</h4> <div class="color-ranges-list">${defaultRangesHtml}</div> <button type="button" class="add-color-range-button success mt-1"><span class="icon icon-adicionar"></span> Faixa de Cor</button> </div> </div> </div>`; const noStructureP = list.querySelector('p'); if (noStructureP) noStructureP.remove(); list.insertAdjacentHTML('beforeend', newSetHtml); };
    const saveGradeStructure = () => { if (!currentClassId) return; const currentClass = findClassById(currentClassId); if (!currentClass) return; const newStructure = []; const gradeSetCards = document.querySelectorAll('#grade-sets-list .card[data-gs-index]'); let valid = true; const existingSetIds = new Set(currentClass.gradeStructure.map(gs => gs.id)); const currentSetIds = new Set(); gradeSetCards.forEach(card => { if (!valid) return; const nameInput = card.querySelector('.gs-name'); const name = nameInput.value.trim(); const setId = card.dataset.gsId || `gs_${currentClassId}_${Date.now()}_${Math.random().toString(16).slice(5)}`; currentSetIds.add(setId); const labels = []; const labelInputs = card.querySelectorAll('.gs-label'); if (!name) { customAlert('Nome do conjunto é obrigatório.'); nameInput.focus(); valid = false; return; } if (labelInputs.length === 0) { customAlert(`Conjunto "${name}" precisa ter pelo menos um Instrumento de Avaliação.`); valid = false; return; } const recoveryLabels = []; labelInputs.forEach(lblInput => { const label = lblInput.value.trim(); const hasRecovery = lblInput.closest('.grade-label-item').querySelector('.gs-has-recovery')?.checked; if (!label) { customAlert(`Nome do Instrumento em "${name}" é obrigatório.`); lblInput.focus(); valid = false; } if (valid) { labels.push(label); if (hasRecovery) recoveryLabels.push(label); } }); if (!valid) return; const colorRanges = []; const rangeItems = card.querySelectorAll('.color-range-item'); rangeItems.forEach(item => { if (!valid) return; const minInput = item.querySelector('.gs-color-min'); const maxInput = item.querySelector('.gs-color-max'); const colorInput = item.querySelector('.gs-color-input'); const min = parseFloat(minInput.value); const max = parseFloat(maxInput.value); const color = colorInput.value; if (isNaN(min) || isNaN(max)) { customAlert(`Valores Mínimo e Máximo da faixa de cor em "${name}" devem ser números.`); (isNaN(min) ? minInput : maxInput).focus(); valid = false; return; } if (min > max) { customAlert(`Valor Mínimo (${min}) não pode ser maior que o Máximo (${max}) na faixa de cor em "${name}".`); minInput.focus(); valid = false; return; } colorRanges.push({ min: min, max: max, color: color }); }); if (!valid) return; newStructure.push({ id: setId, name: name, gradeLabels: labels, colorRanges: colorRanges, recoveryLabels: recoveryLabels }); }); if (valid) { const deletedSetIds = [...existingSetIds].filter(id => !currentSetIds.has(id)); if (deletedSetIds.length > 0) { console.log("Removing grades for deleted sets:", deletedSetIds); appData.students.forEach(student => { if (student.classId === currentClassId) { deletedSetIds.forEach(deletedId => { if (student.grades[deletedId]) { delete student.grades[deletedId]; } }); } }); } currentClass.gradeStructure = newStructure; saveData(); hideModal(); renderGradeSets(currentClassId); } };
    const saveGrades = () => { const gradeSetId = gradeSetSelect.value; if (!currentClassId || !gradeSetId) { console.warn("Cannot save grades: No class or grade set selected."); return; } const currentClass = findClassById(currentClassId); const gradeSet = currentClass?.gradeStructure?.find(gs => gs.id === gradeSetId); if(!gradeSet) { console.warn("Cannot save grades: Grade set not found."); return; } console.log("Saving grades for set:", gradeSetId); const rows = gradesTableContainer.querySelectorAll('tbody tr'); if(rows.length === 0) { console.warn("No student rows found to save grades."); return; } rows.forEach(row => { const studentId = row.dataset.studentId; const student = findStudentById(studentId); if (student) { if (!student.grades[gradeSetId]) student.grades[gradeSetId] = {}; const currentGrades = {}; gradeSet.gradeLabels.forEach(label => { const input = row.querySelector(`input[data-label="${label}"]`); const value = input?.value.trim(); currentGrades[label] = (value !== '' && !isNaN(parseFloat(value))) ? parseFloat(value) : null; if (gradeSet.recoveryLabels && gradeSet.recoveryLabels.includes(label)) { const recInput = row.querySelector(`input[data-label="${label}_recovery"]`); const recValue = recInput?.value.trim(); currentGrades[label + '_recovery'] = (recValue !== '' && !isNaN(parseFloat(recValue))) ? parseFloat(recValue) : null; } }); const calculated = calculateSumAndAverageForData(currentGrades, gradeSet); student.grades[gradeSetId] = { ...currentGrades, sum: calculated.sum, average: calculated.average }; } else { console.warn(`Student with ID ${studentId} not found during grade save.`); } }); saveData(); customAlert(`Notas de "${sanitizeHTML(gradeSet.name)}" salvas!`); renderGradesTable(currentClassId, gradeSetId); };
    const escapeCsvField = (field) => { if (field === null || field === undefined) { return '""'; } let fieldStr = String(field); fieldStr = fieldStr.replace(/"/g, '""'); if (fieldStr.includes(',') || fieldStr.includes('"') || fieldStr.includes('\n') || fieldStr.includes('\r')) { return `"${fieldStr}"`; } return fieldStr; };
    const exportGradesCSV = () => { const gradeSetId = gradeSetSelect.value; if (!currentClassId || !gradeSetId) { customAlert("Selecione uma turma e um conjunto de notas para exportar."); return; } const currentClass = findClassById(currentClassId); const gradeSet = currentClass?.gradeStructure?.find(gs => gs.id === gradeSetId); const students = getStudentsByClass(currentClassId); if (!gradeSet || students.length === 0) { customAlert("Nenhum dado de nota para exportar."); return; } const className = currentClass?.name.replace(/[^a-z0-9]/gi, '_') || 'Turma'; const setName = gradeSet.name.replace(/[^a-z0-9]/gi, '_') || 'Conjunto'; let csvContent = "\uFEFF"; let header = [escapeCsvField("Aluno"), escapeCsvField("No.")]; gradeSet.gradeLabels.forEach(label => { header.push(escapeCsvField(label)); if (gradeSet.recoveryLabels && gradeSet.recoveryLabels.includes(label)) { header.push(escapeCsvField('Rec. ' + label)); } }); header.push(escapeCsvField("Soma")); header.push(escapeCsvField("Média")); csvContent += header.join(",") + "\r\n"; students.forEach(student => { const studentGrades = student.grades[gradeSetId] || {}; const calculated = calculateSumAndAverageForData(studentGrades, gradeSet); let row = [escapeCsvField(student.name), escapeCsvField(student.number || '')]; gradeSet.gradeLabels.forEach(label => { const gradeValue = studentGrades[label]; row.push(escapeCsvField(gradeValue)); if (gradeSet.recoveryLabels && gradeSet.recoveryLabels.includes(label)) { const recValue = studentGrades[label + '_recovery']; row.push(escapeCsvField(recValue)); } }); row.push(escapeCsvField(calculated.sum !== null ? calculated.sum.toFixed(1) : '')); row.push(escapeCsvField(calculated.average !== null ? calculated.average.toFixed(1) : '')); csvContent += row.join(",") + "\r\n"; }); const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvContent}`); const link = document.createElement("a"); link.setAttribute("href", encodedUri); link.setAttribute("download", `notas_${className}_${setName}.csv`); document.body.appendChild(link); link.click(); document.body.removeChild(link); };
    const exportGradesPDF = async () => { const gradeSetId = gradeSetSelect.value; const button = exportGradesPdfButton; if (!currentClassId || !gradeSetId) { customAlert("Selecione uma turma e um conjunto de notas para exportar para PDF."); return; } const currentClass = findClassById(currentClassId); const gradeSet = currentClass?.gradeStructure?.find(gs => gs.id === gradeSetId); const students = getStudentsByClass(currentClassId); if (!gradeSet || students.length === 0) { customAlert("Nenhum dado de nota para exportar para PDF."); return; } const classNameSanitized = currentClass?.name.replace(/[^a-z0-9]/gi, '_') || 'Turma'; const setNameSanitized = gradeSet.name.replace(/[^a-z0-9]/gi, '_') || 'Conjunto'; const filename = `notas_${classNameSanitized}_${setNameSanitized}.pdf`; let tableHTML = ` <style> body { font-family: sans-serif; font-size: 9pt; } .pdf-table { border-collapse: collapse; width: 100%; margin-top: 10px; table-layout: fixed; } .pdf-table th, .pdf-table td { border: 1px solid #ccc; padding: 3px 4px; text-align: left; word-wrap: break-word; overflow-wrap: break-word; } .pdf-table th { background-color: #f2f2f2; font-weight: bold; text-align: center; font-size: 8pt; } .pdf-table td { font-size: 8pt; } .pdf-table tr { page-break-inside: avoid; } .pdf-table td.grade, .pdf-table td.sum, .pdf-table td.avg { text-align: center; } .pdf-table td.student-name { min-width: 100px; white-space: normal; } .pdf-table th.student-col { min-width: 105px; } .pdf-table th.grade-col { min-width: 40px; } .pdf-table th.sum-col, .pdf-table th.avg-col { min-width: 45px; } .pdf-table .number { font-weight: bold; display: inline-block; min-width: 15px; text-align: right; margin-right: 4px;} h4 { text-align: center; margin-bottom: 10px; font-size: 11pt; } </style> <h4>Notas - Turma: ${sanitizeHTML(currentClass.name)} - Conjunto: ${sanitizeHTML(gradeSet.name)}</h4> <table class="pdf-table"> <thead> <tr> <th class="student-col">Aluno</th> `; gradeSet.gradeLabels.forEach(label => { tableHTML += `<th class="grade-col">${sanitizeHTML(label)}</th>`; if (gradeSet.recoveryLabels && gradeSet.recoveryLabels.includes(label)) { tableHTML += `<th class="grade-col recovery-col">Rec. ${sanitizeHTML(label)}</th>`; } }); tableHTML += `<th class="sum-col">Soma</th><th class="avg-col">Média</th></tr></thead><tbody>`; students.forEach(student => { const studentGrades = student.grades[gradeSetId] || {}; const calculated = calculateSumAndAverageForData(studentGrades, gradeSet); tableHTML += `<tr><td class="student-name"><span class="number">${student.number || '-.'}</span>${sanitizeHTML(student.name)}</td>`; gradeSet.gradeLabels.forEach(label => { const gradeValue = studentGrades[label]; tableHTML += `<td class="grade">${(gradeValue !== null && gradeValue !== undefined) ? sanitizeHTML(gradeValue) : '-'}</td>`; if (gradeSet.recoveryLabels && gradeSet.recoveryLabels.includes(label)) { const recValue = studentGrades[label + '_recovery']; tableHTML += `<td class="grade recovery-col">${(recValue !== null && recValue !== undefined) ? sanitizeHTML(recValue) : '-'}</td>`; } }); tableHTML += `<td class="sum">${(calculated.sum !== null) ? calculated.sum.toFixed(1) : '-'}</td>`; tableHTML += `<td class="avg">${(calculated.average !== null) ? calculated.average.toFixed(1) : '-'}</td>`; tableHTML += `</tr>`; }); tableHTML += `</tbody></table>`; const opt = { margin: [8, 5, 8, 5], filename: filename, image: { type: 'jpeg', quality: 0.95 }, html2canvas: { scale: 2, useCORS: true, logging: false, }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }, pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } }; const originalButtonText = button.innerHTML; button.disabled = true; button.innerHTML = '<span class="icon icon-hourglass-empty"></span>'; try { console.log("Generating PDF with options:", opt); await html2pdf().set(opt).from(tableHTML).save(); console.log("PDF de notas gerado com sucesso."); } catch (error) { console.error("Erro ao gerar PDF de notas:", error); customAlert("Ocorreu um erro ao gerar o PDF de notas. Verifique o console para detalhes."); } finally { button.disabled = false; button.innerHTML = originalButtonText; } };
    const saveAttendance = () => { const date = attendanceDateInput.value; if (!currentClassId || !date) { console.warn("Cannot save attendance: No class or date selected."); customAlert("Selecione uma turma e uma data."); return; } console.log("Saving all attendance data for", date); saveData(); customAlert(`Presença de ${formatDate(date)} salva!`); };
    const openAttendanceReportModal = () => { if (!currentClassId) { customAlert("Selecione uma turma primeiro."); return; } const currentClass = findClassById(currentClassId); const title = `Relatório de Frequência - ${sanitizeHTML(currentClass.name)}`; const today = new Date(); const currentYear = today.getFullYear(); const currentMonth = today.getMonth(); const modalContent = ` <div id="monthly-attendance-controls"> <div class="form-group mb-2"> <label for="report-period-preset">Período Rápido:</label> <select id="report-period-preset"> <option value="custom">Personalizado</option> <option value="current_month" selected>Mês Atual</option> <option value="bimester_1">1º Bimestre</option> <option value="bimester_2">2º Bimestre</option> <option value="bimester_3">3º Bimestre</option> <option value="bimester_4">4º Bimestre</option> <option value="semester_1">1º Semestre</option> <option value="semester_2">2º Semestre</option> <option value="full_year">Ano Todo (${currentYear})</option> </select> </div> <div class="date-selectors" style="display: flex; gap: 10px; flex-wrap: wrap;"> <div style="flex: 1; min-width: 120px;"> <label for="report-start-date">Data Inicial:</label> <input type="date" id="report-start-date"> </div> <div style="flex: 1; min-width: 120px;"> <label for="report-end-date">Data Final:</label> <input type="date" id="report-end-date"> </div> </div> <div class="export-buttons mt-2"> <button type="button" id="export-attendance-csv-button" class="secondary icon-button hidden" title="Exportar CSV"><span class="icon icon-upload"></span></button> <button type="button" id="export-attendance-pdf-button" class="secondary icon-button hidden" title="Exportar PDF"><span class="icon icon-pdf"></span></button> </div> </div> <div id="monthly-attendance-table-wrapper" style="overflow-x: auto; margin-top: 1rem;"> <p>Selecione o período para carregar os dados.</p> </div> <div id="monthly-attendance-chart-container" class="hidden" style="margin-top: 1rem;"></div> <div id="monthly-attendance-summary" style="margin-top: 1rem; font-weight: bold;"></div> `; showModal(title, modalContent, '', 'monthly-attendance-modal'); const presetSelect = document.getElementById('report-period-preset'); const startDateInput = document.getElementById('report-start-date'); const endDateInput = document.getElementById('report-end-date'); const exportCsvButton = document.getElementById('export-attendance-csv-button'); const exportPdfButton = document.getElementById('export-attendance-pdf-button'); const updateDatesFromPreset = () => { const preset = presetSelect.value; const year = currentYear; let start = ''; let end = ''; if (preset === 'current_month') { const month = today.getMonth(); start = `${year}-${String(month + 1).padStart(2, '0')}-01`; end = `${year}-${String(month + 1).padStart(2, '0')}-${String(getDaysInMonth(year, month)).padStart(2, '0')}`; } else if (preset === 'bimester_1') { start = `${year}-02-01`; end = `${year}-04-30`; } else if (preset === 'bimester_2') { start = `${year}-05-01`; end = `${year}-07-15`; } else if (preset === 'bimester_3') { start = `${year}-08-01`; end = `${year}-09-30`; } else if (preset === 'bimester_4') { start = `${year}-10-01`; end = `${year}-12-20`; } else if (preset === 'semester_1') { start = `${year}-02-01`; end = `${year}-07-15`; } else if (preset === 'semester_2') { start = `${year}-08-01`; end = `${year}-12-20`; } else if (preset === 'full_year') { start = `${year}-01-01`; end = `${year}-12-31`; } if (start && end) { startDateInput.value = start; endDateInput.value = end; updateReportView(); } }; const updateReportView = () => { const start = startDateInput.value; const end = endDateInput.value; if (start && end && start <= end) { renderAttendanceReportData(currentClassId, start, end); } }; presetSelect.addEventListener('change', () => { if (presetSelect.value !== 'custom') { updateDatesFromPreset(); } }); startDateInput.addEventListener('change', () => { presetSelect.value = 'custom'; updateReportView(); }); endDateInput.addEventListener('change', () => { presetSelect.value = 'custom'; updateReportView(); }); exportCsvButton.addEventListener('click', () => { exportAttendanceReportCSV(currentClassId, startDateInput.value, endDateInput.value); }); exportPdfButton.addEventListener('click', () => { exportAttendanceReportPDF(currentClassId, startDateInput.value, endDateInput.value, exportPdfButton); }); updateDatesFromPreset(); };
    const renderAttendanceReportData = (classId, startDateStr, endDateStr) => { const students = getStudentsByClass(classId); const currentModal = document.querySelector('#generic-modal.show.monthly-attendance-modal'); if (!currentModal) return; const tableWrapper = currentModal.querySelector('#monthly-attendance-table-wrapper'); const summaryContainer = currentModal.querySelector('#monthly-attendance-summary'); const chartContainer = currentModal.querySelector('#monthly-attendance-chart-container'); const exportCsvBtn = currentModal.querySelector('#export-attendance-csv-button'); const exportPdfBtn = currentModal.querySelector('#export-attendance-pdf-button'); if (!tableWrapper || !summaryContainer || !chartContainer) return; tableWrapper.innerHTML = ''; summaryContainer.innerHTML = ''; chartContainer.innerHTML = ''; if (students.length === 0) { tableWrapper.innerHTML = '<p style="text-align:center; padding: 1rem;">Nenhum aluno nesta turma.</p>'; if (exportCsvBtn) exportCsvBtn.classList.add('hidden'); if (exportPdfBtn) exportPdfBtn.classList.add('hidden'); chartContainer.classList.add('hidden'); return; } if (exportCsvBtn) exportCsvBtn.classList.remove('hidden'); if (exportPdfBtn) exportPdfBtn.classList.remove('hidden'); chartContainer.classList.remove('hidden'); const startDate = new Date(startDateStr + 'T00:00:00'); const endDate = new Date(endDateStr + 'T00:00:00'); const diffTime = Math.abs(endDate - startDate); const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; const showDailyColumns = diffDays <= 31; const table = document.createElement('table'); table.classList.add('monthly-attendance-table'); const thead = table.createTHead(); const tbody = table.createTBody(); const headerRow = thead.insertRow(); headerRow.innerHTML = `<th class="student-col-monthly">Aluno</th>`; const dates = []; for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) { dates.push(new Date(d)); } if (showDailyColumns) { dates.forEach(d => { headerRow.innerHTML += `<th>${d.getDate()}</th>`; }); } headerRow.innerHTML += `<th class="summary-col">P</th><th class="summary-col">F</th><th class="summary-col">FJ</th><th class="summary-col">H</th><th class="freq-col-monthly">% Freq.</th>`; let totalClassP = 0; let totalClassPossibleAttendances = 0; const studentFrequencies = []; students.forEach(student => { const row = tbody.insertRow(); row.innerHTML = `<td class="student-col-monthly"><span class="student-number">${student.number || '-'}.</span> ${sanitizeHTML(student.name)}</td>`; let studentP = 0, studentF = 0, studentFJ = 0, studentH = 0, studentPossibleDays = 0; dates.forEach(d => { const year = d.getFullYear(); const month = d.getMonth() + 1; const day = d.getDate(); const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`; const attendanceRecord = student.attendance[dateStr]; const status = attendanceRecord?.status; const justification = attendanceRecord?.justification || ''; const dayOfWeek = d.getDay(); const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; let cellContent = '-'; let cellClass = ''; if (isWeekend) { cellClass = 'weekend'; cellContent = ''; } else if (status === 'H') { cellClass = 'status-H'; cellContent = 'H'; studentH++; } else { studentPossibleDays++; if (status === 'P') { cellContent = 'P'; cellClass = 'status-P'; studentP++; } else if (status === 'F') { cellClass = justification ? 'status-FJ' : 'status-F'; cellContent = justification ? 'FJ' : 'F'; if (justification) studentFJ++; else studentF++; } else { cellContent = '-'; } } if (showDailyColumns) { row.innerHTML += `<td class="${cellClass}">${cellContent}</td>`; } }); totalClassP += studentP; totalClassPossibleAttendances += studentPossibleDays; const frequencyPercent = studentPossibleDays > 0 ? Math.round((studentP / studentPossibleDays) * 100) : 0; const frequencyText = studentPossibleDays > 0 ? frequencyPercent + '%' : '--'; row.innerHTML += `<td class="summary-col">${studentP}</td><td class="summary-col">${studentF}</td><td class="summary-col">${studentFJ}</td><td class="summary-col">${studentH}</td><td class="freq-col-monthly">${frequencyText}</td>`; studentFrequencies.push({ name: student.name, number: student.number, freq: frequencyPercent }); }); tableWrapper.appendChild(table); const classFrequency = totalClassPossibleAttendances > 0 ? ((totalClassP / totalClassPossibleAttendances) * 100).toFixed(0) + '%' : '--'; summaryContainer.textContent = `Frequência Média da Turma (dias letivos): ${classFrequency}`; renderMonthlyAttendanceChart(studentFrequencies); };
    const renderMonthlyAttendanceChart = (frequencies) => { const currentModal = document.querySelector('#generic-modal.show.monthly-attendance-modal'); const chartContainer = currentModal?.querySelector('#monthly-attendance-chart-container'); if (!chartContainer) return; chartContainer.innerHTML = ''; if (frequencies.length === 0) { return; } const maxFreq = 100; const chartHeight = 100; frequencies.forEach(item => { const barContainer = document.createElement('div'); barContainer.classList.add('chart-bar-container'); const bar = document.createElement('div'); bar.classList.add('chart-bar'); const barHeightValue = (item.freq / maxFreq) * chartHeight; bar.style.height = `${barHeightValue}px`; bar.style.backgroundColor = item.freq >= 70 ? 'var(--accent-success)' : item.freq >= 50 ? 'var(--accent-warning)' : 'var(--accent-danger)'; bar.dataset.percentage = `${item.freq}%`; const label = document.createElement('div'); label.classList.add('chart-label'); label.textContent = item.number ? `${item.number}.` : ''; label.title = sanitizeHTML(item.name); barContainer.appendChild(bar); barContainer.appendChild(label); chartContainer.appendChild(barContainer); }); };
    const exportAttendanceReportCSV = (classId, startDateStr, endDateStr) => { const students = getStudentsByClass(classId); if (students.length === 0) { customAlert("Nenhum aluno na turma para exportar."); return; } const currentClass = findClassById(classId); const className = currentClass?.name.replace(/[^a-z0-9]/gi, '_') || 'Turma'; const startDate = new Date(startDateStr + 'T00:00:00'); const endDate = new Date(endDateStr + 'T00:00:00'); const diffTime = Math.abs(endDate - startDate); const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; const showDailyColumns = diffDays <= 31; let csvContent = "\uFEFF"; let header = [escapeCsvField("Aluno"), escapeCsvField("No.")]; const dates = []; for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) { dates.push(new Date(d)); } if (showDailyColumns) { dates.forEach(d => { header.push(escapeCsvField(String(d.getDate()))); }); } header.push(escapeCsvField("Presente")); header.push(escapeCsvField("Falta")); header.push(escapeCsvField("Falta Just.")); header.push(escapeCsvField("Dias Não Letivos")); header.push(escapeCsvField("% Freq.")); csvContent += header.join(",") + "\r\n"; students.forEach(student => { let row = [escapeCsvField(student.name), escapeCsvField(student.number || '')]; let studentP = 0, studentF = 0, studentFJ = 0, studentH = 0, studentPossibleDays = 0; dates.forEach(d => { const year = d.getFullYear(); const month = d.getMonth() + 1; const day = d.getDate(); const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`; const attendanceRecord = student.attendance[dateStr]; const status = attendanceRecord?.status; const justification = attendanceRecord?.justification || ''; const dayOfWeek = d.getDay(); const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; let cellValue = ''; if (isWeekend) { cellValue = ''; } else if (status === 'H') { cellValue = 'H'; studentH++; } else { studentPossibleDays++; if (status === 'P') { cellValue = 'P'; studentP++; } else if (status === 'F') { if (justification) { cellValue = 'FJ'; studentFJ++; } else { cellValue = 'F'; studentF++; } } else { cellValue = '-'; } } if (showDailyColumns) { row.push(escapeCsvField(cellValue)); } }); const frequency = studentPossibleDays > 0 ? ((studentP / studentPossibleDays) * 100).toFixed(0) + '%' : ''; row.push(escapeCsvField(studentP)); row.push(escapeCsvField(studentF)); row.push(escapeCsvField(studentFJ)); row.push(escapeCsvField(studentH)); row.push(escapeCsvField(frequency)); csvContent += row.join(",") + "\r\n"; }); const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvContent}`); const link = document.createElement("a"); link.setAttribute("href", encodedUri); link.setAttribute("download", `frequencia_${className}_${startDateStr}_a_${endDateStr}.csv`); document.body.appendChild(link); link.click(); document.body.removeChild(link); };
    const exportAttendanceReportPDF = async (classId, startDateStr, endDateStr, button) => { const students = getStudentsByClass(classId); if (students.length === 0) { customAlert("Nenhum aluno na turma para exportar para PDF."); return; } const currentClass = findClassById(classId); const classNameSanitized = currentClass?.name.replace(/[^a-z0-9]/gi, '_') || 'Turma'; const filename = `frequencia_${classNameSanitized}_${startDateStr}_a_${endDateStr}.pdf`; const startDate = new Date(startDateStr + 'T00:00:00'); const endDate = new Date(endDateStr + 'T00:00:00'); const diffTime = Math.abs(endDate - startDate); const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; const showDailyColumns = diffDays <= 31; const dates = []; for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) { dates.push(new Date(d)); } let tableHTML = ` <style> body { font-family: sans-serif; font-size: 7pt; } .pdf-table { border-collapse: collapse; width: 100%; margin-top: 8px; table-layout: fixed; } .pdf-table th, .pdf-table td { border: 1px solid #ccc; padding: 2px 3px; text-align: center; word-wrap: break-word; overflow-wrap: break-word; } .pdf-table th { background-color: #f2f2f2; font-weight: bold; font-size: 7pt; } .pdf-table td { font-size: 7pt; } .pdf-table tr { page-break-inside: avoid; } .pdf-table td.student-col { text-align: left; min-width: 90px; white-space: normal; } .pdf-table th.student-col { min-width: 90px; } .pdf-table th.day-col, .pdf-table td.day-col { min-width: 15px; max-width:16px; } .pdf-table td.weekend { background-color: #eee; } .pdf-table td.status-H { background-color: #e2e3e5; color: #495057; font-style: italic; } .pdf-table th.summary-col, .pdf-table td.summary-col { font-weight: bold; min-width: 20px; max-width: 25px; font-size: 6pt; } .pdf-table .number { font-weight: bold; display: inline-block; min-width: 12px; text-align: right; margin-right: 3px;} h4 { text-align: center; margin-bottom: 6px; font-size: 10pt; } </style> <h4>Relatório de Frequência - Turma: ${sanitizeHTML(currentClass.name)} - ${startDateStr} a ${endDateStr}</h4> <table class="pdf-table"> <thead> <tr> <th class="student-col">Aluno</th>`; if (showDailyColumns) { dates.forEach(d => { tableHTML += `<th class="day-col">${d.getDate()}</th>`; }); } tableHTML += `<th class="summary-col">P</th><th class="summary-col">F</th><th class="summary-col">FJ</th><th class="summary-col">H</th><th class="summary-col">%</th></tr></thead><tbody>`; students.forEach(student => { tableHTML += `<tr><td class="student-col"><span class="number">${student.number || '-.'}</span>${sanitizeHTML(student.name)}</td>`; let studentP = 0, studentF = 0, studentFJ = 0, studentH = 0, studentPossibleDays = 0; dates.forEach(d => { const year = d.getFullYear(); const month = d.getMonth() + 1; const day = d.getDate(); const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`; const attendanceRecord = student.attendance[dateStr]; const status = attendanceRecord?.status; const justification = attendanceRecord?.justification || ''; const dayOfWeek = d.getDay(); const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; let cellContent = ''; let cellClass = 'day-col'; if (isWeekend) { cellClass += ' weekend'; } else if (status === 'H') { cellContent = 'H'; cellClass += ' status-H'; studentH++; } else { studentPossibleDays++; if (status === 'P') { cellContent = 'P'; studentP++; } else if (status === 'F') { if (justification) { cellContent = 'FJ'; studentFJ++; } else { cellContent = 'F'; studentF++; } } else { cellContent = '-'; } } if (showDailyColumns) { tableHTML += `<td class="${cellClass}">${cellContent}</td>`; } }); const frequency = studentPossibleDays > 0 ? ((studentP / studentPossibleDays) * 100).toFixed(0) : '-'; tableHTML += `<td class="summary-col">${studentP}</td>`; tableHTML += `<td class="summary-col">${studentF}</td>`; tableHTML += `<td class="summary-col">${studentFJ}</td>`; tableHTML += `<td class="summary-col">${studentH}</td>`; tableHTML += `<td class="summary-col">${frequency}${frequency !== '-' ? '%' : ''}</td>`; tableHTML += `</tr>`; }); tableHTML += `</tbody></table>`; const opt = { margin: [5, 5, 5, 5], filename: filename, image: { type: 'jpeg', quality: 0.9 }, html2canvas: { scale: 2, useCORS: true, logging: false, }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }, pagebreak: { mode: ['avoid-all', 'css', 'legacy'] } }; const originalButtonText = button.innerHTML; button.disabled = true; button.innerHTML = '<span class="icon icon-hourglass-empty"></span>'; try { console.log("Generating PDF with options:", opt); await html2pdf().set(opt).from(tableHTML).save(); console.log("PDF de frequência gerado com sucesso."); } catch (error) { console.error("Erro ao gerar PDF de frequência:", error); customAlert("Ocorreu um erro ao gerar o PDF de frequência. Verifique o console para detalhes."); } finally { button.disabled = false; button.innerHTML = originalButtonText; } };

    const openStudentReportModal = (studentId) => {
        const student = findStudentById(studentId);
        if (!student) return;
        const currentClass = findClassById(student.classId);
        if (!currentClass) return;

        const title = `Relatório do Aluno - ${sanitizeHTML(student.name)}`;
        const today = new Date();
        const currentYear = today.getFullYear();

        const modalContent = `
            <div id="student-report-controls">
                <div class="form-group mb-2">
                    <label for="student-report-preset">Período Rápido:</label>
                    <select id="student-report-preset">
                        <option value="custom">Personalizado</option>
                        <option value="current_month" selected>Mês Atual</option>
                        <option value="bimester_1">1º Bimestre</option>
                        <option value="bimester_2">2º Bimestre</option>
                        <option value="bimester_3">3º Bimestre</option>
                        <option value="bimester_4">4º Bimestre</option>
                        <option value="semester_1">1º Semestre</option>
                        <option value="semester_2">2º Semestre</option>
                        <option value="full_year">Ano Todo (${currentYear})</option>
                    </select>
                </div>
                <div class="date-selectors" style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 120px;">
                        <label for="student-report-start">Data Inicial:</label>
                        <input type="date" id="student-report-start">
                    </div>
                    <div style="flex: 1; min-width: 120px;">
                        <label for="student-report-end">Data Final:</label>
                        <input type="date" id="student-report-end">
                    </div>
                </div>
                
                <div class="report-options mt-4">
                    <h4>Opções do Relatório</h4>
                    <label style="display: block; margin-bottom: 5px;">
                        <input type="checkbox" id="include-attendance" checked> Incluir Frequência
                    </label>
                    <label style="display: block; margin-bottom: 5px;">
                        <input type="checkbox" id="include-grades" checked> Incluir Notas
                    </label>
                    <label style="display: block; margin-bottom: 5px;">
                        <input type="checkbox" id="include-observations" checked> Incluir Observações
                    </label>
                    <label style="display: block; margin-bottom: 5px;">
                        <input type="checkbox" id="include-ai-summary" checked> Incluir Resumo com IA
                    </label>
                </div>

                <div class="export-buttons mt-4" style="text-align: right;">
                    <button type="button" id="generate-student-pdf" class="primary button"><span class="icon icon-pdf"></span> Gerar PDF</button>
                </div>
            </div>
        `;

        showModal(title, modalContent, '', 'student-report-modal');

        const presetSelect = document.getElementById('student-report-preset');
        const startDateInput = document.getElementById('student-report-start');
        const endDateInput = document.getElementById('student-report-end');
        const generatePdfButton = document.getElementById('generate-student-pdf');

        const updateDatesFromPreset = () => {
            const preset = presetSelect.value;
            const year = currentYear;
            let start = '';
            let end = '';

            if (preset === 'current_month') {
                const month = today.getMonth();
                start = `${year}-${String(month + 1).padStart(2, '0')}-01`;
                end = `${year}-${String(month + 1).padStart(2, '0')}-${String(getDaysInMonth(year, month)).padStart(2, '0')}`;
            } else if (preset === 'bimester_1') {
                start = `${year}-02-01`; end = `${year}-04-30`;
            } else if (preset === 'bimester_2') {
                start = `${year}-05-01`; end = `${year}-07-15`;
            } else if (preset === 'bimester_3') {
                start = `${year}-08-01`; end = `${year}-09-30`;
            } else if (preset === 'bimester_4') {
                start = `${year}-10-01`; end = `${year}-12-20`;
            } else if (preset === 'semester_1') {
                start = `${year}-02-01`; end = `${year}-07-15`;
            } else if (preset === 'semester_2') {
                start = `${year}-08-01`; end = `${year}-12-20`;
            } else if (preset === 'full_year') {
                start = `${year}-01-01`; end = `${year}-12-31`;
            }

            if (start && end) {
                startDateInput.value = start;
                endDateInput.value = end;
            }
        };

        presetSelect.addEventListener('change', () => {
            if (presetSelect.value !== 'custom') {
                updateDatesFromPreset();
            }
        });

        startDateInput.addEventListener('change', () => presetSelect.value = 'custom');
        endDateInput.addEventListener('change', () => presetSelect.value = 'custom');

        generatePdfButton.addEventListener('click', () => {
            const startDate = startDateInput.value;
            const endDate = endDateInput.value;
            if (!startDate || !endDate || startDate > endDate) {
                customAlert("Por favor, selecione um período válido.");
                return;
            }

            const options = {
                includeAttendance: document.getElementById('include-attendance').checked,
                includeGrades: document.getElementById('include-grades').checked,
                includeObservations: document.getElementById('include-observations').checked,
                includeAiSummary: document.getElementById('include-ai-summary').checked
            };
            generateStudentReportPDF(studentId, startDate, endDate, options, generatePdfButton);
        });

        updateDatesFromPreset();
    };

    const generateStudentReportPDF = async (studentId, startDateStr, endDateStr, options, button) => {
        const student = findStudentById(studentId);
        if (!student) return;
        const currentClass = findClassById(student.classId);
        const school = findSchoolById(currentClass?.schoolId);
        
        const startDate = new Date(startDateStr + 'T00:00:00');
        const endDate = new Date(endDateStr + 'T00:00:00');
        
        const filename = `relatorio_${student.name.replace(/[^a-z0-9]/gi, '_')}_${startDateStr}_a_${endDateStr}.pdf`;

        let tableHTML = `
            <style>
                body { font-family: sans-serif; font-size: 10pt; color: #333; }
                h2 { text-align: center; margin-bottom: 5px; font-size: 14pt; color: #111; }
                h3 { margin-top: 15px; margin-bottom: 5px; font-size: 12pt; border-bottom: 1px solid #ccc; padding-bottom: 3px; color: #222; }
                .info-section { margin-bottom: 15px; }
                .info-section p { margin: 3px 0; }
                .pdf-table { border-collapse: collapse; width: 100%; margin-top: 8px; table-layout: fixed; }
                .pdf-table th, .pdf-table td { border: 1px solid #ccc; padding: 4px; text-align: left; word-wrap: break-word; overflow-wrap: break-word; }
                .pdf-table th { background-color: #f2f2f2; font-weight: bold; font-size: 9pt; }
                .pdf-table td { font-size: 9pt; }
                .text-center { text-align: center; }
                .badge { display: inline-block; padding: 2px 5px; border-radius: 3px; background: #eee; font-size: 8pt; margin-right: 3px; }
            </style>
            <h2>Relatório Individual do Aluno</h2>
            <div class="info-section">
                <p><strong>Aluno:</strong> ${sanitizeHTML(student.name)} (Nº ${student.number || '-'})</p>
                <p><strong>Turma:</strong> ${sanitizeHTML(currentClass?.name || 'N/A')} - ${sanitizeHTML(currentClass?.subject || 'N/A')}</p>
                <p><strong>Escola:</strong> ${sanitizeHTML(school?.name || 'N/A')}</p>
                <p><strong>Período:</strong> ${formatDate(startDateStr)} a ${formatDate(endDateStr)}</p>
            </div>
        `;

        let aiPromptData = `Relatório do Aluno: ${student.name}\nPeríodo: ${formatDate(startDateStr)} a ${formatDate(endDateStr)}\n\n`;

        if (options.includeAttendance) {
            let studentP = 0, studentF = 0, studentFJ = 0, studentH = 0, studentPossibleDays = 0;
            
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
                const year = d.getFullYear();
                const month = d.getMonth() + 1;
                const day = d.getDate();
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const attendanceRecord = student.attendance && student.attendance[dateStr];
                const status = attendanceRecord?.status;
                const justification = attendanceRecord?.justification || '';
                const dayOfWeek = d.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                
                if (!isWeekend) {
                    if (status === 'H') {
                        studentH++;
                    } else {
                        studentPossibleDays++;
                        if (status === 'P') {
                            studentP++;
                        } else if (status === 'F') {
                            if (justification) studentFJ++;
                            else studentF++;
                        }
                    }
                }
            }
            
            const frequency = studentPossibleDays > 0 ? ((studentP / studentPossibleDays) * 100).toFixed(0) + '%' : 'N/A';
            
            tableHTML += `
                <h3>Frequência</h3>
                <table class="pdf-table">
                    <thead>
                        <tr>
                            <th class="text-center">Aulas Dadas</th>
                            <th class="text-center">Presenças (P)</th>
                            <th class="text-center">Faltas (F)</th>
                            <th class="text-center">Faltas Just. (FJ)</th>
                            <th class="text-center">% Frequência</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="text-center">${studentPossibleDays}</td>
                            <td class="text-center">${studentP}</td>
                            <td class="text-center">${studentF}</td>
                            <td class="text-center">${studentFJ}</td>
                            <td class="text-center"><strong>${frequency}</strong></td>
                        </tr>
                    </tbody>
                </table>
            `;

            aiPromptData += `Frequência: ${frequency} (${studentP} presenças, ${studentF} faltas, ${studentFJ} faltas justificadas em ${studentPossibleDays} dias letivos).\n\n`;
        }

        if (options.includeGrades) {
            tableHTML += `<h3>Notas e Médias</h3>`;
            aiPromptData += `Notas:\n`;
            if (currentClass?.gradeStructure && currentClass.gradeStructure.length > 0) {
                currentClass.gradeStructure.forEach(gradeSet => {
                    const studentGrades = student.grades && student.grades[gradeSet.id] ? student.grades[gradeSet.id] : {};
                    const calculated = calculateSumAndAverageForData(studentGrades, gradeSet);
                    
                    tableHTML += `<h4>${sanitizeHTML(gradeSet.name)}</h4>`;
                    tableHTML += `<table class="pdf-table"><thead><tr>`;
                    
                    aiPromptData += `- ${gradeSet.name}: `;

                    gradeSet.gradeLabels.forEach(label => {
                        tableHTML += `<th class="text-center">${sanitizeHTML(label)}</th>`;
                        if (gradeSet.recoveryLabels && gradeSet.recoveryLabels.includes(label)) {
                            tableHTML += `<th class="text-center">Rec. ${sanitizeHTML(label)}</th>`;
                        }
                    });
                    tableHTML += `<th class="text-center">Soma</th><th class="text-center">Média</th></tr></thead><tbody><tr>`;
                    
                    gradeSet.gradeLabels.forEach(label => {
                        const gradeValue = studentGrades[label];
                        tableHTML += `<td class="text-center">${(gradeValue !== null && gradeValue !== undefined) ? sanitizeHTML(gradeValue) : '-'}</td>`;
                        aiPromptData += `${label}: ${gradeValue ?? '-'}, `;
                        if (gradeSet.recoveryLabels && gradeSet.recoveryLabels.includes(label)) {
                            const recValue = studentGrades[label + '_recovery'];
                            tableHTML += `<td class="text-center">${(recValue !== null && recValue !== undefined) ? sanitizeHTML(recValue) : '-'}</td>`;
                            aiPromptData += `Rec. ${label}: ${recValue ?? '-'}, `;
                        }
                    });
                    
                    tableHTML += `<td class="text-center">${(calculated.sum !== null) ? calculated.sum.toFixed(1) : '-'}</td>`;
                    tableHTML += `<td class="text-center"><strong>${(calculated.average !== null) ? calculated.average.toFixed(1) : '-'}</strong></td>`;
                    tableHTML += `</tr></tbody></table>`;

                    aiPromptData += `Soma: ${calculated.sum ?? '-'}, Média: ${calculated.average ?? '-'}\n`;
                });
            } else {
                tableHTML += `<p>Nenhuma estrutura de notas definida para esta turma.</p>`;
                aiPromptData += `Nenhuma nota registrada.\n`;
            }
            aiPromptData += `\n`;
        }

        if (options.includeObservations) {
            tableHTML += `<h3>Observações e Ocorrências</h3>`;
            aiPromptData += `Observações:\n`;
            const notes = student.notes || [];
            const filteredNotes = notes.filter(note => {
                if (!note.date) return false;
                const noteDate = new Date(note.date + 'T00:00:00');
                return noteDate >= startDate && noteDate <= endDate;
            });
            
            if (filteredNotes.length > 0) {
                tableHTML += `<table class="pdf-table">
                    <thead>
                        <tr>
                            <th style="width: 15%;">Data</th>
                            <th style="width: 20%;">Categoria</th>
                            <th style="width: 65%;">Descrição</th>
                        </tr>
                    </thead>
                    <tbody>`;
                filteredNotes.forEach(note => {
                    let extraInfo = '';
                    if (note.category === 'Suspensão' && note.suspensionStartDate && note.suspensionEndDate) {
                        extraInfo = `<br><small>Período: ${formatDate(note.suspensionStartDate)} a ${formatDate(note.suspensionEndDate)}</small>`;
                    }
                    tableHTML += `
                        <tr>
                            <td>${formatDate(note.date)}</td>
                            <td><strong>${sanitizeHTML(note.category)}</strong></td>
                            <td>${sanitizeHTML(note.text).replace(/\n/g, '<br>')}${extraInfo}</td>
                        </tr>
                    `;
                    aiPromptData += `- [${formatDate(note.date)}] ${note.category}: ${note.text}\n`;
                });
                tableHTML += `</tbody></table>`;
            } else {
                tableHTML += `<p>Nenhuma observação registrada neste período.</p>`;
                aiPromptData += `Nenhuma observação.\n`;
            }
            aiPromptData += `\n`;
        }

        const originalButtonText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<span class="icon icon-hourglass-empty"></span> Gerando...';

        try {
            if (options.includeAiSummary) {
                button.innerHTML = '<span class="icon icon-hourglass-empty"></span> Gerando IA...';
                const apiKey = localStorage.getItem('gemini_api_key') || '';
                if (!apiKey) {
                    customAlert("Chave da API do Gemini não configurada. O resumo com IA será ignorado.");
                } else {
                    const prompt = `Você é um assistente educacional. Com base nos seguintes dados do aluno, escreva um resumo analítico e profissional sobre o desempenho, comportamento e frequência do aluno no período especificado. Seja construtivo e objetivo.
                    
                    Dados do Aluno:
                    ${aiPromptData}
                    
                    Resumo:`;
                    
                    try {
                        const ai = new GoogleGenAI({ apiKey: apiKey });
                        const response = await ai.models.generateContent({
                            model: 'gemini-3-flash-preview',
                            contents: prompt
                        });
                        const aiResponse = response.text;
                        if (aiResponse) {
                            tableHTML += `<h3>Resumo Analítico (Gerado por IA)</h3>`;
                            tableHTML += `<div style="background: #f9f9f9; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 9pt; line-height: 1.4;">${sanitizeHTML(aiResponse).replace(/\n/g, '<br>')}</div>`;
                        }
                    } catch (aiError) {
                        console.error("Erro ao gerar resumo com IA:", aiError);
                        customAlert("Ocorreu um erro ao gerar o resumo com IA. O relatório será gerado sem ele.");
                    }
                }
            }

            button.innerHTML = '<span class="icon icon-hourglass-empty"></span> Gerando PDF...';
            
            const opt = {
                margin: [10, 10, 10, 10],
                filename: filename,
                image: { type: 'jpeg', quality: 0.95 },
                html2canvas: { scale: 2, useCORS: true, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };

            await html2pdf().set(opt).from(tableHTML).save();
            customAlert("Relatório gerado com sucesso.");
        } catch (error) {
            console.error("Erro ao gerar relatório:", error);
            customAlert("Ocorreu um erro ao gerar o relatório.");
        } finally {
            button.disabled = false;
            button.innerHTML = originalButtonText;
        }
    };

    const performSearch = (term) => { term = term.toLowerCase().trim(); if (!term) { hideModal(); return; } const results = { schools: [], classes: [], students: [] }; results.schools = appData.schools.filter(s => s.name.toLowerCase().includes(term)); results.classes = appData.classes.filter(c => c.name.toLowerCase().includes(term) || (c.subject && c.subject.toLowerCase().includes(term))); results.students = appData.students.filter(s => s.name.toLowerCase().includes(term) || (s.number && String(s.number) === term)); renderSearchResults(results, term); };
    const renderSearchResults = (results, term) => { let resultsHtml = `<p>Resultados para: <strong>${sanitizeHTML(term)}</strong></p><div class="item-list mt-1">`; let count = 0; const renderItem = (item, type, details = '') => { count++; const itemSchoolId = type === 'school' ? item.id : (item.schoolId || findClassById(item.classId)?.schoolId); const itemClassId = type === 'student' ? item.classId : (type === 'class' ? item.id : ''); return `<div class="list-item search-result-item" data-type="${type}" data-id="${item.id}" ${itemSchoolId ? `data-school-id="${itemSchoolId}"` : ''} ${itemClassId ? `data-class-id="${itemClassId}"` : ''}> <div class="item-info">${sanitizeHTML(item.name)} ${details ? `<small style='display:block; color: var(--text-secondary);'>${sanitizeHTML(details)}</small>` : ''}</div> <span class="result-type">${type.charAt(0).toUpperCase() + type.slice(1)}</span> </div>`; }; if (results.schools.length > 0) { resultsHtml += `<h5>Escolas</h5>`; results.schools.forEach(s => resultsHtml += renderItem(s, 'school')); } if (results.classes.length > 0) { resultsHtml += `<h5 class="mt-2">Turmas</h5>`; results.classes.forEach(c => { const school = findSchoolById(c.schoolId); resultsHtml += renderItem(c, 'class', `(${c.subject || 'N/A'}) - ${school?.name || '?'}`); }); } if (results.students.length > 0) { resultsHtml += `<h5 class="mt-2">Alunos</h5>`; results.students.forEach(s => { const cls = findClassById(s.classId); const school = findSchoolById(cls?.schoolId); resultsHtml += renderItem(s, 'student', `${s.number || '-'}. ${cls?.name || '?'} / ${school?.name || '?'}`); }); } if (count === 0) { resultsHtml += `<p style="text-align:center; padding: 1rem;">Nenhum resultado encontrado.</p>`; } resultsHtml += `</div>`; showModal(`Resultados da Busca`, resultsHtml, '', 'search-results-modal'); modalBody.querySelectorAll('.search-result-item').forEach(item => { item.addEventListener('click', () => { const type = item.dataset.type; const id = item.dataset.id; const classId = item.dataset.classId; const schoolId = item.dataset.schoolId; hideModal(); searchInput.value = ''; if (type === 'school') { selectSchool(id); showSection('classes-section'); } else if (type === 'class') { if(schoolId) selectSchool(schoolId); selectClass(id); showSection('class-details-section'); } else if (type === 'student') { if(schoolId) selectSchool(schoolId); if(classId) selectClass(classId); showSection('class-details-section'); setTimeout(() => { const studentElement = studentListContainer.querySelector(`.list-item[data-id="${id}"]`); studentElement?.scrollIntoView({ behavior: 'smooth', block: 'center' }); studentElement?.classList.add('active'); setTimeout(() => studentElement?.classList.remove('active'), 2000); }, 300); } }); }); };
    // --- Modais de Tela Cheia (Planejamento e Anotações) ---
    const openLessonPlanModal = () => {
        if (!currentClassId) return;
        const date = lessonPlanDateInput.value || getCurrentDateString();
        const currentClass = findClassById(currentClassId);
        
        document.getElementById('lesson-plan-modal-date').value = date;
        document.getElementById('lesson-plan-modal-textarea').value = currentClass?.lessonPlans?.[date] || '';
        
        const modal = document.getElementById('lesson-plan-modal');
        modal.classList.add('show');
    };

    const saveLessonPlanModal = () => {
        if (!currentClassId) return;
        const currentClass = findClassById(currentClassId);
        const date = document.getElementById('lesson-plan-modal-date').value;
        const text = document.getElementById('lesson-plan-modal-textarea').value.trim();
        
        if (!date) {
            customAlert("Selecione uma data.");
            return;
        }

        currentClass.lessonPlans = currentClass.lessonPlans || {};
        if (text) {
            currentClass.lessonPlans[date] = text;
        } else {
            delete currentClass.lessonPlans[date];
        }
        
        saveData();
        lessonPlanDateInput.value = date;
        renderLessonPlan(currentClassId, date);
        
        document.getElementById('lesson-plan-modal').classList.remove('show');
        customAlert(`Plano de aula para ${formatDate(date)} salvo!`);
    };

    const openClassNotesModal = () => {
        if (!currentClassId) return;
        const dateInput = document.getElementById('class-notes-date');
        const date = dateInput ? dateInput.value || getCurrentDateString() : getCurrentDateString();
        const currentClass = findClassById(currentClassId);
        
        document.getElementById('class-notes-modal-date').value = date;
        document.getElementById('class-notes-modal-textarea').value = currentClass?.classNotes?.[date] || '';
        
        const modal = document.getElementById('class-notes-modal');
        modal.classList.add('show');
    };

    const saveClassNotesModal = () => {
        if (!currentClassId) return;
        const currentClass = findClassById(currentClassId);
        const date = document.getElementById('class-notes-modal-date').value;
        const text = document.getElementById('class-notes-modal-textarea').value.trim();
        
        if (!date) {
            customAlert("Selecione uma data.");
            return;
        }

        currentClass.classNotes = currentClass.classNotes || {};
        if (text) {
            currentClass.classNotes[date] = text;
        } else {
            delete currentClass.classNotes[date];
        }
        
        saveData();
        const dateInput = document.getElementById('class-notes-date');
        if(dateInput) dateInput.value = date;
        renderClassNotes(currentClassId, date);
        
        document.getElementById('class-notes-modal').classList.remove('show');
        customAlert(`Anotações para ${formatDate(date)} salvas!`);
    };

    const toggleClassNotesEdit = (showEdit) => { 
        // Obsolete, replaced by openClassNotesModal
    };
    const saveClassNotes = () => { 
        // Obsolete, replaced by saveClassNotesModal
    };
    const exportData = () => { const dataStr = JSON.stringify(appData, null, 2); const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr); const exportFileDefaultName = `super_professor_pro_backup_${new Date().toISOString().slice(0,10)}.json`; const linkElement = document.createElement('a'); linkElement.setAttribute('href', dataUri); linkElement.setAttribute('download', exportFileDefaultName); linkElement.click(); linkElement.remove(); };
    const importData = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (importedData && typeof importedData === 'object') {
                    if (await customConfirm("Importar dados substituirá os atuais. Continuar?")) {
                        appData = {
                            schools: importedData.schools || [],
                            classes: importedData.classes || [],
                            students: importedData.students || [],
                            schedule: importedData.schedule || [],
                            settings: importedData.settings || { theme: 'theme-light', globalNotificationsEnabled: true, notificationSoundEnabled: true, customNotificationSound: null }
                        };
                        // Default settings
                        if (typeof appData.settings !== 'object' || appData.settings === null) appData.settings = {};
                        appData.settings.theme = appData.settings.theme || 'theme-light';
                        appData.settings.globalNotificationsEnabled = appData.settings.globalNotificationsEnabled !== undefined ? appData.settings.globalNotificationsEnabled : true;
                        appData.settings.notificationSoundEnabled = appData.settings.notificationSoundEnabled !== undefined ? appData.settings.notificationSoundEnabled : true;
                appData.settings.interactionSoundsEnabled = appData.settings.interactionSoundsEnabled !== undefined ? appData.settings.interactionSoundsEnabled : true;
                        appData.settings.customNotificationSound = appData.settings.customNotificationSound || null;
                        if (appData.settings.nonSchoolDays) delete appData.settings.nonSchoolDays;
                        if (appData.settings.customNotificationSound && typeof appData.settings.customNotificationSound === 'string' && !appData.settings.customNotificationSound.startsWith('data:audio')) {
                            console.warn("Imported custom sound data is invalid. Removing.");
                            appData.settings.customNotificationSound = null;
                        }
                        // Student data migration/defaulting
                        appData.students.forEach(s => {
                            s.attendance = s.attendance || {};
                            Object.keys(s.attendance).forEach(date => {
                                if(s.attendance[date] && typeof s.attendance[date] === 'object') {
                                    s.attendance[date].status = s.attendance[date].status || null;
                                    s.attendance[date].justification = String(s.attendance[date].justification || '');
                                } else {
                                    s.attendance[date] = { status: null, justification: ''};
                                }
                            });
                            s.notes = s.notes || [];
                            if (typeof s.notes === 'string') {
                                const oldNotes = s.notes.trim();
                                s.notes = oldNotes ? [{ date: getCurrentDateString(), text: oldNotes, category: 'Anotação' }] : [];
                            } else if (!Array.isArray(s.notes)) {
                                s.notes = [];
                            }
                            s.notes = s.notes.map(note => ({
                                date: note?.date && note.date !== 'N/A' ? note.date : getCurrentDateString(),
                                text: note?.text || '',
                                category: note?.category || 'Anotação',
                                suspensionStartDate: note?.suspensionStartDate || null,
                                suspensionEndDate: note?.suspensionEndDate || null
                            })).filter(note => note.text.trim());
                            // **** NOVO: Inicializa campo de programas governamentais ao importar ****
                            s.governmentPrograms = Array.isArray(s.governmentPrograms) ? s.governmentPrograms : [];
                        });
                        // Class data migration/defaulting
                        appData.classes.forEach(c => {
                            c.lessonPlans = c.lessonPlans || {};
                            c.gradeStructure = c.gradeStructure || [];
                            c.gradeStructure.forEach(gs => {
                                delete gs.periodType;
                                if(gs.colorRanges === undefined) gs.colorRanges = [];
                            });
                            const validPositions = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right', 'left-top', 'left-center', 'left-bottom', 'right-top', 'right-center', 'right-bottom'];
                            if (!c.classroomLayout) {
                                c.classroomLayout = { rows: 5, cols: 6, teacherDeskPosition: 'top-center', seats: [] };
                            } else {
                                c.classroomLayout.seats = c.classroomLayout.seats || [];
                                if (!validPositions.includes(c.classroomLayout.teacherDeskPosition)) {
                                    c.classroomLayout.teacherDeskPosition = 'top-center';
                                }
                            }
                            if(c.representativeId === undefined) c.representativeId = null;
                            if(c.viceRepresentativeId === undefined) c.viceRepresentativeId = null;
                        });
                        appData.schedule.forEach(item => {
                            if (item.notificationsEnabled === undefined) {
                                item.notificationsEnabled = true;
                            }
                        });

                        currentSchoolId = null; currentClassId = null;
                        saveData();
                        applyTheme(appData.settings.theme);
                        updateNotificationSettingsUI();
                        updateCustomSoundUI();
                        restoreAppState();
                        renderSchoolList();
                        renderScheduleList();
                        if (currentSection === 'class-details-section' && currentClassId) {
                            selectClass(currentClassId, true);
                        } else if (currentSection === 'classes-section' && currentSchoolId) {
                            renderClassList(currentSchoolId);
                        }
                        showSection(currentSection || 'schedule-section');
                        customAlert("Dados importados!");
                    }
                } else {
                    customAlert("Erro: Arquivo JSON inválido.");
                }
            } catch (error) {
                console.error("Erro importar:", error);
                customAlert("Erro ao ler arquivo JSON.");
            } finally {
                event.target.value = null;
            }
        };
        reader.readAsText(file);
    };
    const clearAllData = async () => { if (await customConfirm("ATENÇÃO! Apagar TODOS os dados? Isso inclui escolas, turmas, alunos, notas, frequências, horários e configurações.")) { if (await customConfirm("SEGUNDA CONFIRMAÇÃO: Tem certeza ABSOLUTA que deseja apagar TUDO? Esta ação não pode ser desfeita.")) { appData = { schools: [], classes: [], students: [], schedule: [], settings: { theme: 'theme-light', globalNotificationsEnabled: true, notificationSoundEnabled: true, customNotificationSound: null } }; currentSchoolId = null; currentClassId = null; saveData(); applyTheme(appData.settings.theme); updateNotificationSettingsUI(); updateCustomSoundUI(); restoreAppState(); renderSchoolList(); renderScheduleList(); classListContainer.innerHTML = '<p style="padding: 1rem; text-align: center;">Selecione escola.</p>'; studentListContainer.innerHTML = '<p style="padding: 1rem; text-align: center;">Selecione turma.</p>'; gradesTableContainer.innerHTML = '<p style="padding: 1rem; text-align: center;">Selecione conjunto.</p>'; attendanceTableContainer.innerHTML = '<p style="padding: 1rem; text-align: center;">Selecione data.</p>'; const displayDiv = document.getElementById('lesson-plan-display'); if(displayDiv) displayDiv.innerHTML = ''; saveGradesButton.classList.add('hidden'); saveAttendanceButton.classList.add('hidden'); attendanceActionsContainer.classList.add('hidden'); classroomContainerDisplay.innerHTML = '<p style="padding: 1rem; text-align: center; grid-column: 1 / -1; grid-row: 1 / -1;">Configure o mapa.</p>'; showSection(currentSection || 'schedule-section'); customAlert("Todos os dados foram apagados."); } } };
    const toggleRepresentative = async (studentId) => { const cls = findClassById(currentClassId); if (!cls) return; const studentName = findStudentById(studentId)?.name || 'Aluno(a)'; if (cls.representativeId === studentId) { if (await customConfirm(`Remover ${sanitizeHTML(studentName)} do cargo de Representante?`)) { cls.representativeId = null; console.log(`DEMO: ${studentId} não é mais Rep.`); saveData(); renderStudentList(currentClassId); } } else { const confirmationMessage = `Promover ${sanitizeHTML(studentName)} a Representante?${cls.viceRepresentativeId === studentId ? ' (Ele deixará de ser Vice)' : ''}`; if (await customConfirm(confirmationMessage)) { if (cls.viceRepresentativeId === studentId) cls.viceRepresentativeId = null; cls.representativeId = studentId; console.log(`DEMO: ${studentId} definido como Rep.`); saveData(); renderStudentList(currentClassId); } } };
    const toggleViceRepresentative = async (studentId) => { const cls = findClassById(currentClassId); if (!cls) return; const studentName = findStudentById(studentId)?.name || 'Aluno(a)'; if (cls.viceRepresentativeId === studentId) { if (await customConfirm(`Remover ${sanitizeHTML(studentName)} do cargo de Vice-Representante?`)) { cls.viceRepresentativeId = null; console.log(`DEMO: ${studentId} não é mais Vice.`); saveData(); renderStudentList(currentClassId); } } else { const confirmationMessage = `Promover ${sanitizeHTML(studentName)} a Vice-Representante?${cls.representativeId === studentId ? ' (Ele deixará de ser Rep.)' : ''}`; if (await customConfirm(confirmationMessage)) { if (cls.representativeId === studentId) cls.representativeId = null; cls.viceRepresentativeId = studentId; console.log(`DEMO: ${studentId} definido como Vice.`); saveData(); renderStudentList(currentClassId); } } };
    const toggleActions = (listItemElement) => {
        const currentlyExpanded = studentListContainer.querySelector('.list-item.expanded');
        if (currentlyExpanded && currentlyExpanded !== listItemElement) {
            currentlyExpanded.classList.remove('expanded');
            const prevIcon = currentlyExpanded.querySelector('.expand-actions-button .icon');
            if (prevIcon) {
                prevIcon.classList.remove('icon-chevron-up');
                prevIcon.classList.add('icon-more-vert');
            }
        }
        const isExpanded = listItemElement.classList.toggle('expanded');
        const icon = listItemElement.querySelector('.expand-actions-button .icon');
        if (icon) {
            if (isExpanded) {
                icon.classList.remove('icon-more-vert');
                icon.classList.add('icon-chevron-up');
            } else {
                icon.classList.remove('icon-chevron-up');
                icon.classList.add('icon-more-vert');
            }
        }
    };
    const showHelpModal = () => { const title = "Ajuda - Aba Detalhes da Turma"; const content = ` <h3><span class="icon icon-alunos"></span> Card Alunos</h3> <p>Lista todos os alunos da turma selecionada. Você pode:</p> <ul> <li>Clicar no botão <button class="expand-actions-button" disabled style="padding: 0.3rem 0.6rem; font-size: 0.8rem; background-color: var(--bg-tertiary); color: var(--text-secondary); border: 1px solid var(--border-color); border-radius: 4px;"><span class="icon icon-chevron-down icon-only"></span></button> para ver as ações disponíveis para cada aluno.</li> <li>Promover/Remover <strong>Representante</strong> (<span class="icon icon-representante"></span>) e <strong>Vice</strong> (<span class="icon icon-vice"></span>). Alunos promovidos terão uma borda animada.</li> <li>Acessar <strong>Observações</strong> (<span class="icon icon-anotacao"></span>): Registre anotações, observações (comportamento, desempenho), ocorrências, advertências ou suspensões (com datas de início e fim).</li> <li><strong>Editar</strong> (<span class="icon icon-editar"></span>) os dados do aluno (Nome, Número, Programas Gov.).</li> <li><strong>Mover</strong> (<span class="icon icon-mover"></span>) o aluno para outra turma da mesma escola (histórico de frequência opcional, notas são resetadas).</li> <li><strong>Excluir</strong> (<span class="icon icon-excluir"></span>) o aluno permanentemente da turma.</li> </ul> <h3><span class="icon icon-presenca"></span> Card Presença</h3> <p>Registre a frequência diária dos alunos:</p> <ul> <li>Selecione a <strong>Data</strong> desejada no calendário.</li> <li>Clique em <button class="attendance-toggle present"><span class="icon icon-presenca"></span> P</button> para marcar <strong>Presença</strong> ou <button class="attendance-toggle absent"><span class="icon icon-falta"></span> F</button> para marcar <strong>Falta</strong>.</li> <li>Clicando novamente em <button class="attendance-toggle absent selected justified" disabled><span class="icon icon-falta"></span> FJ</button>, você pode adicionar/editar uma <strong>Justificativa</strong> (o botão mudará para FJ).</li> <li>Use os botões <button class="success" disabled><span class="icon icon-todos-presentes"></span>Todos P.</button> ou <button class="secondary" disabled><span class="icon icon-nao-letivo"></span>Não Letivo</button> para ações rápidas na data selecionada.</li> <li>Alunos com <strong>Suspensão</strong> (<span class="icon icon-suspensao"></span>) ativa na data terão a linha destacada (<span class="suspended-indicator"><span class="icon icon-block"></span> Susp.</span>) e botões P/F desabilitados. Clique na linha para ver detalhes da suspensão.</li> <li>Lembre-se de clicar em <button class="success" disabled><span class="icon icon-salvar"></span> Salvar Presença</button> após as marcações do dia para persistir os dados.</li> <li>Veja o resumo mensal clicando em <button class="secondary icon-button" disabled><span class="icon icon-calendario icon-only"></span></button>.</li> </ul> <h3><span class="icon icon-mapa"></span> Card Mapa da Sala</h3> <p>Visualize e organize a disposição dos alunos na sala:</p> <ul> <li>Clique no ícone <button class="secondary icon-button" disabled><span class="icon icon-editar icon-only"></span></button> para entrar no modo de edição.</li> <li>Ajuste o número de <strong>Fileiras</strong> e <strong>Colunas</strong>.</li> <li>Defina a posição da <strong>Mesa do Professor</strong>.</li> <li>Arraste alunos da lista "Alunos sem lugar" para uma mesa vazia, ou entre mesas.</li> <li>Clique em uma mesa ocupada para desassociar o aluno.</li> <li>Clique em uma mesa vazia e depois em um aluno sem lugar para associá-lo.</li> <li>Clique em <button class="success" disabled><span class="icon icon-salvar"></span> Salvar Mapa</button> para guardar a disposição.</li> </ul> <h3><span class="icon icon-notas"></span> Card Notas e Médias</h3> <p>Gerencie as avaliações e notas dos alunos:</p> <ul> <li>Primeiro, configure a estrutura clicando em <button class="secondary icon-button" disabled><span class="icon icon-estrutura icon-only"></span></button>: Crie "Conjuntos de Notas" (ex: 1º Bimestre), adicione "Instrumentos" (ex: Prova 1, Trabalho) e defina faixas de cores opcionais para as médias.</li> <li>Após configurar, selecione o <strong>Conjunto</strong> desejado no menu dropdown.</li> <li>Insira as notas dos alunos nas colunas correspondentes. A Soma e Média são calculadas automaticamente.</li> <li>Clique em <button class="success" disabled><span class="icon icon-salvar"></span> Salvar Notas</button> para registrar as notas inseridas.</li> <li>Exporte as notas do conjunto selecionado para CSV (<span class="icon icon-upload"></span>) ou PDF (<span class="icon icon-pdf"></span>).</li> </ul> <h3><span class="icon icon-plano"></span> Card Planejamento da Aula</h3> <p>Registre o conteúdo ou tópico planejado para cada dia letivo:</p> <ul> <li>Selecione a <strong>Data</strong> desejada.</li> <li>Digite o planejamento no campo de texto.</li> <li>Clique em <button class="success" disabled><span class="icon icon-salvar"></span> Salvar Plano</button>.</li> </ul> <h3><span class="icon icon-anotacao"></span> Card Anotações da Turma</h3> <p>Espaço para anotações gerais sobre a turma:</p> <ul> <li>Clique em <button class="secondary icon-button" disabled><span class="icon icon-editar icon-only"></span></button> para habilitar a edição.</li> <li>Digite suas anotações gerais sobre a turma (combinados, lembretes, etc.).</li> <li>Clique em <button class="success" disabled><span class="icon icon-salvar"></span> Salvar</button> para guardar as anotações.</li> </ul> <hr style="margin: 1.5rem 0;"> <p>Use o botão <button class="card-toggle-button" disabled><span class="icon icon-chevron-up icon-only"></span></button> no canto de cada card para mostrar ou esconder seu conteúdo.</p> `; showModal(title, content, '', 'help-modal'); };
    const showToolsHelpModal = () => { const title = "Ajuda - Aba Ferramentas"; const content = ` <h3>Ferramentas Gerais</h3> <ul> <li><strong><span class="icon icon-sorteio"></span> Sorteador de Nomes:</strong> Sorteia aleatoriamente um aluno da turma atual.</li> <li><strong><span class="icon icon-cronometro"></span> Cronômetro / Timer:</strong> Ferramenta para marcar o tempo de atividades em sala.</li> <li><strong><span class="icon icon-grupos"></span> Gerador de Grupos:</strong> Divide a turma atual em grupos aleatórios com base no número de alunos por grupo ou quantidade de grupos.</li> <li><strong><span class="icon icon-calculadora-avancada"></span> Calculadora Avançada:</strong> Calculadora com funções extras, incluindo cálculo de média ponderada.</li> <li><strong><span class="icon icon-calendario"></span> Calendário de Anotações:</strong> Um calendário para registrar lembretes e eventos importantes.</li> <li><strong><span class="icon icon-anotacao"></span> Bloco de Notas:</strong> Espaço para anotações rápidas e rascunhos.</li> <li><strong><span class="icon icon-mic"></span> Gravador de Áudio:</strong> Grave áudios curtos para lembretes ou registros de aulas.</li> <li><strong><span class="icon icon-palette"></span> Quadro Branco:</strong> Uma tela em branco para desenhar, fazer esquemas ou explicar conceitos.</li> <li><strong><span class="icon icon-mind-map"></span> Mapa Mental:</strong> Crie mapas mentais simples para organizar ideias.</li> <li><strong><span class="icon icon-flashcards"></span> Flashcards:</strong> Crie cartões de estudo para revisar conceitos com a turma.</li> <li><strong><span class="icon icon-event"></span> Excursões/Eventos:</strong> Organize saídas de campo e eventos da escola.</li> <li><strong><span class="icon icon-noise"></span> Semáforo do Silêncio:</strong> Ferramenta visual para controlar o nível de ruído na sala de aula.</li> <li><strong><span class="icon icon-checklist"></span> Gerenciador de Tarefas:</strong> Crie listas de tarefas (To-Do list) para organizar seu dia a dia.</li> <li><strong><span class="icon icon-lightbulb"></span> Sorteador de Temas:</strong> Sorteie temas aleatórios para redações, debates ou trabalhos.</li> <li><strong><span class="icon icon-sync-alt"></span> Conversor de Notas:</strong> Converta notas entre diferentes escalas (ex: 0-10 para A-F).</li> <li><strong><span class="icon icon-alarm"></span> Pomodoro Timer:</strong> Utilize a técnica Pomodoro para gerenciar o tempo de foco e pausas.</li> </ul> <h3><span class="icon icon-auto-awesome"></span> Ferramentas de Inteligência Artificial</h3> <p>Estas ferramentas utilizam a IA do Google Gemini para auxiliar no planejamento e avaliação. Requerem a configuração da Chave de API na aba Ajustes.</p> <ul> <li><strong><span class="icon icon-auto-awesome"></span> Gerador de Rubricas:</strong> Cria rubricas de avaliação detalhadas para trabalhos e projetos.</li> <li><strong><span class="icon icon-auto-awesome"></span> Gerador de Questões:</strong> Cria questões de múltipla escolha ou dissertativas sobre qualquer tema.</li> <li><strong><span class="icon icon-auto-awesome"></span> Assistente de Provas:</strong> Ajuda a estruturar e gerar provas completas com base no conteúdo ensinado.</li> <li><strong><span class="icon icon-auto-awesome"></span> Análise de Turma:</strong> Analisa o perfil da turma com base nas suas anotações e dados dos alunos.</li> <li><strong><span class="icon icon-auto-awesome"></span> Plano de Aula Inteligente:</strong> Gera um esboço completo de plano de aula com base no tema e objetivos.</li> </ul> `; showModal(title, content, '', 'help-modal'); };
    let touchStartX = 0; let touchEndX = 0; let touchStartY = 0; let isSwiping = false; const swipeThreshold = 110; const verticalThreshold = 60; mainContent.addEventListener('touchstart', (e) => { const targetTagName = e.target.tagName.toLowerCase(); const isInteractive = ['input', 'button', 'select', 'textarea', 'a'].includes(targetTagName); const isInScrollable = e.target.closest('.table-scroll-wrapper, .modal-body, .list-item-actions, #monthly-attendance-table-wrapper, #student-observations-list, .classroom-container, .unassigned-students-list, .school-quorum-info'); if (isInteractive || isInScrollable) { isSwiping = false; return; } touchStartX = e.changedTouches[0].screenX; touchStartY = e.changedTouches[0].screenY; touchEndX = touchStartX; isSwiping = true; }, { passive: true }); mainContent.addEventListener('touchmove', (e) => { if (!isSwiping) return; touchEndX = e.changedTouches[0].screenX; const touchEndY = e.changedTouches[0].screenY; if (Math.abs(touchEndY - touchStartY) > verticalThreshold) { isSwiping = false; } }, { passive: true }); mainContent.addEventListener('touchend', (e) => { if (!isSwiping) { touchStartX = 0; touchEndX = 0; touchStartY = 0; return; } isSwiping = false; const deltaX = touchEndX - touchStartX; const deltaY = e.changedTouches[0].screenY - touchStartY; if (Math.abs(deltaX) > swipeThreshold && Math.abs(deltaX) > Math.abs(deltaY) * 1.8) { const visibleNavButtons = Array.from(navButtons).filter(btn => !btn.disabled && !btn.parentElement.classList.contains('hidden')); const currentActiveIndex = visibleNavButtons.findIndex(btn => btn.classList.contains('active')); if (currentActiveIndex === -1) return; let nextIndex; if (deltaX < 0) { nextIndex = currentActiveIndex + 1; if (nextIndex >= visibleNavButtons.length) return; } else { nextIndex = currentActiveIndex - 1; if (nextIndex < 0) return; } const targetButton = visibleNavButtons[nextIndex]; if(targetButton) { targetButton.click(); } } touchStartX = 0; touchEndX = 0; touchStartY = 0; });
    const notificationMessages = { start: ["<span class='icon icon-rocket-launch'></span> Preparar... Apontar... Aula! Sua aula ({CLASS}) na {SCHOOL} começa em 5 minutos.", "<span class='icon icon-coffee'></span> Último gole de café? Sua aula ({CLASS}) na {SCHOOL} começa em 5 minutos!", "<span class='icon icon-notifications'></span> O sino quase tocou! Aula ({CLASS}) na {SCHOOL} em 5 minutos. ", "<span class='icon icon-directions-run'></span> Corre, professor! Faltam 5 minutos para a aula ({CLASS}) na {SCHOOL} começar.", "<span class='icon icon-auto-awesome'></span> Hora de brilhar! Sua aula ({CLASS}) na {SCHOOL} inicia em 5 minutos.", "<span class='icon icon-alarm'></span> Tic-tac... 5 minutos para o início da aula ({CLASS}) na {SCHOOL}!"], end: ["<span class='icon icon-sports-score'></span> Quase lá! Sua aula ({CLASS}) na {SCHOOL} termina em 5 minutos.", "<span class='icon icon-face'></span> Ufa! Só mais 5 minutinhos de aula ({CLASS}) na {SCHOOL}.", "<span class='icon icon-notifications'></span> O sino da liberdade (quase)! Aula ({CLASS}) na {SCHOOL} acaba em 5 minutos.", "<span class='icon icon-ads-click'></span> Missão quase completa! A aula ({CLASS}) na {SCHOOL} termina em 5 minutos.", "<span class='icon icon-celebration'></span> Bom trabalho! Reta final da aula ({CLASS}) na {SCHOOL} - 5 minutos restantes.", "<span class='icon icon-hourglass-empty'></span> Contagem regressiva: 5 minutos para o fim da aula ({CLASS}) na {SCHOOL}."] };
    const getRandomMessage = (type, scheduleItem) => { const messages = notificationMessages[type]; if (!messages || messages.length === 0) return "Alerta de Horário!"; const randomIndex = Math.floor(Math.random() * messages.length); let message = messages[randomIndex]; const school = findSchoolById(scheduleItem.schoolId); message = message.replace('{CLASS}', sanitizeHTML(scheduleItem.note || '')); message = message.replace('{SCHOOL}', sanitizeHTML(school?.name || 'escola')); return message; };
    const showNotification = (message) => { if (!notificationBanner || !notificationMessage) return; notificationMessage.innerHTML = message; notificationBanner.classList.add('show'); playSound(); setTimeout(hideNotification, 10000); };
    const hideNotification = () => { if (notificationBanner) notificationBanner.classList.remove('show'); };
    const playSound = () => { if (!appData.settings.notificationSoundEnabled) return; if (appData.settings.customNotificationSound) { try { const customAudio = new Audio(appData.settings.customNotificationSound); customAudio.play().catch(error => { console.warn("Erro ao tocar som personalizado:", error); defaultNotificationSound?.play().catch(e => console.warn("Erro ao tocar som padrão (fallback):", e)); }); } catch (error) { console.error("Erro ao criar Audio com som personalizado:", error); defaultNotificationSound?.play().catch(e => console.warn("Erro ao tocar som padrão (fallback 2):", e)); } } else { defaultNotificationSound?.play().catch(error => { console.warn("Erro ao tocar som da notificação padrão:", error); }); } };
    const checkNotifications = () => { shownNotificationsThisMinute = {}; if (!appData.settings.globalNotificationsEnabled) { return; } const now = new Date(); const currentDayIndex = now.getDay(); const currentDayName = weekdays[currentDayIndex]; const currentHour = now.getHours(); const currentMinute = now.getMinutes(); appData.schedule.forEach(item => { if (!item.notificationsEnabled || item.day !== currentDayName || !item.startTime || !item.endTime) { return; } const notificationKeyBase = item.id; try { const [startHour, startMinute] = item.startTime.split(':').map(Number); const [endHour, endMinute] = item.endTime.split(':').map(Number); if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) { console.warn(`Invalid time format for schedule item ${item.id}`); return; } let notifyStartMinute = startMinute - NOTIFICATION_LEAD_TIME_MINUTES; let notifyStartHour = startHour; if (notifyStartMinute < 0) { notifyStartMinute += 60; notifyStartHour -= 1; if (notifyStartHour < 0) notifyStartHour = 23; } let notifyEndMinute = endMinute - NOTIFICATION_LEAD_TIME_MINUTES; let notifyEndHour = endHour; if (notifyEndMinute < 0) { notifyEndMinute += 60; notifyEndHour -= 1; if (notifyEndHour < 0) notifyEndHour = 23; } const startNotificationKey = notificationKeyBase + '_start'; if (currentHour === notifyStartHour && currentMinute === notifyStartMinute) { if (!shownNotificationsThisMinute[startNotificationKey]) { console.log(`Triggering START notification for ${item.id}`); const message = getRandomMessage('start', item); showNotification(message); shownNotificationsThisMinute[startNotificationKey] = true; } } const endNotificationKey = notificationKeyBase + '_end'; if (currentHour === notifyEndHour && currentMinute === notifyEndMinute) { if (!shownNotificationsThisMinute[endNotificationKey]) { console.log(`Triggering END notification for ${item.id}`); const message = getRandomMessage('end', item); showNotification(message); shownNotificationsThisMinute[endNotificationKey] = true; } } } catch (error) { console.error(`Error processing schedule item ${item.id}:`, error); } }); };
    const startNotificationChecker = () => { if (notificationCheckInterval) { clearInterval(notificationCheckInterval); } console.log("Starting notification checker..."); checkNotifications(); notificationCheckInterval = setInterval(checkNotifications, 60000); };
    const stopNotificationChecker = () => { if (notificationCheckInterval) { clearInterval(notificationCheckInterval); notificationCheckInterval = null; console.log("Stopped notification checker."); } };
    const updateNotificationSettingsUI = () => { if (enableGlobalNotificationsCheckbox && enableNotificationSoundCheckbox) { enableGlobalNotificationsCheckbox.checked = appData.settings.globalNotificationsEnabled; enableNotificationSoundCheckbox.checked = appData.settings.notificationSoundEnabled; enableNotificationSoundCheckbox.disabled = !appData.settings.globalNotificationsEnabled; } };
    const updateCustomSoundUI = () => { if (!customSoundFilenameDisplay || !currentCustomSoundDisplay || !currentCustomSoundName || !removeCustomSoundButton) return; const soundName = localStorage.getItem('superProfessorPro_customSoundName'); if (appData.settings.customNotificationSound && soundName) { customSoundFilenameDisplay.textContent = soundName; customSoundFilenameDisplay.title = soundName; currentCustomSoundName.textContent = soundName; currentCustomSoundDisplay.classList.remove('hidden'); } else { appData.settings.customNotificationSound = null; localStorage.removeItem('superProfessorPro_customSoundName'); customSoundFilenameDisplay.textContent = 'Nenhum arquivo escolhido'; customSoundFilenameDisplay.title = ''; currentCustomSoundDisplay.classList.add('hidden'); currentCustomSoundName.textContent = ''; } if (customNotificationSoundInput) customNotificationSoundInput.value = null; };
    const handleCustomSoundUpload = (event) => { const file = event.target.files[0]; if (!file) { return; } if (!file.type.startsWith('audio/')) { customAlert('Por favor, selecione um arquivo de áudio válido (MP3, WAV, OGG, etc.).'); updateCustomSoundUI(); return; } const fileSizeMB = file.size / 1024 / 1024; if (fileSizeMB > MAX_CUSTOM_SOUND_SIZE_MB) { customAlert(`Arquivo muito grande (${fileSizeMB.toFixed(1)}MB). O limite é ${MAX_CUSTOM_SOUND_SIZE_MB}MB.`); updateCustomSoundUI(); return; } const reader = new FileReader(); reader.onload = (e) => { appData.settings.customNotificationSound = e.target.result; localStorage.setItem('superProfessorPro_customSoundName', file.name); saveData(); updateCustomSoundUI(); customAlert(`Som "${file.name}" carregado com sucesso!`); }; reader.onerror = (e) => { console.error("Erro ao ler arquivo de áudio:", e); customAlert("Ocorreu um erro ao tentar carregar o arquivo de som."); updateCustomSoundUI(); }; reader.readAsDataURL(file); };
    const removeCustomSound = async () => { if (await customConfirm("Remover o som de notificação personalizado?")) { appData.settings.customNotificationSound = null; localStorage.removeItem('superProfessorPro_customSoundName'); saveData(); updateCustomSoundUI(); customAlert("Som personalizado removido."); } };
    
    const updateProfileUI = () => {
        if (!appData.userProfile) appData.userProfile = { name: '', avatar: '', subjects: '' };
        if (profileNameInput) profileNameInput.value = appData.userProfile.name || '';
        if (profileSubjectsInput) profileSubjectsInput.value = appData.userProfile.subjects || '';
        
        const sideMenuName = document.getElementById('side-menu-name');
        if (sideMenuName) sideMenuName.textContent = appData.userProfile.name || 'Professor';

        const settingsWelcomeName = document.getElementById('settings-welcome-name');
        if (settingsWelcomeName) settingsWelcomeName.textContent = appData.userProfile.name || 'Professor(a)';

        const sideMenuAvatarImg = document.getElementById('side-menu-avatar-img');
        const sideMenuAvatarPlaceholder = document.getElementById('side-menu-avatar-placeholder');

        if (profileAvatarImg && profileAvatarPlaceholder) {
            if (appData.userProfile.avatar) {
                profileAvatarImg.src = appData.userProfile.avatar;
                profileAvatarImg.style.display = 'block';
                profileAvatarPlaceholder.style.display = 'none';
                
                if (sideMenuAvatarImg && sideMenuAvatarPlaceholder) {
                    sideMenuAvatarImg.src = appData.userProfile.avatar;
                    sideMenuAvatarImg.style.display = 'block';
                    sideMenuAvatarPlaceholder.style.display = 'none';
                }
            } else {
                profileAvatarImg.src = '';
                profileAvatarImg.style.display = 'none';
                profileAvatarPlaceholder.style.display = 'block';
                
                if (sideMenuAvatarImg && sideMenuAvatarPlaceholder) {
                    sideMenuAvatarImg.src = '';
                    sideMenuAvatarImg.style.display = 'none';
                    sideMenuAvatarPlaceholder.style.display = 'block';
                }
            }
        }
    };

    const handleAvatarUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            customAlert('Por favor, selecione uma imagem válida.');
            return;
        }
        const fileSizeMB = file.size / 1024 / 1024;
        if (fileSizeMB > 2) {
            customAlert(`A imagem é muito grande (${fileSizeMB.toFixed(1)}MB). O limite é 2MB.`);
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            if (!appData.userProfile) appData.userProfile = { name: '', avatar: '' };
            appData.userProfile.avatar = e.target.result;
            saveData();
            updateProfileUI();
        };
        reader.onerror = (e) => {
            console.error("Erro ao ler imagem:", e);
            customAlert("Ocorreu um erro ao tentar carregar a imagem.");
        };
        reader.readAsDataURL(file);
    };

    const saveProfile = () => {
        if (!appData.userProfile) appData.userProfile = { name: '', avatar: '', subjects: '' };
        if (profileNameInput) {
            appData.userProfile.name = profileNameInput.value.trim();
        }
        if (profileSubjectsInput) {
            appData.userProfile.subjects = profileSubjectsInput.value.trim();
        }
        saveData();
        updateProfileUI();
        customAlert("Perfil salvo com sucesso!");
    };

    const markAllStudentsPresent = () => { const date = attendanceDateInput.value; if (!currentClassId || !date) { customAlert("Selecione uma turma e uma data primeiro."); return; } const studentsInClass = getStudentsByClass(currentClassId); if (studentsInClass.length === 0) return; console.log(`Action: Marking all present for class ${currentClassId} on ${date}`); studentsInClass.forEach(student => { if (!student.attendance[date]) student.attendance[date] = { status: null, justification: '' }; if (student.attendance[date].status !== 'H' && !isStudentSuspendedOnDate(student.id, date)) { student.attendance[date].status = 'P'; student.attendance[date].justification = ''; } }); renderAttendanceTable(currentClassId, date); console.log("Data updated for Mark All Present. Remember to Save."); };
    const toggleNonSchoolDay = async () => { const date = attendanceDateInput.value; if (!currentClassId || !date) { customAlert("Selecione uma turma e uma data primeiro."); return; } const studentsInClass = getStudentsByClass(currentClassId); if (studentsInClass.length === 0) return; const isCurrentlyNonSchool = studentsInClass.every(std => std.attendance[date]?.status === 'H'); if (isCurrentlyNonSchool) { if (await customConfirm(`Deseja desmarcar ${formatDate(date)} como dia NÃO LETIVO?\nA presença dos alunos será resetada para esta data.`)) { studentsInClass.forEach(student => { if (!student.attendance[date]) student.attendance[date] = {}; student.attendance[date].status = null; student.attendance[date].justification = ''; }); console.log("Action: Unmarked Non-School Day in data."); renderAttendanceTable(currentClassId, date); customAlert(`Dia ${formatDate(date)} desmarcado como não letivo. Clique em Salvar Presença para confirmar.`); } } else { if (await customConfirm(`Deseja marcar ${formatDate(date)} como dia NÃO LETIVO para esta turma?\nToda a presença registrada nesta data será substituída por 'H'.`)) { studentsInClass.forEach(student => { if (!student.attendance[date]) student.attendance[date] = {}; student.attendance[date].status = 'H'; student.attendance[date].justification = ''; }); console.log("Action: Marked Non-School Day in data."); renderAttendanceTable(currentClassId, date); customAlert(`Dia ${formatDate(date)} marcado como não letivo. Clique em Salvar Presença para confirmar.`); } } };
    const editClassroomMap = () => { const cls = findClassById(currentClassId); if (!cls) return; tempClassroomLayout = JSON.parse(JSON.stringify(cls.classroomLayout || { rows: 5, cols: 6, teacherDeskPosition: 'top-center', seats: [] })); clearSeatSelection(); mapRowsInput.value = tempClassroomLayout.rows; mapColsInput.value = tempClassroomLayout.cols; teacherDeskPositionSelect.value = tempClassroomLayout.teacherDeskPosition; classroomMapEditControls.classList.remove('hidden'); renderClassroomMap(currentClassId, true); mapRowsInput.removeEventListener('input', handleDimensionChange); mapColsInput.removeEventListener('input', handleDimensionChange); teacherDeskPositionSelect.removeEventListener('change', handleTeacherDeskChange); mapRowsInput.addEventListener('input', handleDimensionChange); mapColsInput.addEventListener('input', handleDimensionChange); teacherDeskPositionSelect.addEventListener('change', handleTeacherDeskChange); };
    const cancelClassroomMapEdit = () => { tempClassroomLayout = null; clearSeatSelection(); classroomMapEditControls.classList.add('hidden'); renderClassroomMap(currentClassId, false); mapRowsInput.removeEventListener('input', handleDimensionChange); mapColsInput.removeEventListener('input', handleDimensionChange); teacherDeskPositionSelect.removeEventListener('change', handleTeacherDeskChange); };
    const saveClassroomLayout = () => { if (!currentClassId || !tempClassroomLayout) return; const cls = findClassById(currentClassId); if (!cls) return; const newLayout = { rows: parseInt(mapRowsInput.value) || 5, cols: parseInt(mapColsInput.value) || 6, teacherDeskPosition: teacherDeskPositionSelect.value || 'top-center', seats: tempClassroomLayout.seats }; if (newLayout.rows < 1 || newLayout.rows > 20 || newLayout.cols < 1 || newLayout.cols > 20) { customAlert("Fileiras e Colunas devem estar entre 1 e 20."); return; } cls.classroomLayout = newLayout; saveData(); tempClassroomLayout = null; cancelClassroomMapEdit(); customAlert("Mapa da sala salvo!"); };
    const randomizeClassroomMap = () => {
        try {
            if (!currentClassId || !tempClassroomLayout) return;
            const students = getStudentsByClass(currentClassId);
            if (students.length === 0) { customAlert("Não há alunos nesta turma para distribuir."); return; }
            
            const assignedStudentIds = new Set(tempClassroomLayout.seats.map(s => s.studentId).filter(id => id));
            const unassignedStudents = students.filter(s => !assignedStudentIds.has(s.id));
            
            if (unassignedStudents.length === 0) {
                customAlert("Todos os alunos já estão posicionados.");
                return;
            }

            const shuffledStudents = [...unassignedStudents];
            for (let i = shuffledStudents.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledStudents[i], shuffledStudents[j]] = [shuffledStudents[j], shuffledStudents[i]];
            }

            const rows = tempClassroomLayout.rows;
            const cols = tempClassroomLayout.cols;
            const availableSeats = [];
            
            for (let r = 1; r <= rows; r++) {
                for (let c = 1; c <= cols; c++) {
                    const isOccupied = tempClassroomLayout.seats.some(s => s.row === r && s.col === c);
                    if (!isOccupied) {
                        availableSeats.push({ row: r, col: c });
                    }
                }
            }

            if (availableSeats.length < shuffledStudents.length) {
                customAlert("Não há mesas vazias suficientes para os alunos restantes.");
                return;
            }

            for (let i = availableSeats.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [availableSeats[i], availableSeats[j]] = [availableSeats[j], availableSeats[i]];
            }

            for (let i = 0; i < shuffledStudents.length && i < availableSeats.length; i++) {
                tempClassroomLayout.seats.push({ row: availableSeats[i].row, col: availableSeats[i].col, studentId: shuffledStudents[i].id });
            }
            
            clearSeatSelection();
            renderClassroomMap(currentClassId, true);
        } catch (error) {
            console.error(error);
            customAlert("Erro ao randomizar: " + error.message);
        }
    };
    const handleDimensionChange = () => { if (!tempClassroomLayout) return; const newRows = parseInt(mapRowsInput.value) || tempClassroomLayout.rows; const newCols = parseInt(mapColsInput.value) || tempClassroomLayout.cols; if (newRows !== tempClassroomLayout.rows || newCols !== tempClassroomLayout.cols) { const oldSeats = tempClassroomLayout.seats; tempClassroomLayout.rows = newRows; tempClassroomLayout.cols = newCols; tempClassroomLayout.seats = oldSeats.filter(seat => seat.row <= newRows && seat.col <= newCols); renderClassroomMap(currentClassId, true); } };
    const handleTeacherDeskChange = () => { if (!tempClassroomLayout) return; tempClassroomLayout.teacherDeskPosition = teacherDeskPositionSelect.value; renderClassroomMap(currentClassId, true); };
    const handleStudentListDragStart = (e) => { draggedElement = e.target; draggedStudentId = e.target.dataset.studentId; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', draggedStudentId); setTimeout(() => draggedElement?.classList.add('dragging'), 0); clearSeatSelection(); console.log(`Drag Start (List): Student ID ${draggedStudentId}`); };
    const handleSeatDragStart = (e) => { draggedElement = e.target; draggedStudentId = e.target.dataset.studentId; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', draggedStudentId); setTimeout(() => draggedElement?.classList.add('dragging'), 0); clearSeatSelection(); console.log(`Drag Start (Seat): Student ID ${draggedStudentId} from Row ${e.target.dataset.row}, Col ${e.target.dataset.col}`); };
    const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; const target = e.target.closest('.seat, .unassigned-students-list'); if (target) { const targetIsSeat = target.classList.contains('seat'); const targetIsUnassigned = target.classList.contains('unassigned-students-list'); const draggingFromSeat = draggedElement && draggedElement.classList.contains('seat'); if (targetIsSeat && !target.classList.contains('occupied')) { target.classList.add('drag-over'); } else if (targetIsSeat && target.classList.contains('occupied') && draggedStudentId !== target.dataset.studentId) { target.classList.add('drag-over'); } else if (targetIsUnassigned && draggingFromSeat) { target.classList.add('drag-over'); } } };
    const handleDragLeave = (e) => { const target = e.target.closest('.seat, .unassigned-students-list'); if (target) { target.classList.remove('drag-over'); } };
    const handleDropOnSeat = (e) => { e.preventDefault(); const targetSeat = e.target.closest('.seat'); if (!targetSeat || !draggedStudentId || !tempClassroomLayout) return; targetSeat.classList.remove('drag-over'); const targetRow = parseInt(targetSeat.dataset.row); const targetCol = parseInt(targetSeat.dataset.col); const studentBeingDroppedId = e.dataTransfer.getData('text/plain') || draggedStudentId; console.log(`Drop: Student ${studentBeingDroppedId} onto Row ${targetRow}, Col ${targetCol}`); const existingStudentIdInTarget = targetSeat.dataset.studentId; tempClassroomLayout.seats = tempClassroomLayout.seats.filter(seat => seat.studentId !== studentBeingDroppedId); if (existingStudentIdInTarget && existingStudentIdInTarget !== studentBeingDroppedId) { console.log(` -> Target occupied by ${existingStudentIdInTarget}. Unassigning ${existingStudentIdInTarget}.`); tempClassroomLayout.seats = tempClassroomLayout.seats.filter(seat => !(seat.row === targetRow && seat.col === targetCol)); } let seatEntry = tempClassroomLayout.seats.find(s => s.row === targetRow && s.col === targetCol); if (!seatEntry) { seatEntry = { row: targetRow, col: targetCol, studentId: null }; tempClassroomLayout.seats.push(seatEntry); } else if (seatEntry.studentId && seatEntry.studentId !== studentBeingDroppedId){ seatEntry.studentId = null; } seatEntry.studentId = studentBeingDroppedId; console.log(" -> Updated Temp Layout (Drop on Seat):", JSON.parse(JSON.stringify(tempClassroomLayout.seats))); renderClassroomMap(currentClassId, true); draggedElement?.classList.remove('dragging'); draggedStudentId = null; draggedElement = null; };
    const handleDropOnUnassignedList = (e) => { e.preventDefault(); const targetList = e.target.closest('.unassigned-students-list'); if (!targetList || !draggedStudentId || !tempClassroomLayout) return; targetList.classList.remove('drag-over'); const studentBeingDroppedId = e.dataTransfer.getData('text/plain') || draggedStudentId; console.log(`Drop: Student ${studentBeingDroppedId} onto Unassigned List`); const wasSeatOccupied = tempClassroomLayout.seats.some(seat => seat.studentId === studentBeingDroppedId); if (!wasSeatOccupied) { console.log(" -> Student was already unassigned. No change needed."); draggedElement?.classList.remove('dragging'); draggedStudentId = null; draggedElement = null; return; } tempClassroomLayout.seats = tempClassroomLayout.seats.filter(seat => seat.studentId !== studentBeingDroppedId); console.log(" -> Updated Temp Layout (Drop on Unassigned):", JSON.parse(JSON.stringify(tempClassroomLayout.seats))); renderClassroomMap(currentClassId, true); draggedElement?.classList.remove('dragging'); draggedStudentId = null; draggedElement = null; };
    const clearSeatSelection = () => { if (selectedSeatForAssignment) { selectedSeatForAssignment.classList.remove('selected-for-assignment'); selectedSeatForAssignment = null; console.log("Seat selection cleared."); } };
    const handleSeatClickForAssignment = (event) => { const clickedSeat = event.currentTarget; if (!clickedSeat.classList.contains('empty') || !tempClassroomLayout) return; if (selectedSeatForAssignment === clickedSeat) { clearSeatSelection(); } else { clearSeatSelection(); selectedSeatForAssignment = clickedSeat; selectedSeatForAssignment.classList.add('selected-for-assignment'); console.log(`Seat selected for assignment: Row ${clickedSeat.dataset.row}, Col ${clickedSeat.dataset.col}`); } };
    const handleOccupiedSeatClick = (event) => { const clickedSeat = event.currentTarget; if (!tempClassroomLayout || !clickedSeat.classList.contains('occupied')) return; const studentIdToUnassign = clickedSeat.dataset.studentId; const row = parseInt(clickedSeat.dataset.row); const col = parseInt(clickedSeat.dataset.col); if (!studentIdToUnassign) return; console.log(`Click Unassign: Student ${studentIdToUnassign} from Row ${row}, Col ${col}`); tempClassroomLayout.seats = tempClassroomLayout.seats.filter(seat => !(seat.row === row && seat.col === col)); clearSeatSelection(); renderClassroomMap(currentClassId, true); };
    const handleUnassignedStudentClickForAssignment = (event) => { if (!selectedSeatForAssignment) { console.log("Unassigned student clicked, but no seat selected."); return; } const clickedStudentElement = event.currentTarget; const studentIdToAssign = clickedStudentElement.dataset.studentId; const targetRow = parseInt(selectedSeatForAssignment.dataset.row); const targetCol = parseInt(selectedSeatForAssignment.dataset.col); if (!studentIdToAssign || isNaN(targetRow) || isNaN(targetCol) || !tempClassroomLayout) { console.error("Error during click assignment: Missing data"); clearSeatSelection(); return; } console.log(`Click Assign: Student ${studentIdToAssign} to Row ${targetRow}, Col ${targetCol}`); let seatEntry = tempClassroomLayout.seats.find(s => s.row === targetRow && s.col === targetCol); if (!seatEntry) { seatEntry = { row: targetRow, col: targetCol, studentId: null }; tempClassroomLayout.seats.push(seatEntry); } else if (seatEntry.studentId) { console.warn(`Target seat ${targetRow}-${targetCol} was already occupied by ${seatEntry.studentId} during click assignment. Overwriting.`); } seatEntry.studentId = studentIdToAssign; console.log(" -> Updated Temp Layout (Click Assign):", JSON.parse(JSON.stringify(tempClassroomLayout.seats))); clearSeatSelection(); renderClassroomMap(currentClassId, true); };
    const toggleCardCollapse = (button) => { 
        const card = button.closest('.card'); 
        if (card) { 
            const isCollapsed = card.classList.toggle('collapsed'); 
            button.title = isCollapsed ? 'Mostrar Opções' : 'Esconder Opções'; 
            const icon = button.querySelector('.icon');
            if (icon) {
                if (isCollapsed) {
                    icon.classList.remove('icon-chevron-up');
                    icon.classList.add('icon-more-vert');
                } else {
                    icon.classList.remove('icon-more-vert');
                    icon.classList.add('icon-chevron-up');
                }
            }
        } 
    };
    const openNameSorterModal = () => {
        const title = "Sorteador de Nomes";
        
        const schools = [...new Set(appData.classes.map(c => findSchoolById(c.schoolId)?.name).filter(Boolean))];
        const shifts = [...new Set(appData.classes.map(c => c.shift).filter(Boolean))];
        
        let scopeHtml = `
            <div style="margin-bottom: 15px;">
                <label for="sorter-scope" style="display: block; margin-bottom: 5px;">Escopo do Sorteio:</label>
                <select id="sorter-scope" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--border-color);">
                    <option value="current_class">Turma Atual ${currentClassId ? `(${findClassById(currentClassId)?.name})` : '(Nenhuma selecionada)'}</option>
                    <option value="all_classes">Todas as Turmas</option>
                    ${schools.length > 0 ? `<optgroup label="Por Escola">${schools.map(s => `<option value="school_${s}">${s}</option>`).join('')}</optgroup>` : ''}
                    ${shifts.length > 0 ? `<optgroup label="Por Turno">${shifts.map(s => `<option value="shift_${s}">${s}</option>`).join('')}</optgroup>` : ''}
                </select>
            </div>
        `;

        let content = `
            ${scopeHtml}
            <div id="sorter-main-content"></div>
        `;
        
        let footer = `
            <button type="button" id="reset-sorter-button" class="secondary"><span class="icon icon-sync"></span> Reiniciar</button>
            <button type="button" id="sort-next-button" class="success"><span class="icon icon-sorteio"></span> Sortear Próximo</button>
        `;
        
        showModal(title, content, footer, 'name-sorter-modal');
        
        const scopeSelect = document.getElementById('sorter-scope');
        const mainContent = document.getElementById('sorter-main-content');
        
        const renderSorterContent = () => {
            const scope = scopeSelect.value;
            let targetStudents = [];
            let scopeLabel = '';
            
            if (scope === 'current_class') {
                if (currentClassId) {
                    targetStudents = getStudentsByClass(currentClassId);
                    scopeLabel = `Turma: ${findClassById(currentClassId).name}`;
                }
            } else if (scope === 'all_classes') {
                targetStudents = appData.students;
                scopeLabel = 'Todas as Turmas';
            } else if (scope.startsWith('school_')) {
                const school = scope.replace('school_', '');
                const schoolClasses = appData.classes.filter(c => findSchoolById(c.schoolId)?.name === school).map(c => c.id);
                targetStudents = appData.students.filter(s => schoolClasses.includes(s.classId));
                scopeLabel = `Escola: ${school}`;
            } else if (scope.startsWith('shift_')) {
                const shift = scope.replace('shift_', '');
                const shiftClasses = appData.classes.filter(c => c.shift === shift).map(c => c.id);
                targetStudents = appData.students.filter(s => shiftClasses.includes(s.classId));
                scopeLabel = `Turno: ${shift}`;
            }
            
            const sortButton = document.getElementById('sort-next-button');
            const resetButton = document.getElementById('reset-sorter-button');
            
            if (targetStudents.length === 0) {
                mainContent.innerHTML = `<p>Não há alunos cadastrados neste escopo.</p>`;
                if(sortButton) sortButton.disabled = true;
                if(resetButton) resetButton.disabled = true;
                return;
            }
            
            sorterStudentList = [...targetStudents];
            sorterAvailableStudents = [...targetStudents];
            sorterDrawnStudents = [];
            
            mainContent.innerHTML = `
                <p class="mb-1 text-sm text-secondary">${scopeLabel}</p>
                <div id="sorter-result-display">-- Clique em Sortear --</div>
                <div class="sorter-controls mt-2">
                    <div class="toggle-container mb-0" style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 500;">Sortear sem Repetição</span>
                        <label class="switch">
                            <input type="checkbox" id="sorter-no-repeat">
                            <span class="slider round"></span>
                        </label>
                    </div>
                    <span id="sorter-remaining-count" class="sorter-info hidden">${targetStudents.length} restantes</span>
                </div>
            `;
            
            if(sortButton) sortButton.disabled = false;
            if(resetButton) resetButton.disabled = false;
            
            const noRepeatCheckbox = document.getElementById('sorter-no-repeat');
            const remainingCountDisplay = document.getElementById('sorter-remaining-count');
            const resultDisplay = document.getElementById('sorter-result-display');
            
            const updateRemainingCount = () => {
                if (noRepeatCheckbox.checked) {
                    remainingCountDisplay.textContent = `${sorterAvailableStudents.length} restantes`;
                    remainingCountDisplay.classList.remove('hidden');
                    if(sortButton) sortButton.disabled = sorterAvailableStudents.length === 0;
                } else {
                    remainingCountDisplay.classList.add('hidden');
                    if(sortButton) sortButton.disabled = false;
                }
            };
            
            if(sortButton) {
                const newSortBtn = sortButton.cloneNode(true);
                sortButton.parentNode.replaceChild(newSortBtn, sortButton);
                newSortBtn.addEventListener('click', () => sortNextName(resultDisplay, noRepeatCheckbox.checked, updateRemainingCount));
            }
            
            if(resetButton) {
                const newResetBtn = resetButton.cloneNode(true);
                resetButton.parentNode.replaceChild(newResetBtn, resetButton);
                newResetBtn.addEventListener('click', () => resetSorter(resultDisplay, updateRemainingCount));
            }
            
            noRepeatCheckbox.addEventListener('change', () => resetSorter(resultDisplay, updateRemainingCount));
        };
        
        scopeSelect.addEventListener('change', renderSorterContent);
        renderSorterContent();
    };
    const sortNextName = (displayElement, noRepeat, updateCountCallback) => { let listToDrawFrom = noRepeat ? sorterAvailableStudents : sorterStudentList; if (listToDrawFrom.length === 0) { displayElement.textContent = "Fim!"; updateCountCallback(); return; } const randomIndex = Math.floor(Math.random() * listToDrawFrom.length); const drawnStudent = listToDrawFrom[randomIndex]; displayElement.innerHTML = `<span style="font-weight:normal; font-size: 0.8em; display:block;">${drawnStudent.number || '-.'}</span> ${sanitizeHTML(drawnStudent.name)}`; if (noRepeat) { sorterDrawnStudents.push(drawnStudent); sorterAvailableStudents.splice(randomIndex, 1); } updateCountCallback(); };
    const resetSorter = (displayElement, updateCountCallback) => { sorterAvailableStudents = [...sorterStudentList]; sorterDrawnStudents = []; displayElement.textContent = "-- Reiniciado --"; updateCountCallback(); };
    const formatTime = (totalSeconds) => { const hours = Math.floor(totalSeconds / 3600); const minutes = Math.floor((totalSeconds % 3600) / 60); const seconds = totalSeconds % 60; return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`; };
    const updateStopwatchDisplay = () => { const display = document.getElementById('timer-display'); if (display) { display.textContent = formatTime(stopwatchSeconds); } };
    const startStopwatch = () => { if (isStopwatchRunning) return; isStopwatchRunning = true; document.getElementById('start-timer-button')?.classList.add('hidden'); document.getElementById('pause-timer-button')?.classList.remove('hidden'); stopwatchInterval = setInterval(() => { stopwatchSeconds++; updateStopwatchDisplay(); }, 1000); };
    const pauseStopwatch = () => { if (!isStopwatchRunning) return; isStopwatchRunning = false; clearInterval(stopwatchInterval); stopwatchInterval = null; document.getElementById('start-timer-button')?.classList.remove('hidden'); document.getElementById('pause-timer-button')?.classList.add('hidden'); };
    const resetStopwatch = () => { pauseStopwatch(); stopwatchSeconds = 0; updateStopwatchDisplay(); };
    const openTimerModal = () => { const title = "Cronômetro / Timer"; if (stopwatchInterval) clearInterval(stopwatchInterval); stopwatchInterval = null; stopwatchSeconds = 0; isStopwatchRunning = false; const content = `<div id="timer-display">00:00:00</div> <div class="timer-controls"> <button type="button" id="start-timer-button" class="success"><span class="icon icon-play-arrow"></span> Iniciar</button> <button type="button" id="pause-timer-button" class="warning hidden"><span class="icon icon-pause"></span> Pausar</button> <button type="button" id="reset-timer-button" class="secondary"><span class="icon icon-sync"></span> Zerar</button> </div> <hr style="margin: 1.5rem 0 1rem 0; border-color: var(--border-color);"> <p class="text-center text-secondary text-sm">Funcionalidade de Timer (contagem regressiva) em desenvolvimento.</p>`; showModal(title, content, '', 'timer-modal'); document.getElementById('start-timer-button')?.addEventListener('click', startStopwatch); document.getElementById('pause-timer-button')?.addEventListener('click', pauseStopwatch); document.getElementById('reset-timer-button')?.addEventListener('click', resetStopwatch); modal.addEventListener('click', (e) => { if (e.target === modal || e.target.closest('.close-button')) { pauseStopwatch(); } }); };
    const openGroupGeneratorModal = () => {
        const title = "Gerador de Grupos";
        
        const schools = [...new Set(appData.classes.map(c => findSchoolById(c.schoolId)?.name).filter(Boolean))];
        const shifts = [...new Set(appData.classes.map(c => c.shift).filter(Boolean))];
        
        let scopeHtml = `
            <div style="margin-bottom: 15px;">
                <label for="group-scope" style="display: block; margin-bottom: 5px;">Escopo do Gerador:</label>
                <select id="group-scope" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--border-color);">
                    <option value="current_class">Turma Atual ${currentClassId ? `(${findClassById(currentClassId)?.name})` : '(Nenhuma selecionada)'}</option>
                    <option value="all_classes">Todas as Turmas</option>
                    ${schools.length > 0 ? `<optgroup label="Por Escola">${schools.map(s => `<option value="school_${s}">${s}</option>`).join('')}</optgroup>` : ''}
                    ${shifts.length > 0 ? `<optgroup label="Por Turno">${shifts.map(s => `<option value="shift_${s}">${s}</option>`).join('')}</optgroup>` : ''}
                </select>
            </div>
        `;

        let content = `
            ${scopeHtml}
            <div id="group-main-content"></div>
        `;
        
        let footer = `<button type="button" id="generate-groups-button" class="success"><span class="icon icon-grupos"></span> Gerar Grupos</button>`;
        
        showModal(title, content, footer, 'group-generator-modal');
        
        const scopeSelect = document.getElementById('group-scope');
        const mainContent = document.getElementById('group-main-content');
        let currentTargetStudents = [];
        
        const renderGroupContent = () => {
            const scope = scopeSelect.value;
            let targetStudents = [];
            let scopeLabel = '';
            
            if (scope === 'current_class') {
                if (currentClassId) {
                    targetStudents = getStudentsByClass(currentClassId);
                    scopeLabel = `Turma: ${findClassById(currentClassId).name}`;
                }
            } else if (scope === 'all_classes') {
                targetStudents = appData.students;
                scopeLabel = 'Todas as Turmas';
            } else if (scope.startsWith('school_')) {
                const school = scope.replace('school_', '');
                const schoolClasses = appData.classes.filter(c => findSchoolById(c.schoolId)?.name === school).map(c => c.id);
                targetStudents = appData.students.filter(s => schoolClasses.includes(s.classId));
                scopeLabel = `Escola: ${school}`;
            } else if (scope.startsWith('shift_')) {
                const shift = scope.replace('shift_', '');
                const shiftClasses = appData.classes.filter(c => c.shift === shift).map(c => c.id);
                targetStudents = appData.students.filter(s => shiftClasses.includes(s.classId));
                scopeLabel = `Turno: ${shift}`;
            }
            
            currentTargetStudents = targetStudents;
            const generateButton = document.getElementById('generate-groups-button');
            
            if (targetStudents.length === 0) {
                mainContent.innerHTML = `<p>Não há alunos cadastrados neste escopo.</p>`;
                if(generateButton) generateButton.disabled = true;
                return;
            }
            
            mainContent.innerHTML = `
                <p class="mb-1 text-sm text-secondary">${scopeLabel} (${targetStudents.length} alunos)</p>
                <div class="group-options">
                    <div class="radio-group">
                        <input type="radio" id="group-by-number" name="group-method" value="number" checked>
                        <label for="group-by-number">Dividir em:</label>
                        <input type="number" id="group-number-input" value="2" min="2">
                        <label for="group-number-input">grupos</label>
                    </div>
                    <div class="radio-group">
                        <input type="radio" id="group-by-size" name="group-method" value="size">
                        <label for="group-by-size">Grupos de:</label>
                        <input type="number" id="group-size-input" value="2" min="1">
                        <label for="group-size-input">alunos</label>
                    </div>
                </div>
                <div id="group-results-container">
                    <p class="text-secondary text-center mt-2">Clique em "Gerar Grupos".</p>
                </div>
            `;
            
            if(generateButton) generateButton.disabled = false;
            
            const numberInput = document.getElementById('group-number-input');
            const sizeInput = document.getElementById('group-size-input');
            const numberRadio = document.getElementById('group-by-number');
            const sizeRadio = document.getElementById('group-by-size');
            const resultsContainer = document.getElementById('group-results-container');
            
            numberRadio.addEventListener('change', () => { numberInput.disabled = false; sizeInput.disabled = true; });
            sizeRadio.addEventListener('change', () => { numberInput.disabled = true; sizeInput.disabled = false; });
            numberInput.disabled = !numberRadio.checked;
            sizeInput.disabled = !sizeRadio.checked;
            
            if(generateButton) {
                const newGenBtn = generateButton.cloneNode(true);
                generateButton.parentNode.replaceChild(newGenBtn, generateButton);
                newGenBtn.addEventListener('click', () => generateGroups(currentTargetStudents, resultsContainer));
            }
        };
        
        scopeSelect.addEventListener('change', renderGroupContent);
        renderGroupContent();
    };
    const shuffleArray = (array) => { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } return array; };
    const generateGroups = (studentList, resultsContainer) => { const method = document.querySelector('input[name="group-method"]:checked').value; const numberInput = document.getElementById('group-number-input'); const sizeInput = document.getElementById('group-size-input'); const shuffledStudents = shuffleArray([...studentList]); let groups = []; resultsContainer.innerHTML = ''; try { if (method === 'number') { const numGroups = parseInt(numberInput.value); if (isNaN(numGroups) || numGroups < 2 || numGroups > shuffledStudents.length) { customAlert("Número de grupos inválido. Deve ser entre 2 e o número de alunos."); return; } for (let i = 0; i < numGroups; i++) groups.push([]); let currentGroupIndex = 0; shuffledStudents.forEach(student => { groups[currentGroupIndex].push(student); currentGroupIndex = (currentGroupIndex + 1) % numGroups; }); } else { const groupSize = parseInt(sizeInput.value); if (isNaN(groupSize) || groupSize < 1) { customAlert("Tamanho do grupo inválido. Deve ser pelo menos 1."); return; } for (let i = 0; i < shuffledStudents.length; i += groupSize) { groups.push(shuffledStudents.slice(i, i + groupSize)); } } if (groups.length > 0) { groups.forEach((group, index) => { const groupDiv = document.createElement('div'); groupDiv.classList.add('generated-group'); const groupTitle = document.createElement('h5'); groupTitle.textContent = `Grupo ${index + 1}`; groupDiv.appendChild(groupTitle); const ul = document.createElement('ul'); group.forEach(student => { const li = document.createElement('li'); li.innerHTML = `<span class="student-number">${student.number || '-.'}</span> ${sanitizeHTML(student.name)}`; ul.appendChild(li); }); groupDiv.appendChild(ul); resultsContainer.appendChild(groupDiv); }); } else { resultsContainer.innerHTML = '<p class="text-secondary text-center mt-2">Não foi possível gerar grupos com essas opções.</p>'; } } catch (error) { console.error("Erro ao gerar grupos:", error); resultsContainer.innerHTML = '<p class="text-danger text-center mt-2">Ocorreu um erro ao gerar os grupos.</p>'; } };
    const updateCalculatorDisplay = () => { if(calculatorDisplay) { calculatorDisplay.textContent = calculator.displayValue.replace('.', ','); } };
    const resetCalculator = () => { calculator.displayValue = '0'; calculator.firstOperand = null; calculator.waitingForSecondOperand = false; calculator.operator = null; calculator.weightedPairs = []; if(weightedAverageResult) weightedAverageResult.textContent = '--'; renderWeightedPairsList(); updateCalculatorDisplay(); console.log('Calculator reset'); };
    const inputDigit = (digit) => { const { displayValue, waitingForSecondOperand } = calculator; if (waitingForSecondOperand) { calculator.displayValue = digit; calculator.waitingForSecondOperand = false; } else { calculator.displayValue = displayValue === '0' ? digit : displayValue + digit; } updateCalculatorDisplay(); };
    const inputDecimal = () => { if (calculator.waitingForSecondOperand) { calculator.displayValue = '0.'; calculator.waitingForSecondOperand = false; updateCalculatorDisplay(); return; } if (!calculator.displayValue.includes('.')) { calculator.displayValue += '.'; } updateCalculatorDisplay(); };
    const handleOperator = (nextOperator) => { const { firstOperand, displayValue, operator } = calculator; const inputValue = parseFloat(displayValue.replace(',', '.')); if (operator && calculator.waitingForSecondOperand) { calculator.operator = nextOperator; console.log('Operator changed to', nextOperator); return; } if (firstOperand === null && !isNaN(inputValue)) { calculator.firstOperand = inputValue; } else if (operator) { const result = performCalculation[operator](firstOperand, inputValue); const resultString = Number.isFinite(result) ? String(result) : 'Erro'; calculator.displayValue = resultString; calculator.firstOperand = result; updateCalculatorDisplay(); } calculator.waitingForSecondOperand = true; calculator.operator = nextOperator; console.log('State after operator:', JSON.parse(JSON.stringify(calculator))); };
    const performCalculation = { 'divide': (first, second) => second === 0 ? NaN : first / second, 'multiply': (first, second) => first * second, 'add': (first, second) => first + second, 'subtract': (first, second) => first - second, '=': (first, second) => second, };
    const clearAll = () => { resetCalculator(); };
    const clearEntry = () => { if (calculator.waitingForSecondOperand) { resetCalculator(); } else { calculator.displayValue = '0'; } updateCalculatorDisplay(); };
    const backspace = () => { if (calculator.waitingForSecondOperand) return; calculator.displayValue = calculator.displayValue.slice(0, -1); if (calculator.displayValue === '' || calculator.displayValue === '-') { calculator.displayValue = '0'; } updateCalculatorDisplay(); };
    const handleCalculatorButtonClick = (event) => { const { target } = event; if (!target.matches('button')) return; const action = target.dataset.action; const value = target.dataset.value; const operator = target.dataset.operator; console.log(`Button Click: action=${action}, value=${value}, operator=${operator}`); if (value !== undefined) { inputDigit(value); } else if (operator !== undefined) { handleOperator(operator); } else if (action === 'decimal') { inputDecimal(); } else if (action === 'clearAll') { clearAll(); } else if (action === 'clearEntry') { clearEntry(); } else if (action === 'backspace') { backspace(); } else if (action === 'calculate') { if (calculator.operator && calculator.firstOperand !== null) { handleOperator(calculator.operator); calculator.operator = null; calculator.waitingForSecondOperand = false; } } };
    const addWeightedPair = () => { const gradeStr = weightedGradeInput.value.trim().replace(',', '.'); const weightStr = weightedWeightInput.value.trim().replace(',', '.'); const grade = parseFloat(gradeStr); const weight = parseFloat(weightStr); if (isNaN(grade)) { customAlert("Por favor, insira uma nota válida."); weightedGradeInput.focus(); return; } if (isNaN(weight) || weight <= 0) { customAlert("Por favor, insira um peso válido (maior que zero)."); weightedWeightInput.focus(); return; } calculator.weightedPairs.push({ grade, weight }); renderWeightedPairsList(); weightedGradeInput.value = ''; weightedWeightInput.value = ''; weightedGradeInput.focus(); weightedAverageResult.textContent = '--'; };
    const renderWeightedPairsList = () => { if (!weightedPairsList) return; weightedPairsList.innerHTML = ''; if (calculator.weightedPairs.length === 0) { weightedPairsList.innerHTML = '<p>Nenhum par adicionado.</p>'; if (calculateWeightedAvgButton) calculateWeightedAvgButton.disabled = true; return; } if (calculateWeightedAvgButton) calculateWeightedAvgButton.disabled = false; const template = document.getElementById('weighted-pair-item-template'); calculator.weightedPairs.forEach((pair, index) => { const clone = template.content.cloneNode(true); const li = clone.querySelector('.pair-item'); li.dataset.index = index; const textSpan = li.querySelector('span'); textSpan.querySelector('strong:nth-child(1)').textContent = String(pair.grade).replace('.', ','); textSpan.querySelector('strong:nth-child(2)').textContent = String(pair.weight).replace('.', ','); const deleteButton = li.querySelector('.delete-pair-button'); deleteButton.addEventListener('click', () => removeWeightedPair(index)); weightedPairsList.appendChild(clone); }); };
    const removeWeightedPair = (index) => { if (index >= 0 && index < calculator.weightedPairs.length) { calculator.weightedPairs.splice(index, 1); renderWeightedPairsList(); if(weightedAverageResult) weightedAverageResult.textContent = '--'; } };
    const calculateWeightedAverage = () => { if (!weightedAverageResult) return; if (calculator.weightedPairs.length === 0) { weightedAverageResult.textContent = '--'; return; } let totalWeightedSum = 0; let totalWeight = 0; calculator.weightedPairs.forEach(pair => { totalWeightedSum += pair.grade * pair.weight; totalWeight += pair.weight; }); if (totalWeight === 0) { weightedAverageResult.textContent = 'Erro (Peso 0)'; return; } const average = totalWeightedSum / totalWeight; weightedAverageResult.textContent = `Média: ${average.toFixed(2).replace('.', ',')}`; };
    const switchCalculatorMode = (mode) => { calculator.mode = mode; resetCalculator(); if (mode === 'standard') { standardCalcSection?.classList.remove('hidden'); weightedCalcSection?.classList.add('hidden'); calcModeStandardBtn?.classList.add('active'); calcModeWeightedBtn?.classList.remove('active'); } else { standardCalcSection?.classList.add('hidden'); weightedCalcSection?.classList.remove('hidden'); calcModeStandardBtn?.classList.remove('active'); calcModeWeightedBtn?.classList.add('active'); } };
    const openAdvancedCalculatorModal = () => { resetCalculator(); switchCalculatorMode('standard'); calculatorModal?.classList.add('show'); const currentCalcButtonsContainer = document.querySelector('#calculator-standard-section .calculator-buttons'); currentCalcButtonsContainer?.removeEventListener('click', handleCalculatorButtonClick); currentCalcButtonsContainer?.addEventListener('click', handleCalculatorButtonClick); if(calcModeStandardBtn) calcModeStandardBtn.onclick = () => switchCalculatorMode('standard'); if(calcModeWeightedBtn) calcModeWeightedBtn.onclick = () => switchCalculatorMode('weighted'); if(addPairButton) addPairButton.onclick = addWeightedPair; if(calculateWeightedAvgButton) calculateWeightedAvgButton.onclick = calculateWeightedAverage; calculatorModal?.querySelectorAll('[data-dismiss="modal"]').forEach(btn => { const newBtn = btn.cloneNode(true); btn.parentNode.replaceChild(newBtn, btn); newBtn.addEventListener('click', hideModal); }); calculatorModal?.addEventListener('click', (e) => { if (e.target === calculatorModal) { hideModal(); } }, { once: false }); };
    const openNotepadModal = () => {
        const title = "Bloco de Notas";
        let notes = JSON.parse(localStorage.getItem('spp_notepad_notes') || '[]');
        
        const renderNotes = () => {
            let html = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="margin: 0;">Minhas Anotações</h3>
                    <button type="button" id="add-note-btn" class="success"><span class="icon icon-adicionar"></span> Nova Anotação</button>
                </div>
                <div id="notes-list" style="display: flex; flex-direction: column; gap: 10px; max-height: 400px; overflow-y: auto;">
            `;
            
            if (notes.length === 0) {
                html += `<p class="text-secondary text-center">Nenhuma anotação. Clique em "Nova Anotação" para começar.</p>`;
            } else {
                notes.forEach((note, index) => {
                    html += `
                        <div class="card" style="padding: 10px; position: relative;">
                            <input type="text" class="note-title-input" data-index="${index}" value="${sanitizeHTML(note.title)}" placeholder="Título da anotação" style="font-weight: bold; border: none; background: transparent; width: calc(100% - 30px); margin-bottom: 5px; font-size: 1.1em;">
                            <textarea class="note-content-input" data-index="${index}" style="width: 100%; height: 80px; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; resize: vertical; font-family: inherit;" placeholder="Conteúdo...">${sanitizeHTML(note.content)}</textarea>
                            <button type="button" class="icon-button delete-note-btn" data-index="${index}" style="position: absolute; top: 5px; right: 5px; color: var(--accent-danger);"><span class="icon icon-excluir"></span></button>
                        </div>
                    `;
                });
            }
            html += `</div>`;
            return html;
        };

        const content = `<div id="notepad-container">${renderNotes()}</div>`;
        showModal(title, content, '', 'notepad-modal');
        
        const attachEvents = () => {
            document.getElementById('add-note-btn')?.addEventListener('click', () => {
                notes.unshift({ title: '', content: '' });
                saveAndRender();
            });
            
            document.querySelectorAll('.delete-note-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    if (await customConfirm('Excluir esta anotação?')) {
                        const index = e.currentTarget.dataset.index;
                        notes.splice(index, 1);
                        saveAndRender();
                    }
                });
            });
            
            document.querySelectorAll('.note-title-input, .note-content-input').forEach(input => {
                input.addEventListener('input', (e) => {
                    const index = e.target.dataset.index;
                    const isTitle = e.target.classList.contains('note-title-input');
                    if (isTitle) {
                        notes[index].title = e.target.value;
                    } else {
                        notes[index].content = e.target.value;
                    }
                    localStorage.setItem('spp_notepad_notes', JSON.stringify(notes));
                });
            });
        };
        
        const saveAndRender = () => {
            localStorage.setItem('spp_notepad_notes', JSON.stringify(notes));
            document.getElementById('notepad-container').innerHTML = renderNotes();
            attachEvents();
        };
        
        attachEvents();
    };

    const openCalendarNotesModal = () => {
        const title = "Calendário de Anotações";
        let currentDate = new Date();
        
        const renderCalendar = (date) => {
            const year = date.getFullYear();
            const month = date.getMonth();
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
            
            let html = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <button type="button" id="cal-prev-month" class="secondary" style="padding: 5px 10px;">&lt;</button>
                    <h3 style="margin: 0;">${monthNames[month]} ${year}</h3>
                    <button type="button" id="cal-next-month" class="secondary" style="padding: 5px 10px;">&gt;</button>
                </div>
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; text-align: center; font-weight: bold; margin-bottom: 5px;">
                    <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px;">
            `;
            
            for (let i = 0; i < firstDay; i++) {
                html += `<div></div>`;
            }
            
            const savedNotes = JSON.parse(localStorage.getItem('spp_calendar_notes_v2') || '{}');
            
            for (let i = 1; i <= daysInMonth; i++) {
                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                const dayNotes = savedNotes[dateKey] || [];
                const hasNote = dayNotes.length > 0 ? `<div style="width: 6px; height: 6px; background-color: var(--accent-primary); border-radius: 50%; margin: 2px auto 0;"></div>` : '';
                const isToday = new Date().toDateString() === new Date(year, month, i).toDateString() ? 'background-color: var(--bg-tertiary); border-color: var(--accent-primary);' : '';
                
                html += `
                    <div class="cal-day" data-date="${dateKey}" style="border: 1px solid var(--border-color); border-radius: 4px; padding: 10px 5px; text-align: center; cursor: pointer; ${isToday}">
                        ${i}
                        ${hasNote}
                    </div>
                `;
            }
            
            html += `</div>
                <div id="cal-note-area" style="margin-top: 20px; display: none;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h4 id="cal-note-date-title" style="margin: 0;"></h4>
                        <button type="button" id="cal-add-note-btn" class="success" style="padding: 4px 8px; font-size: 0.9em;"><span class="icon icon-adicionar"></span> Adicionar</button>
                    </div>
                    <div id="cal-notes-list" style="display: flex; flex-direction: column; gap: 10px; max-height: 250px; overflow-y: auto;">
                    </div>
                </div>
            `;
            
            return html;
        };

        const content = `<div id="calendar-container">${renderCalendar(currentDate)}</div>`;
        showModal(title, content, '', 'calendar-modal');
        
        let selectedDateKey = null;

        const renderDayNotes = (dateKey) => {
            const savedNotes = JSON.parse(localStorage.getItem('spp_calendar_notes_v2') || '{}');
            const dayNotes = savedNotes[dateKey] || [];
            const listContainer = document.getElementById('cal-notes-list');
            
            if (dayNotes.length === 0) {
                listContainer.innerHTML = '<p class="text-secondary text-center text-sm">Nenhuma anotação. Clique em Adicionar.</p>';
            } else {
                let html = '';
                dayNotes.forEach((note, index) => {
                    html += `
                        <div style="position: relative; border: 1px solid var(--border-color); border-radius: 6px; padding: 8px;">
                            <textarea class="cal-note-input" data-index="${index}" style="width: 100%; height: 60px; padding: 5px; border: none; resize: vertical; font-family: inherit; background: transparent;" placeholder="Sua anotação...">${sanitizeHTML(note)}</textarea>
                            <button type="button" class="icon-button delete-cal-note-btn" data-index="${index}" style="position: absolute; top: 2px; right: 2px; color: var(--accent-danger); padding: 2px;"><span class="icon icon-excluir" style="font-size: 1em;"></span></button>
                        </div>
                    `;
                });
                listContainer.innerHTML = html;
                
                document.querySelectorAll('.cal-note-input').forEach(input => {
                    input.addEventListener('input', (e) => {
                        const idx = e.target.dataset.index;
                        const notes = JSON.parse(localStorage.getItem('spp_calendar_notes_v2') || '{}');
                        if (!notes[dateKey]) notes[dateKey] = [];
                        notes[dateKey][idx] = e.target.value;
                        localStorage.setItem('spp_calendar_notes_v2', JSON.stringify(notes));
                    });
                });
                
                document.querySelectorAll('.delete-cal-note-btn').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        if (await customConfirm('Excluir esta anotação?')) {
                            const idx = e.currentTarget.dataset.index;
                            const notes = JSON.parse(localStorage.getItem('spp_calendar_notes_v2') || '{}');
                            notes[dateKey].splice(idx, 1);
                            if (notes[dateKey].length === 0) delete notes[dateKey];
                            localStorage.setItem('spp_calendar_notes_v2', JSON.stringify(notes));
                            
                            // Re-render calendar to update dots
                            const scrollPos = document.getElementById('cal-notes-list').scrollTop;
                            document.getElementById('calendar-container').innerHTML = renderCalendar(currentDate);
                            attachCalendarEvents();
                            selectDay(dateKey);
                            document.getElementById('cal-notes-list').scrollTop = scrollPos;
                        }
                    });
                });
            }
        };

        const selectDay = (dateKey) => {
            selectedDateKey = dateKey;
            document.querySelectorAll('.cal-day').forEach(el => el.style.boxShadow = 'none');
            const dayEl = document.querySelector(`.cal-day[data-date="${dateKey}"]`);
            if (dayEl) dayEl.style.boxShadow = '0 0 0 2px var(--accent-primary)';
            
            const noteArea = document.getElementById('cal-note-area');
            const noteTitle = document.getElementById('cal-note-date-title');
            
            const [y, m, d] = dateKey.split('-');
            noteTitle.textContent = `${d}/${m}/${y}`;
            noteArea.style.display = 'block';
            
            renderDayNotes(dateKey);
        };

        const attachCalendarEvents = () => {
            document.getElementById('cal-prev-month')?.addEventListener('click', () => {
                currentDate.setMonth(currentDate.getMonth() - 1);
                document.getElementById('calendar-container').innerHTML = renderCalendar(currentDate);
                attachCalendarEvents();
                if (selectedDateKey) selectDay(selectedDateKey);
            });
            
            document.getElementById('cal-next-month')?.addEventListener('click', () => {
                currentDate.setMonth(currentDate.getMonth() + 1);
                document.getElementById('calendar-container').innerHTML = renderCalendar(currentDate);
                attachCalendarEvents();
                if (selectedDateKey) selectDay(selectedDateKey);
            });
            
            document.querySelectorAll('.cal-day').forEach(dayEl => {
                dayEl.addEventListener('click', (e) => {
                    selectDay(e.currentTarget.dataset.date);
                });
            });
            
            document.getElementById('cal-add-note-btn')?.addEventListener('click', () => {
                if (!selectedDateKey) return;
                const notes = JSON.parse(localStorage.getItem('spp_calendar_notes_v2') || '{}');
                if (!notes[selectedDateKey]) notes[selectedDateKey] = [];
                notes[selectedDateKey].push('');
                localStorage.setItem('spp_calendar_notes_v2', JSON.stringify(notes));
                
                document.getElementById('calendar-container').innerHTML = renderCalendar(currentDate);
                attachCalendarEvents();
                selectDay(selectedDateKey);
            });
        };
        
        attachCalendarEvents();
    };

    const openAudioRecorderModal = () => {
        const title = "Gravador de Áudio";
        const content = `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 20px 0;">
                <div id="audio-status" style="font-size: 1.2rem; font-weight: bold; color: var(--text-secondary);">Pronto para gravar</div>
                <div id="audio-timer" style="font-size: 2rem; font-family: monospace;">00:00</div>
                
                <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
                    <button type="button" id="start-record-btn" class="success">
                        <span class="icon icon-mic"></span> Iniciar Gravação
                    </button>
                    <button type="button" id="stop-record-btn" class="danger hidden">
                        <span class="icon icon-stop"></span> Parar Gravação
                    </button>
                </div>
                
                <div id="audio-playback-container" class="hidden" style="width: 100%; margin-top: 20px; display: flex; flex-direction: column; align-items: center; gap: 10px;">
                    <audio id="audio-playback" controls style="width: 100%;"></audio>
                    <a id="download-audio-btn" class="button secondary" download="gravacao.webm" style="text-decoration: none; display: inline-flex; align-items: center; gap: 5px;">
                        <span class="icon icon-download"></span> Baixar Gravação
                    </a>
                </div>
            </div>
        `;
        showModal(title, content, '', 'audio-recorder-modal');
        
        let mediaRecorder;
        let audioChunks = [];
        let recordInterval;
        let recordSeconds = 0;
        
        const startBtn = document.getElementById('start-record-btn');
        const stopBtn = document.getElementById('stop-record-btn');
        const statusEl = document.getElementById('audio-status');
        const timerEl = document.getElementById('audio-timer');
        const playbackContainer = document.getElementById('audio-playback-container');
        const audioPlayback = document.getElementById('audio-playback');
        const downloadBtn = document.getElementById('download-audio-btn');
        
        const formatTime = (totalSeconds) => {
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        };
        
        startBtn.addEventListener('click', async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                audioChunks = [];
                
                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        audioChunks.push(e.data);
                    }
                };
                
                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    audioPlayback.src = audioUrl;
                    downloadBtn.href = audioUrl;
                    
                    playbackContainer.classList.remove('hidden');
                    statusEl.textContent = "Gravação concluída";
                    statusEl.style.color = "var(--text-secondary)";
                    
                    // Stop all tracks to release microphone
                    stream.getTracks().forEach(track => track.stop());
                };
                
                mediaRecorder.start();
                
                startBtn.classList.add('hidden');
                stopBtn.classList.remove('hidden');
                playbackContainer.classList.add('hidden');
                
                statusEl.textContent = "Gravando...";
                statusEl.style.color = "red";
                
                recordSeconds = 0;
                timerEl.textContent = "00:00";
                recordInterval = setInterval(() => {
                    recordSeconds++;
                    timerEl.textContent = formatTime(recordSeconds);
                }, 1000);
                
            } catch (err) {
                console.error("Erro ao acessar microfone:", err);
                showNotification("Não foi possível acessar o microfone. Verifique as permissões.", "error");
            }
        });
        
        stopBtn.addEventListener('click', () => {
            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
                clearInterval(recordInterval);
                
                stopBtn.classList.add('hidden');
                startBtn.classList.remove('hidden');
            }
        });
        
        // Cleanup on modal close
        const modal = document.getElementById('generic-modal');
        const cleanup = (e) => {
            if (e.target === modal || e.target.closest('.close-button')) {
                if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                    mediaRecorder.stop();
                }
                if (recordInterval) {
                    clearInterval(recordInterval);
                }
                modal.removeEventListener('click', cleanup);
            }
        };
        modal.addEventListener('click', cleanup);
    };

    const openWhiteboardModal = () => {
        const title = "Quadro Branco Virtual";
        const content = `
            <div style="display: flex; flex-direction: column; height: 100%; gap: 10px; overflow-x: hidden; box-sizing: border-box;">
                <div style="display: flex; flex-wrap: wrap; gap: 6px; align-items: center; justify-content: center; padding: 6px; background: var(--bg-tertiary); border-radius: 8px; width: 100%; box-sizing: border-box;">
                    <input type="color" id="wb-color" value="#000000" style="width: 28px; height: 28px; border: none; cursor: pointer; padding: 0; border-radius: 4px; margin-bottom: 0; flex-shrink: 0;" title="Cor da Caneta">
                    <input type="range" id="wb-size" min="1" max="20" value="3" style="width: 60px; margin-bottom: 0; flex-shrink: 1;" title="Tamanho do Traço">
                    <button type="button" id="wb-clear" class="secondary icon-button" style="padding: 6px; margin: 0; flex-shrink: 0;" title="Limpar Tudo"><span class="icon icon-excluir icon-only"></span></button>
                    <button type="button" id="wb-eraser" class="secondary icon-button" style="padding: 6px; margin: 0; flex-shrink: 0;" title="Borracha"><span class="icon icon-block icon-only"></span></button>
                    <button type="button" id="wb-download" class="secondary icon-button" style="padding: 6px; margin: 0; flex-shrink: 0;" title="Salvar Imagem"><span class="icon icon-download icon-only"></span></button>
                </div>
                <div style="flex-grow: 1; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: white; min-height: 250px; width: 100%; box-sizing: border-box;">
                    <canvas id="wb-canvas" style="width: 100%; height: 100%; touch-action: none; display: block;"></canvas>
                </div>
            </div>
        `;
        showModal(title, content, '', 'whiteboard-modal');
        
        const canvas = document.getElementById('wb-canvas');
        const ctx = canvas.getContext('2d');
        const colorPicker = document.getElementById('wb-color');
        const sizePicker = document.getElementById('wb-size');
        const clearBtn = document.getElementById('wb-clear');
        const eraserBtn = document.getElementById('wb-eraser');
        const downloadBtn = document.getElementById('wb-download');
        
        let isDrawing = false;
        let isEraser = false;
        
        const resizeCanvas = () => {
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        };
        
        setTimeout(resizeCanvas, 100);
        window.addEventListener('resize', resizeCanvas);
        
        const startDrawing = (e) => {
            isDrawing = true;
            draw(e);
        };
        
        const stopDrawing = () => {
            isDrawing = false;
            ctx.beginPath();
        };
        
        const draw = (e) => {
            if (!isDrawing) return;
            
            const rect = canvas.getBoundingClientRect();
            const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
            const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
            
            ctx.lineWidth = sizePicker.value;
            ctx.lineCap = 'round';
            
            if (isEraser) {
                ctx.strokeStyle = 'white';
            } else {
                ctx.strokeStyle = colorPicker.value;
            }
            
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        };
        
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);
        
        canvas.addEventListener('touchstart', startDrawing);
        canvas.addEventListener('touchmove', draw);
        canvas.addEventListener('touchend', stopDrawing);
        
        clearBtn.addEventListener('click', () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        });
        
        eraserBtn.addEventListener('click', () => {
            isEraser = !isEraser;
            eraserBtn.classList.toggle('active', isEraser);
            if (isEraser) {
                eraserBtn.style.backgroundColor = 'var(--accent-primary)';
                eraserBtn.style.color = 'white';
            } else {
                eraserBtn.style.backgroundColor = '';
                eraserBtn.style.color = '';
            }
        });

        downloadBtn.addEventListener('click', () => {
            // Create a temporary canvas to draw the white background
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Fill with white background
            tempCtx.fillStyle = '#ffffff';
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            
            // Draw the original canvas over it
            tempCtx.drawImage(canvas, 0, 0);
            
            const dataURL = tempCanvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = 'quadro-branco-' + new Date().toISOString().slice(0,10) + '.png';
            link.href = dataURL;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
        
        const modal = document.getElementById('generic-modal');
        const cleanup = (e) => {
            if (e.target === modal || e.target.closest('.close-button')) {
                window.removeEventListener('resize', resizeCanvas);
                modal.removeEventListener('click', cleanup);
            }
        };
        modal.addEventListener('click', cleanup);
    };

    const openTodoListModal = () => {
        const title = "Gerenciador de Tarefas";
        let tasks = JSON.parse(localStorage.getItem('spp_todo_list') || '[]');
        
        const renderTasks = () => {
            let html = `
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <input type="text" id="todo-input" placeholder="Nova tarefa..." style="flex-grow: 1; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px;">
                    <button type="button" id="add-todo-btn" class="success"><span class="icon icon-adicionar"></span></button>
                </div>
                <div id="todo-list-container" style="display: flex; flex-direction: column; gap: 8px; max-height: 400px; overflow-y: auto;">
            `;
            
            if (tasks.length === 0) {
                html += `<p class="text-secondary text-center">Nenhuma tarefa. Adicione uma acima.</p>`;
            } else {
                tasks.forEach((task, index) => {
                    const checked = task.completed ? 'checked' : '';
                    const textStyle = task.completed ? 'text-decoration: line-through; opacity: 0.6;' : '';
                    html += `
                        <div class="card" style="display: flex; align-items: center; gap: 10px; padding: 10px;">
                            <input type="checkbox" class="todo-checkbox" data-index="${index}" ${checked} style="width: 20px; height: 20px; cursor: pointer;">
                            <span style="flex-grow: 1; ${textStyle}">${sanitizeHTML(task.text)}</span>
                            <button type="button" class="icon-button delete-todo-btn" data-index="${index}" style="color: var(--accent-danger);"><span class="icon icon-excluir"></span></button>
                        </div>
                    `;
                });
            }
            html += `</div>`;
            return html;
        };

        const content = `<div id="todo-wrapper">${renderTasks()}</div>`;
        showModal(title, content, '', 'todo-modal');
        
        const attachEvents = () => {
            const input = document.getElementById('todo-input');
            const addBtn = document.getElementById('add-todo-btn');
            
            const addTask = () => {
                const text = input.value.trim();
                if (text) {
                    tasks.push({ text, completed: false });
                    saveAndRender();
                }
            };
            
            addBtn?.addEventListener('click', addTask);
            input?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') addTask();
            });
            
            document.querySelectorAll('.todo-checkbox').forEach(cb => {
                cb.addEventListener('change', (e) => {
                    const index = e.target.dataset.index;
                    tasks[index].completed = e.target.checked;
                    saveAndRender();
                });
            });
            
            document.querySelectorAll('.delete-todo-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = e.currentTarget.dataset.index;
                    tasks.splice(index, 1);
                    saveAndRender();
                });
            });
        };
        
        const saveAndRender = () => {
            localStorage.setItem('spp_todo_list', JSON.stringify(tasks));
            document.getElementById('todo-wrapper').innerHTML = renderTasks();
            attachEvents();
        };
        
        attachEvents();
    };

    const openTopicSorterModal = () => {
        const title = "Sorteador de Temas";
        let topics = JSON.parse(localStorage.getItem('spp_topic_sorter') || '[]');
        
        const renderContent = () => {
            let html = `
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <div>
                        <label style="font-weight: bold; display: block; margin-bottom: 5px;">Adicionar Tema/Pergunta:</label>
                        <div style="display: flex; gap: 10px;">
                            <input type="text" id="topic-input" placeholder="Digite aqui..." style="flex-grow: 1; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px;">
                            <button type="button" id="add-topic-btn" class="success"><span class="icon icon-adicionar"></span></button>
                        </div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: bold;">Lista (${topics.length}):</span>
                        <button type="button" id="clear-topics-btn" class="danger" style="padding: 4px 8px; font-size: 0.9em;">Limpar Tudo</button>
                    </div>
                    
                    <div id="topics-list" style="display: flex; flex-wrap: wrap; gap: 5px; max-height: 150px; overflow-y: auto; padding: 10px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-tertiary);">
            `;
            
            if (topics.length === 0) {
                html += `<span class="text-secondary">Nenhum tema adicionado.</span>`;
            } else {
                topics.forEach((topic, index) => {
                    html += `
                        <span class="badge" style="background: var(--bg-secondary); padding: 5px 10px; border-radius: 15px; display: inline-flex; align-items: center; gap: 5px;">
                            ${sanitizeHTML(topic)}
                            <span class="icon icon-excluir delete-topic-btn" data-index="${index}" style="cursor: pointer; font-size: 1em; color: var(--accent-danger);"></span>
                        </span>
                    `;
                });
            }
            
            html += `
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <button type="button" id="draw-topic-btn" class="primary" style="font-size: 1.2em; padding: 10px 20px;" ${topics.length === 0 ? 'disabled' : ''}>
                            <span class="icon icon-sorteio"></span> Sortear
                        </button>
                    </div>
                    
                    <div id="drawn-topic-result" style="margin-top: 20px; text-align: center; font-size: 1.5em; font-weight: bold; color: var(--accent-primary); min-height: 40px;">
                    </div>
                </div>
            `;
            return html;
        };

        const content = `<div id="topic-sorter-wrapper">${renderContent()}</div>`;
        showModal(title, content, '', 'topic-sorter-modal');
        
        const attachEvents = () => {
            const input = document.getElementById('topic-input');
            const addBtn = document.getElementById('add-topic-btn');
            const clearBtn = document.getElementById('clear-topics-btn');
            const drawBtn = document.getElementById('draw-topic-btn');
            const resultDiv = document.getElementById('drawn-topic-result');
            
            const addTopic = () => {
                const text = input.value.trim();
                if (text) {
                    topics.push(text);
                    saveAndRender();
                }
            };
            
            addBtn?.addEventListener('click', addTopic);
            input?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') addTopic();
            });
            
            document.querySelectorAll('.delete-topic-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = e.currentTarget.dataset.index;
                    topics.splice(index, 1);
                    saveAndRender();
                });
            });
            
            clearBtn?.addEventListener('click', async () => {
                if (await customConfirm('Limpar toda a lista?')) {
                    topics = [];
                    saveAndRender();
                }
            });
            
            drawBtn?.addEventListener('click', () => {
                if (topics.length === 0) return;
                
                let counter = 0;
                const interval = setInterval(() => {
                    resultDiv.textContent = topics[Math.floor(Math.random() * topics.length)];
                    counter++;
                    if (counter > 10) {
                        clearInterval(interval);
                        const finalIndex = Math.floor(Math.random() * topics.length);
                        resultDiv.textContent = topics[finalIndex];
                        resultDiv.style.transform = 'scale(1.1)';
                        setTimeout(() => resultDiv.style.transform = 'scale(1)', 200);
                    }
                }, 50);
            });
        };
        
        const saveAndRender = () => {
            localStorage.setItem('spp_topic_sorter', JSON.stringify(topics));
            document.getElementById('topic-sorter-wrapper').innerHTML = renderContent();
            attachEvents();
        };
        
        attachEvents();
    };

    const openGradeConverterModal = () => {
        const title = "Conversor de Notas";
        
        let customCriteria = JSON.parse(localStorage.getItem('spp_grade_criteria')) || [
            { label: 'A', min: 90 },
            { label: 'B', min: 80 },
            { label: 'C', min: 70 },
            { label: 'D', min: 60 },
            { label: 'F', min: 0 }
        ];

        const renderCriteriaSettings = () => {
            return customCriteria.map((c, index) => `
                <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 5px;">
                    <input type="text" class="crit-label" value="${c.label}" style="width: 60px; padding: 4px; border: 1px solid var(--border-color); border-radius: 4px;">
                    <span>>=</span>
                    <input type="number" class="crit-min" value="${c.min}" style="width: 80px; padding: 4px; border: 1px solid var(--border-color); border-radius: 4px;">
                    <span>%</span>
                    ${index < customCriteria.length - 1 ? `<button type="button" class="secondary remove-crit" data-index="${index}" style="padding: 2px 6px; font-size: 0.8em;"><span class="icon icon-excluir"></span></button>` : ''}
                </div>
            `).join('');
        };

        const content = `
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <div class="card" style="padding: 15px;">
                    <h4 style="margin-top: 0;">Converter Pontos para Porcentagem</h4>
                    <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                        <input type="number" id="gc-points" placeholder="Pontos obtidos" style="width: 120px; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px;">
                        <span>de</span>
                        <input type="number" id="gc-max" placeholder="Total" style="width: 120px; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px;">
                        <button type="button" id="gc-calc-pct" class="primary">Calcular</button>
                    </div>
                    <div id="gc-pct-result" style="margin-top: 10px; font-size: 1.2em; font-weight: bold;"></div>
                </div>
                
                <div class="card" style="padding: 15px;">
                    <h4 style="margin-top: 0; display: flex; justify-content: space-between; align-items: center;">
                        Converter Porcentagem para Conceito
                        <button type="button" id="gc-toggle-settings" class="secondary" style="font-size: 0.8em; padding: 4px 8px;"><span class="icon icon-config"></span> Configurar Critérios</button>
                    </h4>
                    
                    <div id="gc-settings-panel" style="display: none; margin-bottom: 15px; padding: 10px; background: var(--bg-tertiary); border-radius: 8px;">
                        <h5>Critérios de Conversão</h5>
                        <div id="gc-criteria-list">
                            ${renderCriteriaSettings()}
                        </div>
                        <div style="display: flex; gap: 10px; margin-top: 10px;">
                            <button type="button" id="gc-add-crit" class="secondary" style="font-size: 0.8em;"><span class="icon icon-add"></span> Adicionar</button>
                            <button type="button" id="gc-save-crit" class="primary" style="font-size: 0.8em;">Salvar Critérios</button>
                        </div>
                    </div>

                    <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                        <input type="number" id="gc-pct-input" placeholder="Porcentagem (%)" style="width: 150px; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px;">
                        <button type="button" id="gc-calc-concept" class="primary">Converter</button>
                    </div>
                    <div id="gc-concept-result" style="margin-top: 10px; font-size: 1.2em; font-weight: bold;"></div>
                </div>
            </div>
        `;
        showModal(title, content, '', 'grade-converter-modal');
        
        const updateCriteriaListUI = () => {
            document.getElementById('gc-criteria-list').innerHTML = renderCriteriaSettings();
            attachCriteriaListeners();
        };

        const attachCriteriaListeners = () => {
            document.querySelectorAll('.remove-crit').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.currentTarget.dataset.index);
                    customCriteria.splice(index, 1);
                    updateCriteriaListUI();
                });
            });
        };

        document.getElementById('gc-toggle-settings').addEventListener('click', () => {
            const panel = document.getElementById('gc-settings-panel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            attachCriteriaListeners();
        });

        document.getElementById('gc-add-crit').addEventListener('click', () => {
            // Insert before the last one (which is usually the minimum/F)
            customCriteria.splice(customCriteria.length - 1, 0, { label: 'Novo', min: 50 });
            updateCriteriaListUI();
        });

        document.getElementById('gc-save-crit').addEventListener('click', () => {
            const labels = document.querySelectorAll('.crit-label');
            const mins = document.querySelectorAll('.crit-min');
            
            let newCriteria = [];
            for(let i=0; i<labels.length; i++) {
                newCriteria.push({
                    label: labels[i].value,
                    min: parseFloat(mins[i].value) || 0
                });
            }
            
            // Sort descending by min
            newCriteria.sort((a, b) => b.min - a.min);
            customCriteria = newCriteria;
            localStorage.setItem('spp_grade_criteria', JSON.stringify(customCriteria));
            
            updateCriteriaListUI();
            document.getElementById('gc-settings-panel').style.display = 'none';
            showToast("Critérios salvos com sucesso!");
        });
        
        document.getElementById('gc-calc-pct').addEventListener('click', () => {
            const points = parseFloat(document.getElementById('gc-points').value);
            const max = parseFloat(document.getElementById('gc-max').value);
            const resDiv = document.getElementById('gc-pct-result');
            
            if (isNaN(points) || isNaN(max) || max === 0) {
                resDiv.textContent = "Valores inválidos.";
                resDiv.style.color = "var(--accent-danger)";
                return;
            }
            
            const pct = (points / max) * 100;
            resDiv.textContent = `Resultado: ${pct.toFixed(1)}%`;
            resDiv.style.color = "var(--text-primary)";
        });
        
        document.getElementById('gc-calc-concept').addEventListener('click', () => {
            const pct = parseFloat(document.getElementById('gc-pct-input').value);
            const resDiv = document.getElementById('gc-concept-result');
            
            if (isNaN(pct)) {
                resDiv.textContent = "Valor inválido.";
                resDiv.style.color = "var(--accent-danger)";
                return;
            }
            
            let concept = customCriteria[customCriteria.length - 1].label; // Default to lowest
            let isLowest = true;
            
            for (let i = 0; i < customCriteria.length; i++) {
                if (pct >= customCriteria[i].min) {
                    concept = customCriteria[i].label;
                    isLowest = (i === customCriteria.length - 1);
                    break;
                }
            }
            
            resDiv.textContent = `Conceito: ${concept}`;
            resDiv.style.color = isLowest ? "var(--accent-danger)" : "var(--accent-success)";
        });
    };

    const openUnitConverterModal = () => {
        const title = "Conversor de Medidas";
        const content = `
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div class="form-group">
                    <label for="uc-category">Categoria:</label>
                    <select id="uc-category" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--border-color);">
                        <option value="length">Comprimento</option>
                        <option value="mass">Massa</option>
                        <option value="temperature">Temperatura</option>
                        <option value="volume">Volume</option>
                    </select>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <div style="flex: 1;">
                        <input type="number" id="uc-input-value" value="1" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--border-color);">
                    </div>
                    <div style="flex: 1;">
                        <select id="uc-input-unit" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--border-color);"></select>
                    </div>
                </div>
                <div style="text-align: center; font-size: 1.5rem; color: var(--text-secondary);">=</div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <div style="flex: 1;">
                        <input type="text" id="uc-output-value" readonly style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-tertiary);">
                    </div>
                    <div style="flex: 1;">
                        <select id="uc-output-unit" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--border-color);"></select>
                    </div>
                </div>
            </div>
        `;
        showModal(title, content, '', 'unit-converter-modal');

        const units = {
            length: { m: 'Metros', km: 'Quilômetros', cm: 'Centímetros', mm: 'Milímetros', in: 'Polegadas', ft: 'Pés', mi: 'Milhas' },
            mass: { kg: 'Quilogramas', g: 'Gramas', mg: 'Miligramas', lb: 'Libras', oz: 'Onças' },
            temperature: { c: 'Celsius', f: 'Fahrenheit', k: 'Kelvin' },
            volume: { l: 'Litros', ml: 'Mililitros', gal: 'Galões (EUA)', qt: 'Quartos (EUA)' }
        };

        const conversions = {
            length: {
                m: 1, km: 1000, cm: 0.01, mm: 0.001, in: 0.0254, ft: 0.3048, mi: 1609.34
            },
            mass: {
                kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495
            },
            volume: {
                l: 1, ml: 0.001, gal: 3.78541, qt: 0.946353
            }
        };

        const categorySelect = document.getElementById('uc-category');
        const inputUnitSelect = document.getElementById('uc-input-unit');
        const outputUnitSelect = document.getElementById('uc-output-unit');
        const inputValue = document.getElementById('uc-input-value');
        const outputValue = document.getElementById('uc-output-value');

        const updateUnits = () => {
            const cat = categorySelect.value;
            const catUnits = units[cat];
            let options = '';
            for (const [val, label] of Object.entries(catUnits)) {
                options += `<option value="${val}">${label}</option>`;
            }
            inputUnitSelect.innerHTML = options;
            outputUnitSelect.innerHTML = options;
            if (Object.keys(catUnits).length > 1) {
                outputUnitSelect.selectedIndex = 1;
            }
            calculate();
        };

        const calculate = () => {
            const cat = categorySelect.value;
            const inUnit = inputUnitSelect.value;
            const outUnit = outputUnitSelect.value;
            const val = parseFloat(inputValue.value);

            if (isNaN(val)) {
                outputValue.value = '';
                return;
            }

            let result = 0;
            if (cat === 'temperature') {
                let c = 0;
                if (inUnit === 'c') c = val;
                else if (inUnit === 'f') c = (val - 32) * 5/9;
                else if (inUnit === 'k') c = val - 273.15;

                if (outUnit === 'c') result = c;
                else if (outUnit === 'f') result = (c * 9/5) + 32;
                else if (outUnit === 'k') result = c + 273.15;
            } else {
                const inFactor = conversions[cat][inUnit];
                const outFactor = conversions[cat][outUnit];
                const baseVal = val * inFactor;
                result = baseVal / outFactor;
            }

            // format to avoid long decimals
            outputValue.value = Number.isInteger(result) ? result : parseFloat(result.toFixed(6));
        };

        categorySelect.addEventListener('change', updateUnits);
        inputUnitSelect.addEventListener('change', calculate);
        outputUnitSelect.addEventListener('change', calculate);
        inputValue.addEventListener('input', calculate);

        updateUnits();
    };

    const openPeriodicTableModal = () => {
        const title = "Tabela Periódica Interativa";
        
        let gridHtml = '<div class="periodic-table-grid">';
        
        // Add placeholders for Lanthanides and Actinides
        gridHtml += `<div class="pt-element pt-cat-8" style="grid-column: 3; grid-row: 6; font-size: 0.6rem; text-align: center;">57-71<br>La-Lu</div>`;
        gridHtml += `<div class="pt-element pt-cat-9" style="grid-column: 3; grid-row: 7; font-size: 0.6rem; text-align: center;">89-103<br>Ac-Lr</div>`;

        window.ptElements.forEach(el => {
            const [num, sym, name, mass, group, period, cat] = el;
            let col = group;
            let row = period;
            
            if (cat === 8) { // Lanthanide
                row = 9;
                col = num - 57 + 3;
            } else if (cat === 9) { // Actinide
                row = 10;
                col = num - 89 + 3;
            }
            
            gridHtml += `<div class="pt-element pt-cat-${cat}" style="grid-column: ${col}; grid-row: ${row};" onclick="window.showElementInfo(${num})">
                <span class="pt-num">${num}</span>
                <span class="pt-sym">${sym}</span>
                <span class="pt-mass">${mass}</span>
            </div>`;
        });

        gridHtml += '</div>';

        let legendHtml = `
        <div style="margin-top: 15px; text-align: center;">
            <button type="button" class="button secondary" onclick="document.getElementById('pt-legend-container').classList.toggle('hidden')">
                <span class="icon icon-filtro"></span> Filtros
            </button>
        </div>
        <div id="pt-legend-container" class="pt-legend hidden">`;
        window.ptCategories.forEach((catName, index) => {
            legendHtml += `
            <label class="pt-legend-item">
                <input type="checkbox" class="pt-legend-checkbox" value="${index}" checked onchange="window.filterPeriodicTable()">
                <div class="pt-legend-color pt-cat-${index}"></div>
                <span>${catName}</span>
            </label>`;
        });
        legendHtml += '</div>';

        const detailsHtml = `
            <div id="pt-details" style="margin-top: 20px; padding: 15px; border-radius: 8px; background: var(--bg-secondary); display: none; text-align: left; border: 1px solid var(--border-color);">
                <h3 id="pt-detail-name" style="margin-top: 0; color: var(--accent-primary);"></h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <p><strong>Símbolo:</strong> <span id="pt-detail-sym"></span></p>
                    <p><strong>Número Atômico:</strong> <span id="pt-detail-num"></span></p>
                    <p><strong>Massa Atômica:</strong> <span id="pt-detail-mass"></span></p>
                    <p><strong>Categoria:</strong> <span id="pt-detail-cat"></span></p>
                    <p><strong>Grupo:</strong> <span id="pt-detail-group"></span></p>
                    <p><strong>Período:</strong> <span id="pt-detail-period"></span></p>
                </div>
                <p id="pt-detail-desc" style="margin-top: 15px; font-style: italic;"></p>
            </div>
        `;

        const content = `
            <div style="text-align: center; padding: 10px;">
                ${gridHtml}
                ${legendHtml}
                ${detailsHtml}
            </div>
        `;
        showModal(title, content, '', 'periodic-table-modal');
    };

    const openPomodoroTimerModal = () => {
        const title = "Pomodoro Timer";
        const content = `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 20px 0;">
                <div style="display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; justify-content: center;">
                    <button type="button" id="pomo-mode-work" class="button primary">Foco (25m)</button>
                    <button type="button" id="pomo-mode-break" class="button secondary">Pausa (5m)</button>
                </div>
                
                <div id="pomo-display" style="font-size: 4rem; font-family: monospace; font-weight: bold; color: var(--accent-primary);">25:00</div>
                
                <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
                    <button type="button" id="pomo-start" class="success">
                        <span class="icon icon-play-arrow"></span> Iniciar
                    </button>
                    <button type="button" id="pomo-pause" class="warning hidden">
                        <span class="icon icon-pause"></span> Pausar
                    </button>
                    <button type="button" id="pomo-reset" class="secondary">
                        <span class="icon icon-sync"></span> Zerar
                    </button>
                </div>
            </div>
        `;
        showModal(title, content, '', 'pomodoro-modal');
        
        let timeLeft = 25 * 60;
        let isRunning = false;
        let interval;
        let currentMode = 'work';
        
        const display = document.getElementById('pomo-display');
        const startBtn = document.getElementById('pomo-start');
        const pauseBtn = document.getElementById('pomo-pause');
        const resetBtn = document.getElementById('pomo-reset');
        const workBtn = document.getElementById('pomo-mode-work');
        const breakBtn = document.getElementById('pomo-mode-break');
        
        const updateDisplay = () => {
            const m = Math.floor(timeLeft / 60);
            const s = timeLeft % 60;
            display.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        };
        
        const setMode = (mode) => {
            currentMode = mode;
            isRunning = false;
            clearInterval(interval);
            startBtn.classList.remove('hidden');
            pauseBtn.classList.add('hidden');
            
            if (mode === 'work') {
                timeLeft = 25 * 60;
                workBtn.classList.replace('secondary', 'primary');
                breakBtn.classList.replace('primary', 'secondary');
                display.style.color = 'var(--accent-primary)';
            } else {
                timeLeft = 5 * 60;
                breakBtn.classList.replace('secondary', 'primary');
                workBtn.classList.replace('primary', 'secondary');
                display.style.color = 'var(--accent-success)';
            }
            updateDisplay();
        };
        
        workBtn.addEventListener('click', () => setMode('work'));
        breakBtn.addEventListener('click', () => setMode('break'));
        
        startBtn.addEventListener('click', () => {
            if (!isRunning) {
                isRunning = true;
                startBtn.classList.add('hidden');
                pauseBtn.classList.remove('hidden');
                
                interval = setInterval(() => {
                    timeLeft--;
                    updateDisplay();
                    
                    if (timeLeft <= 0) {
                        clearInterval(interval);
                        isRunning = false;
                        startBtn.classList.remove('hidden');
                        pauseBtn.classList.add('hidden');
                        showNotification(currentMode === 'work' ? "Tempo de foco encerrado! Faça uma pausa." : "Pausa encerrada! De volta ao foco.", "success");
                        try {
                            const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
                            audio.play();
                        } catch(e) {}
                    }
                }, 1000);
            }
        });
        
        pauseBtn.addEventListener('click', () => {
            isRunning = false;
            clearInterval(interval);
            pauseBtn.classList.add('hidden');
            startBtn.classList.remove('hidden');
        });
        
        resetBtn.addEventListener('click', () => {
            setMode(currentMode);
        });
        
        const modal = document.getElementById('generic-modal');
        const cleanup = (e) => {
            if (e.target === modal || e.target.closest('.close-button')) {
                clearInterval(interval);
                modal.removeEventListener('click', cleanup);
            }
        };
        modal.addEventListener('click', cleanup);
    };

    const openRubricGeneratorModal = () => {
        const title = "Gerador de Rubricas";
        const content = `
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <p class="text-secondary">Crie uma tabela de critérios de avaliação rapidamente.</p>
                <div>
                    <label style="font-weight: bold;">Tema/Atividade:</label>
                    <input type="text" id="rubric-theme" placeholder="Ex: Redação sobre Meio Ambiente" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px;">
                </div>
                <div>
                    <label style="font-weight: bold;">Critérios (um por linha):</label>
                    <textarea id="rubric-criteria" style="width: 100%; height: 100px; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; resize: vertical;" placeholder="Ex:\nGramática\nCoerência\nArgumentação"></textarea>
                </div>
                <div>
                    <label style="font-weight: bold;">Níveis de Desempenho (separados por vírgula):</label>
                    <input type="text" id="rubric-levels" value="Excelente, Bom, Regular, Insuficiente" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px;">
                </div>
                <button type="button" id="generate-rubric-btn" class="primary">Gerar Tabela</button>
                
                <div id="rubric-result" style="margin-top: 20px; overflow-x: auto;"></div>
            </div>
        `;
        showModal(title, content, '', 'rubric-modal');
        
        document.getElementById('generate-rubric-btn').addEventListener('click', () => {
            const theme = document.getElementById('rubric-theme').value;
            const criteria = document.getElementById('rubric-criteria').value.split('\n').filter(c => c.trim());
            const levels = document.getElementById('rubric-levels').value.split(',').map(l => l.trim()).filter(l => l);
            
            if (criteria.length === 0 || levels.length === 0) {
                showNotification("Preencha os critérios e níveis.", "error");
                return;
            }
            
            let html = `<h4 style="text-align: center;">Rubrica: ${sanitizeHTML(theme)}</h4>`;
            html += `<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">`;
            html += `<thead><tr><th style="border: 1px solid var(--border-color); padding: 8px; background: var(--bg-tertiary);">Critérios</th>`;
            levels.forEach(level => {
                html += `<th style="border: 1px solid var(--border-color); padding: 8px; background: var(--bg-tertiary);">${sanitizeHTML(level)}</th>`;
            });
            html += `</tr></thead><tbody>`;
            
            criteria.forEach(crit => {
                html += `<tr><td style="border: 1px solid var(--border-color); padding: 8px; font-weight: bold;">${sanitizeHTML(crit)}</td>`;
                levels.forEach(() => {
                    html += `<td style="border: 1px solid var(--border-color); padding: 8px;"></td>`;
                });
                html += `</tr>`;
            });
            
            html += `</tbody></table>`;
            
            document.getElementById('rubric-result').innerHTML = html;
        });
    };

    const openLessonPlannerModal = () => {
        const title = "Planejador de Aulas";
        const content = `
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div>
                    <label style="font-weight: bold;">Tema da Aula:</label>
                    <input type="text" id="lp-theme" placeholder="Ex: Revolução Francesa" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px;">
                </div>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 120px;">
                        <label style="font-weight: bold;">Turma:</label>
                        <input type="text" id="lp-class" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px;">
                    </div>
                    <div style="flex: 1; min-width: 120px;">
                        <label style="font-weight: bold;">Duração (min):</label>
                        <input type="number" id="lp-duration" value="50" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px;">
                    </div>
                </div>
                <div>
                    <label style="font-weight: bold;">Objetivos:</label>
                    <textarea id="lp-objectives" style="width: 100%; height: 60px; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; resize: vertical;"></textarea>
                </div>
                <div>
                    <label style="font-weight: bold;">Estrutura (Tempo - Atividade):</label>
                    <textarea id="lp-structure" style="width: 100%; height: 100px; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px; resize: vertical;" placeholder="Ex:\n10 min - Introdução\n25 min - Explicação do conteúdo\n15 min - Exercícios de fixação"></textarea>
                </div>
                <div>
                    <label style="font-weight: bold;">Materiais Necessários:</label>
                    <input type="text" id="lp-materials" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px;">
                </div>
                <button type="button" id="lp-save-btn" class="primary"><span class="icon icon-salvar"></span> Salvar Plano</button>
            </div>
        `;
        showModal(title, content, '', 'lesson-planner-modal');
        
        document.getElementById('lp-save-btn').addEventListener('click', () => {
            showNotification("Plano de aula salvo com sucesso! (Simulação)", "success");
            hideModal();
        });
    };

    const openMindMapModal = () => {
        const title = "Mapa Mental";
        const content = `
            <div style="display: flex; flex-direction: column; height: 100%; gap: 10px;">
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0;">Digite os tópicos usando espaços no início da linha para criar a hierarquia.</p>
                <textarea id="mindmap-input" style="height: 120px; font-family: monospace; white-space: pre;" placeholder="Ideia Central\n  Tópico 1\n    Subtópico A\n  Tópico 2"></textarea>
                <button type="button" id="mindmap-generate-btn" class="primary">Gerar Mapa</button>
                <div id="mindmap-output" style="flex-grow: 1; border: 1px solid var(--border-color); border-radius: 8px; padding: 15px; overflow: auto; background: white; min-height: 250px;">
                </div>
            </div>
        `;
        showModal(title, content, '', 'mindmap-modal');

        const parseTree = (lines) => {
            const root = { children: [] };
            const stack = [{ level: -1, node: root }];
            
            lines.forEach(line => {
                if (!line.trim()) return;
                const level = line.search(/\S/);
                const text = line.trim();
                const node = { text, children: [] };
                
                while (stack.length > 1 && stack[stack.length - 1].level >= level) {
                    stack.pop();
                }
                stack[stack.length - 1].node.children.push(node);
                stack.push({ level, node });
            });
            return root.children;
        };

        const renderTree = (nodes, isRoot = false) => {
            if (!nodes || nodes.length === 0) return '';
            let html = `<ul class="mindmap-list ${isRoot ? 'mindmap-root' : ''}">`;
            nodes.forEach(node => {
                html += `<li><div class="mindmap-node">${sanitizeHTML(node.text)}</div>`;
                html += renderTree(node.children);
                html += `</li>`;
            });
            html += `</ul>`;
            return html;
        };

        document.getElementById('mindmap-generate-btn').addEventListener('click', () => {
            const text = document.getElementById('mindmap-input').value;
            const lines = text.split('\\n');
            const tree = parseTree(lines);
            document.getElementById('mindmap-output').innerHTML = renderTree(tree, true);
        });
    };

    const openFlashcardsModal = () => {
        let cards = [];
        let currentIndex = 0;
        
        const content = `
            <div class="tabs" style="display: flex; gap: 10px; margin-bottom: 15px;">
                <button type="button" id="tab-create-fc" class="primary" style="flex: 1;">Criar</button>
                <button type="button" id="tab-study-fc" class="secondary" style="flex: 1;">Estudar</button>
            </div>
            
            <div id="fc-create-view">
                <div style="display: flex; gap: 8px; margin-bottom: 15px;">
                    <input type="text" id="fc-front" placeholder="Frente (Pergunta)" style="flex: 1; margin-bottom: 0;">
                    <input type="text" id="fc-back" placeholder="Verso (Resposta)" style="flex: 1; margin-bottom: 0;">
                    <button type="button" id="fc-add-btn" class="primary icon-button" title="Adicionar Manualmente"><span class="icon icon-adicionar icon-only"></span></button>
                </div>
                
                <div style="background: var(--bg-tertiary-alpha); padding: 10px; border-radius: 6px; margin-bottom: 15px; border: 1px dashed var(--border-color);">
                    <div style="font-size: 0.85rem; font-weight: 600; margin-bottom: 8px; color: var(--text-secondary);"><span class="icon icon-auto-awesome"></span> Gerar com IA</div>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <input type="text" id="fc-ai-theme" placeholder="Tema/Assunto" style="flex: 2; min-width: 120px; margin-bottom: 0;">
                        <input type="number" id="fc-ai-count" placeholder="Qtd" value="5" min="1" max="20" style="flex: 1; min-width: 60px; margin-bottom: 0;">
                        <button type="button" id="fc-ai-generate-btn" class="success" style="flex: 1; min-width: 100px; padding: 0.4rem; margin: 0;"><span class="icon icon-auto-awesome"></span> Gerar</button>
                    </div>
                </div>

                <div id="fc-list" style="max-height: 250px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
                    <p class="text-secondary" style="text-align: center; margin-top: 20px;">Nenhum cartão criado ainda.</p>
                </div>
            </div>
            
            <div id="fc-study-view" class="hidden" style="text-align: center;">
                <div id="fc-study-container">
                    <div class="fc-card-container" id="fc-card">
                        <div class="fc-card-inner">
                            <div class="fc-card-front" id="fc-display-front"></div>
                            <div class="fc-card-back" id="fc-display-back"></div>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: center; align-items: center; gap: 15px; margin-top: 20px;">
                        <button type="button" id="fc-prev-btn" class="secondary icon-button"><span class="icon icon-voltar icon-only"></span></button>
                        <span id="fc-counter" style="font-weight: bold; min-width: 50px;">0 / 0</span>
                        <button type="button" id="fc-next-btn" class="secondary icon-button"><span class="icon icon-play-arrow icon-only"></span></button>
                    </div>
                </div>
                <div id="fc-empty-state" class="hidden">
                    <p>Adicione cartões na aba "Criar" para começar a estudar.</p>
                </div>
            </div>
        `;
        showModal("Flashcards", content, '', 'flashcards-modal');
        
        const tabCreate = document.getElementById('tab-create-fc');
        const tabStudy = document.getElementById('tab-study-fc');
        const viewCreate = document.getElementById('fc-create-view');
        const viewStudy = document.getElementById('fc-study-view');
        const frontInput = document.getElementById('fc-front');
        const backInput = document.getElementById('fc-back');
        const addBtn = document.getElementById('fc-add-btn');
        const listContainer = document.getElementById('fc-list');
        const aiGenerateBtn = document.getElementById('fc-ai-generate-btn');
        const aiThemeInput = document.getElementById('fc-ai-theme');
        const aiCountInput = document.getElementById('fc-ai-count');
        
        const cardElement = document.getElementById('fc-card');
        const displayFront = document.getElementById('fc-display-front');
        const displayBack = document.getElementById('fc-display-back');
        const prevBtn = document.getElementById('fc-prev-btn');
        const nextBtn = document.getElementById('fc-next-btn');
        const counter = document.getElementById('fc-counter');
        const studyContainer = document.getElementById('fc-study-container');
        const emptyState = document.getElementById('fc-empty-state');
        
        tabCreate.addEventListener('click', () => {
            tabCreate.classList.replace('secondary', 'primary');
            tabStudy.classList.replace('primary', 'secondary');
            viewCreate.classList.remove('hidden');
            viewStudy.classList.add('hidden');
        });
        
        tabStudy.addEventListener('click', () => {
            tabStudy.classList.replace('secondary', 'primary');
            tabCreate.classList.replace('primary', 'secondary');
            viewStudy.classList.remove('hidden');
            viewCreate.classList.add('hidden');
            updateStudyView();
        });
        
        addBtn.addEventListener('click', () => {
            const front = frontInput.value.trim();
            const back = backInput.value.trim();
            if (front && back) {
                cards.push({ front, back });
                frontInput.value = '';
                backInput.value = '';
                frontInput.focus();
                renderList();
            }
        });
        
        aiGenerateBtn.addEventListener('click', async () => {
            const theme = aiThemeInput.value.trim();
            const count = parseInt(aiCountInput.value) || 5;
            
            if (!theme) {
                showNotification("Por favor, insira um tema para gerar os flashcards.");
                return;
            }
            
            if (!localStorage.getItem('gemini_api_key')) {
                showModal("Aviso", "<p>Você precisa configurar a Chave de API do Gemini na aba Ajustes para usar esta funcionalidade.</p>");
                return;
            }
            
            const originalText = aiGenerateBtn.innerHTML;
            aiGenerateBtn.innerHTML = '<span class="icon icon-sync spinner"></span> Gerando...';
            aiGenerateBtn.disabled = true;
            
            try {
                const prompt = `Crie ${count} flashcards sobre o tema: "${theme}".
Retorne APENAS um array JSON válido, onde cada objeto tem as propriedades "front" (a pergunta ou conceito) e "back" (a resposta ou definição).
Exemplo de formato esperado:
[
  {"front": "Pergunta 1", "back": "Resposta 1"},
  {"front": "Pergunta 2", "back": "Resposta 2"}
]`;
                
                const apiKey = localStorage.getItem('gemini_api_key');
                const ai = new GoogleGenAI({ apiKey: apiKey });
                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json"
                    }
                });
                const responseText = response.text;
                
                let generatedCards;
                try {
                    generatedCards = JSON.parse(responseText.trim());
                } catch (e) {
                    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
                    if (jsonMatch) {
                        generatedCards = JSON.parse(jsonMatch[0]);
                    } else {
                        throw new Error("Não foi possível extrair o JSON da resposta da IA.");
                    }
                }
                
                if (Array.isArray(generatedCards) && generatedCards.length > 0) {
                    cards = [...cards, ...generatedCards];
                    renderList();
                    showNotification(`${generatedCards.length} flashcards gerados com sucesso!`);
                    aiThemeInput.value = '';
                } else {
                    throw new Error("Formato JSON inválido retornado pela IA.");
                }
            } catch (error) {
                console.error("Erro ao gerar flashcards:", error);
                showNotification("Erro ao gerar flashcards. Tente novamente ou ajuste o tema.");
            } finally {
                aiGenerateBtn.innerHTML = originalText;
                aiGenerateBtn.disabled = false;
            }
        });
        
        const renderList = () => {
            if (cards.length === 0) {
                listContainer.innerHTML = '<p class="text-secondary" style="text-align: center; margin-top: 20px;">Nenhum cartão criado ainda.</p>';
                return;
            }
            listContainer.innerHTML = cards.map((c, i) => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px;">
                    <div style="flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        <strong>F:</strong> ${sanitizeHTML(c.front)} <br>
                        <span class="text-secondary"><strong>V:</strong> ${sanitizeHTML(c.back)}</span>
                    </div>
                    <button type="button" class="secondary icon-button delete-fc" data-index="${i}"><span class="icon icon-excluir icon-only"></span></button>
                </div>
            `).join('');
            
            listContainer.querySelectorAll('.delete-fc').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = parseInt(e.currentTarget.dataset.index);
                    cards.splice(idx, 1);
                    if (currentIndex >= cards.length) currentIndex = Math.max(0, cards.length - 1);
                    renderList();
                });
            });
        };
        
        cardElement.addEventListener('click', () => {
            cardElement.classList.toggle('flipped');
        });
        
        const updateStudyView = () => {
            if (cards.length === 0) {
                studyContainer.classList.add('hidden');
                emptyState.classList.remove('hidden');
                return;
            }
            studyContainer.classList.remove('hidden');
            emptyState.classList.add('hidden');
            
            cardElement.classList.remove('flipped');
            setTimeout(() => {
                displayFront.textContent = cards[currentIndex].front;
                displayBack.textContent = cards[currentIndex].back;
                counter.textContent = `${currentIndex + 1} / ${cards.length}`;
            }, 150);
        };
        
        prevBtn.addEventListener('click', () => {
            if (cards.length > 0) {
                currentIndex = (currentIndex - 1 + cards.length) % cards.length;
                updateStudyView();
            }
        });
        
        nextBtn.addEventListener('click', () => {
            if (cards.length > 0) {
                currentIndex = (currentIndex + 1) % cards.length;
                updateStudyView();
            }
        });
    };

    const openEventOrganizerModal = () => {
        const schools = [...new Set(appData.classes.map(c => findSchoolById(c.schoolId)?.name).filter(Boolean))];
        
        const content = `
            <div class="form-group">
                <label>Selecione a Escola:</label>
                <select id="event-school-select" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--border-color);">
                    <option value="">-- Selecione --</option>
                    ${schools.map(s => `<option value="${s}">${s}</option>`).join('')}
                </select>
            </div>
            <div class="form-group hidden" id="event-shift-group">
                <label>Selecione o(s) Turno(s):</label>
                <div id="event-shift-checkboxes" style="display: flex; gap: 15px; flex-wrap: wrap; margin-bottom: 10px; padding: 10px; background: var(--bg-secondary); border-radius: 6px;"></div>
            </div>
            <div class="form-group hidden" id="event-class-group">
                <label>Selecione a(s) Turma(s):</label>
                <div id="event-class-checkboxes" style="display: flex; gap: 15px; flex-wrap: wrap; max-height: 120px; overflow-y: auto; border: 1px solid var(--border-color); padding: 10px; border-radius: 6px; background: var(--bg-secondary);"></div>
            </div>
            <div class="form-group">
                <label>Nome do Evento/Excursão:</label>
                <input type="text" id="event-name" placeholder="Ex: Museu de Arte">
            </div>
            <div id="event-summary" style="margin-bottom: 15px; font-weight: bold; color: var(--accent-primary);"></div>
            <div id="event-students-list" style="max-height: 350px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;"></div>
        `;
        showModal("Organizador de Excursões", content, '<button type="button" id="print-event-btn" class="primary hidden"><span class="icon icon-pdf"></span> Imprimir Lista</button>', 'event-organizer-modal');

        const schoolSelect = document.getElementById('event-school-select');
        const shiftGroup = document.getElementById('event-shift-group');
        const shiftCheckboxesContainer = document.getElementById('event-shift-checkboxes');
        const classGroup = document.getElementById('event-class-group');
        const classCheckboxesContainer = document.getElementById('event-class-checkboxes');
        const studentsList = document.getElementById('event-students-list');
        const summary = document.getElementById('event-summary');
        const printBtn = document.getElementById('print-event-btn');
        
        let currentStudents = [];
        let eventState = {};

        const updateSummary = () => {
            if (currentStudents.length === 0) {
                summary.textContent = '';
                return;
            }
            const total = currentStudents.length;
            const authCount = Object.values(eventState).filter(s => s.auth).length;
            const paidCount = Object.values(eventState).filter(s => s.paid).length;
            summary.innerHTML = `Total: ${total} alunos | Autorizados: ${authCount} | Pagos: ${paidCount}`;
        };

        const renderStudents = () => {
            const selectedClassIds = Array.from(classCheckboxesContainer.querySelectorAll('input:checked')).map(cb => cb.value);
            
            if (selectedClassIds.length === 0) {
                studentsList.innerHTML = '';
                currentStudents = [];
                eventState = {};
                updateSummary();
                printBtn.classList.add('hidden');
                return;
            }
            
            currentStudents = appData.students.filter(s => selectedClassIds.includes(s.classId));
            
            // Preserve existing state
            const newState = {};
            currentStudents.forEach(s => { 
                newState[s.id] = eventState[s.id] || { auth: false, paid: false }; 
            });
            eventState = newState;
            
            printBtn.classList.remove('hidden');
            
            studentsList.innerHTML = currentStudents.map(s => {
                const cls = findClassById(s.classId);
                return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px;">
                    <div style="flex: 1; font-weight: 500;">
                        ${s.number ? s.number + '. ' : ''}${sanitizeHTML(s.name)} 
                        <span style="font-size: 0.8em; color: var(--text-secondary); font-weight: normal;">(${sanitizeHTML(cls?.name || '')})</span>
                    </div>
                    <div style="display: flex; gap: 15px; align-items: center;">
                        <label style="display: flex; align-items: center; gap: 5px; cursor: pointer; margin: 0;">
                            <input type="checkbox" class="event-auth-cb" data-id="${s.id}" ${eventState[s.id].auth ? 'checked' : ''}> Aut.
                        </label>
                        <label style="display: flex; align-items: center; gap: 5px; cursor: pointer; margin: 0;">
                            <input type="checkbox" class="event-paid-cb" data-id="${s.id}" ${eventState[s.id].paid ? 'checked' : ''}> Pago
                        </label>
                    </div>
                </div>
            `}).join('');
            
            studentsList.querySelectorAll('.event-auth-cb').forEach(cb => {
                cb.addEventListener('change', (e) => {
                    eventState[e.target.dataset.id].auth = e.target.checked;
                    updateSummary();
                });
            });
            studentsList.querySelectorAll('.event-paid-cb').forEach(cb => {
                cb.addEventListener('change', (e) => {
                    eventState[e.target.dataset.id].paid = e.target.checked;
                    updateSummary();
                });
            });
            
            updateSummary();
        };

        const updateClasses = () => {
            const school = schoolSelect.value;
            const selectedShifts = Array.from(shiftCheckboxesContainer.querySelectorAll('input:checked')).map(cb => cb.value);
            
            if (!school || selectedShifts.length === 0) {
                classGroup.classList.add('hidden');
                classCheckboxesContainer.innerHTML = '';
                renderStudents();
                return;
            }
            
            const availableClasses = appData.classes.filter(c => 
                findSchoolById(c.schoolId)?.name === school && 
                selectedShifts.includes(c.shift)
            );
            
            if (availableClasses.length > 0) {
                classGroup.classList.remove('hidden');
                classCheckboxesContainer.innerHTML = availableClasses.map(c => `
                    <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                        <input type="checkbox" class="event-class-cb" value="${c.id}"> ${sanitizeHTML(c.name)}
                    </label>
                `).join('');
                
                classCheckboxesContainer.querySelectorAll('.event-class-cb').forEach(cb => {
                    cb.addEventListener('change', renderStudents);
                });
            } else {
                classGroup.classList.add('hidden');
                classCheckboxesContainer.innerHTML = '';
            }
            renderStudents();
        };

        const updateShifts = () => {
            const school = schoolSelect.value;
            if (!school) {
                shiftGroup.classList.add('hidden');
                shiftCheckboxesContainer.innerHTML = '';
                updateClasses();
                return;
            }
            
            const shiftsInSchool = [...new Set(appData.classes.filter(c => findSchoolById(c.schoolId)?.name === school).map(c => c.shift).filter(Boolean))];
            
            if (shiftsInSchool.length > 0) {
                shiftGroup.classList.remove('hidden');
                shiftCheckboxesContainer.innerHTML = shiftsInSchool.map(shift => `
                    <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                        <input type="checkbox" class="event-shift-cb" value="${shift}"> ${shift}
                    </label>
                `).join('');
                
                shiftCheckboxesContainer.querySelectorAll('.event-shift-cb').forEach(cb => {
                    cb.addEventListener('change', updateClasses);
                });
            } else {
                shiftGroup.classList.add('hidden');
                shiftCheckboxesContainer.innerHTML = '';
            }
            updateClasses();
        };

        schoolSelect.addEventListener('change', updateShifts);
        
        printBtn.addEventListener('click', () => {
            const eventName = document.getElementById('event-name').value || 'Excursão';
            const selectedClassIds = Array.from(classCheckboxesContainer.querySelectorAll('input:checked')).map(cb => cb.value);
            const classNames = selectedClassIds.map(id => findClassById(id)?.name).filter(Boolean).join(', ');
            
            let printWindow = window.open('', '_blank');
            let html = `
                <html><head><meta charset="UTF-8"><title>Lista - ${eventName}</title>
                <style>
                    body { font-family: sans-serif; padding: 20px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #000; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; }
                    .center { text-align: center; }
                </style>
                </head><body>
                <h2>${sanitizeHTML(eventName)} - Turmas: ${sanitizeHTML(classNames)}</h2>
                <p>${summary.textContent}</p>
                <table>
                    <thead><tr><th>Nº</th><th>Aluno</th><th>Turma</th><th>Autorização</th><th>Pagamento</th></tr></thead>
                    <tbody>
            `;
            currentStudents.forEach(s => {
                const cls = findClassById(s.classId);
                const state = eventState[s.id];
                html += `<tr>
                    <td width="30">${s.number || ''}</td>
                    <td>${sanitizeHTML(s.name)}</td>
                    <td>${sanitizeHTML(cls?.name || '')}</td>
                    <td class="center" width="100">${state.auth ? 'X' : ' '}</td>
                    <td class="center" width="100">${state.paid ? 'X' : ' '}</td>
                </tr>`;
            });
            html += `</tbody></table></body></html>`;
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => { printWindow.print(); }, 500);
        });
    };

    let noiseAudioContext;
    let noiseStream;
    let noiseAnimationFrame;

    const openNoiseMeterModal = () => {
        const content = `
            <div style="text-align: center; padding: 10px;">
                <div class="traffic-light-container">
                    <div id="light-red" class="light-bulb red"></div>
                    <div id="light-yellow" class="light-bulb yellow"></div>
                    <div id="light-green" class="light-bulb green active"></div>
                </div>
                <div style="margin-top: 25px; display: flex; justify-content: center; gap: 10px;">
                    <button type="button" id="start-noise-meter" class="primary"><span class="icon icon-mic"></span> Iniciar</button>
                    <button type="button" id="stop-noise-meter" class="secondary" disabled><span class="icon icon-stop"></span> Parar</button>
                </div>
                <div style="margin-top: 20px; text-align: left; max-width: 250px; margin-left: auto; margin-right: auto;">
                    <label style="font-size: 0.85rem;">Sensibilidade: <span id="noise-sens-val">50</span>%</label>
                    <input type="range" id="noise-sensitivity" min="1" max="100" value="50" style="margin-bottom: 0;">
                </div>
            </div>
        `;
        showModal("Semáforo do Silêncio", content, '', 'noise-meter-modal');

        const startBtn = document.getElementById('start-noise-meter');
        const stopBtn = document.getElementById('stop-noise-meter');
        const sensInput = document.getElementById('noise-sensitivity');
        const sensVal = document.getElementById('noise-sens-val');
        const lightRed = document.getElementById('light-red');
        const lightYellow = document.getElementById('light-yellow');
        const lightGreen = document.getElementById('light-green');
        
        sensInput.addEventListener('input', (e) => {
            sensVal.textContent = e.target.value;
        });

        const setLight = (color) => {
            lightRed.classList.remove('active');
            lightYellow.classList.remove('active');
            lightGreen.classList.remove('active');
            if (color === 'red') lightRed.classList.add('active');
            else if (color === 'yellow') lightYellow.classList.add('active');
            else lightGreen.classList.add('active');
        };

        const stopMeter = () => {
            if (noiseAnimationFrame) cancelAnimationFrame(noiseAnimationFrame);
            if (noiseStream) {
                noiseStream.getTracks().forEach(track => track.stop());
            }
            if (noiseAudioContext) {
                noiseAudioContext.close();
            }
            startBtn.disabled = false;
            stopBtn.disabled = true;
            setLight('green');
        };

        startBtn.addEventListener('click', async () => {
            try {
                noiseStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                noiseAudioContext = new (window.AudioContext || window.webkitAudioContext)();
                const source = noiseAudioContext.createMediaStreamSource(noiseStream);
                const analyser = noiseAudioContext.createAnalyser();
                analyser.fftSize = 256;
                source.connect(analyser);
                
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                
                startBtn.disabled = true;
                stopBtn.disabled = false;

                const checkNoiseLevel = () => {
                    analyser.getByteFrequencyData(dataArray);
                    let sum = 0;
                    for(let i = 0; i < bufferLength; i++) {
                        sum += dataArray[i];
                    }
                    const average = sum / bufferLength;
                    
                    const sensitivity = parseInt(sensInput.value);
                    const factor = (101 - sensitivity) / 50;
                    const yellowThreshold = 20 * factor;
                    const redThreshold = 50 * factor;

                    if (average > redThreshold) {
                        setLight('red');
                    } else if (average > yellowThreshold) {
                        setLight('yellow');
                    } else {
                        setLight('green');
                    }

                    noiseAnimationFrame = requestAnimationFrame(checkNoiseLevel);
                };
                
                checkNoiseLevel();
                
            } catch (err) {
                console.error("Erro ao acessar microfone:", err);
                customAlert("Não foi possível acessar o microfone. Verifique as permissões.");
            }
        });

        stopBtn.addEventListener('click', stopMeter);
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && !modal.classList.contains('show')) {
                    stopMeter();
                    observer.disconnect();
                }
            });
        });
        observer.observe(modal, { attributes: true });
    };

    const openToolModal = (toolType) => { if (toolType === 'advanced-calculator') { openAdvancedCalculatorModal(); return; } let title = "Ferramenta"; let content = "<p>Funcionalidade em desenvolvimento.</p>"; let modalClass = ''; let footer = ''; switch (toolType) { case 'name-sorter': openNameSorterModal(); return; case 'timer-stopwatch': openTimerModal(); return; case 'group-generator': openGroupGeneratorModal(); return; case 'notepad': openNotepadModal(); return; case 'calendar-notes': openCalendarNotesModal(); return; case 'audio-recorder': openAudioRecorderModal(); return; case 'whiteboard': openWhiteboardModal(); return; case 'todo-list': openTodoListModal(); return; case 'topic-sorter': openTopicSorterModal(); return; case 'grade-converter': openGradeConverterModal(); return; case 'pomodoro-timer': openPomodoroTimerModal(); return; case 'rubric-generator': openRubricGeneratorModal(); return; case 'lesson-planner': openLessonPlannerModal(); return; case 'mind-map': openMindMapModal(); return; case 'flashcards': openFlashcardsModal(); return; case 'event-organizer': openEventOrganizerModal(); return; case 'noise-meter': openNoiseMeterModal(); return; case 'unit-converter': openUnitConverterModal(); return; case 'periodic-table': openPeriodicTableModal(); return; default: title = "Funcionalidade Indisponível"; content = "<p>Esta ferramenta ainda não foi implementada.</p>"; } showModal(title, content, footer, modalClass); };
    const updateScheduleItemsUI = () => { if (currentSection !== 'schedule-section' || !scheduleListContainer) return; const now = new Date(); const currentDayIndex = now.getDay(); const currentDayName = weekdays[currentDayIndex]; const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes(); const scheduleItemsElements = scheduleListContainer.querySelectorAll(`.schedule-item`); let nextItemFoundForToday = false; scheduleItemsElements.forEach(el => { const itemId = el.dataset.id; const item = findScheduleById(itemId); if (!item) return; const startMinutes = parseInt(el.dataset.startMinutes); const endMinutes = parseInt(el.dataset.endMinutes); const progressBar = el.querySelector('.progress-bar'); el.classList.remove('current', 'next'); if (progressBar) progressBar.style.width = '0%'; if (item.day === currentDayName && !isNaN(startMinutes) && !isNaN(endMinutes)) { const isCurrent = currentTimeInMinutes >= startMinutes && currentTimeInMinutes < endMinutes; const isUpcoming = currentTimeInMinutes < startMinutes; if (isCurrent) { el.classList.add('current'); const duration = endMinutes - startMinutes; const elapsed = currentTimeInMinutes - startMinutes; const progress = duration > 0 ? Math.min(100, Math.max(0, (elapsed / duration) * 100)) : 0; if (progressBar) progressBar.style.width = `${progress}%`; nextItemFoundForToday = true; } else if (isUpcoming && !nextItemFoundForToday) { el.classList.add('next'); nextItemFoundForToday = true; } } }); };
    const startScheduleUpdates = () => { stopScheduleUpdates(); console.log("Starting schedule UI updates..."); updateScheduleItemsUI(); scheduleUpdateInterval = setInterval(updateScheduleItemsUI, 1000); };
    const stopScheduleUpdates = () => { if (scheduleUpdateInterval) { clearInterval(scheduleUpdateInterval); scheduleUpdateInterval = null; console.log("Stopped schedule UI updates."); } };

    // Funções do Modal de Novidades
    function showWhatsNew() {
        if (!whatsNewModal || !whatsNewTitle || !whatsNewBody) {
            console.error("Elementos do modal de novidades não encontrados!");
            return;
        }
        
        showingWhatsNew = true;
        const isLoggedIn = !!auth.currentUser;
        const lastSeenVersion = localStorage.getItem('lastSeenAppVersion');
        
        // Determinar o título com base no estado
        if (lastSeenVersion === null) {
            whatsNewTitle.innerHTML = "Bem-vindo ao Super Professor Pro! <span class='icon icon-rocket-launch'></span>";
        } else if (lastSeenVersion !== CURRENT_APP_VERSION) {
            whatsNewTitle.textContent = `Novidades da Versão ${CURRENT_APP_VERSION}!`;
        } else {
            whatsNewTitle.innerHTML = "Mantenha seus dados seguros! <span class='icon icon-cloud'></span>";
        }
        
        let newsContent = `
            <p>Confira as últimas melhorias e funcionalidades adicionadas para facilitar ainda mais seu dia a dia:</p>
            
            <h4 style="color: #9b72cb;"><span class="icon icon-auto-awesome"></span> Novas Ferramentas Pedagógicas</h4>
            <ul>
                <li><strong><span class="icon icon-auto-awesome"></span> Mapa Mental e Flashcards:</strong> Crie mapas mentais visuais e cartões de estudo para revisão rápida.</li>
                <li><strong><span class="icon icon-mic"></span> Semáforo do Silêncio:</strong> Controle o ruído da sala com um semáforo visual que usa o microfone.</li>
                <li><strong><span class="icon icon-groups"></span> Organizador de Excursões:</strong> Gerencie autorizações e pagamentos de passeios de forma simples.</li>
                <li><strong><span class="icon icon-auto-awesome"></span> Assistente de IA:</strong> Gere provas, questões e planos de aula completos com exportação para PDF.</li>
            </ul>

            <h4 style="color: #28a745;"><span class="icon icon-language"></span> Uso Offline e Nuvem</h4>
            <ul>
                <li><strong><span class="icon icon-signal-cellular-alt"></span> Modo Offline Total:</strong> Use o app sem internet em tempo integral! Suas alterações são salvas e sincronizadas automaticamente.</li>
                <li><strong><span class="icon icon-cloud"></span> Backup em Nuvem:</strong> Seus dados agora estão seguros na sua conta Google. Acesse de qualquer lugar e nunca perca suas informações.</li>
                <li><strong><span class="icon icon-sync"></span> Migração de Dados:</strong> Seus dados locais serão migrados automaticamente para a nuvem ao criar sua conta!</li>
            </ul>

            <h4><span class="icon icon-palette"></span> Interface e Gestão</h4>
            <ul>
                <li><strong><span class="icon icon-menu"></span> Novo Menu Lateral:</strong> Escolha entre a barra inferior clássica ou um menu lateral para ganhar mais espaço na tela!</li>
                <li><strong><span class="icon icon-palette"></span> Temas e Cores:</strong> O menu lateral agora se adapta ao seu tema escolhido, com cores sólidas e elegantes.</li>
                <li><strong><span class="icon icon-groups"></span> Capacidade Ampliada:</strong> Agora você pode cadastrar até 100 alunos por turma!</li>
                <li><strong><span class="icon icon-flag"></span> Indicador de Programas Sociais:</strong> Identifique visualmente alunos participantes de programas como Bolsa Família e Pé de Meia.</li>
                <li><strong><span class="icon icon-anotacao"></span> Categorias de Observações:</strong> Anotações, Ocorrências, Advertências e Suspensões com períodos específicos.</li>
            </ul>
        `;

        // Se não estiver logado, adicionamos o destaque sobre o login
        if (!isLoggedIn) {
            sessionStorage.setItem('loginPromptShown', 'true');
            const hasData = appData.schools.length > 0 || appData.schedule.length > 0;
            newsContent += `
                <div style="background: var(--bg-tertiary); padding: 15px; border-radius: 12px; margin-top: 1.5rem; border: 1px solid var(--accent-primary); box-shadow: 0 4px 12px var(--shadow-color);">
                    <h4 style="margin-top: 0; color: var(--accent-primary); display: flex; align-items: center; gap: 8px;">
                        <span class="icon icon-config"></span> Sincronize seus dados! <span class="icon icon-cloud"></span>
                    </h4>
                    <p style="font-size: 0.95rem; margin-bottom: 10px;">${hasData ? 'Vimos que você já tem dados cadastrados! Para nunca perdê-los, recomendamos criar uma conta.' : 'Para que seus dados fiquem sempre salvos e acessíveis de qualquer dispositivo, recomendamos criar uma conta agora.'}</p>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;"><span class="icon icon-auto-awesome"></span> <strong>Sincronização automática:</strong> Seus dados serão salvos na nuvem instantaneamente.</p>
                </div>
            `;
            
            // Alteramos o rodapé para os botões de login
            const modalFooter = whatsNewModal.querySelector('.modal-footer');
            if (modalFooter) {
                modalFooter.innerHTML = `
                    <div style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
                        <button type="button" id="whats-new-login-button" class="primary w-full" style="padding: 14px; font-weight: bold; font-size: 1rem;">Fazer Login / Criar Conta</button>
                        <button type="button" id="whats-new-skip-button" class="secondary w-full" style="padding: 10px; font-size: 0.85rem; border: none; background: transparent; color: var(--text-secondary);">Continuar sem conta (apenas local)</button>
                    </div>
                `;
                
                document.getElementById('whats-new-login-button')?.addEventListener('click', () => {
                    hideWhatsNew();
                    showSection('settings-section');
                    setTimeout(() => { authButton.click(); }, 100);
                });
                
                document.getElementById('whats-new-skip-button')?.addEventListener('click', hideWhatsNew);
            }
        } else {
            // Se já estiver logado, mantemos o botão padrão
            const modalFooter = whatsNewModal.querySelector('.modal-footer');
            if (modalFooter) {
                modalFooter.innerHTML = `<button type="button" id="ok-whats-new">Entendi</button>`;
                document.getElementById('ok-whats-new')?.addEventListener('click', hideWhatsNew);
            }
        }

        whatsNewBody.innerHTML = newsContent;
        whatsNewModal.classList.add('show');
    };

    function hideWhatsNew() { 
        if (whatsNewModal) { 
            whatsNewModal.classList.remove('show'); 
            showingWhatsNew = false;
            console.log("Whats New closed, showingWhatsNew set to false.");
        } 
    };

    // --- Event Listeners Globais e Específicos ---
    navButtons.forEach(button => { 
        button.addEventListener('click', () => { 
            const targetSection = button.dataset.section; 
            if (button.disabled) return; 
            showSection(targetSection); 
        }); 
    });

    const navStyleSelect = document.getElementById('nav-style-select');
    if (navStyleSelect) {
        navStyleSelect.addEventListener('change', (e) => {
            applyNavStyle(e.target.value);
            saveData();
        });
    }

    addScheduleButton.addEventListener('click', () => openScheduleModal());
    addSchoolButton.addEventListener('click', () => openSchoolModal());
    addClassButton.addEventListener('click', () => { if(currentSchoolId) openClassModal(); else customAlert("Selecione uma escola primeiro!"); });
    backToSchoolsButton.addEventListener('click', () => { currentSchoolId = null; currentClassId = null; showSection('schools-section'); stopScheduleUpdates(); });
    backToClassesButton.addEventListener('click', () => { if (tempClassroomLayout) { cancelClassroomMapEdit(); } showSection('classes-section'); stopScheduleUpdates(); });
    const combinedModalCloseHandler = (e) => { const targetModal = e.currentTarget; if (e.target === targetModal || e.target.closest('.close-button[data-dismiss="modal"]') || e.target.matches('button[data-dismiss="modal"]')) { if (targetModal.id === 'generic-modal' && targetModal.querySelector('#timer-display')) { pauseStopwatch(); } hideModal(); } };
    modal.addEventListener('click', combinedModalCloseHandler);
    calculatorModal.addEventListener('click', combinedModalCloseHandler);
    const aiToolModalEl = document.getElementById('ai-tool-modal');
    if (aiToolModalEl) aiToolModalEl.addEventListener('click', combinedModalCloseHandler);
    addStudentButton?.addEventListener('click', () => { if(currentClassId) openStudentModal(); else customAlert("Selecione uma turma primeiro!"); });
    renumberStudentsButton?.addEventListener('click', () => { if(currentClassId) openRenumberStudentsModal(); else customAlert("Selecione uma turma primeiro!"); });
    gradeSetSelect.addEventListener('change', (e) => { if(currentClassId) { renderGradesTable(currentClassId, e.target.value); } });
    manageGradeStructureButton.addEventListener('click', openGradeStructureModal);
    saveGradesButton.addEventListener('click', saveGrades);
    exportGradesCsvButton?.addEventListener('click', exportGradesCSV);
    exportGradesPdfButton?.addEventListener('click', () => exportGradesPDF());
    attendanceDateInput.addEventListener('change', (e) => { if(currentClassId) { renderAttendanceTable(currentClassId, e.target.value); } });
    markAllPresentButton.addEventListener('click', markAllStudentsPresent);
    markNonSchoolDayButton.addEventListener('click', toggleNonSchoolDay);
    lessonPlanDateInput.addEventListener('change', (e) => { if(currentClassId) { renderLessonPlan(currentClassId, e.target.value); } });
    saveAttendanceButton.addEventListener('click', saveAttendance);
    viewMonthlyAttendanceButton.addEventListener('click', openAttendanceReportModal);
    // Event listeners for Modals
    const editLessonPlanButton = document.getElementById('edit-lesson-plan-button');
    if (editLessonPlanButton) {
        editLessonPlanButton.addEventListener('click', openLessonPlanModal);
    }

    const saveLessonPlanModalBtn = document.getElementById('lesson-plan-modal-save-btn');
    if (saveLessonPlanModalBtn) {
        saveLessonPlanModalBtn.addEventListener('click', saveLessonPlanModal);
    }

    const closeLessonPlanModalBtn = document.getElementById('lesson-plan-modal-cancel-btn');
    if (closeLessonPlanModalBtn) {
        closeLessonPlanModalBtn.addEventListener('click', () => {
            document.getElementById('lesson-plan-modal').classList.remove('show');
        });
    }

    if (editClassNotesButton) {
        editClassNotesButton.addEventListener('click', openClassNotesModal);
    }

    const saveClassNotesModalBtn = document.getElementById('class-notes-modal-save-btn');
    if (saveClassNotesModalBtn) {
        saveClassNotesModalBtn.addEventListener('click', saveClassNotesModal);
    }

    const closeClassNotesModalBtn = document.getElementById('class-notes-modal-cancel-btn');
    if (closeClassNotesModalBtn) {
        closeClassNotesModalBtn.addEventListener('click', () => {
            document.getElementById('class-notes-modal').classList.remove('show');
        });
    }

    const newClassNoteBtn = document.getElementById('class-notes-modal-add-note-btn');
    if (newClassNoteBtn) {
        newClassNoteBtn.addEventListener('click', () => {
            document.getElementById('class-notes-modal-date').value = getCurrentDateString();
            document.getElementById('class-notes-modal-textarea').value = '';
        });
    }

    const classNotesDateInput = document.getElementById('class-notes-date');
    if (classNotesDateInput) {
        classNotesDateInput.addEventListener('change', (e) => {
            if (currentClassId) renderClassNotes(currentClassId, e.target.value);
        });
    }

    const classNotesModalDateInput = document.getElementById('class-notes-modal-date');
    if (classNotesModalDateInput) {
        classNotesModalDateInput.addEventListener('change', (e) => {
            if (currentClassId) {
                const currentClass = findClassById(currentClassId);
                document.getElementById('class-notes-modal-textarea').value = currentClass?.classNotes?.[e.target.value] || '';
            }
        });
    }

    const lessonPlanModalDateInput = document.getElementById('lesson-plan-modal-date');
    if (lessonPlanModalDateInput) {
        lessonPlanModalDateInput.addEventListener('change', (e) => {
            if (currentClassId) {
                const currentClass = findClassById(currentClassId);
                document.getElementById('lesson-plan-modal-textarea').value = currentClass?.lessonPlans?.[e.target.value] || '';
            }
        });
    }

    const lessonPlanModalAddAiBtn = document.getElementById('lesson-plan-modal-add-ai-btn');
    if (lessonPlanModalAddAiBtn) {
        lessonPlanModalAddAiBtn.addEventListener('click', () => {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) {
                showNotification('Configure sua chave de IA na aba de Ajustes.', 'error');
                return;
            }
            openAiModal('lesson-plan');
        });
    }

    // End event listeners for Modals
    copyPixButton?.addEventListener('click', () => {
        const pixKey = pixKeyTextElement.textContent;
        
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(pixKey).then(() => {
                customAlert("Código PIX copiado para a área de transferência!");
            }).catch(err => {
                console.error("Erro ao copiar PIX:", err);
                fallbackCopyTextToClipboard(pixKey);
            });
        } else {
            fallbackCopyTextToClipboard(pixKey);
        }
        
        function fallbackCopyTextToClipboard(text) {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.top = "0";
            textArea.style.left = "0";
            textArea.style.position = "fixed";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    customAlert("Código PIX copiado para a área de transferência!");
                } else {
                    customAlert("Não foi possível copiar o código PIX. Por favor, selecione e copie manualmente.");
                }
            } catch (err) {
                console.error("Erro ao copiar PIX:", err);
                customAlert("Não foi possível copiar o código PIX. Por favor, selecione e copie manualmente.");
            }
            
            document.body.removeChild(textArea);
        }
    });
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            applyTheme(e.target.value);
            saveData();
        });
    }

    const executeDataActionBtn = document.getElementById('execute-data-action');
    const dataActionSelect = document.getElementById('data-action-select');
    const importDataInput = document.getElementById('import-data-input');

    if (executeDataActionBtn && dataActionSelect) {
        executeDataActionBtn.addEventListener('click', () => {
            const action = dataActionSelect.value;
            if (action === 'export') {
                exportData();
            } else if (action === 'import') {
                importDataInput.click();
            } else if (action === 'clear') {
                clearAllData();
            } else {
                customAlert("Por favor, selecione uma ação.");
            }
        });
    }
    
    if (importDataInput) {
        importDataInput.addEventListener('change', importData);
    }
    
    if (profileAvatarContainer && profileAvatarInput) {
        profileAvatarContainer.addEventListener('click', () => profileAvatarInput.click());
        profileAvatarInput.addEventListener('change', handleAvatarUpload);
    }
    if (saveProfileButton) {
        saveProfileButton.addEventListener('click', saveProfile);
    }
    
    searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { performSearch(searchInput.value); } });
    searchInput.addEventListener('input', () => { /* No dynamic search */ });
    searchInput.addEventListener('search', () => { if (!searchInput.value) { hideModal(); } });
    notificationCloseButton?.addEventListener('click', hideNotification);
    enableGlobalNotificationsCheckbox?.addEventListener('change', (e) => { appData.settings.globalNotificationsEnabled = e.target.checked; enableNotificationSoundCheckbox.disabled = !e.target.checked; if (!e.target.checked) { stopNotificationChecker(); hideNotification(); } else { startNotificationChecker(); } saveData(); });
    enableNotificationSoundCheckbox?.addEventListener('change', (e) => { appData.settings.notificationSoundEnabled = e.target.checked; saveData(); });
    customNotificationSoundInput?.addEventListener('change', handleCustomSoundUpload);
    removeCustomSoundButton?.addEventListener('click', removeCustomSound);
    editMapButton.addEventListener('click', editClassroomMap);
    cancelMapEditButton.addEventListener('click', cancelClassroomMapEdit);
    saveMapButton.addEventListener('click', saveClassroomLayout);
    randomizeMapButton.addEventListener('click', randomizeClassroomMap);
    unassignedStudentsContainer.addEventListener('dragover', handleDragOver);
    unassignedStudentsContainer.addEventListener('dragleave', handleDragLeave);
    unassignedStudentsContainer.addEventListener('drop', handleDropOnUnassignedList);
    toolsGrid?.addEventListener('click', (e) => { const toolCard = e.target.closest('.tool-card'); if (toolCard && toolCard.dataset.tool) { const toolType = toolCard.dataset.tool; openToolModal(toolType); } });
    mainContent.addEventListener('click', (e) => { const toggleButton = e.target.closest('.card-toggle-button'); if (toggleButton) { toggleCardCollapse(toggleButton); } });
    helpButton?.addEventListener('click', showHelpModal);
    toolsHelpButton?.addEventListener('click', showToolsHelpModal);
    mainContent.addEventListener('scroll', () => { if(classDetailsHeader) { classDetailsHeader.classList.toggle('scrolled', mainContent.scrollTop > 1); } });
    attendanceTableContainer.addEventListener('click', (e) => { const suspendedRow = e.target.closest('tr.clickable-suspended'); if (suspendedRow) { const studentId = suspendedRow.dataset.studentId; const noteIndex = parseInt(suspendedRow.dataset.suspensionNoteIndex); if (studentId && !isNaN(noteIndex)) { console.log(`Click em aluno suspenso ${studentId}, abrindo nota ${noteIndex}`); openStudentNotesModal(studentId, noteIndex); } } });
    studentListContainer.addEventListener('click', async (e) => { const targetButton = e.target.closest('button'); if (!targetButton) return; const listItem = targetButton.closest('.list-item[data-id]'); if (!listItem) return; const studentId = listItem.dataset.id; if (targetButton.classList.contains('expand-actions-button') || targetButton.closest('.expand-actions-button')) { toggleActions(listItem); } else if (targetButton.classList.contains('report-student-button') || targetButton.closest('.report-student-button')) { openStudentReportModal(studentId); } else if (targetButton.classList.contains('move-student-button') || targetButton.closest('.move-student-button')) { openMoveStudentModal(studentId); } else if (targetButton.classList.contains('set-representative-button') || targetButton.closest('.set-representative-button')) { toggleRepresentative(studentId); } else if (targetButton.classList.contains('set-vice-button') || targetButton.closest('.set-vice-button')) { toggleViceRepresentative(studentId); } else if (targetButton.classList.contains('notes-student-button') || targetButton.closest('.notes-student-button')) { openStudentNotesModal(studentId); } else if (targetButton.classList.contains('edit-student-button') || targetButton.closest('.edit-student-button')) { openStudentModal(studentId); } else if (targetButton.classList.contains('delete-student-button') || targetButton.closest('.delete-student-button')) { if (await customConfirm(`Excluir aluno "${findStudentById(studentId)?.name || ''}"?`)) { deleteStudent(studentId); } } });
    window.addEventListener('beforeunload', saveAppState);

    // Event Listeners para o Modal de Novidades
    closeWhatsNewButton?.addEventListener('click', hideWhatsNew);
    okWhatsNewButton?.addEventListener('click', hideWhatsNew);
    whatsNewModal?.addEventListener('click', (event) => { if (event.target === whatsNewModal) { hideWhatsNew(); } });
    showWhatsNewManualButton?.addEventListener('click', showWhatsNew);


    // --- Inicialização ---
    function updateSyncStatusUI() {
        if (!syncStatusText || !lastSyncTimeDisplay) return;
        
        if (!auth.currentUser) {
            syncStatusText.innerHTML = 'Status: <span style="color: #666;">Offline (Sem conta)</span>';
            lastSyncTimeDisplay.textContent = 'N/A';
            if (forceSyncButton) forceSyncButton.disabled = true;
            return;
        }

        if (forceSyncButton) forceSyncButton.disabled = false;
        
        if (navigator.onLine) {
            syncStatusText.innerHTML = 'Status: <span style="color: #28a745;">Online (Sincronizado)</span>';
        } else {
            syncStatusText.innerHTML = 'Status: <span style="color: #ffc107;">Offline (Aguardando conexão)</span>';
        }

        if (appData.lastUpdated) {
            const date = new Date(appData.lastUpdated);
            lastSyncTimeDisplay.textContent = date.toLocaleString();
        } else {
            lastSyncTimeDisplay.textContent = 'Nunca';
        }
    };

    // Firebase Auth Logic
    var isSyncing = false;
    
    async function saveToFirestore() {
        if (!auth.currentUser || isSyncing) return;
        if (!navigator.onLine) {
            console.log("Offline: Skipping Firestore save.");
            return;
        }
        try {
            isSyncing = true;
            const dataToSave = JSON.parse(JSON.stringify(appData));
            if (dataToSave.settings) {
                delete dataToSave.settings.customNotificationSound; // Don't save large base64 to Firestore
            }
            const path = 'users/' + auth.currentUser.uid;
            console.log("Attempting to save to Firestore at path:", path);
            console.log("Data to save:", dataToSave);
            try {
                await setDoc(doc(db, 'users', auth.currentUser.uid), dataToSave);
                console.log("Data saved to Firestore.");
            } catch (err) {
                console.error("Error during setDoc:", err);
                throw handleFirestoreError(err, 'write', path);
            }
        } catch (error) {
            console.error("Error saving to Firestore:", error);
        } finally {
            isSyncing = false;
            updateSyncStatusUI();
        }
    };

    function handleFirestoreError(error, operationType, path) {
        const errInfo = {
            error: error instanceof Error ? error.message : String(error),
            authInfo: {
                userId: auth.currentUser?.uid,
                email: auth.currentUser?.email,
                emailVerified: auth.currentUser?.emailVerified,
                isAnonymous: auth.currentUser?.isAnonymous,
                tenantId: auth.currentUser?.tenantId,
                providerInfo: auth.currentUser?.providerData.map(provider => ({
                    providerId: provider.providerId,
                    displayName: provider.displayName,
                    email: provider.email,
                    photoUrl: provider.photoURL
                })) || []
            },
            operationType,
            path
        };
        console.error('Firestore Error: ', JSON.stringify(errInfo));
        // Se for erro de permissão, lançamos o erro formatado conforme as diretrizes
        if (errInfo.error.includes('Missing or insufficient permissions')) {
            throw new Error(JSON.stringify(errInfo));
        }
        // Para outros erros, apenas logamos e retornamos o erro original
        return error;
    }

    async function syncDataWithFirestore(user) {
        if (!user) return;
        if (!navigator.onLine) {
            console.log("Offline: Skipping Firestore sync.");
            if (syncStatusText) syncStatusText.innerHTML = 'Status: <span style="color: #6c757d;">Offline (Aguardando conexão)</span>';
            return;
        }
        try {
            const docRef = doc(db, 'users', user.uid);
            let docSnap;
            try {
                docSnap = await getDoc(docRef);
            } catch (err) {
                // Se falhar por estar offline, tentamos do cache
                if (err.message.includes('offline')) {
                    console.warn("Firestore offline, skipping sync.");
                    return;
                }
                throw handleFirestoreError(err, 'get', 'users/' + user.uid);
            }
            
            const localHasData = appData.schools.length > 0;

            if (docSnap.exists()) {
                const firestoreData = docSnap.data();
                const cloudHasData = firestoreData.schools && firestoreData.schools.length > 0;
                
                const localLastUpdated = appData.lastUpdated || 0;
                const firestoreLastUpdated = firestoreData.lastUpdated || 0;

                // Se o usuário tem dados locais e a nuvem também tem dados, e são diferentes
                if (localHasData && cloudHasData && Math.abs(localLastUpdated - firestoreLastUpdated) > 1000) {
                    const title = "Conflito de Sincronização";
                    const content = `
                        <p>Detectamos dados diferentes no seu dispositivo e na sua conta na nuvem.</p>
                        <p><strong>Dados Locais:</strong> ${appData.schools.length} escolas, atualizado em ${new Date(localLastUpdated).toLocaleString()}</p>
                        <p><strong>Dados na Nuvem:</strong> ${firestoreData.schools.length} escolas, atualizado em ${new Date(firestoreLastUpdated).toLocaleString()}</p>
                        <p style="margin-top: 1rem;">O que você deseja fazer?</p>
                    `;
                    const footer = `
                        <div style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
                            <button type="button" id="migrate-local-to-cloud" class="success w-full">Manter dados deste dispositivo (MIGRAÇÃO)</button>
                            <button type="button" id="use-cloud-data" class="secondary w-full">Usar dados que já estão na nuvem</button>
                        </div>
                    `;
                    
                    showModal(title, content, footer, 'sync-conflict-modal');
                    
                    document.getElementById('migrate-local-to-cloud')?.addEventListener('click', async () => {
                        console.log("User chose to migrate local data.");
                        hideModal();
                        await saveToFirestore();
                        updateSyncStatusUI();
                    });
                    
                    document.getElementById('use-cloud-data')?.addEventListener('click', () => {
                        console.log("User chose to use cloud data.");
                        hideModal();
                        const localSound = appData.settings?.customNotificationSound;
                        appData = firestoreData;
                        if (!appData.settings) appData.settings = {};
                        appData.settings.customNotificationSound = localSound;
                        try { localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(appData)); } catch(e) {}
                        restoreAppState();
                        renderScheduleList();
                        renderSchoolList();
                        applyTheme(appData.settings.theme);
                        updateNotificationSettingsUI();
                        updateCustomSoundUI();
                        showSection(currentSection || 'schedule-section');
                        updateSyncStatusUI();
                    });
                    return;
                }
                
                if (firestoreLastUpdated > localLastUpdated || !localHasData) {
                    console.log("Cloud data is newer or local is empty. Syncing...");
                    const localSound = appData.settings?.customNotificationSound;
                    appData = firestoreData;
                    if (!appData.settings) appData.settings = {};
                    appData.settings.customNotificationSound = localSound;
                    
                    // Save locally without triggering firestore save
                    try { localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(appData)); } catch(e) {}
                    
                    restoreAppState();
                    renderScheduleList();
                    renderSchoolList();
                    applyTheme(appData.settings.theme);
                    updateNotificationSettingsUI();
                    updateCustomSoundUI();
                    if (currentSection === 'classes-section' && currentSchoolId) { renderClassList(currentSchoolId); }
                    else if (currentSection === 'class-details-section' && currentClassId) { selectClass(currentClassId, true); }
                    showSection(currentSection || 'schedule-section');
                } else if (localLastUpdated > firestoreLastUpdated) {
                    console.log("Local data is newer. Pushing to cloud...");
                    await saveToFirestore();
                }
                updateSyncStatusUI();
            } else {
                // Novo documento no Firestore
                if (localHasData) {
                    console.log("New account detected. Migrating local data to cloud...");
                }
                await saveToFirestore();
            }
        } catch (error) {
            console.error("Error syncing with Firestore:", error);
            if (syncStatusText) syncStatusText.innerHTML = 'Status: <span style="color: #dc3545;">Erro na sincronização</span>';
        }
    };

    forceSyncButton?.addEventListener('click', () => {
        if (!auth.currentUser) {
            customAlert("Você precisa estar logado para sincronizar com a nuvem.");
            return;
        }
        if (!navigator.onLine) {
            customAlert("Você está offline. Conecte-se à internet para sincronizar.");
            return;
        }
        syncDataWithFirestore(auth.currentUser);
        customAlert("Sincronização iniciada!");
    });

    window.addEventListener('online', updateSyncStatusUI);
    window.addEventListener('offline', updateSyncStatusUI);

    const loggedOutState = document.getElementById('logged-out-state');
    const loggedInState = document.getElementById('logged-in-state');
    const settingsUserEmail = document.getElementById('settings-user-email');

    // showLoginPrompt removido e integrado ao showWhatsNew


    onAuthStateChanged(auth, (user) => {
        if (user) {
            if (settingsUserEmail) settingsUserEmail.textContent = user.email;
            if (loggedOutState) loggedOutState.style.display = 'none';
            if (loggedInState) loggedInState.style.display = 'block';
            syncDataWithFirestore(user);
        } else {
            const wasLoggedIn = settingsUserEmail && settingsUserEmail.textContent !== '';
            if (settingsUserEmail) settingsUserEmail.textContent = '';
            if (loggedOutState) loggedOutState.style.display = 'block';
            if (loggedInState) loggedInState.style.display = 'none';
            
            if (wasLoggedIn) {
                // Reset data when logged out to ensure privacy
                appData = {
                    schools: [], classes: [], students: [], schedule: [],
                    settings: { theme: 'theme-light', globalNotificationsEnabled: true, notificationSoundEnabled: true, customNotificationSound: null, navStyle: 'fixed' }
                };
                currentSchoolId = null;
                currentClassId = null;
                currentSection = 'schedule-section';
                localStorage.removeItem(DATA_STORAGE_KEY);
                localStorage.removeItem('lastSection');
                localStorage.removeItem('lastSchoolId');
                localStorage.removeItem('lastClassId');
                renderScheduleList();
                renderSchoolList();
                applyTheme(appData.settings.theme);
                applyNavStyle(appData.settings.navStyle);
                showSection('schedule-section');
            } else {
                // Se não estava logado e acabou de entrar, verificamos se mostramos o prompt
                // Mas apenas se NÃO estivermos mostrando o modal de novidades (que chamará o prompt ao fechar)
                if (!showingWhatsNew && !sessionStorage.getItem('loginPromptShown')) {
                    console.log("Not showing Whats New, triggering login prompt delay...");
                    setTimeout(showWhatsNew, 2000);
                } else {
                    console.log("Whats New is active or already shown, skipping initial prompt.");
                }
            }
        }
    });

    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            const confirmLogout = await customConfirm("Deseja realmente desconectar/trocar de conta?\n\nAviso: Certifique-se de que seus dados foram sincronizados. Alterações não salvas podem ser perdidas.");
            if (confirmLogout) {
                signOut(auth).then(() => {
                    customAlert('Deslogado com sucesso!');
                }).catch((error) => {
                    console.error('Logout error', error);
                });
            }
        });
    }

    authButton.addEventListener('click', () => {
        if (!auth.currentUser) {
            const modalContent = `
                <form id="login-form" style="display: flex; flex-direction: column; gap: 15px;">
                    <div style="text-align: center; margin-bottom: 10px;">
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">Faça login para sincronizar seus dados na nuvem e acessá-los de qualquer dispositivo.</p>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 10px; background: var(--bg-color); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color);">
                        <button type="button" id="btn-login-google" class="primary" style="display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px; font-size: 1rem;">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
                            Entrar com Google
                        </button>
                        <p style="text-align: center; font-size: 0.8rem; color: #28a745; margin: 0; font-weight: bold;"><span class="icon icon-auto-awesome"></span> Melhor método e mais seguro</p>
                    </div>

                    <div style="display: flex; align-items: center; margin: 10px 0;">
                        <hr style="flex-grow: 1; border: none; border-top: 1px solid var(--border-color);">
                        <span style="padding: 0 10px; color: var(--text-secondary); font-size: 0.8rem;">OU USE EMAIL</span>
                        <hr style="flex-grow: 1; border: none; border-top: 1px solid var(--border-color);">
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 15px; background: var(--bg-color); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color);">
                        <div class="form-group" style="margin-bottom: 0;">
                            <label for="login-email" style="font-weight: 500;">Email:</label>
                            <input type="email" id="login-email" placeholder="seu@email.com" required style="padding: 10px; border-radius: 6px; border: 1px solid var(--border-color); width: 100%; box-sizing: border-box;">
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label for="login-password" style="font-weight: 500;">Senha:</label>
                            <input type="password" id="login-password" placeholder="Sua senha" required style="padding: 10px; border-radius: 6px; border: 1px solid var(--border-color); width: 100%; box-sizing: border-box;">
                        </div>
                        <div style="display: flex; gap: 10px; margin-top: 5px;">
                            <button type="button" id="btn-login-email" class="primary" style="flex: 1; padding: 10px;">Entrar</button>
                            <button type="button" id="btn-register-email" class="secondary" style="flex: 1; padding: 10px;">Registrar</button>
                        </div>
                    </div>
                </form>
            `;
            showModal('Entrar no Super Professor Pro', modalContent, '', 'login-modal-class');
            
            document.getElementById('btn-login-google').addEventListener('click', () => {
                signInWithPopup(auth, provider).then((result) => {
                    hideModal();
                    customAlert('Logado com sucesso!');
                }).catch((error) => {
                    console.error('Login error', error);
                    customAlert('Erro ao fazer login: ' + error.message);
                });
            });

            document.getElementById('btn-login-email').addEventListener('click', () => {
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                if (!email || !password) {
                    customAlert('Preencha email e senha.');
                    return;
                }
                signInWithEmailAndPassword(auth, email, password).then(() => {
                    hideModal();
                    customAlert('Logado com sucesso!');
                }).catch((error) => {
                    console.error('Login error', error);
                    customAlert('Erro ao fazer login: ' + error.message);
                });
            });

            document.getElementById('btn-register-email').addEventListener('click', () => {
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                if (!email || !password) {
                    customAlert('Preencha email e senha.');
                    return;
                }
                createUserWithEmailAndPassword(auth, email, password).then(() => {
                    hideModal();
                    customAlert('Registrado e logado com sucesso!');
                }).catch((error) => {
                    console.error('Register error', error);
                    customAlert('Erro ao registrar: ' + error.message);
                });
            });
        }
    });

    // Service Worker
    if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('./pwabuilder-sw.js', { scope: './' }) .then(registration => { console.log('ServiceWorker registration successful with scope: ', registration.scope); }) .catch(err => { console.log('ServiceWorker registration failed (scope ./): ', err); navigator.serviceWorker.register('./pwabuilder-sw.js') .then(registration => { console.log('ServiceWorker registration successful with relative path scope: ', registration.scope); }) .catch(err2 => { console.log('ServiceWorker registration failed (relative path): ', err2); if (err2.message.includes('404') || err.message.includes('404')) { console.warn("Service Worker file 'pwabuilder-sw.js' not found. Ensure it's in the accessible root or correct relative path."); } else if (err.message.includes('scope') || err2.message.includes('scope')) { console.warn("Service Worker registration failed due to scope mismatch or security issues. Check HTTPS and path."); } }); }); }); }

    // Inicializações Finais
    updateSyncStatusUI();
    const dataWasLoaded = loadData();
    restoreAppState();
    renderScheduleList();
    renderSchoolList();
    applyTheme(appData.settings.theme);
    setTimeout(() => applyNavStyle(appData.settings.navStyle), 100);
    updateNotificationSettingsUI();
    updateCustomSoundUI();
    updateProfileUI();
    const todayStr = getCurrentDateString();
    if (attendanceDateInput) attendanceDateInput.value = todayStr;
    if (lessonPlanDateInput) lessonPlanDateInput.value = todayStr;
    if (currentSection === 'classes-section' && currentSchoolId) { renderClassList(currentSchoolId); }
    else if (currentSection === 'class-details-section' && currentClassId) { selectClass(currentClassId, true); }
    showSection(currentSection || 'schedule-section');
    if (appData.settings.globalNotificationsEnabled) { startNotificationChecker(); }

    // --- New Settings Logic ---
    const soundEffectsToggle = document.getElementById('sound-effects-toggle');
    if (soundEffectsToggle) {
        soundEffectsToggle.checked = appData.settings.interactionSoundsEnabled !== false;
        soundEffectsToggle.addEventListener('change', (e) => {
            appData.settings.interactionSoundsEnabled = e.target.checked;
            saveData();
        });
    }

    const shareWhatsappBtn = document.getElementById('share-whatsapp-btn');
    if (shareWhatsappBtn) {
        shareWhatsappBtn.addEventListener('click', () => {
            const text = "Conheça o Super Professor Pro! Um app incrível para ajudar professores a gerenciar turmas, notas, frequências e gerar planos de aula com IA. Acesse: " + window.location.href;
            const url = "https://api.whatsapp.com/send?text=" + encodeURIComponent(text);
            window.open(url, '_blank');
        });
    }
    
    // --- Interaction Sounds ---
    let sharedAudioCtx = null;
    const playInteractionSound = () => {
        if (appData.settings.interactionSoundsEnabled !== false) {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (!AudioContext) return;
                if (!sharedAudioCtx) sharedAudioCtx = new AudioContext();
                if (sharedAudioCtx.state === 'suspended') sharedAudioCtx.resume();
                
                const osc = sharedAudioCtx.createOscillator();
                const gain = sharedAudioCtx.createGain();
                osc.connect(gain);
                gain.connect(sharedAudioCtx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, sharedAudioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(300, sharedAudioCtx.currentTime + 0.05);
                gain.gain.setValueAtTime(0.1, sharedAudioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, sharedAudioCtx.currentTime + 0.05);
                osc.start(sharedAudioCtx.currentTime);
                osc.stop(sharedAudioCtx.currentTime + 0.05);
            } catch (e) {
                // Ignore audio errors
            }
        }
    };

    // Attach interaction sound to all buttons and nav items
    document.addEventListener('click', (e) => {
        const target = e.target.closest('button, .nav-item, .tab-button, .action-btn');
        if (target) {
            playInteractionSound();
        }
    });


    // Lógica de Verificação da Versão e Login
    const lastSeenVersion = localStorage.getItem('lastSeenAppVersion');
    const isNewUser = lastSeenVersion === null;
    const hasUpdate = lastSeenVersion !== CURRENT_APP_VERSION;
    const isLoggedOut = !auth.currentUser;

    console.log('Versão Atual do App:', CURRENT_APP_VERSION);
    console.log('Última Versão Vista pelo Usuário:', lastSeenVersion);
    
    // Se for um novo usuário, houver atualização ou estiver deslogado (e não mostrou o prompt nesta sessão)
    if (isNewUser || hasUpdate || (isLoggedOut && !sessionStorage.getItem('loginPromptShown'))) {
        showingWhatsNew = true;
        console.log('Mostrando tela de boas-vindas/novidades...');
        // Pequeno delay para garantir que o app carregou e não conflitar com outros modais iniciais
        setTimeout(() => {
            showWhatsNew();
            // Só atualizamos a versão vista se realmente houve uma mudança ou é novo
            if (isNewUser || hasUpdate) {
                localStorage.setItem('lastSeenAppVersion', CURRENT_APP_VERSION);
                console.log('Versão vista atualizada no localStorage para:', CURRENT_APP_VERSION);
            }
        }, 1000);
    }

    // --- Lógica de IA (Assistente Gemini) ---
    const aiEnableToggle = document.getElementById('ai-enable-toggle');
    const aiSettingsContent = document.getElementById('ai-settings-content');
    const aiTutorialBtn = document.getElementById('ai-tutorial-btn');
    const aiTutorialContent = document.getElementById('ai-tutorial-content');
    const aiApiKeyInput = document.getElementById('ai-api-key');
    const saveAiKeyBtn = document.getElementById('save-ai-key-btn');
    const aiGeneratePlanBtn = document.getElementById('ai-generate-plan-btn');
    // lessonPlanTextarea is already declared at the top of the file
    
    // Carregar estado inicial
    const isAiEnabled = localStorage.getItem('ai_enabled') === 'true';
    const savedApiKey = localStorage.getItem('gemini_api_key') || '';
    
    if (aiEnableToggle) {
        aiEnableToggle.checked = isAiEnabled;
        aiSettingsContent.style.display = isAiEnabled ? 'block' : 'none';
        aiApiKeyInput.value = savedApiKey;
        
        aiEnableToggle.addEventListener('change', (e) => {
            const enabled = e.target.checked;
            localStorage.setItem('ai_enabled', enabled);
            aiSettingsContent.style.display = enabled ? 'block' : 'none';
            updateAiButtonVisibility();
        });
    }

    if (aiTutorialBtn) {
        aiTutorialBtn.addEventListener('click', () => {
            const isHidden = aiTutorialContent.style.display === 'none';
            aiTutorialContent.style.display = isHidden ? 'block' : 'none';
        });
    }

    if (saveAiKeyBtn) {
        saveAiKeyBtn.addEventListener('click', () => {
            const key = aiApiKeyInput.value.trim();
            if (key) {
                localStorage.setItem('gemini_api_key', key);
                showNotification('Chave de IA salva com sucesso!', 'success');
                updateAiButtonVisibility();
            } else {
                localStorage.removeItem('gemini_api_key');
                showNotification('Chave removida.', 'info');
                updateAiButtonVisibility();
            }
        });
    }

    function updateAiButtonVisibility() {
        const enabled = localStorage.getItem('ai_enabled') === 'true';
        const hasKey = !!localStorage.getItem('gemini_api_key');
        const show = (enabled && hasKey);
        
        const aiTools = document.querySelectorAll('.ai-tool');
        aiTools.forEach(tool => {
            tool.style.display = show ? '' : 'none';
        });
    }

    // Chama na inicialização para mostrar/esconder o botão na aba da turma
    updateAiButtonVisibility();

    // --- Lógica do Modal de IA ---
    const aiToolModal = document.getElementById('ai-tool-modal');
    const aiToolTitle = document.getElementById('ai-tool-title');
    const aiToolInputsContainer = document.getElementById('ai-tool-inputs-container');
    const aiToolGenerateBtn = document.getElementById('ai-tool-generate-btn');
    const aiToolLoading = document.getElementById('ai-tool-loading');
    const aiToolResultContainer = document.getElementById('ai-tool-result-container');
    const aiToolResultContent = document.getElementById('ai-tool-result-content');
    const aiToolCopyBtn = document.getElementById('ai-tool-copy-btn');
    const aiToolExportPdfBtn = document.getElementById('ai-tool-export-pdf-btn');

    let currentAiTool = null;

    function openAiModal(toolType) {
        currentAiTool = toolType;
        aiToolResultContainer.classList.add('hidden');
        aiToolResultContent.innerHTML = '';
        aiToolInputsContainer.innerHTML = '';
        
        let classSelectOptions = `<option value="">-- Selecionar Turma (Opcional) --</option>`;
        appData.classes.forEach(c => {
            const school = findSchoolById(c.schoolId);
            const schoolName = school ? school.name : '';
            const isSelected = (currentClassId === c.id) ? 'selected' : '';
            classSelectOptions += `<option value="${c.id}" ${isSelected}>${sanitizeHTML(c.name)} ${c.year ? '(' + sanitizeHTML(c.year) + ')' : ''} - ${sanitizeHTML(c.subject || 'Sem Matéria')} - ${sanitizeHTML(schoolName)}</option>`;
        });
        
        if (toolType === 'lesson-plan') {
            aiToolTitle.textContent = 'Gerar Esboço de Aula';
            
            let contextText = "Nenhuma turma selecionada.";
            if (currentClassId) {
                const selectedClass = findClassById(currentClassId);
                contextText = `Turma: ${selectedClass.name}\n`;
                if (selectedClass.year) contextText += `Ano/Série: ${selectedClass.year}\n`;
                if (selectedClass.subject) contextText += `Disciplina: ${selectedClass.subject}\n`;
            }

            aiToolInputsContainer.innerHTML = `
                <div class="form-group">
                    <label>Contexto da Turma:</label>
                    <textarea id="ai-input-contexto" rows="3" class="w-full" readonly>${contextText}</textarea>
                </div>
                <div class="form-group">
                    <label>Instruções para a IA:</label>
                    <textarea id="ai-input-instrucoes" placeholder="Ex: Crie um plano de aula sobre Revolução Francesa focado em causas e consequências..." class="w-full" rows="4"></textarea>
                </div>
            `;
        } else if (toolType === 'exam-assistant') {
            aiToolTitle.textContent = 'Assistente de Provas';
            aiToolInputsContainer.innerHTML = `
                <div class="form-group">
                    <label>Turma (Opcional):</label>
                    <select id="ai-input-turma" class="w-full">
                        ${classSelectOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Assunto/Conteúdo da Prova:</label>
                    <input type="text" id="ai-input-assunto" placeholder="Ex: Equações do 2º grau" class="w-full">
                </div>
                <div class="form-group">
                    <label>Nível/Ano Escolar (Preenchido automaticamente se turma selecionada):</label>
                    <input type="text" id="ai-input-nivel" placeholder="Ex: 9º ano do Ensino Fundamental" class="w-full">
                </div>
                <div class="form-group">
                    <label>Quantidade de Questões:</label>
                    <input type="number" id="ai-input-qtd" value="5" min="1" max="20" class="w-full">
                </div>
            `;
            
            setTimeout(() => {
                const turmaSelect = document.getElementById('ai-input-turma');
                if (turmaSelect) {
                    const updateNivel = () => {
                        const classId = turmaSelect.value;
                        if (classId) {
                            const selectedClass = findClassById(classId);
                            if (selectedClass && selectedClass.year) {
                                document.getElementById('ai-input-nivel').value = selectedClass.year;
                            }
                        }
                    };
                    turmaSelect.addEventListener('change', updateNivel);
                    updateNivel(); // Call initially
                }
            }, 0);
        } else if (toolType === 'question-generator') {
            aiToolTitle.textContent = 'Gerador de Questões (Específicas)';
            aiToolInputsContainer.innerHTML = `
                <div class="form-group">
                    <label>Turma (Opcional):</label>
                    <select id="ai-input-turma" class="w-full">
                        ${classSelectOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Tópico Específico:</label>
                    <input type="text" id="ai-input-topico" placeholder="Ex: Fotossíntese" class="w-full">
                </div>
                <div class="form-group">
                    <label>Tipo de Questão:</label>
                    <select id="ai-input-tipo" class="w-full">
                        <option value="Múltipla Escolha">Múltipla Escolha</option>
                        <option value="Dissertativa">Dissertativa</option>
                        <option value="Verdadeiro ou Falso">Verdadeiro ou Falso</option>
                    </select>
                </div>
            `;
        } else if (toolType === 'exam-corrector') {
            aiToolTitle.textContent = 'Corretor de Provas (com Câmera)';
            aiToolInputsContainer.innerHTML = `
                <div class="form-group">
                    <label>Gabarito / Respostas Esperadas:</label>
                    <textarea id="ai-input-gabarito" rows="4" placeholder="Ex: 1-A, 2-B, 3-A fotossíntese é o processo..." class="w-full"></textarea>
                </div>
                <div class="form-group">
                    <label>Foto da Prova do Aluno:</label>
                    <label for="ai-input-prova-img" class="btn btn-secondary w-full text-center cursor-pointer" style="display: block; background-color: #6c757d; color: white; border-radius: 4px; padding: 10px; font-weight: bold;">
                        Tirar Foto / Escolher Imagem
                    </label>
                    <input type="file" id="ai-input-prova-img" accept="image/*" capture="environment" class="hidden" style="display: none;">
                    <img id="ai-preview-prova-img" style="display: none; max-width: 100%; margin-top: 10px; border-radius: 8px; border: 1px solid var(--border-color);" />
                </div>
                <div class="form-group">
                    <label>Critérios de Correção (Opcional):</label>
                    <input type="text" id="ai-input-criterios" placeholder="Ex: Seja rigoroso com a ortografia" class="w-full">
                </div>
            `;
            setTimeout(() => {
                const fileInput = document.getElementById('ai-input-prova-img');
                const imgPreview = document.getElementById('ai-preview-prova-img');
                if (fileInput) {
                    fileInput.addEventListener('change', (e) => {
                        const file = e.target.files[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                imgPreview.src = e.target.result;
                                imgPreview.style.display = 'block';
                            };
                            reader.readAsDataURL(file);
                        } else {
                            imgPreview.style.display = 'none';
                            imgPreview.src = '';
                        }
                    });
                }
            }, 0);




        } else if (toolType === 'analyze-class') {
            aiToolTitle.textContent = 'Analisar Turma';
            
            let schoolOptions = '<option value="">Selecione uma escola...</option>';
            const schools = appData.schools;
            schools.forEach(s => {
                schoolOptions += `<option value="${s.id}">${sanitizeHTML(s.name)}</option>`;
            });

            aiToolInputsContainer.innerHTML = `
                <div class="form-group">
                    <label>Escola:</label>
                    <select id="ai-input-escola" class="w-full">
                        ${schoolOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>Turma:</label>
                    <select id="ai-input-turma" class="w-full" disabled>
                        <option value="">Selecione uma escola primeiro...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Período de Análise:</label>
                    <select id="ai-input-periodo" class="w-full">
                        <option value="geral">Geral (Todo o período)</option>
                        <option value="dia">Dia Específico</option>
                        <option value="semanal">Semanal (Últimos 7 dias)</option>
                        <option value="mensal">Mensal (Últimos 30 dias)</option>
                        <option value="bimestral">Bimestral</option>
                        <option value="trimestral">Trimestral</option>
                        <option value="semestral">Semestral</option>
                        <option value="personalizado">Período Personalizado</option>
                    </select>
                </div>
                <div class="form-group hidden" id="ai-input-data-container">
                    <label>Data Específica:</label>
                    <input type="date" id="ai-input-data" class="w-full">
                </div>
                <div class="form-group hidden" id="ai-input-data-personalizada-container">
                    <label>Data de Início:</label>
                    <input type="date" id="ai-input-data-inicio" class="w-full mb-2">
                    <label>Data de Fim:</label>
                    <input type="date" id="ai-input-data-fim" class="w-full">
                </div>
            `;

            setTimeout(() => {
                const escolaSelect = document.getElementById('ai-input-escola');
                const turmaSelect = document.getElementById('ai-input-turma');
                const periodoSelect = document.getElementById('ai-input-periodo');
                const dataContainer = document.getElementById('ai-input-data-container');
                const dataInput = document.getElementById('ai-input-data');
                const dataPersonalizadaContainer = document.getElementById('ai-input-data-personalizada-container');
                
                if (periodoSelect && dataContainer && dataInput) {
                    periodoSelect.addEventListener('change', () => {
                        if (periodoSelect.value === 'dia') {
                            dataContainer.classList.remove('hidden');
                            dataInput.value = getCurrentDateString();
                            if (dataPersonalizadaContainer) dataPersonalizadaContainer.classList.add('hidden');
                        } else if (periodoSelect.value === 'personalizado') {
                            dataContainer.classList.add('hidden');
                            if (dataPersonalizadaContainer) dataPersonalizadaContainer.classList.remove('hidden');
                        } else {
                            dataContainer.classList.add('hidden');
                            if (dataPersonalizadaContainer) dataPersonalizadaContainer.classList.add('hidden');
                        }
                    });
                }
                
                if (escolaSelect && turmaSelect) {
                    escolaSelect.addEventListener('change', () => {
                        const schoolId = escolaSelect.value;
                        if (schoolId) {
                            const classes = appData.classes.filter(c => c.schoolId === schoolId);
                            let classOpts = '<option value="">Selecione uma turma...</option>';
                            classes.forEach(c => {
                                classOpts += `<option value="${c.id}">${sanitizeHTML(c.name)} ${c.year ? '(' + sanitizeHTML(c.year) + ')' : ''} - ${sanitizeHTML(c.subject || 'Sem Matéria')}</option>`;
                            });
                            turmaSelect.innerHTML = classOpts;
                            turmaSelect.disabled = false;
                        } else {
                            turmaSelect.innerHTML = '<option value="">Selecione uma escola primeiro...</option>';
                            turmaSelect.disabled = true;
                        }
                    });
                }
            }, 0);
        }
        
        aiToolModal.classList.add('show');
    }

    if (aiGeneratePlanBtn) {
        aiGeneratePlanBtn.addEventListener('click', () => {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) {
                showNotification('Configure sua chave de IA na aba de Ajustes.', 'error');
                return;
            }
            openAiModal('lesson-plan');
        });
    }

    const toolExamAssistant = document.getElementById('tool-exam-assistant');
    if (toolExamAssistant) {
        toolExamAssistant.addEventListener('click', () => {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) {
                showNotification('Configure sua chave de IA na aba de Ajustes.', 'error');
                return;
            }
            openAiModal('exam-assistant');
        });
    }

    const toolQuestionGenerator = document.getElementById('tool-question-generator');
    if (toolQuestionGenerator) {
        toolQuestionGenerator.addEventListener('click', () => {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) {
                showNotification('Configure sua chave de IA na aba de Ajustes.', 'error');
                return;
            }
            openAiModal('question-generator');
        });
    }

    const toolExamCorrector = document.getElementById('tool-exam-corrector');
    if (toolExamCorrector) {
        toolExamCorrector.addEventListener('click', () => {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) {
                showNotification('Configure sua chave de IA na aba de Ajustes.', 'error');
                return;
            }
            openAiModal('exam-corrector');
        });
    }

    const toolClassAnalyzerBtn = document.getElementById('tool-class-analyzer');
    if (toolClassAnalyzerBtn) {
        toolClassAnalyzerBtn.addEventListener('click', () => {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) {
                showNotification('Configure sua chave de IA na aba de Ajustes.', 'error');
                return;
            }
            openAiModal('analyze-class');
        });
    }

    if (aiToolGenerateBtn) {
        aiToolGenerateBtn.addEventListener('click', async () => {
            const apiKey = localStorage.getItem('gemini_api_key');
            if (!apiKey) return;

            let promptText = "";
            
            const teacherProfileContext = appData.userProfile?.subjects ? `\n\nContexto do Professor: Você é um professor com formação/leciona na(s) seguinte(s) matéria(s): ${appData.userProfile.subjects}. Use isso para guiar o tom e a profundidade do conteúdo gerado, se aplicável.` : '';

            if (currentAiTool === 'lesson-plan') {
                const instrucoes = document.getElementById('ai-input-instrucoes').value.trim();
                const contexto = document.getElementById('ai-input-contexto').value;
                if (!instrucoes) return showNotification('Preencha as instruções.', 'error');
                promptText = `Aja como um professor experiente. Baseado no seguinte contexto da turma:\n${contexto}\n\nCrie um esboço de plano de aula seguindo estas instruções: "${instrucoes}". Inclua: 1. Objetivos, 2. Introdução, 3. Desenvolvimento, 4. Conclusão/Atividade. Seja direto e prático. Formate em Markdown.`;
            } else if (currentAiTool === 'exam-assistant') {
                const assunto = document.getElementById('ai-input-assunto').value.trim();
                const nivel = document.getElementById('ai-input-nivel').value.trim();
                const qtd = document.getElementById('ai-input-qtd').value;
                const turmaId = document.getElementById('ai-input-turma')?.value;
                let context = '';
                if (turmaId) {
                    const selectedClass = findClassById(turmaId);
                    if (selectedClass) {
                        context = `A prova é para a turma "${selectedClass.name}"${selectedClass.year ? ' do ano/série "' + selectedClass.year + '"' : ''}${selectedClass.subject ? ' da disciplina de "' + selectedClass.subject + '"' : ''}. Adapte a linguagem e a complexidade para este público específico. `;
                    }
                }
                if (!assunto || !nivel) return showNotification('Preencha os campos.', 'error');
                promptText = `Aja como um professor experiente elaborando uma prova. ${context}Crie uma prova com ${qtd} questões sobre "${assunto}" para alunos do "${nivel}". Inclua uma mistura de questões objetivas e discursivas. No final, forneça o gabarito. Formate em Markdown.`;
            } else if (currentAiTool === 'question-generator') {
                const topico = document.getElementById('ai-input-topico').value.trim();
                const tipo = document.getElementById('ai-input-tipo').value;
                const turmaId = document.getElementById('ai-input-turma')?.value;
                let context = '';
                if (turmaId) {
                    const selectedClass = findClassById(turmaId);
                    if (selectedClass) {
                        context = `A questão é para a turma "${selectedClass.name}"${selectedClass.year ? ' do ano/série "' + selectedClass.year + '"' : ''}${selectedClass.subject ? ' da disciplina de "' + selectedClass.subject + '"' : ''}. Adapte a linguagem e a complexidade para este público específico. `;
                    }
                }
                if (!topico) return showNotification('Preencha o tópico.', 'error');
                promptText = `Aja como um professor. ${context}Crie 1 questão do tipo "${tipo}" sobre o tópico "${topico}". Inclua a resposta correta e uma breve explicação. Formate em Markdown.`;
            } else if (currentAiTool === 'exam-corrector') {
                const gabarito = document.getElementById('ai-input-gabarito').value.trim();
                const criterios = document.getElementById('ai-input-criterios').value.trim();
                const imgPreview = document.getElementById('ai-preview-prova-img');
                
                if (!imgPreview.src || imgPreview.src === '' || imgPreview.style.display === 'none') {
                    aiToolGenerateBtn.disabled = false;
                    aiToolLoading.classList.add('hidden');
                    return showNotification('Por favor, tire uma foto ou selecione uma imagem da prova.', 'error');
                }
                
                let context = '';
                if (gabarito) {
                    context += `Utilize o seguinte gabarito/respostas corretas como base para a correção: "\n${gabarito}\n".\n`;
                }
                if (criterios) {
                    context += `Considere os seguintes critérios de correção: "${criterios}".\n`;
                }
                
                promptText = `Aja como um professor corrigindo uma prova. ${context}Analise a imagem da prova do aluno fornecida. Identifique as questões, as respostas do aluno e avalie se estão corretas, incorretas ou parcialmente corretas. Forneça um feedback construtivo e, se possível, uma nota estimada. Formate a saída em Markdown, destacando os acertos e erros.`;
            } else if (currentAiTool === 'analyze-class') {
                const turmaId = document.getElementById('ai-input-turma').value;
                const periodo = document.getElementById('ai-input-periodo').value;
                const dataEspecifica = document.getElementById('ai-input-data')?.value;
                const dataInicio = document.getElementById('ai-input-data-inicio')?.value;
                const dataFim = document.getElementById('ai-input-data-fim')?.value;
                
                if (!turmaId) return showNotification('Selecione uma turma.', 'error');
                if (periodo === 'dia' && !dataEspecifica) return showNotification('Selecione uma data.', 'error');
                if (periodo === 'personalizado' && (!dataInicio || !dataFim)) return showNotification('Selecione a data de início e fim.', 'error');
                if (periodo === 'personalizado' && (new Date(dataInicio) > new Date(dataFim))) return showNotification('A data de início não pode ser maior que a data de fim.', 'error');
                
                const selectedClass = findClassById(turmaId);
                const students = getStudentsByClass(turmaId);
                
                let filteredDates = [];
                const allDates = new Set();
                students.forEach(s => Object.keys(s.attendance || {}).forEach(d => allDates.add(d)));
                
                const today = new Date();
                const sortedDates = Array.from(allDates).sort();
                
                if (periodo === 'dia') {
                    filteredDates = [dataEspecifica];
                } else if (periodo === 'semanal') {
                    const lastWeek = new Date(today);
                    lastWeek.setDate(today.getDate() - 7);
                    filteredDates = sortedDates.filter(d => new Date(d) >= lastWeek);
                } else if (periodo === 'mensal') {
                    const lastMonth = new Date(today);
                    lastMonth.setMonth(today.getMonth() - 1);
                    filteredDates = sortedDates.filter(d => new Date(d) >= lastMonth);
                } else if (periodo === 'bimestral') {
                    const lastBimonth = new Date(today);
                    lastBimonth.setMonth(today.getMonth() - 2);
                    filteredDates = sortedDates.filter(d => new Date(d) >= lastBimonth);
                } else if (periodo === 'trimestral') {
                    const lastTrimonth = new Date(today);
                    lastTrimonth.setMonth(today.getMonth() - 3);
                    filteredDates = sortedDates.filter(d => new Date(d) >= lastTrimonth);
                } else if (periodo === 'semestral') {
                    const lastSemester = new Date(today);
                    lastSemester.setMonth(today.getMonth() - 6);
                    filteredDates = sortedDates.filter(d => new Date(d) >= lastSemester);
                } else if (periodo === 'personalizado') {
                    filteredDates = sortedDates.filter(d => {
                        const date = new Date(d);
                        return date >= new Date(dataInicio) && date <= new Date(dataFim);
                    });
                } else {
                    filteredDates = sortedDates; // geral
                }
                
                let totalPossibleDays = 0;
                let totalPresentDays = 0;
                
                students.forEach(student => {
                    filteredDates.forEach(date => {
                        const record = student.attendance?.[date];
                        if (record && record.status !== 'H') {
                            totalPossibleDays++;
                            if (record.status === 'P') totalPresentDays++;
                        }
                    });
                });
                
                const attendanceRate = totalPossibleDays > 0 ? Math.round((totalPresentDays / totalPossibleDays) * 100) + '%' : 'N/A';
                
                let gradesSummary = '';
                if (selectedClass.gradeStructure && selectedClass.gradeStructure.length > 0) {
                    selectedClass.gradeStructure.forEach(gs => {
                        let totalSum = 0;
                        let count = 0;
                        students.forEach(student => {
                            const studentGrades = student.grades[gs.id];
                            if (studentGrades && studentGrades.average !== null && studentGrades.average !== undefined) {
                                totalSum += studentGrades.average;
                                count++;
                            }
                        });
                        const avg = count > 0 ? (totalSum / count).toFixed(1) : 'N/A';
                        gradesSummary += `- Conjunto "${gs.name}": Média da turma = ${avg}\n`;
                    });
                } else {
                    gradesSummary = 'Nenhuma nota registrada.';
                }
                
                let contextText = `Turma: ${selectedClass.name}\n`;
                if (selectedClass.year) contextText += `Ano/Série: ${selectedClass.year}\n`;
                if (selectedClass.subject) contextText += `Disciplina: ${selectedClass.subject}\n`;
                let periodoStr = periodo;
                if (periodo === 'dia') periodoStr = dataEspecifica;
                else if (periodo === 'personalizado') periodoStr = `de ${dataInicio} até ${dataFim}`;
                contextText += `Período de Análise: ${periodoStr}\n`;
                contextText += `Total de alunos: ${students.length}\n`;
                contextText += `Taxa de Frequência Média no período: ${attendanceRate}\n`;
                contextText += `Resumo de Notas:\n${gradesSummary}\n`;
                
                promptText = `Aja como um coordenador pedagógico e analista de dados educacionais. Baseado nos dados reais da turma abaixo:\n\n${contextText}\n\nGere um relatório completo e bem organizado sobre o perfil da turma. Inclua estatísticas baseadas nos dados reais fornecidos (frequência e notas), pontos fortes, áreas de atenção e recomendações pedagógicas. Use tabelas Markdown para visualizar as estatísticas. O relatório deve ser profissional e pronto para ser exportado em PDF.`;
            }

            promptText += teacherProfileContext;

            // Instruções adicionais para a IA sobre matemática e geometria
            const mathAndGeometryInstructions = `\n\nINSTRUÇÕES DE FORMATAÇÃO E CONTEÚDO:\n1. Forneça APENAS o material solicitado, mantendo-se estritamente no tema. NÃO adicione cálculos, equações ou figuras geométricas se não forem relevantes para o assunto.\n2. Para questões de múltipla escolha, as opções (A, B, C, D, E) DEVEM ser listadas uma abaixo da outra, usando quebra de linha ou uma lista markdown, nunca na mesma linha. Exemplo:\n- A) ...\n- B) ...\n- C) ...\n3. SE o conteúdo envolver matemática: Use formatação LaTeX ($ para linha, $$ para bloco). Pule linha antes e depois de blocos $$. Coloque cada passo de resolução em uma linha separada.\n4. SE o conteúdo exigir figuras geométricas: gere o código SVG correspondente DIRETAMENTE no texto (sem blocos de código markdown), com atributos width e height definidos.`;
            promptText += mathAndGeometryInstructions;

            aiToolGenerateBtn.disabled = true;
            aiToolLoading.classList.remove('hidden');
            aiToolResultContainer.classList.add('hidden');

            try {
                const ai = new GoogleGenAI({ apiKey: apiKey });
                let response;
                
                if (currentAiTool === 'exam-corrector') {
                    const imgPreview = document.getElementById('ai-preview-prova-img');
                    const base64Data = imgPreview.src.split(',')[1];
                    const mimeType = imgPreview.src.split(';')[0].split(':')[1];
                    
                    response = await ai.models.generateContent({
                        model: 'gemini-3-flash-preview', // <-- ALTERE PARA O FLASH
                        contents: {
                            parts: [
                                { text: promptText },
                                {
                                    inlineData: {
                                        data: base64Data,
                                        mimeType: mimeType
                                    }
                                }
                            ]
                        }
                    });
                } else {
                    response = await ai.models.generateContent({
                        model: 'gemini-3-flash-preview',
                        contents: promptText
                    });
                }

                const generatedText = response.text;
                
                // Renderiza usando marked.js se disponível, senão fallback
                if (typeof marked !== 'undefined') {
                    let textToParse = generatedText;
                    const mathBlocks = [];
                    
                    // Protege blocos de matemática (display e inline)
                    textToParse = textToParse.replace(/\$\$([\s\S]+?)\$\$/g, (match) => {
                        mathBlocks.push(match);
                        return `@@MATHBLOCK${mathBlocks.length - 1}@@`;
                    });
                    textToParse = textToParse.replace(/\$([^$\n]+?)\$/g, (match) => {
                        mathBlocks.push(match);
                        return `@@MATHBLOCK${mathBlocks.length - 1}@@`;
                    });

                    let html = marked.parse(textToParse);

                    // Restaura blocos de matemática
                    mathBlocks.forEach((block, index) => {
                        html = html.replace(`@@MATHBLOCK${index}@@`, block);
                    });

                    aiToolResultContent.innerHTML = html;
                    
                    // Renderiza fórmulas matemáticas com MathJax
                    if (typeof MathJax !== 'undefined') {
                        MathJax.typesetPromise([aiToolResultContent]).catch(function (err) {
                            console.error('MathJax error:', err.message);
                        });
                    }
                } else {
                    aiToolResultContent.innerHTML = generatedText.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                }
                aiToolResultContent.dataset.rawText = generatedText;
                
                aiToolResultContainer.classList.remove('hidden');
                
                const addToLessonPlanBtn = document.getElementById('ai-tool-add-to-lesson-plan-btn');
                if (addToLessonPlanBtn) {
                    if (currentAiTool === 'lesson-plan') {
                        addToLessonPlanBtn.classList.remove('hidden');
                    } else {
                        addToLessonPlanBtn.classList.add('hidden');
                    }
                }
                
                showNotification('Conteúdo gerado com sucesso!', 'success');

            } catch (error) {
                showNotification('Erro ao conectar com a IA: ' + error.message, 'error');
            } finally {
                aiToolGenerateBtn.disabled = false;
                aiToolLoading.classList.add('hidden');
            }
        });
    }

    if (aiToolCopyBtn) {
        aiToolCopyBtn.addEventListener('click', () => {
            const text = aiToolResultContent.dataset.rawText || aiToolResultContent.innerText;
            navigator.clipboard.writeText(text).then(() => {
                showNotification('Texto copiado!', 'success');
            }).catch(() => {
                showNotification('Erro ao copiar texto.', 'error');
            });
        });
    }

    const aiToolAddToLessonPlanBtn = document.getElementById('ai-tool-add-to-lesson-plan-btn');
    if (aiToolAddToLessonPlanBtn) {
        aiToolAddToLessonPlanBtn.addEventListener('click', () => {
            const text = aiToolResultContent.dataset.rawText || aiToolResultContent.innerText;
            
            // Close AI modal
            const aiModal = document.getElementById('ai-tool-modal');
            if (aiModal) aiModal.classList.remove('show');
            
            // Open Lesson Plan modal
            openLessonPlanModal();
            
            // Append text to textarea
            const textarea = document.getElementById('lesson-plan-modal-textarea');
            if (textarea) {
                if (textarea.value) {
                    textarea.value += '\n\n' + text;
                } else {
                    textarea.value = text;
                }
            }
            
            showNotification('Conteúdo adicionado ao Plano de Aula!', 'success');
        });
    }

    if (aiToolExportPdfBtn) {
        aiToolExportPdfBtn.addEventListener('click', async () => {
            if (typeof html2pdf === 'undefined') {
                showNotification('Biblioteca de PDF não carregada.', 'error');
                return;
            }
            
            // Wait for MathJax to finish rendering in the original element if needed
            if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
                await MathJax.typesetPromise([aiToolResultContent]);
            }
            
            const htmlString = `
                <div style="width: 760px; background-color: white; color: black; padding: 20px 40px; font-family: Arial, sans-serif; line-height: 1.6;">
                    <style>
                        h1, h2, h3, h4, h5, h6 { color: #333; margin-top: 24px; margin-bottom: 16px; font-weight: bold; }
                        p { margin-bottom: 16px; color: #000; }
                        ul, ol { margin-bottom: 16px; padding-left: 30px; color: #000; }
                        li { margin-bottom: 8px; }
                        pre { background-color: #f5f5f5; padding: 16px; border-radius: 8px; white-space: pre-wrap; word-break: break-word; border: 1px solid #e5e5e5; }
                        code { background-color: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-family: monospace; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
                        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; color: #000; }
                        th { background-color: #f9f9f9; font-weight: bold; }
                        blockquote { border-left: 4px solid #ccc; margin: 0; padding-left: 16px; color: #555; }
                        svg { max-width: 100%; height: auto; }
                    </style>
                    <h2 style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 15px; color: #222;">
                        ${aiToolTitle.textContent || 'Documento'}
                    </h2>
                    <div style="color: black;">
                        ${aiToolResultContent.innerHTML}
                    </div>
                </div>
            `;

            const opt = {
                margin:       [15, 15, 15, 15],
                filename:     `${(aiToolTitle.textContent || 'Documento').replace(/\s+/g, '_')}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true, logging: false },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
            };

            html2pdf().set(opt).from(htmlString).save().then(() => {
                showNotification('PDF exportado com sucesso!', 'success');
            }).catch(err => {
                console.error('Erro ao exportar PDF:', err);
                showNotification('Erro ao exportar PDF.', 'error');
            });
        });
    }

}); // Fim do DOMContentLoaded
