# Déploiement

Le déploiement se fait à travers une étape (_stage_) manuelle de la _CI_ qui est déclenché lorsqu'un **tag** contenant le mot clé **deploy** est rajouté sur git. Chaque tag est unique, mais vous pouvez utiliser des versions pour vos déploiements. Par exemple : **deploy_v1.0**, **deploy_v1.1**, etc.

Une fois que le tag est détecté par GitLab, un pipeline sera créé et vous verrez des options (_jobs_) pour le déploiement du client et du serveur. Ces _jobs_ doit être cependant lancés manuellement. Pour le faire, naviguez sur le menu de pipelines disponible dans `CI/CD > Pipelines`. Le pipeline aura le statut `blocked`. Cliquez dessus et lancez la _job_ que vous souhaitez.

**Attention : le pipeline de déploiement ne fait que déployer le site web et/ou server. Il n'effectue pas toutes les validations de l'intégration continue. Vous devez vous assurer que votre projet est fonctionnel et de qualité acceptable avant de le déployer.**

[- Note importante : On vous conseille de tester le déploiement le plus tôt possible. Comme cela, si des complications surviennent, les chargés pourront vous aider à les résoudre le plus tôt possible. La veille de la remise du sprint n'est généralement pas un moment propice au débogage. -]

# Plan et répartitions des tâches pour sur les sprints

-   La section [Déploiement du client](#déploiement-du-client) contient toutes les informations en rapport avec le déploiement du client. Ce déploiement doit être fonctionnel au SPRINT 1.

-   La section [Déploiement manuel du serveur](#déploiement-manuel-du-serveur) contient toutes les informations en rapport avec le déploiement manuel du serveur. La procédure décrite à pour but de démystifier le déploiement d'un serveur distant. Cette procédure doit-être faite au complet au moins une fois par au moins un membre de l'équipe. Elle n'est pas corrigée, mais est obligatoire.

-   La section [Déploiement automatique du serveur](#déploiement-automatique-du-server) contient toutes les informations en rapport avec le déploiement automatique du serveur à l'aide du pipeline. Un prérequis de cette étape est d'avoir une instance en marche sur Amazon EC2. Ce déploiement doit être fonctionnel aux SPRINTS 2 et 3.

# Déploiement du client

Si la _job_ `pages` réussi, votre site web sera déployé sur GitLab Pages. Vous pouvez trouver l'URL du site dans le menu `Pages` disponible dans `Settings > Pages`.

Par défaut, votre page web sera servie par un serveur statique **HTTPS**, mais votre serveur dynamique sera un simple serveur **HTTP**. Pour des raisons de sécurité, les navigateurs ne permettent pas à ce qu'une page servie par **HTTPS** récupère une ressource d'une origine **HTTP**. Afin de permettre à votre site web de communiquer avec votre serveur, vous devez décocher l'option **Force HTTPS (requires valid certificates)** dans le menu `Pages`. Ceci permet donc d'accéder à votre site web par **HTTP** et établir un contact fonctionnel avec votre serveur dynamique. L'adresse de votre site restera la même.

Note pour les plus curieux : Les étapes pour le déploiement de la page statique se trouvent dans le fichier [.gitlab-ci.yml](.gitlab-ci.yml) sous la job _pages_. De façon très concise, cette _job_ minifie tout votre code et crée une page statique. Ensuite elle rend publique à partir de l'adresse GitLab pages associée les fichiers `html`, `css` et `js` générés.

# Déploiement manuel du serveur

Le déploiement manuel se fait sur une machine distante communément appelée serveur. Dans notre cas-ci, nous utiliserons le service _Elastic Cloud Compute (EC2)_ du fournisseur Cloud Amazon (AWS) pour obtenir une machine virtuelle. Après l'obtention de notre machine, nous allons copier les fichiers du projet et lancer le serveur en exposant les ports nécessaires.

## Accès à la console AWS

Avant de commencer, vous aurez besoin d'un compte AWS. Vous pouvez vous en créer un à partir de l'adresse suivante : [ca-central-1.console.aws.amazon.com](ca-central-1.console.aws.amazon.com). Tout au long du tutoriel, vous devriez rester à la region `ca-central-1` située à Montréal. Assurez-vous toujours bien de cela.

La page d'accueil de la console AWS devrait avoir l'air de ceci :

![Console AWS](static/console_aws.png)

## Création et démarrage d'une machine virtuelle.

Ouvrir le menu déroulant `Services` et choisir le service de calcul `EC2`.

Aller ensuite sur l'onglet `Instances` et cliquer sur le bouton `Lancer des instances`. Vous devez ensuite voir un assistant à 7 étapes qui nous guidera à configurer les paramètres de l'instances (Figure ci-dessous).

![Assistant de lancement d'instance](static/assistant_de_lancement_d_instance.png)

### Étape 1 : Sélection d'une Amazon Machine Image (AMI)

Vous devriez choisir l'AMI nommée `LOG2990 - A21 - Amazon Linux 2` située dans l'onglet `AMI de la communauté`.

![Choix de l'AMI](static/choix_ami.png)

**Pourquoi une AMI spéciale au lieu d'une AMI standard comme Ubuntu ou Amazon Linux 2 ?** L'AMI spéciale de ce cours est une AMI Amazon Linux 2, avec des programmes installés comme `Git`, `Node`, [`forever`](https://www.npmjs.com/package/forever). Tout est déjà configuré pour bien marcher avec la pipeline Gitlab CI. Vous n'aurez qu'à vous souciez de votre déploiement.

### Étape 2 : Choisir un type d'instance

On vous recommande de sélectionner l'instance de type `t2.micro` éligible à l'offre gratuite. Cependant rien ne vous empêche d'utiliser une machine plus puissante.

**Restrictions de l'offre gratuite** : Avec l'offre gratuite, vous avez droit à 750 h de calcul gratuit renouvelable chaque mois pour les 12 premiers mois. Évitez donc de lancer plusieurs instances simultanément et éteignez vos machines quand vous n'en avez plus besoin.

### Étape 3 : Configurer les détails de l'instance

Il nous faut changer l'option `Rôle IAM`.

![Détails de l'instance](static/details_instance.png)

Cliquer sur le button `Créer un nouveau rôle IAM` et vous verrez le service Amazon IAM s'ouvrir. Cliquer sur `Créer un rôle`.

![Amazon IAM](static/aws_iam.png)

Comme type d'entité de confiance, choisir `Service AWS`. Comme cas d'utilisation, choisir `EC2`. Cliquer sur le bouton `Suivant : Autorisations`.

![Entité de confiance et cas d'utilisation](static/entite_de_confiance_et_cas_utilisation.png)

Assurez-vous de bien choisir les stratégies `AmazonEC2FullAccess` et `CloudWatchFullAccess`. Cliquer ensuite sur `Suivant : Balises` et ensuite `Suivant : Vérification`.

![Stratégies d'autorisations](static/strategies_iam.png)

**Qu'est ce que CloudWatch ?** CloudWatch est un service AWS. Dans le cadre de notre projet, nous l'utiliserons pour acceder aux logs de la VM directement depuis la console AWS.

À la dernière étape de la création du rôle, donnez-y le nom que vous voulez (e.g. `AmazonEC2CloudWatchFullAccess`). Confirmer ensuite la création du rôle.

![Nom du rôle IAM](static/nom_du_role.png)

Retourner sur l'onglet avec l'assistant de lancement de d'instance et sélectionner le nouveau Rôle IAM créé. Si vous ne le voyez pas, cliquer sur l'icône pour rafraîchir.

![Détails de l'instance avec le rôle sélectionné](static/details_instance_avec_role_iam.png)

### Étape 4 : Ajouter le stockage

Garder 20 Gio de stockage.

### Étape 5 : Ajouter des balises

Vous n'avez à rien configurer dans cette étape.

### Étape 6 : Configurer le groupe de sécurité

Dans cette étape on configure les ports à exposer. Par défaut le port 22 est exposé car au minimum on aimerait se connecter à la machine en SSH.

Nôtre serveur est lancé sur le port `3000`. Il faut donc l'exposer comme le montre la figure ci-dessous :

![Groupe de sécurité](static/groupe_de_securite.png)

-   Type: Règle TCP personnalisée
-   Règle: TCP
-   Plage de ports: 3000
-   Source: N'importe où
-   Description: Port du serveur Scrabble

### Étape 7 : Examiner le lancement de l'instance

Cliquer sur le bouton `Lancer`. Une modale s'ouvrira et vous demandera de créer une paire de clé publique et privée.

![Création d'une paire de clés](static/paire_de_cles.png)

Assurez vous de créer une paire de clés (que vous pourrez nommer `ec2-key`) et de sauvegarder la clé privée dans un dossier où vous ne la perdrez pas (e.g. : `~/.ssh/`). Sélectionner cette clé nouvellement créée et ensuite lancer l'instance.

![Paire de clé sélectionnée](static/paire_de_cles_selectionnee.png)

## Accès à votre machine distance

Retourner sur le [Tableau de bord EC2](https://ca-central-1.console.aws.amazon.com/ec2/v2/home?region=ca-central-1#Instances:) en cliquant sur Services -> EC2. Aussitôt que l'état de votre machine passera à `En cours d'exécution`, cela signifiera ue votre machine est prête à être utilisée. 
Pour y avoir accès, nous allons utiliser une connection `SSH`.

1. Pour les utilisateurs linux, exécutez, si nécessaire, cette commande pour vous assurer que votre clé n’est pas visible publiquement par les autres utilisateurs.

```sh
chmod 400 chemin/vers/ec2-key.pem
```

2. Connectez votre instance à l’aide de son DNS public :

```sh
ssh -i chemin/vers/ec2-key.pem ec2-user@<dns-public-de-votre-machine>
```

Si par la suite vous désirer quitter la connexion `SSH` et revenir à votre terminal, vous pouvez taper la commande :

```sh
exit
```

![Connection à la VM avec un Client SSH](static/connexion_ssh.png)

Attention : L'adresse DNS publique sur la capture d'écran sera complètement différente de la votre. Ne la recopiez pas. Utilisez celle qui a été assignée à votre machine virtuelle disponible dans les détails de l'instance.

À cette étape-ci, vous avez accès à la machine et vous pouvez exécuter n'importe quelle commande `sh` que vous vouliez.

## Lancer votre serveur

1. Aller dans un dossier temporaire

```sh
cd /tmp
```

2. Copier les fichiers de votre projet

```sh
git clone <url-de-votre-projet> repo
cd repo/server
git checkout <branche, tag ou SHA du commit>
```

3. Installer les packets npm

```sh
npm ci
```

4. Lancer le serveur

```sh
npm start
```
Bravo 🎉, vous devrez être en mesure d'accéder à votre serveur depuis l'adresse : `<dns-public-de-votre-machine>:3000`. N'oubliez pas de mettre à jour le [fichier d'environnement de production](client/src/environments/environment.prod.ts). Lors d'un build en mode production (ex. celui du déploiement sur GitLab Pages), ce fichier remplacera [celui de développement](client/src/environments/environment.ts). Faisant en sorte qu'en mode production ou développement, le ressources correspondantes soient utilisées. Consulter [ce fichier](client/angular.json) à la ligne 52 pour plus de détails.

# Déploiement automatique du server

Pour faire marcher le pipeline, 4 [variables](https://docs.gitlab.com/ee/ci/variables/) devront être définies : `EC2_HOST`, `EC2_PEM_FILE_CONTENT`, `EC2_USER`, et `SERVER_PORT`. Toutes ces variables pourront être définies à partir de GitLab sur la page `Settings > CI/CD > Variables`. Toutes ces variables peuvent être masquées ou non (selon le niveau de confidentialité de l'information qu'elles détiennent) mais n'ont pas besoin d'être protégées.

#### EC2_HOST

Cette variable correspond à l'adresse de votre machine EC2 déployée. Vous y avez accès dans les détails de l'instance sous le nom de **Adresse DNS Publique**. Cette valeur doit avoir le schéma suivant : `ec2-<un nombre quelconque>.ca-central-1.compute.amazonaws.com`.

#### EC2_PEM_FILE_CONTENT

Cette variable correspond au fichier de permission `.pem` que vous aviez généré. Voici un exemple de fichier de permission :

```
-----BEGIN RSA PRIVATE KEY-----
MIIB9TCCAWACAQAwgbgxGTAXBgNVBAoMEFF1b1ZhZGlzIExpbWl0ZWQxHDAaBgNV
BAsME0RvY3VtZW50IERlcGFydG1lbnQxOTA3BgNVBAMMMFdoeSBhcmUgeW91IGRl
Y29kaW5nIG1lPyAgVGhpcyBpcyBvbmx5IGEgdGVzdCEhITERMA8GA1UEBwwISGFt
aWx0b24xETAPBgNVBAgMCFBlbWJyb2tlMQswCQYDVQQGEwJCTTEPMA0GCSqGSIb3
DQEJARYAMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCJ9WRanG/fUvcfKiGl
EL4aRLjGt537mZ28UU9/3eiJeJznNSOuNLnF+hmabAu7H0LT4K7EdqfF+XUZW/2j
RKRYcvOUDGF9A7OjW7UfKk1In3+6QDCi7X34RE161jqoaJjrm/T18TOKcgkkhRzE
apQnIDm0Ea/HVzX/PiSOGuertwIDAQABMAsGCSqGSIb3DQEBBQOBgQBzMJdAV4QP
Awel8LzGx5uMOshezF/KfP67wJ93UW+N7zXY6AwPgoLj4Kjw+WtU684JL8Dtr9FX
ozakE+8p06BpxegR4BR3FMHf6p+0jQxUEAkAyb/mVgm66TyghDGC6/YkiKoZptXQ
98TwDIK/39WEB/V607As+KoYazQG8drorw==
-----END RSA PRIVATE KEY-----
```

L'intégralité du fichier devra être copiée dans la variable `EC2_PEM_FILE_CONTENT`.
Note : Étant un fichier à haut caractère confidentiel, on vous recommande fortement de garder cette variable masquée.

#### EC2_USER

Cette variable représente l'utilisateur auquel se connecter sur le serveur distant, soit `ec2-user`. Cette valeur est déjà définie dans le fichier [.gitlab-ci.yml](.gitlab-ci.yml).

#### SERVER_PORT

Cette variable représente le port sur lequel votre serveur opère. Donnez-y la valeur `3000`.

\
Après avoir déployé le serveur à partir de la pipeline, vous pourrez voir les messages de log de ce premier directement dans le service [CloudWatch](https://ca-central-1.console.aws.amazon.com/cloudwatch/home?region=ca-central-1#logsV2:log-groups). Vous devriez aller dans `CloudWatch > Journaux > Groupes de journaux > /var/log/messages > <ID de l'instance>`.

![AWS CloudWatch](static/cloud-watch.png)
