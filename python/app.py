from app import create_app
import os

# Create the Flask application
app = create_app()

if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    port = int(os.environ.get('PORT', 5000))
    
    # Get host from environment variable or default to localhost
    host = os.environ.get('HOST', '0.0.0.0')
    
    # Run the application
    app.run(
        host=host,
        port=port,
        debug=os.environ.get('FLASK_ENV') == 'development'
    )
