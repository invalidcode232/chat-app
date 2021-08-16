const socket = io("http://localhost:4000", { transports : ['websocket'] });

const message = {
    new: function(container, from_me, body) {
        let card = document.createElement("div");
        let card_body = document.createElement("div");
        let card_text = document.createElement("p");

        card.className = from_me ? "card message-card inverse bg-primary text-light shadow-sm" : "card message-card shadow-sm"
        card_body.className = "card-body";
        card_text.className = "card-text";

        card_text.innerText = body;

        card.appendChild(card_body);
        card_body.appendChild(card_text);
        container.appendChild(card);
    }
}

function get_timestamp() {
    return Math.floor(Date.now() / 1000)
}