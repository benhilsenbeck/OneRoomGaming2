import CheckToken from './JWTCheck'
import LeagueBoxes from './LeagueBoxes'
import { useHistory } from "react-router";
import "../static/css/Dashboard.scss"
import React, { useState, useEffect } from 'react'
import EmblemIron from '../static/Images/leagueRankedIcons/Emblem_Iron.png'
import EmblemBronze from '../static/Images/leagueRankedIcons/Emblem_Bronze.png'
import EmblemSilver from '../static/Images/leagueRankedIcons/Emblem_Silver.png'
import EmblemGold from '../static/Images/leagueRankedIcons/Emblem_Gold.png'
import EmblemPlatinum from '../static/Images/leagueRankedIcons/Emblem_Platinum.png'
import EmblemDiamond from '../static/Images/leagueRankedIcons/Emblem_Diamond.png'
import EmblemMaster from '../static/Images/leagueRankedIcons/Emblem_Master.png'
import EmblemGrandMaster from '../static/Images/leagueRankedIcons/Emblem_Grandmaster.png'
import EmblemChallenger from '../static/Images/leagueRankedIcons/Emblem_Challenger.png'
import EmblemWood from '../static/Images/leagueRankedIcons/trash.png'
import readCookie from './ReadCookie'
import { Line } from 'react-chartjs-2'
import { Spinner } from 'react-bootstrap';
import { login, logout } from '../actions';
import { useDispatch } from 'react-redux'
import axios from 'axios'
const config = require('./constants').config()
const baseURL = config.API_URL

function Dashboard() {
    var leagueInformation = []
    var axiosInstance = null;
    const dispatch = useDispatch();
    const history = useHistory();
    const [userExists, setUserExists] = useState("");
    const [errorMessage, setErrorMessage] = useState(false);
    const [personalLeagueName, setPersonalLeagueName] = useState("")
    const [leagueUsername, setLeagueUsername] = useState("");
    const [leagueInfo, setLeagueInfo] = useState({
        soloEmblem: null,
        flexEmblem: null,
        summonerName: null,
        summonerLevel: null,
        soloQueue: null,
        flexQueue: null,
        fiveGameScore: 0,
        fiveGameAverage: null,
    });
    const leagueRanks = { "IRON": EmblemIron, "BRONZE": EmblemBronze, "SILVER": EmblemSilver, "GOLD": EmblemGold, "PLATINUM": EmblemPlatinum, "DIAMOND": EmblemDiamond, "MASTER": EmblemMaster, "GRANDMASTER": EmblemGrandMaster, "CHALLENGER": EmblemChallenger }

    function updateLeagueInfo() {
        var leagueCookie = readCookie("LeagueInfo")
        var cookieArray = leagueCookie.split(",")
        console.log(cookieArray)
        var fiveGamesArray = [cookieArray[7], cookieArray[67], cookieArray[127], cookieArray[187], cookieArray[247]]
        setLeagueInfo({
            soloEmblem: changeEmblem(cookieArray[4]),
            flexEmblem: changeEmblem(cookieArray[5]),
            summonerName: cookieArray[1],
            summonerLevel: cookieArray[0],
            soloQueue: changeRank(cookieArray[2]),
            flexQueue: changeRank(cookieArray[3]),
            fiveGameScore: fiveGamesArray,
            fiveGameAverage: cookieArray[6],
        })
    }

    async function setAxiosInstance() {
        axiosInstance = axios.create({
            baseURL: baseURL,
            timeout: 10000,
            headers: {
                Authorization: localStorage.getItem('access_token')
                    ? 'JWT ' + localStorage.getItem('access_token')
                    : null,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
        });
    }

    function getTime() {
        var now = new Date();
        now.setMinutes(now.getMinutes() + 15)
        document.cookie = ("timelimit = Set; expires=" + now.toUTCString())
    }

    async function checkUserToken() {
        var tokenCheck = await CheckToken()
        await setAxiosInstance()
        console.log(tokenCheck)
        if (tokenCheck === 'redirect') {
            dispatch(logout())
            history.push("/login")
        } else if (tokenCheck === 'resetAccessToken') {
            dispatch(login())
            checkUserLeagueName()
        } else if (tokenCheck === 'Valid') {
            dispatch(login())
            checkUserLeagueName()
        }
    }

    function checkUserLeagueName() {
        if (readCookie("userexists") === 'User Exists' && readCookie("timelimit") !== null) {
            setUserExists("User Exists")
            updateLeagueInfo()
        } else {
            axiosInstance.get('checkLeagueName', {
            }).then((res) => {
                if (res.data[0] === "User doesn't exist") {
                    setUserExists("User doesn't exist")
                } else {
                    document.cookie = ("userexists = User Exists")
                    setUserExists(res.data[0])
                    if (res.data[1] !== "None" || readCookie("timelimit") === null) {
                        getTime()
                        getLeagueInfo(res.data[1])
                    } else {
                        updateLeagueInfo()
                    }
                }
            }).catch(err => {
                console.log(err)
            })
        }
    }

    function getLeagueInfo(username) {
        axiosInstance.post('leagueInfo', {
            username: username,
        }).then(response => {
            console.log(response.data.length)
            console.log(response)
            for (var y = 0; y < response.data.length; y++) {
                leagueInformation.push(response.data[y])
            }
            document.cookie = ("LeagueInfo=" + leagueInformation)
            updateLeagueInfo()
        })
    }

    function changeEmblem(soloQueueRank) {
        if (soloQueueRank in leagueRanks) {
            return leagueRanks[soloQueueRank]
        } else {
            return EmblemWood
        }
    }

    function changeRank(rank) {
        if (rank === "None") {
            return "Trash"
        } else {
            return rank
        }
    }

    const handleSubmit = async event => {
        event.preventDefault();
        var checkToken = await CheckToken()
        console.log(checkToken)
        await setAxiosInstance()
        if (checkToken === 'resetAccessToken' || checkToken === 'Valid') {
            await axiosInstance.post(config.API_URL + 'leagueInfo', {
                username: leagueUsername,
            }).then(response => {
                document.cookie = ("LeagueInfo=" + response.data)
                updateLeagueInfo()
                setErrorMessage(false)
            }).catch(err => {
                setErrorMessage(true)
            }) 
        }
    }

    const handleLeagueUsername = async (e) => {
        e.preventDefault();
        axiosInstance.post(config.API_URL + 'setLeagueName', {
            leagueUsername: personalLeagueName
        }).then((res) => {
            setUserExists("User exists")
            document.cookie = ("userexists = User Exists")
            getTime()
            getLeagueInfo(personalLeagueName)
        })
    }

    useEffect(() => {
        checkUserToken()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (userExists === "" || (userExists === "User exists"  && leagueInfo.fiveGameAverage == null )) {   
        return (
            <div className="dashboardBackground">
                <div className="wrapperDashboard">
                    <div className="loadingSpinner"><Spinner animation="border" variant="success"></Spinner></div>
                    <div className="loadingTitle">Loading profile</div>
                </div>
            </div>
        )
    } else if (userExists === "User doesn't exist") {
        return (
            <div className="dashboardBackground">
                <div className="wrapperDashboard">
                    <div className="container cont5">
                        <p className="setupTitle">Lets Setup a League Username!</p>
                        <form onSubmit={handleLeagueUsername}>
                            <div className="leagueUsername w-100">
                                <input value={personalLeagueName} className="form-control" onChange={e => setPersonalLeagueName(e.target.value)} />
                            </div>
                            <button className="hiddenSubmitButton" type="submit">Submit</button>
                        </form>
                    </div>
                </div>
            </div>
        )
    } else {
        return (
            <div className="dashboardBackground">
                <div className="wrapperDashboard">
                    <div className="container cont1">
                        <div className="row topRow">
                            <div className="col-3 soloContainer">
                                <div className="box1">
                                    <img src={leagueInfo.soloEmblem} alt="logo" className="img-fluid logo1" />
                                    <p className="soloRank">{leagueInfo.soloQueue}</p>
                                </div>
                            </div>
                            <div className="col-6 box2">
                                <p className="summonerName">{leagueInfo.summonerName}</p>
                                <p className="summonerLevel">{leagueInfo.summonerLevel}</p>
                            </div>
                            <div className="col-3 flexContainer">
                                <div className="box3">
                                    <img src={leagueInfo.flexEmblem} alt="logo" className="img-fluid logo2" />
                                    <p className="flexRank">{leagueInfo.flexQueue}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="container cont2">
                        <div className="row topRow">
                            <div className="usernameSearch">
                                {errorMessage ? <p className="errorMessageD">User doesn't exist</p> : <p></p>}
                                <form onSubmit={handleSubmit} className="usernameSearch">
                                    <input value={leagueUsername} className="form-control" onChange={e => setLeagueUsername(e.target.value)} placeholder="Enter League Username" />
                                    <button className="hiddenSubmitButton" type="submit">Submit</button>
                                </form>
                            </div>
                            <div className="col-12 box6">
                                <div className="scores">
                                    <div className="row">
                                        <div className="col">
                                        <div className="chart">
                                                <Line
                                                    data={{
                                                        labels: ['Game5', 'Game4', 'Game3', 'Game2', 'RecentGame'],
                                                        datasets: [{
                                                            label: 'BDM',
                                                            fill: false,
                                                            showLine: true,
                                                            spanGaps: true,
                                                            data: [leagueInfo.fiveGameScore[4], leagueInfo.fiveGameScore[3], leagueInfo.fiveGameScore[2], leagueInfo.fiveGameScore[1], leagueInfo.fiveGameScore[0]],
                                                            borderColor: [
                                                                'rgba(39, 213, 69, .2)'
                                                            ],
                                                            backgroundColor: [
                                                                'rgba(39, 213, 69, 1)',
                                                                'rgba(39, 213, 69, 1)',
                                                                'rgba(39, 213, 69, 1)',
                                                                'rgba(39, 213, 69, 1)',
                                                                'rgba(39, 213, 69, 1)',
                                                            ]
                                                        }
                                                        ]
                                                    }}
                                                    height={200}
                                                    options={{
                                                        maintainAspectRatio: false,
                                                        scales: {
                                                            yAxes: [
                                                                {
                                                                    ticks: {
                                                                        beginAtZero: true,
                                                                        suggestedMax: 10,
                                                                    }
                                                                }
                                                            ]
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="box8 col">
                                <LeagueBoxes/>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 box5">
            
                    </div>
                </div>
            </div>
        )
    }
}
export default Dashboard;