# Django imports
from django.db import models
from django.conf import settings

# Module imports
from . import ProjectBaseModel


class Module(ProjectBaseModel):
    name = models.CharField(max_length=255, verbose_name="Module Name")
    description = models.TextField(verbose_name="Module Description", blank=True)
    description_text = models.JSONField(
        verbose_name="Module Description RT", blank=True, null=True
    )
    description_html = models.JSONField(
        verbose_name="Module Description HTML", blank=True, null=True
    )
    start_date = models.DateField(null=True)
    target_date = models.DateField(null=True)
    status = models.CharField(
        choices=(
            ("backlog", "Backlog"),
            ("planned", "Planned"),
            ("in-progress", "In Progress"),
            ("paused", "Paused"),
            ("completed", "Completed"),
            ("cancelled", "Cancelled"),
        ),
        default="planned",
        max_length=20,
    )
    lead = models.ForeignKey(
        "db.User", on_delete=models.SET_NULL, related_name="module_leads", null=True
    )
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        blank=True,
        related_name="module_members",
        through="ModuleMember",
        through_fields=("module", "member"),
    )
    view_props = models.JSONField(default=dict)
    sort_order = models.FloatField(default=65535)

    class Meta:
        unique_together = ["name", "project"]
        verbose_name = "Module"
        verbose_name_plural = "Modules"
        db_table = "modules"
        ordering = ("-created_at",)

    def save(self, *args, **kwargs):
        if self._state.adding:
            smallest_sort_order = Module.objects.filter(
                project=self.project
            ).aggregate(smallest=models.Min("sort_order"))["smallest"]

            if smallest_sort_order is not None:
                self.sort_order = smallest_sort_order - 10000

        super(Module, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} {self.start_date} {self.target_date}"


class ModuleMember(ProjectBaseModel):
    module = models.ForeignKey("db.Module", on_delete=models.CASCADE)
    member = models.ForeignKey("db.User", on_delete=models.CASCADE)

    class Meta:
        unique_together = ["module", "member"]
        verbose_name = "Module Member"
        verbose_name_plural = "Module Members"
        db_table = "module_members"
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.module.name} {self.member}"


class ModuleIssue(ProjectBaseModel):
    module = models.ForeignKey(
        "db.Module", on_delete=models.CASCADE, related_name="issue_module"
    )
    issue = models.OneToOneField(
        "db.Issue", on_delete=models.CASCADE, related_name="issue_module"
    )

    class Meta:
        verbose_name = "Module Issue"
        verbose_name_plural = "Module Issues"
        db_table = "module_issues"
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.module.name} {self.issue.name}"


class ModuleLink(ProjectBaseModel):
    title = models.CharField(max_length=255, blank=True, null=True)
    url = models.URLField()
    module = models.ForeignKey(
        Module, on_delete=models.CASCADE, related_name="link_module"
    )
    metadata = models.JSONField(default=dict)

    class Meta:
        verbose_name = "Module Link"
        verbose_name_plural = "Module Links"
        db_table = "module_links"
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.module.name} {self.url}"


class ModuleFavorite(ProjectBaseModel):
    """_summary_
    ModuleFavorite (model): To store all the module favorite of the user
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="module_favorites",
    )
    module = models.ForeignKey(
        "db.Module", on_delete=models.CASCADE, related_name="module_favorites"
    )

    class Meta:
        unique_together = ["module", "user"]
        verbose_name = "Module Favorite"
        verbose_name_plural = "Module Favorites"
        db_table = "module_favorites"
        ordering = ("-created_at",)

    def __str__(self):
        """Return user and the module"""
        return f"{self.user.email} <{self.module.name}>"
