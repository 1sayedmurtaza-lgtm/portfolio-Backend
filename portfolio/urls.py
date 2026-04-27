from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from .views import ProjectListView, SkillListView, ContactCreateView

urlpatterns = [
    path('projects/', ProjectListView.as_view(), name='projects'),
    path('skills/',   SkillListView.as_view(),  name='skills'),
    path('contact/',  csrf_exempt(ContactCreateView.as_view()), name='contact'),
]