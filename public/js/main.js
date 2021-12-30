const update = document.querySelector("#update-button");

function wait(ms) {
    return new Promise(resolve => {
        setTimeout(() => resolve(), ms)
    })
}

function title(str) {
    str = str.toString();
    let words = [];  
    for (let word of str) {
        word = capitalize(word);
        words.push(word);
    }
    return words.join(" ");
}
function capitalize(str) {
    return str.toString()[0].toUpperCase() + str.toString().substring(1, str.toString().length-1);
}


update.addEventListener("click", async _ => {
    try {
        update.classList.add("update-button-loading");
        update.disabled = true;
        const response = await fetch("/runs", {
            method: "put",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                bossname: document.getElementById("name").innerHTML,
            })
        })

        const data = await response.json();

        if (data.error) {
            console.error(data)
            return
        }

        //await wait(2000)
        
        // updates the current run count
        if (data) {
            document.getElementById("runTally").innerText = data.run;
            const runs = document.getElementsByClassName("run");
            for (const run of runs) {
                let runNumber = run.children[0].children[0];
                const [bossName, bossRun] = runNumber.innerText.split(":").map(elem => elem.trim());
                if (bossName == data.bossname) {
                    run.removeAttribute("onclick")
                    run.setAttribute("onclick",`load('${bossName}', ${data.run})`)
                    runNumber.innerText = `${bossName}: ${data.run}`;
                }
            }
        }
    } catch (error) {
        console.error(error);
    }
    update.classList.remove("update-button-loading");
    update.disabled = false;
    
});


document.body.addEventListener("keypress", e => {
    if (e.code == "Enter" || e.code == "Space") {
        update.click();
    }
})
