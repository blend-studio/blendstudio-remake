"""
seed_content.py — Popola MongoDB con i contenuti iniziali di tutte le pagine.

Esecuzione:
    docker exec blendstudio_analytics python /app/seed_content.py

Il flag --force sovrascrive i documenti esistenti:
    docker exec blendstudio_analytics python /app/seed_content.py --force
"""

import sys
import json
import os
from datetime import datetime, timezone
from pymongo import MongoClient

MONGO_URI = os.getenv("MONGO_CONNECTION_STRING", "mongodb://admin:Blend2024!@mongodb:27017")
DB_NAME   = os.getenv("MONGO_DATABASE_NAME", "blendstudio")
FORCE     = "--force" in sys.argv

client = MongoClient(MONGO_URI)
db     = client[DB_NAME]
col    = db["adminpanel"]

# ─── Struttura contenuti ────────────────────────────────────────────────────

PAGES = {

    # ─────────────────────────────────────────────────────────────────────────
    # GLOBALS — elementi condivisi (Navbar, Footer, Socials, info azienda)
    # ─────────────────────────────────────────────────────────────────────────
    "globals": {
        "company": {
            "name":    "Blend Studio",
            "tagline": "Mixed Creativity",
            "email":   "info@blendstudio.it",
            "phone":   "+39 352 039 0732",
            "address": "Strada Val Nure 16/I",
            "city":    "29122 Piacenza, IT",
            "vat":     "01905100333",
            "hours": {
                "weekdays": {"label": "Lun — Ven", "value": "09:00 — 18:00"},
                "weekend":  {"label": "Sab — Dom", "value": "Chiuso"}
            },
            "mapEmbed": (
                "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2819.78907623281!"
                "2d9.684598676588122!3d45.02920706235652!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!"
                "4f13.1!3m3!1m2!1s0x4780c330d18c59c7%3A0x1980fc7c642a1922!2sBlend%20Studio"
                "%20%7C%20Mixed%20Creativity!5e0!3m2!1sit!2sit!4v1769083613436!5m2!1sit!2sit"
            )
        },
        "socials": [
            {"name": "Instagram", "abbr": "IG", "url": "#"},
            {"name": "LinkedIn",  "abbr": "LI", "url": "#"},
            {"name": "Facebook",  "abbr": "FB", "url": "#"}
        ],
        "nav": [
            {"title": "Home",           "href": "/"},
            {"title": "Chi siamo",      "href": "/about"},
            {"title": "Progetti",       "href": "/projects"},
            {"title": "Servizi",        "href": "/services"},
            {"title": "Lavora con noi", "href": "/careers"},
            {"title": "Contatti",       "href": "/contact"}
        ],
        "footer": {
            "cta":      "Ready to blend excellence with us?",
            "ctaLabel": "Let's work together",
            "legal":    "Blend Studio Srl — Tutti i diritti riservati.",
            "links": [
                {"label": "Privacy Policy", "href": "#"},
                {"label": "Cookie Policy",  "href": "#"}
            ]
        }
    },

    # ─────────────────────────────────────────────────────────────────────────
    # HOME
    # ─────────────────────────────────────────────────────────────────────────
    "home": {
        "hero": {
            "eyebrow": "Digital Creative Experience",
            "line1":   "WE CRAFT",
            "line2":   "DIGITAL",
            "line3":   "EMOTIONS"
        },
        "statement": {
            "label":     "Lo Studio",
            "highlight": "Non creiamo solo siti web. Costruiamo ecosistemi digitali che trasformano brand ordinari in icone memorabili.",
            "body":      "In un mondo rumoroso, il silenzio del buon design è l'unico modo per farsi ascoltare. Lavoriamo all'intersezione tra estetica e funzionalità per garantire risultati misurabili."
        },
        "clients": {
            "title":    "Chi ci ha scelto",
            "subtitle": "Collaboriamo con brand ambiziosi per ridefinire i confini del possibile.",
            "logos": [
                "https://blendstudio.it/wp-content/uploads/2023/08/emilia-wine-experience-1.jpg",
                "https://blendstudio.it/wp-content/uploads/2024/01/cucine-da-incubo-logo2-1.jpg",
                "https://blendstudio.it/wp-content/uploads/2021/11/onestigroup-02.png"
            ]
        },
        "services_preview": {
            "title":     "Services",
            "eyebrow":   "Innovazione & Design",
            "cta_label": "Esplora expertise",
            "items": [
                {"title": "Brand Identity",   "slug": "brand-identity",  "cat": "Visual",      "desc": "Creiamo identità visive uniche che rimangono impresse.",                   "details": "Dallo studio del logo alla definizione della palette cromatica e della tipografia, costruiamo un'identità visiva coerente e memorabile.",               "features": ["Logo Design", "Brand Guidelines", "Visual Strategy", "Rebranding"]},
                {"title": "Web Experience",   "slug": "web-development", "cat": "Technology",  "desc": "Sviluppiamo ecosistemi digitali d'avanguardia.",                           "details": "Progettiamo e sviluppiamo siti web e applicazioni web che uniscono design emozionale e performance tecniche impeccabili.",                           "features": ["Custom Development", "Frontend & Backend", "CMS Integration", "Web Apps"]},
                {"title": "Digital Strategy", "slug": "strategy",        "cat": "Foundation",  "desc": "Definiamo il percorso verso il successo del tuo brand.",                   "details": "Analizziamo il mercato, i competitor e il tuo target per definire una strategia digitale su misura.",                                                "features": ["Market Analysis", "Brand Positioning", "Digital Roadmap", "Growth Hacking"]},
                {"title": "UI/UX Design",     "slug": "ui-ux-design",    "cat": "Experience",  "desc": "Progettiamo interfacce che mettono l'emozione al centro.",                  "details": "Creiamo esperienze utente intuitive e coinvolgenti. Attraverso wireframing, prototipazione e user testing.",                                        "features": ["User Research", "Wireframing", "Prototyping", "Design Systems"]},
                {"title": "Content Creation", "slug": "foto-video",      "cat": "Production",  "desc": "Raccontiamo la tua realtà attraverso storytelling video.",                  "details": "Produciamo contenuti multimediali di alta qualità che catturano l'attenzione.",                                                                     "features": ["Video Production", "Photography", "Copywriting", "Art Direction"]},
                {"title": "Motion Design",    "slug": "motion-design",   "cat": "Animation",   "desc": "Diamo vita alle tue idee con grafiche in movimento.",                       "details": "Aggiungiamo una dimensione dinamica alla tua comunicazione. Animazioni 2D e 3D che spiegano concetti complessi.",                                    "features": ["2D Animation", "3D Motion", "Micro-interactions", "Explainer Videos"]},
                {"title": "SEO & Performance","slug": "seo-performance", "cat": "Data",        "desc": "Scaliamo i risultati attraverso dati e ottimizzazione.",                    "details": "Ottimizziamo la tua presenza online per garantire la massima visibilità sui motori di ricerca.",                                                    "features": ["Technical SEO", "On-page Optimization", "Performance Tuning", "Analytics"]},
                {"title": "3D Rendering",     "slug": "3d-rendering",    "cat": "Future",      "desc": "Creiamo mondi tridimensionali e visioni fotorealistiche.",                  "details": "Realizziamo visualizzazioni 3D fotorealistiche per prodotti, architettura e concept design.",                                                       "features": ["Product Visualization", "Architectural Viz", "3D Modeling", "Virtual Environments"]}
            ]
        },
        "works": {
            "title":    "Works",
            "subtitle": "L'eccellenza in ogni pixel."
        },
        "cta": {
            "eyebrow": "Hai un progetto in mente?",
            "title":   "LET'S TALK"
        }
    },

    # ─────────────────────────────────────────────────────────────────────────
    # ABOUT
    # ─────────────────────────────────────────────────────────────────────────
    "about": {
        "hero": {
            "eyebrow":   "The Studio",
            "line1":     "DIGITAL",
            "line2":     "ARTISANS",
            "heroImage": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2670&auto=format&fit=crop"
        },
        "manifesto": {
            "highlight": "Siamo un collettivo di creativi, sviluppatori e strateghi. Crediamo che il digitale non sia solo codice, ma un'estensione dell'identità umana.",
            "body":      "Non ci accontentiamo del \"funzionale\". Cerchiamo il memorabile. Ogni pixel è posizionato con intenzione, ogni interazione è progettata per evocare un'emozione. Siamo gli architetti della tua presenza digitale."
        },
        "gallery": [
            "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1000&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1000&auto=format&fit=crop"
        ],
        "philosophy": {
            "title": "Il Metodo",
            "body":  "Uniamo la precisione ingegneristica e l'intuizione artistica. Ogni progetto nasce da una profonda analisi dei dati e fiorisce attraverso un design emotivo.",
            "steps": ["Ricerca & Strategia", "Design & Prototipazione", "Sviluppo & Tuning", "Lancio & Crescita"],
            "image": "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop"
        },
        "values": {
            "label": "Core Values",
            "title": "Ciò in cui crediamo",
            "items": [
                {"title": "Innovazione", "desc": "Sfidiamo lo status quo ogni giorno. Non seguiamo i trend, li anticipiamo con coraggio creativo."},
                {"title": "Precisione",  "desc": "Il dettaglio non è un dettaglio. È l'essenza del design che fa la differenza."},
                {"title": "Empatia",     "desc": "Design umano per esseri umani. Mettiamo le emozioni reali al centro di ogni pixel."},
                {"title": "Visione",     "desc": "Guardiamo oltre l'orizzonte digitale per anticipare il futuro."},
                {"title": "Qualità",     "desc": "L'eccellenza è la nostra unica metrica di successo. Senza compromessi."}
            ]
        },
        "team_cta": {
            "title":       "Le persone dietro il codice",
            "button_label": "Unisciti a noi"
        }
    },

    # ─────────────────────────────────────────────────────────────────────────
    # SERVICES
    # ─────────────────────────────────────────────────────────────────────────
    "services": {
        "hero": {
            "eyebrow":  "Our Expertise",
            "line1":    "ELEVATING",
            "line2":    "BRANDS",
            "subtitle": "Soluzioni digitali integrate per aziende ambiziose. Dalla strategia alla produzione d'eccellenza."
        },
        "cta": {
            "line1":        "Let's create.",
            "button_label": "Avvia un progetto"
        },
        "items": [
            {
                "id": 1, "title": "Strategy", "slug": "strategy", "cat": "Foundation",
                "description": "Definiamo il percorso verso il successo attraverso analisi di mercato, posizionamento di marca e strategie digitali su misura.",
                "extended_description": "Non è sufficiente essere creativi se non si ha una chiara direzione. La nostra fase di Strategy funge da bussola per ogni decisione di design, sviluppo e marketing.",
                "tags": ["Market Analysis", "Brand Positioning", "Roadmap", "KPIs"],
                "benefits": [
                    "Chiarezza sugli obiettivi di business a breve e lungo termine.",
                    "Identificazione di nicchie di mercato inesplorate.",
                    "Riduzione degli sprechi di budget ottimizzando le risorse.",
                    "Un posizionamento univoco che ti differenzia dalla concorrenza."
                ],
                "process": [
                    {"step": "01", "name": "Discovery",       "desc": "Audit approfondito del brand attuale, interviste agli stakeholder e definizione degli obiettivi primari."},
                    {"step": "02", "name": "Market Analysis", "desc": "Studio dei competitor diretti e indiretti e mappatura delle best practice del settore."},
                    {"step": "03", "name": "Positioning",     "desc": "Definizione del posizionamento unico di valore (UVP) e dell'archetipo del brand."},
                    {"step": "04", "name": "Roadmap",         "desc": "Creazione di un piano d'azione dettagliato su canali, tempistiche e KPI da monitorare."}
                ]
            },
            {
                "id": 2, "title": "Brand Identity", "slug": "brand-identity", "cat": "Visual",
                "description": "Creiamo identità visive uniche che raccontano la tua storia e rimangono impresse nella mente del tuo pubblico.",
                "extended_description": "Il tuo brand è molto più del tuo logo. È la percezione mentale che le persone hanno di te.",
                "tags": ["Logo Design", "Visual System", "Rebranding", "Guidelines"],
                "benefits": [
                    "Aumento immediato del valore percepito del brand.",
                    "Coerenza totale su tutti i materiali di comunicazione.",
                    "Maggiore riconoscibilità e ricordo da parte del pubblico.",
                    "Flessibilità del sistema visivo per adattarsi a futuri scenari."
                ],
                "process": [
                    {"step": "01", "name": "Concept",       "desc": "Esplorazione visiva attraverso moodboards per definire la direzione stilistica generale."},
                    {"step": "02", "name": "Logo Design",   "desc": "Progettazione del marchio primario, logotipi secondari e icone di supporto."},
                    {"step": "03", "name": "Visual System", "desc": "Creazione della palette cromatica, selezione tipografica ed elementi grafici distintivi."},
                    {"step": "04", "name": "Guidelines",    "desc": "Stesura del Brand Manual, le linee guida ufficiali per applicare l'identità correttamente ovunque."}
                ]
            },
            {
                "id": 3, "title": "Web Development", "slug": "web-development", "cat": "Technology",
                "description": "Sviluppiamo ecosistemi digitali performanti, sicuri e scalabili, utilizzando le tecnologie più all'avanguardia.",
                "extended_description": "Scriviamo codice pensando al futuro. I nostri progetti web non sono solo esteticamente affascinanti, ma possiedono fondamenta tecniche solide.",
                "tags": ["Frontend", "Backend", "React/Vue", "Scalability"],
                "benefits": [
                    "Tempi di caricamento istantanei per ridurre il tasso di rimbalzo.",
                    "Architetture flessibili predisposte per l'integrazione con sistemi esterni.",
                    "Codice pulito e manutenibile, ottimizzato anche per i motori di ricerca.",
                    "Massima sicurezza contro minacce e vulnerabilità comuni."
                ],
                "process": [
                    {"step": "01", "name": "Architecture",    "desc": "Scelta dello stack tecnologico migliore in base ai requisiti."},
                    {"step": "02", "name": "Frontend",        "desc": "Sviluppo pixel-perfect delle interfacce con attenzione maniacale ad animazioni e responsiveness."},
                    {"step": "03", "name": "Backend",         "desc": "Creazione di database robusti e API veloci per gestire dati e logiche di business complesse."},
                    {"step": "04", "name": "Testing & Deploy","desc": "Controlli di qualità rigorosi pre-lancio, ottimizzazione performance e messa online controllata."}
                ]
            },
            {
                "id": 4, "title": "UI/UX Design", "slug": "ui-ux-design", "cat": "Experience",
                "description": "Progettiamo interfacce intuitive e percorsi utente memorabili che mettono l'emozione al centro dell'interazione.",
                "extended_description": "Il design dell'interfaccia (UI) e l'esperienza utente (UX) sono il cuore pulsante di qualsiasi prodotto digitale di successo.",
                "tags": ["Wireframing", "Prototyping", "User Testing", "Interface"],
                "benefits": [
                    "Aumento significativo del tasso di conversione grazie a flussi intuitivi.",
                    "Interfacce esteticamente superiori che aumentano l'engagement.",
                    "Riduzione dei costi di supporto clienti eliminando la confusione d'uso.",
                    "Design systems scalabili per mantenere la coerenza mentre il prodotto cresce."
                ],
                "process": [
                    {"step": "01", "name": "User Research", "desc": "Comprendere le necessità reali degli utenti attraverso mapping e user personas."},
                    {"step": "02", "name": "Wireframing",   "desc": "Progettazione schematica dell'architettura dell'informazione e della struttura di pagina."},
                    {"step": "03", "name": "UI Design",     "desc": "Applicazione dello stile visivo, micro-interazioni, colori e componenti ad alta fedeltà."},
                    {"step": "04", "name": "Prototyping",   "desc": "Creazione di versioni cliccabili per testare fluidità ed esperienza prima dello sviluppo."}
                ]
            },
            {
                "id": 5, "title": "E-commerce", "slug": "e-commerce", "cat": "Expertise",
                "description": "Costruiamo piattaforme di vendita online ad alte performance che massimizzano conversioni e fidelizzazione.",
                "extended_description": "Un e-commerce di successo va oltre la semplice vetrina. Progettiamo funnel di acquisto ottimizzati e esperienze di acquisto memorabili.",
                "tags": ["Shopify", "WooCommerce", "Custom Shop", "Conversion"],
                "benefits": ["Carrello ottimizzato per massimizzare le conversioni.", "Integrazione con i principali gateway di pagamento.", "Dashboard analytics per monitorare le vendite in tempo reale.", "Mobile-first per raggiungere i clienti ovunque."],
                "process": [
                    {"step": "01", "name": "Analisi",        "desc": "Valutazione del contesto e definizione dell'approccio strategico ottimale."},
                    {"step": "02", "name": "Pianificazione", "desc": "Setup degli strumenti operativi e definizione delle tempistiche."},
                    {"step": "03", "name": "Execution",      "desc": "Sviluppo o produzione del servizio mantenendo altissimi standard qualitativi."},
                    {"step": "04", "name": "Ottimizzazione", "desc": "Fase successiva di affinamento continuo in base ai dati raccolti post-lancio."}
                ]
            },
            {
                "id": 6, "title": "Graphic Design", "slug": "graphic-design", "cat": "Expertise",
                "description": "Comunicazione visiva che colpisce. Materiali print e digital che creano impatto immediato.",
                "extended_description": "Dal biglietto da visita ai grandi formati, ogni materiale grafico è concepito per comunicare con precisione chirurgica il valore del tuo brand.",
                "tags": ["Print Design", "Editorial", "Packaging", "Illustrations"],
                "benefits": ["Materiali grafici coerenti con il brand.", "Alta qualità per ogni formato e supporto.", "Design scalabile da digitale a stampa.", "Tempi di consegna rapidi con revisioni illimitate."],
                "process": [
                    {"step": "01", "name": "Analisi",        "desc": "Valutazione del contesto e definizione dell'approccio strategico ottimale."},
                    {"step": "02", "name": "Pianificazione", "desc": "Setup degli strumenti operativi e definizione delle tempistiche."},
                    {"step": "03", "name": "Execution",      "desc": "Sviluppo o produzione del servizio mantenendo altissimi standard qualitativi."},
                    {"step": "04", "name": "Ottimizzazione", "desc": "Fase successiva di affinamento continuo in base ai dati raccolti post-lancio."}
                ]
            },
            {
                "id": 7, "title": "Advertising", "slug": "advertising", "cat": "Expertise",
                "description": "Campagne paid che generano risultati reali e misurabili su tutti i canali digitali.",
                "extended_description": "Meta Ads, Google Ads, LinkedIn: gestiamo le tue campagne con approccio data-driven per massimizzare il ROAS.",
                "tags": ["Meta Ads", "Google Ads", "Retargeting", "ROAS"],
                "benefits": ["Targeting preciso per raggiungere il pubblico ideale.", "Ottimizzazione continua basata su dati reali.", "Report trasparenti e KPI concordati.", "Budget sempre sotto controllo."],
                "process": [
                    {"step": "01", "name": "Analisi",        "desc": "Valutazione del contesto e definizione dell'approccio strategico ottimale."},
                    {"step": "02", "name": "Pianificazione", "desc": "Setup degli strumenti operativi e definizione delle tempistiche."},
                    {"step": "03", "name": "Execution",      "desc": "Sviluppo o produzione del servizio mantenendo altissimi standard qualitativi."},
                    {"step": "04", "name": "Ottimizzazione", "desc": "Fase successiva di affinamento continuo in base ai dati raccolti post-lancio."}
                ]
            },
            {
                "id": 8, "title": "Social Media", "slug": "social-media", "cat": "Expertise",
                "description": "Strategia editoriale e gestione dei canali social per costruire una community autentica.",
                "extended_description": "I social non sono solo post. Sono conversazioni, relazioni e brand awareness. Gestiamo la tua presenza in modo strategico.",
                "tags": ["Instagram", "LinkedIn", "Content Calendar", "Community"],
                "benefits": ["Piano editoriale mensile su misura.", "Contenuti originali e coerenti con il brand.", "Report mensili su engagement e crescita.", "Gestione dei commenti e risposta alle DM."],
                "process": [
                    {"step": "01", "name": "Analisi",        "desc": "Valutazione del contesto e definizione dell'approccio strategico ottimale."},
                    {"step": "02", "name": "Pianificazione", "desc": "Setup degli strumenti operativi e definizione delle tempistiche."},
                    {"step": "03", "name": "Execution",      "desc": "Sviluppo o produzione del servizio mantenendo altissimi standard qualitativi."},
                    {"step": "04", "name": "Ottimizzazione", "desc": "Fase successiva di affinamento continuo in base ai dati raccolti post-lancio."}
                ]
            },
            {
                "id": 9, "title": "SEO & Performance", "slug": "seo-and-performance", "cat": "Data",
                "description": "Scaliamo i risultati attraverso dati e ottimizzazione. Visibilità organica duratura.",
                "extended_description": "Il SEO non è una magia ma una disciplina rigorosa. Ottimizziamo ogni aspetto tecnico, on-page e off-page per scalare le SERP.",
                "tags": ["Technical SEO", "On-page", "Performance Tuning", "Analytics"],
                "benefits": ["Aumento organico del traffico qualificato.", "Miglioramento Core Web Vitals.", "Audit tecnico completo del sito.", "Strategia keyword su misura per il tuo settore."],
                "process": [
                    {"step": "01", "name": "Audit SEO",      "desc": "Analisi completa dello stato attuale del sito: tecnico, on-page, off-page."},
                    {"step": "02", "name": "Keyword Research","desc": "Ricerca approfondita delle parole chiave con maggiore potenziale per il tuo business."},
                    {"step": "03", "name": "Ottimizzazione", "desc": "Implementazione delle correzioni tecniche e ottimizzazione dei contenuti esistenti."},
                    {"step": "04", "name": "Link Building",  "desc": "Strategia di acquisizione link e monitoraggio costante del posizionamento."}
                ]
            },
            {
                "id": 10, "title": "Foto e Video", "slug": "foto-video", "cat": "Production",
                "description": "Produzioni fotografiche e video di alto livello per comunicare l'essenza del tuo brand.",
                "extended_description": "Dalla pre-produzione al montaggio finale, curiamo ogni dettaglio per creare contenuti visivi che emozionano e convertono.",
                "tags": ["Video Production", "Photography", "Editing", "Art Direction"],
                "benefits": ["Contenuti pronti per tutti i canali (web, social, broadcast).", "Art Direction professionale inclusa.", "Post-produzione avanzata con color grading.", "Consegna dei file in tutti i formati necessari."],
                "process": [
                    {"step": "01", "name": "Pre-produzione", "desc": "Definizione del concept, storyboard e pianificazione delle riprese."},
                    {"step": "02", "name": "Produzione",     "desc": "Shooting fotografico e/o riprese video con attrezzatura professionale."},
                    {"step": "03", "name": "Post-produzione","desc": "Editing, color grading, motion graphics e sound design."},
                    {"step": "04", "name": "Delivery",       "desc": "Consegna dei file ottimizzati per ogni canale di utilizzo."}
                ]
            },
            {
                "id": 11, "title": "Motion Design", "slug": "motion-design", "cat": "Animation",
                "description": "Diamo vita alle tue idee con grafiche in movimento che catturano l'attenzione.",
                "extended_description": "Animazioni 2D e 3D, explainer video, motion graphics per reel e pubblicità: il movimento è il nostro linguaggio.",
                "tags": ["2D Animation", "3D Motion", "Micro-interactions", "Explainer Videos"],
                "benefits": ["Contenuti animati con altissimo engagement.", "Spiegazione di concetti complessi in modo semplice.", "Stile unico e riconoscibile.", "Compatibile con tutte le piattaforme."],
                "process": [
                    {"step": "01", "name": "Concept",    "desc": "Definizione dello stile visivo e dello script narrativo."},
                    {"step": "02", "name": "Storyboard", "desc": "Pianificazione visiva di ogni scena e transizione."},
                    {"step": "03", "name": "Animation",  "desc": "Produzione delle animazioni frame by frame con attenzione ai dettagli."},
                    {"step": "04", "name": "Export",     "desc": "Rendering finale e ottimizzazione per web, social e broadcast."}
                ]
            },
            {
                "id": 12, "title": "3D Rendering", "slug": "3d-rendering", "cat": "Future",
                "description": "Creiamo mondi tridimensionali e visioni fotorealistiche per prodotti e architetture.",
                "extended_description": "Visualizzazioni 3D fotorealistiche per prodotti, architettura e concept design. Il futuro si mostra prima ancora di essere costruito.",
                "tags": ["Product Visualization", "Architectural Viz", "3D Modeling", "Virtual Environments"],
                "benefits": ["Visualizzare il prodotto prima della produzione fisica.", "Qualità fotorealistica per presentazioni e pitch.", "Ambienti virtuali per tour immersivi.", "Iterazioni rapide senza costi di produzione."],
                "process": [
                    {"step": "01", "name": "Blocking",   "desc": "Impostazione della scena, della luce e della composizione generale."},
                    {"step": "02", "name": "Modeling",   "desc": "Modellazione 3D degli oggetti e dell'ambiente con massima cura per i dettagli."},
                    {"step": "03", "name": "Texturing",  "desc": "Applicazione di materiali fotorealistici, texture e mapping UV."},
                    {"step": "04", "name": "Rendering",  "desc": "Calcolo finale dell'immagine con motore di rendering professionale (Cycles / Arnold)."}
                ]
            }
        ]
    },

    # ─────────────────────────────────────────────────────────────────────────
    # CONTACT
    # ─────────────────────────────────────────────────────────────────────────
    "contact": {
        "hero": {
            "eyebrow":  "Contatti",
            "line1":    "LET'S",
            "line2":    "TALK",
            "subtitle": "Hai un progetto visionario? O vuoi semplicemente dire ciao? Siamo pronti ad ascoltare."
        },
        "socials": [
            {"name": "Instagram", "abbr": "IG", "url": "#"},
            {"name": "LinkedIn",  "abbr": "LI", "url": "#"},
            {"name": "Facebook",  "abbr": "FB", "url": "#"}
        ],
        "form": {
            "title":           "Raccontaci il tuo progetto.",
            "budget_options":  ["< €5.000", "€5.000 — €15.000", "€15.000 — €30.000", "> €30.000"],
            "submit_label":    "Invia Messaggio →",
            "submit_note":     "Rispondiamo entro 24 ore lavorative"
        },
        "info": {
            "email":   "info@blendstudio.it",
            "phone":   "+39 352 039 0732",
            "address": "Strada Val Nure 16/I",
            "city":    "29122 Piacenza, Italia",
            "hours": {
                "weekdays": {"label": "Lun — Ven", "value": "09:00 — 18:00"},
                "weekend":  {"label": "Sab — Dom", "value": "Chiuso"}
            }
        },
        "map": {
            "title":    "Base Operativa",
            "subtitle": "Dove le idee prendono forma. Vieni a trovarci per un caffè e due chiacchiere sul futuro.",
            "label":    "Piacenza, IT",
            "embed_url": (
                "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2819.78907623281!"
                "2d9.684598676588122!3d45.02920706235652!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!"
                "4f13.1!3m3!1m2!1s0x4780c330d18c59c7%3A0x1980fc7c642a1922!2sBlend%20Studio"
                "%20%7C%20Mixed%20Creativity!5e0!3m2!1sit!2sit!4v1769083613436!5m2!1sit!2sit"
            )
        }
    },

    # ─────────────────────────────────────────────────────────────────────────
    # CAREERS
    # ─────────────────────────────────────────────────────────────────────────
    "careers": {
        "hero": {
            "eyebrow":   "Careers",
            "line1":     "JOIN THE",
            "line2":     "TEAM",
            "subtitle":  "Sempre alla ricerca di talenti tecnici e creativi che vogliano sfidare lo status quo digitale.",
            "heroImage": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop"
        },
        "perks": [
            "Lavoro Remoto", "MacBook Pro M3", "Formazione Continua",
            "Caffè Illimitato", "Team Retreats", "Bonus Performance", "Assicurazione Sanitaria"
        ],
        "open_roles": {
            "title":    "Open Roles",
            "subtitle": "Nessun ego, solo grandi idee. Siamo un team distribuito unito dalla stessa passione per l'eccellenza.",
            "positions": [
                {
                    "role": "Frontend Developer (React)",
                    "type": "Full Time",
                    "loc":  "Remote / Hybrid",
                    "desc": "Cerchiamo un esperto React con occhio per il design e passione per le animazioni (Framer Motion, GSAP)."
                },
                {
                    "role": "UI/UX Designer",
                    "type": "Full Time",
                    "loc":  "On Site",
                    "desc": "Sei ossessionato dalla tipografia e dallo spazio bianco? Stiamo cercando te per definire il visual language dei nostri progetti."
                },
                {
                    "role": "Backend Developer (PHP/Node)",
                    "type": "Freelance",
                    "loc":  "Remote",
                    "desc": "Sviluppo di API robuste, integrazioni complesse e architetture scalabili. Laravel e Node.js sono il tuo pane quotidiano."
                }
            ]
        }
    }
}

# ─── Seed ────────────────────────────────────────────────────────────────────

def seed():
    inserted = 0
    skipped  = 0
    updated  = 0

    for slug, data in PAGES.items():
        existing = col.find_one({"slug": slug})
        doc = {
            "slug":       slug,
            "data_json":  json.dumps(data, ensure_ascii=False),
            "updated_at": datetime.now(timezone.utc)
        }

        if existing is None:
            col.insert_one(doc)
            inserted += 1
            print(f"  ✅  {slug}  (inserito)")
        elif FORCE:
            col.replace_one({"slug": slug}, doc)
            updated += 1
            print(f"  ♻️   {slug}  (aggiornato --force)")
        else:
            skipped += 1
            print(f"  ⏭️   {slug}  (già presente — usa --force per sovrascrivere)")

    print(f"\nRisultato: {inserted} inseriti, {updated} aggiornati, {skipped} saltati.")

if __name__ == "__main__":
    print(f"\n🌱 Seed contenuti MongoDB → {DB_NAME}/adminpanel\n")
    seed()
    print("✅ Done.\n")
