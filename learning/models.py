from django.db import models

class Lesson(models.Model):

    title_zh = models.CharField("标题 (中文)", max_length=100, default="第一课")
    title_ru = models.CharField("标题 (俄语)", max_length=100, default="Урок 1")
    

    exercise_data = models.TextField(
        "习题数据 (JSON)", 
        blank=True, 
        help_text="请直接将原来 .json 文件中的全部内容复制粘贴到这里"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title_zh} - {self.title_ru}"

    class Meta:
        verbose_name = "课程"
        verbose_name_plural = "课程列表"

class TextEntry(models.Model):

    lesson = models.ForeignKey(Lesson, related_name='texts', on_delete=models.CASCADE)
    
  
    text_zh = models.CharField("课文 (汉字)", max_length=255)
    text_pinyin = models.CharField("拼音", max_length=255)
    text_ru = models.CharField("翻译 (俄语)", max_length=255)
    
 
    order = models.PositiveIntegerField("顺序 (数字越小越靠前)", default=0)

    class Meta:
        ordering = ['order'] 
        verbose_name = "课文句子"
        verbose_name_plural = "课文句子"