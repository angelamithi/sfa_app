import os
from flask import Blueprint, jsonify, make_response, current_app
from flask_restful import Api, Resource
from flask_jwt_extended import jwt_required
from models import Event  # Make sure you import the Event model

# Create a Flask Blueprint for Zoom
zoom_bp = Blueprint('zoom_bp', __name__)
api = Api(zoom_bp)

# Determine the base path dynamically based on the operating system
def get_base_path():
    home_dir = os.path.expanduser('~')  # Get the user's home directory

    if os.name == 'nt':
        return os.path.join(home_dir, 'Documents', 'Zoom')
    elif os.name == 'posix':  # macOS and Linux
        # Check if running on WSL
        if os.path.exists('/proc/version') and 'microsoft' in open('/proc/version').read().lower():
            return os.path.join(home_dir, 'Zoom')
        elif 'darwin' in os.uname().sysname.lower():  # macOS
            return os.path.join(home_dir, 'Documents', 'Zoom')
        else:  # Linux
            return os.path.join(home_dir, 'Documents', 'Zoom')
    else:
        raise Exception("Unsupported Operating System")

BASE_PATH = get_base_path()

# Function to get transcripts from local files
def get_local_transcripts_by_date(date_str):
    transcripts = []

    # Search for folders matching this pattern
    for folder_name in os.listdir(BASE_PATH):
        folder_path = os.path.join(BASE_PATH, folder_name)

        # Check if the folder matches the expected pattern
        if os.path.isdir(folder_path) and folder_name.startswith(date_str):
            # Look for any text files in this directory
            for file_name in os.listdir(folder_path):
                if file_name.endswith('.txt'):  # Allow any text file
                    file_path = os.path.join(folder_path, file_name)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as file:
                            transcripts.append({
                                'folder_name': folder_name,
                                'file_name': file_name,
                                'content': file.read()
                            })
                    except Exception as e:
                        print(f"Error reading file {file_path}: {e}")

    return transcripts

def get_local_transcripts(event):
    event_date_str = event.event_date.strftime('%Y-%m-%d')  # Format the date as a string
    return get_local_transcripts_by_date(event_date_str)

class ZoomTranscript(Resource):
    @jwt_required()
    def get(self, event_id):
        # Fetch the event details using event_id
        event = Event.query.get(event_id)

        if not event:
            return make_response(jsonify({"error": "Event not found"}), 404)

        # Get transcript data from local files based on event details
        transcripts = get_local_transcripts(event)

        if not transcripts:
            return make_response(jsonify({"error": "No transcripts found for the specified event"}), 404)

        # Pass transcripts to the fileSearch_bp
        response = current_app.test_client().post('/fileSearch/process_transcripts', json={"transcripts": transcripts})

        if response.status_code != 200:
            return make_response(jsonify({"error": "Failed to process transcripts"}), response.status_code)

        return jsonify({"transcripts": transcripts})

class ZoomTranscriptByDate(Resource):
    @jwt_required()
    def get(self, date_str):
        # Get transcript data from local files based on the provided date
        transcripts = get_local_transcripts_by_date(date_str)

        if not transcripts:
            return make_response(jsonify({"error": "No transcripts found for the specified date"}), 404)

        return jsonify({"transcripts": transcripts})

# Register the ZoomTranscript resource with the API
api.add_resource(ZoomTranscript, '/transcripts/<int:event_id>')
api.add_resource(ZoomTranscriptByDate, '/transcripts/date/<string:date_str>')
