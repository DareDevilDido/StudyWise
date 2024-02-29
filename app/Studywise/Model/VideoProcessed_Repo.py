from datetime import datetime
from firebase_admin import firestore
from Constants.Constants import OPENAI_API_KEY, MAX_TOKENS_PER_REQUEST,kUserId,kUserEmail ,kDatejoined ,kFullName
from app.Studywise.Model import FirestoreDB 

class VideoProcessed:
    processed_material_id=""
    material_id=""
    generated_summary_file_path=""
    generated_audio_file_path=""
    generated_chapters_file_path=""
    generated_text_file_path=""
    generated_images_file_path=""
    generated_video_file_path=""
    def __init__(self, processed_material_id, material_id,
                 generated_summary_file_path=None, generated_audio_file_path=None,
                 generated_chapters_file_path=None, generated_text_file_path=None,
                 generated_images_file_path=None, generated_video_file_path=None):
        self.processed_material_id = processed_material_id
        self.material_id = material_id
        self.generated_summary_file_path = generated_summary_file_path
        self.generated_audio_file_path = generated_audio_file_path
        self.generated_chapters_file_path = generated_chapters_file_path
        self.generated_text_file_path = generated_text_file_path
        self.generated_images_file_path = generated_images_file_path
        self.generated_video_file_path = generated_video_file_path
        self.db = FirestoreDB.get_instance()
    async def addProcessedMaterialToFirestore(self):
        try:
            await self.db.collection('MaterialsProcessed').document(kUserId).set({
                "processed_material_id": self.processed_material_id,
                "material_id": self.material_id,
                "generated_summary_file_path": self.generated_summary_file_path,
                "generated_audio_file_path": self.generated_audio_file_path,
                "generated_chapters_file_path": self.generated_chapters_file_path,
                "generated_text_file_path": self.generated_text_file_path,
                "generated_images_file_path": self.generated_images_file_path,
                "generated_video_file_path": self.generated_video_file_path
            })
        except Exception as e:
            print(e)

    @classmethod
    def fromJson(cls, data):
        return cls(
            processed_material_id=data["processed_material_id"],
            material_id=data["material_id"],
            generated_summary_file_path=data["generated_summary_file_path"],
            generated_audio_file_path=data["generated_audio_file_path"],
            generated_chapters_file_path=data["generated_chapters_file_path"],
            generated_text_file_path=data["generated_text_file_path"],
            generated_images_file_path=data["generated_images_file_path"],
            generated_video_file_path=data["generated_video_file_path"]
        )

    def toJson(self):
        data = {
            "processed_material_id": self.processed_material_id,
            "material_id": self.material_id,
            "generated_summary_file_path": self.generated_summary_file_path,
            "generated_audio_file_path": self.generated_audio_file_path,
            "generated_chapters_file_path": self.generated_chapters_file_path,
            "generated_text_file_path": self.generated_text_file_path,
            "generated_images_file_path": self.generated_images_file_path,
            "generated_video_file_path": self.generated_video_file_path
        }
        return data
    