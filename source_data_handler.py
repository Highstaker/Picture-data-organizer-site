class SourceDataHandler(object):
	"""docstring for SourceDataHandler"""
	_source_data = None

	@classmethod
	def assign_data(cls, data):
		"""Assigns data to static variable"""
		cls._source_data = data

	@classmethod
	def get_data(cls):
		"""gets data from static variable"""
		return cls._source_data

	def __init__(self):
		super(SourceDataHandler, self).__init__()
		