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

    if (last_event == undefined) {
        last_event = timestamp
    }

    if (event.key == "ArrowLeft") {
        if (event.type == "keyup") {
            download();
            results = [];
            input_field_element.value = "";
          
        }
        return;
    }
    console.log(event)
    let data = [counter, password_counter, timestamp, timestamp - last_event, event.key, event.type];

    last_event = timestamp;
    counter += 1;

    results.push(data);

    current_data.push([event.key, event.type])

    if (event.key == "Enter") {
        if (event.type == "keyup") {
            // check that the password is correct
            if (input_field_element.value != ".tie5Roanl\n") {
                console.log(current_data)
                alert("wrong password: ", input_field_element.value);
            }
            // check that all events where captured
            else {

                // mask for all necessary events (should all become true)
                is = [
                    [false, false], // .
                    [false, false], // t
                    [false, false], // i
                    [false, false], // e
                    [false, false], // 5
                    [false, false], // Shift
                    [false, false], // R
                    [false, false], // o
                    [false, false], // a
                    [false, false], // n
                    [false, false], // l
                    [false, false], // \n

                ]

                // there should be a total of 24 events (12 keys down->up)
                if (current_data.length != 24 && current_data.length != 22)  {
                    console.log(current_data);
                    alert("Not all keys captured.")
                }

                // save all events that were triggered
                for (let i = 0; i < current_data.length; i++) {
                    let event = [current_data];
                    let key = event[0];
                    let type = event[1];

                    if (key == "." && type == "keydown") { is[0][0] = true }
                    if (key == "." && type == "keyup") { is[0][1] = true }

                    if (key == "t" && type == "keydown") { is[1][0] = true }
                    if (key == "t" && type == "keyup") { is[1][1] = true }

                    if (key == "i" && type == "keydown") { is[2][0] = true }
                    if (key == "i" && type == "keyup") { is[2][1] = true }

                    if (key == "e" && type == "keydown") { is[3][0] = true }
                    if (key == "e" && type == "keyup") { is[3][1] = true }

                    if (key == "5" && type == "keydown") { is[4][0] = true }
                    if (key == "5" && type == "keyup") { is[4][1] = true }

                    if (key == "Shift" && type == "keydown") { is[5][0] = true }
                    if (key == "Shift" && type == "keyup") { is[5][1] = true }

                    if (key == "R" && type == "keydown") { is[6][0] = true }
                    if (key == "r" && type == "keyup") { is[6][1] = true }

                    if (key == "o" && type == "keydown") { is[7][0] = true }
                    if (key == "o" && type == "keyup") { is[7][1] = true }

                    if (key == "a" && type == "keydown") { is[8][0] = true }
                    if (key == "a" && type == "keyup") { is[8][1] = true }

                    if (key == "n" && type == "keydown") { is[9][0] = true }
                    if (key == "n" && type == "keyup") { is[9][1] = true }

                    if (key == "l" && type == "keydown") { is[10][0] = true }
                    if (key == "l" && type == "keyup") { is[10][1] = true }

                    if (key == "Enter" && type == "keydown") { is[11][0] = true }
                    if (key == "Enter" && type == "keyup") { is[11][1] = true }
                }

                // check that all necessary events were triggered
                for (let i = 0; i < is.length; i++) {
                    if (current_data.length == 22 && i == 5) {
                       
                        continue;
                    }
                    if (!is[0] || !is[1]) {
                        console.log(current_data)
                        alert("Not all keys captured: ", i, is[0], is[1])
                        return;
                    }
                }

                //console.log("All correct!");
                current_data = [];
                input_field_element.value = "";
                password_counter += 1;

            }
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