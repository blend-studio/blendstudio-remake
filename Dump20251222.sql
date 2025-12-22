-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: blendstudio_db
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (1,'Mario Rossi','mario@test.com','3331234567','Ciao, vorrei un preventivo per un sito web stile Nooo Agency.',0,'2025-12-22 08:13:05');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `client` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `services` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `cover_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gallery_images` json DEFAULT NULL,
  `layout_type` enum('default','grid','full-width') COLLATE utf8mb4_unicode_ci DEFAULT 'default',
  `accent_color` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT '#2f657f',
  `is_published` tinyint(1) DEFAULT '1',
  `project_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (1,'Minimalist Rebrand','minimalist-rebrand','Architettura Srl','Branding, Web Design','Un approccio radicale al design minimalista ispirato al modernismo.','https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80','[\"https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80\", \"https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=800&q=80\"]','default','#2f657f',1,'2024-01-15','2025-12-22 08:13:05'),(2,'Aran Cucine','aran-cucine','Aran Cucine','Advertising, Web Design, Graphic & Illustration, Video Production','Aran Cucine was involved in the 432 Park Avenue project, a landmark residential high rise in New York City that stands as one of the tallest buildings in the Western Hemisphere. The tower was designed by Rafael Viñoly and contains 106 residences featuring views of Central Park and the city. The project details include: Kitchen Design (custom-made by Aran Cucine designed in collaboration with show architect Rafael Viñoly and March & White), Cabinetry and Finishes (custom cabinetry in natural oak and white lacquer, paired with marble backsplashes), and Additional Provisions (cabinetry for laundry rooms and custom vanities).','https://blendstudio.it/wp-content/uploads/2025/11/Aran-Cucine-per-Blend-Studio-Piacenza.jpg',NULL,'default','#2f657f',1,'2025-12-22','2025-12-22 12:01:42'),(3,'Nino Gandolfo','nino-gandolfo','Nino Gandolfo','Graphic Design, Packaging',NULL,'https://blendstudio.it/wp-content/uploads/2024/08/NinoGandolfo_001_LR-1.jpg',NULL,'default','#2f657f',1,'2025-12-22','2025-12-22 12:01:42'),(4,'Cucine da Incubo','cucine-da-incubo','Cucine da Incubo','Graphic & Illustration',NULL,'https://blendstudio.it/wp-content/uploads/2024/01/cucine-da-incubo-cover.jpg',NULL,'default','#2f657f',1,'2025-12-22','2025-12-22 12:01:42'),(5,'Terra Smeralda','terra-smeralda','Distilleria Lucrezio R.','Advertising, Graphic & Illustration, Packaging, Art Direction','Terra Smeralda rappresenta la linea Premium della Distilleria Lucrezio R. di Berchidda e nasce dall\'amore della famiglia per le antiche tradizioni enogastronomiche della Sardegna. La caratteristica fondamentale dell\'azienda è l\'impiego esclusivo di materie prime autoctone e frutti spontanei incontaminati che racchiudono gli impareggiabili sapori e i caratteristici profumi della Sardegna. Il progetto ha previsto la progettazione grafica e l\'immagine della nuova linea premium di spirits, formata da un mirto barricato, un gin e un amaro non filtrato. Le grafiche stampate direttamente sul vetro della bottiglia, richiamano le antiche decorazioni presenti sulle ceramiche nuragiche.','https://blendstudio.it/wp-content/uploads/2024/01/TerraSmeralda_MirtoBarrique_dett-etik-1.jpg',NULL,'default','#2f657f',1,'2025-12-22','2025-12-22 12:01:42'),(6,'Terra dei Canti','terra-dei-canti','Distilleria Lucrezio R.','Graphic & Illustration, Packaging, Art Direction','Terra dei Canti rappresenta la linea Mixology della Distilleria Lucrezio R. di Berchidda e nasce dall\'amore della famiglia per le antiche tradizioni enogastronomiche della Sardegna. Abbiamo realizzato la progettazione grafica e l\'immagine della nuova linea mixology di spirits Terra dei Canti. Ogni etichetta è ispirata a una specifica mitologia sarda. Dal Muto di Gallura, al leggendario Torco, fino ad arrivare alla strega Sa Mama e alla regina Giolzia. Le etichette sono state studiate come un\'unica illustrazione che si compone mettendo le bottiglie in fila una dopo l\'altra seguendo i numeri indicati sul fronte.','https://blendstudio.it/wp-content/uploads/2024/01/LucrezioR_Reportage_037_LR.jpg',NULL,'default','#2f657f',1,'2025-12-22','2025-12-22 12:01:42'),(7,'Catalunya Experience','catalunya-experience','Catalunya Experience','Advertising, Web Design, Graphic & Illustration',NULL,'https://blendstudio.it/wp-content/uploads/2023/08/La-Barceloneta-@ionut_tarin.jpg',NULL,'default','#2f657f',1,'2025-12-22','2025-12-22 12:01:42'),(8,'Arduini Legnami S.p.A.','arduini-legnami','Arduini Legnami S.p.A.','Web Design, Formazione',NULL,'https://blendstudio.it/wp-content/uploads/2023/08/arduini-legnami-since-1957.jpeg',NULL,'default','#2f657f',1,'2025-12-22','2025-12-22 12:01:42'),(9,'Alpestre','alpestre','OnestiGroup S.p.A.','Web Design, Graphic & Illustration, Video Production, Packaging','Esclusiva di OnestiGroup S.p.A., Alpestre è una linea di cinque prodotti premium, espressione di qualità per una mixology contemporanea, ma con un richiamo alla tradizione. Dall\'analisi e la ricerca delle oltre 30 botaniche che conferiscono al famoso amaro unicità e scienza, prende vita la nuova linea Alpestre: cinque prodotti che vogliono rappresentare il fresco e coraggioso spirito alpino. Abbiamo realizzato il nuovo sito ufficiale alpestre.com e progettato tutte le etichette della linea mixology.','https://blendstudio.it/wp-content/uploads/2023/08/alpestre-slide4.jpg',NULL,'default','#2f657f',1,'2025-12-22','2025-12-22 12:01:42'),(10,'Emilia Wine Experience','emilia-wine-experience','Emilia Wine Experience','Web Design, Graphic & Illustration',NULL,'https://blendstudio.it/wp-content/uploads/2023/08/logo-emilia-wine.jpg',NULL,'default','#2f657f',1,'2025-12-22','2025-12-22 12:01:42'),(11,'ILIF-FOOD','ilif-food','IDRC / Addis Ababa University','Web Design, Graphic & Illustration','Project acronym: ILIF-FOOD. Project name: Impact of Land Degradation and Integrated Forest Management on Food Security in Ethiopia. Project ID: 111161. Budget: $1,289,848. Donor: International Development Research Centre (IDRC). Abstract: Ethiopia\'s highlands, essential for food production, are severely affected by land degradation, including soil erosion and nutrient depletion, threatening the food security of millions. This project evaluates the combined impact of land degradation and the implementation of Integrated Forest Management (IFM) on food security outcomes. The research aims to quantify the benefits of IFM in restoring ecosystem services and improving agricultural yields.','https://blendstudio.it/wp-content/uploads/2021/11/ilif-food.jpeg',NULL,'default','#2f657f',1,'2025-12-22','2025-12-22 12:01:42'),(12,'Tenuta La Ratta','tenuta-la-ratta','Tenuta La Ratta','Web Design',NULL,'https://blendstudio.it/wp-content/uploads/2024/02/Tenuta-La-Ratta-Vernasca-Piacenza.jpg',NULL,'default','#2f657f',1,'2025-12-22','2025-12-22 12:01:42'),(13,'OnestiGroup','onestigroup','OnestiGroup S.p.A.','Graphic & Illustration','Al centro della nuova identità visuale di OnestiGroup s.p.a., abbiamo progettato un marchio che rappresenta sia le iniziali del nome \"O\" e \"G\", sia un circuito di strade che conduce alle differenti vie di distribuzione del beverage. Il simbolo inoltre, nella sua forma circolare e concentrica, richiama quelle simbologie antiche e allo stesso tempo tecnologiche che vanno a identificare la filosofia aziendale rivolta a tradizione e innovazione.','https://blendstudio.it/wp-content/uploads/2021/11/cover-onestigroup-01-scaled.jpg',NULL,'default','#2f657f',1,'2025-12-22','2025-12-22 12:01:42'),(14,'Leyel Skin Care','leyel','Leyel Skin Care','Advertising, Graphic & Illustration, Packaging, Web Development','Leyel is an Italian brand specializing in face and body skin care products that are nickel-tested, natural, and produced in Italy. The line is designed for daily use, specifically targeting individuals who suffer from nickel allergies. The project involved Branding, Marketing Strategy, Social Media Management, Digital Advertising, and the design of a dedicated Landing Page optimized to convert users with nickel allergies into active customers.','https://blendstudio.it/wp-content/uploads/2021/11/Shooting-Prodotti0657.jpg',NULL,'default','#2f657f',1,'2025-12-22','2025-12-22 12:01:42'),(15,'Lipdent','lipdent','MT&C','Advertising, Social Media Marketing','Lipdent è il primo dentifricio volumizzante labbra in italia. Prodotto con un\'elevata percentuale di principi attivi non solo pulisce a fondo i denti ma grazie a degli ingredienti specifici rende le labbra più voluminose. Lanciato sul mercato nel giugno 2023 si è scelto di associare una strategia di media marketing alla pubblicità televisiva. Il nostro compito in questo progetto è stato quello di studiare una strategia di social media marketing e digital advertising per rendere il prodotto presente anche sui social, visibile sui motori di ricerca e facilmente acquistabile da parte degli utenti.','https://blendstudio.it/wp-content/uploads/2021/11/lipdent-labbra.webp',NULL,'default','#2f657f',1,'2025-12-22','2025-12-22 12:01:42'),(16,'Centro Medico Rocca','centro-medico-rocca','Centro Medico Rocca','Advertising, Web Design, Graphic & Illustration',NULL,'https://blendstudio.it/wp-content/uploads/2021/11/bg-carta-servizi-centro-medico-rocca-scaled.jpg',NULL,'default','#2f657f',1,'2025-12-22','2025-12-22 12:01:42');
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin@blendstudio.it','$2y$10$wS1.W0.k.l/H0.k.l/H0.k.l/H0.k.l/H0.k.l/H0.k.l/H0.k.l','2025-12-22 08:13:05');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-22 13:16:09
