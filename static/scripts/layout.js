let notifs_table = document.getElementById("notifs-table");

socket.emit("get-notifications");

socket.on("display-notifications", (notifications) => {
    notifications = JSON.parse(notifications)
    for (i in notifications) {
        let tr = document.createElement("tr");
        let th = document.createElement("th");
        th.setAttribute("scope", "row");
        th.innerText = notifications[i].message_id;

        let td_msg = document.createElement("td");
        td_msg.innerText = notifications[i].body;

        let td_session = document.createElement("td");
        td_session.innerText = notifications[i].session_id;

        let td_view = document.createElement("td");
        let td_a_view = document.createElement("a");
        td_a_view.href = `?session_id=${notifications[i].session_id}`;
        td_a_view.innerText = "View";
        
        td_view.appendChild(td_a_view);

        tr.appendChild(th);
        tr.appendChild(td_msg);
        tr.appendChild(td_session);
        tr.appendChild(td_view);

        notifs_table.appendChild(tr);
    }
})