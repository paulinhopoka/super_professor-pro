const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '../../index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

indexContent = indexContent.replace(
    /<template id="grade-label-item-template">\s*<div class="grade-label-item">\s*<input type="text" class="gs-label" value="" placeholder="Nome da Avaliação \(Ex: Prova 1\)">\s*<button type="button" class="delete-gs-label-button danger icon-button" title="Excluir Instrumento"><span class="icon icon-excluir icon-only"><\/span><\/button>\s*<\/div>\s*<\/template>/,
    `<template id="grade-label-item-template"> <div class="grade-label-item"> <input type="text" class="gs-label" value="" placeholder="Nome da Avaliação (Ex: Prova 1)"> <label style="font-size: 0.8rem; margin-left: 5px; display: flex; align-items: center; gap: 3px;"><input type="checkbox" class="gs-has-recovery"> Recuperação</label> <button type="button" class="delete-gs-label-button danger icon-button" title="Excluir Instrumento"><span class="icon icon-excluir icon-only"></span></button> </div> </template>`
);

fs.writeFileSync(indexPath, indexContent);
console.log('index.html updated successfully');
