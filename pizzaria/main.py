from routes.order_routes import order_router
from routes.auth_routes import auth_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


app.include_router(auth_router)
app.include_router(order_router)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500",
                   "http://localhost:5500",
                   
    "https: // mini-sistema-pizzaria-frontend.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)