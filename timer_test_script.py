# imports
import webbrowser
import time
import mouse


# Variables/Constants
url = 'http://localhost/timer-precision/extern_input/same_origin.html'
iterations = 10
time_to_sleep_sec = 0.1
results = [0.0] * iterations # preallocate vector (?)
results_raw = [0.0] * iterations # preallocate vector (?)

if __name__ == "__main__":
    webbrowser.open(url) # open webpage in browser
    time.sleep(3) # wait for user to be ready



    for i in range(iterations):  
        # sleep for seconds
        first = time.time() 
        time.sleep(time_to_sleep_sec)
        second = time.time()
        mouse.click('left') # click

        # save time it took for one iteration (should approx. be time slept)
        results[i] = (second - first - time_to_sleep_sec ) * 1000
        results_raw[i] = (second - first) * 1000

    print(results)
    print(results_raw)