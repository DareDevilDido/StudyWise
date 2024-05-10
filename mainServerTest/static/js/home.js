let myUserContent;
window.onload = function() {
    // Fetch user name from server
    fetch('http://127.0.0.1:5000/get-user-name-JSON', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            avatar = document.querySelector('.navbar-avatar-frame');
            avatar.style.setProperty('--before-content', `'${data.userName}'`);
        })
        .then(
            fetch('http://127.0.0.1:5000/load-user-content-JSON', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                throw new Error('Network response was not ok');
                }
                return response.json(); // Parse the JSON data
            })
            .then(data => {
                if (typeof data === 'string') {
                    data = JSON.parse(data); // Parse the string if it's not an object
                }

                if (Array.isArray(data)) {
                    myUserContent = data.map(contentItem => ({
                        filename: contentItem.filename,
                        filetype: contentItem.filetype
                    }));
                    if (myUserContent.length > 0) {
                        setUpUserContent();
                        console.log('User content: ', myUserContent);
                    } else {
                        console.log('No content found');
                    }

                } else {
                    console.log('Data is not an array:', data);
                }
            })
            .catch(error => {
                console.error('Error fetching user content:', error);
            })
        )
        .catch(error => {
            console.error('Error fetching Username:', error);
        });

    // Fetch user content JSON from server
    
};

function logOut() {
    fetch('/log-out', {
        method: 'GET'
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = response.url; // Redirect to the login page
        } else {
            console.error('Failed to sign out');
        }
    })
    .catch(error => {
        console.error('Error signing out:', error);
    });
}

function setUpUserContent() {

    let fileName;

    const mainContainer = document.querySelector('.main-container');
    const contentRow = document.createElement('div');
    contentRow.classList.add('content-row');
    mainContainer.appendChild(contentRow);

    myUserContent.forEach((contentItem, index) => {

        const contentColumn = document.createElement('div');
        contentColumn.classList.add('content-column');
        contentRow.appendChild(contentColumn);

        const contentCard = document.createElement('button');
        contentCard.classList.add('content-card');
        contentColumn.appendChild(contentCard);

        const title = document.createElement('div');
        title.classList.add('title');
        title.textContent = contentItem.filename;
        contentCard.appendChild(title);

        const imageContainer = document.createElement('div');
        imageContainer.classList.add('image-container');
        contentCard.appendChild(imageContainer);

        const image1 = document.createElement('img');
        image1.src = "/static/assets/images/flashcards.png";
        image1.alt = "Description 1";
        image1.classList.add('flashcard-img', 'card-img');
        image1.onclick = () => imageClickHandler('Image 1');
        imageContainer.appendChild(image1);

        const image2 = document.createElement('img');
        image2.src = "/static/assets/images/summary.png";
        image2.alt = "Description 2";
        image2.classList.add('summary-img', 'card-img');
        image2.onclick = () => imageClickHandler('Image 2');
        imageContainer.appendChild(image2);

        const image3 = document.createElement('img');
        image3.src = "/static/assets/images/bot.png";
        image3.alt = "Description 3";
        image3.classList.add('bot-img', 'card-img');
        image3.onclick = () => imageClickHandler('Image 3');
        imageContainer.appendChild(image3);

        const type = document.createElement('div');
        type.classList.add('type');

        // If content is document, onclick will call pdf view
        if (contentItem.filetype == 'pdf') {
            contentCard.onclick = () => contentClickHandler(contentItem.filename, 'document');
            type.textContent = 'Document';
        }
        // else (content is video), onclick will call video view
        else {
            contentCard.onclick = () => contentClickHandler(contentItem.filename, 'video');
            type.textContent = 'Video';
        }
        contentCard.appendChild(type);
    });
}


function contentClickHandler(fileName, filetype) {
    // If content is document, fetch its pdf view
    if (filetype == 'document') {
        fetch('http://127.0.0.1:5000/load-document-content', {
                method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        body: JSON.stringify({fileName: fileName})
            })
            .then(response => response.json())
            .then(data => {
                file = data.file;
                summary = data.summary;
                flashcards = data.flashcards;
                MCQ_E = data.MCQ_E;
                MCQ_M = data.MCQ_M;
                MCQ_H = data.MCQ_H;
                console.log('Doc Links: \n', file, summary, flashcards, MCQ_E, MCQ_M, MCQ_H)
            })
            .catch(error => {
                console.error('Error fetching JSON:', error);
            });
            
            alert(`Clicked Content for: ${fileName} ${filetype}`)
            window.location.href = '/pdf-display';
        }
        // If content is video, fetch its video view
        else if (filetype == 'video') {
            fetch('http://127.0.0.1:5000/load-video-content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ fileName: fileName })
            })
            .then(response => response.json())
            .then(data => {
                const { MCQ_E, MCQ_M, MCQ_H, audio, chapters, file, flashcards, summary } = data.data;

                localStorage.setItem('fileName', fileName);
                localStorage.setItem('loadedVideoLink', file);
                localStorage.setItem('loadedVideoAudio', audio);
                localStorage.setItem('loadedVideoSummary', JSON.stringify(summary));
                localStorage.setItem('loadedVideoChapters', JSON.stringify(chapters));
                localStorage.setItem('loadedVideoFlashcards', JSON.stringify(flashcards));
                localStorage.setItem('loadedVideoMCQ_E', JSON.stringify(MCQ_E));
                localStorage.setItem('loadedVideoMCQ_M', JSON.stringify(MCQ_M));
                localStorage.setItem('loadedVideoMCQ_H', JSON.stringify(MCQ_H));

                console.log('Video Link:', localStorage.getItem('loadedVideoLink'));
                console.log('Video Summary:', localStorage.getItem('loadedVideoSummary'));
                console.log('Video Chapters:', localStorage.getItem('loadedVideoChapters'));
                console.log('Video Flashcards:', localStorage.getItem('loadedVideoFlashcards'));
            })
            .then(() => {
                alert(`Clicked Content for: ${fileName}, ${filetype}`);
                window.location.href = `/video-display`;
            })
            .catch(error => {
                console.error('Error fetching Content ALL Data JSON:', error);
            });

        }
    }

function imageClickHandler(image) {
    console.log(`${image} clicked`);
    event.stopPropagation(); // Prevent triggering content's click event
}