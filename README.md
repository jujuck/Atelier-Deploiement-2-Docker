# Atelier Déploiement Nginx avec Node JS

## 1. Objectifs

Apprendre à automitiser le déployment d'une application sous Docker

- Docker
- Docker Compose
- Bash
- github Action

## 2. Pré requis

- Un serveur configuré avec Nginx et le certificat SSL
- Connaissance docker
- Connaitre git, React et GraphQL et Apollo

Avant de commencer, tu vas devoir te connecter à ton VSP.
Puis, consulte ton fichier de configuration de `Nginx`

```bash
cat /etc/nginx/sites-available/default
```

Prends note :

- le port de ton client
- le port de ton api
- l'uri pour joindre ton api

Dans la suite de l'atelier, tu as le choix entre 2 possibilités :

- Adapter ta configuration `Nginx` à ton code
- Adapter ton code à la configuration (plus simple)

## 3. Explication et context

Dans cet atelier, tu vas apprendre à déployer une application et à automatiser le processus (Continous deploiement). Pour réaliser cela de manière la plus sûr possible, tu vas utiliser tes connaissances nouvellement apprises pour isoler tes couches de code via docker. Puis, tu vas booster ton serveur pour que celui-ci puisse réaliser le build des containers plus facilement (C'est l'étape Docker qui coûte le plus cher en ressource). Pour terminer, nous allons écrire un script bash de déploiment, celui ci sera executé via une action Github..
So let' go!!!

## 4. Configuration Docker

:warning: Avant de travailler sur le déploiement, vérifie que ton code fonctionne correctement puis commites ton travail. Ensuite créés une branche spécifique pour ton déploiement. Cela permettra de ne pas casser ton code.

### 4.1 DockerFile dans la couche serveur (backend)

Dans ton éditeur de code préféré, tu vas ajouter un fichier `Dockerfile` à la racine de ton serveur. Configure celui-ci pour un deploiement (Le serveur doit passer en mode `builder`, à savoir complier ton code `typescript`en `javascript`).

#### A- Configuration Projet

- Dans ton `package.json`, ajoutes 2 commandes de script, `"build": "npx tsx"` et `"prod": "node ./build/index.js"`
- Dans ton `tsconfig.json`, active les clés `"rootDir": "/src"` et `"outDir": "/build"`
- Testes ta configuration, dans ton terminal

```bash
npm run build
```

Un dossier `build` devrait être créer sans erreur. En cas d'erreur, je te laisse regarder et corriger ton code (Enc as de Big Problème, n'hésites pas à demander de l'aide)

#### B- Dockerfile

Dans ton fichier `Dockerfile`, ajoutes les clés suivantes

- `FROM node:lts-alpine as PROD` : prépare l'OS de déploiement dans ton container
- `WORKDIR /app` : créer un dossier de stockage pour ton app
- `COPY *.json ./` : copie l'ensemble des fichiers de configuration au format json
- `RUN npm install` : installe les `node_modules` dans ton container
- `COPY src src` : copie le dossier src dans ton container dans un dossier du même nom

:warning: si ton projet nécessite d'autres dossiers spécifiques pour les logs, les assets, les ressources publiques... hors `build`, il faut également les copier à ce moment là

- `RUN npm run build` : compile le code de `typescript` vers `javascript`
- `EXPOSE ${le port spécifique à ta configuration}`: expose le port de ton api
- `CMD ["npm", "run", "prod"]`: exécute le code de l'api 'run time'

Tu peux maintenant tester la configuration de manière isolée en lançant les commandes depuis ton dossier `api`

```bash
docker build -t api .
docker run -p <le_port_de_ta_configuration>:<le_port_de_ta_configuration> api
```

Si tout est ok, tu dois pouvoir accéder à ton `api` dans ton navigateur.

### 4.2 DockerFile dans la couche client (frontend)

### 4.3 Docker Compose pour orchester

## 5. Configuration du serveur de déploiement

### 5.1 Boost du serveur avec ajout de mémoire swap

### 5.2 Mise à jour du projet ou clone

- ajout des .env si besoin

### 5.3 Test du docker compose à la main

### 5.4 Ecriture du script bash

- mise à jour en pull
- stop running container
- prune container (free spaces)
- launch docker compose avec build

## 6 Github actions
