let currentsong = new Audio();
let currFolder;
let songs;

// JavaScript function to convert seconds to minutes and seconds
function convertSecondsToMinutesAndSeconds(seconds) {
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = Math.floor(seconds % 60);

    // Formatting minutes and seconds to have leading zeros if necessary
    var minutesStr = (minutes < 10 ? '0' : '') + minutes;
    var secondsStr = (remainingSeconds < 10 ? '0' : '') + remainingSeconds;

    return minutesStr + ':' + secondsStr;
}

// Get all the songs by folder 
async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();


    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")

    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith('.mp3')) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = " "
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `
            
            <li>
            <img class="invert" src="img/music.svg" alt="">
    
            <div class="info">
                <div>${song}</div>
                <div>Iqbal</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg" alt="">
            </div>
    
            
             </li>`;

    }

    // Attach and event linster to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener('click', element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)

        })
    });
    return songs;
}


// Play music funtion Play the songs when we click

const playMusic = (track, pause = false) => {
    currentsong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentsong.play()
        play.src = "img/pause.svg"
    }
    // currentsong.play();

    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "0:00"
    // console.log(currentsong.currentTime + currentsong.duration)
}

// Display function
async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)

    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1 )[0]

            // Get title and meta data of the folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder = "${folder}"  class="card">
            <div class="play">

                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                    fill="none">
                    <path
                        d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                        stroke="currentColor" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                </svg>



            </div>
            <img src="/songs/${folder}/cover.jpeg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }
    // Event listener for the new playlist 
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        // console.log(e)
        e.addEventListener("click", async item => {
            // console.log(item, item.currentTarget.dataset.folder)
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })




}

// Main funtion where all the other function calls other function
async function main() {
    if (!currentsong.src) {
        // In this step we get all the Songs
        await getSongs("songs/ncs");

        // Play first song by default when we press the player
        playMusic(songs[0], true)

        // We get all the songs in the console to check whether we get the song or not
        // console.log(songs)

        // Display all the albums of the page
        displayAlbums();

        // Now attach event listener play, next, and previous

        play.addEventListener("click", () => {
            if (currentsong.paused) {
                currentsong.play()
                play.src = 'img/pause.svg'
            }
            else {
                currentsong.pause();
                play.src = "img/play.svg";
            }
        })

        // For current time update for the running song
        currentsong.addEventListener("timeupdate", () => {
            // duration of current song 
            // console.log(currentsong.currentTime + currentsong.duration)

            document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutesAndSeconds(currentsong.currentTime)} / ${convertSecondsToMinutesAndSeconds(currentsong.duration)}`

            // It will move the cursor forward
            document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"

        })

        document.querySelector(".seekbar").addEventListener("click", e => {
            // It will check how much percentage it will be clicked


            let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
            document.querySelector(".circle").style.left = percent + "%"
            currentsong.currentTime = ((currentsong.duration) * percent) / 100


        })

        document.querySelector(".hamburger").addEventListener("click", () => {
            document.querySelector(".left").style.left = 0
        })

        document.querySelector(".closehamburger").addEventListener("click", () => {
            document.querySelector(".left").style.left = "-120%"
        })

        // Add an event listener to the next button
        next.addEventListener("click", () => {

            // console.log("Next is Clicked");
            let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
            if ((index + 1) <= songs.length - 1) {
                playMusic(songs[index + 1])
            }
        })


        // Add an event listener to the previous button
        previous.addEventListener("click", () => {
            // console.log("Previous is clicked")

            let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
            if ((index - 1) >= 0) {
                playMusic(songs[index - 1])
            }

        })

        // Event listner to incease and ddecrease the volume

        document.querySelector(".range").getElementsByTagName("input")[0].addEventListener('change', (e) => {
            // console.log("Setting Volume Out of ", e, e.target, e.target.value, "/100")
            currentsong.volume = parseInt(e.target.value) / 100;

        })

        // Event lister for the  music playing/pausing
        document.querySelector(".volume").addEventListener("click", e=>{
            console.log(e.target)
            if(e.target.src.includes("img/volume.svg")){
                e.target.src = e.target.src.replace("img/volume.svg","img/mute.svg")
                currentsong.volume = 0;
                document.querySelector(".range").getElementsByTagName("input")[0].value = 0;

            }
            else{
                e.target.src = e.target.src.replace("img/mute.svg","img/volume.svg")
                currentsong.volume = .10;
                document.querySelector(".range").getElementsByTagName("input")[0].value=10;
            }
        })







    }
}

main();

