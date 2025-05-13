from pymongo import MongoClient

try:
    client = MongoClient("mongodb+srv://reactproject:Pepeandfifi_12@cluster0.n5bjjcb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    db = client["react"]
    print("✅ Conexión exitosa")
    print("Colecciones disponibles:", db.list_collection_names())
except Exception as e:
    print("❌ Error de conexión:", str(e))
