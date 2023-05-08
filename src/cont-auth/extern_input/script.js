window.addEventListener("load", () => {
    let isolated_element = document.getElementById("isolated");
    isolated_element.innerHTML = "Is isolated: " + crossOriginIsolated;

    if (crossOriginIsolated) {
        isolated_element.style.color = "darkgreen";
    } else {
        isolated_element.style.color = "darkred";
    }

    let src = document.getElementById("timer_script").src;
    document.getElementById("timer_script_src").innerHTML = "Script Origin: " + src;

    localStorage.clear();

    input_field_element = document.getElementById("input-field");
    events_element = document.getElementById("events");

    input_field_element.addEventListener("keydown", on_event)
    input_field_element.addEventListener("keyup", on_event)

    results.push([performance.now(), "", ""])
});

let input_field_element = undefined;
let events_element = undefined;

let results = []


function on_event(event) {
    let timestampt = performance.now();
    console.log(event);

    let data = [timestampt, event.key, event.type];

    results.push(data);

    console.log(results);

    append_event(data);
}

function append_event(data) {
    let listItem = document.createElement('li')
    let timestamp = document.createElement('div');
    let key = document.createElement('div');
    let typ = document.createElement('div');

    timestamp.innerHTML = "Timestamp: " + data[0] + "ms";
    key.innerHTML = "Key: " + data[1];
    typ.innerHTML = "Type: " + data[2];


    listItem.appendChild(timestamp);
    listItem.appendChild(key);
    listItem.appendChild(typ);


    listItem.classList.add("event");
    events_element.appendChild(listItem);
}

