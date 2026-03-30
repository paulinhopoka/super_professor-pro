const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, '../../script.js');
let scriptContent = fs.readFileSync(scriptPath, 'utf8');

// 1. Update openGradeStructureModal to add the "Com Recuperação" checkbox
scriptContent = scriptContent.replace(
    /\$\{gs\.gradeLabels\.map\(\(label, lblIndex\) => \` <div class="grade-label-item" data-label-index="\$\{lblIndex\}"\> <input type="text" class="gs-label" value="\$\{sanitizeHTML\(label\)\}" placeholder="Nome da Avaliação \(Ex: Prova 1\)"\> <button type="button" class="delete-gs-label-button danger icon-button" title="Excluir Instrumento"\> <span class="icon icon-excluir icon-only"\><\/span\> <\/button\> <\/div\>\`\)\.join\(''\)\}/g,
    `\${gs.gradeLabels.map((label, lblIndex) => \` <div class="grade-label-item" data-label-index="\${lblIndex}"> <input type="text" class="gs-label" value="\${sanitizeHTML(label)}" placeholder="Nome da Avaliação (Ex: Prova 1)"> <label style="font-size: 0.8rem; margin-left: 5px; display: flex; align-items: center; gap: 3px;"><input type="checkbox" class="gs-has-recovery" \${gs.recoveryLabels && gs.recoveryLabels.includes(label) ? 'checked' : ''}> Recuperação</label> <button type="button" class="delete-gs-label-button danger icon-button" title="Excluir Instrumento"> <span class="icon icon-excluir icon-only"></span> </button> </div>\`).join('')}`
);

// 2. Update addGradeSet to include the checkbox in the new instrument template
scriptContent = scriptContent.replace(
    /<div class="grade-label-item" data-label-index="0"\> <input type="text" class="gs-label" value="Nota 1" placeholder="Nome da Avaliação"\> <button type="button" class="delete-gs-label-button danger icon-button" title="Excluir Instrumento"\> <span class="icon icon-excluir icon-only"\><\/span\> <\/button\> <\/div\>/g,
    `<div class="grade-label-item" data-label-index="0"> <input type="text" class="gs-label" value="Nota 1" placeholder="Nome da Avaliação"> <label style="font-size: 0.8rem; margin-left: 5px; display: flex; align-items: center; gap: 3px;"><input type="checkbox" class="gs-has-recovery"> Recuperação</label> <button type="button" class="delete-gs-label-button danger icon-button" title="Excluir Instrumento"> <span class="icon icon-excluir icon-only"></span> </button> </div>`
);

// 3. Update handleGradeStructureClicks to include the checkbox when adding a new instrument
// Wait, the template 'grade-label-item-template' is in index.html. We need to update index.html too!

// 4. Update saveGradeStructure to save recoveryLabels
scriptContent = scriptContent.replace(
    /labelInputs\.forEach\(lblInput => \{ const label = lblInput\.value\.trim\(\); if \(!label\) \{ customAlert\(\`Nome do Instrumento em "\$\{name\}" é obrigatório\.\`\); lblInput\.focus\(\); valid = false; \} if \(valid\) labels\.push\(label\); \}\);/g,
    `const recoveryLabels = []; labelInputs.forEach(lblInput => { const label = lblInput.value.trim(); const hasRecovery = lblInput.closest('.grade-label-item').querySelector('.gs-has-recovery')?.checked; if (!label) { customAlert(\`Nome do Instrumento em "\${name}" é obrigatório.\`); lblInput.focus(); valid = false; } if (valid) { labels.push(label); if (hasRecovery) recoveryLabels.push(label); } });`
);

scriptContent = scriptContent.replace(
    /newStructure\.push\(\{ id: setId, name: name, gradeLabels: labels, colorRanges: colorRanges \}\);/g,
    `newStructure.push({ id: setId, name: name, gradeLabels: labels, colorRanges: colorRanges, recoveryLabels: recoveryLabels });`
);

// 5. Update renderGradesTable to render recovery inputs
scriptContent = scriptContent.replace(
    /gradeSet\.gradeLabels\.forEach\(label => \{ const th = document\.createElement\('th'\); th\.classList\.add\('grade-col'\); th\.textContent = sanitizeHTML\(label\); headerRow\.appendChild\(th\); \}\);/g,
    `gradeSet.gradeLabels.forEach(label => { const th = document.createElement('th'); th.classList.add('grade-col'); th.textContent = sanitizeHTML(label); headerRow.appendChild(th); if (gradeSet.recoveryLabels && gradeSet.recoveryLabels.includes(label)) { const thRec = document.createElement('th'); thRec.classList.add('grade-col', 'recovery-col'); thRec.textContent = 'Rec. ' + sanitizeHTML(label); headerRow.appendChild(thRec); } });`
);

scriptContent = scriptContent.replace(
    /gradeSet\.gradeLabels\.forEach\(label => \{ const td = document\.createElement\('td'\); td\.classList\.add\('grade-col'\); const input = document\.createElement\('input'\); input\.type = 'number'; input\.classList\.add\('grade-input'\); input\.dataset\.label = label; input\.min = "0"; input\.max = "100"; input\.step = "0\.1"; input\.placeholder = sanitizeHTML\(label\); const gradeValue = studentGradesForSet\[label\] \?\? ''; input\.value = gradeValue; applyGradeColor\(input, gradeValue, colorRanges\); input\.addEventListener\('input', \(e\) => \{ applyGradeColor\(e\.target, e\.target\.value, colorRanges\); calculateAndUpdateSumAndAverage\(row, gradeSet, colorRanges\); \}\); td\.appendChild\(input\); fragment\.appendChild\(td\); \}\);/g,
    `gradeSet.gradeLabels.forEach(label => { const td = document.createElement('td'); td.classList.add('grade-col'); const input = document.createElement('input'); input.type = 'number'; input.classList.add('grade-input'); input.dataset.label = label; input.min = "0"; input.max = "100"; input.step = "0.1"; input.placeholder = sanitizeHTML(label); const gradeValue = studentGradesForSet[label] ?? ''; input.value = gradeValue; applyGradeColor(input, gradeValue, colorRanges); input.addEventListener('input', (e) => { applyGradeColor(e.target, e.target.value, colorRanges); calculateAndUpdateSumAndAverage(row, gradeSet, colorRanges); }); td.appendChild(input); fragment.appendChild(td); if (gradeSet.recoveryLabels && gradeSet.recoveryLabels.includes(label)) { const tdRec = document.createElement('td'); tdRec.classList.add('grade-col', 'recovery-col'); const inputRec = document.createElement('input'); inputRec.type = 'number'; inputRec.classList.add('grade-input', 'recovery-input'); inputRec.dataset.label = label + '_recovery'; inputRec.min = "0"; inputRec.max = "100"; inputRec.step = "0.1"; inputRec.placeholder = 'Rec.'; const recValue = studentGradesForSet[label + '_recovery'] ?? ''; inputRec.value = recValue; applyGradeColor(inputRec, recValue, colorRanges); inputRec.addEventListener('input', (e) => { applyGradeColor(e.target, e.target.value, colorRanges); calculateAndUpdateSumAndAverage(row, gradeSet, colorRanges); }); tdRec.appendChild(inputRec); fragment.appendChild(tdRec); } });`
);

// 6. Fix calculateAndUpdateSumAndAverage signature in renderGradesTable
scriptContent = scriptContent.replace(
    /calculateAndUpdateSumAndAverage\(row, gradeSet\.gradeLabels, colorRanges\);/g,
    `calculateAndUpdateSumAndAverage(row, gradeSet, colorRanges);`
);

// 7. Update calculateAndUpdateSumAndAverage
scriptContent = scriptContent.replace(
    /const calculateAndUpdateSumAndAverage = \(tableRow, gradeLabels, colorRanges\) => \{ let sum = 0; let count = 0; gradeLabels\.forEach\(label => \{ const input = tableRow\.querySelector\(\`input\[data-label="\$\{label\}"\]\`\); const value = parseFloat\(input\?\.value\); if \(!isNaN\(value\)\) \{ sum \+= value; count\+\+; \} \}\);/g,
    `const calculateAndUpdateSumAndAverage = (tableRow, gradeSet, colorRanges) => { let sum = 0; let count = 0; gradeSet.gradeLabels.forEach(label => { const input = tableRow.querySelector(\`input[data-label="\${label}"]\`); let value = parseFloat(input?.value); if (gradeSet.recoveryLabels && gradeSet.recoveryLabels.includes(label)) { const recInput = tableRow.querySelector(\`input[data-label="\${label}_recovery"]\`); const recValue = parseFloat(recInput?.value); if (!isNaN(recValue)) { if (isNaN(value) || recValue > value) { value = recValue; } } } if (!isNaN(value)) { sum += value; count++; } });`
);

// 8. Update saveGrades
scriptContent = scriptContent.replace(
    /gradeSet\.gradeLabels\.forEach\(label => \{ const input = row\.querySelector\(\`input\[data-label="\$\{label\}"\]\`\); const value = input\?\.value\.trim\(\); currentGrades\[label\] = \(value !== '' && !isNaN\(parseFloat\(value\)\)\) \? parseFloat\(value\) : null; \}\); const calculated = calculateSumAndAverageForData\(currentGrades\);/g,
    `gradeSet.gradeLabels.forEach(label => { const input = row.querySelector(\`input[data-label="\${label}"]\`); const value = input?.value.trim(); currentGrades[label] = (value !== '' && !isNaN(parseFloat(value))) ? parseFloat(value) : null; if (gradeSet.recoveryLabels && gradeSet.recoveryLabels.includes(label)) { const recInput = row.querySelector(\`input[data-label="\${label}_recovery"]\`); const recValue = recInput?.value.trim(); currentGrades[label + '_recovery'] = (recValue !== '' && !isNaN(parseFloat(recValue))) ? parseFloat(recValue) : null; } }); const calculated = calculateSumAndAverageForData(currentGrades, gradeSet);`
);

// 9. Update calculateSumAndAverageForData
scriptContent = scriptContent.replace(
    /const calculateSumAndAverageForData = \(gradesObject\) => \{ let sum = 0; let count = 0; let average = null; if \(gradesObject\) \{ for\(const label in gradesObject\) \{ if \(label !== 'average' && label !== 'sum'\) \{ const value = parseFloat\(gradesObject\[label\]\); if \(!isNaN\(value\)\) \{ sum \+= value; count\+\+; \} \} \} \}/g,
    `const calculateSumAndAverageForData = (gradesObject, gradeSet) => { let sum = 0; let count = 0; let average = null; if (gradesObject && gradeSet) { gradeSet.gradeLabels.forEach(label => { let value = parseFloat(gradesObject[label]); if (gradeSet.recoveryLabels && gradeSet.recoveryLabels.includes(label)) { const recValue = parseFloat(gradesObject[label + '_recovery']); if (!isNaN(recValue)) { if (isNaN(value) || recValue > value) { value = recValue; } } } if (!isNaN(value)) { sum += value; count++; } }); } else if (gradesObject) { for(const label in gradesObject) { if (label !== 'average' && label !== 'sum' && !label.endsWith('_recovery')) { let value = parseFloat(gradesObject[label]); const recValue = parseFloat(gradesObject[label + '_recovery']); if (!isNaN(recValue) && (isNaN(value) || recValue > value)) { value = recValue; } if (!isNaN(value)) { sum += value; count++; } } } }`
);

// 10. Update exportGradesCSV
scriptContent = scriptContent.replace(
    /gradeSet\.gradeLabels\.forEach\(label => header\.push\(escapeCsvField\(label\)\)\);/g,
    `gradeSet.gradeLabels.forEach(label => { header.push(escapeCsvField(label)); if (gradeSet.recoveryLabels && gradeSet.recoveryLabels.includes(label)) { header.push(escapeCsvField('Rec. ' + label)); } });`
);

scriptContent = scriptContent.replace(
    /const calculated = calculateSumAndAverageForData\(studentGrades\); let row = \[escapeCsvField\(student\.name\), escapeCsvField\(student\.number \|\| ''\)\]; gradeSet\.gradeLabels\.forEach\(label => \{ const gradeValue = studentGrades\[label\]; row\.push\(escapeCsvField\(gradeValue\)\); \}\);/g,
    `const calculated = calculateSumAndAverageForData(studentGrades, gradeSet); let row = [escapeCsvField(student.name), escapeCsvField(student.number || '')]; gradeSet.gradeLabels.forEach(label => { const gradeValue = studentGrades[label]; row.push(escapeCsvField(gradeValue)); if (gradeSet.recoveryLabels && gradeSet.recoveryLabels.includes(label)) { const recValue = studentGrades[label + '_recovery']; row.push(escapeCsvField(recValue)); } });`
);

// 11. Update exportGradesPDF
scriptContent = scriptContent.replace(
    /gradeSet\.gradeLabels\.forEach\(label => \{ tableHTML \+= \`<th class="grade-col">\$\{sanitizeHTML\(label\)\}<\/th>\`; \}\);/g,
    `gradeSet.gradeLabels.forEach(label => { tableHTML += \`<th class="grade-col">\${sanitizeHTML(label)}</th>\`; if (gradeSet.recoveryLabels && gradeSet.recoveryLabels.includes(label)) { tableHTML += \`<th class="grade-col recovery-col">Rec. \${sanitizeHTML(label)}</th>\`; } });`
);

scriptContent = scriptContent.replace(
    /const calculated = calculateSumAndAverageForData\(studentGrades\); tableHTML \+= \`<tr><td class="student-name"><span class="number">\$\{student\.number \|\| '-\.'\}<\/span>\$\{sanitizeHTML\(student\.name\)\}<\/td>\`; gradeSet\.gradeLabels\.forEach\(label => \{ const gradeValue = studentGrades\[label\]; tableHTML \+= \`<td class="grade">\$\{\(gradeValue !== null && gradeValue !== undefined\) \? sanitizeHTML\(gradeValue\) : '-'\}<\/td>\`; \}\);/g,
    `const calculated = calculateSumAndAverageForData(studentGrades, gradeSet); tableHTML += \`<tr><td class="student-name"><span class="number">\${student.number || '-.'}</span>\${sanitizeHTML(student.name)}</td>\`; gradeSet.gradeLabels.forEach(label => { const gradeValue = studentGrades[label]; tableHTML += \`<td class="grade">\${(gradeValue !== null && gradeValue !== undefined) ? sanitizeHTML(gradeValue) : '-'}</td>\`; if (gradeSet.recoveryLabels && gradeSet.recoveryLabels.includes(label)) { const recValue = studentGrades[label + '_recovery']; tableHTML += \`<td class="grade recovery-col">\${(recValue !== null && recValue !== undefined) ? sanitizeHTML(recValue) : '-'}</td>\`; } });`
);

fs.writeFileSync(scriptPath, scriptContent);
console.log('script.js updated successfully');
