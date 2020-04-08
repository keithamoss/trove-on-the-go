import asgi_app.app


def main():
    app = asgi_app.app.create_app()
    app.run()
