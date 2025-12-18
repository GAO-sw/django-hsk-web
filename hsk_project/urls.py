from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    #manage backend admin panel
    path('admin/', admin.site.urls),
    #manage app,redirect to /learning
    path('', include('learning.urls')),
]