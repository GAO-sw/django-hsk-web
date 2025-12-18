from django.urls import path
from . import views

urlpatterns = [
    # firstpage,root,then use function index of view.py
    path('', views.index, name='index'),
    # use function lesson_detail of views.py for lesson detail,for user,return html
    path('lesson/<int:pk>/', views.lesson_detail, name='lesson_detail'),
    #use lesson_api for program,to let frontend get the data.return json,
    path('api/lesson/<int:pk>/', views.lesson_api, name='lesson_api'),
]