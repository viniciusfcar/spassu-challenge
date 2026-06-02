from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

WEEKDAY_CHOICES = [
    (0, "Segunda-feira"),
    (1, "Terça-feira"),
    (2, "Quarta-feira"),
    (3, "Quinta-feira"),
    (4, "Sexta-feira"),
    (5, "Sábado"),
    (6, "Domingo"),
]


class CommissionRule(models.Model):
    weekday = models.IntegerField(
        "Dia da Semana", choices=WEEKDAY_CHOICES, unique=True
    )
    min_percent = models.DecimalField(
        "% Mínimo",
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    max_percent = models.DecimalField(
        "% Máximo",
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )

    class Meta:
        verbose_name = "Regra de Comissão"
        verbose_name_plural = "Regras de Comissão"
        ordering = ["weekday"]

    def __str__(self):
        return f"{self.get_weekday_display()}: {self.min_percent}% – {self.max_percent}%"

    def clean(self):
        if self.min_percent is not None and self.max_percent is not None:
            if self.min_percent > self.max_percent:
                raise ValidationError("% Mínimo deve ser menor ou igual ao % Máximo.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
