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
        console.log('Ready to upload document!');
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

// Establish WebSocket connection
var socket = io.connect(`http://127.0.0.1:5000/`);

socket.on("connect", function() {
    let socketID = socket.id;
    formData.append('socketID', socketID);
    console.log('Socket ID: ', socketID)
});

document.addEventListener('DOMContentLoaded', function() {

    var processedDoc;

    // Server Update Listener
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
                window.location.href = `/pdf-display?fileName=${encodeURIComponent(processedDoc)}`;
            }, 2000); // Redirect to display page after 2 seconds
        }
    });

    document.getElementById('uploadForm').addEventListener('submit', function(e) {
        e.preventDefault();

        var form = document.getElementById('uploadForm');
        var formData = new FormData(form);

        // Append File type to formData
        formData.append('FileType', 'document');

        // Fetch the file name
        var fileInput = document.getElementById('file');
        const fileName = fileInput.files[0].name;

        console.log(`Uploading document: ${fileName}\n`)

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
            processedDoc = data.filename;
    
            fetch('/filename', {
                method: 'POST',
                body: JSON.stringify({ filename: fileName }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    console.log('The file name below was sent to server. \nFile name:', fileName);
                } else {
                    console.error('Failed to send file name to server. \nFile name:', fileName);
                }
            })
            .catch(error => {
                console.error('Error during sending file name:', error);
            });
        })
        .catch(error => {
            console.error('Error during file upload:', error);
        });
    });
})