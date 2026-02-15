from decimal import Decimal

from django.db.models import Sum
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Transaction
from .serializers import CategorySerializer, TransactionSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer

    def get_queryset(self):
        queryset = Transaction.objects.select_related("category").all()
        category_id = self.request.query_params.get("category")
        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")

        if category_id:
            queryset = queryset.filter(category_id=category_id)
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)

        return queryset


class DashboardView(APIView):
    def get(self, request):
        now = timezone.now().date()
        month_start = now.replace(day=1)

        month_qs = Transaction.objects.filter(date__gte=month_start, date__lte=now)
        total_spent = month_qs.aggregate(total=Sum("amount"))["total"] or Decimal("0")

        by_category = (
            month_qs.values("category__name")
            .annotate(total=Sum("amount"))
            .order_by("-total")
        )

        by_month = (
            Transaction.objects.annotate(month=TruncMonth("date"))
            .values("month")
            .annotate(total=Sum("amount"))
            .order_by("month")
        )

        return Response(
            {
                "month_start": month_start,
                "today": now,
                "total_spent": total_spent,
                "by_category": by_category,
                "by_month": by_month,
            }
        )
