export const servicesData = [
    {
        id: 1,
        title: "Strategy",
        slug: "strategy",
        cat: "Foundation",
        description: "Definiamo il percorso verso il successo attraverso analisi di mercato, posizionamento di marca e strategie digitali su misura.",
        extendedDescription: "Non è sufficiente essere creativi se non si ha una chiara direzione. La nostra fase di Strategy funge da bussola per ogni decisione di design, sviluppo e marketing. Analizziamo a fondo i tuoi competitor, studiamo le abitudini del tuo pubblico di riferimento e identifichiamo i veri punti di differenziazione del tuo brand. Trasformiamo dati complessi in un piano d'azione concreto ed eseguibile, assicurandoci che ogni euro investito generi un ritorno reale sull'investimento.",
        tags: ["Market Analysis", "Brand Positioning", "Roadmap", "KPIs"],
        benefits: [
            "Chiarezza sugli obiettivi di business a breve e lungo termine.",
            "Identificazione di nicchie di mercato inesplorate.",
            "Riduzione degli sprechi di budget ottimizzando le risorse.",
            "Un posizionamento univoco che ti differenzia dalla concorrenza."
        ],
        process: [
            { step: "01", name: "Discovery", desc: "Audit approfondito del brand attuale, interviste agli stakeholder e definizione degli obiettivi primari." },
            { step: "02", name: "Market Analysis", desc: "Studio dei competitor diretti e indiretti e mappatura delle best practice del settore." },
            { step: "03", name: "Positioning", desc: "Definizione del posizionamento unico di valore (UVP) e dell'archetipo del brand." },
            { step: "04", name: "Roadmap", desc: "Creazione di un piano d'azione dettagliato su canali, tempistiche e KPI da monitorare." }
        ]
    },
    {
        id: 2,
        title: "Brand Identity",
        slug: "brand-identity",
        cat: "Visual",
        description: "Creiamo identità visive uniche che raccontano la tua storia e rimangono impresse nella mente del tuo pubblico.",
        extendedDescription: "Il tuo brand è molto più del tuo logo. È la percezione mentale che le persone hanno di te. Lavoriamo sull'anima estetica della tua azienda, traducendo i tuoi valori in forme, colori, e tipografie che comunicano in modo istantaneo e potente ad ogni touchpoint. Dalla carta intestata all'interfaccia dell'app, garantiamo una coerenza incrollabile che costruisce fiducia e autorevolezza nel tempo.",
        tags: ["Logo Design", "Visual System", "Rebranding", "Guidelines"],
        benefits: [
            "Aumento immediato del valore percepito del brand.",
            "Coerenza totale su tutti i materiali di comunicazione.",
            "Maggiore riconoscibilità e ricordo da parte del pubblico.",
            "Flessibilità del sistema visivo per adattarsi a futuri scenari."
        ],
        process: [
            { step: "01", name: "Concept", desc: "Esplorazione visiva attraverso moodboards per definire la direzione stilistica generale." },
            { step: "02", name: "Logo Design", desc: "Progettazione del marchio primario, logotipi secondari e icone di supporto." },
            { step: "03", name: "Visual System", desc: "Creazione della palette cromatica, selezione tipografica ed elementi grafici distintivi." },
            { step: "04", name: "Guidelines", desc: "Stesura del Brand Manual, le linee guida ufficiali per applicare l'identità correttamente ovunque." }
        ]
    },
    {
        id: 3,
        title: "Web Development",
        slug: "web-development",
        cat: "Technology",
        description: "Sviluppiamo ecosistemi digitali performanti, sicuri e scalabili, utilizzando le tecnologie più all'avanguardia.",
        extendedDescription: "Scriviamo codice pensando al futuro. I nostri progetti web non sono solo esteticamente affascinanti, ma possiedono fondamenta tecniche solide. Ottimizziamo asset grafici al nanosecondo, implementiamo architetture headless per flessibilità estrema e assicuriamo standard di sicurezza di livello enterprise. Un bel sito che carica lentamente perde clienti; noi ci assicuriamo che ogni interazione sia fluida, immediata e senza attriti.",
        tags: ["Frontend", "Backend", "React/Vue", "Scalability"],
        benefits: [
            "Tempi di caricamento istantanei per ridurre il tasso di rimbalzo.",
            "Architetture flessibili predisposte per l'integrazione con sistemi esterni.",
            "Codice pulito e manutenibile, ottimizzato anche per i motori di ricerca.",
            "Massima sicurezza contro minacce e vulnerabilità comuni."
        ],
        process: [
            { step: "01", name: "Architecture", desc: "Scelta dello stack tecnologico migliore in base ai requisiti (es. React, Next.js, Laravel/ASP.NET)." },
            { step: "02", name: "Frontend", desc: "Sviluppo pixel-perfect delle interfacce con attenzione maniacale ad animazioni e responsiveness." },
            { step: "03", name: "Backend", desc: "Creazione di database robusti e API veloci per gestire dati e logiche di business complesse." },
            { step: "04", name: "Testing & Deploy", desc: "Controlli di qualità rigorosi pre-lancio, ottimizzazione performance e messa online controllata." }
        ]
    },
    {
        id: 4,
        title: "UI/UX Design",
        slug: "ui-ux-design",
        cat: "Experience",
        description: "Progettiamo interfacce intuitive e percorsi utente memorabili che mettono l'emozione al centro dell'interazione.",
        extendedDescription: "Il design dell'interfaccia (UI) e l'esperienza utente (UX) sono il cuore pulsante di qualsiasi prodotto digitale di successo. Non ci limitiamo a far apparire belle le cose; studiamo la psicologia dell'utente per creare flussi di navigazione logici e gratificanti. Ridurre la frizione per trasformare un visitatore casuale in un utente fedele è il nostro obiettivo primario su cui misuriamo il successo del design.",
        tags: ["Wireframing", "Prototyping", "User Testing", "Interface"],
        benefits: [
            "Aumento significativo del tasso di conversione grazie a flussi intuitivi.",
            "Interfacce esteticamente superiori che aumentano l'engagement.",
            "Riduzione dei costi di supporto clienti eliminando la confusione d'uso.",
            "Design systems scalabili per mantenere la coerenza mentre il prodotto cresce."
        ],
        process: [
            { step: "01", name: "User Research", desc: "Comprendere le necessità reali degli utenti attraverso mapping e user personas." },
            { step: "02", name: "Wireframing", desc: "Progettazione schematica dell'architettura dell'informazione e della struttura di pagina." },
            { step: "03", name: "UI Design", desc: "Applicazione dello stile visivo, micro-interazioni, colori e componenti ad alta fedeltà." },
            { step: "04", name: "Prototyping", desc: "Creazione di versioni cliccabili per testare fluidità ed esperienza prima dello sviluppo." }
        ]
    },
    // Default values for the remaining services to keep it concise. 
    ...[
        "E-commerce", "Graphic Design", "Advertising", "Social Media",
        "SEO & Performance", "Foto e Video", "Motion Design", "3D Rendering"
    ].map((t, idx) => ({
        id: idx + 5,
        title: t,
        slug: t.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and').replace(/\s+/g, '-'),
        cat: "Expertise",
        description: `Costruiamo soluzioni premium verticali sulla categoria ${t}, massimizzando l'impatto sul tuo mercato.`,
        extendedDescription: `Quando ci occupiamo di ${t}, portiamo sul tavolo decine di anni di esperienza combinata. L'obiettivo non è seguire le mode passeggere, ma applicare principi fondamentali che generano valore a lungo termine. Uniamo pensiero laterale e rigore analitico per superare le aspettative dei tuoi clienti, elevando la percezione del tuo brand in ogni punto di contatto.`,
        tags: ["Premium Quality", "Tailored Solutions", "High ROI", "Innovation"],
        benefits: [
            "Soluzioni altamente specializzate calate sul tuo contesto competitivo.",
            "Risultati oggettivi e misurabili attraverso KPI condivisi.",
            "Approccio consulenziale continuo oltre la semplice esecuzione.",
            "Accesso a professionisti senior focalizzati sull'eccellenza."
        ],
        process: [
            { step: "01", name: "Analisi", desc: "Valutazione del contesto e definizione dell'approccio strategico ottimale." },
            { step: "02", name: "Pianificazione", desc: "Setup degli strumenti operativi e definizione delle tempistiche." },
            { step: "03", name: "Execution", desc: "Sviluppo o produzione del servizio mantenendo altissimi standard qualitativi." },
            { step: "04", name: "Ottimizzazione", desc: "Fase successiva di affinamento continuo in base ai dati raccolti post-lancio." }
        ]
    }))
];
