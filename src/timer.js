

window.addEventListener("load", () => {
    document.getElementById("isolated").innerHTML = "Is isolated: " + crossOriginIsolated;
    let src = document.getElementById("timer_script").src;
    document.getElementById("timer_script_src").innerHTML = "Script Origin: " + src;
});

let should_stop = false;
let running = false;

function stop_timer() {
    should_stop = true;
}


async function timer() {
    if (running) {
        return;
    } else {
        running = true;
    }

    let results = [];

    let delay_ms = document.getElementById("delay_input").value;
    let iter = document.getElementById("iter_input").value;
    let counter = document.getElementById("counter");

    for (let i = 1; i <= iter; i++) {
        if (should_stop) {
            break;
        }
        counter.innerHTML = "Counter: " + i;

        let first;
        let second;
        let dif;

        if (delay_ms == 0) {
            // first timestamp
            first = performance.now();
            // second time stamp
            second = performance.now();

            // calculate difference -> this should be (nearly) 0
            dif = second - first;
        } else {
            // first timestamp
            first = performance.now();
            // wait/sleep
            await delay(delay_ms);
            // second time stamp
            second = performance.now();

            // calculate difference -> this should be (nearly) 0
            dif = second - first - delay_ms;
        }

        // save difference
        results.push(dif);
    }

    let avg = mean(results);
    let min__max = min_max(results);
    let min = min__max[0];
    let max = min__max[1];

    document.getElementById("mean").innerHTML = "Average(mean): " + avg + "ms";
    document.getElementById("min").innerHTML = "Min: " + min + "ms";
    document.getElementById("max").innerHTML = "Max: " + max + "ms";

    append_result(delay_ms, iter, avg, min, max);

    should_stop = false;
    running = false;

}

// sleep for milliseconds
async function delay(milliseconds) {
    return await new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

// calculate average(mean)
function mean(array) {
    let len = 0;
    let total = 0;

    array.forEach((x) => {
        len++;
        total += x;
    })


    return total / len;

}

// get min and max
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

    document.getElementById("results").appendChild(listItem);
}


function clear_results() {
    let element = document.getElementById("results");
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}