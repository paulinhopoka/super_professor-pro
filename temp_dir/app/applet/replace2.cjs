const fs = require('fs');
let content = fs.readFileSync('/app/applet/script.js', 'utf8');

const target2 = `            try {
                const ai = new GoogleGenAI({ apiKey: apiKey });
                const response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: promptText
                });

                const generatedText = response.text;`;
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
                }

                const generatedText = response.text;`;

content = content.replace(target2, replace2);

fs.writeFileSync('/app/applet/script.js', content);
console.log('Done');
