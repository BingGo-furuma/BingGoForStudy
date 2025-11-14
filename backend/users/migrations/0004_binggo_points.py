# Generated manually due to offline environment
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_profile_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='binggo_points',
            field=models.PositiveIntegerField(default=0),
        ),
    ]
