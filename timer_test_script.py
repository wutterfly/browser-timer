# imports
import webbrowser # to open a webbrowser
import time # to get local timestamps
import mouse # to simulate mouse click


# Variables/Constants
url = 'https://wutterfly.com/timer-precision/extern_input/same_origin.html'
iterations = 10
time_to_sleep_sec = 0.1 # 100ms
results = [0.0] * iterations # preallocate vector (?)
results_raw = [0.0] * iterations # preallocate vector (?)

if __name__ == "__main__":
    webbrowser.open(url) # open webpage in browser
    time.sleep(3) # wait for user to be ready (hover with mouse over button)


    # take timestamps in browser
    for i in range(iterations):  
        # click once (on the button to take a timestamp inside the browser)
        mouse.click('left') # click

        # get local timestamp
        first = time.time() 

        # sleep for seconds
        time.sleep(time_to_sleep_sec)

        # get second local timestamp
        second = time.time()

        # save time it took for one iteration (should be time slept)
        results[i] = (second - first - time_to_sleep_sec)  * 1000 # to millisecond
        results_raw[i] = (second - first) * 1000 # to millisecond

    print("Time Overslept:\n", results)
    print("Time Slept(Raw):\n", results_raw)