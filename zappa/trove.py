from fastapi import FastAPI
from quart import Quart, Blueprint
from mangum import Mangum
import asyncio
import aiohttp

view = Blueprint("view", __name__, url_prefix="")

semaphore = asyncio.Semaphore(500)


async def request_img(url):
    from PIL import Image
    from io import BytesIO

    async with aiohttp.ClientSession() as session:
        async with semaphore, session.get(url) as r:
            print("foobar")

            # return (r.status_code, url)
            img = Image.open(BytesIO(await r.read()))
            return (img.size, url)


@view.route("/")
async def root_view():
    async with aiohttp.ClientSession() as session:
        async with session.get("https://api.trove.nla.gov.au/v2/result?q=raine+square&zone=picture&l-place=Australia%2FWestern+Australia&n=50&l-availability=y&include=links&reclevel=full&key=API_KEY&encoding=json") as r:
            json = await r.json()
            urls = []

            for work in json["response"]["zone"][0]["records"]["work"][:2]:
                for identifier in work["identifier"]:
                    if identifier["linktype"] == "restricted":
                        img_url = f"{identifier['value']}.png" if identifier['value'].endswith(".jpg") is False else identifier['value']
                        urls.append(img_url)

            responses = await asyncio.gather(*(request_img(url) for url in urls), return_exceptions=True)
            for response in responses:
                print(response)
            print("urls", len(urls))

            return {"urls": len(urls), "responses": responses}


# app = FastAPI()
app = Quart(__name__)
app.register_blueprint(view)
app.debug = True


# handler = Mangum(app)
# app.run()
