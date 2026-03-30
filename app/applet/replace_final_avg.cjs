const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, '../../script.js');
let scriptContent = fs.readFileSync(scriptPath, 'utf8');

// 1. Add 'final_average' option to renderGradeSets
scriptContent = scriptContent.replace(
    /currentClass\.gradeStructure\.forEach\(gs => \{\s*const option = document\.createElement\('option'\);\s*option\.value = gs\.id;\s*option\.textContent = sanitizeHTML\(gs\.name\);\s*gradeSetSelect\.appendChild\(option\);\s*\}\);/g,
    `currentClass.gradeStructure.forEach(gs => { const option = document.createElement('option'); option.value = gs.id; option.textContent = sanitizeHTML(gs.name); gradeSetSelect.appendChild(option); }); const finalOption = document.createElement('option'); finalOption.value = 'final_average'; finalOption.textContent = 'Média Final (Anual)'; gradeSetSelect.appendChild(finalOption);`
);

// 2. Modify renderGradesTable to handle 'final_average'
scriptContent = scriptContent.replace(
    /const renderGradesTable = \(classId, gradeSetId\) => \{ gradesTableContainer\.innerHTML = ''; const currentClass = findClassById\(classId\); const gradeSet = currentClass\?\.gradeStructure\?\.find\(gs => gs\.id === gradeSetId\); const studentsInClass = getStudentsByClass\(classId\); const colorRanges = gradeSet\?\.colorRanges \|\| \[\]; if \(!gradeSet \|\| studentsInClass\.length === 0\) \{ gradesTableContainer\.innerHTML = \`<p style="padding: 1rem; text-align: center;">\$\{\!gradeSet \? 'Selecione um conjunto de notas válido\.' : 'Nenhum aluno para exibir notas\.'\}<\/p>\`; saveGradesButton\.classList\.add\('hidden'\); if\(exportGradesCsvButton\) exportGradesCsvButton\.classList\.add\('hidden'\); if\(exportGradesPdfButton\) exportGradesPdfButton\.classList\.add\('hidden'\); return; \}/g,
    `const renderGradesTable = (classId, gradeSetId) => { gradesTableContainer.innerHTML = ''; const currentClass = findClassById(classId); const isFinalAverage = gradeSetId === 'final_average'; const gradeSet = currentClass?.gradeStructure?.find(gs => gs.id === gradeSetId); const studentsInClass = getStudentsByClass(classId); const colorRanges = gradeSet?.colorRanges || []; if ((!gradeSet && !isFinalAverage) || studentsInClass.length === 0) { gradesTableContainer.innerHTML = \`<p style="padding: 1rem; text-align: center;">\${(!gradeSet && !isFinalAverage) ? 'Selecione um conjunto de notas válido.' : 'Nenhum aluno para exibir notas.'}</p>\`; saveGradesButton.classList.add('hidden'); if(exportGradesCsvButton) exportGradesCsvButton.classList.add('hidden'); if(exportGradesPdfButton) exportGradesPdfButton.classList.add('hidden'); return; } if (isFinalAverage) { renderFinalAverageTable(classId, studentsInClass, currentClass); return; }`
);

// 3. Add renderFinalAverageTable function
const newFunction = `
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
    
    studentsInClass.forEach(std => {
        const row = tbody.insertRow();
        const tdStudent = document.createElement('td');
        tdStudent.classList.add('student-col');
        tdStudent.innerHTML = \`<span class="student-number">\${std.number ? std.number + '.' : '-.'}</span><span class="student-name">\${sanitizeHTML(std.name)}</span>\`;
        row.appendChild(tdStudent);
        
        let totalSum = 0;
        let totalCount = 0;
        
        currentClass.gradeStructure.forEach(gs => {
            const td = document.createElement('td');
            td.classList.add('grade-col');
            const studentGradesForSet = std.grades[gs.id] || {};
            const calculated = calculateSumAndAverageForData(studentGradesForSet, gs);
            
            if (calculated.average !== null) {
                td.textContent = calculated.average.toFixed(1);
                applyGradeColor(td, calculated.average, gs.colorRanges);
                totalSum += calculated.average;
                totalCount++;
            } else {
                td.textContent = '-';
            }
            row.appendChild(td);
        });
        
        const tdFinal = document.createElement('td');
        tdFinal.classList.add('avg-col');
        if (totalCount > 0) {
            const finalAvg = totalSum / totalCount;
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
`;

scriptContent = scriptContent.replace(
    /const calculateAndUpdateSumAndAverage =/g,
    newFunction + '\n    const calculateAndUpdateSumAndAverage ='
);

fs.writeFileSync(scriptPath, scriptContent);
console.log('script.js updated successfully with final average');
