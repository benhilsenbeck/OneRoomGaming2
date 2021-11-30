import readCookie from './ReadCookie'
import { ProgressBar } from 'react-bootstrap';
import "../static/css/Dashboard.scss"
const images = importAll(require.context('../static/Images/LeagueAssets/dragontail-10.10.5/img/champion/tiles/', false, /\.jpg/));


function importAll(r) {
    let images = {};
    r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
    return images;
}

function createGameBoxes() {
    
    function hideShowElement(e) {
        var elementClass = null
        var contentBox = null
        var elementClassArray = null
        var contentElement = null
        console.log(e.target.className)
        if (e.target.className === "championImages" || e.target.className === "personalBDM" || e.target.className === "playerKDA" || e.target.className === "progress") {
            elementClass = e.target.parentNode.className
            elementClassArray = elementClass.split(" ")
            contentBox = elementClassArray[4]
        } else if (e.target.classList.contains('gameBoxes')) {
            elementClass = e.target.className
            elementClassArray = elementClass.split(" ")
            contentBox = elementClassArray[4]
        } else if (e.target.className === "progress-bar"){
            elementClass = document.getElementById("progress").parentNode.className
            elementClassArray = elementClass.split(" ")
            contentBox = elementClassArray[4]
        } 
        contentElement = document.getElementById(contentBox)
        if (contentElement.classList.contains("hideBox")) {
            contentElement.classList.remove("hideBox")
        } else {
            contentElement.classList.add("hideBox")
        }
    }
    function checkWinLoss(winLoss) {
        if (winLoss === "Win") {
            return true
        } else {
            return false
        }
    }

    function changeImages(champName) {
        return images[champName + "_0.jpg"].default
    }

    var leagueCookie = readCookie("LeagueInfo")
    var cookieArray = leagueCookie.split(",")
    var interval = 0
    var counter = 0
    let divs = [];
    let divs2 = [];


    // <progress value={cookieArray[48 + counter + interval]} max ={cookieArray[6 + interval]}></progress>
    // <progress className="playerDamage" value={cookieArray[10 + counter + interval]} max={cookieArray[6 + interval]}></progress>

    function createTableRows() {
        for (var g = 0; g < 9; g++){
            divs2.push(<tr key={90 + g}>
                <td className="tableImages"><img src={changeImages(cookieArray[21 + counter + interval])} alt="champImage" /><p>{cookieArray[39 + interval + counter]}</p></td>
                <td className="otherPlayerKDA">{cookieArray[57 + counter + interval]}</td>
                <td className="otherPlayerDamage"><ProgressBar label={cookieArray[48 + counter + interval]} min={0} max={cookieArray[6 + interval]} now={cookieArray[48 + counter + interval]}/></td>
                <td className="BDMScore"><p>{cookieArray[12 + interval + counter]}</p></td>
                </tr>)
                counter = counter + 1
            }
        return divs2
    }
    for(let i = 0; i < 5; i++) {
        divs.push (<div key={i} className="leagueGameBoxes" ><div key={i + 7} onClick={hideShowElement} className={checkWinLoss(cookieArray[9 + interval])? 'row gameBoxes colorGreen greenBox demo' + i: 'row gameBoxes colorRed redBox demo' + i}>
        <img className="championImages" src={changeImages(cookieArray[8 + interval])} alt="champImage" />
        <p className="playerKDA">{cookieArray[11 + interval]}</p>
        <ProgressBar id="progress" label={cookieArray[10 + counter + interval]} min={0} max={cookieArray[6 + interval]} now={cookieArray[10 + counter + interval]}/>
        <p className="personalBDM">{cookieArray[7 + interval]}</p>
    </div>
    <div key={i + 10} className="gameBoxesContent hideBox" id={"demo" + i}>
        <div className="otherPlayers col-12">
            <table className="alliedTable">
                <colgroup>
                    <col className="column1" span="1"/>
                    <col className="column2" span="1"/>
                    <col className="column3" span="1"/>
                    <col className="column4" span="1"/>
                </colgroup>
                <thead>
                    <tr className="tableTitlesAllies">
                    <th className="titleAllies" scope="col">Champions</th>
                    <th className="KDA">KDA</th>
                    <th className="damage">Damage</th>
                    <th scope="col">BDM</th>
                    </tr>
                </thead>
                <tbody>
                    {createTableRows()}
                </tbody>
            </table>
        </div>
    </div>
    </div>)
    interval = interval + 60
    divs2 = []
    counter = 0
    }
    return divs;
}
export default createGameBoxes