const fs = require('fs');
let content = fs.readFileSync('/app/applet/script.js', 'utf8');

const target = `        } else if (toolType === 'exam-corrector') {
            aiToolTitle.textContent = 'Corretor de Provas';
            aiToolInputsContainer.innerHTML = ;
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
            }, 0);`;

content = content.replace(target, '');
fs.writeFileSync('/app/applet/script.js', content);
console.log('Done');
