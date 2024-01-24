let input_field_element = undefined;
let events_element = undefined;
let kpm_element = undefined;
let kdt_element = undefined;
let kdd_element = undefined;
let kdd_p_element = undefined;
let past_r_element = undefined;

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
    kpm_element = document.getElementById("kpm");
    kdt_element = document.getElementById("kdt");
    kdd_element = document.getElementById("kdd");
    kdd_p_element = document.getElementById("kdd-p");
    past_r_element = document.getElementById("past-results");

    input_field_element.addEventListener("keydown", on_event)
    input_field_element.addEventListener("keyup", on_event)
});

let inputs = 0;
let start_time = undefined;
let kpm = undefined;

let ngraphs = {};
let last_key = undefined;
let last_last_key = undefined;

let pressed = undefined;
let avg = undefined;
let count = 0;


let pressed_dd = undefined;
let avg_dd = undefined;
let count_dd = 0;
let pauses = 0;

let res_n = 0;
let results = [];

function on_event(event) {
    // take timestamp
    const timestamp = performance.now();

    // console.log(event.key, " | ", event.code, " | ", event.keyCode, " | ", event.type);

    // check if download was triggered
    if (event.key == "Escape") {
        if (event.type == "keydown") {
            input_field_element.value = "";


            results.push([
                res_n,
                kpm.toFixed(2),
                avg.toFixed(2),
                avg_dd.toFixed(2),
                pauses.toFixed(2),
            ]);

            res_n += 1;

            update_results(results);

            inputs = 0;
            start_time = undefined;

            ngraphs = {};
            last_key = undefined;
            last_last_key = undefined;

            pressed = undefined;
            avg = undefined;
            count = 0;


            pressed_dd = undefined;
            avg_dd = undefined;
            count_dd = 0;
            pauses = 0;

            kdt_element.innerHTML = ``;
            kdd_element.innerHTML = ``;
            kpm_element.innerHTML = ``;
            kdd_p_element.innerHTML = ``;
        }
        return
    }

    // key down-up time
    if (event.type == "keydown") {
        pressed = timestamp;
    } else {
        const key_down = timestamp - pressed;


        if (avg == undefined) {
            avg = key_down;
            count += 1;
        } else {
            count += 1;
            avg = avg + (key_down - avg) / count;


            kdt_element.innerHTML = `${avg.toFixed(2)}`;
        }
    }

    // key down-down-time
    if (event.type == "keydown") {
        if (pressed_dd == undefined) {
            pressed_dd = timestamp;
            count_dd += 1;
        } else {

            const key_down = timestamp - pressed_dd;

            // filter long pauses
            if (key_down > 500) {
                pressed_dd = timestamp;
                pauses += 1;
                kdd_p_element.innerHTML = `${pauses}`;
            } else if (avg_dd == undefined) {
                avg_dd = key_down;
            } else {
                count_dd += 1;
                avg_dd = avg_dd + (key_down - avg_dd) / count_dd;


                kdd_element.innerHTML = `${avg_dd.toFixed(2)}`;
            }

            pressed_dd = timestamp;
        }

    }

    // keys per minute
    if (start_time == undefined) {
        start_time = timestamp;
        inputs += 1;
    } else if (event.type == "keydown") {
        inputs += 1;
        const elapsed = (timestamp - start_time) / 1000 / 60;
        kpm = inputs / elapsed;
        kpm_element.innerHTML = `${kpm.toFixed(2)}`;
    }


}

function update_results(results) {
    while (past_r_element.firstChild) {
        past_r_element.removeChild(past_r_element.firstChild);
    }

    const rev = results.toReversed();

    for (const res of rev) {
        const node = document.createElement("li");
        const textnode = document.createTextNode(` ${res[0]}: Keys per Minute: ${res[1]} | Avg Key Down-Up Time: ${res[2]} | Avg Key Down-Down Time: ${res[3]} | Pauses: ${res[4]}`);
        node.appendChild(textnode);
        past_r_element.appendChild(node);
    }
}

