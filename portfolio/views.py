from rest_framework import generics, status
from rest_framework.response import Response
from .models import Project, Skill
from .serializers import ProjectSerializer, SkillSerializer, ContactSerializer

class ProjectListView(generics.ListAPIView):
    queryset         = Project.objects.all()
    serializer_class = ProjectSerializer

class SkillListView(generics.ListAPIView):
    queryset         = Skill.objects.all()
    serializer_class = SkillSerializer

class ContactCreateView(generics.CreateAPIView):
    serializer_class = ContactSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"message": "Message received!"},
            status=status.HTTP_201_CREATED
        )