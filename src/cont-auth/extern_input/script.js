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
});

let input_field_element = undefined;
let events_element = undefined;

let last_event = undefined;

let results = []


function on_event(event) {
    let timestamp = performance.now();

    if (last_event == undefined) {
        last_event = timestamp
    }

    if (event.key == "F2") {
        if (event.type == "keyup") {
            download();
        }
        return;
    }

    let data = [timestamp, timestamp - last_event, event.key, event.type];

    last_event = timestamp;

    results.push(data);

    //append_event(data);
}

function append_event(data) {
    let listItem = document.createElement('li')
    let timestamp = document.createElement('div');
    let key = document.createElement('div');
    let typ = document.createElement('div');

    timestamp.innerHTML = "Timestamp: " + data[1] + "ms";
    key.innerHTML = "Key: " + data[2];
    typ.innerHTML = "Type: " + data[3];


    listItem.appendChild(timestamp);
    listItem.appendChild(key);
    listItem.appendChild(typ);

    if (data[3] == "keyup") {
        listItem.style.color = "#4a1a1a";
    } else if (data[3] == "keydown") {
        listItem.style.color = "#1c4a1d";
    }

    listItem.classList.add("event");
    events_element.appendChild(listItem);
}

function download() {
    if (results == undefined) {
        alert("No results!");
        return;
    }
    const csv = to_csv(results);

    const blob = new Blob([csv], { type: 'text/plain' });

    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `text-timing-data.csv`;
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);

    downloadLink.click();

    document.body.removeChild(downloadLink);
}

function to_csv(results_raw) {
    let output = "timestamp,distance,key,type\n";


    results_raw.forEach((row) => {
        output += `${row[0]},${row[1]},${row[2]},${row[3]}\n`;
    })

    return output;
}

function clear_all() {
    while (events_element.firstChild) {
        events_element.removeChild(events_element.firstChild);
    }
    input_field_element.value = "";
    results = [];
    last_event = undefined;
}

function show_all() {
    for (let i = 0; i < results.length; i++) {
        append_event(results[i])
    }
}