from pyTigerGraph import TigerGraphConnection
from dotenv import load_dotenv
import os

load_dotenv()

conn = TigerGraphConnection(
    host=os.environ["TG_HOST"],
    graphname=os.environ["TG_GRAPHNAME"],
    username=os.environ["TG_USERNAME"],
    password=os.environ["TG_PASSWORD"]
)

print("--- ls output ---")
print(conn.gsql("ls"))
print("--- vertex count ---")
print(conn.getVertexCount("*"))
print("--- edge count ---")
print(conn.getEdgeCount("*"))
print("--- version ---")
print(conn.getVersion())