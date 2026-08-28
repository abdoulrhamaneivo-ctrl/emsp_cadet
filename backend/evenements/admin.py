from django.contrib import admin

from .models import Evenement, Inscription

admin.site.register([Evenement, Inscription])
