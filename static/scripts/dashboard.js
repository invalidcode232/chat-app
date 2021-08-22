let messages_container = document.getElementById("messages-container");
let message_form = document.getElementById("message-form");
let message_input = document.getElementById("message-input");
let typing_ind = document.getElementById("typing-ind");
let session_id = new URLSearchParams(window.location.search).get("session_id");
session_id = session_id ? session_id : 1;

socket.emit('join', session_id);

socket.on("display-message", message_data => {
    message.new(messages_container, false, message_data.body);
})

socket.on("user-display-typing", data => {
    typing_ind.innerText = "Typing...";
})

setInterval(() => {
    typing_ind.innerText = "";
}, 3000);

if (message_input != null) {
    message_input.addEventListener("keyup", (e) => {
        socket.emit("user-type");
    })

    message_form.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!message_input.value || message_input.value == "") {
            return;
        }

        message.new(messages_container, true, message_input.value);

        let message_data = {
            body: message_input.value,
            timestamp: get_timestamp(),
            sender: "user",
        }

        socket.emit("session-message", message_data);
        message_input.value = "";
    })
}

socket.on("display-notifications", message_data => {
    message_data = JSON.parse(message_data);
    let message_text = document.getElementById(`messages-session-${message_data[0].session_id}`);
    message_text.innerHTML = `<b> ${message_data[0].body} </b>`;
})