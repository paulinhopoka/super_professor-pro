import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection, getDocs, query, where, enableIndexedDbPersistence } from 'firebase/firestore';

// Importa a configuração do Firebase
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Usamos o ID do banco de dados específico do seu projeto
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Habilita persistência offline
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        // Múltiplas abas abertas, persistência só pode ser habilitada em uma aba de cada vez.
        console.warn('Persistência falhou: múltiplas abas abertas.');
    } else if (err.code == 'unimplemented-state') {
        // O navegador atual não suporta todos os recursos necessários para persistência
        console.warn('Persistência não suportada pelo navegador.');
    }
});

export const provider = new GoogleAuthProvider();

export { 
  signInWithPopup, signOut, onAuthStateChanged, 
  doc, getDoc, setDoc, onSnapshot, 
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  collection, getDocs, query, where
};
