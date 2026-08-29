from django.contrib import admin

from .models import Avis, Demande

admin.site.register([Demande, Avis])
