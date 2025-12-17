from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('lesson/<int:pk>/', views.lesson_detail, name='lesson_detail'),
    path('api/lesson/<int:pk>/', views.lesson_api, name='lesson_api'),
]