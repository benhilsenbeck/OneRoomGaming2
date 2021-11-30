from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from django.contrib.auth.models import UserManager


class userAccounts(AbstractBaseUser):
    fName = models.CharField(max_length = 20)
    lName = models.CharField(max_length = 20)
    username = models.CharField(max_length = 20, unique=True)
    email = models.EmailField(max_length=254, unique=True)
    password = models.CharField(max_length = 255)
    created = models.DateTimeField(auto_now_add=True)
    
    
    objects = UserManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []


class leagueUsernames(models.Model):
    user = models.ForeignKey(userAccounts, default= None, on_delete=models.CASCADE)
    leagueUsername = models.CharField(max_length=50)



class leagueGameGuesses(models.Model):
    user = models.ForeignKey(userAccounts, default = None, on_delete=models.CASCADE)
    BDMGuess = models.DecimalField(max_digits=5, decimal_places=1)

    
    



