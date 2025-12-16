from django.contrib import admin
from .models import Lesson, TextEntry


class TextEntryInline(admin.TabularInline):
    model = TextEntry
    extra = 1  
    fields = ('order', 'text_zh', 'text_pinyin', 'text_ru')
    ordering = ('order',)

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title_zh', 'title_ru', 'created_at')
   
    inlines = [TextEntryInline] 
    
   
    fieldsets = (
        (None, {
            'fields': ('title_zh', 'title_ru')
        }),
        ('习题配置 (直接粘贴JSON)', {
            'fields': ('exercise_data',),
            'classes': ('collapse',), 
        }),
    )

