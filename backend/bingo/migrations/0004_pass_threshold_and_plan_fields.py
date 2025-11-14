# Generated manually to align with new challenge and study plan fields
from __future__ import annotations

from datetime import time

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('bingo', '0003_remove_bingo_completed_bingo_card_alter_bingo_user_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='challengequestion',
            name='pass_threshold',
            field=models.DecimalField(decimal_places=2, default=0.75, max_digits=4),
        ),
        migrations.AddField(
            model_name='studyplanentry',
            name='coach_note',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AddField(
            model_name='studyplanentry',
            name='location',
            field=models.CharField(blank=True, default='', max_length=128),
        ),
        migrations.AddField(
            model_name='studyplanentry',
            name='plan_type',
            field=models.CharField(default='self-study', max_length=32),
        ),
        migrations.AddField(
            model_name='studyplanentry',
            name='start_time',
            field=models.TimeField(default=time(19, 0)),
        ),
    ]
