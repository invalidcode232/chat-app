const socket = io({
    "transports": ["websocket"]
});

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

function generate_id() {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function recaptcha_cb(token){
    let input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('name', 'g-recaptcha-response');
    input.setAttribute('value', token);
    input.setAttribute('hidden', '');
    document.getElementsByTagName('form')[0].appendChild(input);
}