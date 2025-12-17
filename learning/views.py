from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
import json
# import models
from .models import Lesson



def index(request):
    lessons = Lesson.objects.all().order_by('-created_at')
    return render(request, 'learning/index.html', {'lessons': lessons})


def lesson_detail(request, pk):

    lesson = get_object_or_404(Lesson, pk=pk)
    texts = lesson.texts.all().order_by('order')

    context = {
        'lesson': lesson,
        'texts': texts,
    }
    return render(request, 'learning/detail.html', context)


def lesson_api(request, pk):
    lesson = get_object_or_404(Lesson, pk=pk)

    json_str = lesson.exercise_data
    if not json_str:
        json_str = "{}"

    try:
        data = json.loads(json_str)
    except json.JSONDecodeError:
        data = {"error": "Invalid JSON format in database"}

    return JsonResponse(data)