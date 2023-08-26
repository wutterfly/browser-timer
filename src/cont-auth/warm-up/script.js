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

let results = [];
let counter = 0;
let password_counter = 0;
let current_data = [];
let downloads = 0;


function on_event(event) {
    let timestamp = performance.now();
    //console.log(event.key)
    if (last_event == undefined) {
        last_event = timestamp
    }

    // check for downlaod key
    if (event.key == "ArrowLeft" || event.key == "Escape") {
        if (event.type == "keyup") {
            download();
            results.length = 0; // changed (keeping allocation?)
            input_field_element.value = "";

        }
        return;
    }

    // check for warmup key
    if (event.key == 'Delete' || event.code == 'Delete' || event.key == 'q' || event.code == 'KeyQ') {

        //console.log("Warm up")
        //input_field_element.value = "";
        return;
    }

    let data = [counter, password_counter, timestamp, timestamp - last_event, event.key, event.type];

    last_event = timestamp;
    counter += 1;

    results.push(data);

    current_data.push([event.key, event.type])
    if (event.key == "Enter") {
        if (event.type == "keyup") {

            let warmup;
            // check that the password is correct
            switch (input_field_element.value) {
                case ".tie5Roanl\n":
                    warmup = false;

                case "qqqqqqqq.tie5Roanl\n":
                    warmup = true;

                default:
                    console.log(input_field_element.value);
                    alert(`wrong password\nSee Console for more info!`);
            }

            // check that all events where captured
            if (warmup && (current_data.length != 40 && current_data.length != 38)) {
                console.log(current_data);
                console.log("Current len: ", current_data.length, 'Should len: 38/40');
                alert("Not all keys captured.");
            } else if (current_data.length != 24 && current_data.length != 22) {
                console.log(current_data);
                console.log("Current len: ", current_data.length, 'Should len: 22/24');
                alert("Not all keys captured.");
            }
            
            current_data.length = 0;
            input_field_element.value = "";
            password_counter += 1;


        }

    }

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
    downloadLink.download = `password-timing-data(${downloads}).csv`;
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);

    downloadLink.click();

    document.body.removeChild(downloadLink);
    downloads += 1;
}

function to_csv(results_raw) {
    let output = "counter,password_counter,timestamp,distance,key,type\n";


    results_raw.forEach((row) => {
        output += `${row[0]},${row[1]},${row[2]},${row[3]},${row[4]},${row[5]}\n`;
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


