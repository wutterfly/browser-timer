let input_field_element = undefined;
let events_element = undefined;
let kpm_element = undefined;
let kdt_element = undefined;
let kdd_element = undefined;
let kdd_p_element = undefined;

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

    input_field_element.addEventListener("keydown", on_event)
    input_field_element.addEventListener("keyup", on_event)
});

let inputs = 0;
let start_time = undefined;

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



function on_event(event) {
    // take timestamp
    const timestamp = performance.now();

    // console.log(event.key, " | ", event.code, " | ", event.keyCode, " | ", event.type);

    // check if download was triggered
    if (event.key == "Escape") {
        input_field_element.value = "";
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


            kdt_element.innerHTML = `${avg.toFixed(2)}`
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
                kdd_p_element.innerHTML = `${pauses}`
            } else if (avg_dd == undefined) {
                avg_dd = key_down;
            } else {
                count_dd += 1;
                avg_dd = avg_dd + (key_down - avg_dd) / count_dd;


                kdd_element.innerHTML = `${avg_dd.toFixed(2)}`
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
        let kpm = inputs / elapsed;
        kpm_element.innerHTML = `${kpm.toFixed(2)}`;
    }


}

