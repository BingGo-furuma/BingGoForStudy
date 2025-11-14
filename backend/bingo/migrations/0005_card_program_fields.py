# Generated manually because network installation was unavailable
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bingo', '0004_pass_threshold_and_plan_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='bingocard',
            name='monthly_label',
            field=models.CharField(blank=True, max_length=64),
        ),
        migrations.AddField(
            model_name='bingocard',
            name='period_end',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='bingocard',
            name='period_start',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='bingocard',
            name='program_type',
            field=models.CharField(choices=[('study', 'BingGo for Study'), ('binggo', 'Bing Go')], default='study', max_length=32),
        ),
    ]
