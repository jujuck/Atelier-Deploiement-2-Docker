# Atelier Déploiement Nginx avec Node JS

## 1. Objectifs

Apprendre à automitiser le déployment d'une application sous Docker

- Docker
- Docker Compose
- Bash
- Github Action

## 2. Pré requis

- Un serveur configuré avec Nginx et le certificat SSL
- Connaissance docker
- Connaitre git, React et GraphQL et Apollo

Avant de commencer, tu vas devoir te connecter à ton VSP.
Puis, consultes ton fichier de configuration de `Nginx`

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

{: .alert-info }
Dans cet atelier, tu vas apprendre à déployer une application et à automatiser le processus (**Continous Deploiement**). Pour réaliser cela de manière la plus sûr possible, tu vas utiliser tes connaissances nouvellement apprises pour isoler tes couches de code via **Docker**. Puis, tu vas booster ton serveur pour que celui-ci puisse réaliser le `build` des containers plus facilement (C'est l'étape **Docker** qui coûte le plus cher en ressource). Pour terminer, nous allons écrire un script `bash` de déploiment, celui ci sera executé via une **action Github**.

💪 💪 💪So let' go!!!

## 4. Configuration Docker

{: .alert-warning }
Avant de travailler sur le déploiement, vérifie que ton code fonctionne correctement puis commites ton travail. Ensuite créés une branche spécifique pour ton déploiement. Cela permettra de ne pas casser ton code.

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

{: .alert-warning }
Si ton projet nécessite d'autres dossiers spécifiques pour les logs, les assets, les ressources publiques... hors `build`, il faut également les copier à ce moment là

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

#### A- Configuration vite

Pour commencer, tu vas devoir modifier la configuration de vite. Par défaut, vite écoute et réponds uniquement à notre réseau `localhost`. Dans notre `vite.config.ts`, tu vas ajouter une clé "preview".
De plus, pour des raisons de sécurité, `vite` bloque par défaut les requêtes venant de domaines non listés spécifiquement

```typescript
export default defineConfig({
  plugins: [react()],
  preview: {
    host: "0.0.0.0",
    allowedHosts: ["ton nom de domaine, sous domaine sans http://"],
  },
});
```

{: .alert-info }
Si tu veux développer ton code sous docker, il faudra également modifier ce fichier avec la clé "server".
De plus, selon ton choix, il est peut être utile de déclarer un port spécifique pour ton App en preview (cf doc vite)

#### B- Dockerfile du client

Dans la même logique que le `Dockerfile` de ton API, tu vas ajouter :

- `FROM node:lts-alpine as RUNNER` : prépare l'OS de déploiement dans ton container
- `WORKDIR /app` : créer un dossier de stockage pour ton app
- `COPY *.json ./` : copie l'ensemble des fichiers de configuration au format json
- `RUN npm install` : installe les `node_modules` dans ton container
- `COPY . .` : copie tous dans le dossier du container
- `RUN npm run build` : compile le code de `typescript` vers `javascript`
- `EXPOSE ${le port spécifique à ta configuration}`: expose le port de ton api
- `CMD ["npm", "run", "preview"]`: exécute le code de l'api 'run time'

Attention, ton `Dockerfile` demande une copie intégrale de ton dossier, ceci est possible en production car les **node_modules** ne sont pas intégrés à ton **Repository GitHub**. Sinon, tu aurais du ajouter un fichier `.dockerignore`.

Pour finir, testes ton fichier `Dockerfile` en buildant ton client pour en l'éxécutant

```bash
docker build -t client .
docker run -p <le_port_de_ta_configuration>:<le_port_de_ta_configuration> client
```

### 4.3 Docker Compose pour orchester

Pour débuter cette partie, regardes si ton application FullStack fonctionne corrrectement en lançant les 2 containers séparement.
Il y a peut être des problèmes dans d'url de requêtes à corriger, des erreurs CORS...

Une fois que tu as noté et/ou résolu les erreurs, tu vas pouvoir passer à l'**Orchestration**

A la racine de ton projet, crées un fichier `docker-compose.yml`.
A l'intérieur et copie-colles le code suivant :

```yml
services:  // C'est la propriété de début
  api: // tag de ton image
    build: ./api // Source pour trouver le Dockerfile
    ports:
      - 3000:3000 // Binding de port entre la machine et le container
    command: npm run prod // Commande d'éxécution
    restart: always
    environment: // Déclaration des variables d'env si non sensible
      - CLIENT_URL=http://localhost:4173
      - PORT=3000

  client: // tag de ton image
    build: ./client // Source pour le Dockerfile
    command: npm run preview // Commande d'éxécution
    restart: always
     env_file: // Si besoin de variables issus d'un fichier d'env sur la machine
      - ./client/.env
    ports:
      - 4173:4173 // Binding de port entre la machine et le container

```

Une fois cela fait, enregistres et testes en lançant la commandes

```bash
docker compose up --build
```

Si tout se passe bien, pense à commiter ton code et à le mettre à jour en ligne sur cette branche

## 5. Configuration du serveur de déploiement

### 5.1 Boost du serveur avec ajout de mémoire swap

Sur ton VPS, les ressources sont limitées. Tu peux avoir un apreçu de celle-ci lors de ta connexion.

{: .alert-info }
On voit dans l'illustration ci dessous, que j'utilise 40% de ma RAM mais peut de mes ressources en stockage (Hard Disk).
Dans ce cas, je peux basculer une partie de mon espace de stockage en mémoire vive. C'est un systeme de swap (mémoire tampon au format fichier). On peut voir cela comme une extension de la mémoire.

![](./vps_ressources_example.png" alt="Illustration des ressources d'un VPS)

Comment procéder ? Exécute les commandes ci dessous les unes après les autres

```bash
free -h # Affiche l'état de la mémoire du système (-h pour human-readable)
sudo fallocate -l 4G /swapfile # Créer un fichier vide de 4Giga
sudo chmod 600 /swapfile #Change les permissions du fichier pour qu’il ne soit accessible que par root.
sudo mkswap /swapfile # Formate le fichier pour qu’il devienne utilisable comme swap.
sudo swapon /swapfile #Active le fichier de swap.
sudo swapon --show # Affiche les espaces de swap actifs.
free -h # Affiche l'état de la mémoire du système (-h pour human-readable)
```

Super, ton VPS est maintenant booster en Mémoire. Cela sera particulièrement utile pour les `build` **Docker** qui en nécessite beaucoup.

{: .alert-warning }
Attention, cette méthode n'est pas magique non plus. Il est recommandé de respecter une certaine proportion entre la mémoire physique (RAM) et notre swap

### 5.2 Mise à jour du projet ou clone

Maintenant,

- Vérifie que ton app tourne toujours sur ton navigateur (En cas de problème, la priorité est de relancer ton app avant de passer à la suite)
- Déplace toi dans le dossier de ton projet Github (`cd app/repo/...`)
- Met le à jour suivant la branche précédente (`git fetch --all && git switch <nom-de-la-branche>`)
- Renseigne tes variables d'environnement si besoin ???
- Execute ton code avec `pm2`.

A ce stade si tout est ok, tu devrais toujours accéder à ton app dans ton navigateur

- Stop les process tournant avec `pm2` (cf Doc https://pm2.keymetrics.io/docs/usage/process-management/)

### 5.3 Installation de Docker et lancement du docker compose

Pour installer Docker sur ton VPS, le mieux et le plus simple est de suivre la documentation officielle
👀👀👀 [doc](https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository)

Si tout est bien configuré, tu as du accéder au container Hello World de `Docker`

Cool, pour éviter d'avoir a passer en mode `sudo` à cahque fois, nous pouvons configurer notre serveur
La documentation officielle de `Docker`nous explique comment faire 👀👀👀[doc](https://docs.docker.com/engine/install/linux-postinstall/#manage-docker-as-a-non-root-user)

Une fois cela fait, tu peux te déplacer dans ton dossier de projet et lancer :

```bash
docker compose up --build
```

Les containers devraient s'éxécuter et si le `mapping` de tous tes `$port` sont bons, ton application devrait de nouveau être accessible en ligne.
Si ce n'est pas le cas, vérifie :

{: .alert-warning }

- ta configuration nginx (`cat /etc/nginx/sites-available/default`)
- ton docker-compose (la propriété `ports`, le nom des variables d'environnement et leurs ports respectifs)
- ton fichier `index.ts` de ton api
- ton fichier `client.ts` de ton client

N'hésites pas à `push/pull` pour mettre à jour le code serveur. Pense à couper les containeurs et les `rebuilder` à chaque fois

### 5.5 Ecriture du script bash

Maintenant que tu as réussi à déployer ton application avec `Docker` à la main, essaie de noter toutes les étapes automatisables.
Ton objectif est de la reproduire dans un script `bash` qui sera exécuté.

Commence par créer et éditer un fichier `deploy.sh` (Place le dans le repo)

```bash
cd <path_vers_ton_dossier_de_projet /> # O se déplace a la racine du dossier de projet
git switch test@deploy_with_docker # On force la bascule sur notre branche de référence (main en cas de merge)
git pull # On met à jour la branche


docker stop $(docker ps -a -q) # On arrête tous les containers en cours

docker compose up --build -d # On relance l'orchestration des containers. Cette commande peut être ajustée si certains paramètres supplémentaires sont nécessaires (fichier d'env, nom du fichier, ...)

docker system prune -a -f # On supprime tous les résidus d'images non utilisé (Cela libère les ressources)
```

Pour vérifier que ton script fonctionne, éxécute les commandes ci dessous :

```bash
docker compose stop

cd <Chemin vers ton repo />
bash deploy.sh
```

Normalement, tu ne devrais pas avoir d'erreur dans ton terminal et ton application devrait toujours être disponible dans ton navigateur.

## 6 Github actions

Dernière et Ultime étape de notre projet de **Continious Deploiement**
Exécuter notre script de manière automatique lors d'un évenement GitHub (merge sur une branche, push sur une branche, ...)
