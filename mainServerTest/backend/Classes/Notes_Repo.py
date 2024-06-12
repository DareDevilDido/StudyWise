from datetime import datetime, timedelta
import uuid
from FirestoreDB import FirestoreDB
import json
import os

class Notes:
#user id wa material id wa ha3ml collection esmha notes
    def __init__(self,JsonData,userid,materialid,Type,MaterialName):
        self.JsonData=JsonData
        self.userid=userid
        self.materialid=materialid
        self.Type=Type
        self.MaterialName=MaterialName

    @staticmethod
    def save_json_to_file(json_data,filename ):
        file_path=f"D:/COLLEGE/StudyWise/mainServerTest/assets/output_files/Notes/{filename}.json"
        try:
            # Ensure the directory exists
            dir_path = os.path.dirname(file_path)
            os.makedirs(dir_path, exist_ok=True)
            
            # Check if a directory with the same name as the file already exists
            if os.path.isdir(file_path):
                raise IsADirectoryError(f"A directory with the same name as the file '{file_path}' already exists.")

            # Write the JSON data to the file
            with open(file_path, 'w') as json_file:
                json.dump(json_data, json_file, indent=4)
            
            print(f"Successfully saved JSON data to {file_path}")

        except PermissionError as e:
            print(f"PermissionError: {e}. Please check your permissions for the directory.")
        except IsADirectoryError as e:
            print(f"IsADirectoryError: {e}. Please ensure the file path does not conflict with an existing directory.")
        except Exception as e:
            print(f"An unexpected error occurred: {e}")
        return file_path
    def addNotesToFirestore(self):
        db_instance = FirestoreDB.get_instance()
        firestore_instance = db_instance.get_firestore_instance()
        self.file=Notes.save_json_to_file(self.JsonData,self.MaterialName)
        print("file",self.file,"======================")
        file_Location=Notes.upload_notes_to_storage(self.userid,self.MaterialName, self.file)
        try:
            # Reference to the document
            doc_ref = firestore_instance.collection('Users').document(self.userid).collection(self.Type).document(self.materialid)
            
            # Update the document with the new data
            doc_ref.update({
                "notes": file_Location,
              
            })
            
            print("Successfully added youtube video to firestore")
        except Exception as e:
            print(e)

    @staticmethod   
    def upload_notes_to_storage(user_id, material_name, notes_file_path):
        db_instance = FirestoreDB.get_instance()
        storage_instance = db_instance.get_storage_instance()

        # Constructing the full path for the folder using the material name
        folder_path = f"user/{user_id}/Uploaded Materials/{material_name}/"

        # Ensuring the file path is correct
        if not os.path.isfile(notes_file_path):
            raise FileNotFoundError(f"The file {notes_file_path} does not exist.")
        
        print("file path notes_file_path:", notes_file_path)

        # Upload the notes file inside the folder
        notes_blob_path = folder_path + "notes.json"  # Ensure the file extension is .json
        notes_blob = storage_instance.blob(notes_blob_path)
        notes_blob.upload_from_filename(notes_file_path, timeout=600)

        expiration = datetime.now() + timedelta(days=36500)
        print("Successfully uploaded notes to Storage")

        # Returning the signed URL for the uploaded notes file
        return notes_blob.generate_signed_url(expiration=expiration)
# def main():
#     data = {
#     "name": "John Doe",
#     "age": 30,
#     "city": "New York"
# }
#     x= Notes(data,"62a9c20699654da5b14cca9d21cd8ef6","49599b1f50d04a099f35d51c70117e9f","DocumentMaterial","test")
#     x.addNotesToFirestore()
# if __name__ == "__main__":
#     main()
       