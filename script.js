let last_anim;
let beat_start_pos = 0;

// Maybe future config options
let measures_on_screen = 4;

// Config options
var running = true;
var bpm = 60;
var min_accents_per_measure = 1;
var max_accents_per_measure = 3;
var min_doubles_per_measure = 1;
var max_doubles_per_measure = 3;

// Setup stuff
window.onload = init;
function init() {
    setup_measures()
    requestAnimationFrame(step)

    document.getElementById("startstop").onclick = toggleRunning;
}

function compute_ith_offset(i) {
    return i * 100 / measures_on_screen
}

function setup_measures() {
    // Clear beats
    const beats = document.getElementById("rolling_beats");
    while (beats.firstChild) {
        beats.removeChild(beats.lastChild);
    }

    beats.innerHTML += '<img class="needle" src="assets/20241217_drumprompt_needle.png" draggable="false">'

    width = 100 / measures_on_screen;
    // Re-create them
    for (let i = 0; i < measures_on_screen + 1; i++) {
        let pos = compute_ith_offset(i)
        beats.innerHTML += `
        <div class="beatgroup" id="beatgroup${i}" style="left: ${pos}vw, width=${width}%">
            <img class="img beats" src="assets/20241216_drumprompt_quarternotes.png">
            <img class="img accent" src="assets/20241216_drumprompt_accent1.png" draggable="false">
            <img class="img accent" src="assets/20241216_drumprompt_accent2.png" draggable="false">
            <img class="img accent" src="assets/20241216_drumprompt_accent3.png" draggable="false">
            <img class="img accent" src="assets/20241216_drumprompt_accent4.png" draggable="false">
            <img class="img double" src="assets/20241216_drumprompt_double1.png" draggable="false">
            <img class="img double" src="assets/20241216_drumprompt_double2.png" draggable="false">
            <img class="img double" src="assets/20241216_drumprompt_double3.png" draggable="false">
            <img class="img double" src="assets/20241216_drumprompt_double4.png" draggable="false">
        </div>`
    }
}

// Update functions called by html elements
function toggleRunning() {
    let button = document.getElementById("startstop");
    running = !running
    if (running) {
        button.innerHTML = '<img src="assets/20241217_drumprompt_stop.png"></img>'
        last_anim = undefined
        requestAnimationFrame(step)
    } else {
        button.innerHTML = '<img src="assets/20241217_drumprompt_start.png"></img>'
    }
}
function updateBPM(value) {
    let v = Number(value)
    bpm = v
    document.getElementById("tempo_display").innerText = value
}
function updateMinAccents(value) {
    let v = Number(value)
    if (v > max_accents_per_measure) {
        v = max_accents_per_measure
        document.getElementById("min_accent_slider").value = v
    }
    min_accents_per_measure = v
    document.getElementById("min_accent_display").innerText = v
}
function updateMaxAccents(value) {
    let v = Number(value)
    if (v < min_accents_per_measure) {
        v = min_accents_per_measure
        document.getElementById("max_accent_slider").value = v
    }
    max_accents_per_measure = v
    document.getElementById("max_accent_display").innerText = v
}
function updateMinDoubles(value) {
    let v = Number(value)
    if (v > max_doubles_per_measure) {
        v = max_doubles_per_measure
        document.getElementById("min_double_slider").value = v
    }
    min_doubles_per_measure = v
    document.getElementById("min_double_display").innerText = v
}
function updateMaxDoubles(value) {
    let v = Number(value)
    if (v < min_doubles_per_measure) {
        v = min_doubles_per_measure
        document.getElementById("max_double_slider").value = v
    }
    max_doubles_per_measure = v
    document.getElementById("max_double_display").innerText = v
}

// Scrolling animation
function step(ts) {
    let groups = document.getElementsByClassName("beatgroup");

    if (last_anim === undefined) {
        last_anim = ts;
    }
    const elapsed_seconds = (ts - last_anim) / 1000;
    last_anim = ts;

    let measures_per_s = bpm / 4 / 60;
    let measures_to_move = measures_per_s * elapsed_seconds;
    let vw_to_move = measures_to_move * 100 / measures_on_screen;
    beat_start_pos = beat_start_pos - vw_to_move;
    if (beat_start_pos < -100 / measures_on_screen) {
        // Move the notes
        for (var i = 0; i < groups.length - 1; i++) {
            groups[i].innerHTML = groups[i + 1].innerHTML
        }

        // generate new notes
        let accents_elems = groups[groups.length - 1].getElementsByClassName("accent");
        let accents = generateAccents();
        for (let i = 0; i < 4; i++) {
            if (accents[i]) {
                accents_elems[i].style["display"] = "block"
            } else {
                accents_elems[i].style["display"] = "none"
            }
        }

        let doubles_elems = groups[groups.length - 1].getElementsByClassName("double");
        let doubles = generateDoubles();
        for (let i = 0; i < 4; i++) {
            if (doubles[i]) {
                doubles_elems[i].style["display"] = "block"
            } else {
                doubles_elems[i].style["display"] = "none"
            }
        }

        // Loop the pos
        beat_start_pos = beat_start_pos % (100 / measures_on_screen)
    }

    for (var i = 0; i < groups.length; i++) {
        let image = groups[i]
        image.style["left"] = compute_ith_offset(i) + beat_start_pos + "vw";
    }

    if (running) {
        requestAnimationFrame(step)
    }
}

// Returns a list of 4 bools indicating the presence of an accent
function generateAccents() {
    return generateFourRandoms(min_accents_per_measure, max_accents_per_measure)
}

// Returns a list of 4 bools indicating the presence of a double
function generateDoubles() {
    return generateFourRandoms(min_doubles_per_measure, max_doubles_per_measure)
}

function generateFourRandoms(min, max) {
    let accents = [false, false, false, false]

    let numAccents = getRandomInt(min, max + 1)

    // Set the asked number of accents
    for (let i = 0; i < numAccents; i++) {
        let set = false;
        while (!set) {
            idx = getRandomInt(0, 4)
            if (!accents[idx]) {
                set = true
                accents[idx] = true
            }
        }
    }

    return accents
}

function getRandomInt(min, max) {
    return Math.floor(min + Math.random() * (max - min))
}
