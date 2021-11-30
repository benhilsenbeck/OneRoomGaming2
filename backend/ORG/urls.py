from django.contrib import admin
from django.urls import path, include             
from rest_framework import routers                
from users import views    
from rest_framework_simplejwt import views as jwt_views              

urlpatterns = [
    path('admin', admin.site.urls),         
    path('userCreatAccount', views.userCreatAccountView.as_view(), name="userCreatAccount"),
    path('setLeagueName', views.setLeagueName.as_view(), name="setLeagueName"),
    path('checkLeagueName', views.checkLeagueName.as_view(), name="checkLeagueName"),
    path('token/obtain', views.ObtainTokenPairView.as_view(), name='token_create'),
    path('token/refresh', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
    path('token/check', views.checkToken.as_view(), name="checkToken"),
    path('leagueInfo', views.leagueInformation.as_view(), name='leagueInfo')
]