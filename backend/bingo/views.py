from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Bingo, Mission

class CompleteMissionAPIView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            mission_id = request.data.get('mission_id')
            mission = Mission.objects.get(id=mission_id)
            mission.completed = True
            mission.save()
            
            # スタンプ押下の更新
            bingo = mission.bingo
            for cell in bingo.card["cells"]:
                if cell["mission_id"] == mission_id:
                    cell["stamped"] = True
                    break
            bingo.save()
            
            return Response({"message": "Mission completed and stamped!"}, status=status.HTTP_200_OK)
        except Mission.DoesNotExist:
            return Response({"error": "Mission not found"}, status=status.HTTP_404_NOT_FOUND)
