# Example Python Code to Insert a Document 

from pymongo import MongoClient 
from bson.objectid import ObjectId 

class AnimalShelter(object): 
    """ CRUD operations for Animal collection in MongoDB """ 

    def __init__(self): 
        # Initializing the MongoClient. This helps to access the MongoDB 
        # databases and collections. This is hard-wired to use the aac 
        # database, the animals collection, and the aac user. 
        # 
        # You must edit the password below for your environment. 
        # 
        # Connection Variables 
        # 
        USER = 'aacuser' 
        PASS = 'Password' 
        HOST = '127.0.0.1' 
        PORT = 27017 
        DB = 'aac' 
        COL = 'animals' 
        # 
        # Initialize Connection 
        # 
        self.client = MongoClient('mongodb://%s:%s@%s:%d' % (USER,PASS,HOST,PORT)) 
        self.database = self.client['%s' % (DB)] 
        self.collection = self.database['%s' % (COL)] 
        
    def __init__(self, username, password): 
        # Initializing the MongoClient. This helps to access the MongoDB 
        # databases and collections. This is hard-wired to use the aac 
        # database, the animals collection, and the aac user. 
        # 
        # You must edit the password below for your environment. 
        # 
        # Connection Variables 
        # 
        USER = username 
        PASS = password 
        HOST = '127.0.0.1' 
        PORT = 27017 
        DB = 'aac' 
        COL = 'animals' 
        # 
        # Initialize Connection 
        # 
        self.client = MongoClient('mongodb://%s:%s@%s:%d' % (USER,PASS,HOST,PORT)) 
        self.database = self.client['%s' % (DB)] 
        self.collection = self.database['%s' % (COL)] 

    def __init__(self, username, password, host, port, database, collection): 
        # Initializing the MongoClient. This helps to access the MongoDB 
        # databases and collections. This is hard-wired to use the aac 
        # database, the animals collection, and the aac user. 
       
        # Initialize Connection 
        # 
        self.client = MongoClient('mongodb://%s:%s@%s:%d' % (username,password,host,port)) 
        self.database = self.client['%s' % (database)] 
        self.collection = self.database['%s' % (collection)] 
    # Create a method to return the next available record number for use in the create method
            
    # Complete this create method to implement the C in CRUD. 
    def create(self, data):
        if data is not None: 
            self.database.animals.insert_one(data)  # data should be dictionary
            return True
        else: 
            raise Exception("Nothing to save, because data parameter is empty")
            return False

    # Create method to implement the R in CRUD.
    def read(self, query):
        #Read documents from the collection
        if query is not None:
            documents = list(self.database.animals.find(query))
            return documents
        else:
            raise Exception("Nothing to read, because data parameter is empty")
            return []
        
    # Create method to implement the U in CRUD.
    def update(self, oldData, newData):
        if oldData is not None:
            result = self.database.animals.update_many(oldData, {"$set": newData})
            return result['n']
        else:
            return "{}"
        
    # Create method to implement the D in CRUD.
    def delete(self, data):
        if data is not None:
            result = self.database.animals.delete_many(data)
            return result['n']
        else:
            return "{}"