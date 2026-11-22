BRERA RESTAURO · PIATTAFORMA DI PREPARAZIONE
Edizione 22 novembre 2026 · Sito statico indipendente

PUBBLICAZIONE SU NETLIFY
1. Aprire https://app.netlify.com/drop
2. Caricare la cartella scompattata oppure trascinare l'archivio ZIP completo dove Netlify lo consente.
3. Se si aggiorna un sito esistente: Netlify > sito > Deploys > nuovo deploy manuale.
4. Controllare sul sito pubblicato le funzioni interattive seguendo TEST_MANUALI.txt.

STRUTTURA
index.html       contenuti del sito e della guida esistente
styles.css       design responsivo, lettura agevolata, contrasto elevato
app.js           navigazione, ricerca e personalizzazione lettura
study-data.js    60 domande originali, 52 argomenti, 14 esercitazioni
studio.js        quiz, pratica, stato studio, salvataggio locale, backup
_headers         intestazioni sicurezza Netlify
favicon.svg      icona
VERIFICA_PIATTAFORMA.json  22 controlli tecnici statici (superati)
TEST_MANUALI.txt           scenari da verificare sul sito pubblicato

FUNZIONI
- Tre percorsi PFP1, PFP2, PFP5 intercambiabili
- Quiz: 24 domande comuni + 12 per ciascun PFP (60 totali)
- Ripasso delle risposte errate, spiegazione e fonte ufficiale
- 14 esercitazioni guidate: 2 comuni + 4 per PFP
- Autovalutazione a 4 criteri e appunti personali
- Piano editoriale flessibile di 4 settimane con 52 argomenti
- Stati degli argomenti: Da iniziare, In corso, Studiato
- Dashboard e progressi locali nel browser
- Backup JSON (esporta, importa, azzera dopo conferma)
- Conservati: 21 capitoli, 22 fonti, 4 video, 8 discrepanze

LIMITI E TRASPARENZA
- NON è il sito ufficiale dell’Accademia di Brera.
- NON contiene domande d’esame autentiche né valutazioni ufficiali.
- Le attività sono proposte editoriali su facsimili e riproduzioni.
- Per programma, prove, date, titoli e accesso conta sempre il bando vigente.
- I dati vengono salvati nel localStorage del singolo browser, non nel cloud.
- Una navigazione in incognito, cancellazione dati o cambio di browser possono azzerare i progressi.
- I backup possono contenere appunti personali: conservarli in modo privato.
- Non è previsto account, backend né tracciamento di terze parti.
- Il sito può funzionare su Netlify con HTML/CSS/JavaScript senza build.
- L'audit statico non sostituisce una verifica con browser reale e screen reader.

FONTE ISTITUZIONALE DI PARTENZA
https://www.accademiadibrera.milano.it/it/bando-di-concorso-laccesso-al-corso-quinquennale-di-restauro
Le altre fonti e i collegamenti sono nella sezione Risorse e nella sezione finale delle discrepanze.
