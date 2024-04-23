from datetime import datetime
import uuid
from firebase_admin import firestore, auth

from FirestoreDB import FirestoreDB
from Constants import OPENAI_API_KEY, MAX_TOKENS_PER_REQUEST,kUserId,kUserEmail ,kDatejoined ,kFullName 
from flask import request,jsonify,render_template
from FirestoreDB import FirestoreDB
class UserRepo:
    userID=uuid.uuid4().hex
    def __init__(self,email, fullName, Role=None,User_Level=0,dateJoined=None ):
        self.email = email
        self.fullName = fullName
        self.dateJoined = dateJoined
        self.Role = Role
        self.User_Level=User_Level
        
    @staticmethod
    def login(email, password):
            try:
                # Authenticate the user with the provided email and password
                user = auth.get_user_by_email(email)
                
                # If authentication succeeds, return the user's UID
                UserRepo.get_document_id_by_email(email)
            except auth.UserNotFoundError:
                print(f"User with email {email} not found in Authentication.")
                return None
            except auth.InvalidPasswordError:
                print(f"Invalid password for user with email {email}.")
                return None
    @staticmethod
    def get_document_id_by_email(email):
        db_instance = FirestoreDB.get_instance()
        firestore_instance = db_instance.get_firestore_instance()

        users_ref = firestore_instance.collection('Users')

        # Query Firestore to find the document with the matching email
        query = users_ref.where('Email', '==', email)
        docs = query.stream()

        for doc in docs:
            # Return the document ID if found
            return doc.id
        
        # If no document is found for the email
        print(f"No document found for user with email {email} in Firestore.")
        return None
    def getUserDataFromFirestore(self):
        db_instance = FirestoreDB.get_instance()
        firestore_instance = db_instance.get_firestore_instance()
        users_ref = firestore_instance.collection('Users')

        # Query Firestore to find the document with the matching email
        query = users_ref.where('Email', '==', self.email)    
        docs = query.stream()

        for doc in docs:
            # Get the data of the document
            user_data = doc.to_dict()
            
            # Print the data of the document
            print("User data retrieved from Firestore:")
            print(user_data)

            # Return the data of the document
            return user_data

        # If no document is found for the user's email
        print(f"No document found for user with email {self.email} in Firestore.")
        return None


        
    @classmethod
    def fromJson(cls, data):
        return cls(
            email=data["Email"],
            fName=data["Full Name"],
            dateJoined=data["Joined on"],
            Role=data["Role"],
            User_Level=data[0],
            
        )

    def toJson(self):
        data = {
            "Full Name": self.fullName,
            "Joined on": datetime.now().strftime("%d-%B-%Y"),
            "Email": self.email,
            "Role": self.Role,
            "User_Level": 0,
        }
        return data
    def add_user_to_auth(self, email, password):
        try:
            user = auth.create_user(
                email=email,
                password=password
            )
            print('Successfully created new user:', user.uid)
            #return user
        except Exception as e:
            print('Error creating new user:', e)
            #return None

    def add_user_to_firestore(self):
        db_instance = FirestoreDB.get_instance()
        firestore_instance = db_instance.get_firestore_instance()


        doc_ref = firestore_instance.collection('Users').document(self.userID)
        
            # print(f"User added to Firestore with ID: {doc_ref.id}")
        
            # Check if the user already exists in Firestore
        existing_doc = doc_ref.get()
        if existing_doc.exists:
            print(f"Document with email {self.email} already exists in Firestore.")
        else:
            # Check if the user exists in authentication
            try:
                user = auth.get_user_by_email(self.email)
                print(f"User with email {self.email} already exists in Authentication.")
            except auth.UserNotFoundError:
                # User doesn't exist in authentication, proceed to add to Firestore and authentication
                # Add user to authentication
                user = auth.create_user(email=self.email, password="123456")
                print(f"User added to Authentication with ID: {user.uid}")
                
                # Add user to Firestore
                doc_ref.set(self.toJson())
                print(f"User added to Firestore with email: {self.email}")
        

    def deleteFromFirestore(self):
        db_instance = FirestoreDB.get_instance()
        firestore_instance = db_instance.get_firestore_instance()

        users_ref = firestore_instance.collection('Users')

        # Query Firestore to find the document with the matching email
        query = users_ref.where('Email', '==', self.email)
        docs = query.stream()

        for doc in docs:
            # Delete the document from Firestore
            doc.reference.delete()
            print(f"User with email {self.email} deleted from Firestore.")


    def deleteFromAuthentication(self):
        try:
            # Delete the user from authentication
            user = auth.get_user_by_email(self.email)
            auth.delete_user(user.uid)
            print(f"User with email {self.email} deleted from Authentication.")
        except auth.UserNotFoundError:
            print(f"User with email {self.email} not found in Authentication.")

    def deleteUser(self):
        # Delete from Firestore
        self.deleteFromFirestore()
        
        # Delete from Authentication
        self.deleteFromAuthentication()
#Testing
def main():
    n=UserRepo("abdelrahman1235@gmail.com","Abdelrahman Mohamed","User",0)
    n.add_user_to_firestore()
    n.getUserDataFromFirestore()
    kUserId=n.userID
    print(kUserId)

if __name__ == "__main__":
    main()