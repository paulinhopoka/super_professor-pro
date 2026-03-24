/* --- INÍCIO ARQUIVO: detalhes-turma.js --- */

const ClassDetailsModule = (() => {
    // --- Seletores (Escopo dentro do módulo) ---
    let sectionElement = null; // Referência à seção principal
    let studentListContainer = null;
    let attendanceTableContainer = null;
    let attendanceDateInput = null;
    let classDetailsTitleElement = null; // Renomeado para evitar conflito com variável global
    let classDetailsHeaderElement = null; // Renomeado
    let saveAttendanceButton = null;
    let helpButton = null;

    // Referência aos dados principais da aplicação (será setada no init)
    let mainAppDataRef = null;
    // Referência à função de salvar global (será setada no init)
    let globalSaveData = () => { console.warn("globalSaveData não definida em ClassDetailsModule"); };
    // Referência à função de showModal global
    let globalShowModal = (title, content, footer, modalClass) => { console.warn("globalShowModal não definida"); };
    // Referência à função de hideModal global
    let globalHideModal = () => { console.warn("globalHideModal não definida"); };

    let currentClassId = null;
    let currentStudentObservations = []; // Mantém estado local para edição de obs

    // --- Funções Utilitárias (Adaptadas para usar mainAppDataRef) ---
    const findClassById = (id) => mainAppDataRef?.classes.find(c => c.id === id);
    const findStudentById = (id) => mainAppDataRef?.students.find(s => s.id === id);
    const getStudentsByClass = (classId) => {
        if (!mainAppDataRef) return [];
        return mainAppDataRef.students
               .filter(s => s.classId === classId)
               .sort((a, b) => (a.number || Infinity) - (b.number || Infinity));
    };
    const sanitizeHTML = (str) => {
        // Usar a função global se disponível, senão uma básica
        if (typeof window.sanitizeHTML === 'function') {
            return window.sanitizeHTML(str);
        }
        const temp = document.createElement('div');
        temp.textContent = str || '';
        return temp.innerHTML;
    };
     const formatDate = (dateString) => {
        // Usar a função global se disponível
        if (typeof window.formatDate === 'function') {
            return window.formatDate(dateString);
        }
         if(!dateString) return '';
         try {
             const [y, m, d] = dateString.split('-');
             if (!y || !m || !d) return dateString; // Retorna original se não for formato YYYY-MM-DD
             return `${d}/${m}/${y}`;
         } catch { return dateString; }
     };
    const getCurrentDateString = () => {
        // Usar a função global se disponível
         if (typeof window.getCurrentDateString === 'function') {
            return window.getCurrentDateString();
        }
        return new Date().toISOString().slice(0, 10);
    };

    // --- Funções de Renderização (Usando Seletores Locais e mainAppDataRef) ---
    const renderStudentList = (classId) => {
        if (!studentListContainer || !mainAppDataRef) return;
        studentListContainer.innerHTML = '';
        const students = getStudentsByClass(classId);
        const cls = findClassById(classId);
        if (students.length === 0) {
            studentListContainer.innerHTML = '<p>Nenhum aluno.</p>';
            return;
        }
        const tpl = document.getElementById('student-list-item-template'); // Busca template global
        if (!tpl) {
            console.error("Template student-list-item-template não encontrado!");
            studentListContainer.innerHTML = '<p>Erro: Template de aluno ausente.</p>';
            return;
        }
        students.forEach(std => {
            const clone = tpl.content.cloneNode(true);
            const item = clone.querySelector('.list-item');
            item.dataset.id = std.id;

            const numberSpan = item.querySelector('.student-number');
            const nameSpan = item.querySelector('.student-name');
            const expandButton = item.querySelector('.expand-actions-button');
            const hiddenActions = item.querySelector('.list-item-hidden-actions');
            const repBtn = hiddenActions?.querySelector('.set-representative-button');
            const viceBtn = hiddenActions?.querySelector('.set-vice-button');
            const notesBtn = hiddenActions?.querySelector('.notes-student-button');
            const editBtn = hiddenActions?.querySelector('.edit-student-button');
            const transferBtn = hiddenActions?.querySelector('.transfer-student-button');
            const deleteBtn = hiddenActions?.querySelector('.delete-student-button');

            if (numberSpan) numberSpan.textContent = `${std.number || '-'}.`;
            if (nameSpan) nameSpan.textContent = sanitizeHTML(std.name);

            // Event listeners para botões internos
            expandButton?.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleActions(item);
            });

            if (cls?.representativeId === std.id) {
                item.classList.add('representative');
                if (repBtn) repBtn.title = "Remover Rep.";
            } else {
                 if (repBtn) repBtn.title = "Promover a Rep.";
            }
            if (cls?.viceRepresentativeId === std.id) {
                item.classList.add('vice-representative');
                 if (viceBtn) viceBtn.title = "Remover Vice";
            } else {
                 if (viceBtn) viceBtn.title = "Promover a Vice";
            }

            notesBtn?.addEventListener('click', () => openStudentNotesModal(std.id));
            repBtn?.addEventListener('click', () => toggleRepresentative(std.id));
            viceBtn?.addEventListener('click', () => toggleViceRepresentative(std.id));
            editBtn?.addEventListener('click', () => {
                 // Chama a função global de edição de aluno, se existir
                if (typeof window.openStudentModal === 'function') {
                    window.openStudentModal(std.id);
                } else {
                    alert(`DEMO: Editar ${std.name}. (Função global não encontrada)`);
                }
            });
            transferBtn?.addEventListener('click', () => {
                 // Chama a função global de mover aluno, se existir
                 if (typeof window.openMoveStudentModal === 'function') {
                    window.openMoveStudentModal(std.id);
                } else {
                    alert(`DEMO: Transferir ${std.name}. (Função global não encontrada)`);
                }
            });
            deleteBtn?.addEventListener('click', () => {
                if (confirm(`Excluir ${sanitizeHTML(std.name)}?`)) {
                    // Chama a função global de exclusão, se existir
                    if (typeof window.deleteStudent === 'function') {
                         window.deleteStudent(std.id);
                    } else {
                        alert(`DEMO: Excluir ${std.name}. (Função global não encontrada)`);
                        // Simula remoção visual se a global não existir
                         const student = findStudentById(std.id);
                         if(student) mainAppDataRef.students = mainAppDataRef.students.filter(s => s.id !== std.id);
                         renderStudentList(classId); // Re-renderiza lista localmente
                    }
                }
            });

            studentListContainer.appendChild(item);
        });
    };

    const isStudentSuspendedOnDate = (studentId, dateString) => {
        if (!mainAppDataRef || !dateString) return null;
        const std = findStudentById(studentId);
        if (!std || !Array.isArray(std.notes)) return null;

        return std.notes.find(note =>
            note.category === 'Suspensão' &&
            note.suspensionStartDate &&
            note.suspensionEndDate &&
            dateString >= note.suspensionStartDate &&
            dateString <= note.suspensionEndDate
        );
    };

    const renderAttendanceTable = (classId, date) => {
        if (!attendanceTableContainer || !saveAttendanceButton || !mainAppDataRef) return;
        attendanceTableContainer.innerHTML = '';
        saveAttendanceButton.classList.add('hidden'); // Esconde botão por padrão

        const students = getStudentsByClass(classId);

        if (!date) {
            attendanceTableContainer.innerHTML = '<p>Selecione uma data.</p>';
            return;
        }
        if (students.length === 0) {
            attendanceTableContainer.innerHTML = '<p>Nenhum aluno nesta turma.</p>';
            return;
        }

        saveAttendanceButton.classList.remove('hidden'); // Mostra o botão

        const table = document.createElement('table');
        table.classList.add('data-table');
        table.innerHTML = `<thead><tr><th class="student-col">Aluno</th><th class="attendance-status">Status</th></tr></thead><tbody></tbody>`;
        const tbody = table.querySelector('tbody');
        const tpl = document.getElementById('attendance-row-template'); // Template global
         if (!tpl) {
            console.error("Template attendance-row-template não encontrado!");
            attendanceTableContainer.innerHTML = '<p>Erro: Template de presença ausente.</p>';
            return;
        }

        students.forEach(std => {
            const stdId = std.id;
            const clone = tpl.content.cloneNode(true);
            const row = clone.querySelector('tr');
            row.dataset.studentId = stdId;

            const stdCol = row.querySelector('.student-col');
            if (stdCol) {
                 stdCol.querySelector('.student-number').textContent = `${std.number || '-'}.`;
                 stdCol.querySelector('.student-name').textContent = sanitizeHTML(std.name);
             }

            const statusCell = row.querySelector('.attendance-status');
            if (!statusCell) return;
            statusCell.innerHTML = ''; // Limpa a célula

            const activeSusp = isStudentSuspendedOnDate(stdId, date);
             // Certifica que attendance e a data existem
             if (!std.attendance) std.attendance = {};
            const attRec = std.attendance[date] || { status: null, justification: '' };
             std.attendance[date] = attRec; // Garante que o registro exista nos dados

            if (activeSusp) {
                const noteIdx = findStudentById(stdId).notes.findIndex(n => n === activeSusp);
                row.classList.add('suspended-student', 'clickable-suspended');
                row.dataset.suspensionNoteIndex = noteIdx; // Adiciona índice para clique
                statusCell.innerHTML = `<span class="suspended-indicator" title="${activeSusp.text || 'Suspenso'}"><span class="icon">block</span> Susp.</span>`;
            } else {
                row.classList.remove('suspended-student', 'clickable-suspended');
                row.removeAttribute('data-suspension-note-index');
                const currSt = attRec.status;
                const currJust = attRec.justification || '';

                // Adiciona botões P e F
                 statusCell.innerHTML = `
                    <button type="button" class="attendance-toggle present"><span class="icon"><span class="icon">check</span></span> P</button>
                    <button type="button" class="attendance-toggle absent"><span class="icon"><span class="icon">close</span></span> F</button>
                 `;
                const pBtn = statusCell.querySelector('.present');
                const aBtn = statusCell.querySelector('.absent');

                // Função para atualizar a UI dos botões P/F/FJ
                 const updateUI = (st, just) => {
                     pBtn.classList.toggle('selected', st === 'P');
                     aBtn.classList.toggle('selected', st === 'F');
                     aBtn.classList.toggle('justified', st === 'F' && !!just);
                     aBtn.innerHTML = `<span class="icon"><span class="icon">close</span></span> ${st === 'F' && just ? 'FJ' : 'F'}`;
                     aBtn.title = st === 'F' && just ? `Just.: ${sanitizeHTML(just.substring(0, 30))}... (Clique para editar)` : 'Faltou (Clique para justificar)';
                 };

                updateUI(currSt, currJust);

                pBtn?.addEventListener('click', () => updateAttendanceStatus(stdId, date, 'P'));
                aBtn?.addEventListener('click', () => {
                    if (attRec.status === 'F') {
                        openJustificationModal(stdId, date);
                    } else {
                        updateAttendanceStatus(stdId, date, 'F');
                    }
                });
            }
            tbody.appendChild(row);
        });
        attendanceTableContainer.appendChild(table);
    };

    // --- Funções de Ação (Modificam mainAppDataRef e chamam globalSaveData) ---
    const updateAttendanceStatus = (studentId, date, newStatus) => {
        if (!mainAppDataRef) return;
        const std = findStudentById(studentId);
        if (!std) return;

        // Garante que a estrutura existe
         if (!std.attendance) std.attendance = {};
        if (!std.attendance[date]) std.attendance[date] = { status: null, justification: '' };

        const currentStatus = std.attendance[date].status;

        // Toggle: Se clicar no mesmo status, limpa. Senão, aplica o novo.
        if (currentStatus === newStatus) {
            std.attendance[date].status = null;
        } else {
            std.attendance[date].status = newStatus;
        }

        // Limpa justificação se marcar Presente ou limpar status
        if (std.attendance[date].status === 'P' || std.attendance[date].status === null) {
            std.attendance[date].justification = '';
        }
        // Se marcar Falta pela primeira vez (vindo de null ou P), não abre modal ainda, apenas marca F
        else if (newStatus === 'F' && currentStatus !== 'F') {
             std.attendance[date].justification = ''; // Garante que justificação seja limpa
        }


        console.log(`Local Update: Status ${studentId} @ ${date} -> ${std.attendance[date].status}`);
        // Re-renderiza a tabela para refletir a mudança local imediatamente
        renderAttendanceTable(currentClassId, date);
        // IMPORTANTE: Não chama saveData() aqui. O botão "Salvar Presença" fará isso.
    };

    const openJustificationModal = (studentId, date) => {
        if (!mainAppDataRef) return;
        const std = findStudentById(studentId);
         // Garante que a estrutura existe antes de ler
         if (!std?.attendance) std.attendance = {};
        const attRec = std.attendance[date] || { status: 'F', justification: '' }; // Assume F se não existir
         std.attendance[date] = attRec; // Garante que o registro exista

        const currJust = attRec.justification || '';

        const title = `Justificativa - ${sanitizeHTML(std.name)} (${formatDate(date)})`;
        const body = `<textarea id="j-text" placeholder="Motivo..." style="width:100%;min-height:100px;">${sanitizeHTML(currJust)}</textarea>`;
        const footer = `<button id="save-j" class="success"><span class="icon icon-salvar"></span> Salvar</button>`;

        // Usa a função global para mostrar o modal
        globalShowModal(title, body, footer, 'justification-modal');

        // Adiciona listener ao botão SALVAR do modal específico
        const saveJustificationButton = document.getElementById('save-j'); // Busca no modal global
        if (saveJustificationButton) {
             // Clona para remover listeners antigos
            const clonedButton = saveJustificationButton.cloneNode(true);
            saveJustificationButton.parentNode.replaceChild(clonedButton, saveJustificationButton);

            clonedButton.addEventListener('click', () => {
                const newJ = document.getElementById('j-text')?.value.trim();
                 const studentToUpdate = findStudentById(studentId); // Busca novamente
                 // Garante novamente que a estrutura exista
                 if (studentToUpdate && !studentToUpdate.attendance) studentToUpdate.attendance = {};
                 if (studentToUpdate && !studentToUpdate.attendance[date]) studentToUpdate.attendance[date] = { status: 'F', justification: ''};

                 if (studentToUpdate && studentToUpdate.attendance[date]) {
                    studentToUpdate.attendance[date].status = 'F'; // Garante status F
                    studentToUpdate.attendance[date].justification = newJ;
                    console.log(`Local Update: Justif ${studentId}: "${newJ}"`);
                    globalHideModal();
                    renderAttendanceTable(currentClassId, date); // Re-renderiza
                    // Não salva aqui, espera o botão Salvar Presença
                } else {
                    console.error("Erro ao salvar justificativa: Aluno ou registro de data não encontrado.");
                    alert("Erro ao salvar justificativa.");
                }
            });
        }
    };

     // --- Funções de Observação (Modal) ---
     const openStudentNotesModal = (studentId, noteIndexToHighlight = -1) => {
         if (!mainAppDataRef) return;
         const student = findStudentById(studentId);
         if (!student) return;

         // Carrega observações atuais do aluno para edição local
         currentStudentObservations = JSON.parse(JSON.stringify(student.notes || []));
         // Garante que seja sempre um array
         if (!Array.isArray(currentStudentObservations)) {
            currentStudentObservations = [];
         }

         const title = `Observações - ${student.number || '-'}. ${sanitizeHTML(student.name)}`;
         const modalContent = `
            <div id="student-observations-list"></div>
            <hr style="margin: 1rem 0 0.8rem 0;">
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
                    <div id="suspension-fields" class="form-group hidden" style="display: flex; gap: 10px;">
                        <div style="flex: 1;">
                            <label for="new-suspension-start-date">Início:</label>
                            <input type="date" id="new-suspension-start-date">
                        </div>
                        <div style="flex: 1;">
                            <label for="new-suspension-end-date">Fim:</label>
                            <input type="date" id="new-suspension-end-date">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="new-observation-text">Descrição:</label>
                        <textarea id="new-observation-text" required placeholder="Descreva a observação..."></textarea>
                    </div>
                    <button type="button" id="add-observation-button" class="success">
                       <span class="icon icon-adicionar"></span> Adicionar à Lista
                    </button>
                </form>
            </div>`;
         const footerButtons = `
            <button type="button" id="save-observations-button" class="success">
                <span class="icon icon-salvar"></span> Salvar Observações
            </button>`;

         globalShowModal(title, modalContent, footerButtons, 'student-notes-modal');

         // Renderiza a lista inicial usando a cópia local
         renderStudentObservationsList(noteIndexToHighlight);

         // --- Listeners específicos do modal de observações ---
         const modalElement = document.getElementById('generic-modal'); // O modal genérico
         if (!modalElement) return;

         const categorySelect = modalElement.querySelector('#new-observation-category');
         const suspensionFields = modalElement.querySelector('#suspension-fields');
         const startDateInput = modalElement.querySelector('#new-suspension-start-date');
         const endDateInput = modalElement.querySelector('#new-suspension-end-date');
         const descriptionTextarea = modalElement.querySelector('#new-observation-text');
         const addObsButton = modalElement.querySelector('#add-observation-button');
         const saveObsButton = modalElement.querySelector('#save-observations-button');
         const observationsList = modalElement.querySelector('#student-observations-list');

         const placeholderMap = {
             'Anotação': 'Digite uma anotação rápida...',
             'Observação': 'Descreva a observação...',
             'Ocorrência': 'Detalhe a ocorrência...',
             'Advertência': 'Descreva o motivo da advertência...',
             'Suspensão': 'Descreva o motivo e período da suspensão...'
         };

         // Função para atualizar campos dinâmicos (suspensão, placeholder)
         const updateDynamicFields = () => {
             const selectedCategory = categorySelect?.value || 'Observação';
             if (descriptionTextarea) {
                 descriptionTextarea.placeholder = placeholderMap[selectedCategory] || 'Digite a descrição...';
             }
             const showSuspension = selectedCategory === 'Suspensão';
             suspensionFields?.classList.toggle('hidden', !showSuspension);
             if (startDateInput) startDateInput.required = showSuspension;
             if (endDateInput) endDateInput.required = showSuspension;

             // Atualiza texto do botão Salvar (opcional)
             if(saveObsButton){
                 let saveButtonText = "Salvar Observações";
                 if (selectedCategory === 'Anotação') saveButtonText = "Salvar Anotações";
                 else if (selectedCategory === 'Ocorrência') saveButtonText = "Salvar Ocorrências";
                 else if (selectedCategory === 'Advertência') saveButtonText = "Salvar Advertências";
                 else if (selectedCategory === 'Suspensão') saveButtonText = "Salvar Suspensões";
                 saveObsButton.innerHTML = `<span class="icon icon-salvar"></span> ${saveButtonText}`;
             }
         };

         // Listeners para campos dinâmicos e botões
         categorySelect?.addEventListener('change', updateDynamicFields);
         addObsButton?.addEventListener('click', () => {
             const form = modalElement.querySelector('#add-observation-form');
             if (!form || !form.checkValidity()) {
                 form?.reportValidity();
                 return;
             }
             const category = categorySelect.value;
             const text = descriptionTextarea.value.trim();
             let startDate = null, endDate = null;

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
                     text: text
                 };
                 if (category === 'Suspensão') {
                     newObservation.suspensionStartDate = startDate;
                     newObservation.suspensionEndDate = endDate;
                 }
                 // Adiciona à lista local
                 currentStudentObservations.push(newObservation);
                 // Re-renderiza a lista no modal
                 renderStudentObservationsList(-1); // -1 para não destacar nenhuma
                 // Limpa o formulário
                 if (descriptionTextarea) descriptionTextarea.value = '';
                 if (categorySelect) categorySelect.value = 'Observação'; // Volta para padrão
                 if (startDateInput) startDateInput.value = '';
                 if (endDateInput) endDateInput.value = '';
                 updateDynamicFields(); // Atualiza placeholder e campos
             } else {
                alert("Digite a descrição da observação.");
                descriptionTextarea.focus();
             }
         });

        // Remove listener antigo e adiciona novo para salvar
        const clonedSaveButton = saveObsButton.cloneNode(true);
        saveObsButton.parentNode.replaceChild(clonedSaveButton, saveObsButton);
        clonedSaveButton.addEventListener('click', () => saveStudentObservations(studentId));


        // Listener para excluir itens da lista (delegação)
         observationsList?.addEventListener('click', (e) => {
             const deleteButton = e.target.closest('.delete-observation-button');
             if (deleteButton) {
                 const itemElement = deleteButton.closest('.observation-item');
                 const indexToDelete = parseInt(itemElement?.dataset?.index, 10);
                 if (itemElement && !isNaN(indexToDelete) && indexToDelete >= 0 && indexToDelete < currentStudentObservations.length) {
                    if (confirm(`Excluir esta ${currentStudentObservations[indexToDelete].category || 'observação'}?`)) {
                         // Remove da lista local
                         const removed = currentStudentObservations.splice(indexToDelete, 1);
                         console.log("Removido localmente:", removed);
                         // Re-renderiza a lista no modal
                         renderStudentObservationsList(-1);
                     }
                 } else {
                    console.error("Índice inválido para exclusão:", indexToDelete);
                 }
             }
         });

         // Inicializa campos dinâmicos
         updateDynamicFields();
     };

     // Renderiza a lista de observações DENTRO do modal, usando currentStudentObservations
    const renderStudentObservationsList = (noteIndexToHighlight = -1) => {
        const listContainer = document.querySelector('#generic-modal.show #student-observations-list'); // Busca dentro do modal ativo
        if (!listContainer) return;

        listContainer.innerHTML = ''; // Limpa
        if (currentStudentObservations.length === 0) {
            listContainer.innerHTML = '<p style="text-align: center; padding: 1rem; color: var(--text-secondary);">Nenhuma observação registrada.</p>';
            return;
        }

        // Ordena a cópia local por data para exibição (mais recentes primeiro)
        const sortedNotes = [...currentStudentObservations].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

        const template = document.getElementById('observation-item-template'); // Template global
        if (!template) {
             console.error("Template observation-item-template não encontrado!");
            listContainer.innerHTML = '<p>Erro: Template de observação ausente.</p>';
            return;
        }

        sortedNotes.forEach((note, displayIndex) => {
            // Encontra o índice original na lista não ordenada para o dataset
            const originalIndex = currentStudentObservations.findIndex(origNote => origNote === note);

            const clone = template.content.cloneNode(true);
            const item = clone.querySelector('.observation-item');
            item.dataset.index = originalIndex; // Usa o índice original para exclusão

             // Highlight (se necessário)
             if (noteIndexToHighlight !== -1 && originalIndex === noteIndexToHighlight) {
                 item.classList.add('highlighted-note');
                 // Scroll into view
                 setTimeout(() => item.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
             }

            const categoryClean = (note.category || 'anotacao').toLowerCase().replace(/[^a-z0-9]/g, '');
            item.classList.add(`category-${categoryClean}`);

            const categorySpan = item.querySelector('.category');
            const dateSpan = item.querySelector('.observation-date');
            const textP = item.querySelector('.observation-text');
            const suspensionDatesSpan = item.querySelector('.observation-suspension-dates');

            if (categorySpan) categorySpan.textContent = `${note.category || 'Anotação'}`;
            if (dateSpan) dateSpan.textContent = formatDate(note.date);
            if (textP) textP.textContent = sanitizeHTML(note.text);

            if (suspensionDatesSpan) {
                if (note.category === 'Suspensão' && note.suspensionStartDate && note.suspensionEndDate) {
                    suspensionDatesSpan.textContent = `Período: ${formatDate(note.suspensionStartDate)} a ${formatDate(note.suspensionEndDate)}`;
                    suspensionDatesSpan.classList.remove('hidden');
                } else {
                    suspensionDatesSpan.classList.add('hidden');
                }
            }

            listContainer.appendChild(clone);
        });
    };

     const saveStudentObservations = (studentId) => {
         if (!mainAppDataRef) return;
         const std = findStudentById(studentId);
         if (!std) return;

         // Atualiza os dados principais com a lista local editada
         std.notes = JSON.parse(JSON.stringify(currentStudentObservations));
         globalSaveData(); // Chama a função global para salvar
         globalHideModal(); // Fecha o modal
         alert(`Observações de ${sanitizeHTML(std.name)} salvas!`);
         console.log("Observações salvas:", std.notes);

         // Re-renderiza a tabela de presença para refletir possíveis novas suspensões
         if (currentClassId && attendanceDateInput?.value) {
             renderAttendanceTable(currentClassId, attendanceDateInput.value);
         }
     };

     // --- Funções de Promoção (Representante/Vice) ---
    const toggleRepresentative = (studentId) => {
        if (!mainAppDataRef || !currentClassId) return;
        const cls = findClassById(currentClassId);
        if (!cls) return;
        const studentName = findStudentById(studentId)?.name || 'Aluno(a)';

        if (cls.representativeId === studentId) { // Já é representante -> Remover
            if (confirm(`Remover ${sanitizeHTML(studentName)} do cargo de Representante?`)) {
                cls.representativeId = null;
                console.log(`DEMO: ${studentId} não é mais Rep.`);
                globalSaveData();
                renderStudentList(currentClassId);
            }
        } else { // Não é representante -> Promover
            const isVice = cls.viceRepresentativeId === studentId;
            if (confirm(`Promover ${sanitizeHTML(studentName)} a Representante? ${isVice ? '(Ele deixará de ser Vice)' : ''}`)) {
                if (isVice) cls.viceRepresentativeId = null; // Remove de vice, se for
                cls.representativeId = studentId;
                console.log(`DEMO: ${studentId} definido como Rep.`);
                globalSaveData();
                renderStudentList(currentClassId);
            }
        }
    };
    const toggleViceRepresentative = (studentId) => {
         if (!mainAppDataRef || !currentClassId) return;
        const cls = findClassById(currentClassId);
        if (!cls) return;
        const studentName = findStudentById(studentId)?.name || 'Aluno(a)';

        if (cls.viceRepresentativeId === studentId) { // Já é vice -> Remover
            if (confirm(`Remover ${sanitizeHTML(studentName)} do cargo de Vice-Representante?`)) {
                cls.viceRepresentativeId = null;
                console.log(`DEMO: ${studentId} não é mais Vice.`);
                globalSaveData();
                renderStudentList(currentClassId);
            }
        } else { // Não é vice -> Promover
            const isRep = cls.representativeId === studentId;
            if (confirm(`Promover ${sanitizeHTML(studentName)} a Vice-Representante? ${isRep ? '(Ele deixará de ser Rep.)' : ''}`)) {
                if (isRep) cls.representativeId = null; // Remove de rep, se for
                cls.viceRepresentativeId = studentId;
                console.log(`DEMO: ${studentId} definido como Vice.`);
                globalSaveData();
                renderStudentList(currentClassId);
            }
        }
    };
    const toggleActions = (listItemElement) => {
        if (!studentListContainer) return;
        // Encontra o item atualmente expandido DENTRO do container da lista de alunos
        const currentlyExpanded = studentListContainer.querySelector('.list-item.expanded');
        // Se houver um expandido e não for o que clicamos, fecha o antigo
        if (currentlyExpanded && currentlyExpanded !== listItemElement) {
            currentlyExpanded.classList.remove('expanded');
            const oldBtnIcon = currentlyExpanded.querySelector('.expand-actions-button .icon');
            if (oldBtnIcon) oldBtnIcon.classList.replace('icon-chevron-up', 'icon-chevron-down');
        }
        // Alterna a classe 'expanded' no item clicado
        listItemElement.classList.toggle('expanded');
        // Atualiza o ícone do botão clicado
        const btnIcon = listItemElement.querySelector('.expand-actions-button .icon');
        if (btnIcon) {
            if (listItemElement.classList.contains('expanded')) {
                btnIcon.classList.replace('icon-chevron-down', 'icon-chevron-up');
            } else {
                btnIcon.classList.replace('icon-chevron-up', 'icon-chevron-down');
            }
        }
    };

    // --- Modal de Ajuda ---
    const showHelpModal = () => {
        const title = "Ajuda - Detalhes da Turma";
        // Conteúdo HTML do modal de ajuda (igual ao fornecido no polimento)
        const content = `
            <h3><span class="icon icon-alunos"></span> Card Alunos</h3>
            <p>Lista todos os alunos da turma selecionada. Você pode:</p>
            <ul>
                <li>Clicar no botão <button class="expand-actions-button" style="padding: 0.3rem 0.6rem !important; font-size: 0.8rem !important; background-color: var(--bg-tertiary); color: var(--text-secondary); border: 1px solid var(--border-color); border-radius: 4px; line-height: 1;" disabled><span class="icon icon-chevron-down icon-only"></span></button> para ver as ações disponíveis para cada aluno (Representante, Vice, Observações, Editar, Transferir, Excluir).</li>
                <li>Promover/Remover <strong>Representante</strong> (<span class="icon icon-representante"></span>) e <strong>Vice</strong> (<span class="icon icon-vice"></span>). Alunos promovidos terão uma borda animada.</li>
                <li>Acessar <strong>Observações</strong> (<span class="icon icon-anotacao"></span>): Registre anotações, ocorrências, advertências ou suspensões.</li>
                <li><strong>Editar</strong> (<span class="icon icon-editar"></span>) os dados do aluno (Nome, Número).</li>
                <li><strong>Transferir</strong> (<span class="icon icon-transferir"></span>) o aluno para outra turma da mesma escola.</li>
                <li><strong>Excluir</strong> (<span class="icon icon-excluir"></span>) o aluno permanentemente.</li>
            </ul>

            <h3><span class="icon icon-presenca"></span> Card Presença</h3>
            <p>Registre a frequência diária dos alunos:</p>
            <ul>
                <li>Selecione a <strong>Data</strong> desejada no calendário.</li>
                <li>Clique em <button class="attendance-toggle present" style="padding: 0.3rem 0.45rem; font-size: 0.8rem; font-weight: 600; border: 2px solid transparent;"><span class="icon"><span class="icon">check</span></span> P</button> para marcar <strong>Presença</strong>.</li>
                <li>Clique em <button class="attendance-toggle absent" style="padding: 0.3rem 0.45rem; font-size: 0.8rem; font-weight: 600; border: 2px solid transparent;"><span class="icon"><span class="icon">close</span></span> F</button> para marcar <strong>Falta</strong>.</li>
                <li>Clicando novamente em <button class="attendance-toggle absent selected" style="padding: 0.3rem 0.45rem; font-size: 0.8rem; font-weight: 600; border: 2px solid transparent;"><span class="icon"><span class="icon">close</span></span> F</button> (quando já selecionado), você pode adicionar/editar uma <strong>Justificativa</strong>. O botão mudará para <button class="attendance-toggle absent justified selected" style="padding: 0.3rem 0.45rem; font-size: 0.8rem; font-weight: 600; border: 2px solid transparent; background-color: var(--accent-warning); border-color: var(--accent-warning); color: var(--text-primary);"><span class="icon"><span class="icon">close</span></span> FJ</button>.</li>
                <li>Alunos com <strong>Suspensão</strong> registrada para a data selecionada terão a linha destacada (<span class="suspended-indicator"><span class="icon">block</span> Susp.</span>) e os botões de presença/falta desabilitados. Clicar na linha abre as observações com a suspensão destacada.</li>
                <li>Lembre-se de clicar em <button class="success" style="padding: 0.6rem 1.2rem;"><span class="icon icon-salvar"></span> Salvar Presença</button> após fazer as marcações do dia.</li>
            </ul>

             <h3><span class="icon"><span class="icon">settings</span></span> Outros Cards</h3>
             <p>Cards como Mapa da Sala, Notas, Planejamento e Anotações da Turma permitem gerenciar outros aspectos importantes. (Alguns destes já existem no seu app principal).</p>
             <p>Use o botão <button class="card-toggle-button" style="padding: 0.3rem !important; font-size: 0.9rem !important; line-height: 1; background: transparent !important; border: none !important; color: var(--text-secondary);" disabled><span class="icon icon-chevron-up"></span></button> no canto de cada card para mostrar ou esconder seu conteúdo.</p>
        `;
         // Usa a função global
         globalShowModal(title, content, '', 'help-modal');
     };

    // --- Gerenciamento de Event Listeners do Módulo ---
    const handleScroll = () => {
        const mainEl = document.getElementById('main-content'); // Precisa ser global
        classDetailsHeaderElement?.classList.toggle('scrolled', mainEl && mainEl.scrollTop > 1);
    };

    const handleClickDelegation = (e) => {
        // Clique no toggle de ações do aluno
        const expandButton = e.target.closest('.expand-actions-button');
        if (expandButton) {
            const listItem = expandButton.closest('.list-item');
            if (listItem) toggleActions(listItem);
            return; // Impede outras ações no mesmo clique
        }

        // Clique em linha de aluno suspenso na tabela de presença
        const suspendedRow = e.target.closest('tr.clickable-suspended');
        if (suspendedRow) {
             const studentId = suspendedRow.dataset.studentId;
             const noteIndex = parseInt(suspendedRow.dataset.suspensionNoteIndex);
             if (studentId && !isNaN(noteIndex)) {
                console.log(`Click suspenso ${studentId}, nota ${noteIndex}`);
                // Passa o studentId e o índice da nota original para destacar
                 openStudentNotesModal(studentId, noteIndex);
             }
             return;
        }

        // Clique no botão de colapsar/expandir card (já tratado globalmente em script.js, mas pode adicionar aqui se precisar)
        // const toggleBtn = e.target.closest('.card-toggle-button');
        // if (toggleBtn) {
        //     // Lógica de toggle... (pode chamar a global window.toggleCardCollapse(toggleBtn))
        //     return;
        // }
    };

    const activate = () => {
        console.log("Activating ClassDetailsModule listeners");
        const mainContentElement = document.getElementById('main-content');
        if (mainContentElement) {
             mainContentElement.addEventListener('scroll', handleScroll);
        }
        sectionElement?.addEventListener('click', handleClickDelegation);
        helpButton?.addEventListener('click', showHelpModal);
        // Re-renderiza o conteúdo caso os dados tenham mudado enquanto inativo
        if (currentClassId) {
            _initUI(currentClassId);
        }
    };

    const deactivate = () => {
        console.log("Deactivating ClassDetailsModule listeners");
        const mainContentElement = document.getElementById('main-content');
        if (mainContentElement) {
            mainContentElement.removeEventListener('scroll', handleScroll);
        }
         sectionElement?.removeEventListener('click', handleClickDelegation);
         helpButton?.removeEventListener('click', showHelpModal);
         classDetailsHeaderElement?.classList.remove('scrolled'); // Reseta estado visual do header
    };

    // --- Inicialização Interna do Módulo ---
    const _initUI = (classId) => {
        if (!mainAppDataRef) {
            console.error("mainAppDataRef não está definido em ClassDetailsModule.");
            return;
        }
        currentClassId = classId; // Atualiza ID interno
        const cls = findClassById(classId);
        if (cls && classDetailsTitleElement) {
             // Usa textContent para segurança
            classDetailsTitleElement.textContent = `${cls.name || 'Turma Inválida'} (${cls.subject || 'N/A'})`;

            renderStudentList(classId);
            renderAttendanceTable(classId, attendanceDateInput?.value || getCurrentDateString());

            // Chama funções globais para renderizar outras partes (se existirem e forem relevantes aqui)
            // Essas funções globais buscarão os dados mais recentes de appData
            if (typeof window.renderGradeSets === 'function') window.renderGradeSets(classId);
            if (typeof window.renderLessonPlan === 'function') window.renderLessonPlan(classId, document.getElementById('lesson-plan-date')?.value || getCurrentDateString());
            if (typeof window.renderClassroomMap === 'function') window.renderClassroomMap(classId);

            // Configura data inicial
            if (attendanceDateInput && !attendanceDateInput.value) {
                attendanceDateInput.value = getCurrentDateString();
            }
            // Outras inicializações de UI...
        } else {
            if (classDetailsTitleElement) classDetailsTitleElement.textContent = "Erro: Turma não encontrada";
            if (studentListContainer) studentListContainer.innerHTML = '<p>Erro ao carregar alunos.</p>';
            if (attendanceTableContainer) attendanceTableContainer.innerHTML = '<p>Erro ao carregar presença.</p>';
            console.error(`Classe com ID ${classId} não encontrada.`);
        }
    };

    // --- Função Pública de Inicialização do Módulo ---
    const init = (classId, appDataRef, saveDataFunc, showModalFunc, hideModalFunc) => {
        console.log("Initializing ClassDetailsModule for class:", classId);
        sectionElement = document.getElementById('class-details-section'); // Pega a referência da seção
        if (!sectionElement) {
            console.error("Elemento #class-details-section não encontrado!");
            return;
        }
        // Guarda referências
        mainAppDataRef = appDataRef;
        globalSaveData = saveDataFunc || globalSaveData;
        globalShowModal = showModalFunc || globalShowModal;
        globalHideModal = hideModalFunc || globalHideModal;

        // Seletores internos (agora que sectionElement está definido)
        studentListContainer = sectionElement.querySelector('#student-list-container');
        attendanceTableContainer = sectionElement.querySelector('#attendance-table-container');
        attendanceDateInput = sectionElement.querySelector('#attendance-date');
        classDetailsHeaderElement = sectionElement.querySelector('#class-details-header');
        // Busca o SPAN que contém o título dentro do H2
        classDetailsTitleElement = classDetailsHeaderElement?.querySelector('#class-details-title');
        saveAttendanceButton = sectionElement.querySelector('#save-attendance-button');
        helpButton = classDetailsHeaderElement?.querySelector('#details-help-button'); // Busca dentro do header sticky

        // Verifica se seletores foram encontrados
        if (!studentListContainer || !attendanceTableContainer || !attendanceDateInput || !classDetailsHeaderElement || !classDetailsTitleElement || !saveAttendanceButton || !helpButton) {
            console.error("Um ou mais elementos essenciais dentro de #class-details-section não foram encontrados.");
            return;
        }

         // Configura data inicial se vazia
         if (attendanceDateInput && !attendanceDateInput.value) {
            attendanceDateInput.value = getCurrentDateString();
         }

        // Listener para mudança de data (agora dentro do módulo)
        // Remove listener antigo antes de adicionar novo para evitar duplicação
        const clonedDateInput = attendanceDateInput.cloneNode(true);
        attendanceDateInput.parentNode.replaceChild(clonedDateInput, attendanceDateInput);
        attendanceDateInput = clonedDateInput; // Atualiza referência
        attendanceDateInput?.addEventListener('change', (e) => {
            if (currentClassId) renderAttendanceTable(currentClassId, e.target.value);
        });


        // Listener para Salvar Presença (agora dentro do módulo)
        // Remove listener antigo antes de adicionar novo
        const clonedSaveButton = saveAttendanceButton?.cloneNode(true);
        if (clonedSaveButton) {
            saveAttendanceButton.parentNode.replaceChild(clonedSaveButton, saveAttendanceButton);
            saveAttendanceButton = clonedSaveButton; // Atualiza referência
        }
        saveAttendanceButton?.addEventListener('click', () => {
            const date = attendanceDateInput.value;
            if (!currentClassId || !date) {
                alert("Selecione uma turma e uma data.");
                return;
            }
            console.log("Saving ATTENDANCE via module for date:", date);
            globalSaveData(); // Chama a função global para salvar os dados modificados
            alert(`Presença de ${formatDate(date)} salva!`);
        });


        // Inicializa a UI com o ID da classe fornecido
        _initUI(classId);
        // Ativa os listeners
        activate();
    };

    // --- Interface Pública do Módulo ---
    return {
        init: init,
        activate: activate,
        deactivate: deactivate,
        // Expor funções de renderização pode ser útil para atualizações externas, se necessário
        renderStudentList: renderStudentList,
        renderAttendanceTable: renderAttendanceTable
    };
})();

/* --- FIM ARQUIVO: detalhes-turma.js --- */