const fileInput = document.querySelector('#csv-file-input');

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];

    Papa.parse(file, {
        header: false,
        dynamicTyping: true,
        complete: (results) => {
            const dynamics = results.data;
            //console.log(dynamics);

            const input = document.querySelector('#keystroke-input');
            const output = document.querySelector('#progress-output');
            simulateTyping(input, '.tie5Roanl\r', dynamics, output);
        }
    });
});