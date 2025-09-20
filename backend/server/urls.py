from django.urls import path
from . import views

urlpatterns = [
    path('register_adopter', views.register_adopter, name='register_adopter'),
    path('register_ong', views.register_ong, name='register_ong'),
    path('health', views.health_check, name='health_check'),
]