import json
import jwt
from django.shortcuts import render
from rest_framework.views import APIView       
from .serializers import userAccountsSerializer, leagueUsernameSerializer
from rest_framework import status, permissions      
from .models import userAccounts, leagueUsernames
from rest_framework.response import Response
from django.http import HttpResponse
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer
from django.contrib.auth.hashers import make_password
import requests
import datetime
import aiohttp
import asyncio
import time
from django.db import connection
from django.conf import settings


class ObtainTokenPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class userCreatAccountView(APIView):
  permission_classes = (permissions.AllowAny,)
  def post(self, request):
    serializer = userAccountsSerializer(data=request.data)
    if serializer.is_valid():
      if('password' in self.request.data):
        password = make_password(self.request.data['password'])
        serializer.save(password=password)
        return Response(serializer.data)
      else:
        return Response("This did not save serializer")

class checkToken(APIView):
  permission_classes = (permissions.AllowAny,)
  def post(self, request):
    accessToken = request.data['access']
    try:
      decodedKey = jwt.decode(accessToken, settings.JWTKEY, algorithm="HS256")
      return Response("Valid")
    except Exception as e:
      print(e)
      return Response("Invalid")

class setLeagueName(APIView):
  def post(self, request):
    serializer = leagueUsernameSerializer(data=request.data)
    if serializer.is_valid():
      serializer.save(user_id = self.request.user.id)
      return Response("The serializer worked correctly")
    else:
      return Response("serializer failed")

class checkLeagueName(APIView):
  permission_classes = (permissions.AllowAny,)
  def get(self, request):
    database = connection.cursor()
    removeCharacters = ['(', ')', ',']
    try:
      if leagueUsernames.objects.get(user_id=request.user.id) != "":
        userLeagueName = database.execute('SELECT leagueUsername FROM `users_leagueusernames` WHERE user_id = %s', [request.user.id])
        row = database.fetchone()
        print(row)
        result = ["User exists", str(row[0])]
        return Response(result)
    except Exception as e:
      print(e)
      result = ["User doesn't exist", "None"]
      return Response(result)

class leagueInformation(APIView):
  def post(self, request):
    summonerName = ""
    summonerLevel = ""
    accountId = ""
    leagueRanks = ["IRON", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "MASTER", "GRANDMASTER", "CHALLENGER"]
    leagueGameId = []
    totalScore = 0
    gameDuration = 0
    damagePerMinute = 1000
    killsPerMinute = .3
    minionsKilledPerMinute = 10
    visionScorePerMinute = 1
    MatchScores = []
    leagueName = request.data['username']
    apiKey = settings.LEAGUEAPIKEY
    response = requests.get('https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + str(leagueName) + "?api_key=" + apiKey)
    summonerInformation = response.json()
    summonerID = str(summonerInformation["id"])
    summonerName = str(summonerInformation["name"])
    accountId = str(summonerInformation["accountId"])
    summonerLevel = str(summonerInformation["summonerLevel"])
    
    async def main():
      async with aiohttp.ClientSession() as session:
        summonerID2 = summonerID
        accountId2 = accountId
        tasks = [asyncio.ensure_future(get_league_rank(session, summonerID2)), asyncio.ensure_future(get_league_games(session, accountId2))]
        tasks2 = []
        gameIdsRanked = await asyncio.gather(*tasks)
        for leagueId in gameIdsRanked[1]:
          task = asyncio.ensure_future(get_league_data(session, leagueId))
          tasks2.append(task)
        MatchScores = await asyncio.gather(*tasks2)
        print(MatchScores)
        gamesRankedArray = [gameIdsRanked[0][0], gameIdsRanked[0][1], gameIdsRanked[0][2], gameIdsRanked[0][3]]
        return summonerLevel, summonerName, gamesRankedArray, MatchScores

    async def get_league_rank(session, summonerID):
      soloQueueRank = "None"
      flexQueueRank = "None"
      changeEmblem = "None"
      changeEmblem2 = "None"
      rankedInformation = f"https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/" + str(summonerID) + "?api_key=" + apiKey
      async with session.get(rankedInformation) as response:
        rankedInformation = await response.json()    
        try:
          if rankedInformation[0]["queueType"] == "RANKED_SOLO_5x5":
            soloQueueRank = rankedInformation[0]["tier"] +  " "  + rankedInformation[0]['rank']
          elif rankedInformation[0]["queueType"] == "RANKED_FLEX_SR":
            flexQueueRank = rankedInformation[0]["tier"] + " "  + rankedInformation[0]['rank']
        except:
          pass

        #Get the flex queue rank if they have a solo queue rank
        try:
          if rankedInformation[1]["queueType"] == "RANKED_FLEX_SR":
            flexQueueRank = rankedInformation[1]["tier"] + " "  + rankedInformation[1]['rank']
          elif rankedInformation[1]["queueType"] == "RANKED_SOLO_5x5":
            soloQueueRank = rankedInformation[1]["tier"] +  " "  + rankedInformation[1]['rank']
        except:
            pass

        #check for league rank of solo queue
        for i in leagueRanks:
          if i in soloQueueRank :
            changeEmblem = i
            break
        #check for league rank of flex queue
        for x in leagueRanks:
          if x in flexQueueRank:
            changeEmblem2 = x
            break

      returnRanksArray = [soloQueueRank, flexQueueRank, changeEmblem, changeEmblem2]
      return returnRanksArray

    async def get_league_games(session, summonerID):
      counter = 0
      leagueGameId = []
      getMatchInformation = f"https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/" + accountId + "?api_key=" + apiKey
      async with session.get(getMatchInformation) as response:
        getMatchInformation = await response.json()    
        while len(leagueGameId) < 5:
          if getMatchInformation["matches"][counter]["queue"] == 400 or getMatchInformation["matches"][counter]["queue"] == 420 or getMatchInformation["matches"][counter]["queue"] == 440:
            gameId = getMatchInformation["matches"][counter]["gameId"]
            leagueGameId.append(gameId)
          counter += 1
        return leagueGameId

    async def get_league_data(session, leagueId):
      matchInformation = f"https://na1.api.riotgames.com/lol/match/v4/matches/" + str(leagueId) + "?api_key=" + apiKey
      async with session.get(matchInformation) as response:
        response4 = await response.json()
        championsDictionary = {'266': 'Aatrox', '103': 'Ahri', '84': 'Akali', '12': 'Alistar', '32': 'Amumu', '34': 'Anivia', '1': 'Annie', '523': 'Aphelios', '22': 'Ashe', '136': 'AurelionSol', '268': 'Azir', '432': 'Bard', '53': 'Blitzcrank', '63': 'Brand', '201': 'Braum', '51': 'Caitlyn', '164': 'Camille', '69': 'Cassiopeia', '31': 'Chogath', '42': 'Corki', '122': 'Darius', '131': 'Diana', '119': 'Draven', '36': 'DrMundo', '245': 'Ekko', '60': 'Elise', '28': 'Evelynn', '81': 'Ezreal', '9': 'FiddleSticks', '114': 'Fiora', '105': 'Fizz', '3': 'Galio', '41': 'Gangplank', '86': 'Garen', '150': 'Gnar', '79': 'Gragas', '104': 'Graves', '120': 'Hecarim', '74': 'Heimerdinger', '420': 'Illaoi', '39': 'Irelia', '427': 'Ivern', '40': 'Janna', '59': 'JarvanIV', '24': 'Jax', '126': 'Jayce', '202': 'Jhin', '222': 'Jinx', '145': 'Kaisa', '429': 'Kalista', '43': 'Karma', '30': 'Karthus', '38': 'Kassadin', '55': 'Katarina', '10': 'Kayle', '141': 'Kayn', '85': 'Kennen', '121': 'Khazix', '203': 'Kindred', '240': 'Kled', '96': 'KogMaw', '7': 'Leblanc', '64': 'LeeSin', '89': 'Leona', '876': 'Lillia', '127': 'Lissandra', '236': 'Lucian', '117': 'Lulu', '99': 'Lux', '54': 'Malphite', '90': 'Malzahar', '57': 'Maokai', '11': 'MasterYi', '21': 'MissFortune', '62': 'MonkeyKing', '82': 'Mordekaiser', '25': 'Morgana', '267': 'Nami', '75': 'Nasus', '111': 'Nautilus', '518': 'Neeko', '76': 'Nidalee', '56': 'Nocturne', '20': 'Nunu', '2': 'Olaf', '61': 'Orianna', '516': 'Ornn', '80': 'Pantheon', '78': 'Poppy', '555': 'Pyke', '246': 'Qiyana', '133': 'Quinn', '497': 'Rakan', '33': 'Rammus', '421': 'RekSai', '526': 'Rell', '58': 'Renekton', '107': 'Rengar', '92': 'Riven', '68': 'Rumble', '13': 'Ryze', '360': 'Samira', '113': 'Sejuani', '235': 'Senna', '147': 'Seraphine', '875': 'Sett', '35': 'Shaco', '98': 'Shen', '102': 'Shyvana', '27': 'Singed', '14': 'Sion', '15': 'Sivir', '72': 'Skarner', '37': 'Sona', '16': 'Soraka', '50': 'Swain', '517': 'Sylas', '134': 'Syndra', '223': 'TahmKench', '163': 'Taliyah', '91': 'Talon', '44': 'Taric', '17': 'Teemo', '412': 'Thresh', '18': 'Tristana', '48': 'Trundle', '23': 'Tryndamere', '4': 'TwistedFate', '29': 'Twitch', '77': 'Udyr', '6': 'Urgot', '110': 'Varus', '67': 'Vayne', '45': 'Veigar', '161': 'Velkoz', '254': 'Vi', '234': 'Viego', '112': 'Viktor', '8': 'Vladimir', '106': 'Volibear', '19': 'Warwick', '498': 'Xayah', '101': 'Xerath', '5': 'XinZhao', '157': 'Yasuo', '777': 'Yone', '83': 'Yorick', '350': 'Yuumi', '154': 'Zac', '238': 'Zed', '115': 'Ziggs', '26': 'Zilean', '142': 'Zoe', '143': 'Zyra'}
        championImages = ""
        counter2 = 0
        lobbyKills = []
        lobbyDamage = []
        finalScoreArray = []
        playerDamageArray = []
        playerKDA = []
        playerNamesArray = []
        championImagesArray = []
        winLossArray = []
        lobbyPositions = {}
        participantInfo = {}
        teamids = {response4['teams'][0]['teamId']: response4['teams'][0]['win'], response4['teams'][1]['teamId']: response4['teams'][1]['win']}
        gameDuration = (response4["gameDuration"] % 3600) // 60
        while counter2 < len(response4['participantIdentities']):
          participantInfo[response4['participantIdentities'][counter2]['participantId']] = response4['participantIdentities'][counter2]['player']["summonerName"]
          lobbyKills.append(response4['participants'][counter2]['stats']["kills"])
          lobbyDamage.append(response4['participants'][counter2]['stats']["totalDamageDealtToChampions"])
          lobbyPositions[response4['participantIdentities'][counter2]['participantId']] = response4['participants'][counter2]['timeline']["role"] + " " + response4['participants'][counter2]['timeline']["lane"]
          counter2 += 1
        for playerId, playerName in participantInfo.items():
          totalScore = 0
          if playerName == summonerName:
            participant_id = playerId

          playerChampionId = response4['participants'][playerId - 1]['championId']
          playerDamage = response4['participants'][playerId - 1]['stats']["totalDamageDealtToChampions"]
          playerKills = response4['participants'][playerId - 1]['stats']["kills"]
          playerDeaths = response4['participants'][playerId - 1]['stats']["deaths"]
          playerAssists = response4['participants'][playerId - 1]['stats']["assists"]
          playerFirstBlood = response4['participants'][playerId - 1]['stats']["firstBloodKill"]
          playerCreepScore = response4['participants'][playerId - 1]['stats']["totalMinionsKilled"] + response4['participants'][playerId - 1]['stats']["neutralMinionsKilled"]
          playerVisionScore = response4['participants'][playerId - 1]['stats']["visionScore"]
          playerRole = response4['participants'][playerId - 1]['timeline']["role"]
          playerLane = response4['participants'][playerId - 1]['timeline']["lane"]
          playerTripleKills = response4['participants'][playerId - 1]['stats']["tripleKills"]
          playerQuadraKills = response4['participants'][playerId - 1]['stats']["quadraKills"]
          playerPentaKills = response4['participants'][playerId - 1]['stats']["pentaKills"]
          playerWinLoss = response4['participants'][playerId - 1]['teamId']
          print(playerWinLoss)

          #checking if the player won or lost the game
          if playerWinLoss in teamids.keys():
            winLoss = teamids[playerWinLoss]

          #checking the score based on the outputs from above
          damageThreshold = gameDuration * damagePerMinute
          killsThreshold = gameDuration * killsPerMinute
          creepScoreThreshold = gameDuration * minionsKilledPerMinute
          visionScoreThreshold = gameDuration * visionScorePerMinute

          if str(playerChampionId) in championsDictionary.keys():
            championImages = (championsDictionary[str(playerChampionId)])

          if playerTripleKills >= 3:
            totalScore += 1
          elif playerQuadraKills >= 2:
            totalScore += 1
          elif playerPentaKills >= 1:
            totalScore += 1
          elif playerKills == 20:
            totalScore += 1

          if playerDamage >= damageThreshold:
            totalScore += 2
          else:
            totalScore += (2 * (playerDamage / damageThreshold))

          if playerKills >= killsThreshold:
            totalScore += 2
          else:
            totalScore += (2 * (playerKills / killsThreshold))

          if playerCreepScore >= creepScoreThreshold:
            totalScore += 2
          else:
            totalScore += (2 * (playerCreepScore / creepScoreThreshold))

          if playerVisionScore > visionScoreThreshold:
            wardsOverThreshold = playerVisionScore - visionScoreThreshold
            if ((wardsOverThreshold / 2) / 10) > 2:
              totalScore -= 2
            else:
              totalScore -= ((wardsOverThreshold / 2) / 10)

          if max(lobbyKills) == playerKills:
            totalScore += 1

          if max(lobbyDamage) == playerDamage:
            totalScore += 1

          if playerFirstBlood == True:
            totalScore += 1

          for lobbyPositionId, lobbyLaneRole in lobbyPositions.items():
            if (lobbyLaneRole) == "DUO_SUPPORT BOTTOM":
              supportDamage = response4['participants'][lobbyPositionId - 1]['stats']["totalDamageDealtToChampions"]
              if supportDamage in lobbyDamage:
                lobbyDamage.remove(supportDamage)

          if min(lobbyDamage) == playerDamage:
            totalScore -= 2

          finalScore = (round(totalScore, 1))

          finalScoreArray.append(finalScore)
          championImagesArray.append(championImages)
          winLossArray.append(winLoss)
          playerNamesArray.append(playerName)
          playerDamageArray.append(playerDamage)
          playerKDA.append(str(playerKills) + '/' + str(playerDeaths) + '/' + str(playerAssists))
        playerScore = [finalScoreArray[participant_id - 1], championImagesArray[participant_id - 1], winLossArray[participant_id - 1], playerDamageArray[participant_id -1], playerKDA[participant_id -1]]
        playerDamageArray.pop(participant_id -1)
        playerKDA.pop(participant_id -1)
        finalScoreArray.pop(participant_id - 1)
        championImagesArray.pop(participant_id -1)
        winLossArray.pop(participant_id -1)
        playerNamesArray.pop(participant_id -1)
        # print(playerNamesArray)
        # print(playerScore)
        # print(finalScoreArray)
        # print(championImagesArray)
        # print(winLossArray)
        return max(lobbyDamage), playerScore, finalScoreArray, championImagesArray, winLossArray, playerNamesArray, playerDamageArray, playerKDA


    runFunction = asyncio.run(main())
    return Response(runFunction)
    