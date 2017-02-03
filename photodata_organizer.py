from os import path, makedirs, symlink
import json

import requests
import urllib.request
from urllib.parse import urlparse
from threading import Thread

from flask import Flask, render_template

VERSION = (0, 3, 5)

SCRIPT_FOLDER = path.dirname(path.realpath(__file__))

HOST_NAME = "0.0.0.0"
HOST_PORT = 12365

SOURCE_URL = "https://www.nordicfuzzcon.org/JavaScript/GetFursuitList?CountryId=0&OrderBy=0&OrderByDirection=0"

TEMP_IMAGES_FOLDER = path.join("/tmp", "img")

APP_NAME = "fursuiters-organizer"

STATIC_FOLDER = path.join(SCRIPT_FOLDER, 'static')

application = Flask(__name__, static_url_path='', static_folder=STATIC_FOLDER)


def extract_data():
	data = []
	makedirs(TEMP_IMAGES_FOLDER, exist_ok=True)

	response = requests.get(SOURCE_URL,
							headers={
								'Referer': 'https://www.nordicfuzzcon.org/Registration/FursuitList',
								'Host': 'www.nordicfuzzcon.org',

							})
	response_content = response.content.decode("utf-8")

	# print("response", response)#debug

	parsed_source = json.loads(response_content)["Data"]["GetFursuits"]

	for entry in parsed_source:
		#add imagefilenames
		entry["ImageFilename"] = path.basename(urlparse(entry["ImagePath"]).path)


	# print("parsed_source", parsed_source)#debug

	# Download images
	threads = []
	for image_url in (i["ImagePath"] for i in parsed_source):
		image_filename = path.basename(urlparse(image_url).path)
		full_path_to_create = path.join(TEMP_IMAGES_FOLDER, image_filename)
		if not path.isfile(full_path_to_create):
			# print("Downloading!")#debug
			t = Thread(target=urllib.request.urlretrieve,
								args=(image_url, full_path_to_create))
			threads.append(t)
			t.start()
	for t in threads:
		t.join()

	return parsed_source


@application.route('/')
def index():
	# version = "v." + ".".join(map(str, VERSION))
	return render_template('index.html',
						   # context={"VERSION": version}
						   )


@application.route('/get_data')
def api_get_data():
	data = json.dumps(SOURCE_DATA)
	return data

if __name__ == '__main__':
	SOURCE_DATA = extract_data()
	# have to put a symlink to static folder
	if TEMP_IMAGES_FOLDER != path.join(STATIC_FOLDER, "img"):
		try:
			symlink(TEMP_IMAGES_FOLDER, path.join(STATIC_FOLDER, "img"), target_is_directory=True)
		except FileExistsError:
			pass  # do nothing
	# print(SOURCE_DATA)#debug
	application.run(debug=False, host=HOST_NAME, port=HOST_PORT, threaded=True, use_reloader=False)
