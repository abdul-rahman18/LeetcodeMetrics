document.addEventListener("DOMContentLoaded",()=>{
    
    const usernameInput = document.getElementById("user-input");
    const search = document.getElementById("search-button");
    const stats = document.querySelector(".stats");
    const easyCircle = document.querySelector(".easy-progress");
    const mediumCircle = document.querySelector(".medium-progress");
    const hardCircle = document.querySelector(".hard-progress");
    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");
    const cardStats = document.querySelector(".stats-card");


    function validateUsername(username)
    {
        if(username.trim() === "")
        {
            alert("Username should not be empty.");
            return false;
        }
        const regex = /^[a-zA-Z0-9_-]{1,15}$/;
        const isMatching = regex.test(username);
        if(!isMatching) alert("Invalid Username");
        return isMatching;
    }


    async function fetchUserDetails(username) {

        try{
            search.textContent = "Searching...";
            search.disabled = true;

            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

        const targetUrl = 'https://leetcode.com/graphql/';
        const header = new Headers();
        header.append("content-type","application/json");

        const graphql = JSON.stringify({
                query: "\n    query userSessionProgress($username: String!) {\n  allQuestionsCount {\n    difficulty\n    count\n  }\n  matchedUser(username: $username) {\n    submitStats {\n      acSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n      totalSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n    }\n  }\n}\n    ",
                variables: { "username": `${username}` }
        });

        const requestOptions = {
            method: "POST",
            headers: header,
            body: graphql,
            redirect: "follow"
        };

        const response = await fetch((proxyUrl+targetUrl),requestOptions);
            if(!response.ok){
                throw new Error("Unable to fetch the user details");
            }

            const parsedData = await response.json();
            console.log(parsedData);

            displayData(parsedData);
        }
        catch(err){
            stats.innerHTML = 
                `<p>No data Found</p>`;
        }
        finally{
            search.textContent = "Search";
            search.disabled = false;
        }
    }

    function updateProgress(solved,total,label,circle)
    {
        const pd = (solved/total)*100;
        circle.style.setProperty("--progress-degree",`${pd}%`);
        label.textContent = `${solved}/${total}`;


    }


    function displayData(parsedData)
    {
        const totalQuestions = parsedData.data.allQuestionsCount[0].count;
        const totalEasyQuestions = parsedData.data.allQuestionsCount[1].count;
        const totalMediumQuestions = parsedData.data.allQuestionsCount[2].count;
        const totalHardQuestions = parsedData.data.allQuestionsCount[3].count;

        const solvedTotalQuestions = parsedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const solvedEasyTotalQuestions = parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const solvedMediumTotalQuestions = parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const solvedHardTotalQuestions = parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;

        updateProgress(solvedEasyTotalQuestions,totalEasyQuestions,easyLabel,easyCircle);
        updateProgress(solvedMediumTotalQuestions,totalMediumQuestions,mediumLabel,mediumCircle);
        updateProgress(solvedHardTotalQuestions,totalHardQuestions,hardLabel,hardCircle);



        const cardsData = [
        {label:"Overall Problems",value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[0].count},
        {label:"Overall Easy Submissions",value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[1].submissions},
        {label:"Overall Medium Submissions",value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[2].submissions},
        {label:"Overall Hard Submissions",value:parsedData.data.matchedUser.submitStats.totalSubmissionNum[3].submissions}
        ];

        console.log("CardData : " , cardsData);

        cardStats.innerHTML = cardsData.map(
            data => {
                return `
                    <div class="card">
                    <h4>${data.label}</h4>
                    <p>${data.value}</p>
                    </div>
                `
            }
        ).join("");
    }

    search.addEventListener("click",()=>{
        const username = usernameInput.value;
        if(validateUsername(username))
        {
            fetchUserDetails(username);
        }
    });

});
