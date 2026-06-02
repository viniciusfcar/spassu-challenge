import datetime
from decimal import Decimal

from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import CommissionsResponseSerializer
from .services import calculate_commissions


class CommissionsView(APIView):
    def get(self, request: Request) -> Response:
        start_str = request.query_params.get("start_date")
        end_str = request.query_params.get("end_date")

        if not start_str or not end_str:
            return Response(
                {"detail": "Os parâmetros start_date e end_date são obrigatórios."},
                status=400,
            )

        try:
            start_date = datetime.date.fromisoformat(start_str)
            end_date = datetime.date.fromisoformat(end_str)
        except ValueError:
            return Response(
                {"detail": "Formato de data inválido. Use YYYY-MM-DD."},
                status=400,
            )

        if start_date > end_date:
            return Response(
                {"detail": "start_date deve ser anterior ou igual a end_date."},
                status=400,
            )

        results = calculate_commissions(start_date, end_date)
        grand_total = sum(
            (r["total_commission"] for r in results), Decimal("0")
        ).quantize(Decimal("0.01"))

        serializer = CommissionsResponseSerializer(
            {"results": results, "grand_total": grand_total}
        )
        return Response(serializer.data)
