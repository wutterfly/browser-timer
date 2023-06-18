window.addEventListener("load", () => {


    generate_stress().then(() => { })
})

async function generate_stress() {
    while (true) {
        // generate array with promises
        let promises = []

        for (i = 0; i < 5; i++) {
           
                promises.push(
                    // every 100 milliseconds, try to fetch
                    resolveTimer(100).then(() => {
                        fetch("/timer-precision/with-stress-1/same_origin.html")
                    })
                )
         
        }

        //await fetch("/timer-precision");
        // await all promises
        await Promise.allSettled(promises);
    }
}

function resolveTimer(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}