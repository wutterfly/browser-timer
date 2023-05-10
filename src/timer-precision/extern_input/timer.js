window.addEventListener("load", () => {
    let isolated_element = document.getElementById("isolated");
    isolated_element.innerHTML = "Is isolated: " + crossOriginIsolated;

    if (crossOriginIsolated) {
        isolated_element.style.color = "darkgreen";
        file_suf = "isolated";
    } else {
        isolated_element.style.color = "darkred";
        file_suf = "unisolated";
    }

    let src = document.getElementById("timer_script").src;
    document.getElementById("timer_script_src").innerHTML = "Script Origin: " + src;

    results_element = document.getElementById("results");
    raw_results_element = document.getElementById("results-raw");
    results_counter_element = document.getElementById("counter");
    results_mean_element = document.getElementById("mean");
    results_max_element = document.getElementById("max");
    results_min_element = document.getElementById("min");

});

let file_suf = undefined;
let raw_results = [];
let distances = [];

let raw_results_element = undefined;
let results_element = undefined;

let results_counter_element = undefined;
let results_mean_element = undefined;
let results_max_element = undefined;
let results_min_element = undefined;

function button() {
    let timestamp = performance.now();

    raw_results.push(timestamp);

    let len = raw_results.length;
    console.log(len);

    append_raw(timestamp);


    if (len == 1) {
        append_dif(0);
        distances.push(0)
        results_min_element.innerHTML = 0;
        results_max_element.innerHTML = 0;
        results_mean_element.innerHTML = 0;
    }

    if (len > 1) {
        let current = raw_results[len-1];
        let prev = raw_results[len - 2];
        let dif = current - prev;
        distances.push(dif)
        append_dif(dif);

        let slice = distances.slice(1,distances.length);
        console.log(slice);
        let data = min_max_mean(slice);


        results_min_element.innerHTML = data[0];
        results_max_element.innerHTML = data[1];
        results_mean_element.innerHTML = data[2];
    }

    results_counter_element.innerHTML = raw_results.length;


}

function append_dif(timestamp) {
    let listItem = document.createElement('li')
    let time_element = document.createElement('div');

    time_element.style.fontWeight = "bold";

    time_element.innerHTML = timestamp;

    listItem.appendChild(time_element);



    listItem.classList.add("result-raw");
    results_element.appendChild(listItem);
}

function append_raw(timestamp) {
    let listItem = document.createElement('li')
    let time_element = document.createElement('div');

    time_element.style.fontWeight = "bold";

    time_element.innerHTML = timestamp;

    listItem.appendChild(time_element);



    listItem.classList.add("result-raw");
    raw_results_element.appendChild(listItem);
}

function clear_results() {
    document.getElementById("counter").innerHTML = 0;
    document.getElementById("mean").innerHTML = 0;
    document.getElementById("min").innerHTML = 0;
    document.getElementById("max").innerHTML = 0;

    while (raw_results_element.firstChild) {
        raw_results_element.removeChild(raw_results_element.firstChild);
    }

    while (results_element.firstChild) {
        results_element.removeChild(results_element.firstChild);
    }

    raw_results = [];

}


/** get min,max and mean */
function min_max_mean(array) {
    let min = undefined;
    let max = undefined;
    let total = 0;

    

    for (let i = 0; i < array.length; i++) {
        let x = array[i]

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

        total += x;
    }


    mean = total / array.length

    return [min, max, mean];
}

function download_raw() {
    if (raw_results == undefined) {
        alert("No results!");
        return;
    }
    const csv = to_csv(raw_results, distances);

    const blob = new Blob([csv], { type: 'text/plain' });

    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = `browser-timing-data-${file_suf}.csv`;
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);

    downloadLink.click();

    document.body.removeChild(downloadLink);
}

function to_csv(results_raw, distances) {
    let output = "timestamp,distance\n";


    for (let i = 0; i < results_raw.length; i++) {
        output += `${results_raw[i]},${distances[i]}\n`;
    }

    console.log(output)

    return output;
}