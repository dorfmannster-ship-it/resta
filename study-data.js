/*
 * Banca didattica originale preparata per l'orientamento e l'esercizio.
 * NON contiene quesiti ufficiali di ammissione dell'Accademia di Brera.
 * Per dettagli e materiali delle prove fare riferimento al bando vigente.
 */
(() => {
  'use strict';
  const common = 'https://www.accademiadibrera.milano.it/it/materiali-lapidei-e-derivati-superfici-decorate-dellarchitettura';
  const pfp2 = 'https://www.accademiadibrera.milano.it/it/manufatti-dipinti-su-ligneotessile-scolpiti-legno-arredi-e-strutture-lignee-materiali-sintetici';
  const pfp5 = 'https://www.accademiadibrera.milano.it/it/materiale-librario-e-archivistico-manufatti-cartaceipergamenacei-materiale-fotografico';
  const source = { comune:common, pfp1:common, pfp2, pfp5 };
  // Choice keys and explanations are editorial teaching materials, not verbatim citations.
  const questions = [
    // STORIA DELL'ARTE — quesiti di esercitazione generale
    ['a01','comune','arte','Quale arco è particolarmente caratteristico dell’architettura gotica?',['A sesto acuto','A tutto sesto','A ferro di cavallo','Trilitico'],0,'L’arco a sesto acuto è uno degli elementi ricorrenti del linguaggio gotico europeo.'],
    ['a02','comune','arte','A quale artista sono attribuiti gli affreschi della Cappella degli Scrovegni a Padova?',['Masaccio','Giotto','Raffaello','Tiziano'],1,'Il celebre ciclo padovano è un’opera fondamentale di Giotto.'],
    ['a03','comune','arte','Chi viene tradizionalmente associato agli esperimenti di prospettiva lineare nel primo Quattrocento fiorentino?',['Filippo Brunelleschi','Bernini','Canova','Caravaggio'],0,'Gli esperimenti di Brunelleschi sono un riferimento per la prospettiva rinascimentale.'],
    ['a04','comune','arte','Quale tecnica pittorica è spesso associata a Leonardo da Vinci?',['Puntinismo','Sfumato','Divisionismo','Serigrafia'],1,'Lo sfumato consente passaggi graduali tra toni e contorni.'],
    ['a05','comune','arte','Quale caratteristica è spesso associata alla pittura di Caravaggio?',['Uso drammatico del contrasto luminoso','Assenza di figure umane','Uso esclusivo dell’affresco','Pittura astratta geometrica'],0,'Caravaggio è noto anche per l’uso incisivo della luce nella definizione delle scene.'],
    ['a06','comune','arte','Quale movimento dell’Ottocento privilegia spesso gli effetti della luce e della percezione visiva?',['Impressionismo','Romanico','Manierismo','Barocco'],0,'L’Impressionismo pone spesso al centro la resa della luce e dell’impressione visiva.'],
    // SCIENZE
    ['s01','comune','scienze','In una soluzione di acqua e sale, quale componente è il solvente?',['Il sale','L’acqua','Il recipiente','L’aria'],1,'Il solvente è il componente che scioglie il soluto: qui l’acqua.'],
    ['s02','comune','scienze','A temperatura ambiente, una soluzione acquosa con pH vicino a 7 è generalmente considerata…',['fortemente acida','neutra','fortemente basica','sempre tossica'],1,'Per una soluzione acquosa ideale a circa 25 °C, pH 7 indica neutralità.'],
    ['s03','comune','scienze','Che cosa indica la parola “igroscopico”?',['Che riflette sempre la luce','Che assorbe umidità dall’ambiente','Che resiste a tutte le temperature','Che è insolubile in acqua'],1,'I materiali igroscopici possono assorbire o rilasciare umidità in funzione dell’ambiente.'],
    ['s04','comune','scienze','Quale grandezza descrive la quantità di vapore acqueo presente rispetto al massimo possibile alla stessa temperatura?',['Umidità relativa','Pressione idrostatica','Massa atomica','Velocità del suono'],0,'L’umidità relativa esprime un rapporto percentuale legato alla temperatura.'],
    ['s05','comune','scienze','Quale radiazione è spesso associata al rischio di alterazioni fotochimiche per alcune opere?',['Ultravioletta','Radio FM','Onde sonore','Corrente alternata'],0,'L’esposizione UV può favorire reazioni fotochimiche nei materiali sensibili.'],
    ['s06','comune','scienze','Quale fenomeno è un possibile esempio di biodeterioramento?',['Crescita di muffe su un supporto','Semplice variazione della scala di un disegno','Posizionamento di una cornice','Catalogazione di un volume'],0,'Funghi e altri organismi possono alterare alcuni materiali conservati in condizioni non idonee.'],
    // INGLESE
    ['e01','comune','inglese','Nel contesto dei dipinti, “canvas” significa…',['pennello','tela','pietra','pergamena'],1,'Canvas è il supporto tessile di molti dipinti.'],
    ['e02','comune','inglese','“Humidity” in un testo di conservazione significa…',['umidità','luminosità','spessore','legatura'],0,'Humidity indica l’umidità, fattore ambientale importante per la conservazione.'],
    ['e03','comune','inglese','Qual è la traduzione più adatta di “parchment”?',['pergamena','intonaco','cornice','mosaico'],0,'Parchment è un materiale scrittorio ricavato da pelle animale lavorata.'],
    ['e04','comune','inglese','In “The painting was restored”, la forma verbale è…',['passiva al passato','futura attiva','imperativa','presente progressiva'],0,'“Was restored” è una costruzione passiva al passato.'],
    ['e05','comune','inglese','In inglese, “surface” significa…',['superficie','sostegno','archivio','pigmento'],0,'Surface identifica la superficie di un oggetto o materiale.'],
    ['e06','comune','inglese','In un testo sul restauro, “damage” indica…',['danno','diagnosi','cornice','pennellata'],0,'Damage significa danno o danneggiamento, in base al contesto.'],
    // TEORIA DEL RESTAURO
    ['t01','comune','teoria','Quali due istanze sono centrali nella teoria del restauro di Cesare Brandi?',['Storica ed estetica','Economica e commerciale','Fisica e sportiva','Digitale e industriale'],0,'Brandi considera l’istanza storica e quella estetica dell’opera.'],
    ['t02','comune','teoria','Perché documentare lo stato iniziale prima di un intervento?',['Per confrontare condizioni e decisioni nel tempo','Per sostituire ogni analisi scientifica','Per evitare di descrivere i materiali','Per dimostrare che l’opera è nuova'],0,'La documentazione sostiene tracciabilità, diagnosi e valutazione degli interventi.'],
    ['t03','comune','teoria','Un’integrazione riconoscibile in un restauro serve soprattutto a…',['favorire la lettura senza creare un falso storico','nascondere ogni traccia del passato','trasformare l’opera in un’altra','eliminare la necessità di descrivere il lavoro'],0,'Nel restauro la leggibilità non deve equivalere a falsificare l’identità storica dell’opera.'],
    ['t04','comune','teoria','Chi compie scelte operative su un bene culturale dovrebbe prima…',['conoscere materiali, condizioni e obiettivi conservativi','applicare subito il prodotto più forte','uniformare tutti i colori','evitare il confronto con specialisti'],0,'Le decisioni si fondano su conoscenza dell’opera e valutazione delle conseguenze.'],
    ['t05','comune','teoria','Una prova preliminare su una zona controllata può essere utile perché…',['aiuta a valutare l’effetto di una procedura prima di estenderla','garantisce che qualunque metodo è innocuo','sostituisce il progetto di conservazione','è sempre vietata'],0,'Le prove controllate, se condotte da professionisti, servono a valutare compatibilità ed effetti.'],
    ['t06','comune','teoria','Quale definizione descrive meglio la figura del restauratore?',['Professionista con competenze manuali, storiche e scientifiche','Solo un copista di immagini','Solo uno storico dell’arte senza pratica','Un commerciante di materiali artistici'],0,'Il percorso descritto integra competenze di materiali, storia, diagnostica e pratica responsabile.'],
    // PFP1
    ['p101','pfp1','pfp1','Nel PFP1 rientrano soprattutto…',['superfici lapidee, mosaici e dipinti murali','solo fotografie digitali','solo carte d’archivio','solo sculture di cera contemporanee'],0,'Il profilo riguarda materiali lapidei e superfici decorate dell’architettura.'],
    ['p102','pfp1','pfp1','Come si chiama un singolo elemento che compone un mosaico?',['Tessera','Fascicolo','Filigrana','Telaio'],0,'La tessera è uno degli elementi che compongono una superficie musiva.'],
    ['p103','pfp1','pfp1','Quale materiale può far parte di un intonaco tradizionale a base di calce?',['Sabbia','Pellicola fotografica','Celluloide','Pergamena'],0,'Gli intonaci a calce comprendono tipicamente un legante e aggregati come la sabbia.'],
    ['p104','pfp1','pfp1','Una “efflorescenza salina” su una superficie lapidea è…',['una cristallizzazione di sali sulla superficie','una tecnica di pittura a olio','un tipo di firma incisa','una pellicola cinematografica'],0,'I sali solubili possono migrare e cristallizzare quando cambiano le condizioni ambientali.'],
    ['p105','pfp1','pfp1','Che cosa significa “stratigrafia” nel contesto di una decorazione murale?',['Studio delle successioni di strati','Scelta di una nuova cornice','Catalogazione delle fotografie digitali','Calcolo del prezzo di vendita'],0,'Conoscere la sequenza degli strati aiuta a comprendere tecniche e trasformazioni nel tempo.'],
    ['p106','pfp1','pfp1','Nella prova attitudinale descritta da Brera, il PFP1 usa…',['plastilina per copiare un modello in gesso','inchiostro per copiare un manoscritto','solo tastiera e mouse','temperatura e umidità senza un modello'],0,'La scheda ufficiale indica modellato in plastilina in scala 1:1 da modello in gesso.'],
    ['p107','pfp1','pfp1','Che cosa indica un “distacco” in una superficie decorata?',['Perdita di adesione tra strati o rispetto al supporto','Cambio di illuminazione','Uno stile pittorico moderno','Un modello di documento'],0,'I distacchi sono fenomeni di separazione materiale che richiedono valutazione specialistica.'],
    ['p108','pfp1','pfp1','Quale elemento è importante rilevare quando si copia un rilievo in plastilina?',['Profondità e proporzioni','Solo il peso del tavolo','Solo il colore della plastilina','Solo la firma dell’autore'],0,'La copia deve mostrare precisione volumetrica e attenzione alla superficie.'],
    ['p109','pfp1','pfp1','Perché la luce radente può aiutare a osservare una superficie?',['Evidenzia alcuni rilievi e irregolarità','Elimina tutti i sali','Stabilizza ogni pigmento','Rende inutili le fotografie'],0,'Una luce radente può mettere in risalto l’andamento della superficie.'],
    ['p110','pfp1','pfp1','In un mosaico pavimentale, quale fattore ambientale è particolarmente importante?',['Uso e sollecitazioni della superficie','Velocità della stampa digitale','Formato del file audio','Rilegatura del libro'],0,'Un mosaico di pavimento può essere soggetto a carichi e sollecitazioni diversi da uno parietale.'],
    ['p111','pfp1','pfp1','Che cosa significa “materiale lapideo”?',['Roccia o materiale derivato da roccia impiegato in un manufatto','Carta fotografica moderna','Tessuto sintetico','Pigmento organico liquido'],0,'Il termine richiama pietre naturali e materiali affini nel patrimonio costruito e scolpito.'],
    ['p112','pfp1','pfp1','Prima di una pulitura su una pietra storica è opportuno…',['valutare alterazioni, depositi e compatibilità del metodo','usare sempre il detergente più aggressivo','rimuovere qualsiasi patina senza documentare','saltare ogni prova preliminare'],0,'La pulitura è un intervento conservativo che va progettato e testato da personale qualificato.'],
    // PFP2
    ['p201','pfp2','pfp2','Il PFP2 si occupa, fra l’altro, di…',['dipinti su tela e tavola e manufatti lignei','solo materiali cartacei','solo mosaici pavimentali','solo films digitali'],0,'Il profilo include dipinti su supporto ligneo e tessile e altri manufatti in legno.'],
    ['p202','pfp2','pfp2','Quale supporto è tipico di molti dipinti su tavola?',['Legno','Papiro','Vetro fotografico','Carta da stampa'],0,'La tavola lignea costituisce il supporto di molte opere pittoriche.'],
    ['p203','pfp2','pfp2','A cosa serve in generale uno strato preparatorio pittorico?',['Preparare la superficie per gli strati di colore','Sostituire sempre la cornice','Trasformare il dipinto in scultura','Eliminare il supporto'],0,'La preparazione crea condizioni superficiali adatte alle successive stesure pittoriche.'],
    ['p204','pfp2','pfp2','La tempera all’uovo è chiamata così perché…',['l’uovo può essere impiegato come legante','viene cotta nel forno','è sempre applicata sul vetro','si realizza soltanto con pietre macinate'],0,'Nelle tecniche tradizionali l’uovo può costituire il medium legante del colore.'],
    ['p205','pfp2','pfp2','La parola “craquelure” si riferisce a…',['una rete di fessurazioni nella superficie pittorica','un tipo di mosaico romano','una tecnica fotografica digitale','un libro stampato'],0,'La craquelure è l’insieme delle crettature rilevabili in uno strato pittorico.'],
    ['p206','pfp2','pfp2','Secondo la scheda ufficiale, la prova di colore PFP2 è descritta come…',['riproduzione a tempera di una campionatura policroma geometrica','copia in plastilina di un busto','reintegrazione su una xilografia con matite','solo un colloquio orale'],0,'La pagina Brera specifica tempera, scala 1:1 e supporto gessato; il materiale dell’Open Day parla invece di rigatino.'],
    ['p207','pfp2','pfp2','Che cosa è il “telaio” in un dipinto su tela?',['Una struttura che può tendere e sostenere la tela','Il pigmento blu','Una lente fotografica','Una scheda archivistica'],0,'Il telaio è una struttura di supporto usata in molti dipinti su tela.'],
    ['p208','pfp2','pfp2','Per identificare la successione degli strati pittorici è utile…',['uno studio della stratigrafia','scegliere una vernice a caso','coprire la superficie con colore nuovo','ignorare il supporto'],0,'La stratigrafia può chiarire tecniche e sovrapposizioni di materiali.'],
    ['p209','pfp2','pfp2','La “doratura” riguarda principalmente…',['l’applicazione e la lavorazione di superfici dorate','il lavaggio dei tessuti','la composizione dei mosaici','la copia dei manoscritti'],0,'La doratura è una tecnica specifica, presente anche nella formazione PFP2.'],
    ['p210','pfp2','pfp2','Piccoli fori in un legno antico…',['sono un indizio da studiare, non una prova automatica di infestazione attiva','dimostrano sempre infestazione attiva','indicano che è carta','sono necessariamente decorazione originale'],0,'I segni visibili vanno interpretati con esame del manufatto e condizioni ambientali.'],
    ['p211','pfp2','pfp2','Per confrontare campioni di colore in un’esercitazione conta soprattutto…',['osservare tonalità e rapporti cromatici in luce coerente','modificare continuamente l’illuminazione','usare sempre solo il nero','eliminare i bordi geometrici'],0,'Una luce uniforme e la cura dei rapporti cromatici aiutano una riproduzione controllata.'],
    ['p212','pfp2','pfp2','Nel restauro di un dipinto la vernice superficiale può essere…',['uno strato da studiare per composizione e storia','sempre da eliminare completamente','un sinonimo di telaio','la firma originale dell’autore'],0,'Le caratteristiche e il ruolo di uno strato di vernice vanno valutati caso per caso.'],
    // PFP5
    ['p501','pfp5','pfp5','Quale componente costituisce la base delle fibre della carta tradizionale?',['Cellulosa','Marmo','Gesso','Bronzo'],0,'La cellulosa è componente fondamentale delle fibre vegetali usate per produrre carta.'],
    ['p502','pfp5','pfp5','La pergamena tradizionale è ottenuta da…',['pelle animale lavorata','rocce sedimentarie','olio siccativo','cemento'],0,'La pergamena deriva da pelle animale sottoposta a specifiche lavorazioni.'],
    ['p503','pfp5','pfp5','In un manoscritto, che cos’è un fascicolo?',['Un insieme di carte o bifogli raccolti','Un pigmento rosso','Una cornice lignea','Un marmo scolpito'],0,'Il fascicolo è una unità costitutiva di molti codici e libri cuciti.'],
    ['p504','pfp5','pfp5','Una “lacuna” in una stampa è…',['una parte mancante dell’immagine o del supporto','una pagina numerata','un margine decorativo integro','un tipo di inchiostro'],0,'Una lacuna indica una perdita di materiale o di leggibilità che può essere documentata.'],
    ['p505','pfp5','pfp5','Per la prova attitudinale PFP5 la pagina Brera menziona…',['acquerello oppure matite colorate su facsimili lacunosi','solo intaglio di marmo','solo vernici a solvente','soltanto modellato in creta'],0,'La scheda ufficiale propone integrazione di lacune su facsimili mediante acquerello o matite colorate.'],
    ['p506','pfp5','pfp5','Che cos’è una filigrana nella carta?',['Un segno incorporato nella carta durante la fabbricazione','Un pigmento sintetico','La cucitura esterna della coperta','Una pietra da mosaico'],0,'La filigrana è un segno percepibile spesso in trasparenza nella carta.'],
    ['p507','pfp5','pfp5','La xilografia è una tecnica di stampa che impiega tradizionalmente…',['una matrice in legno','una lastra di marmo piena','un negativo fotografico digitale','solo caratteri tipografici mobili'],0,'La xilografia usa una matrice lignea incisa.'],
    ['p508','pfp5','pfp5','Che cosa indica “acidificazione” della carta?',['Tendenza del materiale a condizioni chimiche più acide','Aumento delle dimensioni del foglio','Aggiunta di una nuova rilegatura','Riduzione della luce nel museo'],0,'L’acidità è uno degli aspetti chimici da conoscere nello studio dell’invecchiamento della carta.'],
    ['p509','pfp5','pfp5','Una stampa fotografica storica va studiata considerando…',['supporto, strati dell’immagine e processo fotografico','solo l’immagine visibile senza materiale','solo la cornice nuova','solo la dimensione del file digitale'],0,'La tecnologia fotografica influisce sui materiali e sulle necessità conservative.'],
    ['p510','pfp5','pfp5','Un negativo fotografico tradizionale…',['può presentare valori tonali invertiti rispetto al positivo','è sempre una stampa a colori','non contiene immagini','è un tipo di papiro'],0,'Nei negativi l’inversione tonale consente l’ottenimento del positivo tramite opportuno processo.'],
    ['p511','pfp5','pfp5','Un libro antico può richiedere lo studio di…',['cucitura, coperta, carte e materiali di legatura','solo il testo trascritto al computer','solo il colore del dorso nuovo','solo la sala di esposizione'],0,'La struttura materiale del volume è essenziale alla sua comprensione conservativa.'],
    ['p512','pfp5','pfp5','Nell’esercizio su un facsimile lacunoso l’obiettivo è soprattutto…',['coerenza grafica e controllo del gesto senza alterare un originale','inventare liberamente nuove figure','usare la carta originale di un archivio','nascondere la presenza della lacuna con incisioni'],0,'Per esercitarsi si usano facsimili: la prova misura precisione e manualità, non autorizza interventi su originali.'],
  ].map(([id,profile,topic,question,options,answer,explanation]) => ({id,profile,topic,question,options,answer,explanation,source:source[profile]}));

  // Progression topics: editorial 4-week plan, not an official or personalized deadline.
  const topics = [
    ['c01','comune','Storia dell’arte: Medioevo e gotico',1,'arte'],
    ['c02','comune','Storia dell’arte: Giotto e primo Rinascimento',1,'arte'],
    ['c03','comune','Scienze: atomi, elementi e miscugli',1,'scienze'],
    ['c04','comune','Scienze: soluzioni e pH',1,'scienze'],
    ['c05','comune','Inglese: lessico base di opere e materiali',1,'inglese'],
    ['c06','comune','Restauro: istanza storica ed estetica',1,'teoria'],
    ['c07','comune','Disegno: contorni e proporzioni senza chiaroscuro',1,'disegno'],
    ['c08','comune','Storia dell’arte: pieno Rinascimento',2,'arte'],
    ['c09','comune','Storia dell’arte: Manierismo e Barocco',2,'arte'],
    ['c10','comune','Scienze: luce, radiazioni e temperatura',2,'scienze'],
    ['c11','comune','Scienze: acqua e umidità relativa',2,'scienze'],
    ['c12','comune','Inglese: comprensione di brevi testi tecnici',2,'inglese'],
    ['c13','comune','Disegno: esercizio a scala assegnata',2,'disegno'],
    ['c14','comune','Restauro: documentazione e diagnosi',2,'teoria'],
    ['c15','comune','Storia dell’arte: Settecento e Ottocento',3,'arte'],
    ['c16','comune','Storia dell’arte: arte del Novecento',3,'arte'],
    ['c17','comune','Scienze: chimica dei materiali e degrado',3,'scienze'],
    ['c18','comune','Scienze: biodeterioramento',3,'scienze'],
    ['c19','comune','Inglese: forme verbali e termini di conservazione',3,'inglese'],
    ['c20','comune','Restauro: integrazione, riconoscibilità, tutela',3,'teoria'],
    ['c21','comune','Disegno: confronto sistematico con il modello',4,'disegno'],
    ['c22','comune','Ripasso trasversale e simulazione didattica',4,'ripasso'],
    ['p1-01','pfp1','Materiali lapidei: proprietà e degrado',1,'pfp1'],
    ['p1-02','pfp1','Gessi, stucchi e intonaci',1,'pfp1'],
    ['p1-03','pfp1','Mosaici: tessere e allettamento',2,'pfp1'],
    ['p1-04','pfp1','Dipinti murali: tecniche di esecuzione',2,'pfp1'],
    ['p1-05','pfp1','Stratigrafia e documentazione dei manufatti',2,'pfp1'],
    ['p1-06','pfp1','Modellato: proporzioni in scala 1:1',3,'pfp1'],
    ['p1-07','pfp1','Modellato: rilievo, profondità e superficie',3,'pfp1'],
    ['p1-08','pfp1','Diagnostica e alterazioni dei materiali',4,'pfp1'],
    ['p1-09','pfp1','Bibliografia specifica PFP1',4,'pfp1'],
    ['p1-10','pfp1','Ripasso mirato PFP1 e revisione lavori',4,'pfp1'],
    ['p2-01','pfp2','Struttura di un dipinto su tela e tavola',1,'pfp2'],
    ['p2-02','pfp2','Preparazioni, pigmenti e leganti',1,'pfp2'],
    ['p2-03','pfp2','Tempera: campiture e uniformità',2,'pfp2'],
    ['p2-04','pfp2','Colore: rapporti cromatici e geometria',2,'pfp2'],
    ['p2-05','pfp2','Legno: strutture, lavorazioni e degrado',2,'pfp2'],
    ['p2-06','pfp2','Luce e analisi degli strati pittorici',3,'pfp2'],
    ['p2-07','pfp2','Cennino Cennini e tecniche artistiche',3,'pfp2'],
    ['p2-08','pfp2','Rigatino e tempera: distinguere le fonti',4,'pfp2'],
    ['p2-09','pfp2','Bibliografia specifica PFP2',4,'pfp2'],
    ['p2-10','pfp2','Ripasso mirato PFP2 e revisione lavori',4,'pfp2'],
    ['p5-01','pfp5','Carta: fibre, fabbricazione e degrado',1,'pfp5'],
    ['p5-02','pfp5','Pergamena: origine e proprietà',1,'pfp5'],
    ['p5-03','pfp5','Storia del libro e della stampa',2,'pfp5'],
    ['p5-04','pfp5','Legatura: fascicoli e cuciture',2,'pfp5'],
    ['p5-05','pfp5','Tecniche grafiche: xilografia e incisione',2,'pfp5'],
    ['p5-06','pfp5','Facsimile: integrazione delle lacune',3,'pfp5'],
    ['p5-07','pfp5','Acquerello e matite: controllo del segno',3,'pfp5'],
    ['p5-08','pfp5','Materiali fotografici e archivi',4,'pfp5'],
    ['p5-09','pfp5','Bibliografia specifica PFP5',4,'pfp5'],
    ['p5-10','pfp5','Ripasso mirato PFP5 e revisione lavori',4,'pfp5'],
  ].map(([id,profile,title,week,area]) => ({id,profile,title,week,area}));

  // Practical exercises operate ONLY on reproductions, harmless training models or facsimiles.
  const drills = [
    {id:'d-common-1',profile:'comune',title:'Disegno lineare: copia fedele da fotografia',duration:'20–30 minuti',materials:'Stampa fotografica di un dettaglio architettonico o decorativo, carta, matita in grafite, righello.',steps:['Osserva le proporzioni prima di disegnare.','Definisci il rettangolo d’ingombro e gli assi principali.','Riproduci il contorno con tratto lineare, senza chiaroscuro.','Confronta fotografia e copia: forme, distanze, errori.'],criteria:['Proporzioni generali coerenti','Contorni leggibili e continui','Nessun chiaroscuro aggiunto','Correzioni annotate'],note:'Esercizio orientativo basato sulla descrizione ufficiale della prova grafica.',source:common},
    {id:'d-common-2',profile:'comune',title:'Disegno in scala: raddoppio e riduzione',duration:'25–40 minuti',materials:'Stampa di figura geometrica decorativa, carta quadrettata per lo studio, foglio finale, matita, righello.',steps:['Individua una misura di riferimento.','Disegna lo stesso soggetto prima 1:1, poi a 1:2 e a 2:1.','Controlla le proporzioni interne e gli allineamenti.','Ripeti su un foglio pulito senza griglia.'],criteria:['Scala rispettata','Rapporti tra le parti corretti','Tratto pulito','Errori individuati'],note:'Le scale sono scelte per l’allenamento: quella dell’esame sarà comunicata secondo le istruzioni vigenti.',source:common},
    {id:'d-p1-1',profile:'pfp1',title:'Modellato PFP1: piccolo rilievo in plastilina',duration:'35–50 minuti',materials:'Plastilina, tavoletta, piccolo modello non storico in gesso o materiale inerte, strumenti non taglienti.',steps:['Osserva ingombro e spessori del modello.','Stabilisci punti di riferimento e proporzioni.','Costruisci la forma partendo dai volumi maggiori.','Rifinisci gradualmente i dettagli; fotografa da due angolazioni.'],criteria:['Rapporti dimensionali coerenti','Profondità controllata','Superficie curata','Confronto visivo finale svolto'],note:'Non usare opere originali. È un adattamento didattico della copia in plastilina 1:1.',source:common},
    {id:'d-p1-2',profile:'pfp1',title:'Modellato PFP1: verifica dei profili laterali',duration:'20–35 minuti',materials:'Modello inerte in rilievo, plastilina, tavoletta, fotografie laterali.',steps:['Riprendi un rilievo già realizzato.','Confronta sporgenze osservando il profilo laterale.','Misura 3 profondità chiave con riferimento semplice.','Annota le tre differenze più visibili.'],criteria:['Profondità osservate','Misure coerenti','Correzioni mirate','Documentazione fotografica'],note:'Autovalutazione della precisione volumetrica, non valutazione ufficiale.',source:common},
    {id:'d-p1-3',profile:'pfp1',title:'PFP1: mappa visiva di un mosaico',duration:'25–35 minuti',materials:'Fotografia pubblica di mosaico, foglio e matite.',steps:['Distingui campo, bordo e tessere.','Segna gli allineamenti principali e le lacune visibili.','Descrivi le differenze tra mosaico pavimentale e parietale.','Riassumi in 5 parole chiave ciò che hai osservato.'],criteria:['Elementi principali riconosciuti','Struttura descritta','Osservazione accurata','Sintesi chiara'],note:'Non è una prova di restauro su un mosaico reale.',source:common},
    {id:'d-p1-4',profile:'pfp1',title:'PFP1: diario dei materiali lapidei',duration:'25–35 minuti',materials:'Tre fotografie di superfici lapidee differenti, scheda di osservazione.',steps:['Per ogni immagine descrivi forma e struttura senza interpretazioni premature.','Elenca depositi o alterazioni visibili con linguaggio prudente.','Indica quali analisi sarebbero necessarie prima di intervenire.','Confronta i tre casi.'],criteria:['Descrizioni distinte da diagnosi','Terminologia appropriata','Tre casi documentati','Dubbio/certezza esplicitati'],note:'È un esercizio di osservazione, non autorizza puliture o consolidamenti.',source:common},
    {id:'d-p2-1',profile:'pfp2',title:'PFP2: campionatura geometrica a tempera',duration:'35–50 minuti',materials:'Cartoncino preparato a gesso per esercizi, tempere ad acqua per uso artistico, pennelli e campione geometrico stampato.',steps:['Prepara una figura geometrica con 4 campiture nette.','Osserva proporzioni e relazioni cromatiche.','Riproduci in scala 1:1 le aree sul supporto preparato.','Confronta campiture e bordi sotto luce uniforme.'],criteria:['Geometria precisa','Campiture uniformi','Colori confrontati con cura','Bordi puliti'],note:'È la pratica didattica coerente con la pagina ufficiale PFP2; la trascrizione parla anche di rigatino.',source:pfp2},
    {id:'d-p2-2',profile:'pfp2',title:'PFP2: ruota di tonalità e miscelazione',duration:'20–35 minuti',materials:'Cartoncino, tempere artistiche ad acqua, pennelli.',steps:['Seleziona tre colori base.','Crea 6 miscele con piccole variazioni controllate.','Disponile dal tono più chiaro al più scuro.','Indica come cambiano saturazione e luminosità.'],criteria:['Variazioni riconoscibili','Campioni ordinati','Annotazioni cromatiche','Pulizia del lavoro'],note:'Allenamento di osservazione cromatica, non riproduzione di prova ufficiale.',source:pfp2},
    {id:'d-p2-3',profile:'pfp2',title:'PFP2: differenza fra supporto e strati',duration:'25–40 minuti',materials:'Scheda o fotografia didattica di sezione stratigrafica di dipinto, carta e matite.',steps:['Identifica il supporto.','Individua preparazione, pittura e eventuale finitura nel diagramma.','Definisci una funzione per ciascun livello.','Annota che cosa non puoi dedurre dalla sola immagine.'],criteria:['Strati distinti','Funzioni spiegate','Limiti dell’osservazione riconosciuti','Scheda ordinata'],note:'Solo immagini didattiche; non prelevare campioni da opere.',source:pfp2},
    {id:'d-p2-4',profile:'pfp2',title:'PFP2: esercizio di rigatino su fotocopia',duration:'25–35 minuti',materials:'Fotocopia di immagine lacunosa, matite colorate, pennarello a punta fine per esercizi.',steps:['Guarda un esempio di selezione cromatica.','Su una copia, completa un piccolo dettaglio con segni paralleli.','Confronta integrazione e originale da vicino e da lontano.','Annota perché non va confusa con la prova a tempera descritta da Brera.'],criteria:['Segno regolare','Controllo del colore','Confronto visivo','Differenza con la prova ufficiale compresa'],note:'Solo attività integrativa derivata dall’Open Day; NON sostituisce la preparazione alla tempera.',source:pfp2},
    {id:'d-p5-1',profile:'pfp5',title:'PFP5: integra una lacuna su facsimile',duration:'30–45 minuti',materials:'Stampa di motivo grafico con piccolo vuoto bianco, matite colorate o acquerello, foglio di prova.',steps:['Scegli un facsimile stampato e delimitane una piccola lacuna.','Analizza direzione, colore e densità del segno attorno alla lacuna.','Reintegra sul facsimile senza disegnare a caso.','Confronta il risultato con la continuità del motivo.'],criteria:['Continuazione grafica coerente','Tonalità controllata','Bordi leggibili','Facsimile non originale usato'],note:'Brera indica acquerello oppure matite colorate. Non esercitarti su originali.',source:pfp5},
    {id:'d-p5-2',profile:'pfp5',title:'PFP5: tratti fini e ritmo del segno',duration:'20–30 minuti',materials:'Carta da esercitazione, penna o matita, modello stampato di linee e tratteggi.',steps:['Riproduci 3 serie di linee a intervalli regolari.','Ripeti con tratteggi obliqui e curvi.','Osserva pressione, direzione e costanza.','Annota quale sequenza richiede più controllo.'],criteria:['Intervalli regolari','Pressione omogenea','Direzione controllata','Errori individuati'],note:'Allenamento di manualità fine; non è un modello ufficiale.',source:pfp5},
    {id:'d-p5-3',profile:'pfp5',title:'PFP5: anatomia di un volume su disegno',duration:'25–35 minuti',materials:'Fotografia di un libro non raro, foglio, matita.',steps:['Disegna lo schema di un libro visto di lato.','Etichetta dorso, piatti, cucitura, carte e coperta se visibili.','Distingui gli elementi che conosci da quelli non visibili.','Controlla i termini sul glossario.'],criteria:['Elementi identificati','Distinzione visibile/non visibile','Lessico appropriato','Confronto con risorsa svolto'],note:'Non smontare volumi storici né effettuare interventi su libri di valore.',source:pfp5},
    {id:'d-p5-4',profile:'pfp5',title:'PFP5: confronto fra stampa e fotografia',duration:'20–35 minuti',materials:'Riproduzioni di un’incisione e di una fotografia, quaderno.',steps:['Annota come è costruita l’immagine nelle due tecniche.','Individua eventuali tracce di matrice o reticolo.','Descrivi supporti e tecniche senza forzare un’attribuzione.','Elenca due domande da approfondire nella bibliografia PFP5.'],criteria:['Osservazione accurata','Tecniche distinte','Dubbio esplicito','Due domande di ricerca formulate'],note:'Esercizio di osservazione guidata, non identificazione professionale.',source:pfp5},
  ];
  window.BRERA_STUDY_DATA={ questions, topics, drills, sources:source,
    profileNames:{pfp1:'PFP1 · Pietra e superfici',pfp2:'PFP2 · Dipinti e legno',pfp5:'PFP5 · Carta e fotografia'},
    areaNames:{arte:'Storia dell’arte',scienze:'Scienze',inglese:'Inglese',teoria:'Teoria del restauro',disegno:'Disegno',ripasso:'Ripasso',pfp1:'PFP1',pfp2:'PFP2',pfp5:'PFP5'}
  };
})();
