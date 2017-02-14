import sys
from os import path, symlink
from source_data_handler import SourceDataHandler
SCRIPT_DIR = path.dirname(path.realpath(__file__))
sys.path = [path.join(SCRIPT_DIR,i) for i in ["",
				"env/lib/python3.4",
				 "env/lib/python3.4/plat-x86_64-linux-gnu",
				 "env/lib/python3.4/lib-dynload",
				 "env/lib/python3.4/site-packages",
]] + sys.path  # for some reason it won't import my env libraries, only global ones. Had to prepend em manually.

from photodata_organizer import application, extract_data, TEMP_IMAGES_FOLDER, STATIC_FOLDER

SourceDataHandler.assign_data(extract_data())

# this won't run on uwsgi + nginx
if __name__ == "__main__":
	# have to put a symlink to static folder
	if TEMP_IMAGES_FOLDER != path.join(STATIC_FOLDER, "img"):
		try:
			symlink(TEMP_IMAGES_FOLDER, path.join(STATIC_FOLDER, "img"), target_is_directory=True)
		except FileExistsError:
			pass  # do nothing
	application.run()
