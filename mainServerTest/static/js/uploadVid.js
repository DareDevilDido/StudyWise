var chosenFile;
let socketID = undefined;

let inputFile; // Define formData globally
let input;

function handleFileSelection() {
    input = document.getElementById('file');
    var chosenFileLabel = document.getElementById('chosen-file');
    chosenFileLabel = document.getElementById('chosen-file');
    chosenFile = input.files[0];
    input.files[0].name = null;
    
    // Check if a file is selected
    if (input.files.length > 0) {
        console.log('Ready to upload video!');
        // Get the first selected file

        chosenFileLabel.textContent = 'Selected File: ' + chosenFile.name;
        chosenFileLabel.style.visibility = 'visible';
    } else {
        // No file selected
        chosenFile = null;
        document.getElementById('chosen-file').textContent = 'No file selected';
        document.getElementById('chosen-file').style.visibility = 'hidden';
    }
}

document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();

    var form = document.getElementById('uploadForm');
    var formData = new FormData(form);

    // Append File type to formData
    formData.append('FileType', 'video');

    var audioCutCheckbox = document.getElementById('audiocut');

    // Fetch the file name
    var fileInput = document.getElementById('file');
    const fileName = fileInput.files[0].name;

    // Check if the checkbox is checked and append the value accordingly
    if (audioCutCheckbox.checked) {
        console.log(`Uploading video: ${fileName}\n`, `audiocut: True`)
    } else {
        console.log(`Uploading video: ${fileName}\n`, `audiocut: False`)
        formData.append('audiocut', 'False'); // Append audiocut = 'false' to formData
    }

    // Establish WebSocket connection
    var socket = io.connect('http://127.0.0.1:5000/');

    socket.on("connect", function() {
        let socketID = socket.id;
        formData.append('socketID', socketID);
        console.log('Socket ID: ', socketID)

        fetch('/upload-file', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to upload file.');
            }
        })
        .then(data => {
            console.log('File uploaded successfully.', data);
            const processedVideo = data.filename;

            fetch('/filename', {
                method: 'POST',
                body: JSON.stringify({ filename: fileName }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    console.log('File name sent to server. \nFile name:', fileName);
                } else {
                    console.error('Failed to send file name to server. \nFile name:', fileName);
                }
            })
            .catch(error => {
                console.error('Error during sending file name:', error);
            });

            socket.on('update', function(data) {
                console.log('Update from server:', data.message);
                var statusElement = document.getElementById('processingStatus');
                statusElement.innerHTML = data.message;

                if (data.message) {
                    var progressWindow = document.getElementById('success-overlay');
                    progressWindow.style.display = 'block';
                }

                if (data.message === 'Processing completed') {
                    statusElement.innerHTML = 'Processing completed, getting info..';
                    setTimeout(function() {
                        window.location.href = `/video-display?file=${encodeURIComponent(processedVideo)}`;
                    }, 2000); // Redirect to display page after 2 seconds
                }
            });
        })
        .catch(error => {
            console.error('Error during file upload:', error);
        });
    });
});


// function confirmFile() {
//     if (chosenFile) {
//         console.log("Selected File Name: ", chosenFile);

//         // Establish WebSocket connection
//         var socket = io.connect('http://127.0.0.1:5000/');

//         socket.on("connect", function() {
//             socketID = socket.id;
//         })

//         var statusElement = document.getElementById('processingStatus');

//         // Listen for 'update' events from the server to get real-time processing updates
//         socket.on('update', function(data) {
//             console.log('Update from server:', data.message);
//             statusElement.innerHTML = data.message; // Update UI

//             if (data.message) {
//                 progressWindow = document.getElementById('success-overlay')
//                 progressWindow.style.display = 'block';
//             }
        
//             // Check if the received message is 'Processing completed'
//             if (data.message === 'Processing completed') {
//                 statusElement.innerHTML = 'Processing completed, getting info';
//                 setTimeout(function() {
//                     window.location.href = `/video-display?file=${encodeURIComponent(chosenFile)}`;
//                 }, 3000); // Redirect to display page after 3 seconds
//             }
//         });

//         // Set up XMLHttpRequest to send the filename to the server
//         var request = new XMLHttpRequest();
//         request.open('POST', 'http://127.0.0.1:5000/generateVideoContent', true);
//         request.setRequestHeader('Content-Type', 'application/json');
//         request.onload = function() {
//             // Handle response from server
//             if (!(request.status >= 200 && request.status < 400)) {
//                 console.log('Server returned an error:', request.status);
//             }
//         };
//         request.onerror = function() {
//             console.log('Request failed to reach the server');
//         };
        
//         // Send the filename as JSON
//         request.send(JSON.stringify({ filename: chosenFile, socketID: socketID }));
//     } else {
//         alert("No file selected");
//     }
// }