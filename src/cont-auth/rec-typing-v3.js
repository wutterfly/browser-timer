const input = document.querySelector('#keystroke-input');

let keyDownTime = [];
let keyUpTime = [];

input.onkeydown = function (e) {
    //keyDownTime.push(Date.now());
    keyDownTime.push(performance.timeOrigin + performance.now());
};

input.onkeyup = function (e) {
    //keyUpTime.push(Date.now());
    keyUpTime.push(performance.timeOrigin + performance.now());
};