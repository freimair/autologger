from datetime import datetime
from typing import List, Optional
import sqlite3

class Model:
    con: sqlite3.Connection

    def __init__(self):
        self.con = sqlite3.connect('resources/sqlite3.db')
        pass