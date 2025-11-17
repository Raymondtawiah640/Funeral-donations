"""
Legacy Donation API - Flask Backend
Provides REST API endpoints for the Angular frontend
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from includes.db_connect import get_db_connection, test_connection, close_db_connection
import json

app = Flask(__name__)

# Enable CORS for Angular frontend communication
CORS(app, origins=["http://localhost:4200", "http://127.0.0.1:4200"])

@app.route('/')
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "Legacy Donation API is running",
        "message": "Backend server is operational"
    })

@app.route('/api/health')
def api_health():
    """API health check with database connection test"""
    try:
        connection_test = test_connection()
        return jsonify({
            "status": "healthy",
            "database": connection_test
        })
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e)
        }), 500

@app.route('/api/donations', methods=['GET'])
def get_donations():
    """Get all donations from database"""
    try:
        db = get_db_connection()
        query = "SELECT * FROM donations ORDER BY created_at DESC"
        donations = db.execute_query(query)
        
        return jsonify({
            "success": True,
            "data": donations,
            "count": len(donations)
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

@app.route('/api/donations', methods=['POST'])
def create_donation():
    """Create a new donation"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['amount', 'donor_name', 'donor_email']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "message": f"Missing required field: {field}"
                }), 400
        
        db = get_db_connection()
        
        # Insert donation into database
        query = """
        INSERT INTO donations (amount, donor_name, donor_email, donor_phone, donation_type, created_at) 
        VALUES (%s, %s, %s, %s, %s, NOW())
        """
        params = (
            data['amount'],
            data['donor_name'],
            data['donor_email'],
            data.get('donor_phone', ''),
            data.get('donation_type', 'one-time')
        )
        
        donation_id = db.execute_insert(query, params)
        
        return jsonify({
            "success": True,
            "message": "Donation created successfully",
            "donation_id": donation_id
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

@app.route('/api/contact', methods=['POST'])
def submit_contact_form():
    """Submit contact form"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'subject', 'message']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "message": f"Missing required field: {field}"
                }), 400
        
        db = get_db_connection()
        
        # Insert contact form into database
        query = """
        INSERT INTO contact_messages (name, email, phone, subject, message, created_at) 
        VALUES (%s, %s, %s, %s, %s, NOW())
        """
        params = (
            data['name'],
            data['email'],
            data.get('phone', ''),
            data['subject'],
            data['message']
        )
        
        message_id = db.execute_insert(query, params)
        
        return jsonify({
            "success": True,
            "message": "Contact form submitted successfully",
            "message_id": message_id
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

@app.route('/api/statistics')
def get_statistics():
    """Get donation statistics"""
    try:
        db = get_db_connection()
        
        # Get total donations count
        total_query = "SELECT COUNT(*) as total_donations, COALESCE(SUM(amount), 0) as total_amount FROM donations"
        total_result = db.execute_query(total_query)
        
        # Get recent donations
        recent_query = "SELECT * FROM donations ORDER BY created_at DESC LIMIT 5"
        recent_donations = db.execute_query(recent_query)
        
        return jsonify({
            "success": True,
            "data": {
                "total_donations": total_result[0]['total_donations'],
                "total_amount": float(total_result[0]['total_amount']),
                "recent_donations": recent_donations
            }
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "message": "Endpoint not found"
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "success": False,
        "message": "Internal server error"
    }), 500

if __name__ == '__main__':
    # Test database connection on startup
    try:
        print("Testing database connection...")
        connection_test = test_connection()
        if connection_test["success"]:
            print("✅ Database connection successful")
        else:
            print(f"❌ Database connection failed: {connection_test['message']}")
    except Exception as e:
        print(f"❌ Database connection error: {e}")
    
    # Run Flask development server
    print("\n🚀 Starting Legacy Donation API server...")
    print("API will be available at: http://localhost:5000")
    print("CORS enabled for Angular frontend on port 4200")
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )