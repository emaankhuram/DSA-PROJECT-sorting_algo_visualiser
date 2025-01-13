document.getElementById("runButton").addEventListener("click", () => {
    const inputArray = document.getElementById("inputArray").value.trim();
    const algorithm = document.getElementById("sortingAlgorithm").value;
    const outputResult = document.getElementById("outputResult");
    const visualizationContainer = document.getElementById("visualizationContainer");

    if (!inputArray) {
        outputResult.textContent = "Please enter valid input data.";
        return;
    }

    let array;
    try {
        array = inputArray.split(" ").map(Number);
        if (array.some(isNaN)) {
            throw new Error();
        }
    } catch {
        outputResult.textContent = "Invalid input data. Please enter integers.";
        return;
    }

    visualizationContainer.innerHTML = "";
    outputResult.textContent = ""; // Clear the output result

    // Create blocks for visualization
    array.forEach((value, index) => {
        const block = document.createElement("div");
        block.classList.add("block");
        block.style.transform = `translateX(${index * 50}px)`; 
        block.style.height = `${value * 4}px`;
        block.textContent = value;
        visualizationContainer.appendChild(block);
    });

    async function visualizeSorting(sortFunction) {
        const blocks = Array.from(visualizationContainer.children);

        for (let step of sortFunction(array)) {
            const { arrayState, comparedIndices, swappedIndices } = step;

            // Highlight compared blocks
            comparedIndices.forEach((i) => {
                blocks[i].classList.add("comparison");
            });

            await new Promise((resolve) => setTimeout(resolve, visualizationSpeed)); // Use dynamic speed

            // Reset previous highlights
            blocks.forEach((block) => block.classList.remove("comparison", "swap"));

            // Update array state visually
            arrayState.forEach((value, index) => {
                const block = blocks[index];
                block.textContent = value;
                block.style.transform = `translateX(${index * 50}px)`; // Update position
                block.style.height = `${value * 4}px`;
            });

            // Highlight swapped blocks
            swappedIndices.forEach((i) => {
                blocks[i].classList.add("swap");
            });

            await new Promise((resolve) => setTimeout(resolve, visualizationSpeed)); // Use dynamic speed
        }

        outputResult.textContent = `Sorted Output: ${array.join(", ")}`;
    }

    const algorithms = {
        "Bubble Sort": function* (arr) {
            for (let i = 0; i < arr.length; i++) {
                for (let j = 0; j < arr.length - i - 1; j++) {
                    const comparedIndices = [j, j + 1];
                    let swappedIndices = [];

                    if (arr[j] > arr[j + 1]) {
                        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                        swappedIndices = [j, j + 1];
                    }

                    yield { arrayState: [...arr], comparedIndices, swappedIndices };
                }
            }
        },
        "Selection Sort": function* (arr) {
            for (let i = 0; i < arr.length; i++) {
                let minIndex = i;
                for (let j = i + 1; j < arr.length; j++) {
                    const comparedIndices = [minIndex, j];
                    if (arr[j] < arr[minIndex]) {
                        minIndex = j;
                    }
                    yield { arrayState: [...arr], comparedIndices, swappedIndices: [] };
                }

                if (minIndex !== i) {
                    [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
                    yield {
                        arrayState: [...arr],
                        comparedIndices: [i, minIndex],
                        swappedIndices: [i, minIndex],
                    };
                }
            }
        },
        "Insertion Sort": function* (arr) {
            for (let i = 1; i < arr.length; i++) {
                let key = arr[i];
                let j = i - 1;

                while (j >= 0 && arr[j] > key) {
                    arr[j + 1] = arr[j];
                    yield { arrayState: [...arr], comparedIndices: [j, j + 1], swappedIndices: [] };
                    j--;
                }
                arr[j + 1] = key;
                yield { arrayState: [...arr], comparedIndices: [j + 1], swappedIndices: [] };
            }
        },
        "Merge Sort": function* (arr) {
            function* mergeSortHelper(arr, temp, left, right) {
                if (left >= right) return;
        
                const mid = Math.floor((left + right) / 2);
                yield* mergeSortHelper(arr, temp, left, mid);
                yield* mergeSortHelper(arr, temp, mid + 1, right);
        
                // Copy elements to temp array first
                for (let i = left; i <= right; i++) {
                    temp[i] = arr[i];
                }
        
                let i = left, j = mid + 1, k = left;
        
                while (i <= mid && j <= right) {
                    const comparedIndices = [i, j];
                    if (temp[i] <= temp[j]) {
                        arr[k] = temp[i];
                        i++;
                    } else {
                        arr[k] = temp[j];
                        j++;
                    }
                    k++;
                    yield { arrayState: [...arr], comparedIndices, swappedIndices: [] };
                }
        
                // Copy remaining elements
                while (i <= mid) {
                    arr[k] = temp[i];
                    yield { arrayState: [...arr], comparedIndices: [i], swappedIndices: [] };
                    i++;
                    k++;
                }
        
                while (j <= right) {
                    arr[k] = temp[j];
                    yield { arrayState: [...arr], comparedIndices: [j], swappedIndices: [] };
                    j++;
                    k++;
                }
            }
        
            const temp = Array(arr.length);
            yield* mergeSortHelper(arr, temp, 0, arr.length - 1);
        },
        "Quick Sort": function* (arr) {
            function* quickSort(arr, low, high) {
                if (low < high) {
                    const pivotIndex = yield* partition(arr, low, high);
                    yield* quickSort(arr, low, pivotIndex - 1);
                    yield* quickSort(arr, pivotIndex + 1, high);
                }
            }

            function* partition(arr, low, high) {
                const pivot = arr[high];
                let i = low - 1;

                for (let j = low; j < high; j++) {
                    const comparedIndices = [j, high];
                    if (arr[j] < pivot) {
                        i++;
                        [arr[i], arr[j]] = [arr[j], arr[i]];
                        yield { arrayState: [...arr], comparedIndices, swappedIndices: [i, j] };
                    } else {
                        yield { arrayState: [...arr], comparedIndices, swappedIndices: [] };
                    }
                }
                [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
                yield { arrayState: [...arr], comparedIndices: [i + 1, high], swappedIndices: [i + 1, high] };

                return i + 1;
            }

            yield* quickSort(arr, 0, arr.length - 1);
        },
        "Heap Sort": function* (arr) {
            function* heapify(arr, n, i) {
                let largest = i;
                const left = 2 * i + 1;
                const right = 2 * i + 2;
    
                const comparedIndices = [];
                if (left < n) comparedIndices.push(left);
                if (right < n) comparedIndices.push(right);
    
                if (left < n && arr[left] > arr[largest]) {
                    largest = left;
                }
                if (right < n && arr[right] > arr[largest]) {
                    largest = right;
                }
    
                yield { arrayState: [...arr], comparedIndices, swappedIndices: [] };
    
                if (largest !== i) {
                    [arr[i], arr[largest]] = [arr[largest], arr[i]];
                    yield { arrayState: [...arr], comparedIndices, swappedIndices: [i, largest] };
                    yield* heapify(arr, n, largest);
                }
            }
    
            for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
                yield* heapify(arr, arr.length, i);
            }
    
            for (let i = arr.length - 1; i > 0; i--) {
                [arr[0], arr[i]] = [arr[i], arr[0]];
                yield { arrayState: [...arr], comparedIndices: [0, i], swappedIndices: [0, i] };
                yield* heapify(arr, i, 0);
                }
            },
            "Counting Sort": function* (arr) {  
    // Find the maximum element in the array  
    const max = Math.max(...arr);  
    yield { arrayState: [...arr], comparedIndices: [], swappedIndices: [], step: "Find Max" };  

    // Create an array of size (max + 1) and initialize it with 0  
    const count = new Array(max + 1).fill(0);  
    yield { arrayState: count, comparedIndices: [], swappedIndices: [], step: "Create Count Array" };  

    // Count the occurrences of each element in the input array  
    for (let i = 0; i < arr.length; i++) {  
        count[arr[i]]++;  
        yield { arrayState: [...count], comparedIndices: [i], swappedIndices: [], step: "Count Occurrences" };  
    }  

    // Calculate the cumulative count  
    for (let i = 1; i < count.length; i++) {  
        count[i] += count[i - 1];  
        yield { arrayState: [...count], comparedIndices: [i], swappedIndices: [], step: "Calculate Cumulative Count" };  
    }  
 
    const output = new Array(arr.length).fill(0);  
    for (let i = arr.length - 1; i >= 0; i--) {  
        output[count[arr[i]] - 1] = arr[i];  
        count[arr[i]]--;  
        yield { arrayState: [...output], comparedIndices: [i], swappedIndices: [], step: "Build Output Array" };  
    }  

    for (let i = 0; i < arr.length; i++) {  
        arr[i] = output[i];  
        yield { arrayState: [...arr], comparedIndices: [i], swappedIndices: [], step: "Copy to Original Array" };  
    }  
}, 
            "Radix Sort": function* (arr) {
            const max = Math.max(...arr);
            let exp = 1;

            function* countingSortByDigit(arr, exp) {
                const output = new Array(arr.length).fill(0);
                const count = new Array(10).fill(0);

                // Count occurrences based on the current digit
                for (let i = 0; i < arr.length; i++) {
                    const digit = Math.floor(arr[i] / exp) % 10;
                    count[digit]++;
                    yield { arrayState: [...arr], comparedIndices: [i], swappedIndices: [] };
                }

                // Cumulative count
                for (let i = 1; i < 10; i++) {
                    count[i] += count[i - 1];
                }

                // Build output array
                for (let i = arr.length - 1; i >= 0; i--) {
                    const digit = Math.floor(arr[i] / exp) % 10;
                    output[count[digit] - 1] = arr[i];
                    count[digit]--;
                    yield { arrayState: [...output], comparedIndices: [i], swappedIndices: [] };
                }

                // Copy to original array
                for (let i = 0; i < arr.length; i++) {
                    arr[i] = output[i];
                    yield { arrayState: [...arr], comparedIndices: [i], swappedIndices: [] };
                }
            }

            // Perform counting sort for each digit
            while (Math.floor(max / exp) > 0) {
                yield* countingSortByDigit(arr, exp);
                exp *= 10;
            }
        },
    };


    if (algorithms[algorithm]) {
        visualizeSorting(algorithms[algorithm]);
    } else {
        outputResult.textContent = "Algorithm not implemented.";
    }
});

// Adjust slider speed dynamically
let visualizationSpeed = 1000; // Default speed in milliseconds (higher = slower)
document.getElementById("speedSlider").addEventListener("input", (event) => {
    const sliderValue = parseInt(event.target.value);
    visualizationSpeed = 1050 - sliderValue; // Reverse the logic (higher slider value = faster speed)
    document.getElementById("speedLabel").textContent = `${sliderValue}ms`;
});
