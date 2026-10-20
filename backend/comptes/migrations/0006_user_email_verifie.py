from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("comptes", "0005_user_preferences_ia"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="email_verifie",
            field=models.BooleanField(default=True, verbose_name="email vérifié"),
        ),
    ]
