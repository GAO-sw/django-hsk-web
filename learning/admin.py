from django.contrib import admin
from .models import Lesson, TextEntry

#写这个内联可以一次录入一整节课，一次保存。不必一次次添加句子然后一次次保存。
class TextEntryInline(admin.TabularInline):
    #括号内表示句子会横着一条条排
    model = TextEntry
    #表示这个表格填的是句子表的数据
    extra = 1  
    fields = ('order', 'text_zh', 'text_pinyin', 'text_ru')
    ordering = ('order',)

@admin.register(Lesson)
#这行是个装饰器，意思是-下面的这个类用来配置管理lesson这个模型
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title_zh', 'title_ru', 'created_at')
    #决定了课程列表都显示哪些列
   
    inlines = [TextEntryInline] 
    #把之前定义的子类表格塞进了父表页面
    #正式引文这行代码，在课程编辑页面才能看到下方的句子录入框
    
   
    fieldsets = (
        (None, {
            'fields': ('title_zh', 'title_ru')
        }),
        ('习题配置 (直接粘贴JSON)', {
            'fields': ('exercise_data',),
            'classes': ('collapse',), 
            #collapse把这个区域默认隐藏，点击后显示展开
        }),
    )

