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
            }, 0);
        } else if (toolType === 'exam-corrector') {
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

const replacement = `        } else if (toolType === 'exam-corrector') {
            aiToolTitle.textContent = 'Corretor de Provas';
            aiToolInputsContainer.innerHTML = \`
                <div class="form-group">
                    <label>Imagem da Prova:</label>
                    <input type="file" id="ai-input-prova-img" accept="image/*" capture="environment" class="w-full">
                    <img id="ai-preview-prova-img" style="display: none; max-width: 100%; margin-top: 10px; border-radius: 8px; border: 1px solid var(--border-color);" />
                </div>
                <div class="form-group">
                    <label>Gabarito / Respostas Esperadas (Opcional):</label>
                    <textarea id="ai-input-gabarito" rows="4" placeholder="Ex: 1-A, 2-B, 3-C..." class="w-full"></textarea>
                </div>
            \`;
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

content = content.replace(target, replacement);
fs.writeFileSync('/app/applet/script.js', content);
console.log('Done');
