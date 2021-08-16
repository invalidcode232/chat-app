const socket = io("http://localhost:4000", { transports : ['websocket'] });

let message_form = document.getElementById("client-message-form");
let message_input = document.getElementById("message-input");

let session_id = message_form.getAttribute("data-session-id");

message_form.addEventListener("submit", (e) => {
    e.preventDefault();

    message.new(messages_container, true, message_input.value);

    let message_data = {
        session_id: session_id,
        body: message_input.value,
        timestamp: get_timestamp(),
        sender: "client",
    }

    socket.emit("session-message", message_data);
    message_input.value = "";
})

socket.emit('join', session_id);

socket.on("display-message", message_data => {
    // if (message_data.session_id == session_id) {
    //     message.new(messages_container, false, message_data.body);
    // } 
    console.log("display-message")

    message.new(messages_container, false, message_data.body);
})