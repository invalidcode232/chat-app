let notifs_table = document.getElementById("notifs-table");
let notifs_btn = document.getElementById("notifs-btn");
let notifs_num_ind = document.getElementById("notifs-num-ind");
let notifs_count = 0;

notifs_btn.addEventListener("click", (e) => {
    notifs_count = 0;
})

socket.on("display-notifications", (notifications) => {
    notifications = JSON.parse(notifications);

    notifs_table.innerHTML = "";

    for (i in notifications) {

        let tr = document.createElement("tr");
        let th = document.createElement("th");

        th.setAttribute("scope", "row");
        th.innerText = notifs_count;

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

        notifs_count++;
    }

    notifs_num_ind.innerText = notifs_count;
})