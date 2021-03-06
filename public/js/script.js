async function deleteRun(namePressed) {
    let choice = confirm(`delete ${namePressed}?`);
    if (!choice) {
        return;
    }
    try {
        const response = await fetch("/runs", {
            method: "delete",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                bossname: namePressed,
            }),
        });
        const data = await response.json();
        console.log(data);
        if (data == "deleted") {
            window.location.reload();
        }
    } catch (error) {
        console.error(error);
    }
}

function load(namePressed, runPressed) {
    // console.log(namePressed, runPressed)
    document.title = `Run-Counter | ${namePressed}`;
    runPressed = parseInt(runPressed);
    let currentRun = document.getElementById("runTally");
    let currentName = document.getElementById("name");

    // TESTING
    let sideBarCurrentRun = document.getElementsByClassName("loadBoss");
    let nonUpdatedRun = sideBarCurrentRun[0].innerHTML.split(":")[1].trim();
    nonUpdatedRun.innerHTML = runPressed;
    // TESTING \\

    currentRun.innerHTML = runPressed;   //updates the run number without needing to refresh the page
    currentName.innerHTML = namePressed; 
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("bossname", namePressed);
    //window.location.search = searchParams.toString();
    var newRelativePathQuery =
        window.location.pathname + "?" + searchParams.toString();
    history.pushState(null, "", newRelativePathQuery);
}
