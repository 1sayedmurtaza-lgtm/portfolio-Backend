from django.contrib import admin
from .models import Project, Skill, Contact

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display  = ['title', 'tech_stack', 'order']
    list_editable = ['order']

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'level']
    list_filter  = ['category', 'level']

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display    = ['name', 'email', 'created_at']
    readonly_fields = ['name', 'email', 'message', 'created_at']