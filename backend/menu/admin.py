from django.contrib import admin
from .models import MenuItem , MenuItemVariant , Category , SpecialOffer
# Register your models here.

admin.site.register(MenuItem)
admin.site.register(MenuItemVariant)
admin.site.register(Category)
admin.site.register(SpecialOffer)