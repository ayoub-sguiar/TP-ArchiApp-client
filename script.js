// Tableau initial des messages (conservé mais non utilisé)
let msgs = [
    { pseudo: "Alice", msg: "Hello World", date: new Date().toLocaleString() },
    { pseudo: "Bob", msg: "Blah Blah", date: new Date().toLocaleString() },
    { pseudo: "Charlie", msg: "I love cats", date: new Date().toLocaleString() }
];

const SERVER_URL = "https://tp-archiapp-serveur-messageboard.onrender.com";

// 🟢 Liste locale des messages (vide au départ)
let messages = [];

// 🟢 Fonction pour mettre à jour l'affichage des messages
function update(messages) {
    let messageList = document.getElementById("message-list");
    messageList.innerHTML = ""; // Efface les anciens messages

    messages.forEach((message) => {
        let li = document.createElement("li");
        li.innerHTML = `<strong>${message.pseudo || "Anonyme"}</strong>: ${message.msg} <em>(${message.date || "Date inconnue"})</em>`;
        messageList.appendChild(li);
    });
}

// 🟢 Fonction pour récupérer et stocker les messages depuis le serveur
function fetchMessages() {
    fetch(`${SERVER_URL}/msg/getAll`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Messages bruts reçus :", data);

            // 🛠 Reformater les messages en vérifiant s'ils sont bien formatés ou non
            messages = data.map((messageObj, index) => {
                if (typeof messageObj === "object" && messageObj !== null && "pseudo" in messageObj && "msg" in messageObj && "date" in messageObj) {
                    // 🔹 Le message est bien formaté (JSON correct)
                    return {
                        pseudo: messageObj.pseudo,
                        msg: messageObj.msg,
                        date: messageObj.date
                    };
                } else {
                    // 🔹 Le message est une simple chaîne de texte, on génère des valeurs par défaut
                    return {
                        pseudo: `Utilisateur ${index + 1}`,
                        msg: messageObj,  // Utilise la chaîne brute comme message
                        date: new Date().toLocaleString()  // Génère une nouvelle date
                    };
                }
            });

            console.log("Messages formatés :", messages);
            update(messages); // Met à jour l'affichage
        })
        .catch(error => console.error("Erreur lors de la récupération des messages :", error));
}


// 🟢 Fonction pour envoyer un message en JSON au serveur
function postMessage(event) {
    event.preventDefault(); // Empêche le rechargement de la page

    let pseudoInput = document.getElementById("pseudo").value.trim();
    let messageInput = document.getElementById("new-message").value.trim();

    if (pseudoInput === "" || messageInput === "") {
        console.error("Veuillez entrer un pseudo et un message !");
        return;
    }

    // 🟢 Créer un objet JSON avec pseudo, msg et date
    let messageData = {
        pseudo: pseudoInput,
        msg: messageInput,
        date: new Date().toLocaleString() // Stocker la vraie date d'envoi
    };

    // 🔹 Envoyer le message sous format JSON via `POST`
    fetch(`${SERVER_URL}/msg/post`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(messageData) // Convertir l'objet en JSON
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Message ajouté avec succès :", data);

            // 🟢 Ajouter directement le message à la liste `messages`
            messages.push(messageData);

            document.getElementById("new-message").value = ""; // Effacer le champ après envoi
            update(messages); // 🔄 Met à jour l'affichage avec la nouvelle liste
        })
        .catch(error => console.error("Erreur lors de l'envoi du message :", error));
}



// 🟢 Charger les messages au démarrage
document.addEventListener("DOMContentLoaded", fetchMessages);

// 🟢 Lier `postMessage` au bouton "Envoyer"
document.getElementById("send-message").addEventListener("click", postMessage);

// 🟢 Mettre à jour la liste des messages en cliquant sur "Update"
document.getElementById("update-messages").addEventListener("click", fetchMessages);


// Changer le style (mode sombre / mode clair)
document.getElementById("toggle-style").addEventListener("click", function() {
    document.body.classList.toggle("dark-mode");
});

