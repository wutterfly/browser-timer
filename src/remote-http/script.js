let input_field_element = undefined;

let id = undefined;


window.addEventListener("load", async () => {

    input_field_element = document.getElementById("input-field");

    input_field_element.addEventListener("keydown", on_key_event)
    input_field_element.addEventListener("keyup", on_key_event);


    await send_register();

});

async function on_key_event(event) {
    console.log(event.key, " | ", event.code, " | ", event.keyCode, " | ", event.type);

    await send_data(event.key, event.keyCode, event.type);


    // ESC
    if (event.keyCode == 27 && event.type == "keyup") {
        input_field_element.value = "";
    }
}

async function send_register() {
    const data = `{"Register": {}}`;

    const response = await fetch("/server/http", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: data
    });

    const json = await response.json();

    id = json['id'];
    console.log("id: ", id);

    if (json['request_rtt']) {
        const c = json['request_rtt'];
        await send_pong(c);
    }
}


async function send_data(key, code, typ) {
    // { "Data": { "id": 1, "key": "a", "typ": "KeyDown", "key_code": 12 } }
    // {"Pong":{"id":123,"ping":12}}

    const parsed_typ = typ == "keydown" ? "KeyDown" : "KeyUp"
    const data = {
        "Data": {
            "id": id,
            "key": key,
            "typ": parsed_typ,
            "key_code": code,
        }
    };

    const response = await fetch("/server/http", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });


    const json = await response.json();

    if (json['request_rtt']) {
        const c = json['request_rtt'];
        console.log("wants pong: ", c);

        await send_pong(c);
    }
}

async function send_pong(ping) {
    // {"Pong":{"id":123,"ping":12}}
    const data = {
        "Pong": {
            "id": id,
            "ping": ping,
        }
    };

    const response = await fetch("/server/http", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });

    const json = await response.json();
}