from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
import requests
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename
import hashlib
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# MultiChain connection settings
RPC_USER = "multichainrpc"
RPC_PASSWORD = "e74q7ZnB84AjFPJ8hR4mxqAdfPjAYtf4YPmCLmXGrV7"
RPC_PORT = "6292"
RPC_HOST = "127.0.0.1"
CHAIN_NAME = "cid"
STREAM_NAME = "user2"
STREAM_NAME2 = "complaints"
RPC_URL = f"http://{RPC_USER}:{RPC_PASSWORD}@{RPC_HOST}:{RPC_PORT}"

# Pinata IPFS Configuration
PINATA_API_KEY = "c2df8585ba5b6dfa4b73"
PINATA_SECRET_API_KEY = "d26d593e1de3a897f9d76d1ce48cff42974cc28bb5437f16e7fe3cd6d296f90a"
PINATA_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS"


# Simple in-memory database for complaints (In production, use MongoDB or similar)
complaints_db = []

# Function to publish data to the stream
def publish_to_stream(key, data):
    url = f"http://{RPC_USER}:{RPC_PASSWORD}@{RPC_HOST}:{RPC_PORT}"
    headers = {"content-type": "application/json"}
    
    payload = {
        "method": "publish",
        "params": [STREAM_NAME, key, json.dumps(data).encode("utf-8").hex()],
        "id": 1,
        "jsonrpc": "2.0"
    }
    
    response = requests.post(url, data=json.dumps(payload), headers=headers)
    return response.json()

# Function to get stream items (for login verification)
def get_stream_items(key=None):
    url = f"http://{RPC_USER}:{RPC_PASSWORD}@{RPC_HOST}:{RPC_PORT}"
    headers = {"content-type": "application/json"}
    
    # If key is provided, get specific items
    if key:
        payload = {
            "method": "liststreamkeyitems",
            "params": [STREAM_NAME, key],
            "id": 1,
            "jsonrpc": "2.0"
        }
    else:
        payload = {
            "method": "liststreamitems",
            "params": [STREAM_NAME],
            "id": 1,
            "jsonrpc": "2.0"
        }
    
    response = requests.post(url, data=json.dumps(payload), headers=headers)
    return response.json()

# Login endpoint
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password') or not data.get('role'):
        return jsonify({'message': 'Missing credentials!'}), 400
    
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    
    # Get user from blockchain
    response = get_stream_items(email)
    
    if 'result' in response and response['result']:
        # Get the most recent item (in case there are multiple)
        items = response['result']
        latest_item = items[-1]
        
        # Parse the data
        user_data = json.loads(bytes.fromhex(latest_item['data']).decode('utf-8'))
        
        # Check if credentials match
        if user_data[0] == role and user_data[1] == password and user_data[2] == "True":
            # Simple success response with role for redirection
            return jsonify({
                'success': True,
                'role': role,
                'email': email
            }), 200
    
    return jsonify({'message': 'Invalid credentials!'}), 401

# Create user endpoint (simplified, no authentication)
@app.route('/api/create-user', methods=['POST'])
def create_user():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password') or not data.get('role'):
        return jsonify({'message': 'Missing user information!'}), 400
    
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    status = data.get('status', "True")
    
    # Check if user already exists
    response = get_stream_items(email)
    if 'result' in response and response['result']:
        return jsonify({'message': 'User already exists!'}), 400
    
    # Create user in blockchain
    user_data = [role, password, status]
    result = publish_to_stream(email, user_data)
    
    if 'error' in result:
        return jsonify({'message': f"Blockchain error: {result['error']['message']}"}), 500
    
    return jsonify({'message': 'User created successfully!'}), 201

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def upload_to_pinata(file_path):
    """Upload a file to IPFS via Pinata and return the IPFS hash"""
    headers = {
        "pinata_api_key": PINATA_API_KEY,
        "pinata_secret_api_key": PINATA_SECRET_API_KEY
    }
    
    try:
        with open(file_path, 'rb') as file_data:
            files = {
                'file': file_data
            }
            response = requests.post(PINATA_URL, files=files, headers=headers)
            
            if response.status_code == 200:
                ipfs_hash = response.json()["IpfsHash"]
                return {
                    "hash": ipfs_hash, 
                    "url": f"https://gateway.pinata.cloud/ipfs/{ipfs_hash}"
                }
            else:
                app.logger.error(f"Pinata Error: {response.status_code} - {response.text}")
                return None
    except Exception as e:
        app.logger.error(f"Pinata Upload Error: {str(e)}")
        return None

def publish_to_multichain(complaint_data):
    """Publish complaint data to MultiChain stream"""
    complaint_hex = json.dumps(complaint_data).encode().hex()
    
    payload = {
        "method": "publish",
        "params": [STREAM_NAME2, str(complaint_data['complaintNo']), complaint_hex],
        "jsonrpc": "1.0",
        "id": "curltest"
    }
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(RPC_URL, headers=headers, data=json.dumps(payload))
        if response.status_code == 200:
            result = response.json()
            if 'error' in result and result['error']:
                app.logger.error(f"Blockchain Error: {result['error']}")
                return False, result['error']
            return True, result['result']
        else:
            app.logger.error(f"RPC Error: {response.status_code} - {response.text}")
            return False, "RPC connection error"
    except Exception as e:
        app.logger.error(f"Blockchain Publish Error: {str(e)}")
        return False, str(e)

def get_stream_items2():
    """Retrieve all items from the complaints stream"""
    payload = {
        "method": "liststreamitems",
        "params": [STREAM_NAME2],
        "jsonrpc": "1.0",
        "id": "curltest"
    }
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(RPC_URL, headers=headers, data=json.dumps(payload))
        if response.status_code == 200:
            result = response.json()
            if 'error' in result and result['error']:
                app.logger.error(f"Blockchain Error: {result['error']}")
                return []
            
            items = result['result']
            complaints = []
            
            for item in items:
                # Data is stored as hex, so we need to decode it
                data_hex = item['data']
                try:
                    data_bytes = bytes.fromhex(data_hex)
                    complaint_data = json.loads(data_bytes.decode('utf-8'))
                    complaint_data['txid'] = item['txid']  # Add blockchain transaction ID
                    complaints.append(complaint_data)
                except Exception as e:
                    app.logger.error(f"Error parsing complaint data: {str(e)}")
            
            return complaints
        else:
            app.logger.error(f"RPC Error: {response.status_code} - {response.text}")
            return []
    except Exception as e:
        app.logger.error(f"Blockchain Retrieval Error: {str(e)}")
        return []

def calculate_hash(file_path):
    """Calculate SHA-256 hash of a file"""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        # Read and update hash in chunks for efficient memory usage
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

@app.route('/api/complaints', methods=['GET'])
def get_complaints():
    # Check authentication
    blockchain_complaints = get_stream_items2()
    
    # For demo purposes, if blockchain is not accessible, use in-memory database
    if not blockchain_complaints and complaints_db:
        return jsonify(complaints_db)
    
    return jsonify(blockchain_complaints)

@app.route('/api/complaints/<int:complaint_id>', methods=['GET'])
def get_complaint(complaint_id):
    # Check authentication
    blockchain_complaints = get_stream_items2()
    
    # Find the specific complaint
    for complaint in blockchain_complaints:
        if complaint.get('complaintNo') == complaint_id:
            return jsonify(complaint)
    
    # If not found in blockchain, check in-memory database
    for complaint in complaints_db:
        if complaint.get('complaintNo') == complaint_id:
            return jsonify(complaint)
    
    return jsonify({'success': False, 'message': 'Complaint not found'}), 404

@app.route('/api/complaints', methods=['POST'])
def create_complaint():
    complaint_no = request.form.get('complaintNo')  # Get complaint ID from user
    title = request.form.get('title')
    date = request.form.get('date')
    place = request.form.get('place')
    complaint_details = request.form.get('complaintDetails')
    evidence_details = request.form.get('evidenceDetails', '')
    case_category = request.form.get('casecategory')
    severity = request.form.get('severity', 'Medium')
    
    # Validate required fields including complaint_no
    if not all([complaint_no, title, date, place, complaint_details, case_category]):
        return jsonify({'success': False, 'message': 'Missing required fields'}), 400
    
    # Check if complaint ID already exists
    existing_complaints = get_stream_items2() + complaints_db
    for complaint in existing_complaints:
        if str(complaint.get('complaintNo')) == str(complaint_no):
            return jsonify({
                'success': False, 
                'message': 'Complaint ID already exists'
            }), 400
    
    # Handle file uploads
    uploaded_files = []
    file_hashes = []
    
    for i in range(10):  # Limit to 10 files max
        file_key = f'file{i}'
        if file_key in request.files:
            file = request.files[file_key]
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                timestamped_filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{filename}"
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], timestamped_filename)
                file.save(file_path)
                
                # Calculate file hash for integrity verification
                file_hash = calculate_hash(file_path)
                file_hashes.append(file_hash)
                
                # Upload to IPFS
                ipfs_result = upload_to_pinata(file_path)
                if ipfs_result:
                    uploaded_files.append({
                        'filename': filename,
                        'hash': file_hash,
                        'ipfs': ipfs_result
                    })
    
    # Create complaint object with user-provided complaint number
    new_complaint = {
        'complaintNo': complaint_no,  # Use provided complaint ID
        'title': title,
        'date': date,
        'place': place,
        'complaintDetails': complaint_details,
        'evidenceDetails': evidence_details,
        'casecategory': case_category,
        'severity': severity,
        'createdAt': datetime.now().isoformat(),
        'files': [file['ipfs']['url'] for file in uploaded_files],
        'fileDetails': uploaded_files,
        'status': 'Open'
    }
    
    # Try to publish to blockchain
    blockchain_success, blockchain_result = publish_to_multichain(new_complaint)
    
    if blockchain_success:
        new_complaint['blockchain'] = {
            'txid': blockchain_result,
            'verified': True
        }
    else:
        # If blockchain submission failed, store in memory and inform the user
        new_complaint['blockchain'] = {
            'txid': None,
            'verified': False,
            'error': blockchain_result
        }
        complaints_db.append(new_complaint)
    
    return jsonify({
        'success': True,
        'complaint': new_complaint,
        'blockchain': blockchain_success
    })

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded files (for local development)"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


def setup_gemini():
    genai.configure(api_key="AIzaSyAOZRzjgX6LSv6FuG3pCmg-kmXJ8guYIdk")
    # Update model name to correct version
    return genai.GenerativeModel('gemini-1.5-pro')

@app.route('/api/add-inference', methods=['POST'])
def add_inference():
    try:
        data = request.json
        complaint_id = data.get('complaintId')
        inference = data.get('inference')
        examiner_email = data.get('examinerEmail')

        if not all([complaint_id, inference, examiner_email]):
            return jsonify({"error": "Missing required fields"}), 400

        # Get existing complaint data
        blockchain_complaints = get_stream_items2()
        complaint_data = None
        
        for complaint in blockchain_complaints:
            if str(complaint.get('complaintNo')) == str(complaint_id):
                complaint_data = complaint
                break

        if not complaint_data:
            return jsonify({"error": "Complaint not found"}), 404

        # Add inference to complaint data
        complaint_data['inference'] = inference
        complaint_data['examiner'] = examiner_email
        complaint_data['inferenceDate'] = datetime.now().isoformat()

        # Publish updated complaint back to blockchain
        success, result = publish_to_multichain(complaint_data)
        
        if success:
            return jsonify({
                "success": True,
                "message": "Inference added successfully",
                "complaint": complaint_data
            }), 200
        else:
            return jsonify({
                "success": False,
                "error": "Failed to update blockchain"
            }), 500

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/generate-report', methods=['POST'])
def generate_report():
    try:
        data = request.json
        complaint_id = data.get('complaintId')

        if not complaint_id:
            return jsonify({"error": "Complaint ID is required"}), 400

        # Get complaint data
        blockchain_complaints = get_stream_items2()
        complaint_data = None
        
        # Convert complaint_id to string for comparison
        complaint_id_str = str(complaint_id)
        
        for complaint in blockchain_complaints:
            if str(complaint.get('complaintNo', '')) == complaint_id_str:
                complaint_data = complaint
                break

        if not complaint_data:
            return jsonify({
                "success": False,
                "error": f"Complaint with ID {complaint_id} not found"
            }), 404

        try:
            # Setup Gemini
            model = setup_gemini()

            # Create report prompt
            prompt = f"""Generate a detailed forensic report for the following complaint:

Title: {complaint_data.get('title', 'N/A')}
Date: {complaint_data.get('date', 'N/A')}
Location: {complaint_data.get('place', 'N/A')}
Category: {complaint_data.get('casecategory', 'N/A')}
Severity: {complaint_data.get('severity', 'N/A')}

Complaint Details:
{complaint_data.get('complaintDetails', 'No details provided')}

Evidence Details:
{complaint_data.get('evidenceDetails', 'No evidence details provided')}

Examiner's Inference:
{complaint_data.get('inference', 'No inference provided')}

Format the report with the following sections:
1. Case Summary
2. Evidence Analysis
3. Forensic Findings
4. Expert Opinion
5. Recommendations
6. Conclusion

Please maintain a professional and formal tone suitable for legal documentation."""

            # Generate report with safety settings
            generation_config = {
                "temperature": 0.7,
                "top_p": 1,
                "top_k": 40,
                "max_output_tokens": 2048,
            }

            safety_settings = [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            ]

            response = model.generate_content(
                prompt,
                generation_config=generation_config,
                safety_settings=safety_settings
            )

            if not response:
                raise Exception("Failed to generate report content")

            report_content = response.text

            # Create report data structure with unique ID
            report_data = {
                "type": "report",
                "reportId": f"REP-{datetime.now().strftime('%Y%m%d%H%M%S')}-{complaint_id}",
                "complaintId": complaint_id,
                "complaintNo": complaint_data.get('complaintNo'),
                "report": report_content,
                "generatedAt": datetime.now().isoformat(),
                "complaintTitle": complaint_data.get('title', 'N/A'),
                "examinerInference": complaint_data.get('inference', 'No inference provided'),
                "examiner": complaint_data.get('examiner', 'Unknown')
            }

            # Store report in blockchain
            success, result = publish_to_multichain(report_data)

            if success:
                return jsonify({
                    "success": True,
                    "message": "Report generated successfully",
                    "report": report_content,
                    "reportData": report_data
                }), 200
            else:
                raise Exception("Failed to store report in blockchain")

        except Exception as e:
            app.logger.error(f"Report generation error: {str(e)}")
            return jsonify({
                "success": False,
                "error": f"Failed to generate report: {str(e)}"
            }), 500

    except Exception as e:
        app.logger.error(f"General error: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/update-user-status', methods=['POST'])
def update_user_status():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('status'):
        return jsonify({'message': 'Missing required information!'}), 400
    
    email = data.get('email')
    new_status = data.get('status')
    
    # Get existing user data from blockchain
    response = get_stream_items(email)
    
    if 'result' not in response or not response['result']:
        return jsonify({'message': 'User not found!'}), 404
    
    # Get the most recent user data
    items = response['result']
    latest_item = items[-1]
    user_data = json.loads(bytes.fromhex(latest_item['data']).decode('utf-8'))
    
    # Update status while preserving role and password
    updated_user_data = [user_data[0], user_data[1], new_status]
    
    # Publish updated user data to blockchain
    result = publish_to_stream(email, updated_user_data)
    
    if 'error' in result:
        return jsonify({'message': f"Blockchain error: {result['error']['message']}"}), 500
    
    return jsonify({
        'message': f"User status updated successfully to {new_status}",
        'email': email
    }), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)