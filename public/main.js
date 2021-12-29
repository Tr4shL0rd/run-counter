const update = document.querySelector("#update-button");

update.addEventListener("click", async _ => {
    try {
        const response = await fetch("/runs", {
            method: "put",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                bossname: document.getElementById("name").innerHTML,
                //run: document.getElementById("runInput").value
            })
        })    
        const data = await response.json();
        // console.log(data);
        if (data == "success") {
            window.location.reload();
        }
    } catch (error) {
        console.error(error);
    }
    
});


document.body.addEventListener("keypress", e => {
    console.log(e);
    if (e.code == "Enter" || e.code == "Space") {
        update.click();
    }
})
