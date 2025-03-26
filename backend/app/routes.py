from flask import Blueprint, jsonify, request, send_file
import requests
import torch
from pathlib import Path
import cv2
import numpy as np
from io import BytesIO

import pathlib
temp = pathlib.PosixPath
pathlib.PosixPath = pathlib.WindowsPath

main = Blueprint('main', __name__)

model_path = "C:\\Users\\admin\\access_ez\\backend\\model\\last.pt"
yolov5_path = "C:\\Users\\admin\\access_ez\\backend\\model\\yolov5"

model = torch.hub.load(yolov5_path, 'custom', path=model_path, source='local', force_reload=True)

@main.route('/upload', methods=['POST'])
def uploadPhoto():
    
    data = request.json

    # Correct way to extract data from JSON request
    lat = data.get('lat')
    lng = data.get('lng')
    url = data.get('streetViewUrl')

    if not lat or not lng or not url:
        return jsonify({"message": "Missing data"}), 400
    
    try:
         # Download image from URL
        response = requests.get(url)
        response.raise_for_status()

        # Convert image to OpenCV format
        img_array = np.asarray(bytearray(response.content), dtype=np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

        # Run YOLOv5 detection
        results = model(img)
        detected_img = np.squeeze(results.render())  # Render detection on the image

        # Convert processed image to JPEG format in-memory
        _, buffer = cv2.imencode('.jpg', detected_img)
        img_bytes = BytesIO(buffer)

        # Return the processed image as a response
        return send_file(img_bytes, mimetype='image/jpeg')
    
    except Exception as e:
        return jsonify ({"message": f"Exception: {str(e)}"}), 500

    
