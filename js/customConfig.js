let getConfiguration = function () {
    let percent = 0;
    for (let i = 0; i < 7; i++) {
        percent += +document.getElementById(`chance-${i + 1}`).value;
    }
    if (percent !== 100) {
        window.alert("total chance must be equal to 100!");
        return;
    }
    let s = document.getElementById("start-btn");
    s.style.display = "none";
    let t = document.getElementsByClassName("table")[0];
    t.style.display = "none";
    let data = {};
    for (let i = 0; i < 7; i++) {
        let a = document.getElementById(`active-${i + 1}`);
        if (a.checked) {
            data[i + 1] = {
                "percentage": +document.getElementById(`chance-${i + 1}`).value,
                "consecutive": +document.getElementById(`consecutive-${i + 1}`).value,
                "special": i === 6 ? true : false
            };
        }
    }
    start(data);
};

let showTable = function () {
    let s = document.getElementById("start-btn");
    s.style.display = "block";
    let t = document.getElementsByClassName("table")[0];
    t.style.display = "inline-table";
    let j = document.getElementById("json-btn");
    j.style.display = "none";
    let c = document.getElementById("custom-btn");
    c.style.display = "none";
};