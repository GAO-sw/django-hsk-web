from django.db import models

class Lesson(models.Model):
    #括号内代表--这个类是基类，把当前这个类转换为数据库表

    title_zh = models.CharField("标题 (中文)", max_length=100, default="第一课")
    title_ru = models.CharField("标题 (俄语)", max_length=100, default="Урок 1")
    

    exercise_data = models.TextField(
        "习题数据 (JSON)", 
        blank=True, 
        help_text="请直接将原来 .json 文件中的全部内容复制粘贴到这里"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    #时间日期字段，自动打卡机，当这条数据第一次被创建时，自动填入当前时间

    def __str__(self):
        return f"{self.title_zh} - {self.title_ru}"
    #决定了在后台这个对象长什么样

    class Meta:
        verbose_name = "课程"
        verbose_name_plural = "课程列表"
    #给模型起个花名，单数叫什么，复数叫什么

class TextEntry(models.Model):

    lesson = models.ForeignKey(Lesson, related_name='texts', on_delete=models.CASCADE)
    #这是一段子表，括号第一个参数定义了谁是爸爸，
    #第二个参数用语反向查询-父找子lesson.extx.all()就能找到这课所有的句子
    #第三格参数--如果我在后台把第一课删除，所有第一课的句子也都会被删除
    
  
    text_zh = models.CharField("课文 (汉字)", max_length=255)
    text_pinyin = models.CharField("拼音", max_length=255)
    text_ru = models.CharField("翻译 (俄语)", max_length=255)
    
 
    order = models.PositiveIntegerField("顺序 (数字越小越靠前)", default=0)
    #用来控制句子显示的先后顺序

    class Meta:
        ordering = ['order'] 
        verbose_name = "课文句子"
        verbose_name_plural = "课文句子"
    #第一行，自动排序