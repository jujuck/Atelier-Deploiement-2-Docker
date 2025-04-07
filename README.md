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

## 3. Explication et context

Dans cet atelier, tu vas apprendre à déployer une application et à automatiser le processus (Continous deploiement). Pour réaliser cela de manière la plus sûr possible, tu vas utiliser tes connaissances nouvellement apprises pour isoler tes couches de code via docker. Puis, tu vas booster ton serveur pour que celui-ci puisse réaliser le build des containers plus facilement (C'est l'étape Docker qui coûte le plus cher en ressource). Pour terminer, nous allons écrire un script bash de déploiment, celui ci sera executé via une action Github..
So let' go!!!

## 4. Configuration Docker

- start regarde tes ports mis dans ton ficheir de config nginx sur ton serveur
  1/ change les ports pour les adapter à ta configuration de ton prochain projet
  2/ Note les et adapte ton projet

### 4.1 DockerFile dans la couche serveur (backend)

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
