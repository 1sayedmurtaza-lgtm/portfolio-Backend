from rest_framework import serializers
from .models import Project, Skill, Contact

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Project
        fields = '__all__'

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Skill
        fields = '__all__'

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Contact
        fields = ['name', 'email', 'message']