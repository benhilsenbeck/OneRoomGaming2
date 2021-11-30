from rest_framework import serializers
from .models import userAccounts, leagueUsernames, leagueGameGuesses
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib import auth
from rest_framework.exceptions import AuthenticationFailed


class userAccountsSerializer(serializers.ModelSerializer):
  class Meta:
    model = userAccounts
    fields = ('id', "last_login", 'fName', 'lName', 'username', 'email', 'password', 'created')

    def create(self, validated_data):
      user = userAccounts.objects.create(
        email = validated_data['email'],
        username = validated_data['username'],
        password = make_password(validated_data['password'])
      )
      user.save()
      return user



class leagueUsernameSerializer(serializers.ModelSerializer):
  class Meta:
    model = leagueUsernames
    fields = ('leagueUsername', 'user_id')

    def create(self, validated_data):
      leagueUser = leagueUsernames.objects.create(
        leagueUsernames = validated_data['leagueUsername'],
        user_id = current_user.id
      )
      leagueUser.save()
      return leagueUser

    
class leagueGameGuessesSerializer(serializers.ModelSerializer):
  class Meta:
    model = leagueGameGuesses
    fields = ('BDMGuess', 'user_id')

    def create(self, validated_data):
      userGuesses = leagueGameGuesses.objects.create(
        BDMGuess = validated_data['BDMGuess'],
        user_id = current_user.id
      )
      userGuesses.save()
      return userGuesses



class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super(MyTokenObtainPairSerializer, cls).get_token(user)
        return token


    