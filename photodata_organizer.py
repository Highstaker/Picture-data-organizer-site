from os import path, makedirs
import json

import dryscrape
from bs4 import BeautifulSoup as bs
import urllib.request
from urllib.parse import urlparse
from threading import Thread

from flask import Flask, render_template

VERSION = (0, 1, 2)

SCRIPT_FOLDER = path.dirname(path.realpath(__file__))

HOST_NAME = "127.0.0.1"
HOST_PORT = 12365

SOURCE_URL = "https://www.nordicfuzzcon.org/Registration/FursuitList"

TEMP_IMAGES_FOLDER = path.join("/tmp", "img")

APP_NAME = "fursuiters-organizer"

application = Flask(__name__, static_url_path='', static_folder=path.join(SCRIPT_FOLDER, 'static'))


def extract_data():
	data = []
	makedirs(TEMP_IMAGES_FOLDER, exist_ok=True)

	session = dryscrape.Session()
	session.visit(SOURCE_URL)
	response = session.body()

	soup = bs(response, "lxml")

	entries = soup.find_all("div", class_="fursuitList__tile")

	# print(entries)#debug

	image_urls = list()
	for entry in entries:
		chunk = dict()
		text_info = entry.find("div", class_='fursuitList__tile__details')
		for br in text_info.find_all("br"):
			br.replace_with("\n")
		# print(text_info.text)#debug

		# process text data
		for line in text_info.text.split("\n"):
			line_parse = line.split(":", 1)
			try:
				chunk[line_parse[0]] = line_parse[1].strip(" \n\r\t")
			except KeyError:
				pass

		# store country data
		country = entry.find("img", class_="fursuitList__tile__flag")["title"]
		chunk["Country"] = country

		# store respective image filenames
		image_url = entry.find("img", class_="fursuitList__tile__imageActual")["src"]
		image_urls.append(image_url)
		image_filename = path.basename(urlparse(image_url).path)
		chunk["image_filename"] = image_filename

		data.append(chunk)

	# Download images
	threads = []
	for image_url in image_urls:
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

	return data


@application.route('/')
def index():
	return render_template('index.html')


@application.route('/get_data')
def api_get_data():
	data = json.dumps(SOURCE_DATA)
	return data

if __name__ == '__main__':
	SOURCE_DATA = extract_data()
	# print(SOURCE_DATA)#debug
	application.run(debug=True, host=HOST_NAME, port=HOST_PORT, threaded=True, use_reloader=False)
