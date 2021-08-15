const socket = io("http://localhost:4000", { transports : ['websocket'] });

let message_form = document.getElementById("client-message-form");

message_form.addEventListener("submit", (e) => {
    e.preventDefault();


})