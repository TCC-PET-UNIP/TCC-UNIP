from django.urls import path
from . import views

urlpatterns = [
    path('register_adopter', views.register_adopter, name='register_adopter'),
    path('register_ong', views.register_ong, name='register_ong'),
    path('login', views.login, name='login'),
    path('update_ong_image', views.update_ong_image, name='update_ong_image'),
    path('update_pet_image', views.update_pet_image, name='update_pet_image'),
    path('health', views.health_check, name='health_check'),
]