async function simulateTyping(input, text, dynamics, output) {
    // data is stored in localStorage
    // clear localStorage before starting
    localStorage.clear();

    // for all repetitions in all sessions of all users
    for (let i = 1; i < dynamics.length; i++) {
        await typeWord(input, text, dynamics[i]);

        let results = `${dynamics[i][0]},${dynamics[i][1]},${dynamics[i][2]}`;
        for (let i = 0; i < keyDownTime.length - 1; i++) {
            let H = (keyUpTime[i] - keyDownTime[i]);
            let UD = (keyDownTime[i + 1] - keyUpTime[i]);
            let DD = H + UD;
            results += `,${H},${DD},${UD}`;
        }
        results += `,${(keyUpTime[keyUpTime.length - 1] - keyDownTime[keyDownTime.length - 1])}`;

        localStorage.setItem(`sim-ksd-${i}`, results);
        output.innerHTML += `${dynamics[i][0]},${dynamics[i][1]},${dynamics[i][2]} | `;

        keyDownTime = [];
        keyUpTime = [];
    }

    // store data from localStorage to a local file
    // get the data from localStorage
    let data = "";
    for (let i = 1; i < dynamics.length; i++) {
        data += (localStorage.getItem(`sim-ksd-${i}`) + "\r\n");
    }


    // create a Blob from the data
    const blob = new Blob([data], { type: 'text/plain' });

    // create a download link
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = 'data.txt';
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);

    // trigger a click event on the download link
    downloadLink.click();

    // clean up
    document.body.removeChild(downloadLink);
    localStorage.clear();
}

async function typeWord(input, text, dynamic) {
    input.value = "";

    for (let i = 0; i < text.length; i++) {
        let char = text.charAt(i);
        let hold = Math.round(dynamic[3 * (i + 1)] * 1000);
        let upDown = Math.round(dynamic[3 * (i + 1) + 2] * 1000);
        await downAndHold(input, char, hold);
        await upAndDown(input, char, upDown);
    }
}

async function downAndHold(input, char, hold) {
    return new Promise(resolve => {
        let eventDown = new KeyboardEvent('keydown', { key: char });
        let eventUp = new KeyboardEvent('keyup', { key: char });

        input.dispatchEvent(eventDown);
        input.value += char;
        setTimeout(() => {
            input.dispatchEvent(eventUp);
            resolve();
        }, hold);  // key hold delay
    });
}

async function upAndDown(input, char, upDown) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, upDown);  // key switch delay
    });
}