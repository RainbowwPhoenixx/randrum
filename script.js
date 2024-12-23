var bpm = 60;
let last_anim;
let beat_start_pos = 0;

let measures_on_screen = 4;

window.onload = init;
function init() {
    setup_measures()
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

    width = 100 / measures_on_screen;
    // Re-create them
    for (let i = 0; i < measures_on_screen + 1; i++) {
        let pos = compute_ith_offset(i)
        beats.innerHTML += `
        <div class="beatgroup" id="beatgroup${i}" style="left: ${pos}vw, width=${width}%">
            <img class="img accent" src="assets/20241216_drumprompt_accent1.png">
            <img class="img accent" src="assets/20241216_drumprompt_accent2.png">
            <img class="img accent" src="assets/20241216_drumprompt_accent3.png">
            <img class="img accent" src="assets/20241216_drumprompt_accent4.png">
            <img class="img" src="assets/20241216_drumprompt_quarternotes.png">
        </div>`
    }
}

function updateBPM(value) {
    bpm = value
}

function step(ts) {
    let groups = document.getElementsByClassName("beatgroup");

    if (last_anim === undefined) {
        last_anim = ts;
    }
    const elapsed = ts - last_anim;

    let bps = bpm / 60;
    beat_start_pos = beat_start_pos - bps * elapsed / 100;
    if (beat_start_pos < -100 / measures_on_screen) {
        // Move the notes
        for (var i = 0; i < groups.length - 1; i++) {
            groups[i].innerHTML = groups[i + 1].innerHTML
        }

        // generate new notes
        let accents = groups[groups.length - 1].getElementsByClassName("accent");
        for (let accent of accents) {
            if (Math.random() < 0.5 ) {
                accent.style["display"] = "none"
            } else {
                accent.style["display"] = "block"
            }
        }

        // Loop the pos
        beat_start_pos = beat_start_pos % (100 / measures_on_screen)
    }

    for (var i = 0; i < groups.length; i++) {
        let image = groups[i]
        image.style["left"] = compute_ith_offset(i) + beat_start_pos + "vw";
    }

    last_anim = ts;
    requestAnimationFrame(step)
}

requestAnimationFrame(step)
