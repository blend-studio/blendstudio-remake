db = db.getSiblingDB('blendstudio');

db.adminpanel.insertMany([
    {
        slug: 'home',
        data: {
            hero: {
                title: "Architecture of Digital Distinction",
                subtitle: "CRAFTING SUPERIOR DIGITAL EXPERIENCES THROUGH PRECISION ENGINEERING & CREATIVE MASTERY."
            },
            philosophy: {
                title: "The Blend Mastery",
                text: "Non seguiamo le regole, le riscriviamo. Ogni riga di codice è un atto di design."
            }
        },
        updated_at: new Date()
    },
    {
        slug: 'about',
        data: {
            manifesto: {
                title: "Our DNA",
                text: "Blend Studio nasce dall'ossessione per il dettaglio. Siamo il ponte tra il possibile e l'eccezionale."
            }
        },
        updated_at: new Date()
    }
]);

print("MongoDB Seed Data Inserted");
