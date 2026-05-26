from dotenv import load_dotenv
import uvicorn
import os


def main() -> None:
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("PORT", os.getenv("API_PORT", "8080")))
    uvicorn.run("app.api:create_app", factory=True, host=host, port=port)


if __name__ == "__main__":
    load_dotenv()
    main()
