#include <cpprest/http_listener.h>
#include <cpprest/json.h>
#include <iostream>
#include <stdexcept>
#include <chrono>
using namespace std;

void swap(int* a, int* b) {
    int t = *a;
    *a = *b;
    *b = t;
}

double bubbleSort(int arr[], int n) {
    auto start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(&arr[j], &arr[j + 1]);
            }
        }
    }
    auto end = std::chrono::high_resolution_clock::now();
    return std::chrono::duration<double>(end - start).count();
}

double selectionSort(int arr[], int n) {
    auto start = std::chrono::high_resolution_clock::now();
    for (int i = 0; i < n - 1; i++) {
        int min = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[min]) {
                min = j;
            }
        }
        swap(&arr[min], &arr[i]);
    }
    auto end = std::chrono::high_resolution_clock::now();
    return std::chrono::duration<double>(end - start).count();
}

double insertionSort(int arr[], int n) {
    auto start = std::chrono::high_resolution_clock::now();
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        arr[j + 1] = key;
    }
    auto end = std::chrono::high_resolution_clock::now();
    return std::chrono::duration<double>(end - start).count();
}

void merge(int arr[], int left, int mid, int right) {
    int n1 = mid - left + 1;
    int n2 = right - mid;
    int* L = new int[n1];
    int* R = new int[n2];
    for (int i = 0; i < n1; i++) L[i] = arr[left + i];
    for (int j = 0; j < n2; j++) R[j] = arr[mid + 1 + j];
    int i = 0, j = 0, k = left;
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) {
            arr[k] = L[i];
            i++;
        } else {
            arr[k] = R[j];
            j++;
        }
        k++;
    }
    while (i < n1) {
        arr[k] = L[i];
        i++;
        k++;
    }
    while (j < n2) {
        arr[k] = R[j];
        j++;
        k++;
    }
    delete[] L;
    delete[] R;
}

void mergeSort(int arr[], int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}

double mergeSortAndGetTime(int arr[], int n) {
    auto start = std::chrono::high_resolution_clock::now();
    mergeSort(arr, 0, n - 1);
    auto end = std::chrono::high_resolution_clock::now();
    return std::chrono::duration<double>(end - start).count();
}

int partition(int arr[], int low, int high) {
    int pivot = arr[high];
    int i = (low - 1);
    for (int j = low; j <= high - 1; j++) {
        if (arr[j] < pivot) {
            i++;
            swap(&arr[i], &arr[j]);
        }
    }
    swap(&arr[i + 1], &arr[high]);
    return (i + 1);
}

void quickSort(int arr[], int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

double quickSortAndGetTime(int arr[], int n) {
    auto start = std::chrono::high_resolution_clock::now();
    quickSort(arr, 0, n - 1);
    auto end = std::chrono::high_resolution_clock::now();
    return std::chrono::duration<double>(end - start).count();
}

void heapify(int arr[], int n, int i) {
    int largest = i;
    int l = 2 * i + 1;
    int r = 2 * i + 2;
    if (l < n && arr[l] > arr[largest])
        largest = l;
    if (r < n && arr[r] > arr[largest])
        largest = r;
    if (largest != i) {
        swap(&arr[i], &arr[largest]);
        heapify(arr, n, largest);
    }
}

double heapSort(int arr[], int n) {
    auto start = std::chrono::high_resolution_clock::now();
    for (int i = n / 2 - 1; i >= 0; i--)
        heapify(arr, n, i);
    for (int i = n - 1; i > 0; i--) {
        swap(&arr[0], &arr[i]);
        heapify(arr, i, 0);
    }
    auto end = std::chrono::high_resolution_clock::now();
    return std::chrono::duration<double>(end - start).count();
}

double countingSort(int arr[], int n) {
    auto start = std::chrono::high_resolution_clock::now();
    int max = *max_element(arr, arr + n);
    int* count = new int[max + 1]();
    int* output = new int[n];
    for (int i = 0; i < n; i++) count[arr[i]]++;
    for (int i = 1; i <= max; i++) count[i] += count[i - 1];
    for (int i = n - 1; i >= 0; i--) output[--count[arr[i]]] = arr[i];
    for (int i = 0; i < n; i++) arr[i] = output[i];
    delete[] count;
    delete[] output;
    auto end = std::chrono::high_resolution_clock::now();
    return std::chrono::duration<double>(end - start).count();
}

double radixSort(int arr[], int n) {
    auto start = std::chrono::high_resolution_clock::now();
    int max = *max_element(arr, arr + n);
    for (int exp = 1; max / exp > 0; exp *= 10) {
        int* output = new int[n];
        int count[10] = {0};
        for (int i = 0; i < n; i++) count[(arr[i] / exp) % 10]++;
        for (int i = 1; i < 10; i++) count[i] += count[i - 1];
        for (int i = n - 1; i >= 0; i--) output[--count[(arr[i] / exp) % 10]] = arr[i];
        for (int i = 0; i < n; i++) arr[i] = output[i];
        delete[] output;
    }
    auto end = std::chrono::high_resolution_clock::now();
    return std::chrono::duration<double>(end - start).count();
}
void handle_post(web::http::http_request request)
{
    request.extract_json().then([](web::json::value body) {
        auto algorithm = body[U("algorithm")].as_string();
        auto numbers = body[U("numbers")].as_array();
        
        int n = numbers.size();
        int* arr = new int[n];
        for (int i = 0; i < n; i++) {
            arr[i] = numbers[i].as_integer();
        }

        double time;
        if (algorithm == U("bubble")) {
            time = bubbleSort(arr, n);
        } else if (algorithm == U("selection")) {
            time = selectionSort(arr, n);
        } else if (algorithm == U("insertion")) {
            time = insertionSort(arr, n);
        } else if (algorithm == U("merge")) {
            time = mergeSortAndGetTime(arr, n);
        } else if (algorithm == U("quick")) {
            time = quickSortAndGetTime(arr, n);
        } else if (algorithm == U("heap")) {
            time = heapSort(arr, n);
        } else if (algorithm == U("counting")) {
            time = countingSort(arr, n);
        } else {
            delete[] arr;
            throw std::runtime_error("Unknown algorithm");
        }

        web::json::value response;
        response[U("time")] = time;
        web::json::value sorted_array = web::json::value::array();
        for (int i = 0; i < n; i++) {
            sorted_array[i] = arr[i];
        }
        response[U("sorted")] = sorted_array;
        
        request.reply(web::http::status_codes::OK, response);
        delete[] arr;
    });
}

int main() {
    web::http::experimental::listener::http_listener listener(U("http://localhost:3000/sort"));
    listener.support(web::http::methods::POST, handle_post);
    
    try {
        listener.open().wait();
        std::cout << "Listening for requests at http://localhost:3000/sort" << std::endl;
        
        while (true);
    }
    catch (std::exception const & e) {
        std::cout << e.what() << std::endl;
    }

    return 0;
}