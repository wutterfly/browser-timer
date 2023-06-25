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

    input_field_element.addEventListener("keydown", on_event);
    input_field_element.addEventListener("keyup", on_event);


    document.getElementById("listen_input").innerHTML = ` "${ListenKey}"`;
});

const ListenKey = '0';

let input_field_element = undefined;
let events_element = undefined;

let results = [];

function on_event(event) {
    let now = performance.now();
    if (event.key == ListenKey) {
        if (results.length < 200) {
            results.push([now/1000, event.key, event.type]);
        }
    }
}

function show_all() {
    while (events_element.firstChild) {
        events_element.removeChild(events_element.firstChild);
    }
    for (let i = 0; i < results.length; i++) {
        append_event(results[i])
    }
}

function clear_all() {
    while (events_element.firstChild) {
        events_element.removeChild(events_element.firstChild);
    }
    console.log("clear")
    input_field_element.value = "";
    results = [];
    last_event = undefined;
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

    if (data[2] == "keyup") {
        listItem.style.color = "#4a1a1a";
    } else if (data[2] == "keydown") {
        listItem.style.color = "#1c4a1d";
    }

    listItem.classList.add("event");
    events_element.appendChild(listItem);
}

function download() {
    if (results == undefined || results.length == 0) {
        alert("No events!");
        return;
    }
    const csv = to_csv(results);

    const blob = new Blob([csv], { type: 'text/plain' });

    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `browser-overhead-data.csv`;
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);

    downloadLink.click();

    document.body.removeChild(downloadLink);
}

function download_simple() {
    if (results == undefined || results.length == 0) {
        alert("No events!");
        return;
    }

    if (results.length !=  200) {
        alert(`Wrong len: ${results.length}`);
    }

    const csv = to_csv_simple(results);

    const blob = new Blob([csv], { type: 'text/plain' });

    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `browser-overhead-data.json`;
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);

    downloadLink.click();

    document.body.removeChild(downloadLink);
}

function to_csv(results_raw) {
    let output = "timestamp,distance,key,type\n";

    for (let i = 0; i < results_raw.length; i++) {
        let row = results[i];
        if (i == 0) {
            output += `${row[0]},0,${row[1]},${row[2]}\n`;
            continue;
        }

        let last_row = results_raw[i - 1];
        output += `${row[0]},${row[0] - last_row[0]},${row[1]},${row[2]}\n`;
    }

    return output;
}