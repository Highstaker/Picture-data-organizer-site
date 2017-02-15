from os import path, makedirs, symlink
import json
import requests
import urllib.request
from urllib.parse import urlparse
from threading import Thread

from flask import Flask, render_template

from source_data_handler import SourceDataHandler

VERSION = (0, 6, 1)

SCRIPT_FOLDER = path.dirname(path.realpath(__file__))

HOST_NAME = "0.0.0.0"
HOST_PORT = 12364

SOURCE_URL = "https://www.nordicfuzzcon.org/JavaScript/GetFursuitList?CountryId=0&OrderBy=0&OrderByDirection=0"

TEMP_IMAGES_FOLDER = path.join("/tmp", "img")

APP_NAME = "fursuiters-organizer"

STATIC_FOLDER = path.join(SCRIPT_FOLDER, 'static')

application = Flask(__name__, static_url_path='', static_folder=STATIC_FOLDER)

#todo: read footer and header from separate file

def extract_data():
	# todo: move this to another file

	makedirs(TEMP_IMAGES_FOLDER, exist_ok=True)

	response = requests.get(SOURCE_URL,
							headers={
								'Referer': 'https://www.nordicfuzzcon.org/Registration/FursuitList',
								'Host': 'www.nordicfuzzcon.org',
							})
	response_content = response.content.decode("utf-8")

	parsed_source = json.loads(response_content)["Data"]["GetFursuits"]

	for entry in parsed_source:
		# add image filenames
		entry["ImageFilename"] = path.basename(urlparse(entry["ImagePath"]).path)

	# Download images
	threads = []
	for image_url in (i["ImagePath"] for i in parsed_source):
		image_filename = path.basename(urlparse(image_url).path)
		full_path_to_create = path.join(TEMP_IMAGES_FOLDER, image_filename)
		if not path.isfile(full_path_to_create):
			t = Thread(target=urllib.request.urlretrieve,
								args=(image_url, full_path_to_create))
			threads.append(t)
			t.start()
	for t in threads:
		t.join()

	return parsed_source


@application.context_processor
def version_info():
	"""Runs before template rendering, assigns variables"""
	version = "v." + ".".join(map(str, VERSION))
	return dict(VERSION=version)


@application.route('/')
def index():
	return render_template('index.html')


@application.route('/get_data')
def api_get_data():
	source_data = SourceDataHandler.get_data()
	data = json.dumps(source_data)
	return data

if __name__ == '__main__':
	# SOURCE_DATA = extract_data()
	SourceDataHandler.assign_data(extract_data())
	# have to put a symlink to static folder
	if TEMP_IMAGES_FOLDER != path.join(STATIC_FOLDER, "img"):
		try:
			symlink(TEMP_IMAGES_FOLDER, path.join(STATIC_FOLDER, "img"), target_is_directory=True)
		except FileExistsError:
			pass  # do nothing
	application.run(debug=False, host=HOST_NAME, port=HOST_PORT, threaded=True, use_reloader=False)

#todo: configure with uwsgi and nginx
#TODO: data saving