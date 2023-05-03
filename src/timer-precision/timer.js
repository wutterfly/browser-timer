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
});

let should_stop = false;
let running = false;
let results_raw = [];

function stop_timer() {
    should_stop = true;
}

async function timer() {
    if (running) {
        return;
    } else {
        running = true;
    }

    let raw_results_element = document.getElementById("results-raw");
    clear_raw(raw_results_element);

    let results = [];
    results_raw = [];

    let delay_ms = parseInt(document.getElementById("delay_input").value,10);
    let iterations = document.getElementById("iter_input").value;

    let counter_element = document.getElementById("counter");
    let mean_element = document.getElementById("mean");
    let min_element = document.getElementById("min");
    let max_element = document.getElementById("max");

    mean_element.innerHTML = 0;
    min_element.innerHTML = 0;
    max_element.innerHTML = 0;




    for (let i = 1; i <= iterations; i++) {
        if (should_stop) {
            break;
        }
        counter_element.innerHTML = i;

        let first;
        let second;
        let dif;
        const delay_prom = delay(delay_ms);

        if (delay_ms == 0) {
            // first timestamp
            first = performance.now();
            // second time stamp
            second = performance.now();

            // calculate difference -> this should be (nearly) 0
            dif = second - first;
        } else {

            // wait/sleep
            const timestamps = await delay_prom;

            // get timestamps
            first = timestamps[0];
            second = timestamps[1];

            // calculate difference -> this should be (nearly) 0
            dif = second - first; //- delay_ms;
        }

        // save difference
        results.push(dif);

        results_raw.push([first, second, delay_ms]);

        // save raw timestamps
        append_raw(raw_results_element, [first, second, delay_ms])
    }

    let avg = mean(results);
    let min__max = min_max(results);
    let min = min__max[0];
    let max = min__max[1];

    mean_element.innerHTML = avg;
    min_element.innerHTML = min;
    max_element.innerHTML = max;

    append_result(delay_ms, iterations, avg, min, max);

    should_stop = false;
    running = false;

}

/** Sleep for milliseconds */
async function delay(milliseconds) {
    return await new Promise(resolve => {
        const delay_start = performance.now();
        setTimeout(() => {
            const delay_end = performance.now();
            resolve([delay_start, delay_end])
        }, milliseconds);
    });
}

/** calculate average(mean) */
function mean(array) {
    let len = 0;
    let total = 0;

    array.forEach((x) => {
        len++;
        total += x;
    })


    return total / len;

}

/** get min and max */
function min_max(array) {
    let min;
    let max;

    array.forEach((x) => {
        // first iteration
        if (min == undefined && max == undefined) {
            min = x;
            max = x;
        }

        if (min > x) {
            min = x;
        }

        if (max < x) {
            max = x;
        }

        (min, max)
    })


    return [min, max];
}

function append_result(delay_ms, iter, avg, min, max) {
    let listItem = document.createElement('li')
    let delay_ms_item = document.createElement('div');
    let iter_item = document.createElement('div');
    let avg_item = document.createElement('div');
    let min_item = document.createElement('div');
    let max_item = document.createElement('div');

    delay_ms_item.innerHTML = "Delay: " + delay_ms + "ms";
    iter_item.innerHTML = "Iterations: " + iter;
    avg_item.innerHTML = "Average(mean): " + avg + "ms";
    min_item.innerHTML = "Min: " + min + "ms";
    max_item.innerHTML = "Max: " + max + "ms";

    listItem.appendChild(delay_ms_item);
    listItem.appendChild(iter_item);
    listItem.appendChild(avg_item);
    listItem.appendChild(min_item);
    listItem.appendChild(max_item);

    listItem.classList.add("results-summary");
    document.getElementById("results").appendChild(listItem);
}

function clear_results() {
    document.getElementById("counter").innerHTML = 0;
    document.getElementById("mean").innerHTML = 0;
    document.getElementById("min").innerHTML = 0;
    document.getElementById("max").innerHTML = 0;

    clear_raw(document.getElementById("results-raw"));

    let element = document.getElementById("results");
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }

}

function append_raw(raw_results_element, data) {
    let first = data[0];
    let second = data[1];
    let delay = data[2];
    let dif = second - first ;//- delay;

    let listItem = document.createElement('li')
    let dif_element = document.createElement('div');
    let first_element = document.createElement('div');
    let second_element = document.createElement('div');

    dif_element.style.fontWeight = "bold";


    dif_element.innerHTML = dif;
    first_element.innerHTML = first;
    second_element.innerHTML = second;

    listItem.appendChild(dif_element);
    listItem.appendChild(first_element);
    listItem.appendChild(second_element);


    listItem.classList.add("result-raw");
    raw_results_element.appendChild(listItem);
}

function clear_raw(raw_results_element) {
    while (raw_results_element.firstChild) {
        raw_results_element.removeChild(raw_results_element.firstChild);
    }

    results_raw = [];
}

function download_raw() {
    const results = results_raw;
    if (results == undefined) {
        alert("No results!");
        return;
    }
    const csv = to_csv(results);

    const blob = new Blob([csv], { type: 'text/plain' });

    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `browser-timing-data.csv`;
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);

    downloadLink.click();

    document.body.removeChild(downloadLink);
}

function to_csv(results_raw) {
    let output = "first,second,delay\n";


    results_raw.forEach((row) => {
        output += `${row[0]},${row[1]},${row[2]}\n`;
    })


    console.log(output)

    return output;
}