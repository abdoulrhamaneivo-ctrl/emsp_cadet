from django.contrib import admin

from .models import Commentaire, Publication, Reaction, Signalement

admin.site.register([Publication, Reaction, Commentaire, Signalement])
