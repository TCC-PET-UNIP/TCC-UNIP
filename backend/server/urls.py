from django.urls import path
from . import views

urlpatterns = [
    path('register_adopter', views.register_adopter, name='register_adopter'),
    path('update_adopter_data', views.update_adopter_data, name='update_adopter_data'),
    path('register_ong', views.register_ong, name='register_ong'),
    path('update_ong_data', views.update_ong_data, name='update_ong_data'),
    path('register_pet', views.register_pet, name='register_pet'),
    path('update_pet_data', views.update_pet_data, name='update_pet_data'),
    path('get_compatible_pets', views.get_compatible_pets, name='get_compatible_pets'),
    path('login', views.login, name='login'),
    path('health', views.health_check, name='health_check'),
]