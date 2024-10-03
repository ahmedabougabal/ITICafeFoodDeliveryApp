# Generated by Django 5.1.1 on 2024-10-03 11:41

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='MenuItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('price', models.DecimalField(decimal_places=2, max_digits=6)),
                ('description', models.TextField()),
                ('image', models.ImageField(blank=True, null=True, upload_to='menu_items')),
                ('is_available', models.BooleanField(default=True)),
                ('stock', models.PositiveIntegerField(default=0)),
                ('calories', models.PositiveIntegerField(blank=True, null=True)),
                ('allergens', models.CharField(blank=True, max_length=200)),
                ('time_availability_start', models.TimeField(blank=True, null=True)),
                ('time_availability_end', models.TimeField(blank=True, null=True)),
                ('order_count', models.PositiveIntegerField(default=0)),
                ('branch', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='menu_items', to='core.branch')),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='menu.category')),
            ],
        ),
        migrations.CreateModel(
            name='MenuItemVariant',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('price_adjustment', models.DecimalField(decimal_places=2, max_digits=6)),
                ('menu_item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='variants', to='menu.menuitem')),
            ],
        ),
        migrations.CreateModel(
            name='SpecialOffer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('discount_percentage', models.DecimalField(decimal_places=2, max_digits=5)),
                ('start_date', models.DateTimeField()),
                ('end_date', models.DateTimeField()),
                ('menu_item', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='special_offers', to='menu.menuitem')),
            ],
        ),
    ]
