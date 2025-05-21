# Amazon Nova Robotics - Text Control Application

This directory contains the Text Control application for Amazon Nova Robotics.

## Application Structure

The application follows a modular architecture with the following components:

### Main Application

- `app.py`: Flask application entry point
- `config.py`: Configuration settings
- `errors.py`: Error handling

### Models

- `models/actions.py`: Defines available robot actions and their metadata

### Services

- `services/chat_service.py`: Handles Nova chatbot integration
- `services/robot_service.py`: Handles robot action execution
- `services/database_service.py`: Provides database operations

### Routes

- `routes/api.py`: API endpoints
- `routes/ui.py`: User interface endpoints

### Templates

- `templates/`: HTML templates for the web interface

## Development

To run the application locally:

```
python app.py
```

## Deployment

The application is deployed using AWS Lambda. The handler function is defined in `app.py`.
