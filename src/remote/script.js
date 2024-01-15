let input_field_element = undefined;
let websocket = undefined;


const PING_MSG = 0;
const RTT_MSG = 1;


const PONG_MSG = 0;
const DATA_MSG = 1;

const SEPERATOR = '\u{F003}';


window.addEventListener("load", () => {

    input_field_element = document.getElementById("input-field");

    input_field_element.addEventListener("keydown", on_key_event)
    input_field_element.addEventListener("keyup", on_key_event)

    const host = location.hostname;
    websocket = new WebSocket(`wss://${host}/server`);

    websocket.onmessage = on_message;
});

function on_key_event(event) {
    console.log(event.key, " | ", event.code, " | ", event.keyCode, " | ", event.type);

    websocket.send(`${DATA_MSG}${SEPERATOR}${event.key}${SEPERATOR}${event.keyCode}${SEPERATOR}${event.type}`)

    // ESC
    if (event.keyCode == 27 && event.type == "keyup") {
        input_field_element.value = "";
    }
}

function on_message(msg) {

    const split = msg.data.split(SEPERATOR);
    const code = parseInt(split[0], 10)

    switch (code) {
        case PING_MSG:
            websocket.send(msg.data);
            console.log("ping: ", split[1]);
            break
        case RTT_MSG:
            console.log("rtt: ", split[1]);
            break

        default:
            console.log("unkown message: ", code)
    }
}