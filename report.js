
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
