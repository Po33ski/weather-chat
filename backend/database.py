from peewee import *
import os

# Path to the SQLite database file (in backend directory)
db_path = os.path.join(os.path.dirname(__file__), 'database.db')
db = SqliteDatabase(db_path)

class BaseModel(Model):
    class Meta:
        database = db

class User(BaseModel):
    id = CharField(primary_key=True)
    email = CharField(unique=True, index=True, null=False)
    name = CharField(null=True)
    google_id = CharField(unique=True, index=True, null=True)
    totp_secret = CharField(null=True)
    is_totp_enabled = BooleanField(default=False)

# Create the table if it doesn't exist
def initialize():
    with db:
        db.create_tables([User]) 