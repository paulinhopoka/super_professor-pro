const fs = require('fs');
let content = fs.readFileSync('script.js', 'utf8');

const target1 = `            } else if (currentAiTool === 'analyze-class') {`;
const replace1 = `            } else if (currentAiTool === 'exam-corrector') {
                const gabarito = document.getElementById('ai-input-gabarito').value.trim();
                const imgPreview = document.getElementById('ai-preview-prova-img');
                
                if (!imgPreview.src || imgPreview.src === '' || imgPreview.style.display === 'none') {
                    aiToolGenerateBtn.disabled = false;
                    aiToolLoading.classList.add('hidden');
                    return showNotification('Por favor, tire uma foto ou selecione uma imagem da prova.', 'error');
                }
                
                let context = '';
                if (gabarito) {
                    context = \`Utilize o seguinte gabarito/respostas corretas como base para a correção: "\\n\${gabarito}\\n".\\n\`;
                }
                
                promptText = \`Aja como um professor corrigindo uma prova. \${context}Analise a imagem da prova do aluno fornecida. Identifique as questões, as respostas do aluno e avalie se estão corretas, incorretas ou parcialmente corretas. Forneça um feedback construtivo e, se possível, uma nota estimada. Formate a saída em Markdown, destacando os acertos e erros.\`;
            } else if (currentAiTool === 'analyze-class') {`;

content = content.replace(target1, replace1);

const target2 = `            try {
                const ai = new GoogleGenAI({ apiKey: apiKey });
                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: promptText
                });`;
const replace2 = `            try {
                const ai = new GoogleGenAI({ apiKey: apiKey });
                let response;
                
                if (currentAiTool === 'exam-corrector') {
                    const imgPreview = document.getElementById('ai-preview-prova-img');
                    const base64Data = imgPreview.src.split(',')[1];
                    const mimeType = imgPreview.src.split(';')[0].split(':')[1];
                    
                    response = await ai.models.generateContent({
                        model: 'gemini-3.1-flash-image-preview',
                        contents: {
                            parts: [
                                {
                                    inlineData: {
                                        data: base64Data,
                                        mimeType: mimeType
                                    }
                                },
                                {
                                    text: promptText
                                }
                            ]
                        }
                    });
                } else {
                    response = await ai.models.generateContent({
                        model: 'gemini-3-flash-preview',
                        contents: promptText
                    });
                }`;

content = content.replace(target2, replace2);

fs.writeFileSync('script.js', content);
console.log('Done');
