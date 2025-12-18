from django.shortcuts import render, \
    get_object_or_404  # render: make HTML pages; get_object_or_404: get object or show 404 error
from django.http import JsonResponse  # For returning JSON data
import json  # Python's JSON tool

from .models import Lesson  # Import model, Lesson model from current folder


def index(request):
    """
    Home page view - shows all lessons
    Handles: GET /
    """
    # Get all lessons, newest first
    lessons = Lesson.objects.all().order_by('-created_at')

    # Make HTML page with lessons data
    return render(request, 'learning/index.html', {'lessons': lessons})


def lesson_detail(request, pk):
    """
    Single lesson page - shows one lesson
    Handles: GET /lesson/123/
    pk = lesson ID from URL
    """

    lesson = get_object_or_404(Lesson, pk=pk) # Get lesson by ID, show 404 if not found

    texts = lesson.texts.all().order_by('order')    # Get all texts for this lesson, in order

    context = {          # Data for template
        'lesson': lesson,  # The lesson
        'texts': texts,  # Lesson texts
    }

    return render(request, 'learning/detail.html', context)    # Make HTML page


def lesson_api(request, pk):
    """
    Lesson API - returns JSON data
    Handles: GET /api/lesson/123/
    For JavaScript calls
    """
    lesson = get_object_or_404(Lesson, pk=pk)    # Get lesson, 404 if not found

    json_str = lesson.exercise_data     # Get JSON string from database

    # If empty, use empty JSON
    if not json_str:
        json_str = "{}"  # Empty JSON

    try:
        # Convert JSON string to Python dict
        data = json.loads(json_str)
    except json.JSONDecodeError:
        # If bad JSON, return error
        data = {"error": "Invalid JSON format in database"}

    # Return JSON response
    return JsonResponse(data)